import { describe, expect, it } from 'vitest';

import { ProgramSelectionSourceResolver } from './selection-source-resolver';

describe('ProgramSelectionSourceResolver', () => {
  it('uses the URL agenda when there is no saved local agenda', () => {
    expect(
      ProgramSelectionSourceResolver.resolve({
        queryValue: '.i',
        storageValue: null,
        validIds: ['a'],
      })
    ).toEqual({ type: 'resolved', selectedIds: [], updateUrl: false });
  });

  it('uses the local agenda when there is no agenda in the URL', () => {
    expect(
      ProgramSelectionSourceResolver.resolve({
        queryValue: null,
        storageValue: 'talk-2,talk-1',
        validIds: ['talk-1', 'talk-2'],
      })
    ).toEqual({ type: 'resolved', selectedIds: ['talk-2', 'talk-1'], updateUrl: false });
  });

  it('returns a conflict when URL and local storage differ', () => {
    expect(
      ProgramSelectionSourceResolver.resolve({
        queryValue: 'talk-1',
        storageValue: 'talk-2',
        validIds: ['talk-1', 'talk-2'],
      })
    ).toEqual({ type: 'conflict', querySelectedIds: ['talk-1'], storageSelectedIds: ['talk-2'] });
  });

  it('resolves normally when URL and local storage decode to the same selection', () => {
    expect(
      ProgramSelectionSourceResolver.resolve({
        queryValue: 'talk-2,talk-1',
        storageValue: 'talk-2,talk-1,talk-2',
        validIds: ['talk-1', 'talk-2'],
      })
    ).toEqual({ type: 'resolved', selectedIds: ['talk-2', 'talk-1'], updateUrl: false });
  });
});
