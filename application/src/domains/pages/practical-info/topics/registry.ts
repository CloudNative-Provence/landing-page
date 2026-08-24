import PracticalInfoAccommodationTopicContent from '~/domains/pages/practical-info/topics/accommodation/components/PracticalInfoAccommodationTopicContent.astro';
import PracticalInfoActivitiesTopicContent from '~/domains/pages/practical-info/topics/activities/components/PracticalInfoActivitiesTopicContent.astro';
import { practicalInfoTopics as practicalInfoTopicsEn } from '~/domains/pages/practical-info/topics/en';
import { practicalInfoTopics as practicalInfoTopicsFr } from '~/domains/pages/practical-info/topics/fr';
import PracticalInfoGettingThereTopicContent from '~/domains/pages/practical-info/topics/getting-there/components/PracticalInfoGettingThereTopicContent.astro';
import { orderedPracticalInfoTopicKeys } from '~/domains/pages/practical-info/topics/order';
import PracticalInfoParkingTopicContent from '~/domains/pages/practical-info/topics/parking/components/PracticalInfoParkingTopicContent.astro';
import type { LocalizedPageDefinition } from '~/domains/pages/routing/localized-page-registry';
import type { AppLang, PracticalInfoTopicKey } from '~/i18n/routes';

const practicalInfoTopicData = {
  en: practicalInfoTopicsEn,
  fr: practicalInfoTopicsFr,
};

const practicalInfoTopicComponents = {
  accommodation: PracticalInfoAccommodationTopicContent,
  'getting-there': PracticalInfoGettingThereTopicContent,
  activities: PracticalInfoActivitiesTopicContent,
  parking: PracticalInfoParkingTopicContent,
} as const;

export class PracticalInfoTopicRegistry {
  static resolve(topicKey: PracticalInfoTopicKey, lang: AppLang): LocalizedPageDefinition {
    const topic = practicalInfoTopicData[lang][topicKey];
    const {
      metadata,
      icon: _icon,
      callToActionLabel: _callToActionLabel,
      backToOverviewLabel: _backToOverviewLabel,
      ...props
    } = topic;

    return {
      component: practicalInfoTopicComponents[topicKey],
      layout: 'page',
      metadata,
      props,
    };
  }

  static getTopicKeys(): PracticalInfoTopicKey[] {
    return [...orderedPracticalInfoTopicKeys];
  }
}
