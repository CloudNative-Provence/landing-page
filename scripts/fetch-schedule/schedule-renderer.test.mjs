import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import { escapeSingleQuote, renderStringArray, renderSession, renderScheduleFile } from './schedule-renderer.mjs';

const session = {
  id: 'source-slot-id/01',
  title: "L'observabilité Kubernetes : du code à la prod",
  description: [
    '# Observabilité',
    '',
    'Pourquoi l\'observabilité ? On passe de "ça marche" aux signaux utiles.',
    '',
    '- Les métriques et les traces',
    '- Les chemins C:\\cloud\\native',
    '',
    '~~~yaml',
    'service: "café"',
    '~~~',
    '',
    'Fin de ligne Windows\r\nAutre paragraphe.\tMerci !',
  ].join('\n'),
  startsAt: '2026-10-09T07:00:00.000Z',
  endsAt: '2026-10-09T07:45:00.000Z',
  roomId: 'room-source-id',
  speakers: [
    {
      id: 'speaker-a',
      name: "Alice D'Angelo",
      bio: 'A **biography** with a link: [profile](https://example.org).\n\nMore text.',
      company: "Alice's Company",
      picture: 'https://example.org/alice.jpg',
      socialLinks: ['https://example.org/alice'],
    },
    { id: 'speaker-b', name: 'Bob "Cloud" Martin' },
  ],
  format: 'Talk · 45 min',
  tags: ['Observabilité', "Retour d'expérience"],
};

const model = {
  timeZone: 'Europe/Paris',
  days: ['2026-10-09', '2026-10-10'],
  rooms: [
    {
      id: 'room-source-id',
      label: "Salle de l'Innovation",
      accent: '#1A70C7',
    },
  ],
  sessions: [session],
};

const require = createRequire(new URL('../../application/package.json', import.meta.url));
const ts = require('typescript');

function moduleUrl(source) {
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, [], 'Generated schedule must be valid TypeScript');
  return `data:text/javascript;base64,${Buffer.from(result.outputText).toString('base64')}`;
}

async function importGeneratedSchedule(scheduleModel) {
  return (await import(moduleUrl(renderScheduleFile(scheduleModel)))).default;
}

describe('source string serialization', () => {
  it('round-trips quotes, backslashes and every control character', () => {
    const text =
      String.fromCharCode(...Array.from({ length: 32 }, (_, index) => index)) +
      '\'"\\\\\'\\"' +
      '\u2028\u2029' +
      '\ud800' +
      'Cloud Native 🚀';
    const literal = "'" + escapeSingleQuote(text) + "'";
    assert.equal(runInNewContext(literal), text);
    assert.doesNotMatch(literal, /[\n\r\u2028\u2029]/);
  });

  it('round-trips empty and multiline strings inside arrays', () => {
    const values = ['', session.description, ...session.speakers.map((speaker) => speaker.name)];
    const output = runInNewContext(renderStringArray(values));
    assert.deepEqual(Array.from(output), values);
  });
});

describe('renderSession', () => {
  it('round-trips all session fields including source IDs and full timestamps', () => {
    const output = runInNewContext('(' + renderSession(session) + ')');
    assert.deepEqual(JSON.parse(JSON.stringify(output)), session);
    assert.equal(output.startsAt, '2026-10-09T07:00:00.000Z');
    assert.equal(output.endsAt, '2026-10-09T07:45:00.000Z');
  });

  it('escapes every string field, including IDs and optional metadata', () => {
    const specialText = "quote'\\\n\r\t\u0000";
    const specialSession = {
      id: specialText,
      title: specialText,
      description: specialText,
      startsAt: specialText,
      endsAt: specialText,
      roomId: specialText,
      speakers: [
        {
          id: specialText,
          name: specialText,
          bio: specialText,
          company: specialText,
          picture: specialText,
          socialLinks: [specialText],
        },
      ],
      format: specialText,
      tags: [specialText],
    };
    const output = runInNewContext('(' + renderSession(specialSession) + ')');
    assert.deepEqual(JSON.parse(JSON.stringify(output)), specialSession);
  });

  it('omits absent optional fields without adding a global-session flag', () => {
    const { speakers, format, tags, ...minimalSession } = session;
    const output = runInNewContext('(' + renderSession(minimalSession) + ')');
    assert.deepEqual(JSON.parse(JSON.stringify(output)), minimalSession);
    assert.equal('isGlobal' in output, false);
    assert.equal('startsAtTime' in output, false);
  });

  it('omits empty optional lists', () => {
    const output = runInNewContext('(' + renderSession({ ...session, speakers: [], tags: [] }) + ')');
    assert.equal('speakers' in output, false);
    assert.equal('tags' in output, false);
  });
});

describe('generated schedule module', () => {
  it('imports the generated TypeScript and preserves source rooms and sessions', async () => {
    const output = await importGeneratedSchedule(model);
    assert.deepEqual(output, { rooms: model.rooms, sessions: model.sessions });
    assert.equal('days' in output, false);
    assert.equal('timeZone' in output, false);
  });

  it('shares source labels, room IDs and accents without local overrides', async () => {
    const output = await importGeneratedSchedule(model);
    assert.doesNotMatch(renderScheduleFile(model), /^import /m);
    assert.equal('timeZone' in output, false);
    assert.equal('days' in output, false);
    assert.equal('tracks' in output, false);
    assert.deepEqual(output.rooms, model.rooms);
    assert.deepEqual(output.sessions, model.sessions);
  });

  it('preserves a session on a different day and its original UTC offset', async () => {
    const multiDayModel = {
      ...model,
      sessions: [
        session,
        {
          ...session,
          id: 'source-slot-day-2',
          startsAt: '2026-10-10T09:00:00+02:00',
          endsAt: '2026-10-10T09:45:00+02:00',
        },
      ],
    };
    assert.deepEqual(await importGeneratedSchedule(multiDayModel), {
      rooms: multiDayModel.rooms,
      sessions: multiDayModel.sessions,
    });
  });

  it('renders valid modules for empty collections', async () => {
    const emptyModel = { timeZone: 'Europe/Paris', days: [], rooms: [], sessions: [] };
    assert.deepEqual(await importGeneratedSchedule(emptyModel), { rooms: [], sessions: [] });
  });

  it('generates deterministic source with trailing newlines', () => {
    assert.equal(renderScheduleFile(model), renderScheduleFile(structuredClone(model)));
    assert.equal(renderScheduleFile(model).at(-1), '\n');
  });
});
