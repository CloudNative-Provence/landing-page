import { mapRooms } from './rooms-mapper.mjs';
import { mapSessionsFromSchedule } from './sessions-mapper.mjs';

/**
 * @typedef {Object} ScheduleModel
 * @property {string} timeZone
 * @property {string[]} days
 * @property {import('./rooms-mapper.mjs').RoomDefinition[]} rooms
 * @property {import('./sessions-mapper.mjs').SessionDefinition[]} sessions
 */

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid schedule: ${field} must be a nonempty string.`);
  }
}

function requireTimestamp(value, field) {
  requireString(value, field);
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-](\d{2}):(\d{2}))$/);
  const date = match && new Date(`${match[1]}T00:00:00Z`);
  if (
    !match ||
    !Number.isFinite(Date.parse(value)) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== match[1] ||
    Number(match[2]) > 23 ||
    Number(match[3]) > 59 ||
    Number(match[4] ?? 0) > 59 ||
    Number(match[6] ?? 0) > 23 ||
    Number(match[7] ?? 0) > 59
  ) {
    throw new Error(`Invalid schedule: ${field} must be an ISO timestamp with a timezone offset.`);
  }
}

function requireStringArray(value, field) {
  if (value == null) return;
  if (!Array.isArray(value)) throw new Error(`Invalid schedule: ${field} must be an array.`);
  value.forEach((item, index) => requireString(item, `${field}[${index}]`));
}

function requireWebUrl(value, field) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid schedule: ${field} must be an HTTP(S) URL.`);
  }
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`Invalid schedule: ${field} must be an HTTP(S) URL.`);
  }
}

function validateSchedule(schedule) {
  if (!isObject(schedule) || !Array.isArray(schedule.sessions) || !schedule.sessions.length) {
    throw new Error('Invalid schedule: expected a nonempty sessions array from the schedule export.');
  }

  requireString(schedule.timeZone, 'timeZone');
  try {
    new Intl.DateTimeFormat('en', { timeZone: schedule.timeZone });
  } catch {
    throw new Error(`Invalid schedule: unknown timeZone "${schedule.timeZone}".`);
  }

  if (!Array.isArray(schedule.days) || !schedule.days.length) {
    throw new Error('Invalid schedule: days must be a nonempty array.');
  }
  schedule.days.forEach((day, index) => requireTimestamp(day, `days[${index}]`));

  const ids = new Set();
  schedule.sessions.forEach((slot, index) => {
    const field = `sessions[${index}]`;
    if (!isObject(slot)) throw new Error(`Invalid schedule: ${field} must be an object.`);
    for (const name of ['id', 'title', 'track']) requireString(slot[name], `${field}.${name}`);
    if (ids.has(slot.id)) throw new Error(`Invalid schedule: duplicate session ID "${slot.id}".`);
    ids.add(slot.id);
    requireTimestamp(slot.start, `${field}.start`);
    requireTimestamp(slot.end, `${field}.end`);
    if (Date.parse(slot.end) <= Date.parse(slot.start)) {
      throw new Error(`Invalid schedule: ${field}.end must be after start.`);
    }
    if (slot.language != null) requireString(slot.language, `${field}.language`);
    if (slot.proposal === null) return;
    if (!isObject(slot.proposal)) {
      throw new Error(`Invalid schedule: ${field}.proposal must be an object or null.`);
    }
    const proposal = slot.proposal;
    if (proposal.abstract != null && typeof proposal.abstract !== 'string') {
      throw new Error(`Invalid schedule: ${field}.proposal.abstract must be a string.`);
    }
    for (const name of ['categories', 'formats']) {
      requireStringArray(proposal[name], `${field}.proposal.${name}`);
    }
    if (proposal.speakers != null) {
      if (!Array.isArray(proposal.speakers)) {
        throw new Error(`Invalid schedule: ${field}.proposal.speakers must be an array.`);
      }
      proposal.speakers.forEach((speaker, speakerIndex) => {
        const speakerField = `${field}.proposal.speakers[${speakerIndex}]`;
        requireString(speaker?.name, `${speakerField}.name`);
        requireString(speaker.id, `${speakerField}.id`);
        for (const name of ['bio', 'company', 'picture']) {
          if (speaker[name] != null && typeof speaker[name] !== 'string') {
            throw new Error(`Invalid schedule: ${speakerField}.${name} must be a string.`);
          }
        }
        if (speaker.picture?.trim()) requireWebUrl(speaker.picture, `${speakerField}.picture`);
        requireStringArray(speaker.socialLinks, `${speakerField}.socialLinks`);
        speaker.socialLinks?.forEach((link, linkIndex) =>
          requireWebUrl(link, `${speakerField}.socialLinks[${linkIndex}]`)
        );
      });
    }
  });
}

/**
 * Map the published Conference Hall schedule export without inferring missing slots.
 * Validation happens before any generated files can be written.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallSchedule} schedule
 * @returns {ScheduleModel}
 */
export function mapScheduleToModel(schedule) {
  validateSchedule(schedule);
  const rooms = mapRooms(schedule.sessions);
  const sessions = mapSessionsFromSchedule(schedule);
  const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  sessions.sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || compare(a.roomId, b.roomId) || compare(a.id, b.id)
  );

  return { timeZone: schedule.timeZone, days: [...schedule.days], rooms, sessions };
}
