import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { slugify, extractLocalTime } from './time-utils.mjs';

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    assert.equal(slugify('Platform Engineering'), 'platform-engineering');
  });

  it('strips diacritics', () => {
    assert.equal(slugify('Salle Sainte-Victoire'), 'salle-sainte-victoire');
  });

  it('collapses multiple non-alphanumeric chars', () => {
    assert.equal(slugify('Hello   World!!'), 'hello-world');
  });

  it('trims leading and trailing dashes', () => {
    assert.equal(slugify('  hello  '), 'hello');
  });
});

describe('extractLocalTime', () => {
  it('returns HH:MM from a timezone-offset ISO string', () => {
    assert.equal(extractLocalTime('2026-12-10T09:00:00+01:00'), '09:00');
  });

  it('returns HH:MM from a UTC ISO string', () => {
    assert.equal(extractLocalTime('2026-12-10T13:45:00Z'), '13:45');
  });

  it('throws for a string without time component', () => {
    assert.throws(() => extractLocalTime('2026-12-10'), /Cannot extract time/);
  });
});
