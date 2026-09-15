/**
 * @typedef {Object} TrackDefinition
 * @property {string} id
 * @property {string} label
 * @property {string} accent
 */

/**
 * @typedef {Object} RoomDefinition
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} SessionDefinition
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} startsAtTime
 * @property {string} endsAtTime
 * @property {string[]} trackIds
 * @property {string[]} roomIds
 * @property {string[]} [speakers]
 * @property {string} [format]
 * @property {boolean} [isGlobal]
 * @property {string[]} [tags]
 */

/**
 * @typedef {Object} ScheduleModel
 * @property {TrackDefinition[]} tracks
 * @property {RoomDefinition[]} rooms
 * @property {SessionDefinition[]} sessions
 */

/** @type {Record<string, string>} */
const TRACK_ACCENTS = {
  keynote: 'from-sky-500 to-cyan-400',
  platform: 'from-emerald-500 to-lime-400',
  builders: 'from-fuchsia-500 to-rose-400',
};

const DEFAULT_ACCENT = 'from-violet-500 to-indigo-400';

/**
 * Slugify a string into a URL-safe identifier.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract "HH:MM" from an ISO-8601 datetime string, preserving the original local time.
 * e.g. "2026-12-10T09:00:00+01:00" → "09:00"
 * @param {string} isoString
 * @returns {string}
 */
export function extractLocalTime(isoString) {
  const match = isoString.match(/T(\d{2}):(\d{2})/);
  if (!match) {
    throw new Error(`Cannot extract time from ISO string: ${isoString}`);
  }
  return `${match[1]}:${match[2]}`;
}

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

  /** @type {TrackDefinition[]} */
  const tracks = categories.map((cat) => {
    const slug = slugify(cat.name);
    return { id: slug, label: cat.name, accent: TRACK_ACCENTS[slug] ?? DEFAULT_ACCENT };
  });

  /** @type {RoomDefinition[]} */
  const rooms = (schedule?.rooms ?? []).map((room) => ({
    id: slugify(room.name),
    label: room.name,
  }));

  /** @type {SessionDefinition[]} */
  const sessions = schedule?.sessions?.length
    ? buildSessionsFromSchedule(schedule, talkById, categoryById, formatById)
    : buildSessionsFromTalks(talks, categoryById, formatById, logger);

  sessions.sort((a, b) => a.startsAtTime.localeCompare(b.startsAtTime));

  return { tracks, rooms, sessions };
}

/**
 * @param {import('./conference-hall-client.mjs').ConferenceHallSchedule} schedule
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallTalk>} talkById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallCategory>} categoryById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallFormat>} formatById
 * @returns {SessionDefinition[]}
 */
function buildSessionsFromSchedule(schedule, talkById, categoryById, formatById) {
  const sessions = [];

  for (const slot of schedule.sessions) {
    const talk = talkById.get(slot.talkId);
    if (!talk) continue;

    const category = talk.categories ? categoryById.get(talk.categories) : undefined;
    const format = talk.formats ? formatById.get(talk.formats) : undefined;
    const trackId = category ? slugify(category.name) : undefined;
    const roomId = slugify(schedule.rooms.find((r) => r.id === slot.roomId)?.name ?? slot.roomId);

    /** @type {SessionDefinition} */
    const session = {
      id: slugify(talk.title),
      title: talk.title,
      description: talk.abstract ?? '',
      startsAtTime: extractLocalTime(slot.startTime),
      endsAtTime: extractLocalTime(slot.endTime),
      trackIds: trackId ? [trackId] : [],
      roomIds: [roomId],
      speakers: talk.speakers?.map((s) => s.displayName) ?? [],
    };

    if (format) session.format = format.name;

    const tags = [];
    if (category) tags.push(slugify(category.name));
    if (talk.language) tags.push(talk.language.toLowerCase());
    if (tags.length) session.tags = tags;

    sessions.push(session);
  }

  return sessions;
}

/**
 * Fallback: build sessions from talks without schedule placement.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallTalk[]} talks
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallCategory>} categoryById
 * @param {Map<string, import('./conference-hall-client.mjs').ConferenceHallFormat>} formatById
 * @param {{ warning: (msg: string) => void }} logger
 * @returns {SessionDefinition[]}
 */
function buildSessionsFromTalks(talks, categoryById, formatById, logger) {
  logger.warning('No schedule data returned by the API. Sessions will have placeholder times.');

  return talks.map((talk) => {
    const category = talk.categories ? categoryById.get(talk.categories) : undefined;
    const format = talk.formats ? formatById.get(talk.formats) : undefined;
    const trackId = category ? slugify(category.name) : undefined;

    /** @type {SessionDefinition} */
    const session = {
      id: slugify(talk.title),
      title: talk.title,
      description: talk.abstract ?? '',
      startsAtTime: '00:00',
      endsAtTime: '00:00',
      trackIds: trackId ? [trackId] : [],
      roomIds: [],
      speakers: talk.speakers?.map((s) => s.displayName) ?? [],
    };

    if (format) session.format = format.name;

    return session;
  });
}
