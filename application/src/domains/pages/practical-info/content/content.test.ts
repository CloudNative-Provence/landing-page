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

import practicalInfoEn from './en';
import practicalInfoFr from './fr';

describe('practical information overview content', () => {
  it('links each overview card to a dedicated localized section page', () => {
    expect(practicalInfoEn.items.map((item) => item.callToAction?.href)).toEqual([
      '/en/practical-information/accommodation',
      '/en/practical-information/getting-there',
      '/en/practical-information/parking',
      '/en/practical-information/activities',
    ]);

    expect(practicalInfoFr.items.map((item) => item.callToAction?.href)).toEqual([
      '/fr/infos-pratiques/hebergement',
      '/fr/infos-pratiques/venir',
      '/fr/infos-pratiques/parkings',
      '/fr/infos-pratiques/activites',
    ]);
  });
});
