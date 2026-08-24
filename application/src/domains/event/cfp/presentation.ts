import { EVENT } from 'astrowind:config';
import {
  type CfpAvailabilityLocale,
  type CfpAvailabilityStatuses,
  type CfpImportantDateItem,
  type CfpImportantDateLabels,
  type CfpScheduleConfig,
  resolveCfpPhase,
} from './availability';

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

const eventDayDate = parseRequiredDate(EVENT.startsAt, 'Invalid event day date');

if (cfpDates.closesAt && cfpDates.closesAt.getTime() <= cfpDates.opensAt.getTime()) {
  throw new RangeError('CFP close date must be after the open date');
}

export const buildCfpStatuses = (locale: CfpAvailabilityLocale): CfpAvailabilityStatuses => {
  const opensAtLabel = formatLocalizedDate(cfpDates.opensAt, locale, EVENT.timeZone);
  const closesAtLabel = cfpDates.closesAt
    ? formatLocalizedDate(getDisplayCloseDate(cfpDates.closesAt), locale, EVENT.timeZone)
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
    date: formatLocalizedDate(cfpDates.opensAt, locale, EVENT.timeZone, true),
  },
  ...(cfpDates.closesAt
    ? [
        {
          label: labels.closes,
          date: formatLocalizedDate(getDisplayCloseDate(cfpDates.closesAt), locale, EVENT.timeZone, true),
        },
      ]
    : []),
  ...(cfpDates.speakersNotifiedAt
    ? [
        {
          label: labels.speakersNotified,
          date: formatLocalizedDate(cfpDates.speakersNotifiedAt, locale, EVENT.timeZone, true, true),
        },
      ]
    : []),
  {
    label: labels.eventDay,
    date: formatLocalizedDate(eventDayDate, locale, EVENT.timeZone, true),
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
  timeZone: string,
  includeYear = false,
  useFirstDayOrdinal = false
): string {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';
  const formatted = new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'long',
    ...(includeYear ? { year: 'numeric' as const } : {}),
    timeZone,
  }).format(value);

  if (!useFirstDayOrdinal || locale !== 'fr' || getDayOfMonth(value, timeZone) !== 1) {
    return formatted;
  }

  return formatted.replace(/^1 /, '1er ');
}

function getDisplayCloseDate(value: Date): Date {
  return new Date(value.getTime() - 1);
}

function getDayOfMonth(value: Date, timeZone: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone,
    }).format(value)
  );
}
