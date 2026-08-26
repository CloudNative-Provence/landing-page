import { describe, expect, it } from 'vitest';

import { ProgramSelectionCodec } from './selection-codec';

function encodeLegacyBitmask(ids: Iterable<string>, validIds: readonly string[]): string {
  const indexById = new Map(validIds.map((id, index) => [id, index]));
  const selected = [...new Set(ids)].filter((id) => indexById.has(id));
  if (selected.length === 0) {
    return '';
  }

  const bits = new Uint8Array(Math.ceil(validIds.length / 8));
  for (const id of selected) {
    const index = indexById.get(id) as number;
    bits[index >> 3] |= 1 << (index & 7);
  }

  let binary = '';
  for (const byte of bits) {
    binary += String.fromCharCode(byte);
  }
  return `.${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

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

  it('round-trips selections through the compact token', () => {
    const validIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const selection = ['a', 'd', 'j'];
    const token = ProgramSelectionCodec.encode(selection, validIds);

    expect(token.startsWith('.')).toBe(true);
    expect(token.startsWith('.i')).toBe(true);
    expect(token).not.toContain(',');
    expect(ProgramSelectionCodec.decode(token, validIds)).toEqual(selection);
  });

  it('keeps the compact token short for large selections', () => {
    const validIds = Array.from({ length: 40 }, (_, index) => `session-with-a-long-slug-${index}`);
    const token = ProgramSelectionCodec.encode(validIds, validIds);

    expect(token.length).toBeLessThan(validIds.join(',').length);
    expect(ProgramSelectionCodec.decode(token, validIds)).toEqual(validIds);
  });

  it('encodes empty selections as an empty string', () => {
    expect(ProgramSelectionCodec.encode([], ['a', 'b'])).toBe('');
    expect(ProgramSelectionCodec.encode(['missing'], ['a', 'b'])).toBe('');
  });

  it('parses both compact tokens and legacy id lists', () => {
    const validIds = ['talk-1', 'talk-2', 'talk-3'];
    const token = ProgramSelectionCodec.encode(['talk-1', 'talk-3'], validIds);

    expect(ProgramSelectionCodec.parse(token, validIds)).toEqual(['talk-1', 'talk-3']);
    expect(ProgramSelectionCodec.parse('talk-3,talk-1', validIds)).toEqual(['talk-3', 'talk-1']);
  });

  it('returns null when decoding a non-compact value', () => {
    expect(ProgramSelectionCodec.decode('talk-1,talk-2', ['talk-1', 'talk-2'])).toBeNull();
  });

  it('parses legacy bitmask tokens for backward compatibility', () => {
    const validIds = ['talk-1', 'talk-2', 'talk-3', 'talk-4'];
    const legacyToken = encodeLegacyBitmask(['talk-1', 'talk-4'], validIds);

    expect(ProgramSelectionCodec.parse(legacyToken, validIds)).toEqual(['talk-1', 'talk-4']);
  });
});
