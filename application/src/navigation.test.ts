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

import { getFooterData, getHeaderData } from './navigation';

describe('navigation', () => {
  const cfpOpenDate = new Date('2026-05-18T10:00:00+02:00');
  const cfpClosedDate = new Date('2026-08-01T10:00:00+02:00');

  afterEach(() => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = true;
  });

  it('returns localized header links including the CFP when it is open', () => {
    const header = getHeaderData('fr', cfpOpenDate);
    expect(header.links).toHaveLength(5);
    expect(header.links[0].href).toBe('/fr/programme');
    expect(header.links[1]).toEqual({ text: 'CFP', href: '/fr#cfp' });
    expect(header.links[2].href).toBe('/fr/sponsoring');
    expect(header.links[3].href).toBe('/fr/a-propos');
    expect(header.links[4].href).toBe('/fr/contact');
  });

  it('returns localized footer data and favicon note', () => {
    const footer = getFooterData('en');

    expect(footer.links).toHaveLength(2);
    expect(footer.links[0]?.links.map((item) => item.href)).toEqual([
      '/en/program',
      '/en/sponsoring',
      '/en/practical-information',
    ]);
    expect(footer.secondaryLinks.map((item) => item.href)).toEqual(['/en/terms-of-service', '/en/privacy-policy']);
    expect(footer.footNote).toContain('/favicon.svg');
    expect(footer.footNote).toContain('Cloud Native Provence');
  });

  it('omits program links when the program page is disabled', () => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = false;

    const header = getHeaderData('en', cfpClosedDate);
    const footer = getFooterData('fr');

    expect(header.links.map((link) => link.href)).toEqual(['/en/sponsoring', '/en/about', '/en/contact']);
    expect(footer.links[0]?.links.map((link) => link.href)).toEqual(['/fr/sponsoring', '/fr/infos-pratiques']);
  });

  it('omits the CFP link when the CFP is not open', () => {
    const header = getHeaderData('en', cfpClosedDate);

    expect(header.links.map((link) => link.href)).toEqual([
      '/en/program',
      '/en/sponsoring',
      '/en/about',
      '/en/contact',
    ]);
  });
});
