import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ingressos.xdeals.online';

  // Get all active events
  const events = await db.event.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { date: 'asc' },
  });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Event pages
  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...eventPages];
}
