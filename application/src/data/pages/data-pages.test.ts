import { describe, expect, it } from 'vitest';

import aboutEn from './about/en';
import aboutFr from './about/fr';
import { teamMembers } from './about/teamData';
import { enContent as brandEnContent } from './brand-guidelines/en';
import { frContent as brandFrContent } from './brand-guidelines/fr';
import contactEn from './contact/en';
import contactFr from './contact/fr';
import homeEn from './home/en';
import homeFr from './home/fr';
import programEn from './program/en';
import programFr from './program/fr';
import privacyEn from './privacy/en';
import privacyFr from './privacy/fr';
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
    expect(homeEn.cfp.tracks).toHaveProperty('items');
    expect(homeFr.cfp.tracks).toHaveProperty('items');
    expect(homeEn.cfp.tracks).not.toHaveProperty('list');
    expect(homeFr.cfp.tracks).not.toHaveProperty('list');

    expect(homeEn.cfp.formats.items).toHaveLength(3);
    expect(homeFr.cfp.formats.items).toHaveLength(3);

    expect(homeEn.cfp.tracks.items).toHaveLength(8);
    expect(homeFr.cfp.tracks.items).toHaveLength(8);

    homeEn.cfp.formats.items.forEach((item, index) => {
      expect(homeFr.cfp.formats.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });

    homeEn.cfp.tracks.items.forEach((item, index) => {
      expect(homeFr.cfp.tracks.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });

    homeFr.cfp.tracks.items.forEach((item, index) => {
      expect(homeEn.cfp.tracks.items[index]).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    });
  });
});
