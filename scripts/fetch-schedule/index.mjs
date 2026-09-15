/**
 * Entry point for the fetch-schedule github-script action.
 *
 * Required environment variables:
 *   CONFERENCEHALL_API_KEY  – API key from the Conference Hall event settings
 *
 * Optional environment variables:
 *   CONFERENCEHALL_API_BASE – Override the API base URL (default: https://conference-hall.io)
 *
 * The Conference Hall event ID is read automatically from application/src/config.yaml.
 *
 * @param {import('@actions/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async ({ core, io }) => {
  const { readEventIdFromConfig } = await import('./config-reader.mjs');
  const { fetchConferenceHallEvent } = await import('./conference-hall-client.mjs');
  const { mapEventToScheduleModel } = await import('./schedule-mapper.mjs');
  const { renderScheduleFile } = await import('./schedule-renderer.mjs');
  const { writeScheduleFiles } = await import('./schedule-writer.mjs');

  const apiKey = process.env.CONFERENCEHALL_API_KEY;
  const apiBase = process.env.CONFERENCEHALL_API_BASE;
  const workspaceDir = process.env.GITHUB_WORKSPACE;

  if (!apiKey) {
    core.setFailed('CONFERENCEHALL_API_KEY environment variable is required');
    return;
  }

  if (!apiBase) {
    core.setFailed('CONFERENCEHALL_API_BASE environment variable is required');
    return;
  }

  const eventId = readEventIdFromConfig(workspaceDir);
  core.info(`Event ID from config: ${eventId}`);

  core.info(`Fetching schedule from Conference Hall …`);
  const event = await fetchConferenceHallEvent({ eventId, apiKey, apiBase });

  core.info(`Event: ${event.name}`);
  core.info(`  Categories : ${(event.categories ?? []).length}`);
  core.info(`  Formats    : ${(event.formats ?? []).length}`);
  core.info(`  Talks      : ${(event.talks ?? []).length}`);
  core.info(`  Schedule   : ${event.schedule?.sessions?.length ?? 0} sessions`);

  const model = mapEventToScheduleModel(event, { warning: (msg) => core.warning(msg) });
  const content = renderScheduleFile(model);
  const { enPath, frPath } = await writeScheduleFiles({ content, workspaceDir, io });

  core.info(`Wrote ${model.tracks.length} tracks, ${model.rooms.length} rooms, ${model.sessions.length} sessions`);
  core.info(`  → ${enPath}`);
  core.info(`  → ${frPath}`);
};
