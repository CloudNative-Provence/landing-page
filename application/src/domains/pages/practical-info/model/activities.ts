import type { PracticalInfoResourceLink } from './links';

export interface PracticalInfoActivityOption {
  name: string;
  blurb: string;
  meta: string;
  tags: readonly string[];
  linkLabel: string;
  linkHref: string;
}

export interface PracticalInfoActivityCategory {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  options: readonly PracticalInfoActivityOption[];
}

export interface PracticalInfoActivityGuide {
  heroTitle: string;
  heroIntro: string;
  categoriesTitle: string;
  categoriesIntro: string;
  categories: readonly PracticalInfoActivityCategory[];
  tipsTitle: string;
  tips: readonly string[];
  resourcesTitle: string;
  resources: readonly PracticalInfoResourceLink[];
  notesTitle: string;
  notes: readonly string[];
}
