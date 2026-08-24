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

import parkingEn from './en';
import parkingFr from './fr';

describe('parking topic content', () => {
  it('provides a structured parking guide in both locales', () => {
    const guideEn = parkingEn.parkingGuide;
    const guideFr = parkingFr.parkingGuide;

    expect(guideEn?.categories.map((category) => category.id)).toEqual(['venue', 'city-centre', 'park-and-ride']);
    expect(guideFr?.categories.map((category) => category.id)).toEqual(['venue', 'city-centre', 'park-and-ride']);

    expect(guideEn?.categories[0]?.options[0]?.name).toBe('Parking Carnot');
    expect(guideFr?.categories[0]?.options[0]?.name).toBe('Parking Carnot');

    expect(guideEn?.categories[0]?.badge).toBe('Under the congress centre');
    expect(guideFr?.categories[0]?.badge).toBe('Sous le centre des congrès');

    expect(guideEn?.tips.length).toBeGreaterThan(0);
    expect(guideFr?.tips.length).toBeGreaterThan(0);
    expect(guideEn?.notes.length).toBeGreaterThan(0);
    expect(guideFr?.notes.length).toBeGreaterThan(0);
  });

  it('links to the official park-and-ride and parking resources in both locales', () => {
    const resourceHrefsEn = parkingEn.parkingGuide?.resources.map((resource) => resource.href) ?? [];
    const resourceHrefsFr = parkingFr.parkingGuide?.resources.map((resource) => resource.href) ?? [];

    for (const hrefs of [resourceHrefsEn, resourceHrefsFr]) {
      expect(hrefs.some((href) => href.includes('lametropolemobilite.fr/parking-relais/'))).toBe(true);
      expect(hrefs.some((href) => href.includes('aixenprovencetourism.com/acces-transports/parkings/'))).toBe(true);
      expect(hrefs.every((href) => href.startsWith('https://'))).toBe(true);
    }
  });

  it('keeps Parking Carnot as the closest option to the venue', () => {
    expect(parkingEn.content).toContain('Carnot');
    expect(parkingFr.content).toContain('Carnot');
  });
});
