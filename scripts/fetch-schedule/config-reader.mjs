import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Parses the conference-hall event ID from the CFP submission URL stored in config.yaml.
 * The URL has the form: <apiBase>/<event-id>
 *
 * @param {string} workspaceDir - Absolute path to the repository root
 * @param {string} apiBase - Conference Hall API base URL (e.g. https://conference-hall.io)
 * @returns {string} The event ID extracted from the submission URL
 * @throws {Error} When the config file cannot be read or the event ID cannot be found
 */
export function readEventIdFromConfig(workspaceDir, apiBase) {
  const configPath = resolve(workspaceDir, 'application/src/config.yaml');
  const configContent = readFileSync(configPath, 'utf-8');

  const escapedBase = apiBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`submissionUrl:\\s*["']${escapedBase}\\/([^"'\\s]+)["']`);
  const match = configContent.match(pattern);
  if (!match) {
    throw new Error(`Could not find a Conference Hall submission URL in ${configPath}`);
  }

  return match[1];
}

/**
 * Read the event's direct date and timezone fields, without introducing an
 * application dependency into the standalone fetch action.
 *
 * @param {string} workspaceDir
 * @returns {{ startsAt: string, timeZone: string }}
 */
export function readEventDateFromConfig(workspaceDir) {
  const configPath = resolve(workspaceDir, 'application/src/config.yaml');
  const lines = readFileSync(configPath, 'utf-8').split(/\r?\n/);
  const eventIndex = lines.findIndex((line) => /^event:\s*(?:#.*)?$/.test(line));
  if (eventIndex < 0) throw new Error(`Could not find event configuration in ${configPath}`);

  const eventLines = [];
  for (const line of lines.slice(eventIndex + 1)) {
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    if (/^\S/.test(line)) break;
    eventLines.push(line);
  }
  const indent = Math.min(...eventLines.map((line) => line.match(/^\s*/)[0].length));
  const fields = {};
  for (const line of eventLines) {
    if (line.match(/^\s*/)[0].length !== indent) continue;
    const match = line.match(/^\s*(startsAt|timeZone):\s*(?:"([^"]*)"|'([^']*)'|([^#\s]+))\s*(?:#.*)?$/);
    if (!match) continue;
    if (match[1] in fields) throw new Error(`Duplicate event.${match[1]} in ${configPath}`);
    fields[match[1]] = match[2] ?? match[3] ?? match[4];
  }
  for (const field of ['startsAt', 'timeZone']) {
    if (!fields[field]) throw new Error(`Could not find event.${field} in ${configPath}`);
  }
  return { startsAt: fields.startsAt, timeZone: fields.timeZone };
}
