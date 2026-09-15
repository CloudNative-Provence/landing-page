import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import fetchSchedule from './index.mjs';

const contentPath = 'application/src/domains/pages/program/content';
const fileNames = ['schedule.ts'];

function sourceSchedule() {
  return {
    name: 'Published schedule',
    timeZone: 'Europe/Paris',
    days: ['2026-12-10T00:00:00.000+01:00'],
    sessions: [
      {
        id: 'source-talk-id',
        title: "A speaker's talk",
        start: '2026-12-10T10:10:00.000+01:00',
        end: '2026-12-10T10:40:00.000+01:00',
        track: 'Amphithéâtre',
        language: 'fr',
        proposal: {
          id: 'proposal-id',
          abstract: "First paragraph.\n\n- A list item\r\n- A backslash: \\ and an apostrophe: '",
          categories: ['Platform Engineering'],
          formats: ['Conference (30 minutes)'],
          speakers: [
            {
              id: 'speaker-id',
              name: 'Test Speaker',
              bio: 'A **speaker** with a [profile](https://example.org).\n\nSecond paragraph.',
              company: "Speaker's Company",
              picture: 'https://example.org/avatar.jpg',
              socialLinks: ['https://example.org/profile'],
            },
            { id: 'guest-id', name: 'Guest Speaker' },
          ],
        },
      },
      {
        id: 'source-break-id',
        title: 'BREAK',
        start: '2026-12-10T09:55:00.000+01:00',
        end: '2026-12-10T10:10:00.000+01:00',
        track: 'Salle Millau',
        language: null,
        proposal: null,
      },
    ],
  };
}

async function setup(t, payload, event = { startsAt: '2026-12-10T08:00:00+01:00', timeZone: 'Europe/Paris' }) {
  const workspaceDir = await mkdtemp(join(tmpdir(), 'schedule-import-test-'));
  t.after(() => rm(workspaceDir, { recursive: true, force: true }));
  const server = createServer((_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const apiBase = `http://127.0.0.1:${server.address().port}`;
  await mkdir(join(workspaceDir, contentPath), { recursive: true });
  await writeFile(
    join(workspaceDir, 'application/src/config.yaml'),
    `event:\n  startsAt: "${event.startsAt}"\n  timeZone: "${event.timeZone}"\n  cfp:\n    submissionUrl: "${apiBase}/test-event"\n`
  );
  return {
    workspaceDir,
    run: () =>
      fetchSchedule({
        core: { info: () => {} },
        io: { mkdirP: (path) => mkdir(path, { recursive: true }) },
        apiKey: 'local-test-key',
        apiBase,
        workspaceDir,
      }),
    contents: () => Promise.all(fileNames.map((name) => readFile(join(workspaceDir, contentPath, name), 'utf8'))),
  };
}

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

test('imports the official schema into one complete, deterministic schedule module', async (t) => {
  const source = sourceSchedule();
  const context = await setup(t, source);
  await context.run();
  const first = await context.contents();
  assert.deepEqual(await readdir(join(context.workspaceDir, contentPath)), ['schedule.ts']);
  assert.doesNotMatch(first[0], /\btracks\b|\btrackId\b/);

  const { default: generated } = await import(moduleUrl(first[0]));
  assert.equal('timeZone' in generated, false);
  assert.equal('days' in generated, false);
  assert.equal(generated.sessions.length, source.sessions.length);
  assert.deepEqual(
    generated.rooms.map((room) => room.label),
    ['Amphithéâtre', 'Salle Millau']
  );
  assert.equal('tracks' in generated, false);
  for (const room of generated.rooms) {
    assert.ok(room.label);
    assert.ok(room.accent);
  }
  for (const slot of source.sessions) {
    const session = generated.sessions.find((entry) => entry.id === slot.id);
    assert.ok(session, `Missing official slot ${slot.id}`);
    assert.equal(session.title, slot.title);
    assert.equal(session.startsAt, slot.start);
    assert.equal(session.endsAt, slot.end);
    assert.equal(session.description, slot.proposal?.abstract ?? '');
    assert.equal(generated.rooms.find((room) => room.id === session.roomId).label, slot.track);
    assert.equal('trackId' in session, false);
    if (slot.proposal) {
      assert.deepEqual(session.speakers, slot.proposal.speakers);
      assert.equal(session.format, slot.proposal.formats[0]);
    }
  }

  await context.run();
  assert.deepEqual(await context.contents(), first);
  assert.deepEqual(await readdir(join(context.workspaceDir, contentPath)), ['schedule.ts']);
});

for (const [name, payload] of [
  ['a proposals export', { name: 'Wrong endpoint', proposals: [{ id: 'proposal-id' }] }],
  ['an empty schedule', { ...sourceSchedule(), sessions: [] }],
  ['a malformed session', { ...sourceSchedule(), sessions: [{ ...sourceSchedule().sessions[0], end: 'invalid' }] }],
]) {
  test(`rejects ${name} without overwriting any schedule file`, async (t) => {
    const context = await setup(t, payload);
    const previous = fileNames.map((name) => `// Previous content: ${name}\n`);
    await Promise.all(
      fileNames.map((name, index) => writeFile(join(context.workspaceDir, contentPath, name), previous[index]))
    );

    await assert.rejects(context.run());
    assert.deepEqual(await context.contents(), previous);
  });
}

for (const [name, payload, event, error] of [
  [
    'a different published date',
    { ...sourceSchedule(), days: ['2026-12-11T00:00:00+01:00'] },
    undefined,
    /schedule.days\[0\].*2026-12-11.*2026-12-10/,
  ],
  [
    'a schedule extending over another day',
    { ...sourceSchedule(), days: [...sourceSchedule().days, '2026-12-11T00:00:00+01:00'] },
    undefined,
    /schedule.days\[1\]/,
  ],
  [
    'a session on another date despite matching published day metadata',
    {
      ...sourceSchedule(),
      sessions: [
        {
          ...sourceSchedule().sessions[0],
          start: '2026-12-11T09:00:00+01:00',
          end: '2026-12-11T10:00:00+01:00',
        },
      ],
    },
    undefined,
    /session "source-talk-id" start.*2026-12-11.*2026-12-10/,
  ],
  [
    'a session ending on another date',
    { ...sourceSchedule(), sessions: [{ ...sourceSchedule().sessions[0], end: '2026-12-11T00:15:00+01:00' }] },
    undefined,
    /session "source-talk-id" end.*2026-12-11.*2026-12-10/,
  ],
  [
    'a config change that conflicts with the existing schedule',
    sourceSchedule(),
    { startsAt: '2026-12-09T08:00:00+01:00', timeZone: 'Europe/Paris' },
    /2026-12-10.*2026-12-09/,
  ],
]) {
  test(`rejects ${name} before replacing any generated file`, async (t) => {
    const context = await setup(t, payload, event);
    const previous = fileNames.map((name) => `// Keep previous content: ${name}\n`);
    await Promise.all(
      fileNames.map((name, index) => writeFile(join(context.workspaceDir, contentPath, name), previous[index]))
    );
    await assert.rejects(context.run(), error);
    assert.deepEqual(await context.contents(), previous);
  });
}
