import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CircleCheck,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  MessagesSquare,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner } from '@/components/CtaBanner';
import { JsonLd } from '@/components/JsonLd';
import { SectionHeading } from '@/components/SectionHeading';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { getServiceContent } from '@/content/services-content';
import { communes, communePath } from '@/data/communes';
import { services, servicePath, type ServiceIcon as IconName } from '@/data/services';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Services de nettoyage pour entreprises',
  description:
    'Nettoyage de bureaux, commerces, cabinets médicaux, vitres, fin de chantier et entrepôts à Montarnaud et 20 km autour. Devis gratuit sous 24 h ouvrées.',
  path: '/services',
});

/** Exemples de combinaisons de prestations (section « sur mesure »). */
const combos: { icons: [IconName, IconName]; title: string; text: string }[] = [
  {
    icons: ['building', 'sparkles'],
    title: 'Bureaux + vitrerie',
    text: 'Entretien courant de vos bureaux et lavage périodique des vitres, réunis sur un même planning.',
  },
  {
    icons: ['hardhat', 'building'],
    title: 'Fin de chantier + entretien',
    text: 'Remise en état après vos travaux, puis relais en nettoyage régulier dès votre installation.',
  },
  {
    icons: ['warehouse', 'building'],
    title: 'Entrepôt + bureaux',
    text: 'Sols industriels, vestiaires et bureaux administratifs regroupés dans un seul contrat.',
  },
  {
    icons: ['store', 'sparkles'],
    title: 'Commerce + vitrine',
    text: 'Point de vente nettoyé avant l’ouverture et vitrine extérieure entretenue à la fréquence de votre choix.',
  },
];

const steps = [
  {
    icon: FileText,
    title: 'Vous décrivez vos locaux',
    text: `Type de locaux, surface approximative, fréquence souhaitée : le formulaire prend deux minutes. Réponse ${site.quoteDelay}.`,
  },
  {
    icon: MessagesSquare,
    title: 'Nous précisons vos besoins',
    text: 'Un échange téléphonique ou une visite sur place pour définir les tâches, les horaires et les modalités d’accès.',
  },
  {
    icon: ClipboardList,
    title: 'Vous recevez un devis clair',
    text: 'Une proposition détaillée et sans engagement : prestations incluses zone par zone, fréquence et créneaux d’intervention.',
  },
  {
    icon: CalendarCheck,
    title: 'Nous démarrons et suivons',
    text: 'Mise en place à la date convenue, puis un interlocuteur unique pour ajuster la prestation au fil du temps.',
  },
];

// Communes mises en avant : Montarnaud puis les plus peuplées du rayon d’intervention
const featuredCommunes = [
  ...communes.filter((c) => c.slug === 'montarnaud'),
  ...[...communes]
    .filter((c) => c.slug !== 'montarnaud')
    .sort((a, b) => b.population - a.population)
    .slice(0, 9),
];

