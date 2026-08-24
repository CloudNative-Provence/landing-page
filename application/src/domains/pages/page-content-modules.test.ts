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

describe('page content modules', () => {
  it('load page data modules with exports', () => {
    const modules = {
      ...import.meta.glob('./about/*.ts', { eager: true }),
      ...import.meta.glob('./brand-guidelines/*.ts', { eager: true }),
      ...import.meta.glob('./contact/*.ts', { eager: true }),
      ...import.meta.glob('./home/*.ts', { eager: true }),
      ...import.meta.glob('./not-found/*.ts', { eager: true }),
      ...import.meta.glob('./privacy/*.ts', { eager: true }),
      ...import.meta.glob('./sponsoring/*.ts', { eager: true }),
      ...import.meta.glob('./terms/*.ts', { eager: true }),
      ...import.meta.glob('./practical-info/content/*.ts', { eager: true }),
      ...import.meta.glob(['./practical-info/topics/*/*.ts', '!./practical-info/topics/*/*.test.ts'], { eager: true }),
      ...import.meta.glob('./program/content/*.ts', { eager: true }),
    };
    const files = Object.entries(modules).filter(([path]) => !path.endsWith('.test.ts'));

    expect(files.length).toBeGreaterThan(0);

    for (const [, mod] of files) {
      const exportedValues = Object.values(mod as Record<string, unknown>);
      expect(exportedValues.length).toBeGreaterThan(0);
      expect(exportedValues.some((value) => typeof value === 'object' || typeof value === 'function')).toBe(true);
    }
  });
});
