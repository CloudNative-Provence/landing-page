import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: 'Sponsoring - Cloud Native Provence',
  },
  hero: {
    tagline: 'Sponsoring',
    title: 'Support Cloud Native Provence 2026',
    subtitle: 'Join us to make this day a collective and community success.',
  },
  pricing: {
    title: 'Our sponsorship packages',
    subtitle: 'Choose the package that matches your objectives',
    packages: [
      {
        title: 'Platinum',
        subtitle: 'Maximum visibility throughout the event',
        price: 10000,
        period: 'excl. VAT',
        items: [
          { description: '9 m² booth + furniture' },
          { description: '6 tickets + 30% discount on 6 tickets' },
          { description: 'Logo and mention on stage and press release' },
          { description: 'Brand image on all communication materials' },
          { description: 'On-stage presence (5 min)' },
          { description: 'Sponsors & Partners dinner' },
          { description: 'Lead scanning application' },
        ],
        callToAction: {
          text: 'Become a sponsor',
          href: getLocalizedPagePath('en', 'contact'),
        },
        hasRibbon: true,
        ribbonTitle: 'Premium',
      },
      {
        title: 'Gold',
        subtitle: 'Excellent visibility/cost compromise',
        price: 6000,
        period: 'excl. VAT',
        items: [
          { description: '6 m² booth + furniture' },
          { description: '4 tickets + 30% discount on 4 tickets' },
          { description: 'Logo on stage and in materials' },
          { description: 'Mention in press release' },
          { description: 'Sponsors & Partners dinner' },
          { description: 'Lead scanning application' },
        ],
        callToAction: {
          text: 'Become a sponsor',
          href: getLocalizedPagePath('en', 'contact'),
        },
      },
      {
        title: 'Silver',
        subtitle: 'Simple and effective presence',
        price: 4000,
        period: 'excl. VAT',
        items: [
          { description: '4 m² booth + furniture' },
          { description: '2 tickets + 30% discount on 2 tickets' },
          { description: 'Logo on materials' },
          { description: 'Mention in press release' },
          { description: 'Sponsors & Partners dinner' },
          { description: 'Lead scanning application' },
        ],
        callToAction: {
          text: 'Become a sponsor',
          href: getLocalizedPagePath('en', 'contact'),
        },
      },
      {
        title: 'Community',
        subtitle: 'For open source community actors',
        price: 1000,
        period: 'excl. VAT',
        items: [
          { description: '2 tickets + 30% discount on 2 tickets' },
          { description: 'Presence in community area' },
          { description: 'Logo on website' },
          { description: 'Sponsors & Partners dinner' },
          { description: 'Lead scanning application' },
        ],
        callToAction: {
          text: 'Become a sponsor',
          href: getLocalizedPagePath('en', 'contact'),
        },
      },
    ],
  },
  features: {
    title: 'Why sponsor Cloud Native Provence?',
    subtitle: 'A high-impact partnership for tech companies',
    items: [
      {
        title: 'Targeted visibility',
        description: 'Showcase your brand to a passionate and engaged technical audience.',
        icon: 'tabler:eye',
      },
      {
        title: 'Recruitment',
        description: 'Attract qualified talent, listening to the market and motivated.',
        icon: 'tabler:user-plus',
      },
      {
        title: 'Positioning',
        description: 'Show your commitment in the Cloud Native and Open Source ecosystem.',
        icon: 'tabler:rocket',
      },
      {
        title: 'Networking',
        description: 'Participate in the exclusive Sponsors & Partners dinner with the organizing team and speakers.',
        icon: 'tabler:heart-handshake',
      },
    ],
  },
  faqs: {
    title: 'Frequently asked questions',
    subtitle: 'Still hesitating? Here are some answers to help you.',
    items: [
      {
        title: 'Can I propose another sponsorship idea?',
        description: 'Yes, contact us to discuss any creative idea or specific need.',
      },
      {
        title: 'Can I be a community sponsor as an association?',
        description: 'Absolutely, as long as your action is aligned with the Open Source and Cloud Native ecosystem.',
      },
      {
        title: 'Can I combine multiple options?',
        description: 'Yes, you can add options (badges, coffee, ice cream...) to any package.',
      },
      {
        title: 'Is the invoice subject to VAT?',
        description: 'Yes, prices are displayed excluding VAT. VAT is applicable according to current legislation.',
      },
    ],
  },
  materials: {
    title: 'Sponsorship materials',
    subtitle: 'Download our sponsorship package',
    items: [
      {
        title: 'Dossier de sponsoring (FR)',
        description: 'The complete package in French with all the information about the different options.',
        icon: 'tabler:file-text',
        callToAction: {
          text: 'Download (FR)',
          href: 'https://kutt.it/sponsors-fr',
          target: '_blank',
        },
      },
      {
        title: 'Sponsorship Package (EN)',
        description: 'The complete sponsorship package in English with all the information about the different options.',
        icon: 'tabler:file-text',
        callToAction: {
          text: 'Download (EN)',
          href: 'https://kutt.it/sponsors-en',
          target: '_blank',
        },
      },
    ],
  },
  contact: {
    title: 'Sponsorship Contact',
    subtitle: 'For any questions about sponsorship, contact us',
    items: [
      {
        title: 'Email',
        description: 'sponsors@cloudnative-provence.fr',
        icon: 'tabler:mail',
      },
    ],
  },
  callToAction: {
    title: 'Ready to join the Cloud Native Provence adventure?',
    subtitle: 'Contact us to sponsor the event or learn more.',
    actions: [
      {
        variant: 'primary',
        text: 'Contact us',
        href: getLocalizedPagePath('en', 'contact'),
      },
    ],
  },
} as const;
