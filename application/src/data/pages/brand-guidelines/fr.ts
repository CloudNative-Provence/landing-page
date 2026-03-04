export const frContent = {
  metadata: {
    title: 'Charte Graphique - Cloud Native Provence',
  },
  hero: {
    tagline: 'Charte Graphique',
    title: 'Identité visuelle Cloud Native Provence',
    subtitle: 'Découvrez nos couleurs, typographie et téléchargez nos logos dans différents formats.',
  },
  colorPalette: {
    title: 'Palette de couleurs',
    subtitle: "Nos couleurs reflètent l'innovation et la communauté",
    colors: [
      {
        name: 'Primaire',
        hex: '#004e91',
        rgb: '0, 78, 145',
        usage: 'Éléments principaux, CTA',
      },
      {
        name: 'Secondaire',
        hex: '#4E3A75',
        rgb: '78, 58, 117',
        usage: 'Éléments secondaires',
      },
      {
        name: 'Secondaire Clair',
        hex: '#8B79B9',
        rgb: '139, 121, 185',
        usage: 'Accents, dégradés',
      },
      {
        name: 'Accent',
        hex: '#46A5CB',
        rgb: '70, 165, 203',
        usage: 'Liens, highlights',
      },
    ],
  },
  typography: {
    title: 'Typographie',
    subtitle: 'Une police moderne et lisible',
    fontName: 'Montserrat',
    description: 'Police principale pour tous les textes et titres',
    examples: [
      {
        label: 'Titre principal (Bold)',
        text: 'Cloud Native Provence',
        style: 'text-4xl font-bold',
      },
      {
        label: 'Sous-titre (Semi-Bold)',
        text: "L'événement Cloud Native en Provence",
        style: 'text-2xl font-semibold',
      },
      {
        label: 'Texte courant (Regular)',
        text: "Rejoignez-nous pour une journée immersive de conférences, d'ateliers et d'échanges autour de Kubernetes, DevOps et du Cloud Native.",
        style: 'text-lg',
      },
    ],
  },
  logoDownloads: {
    title: 'Téléchargement des logos',
    subtitle: 'Logos disponibles en différents formats pour tous vos besoins',
    items: [
      {
        title: 'Logo SVG (Primaire)',
        description:
          "Format vectoriel, idéal pour le web et l'impression. Fichier léger et redimensionnable sans perte de qualité.",
        icon: 'tabler:file-vector',
        callToAction: {
          text: 'Télécharger SVG',
          href: '/logos/logo-primary.svg',
          download: true,
        },
      },
      {
        title: 'Logo PNG (Haute résolution)',
        description: 'Format image haute définition, parfait pour les présentations et documents. Fond transparent.',
        icon: 'tabler:file-type-png',
        callToAction: {
          text: 'Télécharger PNG',
          href: '/logos/logo-primary.png',
          download: true,
        },
      },
      {
        title: 'Logo Blanc (Fonds sombres)',
        description: 'Version blanche du logo pour utilisation sur fonds sombres. Disponible en SVG et PNG.',
        icon: 'tabler:palette',
        callToAction: {
          text: 'Télécharger SVG',
          href: '/logos/logo-white.svg',
          download: true,
        },
      },
      {
        title: 'Icône seule',
        description: 'Symbole/icône sans texte, pour les petits formats et les favicons. SVG et PNG.',
        icon: 'tabler:square',
        callToAction: {
          text: 'Télécharger SVG',
          href: '/logos/logo-icon.svg',
          download: true,
        },
      },
      {
        title: 'Logo KCD Provence (Primaire)',
        description:
          "Variante KCD Provence en couleurs principales. Format vectoriel, idéal pour le web et l'impression sans perte de qualité.",
        icon: 'tabler:file-vector',
        callToAction: {
          text: 'Télécharger SVG',
          href: '/logos/logo-kcd-provence-primary.svg',
          download: true,
        },
      },
      {
        title: 'Logo KCD Provence (Fonds sombres)',
        description: 'Variante blanche KCD Provence pour fonds sombres. Format vectoriel propre et redimensionnable.',
        icon: 'tabler:palette',
        callToAction: {
          text: 'Télécharger SVG',
          href: '/logos/logo-kcd-provence-white.svg',
          download: true,
        },
      },
    ],
  },
  usageGuidelines: {
    tagline: 'Bonnes pratiques',
    title: "Règles d'utilisation",
    contentTitle: "Utilisation respectueuse de l'identité",
    contentDescription:
      'Ces règles garantissent la cohérence et la reconnaissance de notre marque. Pour toute question ou usage spécifique, contactez-nous.',
    items: [
      {
        title: 'Espacement',
        description:
          'Respectez toujours une zone de protection autour du logo équivalente à la hauteur du "C" du logo.',
      },
      {
        title: 'Taille minimale',
        description: "La largeur minimale du logo doit être de 120px pour le web et 30mm pour l'impression.",
      },
      {
        title: 'Couleurs',
        description:
          "Utilisez uniquement les couleurs définies dans la charte. N'ajoutez pas d'effets ou de dégradés non autorisés.",
      },
      {
        title: 'Déformation',
        description:
          'Ne déformez jamais le logo. Conservez toujours les proportions originales lors du redimensionnement.',
      },
    ],
  },
  note: {
    title: 'Note importante',
    content: "Les fichiers de logos sont disponibles ci-dessus. Si vous avez besoin d'autres formats, contactez-nous.",
    contactText: "Pour toute question concernant la charte graphique ou l'utilisation des logos, contactez-nous à :",
    email: 'contact@cloudnative-provence.fr',
  },
} as const;
