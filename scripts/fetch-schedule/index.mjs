import { readEventIdFromConfig, readEventDateFromConfig } from './config-reader.mjs';
import { fetchConferenceHallSchedule } from './conference-hall-client.mjs';
import { mapScheduleToModel } from './schedule-mapper.mjs';
import { renderScheduleFile } from './schedule-renderer.mjs';
import { writeScheduleFile } from './schedule-writer.mjs';
import { assertScheduleMatchesEvent } from '../../application/src/domains/pages/program/model/event-date.ts';

/**
 * Shared entry point for the GitHub action and the local CLI.
 * Configuration is passed explicitly; only the CLI reads environment variables.
 *
 * @param {{ core: object, io: object, apiKey: string, apiBase: string, workspaceDir: string }} params
 */
export default async ({ core, io, apiKey, apiBase, workspaceDir }) => {
  if (!apiKey) {
    throw new Error('apiKey parameter is required');
  }
  if (!apiBase) {
    throw new Error('apiBase parameter is required');
  }
  if (!workspaceDir) {
    throw new Error('workspaceDir parameter is required');
  }

  const eventId = readEventIdFromConfig(workspaceDir, apiBase);
  const event = readEventDateFromConfig(workspaceDir);
  core.info(`Event ID from config: ${eventId}`);
  core.info('Fetching schedule from Conference Hall …');
  const schedule = await fetchConferenceHallSchedule({ eventId, apiKey, apiBase });

  // Validate the entire response before replacing any existing content.
  const model = mapScheduleToModel(schedule);
  assertScheduleMatchesEvent(model, event);
  core.info(`Schedule: ${schedule.name} (${event.timeZone})`);
  const content = renderScheduleFile(model);
  const schedulePath = await writeScheduleFile({
    content,
    workspaceDir,
    io,
  });

  core.info(`Wrote ${model.rooms.length} rooms, ${model.sessions.length} sessions`);
  core.info(`  → ${schedulePath}`);
};
