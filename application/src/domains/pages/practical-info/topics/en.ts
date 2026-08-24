import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';
import type { PracticalInfoTopicKey } from '~/i18n/routes';

import accommodation from './accommodation/en';
import activities from './activities/en';
import gettingThere from './getting-there/en';
import parking from './parking/en';

export const practicalInfoTopics = {
  accommodation,
  'getting-there': gettingThere,
  activities,
  parking,
} satisfies Record<PracticalInfoTopicKey, PracticalInfoTopicData>;
