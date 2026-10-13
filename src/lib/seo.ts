import type { Metadata } from 'next';
import { site } from '@/config/site';
import { communes } from '@/data/communes';

/** Métadonnées standard d'une page (canonical + Open Graph). */
export function pageMetadata({ title, description, path, image = '/images/hero.webp' }: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: 'fr_FR',
      type: 'website',
      images: [{ url: image }],
    },
  };
}

/** Données structurées LocalBusiness de l'entreprise. */
export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#entreprise`,
    name: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}/images/hero.webp`,
    logo: `${site.url}/brand/netquoo-logo-blue.png`,
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.email ? { email: site.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
    areaServed: communes.map((c) => ({ '@type': 'City', name: c.name })),
    employee: { '@type': 'Person', name: site.owner.name, jobTitle: site.owner.role },
    priceRange: '€€',
  };
}
