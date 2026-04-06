import type { MetadataRoute } from 'next';
import { listCakesForSitemap } from '@/lib/catalog';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const cakes = await listCakesForSitemap();
    return [
      ...entries,
      ...cakes.map((cake) => ({
        url: absoluteUrl(`/cakes/${cake.id}`),
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return entries;
  }
}
