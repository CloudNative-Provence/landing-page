import programContent from '~/domains/pages/program/content/fr';

import { buildSpeakersPageData } from './services/page-data';

export default buildSpeakersPageData({
  metadata: {
    title: 'Intervenants',
    description: 'Les intervenants de KCD Provence 2026 : biographies, entreprises et talks.',
  },
  hero: {
    tagline: 'Intervenants',
    title: 'Découvrez les intervenants de KCD Provence',
    subtitle: 'Découvrez les parcours des intervenants de KCD Provence 2026 et les talks qu’ils présenteront.',
    programLabel: 'Voir le programme',
  },
  section: {
    title: 'Les profils',
    emptyState: 'Aucun profil publié pour le moment.',
  },
  labels: {
    closeLabel: programContent.labels.closeLabel,
    speakerProfileLabel: programContent.labels.speakerProfileLabel,
    speakerLinksLabel: programContent.labels.speakerLinksLabel,
    viewProfileLabel: 'Voir le profil',
    talkLabel: 'Son talk',
    talksLabel: 'Ses talks',
    talkDescriptionLabel: 'Description du talk',
    viewInScheduleLabel: 'Voir dans le programme',
    searchLabel: 'Trouver un intervenant',
    searchPlaceholder: 'Rechercher un nom, une entreprise…',
    clearSearchLabel: 'Effacer la recherche',
    resultsLabel: '{count} / {total}',
    noResultsTitle: 'Aucun profil trouvé',
    noResultsText: 'Essayez un autre nom ou une autre entreprise.',
  },
});
