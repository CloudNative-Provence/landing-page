import { describe, expect, it, vi } from 'vitest';
import { createAstroAssetsMock } from '~/test/mocks/images';

vi.mock('astro:assets', () => createAstroAssetsMock());

import {
  astroAssetsOptimizer,
  getImagesOptimized,
  getSizes,
  isUnpicCompatible,
  unpicOptimizer,
} from './image-optimizer';

describe('images optimization utilities', () => {
  it('computes sizes according to layout', () => {
    expect(getSizes(1200, 'constrained')).toBe('(min-width: 1200px) 1200px, 100vw');
    expect(getSizes(800, 'fixed')).toBe('800px');
    expect(getSizes(800, 'fullWidth')).toBe('100vw');
    expect(getSizes()).toBeUndefined();
  });

  it('checks unpic compatibility', () => {
    expect(isUnpicCompatible('https://images.unsplash.com/photo-1')).toBe(true);
    expect(isUnpicCompatible('not-an-url')).toBe(false);
  });

  it('optimizes image with Astro assets adapter', async () => {
    const result = await astroAssetsOptimizer('photo.jpg', [320, 640]);
    expect(result).toHaveLength(2);
    expect(result[0].src).toContain('/optimized/320/photo.jpg');
  });

  it('returns empty list when astro optimizer receives empty image input', async () => {
    await expect(astroAssetsOptimizer('' as never, [320])).resolves.toEqual([]);
  });

  it('optimizes image using unpic adapter', async () => {
    const result = await unpicOptimizer('https://images.unsplash.com/photo-1', [320, 640], 1280, 720, 'jpg');
    expect(result).toHaveLength(2);
    expect(result[0].src).toContain('w=320');
  });

  it('returns empty list for invalid unpic inputs', async () => {
    await expect(unpicOptimizer('' as never, [320], 1280, 720, 'jpg')).resolves.toEqual([]);
    await expect(unpicOptimizer('not-an-url', [320], 1280, 720, 'jpg')).resolves.toEqual([]);
    await expect(unpicOptimizer({} as never, [320], 1280, 720, 'jpg')).resolves.toEqual([]);
  });

  it('builds final optimized image attributes', async () => {
    const transform = vi.fn(async () => [
      { src: '/img-320.jpg', width: 320 },
      { src: '/img-640.jpg', width: 640 },
    ]);

    const output = await getImagesOptimized(
      'hero.jpg',
      {
        width: 640,
        height: 320,
        alt: 'Hero',
        layout: 'constrained',
      },
      transform
    );

    expect(output.src).toBe('hero.jpg');
    expect(output.attributes.srcset).toContain('/img-320.jpg 320w');
    expect(output.attributes.style).toContain('max-width: 640px;');
  });

  it('computes dimensions from aspect ratio and width', async () => {
    const output = await getImagesOptimized(
      'hero.jpg',
      {
        width: 400,
        aspectRatio: '16/9',
        layout: 'responsive',
      },
      async () => []
    );

    expect(output.attributes.height).toBeCloseTo(225);
    expect(output.attributes.style).toContain('height: auto;');
  });

  it('computes width from aspect ratio and height', async () => {
    const output = await getImagesOptimized(
      'hero.jpg',
      {
        height: 300,
        aspectRatio: 2,
        layout: 'contained',
      },
      async () => []
    );

    expect(output.attributes.width).toBe(600);
    expect(output.attributes.style).toContain('object-fit: contain;');
  });

  it('supports metadata object image source branch', async () => {
    const output = await getImagesOptimized(
      { src: '/image.png', width: 2000, height: 1000 } as never,
      {
        layout: 'fixed',
      },
      async () => []
    );

    expect(output.src).toBe('/image.png');
    expect(output.attributes.style).toContain('object-position: top left;');
  });

  it('handles cover/fullWidth layouts with implicit sizing branches', async () => {
    const fullWidth = await getImagesOptimized('cover.jpg', { layout: 'fullWidth' }, async () => []);
    const cover = await getImagesOptimized('cover.jpg', { layout: 'cover' }, async () => []);

    expect(fullWidth.attributes.style).toContain('width: 100%;');
    expect(cover.attributes.style).toContain('max-width: 100%;');
  });
});
