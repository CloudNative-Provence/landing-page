import { describe, expect, it, vi } from 'vitest';

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Aix-en-Provence',
    place: 'Palais des Congrès',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-09-13T23:59:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/cloud-native-provence-2026',
    },
  },
}));

import { buildCfpImportantDates, buildCfpStatuses } from '~/data/meta/event';

import { resolveCfpPhase } from './cfp-availability';

describe('resolveCfpPhase', () => {
  const availability = {
    opensAt: '2026-05-15T00:00:00+02:00',
    closesAt: '2026-09-13T23:59:00+02:00',
  };

  it('returns upcoming before the CFP opens', () => {
    expect(resolveCfpPhase(availability, new Date('2026-05-14T21:59:59Z'))).toBe('upcoming');
  });

  it('returns open once the opening date is reached', () => {
    expect(resolveCfpPhase(availability, new Date('2026-05-14T22:00:00Z'))).toBe('open');
  });

  it('returns closed from the configured closing boundary', () => {
    expect(resolveCfpPhase(availability, new Date('2026-09-13T21:58:59Z'))).toBe('open');
    expect(resolveCfpPhase(availability, new Date('2026-09-13T21:59:00Z'))).toBe('closed');
  });

  it('rejects an invalid date range', () => {
    expect(() =>
      resolveCfpPhase({
        opensAt: '2026-05-15T00:00:00+02:00',
        closesAt: '2026-05-14T23:59:59+02:00',
      })
    ).toThrow(RangeError);
  });
});

describe('event CFP helpers', () => {
  it('builds localized statuses from the shared event config', () => {
    expect(buildCfpStatuses('en')).toEqual({
      upcoming: 'Opens May 15',
      open: 'Open until September 13',
      closed: 'CFP closed',
    });

    expect(buildCfpStatuses('fr')).toEqual({
      upcoming: 'Ouvre le 15 mai',
      open: "Ouvert jusqu'au 13 septembre",
      closed: 'CFP clos',
    });
  });

  it('builds localized important dates from the shared event config', () => {
    expect(
      buildCfpImportantDates('en', {
        opens: 'CFP Opens',
        closes: 'CFP Closes',
        speakersNotified: 'Speakers Notified',
        eventDay: 'Event Day',
      })
    ).toEqual([
      { label: 'CFP Opens', date: 'May 15, 2026' },
      { label: 'CFP Closes', date: 'September 13, 2026' },
      { label: 'Speakers Notified', date: 'September 1, 2026' },
      { label: 'Event Day', date: 'December 10, 2026' },
    ]);

    expect(
      buildCfpImportantDates('fr', {
        opens: 'Ouverture du CFP',
        closes: 'Clôture du CFP',
        speakersNotified: 'Notification des speakers',
        eventDay: 'Jour J',
      })
    ).toEqual([
      { label: 'Ouverture du CFP', date: '15 mai 2026' },
      { label: 'Clôture du CFP', date: '13 septembre 2026' },
      { label: 'Notification des speakers', date: '1er septembre 2026' },
      { label: 'Jour J', date: '10 décembre 2026' },
    ]);
  });
});
