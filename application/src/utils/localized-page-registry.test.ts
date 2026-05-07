import { describe, expect, it, vi } from 'vitest';

vi.mock('~/pages/about/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/brand-guidelines/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/contact/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/privacy/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/program/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/sponsoring/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/terms/_content.astro', () => ({ default: {} }));

import { routeSlugs } from '~/i18n/routes';

import { LocalizedPageRegistry } from './localized-page-registry';

describe('LocalizedPageRegistry', () => {
  it('covers every localized route key', () => {
    expect(LocalizedPageRegistry.getRouteKeys()).toEqual(Object.keys(routeSlugs));
  });

  it('resolves program page content for the requested locale', () => {
    const pageDefinition = LocalizedPageRegistry.resolve('program', 'fr');

    expect(pageDefinition.layout).toBe('page');
    expect(pageDefinition.metadata.title).toBe('Programme');
    expect(pageDefinition.props.hero).toMatchObject({ title: 'Préparez votre journée à KCD Provence' });
  });

  it('resolves standalone pages without duplicating metadata in props', () => {
    const pageDefinition = LocalizedPageRegistry.resolve('brand-guidelines', 'en');

    expect(pageDefinition.layout).toBe('standalone');
    expect(pageDefinition.metadata.title).toBe('Brand Guidelines - Cloud Native Provence');
    expect('metadata' in pageDefinition.props).toBe(false);
  });
});
