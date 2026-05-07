import { describe, expect, it } from 'vitest';

import { ProgramCalendarExporter } from './program-calendar';

describe('ProgramCalendarExporter', () => {
  it('builds an ICS payload with folded lines', () => {
    const calendar = ProgramCalendarExporter.build(
      [
        {
          id: 'opening-keynote',
          title: 'Opening keynote that intentionally exceeds the calendar line length once serialized for export',
          description:
            'Line one, with commas; line two includes enough details to force the exported DESCRIPTION line to wrap correctly.',
          location: 'Grand Auditorium',
          startsAt: '2026-12-10T09:00:00+01:00',
          endsAt: '2026-12-10T09:40:00+01:00',
        },
      ],
      new Date('2026-01-01T10:00:00Z')
    );

    const lines = calendar.split('\r\n');

    expect(calendar).toContain('BEGIN:VCALENDAR');
    expect(calendar).toContain('UID:opening-keynote@cloudnative-provence.fr');
    expect(calendar).toContain('DTSTAMP:20260101T100000Z');
    expect(lines.some((line) => line.startsWith(' '))).toBe(true);
    expect(lines.every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(calendar).toContain('DESCRIPTION:Line one\\, with commas\\; line two includes enough details');
  });
});
