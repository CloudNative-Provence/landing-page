import { ProgramSessionGroups } from '../../application/src/domains/pages/program/model/session-groups.ts';

/**
 * Resolve programme locations once, during generation, preserving every source ID.
 * A session published in every conference room takes place in the main room
 * and is broadcast to the others. Hallway is a separate programme room and
 * does not participate in conference broadcasts.
 */
export function assignSessionLocations(sessions, rooms) {
  const conferenceRooms = rooms.filter((room) => room.kind === 'conference');
  const mainRoom = conferenceRooms.find((room) => room.isMain);
  const locationsBySource = new Map();
  for (const group of ProgramSessionGroups.byContent(sessions)) {
    const conferenceSessions = group.filter(
      (session) =>
        session.locations.length === 1 && conferenceRooms.some((room) => room.id === session.locations[0].roomId)
    );
    const coversEveryRoom =
      conferenceRooms.length > 1 &&
      conferenceSessions.length === conferenceRooms.length &&
      conferenceRooms.every((room) => conferenceSessions.some((session) => session.locations[0].roomId === room.id));
    const broadcasts = coversEveryRoom && mainRoom;
    for (const session of group) {
      const locations =
        broadcasts && conferenceSessions.includes(session)
          ? conferenceRooms.map((room) => ({ roomId: room.id, role: room.id === mainRoom.id ? 'main' : 'broadcast' }))
          : session.locations;
      locationsBySource.set(
        session.id,
        [...locations].sort((left, right) => Number(left.role === 'broadcast') - Number(right.role === 'broadcast'))
      );
    }
  }
  return sessions.map((session) => ({ ...session, locations: locationsBySource.get(session.id) ?? [] }));
}
