import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAstroContentRuntimeMock } from '~/test/mocks/astro-content';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';
import type { Post } from '~/types';

function getSamplePosts() {
  return [
    {
      id: 'post-1',
      data: {
        title: 'Post 1',
        excerpt: 'Excerpt 1',
        category: 'kubernetes',
        tags: ['cncf', 'k8s'],
        publishDate: new Date('2025-01-10T00:00:00.000Z'),
        metadata: {},
        draft: false,
      },
    },
    {
      id: 'post-2',
      data: {
        title: 'Post 2',
        excerpt: 'Excerpt 2',
        category: 'observability',
        tags: ['otel'],
        publishDate: new Date('2025-01-11T00:00:00.000Z'),
        metadata: {},
        draft: false,
      },
    },
    {
      id: 'post-draft',
      data: {
        title: 'Draft post',
        excerpt: 'Draft',
        publishDate: new Date('2025-01-09T00:00:00.000Z'),
        metadata: {},
        draft: true,
      },
    },
    {
      id: 'cloud-native-provence-association-creation/common.md',
      data: {
        publishDate: new Date('2026-02-03T00:00:00.000Z'),
        metadata: { openGraph: { type: 'article' } },
        tags: ['association'],
      },
    },
    {
      id: 'cloud-native-provence-association-creation/fr.md',
      data: {
        locale: 'fr',
        slug: 'creation-association-cloud-native-provence',
        title: 'Création association',
        excerpt: 'Annonce FR',
        category: 'Annonce',
        tags: ['association', 'communaute'],
      },
    },
    {
      id: 'cloud-native-provence-association-creation/en.md',
      data: {
        locale: 'en',
        slug: 'cloud-native-provence-association-creation',
        title: 'Association creation',
        excerpt: 'Announcement EN',
        category: 'Announcement',
        tags: ['association', 'community'],
      },
    },
    {
      id: 'orphan-locale/en.md',
      data: {
        locale: 'en',
        excerpt: 'Missing title should be filtered out',
      },
    },
  ] as const;
}

vi.mock('astrowind:config', () =>
  createAstrowindConfigMock({
    APP_BLOG: {
      isEnabled: true,
      isRelatedPostsEnabled: true,
      post: { permalink: '/blog/%slug%', isEnabled: true, robots: { index: true } },
      list: { pathname: 'blog', isEnabled: true, robots: { index: true } },
      category: { pathname: 'category', isEnabled: true, robots: { index: true } },
      tag: { pathname: 'tag', isEnabled: true, robots: { index: false } },
    },
  })
);

vi.mock('astro:content', () => createAstroContentRuntimeMock({ posts: [...getSamplePosts()], readingTime: 2 }));

