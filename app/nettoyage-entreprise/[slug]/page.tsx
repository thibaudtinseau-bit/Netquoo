import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleCheck,
  Clock,
  Compass,
  Landmark,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Route,
  Ruler,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AreaMap } from '@/components/AreaMap';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner, CtaInline } from '@/components/CtaBanner';
import { JsonLd } from '@/components/JsonLd';
import { SectionHeading } from '@/components/SectionHeading';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { aCommune, communePath, communes, deCommune, getCommune, type Commune } from '@/data/communes';
import { services, servicePath } from '@/data/services';
import {
  directionPhrase,
  epciLabel,
  formatDecimal,
  formatKm,
  formatNumber,
  getCommuneContent,
} from '@/lib/commune-content';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return communes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const commune = getCommune(slug);
  if (!commune) return {};
  const content = getCommuneContent(commune);
  const meta = pageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: communePath(commune),
  });
  // Le titre contient déjà « | Netquoo » : on évite le doublon avec le modèle du layout.
  return { ...meta, title: content.metaTitle.includes(site.name) ? { absolute: content.metaTitle } : content.metaTitle };
}

interface Fact {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
}

function heroFacts(c: Commune, isBase: boolean): Fact[] {
  const cpLabel = c.postalCodes.length > 1 ? 'Codes postaux' : 'Code postal';
  const cpHint = c.postalCodes.length > 1 ? `et ${c.postalCodes.slice(1).join(', ')}` : 'Hérault (34)';
  const population: Fact = {
    icon: Users,
    label: 'Population',
    value: `${formatNumber(c.population)} hab.`,
    hint: 'population légale INSEE',
  };
  const postal: Fact = { icon: MapPin, label: cpLabel, value: c.postalCodes[0], hint: cpHint };
  if (isBase) {
    return [
      { icon: LocateFixed, label: 'Notre base', value: 'Montarnaud', hint: 'départ de toutes nos équipes' },
      { icon: Zap, label: 'Délai de route', value: 'Sur place', hint: 'intervention immédiate possible' },
      postal,
      population,
    ];
  }
  return [
    {
      icon: Navigation,
      label: 'Distance de Montarnaud',
      value: formatKm(c.distanceKm),
      hint: `à vol d'oiseau, ${c.direction ? directionPhrase(c.direction) : ''}`,
    },
    { icon: Clock, label: 'Temps de trajet', value: `≈ ${c.driveMinutes} min`, hint: 'indicatif, selon la circulation' },
    postal,
    population,
  ];
}

