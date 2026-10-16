import programSchedule from '../../program/content/schedule';
import { type VenueRoom, venueLayout } from './venue-layout';

export type VenueMapRoom = VenueRoom & {
  programRoomId?: string;
  level?: 'first';
  detached?: boolean;
  /** Illustrative elevation in scene units, not a measured building height. */
  elevation?: number;
  relatedRoomId?: string;
};

/**
 * Detached auditorium, informed by the attendee-supplied interior photograph.
 * Its footprint, position and seat count are not measured venue geometry.
 */
export const detachedAmphitheatre: VenueMapRoom = {
  id: 'amphitheatre',
  name: 'Amphithéâtre',
  kind: 'room',
  polygon: [
    [80, -680],
    [1320, -680],
    [1320, -130],
    [80, -130],
  ],
  label: [700, -410],
  level: 'first',
  detached: true,
  elevation: 1.5,
  relatedRoomId: 'amphitheatre-access',
};

// Programme rooms are logical tracks. Only the plan resolves their physical spaces.
const programRoomBindings: Readonly<Record<string, readonly string[]>> = {
  amphitheatre: ['amphitheatre'],
  'salle-milhaud': ['milhaud'],
  hallway: ['forbin', 'sainte-victoire', 'picasso', 'sponsors'],
};

const rooms: readonly VenueMapRoom[] = [
  ...venueLayout.rooms.map((room) =>
    room.id === 'amphitheatre-access' ? { ...room, relatedRoomId: 'amphitheatre' } : room
  ),
  detachedAmphitheatre,
].map((room) => {
  const source = programSchedule.rooms.find((source) => programRoomBindings[source.id]?.includes(room.id));
  const name = source && programRoomBindings[source.id].length === 1 ? source.label : room.name;
  return { ...room, name, programRoomId: source?.id };
});

const points = rooms.flatMap((room) => room.polygon);
const minX = Math.min(0, ...points.map(([x]) => x));
const minY = Math.min(0, ...points.map(([, y]) => y));
const maxX = Math.max(venueLayout.source.width, ...points.map(([x]) => x));
const maxY = Math.max(venueLayout.source.height, ...points.map(([, y]) => y));

export const venuePresentation = {
  rooms,
  viewBox: [minX - 25, minY - 25, maxX - minX + 50, maxY - minY + 50].join(' '),
};
