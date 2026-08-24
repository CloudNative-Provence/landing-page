import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: "Conditions Générales d'Utilisation",
  },
  lastUpdatedLabel: 'Dernière mise à jour',
  lastUpdated: '6 janvier 2023',
  intro: "Merci de lire attentivement ces conditions avant d'utiliser notre site.",
  sections: [
    {
      title: 'Définitions',
      items: [
        'Entreprise : désigne Cloud Native Provence (ou "nous").',
        'Service : désigne le site web de Cloud Native Provence.',
        'Utilisateur : toute personne physique ou morale accédant au Service.',
        "Apparel : tout outil permettant d'accéder au Service (ordinateur, tablette, téléphone...).",
      ],
    },
    {
      title: 'Acceptation des conditions',
      paragraphs: [
        "En accédant au Service, vous acceptez pleinement et sans réserve les présentes Conditions Générales d'Utilisation. Si vous êtes en désaccord avec tout ou partie de ces conditions, vous ne devez pas utiliser le Service.",
        "Vous devez être âgé d'au moins 18 and pour accéder au Service.",
      ],
      link: {
        prefix: "L'utilisation du Service est également soumise à notre ",
        label: 'Politique de Confidentialité',
        href: getLocalizedPagePath('fr', 'privacy'),
        suffix: '.',
      },
    },
    {
      title: 'Liens vers des sites tiers',
      paragraphs: [
        "Le Service peut contenir des liens vers d'autres sites que nous ne contrôlons pas. Nous ne sommes pas responsables de leur contenu, politique de confidentialité ou pratiques.",
      ],
    },
    {
      title: 'Résiliation',
      paragraphs: [
        'Nous nous réservons le droit de suspendre ou de mettre fin à votre accès au Service, sans préavis, en cas de non-respect des présentes Conditions.',
      ],
    },
    {
      title: 'Limitation de responsabilité',
      paragraphs: [
        "Dans les limites autorisées par la loi, nous ne saurions être tenus responsables de tout dommage indirect, consécutif ou spécial découlant de l'utilisation ou de l'impossibilité d'utiliser le Service.",
        "En tout état de cause, notre responsabilité se limit au montant éventuellement payé par vous pour l'utilisation du Service.",
      ],
    },
    {
      title: 'Aucune garantie',
      paragraphs: [
        'Le Service est fourni "tel quel", sans guarantee d\'aucune sorte, expresse ou implicite. Nous ne garantissons pas que le Service sera disponible, ininterrompu, sécurisé, ou sans erreur.',
      ],
    },
    {
      title: 'Loi applicable',
      paragraphs: [
        'Les présentes Conditions sont régies par le droit français. En cas de litige, une tentative de résolution amiable devra être privilégiée avant toute action judiciaire.',
      ],
    },
    {
      title: "Utilisateurs de l'Union européenne",
      paragraphs: [
        "En tant que consommateur de l'UE, vous bénéficiez des dispositions impératives du droit de votre pays de résidence.",
      ],
    },
    {
      title: 'Divisibilité',
      paragraphs: [
        'Si une clause de ces Conditions est jugée invalid ou inapplicable, les autres clauses resteront pleinement en vigueur.',
      ],
    },
    {
      title: 'Non-renonciation',
      paragraphs: ['Le fait pour une partie de ne pas exercer un droit ne constitute pas une renonciation à ce droit.'],
    },
    {
      title: 'Modifications',
      paragraphs: [
        'Nous pouvons modifier les présentes Conditions à tout moment. Nous vous informerons de tout changement en publiant les nouvelles Conditions sur cette page.',
      ],
    },
    {
      title: 'Nous contacter',
      paragraphs: ['Si vous avez des questions concernant ces Conditions, vous pouvez nous contacter :'],
      items: ['Par email : info@cloudnative-provence.fr'],
    },
  ],
} as const;
