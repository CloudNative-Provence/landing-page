import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: 'Nos sponsors - Cloud Native Provence',
    description:
      "Découvrez les sponsors Gold, Silver et communautaires qui font vivre KCD Provence et rejoignez l'aventure.",
  },
  hero: {
    tagline: 'Sponsoring',
    title: 'Sponsorisez KCD Provence 2026',
    subtitle:
      "Soutenez Kubernetes Community Days Provence 2026, organisé par l'association Cloud Native Provence, et faites de cette journée un succès collectif et communautaire.",
  },
  pricing: {
    title: 'Nos formules de sponsoring',
    subtitle: 'Choisissez la formule qui correspond à vos objectifs',
    packages: [
      {
        title: 'Platinum',
        subtitle: "Visibilité maximale sur tout l'événement",
        price: 10000,
        period: 'HT',
        items: [
          { description: 'Stand de 9 m² + mobilier' },
          { description: '6 billets + réduction de 30 % sur 6 billets' },
          { description: 'Logo et mention sur scène et dans le communiqué de presse' },
          { description: 'Image de marque sur tous les supports de communication' },
          { description: 'Présence sur scène (5 min)' },
          { description: 'Dîner des sponsors et partenaires' },
          { description: 'Application de collecte de contacts' },
        ],
        callToAction: {
          text: 'Devenir sponsor',
          href: getLocalizedPagePath('fr', 'contact'),
        },
        hasRibbon: true,
        ribbonTitle: 'Premium',
      },
      {
        title: 'Gold',
        subtitle: 'Excellent compromis visibilité/coût',
        price: 6000,
        period: 'HT',
        items: [
          { description: 'Stand de 6 m² + mobilier' },
          { description: '4 billets + réduction de 30 % sur 4 billets' },
          { description: 'Logo sur scène et dans les supports' },
          { description: 'Citation dans le communiqué de presse' },
          { description: 'Dîner des sponsors et partenaires' },
          { description: 'Application de collecte de contacts' },
        ],
        callToAction: {
          text: 'Devenir sponsor',
          href: getLocalizedPagePath('fr', 'contact'),
        },
      },
      {
        title: 'Silver',
        subtitle: 'Présence simple et efficace',
        price: 4000,
        period: 'HT',
        items: [
          { description: 'Stand de 4 m² + mobilier' },
          { description: '2 billets + réduction de 30 % sur 2 billets' },
          { description: 'Logo sur les supports' },
          { description: 'Citation dans le communiqué de presse' },
          { description: 'Dîner des sponsors et partenaires' },
          { description: 'Application de collecte de contacts' },
        ],
        callToAction: {
          text: 'Devenir sponsor',
          href: getLocalizedPagePath('fr', 'contact'),
        },
      },
      {
        title: 'Community',
        subtitle: 'Pour les acteurs communautaires open source',
        price: 1000,
        period: 'HT',
        items: [
          { description: '2 billets + réduction de 30 % sur 2 billets' },
          { description: 'Présence dans la zone communautaire' },
          { description: 'Logo sur le site web' },
          { description: 'Dîner des sponsors et partenaires' },
          { description: 'Application de collecte de contacts' },
        ],
        callToAction: {
          text: 'Devenir sponsor',
          href: getLocalizedPagePath('fr', 'contact'),
        },
      },
    ],
  },
  features: {
    title: 'Pourquoi sponsoriser KCD Provence 2026 ?',
    subtitle: 'Un partenariat à fort impact pour les entreprises tech',
    items: [
      {
        title: 'Visibilité ciblée',
        description: "Mettez en avant votre marque auprès d'un public technique passionné et engagé.",
        icon: 'tabler:eye',
      },
      {
        title: 'Recrutement',
        description: "Attirez des talents qualifiés, à l'écoute du marché et motivés.",
        icon: 'tabler:user-plus',
      },
      {
        title: 'Positionnement',
        description: "Affichez votre engagement dans l'écosystème Cloud Native et Open Source.",
        icon: 'tabler:rocket',
      },
      {
        title: 'Rencontres et échanges',
        description:
          "Participez au dîner exclusif des sponsors et partenaires avec l'équipe organisatrice et les intervenants.",
        icon: 'tabler:heart-handshake',
      },
    ],
  },
  faqs: {
    title: 'Questions fréquentes',
    subtitle: 'Vous hésitez encore ? Voici quelques réponses pour vous aider.',
    items: [
      {
        title: 'Puis-je proposer une autre idée de sponsoring ?',
        description: 'Oui, contactez-nous pour discuter de toute idée créative ou de tout besoin spécifique.',
      },
      {
        title: "Puis-je être sponsor communautaire en tant qu'association ?",
        description: "Absolument, tant que votre action est alignée avec l'écosystème Open Source et Cloud Native.",
      },
      {
        title: 'Est-ce que je peux cumuler plusieurs options ?',
        description: "Oui, vous pouvez ajouter des options (badge, café, glaces...) à n'importe quelle formule.",
      },
      {
        title: 'Est-ce que la facture est assujettie à la TVA ?',
        description: 'Oui, les prix sont affichés HT. La TVA est applicable selon la législation en vigueur.',
      },
    ],
  },
  materials: {
    title: 'Matériel de sponsoring',
    subtitle: 'Téléchargez notre dossier de sponsoring',
    items: [
      {
        title: 'Dossier de sponsoring (FR)',
        description: 'Le dossier complet en français avec toutes les informations sur les différentes formules.',
        icon: 'tabler:file-text',
        callToAction: {
          text: 'Télécharger (FR)',
          href: 'https://docs.google.com/presentation/d/1iq1g1LMoeMhXc8MDdV0ZOD9-w_ru9HxQT0CwFxZhTh4/edit?usp=sharing',
          target: '_blank',
        },
      },
      {
        title: 'Dossier de sponsoring (EN)',
        description: 'Le dossier complet en anglais avec toutes les informations sur les différentes formules.',
        icon: 'tabler:file-text',
        callToAction: {
          text: 'Télécharger (EN)',
          href: 'https://docs.google.com/presentation/d/1HU_xxh5R3BMm121SR7qwKqWa8MsSlqW3Z7e_mofXX9Q/edit?usp=sharing',
          target: '_blank',
        },
      },
    ],
  },
  contact: {
    title: 'Contact sponsoring',
    subtitle: 'Pour toute question sur le sponsoring, contactez-nous',
    items: [
      {
        title: 'E-mail',
        description: 'sponsors@cloudnative-provence.fr',
        icon: 'tabler:mail',
      },
    ],
  },
  callToAction: {
    title: 'Prêt à sponsoriser KCD Provence 2026 ?',
    subtitle: "Contactez-nous pour sponsoriser l'événement ou en savoir plus sur l'association Cloud Native Provence.",
    actions: [
      {
        variant: 'primary',
        text: 'Nous contacter',
        href: getLocalizedPagePath('fr', 'contact'),
      },
    ],
  },
} as const;
