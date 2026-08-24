import { describe, expect, it, vi } from 'vitest';

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Aix-en-Provence',
    place: 'Palais des Congrès',
    venueMapUrl:
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-07-16T00:00:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/cloud-native-provence-2026',
    },
  },
}));

import accommodationEn from './en';
import accommodationFr from './fr';

describe('accommodation topic content', () => {
  it('provides structured accommodation guidance in both locales', () => {
    expect(accommodationEn.accommodationGuide?.areas).toHaveLength(3);
    expect(accommodationEn.accommodationGuide?.stayTypes).toHaveLength(3);
    expect(accommodationEn.accommodationGuide?.resources.map((resource) => resource.text)).toContain('Venue website');
    expect(accommodationEn.accommodationGuide?.checklist[0]).toContain('Book early');

    expect(accommodationFr.accommodationGuide?.areas).toHaveLength(3);
    expect(accommodationFr.accommodationGuide?.stayTypes).toHaveLength(3);
    expect(accommodationFr.accommodationGuide?.resources.map((resource) => resource.text)).toContain('Site du lieu');
    expect(accommodationFr.accommodationGuide?.checklist[0]).toContain('Réservez tôt');

    expect(accommodationEn.accommodationGuide?.stayFinder.stays).toHaveLength(21);
    expect(accommodationFr.accommodationGuide?.stayFinder.stays).toHaveLength(21);
    expect(accommodationEn.accommodationGuide?.stayFinder.filters.map((group) => group.id)).toEqual([
      'zone',
      'type',
      'feature',
    ]);
    expect(accommodationEn.accommodationGuide?.stayFinder.filters[0]?.options[0]?.searchQuery).toBeUndefined();
    expect(accommodationFr.accommodationGuide?.stayFinder.filters[0]?.options[0]?.searchQuery).toBeUndefined();
    expect(accommodationEn.accommodationGuide?.stayFinder.mapsSearchContextLabel).toContain('Palais des Congrès');
    expect(accommodationFr.accommodationGuide?.stayFinder.mapsSearchContextLabel).toContain('Palais des Congrès');
    expect(accommodationEn.accommodationGuide?.stayFinder.mapsSearchBaseQuery).toContain('Palais des Congrès');
    expect(accommodationFr.accommodationGuide?.stayFinder.mapsSearchBaseQuery).toContain('Palais des Congrès');
    expect(accommodationEn.accommodationGuide?.stayFinder.mapsSearchBaseQuery).toContain('Aix-en-Provence');
    expect(accommodationFr.accommodationGuide?.stayFinder.mapsSearchBaseQuery).toContain('Aix-en-Provence');
    expect(accommodationEn.accommodationGuide?.stayFinder.mapsSearchBaseQuery).not.toContain('undefined');
    expect(accommodationFr.accommodationGuide?.stayFinder.mapsSearchBaseQuery).not.toContain('undefined');
    expect(accommodationEn.accommodationGuide?.stayFinder.venueMapHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France'
    );
    expect(accommodationFr.accommodationGuide?.stayFinder.venueMapHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France'
    );

    expect(
      [
        ...(accommodationEn.accommodationGuide?.stayFinder.stays ?? []),
        ...(accommodationFr.accommodationGuide?.stayFinder.stays ?? []),
      ].every(
        (stay) =>
          stay.websiteHref.startsWith('https://') &&
          stay.mapHref.startsWith('https://') &&
          stay.address.length > 0 &&
          stay.zoneId.length > 0 &&
          stay.typeId.length > 0
      )
    ).toBe(true);
  });
});
