import { describe, expect, it, vi } from 'vitest';

vi.mock('astrowind:config', () => ({
  EVENT: {
    startsAt: '2026-12-10T09:00:00+01:00',
    timeZone: 'Europe/Paris',
    city: 'Aix-en-Provence',
    place: 'Palais des Congrès',
    cfp: {
      opensAt: '2026-05-15T00:00:00+02:00',
      closesAt: '2026-07-16T00:00:00+02:00',
      speakersNotifiedAt: '2026-09-01T00:00:00+02:00',
      submissionUrl: 'https://conference-hall.io/cloud-native-provence-2026',
    },
  },
}));

vi.mock('~/pages/about/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/brand-guidelines/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/contact/_content.astro', () => ({ default: {} }));
vi.mock('~/pages/practical-info/_content.astro', () => ({ default: {} }));
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

  it('resolves practical information content for the requested locale', () => {
    const pageDefinition = LocalizedPageRegistry.resolve('practical-info', 'fr');

    expect(pageDefinition.layout).toBe('page');
    expect(pageDefinition.metadata.title).toBe('Infos pratiques');
    expect(pageDefinition.props.title).toBe('Les infos pratiques pour votre journée en Provence');
  });

  it('resolves standalone pages without duplicating metadata in props', () => {
    const pageDefinition = LocalizedPageRegistry.resolve('brand-guidelines', 'en');

    expect(pageDefinition.layout).toBe('standalone');
    expect(pageDefinition.metadata.title).toBe('Brand Guidelines - Cloud Native Provence');
    expect('metadata' in pageDefinition.props).toBe(false);
  });
});
