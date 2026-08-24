import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';
import type { PracticalInfoTopicKey } from '~/i18n/routes';

import accommodation from './accommodation/fr';
import activities from './activities/fr';
import gettingThere from './getting-there/fr';
import parking from './parking/fr';

export const practicalInfoTopics = {
  accommodation,
  'getting-there': gettingThere,
  activities,
  parking,
} satisfies Record<PracticalInfoTopicKey, PracticalInfoTopicData>;
