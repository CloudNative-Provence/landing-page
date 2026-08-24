import type { PracticalInfoResourceLink } from './links';

export interface PracticalInfoTravelFact {
  label: string;
  value: string;
  icon: string;
}

export interface PracticalInfoTravelRouteStop {
  title: string;
  detail: string;
  icon: string;
}

export interface PracticalInfoTravelMode {
  title: string;
  badge: string;
  duration: string;
  summary: string;
  icon: string;
  route: readonly PracticalInfoTravelRouteStop[];
  details: readonly string[];
  links: readonly PracticalInfoResourceLink[];
}

export interface PracticalInfoTravelTip {
  text: string;
  link: PracticalInfoResourceLink;
  textAfter?: string;
}

export type PracticalInfoTravelTipEntry = string | PracticalInfoTravelTip;

export interface PracticalInfoTravelGuide {
  heroTitle: string;
  heroIntro: string;
  factsTitle: string;
  facts: readonly PracticalInfoTravelFact[];
  locationTitle?: string;
  locationAddress?: string;
  locationDescription?: string;
  locationMapTitle?: string;
  locationMapEmbedUrl?: string;
  locationMapHref?: string;
  locationMapLinkLabel?: string;
  plannerTitle: string;
  plannerIntro: string;
  selectorTitle: string;
  selectorIntro: string;
  routeTitle: string;
  routeLabel: string;
  checklistTitle: string;
  linksTitle: string;
  modesTitle: string;
  modesIntro: string;
  modes: readonly PracticalInfoTravelMode[];
  tipsTitle: string;
  tips: readonly PracticalInfoTravelTipEntry[];
  resourcesTitle: string;
  notesTitle: string;
  resources: readonly PracticalInfoResourceLink[];
}
