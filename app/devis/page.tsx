import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { QuoteForm } from '@/components/QuoteForm';
import { emailHref, phoneHref, site } from '@/config/site';
import { communes } from '@/data/communes';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Devis de nettoyage gratuit sous 24 h',
  description: `Demandez votre devis de nettoyage professionnel gratuit et sans engagement : bureaux, commerces, cabinets médicaux, vitres, fin de chantier, entrepôts. Montarnaud et ${site.radiusKm} km alentour, réponse ${site.quoteDelay}.`,
  path: '/devis',
});

const nextSteps = [
  {
    icon: FileText,
    title: 'Nous étudions votre demande',
    text: `Un interlocuteur dédié prend connaissance de vos besoins et revient vers vous ${site.quoteDelay}.`,
  },
  {
    icon: CalendarCheck,
    title: 'Visite d’évaluation offerte',
    text: 'Si besoin, nous passons dans vos locaux pour comprendre vos attentes, vos horaires et vos contraintes d’accès.',
  },
  {
    icon: BadgeCheck,
    title: 'Vous recevez un devis clair',
    text: 'Une proposition écrite et adaptée à vos locaux, que vous êtes libre d’accepter ou non.',
  },
];

const commitments = [
  { icon: ShieldCheck, label: 'Devis gratuit et sans engagement' },
  { icon: CalendarCheck, label: 'Visite d’évaluation offerte' },
  { icon: Clock, label: `Réponse ${site.quoteDelay}` },
  { icon: UserCheck, label: 'Un interlocuteur unique' },
];

const faq = [
  {
    q: 'Le devis est-il vraiment gratuit ?',
    a: 'Oui. Le devis comme la visite d’évaluation de vos locaux sont gratuits et ne vous engagent à rien.',
  },
  {
    q: 'Sous quel délai allez-vous me répondre ?',
    a: `Nous revenons vers vous ${site.quoteDelay} après réception de votre demande, pour échanger sur vos besoins et, si nécessaire, convenir d’une visite.`,
  },
  {
    q: 'Intervenez-vous dans ma commune ?',
    a: `Netquoo est basée à Montarnaud et intervient dans un rayon de ${site.radiusKm} km, soit ${communes.length} communes. La liste complète est disponible sur notre page zones d’intervention.`,
    link: { href: '/zones-intervention', label: 'Voir les zones d’intervention' },
  },
  {
    q: 'Pouvez-vous intervenir en dehors des heures de bureau ?',
    a: `Oui. Nos horaires : ${site.hours.charAt(0).toLowerCase()}${site.hours.slice(1)}.`,
  },
  {
    q: 'J’ai besoin de plusieurs prestations, comment faire ?',
    a: 'Choisissez « Plusieurs prestations » dans le formulaire et détaillez vos besoins dans le message : nous en tiendrons compte pour établir votre devis.',
  },
];

/** Squelette affiché le temps que le formulaire (qui lit l'URL) s'hydrate. */
function QuoteFormSkeleton() {
  return (
    <div role="status" aria-label="Chargement du formulaire de devis">
      <div className="animate-pulse" aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-100" />
          <div className="h-3 w-24 rounded-full bg-slate-100" />
          <div className="h-1 flex-1 rounded-full bg-slate-100" />
          <div className="h-8 w-8 rounded-full bg-slate-100" />
          <div className="h-3 w-24 rounded-full bg-slate-100" />
        </div>
        <div className="mt-8 h-3 w-20 rounded-full bg-brand-100" />
        <div className="mt-3 h-7 w-2/3 rounded-xl bg-slate-100" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-16 rounded-2xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
        <div className="mt-8 h-14 rounded-2xl border border-slate-100 bg-slate-50" />
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-[52px] rounded-xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      </div>
      <noscript>
        <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
          Le formulaire de devis nécessite JavaScript. Activez-le dans votre navigateur pour nous envoyer votre demande.
        </p>
      </noscript>
    </div>
  );
}

