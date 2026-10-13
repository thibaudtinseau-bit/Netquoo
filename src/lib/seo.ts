import type { Metadata } from 'next';
import { phoneHref, site } from '@/config/site';
import { communes } from '@/data/communes';

/** Métadonnées standard d'une page (canonical + Open Graph). */
export const ogImage = { url: '/og-image.jpg', width: 1200, height: 630, alt: 'Netquoo, société de nettoyage pour entreprises à Montarnaud et 20 km alentour' };

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
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
      images: [ogImage],
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
    ...(phoneHref ? { telephone: phoneHref.replace('tel:', '') } : {}),
    ...(site.email ? { email: site.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(site.address.street ? { streetAddress: site.address.street } : {}),
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lon },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: site.openingHours.days.map((d) => `https://schema.org/${d}`),
      opens: site.openingHours.opens,
      closes: site.openingHours.closes,
    },
    areaServed: communes.map((c) => ({ '@type': 'City', name: c.name })),
    founder: { '@type': 'Person', name: site.owner.fullName, jobTitle: site.owner.role },
    priceRange: '€€',
  };
}
