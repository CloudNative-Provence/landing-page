export class ProgramSelectionCodec {
  static serialize(ids: Iterable<string>): string {
    return [...new Set(ids)].sort().join(',');
  }

  static parse(value: string | null | undefined, validIds: readonly string[]): string[] {
    if (!value) {
      return [];
    }

    const validIdSet = new Set(validIds);
    return [
      ...new Set(
        value
          .split(',')
          .map((entry) => entry.trim())
          .filter((entry) => validIdSet.has(entry))
      ),
    ];
  }
}
