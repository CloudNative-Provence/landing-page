import type { PracticalInfoResourceLink } from './links';

export interface PracticalInfoAccommodationArea {
  title: string;
  badge: string;
  description: string;
  commute: string;
}

export interface PracticalInfoAccommodationOption {
  title: string;
  badge: string;
  description: string;
  bestFor: string;
}

export interface PracticalInfoStayFilterOption {
  id: string;
  label: string;
  searchQuery?: string;
}

export interface PracticalInfoStayFilterGroup {
  id: string;
  label: string;
  options: readonly PracticalInfoStayFilterOption[];
}

export interface PracticalInfoStay {
  name: string;
  blurb: string;
  address: string;
  zoneId: string;
  zoneLabel: string;
  typeId: string;
  typeLabel: string;
  featureIds: readonly string[];
  websiteLabel: string;
  websiteHref: string;
  mapLabel: string;
  mapHref: string;
}

export interface PracticalInfoStayFinder {
  title: string;
  intro: string;
  filters: readonly PracticalInfoStayFilterGroup[];
  resultsLabel: string;
  mapsSearchLabel: string;
  mapsSearchContextLabel: string;
  mapsSearchBaseQuery: string;
  venueMapHref?: string;
  resetLabel: string;
  emptyTitle: string;
  emptyText: string;
  stays: readonly PracticalInfoStay[];
}

export interface PracticalInfoAccommodationGuide {
  heroTitle: string;
  heroIntro: string;
  areasTitle: string;
  areasIntro: string;
  areas: readonly PracticalInfoAccommodationArea[];
  stayTypesTitle: string;
  stayTypesIntro: string;
  stayTypes: readonly PracticalInfoAccommodationOption[];
  stayFinder: PracticalInfoStayFinder;
  checklistTitle: string;
  checklist: readonly string[];
  resourcesTitle: string;
  resources: readonly PracticalInfoResourceLink[];
  notesTitle: string;
}
