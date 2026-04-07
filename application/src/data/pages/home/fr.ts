import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: 'Kubernetes Community Days Provence à Aix-en-Provence',
    description:
      "Rejoignez 600+ professionnels du Cloud Native le 10 décembre 2026 au Palais des Congrès d'Aix-en-Provence pour une journée de conférences, workshops et networking.",
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
    badge: '10 décembre 2026 · Aix-en-Provence',
    title: {
      main: 'Kubernetes Community Days',
      subtitle: 'Provence',
    },
    subtitle:
      "Réservez la date ! Le 10 décembre 2026, la communauté Cloud Native se retrouve au Palais des Congrès d'Aix-en-Provence pour une journée de talks, de networking et de convivialité sous le soleil de Provence.",
    eventDate: '2026-12-10T09:00:00',
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
      "C'est le moment de devenir speaker au KCD Provence ! Envoyez-nous vos propositions de talks et partagez votre expertise avec la communauté Cloud Native.",
    status: 'Ouvre le 15 mai',
    importantDates: {
      title: 'Dates importantes',
      items: [
        { label: 'Ouverture du CFP', date: '15 mai 2026' },
        { label: 'Clôture du CFP', date: '15 juillet 2026' },
        { label: 'Notification des speakers', date: '1er septembre 2026' },
        { label: 'Jour J', date: '10 décembre 2026' },
      ],
    },
    tracks: {
      title: 'Thématiques',
      list: [
        'Kubernetes & Conteneurs',
        'Platform Engineering',
        'Observabilité & Monitoring',
        'Sécurité',
        'IA/ML & Cloud Native',
        'Developer Experience',
        'Cloud Native 101',
        'Sustainability & FinOps',
      ],
    },
    formats: {
      title: 'Formats acceptés',
      items: [
        {
          title: 'Conférence (30 minutes)',
          description:
            "Venez partager votre passion Cloud Native dans ce format de présentation de 30 minutes. De votre retour d'expérience sur le Platform Engineering à la présentation du dernier outil OSS tendance, il y a de la place pour de nombreux sujets.",
        },
        {
          title: 'Short talk (10 minutes)',
          description:
            'Format challengeant où vous devez vous concentrer sur un sujet qui vous tient à cœur, que ce soit une démo de live coding ou des conseils pour être un développeur plus heureux.',
        },
        {
          title: 'Lightning Talk (5 minutes)',
          description:
            "Le format le plus challengeant, 5 minutes c'est court mais vous seriez surpris de la quantité d'informations ou de passion que vous pouvez transmettre en si peu de temps. Relevez le défi.",
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
    ctaHref: 'https://conference-hall.io/cloud-native-provence-2026',
    ctaDisabled: true,
    image: {
      src: '~/assets/images/pages/home/event.jpg',
      alt: 'Appel à conférenciers',
    },
  },

  venue: {
    title: 'Le lieu',
    venueName: 'Palais des Congrès, Aix-en-Provence',
    description:
      "Le KCD Provence se tiendra au Palais des Congrès d'Aix-en-Provence. Vous profiterez de salles de conférence modernes, d'un espace exposition pour les sponsors, et de nombreuses zones de networking. Café et restauration seront disponibles tout au long de la journée, et un afterparty vous attend en fin de journée !",
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
