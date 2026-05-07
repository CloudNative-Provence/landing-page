import type { ProgramSession } from './program';

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

  static fromSession(
    session: ProgramSession,
    trackLabels: ReadonlyMap<string, string>,
    roomLabels: ReadonlyMap<string, string>
  ): string {
    return this.compose([
      session.title,
      session.description,
      session.format,
      ...(session.speakers ?? []),
      ...(session.tags ?? []),
      ...session.trackIds.map((trackId) => trackLabels.get(trackId) ?? ''),
      ...session.roomIds.map((roomId) => roomLabels.get(roomId) ?? ''),
    ]);
  }
}
