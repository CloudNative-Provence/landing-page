import { slugify } from './time-utils.mjs';

/**
 * @typedef {Object} RoomDefinition
 * @property {string} id
 * @property {string} label
 * @property {string} accent
 */

const accents = [
  'from-sky-500 to-cyan-400',
  'from-emerald-500 to-lime-400',
  'from-fuchsia-500 to-rose-400',
  'from-yellow-500 to-orange-400',
];

/**
 * Conference Hall exports room names in its `track` field. Proposal categories
 * are topics, so they must never decide room placement.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallScheduleSession[]} sessions
 * @returns {RoomDefinition[]}
 */
export function mapRooms(sessions) {
  const labelsById = new Map();
  for (const { track: label } of sessions) {
    const id = slugify(label);
    if (!id) throw new Error(`Invalid schedule: room "${label}" has no usable identifier.`);
    const existing = labelsById.get(id);
    if (existing !== undefined && existing !== label) {
      throw new Error(`Invalid schedule: rooms "${existing}" and "${label}" share identifier "${id}".`);
    }
    labelsById.set(id, label);
  }

  return [...labelsById]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, label], index) => ({ id, label, accent: accents[index % accents.length] }));
}
