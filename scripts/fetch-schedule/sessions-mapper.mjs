import { slugify, extractLocalTime } from './time-utils.mjs';

/**
 * @typedef {Object} SessionDefinition
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} startsAtTime
 * @property {string} endsAtTime
 * @property {string[]} trackIds
 * @property {string[]} roomIds  - Derived from the session's track (a track is always in the same room)
 * @property {string[]} [speakers]
 * @property {string} [format]
 * @property {boolean} [isGlobal]
 * @property {string[]} [tags]
 */

/**
 * Maps scheduled Conference Hall slots to session definitions.
 * The room for each session is derived from its track's room association.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallSchedule} schedule
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallTalk>} talkById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallCategory>} categoryById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallFormat>} formatById
 * @param {Map<string, string>} roomIdByTrackId  - Derived from tracks-rooms-mapper
 * @returns {SessionDefinition[]}
 */
export function mapSessionsFromSchedule(schedule, talkById, categoryById, formatById, roomIdByTrackId) {
  const sessions = [];

  for (const slot of schedule.sessions) {
    const talk = talkById.get(slot.talkId);
    if (!talk) continue;

    const category = talk.categories ? categoryById.get(talk.categories) : undefined;
    if (!category) {
      throw new Error(`Talk "${talk.title}" (${slot.talkId}) has no related track (category). Every scheduled talk must belong to a category.`);
    }

    const format = talk.formats ? formatById.get(talk.formats) : undefined;
    const trackId = slugify(category.name);
    const roomId = roomIdByTrackId.get(trackId) ?? '';

    /** @type {SessionDefinition} */
    const session = {
      id: slugify(talk.title),
      title: talk.title,
      description: talk.abstract ?? '',
      startsAtTime: extractLocalTime(slot.startTime),
      endsAtTime: extractLocalTime(slot.endTime),
      trackIds: [trackId],
      roomIds: roomId ? [roomId] : [],
      speakers: talk.speakers?.map((s) => s.displayName) ?? [],
    };

    if (format) session.format = format.name;

    const tags = [trackId];
    if (talk.language) tags.push(talk.language.toLowerCase());
    session.tags = tags;

    sessions.push(session);
  }

  return sessions;
}

/**
 * Fallback: maps accepted talks (without schedule placement) to session definitions.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallTalk[]} talks
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallCategory>} categoryById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallFormat>} formatById
 * @param {{ warning: (msg: string) => void }} logger
 * @returns {SessionDefinition[]}
 */
export function mapSessionsFromTalks(talks, categoryById, formatById, logger) {
  logger.warning('No schedule data returned by the API. Sessions will have placeholder times.');

  return talks.map((talk) => {
    const category = talk.categories ? categoryById.get(talk.categories) : undefined;
    if (!category) {
      throw new Error(`Talk "${talk.title}" (${talk.uid}) has no related track (category). Every talk must belong to a category.`);
    }

    const format = talk.formats ? formatById.get(talk.formats) : undefined;
    const trackId = slugify(category.name);

    /** @type {SessionDefinition} */
    const session = {
      id: slugify(talk.title),
      title: talk.title,
      description: talk.abstract ?? '',
      startsAtTime: '00:00',
      endsAtTime: '00:00',
      trackIds: [trackId],
      roomIds: [],
      speakers: talk.speakers?.map((s) => s.displayName) ?? [],
    };

    if (format) session.format = format.name;

    return session;
  });
}
