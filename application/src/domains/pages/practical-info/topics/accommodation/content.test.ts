import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { VenueInfo } from '~/domains/event/config/venue';

const { eventConfig } = vi.hoisted(() => ({
  eventConfig: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Test City',
    place: { en: {} as VenueInfo, fr: {} as VenueInfo },
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-07-16T00:00:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference.example/submit',
    },
  },
}));

vi.mock('astrowind:config', () => ({ EVENT: eventConfig }));

beforeEach(() => {
  vi.resetModules();
  eventConfig.place.en = {
    name: 'Test Conference Hall',
    address: '42 Event Road',
    mapUrl: 'https://maps.example/venue-en',
    url: 'https://venue.example/en/',
  };
  eventConfig.place.fr = {
    name: 'Centre de conférence test',
    address: '42 rue de la Conférence',
    mapUrl: 'https://maps.example/venue-fr',
    url: 'https://venue.example/fr/',
  };
});

describe.each([
  { locale: 'en' as const, loadContent: () => import('./en') },
  { locale: 'fr' as const, loadContent: () => import('./fr') },
])('accommodation content ($locale)', ({ locale, loadContent }) => {
  it('uses the localized venue to anchor accommodation searches', async () => {
    const venue = eventConfig.place[locale];

    const { default: content } = await loadContent();
    const { stayFinder } = content.accommodationGuide;

    expect(stayFinder.mapsSearchContextLabel).toBe(venue.name);
    expect(stayFinder.mapsSearchBaseQuery).toContain(venue.name);
    expect(stayFinder.mapsSearchBaseQuery).toContain(venue.address);
  });

  it('passes through the configured venue map and website', async () => {
    const venue = eventConfig.place[locale];

    const { default: content } = await loadContent();
    const guide = content.accommodationGuide;

    expect(guide.stayFinder.venueMapHref).toBe(venue.mapUrl);
    expect(guide.resources).toContainEqual(expect.objectContaining({ href: venue.url }));
  });

  it('updates directions when the venue changes without changing hotel destinations', async () => {
    const { default: original } = await loadContent();
    const originalLinks = original.accommodationGuide.stayFinder.stays.map((stay) => new URL(stay.mapHref));
    const relocatedVenue = { name: 'Replacement Hall', address: '7 New Road' };
    eventConfig.place[locale] = relocatedVenue;
    vi.resetModules();

    const { default: relocated } = await loadContent();
    const relocatedLinks = relocated.accommodationGuide.stayFinder.stays.map((stay) => new URL(stay.mapHref));

    expect(relocatedLinks.map((link) => link.searchParams.get('destination'))).toEqual(
      originalLinks.map((link) => link.searchParams.get('destination'))
    );
    for (const link of relocatedLinks) {
      expect(link.origin).toBe('https://www.google.com');
      expect(link.pathname).toBe('/maps/dir/');
      expect(link.searchParams.get('api')).toBe('1');
      expect(link.searchParams.get('origin')).toBe(
        `${relocatedVenue.name}, ${eventConfig.city}, ${relocatedVenue.address}`
      );
      expect(link.searchParams.get('destination')).toBeTruthy();
    }
  });

  it('uses the city with the venue name when no street address is configured', async () => {
    eventConfig.place[locale].address = undefined;

    const { default: content } = await loadContent();
    const { stayFinder } = content.accommodationGuide;

    expect(stayFinder.mapsSearchBaseQuery).toContain(eventConfig.place[locale].name);
    expect(stayFinder.mapsSearchBaseQuery).toContain(eventConfig.city);
    expect(stayFinder.mapsSearchBaseQuery).not.toContain('undefined');
  });

  it.each(['', ' \t '])('falls back to the city when the venue name is %j', async (name) => {
    eventConfig.place[locale] = { name };

    const { default: content } = await loadContent();
    const { stayFinder } = content.accommodationGuide;

    expect(stayFinder.mapsSearchContextLabel).toBe(eventConfig.city);
    expect(stayFinder.mapsSearchBaseQuery).toContain(eventConfig.city);
    expect(stayFinder.mapsSearchBaseQuery).not.toContain('undefined');
    expect(stayFinder.venueMapHref).toBeUndefined();
    for (const stay of stayFinder.stays) {
      expect(new URL(stay.mapHref).searchParams.get('origin')).toBe(eventConfig.city);
    }
  });
});
