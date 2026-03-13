'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Ticket } from 'lucide-react';

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

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function calculatePrice(
  ticket: TicketTypeData,
  discountPercent: number
): {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
} {
  const originalPrice = ticket.totalPrice;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discountAmount,
    finalPrice: Math.round(finalPrice * 100) / 100,
  };
}

// ============================================
// COMPONENT
// ============================================

interface TicketCardProps {
  ticket: TicketTypeData;
  discountPercent: number;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isActive?: boolean;
}

export function TicketCard({
  ticket,
  discountPercent,
  quantity = 1,
  onQuantityChange,
  onSelect,
  isSelected = false,
  isActive = true,
}: TicketCardProps) {
  const pricing = calculatePrice(ticket, discountPercent);
  const savings = pricing.discountAmount * quantity;
  const totalPrice = pricing.finalPrice * quantity;
  const maxQuantity = ticket.maxPerOrder || 10;

  // Get features array
  const features = Array.isArray(ticket.features) ? ticket.features : [];

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-gray-900/50 border-gray-700 hover:border-purple-500/50'
      } ${!isActive ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      {discountPercent > 0 && isActive && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-bl-lg rounded-tr-lg px-3 py-1">
            -{discountPercent}% OFF
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Ticket className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-lg md:text-xl text-white">{ticket.name}</CardTitle>
            {ticket.description && (
              <p className="text-xs md:text-sm text-gray-400">{ticket.description}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        {/* Availability */}
        <div className="text-xs text-gray-500">
          {ticket.quantityTotal - ticket.quantitySold - ticket.quantityReserved} disponíveis
        </div>

        {/* Pricing */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex flex-col gap-1">
            {discountPercent > 0 && isActive ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(pricing.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                    Economia de {formatCurrency(pricing.discountAmount)}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {formatCurrency(pricing.finalPrice)}
                  </span>
                  <span className="text-sm text-gray-400">/ ingresso</span>
                </div>
              </>
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrency(pricing.originalPrice)}
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {isSelected && isActive && onQuantityChange && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 border-gray-600 hover:bg-purple-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuantityChange(Math.max(1, quantity - 1));
                    }}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-bold text-white">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 border-gray-600 hover:bg-purple-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuantityChange(Math.min(maxQuantity, quantity + 1));
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>

              {quantity > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-lg font-bold text-purple-400">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              )}

              {savings > 0 && quantity > 1 && (
                <div className="text-center text-xs text-green-400">
                  Você economiza {formatCurrency(savings)} nesta compra!
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
