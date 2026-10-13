// Contenu des pages « Nettoyage d'entreprise à <commune> ».
//
// 1. Si un texte rédigé existe dans src/content/communes/<slug>.json, il est utilisé en priorité
//    (metaTitle, metaDescription, h1, intro, sections, faq).
// 2. Sinon, un contenu est généré à partir des SEULES données de la commune (src/data/communes.ts) :
//    variantes de formulation choisies de façon déterministe (hash du slug, répartition équilibrée),
//    adaptées à la taille de la commune, à sa distance, sa direction et son temps de trajet depuis
//    Montarnaud, à son code postal, sa population, son intercommunalité et ses communes voisines.
//    Aucun fait local n'est inventé (pas de lieux, entreprises, événements ni chiffres extérieurs).
//
// ⚠️ Module serveur uniquement (lecture de fichiers au build).

import fs from 'node:fs';
import path from 'node:path';
import { site } from '@/config/site';
import {
  aCommune,
  communes,
  communeSize,
  deCommune,
  getCommune,
  type Commune,
  type CommuneSize,
  type Direction,
} from '@/data/communes';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface CommuneFaq {
  q: string;
  a: string;
}

export interface CommuneSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface CommuneContent {
  /** Origine du texte principal */
  source: 'json' | 'generated';
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  intro: [string, string];
  sections: CommuneSection[];
  faq: CommuneFaq[];
  servicesTitle: string;
  servicesIntro: string;
  ctaInline: { title: string; text: string };
  ctaBanner: { title: string; text: string };
  neighborsTitle: string;
  neighborsIntro: string;
  mapCaption: string;
}

/* -------------------------------------------------------------------------- */
/*                        Formatage (réutilisable ailleurs)                    */
/* -------------------------------------------------------------------------- */

const NBSP = ' ';

/** 6651 → « 6 651 » (espace insécable) */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** 11.2 → « 11,2 » ; 4.0 → « 4 » */
export function formatDecimal(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '').replace('.', ',');
}

/** 11.2 → « 11,2 km » */
export function formatKm(n: number): string {
  return `${formatDecimal(n)}${NBSP}km`;
}

/** Liste française : « A », « A et B », « A, B et C » */
export function frList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

const DIRECTION_PHRASE: Record<Direction, string> = {
  nord: 'au nord',
  'nord-est': 'au nord-est',
  est: "à l'est",
  'sud-est': 'au sud-est',
  sud: 'au sud',
  'sud-ouest': 'au sud-ouest',
  ouest: "à l'ouest",
  'nord-ouest': 'au nord-ouest',
};

/** « au nord-est », « à l'ouest »… */
export function directionPhrase(d: Direction): string {
  return DIRECTION_PHRASE[d];
}

/** Libellé complet de l'intercommunalité : « CC du Grand Pic Saint-Loup » → « Communauté de communes du Grand Pic Saint-Loup » */
export function epciLabel(epci: string): string {
  if (epci.startsWith('CC ')) return `Communauté de communes ${epci.slice(3)}`;
  if (epci.startsWith('CA ')) return `Communauté d'agglomération ${epci.slice(3)}`;
  return epci;
}

/** « de la communauté de communes Vallée de l'Hérault », « de Montpellier Méditerranée Métropole » */
function epciDe(epci: string): string {
  if (epci.startsWith('CC ')) return `de la communauté de communes ${epci.slice(3)}`;
  if (epci.startsWith('CA ')) return `de la communauté d'agglomération ${epci.slice(3)}`;
  return `de ${epci}`;
}

/** Anneaux de distance utilisés sur le site */
export const DISTANCE_RINGS = [
  { min: 0, max: 5, label: 'De 0 à 5 km' },
  { min: 5, max: 10, label: 'De 5 à 10 km' },
  { min: 10, max: 15, label: 'De 10 à 15 km' },
  { min: 15, max: 20, label: 'De 15 à 20 km' },
] as const;

/** Index d'anneau (0 → 0-5 km … 3 → 15-20 km) */
export function ringIndex(c: Pick<Commune, 'distanceKm'>): number {
  return Math.min(3, Math.floor(c.distanceKm / 5));
}

/** Codes postaux en toutes lettres : « 34000, 34070, 34080 et 34090 » */
export function postalCodesLabel(c: Commune): string {
  return frList(c.postalCodes);
}

/* -------------------------------------------------------------------------- */
/*                     Sélection déterministe des variantes                   */
/* -------------------------------------------------------------------------- */

