import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { Sparkles, Ticket, Shield, Zap, ExternalLink, MapPin, Music, Calendar, Filter } from 'lucide-react';
import { HomePageClient } from './HomePageClient';

export const metadata: Metadata = {
  title: 'XDeals - Ingressos com até 60% de Desconto | Parceiro Q2Ingressos',
  description: 'Compre ingressos com descontos exclusivos de 40% a 60%. XDeals é parceiro oficial Q2Ingressos. Shows, festivais e eventos em todo Brasil.',
};

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Helper function to format date
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Event type labels
const eventTypeLabels: Record<string, string> = {
  show: 'Show',
  festival: 'Festival',
  exposicao: 'Exposição',
  rodeio: 'Rodeio',
};

// Category labels
const categoryLabels: Record<string, string> = {
  musica: 'Música',
  agronegocio: 'Agronegócio',
  esporte: 'Esporte',
  cultura: 'Cultura',
};

export default async function HomePage() {
  // Fetch events from database
  const dbEvents = await db.event.findMany({
    where: { isActive: true },
    include: {
      ticketTypes: {
        where: { isActive: true },
      },
      discountPeriods: {
        orderBy: { discount: 'desc' },
      },
    },
    orderBy: [
      { featured: 'desc' },
      { date: 'asc' },
    ],
  });

  // Get unique cities and event types for filters
  const cities = [...new Set(dbEvents.map(e => e.city))].sort();
  const eventTypes = [...new Set(dbEvents.map(e => e.eventType))];
  const categories = [...new Set(dbEvents.map(e => e.category))];
  const states = [...new Set(dbEvents.map(e => e.state).filter(Boolean))];

  // Calculate current discount for each event
  const now = new Date();
  const events = dbEvents.map((event) => {
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
      minTicketPrice: event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.totalPrice))
        : 0,
      minFinalPrice: event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map(t => t.totalPrice)) * (1 - currentDiscount / 100)
        : 0,
    };
  });

  // Group events by city for summary
  const eventsByCity = cities.map(city => ({
    city,
    count: events.filter(e => e.city === city).length,
  }));

  return (
    <HomePageClient 
      events={events.map(e => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        artist: e.artist,
        tour: e.tour,
        description: e.description,
        date: e.date.toISOString(),
        endDate: e.endDate?.toISOString() || null,
        venue: e.venue,
        city: e.city,
        state: e.state,
        eventType: e.eventType,
        category: e.category,
        bannerUrl: e.bannerUrl,
        badge: e.badge,
        featured: e.featured,
        currentDiscount: e.currentDiscount,
        minTicketPrice: e.minTicketPrice,
        minFinalPrice: e.minFinalPrice,
      }))}
      cities={cities}
      eventTypes={eventTypes}
      categories={categories}
      states={states as string[]}
      eventTypeLabels={eventTypeLabels}
      categoryLabels={categoryLabels}
    />
  );
}
