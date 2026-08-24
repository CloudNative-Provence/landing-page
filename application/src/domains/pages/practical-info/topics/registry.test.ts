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

vi.mock('~/domains/pages/practical-info/components/PracticalInfoTopicContent.astro', () => ({ default: {} }));
vi.mock(
  '~/domains/pages/practical-info/topics/accommodation/components/PracticalInfoAccommodationTopicContent.astro',
  () => ({
    default: {},
  })
);
vi.mock(
  '~/domains/pages/practical-info/topics/activities/components/PracticalInfoActivitiesTopicContent.astro',
  () => ({
    default: {},
  })
);
vi.mock(
  '~/domains/pages/practical-info/topics/getting-there/components/PracticalInfoGettingThereTopicContent.astro',
  () => ({
    default: {},
  })
);
vi.mock('~/domains/pages/practical-info/topics/parking/components/PracticalInfoParkingTopicContent.astro', () => ({
  default: {},
}));

import { PracticalInfoTopicRegistry } from './registry';

describe('PracticalInfoTopicRegistry', () => {
  it('resolves practical information topic content for the requested locale', () => {
    const pageDefinition = PracticalInfoTopicRegistry.resolve('parking', 'fr');

    expect(pageDefinition.layout).toBe('page');
    expect(pageDefinition.metadata.title).toBe('Parkings');
    expect(pageDefinition.props.title).toBe('Parkings');
    expect(pageDefinition.props.callToAction).toBeUndefined();
  });

  it('passes structured travel-guide props for the getting-there page', () => {
    const pageDefinition = PracticalInfoTopicRegistry.resolve('getting-there', 'en');

    expect(pageDefinition.props.summary).toContain('15 to 30 minutes');
    expect(pageDefinition.props.travelGuide).toBeDefined();
    expect(pageDefinition.props.travelGuide).toMatchObject({
      plannerTitle: 'Travel planner',
      modesTitle: 'Choose the transport mode that matches your trip',
    });
  });

  it('passes structured accommodation-guide props for the accommodation page', () => {
    const pageDefinition = PracticalInfoTopicRegistry.resolve('accommodation', 'en');

    expect(pageDefinition.props.summary).toContain('guesthouses');
    expect(pageDefinition.props.accommodationGuide).toBeDefined();
    expect(pageDefinition.props.accommodationGuide).toMatchObject({
      areasTitle: 'Choose your base area first',
      stayTypesTitle: 'Match the lodging style to your trip',
    });
  });

  it('exposes all practical information topic keys', () => {
    expect(PracticalInfoTopicRegistry.getTopicKeys()).toEqual([
      'accommodation',
      'getting-there',
      'parking',
      'activities',
    ]);
  });
});
