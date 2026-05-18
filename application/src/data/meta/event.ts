import { EVENT } from 'astrowind:config';

import {
  type CfpAvailabilityLocale,
  type CfpAvailabilityStatuses,
  type CfpImportantDateItem,
  type CfpImportantDateLabels,
  type CfpScheduleConfig,
  resolveCfpPhase,
} from '~/utils/cfp-availability';

export type EventLocale = 'en' | 'fr';

export const composeVenueName = (place: string, city: string): string => {
  const normalizedPlace = place.trim();

  return normalizedPlace ? `${normalizedPlace}, ${city}` : city;
};

export const composeVenueLabel = (place: string, city: string): string => {
  const normalizedPlace = place.trim();

  return normalizedPlace ? `${normalizedPlace} · ${city}` : city;
};

export const eventMeta = {
  startsAt: EVENT.startsAt,
  timeZone: EVENT.timeZone,
  city: EVENT.city,
  place: EVENT.place,
  venueName: composeVenueName(EVENT.place, EVENT.city),
  venueLabel: composeVenueLabel(EVENT.place, EVENT.city),
} as const;

export const cfpSchedule = {
  opensAt: EVENT.cfp.opensAt,
  closesAt: EVENT.cfp.closesAt,
  speakersNotifiedAt: EVENT.cfp.speakersNotifiedAt,
  timeZone: EVENT.timeZone,
} as const satisfies CfpScheduleConfig;

export const cfpSubmissionUrl = EVENT.cfp.submissionUrl;

const cfpDates = {
  opensAt: parseRequiredDate(cfpSchedule.opensAt, 'Invalid CFP open date'),
  closesAt: parseOptionalDate(cfpSchedule.closesAt, 'Invalid CFP close date'),
  speakersNotifiedAt: parseOptionalDate(cfpSchedule.speakersNotifiedAt, 'Invalid speakers notified date'),
} as const;

const eventDayDate = parseRequiredDate(eventMeta.startsAt, 'Invalid event day date');

if (cfpDates.closesAt && cfpDates.closesAt.getTime() <= cfpDates.opensAt.getTime()) {
  throw new RangeError('CFP close date must be after the open date');
}

export const formatEventDate = (locale: EventLocale): string => {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';

  return new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: eventMeta.timeZone,
  }).format(new Date(eventMeta.startsAt));
};

export const buildCfpStatuses = (locale: CfpAvailabilityLocale): CfpAvailabilityStatuses => {
  const opensAtLabel = formatLocalizedDate(cfpDates.opensAt, locale);
  const closesAtLabel = cfpDates.closesAt
    ? formatLocalizedDate(getDisplayCloseDate(cfpDates.closesAt), locale)
    : undefined;

  if (locale === 'fr') {
    return {
      upcoming: `Ouvre le ${opensAtLabel}`,
      open: closesAtLabel ? `Ouvert jusqu'au ${closesAtLabel}` : 'CFP ouvert',
      closed: 'CFP clos',
    };
  }

  return {
    upcoming: `Opens ${opensAtLabel}`,
    open: closesAtLabel ? `Open until ${closesAtLabel}` : 'CFP open',
    closed: 'CFP closed',
  };
};

export const buildCfpImportantDates = (
  locale: CfpAvailabilityLocale,
  labels: CfpImportantDateLabels
): CfpImportantDateItem[] => [
  {
    label: labels.opens,
    date: formatLocalizedDate(cfpDates.opensAt, locale, true),
  },
  ...(cfpDates.closesAt
    ? [
        {
          label: labels.closes,
          date: formatLocalizedDate(getDisplayCloseDate(cfpDates.closesAt), locale, true),
        },
      ]
    : []),
  ...(cfpDates.speakersNotifiedAt
    ? [
        {
          label: labels.speakersNotified,
          date: formatLocalizedDate(cfpDates.speakersNotifiedAt, locale, true, true),
        },
      ]
    : []),
  {
    label: labels.eventDay,
    date: formatLocalizedDate(eventDayDate, locale, true),
  },
];

export const isCfpOpen = (now: Date = new Date()) => resolveCfpPhase(cfpSchedule, now) === 'open';

function parseRequiredDate(value: string, errorMessage: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new TypeError(errorMessage);
  }

  return parsedDate;
}

function parseOptionalDate(value: string | undefined, errorMessage: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return parseRequiredDate(value, errorMessage);
}

function formatLocalizedDate(
  value: Date,
  locale: CfpAvailabilityLocale,
  includeYear = false,
  useFirstDayOrdinal = false
): string {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  const formatted = new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' as const } : {}),
    timeZone: eventMeta.timeZone,
  }).format(value);

  if (!useFirstDayOrdinal || locale !== 'fr' || getDayOfMonth(value) !== 1) {
    return formatted;
  }

  return formatted.replace(/^1 /, '1er ');
}

function getDisplayCloseDate(value: Date): Date {
  return new Date(value.getTime() - 1);
}

function getDayOfMonth(value: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: eventMeta.timeZone,
    }).format(value)
  );
}
