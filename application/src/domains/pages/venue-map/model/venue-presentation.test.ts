import { describe, expect, it } from 'vitest';
import programSchedule from '../../program/content/schedule';
import { venueLayout } from './venue-layout';
import { detachedAmphitheatre, venuePresentation } from './venue-presentation';

describe('the single venue overview', () => {
  it('maps the three programme rooms to physical spaces only in the plan', () => {
    expect(programSchedule.rooms.map((room) => room.id)).toEqual(['amphitheatre', 'hallway', 'salle-milhaud']);
    const physicalRooms = (programRoomId: string) =>
      venuePresentation.rooms
        .filter((room) => room.programRoomId === programRoomId)
        .map((room) => room.id)
        .sort();
    expect(physicalRooms('amphitheatre')).toEqual(['amphitheatre']);
    expect(physicalRooms('salle-milhaud')).toEqual(['milhaud']);
    expect(physicalRooms('hallway')).toEqual(['forbin', 'picasso', 'sainte-victoire', 'sponsors']);
    for (const room of venuePresentation.rooms.filter((room) => room.programRoomId === 'hallway')) {
      expect(room.name).toBe(venueLayout.rooms.find((source) => source.id === room.id)?.name);
      expect(room.name).not.toBe('Hallway');
    }
  });
  it('preserves every traced ground-floor footprint and label', () => {
    for (const source of venueLayout.rooms) {
      const displayed = venuePresentation.rooms.find((room) => room.id === source.id);
      expect(displayed?.polygon).toBe(source.polygon);
      expect(displayed?.label).toBe(source.label);
      expect(displayed?.capacity).toBe(source.capacity);
      expect(displayed?.elevation).toBeUndefined();
    }
    expect(venueLayout.rooms.some((room) => room.id === 'amphitheatre')).toBe(false);
  });

  it('keeps the detached auditorium outside the source plan and inside the fallback view', () => {
    const room = detachedAmphitheatre;
    expect(room.detached).toBe(true);
    expect(room.level).toBe('first');
    expect(room.capacity).toBeUndefined();
    expect(room.polygon.every(([, y]) => y < 0)).toBe(true);
    const [x, y, width, height] = venuePresentation.viewBox.split(' ').map(Number);
    for (const displayed of venuePresentation.rooms) {
      for (const point of [...displayed.polygon, displayed.label]) {
        expect(point[0]).toBeGreaterThanOrEqual(x);
        expect(point[0]).toBeLessThanOrEqual(x + width);
        expect(point[1]).toBeGreaterThanOrEqual(y);
        expect(point[1]).toBeLessThanOrEqual(y + height);
      }
    }
  });

  it('assigns auditorium sessions to the room and connects it to the documented access', () => {
    const mappedRooms = venuePresentation.rooms.filter((room) => room.programRoomId === 'amphitheatre');
    expect(mappedRooms.map((room) => room.id)).toEqual(['amphitheatre']);
    const access = venuePresentation.rooms.find((room) => room.id === 'amphitheatre-access');
    expect(access?.programRoomId).toBeUndefined();
    expect(access?.relatedRoomId).toBe(detachedAmphitheatre.id);
    expect(detachedAmphitheatre.relatedRoomId).toBe(access?.id);
  });

  it('binds the sponsor destination to the existing hall zone without changing its footprint', () => {
    const source = venueLayout.rooms.find((room) => room.id === 'sponsors')!;
    const displayed = venuePresentation.rooms.find((room) => room.id === 'sponsors')!;
    expect(displayed.programRoomId).toBe('hallway');
    expect(displayed.polygon).toBe(source.polygon);
    expect(displayed.label).toBe(source.label);
  });
});
