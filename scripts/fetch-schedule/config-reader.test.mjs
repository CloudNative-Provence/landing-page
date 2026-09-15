import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { readEventIdFromConfig } from './config-reader.mjs';

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

    writeFileSync(
      join(appDir, 'config.yaml'),
      `cfp:\n  submissionUrl: 'https://conference-hall.io/my-event-2026'\n`
    );

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
