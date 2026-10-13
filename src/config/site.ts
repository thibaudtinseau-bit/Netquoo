// Coordonnées et réglages globaux du site Netquoo.
// ⚠️ Les champs vides ('') sont masqués automatiquement sur le site : remplis-les dès que possible.

export const site = {
  name: 'Netquoo',
  legalName: 'Netquoo',
  tagline: 'Société de nettoyage pour entreprises à Montarnaud',
  description:
    "Netquoo, société de nettoyage professionnel pour les entreprises à Montarnaud et dans un rayon de 20 km : bureaux, commerces, cabinets médicaux, vitrerie, fin de chantier. Devis gratuit sous 24 h.",
  /** URL de production, sans slash final (à remplacer par le nom de domaine définitif) */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://netquoo.vercel.app',
  /** Téléphone affiché, ex. « 06 12 34 56 78 » — laisser vide tant qu'il n'est pas connu */
  phone: '' as string,
  /** Email de contact affiché, ex. « contact@netquoo.fr » */
  email: '' as string,
  address: {
    street: '' as string,
    postalCode: '34570',
    city: 'Montarnaud',
    region: 'Occitanie',
    country: 'FR',
  },
  /** Coordonnées GPS du centre de Montarnaud (point de départ des interventions) */
  geo: { lat: 43.648, lon: 3.7053 },
  siret: '' as string,
  /** Rayon d'intervention en km */
  radiusKm: 20,
  hours: 'Du lundi au vendredi, 7h–19h · interventions tôt le matin, le soir et le week-end sur demande',
  quoteDelay: 'sous 24 h ouvrées',
  /** Dirigeant présenté dans la section « Qui sommes-nous » */
  owner: {
    name: 'Anthonin',
    role: 'Dirigeant de Netquoo',
    yearsAtHead: 15,
    photo: '/images/anthonin.webp',
  },
} as const;

/**
 * Chiffres de réassurance affichés sur le site.
 * ⚠️ Ils doivent rester exacts : mets-les à jour dès qu'ils évoluent.
 */
export const stats: { value: number; prefix?: string; suffix?: string; label: string; detail: string }[] = [
  { value: 15, prefix: '+', label: 'ans d’expérience', detail: 'à la tête de Netquoo' },
  { value: 400, prefix: '+', label: 'chantiers réalisés', detail: 'bureaux, commerces, cabinets, fins de chantier' },
  { value: 73, label: 'communes desservies', detail: 'dans un rayon de 20 km autour de Montarnaud' },
  { value: 24, suffix: ' h', label: 'pour recevoir votre devis', detail: 'gratuit et sans engagement' },
];

export const phoneHref = site.phone ? `tel:${site.phone.replace(/[^\d+]/g, '').replace(/^0/, '+33')}` : '';
export const emailHref = site.email ? `mailto:${site.email}` : '';

export const nav = [
  { href: '/services', label: 'Services' },
  { href: '/zones-intervention', label: "Zones d'intervention" },
  { href: '/a-propos', label: 'Qui sommes-nous' },
  { href: '/devis', label: 'Contact' },
] as const;
