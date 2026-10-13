import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AppWindow,
  Armchair,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarCheck,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Coffee,
  DoorOpen,
  Droplets,
  Eye,
  FileText,
  Forklift,
  Frame,
  HardHat,
  HeartPulse,
  KeyRound,
  Layers,
  LayoutGrid,
  MapPin,
  Monitor,
  Package,
  PaintRoller,
  Phone,
  Plus,
  Repeat,
  ShieldCheck,
  Shirt,
  ShowerHead,
  Sparkles,
  Stethoscope,
  Store,
  Sun,
  Trash2,
  UserCheck,
  Users,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner } from '@/components/CtaBanner';
import { JsonLd } from '@/components/JsonLd';
import { SectionHeading } from '@/components/SectionHeading';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { getServiceContent, type ContentIcon } from '@/content/services-content';
import { communes, communePath } from '@/data/communes';
import { getService, services, servicePath } from '@/data/services';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  const content = getServiceContent(slug);
  if (!service || !content) return {};
  return pageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: servicePath(service),
    image: service.image,
  });
}

/** Pictogrammes du contenu éditorial → icônes lucide */
const icons: Record<ContentIcon, LucideIcon> = {
  monitor: Monitor,
  users: Users,
  coffee: Coffee,
  droplets: Droplets,
  layers: Layers,
  door: DoorOpen,
  store: Store,
  shirt: Shirt,
  package: Package,
  armchair: Armchair,
  stethoscope: Stethoscope,
  window: AppWindow,
  frame: Frame,
  sun: Sun,
  wind: Wind,
  paint: PaintRoller,
  trash: Trash2,
  forklift: Forklift,
  wrench: Wrench,
  shower: ShowerHead,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  repeat: Repeat,
  clock: Clock,
  zap: Zap,
  sparkles: Sparkles,
  shield: ShieldCheck,
  eye: Eye,
  heart: HeartPulse,
  key: KeyRound,
  'hard-hat': HardHat,
  building: Building2,
  grid: LayoutGrid,
  clipboard: ClipboardCheck,
};

// Communes mises en avant : Montarnaud puis les 12 plus peuplées du rayon d’intervention
const featuredCommunes = [
  ...communes.filter((c) => c.slug === 'montarnaud'),
  ...[...communes]
    .filter((c) => c.slug !== 'montarnaud')
    .sort((a, b) => b.population - a.population)
    .slice(0, 12),
];

const [hoursMain, hoursExtra] = site.hours.split(' · ');

