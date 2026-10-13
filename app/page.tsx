import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Leaf,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Rocket,
  SearchCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { AboutOwner } from '@/components/AboutOwner';
import { CtaBanner } from '@/components/CtaBanner';
import { JsonLd } from '@/components/JsonLd';
import { SectionHeading } from '@/components/SectionHeading';
import { ServiceIcon } from '@/components/ServiceIcon';
import { phoneHref, site } from '@/config/site';
import { services, servicePath, type Service } from '@/data/services';
import { communes, communePath, type Commune } from '@/data/communes';
import { pageMetadata } from '@/lib/seo';

export const metadata = {
  ...pageMetadata({
    title: 'Société de nettoyage pour entreprises à Montarnaud (34)',
    description:
      'Nettoyage professionnel pour entreprises à Montarnaud et à 20 km : bureaux, commerces, cabinets médicaux, vitres, fin de chantier. Devis gratuit sous 24 h.',
    path: '/',
  }),
  // Le modèle « %s | Netquoo » du layout ne s'applique pas à la page racine
  title: { absolute: 'Netquoo | Société de nettoyage pour entreprises à Montarnaud' },
};

/* -------------------------------------------------------------------------- */
/*                                   Données                                  */
/* -------------------------------------------------------------------------- */

const reassurance: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileText, title: 'Devis gratuit', text: `Clair, détaillé, ${site.quoteDelay}` },
  { icon: UserRound, title: 'Interlocuteur unique', text: 'Une personne dédiée à votre site' },
  { icon: CalendarClock, title: 'Horaires flexibles', text: 'Tôt le matin, le soir ou le week-end' },
  { icon: ClipboardCheck, title: 'Contrôle qualité', text: 'Des vérifications régulières sur place' },
];

/** Mise en page de la bento grid, par service. */
const bento: Record<string, { className: string; variant: 'feature' | 'image' | 'navy' | 'light'; alt: string }> = {
  'nettoyage-bureaux': {
    className: 'md:col-span-2 lg:row-span-2',
    variant: 'feature',
    alt: 'Agente d’entretien en tenue bleu marine nettoyant un écran d’ordinateur dans des bureaux lumineux',
  },
  'nettoyage-commerces': {
    className: '',
    variant: 'image',
    alt: 'Agente passant la serpillière dans une boutique de vêtements avant l’ouverture',
  },
  'nettoyage-cabinets-medicaux': {
    className: '',
    variant: 'image',
    alt: 'Agente gantée désinfectant les fauteuils de la salle d’attente d’un cabinet médical',
  },
  'nettoyage-vitres': {
    className: '',
    variant: 'navy',
    alt: 'Laveur de vitres sur une échelle nettoyant la façade vitrée d’un immeuble de bureaux',
  },
  'nettoyage-fin-de-chantier': {
    className: '',
    variant: 'image',
    alt: 'Agente aspirant les poussières de chantier dans un local neuf aux cloisons vitrées',
  },
  'nettoyage-entrepots': {
    className: 'md:col-span-2 lg:col-span-1',
    variant: 'light',
    alt: 'Autolaveuse autoportée nettoyant le sol d’un entrepôt logistique',
  },
};

