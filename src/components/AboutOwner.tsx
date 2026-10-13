import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { StatCounter } from './StatCounter';
import { site, stats } from '@/config/site';

/** Grille des chiffres de réassurance (src/config/site.ts → stats). */
export function StatsGrid({ dark = false }: { dark?: boolean }) {
  return (
    <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-3xl lg:grid-cols-4 ${dark ? 'bg-white/10' : 'border border-brand-100/80 bg-brand-100/70 shadow-soft'}`}>
      {stats.map((s) => (
        <div key={s.label} className={`flex flex-col p-5 md:p-7 ${dark ? 'bg-brand-950/40' : 'bg-white'}`}>
          <dt className="order-2 mt-2">
            <span className={`block text-sm font-semibold md:text-base ${dark ? 'text-white' : 'text-ink'}`}>{s.label}</span>
            <span className={`mt-1 block text-xs leading-snug md:text-sm ${dark ? 'text-brand-100/70' : 'text-slate-500'}`}>{s.detail}</span>
          </dt>
          <dd className={`order-1 text-4xl font-extrabold tracking-tight md:text-5xl ${dark ? 'text-white' : 'text-gradient'}`}>
            <StatCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Section « Qui sommes-nous » : présentation du dirigeant + chiffres clés. */
export function AboutOwner({ headingLevel = 'h2', showMoreLink = true }: { headingLevel?: 'h2' | 'h3'; showMoreLink?: boolean }) {
  const { owner } = site;
  const Heading = headingLevel;
  return (
    <section id="qui-sommes-nous" className="section scroll-mt-20 overflow-hidden">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-300/50 via-aqua/20 to-transparent blur-3xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-4xl shadow-lift ring-1 ring-brand-100">
              <Image
                src={owner.photo}
                alt={`${owner.name}, ${owner.role.charAt(0).toLowerCase() + owner.role.slice(1)}, en polo bleu marine dans le hall d’un immeuble de bureaux`}
                fill
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-2xl font-extrabold">{owner.name}</p>
                <p className="text-sm text-brand-100">{owner.role}</p>
              </div>
            </div>
            <div className="absolute -right-2 top-6 rounded-2xl border border-white/60 bg-white/90 px-5 py-4 text-center shadow-lift backdrop-blur-md sm:-right-6">
              <p className="text-3xl font-extrabold leading-none text-gradient">+{owner.yearsAtHead}</p>
              <p className="mt-1 text-xs font-semibold leading-tight text-ink">
                ans à la tête
                <br />
                de Netquoo
              </p>
            </div>
          </div>

          {/* Texte */}
          <div className="lg:col-span-7">
            <span className="eyebrow">Qui sommes-nous</span>
            <Heading className="mt-4 text-3xl font-extrabold md:text-[44px] md:leading-[1.1]">
              {owner.name}, plus de {owner.yearsAtHead}&nbsp;ans <span className="text-gradient">au service de la propreté</span> des entreprises
            </Heading>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
              <p>
                Derrière Netquoo, il y a <strong className="text-ink">{owner.name}</strong>, son fondateur. À la tête de la société depuis plus de{' '}
                {owner.yearsAtHead}&nbsp;ans, il a appris à connaître chaque type de local professionnel&nbsp;: open spaces, boutiques,
                cabinets de santé, entrepôts, locaux livrés après travaux.
              </p>
              <p>
                Cette expérience, il la met au service d’une idée simple&nbsp;: un nettoyage soigné, réalisé par une équipe qui connaît vos
                locaux et vos contraintes, avec un interlocuteur qui vous répond. Basée à Montarnaud, Netquoo intervient dans un rayon de{' '}
                {site.radiusKm}&nbsp;km pour rester proche et réactive.
              </p>
            </div>

            <figure className="card mt-8 bg-gradient-to-br from-brand-50 to-white p-6 md:p-7">
              <Quote className="h-7 w-7 text-brand-400" aria-hidden="true" />
              <blockquote className="mt-3 text-lg font-semibold leading-relaxed text-ink md:text-xl">
                «&nbsp;Des locaux propres, c’est une entreprise qui accueille bien ses clients et ses équipes. Mon travail, c’est que vous
                n’ayez plus à y penser.&nbsp;»
              </blockquote>
              <figcaption className="mt-3 text-sm text-slate-500">
                {owner.name}, {owner.role.charAt(0).toLowerCase() + owner.role.slice(1)}
              </figcaption>
            </figure>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/devis" className="btn-primary !px-7 !py-4 text-base">
                Demander mon devis gratuit <ArrowRight className="h-4 w-4" />
              </Link>
              {showMoreLink && (
                <Link href="/a-propos" className="btn-outline !px-7 !py-4 text-base">
                  En savoir plus sur Netquoo
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <StatsGrid />
        </div>
      </div>
    </section>
  );
}