export default function DevisPage() {
  return (
    <>
      <section className="bg-mesh relative overflow-hidden">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]"
          aria-hidden="true"
        />
        <div className="container relative pb-16 pt-6 md:pb-24 md:pt-10">
          <Breadcrumbs items={[{ label: 'Demande de devis', href: '/devis' }]} />

          <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            {/* ---------- Colonne principale : accroche + formulaire ---------- */}
            <div className="lg:col-span-7">
              <header className="animate-fade-up">
                <span className="eyebrow">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Devis gratuit · sans engagement
                </span>
                <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] sm:text-5xl lg:text-[56px]">
                  Votre devis de nettoyage gratuit <span className="text-gradient">sous 24&nbsp;h</span>
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                  Décrivez vos locaux en 2 minutes : nous revenons vers vous {site.quoteDelay} avec une proposition claire, pensée pour votre
                  activité et vos horaires.
                </p>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {commitments.slice(0, 3).map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(10,22,51,0.04)] backdrop-blur"
                    >
                      <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" /> {label}
                    </li>
                  ))}
                </ul>
              </header>

              <div className="card relative mt-10 p-5 shadow-lift sm:p-8 md:p-10">
                <Suspense fallback={<QuoteFormSkeleton />}>
                  <QuoteForm />
                </Suspense>
              </div>
            </div>

            {/* ---------- Colonne latérale : réassurance ---------- */}
            <aside className="space-y-6 lg:col-span-5" aria-label="Informations sur votre demande de devis">
              <div className="card p-6 sm:p-8">
                <h2 className="text-xl font-bold">Et après votre demande ?</h2>
                <ol className="mt-6 space-y-6">
                  {nextSteps.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="relative flex gap-4">
                      {i < nextSteps.length - 1 && (
                        <span className="absolute left-[21px] top-12 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-brand-200 to-transparent" aria-hidden="true" />
                      )}
                      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                      </span>
                      <div>
                        <h3 className="font-semibold leading-snug">{title}</h3>
                        <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-navy relative overflow-hidden rounded-3xl p-6 text-white shadow-lift sm:p-8">
                <div className="bg-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                      <Handshake className="h-5 w-5 text-brand-200" aria-hidden="true" />
                    </span>
                    <h2 className="text-xl font-bold text-white">Nos engagements</h2>
                  </div>
                  <ul className="mt-6 space-y-3.5">
                    {commitments.map(({ label }) => (
                      <li key={label} className="flex items-start gap-3 text-[15px] text-brand-50">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aqua/20 text-aqua">
                          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="card p-6 sm:p-8">
                <h2 className="text-xl font-bold">{phoneHref || emailHref ? 'Nous contacter' : 'Infos pratiques'}</h2>
                <ul className="mt-5 space-y-4 text-[15px]">
                  {phoneHref && (
                    <li>
                      <a href={phoneHref} className="group flex items-center gap-3 font-semibold text-ink hover:text-brand-700">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                          <Phone className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        {site.phone}
                      </a>
                    </li>
                  )}
                  {emailHref && (
                    <li>
                      <a href={emailHref} className="group flex items-center gap-3 break-all font-semibold text-ink hover:text-brand-700">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                          <Mail className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        {site.email}
                      </a>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Clock className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">Horaires</p>
                      <p className="mt-0.5 leading-relaxed text-slate-600">{site.hours}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">Zone d’intervention</p>
                      <p className="mt-0.5 leading-relaxed text-slate-600">
                        {site.address.street ? `${site.address.street}, ` : ''}
                        {site.address.postalCode} {site.address.city} et {site.radiusKm} km alentour, soit {communes.length} communes desservies.
                      </p>
                      <Link
                        href="/zones-intervention"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
                      >
                        Voir les zones d’intervention <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------- Questions fréquentes ---------- */}
      <section className="pb-20 pt-4 md:pb-28" aria-labelledby="faq-devis">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="eyebrow">Questions fréquentes</span>
              <h2 id="faq-devis" className="mt-4 text-3xl font-extrabold md:text-4xl">
                Tout savoir sur votre devis
              </h2>
            </div>
            <div className="mt-10 space-y-3">
              {faq.map(({ q, a, link }) => (
                <details key={q} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left font-semibold text-ink transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25">
                    {q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="px-6 pb-6 text-[15px] leading-relaxed text-slate-600">
                    <p>{a}</p>
                    {link && (
                      <Link href={link.href} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-900">
                        {link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }}
      />
    </>
  );
}