const engagements: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserRound,
    title: 'Un interlocuteur unique',
    text: 'Une seule personne connaît vos locaux, vos attentes et vos contraintes. Vous savez toujours qui appeler, et elle vous répond.',
  },
  {
    icon: GraduationCap,
    title: 'Une équipe formée',
    text: 'Nous formons nos agents aux bons gestes, aux produits et aux protocoles propres à chaque type de locaux, du bureau au cabinet médical.',
  },
  {
    icon: Leaf,
    title: 'Des produits adaptés et responsables',
    text: 'Nous choisissons des produits adaptés à chaque surface et privilégions, dès que possible, des solutions plus respectueuses de l’environnement.',
  },
  {
    icon: CalendarClock,
    title: 'Des horaires qui suivent les vôtres',
    text: 'Nous intervenons en dehors de vos heures d’ouverture — tôt le matin, en soirée ou le week-end — pour ne jamais gêner votre activité.',
  },
  {
    icon: ClipboardCheck,
    title: 'Un contrôle qualité régulier',
    text: 'Nous suivons un cahier des charges établi avec vous et réalisons des contrôles réguliers sur site pour une qualité constante dans la durée.',
  },
  {
    icon: FileText,
    title: 'Un devis clair, sans surprise',
    text: 'Chaque prestation et sa fréquence sont détaillées noir sur blanc. Vous savez exactement ce qui est fait, quand, et pour quel montant.',
  },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MessageSquare,
    title: 'Vous nous décrivez vos besoins',
    text: `En 2 minutes via notre formulaire${site.phone ? ' ou par téléphone' : ''} : type de locaux, surface approximative, fréquence souhaitée.`,
  },
  {
    icon: SearchCheck,
    title: 'Visite d’évaluation gratuite',
    text: 'Si vos locaux le nécessitent, nous nous déplaçons gratuitement pour comprendre vos contraintes et définir les priorités avec vous.',
  },
  {
    icon: FileText,
    title: 'Votre devis détaillé',
    text: `Dès que nous avons les éléments, vous recevez ${site.quoteDelay} une proposition claire, prestation par prestation, sans engagement.`,
  },
  {
    icon: Rocket,
    title: 'Mise en place et suivi',
    text: 'Nous démarrons à la date convenue, puis votre interlocuteur assure le suivi et les contrôles qualité. Les prestations évoluent avec vos besoins.',
  },
];

const montarnaud = communes.find((c) => c.slug === 'montarnaud');
const nearest = communes.filter((c) => c.slug !== 'montarnaud').slice(0, 8);
const biggest = [...communes]
  .filter((c) => c.slug !== 'montarnaud' && !nearest.includes(c))
  .sort((a, b) => b.population - a.population)
  .slice(0, 8);

const weekHours = (() => {
  const h = site.hours.split(' · ')[0];
  return h.charAt(0).toLowerCase() + h.slice(1);
})();

const km = (c: Commune) => `${c.distanceKm.toLocaleString('fr-FR')} km`;

