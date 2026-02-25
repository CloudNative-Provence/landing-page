export default {
  metadata: {
    title: 'About',
  },
  hero: {
    tagline: 'Cloud Native Provence',
    title: 'The association behind <br /><span class="text-accent dark:text-white">Cloud Native events in Provence</span>',
    subtitle:
      'Cloud Native Provence is a non-profit association whose main purpose is to organize technical events dedicated to knowledge sharing and exchanges around Cloud Native technologies.',
    imageAlt: 'Cloud Native & Kubernetes',
  },
  team: {
    title: 'Who are we?',
    subtitle: 'A team of enthusiasts who animate the Cloud Native community in Provence',
    tagline: 'Team',
  },
  objectives: {
    title: 'Our mission',
    subtitle:
      'Cloud Native Provence organizes technical events to bring together the local community around Cloud Native technologies.',
    items: [
      {
        title: 'Technical events',
        description:
          'Organizing events dedicated to knowledge sharing and exchanges around Cloud Native technologies, such as KCD Provence.',
        icon: 'tabler:calendar-event',
      },
      {
        title: 'Knowledge sharing',
        description: 'Technical talks to discover, learn and deepen Cloud Native practices at all levels.',
        icon: 'tabler:book',
      },
      {
        title: 'Community building',
        description: 'Encouraging exchanges between developers, engineers, architects and enthusiasts in Provence.',
        icon: 'tabler:users',
      },
    ],
  },
  values: {
    title: 'Our values',
    subtitle: 'Driven by the community, Cloud Native Provence defends values of sharing, inclusiveness and openness.',
    items: [
      {
        title: 'Community',
        description: 'Non-profit association, run by volunteers and open to all enthusiasts.',
      },
      {
        title: 'Accessibility',
        description: 'Events accessible to everyone, from beginners to experts.',
      },
      {
        title: 'Quality',
        description: 'Carefully curated content, without intrusive commercial approach.',
      },
    ],
  },
  location: {
    title: 'Where we operate',
    tagline: 'Based in Provence',
    items: [
      {
        title: 'Provence region, France',
        description: 'The association organizes its events in the Provence region, with Aix-en-Provence as its main hub.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    tagline: 'The Cloud Native Provence team',
    items: [
      {
        title: 'Write to us',
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
