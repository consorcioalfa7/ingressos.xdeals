import { Metadata } from 'next';
import { getEventBySlug, getCurrentDiscount } from '@/lib/events';

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Evento não encontrado',
    };
  }

  const discountInfo = getCurrentDiscount(event);
  const discountText = discountInfo.discount > 0 ? ` - ${discountInfo.discount}% OFF` : '';
  const artistText = event.artist ? ` - ${event.artist}` : '';

  return {
    title: `${event.name}${artistText}${discountText}`,
    description: `${event.name} - ${event.venue}, ${event.city}. Ingressos com até ${discountInfo.discount}% de desconto via XDeals. Parceiro oficial Q2Ingressos.`,
    keywords: [event.name, event.artist, event.venue, event.city, 'ingressos', 'desconto', 'XDeals', 'Q2Ingressos'],
    openGraph: {
      title: `${event.name}${artistText}${discountText}`,
      description: `${event.venue}, ${event.city}. Ingressos com até ${discountInfo.discount}% de desconto.`,
      type: 'website',
      url: `https://ingressos.xdeals.online/events/${event.slug}`,
      images: [event.bannerUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name}${artistText}${discountText}`,
      description: `${event.venue}, ${event.city}. Ingressos com até ${discountInfo.discount}% de desconto.`,
      images: [event.bannerUrl],
    },
  };
}

export default function EventLayout({ children }: EventLayoutProps) {
  return children;
}
