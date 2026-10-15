import programContent from '~/domains/pages/program/content/en';

import { buildSpeakersPageData } from './services/page-data';

export default buildSpeakersPageData({
  metadata: {
    title: 'Speakers',
    description: 'Speaker profiles for KCD Provence 2026: biographies, companies and talks.',
  },
  hero: {
    tagline: 'Speakers',
    title: 'Meet the speakers at KCD Provence',
    subtitle: 'Meet the speakers at KCD Provence 2026 and discover the talks they will present.',
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
    talkLabel: 'Talk',
    talksLabel: 'Talks',
    talkDescriptionLabel: 'Talk description',
    viewInScheduleLabel: 'View in schedule',
    searchLabel: 'Find a speaker',
    searchPlaceholder: 'Search by name or company…',
    clearSearchLabel: 'Clear search',
    resultsLabel: '{count} / {total}',
    noResultsTitle: 'No speakers found',
    noResultsText: 'Try a different name or company.',
  },
});
