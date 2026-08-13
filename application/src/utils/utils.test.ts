import { describe, expect, it, vi } from 'vitest';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';

vi.mock('astrowind:config', () => createAstrowindConfigMock());

import { getFormattedDate, toUiAmount, trim } from './utils';

describe('generic utils', () => {
  it('trims a specific character from both sides', () => {
    expect(trim('/path/', '/')).toBe('path');
    expect(trim('---abc---', '-')).toBe('abc');
  });

  it('formats date using configured locale formatter', () => {
    expect(getFormattedDate(new Date('2026-12-10T00:00:00.000Z'))).toBeTruthy();
  });

  it('formats amounts for UI units', () => {
    expect(toUiAmount(0)).toBe(0);
    expect(toUiAmount(999)).toBe('999');
    expect(toUiAmount(1_500)).toBe('1.5K');
    expect(toUiAmount(2_000_000)).toBe('2M');
    expect(toUiAmount(3_500_000_000)).toBe('3.5B');
  });
});
