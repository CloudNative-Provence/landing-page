export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ScreenBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface CardRoom extends ScreenPoint {
  id: string;
  center: ScreenPoint;
  bounds: ScreenBounds;
  outline: readonly ScreenPoint[];
}

interface RoomCard {
  id: string;
  width: number;
  height: number;
}

/** Place callouts against room edges, keeping them clear of every projected room. */
export class VenueCardLayout {
  /** Area centroid; unlike a vertex average, extra points on a wall do not move it. */
  static center(outline: readonly ScreenPoint[]): ScreenPoint {
    let area = 0;
    let x = 0;
    let y = 0;
    for (let index = 0; index < outline.length; index++) {
      const a = outline[index];
      const b = outline[(index + 1) % outline.length];
      const cross = a.x * b.y - b.x * a.y;
      area += cross;
      x += (a.x + b.x) * cross;
      y += (a.y + b.y) * cross;
    }
    if (Math.abs(area) < 1e-8) return outline[0] ?? { x: 0, y: 0 };
    return { x: x / (3 * area), y: y / (3 * area) };
  }

  /** Keep a shared card against the lower-right edge of its rooms, below them on narrow screens. */
  static placeShared(
    card: Pick<RoomCard, 'width' | 'height'>,
    rooms: readonly Pick<CardRoom, 'id' | 'outline' | 'center'>[],
    destinationIds: ReadonlySet<string>,
    width: number,
    height: number
  ) {
    const gap = 12;
    const margin = 6;
    const clamp = (value: number, max: number) => Math.max(margin, Math.min(max - margin, value));
    const bounds = rooms
      .filter((room) => room.outline.length > 1)
      .map((room) => ({
        ...room,
        left: Math.min(...room.outline.map((point) => point.x)),
        right: Math.max(...room.outline.map((point) => point.x)),
        top: Math.min(...room.outline.map((point) => point.y)),
        bottom: Math.max(...room.outline.map((point) => point.y)),
      }));
    const destinations = bounds.filter((room) => destinationIds.has(room.id));
    if (!destinations.length) return null;
    const right = Math.max(...destinations.map((room) => room.right));
    const bottom = Math.max(...destinations.map((room) => room.bottom));
    let left = right + gap;
    let top = clamp(bottom - card.height, height - card.height);
    const overlaps = bounds.some(
      (room) =>
        left < room.right + gap &&
        left + card.width > room.left - gap &&
        top < room.bottom + gap &&
        top + card.height > room.top - gap
    );
    if (left + card.width > width - margin || left < margin || overlaps) {
      left = clamp(right - card.width, width - card.width);
      const floor = Math.max(
        bottom,
        ...bounds
          .filter((room) => room.right > left - gap && room.left < left + card.width + gap)
          .map((room) => room.bottom)
      );
      top = clamp(floor + gap, height - card.height);
    }
    return {
      left,
      top,
      connectors: this.connect({ left, top, right: left + card.width, bottom: top + card.height }, destinations),
    };
  }

  /** Connect the card perimeter to the projected floor centre of each destination. */
  static connect(card: ScreenBounds, rooms: readonly Pick<CardRoom, 'id' | 'outline' | 'center'>[]) {
    const outline = [
      { x: card.left, y: card.top },
      { x: card.right, y: card.top },
      { x: card.right, y: card.bottom },
      { x: card.left, y: card.bottom },
    ];
    return rooms
      .filter((room) => room.outline.length > 1)
      .map((room) => {
        const end = room.center;
        return { id: room.id, start: this.closestEdgePoint(end, outline), end };
      });
  }

  static place(cards: readonly RoomCard[], rooms: readonly CardRoom[], width: number, height: number) {
    const gap = 12;
    const margin = 6;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const placed = cards
      .flatMap((card) => {
        const room = rooms.find((item) => item.id === card.id);
        return room
          ? [{ ...card, room, left: clamp(room.x - card.width / 2, margin, width - card.width - margin) }]
          : [];
      })
      .sort((a, b) => a.room.x - b.room.x);

    // Resolve horizontal collisions in visual order, including narrow mobile screens.
    for (let index = 1; index < placed.length; index++) {
      const previous = placed[index - 1];
      placed[index].left = Math.max(placed[index].left, previous.left + previous.width + gap);
    }
    for (let index = placed.length - 1; index >= 0; index--) {
      const next = placed[index + 1];
      const limit = next ? next.left - gap : width - margin;
      placed[index].left = Math.max(margin, Math.min(placed[index].left, limit - placed[index].width));
    }

    return placed.map((card) => {
      const ceiling = Math.min(
        card.room.bounds.top,
        ...rooms
          .filter((room) => room.bounds.right > card.left - gap && room.bounds.left < card.left + card.width + gap)
          .map((room) => room.bounds.top)
      );
      const top = clamp(ceiling - card.height - gap, margin, height - card.height - margin);
      const start = { x: card.left + card.width / 2, y: top + card.height };
      const end = card.room.center;
      return { id: card.id, left: card.left, top, start, end };
    });
  }

  private static closestEdgePoint(point: ScreenPoint, outline: readonly ScreenPoint[]): ScreenPoint {
    let nearest = outline[0] ?? point;
    let distance = Infinity;
    for (let index = 0; index < outline.length; index++) {
      const a = outline[index];
      const b = outline[(index + 1) % outline.length];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = dx * dx + dy * dy;
      const t = length ? Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length)) : 0;
      const candidate = { x: a.x + t * dx, y: a.y + t * dy };
      const squaredDistance = (candidate.x - point.x) ** 2 + (candidate.y - point.y) ** 2;
      if (squaredDistance < distance) {
        nearest = candidate;
        distance = squaredDistance;
      }
    }
    return nearest;
  }
}
