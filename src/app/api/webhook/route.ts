import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import NexusClient, { NexusWebhookPayload } from '@/lib/nexus';
import { formatCurrency } from '@/lib/events';
import { sendPurchaseConfirmation } from '@/lib/notifications';

// ============================================
// NEXUS WEBHOOK HANDLER
// ============================================

/**
 * POST /api/webhook
 * Receives payment confirmation from DARKPAY NEXUS
 * * Expected payload:
 * {
 * "nexus_id": "NX_A1B2C3D4E5F6",
 * "order_id": "XD-12345-USER-789",
 * "status": "PAID",
 * "amount_paid": 168.00
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 🛡️ ADIÇÃO DE SEGURANÇA DARKPAY NEXUS
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.NEXUS_API_KEY) {
      console.error('[Security] Tentativa de webhook não autorizada. Chave incompatível.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: NexusWebhookPayload = await request.json();

    console.log('[Webhook] Received from Nexus:', JSON.stringify(body, null, 2));

    // ==========================================
    // 1. VALIDATE PAYLOAD
    // ==========================================

    if (!body.nexus_id || !body.order_id || !body.status) {
      console.error('[Webhook] Invalid payload - missing required fields');
      return NextResponse.json(
        { error: 'Invalid payload: missing required fields' },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. FIND ORDER
    // ==========================================

    const order = await db.order.findFirst({
      where: {
        OR: [
          { orderId: body.order_id },
          { nexusId: body.nexus_id },
        ],
      },
      include: {
        event: true,
        items: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    if (!order) {
      console.error(`[Webhook] Order not found: ${body.order_id} / ${body.nexus_id}`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`[Webhook] Found order: ${order.orderId}, current status: ${order.paymentStatus}`);

    // ==========================================
    // 3. CHECK IF ALREADY PROCESSED
    // ==========================================

    if (order.paymentStatus === 'paid') {
      console.log(`[Webhook] Order ${order.orderId} already processed as paid`);
      return NextResponse.json({
        success: true,
        message: 'Order already processed',
        orderId: order.orderId,
        status: order.paymentStatus,
      });
    }

    // ==========================================
    // 4. PROCESS PAYMENT STATUS
    // ==========================================

    let newPaymentStatus: string;
    let shouldGenerateTickets = false;

    switch (body.status) {
      case 'PAID':
        newPaymentStatus = 'paid';
        shouldGenerateTickets = true;
        console.log(`[Webhook] Payment CONFIRMED for order ${order.orderId}`);
        break;

      case 'expired':
        newPaymentStatus = 'expired';
        console.log(`[Webhook] Payment EXPIRED for order ${order.orderId}`);
        break;

      case 'cancelled':
        newPaymentStatus = 'cancelled';
        console.log(`[Webhook] Payment CANCELLED for order ${order.orderId}`);
        break;

      default:
        console.log(`[Webhook] Unknown status received: ${body.status}`);
        newPaymentStatus = body.status.toLowerCase();
    }

    // ==========================================
    // 5 & 7. ATOMIC UPDATE AND TICKET GENERATION
    // ==========================================
    // Envolvemos as operações críticas numa transação para garantir que o cliente
    // nunca fique com uma ordem paga mas sem ingressos gerados.

    const result = await db.$transaction(async (tx) => {
      // Update Order Status
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newPaymentStatus,
          nexusStatus: body.status,
          paidAt: body.status === 'PAID' ? new Date() : undefined,
        },
      });

      const ticketsCreated = [];

      if (shouldGenerateTickets) {
        console.log(`[Webhook] Transactional ticket generation started for: ${order.orderId}`);
        
        for (const item of order.items) {
          // Update sold count and release reservation inside the transaction
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              quantitySold: { increment: item.quantity },
              quantityReserved: { decrement: item.quantity },
            },
          });

          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = NexusClient.generateTicketCode();
            const qrCodeHash = NexusClient.generateQrCodeHash(ticketCode, order.orderId);

            const ticket = await tx.ticket.create({
              data: {
                orderId: order.id,
                ticketCode,
                qrCodeHash,
                holderName: order.customerName,
                holderDocument: order.customerCpf,
              },
            });
            ticketsCreated.push(ticket);
          }
        }
      } else {
        // Release reservation for expired/cancelled orders
        for (const item of order.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              quantityReserved: { decrement: item.quantity },
            },
          });
        }
      }

      return { updated, ticketsCreated };
    });

    // ==========================================
    // 6. CREATE NOTIFICATION RECORD (ISOLATED)
    // ==========================================
    // Erros de Foreign Key (P2003) aqui NÃO devem cancelar a entrega do ingresso.

    try {
      await db.paymentNotification.create({
        data: {
          orderId: order.id,
          nexusId: body.nexus_id,
          status: body.status,
          rawData: JSON.stringify(body),
        },
      });
    } catch (notifError) {
      console.error('[Webhook][Non-Critical] Erro ao registrar paymentNotification (P2003 Provável):', notifError);
    }

    // ==========================================
    // FINAL STEPS: NOTIFICATIONS & AUDIT
    // ==========================================

    if (shouldGenerateTickets) {
      console.log(`[Webhook] Success: Generated ${result.ticketsCreated.length} tickets for ${order.orderId}`);
      
      // Trigger confirmation helper (Has internal try/catch)
      await sendPaymentConfirmationNotification(order, body.amount_paid || order.total, result.ticketsCreated);
    } else {
      await sendPaymentExpiredNotification(order, body.status);
    }

    // ==========================================
    // 8. CREATE AUDIT LOG (ISOLATED)
    // ==========================================

    try {
      await db.auditLog.create({
        data: {
          action: `payment_${body.status.toLowerCase()}`,
          entityType: 'order',
          entityId: order.id,
          details: JSON.stringify({
            orderId: order.orderId,
            nexusId: body.nexus_id,
            amountPaid: body.amount_paid || order.total,
            generatedTickets: result.ticketsCreated.length
          }),
        },
      });
    } catch (auditError) {
      console.error('[Webhook][Non-Critical] Erro ao registrar Audit Log:', auditError);
    }

    // ==========================================
    // 9. RETURN SUCCESS TO NEXUS
    // ==========================================

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      status: newPaymentStatus,
      nexusStatus: body.status,
    });

  } catch (error) {
    console.error('[Webhook][Fatal] Critical error processing webhook:', error);
    // Se chegarmos aqui, algo quebrou a transação ou a base de dados está offline
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS (INTEGRAIS)
// ============================================

/**
 * Sends a detailed confirmation via notification service and logs to console.
 */
