import { afterEach, describe, expect, it, vi } from 'vitest';

const astrowindConfig = vi.hoisted(() => ({
  config: {
    I18N: {
      language: 'fr',
    },
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
    SITE: {
      name: 'Cloud Native Provence',
      site: 'https://cloudnative-provence.fr',
      base: '/',
      trailingSlash: false,
    },
    METADATA: {
      description: 'Conference site',
    },
    APP_BLOG: {
      isEnabled: false,
      isRelatedPostsEnabled: false,
      postsPerPage: 6,
      post: { permalink: '/blog/%slug%', isEnabled: false, robots: { index: true } },
      list: { pathname: 'blog', isEnabled: false, robots: { index: true } },
      category: { pathname: 'category', isEnabled: false, robots: { index: true } },
      tag: { pathname: 'tag', isEnabled: false, robots: { index: false } },
    },
    APP_PROGRAM: {
      isEnabled: true,
    },
  },
}));

vi.mock('astrowind:config', () => astrowindConfig.config);

vi.mock('~/assets/favicons/favicon.svg', () => ({
  default: { src: '/favicon.svg' },
}));

import { getFooterData, getHeaderData } from './site-navigation';

describe('navigation', () => {
  const cfpOpenDate = new Date('2026-05-18T10:00:00+02:00');
  const cfpClosedDate = new Date('2026-08-01T10:00:00+02:00');
  const eventDate = new Date('2026-12-10T10:00:00+01:00');

  afterEach(() => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = true;
  });

  it.each(['fr', 'en'] as const)('shares section names and links with the %s footer', (locale) => {
    for (const date of [cfpOpenDate, cfpClosedDate, eventDate]) {
      const header = getHeaderData(locale, date);
      const footer = getFooterData(locale, date);
      const groups = header.links.filter((link) => link.links);
      const promoted = header.links.filter((link) => link.href);
      expect(groups.map((group) => group.text)).toEqual(footer.links.map((section) => section.title));
      for (const [index, section] of footer.links.entries()) {
        const group = groups[index];
        expect(group.links?.map((link) => link.href)).toEqual(
          section.links.filter((link) => !promoted.some((item) => item.href === link.href)).map((link) => link.href)
        );
      }
      const headerUrls = header.links.flatMap((link) => link.links?.map((child) => child.href) ?? [link.href]);
      expect(new Set(headerUrls).size).toBe(headerUrls.length);
      expect(headerUrls.toSorted()).toEqual(
        footer.links.flatMap((section) => section.links.map((link) => link.href)).toSorted()
      );
    }
  });

  it('puts programme and sponsoring first outside the event day', () => {
    const header = getHeaderData('fr', cfpClosedDate);
    expect(header.links.map((link) => link.text)).toEqual([
      'Programme',
      'Sponsoring',
      'Événement',
      'Infos pratiques',
      'Organisation',
    ]);
    expect(header.links.slice(0, 2).map((link) => link.href)).toEqual(['/fr/programme', '/fr/sponsoring']);
    expect(header.links[2].links?.map((link) => link.href)).toEqual(['/fr/intervenants', '/fr/plan-du-lieu']);
    expect(header.links[4].links?.map((link) => link.href)).toEqual([
      '/fr/a-propos',
      '/fr/contact',
      '/fr/charte-graphique',
    ]);
  });

  it.each([
    ['2026-12-09T22:59:59Z', '/en/sponsoring', '/en/venue-map'],
    ['2026-12-09T23:00:00Z', '/en/venue-map', '/en/sponsoring'],
    ['2026-12-10T22:59:59Z', '/en/venue-map', '/en/sponsoring'],
    ['2026-12-10T23:00:00Z', '/en/sponsoring', '/en/venue-map'],
  ])('promotes the map only during the event day at %s', (date, promoted, nested) => {
    const header = getHeaderData('en', new Date(date));
    expect(header.links.slice(0, 2).map((link) => link.href)).toEqual(['/en/program', promoted]);
    expect(header.links.find((link) => link.id === 'event')?.links?.map((link) => link.href)).toEqual([
      '/en/speakers',
      nested,
    ]);
  });

  it('keeps the plan in the footer event section on every date', () => {
    for (const date of [cfpClosedDate, eventDate]) {
      const footer = getFooterData('en', date);
      expect(footer.links[0]?.links.map((item) => item.href)).toEqual([
        '/en/program',
        '/en/speakers',
        '/en/venue-map',
        '/en/sponsoring',
      ]);
      expect(footer.links[1]?.links.map((item) => item.href)).toEqual([
        '/en/practical-information/accommodation',
        '/en/practical-information/getting-there',
        '/en/practical-information/parking',
        '/en/practical-information/activities',
      ]);
      expect(footer.secondaryLinks.map((item) => item.href)).toEqual(['/en/terms-of-service', '/en/privacy-policy']);
      expect(footer.footNote).toContain('/favicon.svg');
      expect(footer.footNote).toContain('Cloud Native Provence');
    }
  });

  it('keeps the CFP in the event section only while submissions are open', () => {
    expect(getHeaderData('fr', cfpOpenDate).links.find((link) => link.id === 'event')?.links).toContainEqual(
      expect.objectContaining({ text: 'CFP', href: '/fr#cfp' })
    );
    expect(getHeaderData('fr', cfpClosedDate).links.flatMap((link) => link.links ?? [])).not.toContainEqual(
      expect.objectContaining({ href: '/fr#cfp' })
    );
  });

  it.each([cfpClosedDate, eventDate])('respects disabled programme pages at %s', (date) => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = false;
    const header = getHeaderData('en', date);
    const urls = header.links.flatMap((link) => link.links?.map((child) => child.href) ?? [link.href]);
    expect(urls).not.toContain('/en/program');
    expect(urls).not.toContain('/en/speakers');
    expect(urls).toContain('/en/venue-map');
    expect(urls).toContain('/en/sponsoring');
    expect(header.links[0].href).toBe(date === eventDate ? '/en/venue-map' : '/en/sponsoring');
    expect(getFooterData('fr', date).links[0]?.links.map((link) => link.href)).toEqual([
      '/fr/plan-du-lieu',
      '/fr/sponsoring',
    ]);
  });
});
