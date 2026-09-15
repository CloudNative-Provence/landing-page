import { eventMeta, formatEventDate, getVenueLabel } from '~/domains/event/config/event';
import type {
  ProgramScheduleFilters,
  ProgramScheduleHero,
  ProgramScheduleLabels,
  ProgramScheduleSelection,
} from '~/domains/pages/program/components/program-schedule.types';
import programContentEn from '~/domains/pages/program/content/en';
import programContentFr from '~/domains/pages/program/content/fr';
import programSchedule from '~/domains/pages/program/content/schedule';
import { assertScheduleMatchesEvent } from '~/domains/pages/program/model/event-date';
import { type ProgramRoom, type ProgramSession } from '~/domains/pages/program/model/schedule';
import type { MetaData } from '~/types';
import { mergeSharedProgramSessions } from './shared-sessions';

type ProgramLocale = 'en' | 'fr';

type ProgramPageStaticContent = {
  metadata: MetaData;
  hero: Omit<ProgramScheduleHero, 'date' | 'venue' | 'timezone'>;
  highlightLabels: {
    rooms: string;
    sessions: string;
  };
  filters: ProgramScheduleFilters;
  selection: ProgramScheduleSelection;
  labels: ProgramScheduleLabels;
};

type ProgramScheduleStaticContent = {
  rooms: readonly ProgramRoom[];
  sessions: readonly ProgramSession[];
};

const buildProgramPageData = (
  locale: ProgramLocale,
  content: ProgramPageStaticContent,
  schedule: ProgramScheduleStaticContent
) => {
  assertScheduleMatchesEvent(schedule, eventMeta);

  return {
    metadata: content.metadata,
    hero: {
      ...content.hero,
      date: formatEventDate(locale),
      venue: getVenueLabel(locale),
      timezone: eventMeta.timeZone,
    },
    highlights: [
      { label: content.highlightLabels.rooms, value: String(schedule.rooms.length) },
      {
        label: content.highlightLabels.sessions,
        value: String(mergeSharedProgramSessions(schedule.sessions, schedule.rooms).length),
      },
    ],
    filters: content.filters,
    selection: content.selection,
    labels: content.labels,
    rooms: schedule.rooms,
    sessions: schedule.sessions,
  };
};

export const programEnPageData = buildProgramPageData('en', programContentEn, programSchedule);
export const programFrPageData = buildProgramPageData('fr', programContentFr, programSchedule);
