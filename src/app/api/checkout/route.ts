import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import NexusClient from '@/lib/nexus';
import { validateCPF, cleanCPF } from '@/lib/pricing';
import { formatCurrency } from '@/lib/events';

// ============================================
// CHECKOUT REQUEST TYPES
// ============================================

interface CheckoutRequest {
  // Customer Info
  name: string;
  cpf: string;
  contactType: 'WhatsApp' | 'Email' | 'Telegram';
  contactValue: string;

  // Event & Ticket
  eventSlug: string;
  ticketId: string;
  quantity: number;
}

interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  nexusId?: string;
  pixCode?: string;
  qrCodeUrl?: string;
  amount?: number;
  error?: string;
}

// ============================================
// MAIN CHECKOUT HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  try {
    const body: CheckoutRequest = await request.json();

    // ==========================================
    // 1. VALIDATE INPUT
    // ==========================================

    if (!body.name || !body.cpf || !body.contactType || !body.contactValue || !body.eventSlug || !body.ticketId) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate CPF
    if (!validateCPF(body.cpf)) {
      return NextResponse.json(
        { success: false, error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Validate quantity
    if (body.quantity < 1 || body.quantity > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantidade deve ser entre 1 e 10' },
        { status: 400 }
      );
    }

    // ==========================================
    // 2. GET EVENT AND TICKET TYPE
    // ==========================================

    const event = await db.event.findUnique({
      where: { slug: body.eventSlug },
      include: {
        ticketTypes: {
          where: { id: body.ticketId },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const ticketType = event.ticketTypes[0];
    if (!ticketType) {
      return NextResponse.json(
        { success: false, error: 'Tipo de ingresso não encontrado' },
        { status: 404 }
      );
    }

    // Check availability
    const available = ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityReserved;
    if (available < body.quantity) {
      return NextResponse.json(
        { success: false, error: `Apenas ${available} ingressos disponíveis` },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. CALCULATE PRICING
    // ==========================================

    const subtotal = ticketType.totalPrice * body.quantity;
    
    // Get discount from event or discount periods
    let discountPercent = event.fixedDiscount || 0;
    
    // Check for progressive discount periods
    const now = new Date();
    const activeDiscountPeriod = await db.discountPeriod.findFirst({
      where: {
        eventId: event.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { discount: 'desc' },
    });

    if (activeDiscountPeriod) {
      discountPercent = activeDiscountPeriod.discount;
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    // ==========================================
    // 4. CREATE ORDER
    // ==========================================

    const orderId = NexusClient.generateOrderId();

    const order = await db.order.create({
      data: {
        orderId,
        eventId: event.id,
        customerName: body.name,
        customerCpf: cleanCPF(body.cpf),
        customerContactType: body.contactType,
        customerContact: body.contactValue,
        subtotal,
        discount: discountPercent,
        discountAmount,
        total,
        paymentStatus: 'pending',
        nexusStatus: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });

    // Create order items
    await db.orderItem.create({
      data: {
        orderId: order.id,
        ticketTypeId: ticketType.id,
        quantity: body.quantity,
        unitPrice: ticketType.totalPrice,
        totalPrice: subtotal,
      },
    });

    // Reserve tickets
    await db.ticketType.update({
      where: { id: ticketType.id },
      data: {
        quantityReserved: { increment: body.quantity },
      },
    });

    // ==========================================
    // 5. CREATE NEXUS PAYMENT
    // ==========================================

    const nexusResult = await NexusClient.createPayment(total, orderId);

    if (!nexusResult.success || !nexusResult.data) {
      // Rollback reservation
      await db.ticketType.update({
        where: { id: ticketType.id },
        data: {
          quantityReserved: { decrement: body.quantity },
        },
      });

      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          nexusStatus: 'failed',
        },
      });

      return NextResponse.json(
        { success: false, error: nexusResult.error || 'Erro ao criar pagamento' },
        { status: 500 }
      );
    }

    // ==========================================
    // 6. UPDATE ORDER WITH NEXUS DATA
    // ==========================================

    await db.order.update({
      where: { id: order.id },
      data: {
        nexusId: nexusResult.data.nexus_id,
        nexusStatus: nexusResult.data.status,
        pixCode: nexusResult.data.pix_copia_e_cola,
      },
    });

    // ==========================================
    // 7. SEND NOTIFICATION (ASYNC)
    // ==========================================

    sendNewOrderNotification({
      orderId,
      eventName: event.name,
      customerName: body.name,
      customerCpf: body.cpf,
      contactType: body.contactType,
      contactValue: body.contactValue,
      ticketType: ticketType.name,
      quantity: body.quantity,
      total,
      discountPercent,
      nexusId: nexusResult.data.nexus_id,
    }).catch(console.error);

    // ==========================================
    // 8. CREATE AUDIT LOG
    // ==========================================

    await db.auditLog.create({
      data: {
        action: 'order_created',
        entityType: 'order',
        entityId: order.id,
        details: JSON.stringify({
          orderId,
          nexusId: nexusResult.data.nexus_id,
          total,
          discount: discountPercent,
        }),
      },
    });

    // ==========================================
    // 9. RETURN SUCCESS
    // ==========================================

    return NextResponse.json({
      success: true,
      orderId,
      nexusId: nexusResult.data.nexus_id,
      pixCode: nexusResult.data.pix_copia_e_cola,
      amount: total,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendNewOrderNotification(data: {
  orderId: string;
  eventName: string;
  customerName: string;
  customerCpf: string;
  contactType: string;
  contactValue: string;
  ticketType: string;
  quantity: number;
  total: number;
  discountPercent: number;
  nexusId: string;
}) {
  try {
    const message = `
🎫 *NOVA RESERVA - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
🎭 *Evento:* ${data.eventName}
👤 *Nome:* ${data.customerName}
📋 *CPF:* ${data.customerCpf}
📱 *Contato:* ${data.contactType} - ${data.contactValue}
🎟️ *Ingresso:* ${data.ticketType} x${data.quantity}
💰 *Desconto:* ${data.discountPercent}%
💰 *Total:* ${formatCurrency(data.total)}
📅 *Data:* ${new Date().toLocaleString('pt-BR')}
🔗 *Order ID:* ${data.orderId}
🔗 *Nexus ID:* ${data.nexusId}
━━━━━━━━━━━━━━━━━━━━━━
⏳ *Status: Aguardando PIX*
`.trim();

    console.log('[Notification] New order:', data.orderId);
    console.log(message);
  } catch (error) {
    console.error('[Notification] Failed:', error);
  }
}

// ============================================
// GET ORDER STATUS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderId },
    include: {
      event: true,
      items: {
        include: {
          ticketType: true,
        },
      },
      tickets: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.orderId,
    status: order.paymentStatus,
    nexusStatus: order.nexusStatus,
    amount: order.total,
    pixCode: order.pixCode,
    paidAt: order.paidAt,
    tickets: order.tickets.map((t) => ({
      code: t.ticketCode,
      validated: t.isValidated,
    })),
  });
}
