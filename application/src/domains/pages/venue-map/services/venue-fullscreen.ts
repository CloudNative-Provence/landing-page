import { FullscreenView } from '~/shared/url/fullscreen-view';

type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => void };
type FullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

/** Keeps the map's presentation layout usable when native fullscreen is unavailable or denied. */
export class VenueFullscreen {
  private readonly events = new AbortController();
  private gesture: AbortController | null = null;
  private active = false;
  private native = false;
  private disposed = false;

  constructor(
    private readonly element: FullscreenElement,
    private readonly onChange: (active: boolean) => void
  ) {
    const { signal } = this.events;
    document.addEventListener('fullscreenchange', this.onNativeChange, { signal });
    document.addEventListener('webkitfullscreenchange', this.onNativeChange, { signal });
    document.addEventListener('keydown', this.onKeydown, { signal });
    window.addEventListener('popstate', this.loadUrl, { signal });
    this.loadUrl();
  }

  toggle() {
    this.disarmGesture();
    if (this.active) void this.exit();
    else {
      this.setActive(true);
      void this.requestNative();
    }
  }

  dispose() {
    this.disposed = true;
    this.events.abort();
    this.disarmGesture();
    this.active = false;
    this.element.removeAttribute('data-fullscreen');
    if (this.fullscreenElement === this.element) void this.exitNative();
  }

  private get fullscreenElement() {
    const doc = document as FullscreenDocument;
    return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  }

  private get supported() {
    const doc = document as FullscreenDocument;
    return Boolean(
      (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) &&
        (this.element.requestFullscreen || this.element.webkitRequestFullscreen)
    );
  }

  private setActive(active: boolean, updateUrl = true) {
    if (this.disposed) return;
    this.active = active;
    this.element.dataset.fullscreen = String(active);
    if (updateUrl) {
      const url = FullscreenView.updateUrl(new URL(window.location.href), active);
      window.history.replaceState(window.history.state, '', url);
    }
    this.onChange(active);
  }

  private loadUrl = () => {
    this.disarmGesture();
    const enabled = FullscreenView.isEnabled(
      new URL(window.location.href).searchParams.get(FullscreenView.fullscreenParam)
    );
    if (!enabled) {
      void this.exit(false);
      return;
    }
    this.setActive(true, false);
    if (this.supported && this.fullscreenElement !== this.element) {
      this.gesture = new AbortController();
      const { signal } = this.gesture;
      this.element.addEventListener('pointerdown', this.onGesture, { signal });
      this.element.addEventListener('keydown', this.onGesture, { signal });
    }
  };

  private disarmGesture() {
    this.gesture?.abort();
    this.gesture = null;
  }

  private onGesture = (event: Event) => {
    // Exiting a URL-opened presentation must never trigger a pending fullscreen request.
    if (event instanceof KeyboardEvent && (event.key === 'Escape' || event.key === 'Tab')) return;
    if (event.target instanceof Element && event.target.closest('[data-action="fullscreen"]')) return;
    this.disarmGesture();
    if (this.active) void this.requestNative();
  };

  private async requestNative() {
    if (!this.supported || this.fullscreenElement === this.element) return;
    try {
      if (this.element.requestFullscreen) await this.element.requestFullscreen();
      else this.element.webkitRequestFullscreen?.();
    } catch {
      // Retain the full-window layout if the browser rejects its native fullscreen request.
    }
    if ((!this.active || this.disposed) && this.fullscreenElement === this.element) await this.exitNative();
  }

  private async exitNative() {
    const doc = document as FullscreenDocument;
    try {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else doc.webkitExitFullscreen?.();
    } catch {
      if (this.fullscreenElement === this.element) this.setActive(true);
    }
  }

  private async exit(updateUrl = true) {
    this.disarmGesture();
    this.setActive(false, updateUrl);
    if (this.fullscreenElement === this.element) await this.exitNative();
  }

  private onNativeChange = (event: Event) => {
    if (this.fullscreenElement === this.element) {
      if (!this.active) {
        void this.exitNative();
        return;
      }
      this.native = true;
      this.setActive(true);
    } else if (this.native || event.target === this.element) {
      this.native = false;
      this.disarmGesture();
      this.setActive(false);
    }
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !this.active) return;
    event.preventDefault();
    void this.exit();
    this.element.querySelector<HTMLElement>('[data-action="fullscreen"]')?.focus({ preventScroll: true });
  };
}
