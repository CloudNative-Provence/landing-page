import { afterEach, describe, expect, it, vi } from 'vitest';

const carpoolingConfig: { value: unknown } = { value: undefined };

vi.mock('astrowind:config', () => ({
  get EVENT() {
    return {
      startsAt: '2026-12-10T09:00:00+01:00',
      timeZone: 'Europe/Paris',
      city: 'Aix-en-Provence',
      place: '',
      carpooling: carpoolingConfig.value,
      cfp: {
        opensAt: '2026-05-15T00:00:00+02:00',
        submissionUrl: 'https://conference-hall.io/kcd-provence-2026',
      },
    };
  },
}));

import { getCarpoolingInfo, hasCarpooling } from './carpooling';

afterEach(() => {
  carpoolingConfig.value = undefined;
});

describe('carpooling config helpers', () => {
  it('returns empty, non-carpooling info when nothing is configured', () => {
    carpoolingConfig.value = undefined;

    expect(getCarpoolingInfo()).toEqual({
      provider: undefined,
      url: undefined,
      embedUrl: undefined,
    });
    expect(hasCarpooling()).toBe(false);
  });

  it('normalizes configured values and trims whitespace', () => {
    carpoolingConfig.value = {
      provider: '  covoiTribu  ',
      url: '  https://www.covoitribu.fr/e/kcd-provence-2026  ',
      embedUrl: 'https://www.covoitribu.fr/e/kcd-provence-2026?embed=1',
    };

    expect(getCarpoolingInfo()).toEqual({
      provider: 'covoiTribu',
      url: 'https://www.covoitribu.fr/e/kcd-provence-2026',
      embedUrl: 'https://www.covoitribu.fr/e/kcd-provence-2026?embed=1',
    });
    expect(hasCarpooling()).toBe(true);
  });

  it('falls back to the share url when no embed url is provided', () => {
    carpoolingConfig.value = {
      provider: 'covoiTribu',
      url: 'https://www.covoitribu.fr/e/kcd-provence-2026',
    };

    const info = getCarpoolingInfo();
    expect(info.embedUrl).toBe('https://www.covoitribu.fr/e/kcd-provence-2026');
    expect(hasCarpooling(info)).toBe(true);
  });

  it('ignores blank or non-string values', () => {
    carpoolingConfig.value = {
      provider: '   ',
      url: 42,
      embedUrl: '',
    };

    expect(getCarpoolingInfo()).toEqual({
      provider: undefined,
      url: undefined,
      embedUrl: undefined,
    });
    expect(hasCarpooling()).toBe(false);
  });
});
