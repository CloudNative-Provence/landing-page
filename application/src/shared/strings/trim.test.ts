import { describe, expect, it } from 'vitest';

import { trim } from './trim';

describe('string utils', () => {
  it('trims a specific character from both sides', () => {
    expect(trim('/path/', '/')).toBe('path');
    expect(trim('---abc---', '-')).toBe('abc');
  });
});
