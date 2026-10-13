import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileCtaBar } from '@/components/MobileCtaBar';
import { JsonLd } from '@/components/JsonLd';
import { site } from '@/config/site';
import { localBusinessJsonLd, ogImage } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Netquoo — Société de nettoyage pour entreprises à Montarnaud',
    template: '%s | Netquoo',
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  openGraph: { siteName: site.name, locale: 'fr_FR', type: 'website', images: [ogImage] },
};

export const viewport: Viewport = {
  themeColor: '#1F4FEA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileCtaBar />
        <JsonLd data={localBusinessJsonLd()} />
      </body>
    </html>
  );
}
