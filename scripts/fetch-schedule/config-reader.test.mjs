import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { readEventIdFromConfig, readEventDateFromConfig } from './config-reader.mjs';

const API_BASE = 'https://conference-hall.io';

describe('readEventIdFromConfig', () => {
  it('extracts the event ID from a double-quoted submission URL', () => {
    const dir = join(tmpdir(), `config-reader-test-${Date.now()}`);
    const appDir = join(dir, 'application', 'src');
    mkdirSync(appDir, { recursive: true });

    writeFileSync(
      join(appDir, 'config.yaml'),
      `cfp:\n  submissionUrl: "https://conference-hall.io/kcd-provence-2026"\n`
    );

    assert.equal(readEventIdFromConfig(dir, API_BASE), 'kcd-provence-2026');

    rmSync(dir, { recursive: true });
  });

  it('extracts the event ID from a single-quoted submission URL', () => {
    const dir = join(tmpdir(), `config-reader-test-${Date.now()}`);
    const appDir = join(dir, 'application', 'src');
    mkdirSync(appDir, { recursive: true });

    writeFileSync(join(appDir, 'config.yaml'), `cfp:\n  submissionUrl: 'https://conference-hall.io/my-event-2026'\n`);

    assert.equal(readEventIdFromConfig(dir, API_BASE), 'my-event-2026');

    rmSync(dir, { recursive: true });
  });

  it('throws when the submission URL is missing', () => {
    const dir = join(tmpdir(), `config-reader-test-${Date.now()}`);
    const appDir = join(dir, 'application', 'src');
    mkdirSync(appDir, { recursive: true });

    writeFileSync(join(appDir, 'config.yaml'), `cfp:\n  opensAt: "2026-05-15"\n`);

    assert.throws(() => readEventIdFromConfig(dir, API_BASE), /Could not find a Conference Hall submission URL/);

    rmSync(dir, { recursive: true });
  });

  it('reads the event ID from the real config.yaml', () => {
    const workspaceDir = new URL('../../', import.meta.url).pathname;
    const eventId = readEventIdFromConfig(workspaceDir, API_BASE);
    assert.match(eventId, /^[a-z0-9-]+$/);
  });
});

describe('readEventDateFromConfig', () => {
  function configFile(t, content) {
    const dir = mkdtempSync(join(tmpdir(), 'event-date-config-'));
    mkdirSync(join(dir, 'application/src'), { recursive: true });
    writeFileSync(join(dir, 'application/src/config.yaml'), content);
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    return dir;
  }

  it('reads only the direct event date/timezone, regardless of other configuration fields', (t) => {
    const dir = configFile(
      t,
      `site:
  startsAt: "1999-01-01T00:00:00Z"
event:
  startsAt: "2026-12-10T08:00:00+01:00" # opening time
  timeZone: 'Europe/Paris'
  cfp:
    startsAt: "2000-01-01T00:00:00Z"
    timeZone: "UTC"
apps:
  timeZone: "UTC"
`
    );
    assert.deepEqual(readEventDateFromConfig(dir), {
      startsAt: '2026-12-10T08:00:00+01:00',
      timeZone: 'Europe/Paris',
    });
  });

  it('accepts unquoted scalar values and consistent alternative indentation', (t) => {
    const dir = configFile(t, 'event:\n    startsAt: 2026-12-10T08:00:00+01:00\n    timeZone: Europe/Paris\n');
    assert.equal(readEventDateFromConfig(dir).timeZone, 'Europe/Paris');
  });

  it('fails when the authoritative event fields are missing', (t) => {
    const dir = configFile(t, 'event:\n  cfp:\n    startsAt: "2026-12-10T08:00:00+01:00"\n    timeZone: "UTC"\n');
    assert.throws(() => readEventDateFromConfig(dir), /event.startsAt/);
  });

  it('does not choose between duplicate authoritative values', (t) => {
    const dir = configFile(
      t,
      'event:\n  startsAt: "2026-12-10T08:00:00+01:00"\n  startsAt: "2026-12-11T08:00:00+01:00"\n  timeZone: "UTC"\n'
    );
    assert.throws(() => readEventDateFromConfig(dir), /Duplicate event.startsAt/);
  });
});
