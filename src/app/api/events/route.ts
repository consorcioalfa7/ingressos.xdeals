import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// GET /api/events
// Get all active events with ticket types
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get single event
      const event = await db.event.findUnique({
        where: { slug, isActive: true },
        include: {
          ticketTypes: {
            where: { isActive: true },
          },
          discountPeriods: {
            orderBy: { discount: 'desc' },
          },
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      // Calculate current discount
      const now = new Date();
      let currentDiscount = event.fixedDiscount || 0;

      for (const period of event.discountPeriods) {
        if (now >= period.startDate && now <= period.endDate) {
          currentDiscount = period.discount;
          break;
        }
      }

      return NextResponse.json({
        ...event,
        currentDiscount,
      });
    }

    // Get all active events
    const events = await db.event.findMany({
      where: { isActive: true },
      include: {
        ticketTypes: {
          where: { isActive: true },
        },
        discountPeriods: {
          orderBy: { discount: 'desc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate current discount for each event
    const now = new Date();
    const eventsWithDiscount = events.map((event) => {
      let currentDiscount = event.fixedDiscount || 0;

      for (const period of event.discountPeriods) {
        if (now >= period.startDate && now <= period.endDate) {
          currentDiscount = period.discount;
          break;
        }
      }

      return {
        ...event,
        currentDiscount,
      };
    });

    return NextResponse.json(eventsWithDiscount);
  } catch (error) {
    console.error('[API Events] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
