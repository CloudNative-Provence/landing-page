import type { ProgramSession } from './schedule.ts';

/** Compare published content independently of the rooms that carry it. */
export class ProgramSessionGroups {
  static byContent<Session extends ProgramSession>(sessions: readonly Session[]): Session[][] {
    const groups = new Map<string, Session[]>();
    for (const session of sessions) {
      const key = JSON.stringify([
        Date.parse(session.startsAt),
        Date.parse(session.endsAt),
        session.title,
        session.description,
        session.format ?? '',
        session.tags ?? [],
        (session.speakers ?? []).map((speaker) => [
          speaker.id,
          speaker.name,
          speaker.bio ?? '',
          speaker.company ?? '',
          speaker.picture ?? '',
          speaker.socialLinks ?? [],
        ]),
      ]);
      const group = groups.get(key) ?? [];
      group.push(session);
      groups.set(key, group);
    }
    return [...groups.values()];
  }
}
