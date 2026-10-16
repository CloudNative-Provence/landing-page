import { describe, expect, it } from 'vitest';

import { FullscreenView } from './fullscreen-view';

describe('FullscreenView', () => {
  it('enables fullscreen mode only for the explicit true flag', () => {
    expect(FullscreenView.isEnabled('true')).toBe(true);
    for (const value of ['false', '1', '', 'TRUE', null, undefined]) {
      expect(FullscreenView.isEnabled(value)).toBe(false);
    }
  });

  it('adds and removes the fullscreen query parameter without disturbing other params', () => {
    const url = new URL('https://cloudnative-provence.fr/en/program?live=true');

    expect(FullscreenView.updateUrl(url, true).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?live=true&fullscreen=true'
    );
    expect(FullscreenView.updateUrl(url, false).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?live=true'
    );
  });

  it('preserves room links, other parameters and fragments when leaving the fullscreen map', () => {
    const url = new URL('https://cloudnative-provence.fr/fr/plan-du-lieu?room=milhaud&fullscreen=true#sessions');
    expect(FullscreenView.updateUrl(url, false).toString()).toBe(
      'https://cloudnative-provence.fr/fr/plan-du-lieu?room=milhaud#sessions'
    );
    expect(url.searchParams.get('fullscreen')).toBe('true');
  });
});
