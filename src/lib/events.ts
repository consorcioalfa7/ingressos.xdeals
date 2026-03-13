// Events data structure for XDeals

export interface TicketType {
  id: string;
  name: string;
  basePrice: number;
  fee: number;
  totalPrice: number;
  description: string;
  features: string[];
  maxQuantity?: number;
}

export interface DiscountPeriod {
  discount: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface DiscountConfig {
  type: 'progressive' | 'fixed';
  periods?: DiscountPeriod[];
  fixedDiscount?: number;
}

export interface Event {
  slug: string;
  name: string;
  artist?: string;
  tour?: string;
  date: Date;
  venue: string;
  city: string;
  originalLink: string;
  bannerUrl: string;
  mapUrl?: string;
  youtubeVideoId?: string;
  tickets: TicketType[];
  discountConfig: DiscountConfig;
  badge?: string;
  description?: string;
  isActive: boolean;
}

// FAZER FALTA FESTIVAL 2026
const fazerFaltaTickets: TicketType[] = [
  {
    id: 'pista',
    name: 'Pista',
    basePrice: 50.00,
    fee: 7.50,
    totalPrice: 57.50,
    description: 'Acesso à área de pista',
    features: ['Acesso à área de pista', 'Experiência completa do show'],
    maxQuantity: 10,
  },
  {
    id: 'vip',
    name: 'VIP',
    basePrice: 90.00,
    fee: 13.50,
    totalPrice: 103.50,
    description: 'Área VIP com melhor visualização',
    features: ['Acesso à área VIP', 'Melhor visualização', 'Banheiros exclusivos'],
    maxQuantity: 10,
  },
  {
    id: 'camarote-open-bar',
    name: 'Camarote Open Bar',
    basePrice: 200.00,
    fee: 30.00,
    totalPrice: 230.00,
    description: 'Camarote com open bar incluso',
    features: ['Acesso ao camarote', 'Open bar incluso', 'Visão privilegiada', 'Atendimento exclusivo'],
    maxQuantity: 10,
  },
  {
    id: 'bistro',
    name: 'Bistrô (6 pessoas)',
    basePrice: 1500.00,
    fee: 225.00,
    totalPrice: 1725.00,
    description: 'Mesa no Bistrô para 6 pessoas',
    features: ['Mesa para 6 pessoas', 'Menu especial', 'Serviço exclusivo', 'Visão privilegiada'],
    maxQuantity: 5,
  },
];

const fazerFaltaDiscounts: DiscountPeriod[] = [
  {
    discount: 60,
    startDate: new Date('2026-03-11T00:00:00'),
    endDate: new Date('2026-03-14T23:59:59'),
    label: '60% OFF - Primeira Onda',
  },
  {
    discount: 50,
    startDate: new Date('2026-03-15T00:00:00'),
    endDate: new Date('2026-03-21T23:59:59'),
    label: '50% OFF - Segunda Onda',
  },
  {
    discount: 40,
    startDate: new Date('2026-03-22T00:00:00'),
    endDate: new Date('2026-03-27T23:59:59'),
    label: '40% OFF - Última Onda',
  },
];

// MENOS É MAIS + NATTAN
const menosEmaisTickets: TicketType[] = [
  {
    id: 'area-vip-meia',
    name: 'Área VIP Meia/Solidário',
    basePrice: 150.00,
    fee: 18.00,
    totalPrice: 168.00,
    description: 'Meia entrada área VIP',
    features: ['Acesso à área VIP', 'Meia entrada', 'Documentação necessária'],
    maxQuantity: 10,
  },
  {
    id: 'area-vip-inteira',
    name: 'Área VIP Inteira',
    basePrice: 300.00,
    fee: 36.00,
    totalPrice: 336.00,
    description: 'Ingresso inteiro área VIP',
    features: ['Acesso à área VIP', 'Melhor visualização', 'Banheiros exclusivos'],
    maxQuantity: 10,
  },
];

// All events
export const EVENTS: Event[] = [
  {
    slug: 'fazer-falta-festival-2026',
    name: 'FAZER FALTA FESTIVAL 2026',
    artist: 'MC Livinho',
    tour: 'Turnê de Despedida',
    date: new Date('2026-03-28T22:00:00'),
    venue: 'Paraná Expo',
    city: 'Maringá - PR',
    originalLink: 'https://q2ingressos.com.br/events/fazer-falta-festival-2026',
    bannerUrl: 'https://files.catbox.moe/d23obx.jpg',
    mapUrl: 'https://files.catbox.moe/zkfhkg.jpg',
    youtubeVideoId: 'bUeuvDCrqr0',
    tickets: fazerFaltaTickets,
    discountConfig: {
      type: 'progressive',
      periods: fazerFaltaDiscounts,
    },
    badge: 'Turnê de Despedida',
    description: 'O maior festival de piseiro do Brasil! MC Livinho se despede dos palcos com uma turnê histórica.',
    isActive: true,
  },
  {
    slug: 'menosemais-nattan',
    name: 'MENOS É MAIS + NATTAN',
    date: new Date('2026-03-20T21:00:00'),
    venue: 'Pavilhão Azul - Parque de Exposições',
    city: 'Maringá, PR',
    originalLink: 'https://q2ingressos.com.br/events/menosemais-nattan',
    bannerUrl: 'https://files.catbox.moe/4dohw0.jpg',
    youtubeVideoId: 'LhwGHGskTK8',
    tickets: menosEmaisTickets,
    discountConfig: {
      type: 'fixed',
      fixedDiscount: 50,
    },
    badge: 'Sexta-feira 21:00',
    description: 'Uma noite especial com Menos é Mais e Nattan!',
    isActive: true,
  },
];

// Get event by slug
export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find(event => event.slug === slug);
}

// Get all active events
export function getActiveEvents(): Event[] {
  return EVENTS.filter(event => event.isActive);
}

// Get current discount for an event
export function getCurrentDiscount(event: Event, currentDate: Date = new Date()): {
  discount: number;
  label: string;
  isActive: boolean;
  nextPeriod?: DiscountPeriod;
  endsAt?: Date;
} {
  const { discountConfig } = event;

  if (discountConfig.type === 'fixed') {
    return {
      discount: discountConfig.fixedDiscount || 0,
      label: `${discountConfig.fixedDiscount}% OFF`,
      isActive: true,
    };
  }

  // Progressive discount
  const periods = discountConfig.periods || [];
  
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    if (currentDate >= period.startDate && currentDate <= period.endDate) {
      return {
        discount: period.discount,
        label: period.label,
        isActive: true,
        nextPeriod: periods[i + 1],
        endsAt: period.endDate,
      };
    }
  }

  // If we're before the first discount period
  if (periods.length > 0 && currentDate < periods[0].startDate) {
    return {
      discount: periods[0].discount,
      label: 'Em breve - ' + periods[0].label,
      isActive: false,
      nextPeriod: periods[0],
      endsAt: undefined,
    };
  }

  // If all discount periods have passed
  return {
    discount: 0,
    label: 'Promoção encerrada',
    isActive: false,
    nextPeriod: undefined,
    endsAt: undefined,
  };
}

// Calculate final price with discount
export function calculatePrice(
  ticket: TicketType,
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

// Format currency in BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format date in Portuguese
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get YouTube embed URL from video ID
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Get YouTube thumbnail URL
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
