import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock, MapPin, Phone, Radar, Search, Users } from 'lucide-react';
import { AreaMap } from '@/components/AreaMap';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner, CtaInline } from '@/components/CtaBanner';
import { JsonLd } from '@/components/JsonLd';
import { phoneHref, site } from '@/config/site';
import { communePath, communes, type Commune } from '@/data/communes';
import { DISTANCE_RINGS, directionPhrase, formatKm, formatNumber, ringIndex } from '@/lib/commune-content';
import { pageMetadata } from '@/lib/seo';

const PATH = '/zones-intervention';

export const metadata = pageMetadata({
  title: `Zones d'intervention autour de Montarnaud (${site.radiusKm} km)`,
  description: `Netquoo nettoie les locaux des entreprises dans ${communes.length} communes à moins de ${site.radiusKm} km de Montarnaud : Montpellier, Gignac, Juvignac, Pignan… Devis gratuit.`,
  path: PATH,
});

const base = communes.find((c) => c.slug === 'montarnaud');
const served = communes.filter((c) => c.slug !== 'montarnaud');
const totalPopulation = communes.reduce((sum, c) => sum + c.population, 0);
const maxMinutes = Math.max(...communes.map((c) => c.driveMinutes));

const rings = DISTANCE_RINGS.map((ring, i) => ({
  ...ring,
  id: `communes-${ring.min}-${ring.max}-km`,
  communes: [
    ...(i === 0 && base ? [base] : []),
    ...served
      .filter((c) => ringIndex(c) === i)
      .sort((x, y) => x.distanceKm - y.distanceKm || x.name.localeCompare(y.name, 'fr')),
  ],
}));

