import { getLocalizedPagePath } from '~/i18n/routes';
import {
  buildCfpImportantDates,
  buildCfpStatuses,
  cfpSchedule,
  cfpSubmissionUrl,
  eventMeta,
  formatEventDate,
} from '../../meta/event';

const eventDate = formatEventDate('fr');
const venueDescription = eventMeta.place
  ? `Le KCD Provence se tiendra au ${eventMeta.venueName}. Vous profiterez de salles de conférence modernes, d'un espace exposition pour les sponsors, et de nombreuses zones de networking. Café et restauration seront disponibles tout au long de la journée, et un afterparty vous attend en fin de journée !`
  : `Le KCD Provence aura lieu à ${eventMeta.city}. Le lieu exact sera annoncé prochainement, avec les informations pratiques sur l'accès, l'hébergement et l'organisation sur place.`;

export default {
  metadata: {
    title: 'Kubernetes Community Days Provence à Aix-en-Provence',
    description: `Rejoignez 600+ professionnels du Cloud Native le ${eventDate} au ${eventMeta.venueName} pour une journée de conférences, workshops et networking.`,
    ignoreTitleTemplate: true,
  },
  hero: {
    actions: [
      {
        variant: 'primary',
        text: 'Billetterie',
        href: getLocalizedPagePath('fr', 'contact'),
        icon: 'tabler:calendar',
      },
      { text: 'Proposer un talk', href: '#cfp' },
    ],
    image: {
      light: {
        src: '~/assets/images/logos/logo-kcd-provence-primary.svg',
        alt: 'Logo Kubernetes Community Days Provence Principal',
        width: 500,
        height: 500,
      },
      dark: {
        src: '~/assets/images/logos/logo-kcd-provence-white.svg',
        alt: 'Logo Kubernetes Community Days Provence Blanc',
        width: 500,
        height: 500,
      },
    },
    badge: `${eventDate} · ${eventMeta.city}`,
    title: {
      main: 'Kubernetes Community Days',
      subtitle: 'Provence',
    },
    subtitle: `Réservez la date ! Le ${eventDate}, la communauté Cloud Native se retrouve au ${eventMeta.venueName} pour une journée de talks, de networking et de convivialité sous le soleil de Provence.`,
    eventDate: eventMeta.startsAt,
  },
  note: {
    title: 'Notre philosophie :',
    description: 'Communauté, Partage et Technologies Open Source',
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
      "KCD Provence est une conférence communautaire qui rassemble développeurs, plateform engineers et professionnels IT passionnés par les technologies Cloud Native. Organisé par l'association Cloud Native Provence, cet événement s'inscrit dans le réseau mondial des Kubernetes Community Days soutenu par la CNCF.",
    paragraph2:
      "Pendant une journée, vous profiterez de talks inspirants donnés par des experts, d'ateliers pratiques pour approfondir vos compétences, d'un espace exposition pour découvrir les acteurs de l'écosystème, et de nombreux moments d'échange dans un cadre exceptionnel.",
    stats: [
      { amount: '600+', title: 'Participants attendus' },
      { amount: '1', title: 'Journée de talks & workshops' },
      { amount: '∞', title: 'Opportunités de networking' },
    ],
    whatToExpect: {
      title: 'Au programme',
      items: [
        {
          title: 'Conférences',
          description:
            "Des talks de 10 à 30 minutes par des speakers nationaux et internationaux, du retour d'expérience au deep-dive technique.",
          icon: 'tabler:microphone',
        },
        {
          title: 'Networking',
          description:
            'Pauses café, déjeuner inclus et afterparty pour créer des connexions durables avec la communauté.',
          icon: 'tabler:users-group',
        },
        {
          title: 'Expo Sponsors',
          description:
            'Un espace dédié aux entreprises partenaires pour échanger, découvrir des outils et repartir avec du swag.',
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
          title: 'Diversité & Inclusion',
          description: 'Un événement ouvert à toutes et tous, dans le respect du Code de Conduite CNCF.',
          icon: 'tabler:users',
        },
      ],
    },
  },
  cfp: {
    id: 'cfp',
    title: 'Appel à conférenciers',
    intro:
      "Partagez vos retours d'expérience, démos et apprentissages avec la communauté cloud native en Provence. Nous cherchons des talks courts, concrets et utiles pour aider les participantes et participants à concevoir, exploiter et améliorer leurs plateformes.",
    availability: {
      ...cfpSchedule,
      statuses: buildCfpStatuses('fr'),
    },
    importantDates: {
      title: 'Dates importantes',
      items: buildCfpImportantDates('fr', {
        opens: 'Ouverture du CFP',
        closes: 'Clôture du CFP',
        speakersNotified: 'Notification des speakers',
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
          description: 'Outils, workflows, feedback loops et confort des développeuses et développeurs.',
        },
        {
          title: 'IA',
          description: 'LLM, plateformes IA, inférence et IA dans les systèmes cloud native.',
        },
        {
          title: 'Sécurité',
          description: 'Identité, policy, supply chain logicielle et protection runtime.',
        },
        {
          title: 'Réseau',
          description: 'Ingress, gateways, réseau de services, trafic et performance.',
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
          title: 'Short talk (10 minutes)',
          description: '10 minutes pour partager une idée forte, une démo ou un retour précis.',
        },
        {
          title: 'Lightning Talk (5 minutes)',
          description: '5 minutes pour transmettre une idée, une astuce ou une histoire avec énergie.',
        },
      ],
    },
    speakerPerks: {
      title: 'Avantages speakers',
      items: [
        "Pass speaker gratuit pour l'événement",
        "Dîner des speakers la veille de l'événement",
        'Enregistrement vidéo de votre talk',
      ],
    },
    guidelines: {
      title: 'Quelques règles',
      items: [
        'Les talks peuvent être en français ou en anglais',
        "Pas de pitch commercial, nous voulons du contenu authentique et du retour d'expérience",
        'Maximum 2 soumissions par speaker',
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
    venueName: eventMeta.venueName,
    description: venueDescription,
    howToGetThere: {
      title: 'Comment venir',
      items: [
        {
          title: 'En voiture',
          description:
            "Parking à proximité. Aix-en-Provence est accessible par l'autoroute A8 (sortie Aix-en-Provence).",
          icon: 'tabler:car',
        },
        {
          title: 'En train',
          description:
            'Gare Aix-en-Provence TGV à ~15 min en navette. Connexions directes depuis Paris (3h), Lyon (1h30), Marseille (15 min).',
          icon: 'tabler:train',
        },
        {
          title: 'En avion',
          description: 'Aéroport Marseille Provence (MRS) à ~30 min. Navettes et taxis disponibles.',
          icon: 'tabler:plane',
        },
      ],
    },
    accommodation: {
      title: 'Hébergements',
      text: "Aix-en-Provence offre un large choix d'hôtels et d'hébergements. Une liste de recommandations sera publiée prochainement.",
    },
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
