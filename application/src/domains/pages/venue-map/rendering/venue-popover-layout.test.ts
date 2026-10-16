import { describe, expect, it } from 'vitest';
import { VenuePopoverLayout } from './venue-popover-layout';

const viewport = { left: 0, top: 0, right: 1200, bottom: 900 };
const size = { width: 340, height: 480 };

describe('venue popover placement', () => {
  it('stays beside the selected room card without covering the card or room', () => {
    const anchor = { left: 120, right: 350, top: 240, bottom: 360 };
    const room = { left: 80, right: 400, top: 380, bottom: 580 };
    const placed = VenuePopoverLayout.place(anchor, size, viewport, room);
    expect(placed.left).toBeGreaterThanOrEqual(room.right);
    expect(placed.top).toBeGreaterThanOrEqual(12);
  });

  it('flips to the left when the anchor is near the right screen edge', () => {
    const anchor = { left: 940, right: 1170, top: 200, bottom: 330 };
    const placed = VenuePopoverLayout.place(anchor, size, viewport);
    expect(placed.left + size.width).toBe(anchor.left - 12);
    expect(placed.top).toBe(anchor.top);
  });

  it('fits below the trigger on a narrow screen without horizontal overflow', () => {
    const mobile = { left: 0, top: 0, right: 390, bottom: 844 };
    const anchor = { left: 12, right: 185, top: 170, bottom: 290 };
    const placed = VenuePopoverLayout.place(anchor, size, mobile);
    expect(placed.left).toBeGreaterThanOrEqual(12);
    expect(placed.left + size.width).toBeLessThanOrEqual(378);
    expect(placed.top).toBe(anchor.bottom + 12);
    expect(placed.top + size.height).toBeLessThanOrEqual(832);
  });

  it('opens above a bottom agenda trigger and respects an offset visual viewport', () => {
    const anchor = { left: 500, right: 620, top: 790, bottom: 830 };
    const visible = { left: 200, top: 400, right: 800, bottom: 844 };
    const compact = { width: 340, height: 300 };
    const placed = VenuePopoverLayout.place(anchor, compact, visible);
    expect(placed.top + compact.height).toBeLessThanOrEqual(anchor.top - 12);
    expect(placed.left).toBeGreaterThanOrEqual(visible.left + 12);
    expect(placed.left + compact.width).toBeLessThanOrEqual(visible.right - 12);
  });
});
