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

import gettingThereEn from './en';
import gettingThereFr from './fr';

describe('getting-there topic content', () => {
  it('provides structured travel guidance and official resources in both locales', () => {
    expect(gettingThereEn.travelGuide?.modes).toHaveLength(4);
    expect(gettingThereEn.travelGuide?.plannerTitle).toBe('Travel planner');
    expect(gettingThereEn.travelGuide?.modes.every((mode) => mode.route.length === 3)).toBe(true);
    expect(gettingThereEn.travelGuide?.locationMapHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France'
    );
    expect(gettingThereEn.travelGuide?.resources.map((resource) => resource.href)).toEqual([
      'https://www.aixenprovence-congres.com/en/',
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France',
      'https://www.aixenprovence-congres.com/en/aix-en-provence-convention-centre/access/',
      'https://www.aixenprovencetourism.com/en/access-transport/',
      'https://www.aixenprovencetourism.com/en/plan-your-trip/aix-maps/',
      'https://www.lametropolemobilite.fr/',
      'https://www.sncf-connect.com/en-en/',
    ]);
    expect(gettingThereEn.travelGuide?.tips[0]).toContain('last shuttle');

    expect(gettingThereFr.travelGuide?.modes).toHaveLength(4);
    expect(gettingThereFr.travelGuide?.plannerTitle).toBe('Planificateur de trajet');
    expect(gettingThereFr.travelGuide?.modes.every((mode) => mode.route.length === 3)).toBe(true);
    expect(gettingThereFr.travelGuide?.locationMapHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France'
    );
    expect(gettingThereFr.travelGuide?.resources.map((resource) => resource.href)).toEqual([
      'https://www.aixenprovence-congres.com/en/',
      'https://www.google.com/maps/search/?api=1&query=Centre%20des%20Congr%C3%A8s%20d%27Aix-en-Provence%2C%2014%20Boulevard%20Carnot%2C%2013100%20Aix-en-Provence%2C%20France',
      'https://www.aixenprovence-congres.com/en/aix-en-provence-convention-centre/access/',
      'https://www.aixenprovencetourism.com/acces-transports/',
      'https://www.aixenprovencetourism.com/preparer-son-sejour/aix-plans/',
      'https://www.lametropolemobilite.fr/',
      'https://www.sncf-connect.com/',
    ]);
    expect(gettingThereFr.travelGuide?.tips[0]).toContain('dernière navette');
  });
});
