import { eventMeta } from '~/domains/event/config/event';
import { practicalInfoTopics } from '~/domains/pages/practical-info/topics/fr';
import { orderedPracticalInfoTopicKeys } from '~/domains/pages/practical-info/topics/order';
import { getLocalizedPagePath } from '~/i18n/routes';

export { practicalInfoTopics };

export default {
  metadata: {
    title: 'Infos pratiques',
    description: `Préparez votre venue à ${eventMeta.city} : hébergement, accès, activités et parkings pour le jour de l'événement.`,
  },
  tagline: 'Avant votre venue',
  title: 'Les infos pratiques pour votre journée en Provence',
  featuresTitle: 'Choisissez un sujet pour organiser votre venue',
  items: orderedPracticalInfoTopicKeys.map((topicKey) => {
    const topic = practicalInfoTopics[topicKey];

    return {
      title: topic.title,
      description: topic.summary,
      icon: topic.icon,
      callToAction: {
        text: topic.callToActionLabel,
        href: getLocalizedPagePath('fr', 'practical-info', topicKey),
        variant: 'secondary',
      },
    };
  }),
} as const;
