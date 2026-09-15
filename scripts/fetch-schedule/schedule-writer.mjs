import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Write the source rooms and sessions once for every locale.
 *
 * @param {{ content: string, workspaceDir: string, io: object }} params
 * @returns {Promise<string>} Path to the generated schedule.ts file.
 */
export async function writeScheduleFile({ content, workspaceDir, io }) {
  const contentDir = resolve(workspaceDir, 'application/src/domains/pages/program/content');
  await io.mkdirP(contentDir);

  const schedulePath = resolve(contentDir, 'schedule.ts');
  writeFileSync(schedulePath, content, 'utf-8');
  return schedulePath;
}