const faq: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: 'Dans quelles communes intervenez-vous ?',
    a: `Nous intervenons à Montarnaud et dans toutes les communes situées à ${site.radiusKm} km ou moins, soit ${communes.length} communes : Montpellier, Juvignac, Saint-Jean-de-Védas, Grabels, Pignan, Gignac, Saint-Gély-du-Fesc, Castelnau-le-Lez, Lattes et bien d’autres.`,
    link: { href: '/zones-intervention', label: 'Voir toutes les communes desservies' },
  },
  {
    q: 'Le devis est-il vraiment gratuit ?',
    a: `Oui. Le devis est gratuit et sans engagement. Nous vous l’envoyons ${site.quoteDelay} dès que nous connaissons vos besoins et, si vos locaux le nécessitent, nous nous déplaçons gratuitement pour les évaluer.`,
    link: { href: '/devis', label: 'Demander mon devis gratuit' },
  },
  {
    q: 'Pouvez-vous intervenir en dehors des heures de bureau ?',
    a: `Oui, c’est même ce que nous recommandons pour ne pas perturber votre activité : nous intervenons tôt le matin, en soirée ou le week-end sur demande. Horaires habituels : ${weekHours}.`,
  },
  {
    q: 'À quelle fréquence pouvez-vous intervenir ?',
    a: 'Selon vos besoins : de façon ponctuelle (fin de chantier, remise en état, grand nettoyage) ou régulière (quotidienne, plusieurs fois par semaine, hebdomadaire ou mensuelle). La fréquence est définie avec vous selon la surface, la fréquentation et la nature de vos locaux.',
  },
  {
    q: 'Fournissez-vous le matériel et les produits ?',
    a: 'Oui. Nous venons avec le matériel et les produits adaptés à vos surfaces, en privilégiant des solutions plus respectueuses de l’environnement chaque fois que c’est possible. La fourniture des consommables (papier, savon, sacs poubelle) peut être étudiée lors du devis.',
  },
  {
    q: 'Quels types de locaux prenez-vous en charge ?',
    a: 'Bureaux et locaux tertiaires, commerces, cabinets médicaux et paramédicaux, entrepôts et locaux d’activité, mais aussi le nettoyage de vitres et de fin de chantier. Netquoo s’adresse aux professionnels : TPE, PME, commerçants, professions libérales et entreprises du BTP.',
    link: { href: '/services', label: 'Découvrir nos services' },
  },
];

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <AboutOwner />
      <WhyNetquoo />
      <Method />
      <Zone />
      <Faq />
      <CtaBanner />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <section className="bg-mesh relative -mt-[72px] overflow-hidden pb-16 pt-[104px] md:pb-24 md:pt-[136px]">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      <div className="container relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Texte */}
          <div className="lg:col-span-7">
            <span className="eyebrow motion-safe:animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              Nettoyage professionnel · Hérault (34)
            </span>

            <h1 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] sm:text-5xl lg:text-6xl xl:text-[4rem]">
              Société de nettoyage pour entreprises <span className="text-gradient">à Montarnaud</span> et alentours
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] md:text-xl">
              Bureaux, commerces, cabinets médicaux, vitres, fins de chantier&nbsp;: Netquoo prend soin de vos locaux
              professionnels dans un rayon de {site.radiusKm}&nbsp;km, avec un interlocuteur unique et des horaires qui
              s’adaptent à votre activité.
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

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-medium text-slate-600 motion-safe:animate-fade-up motion-safe:[animation-delay:320ms]">
              {[`Plus de ${site.owner.yearsAtHead} ans d’expérience`, 'Devis gratuit et sans engagement', 'Visite d’évaluation offerte', `Réponse ${site.quoteDelay}`].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3 4.7-4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visuel */}
          <div className="relative motion-safe:animate-fade-up motion-safe:[animation-delay:200ms] lg:col-span-5">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-300/50 via-aqua/25 to-transparent blur-3xl"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-4xl shadow-lift ring-1 ring-brand-100 sm:aspect-[16/10] lg:aspect-[4/5]">
              <Image
                src="/images/hero.webp"
                alt="Agente d’entretien en tenue bleu marine nettoyant un bureau dans un open space lumineux avec vue sur les collines"
                fill
                priority
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[70%_50%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-transparent" />
            </div>

            {/* Badges flottants */}
            <div className="absolute left-3 top-3 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 pr-5 shadow-lift backdrop-blur-md sm:-left-5 sm:top-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                <Clock className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">Devis sous 24&nbsp;h</span>
                <span className="block text-xs text-slate-500">gratuit et sans engagement</span>
              </span>
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 pr-5 shadow-lift backdrop-blur-md sm:-right-4 sm:bottom-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">Rayon de {site.radiusKm}&nbsp;km</span>
                <span className="block text-xs text-slate-500">autour de Montarnaud</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bandeau de réassurance */}
        <ul className="relative mt-16 grid gap-px overflow-hidden rounded-3xl border border-brand-100/80 bg-brand-100/70 shadow-soft sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {reassurance.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4 bg-white/90 p-5 backdrop-blur md:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-sm text-slate-500">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------- Services -------------------------------- */

