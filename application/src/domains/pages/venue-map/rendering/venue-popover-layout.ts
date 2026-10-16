import type { ScreenBounds } from './venue-card-layout';

/** Keep room details beside their anchor and inside the visible viewport. */
export class VenuePopoverLayout {
  static place(
    anchor: ScreenBounds,
    size: { width: number; height: number },
    viewport: ScreenBounds,
    room?: ScreenBounds
  ): { left: number; top: number } {
    const gap = 12;
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const center = (anchor.left + anchor.right - size.width) / 2;
    const candidates = [
      { left: Math.max(anchor.right, room?.right ?? anchor.right) + gap, top: anchor.top },
      { left: Math.min(anchor.left, room?.left ?? anchor.left) - size.width - gap, top: anchor.top },
      { left: center, top: Math.min(anchor.top, room?.top ?? anchor.top) - size.height - gap },
      { left: center, top: Math.max(anchor.bottom, room?.bottom ?? anchor.bottom) + gap },
    ];
    const overlap = (left: number, top: number, bounds: ScreenBounds) =>
      Math.max(0, Math.min(left + size.width, bounds.right) - Math.max(left, bounds.left)) *
      Math.max(0, Math.min(top + size.height, bounds.bottom) - Math.max(top, bounds.top));
    return candidates
      .map((candidate) => {
        const left = clamp(candidate.left, viewport.left + gap, viewport.right - size.width - gap);
        const top = clamp(candidate.top, viewport.top + gap, viewport.bottom - size.height - gap);
        const score =
          overlap(left, top, anchor) * 100 +
          (room ? overlap(left, top, room) * 10 : 0) +
          Math.abs(left - candidate.left) +
          Math.abs(top - candidate.top);
        return { left, top, score };
      })
      .sort((a, b) => a.score - b.score)[0];
  }
}
