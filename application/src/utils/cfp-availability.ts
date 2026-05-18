export type CfpAvailabilityPhase = 'upcoming' | 'open' | 'closed';

export interface CfpAvailabilityConfig {
  opensAt: string;
  closesAt?: string;
  timeZone?: string;
}

export interface CfpScheduleConfig extends CfpAvailabilityConfig {
  speakersNotifiedAt?: string;
}

export interface CfpAvailabilityStatuses {
  upcoming: string;
  open: string;
  closed: string;
}

export interface CfpImportantDateLabels {
  opens: string;
  closes: string;
  speakersNotified: string;
  eventDay: string;
}

export interface CfpImportantDateItem {
  label: string;
  date: string;
}

export type CfpAvailabilityLocale = 'en' | 'fr';

export const resolveCfpPhase = (
  { opensAt, closesAt }: CfpAvailabilityConfig,
  now: Date = new Date()
): CfpAvailabilityPhase => {
  if (Number.isNaN(now.getTime())) {
    throw new TypeError('Invalid current date');
  }

  const opensAtDate = parseRequiredDate(opensAt, 'Invalid CFP open date');
  const closesAtDate = parseOptionalDate(closesAt, 'Invalid CFP close date');

  if (closesAtDate && closesAtDate.getTime() <= opensAtDate.getTime()) {
    throw new RangeError('CFP close date must be after the open date');
  }

  const nowTime = now.getTime();

  if (nowTime < opensAtDate.getTime()) {
    return 'upcoming';
  }

  if (closesAtDate && nowTime >= closesAtDate.getTime()) {
    return 'closed';
  }

  return 'open';
};

const parseRequiredDate = (value: string, errorMessage: string): Date => {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new TypeError(errorMessage);
  }

  return parsedDate;
};

const parseOptionalDate = (value: string | undefined, errorMessage: string): Date | undefined => {
  if (!value) {
    return undefined;
  }

  return parseRequiredDate(value, errorMessage);
};
