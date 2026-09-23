import {
  buildCfpImportantDates,
  buildCfpStatuses,
  cfpSchedule,
  cfpSubmissionUrl,
  eventMeta,
  formatEventDate,
  getEventPlace,
  getVenueInfo,
  getVenueName,
} from '~/domains/event/config/event';
import { getLocalizedPagePath } from '~/i18n/routes';

const eventDate = formatEventDate('fr');
const venueName = getVenueName('fr');
const venuePlace = getEventPlace('fr');
const venueInfo = getVenueInfo('fr');
const venueDescription = venuePlace
  ? `Le KCD Provence se tiendra au ${venueName}. Le lieu se situe au ${venueInfo.address}, à deux pas du centre historique, desservi par les transports en commun et proche des accès routiers. Vous profiterez de salles modernes, d'un espace sponsors et de nombreux espaces d'échange tout au long de la journée.`
  : `Le KCD Provence aura lieu à ${eventMeta.city}. Le lieu exact sera annoncé prochainement, avec les informations pratiques sur l'accès, l'hébergement et l'organisation sur place.`;

export default {
  metadata: {
    title: 'Kubernetes Community Days Provence à Aix-en-Provence',
    description: `Rejoignez plus de 600 professionnels du Cloud Native le ${eventDate} au ${venueName} pour une journée de conférences, d'ateliers et d'échanges.`,
    ignoreTitleTemplate: true,
  },
  hero: {
    actions: [
      {
        variant: 'primary',
        text: 'Billetterie',
        href: 'https://community2.cncf.io/events/details/cncf-kcd-provence-presents-kcd-provence-2026/',
        icon: 'tabler:calendar',
      },
      { text: 'Proposer une conférence', href: '#cfp' },
    ],
    image: {
      light: {
        src: '~/assets/images/logos/logo-kcd-provence-primary.svg',
        alt: 'Logo principal Kubernetes Community Days Provence',
        width: 500,
        height: 500,
      },
      dark: {
        src: '~/assets/images/logos/logo-kcd-provence-white.svg',
        alt: 'Logo blanc Kubernetes Community Days Provence',
        width: 500,
        height: 500,
      },
    },
    badge: `${eventDate} · ${eventMeta.city}`,
    title: {
      main: 'Kubernetes Community Days',
      subtitle: 'Provence',
    },
    subtitle: `Réservez la date ! Le ${eventDate}, la communauté Cloud Native se retrouve au ${venueName} pour une journée de conférences, d'échanges et de convivialité sous le soleil de Provence.`,
    eventDate: eventMeta.startsAt,
  },
  note: {
    title: 'Notre philosophie : ',
    description: 'Communauté, partage et technologies open source',
  },
  countdownLabels: {
    days: 'jours',
    hours: 'heures',
    minutes: 'minutes',
    seconds: 'secondes',
  },
  about: {
    id: 'about',
    title: "L'événement",
    intro:
      "KCD Provence est une conférence communautaire qui rassemble développeurs, ingénieurs plateforme et professionnels de l'informatique passionnés par les technologies Cloud Native. Organisé par l'association Cloud Native Provence, cet événement s'inscrit dans le réseau mondial des Kubernetes Community Days soutenu par la CNCF.",
    paragraph2:
      "Pendant une journée, vous profiterez de conférences inspirantes données par des experts, d'ateliers pratiques pour approfondir vos compétences, d'un espace d'exposition pour découvrir les acteurs de l'écosystème et de nombreux moments d'échange dans un cadre exceptionnel.",
    stats: [
      { amount: '600+', title: 'Participants attendus' },
      { amount: '1', title: "Journée de conférences et d'ateliers" },
      { amount: '∞', title: "Occasions d'échanger" },
    ],
    whatToExpect: {
      title: 'Au programme',
      items: [
        {
          title: 'Conférences',
          description:
            "Des conférences de 10 à 30 minutes par des intervenants nationaux et internationaux, du retour d'expérience à l'exploration technique approfondie.",
          icon: 'tabler:microphone',
        },
        {
          title: 'Rencontres et échanges',
          description:
            'Pauses café, déjeuner inclus et soirée de clôture pour créer des liens durables avec la communauté.',
          icon: 'tabler:users-group',
        },
        {
          title: 'Espace sponsors',
          description:
            'Un espace dédié aux entreprises partenaires pour échanger, découvrir des outils et repartir avec des cadeaux.',
          icon: 'tabler:building',
        },
      ],
    },
    values: {
      title: 'Nos valeurs',
      items: [
        {
          title: 'Collaboration',
          description: 'Le partage des connaissances est au cœur de notre communauté.',
          icon: 'tabler:heart-handshake',
        },
        {
          title: 'Accessibilité',
          description: "Des contenus pour tous les niveaux, du débutant à l'expert.",
          icon: 'tabler:accessible',
        },
        {
          title: 'Diversité et inclusion',
          description: 'Un événement ouvert à toutes et tous, dans le respect du code de conduite de la CNCF.',
          icon: 'tabler:users',
        },
      ],
    },
  },
  cfp: {
    id: 'cfp',
    title: 'Appel à conférenciers',
    intro:
      "Partagez vos retours d'expérience, démos et apprentissages avec la communauté cloud native en Provence. Nous cherchons des présentations courtes, concrètes et utiles pour aider les participantes et participants à concevoir, exploiter et améliorer leurs plateformes.",
    availability: {
      ...cfpSchedule,
      statuses: buildCfpStatuses('fr'),
    },
    importantDates: {
      title: 'Dates importantes',
      items: buildCfpImportantDates('fr', {
        opens: 'Ouverture du CFP',
        closes: 'Clôture du CFP',
        speakersNotified: 'Notification des intervenants',
        eventDay: 'Jour J',
      }),
    },
    topics: {
      title: 'Thématiques',
      items: [
        {
          title: 'Observabilité',
          description: 'Monitoring, tracing, logs, SLO et compréhension de la production.',
        },
        {
          title: 'Platform Engineering',
          description: 'Plateformes internes, self-service et golden paths pour les équipes.',
        },
        {
          title: 'Infra, Kubernetes & Cloud',
          description: 'Infrastructure, clusters, opérations et architecture cloud.',
        },
        {
          title: 'Communauté',
          description: 'Open source, transmission, inclusion et vie de la communauté.',
        },
        {
          title: 'Developer Experience',
          description: 'Outils, workflows, boucles de rétroaction et confort des développeuses et développeurs.',
        },
        {
          title: 'IA',
          description: 'LLM, plateformes IA, inférence et IA dans les systèmes cloud native.',
        },
        {
          title: 'Sécurité',
          description:
            "Identité, politiques de sécurité, chaîne d'approvisionnement logicielle et protection à l'exécution.",
        },
        {
          title: 'Réseau',
          description: 'Ingress, passerelles, réseau de services, trafic et performance.',
        },
      ],
    },
    formats: {
      title: 'Formats acceptés',
      items: [
        {
          title: 'Conférence (30 minutes)',
          description: '30 minutes pour approfondir un sujet avec du contexte, une démo et des retours utiles.',
        },
        {
          title: 'Conférence courte (10 minutes)',
          description: '10 minutes pour partager une idée forte, une démo ou un retour précis.',
        },
        {
          title: 'Présentation éclair (5 minutes)',
          description: '5 minutes pour transmettre une idée, une astuce ou une histoire avec énergie.',
        },
      ],
    },
    speakerPerks: {
      title: 'Avantages pour les intervenants',
      items: [
        "Billet intervenant gratuit pour l'événement",
        "Dîner des intervenants la veille de l'événement",
        'Enregistrement vidéo de votre présentation',
      ],
    },
    guidelines: {
      title: 'Quelques règles',
      items: [
        'Les présentations peuvent être en français ou en anglais',
        "Pas de discours commercial, nous voulons du contenu authentique et du retour d'expérience",
        'Maximum 2 propositions par intervenant',
        'Les propositions ne seront plus modifiables après soumission',
      ],
    },
    cta: 'Soumettre via Conference HALL',
    ctaHref: cfpSubmissionUrl,
    image: {
      src: '~/assets/images/pages/home/event.jpg',
      alt: 'Appel à conférenciers',
    },
  },

  venue: {
    title: 'Le lieu',
    venueName: venueName,
    description: venueDescription,
    ctas: [
      {
        text: 'Voir comment venir',
        href: getLocalizedPagePath('fr', 'practical-info', 'getting-there'),
        variant: 'primary',
        icon: 'tabler:route',
      },
      {
        text: 'Trouver un parking',
        href: getLocalizedPagePath('fr', 'practical-info', 'parking'),
        variant: 'secondary',
        icon: 'tabler:parking',
      },
      {
        text: 'Trouver un hébergement',
        href: getLocalizedPagePath('fr', 'practical-info', 'accommodation'),
        variant: 'secondary',
        icon: 'tabler:bed',
      },
    ],
  },
  callToAction: {
    actions: [
      {
        variant: 'primary',
        text: 'Nous contacter',
        href: getLocalizedPagePath('fr', 'contact'),
        icon: 'tabler:mail',
      },
    ],
    title: "Rejoignez l'aventure !",
    subtitle:
      'Vous êtes passionné, entreprise, conférencier ou curieux ? Contactez-nous pour participer à Cloud Native Provence.',
  },
} as const;
