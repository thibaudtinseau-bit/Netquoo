import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  Leaf,
  MapPin,
  MessageSquare,
  Phone,
  Rocket,
  SearchCheck,
  Timer,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { AboutOwner } from '@/components/AboutOwner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBanner, CtaInline } from '@/components/CtaBanner';
import { SectionHeading } from '@/components/SectionHeading';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { services, servicePath } from '@/data/services';
import { communes } from '@/data/communes';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Qui sommes-nous · Société de nettoyage à Montarnaud',
  description:
    'Netquoo, société de nettoyage pour entreprises à Montarnaud : interlocuteur unique, équipe formée, horaires flexibles et contrôle qualité. Nos engagements.',
  path: '/a-propos',
});

const pillars: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MapPin,
    title: 'Proximité',
    text: `Une zone resserrée à ${site.radiusKm} km autour de Montarnaud, pour connaître le territoire et ses entreprises.`,
  },
  {
    icon: Timer,
    title: 'Réactivité',
    text: `Un devis ${site.quoteDelay} et un interlocuteur joignable quand vous en avez besoin.`,
  },
  {
    icon: Compass,
    title: 'Exigence',
    text: 'Un cahier des charges précis, suivi et contrôlé, intervention après intervention.',
  },
];

const engagements: { icon: LucideIcon; title: string; text: string; points: string[] }[] = [
  {
    icon: UserRound,
    title: 'Un interlocuteur unique',
    text: 'Vous n’avez pas à répéter vos consignes à chaque changement d’équipe : une seule personne suit votre site du premier rendez-vous au quotidien.',
    points: ['Il connaît vos locaux et vos contraintes', 'Il centralise vos demandes et ajustements', 'Il vous rend compte des contrôles'],
  },
  {
    icon: GraduationCap,
    title: 'Une équipe formée et encadrée',
    text: 'Nous formons nos agents aux techniques de nettoyage, au bon usage des produits et aux protocoles spécifiques à chaque type de locaux.',
    points: ['Gestes et méthodes professionnels', 'Protocoles adaptés aux locaux de santé', 'Discrétion et respect de vos espaces'],
  },
  {
    icon: Leaf,
    title: 'Des produits adaptés et plus responsables',
    text: 'Nous sélectionnons des produits adaptés à chaque surface, et privilégions dès que possible des solutions plus respectueuses de l’environnement et des occupants.',
    points: ['Dosages maîtrisés, sans gaspillage', 'Matériel adapté à chaque surface', 'Hygiène et désinfection sans compromis'],
  },
  {
    icon: CalendarClock,
    title: 'Des horaires flexibles',
    text: 'Le nettoyage doit se faire oublier. Nous intervenons en dehors de vos heures d’ouverture pour que vos équipes et vos clients trouvent des locaux nets.',
    points: ['Tôt le matin ou en soirée', 'Le week-end sur demande', 'Fréquence définie avec vous'],
  },
  {
    icon: ClipboardCheck,
    title: 'Un contrôle qualité régulier',
    text: 'La qualité ne se décrète pas, elle se vérifie. Nous contrôlons régulièrement le travail réalisé au regard du cahier des charges établi ensemble.',
    points: ['Points de contrôle sur site', 'Actions correctives rapides', 'Échanges réguliers avec vous'],
  },
  {
    icon: FileText,
    title: 'Un devis clair et détaillé',
    text: 'Chaque prestation, chaque fréquence et chaque zone sont détaillées. Vous savez exactement ce qui est fait, quand, et pour quel montant.',
    points: ['Gratuit et sans engagement', `Envoyé ${site.quoteDelay}`, 'Aucun frais caché'],
  },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MessageSquare,
    title: 'Vous nous décrivez vos besoins',
    text: `Quelques informations suffisent pour commencer : type de locaux, surface approximative, fréquence souhaitée et contraintes horaires. Le formulaire prend 2 minutes${site.phone ? ', et vous pouvez aussi nous appeler' : ''}.`,
  },
  {
    icon: SearchCheck,
    title: 'Visite et évaluation gratuites',
    text: 'Si vos locaux le nécessitent, nous venons les voir, sans frais. C’est l’occasion d’identifier les zones sensibles, les surfaces particulières et vos priorités.',
  },
  {
    icon: FileText,
    title: 'Un devis clair, sans engagement',
    text: `Vous recevez ${site.quoteDelay} une proposition détaillée : prestations, fréquences, horaires d’intervention. Vous prenez le temps de décider.`,
  },
  {
    icon: Rocket,
    title: 'Mise en place et suivi dans la durée',
    text: 'Nous démarrons à la date convenue. Votre interlocuteur assure le suivi, réalise les contrôles qualité et ajuste les prestations quand vos besoins évoluent.',
  },
];

