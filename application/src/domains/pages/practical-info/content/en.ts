import { eventMeta } from '~/domains/event/config/event';
import { practicalInfoTopics } from '~/domains/pages/practical-info/topics/en';
import { orderedPracticalInfoTopicKeys } from '~/domains/pages/practical-info/topics/order';
import { getLocalizedPagePath } from '~/i18n/routes';

export { practicalInfoTopics };

export default {
  metadata: {
    title: 'Practical Information',
    description: `Plan your visit to ${eventMeta.city}: accommodation, transport, activities, and parking for the event day.`,
  },
  tagline: 'Before you arrive',
  title: 'Practical information for your day in Provence',
  featuresTitle: 'Choose a topic to plan your visit',
  items: orderedPracticalInfoTopicKeys.map((topicKey) => {
    const topic = practicalInfoTopics[topicKey];

    return {
      title: topic.title,
      description: topic.summary,
      icon: topic.icon,
      callToAction: {
        text: topic.callToActionLabel,
        href: getLocalizedPagePath('en', 'practical-info', topicKey),
        variant: 'secondary',
      },
    };
  }),
} as const;
