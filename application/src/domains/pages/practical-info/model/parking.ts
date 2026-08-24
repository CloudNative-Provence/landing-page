import type { PracticalInfoResourceLink } from './links';

export interface PracticalInfoParkingOption {
  name: string;
  blurb: string;
  address: string;
  featureTags: readonly string[];
  mapLabel: string;
  mapHref: string;
}

export interface PracticalInfoParkingCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  options: readonly PracticalInfoParkingOption[];
}

export interface PracticalInfoParkingGuide {
  heroTitle: string;
  heroIntro: string;
  categoriesTitle: string;
  categoriesIntro: string;
  categories: readonly PracticalInfoParkingCategory[];
  tipsTitle: string;
  tips: readonly string[];
  resourcesTitle: string;
  resources: readonly PracticalInfoResourceLink[];
  notesTitle: string;
  notes: readonly string[];
}
