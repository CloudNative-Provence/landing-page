import { slugify } from './time-utils.mjs';

/**
 * @typedef {Object} TrackDefinition
 * @property {string} id
 * @property {string} label
 * @property {string} roomId - The room this track is always held in
 */

/**
 * @typedef {Object} RoomDefinition
 * @property {string} id
 * @property {string} label
 */

/**
 * Maps Conference Hall categories and schedule rooms to tracks and rooms.
 * Each track is associated with exactly one room.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallCategory[]} categories
 * @param {import('./conference-hall-client.mjs').ConferenceHallRoom[]} scheduleRooms
 * @param {import('./conference-hall-client.mjs').ConferenceHallScheduleSession[]} scheduleSessions
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallTalk>} talkById
 * @returns {{ tracks: TrackDefinition[], rooms: RoomDefinition[], roomIdByTrackId: Map<string, string> }}
 */
export function mapTracksAndRooms(categories, scheduleRooms, scheduleSessions, talkById) {
  /** @type {RoomDefinition[]} */
  const rooms = scheduleRooms.map((room) => ({
    id: slugify(room.name),
    label: room.name,
  }));

  // Build track→room association: for each scheduled session, link the talk's
  // category (track) to the room it is placed in.
  /** @type {Map<string, string>} trackSlug → roomSlug */
  const roomIdByTrackId = new Map();

  for (const slot of scheduleSessions) {
    const talk = talkById.get(slot.talkId);
    if (!talk?.categories) continue;

    const roomSlug = slugify(scheduleRooms.find((r) => r.id === slot.roomId)?.name ?? slot.roomId);
    const trackSlug = slugify(
      categories.find((c) => c.id === talk.categories)?.name ?? talk.categories
    );

    if (!roomIdByTrackId.has(trackSlug)) {
      roomIdByTrackId.set(trackSlug, roomSlug);
    }
  }

  /** @type {TrackDefinition[]} */
  const tracks = categories.map((cat) => {
    const id = slugify(cat.name);
    return { id, label: cat.name, roomId: roomIdByTrackId.get(id) ?? '' };
  });

  return { tracks, rooms, roomIdByTrackId };
}