function Services() {
  return (
    <section id="services" className="section scroll-mt-20">
      <div className="container">
        <SectionHeading
          eyebrow="Nos prestations"
          title={
            <>
              Un nettoyage professionnel <span className="text-gradient">adapté à chaque local</span>
            </>
          }
          text={`Entretien régulier ou intervention ponctuelle : nous adaptons nos méthodes, nos produits et nos horaires à votre activité, partout dans un rayon de ${site.radiusKm} km autour de Montarnaud.`}
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:auto-rows-[minmax(290px,auto)] lg:grid-cols-3 lg:gap-5">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <Link href="/services" className="btn-outline">
            Voir toutes nos prestations <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-sm text-slate-500">
            Un besoin spécifique ?{' '}
            <Link href="/devis" className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600">
              Parlons-en
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Lien « étiré » : toute la carte est cliquable, le nom accessible reste le titre. */
const stretched =
  "after:absolute after:inset-0 after:z-10 after:rounded-3xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-400 focus-visible:after:ring-offset-2";

function ServiceCard({ service: s }: { service: Service }) {
  const layout = bento[s.slug] ?? { className: '', variant: 'light' as const, alt: s.title };

  if (layout.variant === 'feature' || layout.variant === 'image') {
    const feature = layout.variant === 'feature';
    return (
      <article
        className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-3xl p-6 shadow-soft ring-1 ring-brand-100/60 transition-shadow duration-300 hover:shadow-lift md:p-8 ${
          feature ? 'min-h-[440px]' : 'min-h-[320px]'
        } ${layout.className}`}
      >
        <Image
          src={s.image}
          alt={layout.alt}
          fill
          sizes={feature ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
          className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/0" />
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
          <ServiceIcon name={s.icon} className="h-5 w-5" />
        </span>
        <h3 className={`mt-4 font-bold text-white ${feature ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <Link href={servicePath(s)} className={stretched}>
            {s.title}
          </Link>
        </h3>
        <p className={`mt-2 text-white/85 ${feature ? 'max-w-lg md:text-lg' : 'text-[15px]'}`}>{s.short}</p>
        {feature && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {s.clients.map((c) => (
              <li key={c} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur">
                {c}
              </li>
            ))}
          </ul>
        )}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white" aria-hidden="true">
          Découvrir
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </article>
    );
  }

  const navy = layout.variant === 'navy';
  return (
    <article
      className={`group relative isolate flex min-h-[290px] flex-col overflow-hidden rounded-3xl p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift md:p-8 ${
        navy ? 'bg-navy text-white' : 'border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-sky-100'
      } ${layout.className}`}
    >
      <ServiceIcon
        name={s.icon}
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-8 -right-8 -z-10 h-44 w-44 ${navy ? 'text-white/[0.07]' : 'text-brand-500/[0.08]'}`}
        strokeWidth={1.25}
      />
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          navy ? 'bg-white/10 text-brand-200 ring-1 ring-white/20' : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow'
        }`}
      >
        <ServiceIcon name={s.icon} className="h-5 w-5" />
      </span>
      <h3 className={`mt-4 text-xl font-bold ${navy ? 'text-white' : 'text-ink'}`}>
        <Link href={servicePath(s)} className={stretched}>
          {s.title}
        </Link>
      </h3>
      <p className={`mt-2 text-[15px] ${navy ? 'text-brand-100/85' : 'text-slate-600'}`}>{s.short}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {s.clients.slice(0, 3).map((c) => (
          <li
            key={c}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              navy ? 'bg-white/10 text-brand-100 ring-1 ring-white/15' : 'bg-white text-brand-700 ring-1 ring-brand-100'
            }`}
          >
            {c}
          </li>
        ))}
      </ul>
      <span
        className={`mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold ${navy ? 'text-white' : 'text-brand-700'}`}
        aria-hidden="true"
      >
        Découvrir
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}

/* ------------------------------ Pourquoi nous ----------------------------- */

function WhyNetquoo() {
  const [first, ...others] = engagements;
  const FirstIcon = first.icon;
  return (
    <section className="section relative overflow-hidden bg-sky-50">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      <div className="container relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Pourquoi Netquoo"
            title={
              <>
                La propreté de vos locaux, <span className="text-gradient">sans y penser</span>
              </>
            }
            text={`Depuis plus de ${site.owner.yearsAtHead} ans, Netquoo accompagne les professionnels qui veulent des locaux impeccables sans avoir à s’en occuper. Voici ce à quoi nous nous engageons, dès la première intervention.`}
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/devis" className="btn-primary">
              Demander un devis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/a-propos" className="btn-outline">
              Mieux nous connaître
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {/* Carte mise en avant */}
          <div className="card grid overflow-hidden sm:col-span-2 md:grid-cols-2">
            <div className="p-7 md:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                <FirstIcon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-bold">{first.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{first.text}</p>
            </div>
            <div className="relative min-h-[220px]">
              <Image
                src="/images/equipe.webp"
                alt="Trois agents d’entretien en tenue bleu marine souriant devant un immeuble de bureaux, à côté d’un chariot de nettoyage"
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {others.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-7 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Méthode -------------------------------- */

function Method() {
  return (
    <section className="section">
      <div className="container">
        <div className="bg-navy relative overflow-hidden rounded-4xl px-6 py-14 shadow-lift md:px-12 md:py-20">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow !border-white/15 !bg-white/10 !text-brand-100">Notre méthode</span>
              <h2 className="mt-4 text-3xl font-extrabold text-white md:text-[44px] md:leading-[1.1]">
                Quatre étapes simples, de la demande au suivi
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-100/85">
                Pas de rendez-vous interminables ni de contrat flou : une démarche claire pour démarrer vite et sereinement.
              </p>
            </div>

            <div className="relative mt-14">
              <div
                aria-hidden="true"
                className="absolute left-[12.5%] right-[12.5%] top-[46px] hidden h-px bg-gradient-to-r from-brand-400/0 via-brand-300/50 to-brand-400/0 lg:block"
              />
              <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {steps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors hover:bg-white/[0.09]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-glow">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-4xl font-extrabold tracking-tight text-white/15" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-white">
                      <span className="sr-only">Étape {i + 1} : </span>
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-brand-100/80">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
              <Link href="/devis" className="btn-white !px-8 !py-4 text-base">
                Démarrer ma demande de devis <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-brand-100/80">Gratuit, sans engagement, réponse {site.quoteDelay}.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Zone ---------------------------------- */

function CommuneChip({ commune, base = false }: { commune: Commune; base?: boolean }) {
  return (
    <li>
      <Link
        href={communePath(commune)}
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium shadow-sm transition-colors ${
          base
            ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
            : 'border-brand-100 bg-white text-ink hover:border-brand-300 hover:text-brand-700'
        }`}
      >
        {base && <MapPin className="h-3.5 w-3.5" />}
        {commune.name}
        <span className={`text-xs ${base ? 'text-brand-100' : 'text-slate-400'}`}>{base ? 'notre base' : km(commune)}</span>
      </Link>
    </li>
  );
}

function Zone() {
  return (
    <section className="section pt-0 md:pt-0">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Zone d’intervention"
            title={
              <>
                Nettoyage d’entreprise à Montarnaud <span className="text-gradient">et à {site.radiusKm}&nbsp;km à la ronde</span>
              </>
            }
            text={`Basés à Montarnaud, nous intervenons dans les ${communes.length} communes situées à ${site.radiusKm} km ou moins : des portes de Montpellier à la vallée de l’Hérault, en passant par les villages du nord montpelliérain. Une zone volontairement resserrée pour rester proches et réactifs.`}
          />

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Au plus près de Montarnaud</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {montarnaud && <CommuneChip commune={montarnaud} base />}
            {nearest.map((c) => (
              <CommuneChip key={c.slug} commune={c} />
            ))}
          </ul>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Les principales villes desservies</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {biggest.map((c) => (
              <CommuneChip key={c.slug} commune={c} />
            ))}
          </ul>

          <Link
            href="/zones-intervention"
            className="mt-9 inline-flex items-center gap-2 font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600"
          >
            Voir les {communes.length} communes desservies <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-brand-200/50 via-sky-100 to-aqua/20 blur-2xl" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-4xl shadow-lift ring-1 ring-brand-100 lg:aspect-[5/6]">
            <Image
              src="/images/village.webp"
              alt="Village de l’arrière-pays héraultais au pied des collines de garrigue, avec des locaux d’entreprise modernes en premier plan"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lift backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-bold text-ink">
                {site.address.city} ({site.address.postalCode})
              </span>
              <span className="block text-sm text-slate-500">
                Point de départ · {communes.length} communes à {site.radiusKm}&nbsp;km ou moins
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

function Faq() {
  return (
    <section className="section relative overflow-hidden bg-gradient-to-b from-sky-50 to-white">
      <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading
            align="left"
            eyebrow="Questions fréquentes"
            title="Vos questions, nos réponses"
            text="Tout ce que vous devez savoir avant de nous confier l’entretien de vos locaux."
          />
          <div className="card mt-8 bg-gradient-to-br from-brand-50 to-white p-6">
            <p className="font-bold text-ink">Une autre question ?</p>
            <p className="mt-1 text-sm text-slate-600">
              Décrivez-nous votre besoin : nous vous répondons {site.quoteDelay}.
            </p>
            <Link href="/devis" className="btn-primary mt-5 w-full sm:w-auto">
              Nous contacter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-8">
          {faq.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group rounded-3xl border border-brand-100/80 bg-white shadow-soft transition-shadow open:shadow-lift [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-3xl p-6 text-left text-lg font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 md:px-8">
                {f.q}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-all duration-300 group-open:rotate-45 group-open:bg-brand-600 group-open:text-white group-open:ring-brand-600">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
              </summary>
              <div className="-mt-1 px-6 pb-6 leading-relaxed text-slate-600 md:px-8 md:pb-7">
                <p>{f.a}</p>
                {f.link && (
                  <Link
                    href={f.link.href}
                    className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800"
                  >
                    {f.link.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
