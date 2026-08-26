import { describe, expect, it } from 'vitest';

import { ProgramFullscreenView } from './fullscreen-view';

describe('ProgramFullscreenView', () => {
  it('enables fullscreen mode only for the explicit true flag', () => {
    expect(ProgramFullscreenView.isEnabled('true')).toBe(true);
    expect(ProgramFullscreenView.isEnabled('false')).toBe(false);
    expect(ProgramFullscreenView.isEnabled(null)).toBe(false);
  });

  it('adds and removes the fullscreen query parameter without disturbing other params', () => {
    const url = new URL('https://cloudnative-provence.fr/en/program?live=true');

    expect(ProgramFullscreenView.updateUrl(url, true).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?live=true&fullscreen=true'
    );
    expect(ProgramFullscreenView.updateUrl(url, false).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?live=true'
    );
  });
});
