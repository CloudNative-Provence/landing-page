import { eventMeta, formatEventDate, getVenueLabel } from '~/domains/event/config/event';
import type {
  ProgramScheduleFilters,
  ProgramScheduleHero,
  ProgramScheduleLabels,
  ProgramScheduleSelection,
} from '~/domains/pages/program/components/program-schedule.types';
import programContentEn from '~/domains/pages/program/content/en';
import programContentFr from '~/domains/pages/program/content/fr';
import programScheduleEn from '~/domains/pages/program/content/schedule.en';
import programScheduleFr from '~/domains/pages/program/content/schedule.fr';
import {
  type ProgramRoom,
  ProgramScheduleBuilder,
  type ProgramSessionDefinition,
  type ProgramTrack,
} from '~/domains/pages/program/model/schedule';
import type { MetaData } from '~/types';

type ProgramLocale = 'en' | 'fr';

type ProgramPageStaticContent = {
  metadata: MetaData;
  hero: Omit<ProgramScheduleHero, 'date' | 'venue' | 'timezone'>;
  highlightLabels: {
    tracks: string;
    rooms: string;
    sessions: string;
  };
  filters: ProgramScheduleFilters;
  selection: ProgramScheduleSelection;
  labels: ProgramScheduleLabels;
};

type ProgramScheduleStaticContent = {
  tracks: readonly ProgramTrack[];
  rooms: readonly ProgramRoom[];
  sessions: readonly ProgramSessionDefinition[];
};

const buildProgramPageData = (
  locale: ProgramLocale,
  content: ProgramPageStaticContent,
  schedule: ProgramScheduleStaticContent
) => ({
  metadata: content.metadata,
  hero: {
    ...content.hero,
    date: formatEventDate(locale),
    venue: getVenueLabel(locale),
    timezone: eventMeta.timeZone,
  },
  highlights: [
    { label: content.highlightLabels.tracks, value: String(schedule.tracks.length) },
    { label: content.highlightLabels.rooms, value: String(schedule.rooms.length) },
    { label: content.highlightLabels.sessions, value: String(schedule.sessions.length) },
  ],
  filters: content.filters,
  selection: content.selection,
  labels: content.labels,
  tracks: schedule.tracks,
  rooms: schedule.rooms,
  sessions: ProgramScheduleBuilder.fromEventDate(eventMeta.startsAt, schedule.sessions),
});

export const programEnPageData = buildProgramPageData('en', programContentEn, programScheduleEn);
export const programFrPageData = buildProgramPageData('fr', programContentFr, programScheduleFr);
