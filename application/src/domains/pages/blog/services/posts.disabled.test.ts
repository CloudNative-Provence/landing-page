import { describe, expect, it, vi } from 'vitest';
import { createAstroContentRuntimeMock } from '~/test/mocks/astro-content';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';

vi.mock('astrowind:config', () =>
  createAstrowindConfigMock({
    APP_BLOG: {
      isEnabled: false,
      isRelatedPostsEnabled: false,
      post: { permalink: '/blog/%slug%', isEnabled: false, robots: { index: true } },
      list: { pathname: 'blog', isEnabled: false, robots: { index: true } },
      category: { pathname: 'category', isEnabled: false, robots: { index: true } },
      tag: { pathname: 'tag', isEnabled: false, robots: { index: false } },
    },
  })
);

vi.mock('astro:content', () => createAstroContentRuntimeMock({ posts: [] }));

import {
  getStaticPathsBlogCategory,
  getStaticPathsBlogList,
  getStaticPathsBlogPost,
  getStaticPathsBlogTag,
} from './posts';

describe('blog utilities when blog is disabled', () => {
  it('returns empty static paths for all blog routes', async () => {
    const paginate = () => [];

    await expect(getStaticPathsBlogList({ paginate: paginate as never })).resolves.toEqual([]);
    await expect(getStaticPathsBlogPost()).resolves.toEqual([]);
    await expect(getStaticPathsBlogCategory({ paginate: paginate as never })).resolves.toEqual([]);
    await expect(getStaticPathsBlogTag({ paginate: paginate as never })).resolves.toEqual([]);
  });
});
