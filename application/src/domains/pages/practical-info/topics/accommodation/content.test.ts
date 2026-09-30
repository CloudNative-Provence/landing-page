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

import { mockedVenueReference } from '../test-constants';
import accommodationEn from './en';
import accommodationFr from './fr';

describe('accommodation topic content', () => {
  it('uses the same distinct property photos in both locales', () => {
    const englishStays = accommodationEn.accommodationGuide!.stayFinder.stays;
    const frenchStays = accommodationFr.accommodationGuide!.stayFinder.stays;

    expect(new Set(englishStays.map((stay) => stay.thumbnail.src)).size).toBe(englishStays.length);
    for (const stay of englishStays) {
      expect(frenchStays.find((candidate) => candidate.mapHref === stay.mapHref)?.thumbnail).toEqual(stay.thumbnail);
    }
  });

  it('provides structured accommodation guidance in both locales', () => {
    const englishStays = accommodationEn.accommodationGuide!.stayFinder.stays;
    const frenchStays = accommodationFr.accommodationGuide!.stayFinder.stays;

    expect(accommodationEn.accommodationGuide?.areas).toHaveLength(3);
    expect(accommodationEn.accommodationGuide?.stayTypes).toHaveLength(3);
    expect(accommodationEn.accommodationGuide?.resources.map((resource) => resource.text)).toContain('Venue website');
    expect(accommodationEn.accommodationGuide?.checklist[0]).toContain('Book early');

    expect(accommodationFr.accommodationGuide?.areas).toHaveLength(3);
    expect(accommodationFr.accommodationGuide?.stayTypes).toHaveLength(3);
    expect(accommodationFr.accommodationGuide?.resources.map((resource) => resource.text)).toContain('Site du lieu');
    expect(accommodationFr.accommodationGuide?.checklist[0]).toContain('Réservez tôt');

    expect(accommodationEn.accommodationGuide?.stayFinder.stays).toHaveLength(22);
    expect(accommodationFr.accommodationGuide?.stayFinder.stays).toHaveLength(22);
    expect(accommodationEn.accommodationGuide?.stayFinder.filters.map((group) => group.id)).toEqual([
      'zone',
      'type',
      'feature',
      'coupon',
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
    expect(englishStays.filter((stay) => stay.discountCode)).toHaveLength(1);
    expect(frenchStays.filter((stay) => stay.discountCode)).toHaveLength(1);
    expect(englishStays.find((stay) => stay.name === 'Hotel Saint-Christophe')?.discountCode).toEqual({
      label: 'Discount code',
      value: 'KCDProvence15',
    });
    expect(frenchStays.find((stay) => stay.name === 'Hôtel Saint-Christophe')?.discountCode).toEqual({
      label: 'Code de réduction',
      value: 'KCDProvence15',
    });
    expect(englishStays.some((stay) => stay.name.includes('Negrecoste'))).toBe(false);
    expect(frenchStays.some((stay) => stay.name.includes('Negrecoste'))).toBe(false);

    expect(
      [
        ...(accommodationEn.accommodationGuide?.stayFinder.stays ?? []),
        ...(accommodationFr.accommodationGuide?.stayFinder.stays ?? []),
      ].every((stay) => {
        const mapHref = new URL(stay.mapHref);

        return (
          stay.websiteHref.startsWith('https://') &&
          mapHref.origin === 'https://www.google.com' &&
          mapHref.pathname === '/maps/dir/' &&
          mapHref.searchParams.get('api') === '1' &&
          mapHref.searchParams.get('origin') === mockedVenueReference &&
          stay.address.length > 0 &&
          stay.zoneId.length > 0 &&
          stay.typeId.length > 0 &&
          stay.thumbnail.src.endsWith('.webp')
        );
      })
    ).toBe(true);
  });
});
