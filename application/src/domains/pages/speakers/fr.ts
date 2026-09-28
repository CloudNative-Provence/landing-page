import programContent from '~/domains/pages/program/content/fr';

import { buildSpeakersPageData } from './services/page-data';

export default buildSpeakersPageData({
  metadata: {
    title: 'Intervenants',
    description: 'Découvrez les intervenants de KCD Provence 2026 et consultez leurs profils publiés.',
  },
  hero: {
    tagline: 'Intervenants',
    title: 'Découvrez les intervenants de KCD Provence',
    subtitle: 'Retrouvez les profils déjà publiés dans le programme de KCD Provence 2026.',
  },
  section: {
    title: 'Intervenants publiés',
    subtitle: 'Les profils affichés ici sont issus du programme publié de la conférence.',
    emptyState: 'Les profils des intervenants apparaîtront ici dès que le programme sera publié.',
  },
  labels: {
    closeLabel: programContent.labels.closeLabel,
    speakerProfileLabel: programContent.labels.speakerProfileLabel,
    speakerLinksLabel: programContent.labels.speakerLinksLabel,
  },
});
