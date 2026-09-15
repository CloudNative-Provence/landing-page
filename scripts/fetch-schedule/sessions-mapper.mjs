import { slugify } from './time-utils.mjs';

/**
 * @typedef {Object} SessionDefinition
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} startsAt
 * @property {string} endsAt
 * @property {string} roomId
 * @property {import('../../application/src/domains/pages/program/model/schedule.ts').ProgramSpeaker[]} [speakers]
 * @property {string} [format]
 * @property {string[]} [tags]
 */

/**
 * Preserve every published slot, including breaks and repeated room entries.
 * Source IDs and full timestamps survive title changes and multi-day schedules.
 *
 * @param {import('./conference-hall-client.mjs').ConferenceHallSchedule} schedule
 * @returns {SessionDefinition[]}
 */
export function mapSessionsFromSchedule(schedule) {
  return schedule.sessions.map((slot) => {
    const proposal = slot.proposal;
    /** @type {SessionDefinition} */
    const session = {
      id: slot.id,
      title: slot.title,
      description: proposal?.abstract ?? '',
      startsAt: slot.start,
      endsAt: slot.end,
      roomId: slugify(slot.track),
    };
    if (proposal?.speakers?.length) {
      session.speakers = proposal.speakers.map((speaker) => {
        const profile = { id: speaker.id, name: speaker.name };
        for (const field of ['bio', 'company', 'picture']) {
          if (speaker[field]?.trim()) profile[field] = speaker[field];
        }
        if (speaker.socialLinks?.length) profile.socialLinks = [...speaker.socialLinks];
        return profile;
      });
    }
    if (proposal?.formats?.length) session.format = proposal.formats.join(' · ');
    const tags = [...(proposal?.categories ?? [])];
    if (slot.language) tags.push(slot.language);
    if (tags.length) session.tags = tags;
    return session;
  });
}
