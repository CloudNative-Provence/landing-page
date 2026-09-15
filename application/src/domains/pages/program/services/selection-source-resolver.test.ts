import { describe, expect, it } from 'vitest';

import { ProgramSelectionCodec } from './selection-codec';
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

  it('restores either original ID as one shared session, including compressed agendas', () => {
    const validIds = ['left-break', 'right-break'];
    const canonicalIds = new Map([
      ['left-break', 'left-break'],
      ['right-break', 'left-break'],
    ]);
    for (const queryValue of ['right-break', ProgramSelectionCodec.encode(['left-break', 'right-break'], validIds)]) {
      expect(
        ProgramSelectionSourceResolver.resolve({
          queryValue,
          storageValue: null,
          validIds,
          canonicalIds,
        })
      ).toEqual({ type: 'resolved', selectedIds: ['left-break'], updateUrl: false });
    }
  });

  it('does not report a conflict when two original IDs identify the same shared row', () => {
    expect(
      ProgramSelectionSourceResolver.resolve({
        queryValue: 'right-break',
        storageValue: 'left-break,right-break',
        validIds: ['left-break', 'right-break'],
        canonicalIds: new Map([
          ['left-break', 'left-break'],
          ['right-break', 'left-break'],
        ]),
      })
    ).toEqual({ type: 'resolved', selectedIds: ['left-break'], updateUrl: false });
  });
});
