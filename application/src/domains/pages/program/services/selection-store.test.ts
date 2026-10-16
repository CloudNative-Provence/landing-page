import { describe, expect, it, vi } from 'vitest';

import { ProgramSelectionCodec } from './selection-codec';
import { type ProgramSelectionBrowser, ProgramSelectionStore } from './selection-store';

class TestBrowser extends EventTarget implements ProgramSelectionBrowser {
  values = new Map<string, string>();
  denyRead = false;
  denyWrite = false;
  localStorage = {
    getItem: (key: string): string | null => {
      if (this.denyRead) throw new Error('Storage access denied');
      return this.values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (this.denyWrite) throw new Error('Storage quota exceeded');
      this.values.set(key, value);
    },
  };

  receiveStorage(key: string | null, newValue: string | null) {
    if (key === null) this.values.clear();
    else if (newValue === null) this.values.delete(key);
    else this.values.set(key, newValue);
    this.dispatchEvent(Object.assign(new Event('storage'), { key, newValue, storageArea: this.localStorage }));
  }
}

const options = {
  validIds: ['talk', 'a-break', 'b-break'],
  canonicalIds: new Map([
    ['a-break', 'a-break'],
    ['b-break', 'a-break'],
  ]),
};

describe('ProgramSelectionStore', () => {
  it('reads existing and compressed selections, removes unknown ids and canonicalizes shared sessions', () => {
    const browser = new TestBrowser();
    const store = new ProgramSelectionStore(options, browser);
    browser.values.set(ProgramSelectionStore.storageKey, 'b-break,a-break,deleted,talk');
    expect(store.getIds()).toEqual(['a-break', 'talk']);
    browser.values.set(ProgramSelectionStore.storageKey, ProgramSelectionCodec.encode(['b-break'], options.validIds));
    expect(store.getIds()).toEqual(['a-break']);
    store.setIds(['b-break', 'a-break', 'talk', 'deleted']);
    expect(browser.values.get('cnp-program-selection')).toBe('a-break,talk');
  });

  it('synchronizes instances in the same document and removes listeners when unsubscribed', () => {
    const browser = new TestBrowser();
    const programme = new ProgramSelectionStore(options, browser);
    const venue = new ProgramSelectionStore(options, browser);
    const onChange = vi.fn();
    const unsubscribe = programme.subscribe(onChange);

    venue.setIds(['talk']);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(['talk']);
    expect(programme.getIds()).toEqual(['talk']);
    venue.setIds(['talk']);
    expect(onChange).toHaveBeenCalledTimes(1);

    unsubscribe();
    venue.setIds([]);
    browser.receiveStorage('cnp-program-selection', 'b-break');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('responds to cross-tab changes, removal and clear while ignoring unrelated storage', () => {
    const browser = new TestBrowser();
    const store = new ProgramSelectionStore(options, browser);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);

    browser.receiveStorage('another-key', 'talk');
    expect(onChange).not.toHaveBeenCalled();
    browser.dispatchEvent(
      Object.assign(new Event('storage'), { key: 'cnp-program-selection', newValue: 'talk', storageArea: {} })
    );
    expect(onChange).not.toHaveBeenCalled();
    browser.receiveStorage('cnp-program-selection', 'b-break');
    expect(onChange).toHaveBeenLastCalledWith(['a-break']);
    browser.receiveStorage('cnp-program-selection', null);
    expect(onChange).toHaveBeenLastCalledWith([]);
    browser.receiveStorage(null, null);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(onChange).toHaveBeenCalledTimes(3);
    unsubscribe();
  });

  it('keeps selections usable and shared in memory when reading or writing storage is blocked', () => {
    const browser = new TestBrowser();
    browser.denyRead = true;
    browser.denyWrite = true;
    const programme = new ProgramSelectionStore(options, browser);
    const venue = new ProgramSelectionStore(options, browser);
    const onChange = vi.fn();
    const unsubscribe = venue.subscribe(onChange);

    expect(programme.getIds()).toEqual([]);
    programme.setIds(['talk']);
    expect(programme.getIds()).toEqual(['talk']);
    expect(venue.getIds()).toEqual(['talk']);
    expect(onChange).toHaveBeenCalledWith(['talk']);
    unsubscribe();
  });

  it('does not overwrite a failed write with an older readable storage value', () => {
    const browser = new TestBrowser();
    browser.values.set('cnp-program-selection', 'a-break');
    browser.denyWrite = true;
    const store = new ProgramSelectionStore(options, browser);

    store.setIds(['talk']);
    expect(store.getIds()).toEqual(['talk']);
    browser.denyWrite = false;
    store.setIds(['talk']);
    expect(browser.values.get('cnp-program-selection')).toBe('talk');
  });

  it('handles browsers that throw when the localStorage property itself is accessed', () => {
    const browser = new TestBrowser();
    Object.defineProperty(browser, 'localStorage', {
      get() {
        throw new Error('SecurityError');
      },
    });
    const store = new ProgramSelectionStore(options, browser);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);
    store.setIds(['talk']);
    expect(store.getIds()).toEqual(['talk']);
    expect(onChange).toHaveBeenCalledWith(['talk']);
    unsubscribe();
  });

  it('can be constructed without browser globals and isolates server instances', () => {
    const store = new ProgramSelectionStore(options, null);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);
    store.setIds(['talk']);
    expect(store.getIds()).toEqual(['talk']);
    expect(onChange).toHaveBeenCalledWith(['talk']);
    expect(new ProgramSelectionStore(options, null).getIds()).toEqual([]);
    unsubscribe();
  });
});
