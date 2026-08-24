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

  afterEach(() => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = true;
  });

  it('returns localized header links including the CFP when it is open', () => {
    const header = getHeaderData('fr', cfpOpenDate);
    expect(header.links).toHaveLength(6);
    expect(header.links[0].href).toBe('/fr/programme');
    expect(header.links[1]).toEqual({ text: 'CFP', href: '/fr#cfp' });
    expect(header.links[2].href).toBe('/fr/sponsoring');
    expect(header.links[3]).toEqual({
      text: 'Infos pratiques',
      links: [
        { text: 'Hébergement', href: '/fr/infos-pratiques/hebergement' },
        { text: 'Comment venir', href: '/fr/infos-pratiques/venir' },
        { text: 'Parkings', href: '/fr/infos-pratiques/parkings' },
        { text: 'Activités', href: '/fr/infos-pratiques/activites' },
      ],
    });
    expect(header.links[4].href).toBe('/fr/a-propos');
    expect(header.links[5].href).toBe('/fr/contact');
  });

  it('returns localized footer data and favicon note', () => {
    const footer = getFooterData('en');

    expect(footer.links).toHaveLength(3);
    expect(footer.links[0]?.links.map((item) => item.href)).toEqual(['/en/program', '/en/sponsoring']);
    expect(footer.links[1]?.title).toBe('Practical Information');
    expect(footer.links[1]?.links.map((item) => item.href)).toEqual([
      '/en/practical-information/accommodation',
      '/en/practical-information/getting-there',
      '/en/practical-information/parking',
      '/en/practical-information/activities',
    ]);
    expect(footer.secondaryLinks.map((item) => item.href)).toEqual(['/en/terms-of-service', '/en/privacy-policy']);
    expect(footer.footNote).toContain('/favicon.svg');
    expect(footer.footNote).toContain('Cloud Native Provence');
  });

  it('omits program links when the program page is disabled', () => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = false;

    const header = getHeaderData('en', cfpClosedDate);
    const footer = getFooterData('fr');

    expect(header.links).toEqual([
      { text: 'Sponsoring', href: '/en/sponsoring' },
      {
        text: 'Practical Information',
        links: [
          { text: 'Accommodation', href: '/en/practical-information/accommodation' },
          { text: 'Getting there', href: '/en/practical-information/getting-there' },
          { text: 'Parking', href: '/en/practical-information/parking' },
          { text: 'Activities', href: '/en/practical-information/activities' },
        ],
      },
      { text: 'About', href: '/en/about' },
      { text: 'Contact', href: '/en/contact' },
    ]);
    expect(footer.links[0]?.links.map((link) => link.href)).toEqual(['/fr/sponsoring']);
  });

  it('omits the CFP link when the CFP is not open', () => {
    const header = getHeaderData('en', cfpClosedDate);

    expect(header.links[0]?.href).toBe('/en/program');
    expect(header.links[1]?.href).toBe('/en/sponsoring');
    expect(header.links[2]).toEqual({
      text: 'Practical Information',
      links: [
        { text: 'Accommodation', href: '/en/practical-information/accommodation' },
        { text: 'Getting there', href: '/en/practical-information/getting-there' },
        { text: 'Parking', href: '/en/practical-information/parking' },
        { text: 'Activities', href: '/en/practical-information/activities' },
      ],
    });
    expect(header.links[3]?.href).toBe('/en/about');
    expect(header.links[4]?.href).toBe('/en/contact');
  });
});
