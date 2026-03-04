export const enContent = {
  metadata: {
    title: 'Brand Guidelines - Cloud Native Provence',
  },
  hero: {
    tagline: 'Brand Guidelines',
    title: 'Cloud Native Provence Visual Identity',
    subtitle: 'Discover our colors, typography and download our logos in different formats.',
  },
  colorPalette: {
    title: 'Color Palette',
    subtitle: 'Our colors reflect innovation and community',
    colors: [
      {
        name: 'Primary',
        hex: '#004e91',
        rgb: '0, 78, 145',
        usage: 'Main elements, CTA',
      },
      {
        name: 'Secondary',
        hex: '#4E3A75',
        rgb: '78, 58, 117',
        usage: 'Secondary elements',
      },
      {
        name: 'Secondary Light',
        hex: '#8B79B9',
        rgb: '139, 121, 185',
        usage: 'Accents, gradients',
      },
      {
        name: 'Accent',
        hex: '#46A5CB',
        rgb: '70, 165, 203',
        usage: 'Links, highlights',
      },
    ],
  },
  typography: {
    title: 'Typography',
    subtitle: 'A modern and readable font',
    fontName: 'Montserrat',
    description: 'Primary font for all text and titles',
    examples: [
      {
        label: 'Main Title (Bold)',
        text: 'Cloud Native Provence',
        style: 'text-4xl font-bold',
      },
      {
        label: 'Subtitle (Semi-Bold)',
        text: 'The Cloud Native event in Provence',
        style: 'text-2xl font-semibold',
      },
      {
        label: 'Body Text (Regular)',
        text: 'Join us for an immersive day of conferences, workshops and discussions about Kubernetes, DevOps and Cloud Native.',
        style: 'text-lg',
      },
    ],
  },
  logoDownloads: {
    title: 'Logo Downloads',
    subtitle: 'Logos available in different formats for all your needs',
    items: [
      {
        title: 'SVG Logo (Primary)',
        description: 'Vector format, ideal for web and print. Lightweight and resizable file without quality loss.',
        icon: 'tabler:file-vector',
        callToAction: {
          text: 'Download SVG',
          href: '/logos/logo-primary.svg',
          download: true,
        },
      },
      {
        title: 'PNG Logo (High Resolution)',
        description: 'High definition image format, perfect for presentations and documents. Transparent background.',
        icon: 'tabler:file-type-png',
        callToAction: {
          text: 'Download PNG',
          href: '/logos/logo-primary.png',
          download: true,
        },
      },
      {
        title: 'White Logo (Dark Backgrounds)',
        description: 'White version of the logo for use on dark backgrounds. Available in SVG and PNG.',
        icon: 'tabler:palette',
        callToAction: {
          text: 'Download SVG',
          href: '/logos/logo-white.svg',
          download: true,
        },
      },
      {
        title: 'Icon Only',
        description: 'Symbol/icon without text, for small formats and favicons. SVG and PNG.',
        icon: 'tabler:square',
        callToAction: {
          text: 'Download SVG',
          href: '/logos/logo-icon.svg',
          download: true,
        },
      },
      {
        title: 'KCD Provence Logo (Primary)',
        description:
          'KCD Provence variant in primary colors. Vector format, ideal for web and print without quality loss.',
        icon: 'tabler:file-vector',
        callToAction: {
          text: 'Download SVG',
          href: '/logos/logo-kcd-provence-primary.svg',
          download: true,
        },
      },
      {
        title: 'KCD Provence Logo (Dark Backgrounds)',
        description: 'KCD Provence white variant for dark backgrounds. Vector format for clean, scalable rendering.',
        icon: 'tabler:palette',
        callToAction: {
          text: 'Download SVG',
          href: '/logos/logo-kcd-provence-white.svg',
          download: true,
        },
      },
    ],
  },
  usageGuidelines: {
    tagline: 'Best Practices',
    title: 'Usage Rules',
    contentTitle: 'Respectful use of identity',
    contentDescription:
      'These rules ensure the consistency and recognition of our brand. For any question or specific use, contact us.',
    items: [
      {
        title: 'Spacing',
        description:
          'Always respect a protection zone around the logo equivalent to the height of the "C" in the logo.',
      },
      {
        title: 'Minimum Size',
        description: 'The minimum width of the logo should be 120px for web and 30mm for print.',
      },
      {
        title: 'Colors',
        description: 'Use only the colors defined in the guidelines. Do not add unauthorized effects or gradients.',
      },
      {
        title: 'Distortion',
        description: 'Never distort the logo. Always maintain the original proportions when resizing.',
      },
    ],
  },
  note: {
    title: 'Important Note',
    content: 'Logo files are available above. If you need other formats, contact us.',
    contactText: 'For any questions regarding the brand guidelines or logo usage, contact us at:',
    email: 'contact@cloudnative-provence.fr',
  },
} as const;
