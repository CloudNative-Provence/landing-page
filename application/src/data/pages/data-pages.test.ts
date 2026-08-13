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

import aboutEn from './about/en';
import aboutFr from './about/fr';
import { teamMembers } from './about/teamData';
import { enContent as brandEnContent } from './brand-guidelines/en';
import { frContent as brandFrContent } from './brand-guidelines/fr';
import contactEn from './contact/en';
import contactFr from './contact/fr';
import homeEn from './home/en';
import homeFr from './home/fr';
import privacyEn from './privacy/en';
import privacyFr from './privacy/fr';
import programEn from './program/en';
import programFr from './program/fr';
import sponsoringEn from './sponsoring/en';
import sponsoringFr from './sponsoring/fr';
import termsEn from './terms/en';
import termsFr from './terms/fr';

describe('localized page data modules', () => {
  it('has valid direct imports for all page data files', () => {
    const modules = [
      aboutEn,
      aboutFr,
      teamMembers,
      brandEnContent,
      brandFrContent,
      contactEn,
      contactFr,
      homeEn,
      homeFr,
      programEn,
      programFr,
      privacyEn,
      privacyFr,
      sponsoringEn,
      sponsoringFr,
      termsEn,
      termsFr,
    ];

    expect(modules).toHaveLength(17);
    modules.forEach((mod) => {
      expect(mod).toBeTruthy();
    });
  });

  it('loads all page data modules with exports', () => {
    const modules = import.meta.glob('./**/*.ts', { eager: true });
    const files = Object.entries(modules).filter(([path]) => !path.endsWith('.test.ts'));

    expect(files.length).toBeGreaterThan(0);

    for (const [, mod] of files) {
      const exportedValues = Object.values(mod as Record<string, unknown>);
      expect(exportedValues.length).toBeGreaterThan(0);
      expect(exportedValues.some((value) => typeof value === 'object' || typeof value === 'function')).toBe(true);
    }
  });

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
