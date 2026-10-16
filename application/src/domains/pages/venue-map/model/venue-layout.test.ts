import { describe, expect, it } from 'vitest';
import { type PlanPoint, venueLayout } from './venue-layout';

const contains = (polygon: readonly PlanPoint[], point: PlanPoint): boolean => {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const [x, y] = polygon[current];
    const [previousX, previously] = polygon[previous];
    if (
      y > point[1] !== previously > point[1] &&
      point[0] < ((previousX - x) * (point[1] - y)) / (previously - y) + x
    ) {
      inside = !inside;
    }
  }
  return inside;
};

describe('the supplied venue layout', () => {
  it('keeps editable geometry and labels within the original raster coordinate system', () => {
    const { source, rooms, fixtures, walls, openings } = venueLayout;
    expect(source).toEqual({ width: 3203, height: 2290 });
    expect(new Set(rooms.map((room) => room.id)).size).toBe(rooms.length);

    const points = [
      ...rooms.flatMap((room) => [...room.polygon, room.label]),
      ...fixtures.flatMap((fixture) => fixture.polygon),
      ...[...walls, ...openings].flatMap((segment) => [segment.start, segment.end]),
    ];
    for (const [x, y] of points) {
      expect(Number.isFinite(x) && x >= 0 && x <= source.width).toBe(true);
      expect(Number.isFinite(y) && y >= 0 && y <= source.height).toBe(true);
    }
    for (const room of rooms) {
      expect(room.polygon.length).toBeGreaterThanOrEqual(3);
      expect(contains(room.polygon, room.label), room.id).toBe(true);
    }
  });

  it('represents the amphitheatre only by the access footprint provided by the organiser', () => {
    expect(venueLayout.rooms.some((room) => room.id === 'amphitheatre')).toBe(false);
    const access = venueLayout.rooms.find((room) => room.id === 'amphitheatre-access');
    expect(access?.kind).toBe('circulation');
    expect(access?.capacity).toBeUndefined();
  });

  it('preserves the documented internal connections without creating a Milhaud–Forbin door', () => {
    const connections = (from: string, to: string) =>
      venueLayout.openings.filter(
        (opening) => [opening.from, opening.to].includes(from) && [opening.from, opening.to].includes(to)
      );

    expect(connections('hall', 'milhaud')).toHaveLength(2);
    expect(connections('forbin', 'sainte-victoire')).toHaveLength(2);
    expect(connections('picasso', 'sainte-victoire')).toHaveLength(2);
    expect(connections('hall', 'amphitheatre-access')).toHaveLength(2);
    expect(connections('hall', 'sainte-victoire')).toHaveLength(1);
    expect(connections('picasso', 'terrasse-picasso')).toHaveLength(1);
    expect(connections('milhaud', 'forbin')).toHaveLength(0);
    expect(connections('hall', 'forbin')).toHaveLength(0);

    const knownIds = new Set(['outside', ...venueLayout.rooms.map((room) => room.id)]);
    for (const opening of venueLayout.openings) {
      expect(knownIds.has(opening.from), opening.id).toBe(true);
      expect(knownIds.has(opening.to), opening.id).toBe(true);
    }
  });

  it('does not render wall segments across documented door openings', () => {
    for (const opening of venueLayout.openings) {
      const vertical = opening.start[0] === opening.end[0];
      const axis = vertical ? 1 : 0;
      const fixedAxis = vertical ? 0 : 1;
      const openingMin = Math.min(opening.start[axis], opening.end[axis]);
      const openingMax = Math.max(opening.start[axis], opening.end[axis]);
      for (const wall of venueLayout.walls) {
        if (wall.start[fixedAxis] !== opening.start[fixedAxis] || wall.end[fixedAxis] !== opening.start[fixedAxis])
          continue;
        const overlap =
          Math.min(openingMax, Math.max(wall.start[axis], wall.end[axis])) -
          Math.max(openingMin, Math.min(wall.start[axis], wall.end[axis]));
        expect(overlap, `${opening.id} must remain open`).toBeLessThanOrEqual(0);
      }
    }
  });

  it('keeps the sponsor wedge inside the hall and its diagonal edge open', () => {
    const hall = venueLayout.rooms.find((room) => room.id === 'hall');
    const sponsors = venueLayout.rooms.find((room) => room.id === 'sponsors');
    expect(hall && sponsors).toBeTruthy();
    if (!hall || !sponsors) return;
    expect(sponsors.polygon.every((point) => contains(hall.polygon, point))).toBe(true);
    expect(
      venueLayout.walls.some(
        (wall) =>
          wall.start[0] !== wall.end[0] && wall.start[1] !== wall.end[1] && contains(sponsors.polygon, wall.start)
      )
    ).toBe(false);
  });

  it('retains the event furniture counts and Milhaud capacity from the source plan', () => {
    const seatCount = venueLayout.fixtures
      .filter((fixture) => fixture.kind === 'seat-block')
      .reduce((total, fixture) => total + (fixture.rows ?? 0) * (fixture.columns ?? 0), 0);
    expect(seatCount).toBe(176);
    expect(venueLayout.rooms.find((room) => room.id === 'milhaud')?.capacity).toBe(seatCount);

    const standCount = (roomId: string) => {
      const room = venueLayout.rooms.find((candidate) => candidate.id === roomId);
      if (!room) throw new Error(`Missing source room: ${roomId}`);
      return venueLayout.fixtures.filter(
        (fixture) => fixture.kind === 'stand' && contains(room.polygon, fixture.polygon[0])
      ).length;
    };
    expect(standCount('forbin')).toBe(8);
    expect(standCount('sainte-victoire')).toBe(4);
    expect(standCount('picasso')).toBe(3);
  });
});
