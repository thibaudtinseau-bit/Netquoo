import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarCheck, CircleCheckBig, FileText, House, Inbox, Phone } from 'lucide-react';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { services, servicePath } from '@/data/services';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Demande de devis envoyée',
    description: `Merci ! Votre demande de devis a bien été transmise à ${site.name}. Nous revenons vers vous ${site.quoteDelay}.`,
    path: '/devis/merci',
  }),
  robots: { index: false, follow: true },
};

const nextSteps = [
  {
    icon: FileText,
    title: 'Étude de votre demande',
    text: `Votre interlocuteur dédié prend connaissance de vos besoins et vous recontacte ${site.quoteDelay}.`,
  },
  {
    icon: CalendarCheck,
    title: 'Visite d’évaluation offerte',
    text: 'Si besoin, nous convenons ensemble d’un passage dans vos locaux, sans frais.',
  },
  {
    icon: BadgeCheck,
    title: 'Votre devis détaillé',
    text: 'Vous recevez une proposition claire, gratuite et sans engagement.',
  },
];

export default function DevisMerciPage() {
  return (
    <section className="bg-mesh relative overflow-hidden">
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]"
        aria-hidden="true"
      />
      <div className="container relative pb-20 pt-12 md:pb-28 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up">
            <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow">
              <span className="absolute inset-0 animate-ping rounded-[28px] bg-brand-400/30 [animation-iteration-count:2]" aria-hidden="true" />
              <CircleCheckBig className="relative h-10 w-10" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-8">Demande envoyée</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] md:text-5xl">Merci, votre demande de devis est bien partie !</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
              L’équipe {site.name} a bien reçu votre demande. Nous revenons vers vous <strong className="font-semibold text-ink">{site.quoteDelay}</strong>{' '}
              pour en parler avec vous.
            </p>
          </div>
        </div>

        <div className="card mx-auto mt-12 max-w-4xl p-6 shadow-lift sm:p-10">
          <h2 className="text-center text-xl font-bold md:text-2xl">La suite, étape par étape</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            {nextSteps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
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
          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-brand-50/70 p-4 text-sm leading-relaxed text-brand-900">
            <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p>
              Nous vous répondrons par téléphone ou par email. Pensez à jeter un œil à vos courriers indésirables si vous attendez notre réponse.
              {phoneHref && (
                <>
                  {' '}
                  Une question d’ici là ? Appelez-nous au{' '}
                  <a href={phoneHref} className="inline-flex items-center gap-1 font-semibold text-brand-700 underline underline-offset-4">
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {site.phone}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/services" className="btn-primary !px-7 !py-3.5">
            Découvrir nos services <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className="btn-outline !px-7 !py-3.5">
            <House className="h-4 w-4" aria-hidden="true" /> Retour à l’accueil
          </Link>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Nos prestations de nettoyage</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={servicePath(s)}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-brand-100/70 bg-white/80 p-4 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <ServiceIcon name={s.icon} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] font-semibold text-ink">{s.title}</span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-brand-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
