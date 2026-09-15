import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeSingleQuote,
  renderStringArray,
  renderSession,
  renderSharedScheduleFile,
  renderLocaleScheduleFile,
} from './schedule-renderer.mjs';

describe('escapeSingleQuote', () => {
  it('escapes single quotes', () => {
    assert.equal(escapeSingleQuote("it's"), "it\\'s");
  });

  it('escapes backslashes before single quotes', () => {
    assert.equal(escapeSingleQuote('a\\b'), 'a\\\\b');
  });

  it('leaves strings without quotes unchanged', () => {
    assert.equal(escapeSingleQuote('hello world'), 'hello world');
  });
});

describe('renderStringArray', () => {
  it('renders an empty array', () => {
    assert.equal(renderStringArray([]), '[]');
  });

  it('renders a single-element array', () => {
    assert.equal(renderStringArray(['keynote']), "['keynote']");
  });

  it('renders a multi-element array', () => {
    assert.equal(renderStringArray(['a', 'b', 'c']), "['a', 'b', 'c']");
  });

  it('escapes single quotes inside values', () => {
    assert.equal(renderStringArray(["it's"]), "['it\\'s']");
  });
});

describe('renderSession', () => {
  /** @type {import('./sessions-mapper.mjs').SessionDefinition} */
  const minimalSession = {
    id: 'my-session',
    title: 'My Session',
    description: 'Short desc.',
    startsAtTime: '09:00',
    endsAtTime: '09:30',
    trackId: 'keynote',
  };

  it('renders required fields', () => {
    const output = renderSession(minimalSession);
    assert.match(output, /id: 'my-session'/);
    assert.match(output, /title: 'My Session'/);
    assert.match(output, /description: 'Short desc\.'/);
    assert.match(output, /startsAtTime: '09:00'/);
    assert.match(output, /endsAtTime: '09:30'/);
    assert.match(output, /trackId: 'keynote'/);
  });

  it('wraps long descriptions onto a second line', () => {
    const session = {
      ...minimalSession,
      description: 'A'.repeat(90),
    };
    const output = renderSession(session);
    assert.match(output, /description:\n\s+'/);
  });

  it('includes speakers when present', () => {
    const session = { ...minimalSession, speakers: ['Alice', 'Bob'] };
    const output = renderSession(session);
    assert.match(output, /speakers: \['Alice', 'Bob'\]/);
  });

  it('omits speakers when empty', () => {
    const session = { ...minimalSession, speakers: [] };
    const output = renderSession(session);
    assert.doesNotMatch(output, /speakers/);
  });

  it('includes format when present', () => {
    const session = { ...minimalSession, format: 'Talk · 30 min' };
    const output = renderSession(session);
    assert.match(output, /format: 'Talk · 30 min'/);
  });

  it('includes isGlobal: true when set', () => {
    const session = { ...minimalSession, isGlobal: true };
    const output = renderSession(session);
    assert.match(output, /isGlobal: true/);
  });

  it('includes tags when present', () => {
    const session = { ...minimalSession, tags: ['networking', 'expo'] };
    const output = renderSession(session);
    assert.match(output, /tags: \['networking', 'expo'\]/);
  });
});

describe('renderSharedScheduleFile', () => {
  const model = {
    tracks: [{ id: 'keynote', label: 'Keynotes', roomId: 'auditorium' }],
    rooms: [{ id: 'auditorium', label: 'Grand Auditorium' }],
    sessions: [],
  };

  it('exports tracks and rooms without labels', () => {
    const output = renderSharedScheduleFile(model);
    assert.match(output, /^export const tracks = \[/);
    assert.match(output, /export const rooms = \[/);
    assert.match(output, /id: 'keynote'/);
    assert.match(output, /roomId: 'auditorium'/);
    assert.doesNotMatch(output, /label:/);
  });

  it('does not include sessions', () => {
    const output = renderSharedScheduleFile(model);
    assert.doesNotMatch(output, /sessions/);
    assert.doesNotMatch(output, /export default/);
  });

  it('ends with a trailing newline', () => {
    const output = renderSharedScheduleFile(model);
    assert.equal(output.at(-1), '\n');
  });

  it('handles an empty model gracefully', () => {
    const output = renderSharedScheduleFile({ tracks: [], rooms: [], sessions: [] });
    assert.match(output, /export const tracks = \[/);
    assert.match(output, /export const rooms = \[/);
  });
});

describe('renderLocaleScheduleFile', () => {
  const model = {
    tracks: [{ id: 'keynote', label: 'Keynotes', roomId: 'auditorium' }],
    rooms: [{ id: 'auditorium', label: 'Grand Auditorium' }],
    sessions: [
      {
        id: 'opening',
        title: 'Opening',
        description: 'Intro',
        startsAtTime: '09:00',
        endsAtTime: '09:30',
        trackId: 'keynote',
      },
    ],
  };

  it('imports from ./schedule', () => {
    const output = renderLocaleScheduleFile(model);
    assert.match(output, /import \{ rooms, tracks \} from '\.\/schedule'/);
  });

  it('includes sessions', () => {
    const output = renderLocaleScheduleFile(model);
    assert.match(output, /const sessions = \[/);
    assert.match(output, /id: 'opening'/);
  });

  it('re-exports tracks, rooms, sessions', () => {
    const output = renderLocaleScheduleFile(model);
    assert.match(output, /export default \{/);
    assert.match(output, /tracks,/);
    assert.match(output, /rooms,/);
    assert.match(output, /sessions,/);
  });

  it('ends with a trailing newline', () => {
    const output = renderLocaleScheduleFile(model);
    assert.equal(output.at(-1), '\n');
  });
});
