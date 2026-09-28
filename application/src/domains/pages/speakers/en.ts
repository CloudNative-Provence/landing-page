import programContent from '~/domains/pages/program/content/en';

import { buildSpeakersPageData } from './services/page-data';

export default buildSpeakersPageData({
  metadata: {
    title: 'Speakers',
    description: 'Meet the KCD Provence 2026 speakers and browse their published profiles.',
  },
  hero: {
    tagline: 'Speakers',
    title: 'Meet the speakers at KCD Provence',
    subtitle: 'Explore the published speaker lineup from the KCD Provence 2026 program.',
  },
  section: {
    title: 'Published speakers',
    subtitle: 'Speaker profiles are sourced from the published conference program.',
    emptyState: 'Speaker profiles will appear here once the program is published.',
  },
  labels: {
    closeLabel: programContent.labels.closeLabel,
    speakerProfileLabel: programContent.labels.speakerProfileLabel,
    speakerLinksLabel: programContent.labels.speakerLinksLabel,
  },
});
