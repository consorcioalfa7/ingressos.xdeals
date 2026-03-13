'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Countdown } from '@/components/Countdown';
import { TicketCard } from '@/components/TicketCard';
import { CheckoutForm } from '@/components/CheckoutForm';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import {
  Calendar,
  MapPin,
  Music,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  ArrowLeft,
  Ticket,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TicketTypeData {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  fee: number;
  totalPrice: number;
  quantityTotal: number;
  quantitySold: number;
  quantityReserved: number;
  maxPerOrder: number;
  features: string[];
}

interface DiscountPeriod {
  discount: number;
  startDate: string;
  endDate: string;
  label: string;
}

interface EventData {
  id: string;
  slug: string;
  name: string;
  artist: string | null;
  tour: string | null;
  description: string | null;
  date: string;
  venue: string;
  city: string;
  bannerUrl: string;
  mapUrl: string | null;
  youtubeVideoId: string | null;
  originalLink: string;
  badge: string | null;
  currentDiscount: number;
  currentDiscountLabel: string;
  discountEndsAt: string | null;
  nextPeriod: {
    discount: number;
    startDate: string;
    label: string;
  } | null;
  discountPeriods: DiscountPeriod[];
  ticketTypes: TicketTypeData[];
  discountType: string;
  fixedDiscount: number | null;
}

interface EventPageClientProps {
  event: EventData;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function calculatePrice(
  ticket: TicketTypeData,
  discountPercent: number
): {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountPercent: number;
} {
  const originalPrice = ticket.totalPrice;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discountAmount,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountPercent,
  };
}

// ============================================
// COMPONENT
// ============================================

export default function EventPageClient({ event }: EventPageClientProps) {
  const [selectedTicket, setSelectedTicket] = useState<TicketTypeData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountInfo, setDiscountInfo] = useState({
    discount: event.currentDiscount,
    label: event.currentDiscountLabel,
    isActive: event.currentDiscount > 0,
    endsAt: event.discountEndsAt ? new Date(event.discountEndsAt) : undefined,
    nextPeriod: event.nextPeriod
      ? {
          discount: event.nextPeriod.discount,
          startDate: new Date(event.nextPeriod.startDate),
          label: event.nextPeriod.label,
        }
      : undefined,
  });

  // Update discount info every minute
  useEffect(() => {
    const timer = setInterval(() => {
      // Recalculate discount based on current time
      const now = new Date();
      let currentDiscount = event.fixedDiscount || 0;
      let currentLabel = '';
      let endsAt: Date | undefined;
      let isActive = false;

      for (const period of event.discountPeriods) {
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        if (now >= startDate && now <= endDate) {
          currentDiscount = period.discount;
          currentLabel = period.label;
          endsAt = endDate;
          isActive = true;
          break;
        }
      }

      setDiscountInfo({
        discount: currentDiscount,
        label: currentLabel,
        isActive,
        endsAt,
        nextPeriod: event.nextPeriod
          ? {
              discount: event.nextPeriod.discount,
              startDate: new Date(event.nextPeriod.startDate),
              label: event.nextPeriod.label,
            }
          : undefined,
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [event]);

  // Get the target date for countdown
  const getCountdownTarget = () => {
    if (discountInfo.isActive && discountInfo.endsAt) {
      return discountInfo.endsAt;
    }
    if (discountInfo.nextPeriod?.startDate) {
      return discountInfo.nextPeriod.startDate;
    }
    return new Date(event.date);
  };

  const getCountdownLabel = () => {
    if (discountInfo.isActive && discountInfo.endsAt) {
      return `⏰ ${discountInfo.label} termina em:`;
    }
    if (discountInfo.nextPeriod) {
      return `⏰ Próximo período: ${discountInfo.nextPeriod.label}`;
    }
    return '⏰ Contagem regressiva para o evento:';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-gray-950/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline">Voltar</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                XDeals
              </span>
            </Link>
          </div>
          <Badge
            variant="outline"
            className="border-purple-500/50 text-purple-300 bg-purple-500/10"
          >
            Parceiro Q2Ingressos
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-[300px] md:h-[500px] w-full">
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30" />
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {event.badge && (
              <Badge className="mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold">
                {event.badge}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 drop-shadow-lg">
              {event.name}
            </h1>
            {event.artist && (
              <p className="text-xl md:text-2xl text-purple-300 font-semibold mb-4">
                {event.artist}
                {event.tour && ` - ${event.tour}`}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>{event.venue} - {event.city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Discount Status Banner */}
        {discountInfo.discount > 0 && (
          <div className="mb-8 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Desconto Atual</p>
                  <p className={`text-xl font-bold ${discountInfo.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                    {discountInfo.label}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <Countdown
                  targetDate={getCountdownTarget()}
                  label={getCountdownLabel()}
                />
              </div>
            </div>
          </div>
        )}

        {/* YouTube Video */}
        {event.youtubeVideoId && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Veja o vídeo</h2>
            </div>
            <YouTubeEmbed videoId={event.youtubeVideoId} title={event.name} />
          </section>
        )}

        {/* Event Map */}
        {event.mapUrl && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Mapa do Evento</h2>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-gray-800">
              <img
                src={event.mapUrl}
                alt="Mapa do evento"
                className="w-full h-auto"
              />
            </div>
          </section>
        )}

        {/* Tickets Section */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Ticket className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Escolha seu Ingresso</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {event.ticketTypes.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                discountPercent={discountInfo.isActive ? discountInfo.discount : 0}
                quantity={selectedTicket?.id === ticket.id ? quantity : 1}
                onQuantityChange={setQuantity}
                onSelect={() => {
                  setSelectedTicket(ticket);
                  setQuantity(1);
                }}
                isSelected={selectedTicket?.id === ticket.id}
                isActive={true}
              />
            ))}
          </div>
        </section>

        {/* Checkout Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Checkout Form */}
            <div>
              <CheckoutForm
                eventSlug={event.slug}
                eventName={event.name}
                selectedTicket={selectedTicket}
                quantity={quantity}
                discountPercent={discountInfo.isActive ? discountInfo.discount : 0}
                isActive={true}
              />
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              {/* Why XDeals? */}
              <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Por que comprar pelo XDeals?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded bg-green-500/20 mt-0.5">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Compra Segura</p>
                      <p className="text-sm text-gray-400">
                        Parceiro oficial Q2Ingressos com garantia de ingressos
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 rounded bg-purple-500/20 mt-0.5">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Descontos Exclusivos</p>
                      <p className="text-sm text-gray-400">
                        Economize até 60% no seu ingresso
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Discount Periods (for progressive discount events) */}
              {event.discountType === 'progressive' && event.discountPeriods.length > 0 && (
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Períodos de Desconto
                  </h3>
                  <div className="space-y-3">
                    {event.discountPeriods.map((period) => {
                      const isActivePeriod = discountInfo.discount === period.discount && discountInfo.isActive;
                      return (
                        <div
                          key={`${period.discount}-${period.startDate}`}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isActivePeriod
                              ? 'bg-purple-500/20 border border-purple-500/50'
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-white">{period.label.split(' - ')[1] || period.label}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(period.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a{' '}
                              {new Date(period.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              isActivePeriod
                                ? 'bg-green-500'
                                : 'bg-gray-700'
                            }`}
                          >
                            {period.discount}% OFF
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Original Link */}
              <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">
                  Ingressos também disponíveis em:
                </p>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                >
                  <a
                    href={event.originalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Q2Ingressos - Preço Original
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-8 bg-gray-800" />

        {/* Footer */}
        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              XDeals
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            Parceiro oficial Q2Ingressos
          </p>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} XDeals. Todos os direitos reservados.
          </p>
        </footer>
      </main>
    </div>
  );
}
