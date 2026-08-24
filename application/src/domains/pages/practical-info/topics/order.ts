import type { PracticalInfoTopicKey } from '~/i18n/routes';

export const orderedPracticalInfoTopicKeys = [
  'accommodation',
  'getting-there',
  'parking',
  'activities',
] as const satisfies readonly PracticalInfoTopicKey[];