export default function AProposPage() {
  return (
    <>
      {/* ---------------------------------- Hero ---------------------------------- */}
      <section className="bg-mesh relative -mt-[72px] overflow-hidden pb-16 pt-[104px] md:pb-24 md:pt-[128px]">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container relative">
          <Breadcrumbs items={[{ label: 'Qui sommes-nous', href: '/a-propos' }]} />

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="eyebrow motion-safe:animate-fade-up">Qui sommes-nous</span>
              <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.03em] motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-5xl lg:text-[3.6rem]">
                Netquoo, une société de nettoyage <span className="text-gradient">locale et engagée</span> à Montarnaud
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] md:text-xl">
                Implantée à Montarnaud et dirigée par {site.owner.name} depuis plus de {site.owner.yearsAtHead}&nbsp;ans, Netquoo se consacre au
                nettoyage des locaux professionnels dans un rayon de {site.radiusKm}&nbsp;km. Notre conviction&nbsp;: un service de proximité, réactif et soigné, porté
                par des engagements clairs que nous tenons.
              </p>
              <div className="mt-9 flex flex-col gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:240ms] sm:flex-row sm:items-center">
                <Link href="/devis" className="btn-primary !px-8 !py-4 text-base">
                  Devis gratuit <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/services" className="btn-outline !px-8 !py-4 text-base">
                  Nos services
                </Link>
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex items-center justify-center gap-2 px-2 py-3 text-[15px] font-semibold text-ink hover:text-brand-700"
                  >
                    <Phone className="h-4 w-4 text-brand-600" /> {site.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="relative motion-safe:animate-fade-up motion-safe:[animation-delay:200ms] lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-300/50 via-aqua/25 to-transparent blur-3xl"
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-4xl shadow-lift ring-1 ring-brand-100 lg:aspect-[4/5]">
                <Image
                  src="/images/equipe.webp"
                  alt="Trois agents d’entretien en tenue bleu marine souriant devant un immeuble de bureaux, à côté d’un chariot de nettoyage professionnel"
                  fill
                  priority
                  sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 pr-5 shadow-lift backdrop-blur-md sm:-left-5 sm:bottom-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-ink">Basée à Montarnaud</span>
                  <span className="block text-xs text-slate-500">
                    {site.base.postalCode} · Hérault
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- Dirigeant + chiffres clés ------------------------- */}
      <AboutOwner showMoreLink={false} />

      {/* ------------------------------ Notre approche ------------------------------ */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              align="left"
              eyebrow="Notre approche"
              title={
                <>
                  Une entreprise de proximité, <span className="text-gradient">pensée pour les professionnels</span>
                </>
              }
            />
          </div>
          <div className="prose-nq lg:col-span-7">
            <p className="!mt-0">
              <strong>Netquoo est une société de nettoyage professionnel installée à Montarnaud</strong>, entre
              Montpellier et la vallée de l’Hérault. Nous accompagnons les entreprises dans l’entretien de leurs locaux&nbsp;:
              bureaux, commerces, cabinets médicaux et paramédicaux, entrepôts, mais aussi vitrerie et nettoyage de fin de
              chantier.
            </p>
            <p>
              Nous avons fait un choix&nbsp;: <strong>rester local</strong>. En limitant notre zone d’intervention à{' '}
              {site.radiusKm}&nbsp;km autour de Montarnaud, nous passons moins de temps sur la route et plus de temps dans
              vos locaux. Nous restons disponibles, réactifs, et nous connaissons le territoire comme nos clients.
            </p>
            <p>
              Notre ambition est simple&nbsp;: <strong>que vous n’ayez plus à penser à la propreté de vos locaux</strong>.
              Nous définissons ensemble un cahier des charges, nous le respectons, nous le contrôlons, et nous restons
              joignables pour l’ajuster au fil du temps.
            </p>
          </div>
        </div>

        <div className="container mt-14">
          <ul className="grid gap-4 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card flex gap-5 p-7">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold text-ink">{title}</span>
                  <span className="mt-1 block leading-relaxed text-slate-600">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------- Engagements ------------------------------- */}
      <section className="section relative overflow-hidden bg-sky-50">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="container relative">
          <SectionHeading
            eyebrow="Nos engagements"
            title={
              <>
                Six engagements que nous prenons <span className="text-gradient">envers chaque client</span>
              </>
            }
            text="Pas de promesses vagues : voici concrètement ce que nous nous engageons à vous apporter, quel que soit le type ou la taille de vos locaux."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {engagements.map(({ icon: Icon, title, text, points }) => (
              <article key={title} className="card flex flex-col p-7 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift md:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
                <ul className="mt-5 space-y-2 border-t border-brand-100/70 pt-5 text-[15px] text-slate-700">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mx-auto max-w-4xl">
            <CtaInline
              title="Envie de voir ces engagements appliqués à vos locaux ?"
              text={`Visite d’évaluation et devis gratuits, sans engagement. Réponse ${site.quoteDelay}.`}
            />
          </div>
        </div>
      </section>

      {/* --------------------------------- Méthode --------------------------------- */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="Notre méthode"
              title="Une démarche simple et transparente"
              text="De votre première demande au suivi au quotidien, vous savez toujours où vous en êtes et qui s’occupe de vos locaux."
            />
            <Link href="/devis" className="btn-primary mt-8">
              Commencer ma demande <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative lg:col-span-7">
            <div
              aria-hidden="true"
              className="absolute bottom-12 left-[52px] top-12 hidden w-px bg-gradient-to-b from-brand-300 via-brand-200 to-brand-100 sm:block"
            />
            <ol className="relative space-y-4">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="card relative flex flex-col gap-5 p-6 sm:flex-row sm:p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">Étape {i + 1}</p>
                    <h3 className="mt-1 text-xl font-bold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------- Prestations et zone ---------------------------- */}
      <section className="section pt-0 md:pt-0">
        <div className="container">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card p-7 md:p-8 lg:col-span-2">
              <h2 className="text-2xl font-extrabold md:text-3xl">Nos prestations de nettoyage</h2>
              <p className="mt-2 text-slate-600">Des services pensés pour chaque type de locaux professionnels.</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={servicePath(s)}
                      className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-brand-100 hover:bg-brand-50/60"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                        <ServiceIcon name={s.icon} className="h-5 w-5" />
                      </span>
                      <span className="font-semibold text-ink group-hover:text-brand-700">{s.title}</span>
                      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy relative flex flex-col overflow-hidden rounded-3xl p-7 text-white shadow-lift md:p-8">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/20">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="relative mt-5 text-2xl font-extrabold text-white">Notre zone d’intervention</h2>
              <p className="relative mt-2 leading-relaxed text-brand-100/85">
                Montarnaud et les {communes.length} communes situées à {site.radiusKm}&nbsp;km ou moins&nbsp;: Montpellier,
                Juvignac, Grabels, Pignan, Gignac, Saint-Gély-du-Fesc…
              </p>
              <div className="relative mt-auto pt-8">
                <Link href="/zones-intervention" className="btn-white">
                  Voir les {communes.length} communes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="Faisons connaissance autour de vos locaux."
        text={`Décrivez-nous votre besoin : visite d’évaluation et devis gratuits, sans engagement, avec une réponse ${site.quoteDelay}.`}
      />
    </>
  );
}
