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

import {
  getEnabledLocalizedRouteKeys,
  getEnabledStandaloneLocalizedRouteKeys,
  hasStandaloneLocalizedPage,
  isLocalizedPageEnabled,
  isProgramEnabled,
} from './page-flags';

describe('page route feature flags', () => {
  afterEach(() => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = true;
  });

  it('keeps the program page enabled by default', () => {
    expect(isProgramEnabled()).toBe(true);
    expect(isLocalizedPageEnabled('program')).toBe(true);
    expect(hasStandaloneLocalizedPage('practical-info')).toBe(false);
    expect(getEnabledLocalizedRouteKeys()).toContain('program');
    expect(getEnabledStandaloneLocalizedRouteKeys()).not.toContain('practical-info');
  });

  it('filters the program page out when disabled', () => {
    astrowindConfig.config.APP_PROGRAM.isEnabled = false;

    expect(isProgramEnabled()).toBe(false);
    expect(isLocalizedPageEnabled('program')).toBe(false);
    expect(getEnabledLocalizedRouteKeys()).not.toContain('program');
    expect(getEnabledLocalizedRouteKeys()).toEqual([
      'about',
      'contact',
      'practical-info',
      'sponsoring',
      'brand-guidelines',
      'terms',
      'privacy',
    ]);
    expect(getEnabledStandaloneLocalizedRouteKeys()).toEqual([
      'about',
      'contact',
      'sponsoring',
      'brand-guidelines',
      'terms',
      'privacy',
    ]);
  });
});
