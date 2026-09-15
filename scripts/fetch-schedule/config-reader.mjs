import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Parses the conference-hall event ID from the CFP submission URL stored in config.yaml.
 * The URL has the form: https://conference-hall.io/<event-id>
 *
 * @param {string} workspaceDir - Absolute path to the repository root
 * @returns {string} The event ID extracted from the submission URL
 * @throws {Error} When the config file cannot be read or the event ID cannot be found
 */
export function readEventIdFromConfig(workspaceDir) {
  const configPath = resolve(workspaceDir, 'application/src/config.yaml');
  const configContent = readFileSync(configPath, 'utf-8');

  const match = configContent.match(/submissionUrl:\s*["']https:\/\/conference-hall\.io\/([^"'\s]+)["']/);
  if (!match) {
    throw new Error(`Could not find a Conference Hall submission URL in ${configPath}`);
  }

  return match[1];
}
