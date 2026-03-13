// Database helper functions for events management
import { db } from './db';

// ============================================
// EVENT MANAGEMENT
// ============================================

export interface EventData {
  slug: string;
  name: string;
  artist?: string;
  tour?: string;
  description?: string;
  date: Date;
  venue: string;
  city: string;
  bannerUrl: string;
  mapUrl?: string;
  youtubeVideoId?: string;
  originalLink: string;
  discountType: 'fixed' | 'progressive';
  fixedDiscount?: number;
  badge?: string;
  ticketTypes: TicketTypeData[];
}

export interface TicketTypeData {
  name: string;
  description?: string;
  basePrice: number;
  fee: number;
  totalPrice: number;
  quantityTotal?: number;
  maxPerOrder?: number;
  features?: string[];
}

/**
 * Create or update an event with ticket types
 */
export async function upsertEvent(eventData: EventData) {
  const { ticketTypes, ...eventFields } = eventData;

  // Check if event exists
  const existingEvent = await db.event.findUnique({
    where: { slug: eventData.slug },
    include: { ticketTypes: true },
  });

  if (existingEvent) {
    // Update existing event
    const updatedEvent = await db.event.update({
      where: { slug: eventData.slug },
      data: {
        ...eventFields,
        ticketTypes: {
          deleteMany: {},
          create: ticketTypes.map((tt) => ({
            name: tt.name,
            description: tt.description,
            basePrice: tt.basePrice,
            fee: tt.fee,
            totalPrice: tt.totalPrice,
            quantityTotal: tt.quantityTotal || 100,
            maxPerOrder: tt.maxPerOrder || 10,
            features: tt.features ? JSON.stringify(tt.features) : null,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    return updatedEvent;
  }

  // Create new event
  const newEvent = await db.event.create({
    data: {
      ...eventFields,
      ticketTypes: {
        create: ticketTypes.map((tt) => ({
          name: tt.name,
          description: tt.description,
          basePrice: tt.basePrice,
          fee: tt.fee,
          totalPrice: tt.totalPrice,
          quantityTotal: tt.quantityTotal || 100,
          maxPerOrder: tt.maxPerOrder || 10,
          features: tt.features ? JSON.stringify(tt.features) : null,
        })),
      },
    },
    include: { ticketTypes: true },
  });

  return newEvent;
}

/**
 * Get event by slug with ticket types
 */
export async function getEventWithTickets(slug: string) {
  return db.event.findUnique({
    where: { slug },
    include: {
      ticketTypes: {
        where: { isActive: true },
      },
    },
  });
}

/**
 * Get all active events
 */
export async function getActiveEvents() {
  return db.event.findMany({
    where: { isActive: true },
    include: {
      ticketTypes: {
        where: { isActive: true },
      },
    },
    orderBy: { date: 'asc' },
  });
}

/**
 * Update ticket sales count
 */
export async function updateTicketSales(ticketTypeId: string, quantity: number) {
  return db.ticketType.update({
    where: { id: ticketTypeId },
    data: {
      quantitySold: { increment: quantity },
    },
  });
}

/**
 * Check ticket availability
 */
export async function checkTicketAvailability(ticketTypeId: string, quantity: number) {
  const ticketType = await db.ticketType.findUnique({
    where: { id: ticketTypeId },
  });

  if (!ticketType) {
    return { available: false, reason: 'Ticket type not found' };
  }

  const available =
    ticketType.quantityTotal - ticketType.quantitySold - ticketType.quantityReserved;

  if (available < quantity) {
    return {
      available: false,
      reason: `Only ${available} tickets available`,
      availableCount: available,
    };
  }

  return { available: true, availableCount: available };
}

// ============================================
// DISCOUNT PERIODS
// ============================================

export async function createDiscountPeriods(
  eventId: string,
  periods: Array<{
    discount: number;
    startDate: Date;
    endDate: Date;
    label: string;
  }>
) {
  return db.discountPeriod.createMany({
    data: periods.map((p) => ({
      eventId,
      ...p,
    })),
  });
}

export async function getActiveDiscount(eventId: string) {
  const now = new Date();

  const discountPeriod = await db.discountPeriod.findFirst({
    where: {
      eventId,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { discount: 'desc' },
  });

  return discountPeriod;
}

// ============================================
// ORDER HELPERS
// ============================================

export async function getOrderWithDetails(orderId: string) {
  return db.order.findUnique({
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
}

export async function getOrderByNexusId(nexusId: string) {
  return db.order.findUnique({
    where: { nexusId },
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
}

export async function expireOldOrders() {
  const expiredOrders = await db.order.updateMany({
    where: {
      paymentStatus: 'pending',
      expiresAt: { lt: new Date() },
    },
    data: {
      paymentStatus: 'expired',
      nexusStatus: 'expired',
    },
  });

  return expiredOrders;
}
