/**
 * @typedef {Object} ConferenceHallSpeaker
 * @property {string} id
 * @property {string} name
 * @property {string | null} [bio]
 * @property {string | null} [company]
 * @property {string | null} [picture]
 * @property {string[] | null} [socialLinks]
 */

/**
 * @typedef {Object} ConferenceHallScheduleSession
 * @property {string} id
 * @property {string} start
 * @property {string} end
 * @property {string} track Room name in the Conference Hall export.
 * @property {string} title
 * @property {string | null} language
 * @property {{ id: string, abstract: string, formats: string[], categories: string[], speakers: ConferenceHallSpeaker[] } | null} proposal
 */

/**
 * @typedef {Object} ConferenceHallSchedule
 * @property {string} name
 * @property {string[]} days
 * @property {string} timeZone
 * @property {ConferenceHallScheduleSession[]} sessions
 */

/**
 * Fetch the authoritative schedule, including slots without a proposal.
 * The event endpoint without /schedule exports proposals instead.
 *
 * @param {{ eventId: string, apiKey: string, apiBase: string }} params
 * @returns {Promise<ConferenceHallSchedule>}
 */
export async function fetchConferenceHallSchedule({ eventId, apiKey, apiBase }) {
  const url = new URL(`/api/v1/event/${encodeURIComponent(eventId)}/schedule`, apiBase);
  const response = await fetch(url, {
    headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Conference Hall API error: HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}
