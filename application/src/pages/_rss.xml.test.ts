import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';

const setup = async ({ isBlogEnabled, description = '' }: { isBlogEnabled: boolean; description?: string }) => {
  vi.resetModules();

  const getRssStringMock = vi.fn(async () => '<rss>ok</rss>');
  const fetchPostsMock = vi.fn(async () => [
    {
      permalink: '/blog/post-1',
      title: 'Post 1',
      excerpt: 'Excerpt',
      publishDate: new Date('2026-01-01T00:00:00.000Z'),
    },
  ]);

  vi.doMock('astrowind:config', () =>
    createAstrowindConfigMock({
      METADATA: {
        description,
      },
      APP_BLOG: {
        isEnabled: isBlogEnabled,
      },
    })
  );

  vi.doMock('@astrojs/rss', () => ({
    getRssString: getRssStringMock,
  }));

  vi.doMock('~/domains/pages/blog/services/posts', () => ({
    fetchPosts: fetchPostsMock,
  }));

  vi.doMock('~/shared/url/permalinks', () => ({
    getPermalink: vi.fn((value: string) => value),
  }));

  const { GET } = await import('./rss.xml');

  return { GET, fetchPostsMock, getRssStringMock };
};

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('rss endpoint', () => {
  it('returns RSS response', async () => {
    const { GET, getRssStringMock } = await setup({ isBlogEnabled: true });
    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('application/xml');
    await expect(response.text()).resolves.toContain('<rss>ok</rss>');

    expect(getRssStringMock).toHaveBeenCalledWith(
      expect.objectContaining({
        description: '',
      })
    );
  });

  it('does not fetch posts and still returns RSS response when blog is disabled', async () => {
    const { GET, fetchPostsMock } = await setup({ isBlogEnabled: false });
    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('application/xml');
    expect(fetchPostsMock).not.toHaveBeenCalled();
  });
});
