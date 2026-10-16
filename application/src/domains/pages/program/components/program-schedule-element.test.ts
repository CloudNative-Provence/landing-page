import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppClock } from '~/shared/time/app-clock';
import { createAstrowindConfigMock } from '~/test/mocks/astrowind-config';
import type { ProgramScheduleElement } from './program-schedule-element';

vi.mock('astrowind:config', () => createAstrowindConfigMock());

class TestElement extends EventTarget {
  dataset = {};
  isConnected = true;
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return null;
  }
}

class TestDialog extends EventTarget {
  open = false;
  returnValue = '';
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  }
}

let ScheduleElement: typeof ProgramScheduleElement;

beforeAll(async () => {
  vi.stubGlobal('HTMLElement', TestElement);
  vi.stubGlobal('customElements', { get: () => undefined, define: vi.fn() });
  ScheduleElement = (await import('./program-schedule-element')).ProgramScheduleElement;
});

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal(
    'window',
    Object.assign(new EventTarget(), {
      location: { href: 'https://example.test/program' },
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    })
  );
  vi.stubGlobal('document', new EventTarget());
});

afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('saved-session reminders', () => {
  it('enters and leaves the reminder window without live mode, clears on unsave, and releases its timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-10T08:54:59Z'));
    Object.assign(window, { setTimeout, clearTimeout });
    const element = new ScheduleElement();
    const classes = new Set<string>();
    const badge = {
      hidden: true,
      toggleAttribute: (_name: string, hidden: boolean) => {
        badge.hidden = hidden;
      },
    };
    const card = {
      dataset: { sessionId: 'talk', startsAt: '2026-12-10T09:00:00Z', endsAt: '2026-12-10T09:30:00Z' },
      classList: { toggle: (name: string, active: boolean) => (active ? classes.add(name) : classes.delete(name)) },
      querySelector: (selector: string) => (selector === '[data-session-starting-soon]' ? badge : null),
    } as unknown as HTMLElement;
    element.cards = [card];
    element.selectedIds.add('talk');
    vi.spyOn(element, 'handleFilters').mockImplementation(() => element.applySelectionState());
    element.applySelectionState();
    element.syncLiveRefreshTimer();
    expect(element.liveEnabled).toBe(false);
    expect(badge.hidden).toBe(true);

    vi.advanceTimersByTime(1_050);
    expect(classes.has('session-starting-soon')).toBe(true);
    expect(badge.hidden).toBe(false);

    element.selectedIds.clear();
    element.applySelectionState();
    expect(classes.has('session-starting-soon')).toBe(false);
    expect(badge.hidden).toBe(true);
    element.selectedIds.add('talk');
    element.applySelectionState();
    expect(badge.hidden).toBe(false);

    vi.advanceTimersByTime(5 * 60_000);
    expect(classes.has('session-starting-soon')).toBe(false);
    expect(badge.hidden).toBe(true);
    expect(classes.has('ring-2')).toBe(true);
    expect(vi.getTimerCount()).toBe(1);
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    element.syncLiveRefreshTimer();
    expect(vi.getTimerCount()).toBe(0);
    Object.defineProperty(document, 'hidden', { value: false });
    element.syncLiveRefreshTimer();
    expect(vi.getTimerCount()).toBe(1);
    element.disconnectedCallback();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('programme agenda lifecycle', () => {
  it('refreshes on clock changes and visibility resume, and removes both listeners on disconnect', async () => {
    const element = new ScheduleElement();
    vi.spyOn(element, 'loadSelection').mockResolvedValue(undefined);
    vi.spyOn(element, 'loadLiveState').mockImplementation(() => {});
    vi.spyOn(element, 'loadFullscreenState').mockImplementation(() => {});
    const live = vi.spyOn(element, 'applyLiveState').mockImplementation(() => {});
    const filter = vi.spyOn(element, 'handleFilters').mockImplementation(() => {});
    element.connectedCallback();
    await Promise.resolve();
    live.mockClear();
    filter.mockClear();

    window.dispatchEvent(new Event(AppClock.changeEvent));
    expect(live).toHaveBeenCalledTimes(1);
    expect(filter).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(live).toHaveBeenCalledTimes(2);
    expect(filter).toHaveBeenCalledTimes(2);
    element.disconnectedCallback();
    window.dispatchEvent(new Event(AppClock.changeEvent));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(live).toHaveBeenCalledTimes(2);
    expect(filter).toHaveBeenCalledTimes(2);
  });

  it('ignores an old initialization after reconnecting and releases the new storage subscription on disconnect', async () => {
    const element = new ScheduleElement();
    let finishFirst!: () => void;
    const pending = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    vi.spyOn(element, 'loadSelection').mockReturnValueOnce(pending).mockResolvedValue(undefined);
    const loadLive = vi.spyOn(element, 'loadLiveState').mockImplementation(() => {});
    vi.spyOn(element, 'loadFullscreenState').mockImplementation(() => {});
    vi.spyOn(element, 'applySelectionState').mockImplementation(() => {});
    vi.spyOn(element, 'applyLiveState').mockImplementation(() => {});
    const filter = vi.spyOn(element, 'handleFilters').mockImplementation(() => {});
    element.dataset.sessionIds = 'talk';

    element.connectedCallback();
    element.disconnectedCallback();
    element.connectedCallback();
    await Promise.resolve();
    expect(loadLive).toHaveBeenCalledTimes(1);

    finishFirst();
    await pending;
    expect(loadLive).toHaveBeenCalledTimes(1);
    element.selectionStore?.setIds(['talk']);
    expect(filter).toHaveBeenCalledTimes(2);
    element.disconnectedCallback();
    element.selectionStore?.setIds([]);
    expect(filter).toHaveBeenCalledTimes(2);
  });

  it('does not apply a stale agenda-conflict response after the connection changes', async () => {
    const element = new ScheduleElement();
    element.validIds = ['query-talk', 'saved-talk'];
    window.location.href = 'https://example.test/program?agenda=query-talk';
    let answer!: (useQuery: boolean) => void;
    vi.spyOn(element, 'promptSelectionConflict').mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          answer = resolve;
        })
    );
    const { ProgramSelectionStore } = await import('../services/selection-store');
    element.selectionStore = new ProgramSelectionStore({ validIds: element.validIds });
    element.selectionStore.setIds(['saved-talk']);
    const persist = vi.spyOn(element, 'persistSelection');

    const loading = element.loadSelection();
    element.disconnectedCallback();
    answer(true);
    await loading;

    expect(persist).not.toHaveBeenCalled();
    expect(element.selectionStore.getIds()).toEqual(['saved-talk']);
  });

  it('closes and resolves a pending conflict dialog on disconnect without leaving a close listener', async () => {
    const element = new ScheduleElement();
    const dialog = new TestDialog();
    element.selectionConflictDialog = dialog as unknown as HTMLDialogElement;
    const remove = vi.spyOn(dialog, 'removeEventListener');
    const response = element.promptSelectionConflict();
    expect(dialog.open).toBe(true);

    element.disconnectedCallback();

    expect(await response).toBe(false);
    expect(dialog.open).toBe(false);
    expect(remove).toHaveBeenCalledWith('close', expect.any(Function));
  });

  it('ignores a previously queued close event while a new conflict dialog is open', async () => {
    const element = new ScheduleElement();
    const dialog = new TestDialog();
    element.selectionConflictDialog = dialog as unknown as HTMLDialogElement;
    const resolved = vi.fn();
    const response = element.promptSelectionConflict().then(resolved);

    dialog.dispatchEvent(new Event('close'));
    await Promise.resolve();
    expect(resolved).not.toHaveBeenCalled();
    dialog.returnValue = 'query';
    dialog.close();
    await response;
    expect(resolved).toHaveBeenCalledExactlyOnceWith(true);
  });
});
