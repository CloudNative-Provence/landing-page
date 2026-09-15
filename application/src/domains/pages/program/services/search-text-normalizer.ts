import type { ProgramSession } from '../model/schedule';

export class ProgramSearchTextNormalizer {
  static normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  static compose(values: Iterable<string | null | undefined>): string {
    return this.normalize(
      [...values]
        .map((value) => value?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
    );
  }

  static fromSession(session: ProgramSession, roomLabels: ReadonlyMap<string, string>): string {
    return this.compose([
      session.title,
      session.description,
      session.format,
      ...(session.speakers ?? []).flatMap((speaker) => [speaker.name, speaker.company]),
      ...(session.tags ?? []),
      ...(session.roomId ? [roomLabels.get(session.roomId) ?? ''] : []),
    ]);
  }
}
