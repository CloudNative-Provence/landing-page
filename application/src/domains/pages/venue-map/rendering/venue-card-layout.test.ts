import { describe, expect, it } from 'vitest';

import { type CardRoom, VenueCardLayout } from './venue-card-layout';

const room = (id: string, left: number, top: number, right: number, bottom: number): CardRoom => ({
  id,
  center: { x: (left + right) / 2, y: (top + bottom) / 2 },
  x: (left + right) / 2,
  y: (top + bottom) / 2,
  bounds: { left, top, right, bottom },
  outline: [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ],
});

describe('room card placement', () => {
  it('keeps each card above its room and connects to the room centre', () => {
    const rooms = [room('amphitheatre', 100, 240, 360, 370), room('milhaud', 540, 310, 900, 570)];
    const cards = rooms.map(({ id }) => ({ id, width: 230, height: 150 }));
    const placed = VenueCardLayout.place(cards, rooms, 1100, 700);
    for (const card of placed) {
      const target = rooms.find(({ id }) => id === card.id)!;
      expect(card.left + 115).toBe(target.x);
      expect(card.top + 150).toBe(target.bounds.top - 12);
      expect(card.end).toEqual(target.center);
    }
    expect(placed[0].left).toBeLessThan(placed[1].left);
  });

  it('follows the room positions when the view changes, regardless of input order', () => {
    const cards = [
      { id: 'a', width: 200, height: 130 },
      { id: 'b', width: 200, height: 130 },
    ];
    const before = VenueCardLayout.place(
      cards,
      [room('a', 80, 220, 300, 400), room('b', 580, 280, 840, 490)],
      1000,
      700
    );
    const after = VenueCardLayout.place(
      cards,
      [room('a', 600, 310, 850, 500), room('b', 100, 230, 320, 420)],
      1000,
      700
    );
    expect(before.map(({ id }) => id)).toEqual(['a', 'b']);
    expect(after.map(({ id }) => id)).toEqual(['b', 'a']);
    expect(after.find(({ id }) => id === 'a')!.left).toBeGreaterThan(before[0].left);
  });

  it('keeps cards on screen and separate on mobile, without covering a neighboring room', () => {
    const rooms = [room('a', 15, 220, 150, 290), room('b', 130, 260, 300, 410)];
    const cards = rooms.map(({ id }) => ({ id, width: 146, height: 120 }));
    const placed = VenueCardLayout.place(cards, rooms, 320, 520);
    expect(placed[0].left).toBeGreaterThanOrEqual(6);
    expect(placed[0].left + 146 + 12).toBeLessThanOrEqual(placed[1].left);
    expect(placed[1].left + 146).toBeLessThanOrEqual(314);
    for (const card of placed) {
      for (const target of rooms) {
        const overlap =
          card.left < target.bounds.right &&
          card.left + 146 > target.bounds.left &&
          card.top < target.bounds.bottom &&
          card.top + 120 > target.bounds.top;
        expect(overlap).toBe(false);
      }
    }
  });

  it('uses the projected floor centre independently of the room label or slanted wall outline', () => {
    const target = room('a', 150, 230, 450, 420);
    target.outline = [
      { x: 150, y: 280 },
      { x: 400, y: 230 },
      { x: 450, y: 370 },
      { x: 200, y: 420 },
    ];
    target.center = { x: 300, y: 360 };
    const [card] = VenueCardLayout.place([{ id: 'a', width: 200, height: 130 }], [target], 700, 600);
    expect(card.end).toEqual(target.center);
    expect(card.end.y).not.toBe(target.y);
  });

  it('ignores cards without a projected room', () => {
    expect(VenueCardLayout.place([{ id: 'missing', width: 200, height: 130 }], [], 900, 600)).toEqual([]);
  });

  it('anchors the shared card beside the lower-right room edge and follows the map', () => {
    const card = { width: 200, height: 80 };
    const destinations = new Set(['forbin', 'picasso']);
    const rooms = [room('forbin', 500, 200, 680, 320), room('picasso', 180, 350, 380, 490)];
    const before = VenueCardLayout.placeShared(card, rooms, destinations, 1100, 700)!;
    expect(before.left).toBe(692);
    expect(before.top + card.height).toBe(490);
    expect(before.connectors.map(({ id }) => id)).toEqual(['forbin', 'picasso']);

    const moved = rooms.map((room) => ({
      ...room,
      center: { x: room.center.x + 30, y: room.center.y - 50 },
      outline: room.outline.map(({ x, y }) => ({ x: x + 30, y: y - 50 })),
    }));
    const after = VenueCardLayout.placeShared(card, moved, destinations, 1100, 700)!;
    expect(after.left - before.left).toBe(30);
    expect(after.top - before.top).toBe(-50);
    expect(after.connectors[0].end).toEqual(moved[0].center);
  });

  it('places the shared card just below the map on mobile, clear of neighboring rooms', () => {
    const rooms = [room('social', 180, 200, 370, 450), room('bar', 240, 440, 320, 490)];
    const card = { width: 200, height: 80 };
    const placement = VenueCardLayout.placeShared(card, rooms, new Set(['social']), 390, 750)!;
    expect(placement.left + card.width).toBe(370);
    expect(placement.top).toBe(502);
    expect(placement.connectors.map(({ id }) => id)).toEqual(['social']);
  });

  it('keeps a zoomed shared card within the available viewport above the controls', () => {
    const card = { width: 200, height: 80 };
    const placement = VenueCardLayout.placeShared(
      card,
      [room('social', 50, 200, 700, 900)],
      new Set(['social']),
      390,
      600
    )!;
    expect(placement.left).toBeGreaterThanOrEqual(6);
    expect(placement.left + card.width).toBeLessThanOrEqual(384);
    expect(placement.top + card.height).toBeLessThanOrEqual(594);
  });

  it('has no shared placement when none of the assigned rooms are visible', () => {
    expect(
      VenueCardLayout.placeShared(
        { width: 200, height: 80 },
        [room('other', 100, 200, 300, 400)],
        new Set(['social']),
        900,
        600
      )
    ).toBeNull();
  });

  it('connects a shared card to the centre of each assigned destination', () => {
    const card = { left: 760, top: 520, right: 980, bottom: 610 };
    const rooms = [room('forbin', 500, 200, 680, 320), room('picasso', 180, 350, 380, 490)];
    const connectors = VenueCardLayout.connect(card, rooms);
    expect(connectors).toEqual([
      { id: 'forbin', start: { x: 760, y: 520 }, end: { x: 590, y: 260 } },
      { id: 'picasso', start: { x: 760, y: 520 }, end: { x: 280, y: 420 } },
    ]);
    expect(VenueCardLayout.connect(card, [rooms[0]])).toHaveLength(1);
    expect(VenueCardLayout.connect(card, [])).toEqual([]);
  });

  it('follows rotated room outlines and starts on the closest side of the card', () => {
    const card = { left: 700, right: 900, top: 300, bottom: 400 };
    const target = {
      id: 'room',
      center: { x: 300, y: 300 },
      outline: [
        { x: 200, y: 150 },
        { x: 500, y: 250 },
        { x: 400, y: 450 },
        { x: 100, y: 350 },
      ],
    };
    const [connector] = VenueCardLayout.connect(card, [target]);
    expect(connector.start.x).toBe(card.left);
    expect(connector.start.y).toBeGreaterThanOrEqual(card.top);
    expect(connector.start.y).toBeLessThanOrEqual(card.bottom);
    expect(connector.end).toEqual(target.center);
    expect(VenueCardLayout.connect(card, [{ id: 'missing', outline: [], center: { x: 0, y: 0 } }])).toEqual([]);
  });

  it('finds the area centre of an irregular footprint regardless of vertex spacing or winding', () => {
    const outline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: 6 },
    ];
    expect(VenueCardLayout.center(outline)).toEqual({ x: 2, y: 2 });
    expect(VenueCardLayout.center([...outline].reverse())).toEqual({ x: 2, y: 2 });
    expect(VenueCardLayout.center([])).toEqual({ x: 0, y: 0 });
  });
});
