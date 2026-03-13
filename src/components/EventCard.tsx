'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event, getCurrentDiscount, formatCurrency, formatDate } from '@/lib/events';
import { Calendar, MapPin, Ticket, ArrowRight, Percent } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const discountInfo = getCurrentDiscount(event);
  const minTicketPrice = Math.min(...event.tickets.map(t => t.totalPrice));
  const minFinalPrice = minTicketPrice * (1 - discountInfo.discount / 100);

  return (
    <Card className="group overflow-hidden bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300">
      {/* Banner */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
        
        {/* Discount Badge */}
        {discountInfo.discount > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm px-3 py-1">
              <Percent className="w-3 h-3 mr-1" />
              {discountInfo.discount}% OFF
            </Badge>
          </div>
        )}

        {/* Badge */}
        {event.badge && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-purple-500/90 text-white font-medium">
              {event.badge}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 md:p-6">
        {/* Event Info */}
        <div className="space-y-3">
          {/* Title */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white line-clamp-1">
              {event.name}
            </h3>
            {event.artist && (
              <p className="text-purple-400 font-medium">{event.artist}</p>
            )}
          </div>

          {/* Date & Location */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="line-clamp-1">{event.venue} - {event.city}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div>
              <p className="text-xs text-gray-500">A partir de</p>
              <div className="flex items-baseline gap-2">
                {discountInfo.discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(minTicketPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-white">
                  {formatCurrency(minFinalPrice)}
                </span>
              </div>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Link href={`/events/${event.slug}`}>
                <Ticket className="w-4 h-4 mr-2" />
                Comprar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
