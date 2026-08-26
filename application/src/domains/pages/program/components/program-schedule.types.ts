import type { ProgramRoom, ProgramSession, ProgramTrack } from '~/domains/pages/program/model/schedule';

export interface ProgramHighlight {
  label: string;
  value: string;
}

export interface ProgramScheduleHero {
  tagline: string;
  title: string;
  subtitle: string;
  date: string;
  venue: string;
  timezone: string;
}

export interface ProgramScheduleFilters {
  searchLabel: string;
  searchPlaceholder: string;
  trackLabel: string;
  allTracksLabel: string;
  roomLabel: string;
  allRoomsLabel: string;
  selectedOnlyLabel: string;
  displayLabel: string;
  liveLabel: string;
  resetLabel: string;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
}

export interface ProgramScheduleSelection {
  title: string;
  subtitle: string;
  savedLabel: string;
  emptyLabel: string;
  clearLabel: string;
  conflictPromptLabel: string;
  conflictTitleLabel: string;
  conflictDescriptionLabel: string;
  conflictUseLinkLabel: string;
  conflictUseSavedLabel: string;
  shareLabel: string;
  exportLabel: string;
  shareSuccessLabel: string;
  shareUnavailableLabel: string;
  exportEmptyLabel: string;
}

export interface ProgramScheduleLabels {
  timeLabel: string;
  roomLabel: string;
  speakersLabel: string;
  globalLabel: string;
  liveNowLabel: string;
  upcomingLabel: string;
  addLabel: string;
  removeLabel: string;
  detailsLabel: string;
  noResultsTitle: string;
  noResultsText: string;
  emptyTrackSlotLabel: string;
}

export interface ProgramScheduleProps {
  hero: ProgramScheduleHero;
  highlights: readonly ProgramHighlight[];
  filters: ProgramScheduleFilters;
  selection: ProgramScheduleSelection;
  labels: ProgramScheduleLabels;
  tracks: readonly ProgramTrack[];
  rooms: readonly ProgramRoom[];
  sessions: readonly ProgramSession[];
}
