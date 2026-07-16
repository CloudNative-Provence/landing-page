import { describe, expect, it, vi } from 'vitest';

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Aix-en-Provence',
    place: '',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-09-17T00:00:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/kcd-provence-2026',
    },
  },
}));

import { composeVenueLabel, composeVenueName, eventMeta } from './event';

describe('event venue helpers', () => {
  it('falls back to the city when the place is empty', () => {
    expect(composeVenueName('', 'Aix-en-Provence')).toBe('Aix-en-Provence');
    expect(composeVenueLabel('', 'Aix-en-Provence')).toBe('Aix-en-Provence');
    expect(eventMeta.venueName).toBe('Aix-en-Provence');
    expect(eventMeta.venueLabel).toBe('Aix-en-Provence');
  });

  it('composes venue strings when the place is present', () => {
    expect(composeVenueName('Palais des Congres', 'Aix-en-Provence')).toBe('Palais des Congres, Aix-en-Provence');
    expect(composeVenueLabel('Palais des Congres', 'Aix-en-Provence')).toBe('Palais des Congres · Aix-en-Provence');
  });
});
