// Notification Service for XDeals
// Handles purchase confirmations and ticket delivery

import { db } from './db';

// ============================================
// TYPES
// ============================================

interface PurchaseConfirmationData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventName: string;
  eventDate: Date;
  eventVenue: string;
  eventCity: string;
  ticketType: string;
  quantity: number;
  total: number;
  discountPercent: number;
  pixCode?: string;
}

interface TicketDeliveryData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventName: string;
  eventDate: Date;
  eventVenue: string;
  eventCity: string;
  tickets: Array<{
    code: string;
    ticketType: string;
    seat?: string;
  }>;
}

// ============================================
// PURCHASE CONFIRMATION
// ============================================

export async function sendPurchaseConfirmation(data: PurchaseConfirmationData): Promise<boolean> {
  try {
    console.log('[Notification] Sending purchase confirmation:', data.orderId);

    // Format the event date
    const eventDateFormatted = new Date(data.eventDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // WhatsApp message
    const whatsappMessage = `
🎫 *CONFIRMAÇÃO DE COMPRA - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
✅ *Status: PAGAMENTO CONFIRMADO*

🎭 *Evento:* ${data.eventName}
📅 *Data:* ${eventDateFormatted}
📍 *Local:* ${data.eventVenue} - ${data.eventCity}

👤 *Nome:* ${data.customerName}
🎟️ *Ingresso:* ${data.ticketType}
📊 *Quantidade:* ${data.quantity}x

💰 *Desconto:* ${data.discountPercent}%
💵 *Total Pago:* ${formatCurrency(data.total)}

📋 *Order ID:* ${data.orderId}
━━━━━━━━━━━━━━━━━━━━━━
📧 *IMPORTANTE:*
Seus ingressos serão enviados até 72 horas antes do evento para este WhatsApp e/ou e-mail cadastrado.

🔗 Acesse: ingressos.xdeals.online
📞 Suporte: +55 62 99288-7416

_Obrigado por comprar no XDeals!_
`.trim();

    // Email subject and body
    const emailSubject = `✅ Confirmação de Compra - ${data.eventName} | XDeals`;
    const emailBody = generateConfirmationEmail(data, eventDateFormatted);

    // Log for now (in production, integrate with actual services)
    console.log('[Notification] WhatsApp message prepared:');
    console.log(whatsappMessage);
    console.log('[Notification] Email subject:', emailSubject);

    // Create notification record
    await db.notification.create({
      data: {
        type: 'purchase_confirmation',
        channel: 'whatsapp',
        recipient: data.customerPhone || '',
        subject: emailSubject,
        content: whatsappMessage,
        status: 'pending',
        orderId: data.orderId,
      },
    });

    // TODO: Integrate with actual notification services
    // - WhatsApp: Use Twilio, Z-API, or similar
    // - Email: Use SendGrid, AWS SES, or similar
    
    return true;
  } catch (error) {
    console.error('[Notification] Error sending confirmation:', error);
    return false;
  }
}

// ============================================
// TICKET DELIVERY (72h before event)
// ============================================

export async function sendTicketDelivery(data: TicketDeliveryData): Promise<boolean> {
  try {
    console.log('[Notification] Sending ticket delivery:', data.orderId);

    // Format the event date
    const eventDateFormatted = new Date(data.eventDate).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Generate ticket list
    const ticketList = data.tickets
      .map((t, i) => `${i + 1}. ${t.ticketType} - Código: ${t.code}${t.seat ? ` (Assento: ${t.seat})` : ''}`)
      .join('\n');

    // WhatsApp message
    const whatsappMessage = `
🎟️ *SEUS INGRESSOS CHEGARAM!*
━━━━━━━━━━━━━━━━━━━━━━
🎉 *XDeals - Entrega de Ingressos*

🎭 *Evento:* ${data.eventName}
📅 *Data:* ${eventDateFormatted}
📍 *Local:* ${data.eventVenue} - ${data.eventCity}

👤 *Titular:* ${data.customerName}

🎫 *INGRESSOS:*
${ticketList}

📋 *Order ID:* ${data.orderId}
━━━━━━━━━━━━━━━━━━━━━━
⚠️ *INSTRUÇÕES IMPORTANTES:*
• Apresente o código QR na entrada
• Porte documento de identificação
• Chegue com antecedência

🔗 Validar ingresso: ingressos.xdeals.online/validar
📞 Suporte: +55 62 99288-7416

_Divirta-se! Equipe XDeals_
`.trim();

    // Email subject and body
    const emailSubject = `🎟️ Seus Ingressos - ${data.eventName} | XDeals`;
    const emailBody = generateTicketEmail(data, eventDateFormatted);

    console.log('[Notification] Ticket delivery WhatsApp:');
    console.log(whatsappMessage);

    // Create notification record
    await db.notification.create({
      data: {
        type: 'ticket_delivery',
        channel: 'whatsapp',
        recipient: data.customerPhone || '',
        subject: emailSubject,
        content: whatsappMessage,
        status: 'pending',
        orderId: data.orderId,
      },
    });

    // Mark tickets as delivered
    for (const ticket of data.tickets) {
      await db.ticket.updateMany({
        where: { ticketCode: ticket.code },
        data: { deliveredAt: new Date() },
      });
    }

    return true;
  } catch (error) {
    console.error('[Notification] Error sending ticket delivery:', error);
    return false;
  }
}

// ============================================
// CHECK AND SEND SCHEDULED TICKETS
// ============================================

export async function processScheduledTicketDeliveries(): Promise<number> {
  try {
    const now = new Date();
    const seventyTwoHoursFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    console.log('[Scheduler] Checking for events in next 72 hours...');
    console.log('[Scheduler] Current time:', now.toISOString());
    console.log('[Scheduler] 72h window ends at:', seventyTwoHoursFromNow.toISOString());

    // Find events happening within the next 72 hours
    const upcomingEvents = await db.event.findMany({
      where: {
        date: {
          gte: now,
          lte: seventyTwoHoursFromNow,
        },
        isActive: true,
      },
      include: {
        orders: {
          where: {
            paymentStatus: 'paid',
            ticketsDelivered: false,
          },
          include: {
            items: {
              include: {
                ticketType: true,
              },
            },
            tickets: true,
          },
        },
      },
    });

    console.log(`[Scheduler] Found ${upcomingEvents.length} events in next 72h`);

    let deliveriesSent = 0;

    for (const event of upcomingEvents) {
      console.log(`[Scheduler] Processing event: ${event.name}`);
      console.log(`[Scheduler] Orders to process: ${event.orders.length}`);

      for (const order of event.orders) {
        try {
          // Check if we already sent tickets for this order
          if (order.ticketsDelivered) {
            console.log(`[Scheduler] Order ${order.orderId} already has tickets delivered`);
            continue;
          }

          // Check if tickets exist
          if (order.tickets.length === 0) {
            console.log(`[Scheduler] Order ${order.orderId} has no tickets yet, generating...`);
            // Tickets should be generated when payment is confirmed
            continue;
          }

          // Send ticket delivery
          const success = await sendTicketDelivery({
            orderId: order.orderId,
            customerName: order.customerName,
            customerEmail: order.customerContactType === 'Email' ? order.customerContact : undefined,
            customerPhone: order.customerContactType === 'WhatsApp' ? order.customerContact : undefined,
            eventName: event.name,
            eventDate: event.date,
            eventVenue: event.venue,
            eventCity: event.city,
            tickets: order.tickets.map((t) => ({
              code: t.ticketCode,
              ticketType: order.items[0]?.ticketType.name || 'Ingresso',
              seat: t.seatNumber || undefined,
            })),
          });

          if (success) {
            // Mark as delivered
            await db.order.update({
              where: { id: order.id },
              data: { ticketsDelivered: true },
            });
            deliveriesSent++;
            console.log(`[Scheduler] Tickets delivered for order ${order.orderId}`);
          }
        } catch (orderError) {
          console.error(`[Scheduler] Error processing order ${order.orderId}:`, orderError);
        }
      }
    }

    console.log(`[Scheduler] Completed. ${deliveriesSent} deliveries sent.`);
    return deliveriesSent;
  } catch (error) {
    console.error('[Scheduler] Error in scheduled delivery:', error);
    return 0;
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

function generateConfirmationEmail(data: PurchaseConfirmationData, eventDateFormatted: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Compra - XDeals</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; font-size: 28px;">XDeals</h1>
    <p style="color: #9ca3af;">Ingressos com até 60% de desconto</p>
  </div>

  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 30px; margin-bottom: 20px; border: 1px solid #a855f7;">
    <h2 style="color: #22c55e; text-align: center; margin-bottom: 20px;">✅ Compra Confirmada!</h2>
    
    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #a855f7; margin-top: 0;">${data.eventName}</h3>
      <p style="margin: 10px 0; color: #e5e7eb;">📅 ${eventDateFormatted}</p>
      <p style="margin: 10px 0; color: #e5e7eb;">📍 ${data.eventVenue} - ${data.eventCity}</p>
    </div>

    <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);">
      <span style="color: #9ca3af;">Ingresso:</span>
      <span style="color: #ffffff;">${data.ticketType}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);">
      <span style="color: #9ca3af;">Quantidade:</span>
      <span style="color: #ffffff;">${data.quantity}x</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 1px solid rgba(255,255,255,0.1);">
      <span style="color: #9ca3af;">Desconto:</span>
      <span style="color: #22c55e; font-weight: bold;">${data.discountPercent}% OFF</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span style="color: #9ca3af;">Total Pago:</span>
      <span style="color: #ffffff; font-size: 20px; font-weight: bold;">${formatCurrency(data.total)}</span>
    </div>

    <p style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
      Order ID: ${data.orderId}
    </p>
  </div>

  <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
    <h4 style="color: #3b82f6; margin-top: 0;">📧 Importante</h4>
    <p style="color: #e5e7eb; font-size: 14px; line-height: 1.6;">
      Seus ingressos serão enviados até <strong>72 horas antes do evento</strong> para o WhatsApp e/ou e-mail cadastrado.
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>XDeals - Parceiro Oficial Q2Ingressos</p>
    <p>CNPJ: 21.233.248/0001-72</p>
    <p>ingressos.xdeals.online | +55 62 99288-7416</p>
  </div>
</body>
</html>
`.trim();
}

function generateTicketEmail(data: TicketDeliveryData, eventDateFormatted: string): string {
  const ticketItems = data.tickets
    .map(
      (t, i) => `
      <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin: 10px 0; border: 1px solid rgba(168, 85, 247, 0.3);">
        <p style="margin: 0; color: #a855f7; font-weight: bold;">Ingresso #${i + 1}</p>
        <p style="margin: 5px 0; color: #ffffff;">${t.ticketType}</p>
        <p style="margin: 5px 0; color: #22c55e; font-family: monospace; font-size: 16px;">${t.code}</p>
        ${t.seat ? `<p style="margin: 5px 0; color: #9ca3af;">Assento: ${t.seat}</p>` : ''}
      </div>
    `,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seus Ingressos - XDeals</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; font-size: 28px;">XDeals</h1>
    <p style="color: #9ca3af;">Ingressos com até 60% de desconto</p>
  </div>

  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 30px; margin-bottom: 20px; border: 1px solid #22c55e;">
    <h2 style="color: #22c55e; text-align: center; margin-bottom: 20px;">🎟️ Seus Ingressos Chegaram!</h2>
    
    <div style="text-align: center; margin-bottom: 20px;">
      <h3 style="color: #a855f7;">${data.eventName}</h3>
      <p style="color: #e5e7eb;">📅 ${eventDateFormatted}</p>
      <p style="color: #e5e7eb;">📍 ${data.eventVenue} - ${data.eventCity}</p>
    </div>

    <div style="margin: 20px 0;">
      <p style="color: #9ca3af; margin-bottom: 10px;">Titular: <strong style="color: #ffffff;">${data.customerName}</strong></p>
      <p style="color: #9ca3af; margin-bottom: 10px;">Order ID: <strong style="color: #a855f7;">${data.orderId}</strong></p>
    </div>

    <h4 style="color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Seus Ingressos:</h4>
    ${ticketItems}
  </div>

  <div style="background: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(34, 197, 94, 0.3);">
    <h4 style="color: #22c55e; margin-top: 0;">⚠️ Instruções Importantes</h4>
    <ul style="color: #e5e7eb; font-size: 14px; line-height: 1.8; padding-left: 20px;">
      <li>Apresente o código QR na entrada do evento</li>
      <li>Porte documento de identificação com foto</li>
      <li>Chegue com antecedência de pelo menos 1 hora</li>
      <li>Guarde este e-mail até o dia do evento</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>XDeals - Parceiro Oficial Q2Ingressos</p>
    <p>CNPJ: 21.233.248/0001-72</p>
    <p>ingressos.xdeals.online | +55 62 99288-7416</p>
  </div>
</body>
</html>
`.trim();
}

// ============================================
// HELPERS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