/** Encart CTA intermédiaire (même style que CtaInline, avec le service présélectionné dans le devis). */
function ServiceCtaInline({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <div className="card flex flex-col items-start gap-6 bg-gradient-to-br from-brand-50 via-white to-white p-7 md:flex-row md:items-center md:justify-between md:p-9">
      <div className="flex items-start gap-4">
        <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow sm:grid">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xl font-bold text-ink">{title}</p>
          <p className="mt-1.5 text-slate-600">{text}</p>
        </div>
      </div>
      <Link href={href} className="btn-primary shrink-0">
        Demander un devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  const content = getServiceContent(slug);
  if (!service || !content) notFound();

  const path = servicePath(service);
  const quoteHref = `/devis?service=${service.slug}`;
  const others = services.filter((s) => s.slug !== service.slug);
  const showExtraTile = content.included.length % 3 !== 0;

  const facts = [
    {
      icon: MapPin,
      label: 'Zone',
      value: `${communes.length} communes à moins de ${site.radiusKm} km`,
      sub: 'Au départ de Montarnaud',
    },
    { icon: Clock, label: 'Horaires', value: hoursMain, sub: hoursExtra ? hoursExtra.charAt(0).toUpperCase() + hoursExtra.slice(1) : undefined },
    { icon: FileText, label: 'Devis', value: `Gratuit, ${site.quoteDelay}`, sub: 'Sans engagement' },
    { icon: UserCheck, label: 'Suivi', value: 'Un interlocuteur unique', sub: 'Pour ajuster la prestation à tout moment' },
  ];

  return (
    <>
      {/* HERO */}
      <section className="bg-mesh relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container relative pb-20 pt-6 md:pb-24 md:pt-10">
          <Breadcrumbs
            items={[
              { label: 'Services', href: '/services' },
              { label: service.title, href: path },
            ]}
          />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="animate-fade-up">
              <span className="eyebrow">
                <ServiceIcon name={service.icon} className="h-3.5 w-3.5" aria-hidden="true" /> Montarnaud · rayon de{' '}
                {site.radiusKm} km
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl xl:text-[56px]">{service.h1}</h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">{content.intro[0]}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={quoteHref} className="btn-primary !px-7 !py-4 text-base">
                  Demander un devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {phoneHref ? (
                  <a href={phoneHref} className="btn-outline !px-7 !py-4 text-base">
                    <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
                  </a>
                ) : (
                  <a href="#prestations" className="btn-outline !px-7 !py-4 text-base">
                    Voir les prestations incluses
                  </a>
                )}
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                <li className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" /> Réponse {site.quoteDelay}
                </li>
                <li className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Gratuit et sans engagement
                </li>
                <li className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" /> Basés à Montarnaud
                </li>
              </ul>
            </div>

            <div className="relative isolate">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-brand-200/70 via-sky-100 to-aqua/30 blur-3xl"
              />
              <div className="overflow-hidden rounded-4xl border-4 border-white bg-brand-50 shadow-lift">
                <Image
                  src={service.image}
                  alt={content.imageAlt}
                  width={1200}
                  height={900}
                  priority
                  sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="card absolute -bottom-7 left-4 right-4 flex items-center gap-3.5 px-5 py-4 sm:left-6 sm:right-auto">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">Interventions selon vos horaires</p>
                  <p className="text-xs text-slate-500">Tôt le matin, le soir ou le week-end sur demande</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EN BREF */}
      <section className="py-20 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
          <div>
            <span className="eyebrow">En bref</span>
            <h2 className="mt-4 text-3xl font-extrabold md:text-4xl md:leading-[1.15]">
              Un {content.keyword} sur mesure, à Montarnaud et alentours
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{content.intro[1]}</p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="card p-6">
                <dt className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <f.icon className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  {f.label}
                </dt>
                <dd className="mt-3 font-bold leading-snug text-ink">{f.value}</dd>
                {f.sub && <dd className="mt-1 text-sm leading-snug text-slate-500">{f.sub}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* PRESTATIONS INCLUSES */}
      <section id="prestations" className="section scroll-mt-20 bg-sky-50">
        <div className="container">
          <SectionHeading
            eyebrow="Prestations incluses"
            title={`Ce que comprend notre ${content.keyword}`}
            text={content.includedIntro}
          />
          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {content.included.map((group) => {
              const Icon = icons[group.icon];
              return (
                <li key={group.zone} className="card p-7">
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-bold">{group.zone}</h3>
                  </div>
                  <ul className="mt-6 space-y-3.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-600">
                        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
            {showExtraTile && (
              <li className="flex flex-col justify-between gap-6 rounded-3xl border border-dashed border-brand-300 bg-white/60 p-7">
                <div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                    <Plus className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">Un besoin spécifique ?</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                    Le cahier des charges est établi avec vous : ajoutez ou retirez des tâches selon vos locaux et vos
                    priorités.
                  </p>
                </div>
                <Link href={quoteHref} className="btn-primary self-start">
                  Demander un devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            )}
          </ul>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
            Liste indicative : le périmètre définitif est validé avec vous et détaillé dans le devis.
          </p>
        </div>
      </section>

      {/* FRÉQUENCES */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Fréquences et formules"
            title={content.frequenciesTitle}
            text={content.frequenciesIntro}
          />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.frequencies.map((f) => {
              const Icon = icons[f.icon];
              return (
                <li key={f.label} className="card group relative overflow-hidden p-6 md:p-7">
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 to-aqua opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{f.label}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{f.text}</p>
                </li>
              );
            })}
          </ul>
          <p className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-2 text-center text-sm text-slate-500">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span>{site.hours}</span>
          </p>
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="section bg-sky-50">
        <div className="container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="Méthode"
              title={`Notre méthode de ${content.keyword}`}
              text="Une organisation rigoureuse, étape par étape, pour un résultat constant et un suivi transparent."
            />
            <Link href={quoteHref} className="btn-primary mt-8">
              Demander un devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute bottom-10 top-10 hidden w-px sm:left-12 md:left-[3.25rem] bg-gradient-to-b from-brand-300 via-brand-200 to-transparent sm:block"
            />
            <ol className="relative space-y-5">
              {content.method.map((step, i) => (
                <li key={step.title} className="card relative flex gap-5 p-6 md:p-7">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow-glow">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* BÉNÉFICES */}
      <section className="bg-navy relative overflow-hidden py-20 md:py-28">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-100">
              Les bénéfices
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-white md:text-[44px] md:leading-[1.1]">
              Pourquoi confier votre {content.keyword} à Netquoo ?
            </h2>
          </div>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.benefits.map((b) => {
              const Icon = icons[b.icon];
              return (
                <li
                  key={b.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur transition-colors hover:bg-white/[0.1]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-aqua ring-1 ring-white/15">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-white">{b.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-brand-100/80">{b.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CTA + POUR QUI + COMMUNES */}
      <section className="section">
        <div className="container">
          <ServiceCtaInline title={content.cta.inlineTitle} text={content.cta.inlineText} href={quoteHref} />

          <div className="mt-20 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="eyebrow">Pour qui ?</span>
              <h2 className="mt-4 text-3xl font-extrabold md:text-4xl md:leading-[1.15]">
                À qui s’adresse notre {content.keyword} ?
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{content.audience}</p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {service.clients.map((client) => (
                  <li
                    key={client}
                    className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3.5 font-semibold text-ink shadow-soft"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {client}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card relative overflow-hidden p-7 md:p-9">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
              <div className="relative">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
                  <MapPin className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-bold md:text-3xl">Service disponible dans ces communes</h2>
                <p className="mt-3 leading-relaxed text-slate-600">
                  Notre {content.keyword} est proposé à Montarnaud et dans les {communes.length} communes situées à moins
                  de {site.radiusKm} km, notamment :
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {featuredCommunes.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={communePath(c)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                          c.slug === 'montarnaud'
                            ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
                            : 'border-brand-100 bg-white text-ink hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        {c.slug === 'montarnaud' && <MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/zones-intervention"
                  className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-900"
                >
                  Voir toutes nos zones d’intervention <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTRES SERVICES */}
      <section className="section bg-sky-50">
        <div className="container">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" eyebrow="Autres services" title="Nos autres prestations de nettoyage" />
            <Link href="/services" className="btn-outline self-start md:self-auto">
              Tous nos services <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={servicePath(o)}
                  className="card group flex h-full items-start gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <ServiceIcon name={o.icon} className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">{o.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-slate-600">{o.short}</p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-brand-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-700"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
            <li>
              <div className="bg-navy flex h-full flex-col justify-between gap-5 rounded-3xl p-6 text-white shadow-lift">
                <div>
                  <h3 className="text-lg font-bold text-white">Plusieurs besoins ?</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-brand-100/85">
                    Regroupez vos prestations dans un seul contrat, avec un seul interlocuteur.
                  </p>
                </div>
                <Link href={quoteHref} className="btn-white self-start !py-2.5">
                  Demander un devis <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title={`Questions fréquentes sur le ${content.keyword}`}
              text="Vous ne trouvez pas votre réponse ? Décrivez-nous votre besoin, nous revenons vers vous rapidement."
            />
            <Link href={quoteHref} className="btn-outline mt-8">
              Poser ma question <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="space-y-4">
            {content.faq.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="card group overflow-hidden transition-shadow open:shadow-lift"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-6 transition-colors hover:bg-brand-50/50 md:px-7 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold leading-snug text-ink md:text-lg">{item.q}</h3>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-600 group-open:text-white">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-slate-600 md:px-7">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title={content.cta.bannerTitle} text={content.cta.bannerText} cta="Demander mon devis gratuit" href={quoteHref} />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${site.url}${path}#service`,
          name: service.h1,
          serviceType: service.title,
          description: content.metaDescription,
          url: `${site.url}${path}`,
          image: `${site.url}${service.image}`,
          provider: {
            '@type': 'LocalBusiness',
            '@id': `${site.url}/#entreprise`,
            name: site.name,
            url: site.url,
          },
          areaServed: [
            { '@type': 'City', name: 'Montarnaud' },
            {
              '@type': 'GeoCircle',
              geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
              geoRadius: site.radiusKm * 1000,
            },
          ],
          audience: { '@type': 'BusinessAudience', audienceType: service.clients.join(', ') },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
    </>
  );
}
