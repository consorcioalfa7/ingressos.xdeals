import { NextRequest, NextResponse } from 'next/server';
import { formatCurrency } from '@/lib/events';

interface NotificationData {
  transactionId: string;
  name: string;
  cpf?: string;
  contactType?: string;
  contactValue?: string;
  eventName?: string;
  ticketType?: string;
  quantity?: number;
  totalAmount?: number;
  paymentUrl?: string;
  status?: string;
}

interface NotificationRequest {
  type: 'new_transaction' | 'payment_confirmed' | 'payment_expired';
  data: NotificationData;
}

// Notification targets
const NOTIFICATION_TARGETS = {
  whatsapp: '+5562992887416',
  telegram: '@ghost00_Root',
};

function formatNewTransactionMessage(data: NotificationData): string {
  const now = new Date();
  const dateStr = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
🎫 *NOVA RESERVA - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
🎭 *Evento:* ${data.eventName || 'N/A'}
👤 *Nome:* ${data.name}
📋 *CPF:* ${data.cpf || 'N/A'}
📱 *Contato:* ${data.contactType || 'N/A'} - ${data.contactValue || 'N/A'}
🎟️ *Ingresso:* ${data.ticketType || 'N/A'} x ${data.quantity || 1}
💰 *Total:* ${data.totalAmount ? formatCurrency(data.totalAmount) : 'N/A'}
📅 *Data:* ${dateStr}
🔗 *ID:* ${data.transactionId}
━━━━━━━━━━━━━━━━━━━━━━
⏳ *Status: Aguardando Pagamento*
`.trim();
}

function formatPaymentConfirmedMessage(data: NotificationData): string {
  const now = new Date();
  const dateStr = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
✅ *PAGAMENTO CONFIRMADO - XDeals*
━━━━━━━━━━━━━━━━━━━━━━
🎭 *Evento:* ${data.eventName || 'N/A'}
👤 *Nome:* ${data.name}
📋 *CPF:* ${data.cpf || 'N/A'}
📱 *Contato:* ${data.contactType || 'N/A'} - ${data.contactValue || 'N/A'}
🎟️ *Ingresso:* ${data.ticketType || 'N/A'} x ${data.quantity || 1}
💰 *Total:* ${data.totalAmount ? formatCurrency(data.totalAmount) : 'N/A'}
📅 *Data:* ${dateStr}
🔗 *ID:* ${data.transactionId}
━━━━━━━━━━━━━━━━━━━━━━
🎉 *Status: PAGO*
`.trim();
}

async function sendTelegramNotification(message: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || NOTIFICATION_TARGETS.telegram;

  if (!botToken) {
    console.log('Telegram bot token not configured, skipping Telegram notification');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}

async function sendWhatsAppNotification(message: string): Promise<boolean> {
  // WhatsApp integration would require a service like Z-API, Twilio, or WhatsApp Business API
  // For now, we just log the notification
  console.log('WhatsApp notification would be sent to:', NOTIFICATION_TARGETS.whatsapp);
  console.log('Message:', message);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();

    // Validate required fields
    if (!body.type || !body.data || !body.data.transactionId) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    let message: string;
    switch (body.type) {
      case 'new_transaction':
        message = formatNewTransactionMessage(body.data);
        break;
      case 'payment_confirmed':
        message = formatPaymentConfirmedMessage(body.data);
        break;
      default:
        message = formatNewTransactionMessage(body.data);
    }

    // Log notification
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`NOTIFICATION TYPE: ${body.type}`);
    console.log('WhatsApp:', NOTIFICATION_TARGETS.whatsapp);
    console.log('Telegram:', NOTIFICATION_TARGETS.telegram);
    console.log('Message:', message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━');

    // Send notifications
    const [telegramSent, whatsappSent] = await Promise.all([
      sendTelegramNotification(message),
      sendWhatsAppNotification(message),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Notificação processada',
      notifications: {
        telegram: telegramSent,
        whatsapp: whatsappSent,
      },
      targets: {
        whatsapp: NOTIFICATION_TARGETS.whatsapp,
        telegram: NOTIFICATION_TARGETS.telegram,
      },
    });

  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}
