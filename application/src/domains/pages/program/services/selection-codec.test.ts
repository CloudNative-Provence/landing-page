import { describe, expect, it } from 'vitest';

import { ProgramSelectionCodec } from './selection-codec';

describe('ProgramSelectionCodec', () => {
  it('serializes unique sorted selections', () => {
    expect(ProgramSelectionCodec.serialize(['talk-2', 'talk-1', 'talk-2'])).toBe('talk-1,talk-2');
  });

  it('parses only valid unique selections', () => {
    expect(ProgramSelectionCodec.parse('talk-2,talk-1,talk-2,missing', ['talk-1', 'talk-2'])).toEqual([
      'talk-2',
      'talk-1',
    ]);
    expect(ProgramSelectionCodec.parse('', ['talk-1'])).toEqual([]);
  });
});