export default async function CommunePage({ params }: Props) {
  const { slug } = await params;
  const commune = getCommune(slug);
  if (!commune) notFound();

  const c = commune;
  const isBase = c.slug === 'montarnaud';
  const content = getCommuneContent(c);
  const a = aCommune(c.name);
  const path = communePath(c);
  const quoteHref = `/devis?commune=${c.slug}`;
  const neighbors = c.neighbors.map((s) => getCommune(s)).filter((x): x is Commune => Boolean(x));
  const facts = heroFacts(c, isBase);

  // Mise en valeur de « à <commune> » (ou « du / de <commune> », ou du nom seul) dans le H1
  const needle = [a, deCommune(c.name), c.name].find((n) => content.h1.includes(n));
  const cut = needle ? content.h1.lastIndexOf(needle) : -1;
  const h1 =
    needle && cut >= 0 ? (
      <>
        {content.h1.slice(0, cut)}
        <span className="text-gradient">{needle}</span>
        {content.h1.slice(cut + needle.length)}
      </>
    ) : (
      content.h1
    );

  const ctaAfter = content.sections.length >= 3 ? 1 : 0;

  const ficheRows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: MapPin, label: 'Code INSEE', value: c.insee },
    ...(c.epci ? [{ icon: Landmark, label: 'Intercommunalité', value: epciLabel(c.epci) }] : []),
    { icon: Ruler, label: 'Superficie', value: `${formatDecimal(c.surfaceKm2)} km²` },
    ...(c.direction ? [{ icon: Compass, label: 'Position', value: `${capitalize(directionPhrase(c.direction))} de Montarnaud` }] : []),
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}${path}#service`,
    name: `Nettoyage d'entreprise ${a}`,
    serviceType: 'Nettoyage de locaux professionnels',
    description: content.metaDescription,
    url: `${site.url}${path}`,
    provider: { '@type': 'LocalBusiness', '@id': `${site.url}/#entreprise`, name: site.name, url: site.url },
    areaServed: {
      '@type': 'City',
      name: c.name,
      address: {
        '@type': 'PostalAddress',
        postalCode: c.postalCodes[0],
        addressLocality: c.name,
        addressRegion: site.address.region,
        addressCountry: site.address.country,
      },
      geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lon },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Prestations de nettoyage ${a}`,
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, url: `${site.url}${servicePath(s)}` },
      })),
    },
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-mesh relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="container relative pb-14 pt-6 md:pb-20 md:pt-10">
          <Breadcrumbs
            items={[
              { label: "Zones d'intervention", href: '/zones-intervention' },
              { label: c.name, href: path },
            ]}
          />

          <div className="mt-8 grid items-center gap-12 lg:mt-10 lg:grid-cols-12 lg:gap-14">
            <div className="animate-fade-up lg:col-span-7">
              <span className="eyebrow">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {content.eyebrow}
              </span>
              <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] sm:text-5xl lg:text-[56px]">{h1}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">{content.intro[0]}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={quoteHref} className="btn-primary !px-7 !py-4 text-base">
                  Demander un devis gratuit <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {phoneHref ? (
                  <a href={phoneHref} className="btn-outline !px-7 !py-4 text-base">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                  </a>
                ) : (
                  <Link href="#prestations" className="btn-outline !px-7 !py-4 text-base">
                    Voir nos prestations
                  </Link>
                )}
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                {[
                  `Devis gratuit ${site.quoteDelay}`,
                  'Sans engagement',
                  isBase ? 'Équipes basées sur place' : `Équipe locale à ≈ ${c.driveMinutes} min`,
                ].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <CircleCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="relative pb-8 lg:pb-0">
                <div className="overflow-hidden rounded-4xl shadow-lift ring-1 ring-brand-100">
                  <Image
                    src="/images/village.webp"
                    alt="Village héraultais et petits bâtiments professionnels (photo d'illustration)"
                    width={1600}
                    height={900}
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <div className="card absolute bottom-0 left-4 right-4 flex items-center gap-4 bg-white/95 p-4 backdrop-blur sm:left-6 sm:right-auto sm:min-w-[300px] lg:-bottom-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                    {isBase ? <LocateFixed className="h-5 w-5" aria-hidden="true" /> : <Route className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                      {isBase ? 'Notre base' : `Montarnaud → ${c.name}`}
                    </p>
                    <p className="mt-0.5 font-bold text-ink">
                      {isBase ? 'Départ de toutes nos interventions' : `${formatKm(c.distanceKm)} · environ ${c.driveMinutes} min`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 md:gap-4 lg:mt-16 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="card flex flex-col p-4 sm:p-5">
                <f.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                <dt className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-[13px]">{f.label}</dt>
                <dd className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{f.value}</dd>
                <dd className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">{f.hint}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Prestations                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="prestations" className="section scroll-mt-20">
        <div className="container">
          <SectionHeading eyebrow="Prestations" title={content.servicesTitle} text={content.servicesIntro} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={servicePath(s)}
                  className="card group flex h-full flex-col p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <ServiceIcon name={s.icon} className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{s.short}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    En savoir plus <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Texte + carte de situation                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="pb-20 md:pb-28">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 xl:col-span-8">
            <p className="text-xl leading-relaxed text-ink/80 md:text-[22px] md:leading-relaxed">{content.intro[1]}</p>

            {content.sections.map((s, i) => (
              <Fragment key={s.id}>
                <div className="prose-nq">
                  <h2 id={s.id} className="scroll-mt-24">
                    {s.title}
                  </h2>
                  {s.paragraphs.map((p, j) => (
                    <Fragment key={j}>
                      <p>{p}</p>
                      {j === 0 && s.bullets && s.bullets.length > 0 && (
                        <ul>
                          {s.bullets.map((b) => {
                            const k = b.search(/\s:/);
                            return (
                              <li key={b}>
                                {k > 0 ? (
                                  <>
                                    <strong>{b.slice(0, k)}</strong>
                                    {b.slice(k)}
                                  </>
                                ) : (
                                  b
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </Fragment>
                  ))}
                </div>
                {i === ctaAfter && <CtaInline title={content.ctaInline.title} text={content.ctaInline.text} href={quoteHref} />}
              </Fragment>
            ))}
          </div>

          <aside className="lg:col-span-5 xl:col-span-4" aria-label={`Situation ${a}`}>
            <div className="space-y-5 lg:sticky lg:top-24">
              <figure className="card overflow-hidden p-3 sm:p-4">
                <div className="rounded-2xl bg-white">
                  <AreaMap variant="focus" slug={c.slug} />
                </div>
                <figcaption className="px-2 pb-1 pt-3 text-sm leading-relaxed text-slate-600">{content.mapCaption}</figcaption>
                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 px-2 pb-2 pt-2 text-xs font-medium text-slate-500" aria-hidden="true">
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-900 ring-2 ring-brand-200" /> Montarnaud (base)
                  </li>
                  {!isBase && (
                    <li className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> {c.name}
                    </li>
                  )}
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-aqua" /> Voisines
                  </li>
                </ul>
              </figure>

              <div className="card p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Repères</p>
                <dl className="mt-4 divide-y divide-brand-100/80">
                  {ficheRows.map((r) => (
                    <div key={r.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                      <dt className="w-32 shrink-0 text-sm text-slate-500">{r.label}</dt>
                      <dd className="text-sm font-semibold text-ink">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-navy relative overflow-hidden rounded-3xl p-6 text-white shadow-lift">
                <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
                <div className="relative">
                  <p className="text-lg font-bold leading-snug text-white">Un devis pour vos locaux {a}&nbsp;?</p>
                  <p className="mt-2 text-sm text-brand-100/85">Gratuit, sans engagement, réponse {site.quoteDelay}.</p>
                  <Link href={quoteHref} className="btn-white mt-5 w-full">
                    Demander mon devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {phoneHref && (
                    <a href={phoneHref} className="btn-ghost-light mt-3 w-full">
                      <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Communes voisines                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="section border-y border-brand-100/70 bg-sky-50">
        <div className="container">
          <SectionHeading eyebrow="Communes voisines" title={content.neighborsTitle} text={content.neighborsIntro} />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {neighbors.map((n) => (
              <li key={n.slug}>
                <Link
                  href={communePath(n)}
                  className="card group flex h-full items-center justify-between gap-3 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="min-w-0">
                    <span className="block font-bold text-ink">{n.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {n.slug === 'montarnaud'
                        ? `${n.postalCodes[0]} · notre base`
                        : `${n.postalCodes[0]} · ${formatKm(n.distanceKm)} de Montarnaud`}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-brand-400 transition-colors group-hover:text-brand-700"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Link href="/zones-intervention" className="btn-outline">
              Voir les {communes.length} communes desservies <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="section">
        <div className="container max-w-3xl">
          <SectionHeading eyebrow="Questions fréquentes" title={`Nettoyage d'entreprise ${a} : vos questions`} />
          <div className="mt-10 space-y-3">
            {content.faq.map((f, i) => (
              <details
                key={f.q}
                className="card group overflow-hidden transition-colors open:border-brand-200 [&_summary::-webkit-details-marker]:hidden"
                open={i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left sm:px-6">
                  <h3 className="text-base font-semibold leading-snug text-ink sm:text-[17px]">{f.q}</h3>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-5 pb-6 text-[15px] leading-relaxed text-slate-600 sm:px-6 sm:text-base">{f.a}</div>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Une autre question&nbsp;?{' '}
            <Link href={quoteHref} className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600">
              Écrivez-nous depuis le formulaire de devis
            </Link>
            .
          </p>
        </div>
      </section>

      <CtaBanner title={content.ctaBanner.title} text={content.ctaBanner.text} cta="Demander mon devis gratuit" href={quoteHref} />

      <JsonLd data={faqJsonLd} />
      <JsonLd data={serviceJsonLd} />
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
