import { afterEach, describe, expect, it, vi } from 'vitest';

const astrowindConfig = vi.hoisted(() => ({
  config: {
    I18N: {
      language: 'fr',
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
  afterEach(() => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = true;
  });

  it('returns localized header links', () => {
    const header = getHeaderData('fr');
    expect(header.links).toHaveLength(4);
    expect(header.links[0].href).toBe('/fr/programme');
    expect(header.links[1].href).toBe('/fr/sponsoring');
    expect(header.links[2].href).toBe('/fr/a-propos');
    expect(header.links[3].href).toBe('/fr/contact');
  });

  it('returns localized footer data and favicon note', () => {
    const footer = getFooterData('en');

    expect(footer.links).toHaveLength(2);
    expect(footer.secondaryLinks.map((item) => item.href)).toEqual(['/en/terms-of-service', '/en/privacy-policy']);
    expect(footer.footNote).toContain('/favicon.svg');
    expect(footer.footNote).toContain('Cloud Native Provence');
  });

  it('omits program links when the program page is disabled', () => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = false;

    const header = getHeaderData('en');
    const footer = getFooterData('fr');

    expect(header.links.map((link) => link.href)).toEqual(['/en/sponsoring', '/en/about', '/en/contact']);
    expect(footer.links[0]?.links.map((link) => link.href)).toEqual(['/fr/sponsoring', '#']);
  });
});
