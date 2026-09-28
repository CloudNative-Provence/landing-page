import programContent from '~/domains/pages/program/content/en';

import { buildSpeakersPageData } from './services/page-data';

export default buildSpeakersPageData({
  metadata: {
    title: 'Speakers',
    description: 'Speaker profiles for KCD Provence 2026: biographies, companies and links.',
  },
  hero: {
    tagline: 'Speakers',
    title: 'Meet the speakers at KCD Provence',
    subtitle: 'Speaker profiles for KCD Provence 2026. See the program for talks and times.',
    programLabel: 'View program',
  },
  section: {
    title: 'Speaker profiles',
    emptyState: 'No speaker profiles published yet.',
  },
  labels: {
    closeLabel: programContent.labels.closeLabel,
    speakerProfileLabel: programContent.labels.speakerProfileLabel,
    speakerLinksLabel: programContent.labels.speakerLinksLabel,
    viewProfileLabel: 'View profile',
    searchLabel: 'Find a speaker',
    searchPlaceholder: 'Search by name or company…',
    clearSearchLabel: 'Clear search',
    resultsLabel: '{count} / {total}',
    noResultsTitle: 'No speakers found',
    noResultsText: 'Try a different name or company.',
  },
});
