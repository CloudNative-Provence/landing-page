import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Writes the schedule content to the shared and locale-specific TypeScript files.
 * - schedule.ts: shared tracks and rooms (no labels)
 * - schedule.en.ts: sessions (imports tracks/rooms from ./schedule)
 * - schedule.fr.ts: sessions (imports tracks/rooms from ./schedule)
 *
 * @param {object} params
 * @param {string} params.sharedContent - Content for the shared schedule.ts file
 * @param {string} params.localeContent - Content for the locale schedule files (same sessions for both)
 * @param {string} params.workspaceDir - Absolute path to the repository root
 * @param {object} params.io - @actions/io instance (provides mkdirP)
 * @returns {Promise<{ sharedPath: string, enPath: string, frPath: string }>}
 */
export async function writeScheduleFiles({ sharedContent, localeContent, workspaceDir, io }) {
  const contentDir = resolve(workspaceDir, 'application/src/domains/pages/program/content');

  await io.mkdirP(contentDir);

  const sharedPath = resolve(contentDir, 'schedule.ts');
  const enPath = resolve(contentDir, 'schedule.en.ts');
  const frPath = resolve(contentDir, 'schedule.fr.ts');

  writeFileSync(sharedPath, sharedContent, 'utf-8');
  writeFileSync(enPath, localeContent, 'utf-8');
  writeFileSync(frPath, localeContent, 'utf-8');

  return { sharedPath, enPath, frPath };
}
