import { describe, expect, it } from 'vitest';

import { ProgramLiveView } from './live-view';

describe('ProgramLiveView', () => {
  it('enables live mode only for the explicit true flag', () => {
    expect(ProgramLiveView.isEnabled('true')).toBe(true);
    expect(ProgramLiveView.isEnabled('false')).toBe(false);
    expect(ProgramLiveView.isEnabled(null)).toBe(false);
  });

  it('adds and removes the live query parameter without disturbing other params', () => {
    const url = new URL('https://cloudnative-provence.fr/en/program?agenda=talk-1,talk-2');

    expect(ProgramLiveView.updateUrl(url, true).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?agenda=talk-1%2Ctalk-2&live=true'
    );
    expect(ProgramLiveView.updateUrl(url, false).toString()).toBe(
      'https://cloudnative-provence.fr/en/program?agenda=talk-1%2Ctalk-2'
    );
  });

  it('classifies past, live, and upcoming slots from the current time', () => {
    const now = new Date('2026-12-10T10:10:00+01:00');

    expect(
      ProgramLiveView.getState({ startsAt: '2026-12-10T09:00:00+01:00', endsAt: '2026-12-10T09:40:00+01:00' }, now)
    ).toBe('past');
    expect(
      ProgramLiveView.getState({ startsAt: '2026-12-10T09:55:00+01:00', endsAt: '2026-12-10T10:25:00+01:00' }, now)
    ).toBe('live');
    expect(
      ProgramLiveView.getState({ startsAt: '2026-12-10T10:55:00+01:00', endsAt: '2026-12-10T11:25:00+01:00' }, now)
    ).toBe('upcoming');
  });
});
