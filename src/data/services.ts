// Catalogue des prestations Netquoo (données de base partagées par tout le site).
// Le contenu détaillé de chaque page service est dans src/content/services-content.ts.

export type ServiceIcon = 'building' | 'store' | 'stethoscope' | 'sparkles' | 'hardhat' | 'warehouse';

export interface Service {
  slug: string;
  /** Titre court (menus, cartes) */
  title: string;
  /** Titre SEO de la page (H1) */
  h1: string;
  /** Accroche d'une phrase pour les cartes */
  short: string;
  icon: ServiceIcon;
  /** Visuel dans /public/images */
  image: string;
  /** Exemples de clients concernés */
  clients: string[];
}

export const services: Service[] = [
  {
    slug: 'nettoyage-bureaux',
    title: 'Nettoyage de bureaux',
    h1: 'Nettoyage de bureaux et locaux tertiaires',
    short: 'Entretien régulier de vos bureaux, open spaces, salles de réunion et sanitaires, à la fréquence qui vous convient.',
    icon: 'building',
    image: '/images/bureaux.webp',
    clients: ['PME et TPE', 'Agences et cabinets', 'Sièges sociaux', 'Espaces de coworking'],
  },
  {
    slug: 'nettoyage-commerces',
    title: 'Commerces & locaux commerciaux',
    h1: 'Nettoyage de commerces et locaux commerciaux',
    short: 'Une boutique impeccable avant l’ouverture : sols, vitrines, cabines, réserves et espaces de vente.',
    icon: 'store',
    image: '/images/commerces.webp',
    clients: ['Boutiques', 'Showrooms', 'Agences immobilières', 'Restaurants (hors cuisine)'],
  },
  {
    slug: 'nettoyage-cabinets-medicaux',
    title: 'Cabinets médicaux & paramédicaux',
    h1: 'Nettoyage de cabinets médicaux et paramédicaux',
    short: 'Désinfection rigoureuse des salles d’attente, cabinets et points de contact, avec des protocoles adaptés.',
    icon: 'stethoscope',
    image: '/images/medical.webp',
    clients: ['Cabinets médicaux', 'Kinésithérapeutes', 'Dentistes', 'Maisons de santé'],
  },
  {
    slug: 'nettoyage-vitres',
    title: 'Vitrerie & nettoyage de vitres',
    h1: 'Nettoyage de vitres et de façades vitrées',
    short: 'Vitres, baies, vitrines et cloisons vitrées sans trace, en intérieur comme en extérieur.',
    icon: 'sparkles',
    image: '/images/vitres.webp',
    clients: ['Bureaux', 'Commerces', 'Halls d’accueil', 'Vérandas professionnelles'],
  },
  {
    slug: 'nettoyage-fin-de-chantier',
    title: 'Nettoyage de fin de chantier',
    h1: 'Nettoyage de fin de chantier',
    short: 'Remise en état après travaux : poussières, traces de peinture, plâtre et résidus, pour une livraison nette.',
    icon: 'hardhat',
    image: '/images/chantier.webp',
    clients: ['Entreprises du BTP', 'Promoteurs', 'Architectes', 'Entreprises qui emménagent'],
  },
  {
    slug: 'nettoyage-entrepots',
    title: 'Entrepôts & locaux d’activité',
    h1: 'Nettoyage d’entrepôts et de locaux d’activité',
    short: 'Sols industriels, zones de stockage, ateliers et vestiaires entretenus avec du matériel adapté.',
    icon: 'warehouse',
    image: '/images/entrepots.webp',
    clients: ['Entrepôts logistiques', 'Ateliers', 'Artisans', 'Locaux mixtes'],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function servicePath(s: Pick<Service, 'slug'>): string {
  return `/services/${s.slug}`;
}
