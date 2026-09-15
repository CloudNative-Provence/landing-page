import { describe, expect, it } from 'vitest';

import { buildProgramTimelineLayout } from './timeline-layout';

const at = (time: string) => `2026-12-10T${time}:00+01:00`;

function span(layout: ReturnType<typeof buildProgramTimelineLayout>, start: string, end: string) {
  return [layout.lines.get(Date.parse(start)), layout.lines.get(Date.parse(end))];
}

describe('room timeline alignment', () => {
  it('gives matching time ranges the same grid lines, including equivalent offsets', () => {
    const slots = [
      { startsAt: at('09:00'), endsAt: at('09:30') },
      { startsAt: '2026-12-10T08:00:00Z', endsAt: '2026-12-10T08:30:00Z' },
    ];
    const layout = buildProgramTimelineLayout(slots);
    expect(layout.rowCount).toBe(1);
    expect(span(layout, slots[0].startsAt, slots[0].endsAt)).toEqual(span(layout, slots[1].startsAt, slots[1].endsAt));
  });

  it('spans the two shorter talks with one long talk and aligns the following start', () => {
    const layout = buildProgramTimelineLayout([
      { startsAt: at('11:45'), endsAt: at('12:15') },
      { startsAt: at('11:50'), endsAt: at('12:00') },
      { startsAt: at('12:05'), endsAt: at('12:15') },
      { startsAt: at('12:15'), endsAt: at('13:30') },
    ]);
    expect(span(layout, at('11:45'), at('12:15'))).toEqual([1, 5]);
    expect(span(layout, at('11:50'), at('12:00'))).toEqual([2, 3]);
    expect(span(layout, at('12:05'), at('12:15'))).toEqual([4, 5]);
    expect(span(layout, at('12:15'), at('13:30'))).toEqual([5, 6]);
  });

  it('compacts the layout when filtering removes earlier or overlapping sessions', () => {
    const selectedSlot = { startsAt: at('11:45'), endsAt: at('12:15') };
    const layout = buildProgramTimelineLayout([selectedSlot]);
    expect(layout.rowCount).toBe(1);
    expect(span(layout, selectedSlot.startsAt, selectedSlot.endsAt)).toEqual([1, 2]);
  });

  it('orders boundaries independently of room order without mutating the source', () => {
    const slots = [
      { startsAt: at('11:50'), endsAt: at('12:00') },
      { startsAt: at('11:45'), endsAt: at('12:15') },
    ];
    const original = structuredClone(slots);
    expect(buildProgramTimelineLayout(slots)).toEqual(buildProgramTimelineLayout([...slots].reverse()));
    expect(slots).toEqual(original);
  });

  it('keeps an empty filtered layout valid for CSS grid', () => {
    expect(buildProgramTimelineLayout([])).toEqual({ rowCount: 1, lines: new Map() });
  });
});