async function sendPaymentConfirmationNotification(
  order: {
    orderId: string;
    customerName: string;
    customerCpf: string;
    customerContactType: string;
    customerContact: string;
    total: number;
    discount: number;
    event: { name: string; date: Date; venue: string; city: string };
    items: { ticketType: { name: string }; quantity: number }[];
  },
  amountPaid: number,
  tickets: { ticketCode: string }[]
) {
  try {
    // Attempt to trigger external notification service (WhatsApp/Email)
    await sendPurchaseConfirmation({
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerContactType === 'Email' ? order.customerContact : undefined,
      customerPhone: order.customerContactType === 'WhatsApp' ? order.customerContact : undefined,
      eventName: order.event.name,
      eventDate: order.event.date,
      eventVenue: order.event.venue,
      eventCity: order.event.city,
      ticketType: order.items.map((i) => i.ticketType.name).join(', '),
      quantity: order.items.reduce((sum, i) => sum + i.quantity, 0),
      total: amountPaid,
      discountPercent: order.discount,
    });

    const ticketList = tickets.map((t) => `  🎫 ${t.ticketCode}`).join('\n');

    const message = `
✅ *PAGAMENTO CONFIRMADO - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
🎭 *Evento:* ${order.event.name}
👤 *Nome:* ${order.customerName}
📋 *CPF:* ${order.customerCpf}
📱 *Contato:* ${order.customerContactType} - ${order.customerContact}
🎟️ *Ingressos:* ${order.items.map((i) => `${i.ticketType.name} x${i.quantity}`).join(', ')}
💰 *Pago:* ${formatCurrency(amountPaid)}
📅 *Data:* ${new Date().toLocaleString('pt-BR')}
━━━━━━━━━━━━━━━━━━━━━━
🎫 *CÓDIGOS DOS INGRESSOS:*
${ticketList}
━━━━━━━━━━━━━━━━━━━━━━
📧 *IMPORTANTE:* Seus ingressos serão enviados até 72 horas antes do evento!
━━━━━━━━━━━━━━━━━━━━━━
🔗 Order ID: ${order.orderId}
`.trim();

    console.log('[Notification] Logic completed for:', order.orderId);
    console.log(message);

  } catch (error) {
    console.error('[Notification][Minor] Failed to trigger notification service:', error);
    // Não lançamos erro aqui para não quebrar a resposta 200 do Webhook
  }
}

/**
 * Handles expiration or cancellation notifications.
 */
async function sendPaymentExpiredNotification(
  order: {
    orderId: string;
    customerName: string;
    event: { name: string };
  },
  status: string
) {
  try {
    const message = `
⚠️ *PAGAMENTO ${status.toUpperCase()} - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
🎭 *Evento:* ${order.event.name}
👤 *Nome:* ${order.customerName}
🔗 *Order ID:* ${order.orderId}
━━━━━━━━━━━━━━━━━━━━━━
❌ *O pagamento não foi realizado a tempo*
💰 Para comprar novamente, acesse nosso site
━━━━━━━━━━━━━━━━━━━━━━
`.trim();

    console.log('[Notification] Status updated to expired/cancelled:', order.orderId);
    console.log(message);
  } catch (error) {
    console.error('[Notification][Minor] Failed to log expiration notice:', error);
  }
}

// ============================================
// HEALTH CHECK & WEBHOOK VERIFICATION
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Suporte para verificação de desafio (Hub Challenge) se necessário
  const challenge = searchParams.get('hub.challenge') || searchParams.get('challenge');
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: 'ok',
    service: 'xdeals-webhook-nexus',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
}