import { describe, expect, it, vi } from 'vitest';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';

vi.mock('astrowind:config', () =>
  createAstrowindConfigMock({
    SITE: {
      name: 'Cloud Native Provence',
      site: 'https://cloudnative-provence.fr',
      trailingSlash: true,
      base: '/',
    },
    APP_BLOG: {
      isEnabled: true,
      post: { permalink: '/blog/%slug%', isEnabled: true, robots: { index: true } },
      list: { pathname: 'blog', isEnabled: true, robots: { index: true } },
      category: { pathname: 'category', isEnabled: true, robots: { index: true } },
      tag: { pathname: 'tag', isEnabled: true, robots: { index: true } },
    },
  })
);

import { getCanonical, getPermalink } from './permalinks';

describe('permalinks with trailing slash enabled', () => {
  it('adds trailing slash in canonical urls when required', () => {
    expect(getCanonical('/fr/about')).toBe('https://cloudnative-provence.fr/fr/about/');
  });

  it('builds trailing-slash blog and page links', () => {
    expect(getPermalink('', 'blog', 'fr')).toBe('/fr/blog/');
    expect(getPermalink('contact', 'page')).toBe('/contact/');
  });
});
