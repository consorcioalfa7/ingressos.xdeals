import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import NexusClient from '@/lib/nexus';
import { validateCPF, cleanCPF } from '@/lib/pricing';
import { formatCurrency } from '@/lib/events';

// ============================================
// HANDLER: CRIAR RESERVA (POST)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação básica
    if (!body.name || !body.cpf || !body.contactValue || !body.eventSlug || !body.ticketId) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios em falta' }, { status: 400 });
    }

    // Busca o evento e o ingresso
    const event = await db.event.findUnique({
      where: { slug: body.eventSlug },
      include: { ticketTypes: { where: { id: body.ticketId } } },
    });

    if (!event || !event.ticketTypes[0]) {
      return NextResponse.json({ success: false, error: 'Evento ou ingresso não encontrado' }, { status: 404 });
    }

    const ticketType = event.ticketTypes[0];
    const subtotal = ticketType.totalPrice * body.quantity;
    const discountPercent = event.fixedDiscount || 0;
    const total = subtotal - (subtotal * (discountPercent / 100));

    const orderId = NexusClient.generateOrderId();

    // Cria a Ordem
    const order = await db.order.create({
      data: {
        orderId,
        eventId: event.id,
        customerName: body.name,
        customerCpf: cleanCPF(body.cpf),
        customerContactType: body.contactType || 'Email',
        customerContact: body.contactValue,
        subtotal,
        discount: discountPercent,
        discountAmount: subtotal * (discountPercent / 100),
        total,
        paymentStatus: 'pending',
        nexusStatus: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // Cria o Item da Ordem
    await db.orderItem.create({
      data: {
        orderId: order.id,
        ticketTypeId: ticketType.id,
        quantity: body.quantity,
        unitPrice: ticketType.totalPrice,
        totalPrice: subtotal,
      },
    });

    // Chama o Nexus para gerar o PIX
    const nexusResult = await NexusClient.createPayment(total, orderId);

    if (!nexusResult.success || !nexusResult.data) {
      return NextResponse.json({ success: false, error: 'Erro no gateway Nexus' }, { status: 500 });
    }

    // Atualiza a Ordem com os dados do PIX
    await db.order.update({
      where: { id: order.id },
      data: {
        nexusId: nexusResult.data.nexus_id,
        nexusStatus: nexusResult.data.status,
        pixCode: nexusResult.data.pix_copia_e_cola,
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
    console.error('[Checkout API Error]:', error);
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 });
  }
}

// ============================================
// HANDLER: VERIFICAR STATUS (GET)
// ============================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

  const order = await db.order.findUnique({
    where: { orderId },
    select: { paymentStatus: true, nexusStatus: true, pixCode: true, total: true }
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Retornamos o status para o componente do site saber se já foi pago
  return NextResponse.json({
    status: order.paymentStatus,
    nexusStatus: order.nexusStatus,
    pixCode: order.pixCode,
    amount: order.total
  });
}
