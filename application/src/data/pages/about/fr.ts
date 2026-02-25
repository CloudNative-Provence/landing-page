export default {
  metadata: {
    title: 'À propos',
  },
  hero: {
    tagline: 'Cloud Native Provence',
    title: "L'association derrière <br /><span class=\"text-accent dark:text-white\">les événements Cloud Native en Provence</span>",
    subtitle:
      "Cloud Native Provence est une association à but non lucratif dont l'objet principal est l'organisation d'événements techniques dédiés au partage de connaissances et aux échanges autour des technologies Cloud Native.",
    imageAlt: 'Cloud Native & Kubernetes',
  },
  team: {
    title: 'Qui sommes-nous ?',
    subtitle: 'Une équipe de passionnés qui anime la communauté Cloud Native en Provence',
    tagline: 'Équipe',
  },
  objectives: {
    title: 'Notre mission',
    subtitle:
      "Cloud Native Provence organise des événements techniques pour rassembler la communauté autour des technologies Cloud Native.",
    items: [
      {
        title: 'Événements techniques',
        description:
          "Organisation d'événements dédiés au partage de connaissances et aux échanges autour des technologies Cloud Native, comme le KCD Provence.",
        icon: 'tabler:calendar-event',
      },
      {
        title: 'Partage de connaissances',
        description: 'Des contenus techniques pour découvrir, apprendre et approfondir les pratiques Cloud Native, pour tous les niveaux.',
        icon: 'tabler:book',
      },
      {
        title: 'Vie communautaire',
        description: 'Favoriser les échanges entre développeurs, ingénieurs, architectes et passionnés en Provence.',
        icon: 'tabler:users',
      },
    ],
  },
  values: {
    title: 'Nos valeurs',
    subtitle:
      "Portée par la communauté, Cloud Native Provence défend des valeurs de partage, d'inclusivité et d'ouverture.",
    items: [
      {
        title: 'Communauté',
        description: "Association à but non lucratif, animée par des bénévoles et ouverte à tous les passionnés.",
      },
      {
        title: 'Accessibilité',
        description: 'Des événements accessibles à toutes et tous, du débutant à l\'expert.',
      },
      {
        title: 'Qualité',
        description: 'Des contenus sélectionnés avec soin, sans démarche commerciale intrusive.',
      },
    ],
  },
  location: {
    title: 'Notre territoire',
    tagline: 'Basés en Provence',
    items: [
      {
        title: 'Région Provence, France',
        description: "L'association organise ses événements en région Provence, avec Aix-en-Provence comme principal centre d'activité.",
      },
    ],
  },
  contact: {
    title: 'Contact',
    tagline: "L'équipe Cloud Native Provence",
    items: [
      {
        title: 'Écrivez-nous',
        description: 'info@cloudnative-provence.fr',
        icon: 'tabler:mail',
      },
      {
        title: 'Sponsoring',
        description: 'sponsors@cloudnative-provence.fr',
        icon: 'tabler:briefcase',
      },
    ],
  },
} as const;
