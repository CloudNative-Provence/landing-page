import type { ProgramSlot } from '../model/schedule';

export interface ProgramTimelineLayout {
  rowCount: number;
  lines: ReadonlyMap<number, number>;
}

/** Shared time boundaries let longer sessions span shorter sessions in another room. */
export function buildProgramTimelineLayout(
  slots: readonly Pick<ProgramSlot, 'startsAt' | 'endsAt'>[]
): ProgramTimelineLayout {
  const boundaries = [...new Set(slots.flatMap((slot) => [Date.parse(slot.startsAt), Date.parse(slot.endsAt)]))].sort(
    (left, right) => left - right
  );

  return {
    rowCount: Math.max(boundaries.length - 1, 1),
    lines: new Map(boundaries.map((time, index) => [time, index + 1])),
  };
}
