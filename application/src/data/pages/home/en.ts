import { getLocalizedPagePath } from '~/i18n/routes';
import {
  buildCfpImportantDates,
  buildCfpStatuses,
  cfpSchedule,
  cfpSubmissionUrl,
  eventMeta,
  formatEventDate,
} from '../../meta/event';

const eventDate = formatEventDate('en');
const venueDescription = eventMeta.place
  ? `KCD Provence will be held at ${eventMeta.venueName}. You'll enjoy modern conference rooms, a sponsor expo area, and plenty of networking spaces. Coffee and food will be available throughout the day, and an afterparty awaits at the end of the day!`
  : `KCD Provence will take place in ${eventMeta.city}. The exact venue will be announced soon, and practical information about access, accommodation, and on-site logistics will be shared closer to the event.`;

export default {
  metadata: {
    title: 'Kubernetes Community Days Provence in Aix-en-Provence',
    description: `Join 600+ cloud native professionals on ${eventDate} at ${eventMeta.venueName} for a day of talks, workshops, and networking.`,
    ignoreTitleTemplate: true,
  },
  hero: {
    actions: [
      {
        variant: 'primary',
        text: 'Get Tickets',
        href: 'https://community2.cncf.io/events/details/cncf-kcd-provence-presents-kcd-provence-2026/?showTickets=true',
        icon: 'tabler:calendar',
      },
      { text: 'Submit a Talk', href: '#cfp' },
    ],
    image: {
      light: {
        src: '~/assets/images/logos/logo-kcd-provence-primary.svg',
        alt: 'Kubernetes Community Days Provence Primary Logo',
        width: 500,
        height: 500,
      },
      dark: {
        src: '~/assets/images/logos/logo-kcd-provence-white.svg',
        alt: 'Kubernetes Community Days Provence White Logo',
        width: 500,
        height: 500,
      },
    },
    badge: `${eventDate} · ${eventMeta.city}`,
    title: {
      main: 'Kubernetes Community Days',
      subtitle: 'Provence',
    },
    subtitle: `Mark your calendars! On ${eventDate}, the Cloud Native community gathers at ${eventMeta.venueName} for a day of exciting talks, networking, and good vibes under the Provençal sun.`,
    eventDate: eventMeta.startsAt,
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
      'Share practical feedback, demos, and lessons learned with the cloud native community in Provence. We are looking for short, useful talks that help attendees build, run, and improve modern platforms.',
    availability: {
      ...cfpSchedule,
      statuses: buildCfpStatuses('en'),
    },
    importantDates: {
      title: 'Important Dates',
      items: buildCfpImportantDates('en', {
        opens: 'CFP Opens',
        closes: 'CFP Closes',
        speakersNotified: 'Speakers Notified',
        eventDay: 'Event Day',
      }),
    },
    topics: {
      title: 'Topics',
      items: [
        {
          title: 'Observability',
          description: 'Monitoring, tracing, logging, SLOs, and production insights.',
        },
        {
          title: 'Platform Engineering',
          description: 'Internal platforms, self-service workflows, and golden paths.',
        },
        {
          title: 'Infra, Kubernetes & Cloud',
          description: 'Infrastructure, clusters, operations, and cloud architecture.',
        },
        {
          title: 'Community',
          description: 'Open source stories, advocacy, inclusion, and local community life.',
        },
        {
          title: 'Developer Experience',
          description: 'Tooling, workflows, feedback loops, and happier developers.',
        },
        {
          title: 'AI',
          description: 'LLMs, AI platforms, inference workloads, and AI in cloud native systems.',
        },
        {
          title: 'Security',
          description: 'Identity, policy, software supply chain, and runtime protection.',
        },
        {
          title: 'Network',
          description: 'Ingress, gateways, service networking, traffic, and performance.',
        },
      ],
    },
    formats: {
      title: 'Accepted Formats',
      items: [
        {
          title: 'Conference (30 minutes)',
          description: '30 minutes to explore a topic in depth with context, demos, and takeaways.',
        },
        {
          title: 'Short talk (10 minutes)',
          description: '10 minutes for one sharp idea, one demo, or one lesson learned.',
        },
        {
          title: 'Lightning Talk (5 minutes)',
          description: '5 minutes to share one insight, one tip, or one story with energy.',
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
    ctaHref: cfpSubmissionUrl,
    image: {
      src: '~/assets/images/pages/home/event.jpg',
      alt: 'Call for Papers',
    },
  },

  venue: {
    title: 'Venue',
    venueName: eventMeta.venueName,
    description: venueDescription,
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
