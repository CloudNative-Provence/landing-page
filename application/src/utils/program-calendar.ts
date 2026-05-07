export interface ProgramCalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
}

export class ProgramCalendarExporter {
  private static readonly encoder = new TextEncoder();

  private static readonly lineByteLimit = 75;

  static build(events: readonly ProgramCalendarEvent[], generatedAt: Date = new Date()): string {
    const generatedAtValue = this.formatDate(generatedAt.toISOString());
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cloud Native Provence//Program Planner//EN',
      'CALSCALE:GREGORIAN',
      ...events.flatMap((event) => this.buildEventLines(event, generatedAtValue)),
      'END:VCALENDAR',
    ];

    return lines.flatMap((line) => this.foldLine(line)).join('\r\n');
  }

  private static buildEventLines(event: ProgramCalendarEvent, generatedAtValue: string): string[] {
    return [
      'BEGIN:VEVENT',
      `UID:${event.id}@cloudnative-provence.fr`,
      `DTSTAMP:${generatedAtValue}`,
      `DTSTART:${this.formatDate(event.startsAt)}`,
      `DTEND:${this.formatDate(event.endsAt)}`,
      `SUMMARY:${this.escapeText(event.title)}`,
      `DESCRIPTION:${this.escapeText(event.description)}`,
      `LOCATION:${this.escapeText(event.location)}`,
      'END:VEVENT',
    ];
  }

  private static formatDate(value: string): string {
    return new Date(value)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  }

  private static escapeText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  private static foldLine(line: string): string[] {
    const chunks: string[] = [];
    let currentLine = '';

    for (const character of line) {
      const nextLine = `${currentLine}${character}`;
      if (this.encoder.encode(nextLine).length <= this.lineByteLimit) {
        currentLine = nextLine;
        continue;
      }

      if (currentLine) {
        chunks.push(currentLine);
      }

      currentLine = ` ${character}`;
    }

    if (currentLine) {
      chunks.push(currentLine);
    }

    return chunks;
  }
}