import {
  fetchPosts,
  findLatestPosts,
  findLocalizedBlogPath,
  findPostsByIds,
  findPostsBySlugs,
  getRelatedPosts,
  getStaticPathsBlogCategory,
  getStaticPathsBlogList,
  getStaticPathsBlogPost,
  getStaticPathsBlogTag,
  translateBlogPermalinkForLocale,
} from './blog';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('blog utilities', () => {
  it('fetches and normalizes posts', async () => {
    const posts = await fetchPosts();
    expect(posts.length).toBeGreaterThanOrEqual(4);
    expect(posts[0].title).toBeDefined();
    expect(posts[0].permalink).toContain('blog');
    expect(posts.every((post) => post.draft === false)).toBe(true);
  });

  it('finds posts by id and slug', async () => {
    const byIds = await findPostsByIds(['post-1']);
    const bySlugs = await findPostsBySlugs(['post-1']);

    expect(byIds).toHaveLength(1);
    expect(bySlugs).toHaveLength(1);

    const localizedBySlug = await findPostsBySlugs(['cloud-native-provence-association-creation'], 'en');
    expect(localizedBySlug).toHaveLength(1);
    expect(localizedBySlug[0].locale).toBe('en');
  });

  it('returns empty arrays for invalid id/slug inputs', async () => {
    await expect(findPostsByIds(undefined as never)).resolves.toEqual([]);
    await expect(findPostsBySlugs(undefined as never)).resolves.toEqual([]);
  });

  it('returns latest posts by count', async () => {
    const latest = await findLatestPosts({ count: 1 });
    expect(latest).toHaveLength(1);
  });

  it('uses default latest count when count is not provided', async () => {
    const latest = await findLatestPosts({});
    expect(latest).toHaveLength(4);

    const latestFr = await findLatestPosts({ count: 10, locale: 'fr' });
    expect(latestFr.every((post) => post.locale === 'fr')).toBe(true);
  });

  it('builds static paths for list/post/category/tag', async () => {
    const paginate = (items: unknown[], config: unknown) => [{ items, config }];

    const list = await getStaticPathsBlogList({ paginate: paginate as never });
    const post = await getStaticPathsBlogPost();
    const category = await getStaticPathsBlogCategory({ paginate: paginate as never });
    const tag = await getStaticPathsBlogTag({ paginate: paginate as never });

    expect(list.length).toBeGreaterThan(0);
    expect(post.length).toBeGreaterThanOrEqual(4);
    expect(category.length).toBeGreaterThan(0);
    expect(tag.length).toBeGreaterThan(0);

    expect(post[0]).toHaveProperty('params.lang');
    expect(list[0]).toHaveProperty('config.params.lang');
    expect(category[0]).toHaveProperty('config.params.lang');
    expect(tag[0]).toHaveProperty('config.params.lang');
  });

  it('returns localized blog path when translation exists', async () => {
    await expect(findLocalizedBlogPath('/fr/blog/creation-association-cloud-native-provence', 'en')).resolves.toBe(
      '/en/blog/cloud-native-provence-association-creation'
    );
  });

  it('returns undefined for invalid localized blog path candidates', async () => {
    await expect(findLocalizedBlogPath('/fr', 'en')).resolves.toBeUndefined();
    await expect(findLocalizedBlogPath('/de/blog/some-post', 'en')).resolves.toBeUndefined();
    await expect(findLocalizedBlogPath('/fr/not-blog/some-post', 'en')).resolves.toBeUndefined();
  });

  it('translates blog permalink slug across locales for the same post', () => {
    const posts: Post[] = [
      {
        id: 'cloud-native-provence-association-creation/fr',
        slug: 'creation-association-cloud-native-provence',
        permalink: 'blog/creation-association-cloud-native-provence',
        locale: 'fr',
        publishDate: new Date('2026-02-03T00:00:00.000Z'),
        title: 'FR',
      },
      {
        id: 'cloud-native-provence-association-creation/en',
        slug: 'cloud-native-provence-association-creation',
        permalink: 'blog/cloud-native-provence-association-creation',
        locale: 'en',
        publishDate: new Date('2026-02-03T00:00:00.000Z'),
        title: 'EN',
      },
    ];

    expect(
      translateBlogPermalinkForLocale({
        posts,
        sourcePermalink: 'blog/creation-association-cloud-native-provence',
        sourceLang: 'fr',
        targetLang: 'en',
      })
    ).toBe('blog/cloud-native-provence-association-creation');
  });

  it('returns undefined when no translated blog post exists for target locale', () => {
    const posts: Post[] = [
      {
        id: 'cloud-native-provence-association-creation/fr',
        slug: 'creation-association-cloud-native-provence',
        permalink: 'blog/creation-association-cloud-native-provence',
        locale: 'fr',
        publishDate: new Date('2026-02-03T00:00:00.000Z'),
        title: 'FR',
      },
    ];

    expect(
      translateBlogPermalinkForLocale({
        posts,
        sourcePermalink: 'blog/creation-association-cloud-native-provence',
        sourceLang: 'fr',
        targetLang: 'en',
      })
    ).toBeUndefined();
  });

  it('returns normalized source permalink when source and target locales are equal', () => {
    const posts: Post[] = [];

    expect(
      translateBlogPermalinkForLocale({
        posts,
        sourcePermalink: '/blog/creation-association-cloud-native-provence/',
        sourceLang: 'fr',
        targetLang: 'fr',
      })
    ).toBe('blog/creation-association-cloud-native-provence');
  });

  it('returns related posts ordered by relevance score', async () => {
    const posts = await fetchPosts();
    const related = await getRelatedPosts(posts[0], 1);
    expect(related).toHaveLength(1);
    expect(related[0].id).not.toBe(posts[0].id);
  });
});
