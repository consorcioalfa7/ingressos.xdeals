import { notFound } from 'next/navigation';
import EventPageClient from './EventPageClient';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================
// GENERATE STATIC PARAMS
// ============================================

export async function generateStaticParams() {
  const events = await db.event.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return events.map((event) => ({
    slug: event.slug,
  }));
}

// ============================================
// PAGE COMPONENT
// ============================================

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  // Fetch event from database
  const dbEvent = await db.event.findUnique({
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

  if (!dbEvent) {
    notFound();
  }

  // Calculate current discount
  const now = new Date();
  let currentDiscount = dbEvent.fixedDiscount || 0;
  let currentDiscountLabel = '';
  let discountEndsAt: Date | null = null;
  let nextPeriod: { discount: number; startDate: Date; label: string } | null = null;

  for (let i = 0; i < dbEvent.discountPeriods.length; i++) {
    const period = dbEvent.discountPeriods[i];
    if (now >= period.startDate && now <= period.endDate) {
      currentDiscount = period.discount;
      currentDiscountLabel = period.label;
      discountEndsAt = period.endDate;
      if (i + 1 < dbEvent.discountPeriods.length) {
        nextPeriod = {
          discount: dbEvent.discountPeriods[i + 1].discount,
          startDate: dbEvent.discountPeriods[i + 1].startDate,
          label: dbEvent.discountPeriods[i + 1].label,
        };
      }
      break;
    }
  }

  // If no active period found, check if we're before the first period
  if (currentDiscountLabel === '' && dbEvent.discountPeriods.length > 0) {
    if (now < dbEvent.discountPeriods[0].startDate) {
      currentDiscount = 0;
      currentDiscountLabel = 'Em breve - ' + dbEvent.discountPeriods[0].label;
      nextPeriod = {
        discount: dbEvent.discountPeriods[0].discount,
        startDate: dbEvent.discountPeriods[0].startDate,
        label: dbEvent.discountPeriods[0].label,
      };
    }
  }

  // Transform to client-safe format
  const event = {
    id: dbEvent.id,
    slug: dbEvent.slug,
    name: dbEvent.name,
    artist: dbEvent.artist,
    tour: dbEvent.tour,
    description: dbEvent.description,
    date: dbEvent.date.toISOString(),
    venue: dbEvent.venue,
    city: dbEvent.city,
    bannerUrl: dbEvent.bannerUrl,
    mapUrl: dbEvent.mapUrl,
    youtubeVideoId: dbEvent.youtubeVideoId,
    originalLink: dbEvent.originalLink,
    badge: dbEvent.badge,
    currentDiscount,
    currentDiscountLabel,
    discountEndsAt: discountEndsAt?.toISOString() || null,
    nextPeriod: nextPeriod ? {
      ...nextPeriod,
      startDate: nextPeriod.startDate.toISOString(),
    } : null,
    discountPeriods: dbEvent.discountPeriods.map((p) => ({
      discount: p.discount,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      label: p.label,
    })),
    ticketTypes: dbEvent.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      basePrice: t.basePrice,
      fee: t.fee,
      totalPrice: t.totalPrice,
      quantityTotal: t.quantityTotal,
      quantitySold: t.quantitySold,
      quantityReserved: t.quantityReserved,
      maxPerOrder: t.maxPerOrder,
      features: t.features ? JSON.parse(t.features) : [],
    })),
    discountType: dbEvent.discountType,
    fixedDiscount: dbEvent.fixedDiscount,
  };

  return <EventPageClient event={event} />;
}
