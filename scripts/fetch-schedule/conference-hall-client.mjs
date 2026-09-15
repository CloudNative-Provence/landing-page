/**
 * @typedef {Object} ConferenceHallSpeaker
 * @property {string} uid
 * @property {string} displayName
 */

/**
 * @typedef {Object} ConferenceHallTalk
 * @property {string} uid
 * @property {string} title
 * @property {string} [abstract]
 * @property {string} [categories]
 * @property {string} [formats]
 * @property {string} [language]
 * @property {ConferenceHallSpeaker[]} speakers
 */

/**
 * @typedef {Object} ConferenceHallScheduleSession
 * @property {string} talkId
 * @property {string} roomId
 * @property {string} startTime
 * @property {string} endTime
 */

/**
 * @typedef {Object} ConferenceHallScheduleRoom
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} ConferenceHallSchedule
 * @property {ConferenceHallScheduleRoom[]} rooms
 * @property {ConferenceHallScheduleSession[]} sessions
 */

/**
 * @typedef {Object} ConferenceHallCategory
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} ConferenceHallFormat
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} ConferenceHallEvent
 * @property {string} id
 * @property {string} name
 * @property {ConferenceHallCategory[]} [categories]
 * @property {ConferenceHallFormat[]} [formats]
 * @property {ConferenceHallTalk[]} [talks]
 * @property {ConferenceHallSchedule} [schedule]
 */

const DEFAULT_API_BASE = 'https://conference-hall.io';

/**
 * Fetches the event data from the Conference Hall public API.
 *
 * @param {object} params
 * @param {string} params.eventId  – Conference Hall event ID (slug)
 * @param {string} params.apiKey   – Conference Hall API key
 * @param {string} [params.apiBase] – Override for the API base URL
 * @returns {Promise<ConferenceHallEvent>}
 * @throws {Error} When the HTTP request fails
 */
export async function fetchConferenceHallEvent({ eventId, apiKey, apiBase = DEFAULT_API_BASE }) {
  const url = `${apiBase}/api/v1/event/${eventId}?key=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Conference Hall API error: HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}
