// Contenu détaillé des pages service (clé = slug de src/data/services.ts).
// Règles éditoriales : vouvoiement, aucun fait inventé (pas de prix, d’avis, de chiffres
// d’entreprise, de certification ni de marque). Tout est formulé en engagements.
// Les cuisines professionnelles (HACCP) et le traitement des nuisibles ne sont pas proposés.

import { site } from '@/config/site';

/** Pictogrammes disponibles (associés aux icônes lucide dans la page service). */
export type ContentIcon =
  | 'monitor'
  | 'users'
  | 'coffee'
  | 'droplets'
  | 'layers'
  | 'door'
  | 'store'
  | 'shirt'
  | 'package'
  | 'armchair'
  | 'stethoscope'
  | 'window'
  | 'frame'
  | 'sun'
  | 'wind'
  | 'paint'
  | 'trash'
  | 'forklift'
  | 'wrench'
  | 'shower'
  | 'calendar'
  | 'calendar-check'
  | 'repeat'
  | 'clock'
  | 'zap'
  | 'sparkles'
  | 'shield'
  | 'eye'
  | 'heart'
  | 'key'
  | 'hard-hat'
  | 'building'
  | 'grid'
  | 'clipboard';

export interface IncludedGroup {
  /** Zone ou famille de tâches (ex. « Sanitaires ») */
  zone: string;
  icon: ContentIcon;
  items: string[];
}

export interface FrequencyOption {
  label: string;
  text: string;
  icon: ContentIcon;
}

export interface MethodStep {
  title: string;
  text: string;
}

