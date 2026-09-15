import { mapTracksAndRooms } from './tracks-rooms-mapper.mjs';
import { mapSessionsFromSchedule, mapSessionsFromTalks } from './sessions-mapper.mjs';

/**
 * @typedef {import('./tracks-rooms-mapper.mjs').TrackDefinition} TrackDefinition
 * @typedef {import('./tracks-rooms-mapper.mjs').RoomDefinition} RoomDefinition
 * @typedef {import('./sessions-mapper.mjs').SessionDefinition} SessionDefinition
 */

/**
 * @typedef {Object} ScheduleModel
 * @property {TrackDefinition[]} tracks
 * @property {RoomDefinition[]} rooms
 * @property {SessionDefinition[]} sessions
 */

/**
 * Maps a Conference Hall event API response to a schedule model.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallEvent} event
 * @param {{ warning: (msg: string) => void }} logger
 * @returns {ScheduleModel}
 */
export function mapEventToScheduleModel(event, logger) {
  const categories = event.categories ?? [];
  const formats = event.formats ?? [];
  const talks = event.talks ?? [];
  const schedule = event.schedule;

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const formatById = new Map(formats.map((f) => [f.id, f]));
  const talkById = new Map(talks.map((t) => [t.uid, t]));

  const scheduleRooms = schedule?.rooms ?? [];
  const scheduleSessions = schedule?.sessions ?? [];

  const { tracks, rooms } = mapTracksAndRooms(
    categories,
    scheduleRooms,
    scheduleSessions,
    talkById
  );

  /** @type {SessionDefinition[]} */
  const sessions = schedule?.sessions?.length
    ? mapSessionsFromSchedule(schedule, talkById, categoryById, formatById)
    : mapSessionsFromTalks(talks, categoryById, formatById, logger);

  sessions.sort((a, b) => a.startsAtTime.localeCompare(b.startsAtTime));

  return { tracks, rooms, sessions };
}
