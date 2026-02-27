import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: 'KCD Provence 2026 - Kubernetes Community Days Provence in Aix-en-Provence',
    description:
      'Join 600+ cloud native professionals on December 10, 2026 at the Palais des Congrès in Aix-en-Provence for a day of talks, workshops, and networking.',
    ignoreTitleTemplate: true,
  },
  hero: {
    actions: [
      {
        variant: 'primary',
        text: 'Get Tickets',
        href: getLocalizedPagePath('en', 'contact'),
        icon: 'tabler:calendar',
      },
      { text: 'Submit a Talk', href: '#cfp' },
    ],
    image: { src: '~/assets/images/hero-image.png', alt: 'Cloud Native Provence Image' },
    badge: 'December 10, 2026 · Aix-en-Provence',
    title: {
      main: 'Kubernetes Community Days',
      subtitle: 'Provence',
    },
    subtitle:
      'Mark your calendars! On December 10, 2026, the Cloud Native community gathers at the Palais des Congrès in Aix-en-Provence for a day of exciting talks, networking, and good vibes under the Provençal sun.',
    eventDate: '2026-12-10T09:00:00',
  },
  note: {
    title: 'Our philosophy:',
    description: 'Community, Sharing and Open Source Technologies',
  },
  countdownLabels: {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
  },
  about: {
    id: 'about',
    title: 'The Event',
    intro:
      'KCD Provence  is a community-driven conference bringing together developers, platform engineers, and IT professionals who are passionate about cloud native technologies. Organized by the Cloud Native Provence association, this event is part of the global Kubernetes Community Days network backed by the CNCF.',
    paragraph2:
      "Over the course of one day, you'll enjoy inspiring talks by expert speakers, hands-on workshops to sharpen your skills, a sponsor expo to discover ecosystem players, and plenty of networking moments in an exceptional setting.",
    stats: [
      { amount: '600+', title: 'Expected attendees' },
      { amount: '1', title: 'Day of talks & workshops' },
      { amount: '∞', title: 'Networking opportunities' },
    ],
    whatToExpect: {
      title: 'What to Expect',
      items: [
        {
          title: 'Talks',
          description:
            '10-30-minute presentations by national and international speakers, from real-world experience to technical deep-dives.',
          icon: 'tabler:microphone',
        },
        {
          title: 'Networking',
          description: 'Coffee breaks, included lunch, and afterparty to build lasting connections with the community.',
          icon: 'tabler:users-group',
        },
        {
          title: 'Sponsor Expo',
          description:
            'A dedicated space for partner companies to showcase their tools, exchange ideas, and hand out swag.',
          icon: 'tabler:building',
        },
      ],
    },
    values: {
      title: 'Our Values',
      items: [
        {
          title: 'Collaboration',
          description: 'Knowledge sharing is at the heart of our community.',
          icon: 'tabler:heart-handshake',
        },
        {
          title: 'Accessibility',
          description: 'Content for all levels, from beginner to expert.',
          icon: 'tabler:accessible',
        },
        {
          title: 'Diversity & Inclusion',
          description: 'An event open to everyone, guided by the CNCF Code of Conduct.',
          icon: 'tabler:users',
        },
      ],
    },
  },
  cfp: {
    id: 'cfp',
    title: 'Call for Papers',
    intro:
      'Now is your chance to become a speaker at KCD Provence! Send us your talk proposals and share your cloud native expertise with the community.',
    status: 'Opens 15th of May',
    importantDates: {
      title: 'Important Dates',
      items: [
        { label: 'CFP Opens', date: 'May 15, 2026' },
        { label: 'CFP Closes', date: 'July 15, 2026' },
        { label: 'Speakers Notified', date: 'September 1, 2026' },
        { label: 'Event Day', date: 'December 10, 2026' },
      ],
    },
    tracks: {
      title: 'Topics',
      list: [
        'Kubernetes & Containers',
        'Platform Engineering',
        'Observability & Monitoring',
        'Security & Policy',
        'AI/ML & Cloud Native',
        'Developer Experience',
        'Cloud Native 101',
        'Sustainability & FinOps',
      ],
    },
    formats: {
      title: 'Accepted Formats',
      items: [
        {
          title: 'Conference (30 minutes)',
          description:
            'Come share your Cloud Native passion in this 30 minutes presentation format. From your Return On Experience with Platform Engineering to showing us the latest and coolest OSS Tool, there is room for a lot of topics.',
        },
        {
          title: 'Short talk (10 minutes)',
          description:
            'Challenging format where you need to focus on one topic that matters for you, from doing a live coding demo to sharing tips on how to be a happier developer.',
        },
        {
          title: 'Lightning Talk (5 minutes)',
          description:
            'The most challenging format, 5 minutes is short but you would be amazed by the amount of info or passion you can transmit in such a short time. Take the challenge.',
        },
      ],
    },
    speakerPerks: {
      title: 'Speaker Perks',
      items: [
        'Free speaker pass for the event',
        'Speakers dinner the evening before the event',
        'Video recording of your talk',
      ],
    },
    guidelines: {
      title: 'Guidelines',
      items: [
        'Talks can be in French or English',
        'No vendor pitches - we want authentic content and real-world experience',
        'Maximum 2 submissions per speaker',
        'Submissions cannot be edited after submitting',
      ],
    },
    cta: 'Submit via Conference HALL',
    ctaHref: 'https://conference-hall.io/cloud-native-provence-2026',
    image: {
      src: '~/assets/images/event.jpg',
      alt: 'Call for Papers',
    },
  },

  venue: {
    title: 'Venue',
    venueName: 'Palais des Congrès, Aix-en-Provence',
    description:
      "KCD Provence will be held at the Palais des Congrès in Aix-en-Provence. You'll enjoy modern conference rooms, a sponsor expo area, and plenty of networking spaces. Coffee and food will be available throughout the day, and an afterparty awaits at the end of the day!",
    howToGetThere: {
      title: 'Getting There',
      items: [
        {
          title: 'By Car',
          description:
            'Parking available nearby. Aix-en-Provence is accessible via the A8 motorway (exit Aix-en-Provence).',
          icon: 'tabler:car',
        },
        {
          title: 'By Train',
          description:
            'Aix-en-Provence TGV station is ~15 min by shuttle. Direct connections from Paris (3h), Lyon (1h30), Marseille (15 min).',
          icon: 'tabler:train',
        },
        {
          title: 'By Plane',
          description: 'Marseille Provence Airport (MRS) is ~30 min away. Shuttles and taxis available.',
          icon: 'tabler:plane',
        },
      ],
    },
    accommodation: {
      title: 'Accommodation',
      text: 'Aix-en-Provence offers a wide range of hotels and accommodation. A list of recommendations will be published soon.',
    },
  },
  callToAction: {
    actions: [
      {
        variant: 'primary',
        text: 'Contact us',
        href: getLocalizedPagePath('en', 'contact'),
        icon: 'tabler:mail',
      },
    ],
    title: 'Join the adventure!',
    subtitle:
      'Are you an enthusiast, a company, a speaker or curious? Contact us to participate in Cloud Native Provence.',
  },
} as const;
