// Notification Service for XDeals
// Handles purchase confirmations and ticket delivery

import { db } from './db';
import { Resend } from 'resend';

// Inicializa o Resend (Garante que a variável RESEND_API_KEY está no teu .env ou Vercel)
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // WhatsApp message (Mantido para logs/futura integração)
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

    // 🚀 ENVIO REAL VIA RESEND
    if (data.customerEmail) {
      const { error } = await resend.emails.send({
        from: 'XDeals <ingressos@xdeals.online>',
        to: [data.customerEmail],
        subject: emailSubject,
        html: emailBody,
      });
      if (error) console.error('[Resend Error]', error);
    }

    // Log for reference
    console.log('[Notification] Email subject:', emailSubject);
    console.log('[Notification] WhatsApp text prepared for order:', data.orderId);

    // Create notification record
    await db.notification.create({
      data: {
        type: 'purchase_confirmation',
        channel: 'email',
        recipient: data.customerEmail || '',
        subject: emailSubject,
        content: whatsappMessage, // Guardamos o texto do WA como referência no log
        status: 'sent',
        orderId: data.orderId,
      },
    });

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

    const eventDateFormatted = new Date(data.eventDate).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const ticketListText = data.tickets
      .map((t, i) => `${i + 1}. ${t.ticketType} - Código: ${t.code}${t.seat ? ` (Assento: ${t.seat})` : ''}`)
      .join('\n');

    const whatsappMessage = `
🎟️ *SEUS INGRESSOS CHEGARAM!*
━━━━━━━━━━━━━━━━━━━━━━
🎉 *XDeals - Entrega de Ingressos*

🎭 *Evento:* ${data.eventName}
👤 *Titular:* ${data.customerName}

🎫 *INGRESSOS:*
${ticketListText}

📋 *Order ID:* ${data.orderId}
━━━━━━━━━━━━━━━━━━━━━━
🔗 Validar: ingressos.xdeals.online/validar
`.trim();

    const emailSubject = `🎟️ Seus Ingressos - ${data.eventName} | XDeals`;
    const emailBody = generateTicketEmail(data, eventDateFormatted);

    // 🚀 ENVIO REAL VIA RESEND
    if (data.customerEmail) {
      await resend.emails.send({
        from: 'XDeals <ingressos@xdeals.online>',
        to: [data.customerEmail],
        subject: emailSubject,
        html: emailBody,
      });
    }

    await db.notification.create({
      data: {
        type: 'ticket_delivery',
        channel: 'email',
        recipient: data.customerEmail || '',
        subject: emailSubject,
        content: whatsappMessage,
        status: 'sent',
        orderId: data.orderId,
      },
    });

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

    const upcomingEvents = await db.event.findMany({
      where: {
        date: { gte: now, lte: seventyTwoHoursFromNow },
        isActive: true,
      },
      include: {
        orders: {
          where: { paymentStatus: 'paid', ticketsDelivered: false },
          include: { items: { include: { ticketType: true } }, tickets: true },
        },
      },
    });

    let deliveriesSent = 0;
    for (const event of upcomingEvents) {
      for (const order of event.orders) {
        try {
          if (order.ticketsDelivered || order.tickets.length === 0) continue;

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
            await db.order.update({
              where: { id: order.id },
              data: { ticketsDelivered: true },
            });
            deliveriesSent++;
          }
        } catch (err) {
          console.error(`[Scheduler] Order ${order.orderId} failed:`, err);
        }
      }
    }
    return deliveriesSent;
  } catch (error) {
    console.error('[Scheduler] Critical error:', error);
    return 0;
  }
}

// ============================================
// EMAIL TEMPLATES (RESTORED FULL)
// ============================================

function generateConfirmationEmail(data: PurchaseConfirmationData, eventDateFormatted: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
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
      <span style="color: #9ca3af;">Total Pago:</span>
      <span style="color: #ffffff; font-size: 20px; font-weight: bold;">${formatCurrency(data.total)}</span>
    </div>
    <p style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">Order ID: ${data.orderId}</p>
  </div>

  <div style="background: rgba(59, 130, 246, 0.1); border-radius: 12px; padding: 20px; border: 1px solid rgba(59, 130, 246, 0.3);">
    <h4 style="color: #3b82f6; margin-top: 0;">📧 Importante</h4>
    <p style="color: #e5e7eb; font-size: 14px;">Seus ingressos serão enviados até <strong>72 horas antes do evento</strong> para este e-mail.</p>
  </div>
</body>
</html>
`.trim();
}

function generateTicketEmail(data: TicketDeliveryData, eventDateFormatted: string): string {
  const ticketItems = data.tickets.map((t, i) => `
    <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin: 10px 0; border: 1px solid rgba(168, 85, 247, 0.3);">
      <p style="margin: 0; color: #a855f7; font-weight: bold;">Ingresso #${i + 1}</p>
      <p style="margin: 5px 0; color: #ffffff;">${t.ticketType}</p>
      <p style="margin: 5px 0; color: #22c55e; font-family: monospace; font-size: 16px;">${t.code}</p>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Seus Ingressos - XDeals</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a855f7; font-size: 28px;">XDeals</h1>
  </div>
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 30px; border: 1px solid #22c55e;">
    <h2 style="color: #22c55e; text-align: center;">🎟️ Seus Ingressos Chegaram!</h2>
    <h3 style="color: #a855f7; text-align: center;">${data.eventName}</h3>
    ${ticketItems}
  </div>
</body>
</html>
`.trim();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}