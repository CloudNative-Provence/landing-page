export class ProgramFullscreenView {
  static readonly fullscreenParam = 'fullscreen';

  static isEnabled(value: string | null | undefined): boolean {
    return value === 'true';
  }

  static updateUrl(url: URL, fullscreenEnabled: boolean): URL {
    const next = new URL(url.toString());

    if (fullscreenEnabled) {
      next.searchParams.set(this.fullscreenParam, 'true');
    } else {
      next.searchParams.delete(this.fullscreenParam);
    }

    return next;
  }
}
