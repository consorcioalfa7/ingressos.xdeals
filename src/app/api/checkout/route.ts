import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import NexusClient from '@/lib/nexus';
import { validateCPF, cleanCPF } from '@/lib/pricing';
import { formatCurrency } from '@/lib/events';

interface CheckoutRequest {
  name: string;
  cpf: string;
  contactType: 'WhatsApp' | 'Email' | 'Telegram';
  contactValue: string;
  eventSlug: string;
  ticketId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    if (!body.name || !body.cpf || !body.contactType || !body.contactValue || !body.eventSlug || !body.ticketId) {
      return NextResponse.json({ success: false, error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (!validateCPF(body.cpf)) {
      return NextResponse.json({ success: false, error: 'CPF inválido' }, { status: 400 });
    }

    const event = await db.event.findUnique({
      where: { slug: body.eventSlug },
      include: { ticketTypes: { where: { id: body.ticketId } } },
    });

    if (!event || !event.ticketTypes[0]) {
      return NextResponse.json({ success: false, error: 'Evento não encontrado' }, { status: 404 });
    }

    const ticketType = event.ticketTypes[0];
    const subtotal = ticketType.totalPrice * body.quantity;
    
    let discountPercent = event.fixedDiscount || 0;
    const now = new Date();
    const activeDiscountPeriod = await db.discountPeriod.findFirst({
      where: { eventId: event.id, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { discount: 'desc' },
    });

    if (activeDiscountPeriod) {
      discountPercent = activeDiscountPeriod.discount;
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
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
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    await db.orderItem.create({
      data: {
        orderId: order.id,
        ticketTypeId: ticketType.id,
        quantity: body.quantity,
        unitPrice: ticketType.totalPrice,
        totalPrice: subtotal,
      },
    });

    await db.ticketType.update({
      where: { id: ticketType.id },
      data: { quantityReserved: { increment: body.quantity } },
    });

    const nexusResult = await NexusClient.createPayment(total, orderId);

    if (!nexusResult.success || !nexusResult.data) {
      await db.ticketType.update({
        where: { id: ticketType.id },
        data: { quantityReserved: { decrement: body.quantity } },
      });
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'failed', nexusStatus: 'failed' },
      });
      return NextResponse.json({ success: false, error: nexusResult.error || 'Erro ao criar pagamento' }, { status: 500 });
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        nexusId: nexusResult.data.nexus_id,
        nexusStatus: nexusResult.data.status,
        pixCode: nexusResult.data.pix_copia_e_cola,
      },
    });

    await db.auditLog.create({
      data: {
        action: 'order_created',
        entityType: 'order',
        entityId: order.id,
        details: JSON.stringify({ orderId, nexusId: nexusResult.data.nexus_id, total, discount: discountPercent }),
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      nexusId: nexusResult.data.nexus_id,
      pixCode: nexusResult.data.pix_copia_e_cola,
      amount: total,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

  const order = await db.order.findUnique({
    where: { orderId },
    include: { event: true, items: { include: { ticketType: true } }, tickets: true },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    orderId: order.orderId,
    status: order.paymentStatus,
    nexusStatus: order.nexusStatus,
    amount: order.total,
    pixCode: order.pixCode,
    paidAt: order.paidAt,
  });
}