export interface Benefit {
  title: string;
  text: string;
  icon: ContentIcon;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ServiceContent {
  /** Balise title, SANS le suffixe « | Netquoo » ajouté par le layout (≤ 50 car. pour rester ≤ 60 au total) */
  metaTitle: string;
  /** Meta description, 140-160 caractères */
  metaDescription: string;
  /** Groupe nominal en minuscules, utilisé dans les intertitres (« Ce que comprend notre … ») */
  keyword: string;
  /** Texte alternatif du visuel du service */
  imageAlt: string;
  /** Deux paragraphes d’introduction */
  intro: [string, string];
  includedIntro: string;
  included: IncludedGroup[];
  frequenciesTitle: string;
  frequenciesIntro: string;
  frequencies: FrequencyOption[];
  method: MethodStep[];
  benefits: Benefit[];
  /** Paragraphe de la section « Pour qui ? » */
  audience: string;
  faq: FaqItem[];
  cta: {
    inlineTitle: string;
    inlineText: string;
    bannerTitle: string;
    bannerText: string;
  };
}

const reply = `Réponse ${site.quoteDelay}, gratuite et sans engagement.`;

export const servicesContent: Record<string, ServiceContent> = {
  /* ------------------------------------------------------------------ */
  'nettoyage-bureaux': {
    metaTitle: 'Nettoyage de bureaux à Montarnaud et Montpellier',
    metaDescription:
      'Entretien de bureaux à Montarnaud, Juvignac, Grabels et Montpellier ouest : postes de travail, sanitaires, sols, salles de réunion. Devis gratuit sous 24 h.',
    keyword: 'nettoyage de bureaux',
    imageAlt: 'Agente d’entretien en tenue bleu marine nettoyant un poste de travail et ses écrans dans un open space lumineux',
    intro: [
      'Des bureaux propres, c’est un cadre de travail sain pour vos équipes et une première impression soignée pour vos visiteurs. Netquoo assure le nettoyage de bureaux et de locaux tertiaires à Montarnaud et dans un rayon de 20 km : Juvignac, Grabels, Saint-Georges-d’Orques, Pignan, Saint-Gély-du-Fesc, Montpellier et tout l’ouest montpelliérain.',
      'Chaque contrat part d’un cahier des charges établi avec vous : pièces à traiter, tâches attendues, fréquence de passage, consignes d’accès et points d’attention. Vous savez précisément ce qui est fait à chaque intervention, et vous disposez d’un interlocuteur unique pour ajuster la prestation lorsque votre organisation évolue : télétravail, arrivée de nouveaux collaborateurs, réaménagement d’un plateau. Nous intervenons tôt le matin, en soirée ou pendant vos horaires, selon ce qui gêne le moins votre activité.',
    ],
    includedIntro:
      'Le détail est adapté à vos locaux et à vos priorités. Voici les tâches que nous prenons en charge le plus souvent dans un contrat d’entretien de bureaux.',
    included: [
      {
        zone: 'Postes de travail',
        icon: 'monitor',
        items: [
          'Dépoussiérage des bureaux dégagés et des plans de travail',
          'Nettoyage des téléphones, claviers et souris, selon vos consignes',
          'Dépoussiérage des écrans, lampes et rangements accessibles',
          'Vidage des corbeilles et remplacement des sacs',
        ],
      },
      {
        zone: 'Accueil et salles de réunion',
        icon: 'users',
        items: [
          'Nettoyage des tables, chaises et du mobilier d’accueil',
          'Effacement des tableaux blancs sur demande',
          'Suppression des traces de doigts sur les portes et cloisons vitrées',
          'Remise en place du mobilier après passage',
        ],
      },
      {
        zone: 'Espace pause et kitchenette',
        icon: 'coffee',
        items: [
          'Nettoyage des plans de travail, éviers et tables',
          'Nettoyage extérieur du micro-ondes, du réfrigérateur et de la machine à café',
          'Vidage des poubelles et respect de votre tri sélectif',
          'Lavage du sol de l’espace pause',
        ],
      },
      {
        zone: 'Sanitaires',
        icon: 'droplets',
        items: [
          'Nettoyage et désinfection des WC, urinoirs et lavabos',
          'Détartrage régulier des équipements',
          'Nettoyage des miroirs, faïences et distributeurs',
          'Réapprovisionnement en papier, savon et essuie-mains',
        ],
      },
      {
        zone: 'Sols et circulations',
        icon: 'layers',
        items: [
          'Aspiration des moquettes et des tapis',
          'Lavage des sols durs adapté à chaque revêtement',
          'Entretien des couloirs, escaliers et ascenseurs',
          'Désinfection des points de contact : poignées, interrupteurs, rampes',
        ],
      },
    ],
    frequenciesTitle: 'Une fréquence calée sur votre activité',
    frequenciesIntro:
      'La bonne fréquence dépend du nombre de personnes présentes, de la surface et de l’accueil de public. Nous vous conseillons le rythme le plus juste, sans surdimensionner la prestation.',
    frequencies: [
      {
        label: 'Quotidienne',
        icon: 'repeat',
        text: 'Pour les plateaux très fréquentés, les locaux recevant du public ou les sanitaires partagés par de nombreux collaborateurs.',
      },
      {
        label: '2 à 3 passages par semaine',
        icon: 'calendar-check',
        text: 'Un rythme courant en PME : sanitaires et corbeilles suivis de près, sols et poussières entretenus régulièrement.',
      },
      {
        label: 'Hebdomadaire',
        icon: 'calendar',
        text: 'Adaptée aux petites équipes, aux cabinets et aux bureaux partiellement occupés en raison du télétravail.',
      },
      {
        label: 'Ponctuelle ou remise en état',
        icon: 'sparkles',
        text: 'Grand nettoyage après un déménagement, avant l’arrivée d’une équipe ou une visite importante, en complément de l’entretien courant.',
      },
    ],
    method: [
      {
        title: 'Visite et cahier des charges',
        text: 'Nous visitons vos locaux, ou échangeons à partir de plans et de photos, pour lister les pièces, les revêtements et vos priorités. Le cahier des charges et la fréquence sont validés avec vous avant le démarrage.',
      },
      {
        title: 'Mise en place',
        text: 'Nous convenons des créneaux de passage, des modalités d’accès (badge, clés, alarme) et de vos consignes de sécurité. Produits et matériel sont choisis selon vos surfaces.',
      },
      {
        title: 'Interventions régulières',
        text: 'Les tâches suivent une routine définie, avec un code couleur des chiffons par zone pour ne jamais transporter les salissures des sanitaires vers les postes de travail.',
      },
      {
        title: 'Suivi et ajustements',
        text: 'Une remarque ? Vous la signalez à votre interlocuteur, elle est traitée rapidement. La prestation évolue avec vous : ajout d’une salle, changement de fréquence, intervention ponctuelle.',
      },
    ],
    benefits: [
      {
        title: 'Des équipes plus sereines',
        icon: 'users',
        text: 'Un environnement propre et rangé contribue au bien-être au travail et limite la circulation des microbes, notamment en hiver.',
      },
      {
        title: 'Une image soignée',
        icon: 'eye',
        text: 'Accueil, salles de réunion et sanitaires impeccables : clients et candidats perçoivent immédiatement le soin porté à vos locaux.',
      },
      {
        title: 'Aucune gestion de votre côté',
        icon: 'clipboard',
        text: 'Planning, produits, matériel et continuité du service pendant les congés : nous organisons tout, vous gardez un seul contact.',
      },
      {
        title: 'Des horaires qui vous arrangent',
        icon: 'clock',
        text: 'Avant l’arrivée de vos équipes, après leur départ ou en journée : nous nous adaptons à votre façon de travailler.',
      },
    ],
    audience:
      'Que vous occupiez quelques bureaux dans une zone d’activités ou plusieurs plateaux dans un immeuble tertiaire, la prestation est dimensionnée à votre surface et à votre organisation.',
    faq: [
      {
        q: 'À quelle heure intervenez-vous dans nos bureaux ?',
        a: 'Nous nous adaptons à votre organisation. La plupart des entreprises préfèrent un passage tôt le matin ou en fin de journée pour ne pas gêner les équipes, mais une intervention en journée reste possible. Nous sommes joignables du lundi au vendredi de 8 h à 18 h, et les passages peuvent être planifiés plus tôt le matin, en soirée ou le week-end sur demande.',
      },
      {
        q: 'Faut-il être présent pendant le nettoyage ?',
        a: 'Non. Une fois les modalités d’accès définies (clés, badge, code d’alarme), nous intervenons en autonomie. Les accès qui nous sont confiés sont gérés avec rigueur et nous respectons la confidentialité de vos documents : les dossiers laissés sur les bureaux ne sont pas manipulés.',
      },
      {
        q: 'Fournissez-vous les produits et le matériel ?',
        a: 'Oui, les produits d’entretien et le matériel sont fournis par Netquoo et choisis en fonction de vos revêtements. Les consommables sanitaires (papier toilette, essuie-mains, savon) peuvent être fournis par vos soins ou intégrés au devis, selon votre préférence.',
      },
      {
        q: 'Intervenez-vous à Montpellier et dans les communes voisines ?',
        a: 'Oui. Basés à Montarnaud, nous intervenons dans un rayon de 20 km : Montpellier, Juvignac, Grabels, Saint-Jean-de-Védas, Saint-Gély-du-Fesc, Pignan, Cournonterral, Gignac et les villages alentour. La liste complète des communes desservies est disponible sur notre page zones d’intervention.',
      },
    ],
    cta: {
      inlineTitle: 'Un devis pour l’entretien de vos bureaux ?',
      inlineText: `Indiquez la surface et la fréquence souhaitée. ${reply}`,
      bannerTitle: 'Des bureaux impeccables, chaque matin.',
      bannerText: `Décrivez-nous vos bureaux : nous vous proposons un cahier des charges et un devis clair ${site.quoteDelay}, sans engagement.`,
    },
  },

  /* ------------------------------------------------------------------ */
  'nettoyage-commerces': {
    metaTitle: 'Nettoyage de commerces et boutiques à Montarnaud',
    metaDescription:
      'Nettoyage de boutiques, showrooms et agences à Montarnaud, Juvignac, Saint-Jean-de-Védas et Montpellier : sols, vitrines, cabines, avant l’ouverture.',
    keyword: 'nettoyage de commerces',
    imageAlt: 'Agente d’entretien en tenue bleu marine lavant le sol en marbre d’une boutique de prêt-à-porter avant l’ouverture',
    intro: [
      'Dans un commerce, la propreté se voit dès la porte d’entrée : une vitrine sans traces, un sol net, des cabines rangées et des sanitaires impeccables donnent envie d’entrer et de rester. Netquoo assure le nettoyage de commerces et de locaux commerciaux à Montarnaud et dans un rayon de 20 km, de Juvignac à Saint-Jean-de-Védas, Grabels, Gignac, Fabrègues ou Montpellier.',
      'Boutique de centre-bourg, showroom, agence immobilière ou salle de restaurant (hors cuisine professionnelle) : chaque surface de vente a ses revêtements, ses flux de clientèle et ses horaires. Nous construisons avec vous un programme d’entretien qui suit votre rythme commercial, avec des passages avant l’ouverture ou après la fermeture, et une fréquence renforcée lors des temps forts : soldes, fêtes de fin d’année, lancement de collection, inventaire.',
    ],
    includedIntro:
      'Nous traitons l’ensemble de votre point de vente, de la devanture jusqu’aux espaces réservés au personnel.',
    included: [
      {
        zone: 'Espace de vente',
        icon: 'store',
        items: [
          'Lavage des sols adapté au revêtement : carrelage, béton ciré, parquet, PVC',
          'Dépoussiérage des présentoirs, étagères et gondoles accessibles',
          'Nettoyage des miroirs et des surfaces vitrées intérieures',
          'Nettoyage du comptoir, de la caisse et de l’extérieur du terminal de paiement',
        ],
      },
      {
        zone: 'Entrée et vitrine',
        icon: 'door',
        items: [
          'Nettoyage de la porte d’entrée et de ses poignées',
          'Vitrine côté intérieur, et côté extérieur sur demande',
          'Aspiration ou secouage des tapis d’entrée',
          'Balayage du seuil et du pas de porte',
        ],
      },
      {
        zone: 'Cabines et espaces clients',
        icon: 'shirt',
        items: [
          'Nettoyage des cabines d’essayage, miroirs et patères',
          'Entretien des assises et des espaces d’attente',
          'Salle de restaurant : tables, chaises, banquettes et sols',
        ],
      },
      {
        zone: 'Réserves et locaux du personnel',
        icon: 'package',
        items: [
          'Balayage et lavage des sols de réserve',
          'Nettoyage du coin repas et du vestiaire',
          'Vidage des poubelles et gestion des cartons selon vos consignes',
        ],
      },
      {
        zone: 'Sanitaires',
        icon: 'droplets',
        items: [
          'Nettoyage et désinfection des sanitaires clients et du personnel',
          'Détartrage des lavabos, WC et robinetteries',
          'Réapprovisionnement des consommables',
        ],
      },
    ],
    frequenciesTitle: 'Un rythme qui suit votre activité commerciale',
    frequenciesIntro:
      'Jours d’ouverture, fréquentation, saisonnalité : la fréquence est définie avec vous et peut être renforcée ponctuellement sans renégocier tout le contrat.',
    frequencies: [
      {
        label: 'Quotidienne, avant l’ouverture',
        icon: 'repeat',
        text: 'Pour les boutiques à fort passage et les restaurants : votre point de vente est prêt chaque matin avant les premiers clients.',
      },
      {
        label: 'Plusieurs passages par semaine',
        icon: 'calendar-check',
        text: 'Un bon équilibre pour les showrooms et les agences : sols, vitrine et sanitaires restent impeccables sans passage quotidien.',
      },
      {
        label: 'Hebdomadaire',
        icon: 'calendar',
        text: 'Pour les petites surfaces ou les commerces ouverts quelques jours par semaine, en complément du rangement fait par votre équipe.',
      },
      {
        label: 'Temps forts et ponctuels',
        icon: 'zap',
        text: 'Remise en état après des travaux d’agencement, avant une ouverture ou un événement, après les soldes ou l’inventaire.',
      },
    ],
    method: [
      {
        title: 'Repérage du point de vente',
        text: 'Nous identifions les revêtements, les zones de fort passage, les éléments fragiles (présentoirs, éclairages, marchandises exposées) et vos horaires d’ouverture.',
      },
      {
        title: 'Planning hors ouverture',
        text: 'Les passages sont fixés avant l’ouverture ou après la fermeture : vos clients ne croisent jamais un seau ni un sol mouillé.',
      },
      {
        title: 'Du haut vers le bas, jusqu’à l’entrée',
        text: 'Dépoussiérage des présentoirs et surfaces hautes, puis miroirs et vitres, puis lavage des sols en terminant par l’entrée, pour une boutique prête à accueillir.',
      },
      {
        title: 'Remise en place et fermeture',
        text: 'La marchandise n’est jamais déplacée sans votre accord ; mobilier et tapis sont remis en place et les accès refermés selon vos consignes.',
      },
    ],
    benefits: [
      {
        title: 'Une vitrine qui attire',
        icon: 'eye',
        text: 'Une devanture nette et des vitres sans traces renforcent l’attractivité de votre commerce, en journée comme en soirée.',
      },
      {
        title: 'Aucune gêne pour vos clients',
        icon: 'clock',
        text: 'Les interventions ont lieu en dehors de vos horaires d’ouverture : vous ouvrez dans un magasin déjà propre.',
      },
      {
        title: 'Vos produits respectés',
        icon: 'shield',
        text: 'Nous travaillons avec soin autour des articles exposés, avec des méthodes et des produits adaptés à chaque surface.',
      },
      {
        title: 'Une prestation saisonnière',
        icon: 'calendar',
        text: 'Fréquence renforcée pendant les temps forts, allégée en période calme : l’entretien suit votre calendrier commercial.',
      },
    ],
    audience:
      'Commerçants indépendants, magasins d’enseigne, agences ou professionnels recevant du public : la prestation est adaptée à la taille de votre surface et à vos jours d’ouverture.',
    faq: [
      {
        q: 'Pouvez-vous intervenir avant l’ouverture de la boutique ?',
        a: 'Oui, c’est même le créneau le plus demandé. Nous intervenons tôt le matin, à l’horaire convenu ensemble, pour que votre point de vente soit prêt à l’ouverture. Un passage le soir après la fermeture est également possible.',
      },
      {
        q: 'Nettoyez-vous les cuisines de restaurant ?',
        a: 'Non. Le nettoyage de cuisines professionnelles, soumis aux règles d’hygiène alimentaire (HACCP), ne fait pas partie de nos prestations. Dans un restaurant, nous prenons en charge la salle, l’entrée, les vitres et les sanitaires, en coordination avec votre équipe de cuisine.',
      },
      {
        q: 'La vitrine extérieure est-elle comprise ?',
        a: 'Le nettoyage de la vitrine côté intérieur fait partie de l’entretien courant. Le côté extérieur peut être ajouté au contrat, à la fréquence de votre choix, en combinant la prestation avec notre service de nettoyage de vitres.',
      },
      {
        q: 'Faut-il déplacer la marchandise avant votre passage ?',
        a: 'Non, vous n’avez rien à préparer. Nous nettoyons autour des produits exposés et ne déplaçons la marchandise que si vous le demandez, par exemple pour un grand nettoyage des étagères ou après un réaménagement.',
      },
    ],
    cta: {
      inlineTitle: 'Votre boutique prête avant chaque ouverture ?',
      inlineText: `Indiquez votre surface et vos horaires d’ouverture. ${reply}`,
      bannerTitle: 'Une boutique impeccable dès l’ouverture.',
      bannerText: `Parlez-nous de votre point de vente : nous vous envoyons un devis clair ${site.quoteDelay}, adapté à vos horaires et à votre saisonnalité.`,
    },
  },

  /* ------------------------------------------------------------------ */
  'nettoyage-cabinets-medicaux': {
    metaTitle: 'Nettoyage de cabinet médical à Montarnaud (34)',
    metaDescription:
      'Nettoyage et désinfection de cabinets médicaux, paramédicaux et dentaires à Montarnaud et alentours : salle d’attente, points de contact, sanitaires, sols.',
    keyword: 'nettoyage de cabinets médicaux',
    imageAlt: 'Agente portant des gants désinfectant les accoudoirs des fauteuils dans la salle d’attente d’un cabinet médical',
    intro: [
      'Dans un cabinet de santé, l’entretien ne se limite pas à l’apparence : il participe à la maîtrise du risque infectieux et à la confiance de vos patients. Netquoo assure le nettoyage et la désinfection de cabinets médicaux et paramédicaux à Montarnaud et dans un rayon de 20 km, de Saint-Paul-et-Valmalle à Juvignac, Pignan, Cournonterral, Saint-Gély-du-Fesc ou Montpellier.',
      'Médecins, kinésithérapeutes, dentistes, infirmiers, orthophonistes ou maisons de santé : nous définissons avec vous un protocole écrit, zone par zone, qui distingue l’accueil, les salles de soins et les sanitaires. Les interventions ont lieu en dehors des consultations, pour que vos patients soient accueillis chaque jour dans des locaux sains, et pour que vous puissiez vous concentrer sur les soins.',
    ],
    includedIntro:
      'Le protocole est établi avec vous selon votre spécialité et l’organisation de votre cabinet. Il comprend généralement les points suivants.',
    included: [
      {
        zone: 'Accueil et salle d’attente',
        icon: 'armchair',
        items: [
          'Désinfection des assises, accoudoirs et tables basses',
          'Nettoyage du comptoir d’accueil, du téléphone et du terminal de paiement',
          'Désinfection des poignées de porte, interrupteurs et rampes',
          'Vidage des corbeilles de déchets non médicaux',
        ],
      },
      {
        zone: 'Salles de consultation et de soins',
        icon: 'stethoscope',
        items: [
          'Nettoyage du bureau et du mobilier du praticien',
          'Désinfection des surfaces hautes et basses accessibles selon votre protocole',
          'Nettoyage de la structure des tables d’examen, selon vos consignes',
          'Entretien des lavabos et des distributeurs de savon et de solution hydroalcoolique',
        ],
      },
      {
        zone: 'Sanitaires',
        icon: 'droplets',
        items: [
          'Nettoyage et désinfection des sanitaires patients et du personnel',
          'Détartrage des équipements et de la robinetterie',
          'Réapprovisionnement en savon, essuie-mains et papier',
        ],
      },
      {
        zone: 'Sols et circulations',
        icon: 'layers',
        items: [
          'Aspiration puis lavage désinfectant des sols',
          'Méthode de lavage limitant la remise en suspension des poussières',
          'Entretien des couloirs, escaliers et ascenseurs du cabinet',
        ],
      },
      {
        zone: 'Espaces du personnel',
        icon: 'coffee',
        items: [
          'Nettoyage de la salle de pause et du coin repas',
          'Entretien des vestiaires',
          'Vidage et nettoyage des poubelles',
        ],
      },
    ],
    frequenciesTitle: 'Des passages calés sur vos consultations',
    frequenciesIntro:
      'Le volume de patients et vos jours d’ouverture déterminent le rythme. Dans tous les cas, les points de contact et les sanitaires font l’objet d’une attention prioritaire.',
    frequencies: [
      {
        label: 'Quotidienne',
        icon: 'repeat',
        text: 'Conseillée pour les cabinets très fréquentés et les maisons de santé : chaque journée commence dans des locaux désinfectés.',
      },
      {
        label: 'Plusieurs passages par semaine',
        icon: 'calendar-check',
        text: 'Pour les cabinets à activité modérée, avec un soin particulier apporté aux points de contact et aux sanitaires.',
      },
      {
        label: 'Selon vos jours de consultation',
        icon: 'calendar',
        text: 'Pour les praticiens à temps partiel ou les cabinets partagés : les passages suivent votre planning.',
      },
      {
        label: 'Nettoyage approfondi ponctuel',
        icon: 'sparkles',
        text: 'Grand nettoyage périodique, remise en état après travaux ou avant l’ouverture d’un nouveau cabinet.',
      },
    ],
    method: [
      {
        title: 'Un protocole écrit par zone',
        text: 'Nous identifions avec vous l’accueil, les salles de soins, les sanitaires et les espaces du personnel, les surfaces sensibles et ce qui reste du ressort de votre équipe, comme le matériel médical.',
      },
      {
        title: 'Du plus propre au plus sale',
        text: 'Les zones de soins sont traitées avant les sanitaires, avec un code couleur et du matériel dédié par zone pour éviter toute contamination croisée.',
      },
      {
        title: 'Nettoyer, puis désinfecter',
        text: 'Les surfaces sont d’abord nettoyées pour retirer les salissures, puis désinfectées avec des produits adaptés, en respectant les temps de contact indiqués par le fabricant.',
      },
      {
        title: 'Traçabilité et suivi',
        text: 'Une fiche de passage permet de suivre les tâches réalisées et de signaler tout point d’attention. Le protocole est réajusté avec vous si nécessaire.',
      },
    ],
    benefits: [
      {
        title: 'La confiance des patients',
        icon: 'heart',
        text: 'Une salle d’attente nette et des sanitaires impeccables rassurent vos patients dès leur arrivée.',
      },
      {
        title: 'Un risque infectieux mieux maîtrisé',
        icon: 'shield',
        text: 'Points de contact désinfectés et matériel dédié par zone : le protocole limite la transmission des germes d’un espace à l’autre.',
      },
      {
        title: 'Plus de temps pour soigner',
        icon: 'clock',
        text: 'Vous et votre équipe restez concentrés sur vos patients ; nous prenons en charge l’entretien et son organisation.',
      },
      {
        title: 'Discrétion et confidentialité',
        icon: 'key',
        text: 'Interventions hors consultations, accès gérés avec rigueur et aucun document patient manipulé.',
      },
    ],
    audience:
      'Que vous exerciez seul, en cabinet de groupe ou en maison de santé, le protocole est construit autour de votre spécialité, de vos équipements et de vos plages de consultation.',
    faq: [
      {
        q: 'Prenez-vous en charge les déchets de soins (DASRI) ?',
        a: 'Non. Les déchets d’activités de soins à risques infectieux relèvent de la filière spécialisée avec laquelle vous travaillez. Nous vidons les corbeilles de déchets assimilés aux ordures ménagères et ne manipulons jamais les contenants DASRI.',
      },
      {
        q: 'Quelle différence entre nettoyage et désinfection ?',
        a: 'Le nettoyage retire les salissures visibles ; la désinfection réduit la présence de micro-organismes sur une surface déjà propre. Les deux étapes sont complémentaires : notre protocole nettoie d’abord, puis désinfecte les surfaces qui le nécessitent, en particulier les points de contact.',
      },
      {
        q: 'Intervenez-vous en dehors des heures de consultation ?',
        a: 'Oui. Nous intervenons tôt le matin, à la pause de midi si votre cabinet ferme, ou en soirée après le dernier patient. Le planning suit vos jours de consultation, y compris si vous n’exercez que certains jours de la semaine.',
      },
      {
        q: 'Nettoyez-vous le matériel médical ?',
        a: 'Le matériel médical et les dispositifs de soins restent sous la responsabilité des praticiens, qui appliquent leurs propres procédures. Nous prenons en charge l’environnement : mobilier, surfaces, points de contact, sanitaires et sols, selon le protocole défini ensemble.',
      },
    ],
    cta: {
      inlineTitle: 'Un protocole d’entretien pour votre cabinet ?',
      inlineText: `Précisez votre spécialité et vos jours de consultation. ${reply}`,
      bannerTitle: 'Un cabinet sain pour chaque patient.',
      bannerText: `Décrivez-nous votre cabinet : nous vous proposons un protocole adapté à votre spécialité et un devis clair ${site.quoteDelay}.`,
    },
  },

  /* ------------------------------------------------------------------ */
  'nettoyage-vitres': {
    metaTitle: 'Nettoyage de vitres professionnel à Montarnaud',
    metaDescription:
      'Nettoyage de vitres, baies vitrées, vitrines et cloisons pour entreprises à Montarnaud, Grabels, Juvignac et Montpellier ouest. Rendu sans traces, devis 24 h.',
    keyword: 'nettoyage de vitres',
    imageAlt: 'Laveur de vitres sur un escabeau nettoyant la façade vitrée d’un immeuble de bureaux avec une perche et une raclette',
    intro: [
      'Sous le soleil de l’Hérault, la moindre trace se voit sur une baie vitrée ou une vitrine : poussière, pollens, traces de pluie et marques de doigts ternissent vite vos surfaces vitrées. Netquoo assure le nettoyage de vitres pour les entreprises à Montarnaud et dans un rayon de 20 km : bureaux, commerces, halls d’accueil et vérandas professionnelles, de Grabels à Juvignac, Saint-Georges-d’Orques, Gignac ou Montpellier.',
      'Nous intervenons en intérieur comme en extérieur, en prestation régulière ou ponctuelle : vitres, encadrements, châssis, cloisons vitrées, portes et parois de verre. L’accès est étudié pour chaque site afin de travailler en toute sécurité. Les façades qui nécessiteraient des moyens d’accès spécifiques en hauteur font l’objet d’une étude au cas par cas, et le devis précise toujours ce qui sera réalisé.',
    ],
    includedIntro:
      'Une prestation complète, pas seulement le verre : nous traitons aussi tout ce qui encadre vos surfaces vitrées.',
    included: [
      {
        zone: 'Vitres et baies vitrées',
        icon: 'window',
        items: [
          'Lavage des vitres côté intérieur et côté extérieur',
          'Baies vitrées, fenêtres et portes-fenêtres',
          'Raclage soigné pour un rendu sans traces ni coulures',
          'Essuyage des bords et des joints',
        ],
      },
      {
        zone: 'Encadrements et châssis',
        icon: 'frame',
        items: [
          'Nettoyage des cadres, châssis et menuiseries',
          'Dépoussiérage des rails et des appuis de fenêtre',
          'Nettoyage des seuils et des bas de portes vitrées',
        ],
      },
      {
        zone: 'Vitrines et devantures',
        icon: 'store',
        items: [
          'Vitrines de commerce, côté intérieur et extérieur',
          'Portes d’entrée vitrées et leurs poignées',
          'Retrait des traces d’adhésifs et des vitrophanies de saison',
        ],
      },
      {
        zone: 'Cloisons et parois intérieures',
        icon: 'grid',
        items: [
          'Cloisons vitrées de bureaux et de salles de réunion',
          'Parois de verre, garde-corps vitrés et portes intérieures',
          'Miroirs et surfaces vitrées décoratives',
        ],
      },
      {
        zone: 'Vérandas et verrières',
        icon: 'sun',
        items: [
          'Vérandas professionnelles et espaces d’accueil vitrés',
          'Verrières et puits de lumière accessibles',
          'Dépoussiérage des structures et profilés accessibles',
        ],
      },
    ],
    frequenciesTitle: 'Un passage unique ou un programme annuel',
    frequenciesIntro:
      'L’exposition de vos vitrages, leur visibilité depuis la rue et l’environnement du site (circulation, végétation, poussières) orientent la fréquence que nous vous conseillons.',
    frequencies: [
      {
        label: 'Mensuelle',
        icon: 'repeat',
        text: 'Pour les vitrines et les entrées de commerces, très exposées aux traces et au regard des passants.',
      },
      {
        label: 'Trimestrielle',
        icon: 'calendar-check',
        text: 'Un rythme courant pour les bureaux : des vitres nettes toute l’année, avec un bon équilibre entre rendu et budget.',
      },
      {
        label: 'Semestrielle ou annuelle',
        icon: 'calendar',
        text: 'Pour les façades peu exposées, les verrières, ou en complément d’un entretien intérieur régulier.',
      },
      {
        label: 'Ponctuelle',
        icon: 'zap',
        text: 'Après des travaux, avant un événement ou un emménagement, ou après un épisode de pluies chargées de poussière.',
      },
    ],
    method: [
      {
        title: 'Étude de l’accès',
        text: 'Nous repérons les surfaces, les hauteurs, les accès et les contraintes du site (passage du public, stationnement, horaires) pour définir le matériel et les mesures de sécurité adaptés.',
      },
      {
        title: 'Préparation',
        text: 'Protection des sols et du mobilier proches des vitres intérieures ; balisage des zones de passage à l’extérieur lorsque c’est nécessaire.',
      },
      {
        title: 'Lavage et raclage',
        text: 'Mouillage, décollement des salissures, raclage puis essuyage des bords : une méthode rigoureuse pour un rendu net, sans traces ni auréoles.',
      },
      {
        title: 'Finitions et contrôle',
        text: 'Nettoyage des encadrements et des appuis, contrôle à contre-jour et retouches si besoin avant de quitter le site.',
      },
    ],
    benefits: [
      {
        title: 'Plus de lumière naturelle',
        icon: 'sun',
        text: 'Des vitres propres laissent entrer toute la lumière du Midi dans vos locaux et mettent vos espaces en valeur.',
      },
      {
        title: 'Une façade qui inspire confiance',
        icon: 'eye',
        text: 'Une devanture ou un hall impeccable renvoie l’image d’une entreprise attentive aux détails.',
      },
      {
        title: 'La sécurité avant tout',
        icon: 'shield',
        text: 'Accès étudiés à l’avance et travaux en hauteur réalisés uniquement avec des moyens adaptés : vos équipes n’ont plus à s’en charger.',
      },
      {
        title: 'Un service à la carte',
        icon: 'calendar',
        text: 'Passage unique ou programme annuel, intérieur seul ou intérieur et extérieur : vous choisissez, nous planifions.',
      },
    ],
    audience:
      'Toute entreprise disposant de surfaces vitrées peut nous en confier l’entretien, en prestation seule ou en complément d’un contrat de nettoyage de ses locaux.',
    faq: [
      {
        q: 'Nettoyez-vous les vitres en hauteur ?',
        a: 'Nous traitons les vitrages accessibles depuis le sol, à l’aide de perches ou d’équipements adaptés. Pour les façades d’immeuble ou les vitrages nécessitant une nacelle ou des techniques d’accès spécifiques, nous étudions votre site au cas par cas et vous indiquons clairement dans le devis ce qui peut être réalisé.',
      },
      {
        q: 'Pouvez-vous intervenir sur un commerce sans gêner la clientèle ?',
        a: 'Oui. Pour une vitrine ou une entrée de magasin, nous intervenons de préférence avant l’ouverture ou en dehors des pics de fréquentation, avec un balisage de la zone de travail lorsque c’est nécessaire.',
      },
      {
        q: 'Les encadrements et les rails sont-ils compris ?',
        a: 'Oui, la prestation inclut le nettoyage des cadres, des châssis et des appuis de fenêtre, ainsi que le dépoussiérage des rails. Le détail exact figure dans le devis pour éviter toute surprise.',
      },
      {
        q: 'Faut-il un contrat ou peut-on demander un passage unique ?',
        a: 'Les deux sont possibles. Vous pouvez commander un nettoyage ponctuel, après travaux ou avant un événement, ou mettre en place un passage régulier, mensuel, trimestriel ou semestriel, éventuellement combiné avec l’entretien de vos bureaux ou de votre commerce.',
      },
    ],
    cta: {
      inlineTitle: 'Des vitres nettes, sans y penser ?',
      inlineText: `Indiquez le type de vitrages et leur accès. ${reply}`,
      bannerTitle: 'Des vitres nettes, toute l’année.',
      bannerText: `Décrivez-nous vos surfaces vitrées : nous étudions l’accès et vous envoyons un devis clair ${site.quoteDelay}, sans engagement.`,
    },
  },

  /* ------------------------------------------------------------------ */
  'nettoyage-fin-de-chantier': {
    metaTitle: 'Nettoyage de fin de chantier à Montarnaud (34)',
    metaDescription:
      'Nettoyage de fin de chantier et remise en état après travaux à Montarnaud, Juvignac, Pignan et Montpellier : poussières, traces, vitres, sols prêts à livrer.',
    keyword: 'nettoyage de fin de chantier',
    imageAlt: 'Agente en tenue bleu marine passant l’aspirateur sur le sol d’un local professionnel neuf après travaux',
    intro: [
      'La fin des travaux laisse toujours derrière elle une fine poussière de plâtre, des traces de peinture, de colle ou de ciment et des résidus d’emballage. Netquoo réalise le nettoyage de fin de chantier de locaux professionnels à Montarnaud et dans un rayon de 20 km, à Juvignac, Pignan, Saint-Jean-de-Védas, Fabrègues, Gignac ou Montpellier, pour livrer ou occuper des locaux réellement prêts.',
      'Nous intervenons pour les entreprises du bâtiment, les promoteurs, les architectes et maîtres d’œuvre, mais aussi pour les entreprises qui s’installent dans des locaux neufs ou rénovés. Le nettoyage est planifié en coordination avec le calendrier du chantier : avant la réception des travaux, la remise des clés ou l’emménagement de vos équipes.',
    ],
    includedIntro:
      'Le périmètre est défini après visite, selon l’état du chantier et le niveau de finition attendu à la livraison.',
    included: [
      {
        zone: 'Dépoussiérage complet',
        icon: 'wind',
        items: [
          'Aspiration des poussières de plâtre et de ponçage sur toutes les surfaces',
          'Dépoussiérage des murs, plinthes, portes et huisseries',
          'Nettoyage des radiateurs, grilles de ventilation et luminaires accessibles',
        ],
      },
      {
        zone: 'Traces et résidus',
        icon: 'paint',
        items: [
          'Retrait des traces de peinture, colle, plâtre et ciment sur les surfaces dures',
          'Décollage des étiquettes, films de protection et adhésifs',
          'Nettoyage des interrupteurs, prises et poignées',
        ],
      },
      {
        zone: 'Vitres et menuiseries',
        icon: 'window',
        items: [
          'Nettoyage des vitres, encadrements et rails',
          'Retrait des projections de chantier sur les vitrages',
          'Nettoyage des portes et cloisons vitrées',
        ],
      },
      {
        zone: 'Sols',
        icon: 'layers',
        items: [
          'Aspiration puis lavage adapté au revêtement neuf : carrelage, béton, PVC, parquet',
          'Traitement des traces tenaces laissées par le chantier',
          'Nettoyage des escaliers et des parties communes',
        ],
      },
      {
        zone: 'Sanitaires et points d’eau',
        icon: 'droplets',
        items: [
          'Nettoyage et détartrage des lavabos, WC et faïences',
          'Retrait des résidus de joints et de silicone',
          'Nettoyage des robinetteries et des miroirs',
        ],
      },
      {
        zone: 'Petits déchets',
        icon: 'trash',
        items: [
          'Ramassage des emballages, cartons et films restants',
          'Gravats et déchets de chantier laissés à la charge des entreprises de travaux',
        ],
      },
    ],
    frequenciesTitle: 'Une intervention calée sur votre chantier',
    frequenciesIntro:
      'Un nettoyage de fin de chantier se planifie selon l’avancement des travaux. Selon l’ampleur du projet, nous proposons une ou plusieurs interventions.',
    frequencies: [
      {
        label: 'Nettoyage après travaux',
        icon: 'hard-hat',
        text: 'Un premier passage approfondi une fois les travaux terminés, pour retirer l’essentiel des poussières et des résidus.',
      },
      {
        label: 'Nettoyage de livraison',
        icon: 'key',
        text: 'Le passage de finition avant la réception ou la remise des clés : des locaux prêts à être visités et occupés.',
      },
      {
        label: 'Intervention par phases',
        icon: 'calendar-check',
        text: 'Pour les chantiers importants ou phasés : nettoyage par lot ou par étage, au fil de l’avancement.',
      },
      {
        label: 'Relais en entretien régulier',
        icon: 'repeat',
        text: 'Une fois les locaux occupés, nous pouvons en assurer l’entretien courant à la fréquence de votre choix.',
      },
    ],
    method: [
      {
        title: 'Visite du chantier',
        text: 'Nous évaluons la surface, la nature des salissures, les revêtements neufs à préserver et la date de livraison prévue.',
      },
      {
        title: 'Planification',
        text: 'L’intervention est calée avec le conducteur de travaux ou le maître d’œuvre, une fois les derniers corps d’état passés, pour ne pas avoir à refaire le travail.',
      },
      {
        title: 'Gros nettoyage, puis finitions',
        text: 'Dépoussiérage du haut vers le bas, retrait des résidus, lavage des vitres et des sols, puis passage de finition sur l’ensemble des surfaces.',
      },
      {
        title: 'Contrôle avant livraison',
        text: 'Nous faisons le tour des locaux avec vous ou votre représentant pour vérifier le résultat et traiter les éventuelles retouches.',
      },
    ],
    benefits: [
      {
        title: 'Des locaux prêts à livrer',
        icon: 'key',
        text: 'Vous remettez à votre client des locaux propres, qui valorisent la qualité des travaux réalisés.',
      },
      {
        title: 'Votre calendrier respecté',
        icon: 'calendar',
        text: 'Nous nous calons sur la date de réception ou d’emménagement et planifions l’intervention en conséquence.',
      },
      {
        title: 'Des revêtements neufs préservés',
        icon: 'shield',
        text: 'Méthodes et produits choisis pour ne pas abîmer les surfaces neuves : carrelage, parquet, menuiseries, robinetterie.',
      },
      {
        title: 'Un emménagement sans poussière',
        icon: 'sparkles',
        text: 'Vos équipes s’installent dans un environnement sain, sans poussière fine sur le mobilier ni sur le matériel informatique.',
      },
    ],
    audience:
      'Rénovation d’un plateau de bureaux, aménagement d’une cellule commerciale ou construction neuve : nous intervenons sur les chantiers de locaux professionnels et de programmes immobiliers autour de Montarnaud.',
    faq: [
      {
        q: 'Quand faut-il prévoir le nettoyage de fin de chantier ?',
        a: 'Idéalement une fois tous les corps de métier passés, quelques jours avant la réception ou l’emménagement. Contactez-nous dès que la date de livraison est connue : nous planifions l’intervention et, si nécessaire, un passage de finition juste avant la remise des clés.',
      },
      {
        q: 'Évacuez-vous les gravats ?',
        a: 'Non. Les gravats et déchets de chantier relèvent des entreprises de travaux. Nous ramassons en revanche les petits déchets restants (emballages, cartons, films de protection) dans le cadre du nettoyage.',
      },
      {
        q: 'Pouvez-vous retirer les traces de peinture et de ciment ?',
        a: 'Oui, sur les surfaces dures (vitres, carrelage, menuiseries, sanitaires), avec des méthodes adaptées à chaque matériau pour ne pas les rayer. Les traces les plus incrustées sont évaluées lors de la visite afin de vous indiquer le résultat que vous pouvez attendre.',
      },
      {
        q: 'Intervenez-vous après des travaux dans des locaux occupés ?',
        a: 'Oui. Après la rénovation d’un bureau, d’un commerce ou d’un cabinet, nous remettons en état les zones concernées, puis nous pouvons assurer l’entretien régulier des locaux si vous le souhaitez.',
      },
    ],
    cta: {
      inlineTitle: 'Une date de livraison à tenir ?',
      inlineText: `Indiquez la surface, le type de travaux et la date de réception. ${reply}`,
      bannerTitle: 'Des locaux prêts le jour de la livraison.',
      bannerText: `Parlez-nous de votre chantier : nous planifions la visite et vous envoyons un devis clair ${site.quoteDelay}, sans engagement.`,
    },
  },

  /* ------------------------------------------------------------------ */
  'nettoyage-entrepots': {
    metaTitle: 'Nettoyage d’entrepôts et ateliers à Montarnaud',
    metaDescription:
      'Nettoyage d’entrepôts, d’ateliers et de locaux d’activité à Montarnaud, Gignac, Fabrègues et Montpellier ouest : sols industriels, stockage, vestiaires.',
    keyword: 'nettoyage d’entrepôts',
    imageAlt: 'Agente conduisant une autolaveuse dans l’allée d’un entrepôt logistique aux rayonnages bien rangés',
    intro: [
      'Un entrepôt ou un atelier propre, c’est plus de sécurité pour vos équipes, une circulation des engins facilitée et une image professionnelle auprès de vos clients et transporteurs. Netquoo assure le nettoyage d’entrepôts et de locaux d’activité à Montarnaud et dans un rayon de 20 km, notamment dans les zones d’activités de l’ouest montpelliérain, de Gignac, de Fabrègues ou de Saint-Jean-de-Védas.',
      'Sols industriels, zones de stockage, quais, ateliers, vestiaires et bureaux attenants : nous traitons l’ensemble du site avec un matériel adapté aux grandes surfaces, y compris le lavage mécanisé des sols lorsque la configuration s’y prête. Les interventions sont organisées en fonction de vos flux logistiques et de vos horaires de production, pour ne jamais ralentir votre activité.',
    ],
    includedIntro:
      'Chaque site est différent : le programme est défini avec vous selon votre activité, vos surfaces et vos consignes de sécurité.',
    included: [
      {
        zone: 'Sols industriels et allées',
        icon: 'forklift',
        items: [
          'Balayage et lavage des sols béton ou résine',
          'Lavage mécanisé des grandes surfaces selon la configuration',
          'Traitement des taches et des traces de roulage courantes',
          'Entretien des allées de circulation et des cheminements piétons',
        ],
      },
      {
        zone: 'Stockage et quais',
        icon: 'package',
        items: [
          'Dépoussiérage des parties accessibles des racks et rayonnages',
          'Nettoyage des quais de chargement et des zones de réception',
          'Ramassage des films, feuillards et déchets d’emballage',
        ],
      },
      {
        zone: 'Ateliers',
        icon: 'wrench',
        items: [
          'Nettoyage des sols d’atelier et des abords des postes de travail',
          'Dépoussiérage des établis et surfaces accessibles, hors machines de production',
          'Vidage des poubelles et gestion des bacs selon vos filières de tri',
        ],
      },
      {
        zone: 'Vestiaires et sanitaires',
        icon: 'shower',
        items: [
          'Nettoyage et désinfection des douches, WC et lavabos',
          'Entretien des vestiaires, bancs et casiers (extérieur)',
          'Réapprovisionnement des consommables',
        ],
      },
      {
        zone: 'Bureaux et espaces de pause',
        icon: 'coffee',
        items: [
          'Entretien des bureaux administratifs attenants',
          'Nettoyage de la salle de pause et du coin repas',
          'Lavage des sols et vidage des corbeilles',
        ],
      },
    ],
    frequenciesTitle: 'Une fréquence par zone, selon votre activité',
    frequenciesIntro:
      'Sur un site d’activité, toutes les zones n’ont pas les mêmes besoins. Nous combinons plusieurs fréquences dans un même planning.',
    frequencies: [
      {
        label: 'Quotidienne ou plusieurs fois par semaine',
        icon: 'repeat',
        text: 'Sanitaires, vestiaires, espaces de pause et allées principales des sites à forte activité.',
      },
      {
        label: 'Hebdomadaire',
        icon: 'calendar-check',
        text: 'Lavage des sols de stockage, des quais et des ateliers, à un rythme adapté au niveau d’encrassement.',
      },
      {
        label: 'Mensuelle ou trimestrielle',
        icon: 'calendar',
        text: 'Nettoyage approfondi des zones peu fréquentées, dépoussiérage des racks accessibles et des surfaces hautes.',
      },
      {
        label: 'Ponctuelle',
        icon: 'zap',
        text: 'Remise en état avant un audit ou une visite client, après un inventaire, un réaménagement ou avant l’installation dans un nouveau local.',
      },
    ],
    method: [
      {
        title: 'Analyse du site',
        text: 'Surfaces, types de sols, flux d’engins et de piétons, zones sensibles et consignes de sécurité : nous définissons le plan d’intervention avec votre responsable de site.',
      },
      {
        title: 'Sécurité et coactivité',
        text: 'Les interventions sont programmées en dehors des pics d’activité, avec balisage des zones en cours de nettoyage et respect de votre plan de circulation.',
      },
      {
        title: 'Matériel adapté',
        text: 'Lavage mécanisé pour les grandes surfaces dégagées, nettoyage manuel pour les recoins, les vestiaires et les zones encombrées.',
      },
      {
        title: 'Suivi régulier',
        text: 'Un point régulier avec votre interlocuteur permet d’ajuster les fréquences selon la saisonnalité de votre activité et l’évolution du site.',
      },
    ],
    benefits: [
      {
        title: 'Une sécurité renforcée',
        icon: 'shield',
        text: 'Des allées propres et dégagées limitent les risques de glissade et facilitent la circulation des engins de manutention.',
      },
      {
        title: 'Stocks et matériel préservés',
        icon: 'package',
        text: 'Moins de poussière sur vos marchandises, vos emballages et vos équipements.',
      },
      {
        title: 'Une activité non perturbée',
        icon: 'clock',
        text: 'Des interventions planifiées selon vos horaires de production et vos créneaux de réception ou d’expédition.',
      },
      {
        title: 'Des équipes bien accueillies',
        icon: 'users',
        text: 'Vestiaires, sanitaires et espaces de pause propres : un vrai plus pour le confort de vos collaborateurs au quotidien.',
      },
    ],
    audience:
      'Plateformes logistiques, ateliers d’artisans, PME industrielles ou locaux mixtes associant stockage et bureaux : la prestation est adaptée à la configuration de votre site.',
    faq: [
      {
        q: 'Pouvez-vous intervenir pendant que l’entrepôt est en activité ?',
        a: 'Oui, en respectant votre plan de circulation et vos consignes de sécurité : les zones en cours de nettoyage sont balisées et les interventions sont programmées en dehors des pics d’activité. Nous pouvons aussi intervenir tôt le matin, en soirée ou le week-end sur demande.',
      },
      {
        q: 'Nettoyez-vous les machines de production ?',
        a: 'Non. Les machines et équipements de production restent sous la responsabilité de vos équipes ou de leurs mainteneurs. Nous entretenons l’environnement de travail : sols, surfaces accessibles, vestiaires, sanitaires et espaces de pause.',
      },
      {
        q: 'Le nettoyage des racks en hauteur est-il possible ?',
        a: 'Nous dépoussiérons les parties accessibles des racks et rayonnages. Pour les niveaux élevés, qui demandent un équipement d’accès spécifique et le dégagement des marchandises, nous étudions la faisabilité avec vous lors de la visite.',
      },
      {
        q: 'Les bureaux situés dans l’entrepôt peuvent-ils être inclus ?',
        a: 'Oui. Bureaux administratifs, salle de pause, vestiaires et sanitaires peuvent être intégrés au même contrat que les zones de stockage : un seul interlocuteur et un seul planning pour tout votre site.',
      },
    ],
    cta: {
      inlineTitle: 'Un plan de nettoyage pour votre site ?',
      inlineText: `Indiquez la surface, le type de sols et vos horaires d’activité. ${reply}`,
      bannerTitle: 'Un site propre, une activité qui tourne.',
      bannerText: `Décrivez-nous votre entrepôt ou votre atelier : nous vous proposons un plan d’intervention et un devis clair ${site.quoteDelay}.`,
    },
  },
};

export function getServiceContent(slug: string): ServiceContent | undefined {
  return servicesContent[slug];
}