export default function ServicesPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-mesh relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container relative pb-16 pt-6 md:pb-24 md:pt-10">
          <Breadcrumbs items={[{ label: 'Services', href: '/services' }]} />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="animate-fade-up">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Nettoyage professionnel B2B
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.06] sm:text-5xl md:text-6xl">
                Nos services de nettoyage <span className="text-gradient">pour entreprises</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Bureaux, commerces, cabinets de santé, vitrerie, fin de chantier et entrepôts : Netquoo entretient les
                locaux professionnels à Montarnaud et dans un rayon de {site.radiusKm} km, de l’ouest montpelliérain à la
                vallée de l’Hérault. Une prestation sur mesure, un interlocuteur unique, des interventions calées sur vos
                horaires.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/devis" className="btn-primary !px-7 !py-4 text-base">
                  Demander un devis gratuit <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {phoneHref ? (
                  <a href={phoneHref} className="btn-outline !px-7 !py-4 text-base">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                  </a>
                ) : (
                  <a href="#prestations" className="btn-outline !px-7 !py-4 text-base">
                    Découvrir nos prestations
                  </a>
                )}
              </div>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                <li className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" /> Devis gratuit {site.quoteDelay}
                </li>
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Sans engagement
                </li>
                <li className="inline-flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Un interlocuteur unique
                </li>
              </ul>
            </div>

            <nav aria-label="Accès rapide aux services" className="card relative bg-white/85 p-3 backdrop-blur md:p-4">
              <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {services.length} prestations, un seul interlocuteur
              </p>
              <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={servicePath(s)}
                      className="group flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <ServiceIcon name={s.icon} className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-semibold text-ink">{s.title}</span>
                      <ArrowUpRight
                        className="ml-auto h-4 w-4 shrink-0 text-brand-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-700"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* GRILLE DES SERVICES */}
      <section id="prestations" className="section scroll-mt-20">
        <div className="container">
          <SectionHeading
            eyebrow="Nos prestations"
            title={
              <>
                {services.length} prestations, <span className="text-gradient">une même exigence</span>
              </>
            }
            text="Chaque service dispose de sa page détaillée : tâches incluses, fréquences possibles, méthode d’intervention et réponses à vos questions."
          />
          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const content = getServiceContent(s.slug);
              return (
                <li key={s.slug}>
                  <article className="card group relative flex h-full flex-col overflow-hidden transition duration-300 focus-within:ring-2 focus-within:ring-brand-400 hover:-translate-y-1 hover:shadow-lift">
                    <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                      <Image
                        src={s.image}
                        alt={content?.imageAlt ?? s.title}
                        fill
                        sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                      <span className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft">
                        <ServiceIcon name={s.icon} className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <h3 className="text-xl font-bold">
                        <Link
                          href={servicePath(s)}
                          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                          {s.title}
                        </Link>
                      </h3>
                      <p className="mt-3 leading-relaxed text-slate-600">{s.short}</p>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Pour qui</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {s.clients.map((client) => (
                          <li key={client} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
                            {client}
                          </li>
                        ))}
                      </ul>
                      <span
                        className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-brand-700"
                        aria-hidden="true"
                      >
                        Découvrir la prestation
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* SUR MESURE / MULTI-SERVICES */}
      <section className="section relative overflow-hidden bg-sky-50">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow">Sur mesure</span>
            <h2 className="mt-4 text-3xl font-extrabold md:text-[44px] md:leading-[1.1]">
              Plusieurs besoins ? Un seul contrat, <span className="text-gradient">un seul interlocuteur.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Vos locaux combinent souvent plusieurs usages : des bureaux et un entrepôt, une boutique et sa vitrine, un
              cabinet fraîchement rénové… Plutôt que de multiplier les prestataires, Netquoo regroupe vos besoins dans un
              cahier des charges unique, avec une fréquence propre à chaque zone.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'Un cahier des charges détaillé zone par zone',
                'Des fréquences différentes selon les espaces',
                'Un planning unique et un contact dédié pour le suivi',
                'Des interventions ponctuelles ajoutées à la demande',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/devis" className="btn-primary">
                Composer mon devis sur mesure <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/a-propos" className="btn-outline">
                Pourquoi choisir Netquoo
              </Link>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {combos.map((combo, i) => (
              <li
                key={combo.title}
                className={`card p-6 md:p-7 ${i % 2 === 1 ? 'sm:translate-y-6' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                    <ServiceIcon name={combo.icons[0]} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <Plus className="h-4 w-4 text-brand-300" aria-hidden="true" />
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <ServiceIcon name={combo.icons[1]} className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{combo.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{combo.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DÉROULEMENT */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Comment ça se passe"
            title="De la demande au premier passage, en 4 étapes"
            text="Un démarrage simple et transparent, quelle que soit la prestation choisie."
          />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="card relative p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <step.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-4xl font-extrabold text-brand-100" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>

          {/* Zone d’intervention */}
          <div className="card mt-14 flex flex-col gap-6 bg-gradient-to-br from-brand-50 via-white to-white p-7 md:p-9 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">
                <MapPin className="h-4 w-4" aria-hidden="true" /> Zone d’intervention
              </p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Basés à Montarnaud, présents dans {communes.length} communes
              </h2>
              <p className="mt-3 text-slate-600">
                Toutes nos prestations sont disponibles dans un rayon de {site.radiusKm} km autour de Montarnaud, jusqu’à
                Montpellier et ses communes voisines.
              </p>
            </div>
            <div className="lg:max-w-md">
              <ul className="flex flex-wrap gap-2">
                {featuredCommunes.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={communePath(c)}
                      className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        c.slug === 'montarnaud'
                          ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
                          : 'border-brand-100 bg-white text-ink hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/zones-intervention"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                Voir toutes les zones d’intervention <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="Un besoin de nettoyage pour vos locaux ?"
        text={`Décrivez-nous vos locaux et la prestation souhaitée : nous vous envoyons un devis clair et gratuit ${site.quoteDelay}, sans engagement.`}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Services de nettoyage pour entreprises Netquoo',
          itemListElement: services.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.title,
            url: `${site.url}${servicePath(s)}`,
          })),
        }}
      />
    </>
  );
}
