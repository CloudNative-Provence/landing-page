import { describe, expect, it, vi } from 'vitest';
import { createImagesOptimizationMock } from '~/test/mocks/images';

vi.mock('./images-optimization', () => createImagesOptimizationMock());

import { adaptOpenGraphImages, findImage } from './images';
import { isUnpicCompatible } from './images-optimization';

describe('images helpers', () => {
  it('returns non-string input unchanged in findImage', async () => {
    const metadata = { src: '/img.png', width: 10, height: 10, format: 'png' as const };
    await expect(findImage(metadata)).resolves.toEqual(metadata);
  });

  it('returns absolute and external paths unchanged', async () => {
    await expect(findImage('https://cdn.example.com/a.png')).resolves.toBe('https://cdn.example.com/a.png');
    await expect(findImage('/local.png')).resolves.toBe('/local.png');
  });

  it('returns non assets paths unchanged', async () => {
    await expect(findImage('images/logo.png')).resolves.toBe('images/logo.png');
  });

  it('returns null for unresolved local asset path', async () => {
    await expect(findImage('~/assets/images/not-found.png')).resolves.toBeNull();
  });

  it('adapts Open Graph images and resolves optimized URL', async () => {
    const result = await adaptOpenGraphImages(
      {
        images: [{ url: 'https://cdn.example.com/image.jpg' }],
      },
      new URL('https://cloudnative-provence.fr')
    );

    expect(result.images?.[0].url).toContain('https://cloudnative-provence.fr/optimized.jpg');
    expect(result.images?.[0].width).toBe(1200);
  });

  it('keeps payload unchanged when no open graph images are provided', async () => {
    const payload = { type: 'website' };
    await expect(adaptOpenGraphImages(payload, new URL('https://cloudnative-provence.fr'))).resolves.toEqual(payload);
  });

  it('returns empty url object when image entry has no url', async () => {
    const result = await adaptOpenGraphImages(
      {
        images: [{} as never],
      },
      new URL('https://cloudnative-provence.fr')
    );

    expect(result.images?.[0]).toEqual({ url: '' });
  });

  it('falls back to astro assets path when external image is not unpic-compatible', async () => {
    vi.mocked(isUnpicCompatible).mockReturnValueOnce(false);

    const result = await adaptOpenGraphImages(
      {
        images: [{ url: 'https://cdn.example.com/image.jpg' }],
      },
      new URL('https://cloudnative-provence.fr')
    );

    expect(result.images?.[0].url).toContain('https://cloudnative-provence.fr/astro-optimized.jpg');
  });
});
