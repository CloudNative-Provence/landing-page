import { describe, expect, it, vi } from 'vitest';

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Aix-en-Provence',
    place: 'Palais des Congrès',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-07-16T00:00:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/cloud-native-provence-2026',
    },
  },
}));

import homeEn from './en';
import homeFr from './fr';

describe('home page content', () => {
  it('keeps CFP formats and topic descriptions aligned in both locales', () => {
    expect(homeEn.cfp.formats).toHaveProperty('items');
    expect(homeFr.cfp.formats).toHaveProperty('items');
    expect(homeEn.cfp.topics).toHaveProperty('items');
    expect(homeFr.cfp.topics).toHaveProperty('items');

    expect(homeEn.cfp.formats.items).toHaveLength(3);
    expect(homeFr.cfp.formats.items).toHaveLength(3);

    expect(homeEn.cfp.topics.items).toHaveLength(8);
    expect(homeFr.cfp.topics.items).toHaveLength(8);

    homeEn.cfp.formats.items.forEach((item, index) => {
      expect(homeFr.cfp.formats.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });

    homeEn.cfp.topics.items.forEach((item, index) => {
      expect(homeFr.cfp.topics.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });

    homeFr.cfp.topics.items.forEach((item, index) => {
      expect(homeEn.cfp.topics.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });
  });

  it('keeps CFP availability boundaries aligned in both locales', () => {
    expect(homeEn.cfp.availability).toBeDefined();
    expect(homeFr.cfp.availability).toBeDefined();

    expect(homeEn.cfp.availability.opensAt).toBe(homeFr.cfp.availability.opensAt);
    expect(homeEn.cfp.availability.closesAt).toBe(homeFr.cfp.availability.closesAt);

    expect(homeEn.cfp.availability.statuses.upcoming).toBeTruthy();
    expect(homeEn.cfp.availability.statuses.open).toBeTruthy();
    expect(homeEn.cfp.availability.statuses.closed).toBeTruthy();
    expect(homeFr.cfp.availability.statuses.upcoming).toBeTruthy();
    expect(homeFr.cfp.availability.statuses.open).toBeTruthy();
    expect(homeFr.cfp.availability.statuses.closed).toBeTruthy();
  });
});
