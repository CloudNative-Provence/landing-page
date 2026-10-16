import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VenueFullscreen } from './venue-fullscreen';

class TestElement extends EventTarget {
  dataset: Record<string, string> = {};
  requestFullscreen = vi.fn<() => Promise<void>>();
  focus = vi.fn();
  closest() {
    return null;
  }
  querySelector() {
    return { focus: this.focus };
  }
  removeAttribute(name: string) {
    if (name === 'data-fullscreen') delete this.dataset.fullscreen;
  }
}
class TestKeyboardEvent extends Event {
  constructor(readonly key: string) {
    super('keydown', { cancelable: true });
  }
}

let element: TestElement;
let doc: EventTarget & {
  fullscreenEnabled: boolean;
  fullscreenElement: TestElement | null;
  exitFullscreen: ReturnType<typeof vi.fn>;
};
let win: EventTarget & {
  location: { href: string };
  history: { state: object; replaceState: ReturnType<typeof vi.fn> };
};
let controller: VenueFullscreen;
let changed: ReturnType<typeof vi.fn<(active: boolean) => void>>;
const baseUrl = 'https://example.test/fr/plan-du-lieu?room=milhaud#sessions';
const start = () => {
  controller = new VenueFullscreen(element as unknown as HTMLElement, changed);
};
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

beforeEach(() => {
  element = new TestElement();
  changed = vi.fn<(active: boolean) => void>();
  doc = Object.assign(new EventTarget(), {
    fullscreenEnabled: false,
    fullscreenElement: null as TestElement | null,
    exitFullscreen: vi.fn(async () => {
      doc.fullscreenElement = null;
      doc.dispatchEvent(new Event('fullscreenchange'));
    }),
  });
  win = Object.assign(new EventTarget(), {
    location: { href: baseUrl },
    history: {
      state: { preserved: true },
      replaceState: vi.fn((_state, _unused, url) => {
        win.location.href = url.toString();
      }),
    },
  });
  element.requestFullscreen.mockImplementation(async () => {
    doc.fullscreenElement = element;
    doc.dispatchEvent(new Event('fullscreenchange'));
  });
  vi.stubGlobal('window', win);
  vi.stubGlobal('document', doc);
  vi.stubGlobal('Element', TestElement);
  vi.stubGlobal('KeyboardEvent', TestKeyboardEvent);
});

afterEach(() => {
  controller?.dispose();
  vi.unstubAllGlobals();
});

describe('venue fullscreen', () => {
  it('toggles the fallback layout and URL while preserving other URL and history state', () => {
    start();
    controller.toggle();
    expect(element.dataset.fullscreen).toBe('true');
    expect(win.location.href).toBe('https://example.test/fr/plan-du-lieu?room=milhaud&fullscreen=true#sessions');
    expect(win.history.replaceState).toHaveBeenLastCalledWith(win.history.state, '', expect.any(URL));
    expect(element.requestFullscreen).not.toHaveBeenCalled();
    controller.toggle();
    expect(element.dataset.fullscreen).toBe('false');
    expect(win.location.href).toBe(baseUrl);
  });

  it('opens URL presentation immediately and waits for a map gesture before requesting native fullscreen', async () => {
    win.location.href = `${baseUrl.split('#')[0]}&fullscreen=true`;
    doc.fullscreenEnabled = true;
    start();
    expect(element.dataset.fullscreen).toBe('true');
    expect(element.requestFullscreen).not.toHaveBeenCalled();
    element.dispatchEvent(new Event('pointerdown'));
    await settle();
    expect(doc.fullscreenElement).toBe(element);
    expect(element.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('disarms URL auto-entry when the user exits before interacting', () => {
    win.location.href = `${baseUrl.split('#')[0]}&fullscreen=true`;
    doc.fullscreenEnabled = true;
    start();
    controller.toggle();
    element.dispatchEvent(new Event('pointerdown'));
    expect(element.requestFullscreen).not.toHaveBeenCalled();
    expect(element.dataset.fullscreen).toBe('false');
  });

  it('keeps the presentation usable when a browser request is rejected', async () => {
    doc.fullscreenEnabled = true;
    element.requestFullscreen.mockRejectedValue(new Error('Denied'));
    start();
    controller.toggle();
    await settle();
    expect(element.dataset.fullscreen).toBe('true');
    expect(new URL(win.location.href).searchParams.get('fullscreen')).toBe('true');
    controller.toggle();
    expect(win.location.href).toBe(baseUrl);
  });

  it('synchronizes browser-native exit with the layout and URL', async () => {
    doc.fullscreenEnabled = true;
    start();
    controller.toggle();
    await settle();
    expect(doc.fullscreenElement).toBe(element);
    doc.fullscreenElement = null;
    doc.dispatchEvent(new Event('fullscreenchange'));
    expect(element.dataset.fullscreen).toBe('false');
    expect(win.location.href).toBe(baseUrl);
  });

  it('lets an open popover consume Escape before exiting the presentation', () => {
    start();
    controller.toggle();
    const handled = new TestKeyboardEvent('Escape');
    handled.preventDefault();
    doc.dispatchEvent(handled);
    expect(element.dataset.fullscreen).toBe('true');
    doc.dispatchEvent(new TestKeyboardEvent('Escape'));
    expect(element.dataset.fullscreen).toBe('false');
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('handles native exit before the queued entry notification is delivered', async () => {
    doc.fullscreenEnabled = true;
    element.requestFullscreen.mockImplementation(async () => {
      doc.fullscreenElement = element;
    });
    start();
    controller.toggle();
    await settle();
    doc.fullscreenElement = null;
    const notification = new Event('fullscreenchange');
    Object.defineProperty(notification, 'target', { value: element });
    doc.dispatchEvent(notification);
    expect(element.dataset.fullscreen).toBe('false');
    expect(win.location.href).toBe(baseUrl);
  });

  it('follows history navigation without requiring a reload', () => {
    start();
    win.location.href = `${baseUrl.split('#')[0]}&fullscreen=true`;
    win.dispatchEvent(new Event('popstate'));
    expect(element.dataset.fullscreen).toBe('true');
    win.location.href = baseUrl;
    win.dispatchEvent(new Event('popstate'));
    expect(element.dataset.fullscreen).toBe('false');
  });

  it('releases listeners and exits a late native request after disposal', async () => {
    doc.fullscreenEnabled = true;
    let finish!: () => void;
    element.requestFullscreen.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = () => {
            doc.fullscreenElement = element;
            resolve();
          };
        })
    );
    start();
    controller.toggle();
    controller.dispose();
    changed.mockClear();
    finish();
    await settle();
    expect(doc.exitFullscreen).toHaveBeenCalled();
    doc.dispatchEvent(new Event('fullscreenchange'));
    win.dispatchEvent(new Event('popstate'));
    expect(changed).not.toHaveBeenCalled();
    expect(element.dataset.fullscreen).toBeUndefined();
  });
});
