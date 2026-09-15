/**
 * Entry point for the fetch-schedule github-script action.
 *
 * All parameters are passed explicitly from the action — no environment
 * variables are read inside this module.
 *
 * @param {import('@actions/github-script').AsyncFunctionArguments & {
 *   apiKey: string,
 *   apiBase: string,
 *   workspaceDir: string,
 * }} params
 */
export default async ({ core, io, apiKey, apiBase, workspaceDir }) => {
  const { readEventIdFromConfig } = await import('./config-reader.mjs');
  const { fetchConferenceHallEvent } = await import('./conference-hall-client.mjs');
  const { mapEventToScheduleModel } = await import('./schedule-mapper.mjs');
  const { renderSharedScheduleFile, renderLocaleScheduleFile } = await import('./schedule-renderer.mjs');
  const { writeScheduleFiles } = await import('./schedule-writer.mjs');

  if (!apiKey) {
    core.setFailed('apiKey parameter is required');
    return;
  }

  if (!apiBase) {
    core.setFailed('apiBase parameter is required');
    return;
  }

  if (!workspaceDir) {
    core.setFailed('workspaceDir parameter is required');
    return;
  }

  const eventId = readEventIdFromConfig(workspaceDir, apiBase);
  core.info(`Event ID from config: ${eventId}`);

  core.info(`Fetching schedule from Conference Hall …`);
  const event = await fetchConferenceHallEvent({ eventId, apiKey, apiBase });

  core.info(`Event: ${event.name}`);
  core.info(`  Categories : ${(event.categories ?? []).length}`);
  core.info(`  Formats    : ${(event.formats ?? []).length}`);
  core.info(`  Talks      : ${(event.talks ?? []).length}`);
  core.info(`  Schedule   : ${event.schedule?.sessions?.length ?? 0} sessions`);

  const model = mapEventToScheduleModel(event, { warning: (msg) => core.warning(msg) });
  const sharedContent = renderSharedScheduleFile(model);
  const localeContent = renderLocaleScheduleFile(model);
  const { sharedPath, enPath, frPath } = await writeScheduleFiles({ sharedContent, localeContent, workspaceDir, io });

  core.info(`Wrote ${model.tracks.length} tracks, ${model.rooms.length} rooms, ${model.sessions.length} sessions`);
  core.info(`  → ${sharedPath}`);
  core.info(`  → ${enPath}`);
  core.info(`  → ${frPath}`);
};
