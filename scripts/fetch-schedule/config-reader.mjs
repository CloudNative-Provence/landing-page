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
