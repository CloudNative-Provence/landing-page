import { describe, expect, it } from 'vitest';

import { lazyImagesRehypePlugin, readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './markdown';

type Transformer = (tree: unknown, file?: unknown, next?: () => void) => void;

describe('frontmatter plugins', () => {
  it('adds reading time into Astro frontmatter data', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'text', value: 'This is a short article for reading time estimation.' }],
    };
    const file = { data: { astro: { frontmatter: {} as Record<string, unknown> } } };

    const plugin = (readingTimeRemarkPlugin as unknown as () => Transformer)();
    plugin(tree as never, file as never);

    expect(typeof file.data.astro.frontmatter.readingTime).toBe('number');
    expect((file.data.astro.frontmatter.readingTime as number) >= 1).toBe(true);
  });

  it('wraps tables with an overflow container', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'table',
          properties: {},
          children: [],
        },
      ],
    };

    const plugin = (responsiveTablesRehypePlugin as unknown as () => Transformer)();
    plugin(tree as never);

    expect((tree.children[0] as { tagName?: string }).tagName).toBe('div');
  });

  it('adds lazy loading on image nodes', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'img',
              properties: {},
              children: [],
            },
          ],
        },
      ],
    };

    const plugin = (lazyImagesRehypePlugin as unknown as () => Transformer)();
    plugin(tree as never);

    const imageNode = (tree.children[0] as { children: Array<{ properties: Record<string, unknown> }> }).children[0];
    expect(imageNode.properties.loading).toBe('lazy');
  });

  it('does not fail when reading-time frontmatter container is missing', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'text', value: 'No frontmatter target.' }],
    };

    const plugin = (readingTimeRemarkPlugin as unknown as () => Transformer)();
    expect(() => plugin(tree as never, { data: {} } as never)).not.toThrow();
  });

  it('keeps trees unchanged when children are missing', () => {
    const responsivePlugin = (responsiveTablesRehypePlugin as unknown as () => Transformer)();
    const lazyPlugin = (lazyImagesRehypePlugin as unknown as () => Transformer)();

    expect(() => responsivePlugin({ type: 'root' } as never)).not.toThrow();
    expect(() => lazyPlugin({ type: 'root' } as never)).not.toThrow();
  });
});
