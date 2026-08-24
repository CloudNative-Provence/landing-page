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

import activitiesEn from './en';
import activitiesFr from './fr';

describe('activities topic content', () => {
  it('provides a structured activities guide in both locales', () => {
    const guideEn = activitiesEn.activitiesGuide;
    const guideFr = activitiesFr.activitiesGuide;

    expect(guideEn?.categories.map((category) => category.id)).toEqual(['in-aix', 'nature', 'food-wine']);
    expect(guideFr?.categories.map((category) => category.id)).toEqual(['in-aix', 'nature', 'food-wine']);

    expect(guideEn?.categories[0]?.options.some((option) => option.name === 'Cezanne sites')).toBe(true);
    expect(guideFr?.categories[0]?.options.some((option) => option.name === 'Les sites de Cézanne')).toBe(true);

    expect(guideEn?.tips.length).toBeGreaterThan(0);
    expect(guideFr?.tips.length).toBeGreaterThan(0);
    expect(guideEn?.notes.length).toBeGreaterThan(0);
    expect(guideFr?.notes.length).toBeGreaterThan(0);
  });

  it('uses valid https links for every option and resource in both locales', () => {
    for (const guide of [activitiesEn.activitiesGuide, activitiesFr.activitiesGuide]) {
      const optionHrefs = (guide?.categories ?? []).flatMap((category) =>
        category.options.map((option) => option.linkHref)
      );
      const resourceHrefs = (guide?.resources ?? []).map((resource) => resource.href);

      expect(optionHrefs.length).toBeGreaterThan(0);
      expect([...optionHrefs, ...resourceHrefs].every((href) => href.startsWith('https://'))).toBe(true);
    }
  });
});
