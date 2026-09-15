import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Writes the schedule content to both locale-specific TypeScript files.
 *
 * @param {object} params
 * @param {string} params.content - The TypeScript file content to write
 * @param {string} params.workspaceDir - Absolute path to the repository root
 * @param {object} params.io - @actions/io instance (provides mkdirP)
 * @returns {Promise<{ enPath: string, frPath: string }>}
 */
export async function writeScheduleFiles({ content, workspaceDir, io }) {
  const contentDir = resolve(workspaceDir, 'application/src/domains/pages/program/content');

  await io.mkdirP(contentDir);

  const enPath = resolve(contentDir, 'schedule.en.ts');
  const frPath = resolve(contentDir, 'schedule.fr.ts');

  writeFileSync(enPath, content, 'utf-8');
  writeFileSync(frPath, content, 'utf-8');

  return { enPath, frPath };
}
