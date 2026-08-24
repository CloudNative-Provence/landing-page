import type { MetaData } from '~/types';

import type { PracticalInfoAccommodationGuide } from './accommodation';
import type { PracticalInfoActivityGuide } from './activities';
import type { PracticalInfoParkingGuide } from './parking';
import type { PracticalInfoTravelGuide } from './travel';

export interface PracticalInfoTopicContentProps {
  tagline: string;
  title: string;
  summary: string;
  content: string;
  travelGuide?: PracticalInfoTravelGuide;
  accommodationGuide?: PracticalInfoAccommodationGuide;
  parkingGuide?: PracticalInfoParkingGuide;
  activitiesGuide?: PracticalInfoActivityGuide;
}

export interface PracticalInfoTopicData extends PracticalInfoTopicContentProps {
  metadata: MetaData;
  icon: string;
  callToActionLabel: string;
  backToOverviewLabel: string;
}