function hash(str: string): number {
  // FNV-1a 32 bits
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededRandom(seed: number): () => number {
  // mulberry32
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Scope = 'all' | 'size' | 'ring';

const rankCache = new Map<string, Map<string, number>>();

/**
 * Rang de la commune dans un ordre pseudo-aléatoire propre à chaque bloc : en prenant ce rang modulo
 * le nombre de variantes, chaque variante est utilisée par le même nombre de pages (répartition équilibrée).
 */
function rank(c: Commune, key: string, scope: Scope): number {
  const group =
    scope === 'size' ? communeSize(c) : scope === 'ring' ? String(ringIndex(c)) : 'all';
  const cacheKey = `${key}|${scope}|${group}`;
  let ranks = rankCache.get(cacheKey);
  if (!ranks) {
    const members = communes
      .filter((x) => x.slug !== 'montarnaud')
      .filter((x) =>
        scope === 'size' ? communeSize(x) === group : scope === 'ring' ? String(ringIndex(x)) === group : true,
      )
      .map((x) => x.slug)
      .sort((s1, s2) => hash(`${cacheKey}#${s1}`) - hash(`${cacheKey}#${s2}`));
    ranks = new Map(members.map((s, i) => [s, i]));
    rankCache.set(cacheKey, ranks);
  }
  return ranks.get(c.slug) ?? hash(`${cacheKey}#${c.slug}`);
}

function shuffle<T>(c: Commune, key: string, items: readonly T[]): T[] {
  const rnd = seededRandom(hash(`${key}#${c.slug}`));
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*                         Contexte de rédaction                              */
/* -------------------------------------------------------------------------- */

interface Ctx {
  c: Commune;
  name: string;
  /** « à Gignac », « au Crès », « aux Matelles » */
  a: string;
  /** « À Gignac », « Au Crès »… (début de phrase) */
  A: string;
  /** « de Gignac », « d'Aniane », « du Crès » */
  de: string;
  /** Sujet en début de phrase (« Gignac », « La commune des Matelles ») */
  S: string;
  /** Sujet en milieu de phrase (« Gignac », « la commune des Matelles ») */
  s: string;
  cp: string;
  cpFirst: string;
  pop: string;
  km: string;
  min: string;
  dir: string;
  sector: string;
  size: CommuneSize;
  ring: number;
  nbs: Commune[];
  nbNames: string[];
  sameCp: Commune[];
  sameDirCount: number;
  epci: string | null;
  epciDe: string | null;
  epciCount: number;
  surface: string;
  quote: string;
  radius: number;
  pick: <T>(key: string, items: readonly T[], scope?: Scope) => T;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function makeCtx(c: Commune): Ctx {
  const nbs = c.neighbors
    .filter((s) => s !== 'montarnaud')
    .map((s) => getCommune(s))
    .filter((x): x is Commune => Boolean(x));
  const sameCp = communes.filter(
    (x) => x.slug !== c.slug && x.slug !== 'montarnaud' && x.postalCodes.includes(c.postalCodes[0]),
  );
  return {
    c,
    name: c.name,
    a: aCommune(c.name),
    A: capitalize(aCommune(c.name)),
    de: deCommune(c.name),
    S: c.name.startsWith('Les ') ? `La commune des ${c.name.slice(4)}` : c.name,
    s: c.name.startsWith('Les ') ? `la commune des ${c.name.slice(4)}` : c.name,
    cp: postalCodesLabel(c),
    cpFirst: c.postalCodes[0],
    pop: formatNumber(c.population),
    km: formatKm(c.distanceKm),
    min: `${c.driveMinutes}${NBSP}minutes`,
    dir: c.direction ? directionPhrase(c.direction) : '',
    sector: c.direction ?? '',
    size: communeSize(c),
    ring: ringIndex(c),
    nbs,
    nbNames: nbs.map((n) => n.name),
    sameCp,
    sameDirCount: communes.filter((x) => x.direction && x.direction === c.direction).length,
    epci: c.epci,
    epciDe: c.epci ? epciDe(c.epci) : null,
    epciCount: c.epci ? communes.filter((x) => x.epci === c.epci).length : 0,
    surface: `${formatDecimal(c.surfaceKm2)}${NBSP}km²`,
    quote: site.quoteDelay,
    radius: site.radiusKm,
    pick: (key, items, scope = 'all') => items[rank(c, key, scope) % items.length],
  };
}

/** Espaces insécables avant la ponctuation haute (typographie française). */
function typo(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/ ([:;?!])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/ »/g, `${NBSP}»`)
    .trim();
}

function join(...sentences: (string | false | null | undefined)[]): string {
  return typo(sentences.filter(Boolean).join(' '));
}

/* -------------------------------------------------------------------------- */
/*                         Banques de formulations                            */
/* -------------------------------------------------------------------------- */

type BySize<T> = Record<CommuneSize, T>;

// Prestations mises en avant selon la taille de la commune (2 formulations par élément).
const BULLETS: BySize<[string, string][]> = {
  village: [
    [
      "Commerces de proximité : sols, comptoir, vitrine et réserve nettoyés avant l'ouverture ou après la fermeture.",
      "Petits commerces : une surface de vente nette dès l'ouverture, vitrine comprise, sans gêner la clientèle.",
    ],
    [
      "Cabinets de professions libérales et paramédicales : désinfection des points de contact, salle d'attente et sanitaires soignés.",
      "Cabinets infirmiers, de kinésithérapie ou d'ostéopathie : hygiène rigoureuse des surfaces et de l'espace d'accueil.",
    ],
    [
      "Ateliers et locaux d'artisans : bureau, vestiaires, sanitaires et zones de travail remis au propre.",
      "Locaux mixtes d'artisans (atelier et bureau) : dépoussiérage, sols et sanitaires selon un rythme adapté à votre activité.",
    ],
    [
      'Mairie, locaux associatifs et salles communales : entretien régulier ou ménage après une manifestation.',
      'Bâtiments communaux et associatifs : passages programmés et remise en ordre après les réunions ou les événements.',
    ],
    [
      'Petits bureaux et agences : poussières, sols, corbeilles et sanitaires, à la fréquence qui vous convient.',
      'Bureaux indépendants : un entretien léger mais régulier, calé sur vos jours de présence.',
    ],
    [
      "Vitrerie : vitrines, baies et portes vitrées, à l'intérieur comme à l'extérieur.",
      'Vitres et vitrines : un nettoyage sans traces, ponctuel ou programmé chaque mois.',
    ],
    [
      "Fin de chantier : remise en état d'un local rénové avant son ouverture ou sa mise en location.",
      "Après travaux : élimination des poussières de plâtre, traces de peinture et résidus avant l'emménagement.",
    ],
  ],
  bourg: [
    [
      "Boutiques et commerces : surface de vente, cabines, vitrine et réserve, avant l'arrivée des clients.",
      "Commerces : sols, présentoirs et vitrines entretenus pour un accueil irréprochable dès l'ouverture.",
    ],
    [
      "Cabinets médicaux et paramédicaux : désinfection des points de contact, salle d'attente et sanitaires.",
      "Professionnels de santé : protocoles d'hygiène adaptés aux cabinets, salles de soins et espaces d'accueil.",
    ],
    [
      "Agences immobilières, d'assurance ou bancaires : bureaux, espace d'accueil et vitrages toujours nets.",
      'Agences et cabinets de services : un accueil soigné, des bureaux dépoussiérés et des sanitaires impeccables.',
    ],
    [
      'Artisans et entreprises du bâtiment : bureaux, vestiaires, sanitaires et locaux de stockage.',
      "Locaux d'artisans : entretien des espaces de travail, des vestiaires et des zones de dépôt.",
    ],
    [
      'Locaux municipaux et associatifs : entretien régulier ou ménage après une manifestation.',
      'Salles et locaux associatifs : passages programmés et remise en ordre après les événements.',
    ],
    [
      "Vitrerie : vitrines, baies vitrées et portes d'entrée, à l'intérieur comme à l'extérieur.",
      'Vitres et cloisons vitrées : un nettoyage sans traces, ponctuel ou planifié.',
    ],
    [
      "Fin de chantier : remise en état complète après rénovation, avant l'ouverture ou l'emménagement.",
      'Après travaux : dépoussiérage complet, sols, menuiseries et vitres, pour une livraison nette.',
    ],
  ],
  ville: [
    [
      'Bureaux de PME et de TPE : open spaces, salles de réunion, espaces de pause et sanitaires.',
      "Locaux tertiaires : postes de travail, salles de réunion et cuisines d'équipe entretenus au quotidien ou chaque semaine.",
    ],
    [
      "Commerces et enseignes : surface de vente, cabines, réserves et vitrines, avant l'ouverture.",
      "Magasins et showrooms : sols, présentoirs et vitrines impeccables pour l'accueil des clients.",
    ],
    [
      "Cabinets médicaux et maisons de santé : désinfection des points de contact et protocoles d'hygiène stricts.",
      "Professionnels de santé : salles d'attente, cabinets et sanitaires traités avec des protocoles adaptés.",
    ],
    [
      "Locaux d'activité, ateliers et entrepôts : sols techniques, zones de stockage, vestiaires et bureaux attenants.",
      'Entrepôts et ateliers : entretien des sols, des quais, des vestiaires et des espaces sociaux.',
    ],
    [
      "Halls d'accueil et vitrerie : portes, baies et cloisons vitrées sans traces.",
      'Vitrerie professionnelle : façades vitrées, vitrines et cloisons intérieures.',
    ],
    [
      'Fin de chantier : bureaux ou commerces neufs ou rénovés remis en état avant leur ouverture.',
      "Remise en état après travaux : poussières fines, traces de peinture et résidus éliminés avant l'emménagement.",
    ],
    [
      'Agences et cabinets (immobilier, assurance, expertise) : un accueil soigné et des bureaux toujours nets.',
      "Cabinets de services : espace d'accueil, bureaux et sanitaires entretenus avec discrétion.",
    ],
  ],
  'grande-ville': [
    [
      'Sièges sociaux et plateaux tertiaires : open spaces, salles de réunion, espaces de pause et sanitaires.',
      'Plateaux de bureaux : entretien quotidien ou hebdomadaire, hors des heures de présence de vos équipes.',
    ],
    [
      'Espaces de coworking : zones partagées, cuisines, salles de réunion et sanitaires à forte fréquentation.',
      "Coworkings et centres d'affaires : un entretien soutenu des espaces communs, adapté à leur fréquentation.",
    ],
    [
      "Cabinets d'avocats, d'expertise comptable ou de conseil : discrétion, confidentialité et accueil impeccable.",
      "Professions libérales : bureaux, salles d'attente et archives entretenus avec discrétion.",
    ],
    [
      "Commerces et showrooms : surface de vente, cabines et vitrines prêtes avant l'ouverture.",
      "Boutiques et enseignes : sols, présentoirs et vitrines entretenus selon vos horaires d'ouverture.",
    ],
    [
      "Cabinets et centres médicaux : désinfection des points de contact et protocoles d'hygiène stricts.",
      "Professionnels de santé : salles d'attente, cabinets et sanitaires traités avec des protocoles adaptés.",
    ],
    [
      "Halls d'accueil et façades vitrées : vitres, portes et cloisons sans traces.",
      "Vitrerie : baies, façades et cloisons vitrées, à l'intérieur comme à l'extérieur.",
    ],
    [
      'Fin de chantier : réaménagement de bureaux ou ouverture de commerce, locaux livrés nets.',
      "Remise en état après travaux : poussières fines, traces et résidus éliminés avant l'arrivée des équipes.",
    ],
  ],
};

/* -------------------------------------------------------------------------- */
/*                             Blocs générés                                  */
/* -------------------------------------------------------------------------- */

function introParagraph1(t: Ctx): string {
  const open = t.pick('intro-open', [
    `Vous cherchez une entreprise de nettoyage sérieuse pour vos locaux professionnels ${t.a} (${t.cpFirst}) ? Netquoo, société de nettoyage basée à Montarnaud, prend en charge l'entretien des bureaux, commerces, cabinets et locaux d'activité ${t.de}.`,
    `Netquoo accompagne les entreprises, commerçants et professions libérales ${t.de} (${t.cpFirst}) dans l'entretien de leurs locaux, avec des prestations régulières ou ponctuelles pensées pour leur activité.`,
    `${t.A}, confier l'entretien de vos locaux à une équipe de proximité simplifie le quotidien : c'est ce que Netquoo propose aux professionnels installés dans la commune (${t.cpFirst}), depuis sa base de Montarnaud.`,
    `Bureaux à entretenir, vitrine à faire briller, cabinet à désinfecter ou chantier à livrer ${t.a} ? Netquoo, société de nettoyage pour entreprises installée à Montarnaud, intervient chez les professionnels ${t.de} et des environs.`,
    `Netquoo est une société de nettoyage professionnel implantée à Montarnaud qui intervient ${t.a} (${t.cpFirst}) pour les entreprises de toutes tailles, du commerce indépendant aux bureaux plus étendus.`,
    `Pour les entreprises ${t.de}, Netquoo est un partenaire de nettoyage de proximité : bureaux, surfaces commerciales, cabinets de santé, vitrerie ou remise en état après travaux, nous prenons en charge vos locaux ${t.a} (${t.cpFirst}) avec méthode.`,
  ]);
  const geo = t.pick('intro-geo', [
    `${t.S} se trouve à ${t.km} à vol d'oiseau de Montarnaud, ${t.dir}, soit environ ${t.min} de route selon la circulation.`,
    `Depuis notre base, ${t.s} est à environ ${t.min} en voiture (${t.km} à vol d'oiseau, ${t.dir} de Montarnaud) : un trajet court qui facilite des passages à l'heure.`,
    `Située ${t.dir} de Montarnaud, à ${t.km} à vol d'oiseau, la commune fait partie de notre zone d'intervention de ${t.radius}${NBSP}km : comptez environ ${t.min} de trajet pour nos équipes.`,
    `Avec environ ${t.min} de trajet depuis Montarnaud et ${t.km} à vol d'oiseau, ${t.s} fait partie des communes que nous desservons ${t.dir} de notre base.`,
    `Entre Montarnaud et ${t.name}, il y a ${t.km} à vol d'oiseau, soit environ ${t.min} de route en temps normal : nos équipes passent leur temps dans vos locaux, pas sur la route.`,
    `${t.km} à vol d'oiseau et environ ${t.min} de trajet : voilà ce qui sépare ${t.name} de notre base de Montarnaud, située ${opposite(t.c.direction)} de la commune.`,
  ]);
  const audience = t.pick(
    'intro-audience',
    {
      village: [
        `Dans un village de ${t.pop} habitants, les besoins sont souvent ciblés — un commerce, un cabinet, un atelier, des locaux communaux — et nous calibrons nos interventions ${t.a} sur ces surfaces, sans forfait surdimensionné.`,
        `${t.S} compte ${t.pop} habitants : nos prestations y sont pensées pour les commerces de proximité, les artisans et les professionnels de santé qui veulent des locaux nets sans y consacrer leur temps.`,
        `Même pour une petite surface ${t.a}, quelques heures par semaine ou un passage mensuel, nous construisons une prestation sur mesure, à l'échelle d'une commune de ${t.pop} habitants.`,
        `À l'échelle d'un village comme ${t.name} (${t.pop} habitants), nous privilégions des interventions souples : passage hebdomadaire, ménage avant un événement ou remise en état ponctuelle.`,
      ],
      bourg: [
        `Dans une commune de ${t.pop} habitants comme ${t.name}, les locaux professionnels sont variés — commerce, cabinet, agence, atelier — et chacun mérite un cahier des charges précis.`,
        `Pour une commune de ${t.pop} habitants comme ${t.name}, nous adaptons la fréquence et le contenu de nos passages à chaque local : un commerce n'a pas les mêmes besoins qu'un cabinet ou qu'un atelier.`,
        `Que vous teniez une boutique, un cabinet ou une agence ${t.a}, commune de ${t.pop} habitants, nous définissons ensemble ce qui doit être fait, à quelle fréquence et à quel moment.`,
        `Les professionnels ${t.de} (${t.pop} habitants) ont rarement besoin d'une équipe à plein temps, mais d'une prestation fiable, au bon rythme : c'est exactement ce que nous mettons en place pour eux.`,
      ],
      ville: [
        `Dans une ville de ${t.pop} habitants comme ${t.name}, les besoins vont du cabinet de deux pièces au plateau de bureaux ou au local d'activité : nous dimensionnons chaque prestation en conséquence.`,
        `${t.S} compte ${t.pop} habitants et des entreprises aux profils très différents ; nos équipes passent d'un open space à une surface de vente ou à un entrepôt, avec le protocole adapté à chacun.`,
        `PME, enseignes, cabinets de santé ou locaux d'activité : ${t.a}, ville de ${t.pop} habitants, chaque type de local appelle une organisation propre, que nous formalisons dans un cahier des charges clair.`,
        `Pour les entreprises d'une ville de ${t.pop} habitants comme ${t.name}, la régularité prime : mêmes horaires, même équipe autant que possible et un interlocuteur joignable quand un besoin évolue.`,
      ],
      'grande-ville': [
        `Ville de ${t.pop} habitants, ${t.name} accueille bureaux, espaces de coworking, cabinets et commerces en nombre : nous y assurons un entretien régulier et discret, calé sur le rythme de vos équipes.`,
        `Dans une ville de ${t.pop} habitants comme ${t.name}, où bureaux et espaces d'accueil se comptent en nombre, les attentes sont élevées : accueil irréprochable, sanitaires impeccables et interventions hors des heures de bureau.`,
      ],
    }[t.size],
    'size',
  );
  return join(open, geo, audience);
}

function opposite(d: Direction | null): string {
  const map: Record<Direction, Direction> = {
    nord: 'sud',
    'nord-est': 'sud-ouest',
    est: 'ouest',
    'sud-est': 'nord-ouest',
    sud: 'nord',
    'sud-ouest': 'nord-est',
    ouest: 'est',
    'nord-ouest': 'sud-est',
  };
  return d ? directionPhrase(map[d]) : '';
}

function introParagraph2(t: Ctx): string {
  const offer = t.pick('intro2-offer', [
    `Nous intervenons ${t.a} pour l'entretien courant (sols, poussières, sanitaires, coin repas, corbeilles) comme pour les besoins ponctuels : vitrerie, nettoyage de fin de chantier ou remise en état avant une ouverture.`,
    `Entretien régulier de bureaux, nettoyage de vitrines, désinfection de cabinets, remise en état après travaux : les entreprises ${t.de} disposent avec Netquoo d'un interlocuteur unique pour l'ensemble de leurs besoins.`,
    `Notre rôle ${t.a} : vous libérer complètement de la question du ménage, avec un planning fixé à l'avance, des consignes respectées et des locaux prêts à accueillir clients et collaborateurs.`,
    `Que vos locaux ${t.de} demandent un passage quotidien, hebdomadaire ou simplement une intervention ponctuelle, nous construisons une prestation à la carte, sans formule imposée.`,
    `Pour vos locaux ${t.a}, nous proposons des contrats d'entretien réguliers mais aussi des interventions ponctuelles : grand ménage, vitres, remise en état après travaux ou avant un état des lieux.`,
  ]);
  const cta = t.pick('intro2-cta', [
    `Décrivez-nous vos besoins en deux minutes : vous recevez un devis gratuit et sans engagement ${t.quote} pour vos locaux ${t.a}.`,
    `Pour un devis gratuit et sans engagement, indiquez-nous le type de locaux, leur surface approximative et la fréquence souhaitée : nous vous répondons ${t.quote}, où que se trouvent vos locaux ${t.a}.`,
    `Premier pas simple : une demande de devis en ligne, gratuite et sans engagement, et une proposition chiffrée ${t.quote} pour vos locaux ${t.de}.`,
    `Votre devis de nettoyage ${t.a} est gratuit et sans engagement : nous vous le transmettons ${t.quote} après réception de votre demande.`,
  ]);
  return join(offer, cta);
}

function sectionProximity(t: Ctx): CommuneSection {
  const title = t.pick('a-title', [
    `Pourquoi choisir une société de nettoyage locale ${t.a} ?`,
    `Une société de nettoyage de proximité ${t.a}`,
    `Les avantages d'un prestataire de nettoyage proche ${t.de}`,
    `Pourquoi faire appel à un prestataire local ${t.a} ?`,
  ]);

  const ringParagraphs: string[][] = [
    [
      `${t.S} fait partie des communes les plus proches de notre base : ${t.km} à vol d'oiseau, environ ${t.min} de route. Pour les entreprises ${t.de}, cela signifie des horaires tenus, une équipe qui connaît le trajet par cœur et la possibilité d'organiser un passage supplémentaire sans long délai.`,
      `À ${t.km} de Montarnaud, ${t.s} est pour ainsi dire à notre porte : environ ${t.min} suffisent pour rejoindre vos locaux, ce qui rend nos interventions ${t.a} particulièrement souples.`,
    ],
    [
      `Entre ${t.name} et Montarnaud, le trajet est court (environ ${t.min}) : nos équipes arrivent à l'heure, sans dépendre de longs déplacements, et peuvent revenir rapidement si un imprévu survient dans vos locaux ${t.a}.`,
      `${t.km} à vol d'oiseau seulement séparent ${t.name} de notre base. Cette proximité est un atout concret pour les entreprises ${t.de} : moins de temps sur la route, c'est plus de ponctualité et de disponibilité.`,
      `Avec ${t.km} à vol d'oiseau entre notre base et ${t.name}, nous restons dans la catégorie des prestataires vraiment voisins : environ ${t.min} de trajet, et une équipe capable de s'adapter à vos changements de planning.`,
    ],
    [
      `Avec environ ${t.min} de trajet depuis Montarnaud, ${t.s} se situe au cœur de notre zone d'intervention : assez proche pour tenir des horaires fiables et organiser, si besoin, un passage complémentaire dans la semaine.`,
      `${t.S} se trouve à ${t.km} à vol d'oiseau de notre base, ${t.dir} : une distance qui nous permet de rester réactifs, sans les contraintes d'un prestataire venu de loin.`,
      `${t.km} à vol d'oiseau, environ ${t.min} de route : la distance entre Montarnaud et ${t.name} reste modeste, et elle nous permet de proposer aux entreprises ${t.de} la même régularité qu'à nos voisins immédiats.`,
    ],
    [
      `À ${t.km} à vol d'oiseau de Montarnaud, ${t.s} se situe dans la partie la plus éloignée de notre rayon de ${t.radius}${NBSP}km, mais fait pleinement partie de notre zone : environ ${t.min} de route et des plannings organisés pour tenir des horaires fiables.`,
      `${t.S} marque l'une des limites de notre secteur ${t.sector}, à environ ${t.min} de Montarnaud ; nous y intervenons avec la même exigence qu'à deux pas de notre base, en regroupant nos passages pour rester ponctuels.`,
      `Environ ${t.min} de route séparent notre base ${t.de}, aux confins de notre zone de ${t.radius}${NBSP}km : une distance que nous intégrons dans nos plannings pour que vos interventions démarrent toujours à l'heure prévue.`,
    ],
  ];
  const p1 = t.pick('a-ring', ringParagraphs[t.ring], 'ring');

  const p2 = t.pick('a-local', [
    `Choisir un prestataire installé à proximité ${t.de}, c'est aussi s'assurer un suivi humain : un interlocuteur qui répond, qui peut passer voir vos locaux et qui ajuste la prestation quand votre activité évolue.`,
    `Nous ne gérons pas vos locaux ${t.a} depuis un centre d'appels lointain : vous échangez directement avec l'équipe qui organise et contrôle les interventions.`,
    `Pour une entreprise ${t.de}, un prestataire local, c'est la possibilité d'ajuster rapidement un planning, de signaler un oubli ou de demander un renfort ponctuel, sans passer par une plateforme anonyme.`,
    `La proximité facilite tout : une visite de vos locaux ${t.a} si elle est utile au devis, des échanges simples au quotidien et une équipe qui finit par connaître vos habitudes et vos exigences.`,
    `Faire appel à une société de nettoyage proche ${t.de} limite les intermédiaires : la même structure établit le devis, organise les passages et reste votre contact tout au long de la prestation.`,
  ]);

  const nbList = frList(t.nbNames.slice(0, 3));
  const options: string[] = [
    `Nous intervenons également dans les communes voisines ${t.de}, comme ${nbList} : si votre entreprise possède plusieurs sites dans le secteur, un seul prestataire peut s'occuper de tous.`,
    `${t.S} fait partie des ${t.sameDirCount} communes de notre zone situées ${t.dir} de Montarnaud ; ${nbList} figurent parmi ses voisines les plus proches, et nous y intervenons dans les mêmes conditions.`,
    `Vos locaux sont répartis entre ${t.name} et ${t.nbNames[0]} ou ${t.nbNames[1]} ? Nous coordonnons l'entretien de vos différentes adresses ${t.de} et des environs avec un planning unique et un seul interlocuteur.`,
  ];
  if (t.sameCp.length >= 2) {
    options.push(
      `Dans notre zone, le code postal ${t.cpFirst} regroupe aussi ${frList(t.sameCp.slice(0, 3).map((x) => x.name))} : autant de communes où nous intervenons dans les mêmes conditions qu'${t.a}.`,
    );
  }
  if (t.epci && t.epciCount >= 3) {
    options.push(
      `${t.S} est membre ${t.epciDe}, dont ${t.epciCount} communes se trouvent dans notre rayon de ${t.radius}${NBSP}km ; parmi les plus proches ${t.de} figurent ${nbList}.`,
    );
  }
  const p3 = t.pick('a-neighbors', options);

  return { id: 'proximite', title: typo(title), paragraphs: [typo(p1), typo(p2), typo(p3)] };
}

function sectionServices(t: Ctx): CommuneSection {
  const title = t.pick('b-title', [
    `Nos prestations pour les entreprises ${t.de}`,
    `Quels locaux nettoyons-nous ${t.a} ?`,
    `Des prestations adaptées aux professionnels ${t.de}`,
    `Nettoyage de locaux professionnels ${t.a} : ce que nous prenons en charge`,
  ]);
  const intro = t.pick(
    'b-intro',
    {
      village: [
        `${t.A}, notre offre s'adresse avant tout aux professionnels de proximité, pour qui la propreté du local fait partie intégrante de l'accueil réservé aux clients et aux patients :`,
        `Dans un village comme ${t.name}, chaque passage doit être utile : nous proposons des prestations courtes, efficaces et régulières, adaptées aux surfaces les plus modestes comme aux plus grandes :`,
        `Qu'ils soient modestes ou plus étendus, les locaux professionnels ${t.de} méritent un entretien rigoureux ; voici les prestations que nous y proposons le plus souvent :`,
      ],
      bourg: [
        `${t.A}, la diversité des activités appelle des prestations variées : nous intervenons aussi bien dans une boutique que dans un cabinet, une agence ou un local d'artisan :`,
        `Pour les professionnels ${t.de}, nous avons construit une offre modulable, qui s'adapte à la nature de chaque local :`,
        `Nos équipes interviennent ${t.a} dans tous les types de locaux professionnels courants, avec un protocole propre à chacun :`,
      ],
      ville: [
        `${t.A}, notre offre s'adresse aux structures de toutes tailles, que vos locaux soient en centre-ville, en périphérie ou en zone d'activités :`,
        `Une ville de la taille ${t.de} réunit des locaux aux exigences très différentes ; nos prestations couvrent l'ensemble de ces besoins :`,
        `Bureaux, surfaces de vente, cabinets, ateliers : quelle que soit la nature de vos locaux ${t.a}, nous proposons une prestation dimensionnée pour eux :`,
      ],
      'grande-ville': [
        `${t.A}, les exigences de propreté sont à la hauteur de l'activité tertiaire : accueil, espaces partagés et sanitaires doivent être impeccables chaque matin.`,
        `Plateaux de bureaux, coworkings, cabinets libéraux, commerces : notre offre couvre les besoins des entreprises ${t.de}, des plus petites aux plus structurées :`,
      ],
    }[t.size],
    'size',
  );
  const pool = BULLETS[t.size];
  const variantSeed = hash(`bullet-variant#${t.c.slug}`);
  const bullets = shuffle(t.c, 'bullets', pool.map((pair, i) => pair[(variantSeed >> i) & 1]))
    .slice(0, 4)
    .map(typo);
  const outro = t.pick('b-outro', [
    `Chaque prestation fait l'objet d'un cahier des charges écrit : vous savez précisément ce qui est fait dans vos locaux ${t.a}, et à quelle fréquence.`,
    `Produits et matériel sont choisis selon chaque surface — parquet, carrelage, sol souple, vitrage — afin de préserver vos locaux ${t.de} sur la durée.`,
    `Vous pouvez combiner plusieurs prestations — entretien courant, vitres, remise en état — dans un seul contrat pour vos locaux ${t.a}.`,
    `Pour les entreprises ${t.de} qui démarrent, emménagent ou réaménagent, nous intervenons aussi en amont, avec un nettoyage complet avant l'installation.`,
  ]);
  return { id: 'prestations', title: typo(title), paragraphs: [typo(intro), typo(outro)], bullets };
}

function sectionOrganisation(t: Ctx): CommuneSection {
  const title = t.pick('c-title', [
    `Horaires, organisation et réactivité ${t.a}`,
    `Comment nous organisons vos interventions ${t.a}`,
    `Un planning calé sur votre activité ${t.a}`,
    `Réactivité et souplesse pour vos locaux ${t.de}`,
  ]);
  const hours = t.pick('c-hours', [
    `${t.A}, nous calons nos passages sur vos horaires plutôt que l'inverse : tôt le matin avant l'ouverture, en journée, en soirée après le départ de vos équipes ou le week-end sur demande.`,
    `Le bon moment pour faire le ménage, c'est celui qui ne gêne personne : pour les entreprises ${t.de}, nous intervenons avant l'arrivée du personnel, après la fermeture ou le samedi, selon vos contraintes.`,
    `Commerce qui ouvre à 9${NBSP}h, cabinet qui reçoit dès 8${NBSP}h, bureaux occupés jusqu'au soir : ${t.a}, nous adaptons nos horaires d'intervention à votre rythme, y compris en dehors des heures ouvrées sur demande.`,
    `Nos interventions ${t.a} sont planifiées à l'avance et se déroulent aux heures qui vous conviennent, de préférence en dehors de vos heures d'ouverture pour ne jamais gêner clients ou patients.`,
  ]);
  const reactivity = t.pick('c-react', [
    `Grâce aux quelque ${t.min} de route qui nous séparent ${t.de}, un besoin imprévu — dégât, réception, visite importante — peut souvent être traité rapidement, selon nos disponibilités.`,
    `En cas d'imprévu (salissure exceptionnelle, réception de clients, état des lieux), notre proximité avec ${t.name} — environ ${t.min} de trajet — nous permet de réagir vite et de caler une intervention supplémentaire.`,
    `Un passage à décaler ou une prestation à renforcer pendant une période chargée ${t.a} ? Depuis Montarnaud, nous rejoignons ${t.name} en environ ${t.min}, ce qui laisse de la souplesse pour ajuster le planning.`,
    `Le temps de trajet indicatif d'environ ${t.min} entre notre base et ${t.name} n'est pas qu'un chiffre : c'est ce qui nous permet de tenir des horaires fiables et de répondre vite à une demande urgente.`,
  ]);
  const organisation = t.pick('c-orga', [
    `Concrètement, nous fixons ensemble un cahier des charges pour vos locaux ${t.a} — pièces, tâches, fréquence, horaires, accès — puis nous le faisons évoluer au fil de vos besoins.`,
    `Pour chaque client ${t.de}, nous privilégions une équipe stable qui connaît les lieux, les consignes d'accès et vos attentes ; un point régulier permet d'ajuster la prestation.`,
    `La gestion des clés ou des badges, les consignes de fermeture et les zones sensibles sont définies dès le départ pour vos locaux ${t.a}, afin que chaque intervention se déroule en toute confiance.`,
    `Vous gardez la main : fréquence ajustable, prestations ponctuelles ajoutées à la demande et interlocuteur joignable pour toute question sur vos locaux ${t.de}.`,
  ]);
  return { id: 'organisation', title: typo(title), paragraphs: [typo(hours), typo(reactivity), typo(organisation)] };
}

function hoursText(): string {
  // « Du lundi au vendredi, 8h–18h · interventions … » → « du lundi au vendredi, 8h–18h ; interventions … »
  const h = site.hours.replace(/\s*·\s*/g, ' ; ');
  return h.charAt(0).toLowerCase() + h.slice(1);
}

function generatedFaq(t: Ctx): CommuneFaq[] {
  const nb4 = frList(t.nbNames.slice(0, 4));
  const intervention: CommuneFaq = {
    q: t.pick('f1-q', [
      `Netquoo intervient-elle ${t.a} ?`,
      `Intervenez-vous ${t.a} (${t.cpFirst}) ?`,
      `Votre société de nettoyage se déplace-t-elle jusqu'${t.a} ?`,
    ]),
    a: t.pick('f1-a', [
      `Oui : ${t.s} (${t.cp}) se trouve à ${t.km} à vol d'oiseau de notre base de Montarnaud, ${t.dir}, soit environ ${t.min} de route à titre indicatif. Vos locaux ${t.a} sont donc pleinement dans notre zone d'intervention de ${t.radius}${NBSP}km.`,
      `Oui, ${t.s} fait partie de notre zone d'intervention : la commune est située ${t.dir} de Montarnaud, à ${t.km} à vol d'oiseau, et nos équipes la rejoignent en environ ${t.min} (temps indicatif, selon la circulation).`,
      `Tout à fait : avec ${t.km} à vol d'oiseau et environ ${t.min} de trajet depuis Montarnaud, ${t.s} (${t.cp}) entre bien dans le rayon de ${t.radius}${NBSP}km où nous intervenons.`,
    ]),
  };
  const sizeTypes: BySize<string> = {
    village: "commerces de proximité, cabinets de professions libérales et paramédicales, ateliers d'artisans, petits bureaux ainsi que locaux communaux ou associatifs",
    bourg: "commerces, cabinets médicaux et paramédicaux, agences, bureaux, locaux d'artisans et locaux associatifs",
    ville: 'bureaux de PME et de TPE, commerces, cabinets médicaux, maisons de santé, agences, ateliers et entrepôts',
    'grande-ville': 'plateaux de bureaux, sièges sociaux, espaces de coworking, cabinets libéraux, commerces, showrooms et cabinets médicaux',
  };
  const types: CommuneFaq = {
    q: t.pick('f2', [`Quels types de locaux nettoyez-vous ${t.a} ?`, `Pour quelles entreprises ${t.de} intervenez-vous ?`]),
    a: t.pick('f2', [
      `Pour les professionnels ${t.de}, nous entretenons les ${sizeTypes[t.size]} ; nous assurons aussi la vitrerie et le nettoyage de fin de chantier des locaux rénovés ou neufs.`,
      `${t.A}, nous intervenons dans les ${sizeTypes[t.size]}, pour un entretien régulier comme pour des besoins ponctuels : vitres, grand ménage ou remise en état après travaux.`,
    ]),
  };
  const hours: CommuneFaq = {
    q: t.pick('f3', [
      `À quels horaires pouvez-vous intervenir ${t.a} ?`,
      `Pouvez-vous nettoyer nos locaux ${t.a} en dehors des heures d'ouverture ?`,
    ]),
    a: t.pick('f3', [
      `Pour vos locaux ${t.a}, nos horaires habituels sont les suivants : ${hoursText()} ; nous choisissons ensemble le créneau qui ne perturbe ni vos équipes ni vos clients.`,
      `Oui : ${t.a}, nous intervenons ${hoursText()}. Beaucoup de commerces et de cabinets préfèrent un passage avant l'ouverture ou après la fermeture : pour vos locaux ${t.de}, nous nous adaptons.`,
    ]),
  };
  const quote: CommuneFaq = {
    q: t.pick('f4', [
      `Comment obtenir un devis de nettoyage pour des locaux ${t.a} ?`,
      `Le devis est-il gratuit pour une entreprise ${t.de} ?`,
    ]),
    a: t.pick('f4', [
      `Remplissez notre formulaire de demande de devis en précisant que vos locaux se trouvent ${t.a}, leur type, leur surface approximative et la fréquence souhaitée. Nous adressons aux entreprises ${t.de} une proposition claire ${t.quote}, gratuite et sans engagement.`,
      `Oui, gratuit et sans engagement, quelle que soit la taille de votre entreprise ${t.a}. Indiquez-nous l'adresse de vos locaux, leur surface et vos attentes : vous recevez une proposition détaillée ${t.quote} pour votre site ${t.de}.`,
    ]),
  };
  const oneOff: CommuneFaq = {
    q: t.pick('f5', [
      `Proposez-vous des interventions ponctuelles ${t.a} ?`,
      `Faut-il un contrat d'entretien régulier pour vos interventions ${t.a} ?`,
    ]),
    a: t.pick('f5', [
      `Oui : en plus des contrats d'entretien réguliers, nous réalisons ${t.a} des interventions ponctuelles : nettoyage de fin de chantier, grand ménage avant une ouverture ou un état des lieux, nettoyage de vitres.`,
      `Non, aucun contrat régulier n'est exigé ${t.a} : vous pouvez faire appel à nous pour une intervention unique (fin de chantier, remise en état, vitres) comme pour un entretien hebdomadaire ou quotidien.`,
    ]),
  };
  const around: CommuneFaq = {
    q: t.pick('f6', [`Intervenez-vous aussi autour ${t.de} ?`, `Pouvez-vous entretenir plusieurs sites autour ${t.de} ?`]),
    a: t.pick('f6', [
      `Oui : nous couvrons l'ensemble des communes situées à moins de ${t.radius}${NBSP}km de Montarnaud, notamment ${nb4}, voisines ${t.de}.`,
      `Oui : si votre entreprise dispose d'autres locaux à proximité ${t.de}, par exemple ${frList(t.nbs.slice(0, 3).map((x) => aCommune(x.name)))}, nous pouvons regrouper l'ensemble dans une même organisation, avec un seul interlocuteur.`,
    ]),
  };
  const optional = [types, hours, quote, oneOff, around];
  const start = rank(t.c, 'faq-set', 'all') % optional.length;
  const chosen = [0, 1, 2].map((i) => optional[(start + i) % optional.length]);
  const order = new Map(optional.map((f, i) => [f, i]));
  chosen.sort((x, y) => (order.get(x) ?? 0) - (order.get(y) ?? 0));
  return [intervention, ...chosen].map((f) => ({ q: typo(f.q), a: typo(f.a) }));
}

function metaTitleFor(c: Commune): string {
  const cp = c.postalCodes[0];
  const a = aCommune(c.name);
  const candidates = [
    `Société de nettoyage ${a} (${cp}) | Netquoo`,
    `Nettoyage d'entreprise ${a} (${cp}) | Netquoo`,
    `Nettoyage ${a} (${cp}) | Netquoo`,
    `Nettoyage ${a} | Netquoo`,
  ];
  return candidates.find((x) => x.length <= 60) ?? candidates[candidates.length - 1];
}

function metaDescriptionFor(t: Ctx): string {
  const km = formatKm(t.c.distanceKm);
  const candidates = [
    `Société de nettoyage pour entreprises ${t.a} (${t.cpFirst}) : bureaux, commerces, cabinets médicaux, vitres et fin de chantier. Devis gratuit ${t.quote}.`,
    `Netquoo nettoie les locaux professionnels ${t.de} (${t.cpFirst}), à ${km} de Montarnaud : bureaux, commerces, cabinets, vitrerie. Devis gratuit et sans engagement.`,
    `Nettoyage de bureaux, commerces et cabinets ${t.a} (${t.cpFirst}) par Netquoo, basée à Montarnaud à environ ${t.c.driveMinutes}${NBSP}min. Devis gratuit, sans engagement.`,
    `Besoin d'une société de nettoyage ${t.a} ? Netquoo entretient bureaux, commerces et cabinets depuis Montarnaud. Devis gratuit ${t.quote}, sans engagement.`,
    `Entretien de locaux professionnels ${t.a} (${t.cpFirst}) : bureaux, boutiques, cabinets de santé, vitres, fin de chantier. Équipe locale, devis gratuit et rapide.`,
    // Formulations courtes / longues de secours pour tenir 140-160 caractères
    `Nettoyage d'entreprise ${t.a} (${t.cpFirst}) : bureaux, commerces, cabinets, vitres. Netquoo, société basée à Montarnaud. Devis gratuit ${t.quote}.`,
    `Nettoyage ${t.a} : bureaux, commerces, cabinets, vitres, fin de chantier. Netquoo, votre société de nettoyage locale. Devis gratuit ${t.quote}.`,
    `Nettoyage ${t.a} (${t.cpFirst}) : bureaux, commerces, cabinets. Netquoo, société de nettoyage locale. Devis gratuit ${t.quote}.`,
  ];
  const start = rank(t.c, 'meta-desc', 'all') % 5;
  const ordered = [...candidates.slice(start, 5), ...candidates.slice(0, start), ...candidates.slice(5)].map(typo);
  const fit = ordered.find((d) => d.length >= 140 && d.length <= 160);
  if (fit) return fit;
  const short = ordered.filter((d) => d.length <= 160).sort((x, y) => y.length - x.length)[0];
  return short ?? ordered[ordered.length - 1].slice(0, 157).replace(/\s+\S*$/, '') + '…';
}

function generateCommuneContent(c: Commune): CommuneContent {
  const t = makeCtx(c);
  const minutesLabel = `environ ${t.min}`;
  return {
    source: 'generated',
    metaTitle: metaTitleFor(c),
    metaDescription: metaDescriptionFor(t),
    h1: `Société de nettoyage pour entreprises ${t.a}`,
    eyebrow: typo(`Zone d'intervention · ${t.cpFirst}`),
    intro: [introParagraph1(t), introParagraph2(t)],
    sections: [sectionProximity(t), sectionServices(t), sectionOrganisation(t)],
    faq: generatedFaq(t),
    servicesTitle: typo(`Nos prestations de nettoyage ${t.a}`),
    servicesIntro: typo(
      t.pick('services-intro', [
        `Six familles de prestations, combinables entre elles, pour couvrir tous les besoins des entreprises ${t.de}.`,
        `Entretien régulier ou intervention ponctuelle : choisissez ce dont vos locaux ${t.a} ont besoin, nous nous occupons du reste.`,
        `Bureaux, commerces, cabinets, vitres, chantiers, entrepôts : nos équipes interviennent ${t.a} sur tous les types de locaux professionnels.`,
      ]),
    ),
    ctaInline: {
      title: typo(`Besoin d'un devis pour vos locaux ${t.a} ?`),
      text: typo(
        t.pick('cta-inline', [
          `Gratuit et sans engagement : décrivez vos locaux, nous vous répondons ${t.quote}.`,
          `Quelques informations sur vos locaux suffisent : réponse ${t.quote}, sans engagement.`,
          `Un devis clair et gratuit ${t.quote}, que vous ayez besoin d'un entretien régulier ou ponctuel.`,
        ]),
      ),
    },
    ctaBanner: {
      title: typo(
        t.pick('cta-banner', [
          `Des locaux impeccables ${t.a}, sans y penser.`,
          `Une équipe de nettoyage à ${minutesLabel} ${t.de}.`,
          `Confiez l'entretien de vos locaux ${t.a} à Netquoo.`,
          `Et si le ménage de vos locaux ${t.a} n'était plus votre affaire ?`,
        ]),
      ),
      text: typo(`Décrivez-nous vos locaux ${t.a} : nous vous envoyons un devis clair et gratuit ${t.quote}, sans engagement.`),
    },
    neighborsTitle: typo(`Nous intervenons aussi près ${t.de}`),
    neighborsIntro: typo(
      `Vos locaux se trouvent dans une commune voisine ${t.de} ? Nous y intervenons dans les mêmes conditions, depuis notre base de Montarnaud.`,
    ),
    mapCaption: typo(
      `${t.S} se situe à ${t.km} à vol d'oiseau ${t.dir} de Montarnaud (environ ${t.min} de route, temps indicatif). En bleu clair : ses communes voisines.`,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*                          Page de Montarnaud (base)                          */
/* -------------------------------------------------------------------------- */

function montarnaudContent(c: Commune): CommuneContent {
  const t = makeCtx(c);
  const others = communes.length - 1;
  const close = c.neighbors
    .map((s) => getCommune(s))
    .filter((x): x is Commune => Boolean(x))
    .slice(0, 3);
  const closeList = frList(close.map((x) => `${x.name} (${formatKm(x.distanceKm)})`));
  const epciOthers = t.epciCount - 1;
  return {
    source: 'generated',
    metaTitle: metaTitleFor(c),
    metaDescription: typo(
      `Netquoo, société de nettoyage basée à Montarnaud (34570) : bureaux, commerces, cabinets médicaux, vitres, fin de chantier. Devis gratuit ${t.quote}.`,
    ),
    h1: `Société de nettoyage pour entreprises ${t.a}`,
    eyebrow: typo(`Notre base · ${t.cpFirst}`),
    intro: [
      join(
        `Montarnaud (${t.cpFirst}) n'est pas une commune comme les autres pour Netquoo : c'est notre base.`,
        `C'est d'ici que partent nos équipes pour entretenir les locaux des entreprises dans un rayon de ${t.radius}${NBSP}km, et c'est ici que les professionnels profitent de la plus grande réactivité.`,
        `Pour un commerce, un cabinet ou des bureaux installés dans la commune, votre société de nettoyage est littéralement votre voisine.`,
      ),
      join(
        `Bureaux, commerces, cabinets médicaux et paramédicaux, ateliers ou locaux fraîchement rénovés : nous prenons en charge l'entretien régulier comme les interventions ponctuelles pour les entreprises de cette commune de ${t.pop} habitants.`,
        `Le devis est gratuit et sans engagement, et nous vous répondons ${t.quote}.`,
      ),
    ],
    sections: [
      {
        id: 'proximite',
        title: typo('Une société de nettoyage basée à Montarnaud'),
        paragraphs: [
          typo(
            `Aucun temps de trajet à prévoir : pour les entreprises de Montarnaud, nos équipes sont sur place. Les horaires sont tenus, un oubli se rattrape vite et un passage supplémentaire s'organise sans délai de route.`,
          ),
          typo(
            `Être installés à Montarnaud, c'est aussi connaître le rythme de la commune et de ses environs immédiats : ${closeList} ne sont qu'à quelques minutes, ce qui nous permet d'organiser des plannings serrés et fiables.`,
          ),
          typo(
            t.epci
              ? `Montarnaud fait partie ${t.epciDe}, dont ${epciOthers} autres communes figurent dans notre zone d'intervention ; au total, nous intervenons dans ${others} communes autour de notre base.`
              : `Au total, nous intervenons dans ${others} communes autour de notre base, toutes situées à moins de ${t.radius}${NBSP}km.`,
          ),
        ],
      },
      {
        id: 'prestations',
        title: typo('Nos prestations pour les entreprises de Montarnaud'),
        paragraphs: [
          typo(
            `Commerce, cabinet, agence, atelier ou bureaux : à Montarnaud, nous adaptons chaque prestation à la nature de vos locaux et à votre activité :`,
          ),
          typo(
            `Chaque intervention suit un cahier des charges écrit, défini avec vous, que nous faisons évoluer au fil de vos besoins à Montarnaud.`,
          ),
        ],
        bullets: BULLETS.bourg.map((pair) => typo(pair[0])).slice(0, 5),
      },
      {
        id: 'organisation',
        title: typo('Intervention immédiate : nos équipes sont sur place'),
        paragraphs: [
          typo(
            `Dégât à nettoyer avant l'ouverture, visite importante, réception ou état des lieux : à Montarnaud, nous pouvons généralement intervenir très rapidement, selon nos disponibilités du moment.`,
          ),
          typo(`Nos horaires habituels — ${hoursText()} — permettent de faire le ménage de vos locaux à Montarnaud sans gêner vos clients ni vos équipes.`),
          typo(
            `Clés, badges, consignes de fermeture et zones sensibles sont définis dès le départ, et une équipe stable assure vos passages autant que possible.`,
          ),
        ],
      },
    ],
    faq: [
      {
        q: typo('Où est basée la société Netquoo ?'),
        a: typo(
          `Netquoo est basée à Montarnaud (${t.cpFirst}), dans l'Hérault. Nos équipes interviennent dans les entreprises de la commune et dans ${others} autres communes situées à moins de ${t.radius}${NBSP}km.`,
        ),
      },
      {
        q: typo('Pouvez-vous intervenir rapidement dans nos locaux à Montarnaud ?'),
        a: typo(
          `Oui : nos équipes partant de Montarnaud, il n'y a pas de temps de trajet à prévoir : une intervention urgente ou un passage supplémentaire peut généralement être organisé très vite, selon nos disponibilités.`,
        ),
      },
      {
        q: typo('Quels types de locaux nettoyez-vous à Montarnaud ?'),
        a: typo(
          `Bureaux, commerces, cabinets médicaux et paramédicaux, agences, locaux d'artisans, locaux associatifs, mais aussi vitrerie et nettoyage de fin de chantier, en contrat régulier ou en intervention ponctuelle.`,
        ),
      },
      {
        q: typo('Intervenez-vous aussi autour de Montarnaud ?'),
        a: typo(
          `Oui, dans un rayon de ${t.radius}${NBSP}km, notamment ${frList(t.nbs.slice(0, 4).map((x) => aCommune(x.name)))}. La liste complète des ${others} communes figure sur notre page Zones d'intervention.`,
        ),
      },
    ],
    servicesTitle: typo('Nos prestations de nettoyage à Montarnaud'),
    servicesIntro: typo(
      'Six familles de prestations, combinables entre elles, assurées par une équipe qui part de Montarnaud.',
    ),
    ctaInline: {
      title: typo("Besoin d'un devis pour vos locaux à Montarnaud ?"),
      text: typo(`Gratuit et sans engagement : réponse ${t.quote}, intervention rapide sur place.`),
    },
    ctaBanner: {
      title: typo('Votre société de nettoyage est à Montarnaud.'),
      text: typo(`Décrivez-nous vos locaux : nous vous envoyons un devis clair et gratuit ${t.quote}, sans engagement.`),
    },
    neighborsTitle: typo('Nous intervenons aussi autour de Montarnaud'),
    neighborsIntro: typo(
      `Depuis notre base, nous rejoignons en quelques minutes les communes voisines de Montarnaud, et jusqu'à ${others} communes dans un rayon de ${t.radius}${NBSP}km.`,
    ),
    mapCaption: typo(
      `Montarnaud, notre base, au centre de notre zone d'intervention de ${t.radius}${NBSP}km. En bleu clair : les communes les plus proches.`,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*                    Textes rédigés (src/content/communes)                   */
/* -------------------------------------------------------------------------- */

interface CommuneJson {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: [string, string];
  sections: { title: string; paragraphs: string[] }[];
  faq: CommuneFaq[];
}

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'communes');
const jsonCache = new Map<string, Partial<CommuneJson> | null>();

const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** Lit et valide le texte rédigé d'une commune (null si absent ou illisible). Chaque champ invalide est ignoré. */
function readCommuneJson(slug: string): Partial<CommuneJson> | null {
  if (jsonCache.has(slug)) return jsonCache.get(slug) ?? null;
  let result: Partial<CommuneJson> | null = null;
  const file = path.join(CONTENT_DIR, `${slug}.json`);
  try {
    if (fs.existsSync(file)) {
      const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (raw && typeof raw === 'object') {
        const r = raw as Record<string, unknown>;
        const out: Partial<CommuneJson> = {};
        if (isText(r.metaTitle)) out.metaTitle = r.metaTitle.trim();
        if (isText(r.metaDescription)) out.metaDescription = r.metaDescription.trim();
        if (isText(r.h1)) out.h1 = r.h1.trim();
        if (Array.isArray(r.intro) && r.intro.length >= 2 && r.intro.every(isText)) {
          out.intro = [r.intro[0].trim(), r.intro[1].trim()];
        }
        if (Array.isArray(r.sections)) {
          const sections = r.sections
            .filter((s): s is { title: string; paragraphs: string[] } => {
              const o = s as Record<string, unknown> | null;
              return Boolean(o) && isText(o!.title) && Array.isArray(o!.paragraphs) && o!.paragraphs.some(isText);
            })
            .map((s) => ({ title: s.title.trim(), paragraphs: s.paragraphs.filter(isText).map((p) => p.trim()) }));
          if (sections.length > 0) out.sections = sections;
        }
        if (Array.isArray(r.faq)) {
          const faq = r.faq
            .filter((f): f is CommuneFaq => {
              const o = f as Record<string, unknown> | null;
              return Boolean(o) && isText(o!.q) && isText(o!.a);
            })
            .map((f) => ({ q: f.q.trim(), a: f.a.trim() }));
          if (faq.length > 0) out.faq = faq;
        }
        result = Object.keys(out).length > 0 ? out : null;
      }
    }
  } catch {
    result = null;
  }
  jsonCache.set(slug, result);
  return result;
}

const SECTION_IDS = ['proximite', 'prestations', 'organisation', 'section-4', 'section-5', 'section-6'];

/* -------------------------------------------------------------------------- */
/*                                 API                                        */
/* -------------------------------------------------------------------------- */

const contentCache = new Map<string, CommuneContent>();

/**
 * Contenu complet de la page d'une commune : texte rédigé (JSON) en priorité, contenu généré sinon.
 * Les blocs « data » (CTA, titres de sections annexes, légende de carte…) sont toujours générés.
 */
export function getCommuneContent(c: Commune): CommuneContent {
  const cached = contentCache.get(c.slug);
  if (cached) return cached;
  const base = c.slug === 'montarnaud' ? montarnaudContent(c) : generateCommuneContent(c);
  const json = readCommuneJson(c.slug);
  const content: CommuneContent = json
    ? {
        ...base,
        source: 'json',
        metaTitle: json.metaTitle ?? base.metaTitle,
        metaDescription: json.metaDescription ?? base.metaDescription,
        h1: json.h1 ?? base.h1,
        intro: json.intro ?? base.intro,
        sections: json.sections
          ? json.sections.map((s, i) => ({ id: SECTION_IDS[i] ?? `section-${i + 1}`, title: s.title, paragraphs: s.paragraphs }))
          : base.sections,
        faq: json.faq ?? base.faq,
      }
    : base;
  contentCache.set(c.slug, content);
  return content;
}

/** Contenu généré uniquement (sans le texte rédigé) — utile pour les tests. */
export function getGeneratedCommuneContent(c: Commune): CommuneContent {
  return c.slug === 'montarnaud' ? montarnaudContent(c) : generateCommuneContent(c);
}
