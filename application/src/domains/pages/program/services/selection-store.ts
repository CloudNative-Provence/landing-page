import { ProgramSelectionCodec } from './selection-codec';

export interface ProgramSelectionStoreOptions {
  validIds: readonly string[];
  canonicalIds?: ReadonlyMap<string, string>;
  storageKey?: string;
}

/** A small browser boundary, injectable for storage and synchronization tests. */
export interface ProgramSelectionBrowser
  extends Pick<EventTarget, 'addEventListener' | 'removeEventListener' | 'dispatchEvent'> {
  readonly localStorage: Pick<Storage, 'getItem' | 'setItem'>;
}

interface SelectionMemory {
  value: string | null;
  volatile: boolean;
}

const selectionChangedEvent = 'cnp:program-selection';
const browserMemory = new WeakMap<ProgramSelectionBrowser, Map<string, SelectionMemory>>();

/** Shared persistence for the programme and venue; storage failures retain this document's selection. */
export class ProgramSelectionStore {
  static readonly storageKey = 'cnp-program-selection';

  private readonly key: string;
  private readonly channel: EventTarget | ProgramSelectionBrowser;
  private readonly memory: Map<string, SelectionMemory>;

  constructor(
    private readonly options: ProgramSelectionStoreOptions,
    private readonly browser: ProgramSelectionBrowser | null = typeof window === 'undefined' ? null : window
  ) {
    this.key = options.storageKey ?? ProgramSelectionStore.storageKey;
    this.channel = browser ?? new EventTarget();
    this.memory = (browser && browserMemory.get(browser)) || new Map();
    if (browser) browserMemory.set(browser, this.memory);
  }

  getStoredValue(): string | null {
    const previous = this.memory.get(this.key);
    if (previous?.volatile) return previous.value;

    try {
      const value = this.browser?.localStorage.getItem(this.key) ?? null;
      this.memory.set(this.key, { value, volatile: false });
      return value;
    } catch {
      return previous?.value ?? null;
    }
  }

  getIds(): string[] {
    return this.normalize(this.getStoredValue());
  }

  setIds(ids: Iterable<string>): void {
    const value = ProgramSelectionCodec.serialize(this.normalize(ProgramSelectionCodec.serialize(ids)));
    const previous = this.getStoredValue();
    let volatile = !this.browser;
    try {
      this.browser?.localStorage.setItem(this.key, value);
    } catch {
      volatile = true;
    }
    this.memory.set(this.key, { value, volatile });

    if (value !== previous) {
      this.channel.dispatchEvent(new CustomEvent(selectionChangedEvent, { detail: { key: this.key, value } }));
    }
  }

  /** Subscribe without an initial emission; call getIds() for the initial render. */
  subscribe(listener: (ids: string[]) => void): () => void {
    const onDocumentChange = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: string }>).detail;
      if (detail?.key === this.key && typeof detail.value === 'string') listener(this.normalize(detail.value));
    };
    const onStorageChange = (event: Event) => {
      const change = event as StorageEvent;
      if (change.key !== null && change.key !== this.key) return;
      try {
        if (change.storageArea && change.storageArea !== this.browser?.localStorage) return;
      } catch {
        return;
      }
      const value = change.key === null ? null : change.newValue;
      this.memory.set(this.key, { value, volatile: false });
      listener(this.normalize(value));
    };

    this.channel.addEventListener(selectionChangedEvent, onDocumentChange);
    this.browser?.addEventListener('storage', onStorageChange);
    return () => {
      this.channel.removeEventListener(selectionChangedEvent, onDocumentChange);
      this.browser?.removeEventListener('storage', onStorageChange);
    };
  }

  private normalize(value: string | null): string[] {
    return [
      ...new Set(
        ProgramSelectionCodec.parse(value, this.options.validIds).map((id) => this.options.canonicalIds?.get(id) ?? id)
      ),
    ];
  }
}
