import { describe, expect, it } from 'vitest';

import { sourceLocales } from './utils';

const countLeaves = (value: unknown): number => {
  if (typeof value !== 'object' || value === null) return 0;

  return Object.values(value as Record<string, unknown>).reduce<number>((count, item) => {
    if (typeof item === 'string') return count + 1;
    return count + countLeaves(item);
  }, 0);
};

describe('i18n locale dictionaries', () => {
  it('provides required navigation and metadata keys', () => {
    expect(sourceLocales.en.header.about).toBeTruthy();
    expect(sourceLocales.fr.header.about).toBeTruthy();
    expect(sourceLocales.en.meta.title.default).toBeTruthy();
    expect(sourceLocales.fr.meta.title.default).toBeTruthy();
  });

  it('contains consistent key count between locales', () => {
    expect(countLeaves(sourceLocales.en)).toBe(countLeaves(sourceLocales.fr));
  });
});
