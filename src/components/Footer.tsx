import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { emailHref, phoneHref, site } from '@/config/site';
import { services, servicePath } from '@/data/services';
import { communes, communePath } from '@/data/communes';

// Communes mises en avant dans le pied de page (les plus peuplées + Montarnaud)
const footerCommunes = [...communes]
  .sort((a, b) => b.population - a.population)
  .slice(0, 11)
  .concat(communes.filter((c) => c.slug === 'montarnaud'))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export function Footer() {
  return (
    <footer className="bg-navy relative overflow-hidden pb-28 pt-16 text-brand-100/80 lg:pb-10">
      <div className="container relative">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-bold text-white">Un devis pour vos locaux ?</p>
            <p className="mt-1">Réponse {site.quoteDelay}, gratuit et sans engagement.</p>
          </div>
          <Link href="/devis" className="btn-white">
            Demander mon devis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 text-sm leading-relaxed">
              Société de nettoyage professionnel pour les entreprises, basée à Montarnaud et active dans un rayon de {site.radiusKm} km.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-300" /> {site.address.street ? `${site.address.street}, ` : ''}{site.address.postalCode} {site.address.city}</li>
              {phoneHref && <li><a href={phoneHref} className="inline-flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-brand-300" /> {site.phone}</a></li>}
              {emailHref && <li><a href={emailHref} className="inline-flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-brand-300" /> {site.email}</a></li>}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Services</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.slug}><Link href={servicePath(s)} className="hover:text-white">{s.title}</Link></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Nettoyage d’entreprise autour de Montarnaud</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm sm:grid-cols-3">
              {footerCommunes.map((c) => (
                <li key={c.slug}><Link href={communePath(c)} className="hover:text-white">{c.name}</Link></li>
              ))}
            </ul>
            <Link href="/zones-intervention" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-white">
              Voir les {communes.length} communes desservies <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <Link href="/a-propos" className="hover:text-white">Pourquoi Netquoo</Link>
            <Link href="/devis" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