function CommuneCard({ c }: { c: Commune }) {
  const isBase = c.slug === 'montarnaud';
  return (
    <Link
      href={communePath(c)}
      className={`card group flex h-full items-center justify-between gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:p-5 ${
        isBase ? 'border-brand-200 bg-gradient-to-br from-brand-50 to-white' : ''
      }`}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate font-bold text-ink">{c.name}</span>
          {isBase && (
            <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              Notre base
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-500">
          <span>{c.postalCodes.length > 1 ? `${c.postalCodes[0]} – ${c.postalCodes[c.postalCodes.length - 1]}` : c.postalCodes[0]}</span>
          <span aria-hidden="true" className="text-brand-200">
            •
          </span>
          {isBase ? (
            <span>départ des équipes</span>
          ) : (
            <span>
              {formatKm(c.distanceKm)} {c.direction ? <span className="hidden sm:inline">{directionPhrase(c.direction)}</span> : null}
            </span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {!isBase && (
          <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 xl:inline">
            ≈ {c.driveMinutes} min
          </span>
        )}
        <ArrowUpRight className="h-5 w-5 text-brand-400 transition-colors group-hover:text-brand-700" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function ZonesInterventionPage() {
  const stats = [
    { icon: MapPin, value: String(communes.length), label: 'communes desservies' },
    { icon: Radar, value: `${site.radiusKm} km`, label: 'de rayon autour de Montarnaud' },
    { icon: Clock, value: `≈ ${maxMinutes} min`, label: 'de trajet au plus loin (indicatif)' },
    { icon: Users, value: formatNumber(totalPopulation), label: 'habitants dans la zone (INSEE)' },
  ];

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Communes desservies par Netquoo autour de Montarnaud",
    numberOfItems: communes.length,
    itemListElement: [...communes]
      .sort((x, y) => x.distanceKm - y.distanceKm)
      .map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: `${site.url}${communePath(c)}` })),
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-mesh relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="container relative pb-12 pt-6 md:pb-16 md:pt-10">
          <Breadcrumbs items={[{ label: "Zones d'intervention", href: PATH }]} />
          <div className="mt-8 max-w-4xl animate-fade-up lg:mt-10">
            <span className="eyebrow">
              <Radar className="h-3.5 w-3.5" aria-hidden="true" /> Rayon de {site.radiusKm} km · {communes.length} communes
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] sm:text-5xl lg:text-[58px]">
              Zones d&apos;intervention&nbsp;: nettoyage d&apos;entreprises <span className="text-gradient">autour de Montarnaud</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Depuis notre base de Montarnaud, nos équipes entretiennent bureaux, commerces, cabinets médicaux et locaux
              d&apos;activité dans les {communes.length} communes situées à moins de {site.radiusKm}&nbsp;km. Trouvez la vôtre sur la carte
              ou dans la liste, puis demandez votre devis gratuit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/devis" className="btn-primary !px-7 !py-4 text-base">
                Demander un devis gratuit <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="#communes" className="btn-outline !px-7 !py-4 text-base">
                <Search className="h-4 w-4" aria-hidden="true" /> Trouver ma commune
              </Link>
              {phoneHref && (
                <a href={phoneHref} className="btn-outline !px-7 !py-4 text-base">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                </a>
              )}
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 md:gap-4 lg:mt-14 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card flex flex-col p-4 sm:p-5">
                <s.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                <dt className="order-3 mt-1 text-sm leading-snug text-slate-500">{s.label}</dt>
                <dd className="order-2 mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Carte */}
      <section className="pb-16 pt-4 md:pb-24 md:pt-8" aria-labelledby="carte-titre">
        <div className="container grid gap-6 lg:grid-cols-12 lg:gap-8">
          <figure className="card overflow-hidden p-3 sm:p-6 lg:col-span-8">
            <AreaMap variant="full" />
            <figcaption className="sr-only">
              Carte radiale des communes desservies : Montarnaud au centre, cercles tous les 5 km jusqu&apos;à {site.radiusKm} km.
            </figcaption>
          </figure>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="card p-6 sm:p-7">
              <h2 id="carte-titre" className="text-2xl font-extrabold">
                Une zone de {site.radiusKm}&nbsp;km autour de notre base
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Chaque point est une commune desservie, positionné selon ses coordonnées réelles ; sa taille reflète sa
                population. Survolez un point pour voir la distance, cliquez pour ouvrir la page de la commune.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-900 ring-4 ring-brand-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Montarnaud, point de départ des équipes
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex w-5 items-center justify-center gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    <span className="h-3 w-3 rounded-full bg-brand-600" />
                  </span>
                  Commune desservie (taille selon la population)
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-full border border-dashed border-brand-300" />
                  Cercles de distance tous les 5&nbsp;km (à vol d&apos;oiseau)
                </li>
              </ul>
            </div>

            <nav className="card p-6 sm:p-7" aria-label="Communes par distance">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Par distance de Montarnaud</p>
              <ul className="mt-4 space-y-2">
                {rings.map((r) => (
                  <li key={r.id}>
                    <a
                      href={`#${r.id}`}
                      className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-brand-50"
                    >
                      <span className="font-semibold text-ink">{r.label}</span>
                      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        {r.communes.length} commune{r.communes.length > 1 ? 's' : ''}
                        <ArrowRight className="h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Liste des communes */}
      <section id="communes" className="scroll-mt-20 border-t border-brand-100/70 bg-sky-50 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Toutes les communes</span>
            <h2 className="mt-4 text-3xl font-extrabold md:text-[44px] md:leading-[1.1]">
              Les {communes.length} communes où nous intervenons
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Classées par distance à vol d&apos;oiseau depuis Montarnaud. Les temps de trajet sont indicatifs et dépendent de la
              circulation.
            </p>
          </div>

          <div className="mt-14 space-y-14">
            {rings.map((r, i) => (
              <div key={r.id}>
                <div id={r.id} className="scroll-mt-24">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-100 pb-4">
                    <h3 className="text-2xl font-extrabold md:text-3xl">
                      {r.label} <span className="text-gradient">de Montarnaud</span>
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-brand-100">
                      {r.communes.length} commune{r.communes.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {r.communes.map((c) => (
                      <li key={c.slug}>
                        <CommuneCard c={c} />
                      </li>
                    ))}
                  </ul>
                </div>
                {i === 1 && (
                  <CtaInline
                    title="Vos locaux sont dans l'une de ces communes ?"
                    text={`Décrivez-les en deux minutes : devis gratuit et sans engagement, réponse ${site.quoteDelay}.`}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="mx-auto mt-14 max-w-2xl text-center text-slate-600">
            Vos locaux se trouvent juste au-delà de {site.radiusKm}&nbsp;km&nbsp;?{' '}
            <Link href="/devis" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600">
              Contactez-nous
            </Link>{' '}
            : nous vous dirons rapidement si une intervention est possible.
          </p>
        </div>
      </section>

      <CtaBanner
        title="Votre commune est dans notre zone ? Parlons de vos locaux."
        text={`Une équipe locale, basée à Montarnaud, et un devis clair et gratuit ${site.quoteDelay}, sans engagement.`}
        cta="Obtenir mon devis gratuit"
      />

      <JsonLd data={itemListJsonLd} />
    </>
  );
}
