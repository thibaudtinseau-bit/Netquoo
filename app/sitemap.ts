import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { communes, communePath } from '@/data/communes';
import { services, servicePath } from '@/data/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority,
  });
  return [
    entry('/', 1),
    entry('/devis', 0.9),
    entry('/services', 0.9),
    ...services.map((s) => entry(servicePath(s), 0.8)),
    entry('/zones-intervention', 0.8),
    ...communes.map((c) => entry(communePath(c), c.slug === 'montarnaud' ? 0.9 : 0.7)),
    entry('/a-propos', 0.5),
    entry('/mentions-legales', 0.2),
  ];
}
