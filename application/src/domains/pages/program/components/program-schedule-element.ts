import { type ProgramCalendarEvent, ProgramCalendarExporter } from '~/domains/pages/program/services/calendar-exporter';
import { ProgramLiveView } from '~/domains/pages/program/services/live-view';
import { ProgramSearchTextNormalizer } from '~/domains/pages/program/services/search-text-normalizer';
import { ProgramSelectionCodec } from '~/domains/pages/program/services/selection-codec';
import { ProgramSelectionSourceResolver } from '~/domains/pages/program/services/selection-source-resolver';
import { ProgramSelectionStore } from '~/domains/pages/program/services/selection-store';
import { ProgramSessionReminder } from '~/domains/pages/program/services/session-reminder';
import { buildProgramTimelineLayout } from '~/domains/pages/program/services/timeline-layout';
import { AppClock } from '~/shared/time/app-clock';
import { FullscreenView } from '~/shared/url/fullscreen-view';

// Safari (iOS and older desktop) still exposes the Fullscreen API under a webkit prefix.
type WebkitFullscreenDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};

type WebkitFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};

export class ProgramScheduleElement extends HTMLElement {
  storageKey = 'cnp-program-selection';
  validIds: string[] = [];
  selectedIds = new Set<string>();
  cards: HTMLElement[] = [];
  slots: HTMLElement[] = [];
  roomHeaders: HTMLElement[] = [];
  canonicalIds = new Map<string, string>();
  roomGrid: HTMLElement | null = null;
  emptyState: HTMLElement | null = null;
  status: HTMLElement | null = null;
  selectedCount: HTMLElement | null = null;
  searchInput: HTMLInputElement | null = null;
  roomSelect: HTMLSelectElement | null = null;
  selectedToggle: HTMLInputElement | null = null;
  liveToggle: HTMLInputElement | null = null;
  resetButton: HTMLButtonElement | null = null;
  clearSelectionButton: HTMLButtonElement | null = null;
  shareButton: HTMLButtonElement | null = null;
  exportButton: HTMLButtonElement | null = null;
  fullscreenToggles: HTMLButtonElement[] = [];
  fullscreenClock: HTMLElement | null = null;
  selectionConflictDialog: HTMLDialogElement | null = null;
  fullscreenGestureArmed = false;
  clockTimer: number | null = null;
  liveEnabled = false;
  liveRefreshTimer: number | null = null;
  selectionStore: ProgramSelectionStore | null = null;
  unsubscribeSelection: (() => void) | null = null;
  private connectionVersion = 0;
  private selectionConflictAbort: AbortController | null = null;

  connectedCallback() {
    const connectionVersion = ++this.connectionVersion;
    this.storageKey = this.dataset.storageKey || 'cnp-program-selection';
    this.validIds = (this.dataset.sessionIds || '').split(',').filter(Boolean);
    this.selectedIds = new Set<string>();
    this.cards = [...this.querySelectorAll<HTMLElement>('[data-program-session]')];
    this.canonicalIds = new Map(
      this.cards.flatMap((card) =>
        (card.dataset.sourceSessionIds || card.dataset.sessionId || '')
          .split(',')
          .map((id) => [id, card.dataset.sessionId || ''] as const)
      )
    );
    this.selectionStore = new ProgramSelectionStore({
      validIds: this.validIds,
      canonicalIds: this.canonicalIds,
      storageKey: this.storageKey,
    });
    this.slots = [...this.querySelectorAll<HTMLElement>('[data-program-slot]')];
    this.roomHeaders = [...this.querySelectorAll<HTMLElement>('[data-program-room-header]')];
    this.roomGrid = this.querySelector<HTMLElement>('[data-program-room-grid]');
    this.emptyState = this.querySelector<HTMLElement>('[data-empty-state]');
    this.status = this.querySelector<HTMLElement>('[data-program-status]');
    this.selectedCount = this.querySelector<HTMLElement>('[data-selected-count]');
    this.searchInput = this.querySelector<HTMLInputElement>('[data-filter-search]');
    this.roomSelect = this.querySelector<HTMLSelectElement>('[data-filter-room]');
    this.selectedToggle = this.querySelector<HTMLInputElement>('[data-filter-selected]');
    this.liveToggle = this.querySelector<HTMLInputElement>('[data-filter-live]');
    this.resetButton = this.querySelector<HTMLButtonElement>('[data-filter-reset]');
    this.clearSelectionButton = this.querySelector<HTMLButtonElement>('[data-clear-selection]');
    this.shareButton = this.querySelector<HTMLButtonElement>('[data-share-selection]');
    this.exportButton = this.querySelector<HTMLButtonElement>('[data-export-selection]');
    this.fullscreenToggles = [...this.querySelectorAll<HTMLButtonElement>('[data-fullscreen-toggle]')];
    this.fullscreenClock = this.querySelector<HTMLElement>('[data-fullscreen-clock]');
    this.selectionConflictDialog = this.querySelector<HTMLDialogElement>('[data-selection-conflict-dialog]');

    this.handleFilters = this.handleFilters.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleClearSelection = this.handleClearSelection.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleLiveToggle = this.handleLiveToggle.bind(this);
    this.handleFullscreenToggle = this.handleFullscreenToggle.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleFullscreenError = this.handleFullscreenError.bind(this);
    this.handleFullscreenGesture = this.handleFullscreenGesture.bind(this);

    this.searchInput?.addEventListener('input', this.handleFilters);
    this.roomSelect?.addEventListener('change', this.handleFilters);
    this.selectedToggle?.addEventListener('change', this.handleFilters);
    this.liveToggle?.addEventListener('change', this.handleLiveToggle);
    this.resetButton?.addEventListener('click', this.handleReset);
    this.clearSelectionButton?.addEventListener('click', this.handleClearSelection);
    this.addEventListener('click', this.handleCardClick);
    this.shareButton?.addEventListener('click', this.handleShare);
    this.exportButton?.addEventListener('click', this.handleExport);
    window.addEventListener(AppClock.changeEvent, this.handleClockChange);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.setupFullscreen();

    void this.initializeState(connectionVersion);
  }

  disconnectedCallback() {
    this.connectionVersion++;
    this.selectionConflictAbort?.abort();
    this.selectionConflictAbort = null;
    this.unsubscribeSelection?.();
    this.unsubscribeSelection = null;
    this.searchInput?.removeEventListener('input', this.handleFilters);
    this.roomSelect?.removeEventListener('change', this.handleFilters);
    this.selectedToggle?.removeEventListener('change', this.handleFilters);
    this.liveToggle?.removeEventListener('change', this.handleLiveToggle);
    this.resetButton?.removeEventListener('click', this.handleReset);
    this.clearSelectionButton?.removeEventListener('click', this.handleClearSelection);
    this.removeEventListener('click', this.handleCardClick);
    this.shareButton?.removeEventListener('click', this.handleShare);
    this.exportButton?.removeEventListener('click', this.handleExport);
    window.removeEventListener(AppClock.changeEvent, this.handleClockChange);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.fullscreenToggles.forEach((button) => button.removeEventListener('click', this.handleFullscreenToggle));
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('fullscreenerror', this.handleFullscreenError);
    document.removeEventListener('webkitfullscreenerror', this.handleFullscreenError);
    window.removeEventListener('pointerdown', this.handleFullscreenGesture);
    window.removeEventListener('keydown', this.handleFullscreenGesture);
    this.stopClock();
    if (this.liveRefreshTimer) {
      window.clearTimeout(this.liveRefreshTimer);
      this.liveRefreshTimer = null;
    }
  }

  setupFullscreen() {
    if (!this.fullscreenToggles.length) {
      return;
    }

    // The toggle buttons must work even without the Fullscreen API so the presentation layout stays exitable.
    this.fullscreenToggles.forEach((button) => {
      button.hidden = false;
      button.addEventListener('click', this.handleFullscreenToggle);
    });

    if (!this.isFullscreenSupported()) {
      return;
    }

    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('fullscreenerror', this.handleFullscreenError);
    document.addEventListener('webkitfullscreenerror', this.handleFullscreenError);
  }

  loadFullscreenState() {
    const searchParams = new URL(window.location.href).searchParams;
    if (!FullscreenView.isEnabled(searchParams.get(FullscreenView.fullscreenParam))) {
      return;
    }

    // Fullscreen requests need a user gesture, so apply the presentation layout now and upgrade on first interaction.
    this.enterPresentation(false);
    if (this.isFullscreenSupported()) {
      this.fullscreenGestureArmed = true;
      window.addEventListener('pointerdown', this.handleFullscreenGesture, { once: true });
      window.addEventListener('keydown', this.handleFullscreenGesture, { once: true });
    }
  }

  handleFullscreenGesture() {
    if (!this.fullscreenGestureArmed || this.getFullscreenElement() === this) {
      return;
    }
    this.fullscreenGestureArmed = false;
    this.requestFullscreenCompat();
  }

  isFullscreenSupported() {
    const doc = document as WebkitFullscreenDocument;
    const element = this as WebkitFullscreenElement;
    const enabled = document.fullscreenEnabled || doc.webkitFullscreenEnabled;
    const canRequest =
      typeof this.requestFullscreen === 'function' || typeof element.webkitRequestFullscreen === 'function';
    return Boolean(enabled) && canRequest;
  }

  getFullscreenElement() {
    const doc = document as WebkitFullscreenDocument;
    return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  }

  isPresentationActive() {
    return this.dataset.fullscreen === 'true';
  }

  enterPresentation(updateUrl: boolean) {
    this.dataset.fullscreen = 'true';
    this.startClock();
    if (updateUrl) {
      this.syncFullscreenUrl(true);
    }
  }

  exitPresentation(updateUrl: boolean) {
    this.dataset.fullscreen = 'false';
    this.stopClock();
    if (updateUrl) {
      this.syncFullscreenUrl(false);
    }
  }

  syncFullscreenUrl(enabled: boolean) {
    const url = FullscreenView.updateUrl(new URL(window.location.href), enabled);
    window.history.replaceState({}, '', url);
  }

  handleFullscreenToggle() {
    if (this.getFullscreenElement() === this) {
      this.exitFullscreenCompat();
      return;
    }
    if (this.isPresentationActive()) {
      this.exitPresentation(true);
      return;
    }
    if (this.isFullscreenSupported()) {
      this.requestFullscreenCompat();
      return;
    }
    this.enterPresentation(true);
  }

  requestFullscreenCompat() {
    const element = this as WebkitFullscreenElement;
    if (typeof this.requestFullscreen === 'function') {
      void this.requestFullscreen().catch(() => this.handleFullscreenError());
      return;
    }
    element.webkitRequestFullscreen?.();
  }

  exitFullscreenCompat() {
    const doc = document as WebkitFullscreenDocument;
    if (typeof document.exitFullscreen === 'function') {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    doc.webkitExitFullscreen?.();
  }

  handleFullscreenChange() {
    if (this.getFullscreenElement() === this) {
      this.enterPresentation(false);
    } else {
      this.exitPresentation(true);
    }
  }

  handleFullscreenError() {
    this.exitPresentation(false);
  }

  startClock() {
    if (!this.fullscreenClock || this.clockTimer) {
      return;
    }
    this.renderClock();
    this.clockTimer = window.setInterval(() => this.renderClock(), 1000);
  }

  private renderClock() {
    if (this.fullscreenClock) {
      this.fullscreenClock.textContent = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(AppClock.now());
    }
  }

  private handleClockChange = () => {
    this.applyLiveState();
    this.handleFilters();
    this.renderClock();
    this.syncLiveRefreshTimer();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) this.syncLiveRefreshTimer();
    else this.handleClockChange();
  };

  stopClock() {
    if (this.clockTimer) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  }

  async initializeState(connectionVersion = this.connectionVersion) {
    await this.loadSelection(connectionVersion);
    if (!this.isConnected || connectionVersion !== this.connectionVersion) return;
    this.unsubscribeSelection?.();
    this.unsubscribeSelection =
      this.selectionStore?.subscribe((ids) => {
        this.selectedIds = new Set(ids);
        this.handleFilters();
      }) ?? null;
    this.loadLiveState();
    this.loadFullscreenState();
    this.applySelectionState();
    this.applyLiveState();
    this.handleFilters();
  }

  async loadSelection(connectionVersion = this.connectionVersion) {
    const fromQuery = new URL(window.location.href).searchParams.get('agenda');
    const fromStorage = this.selectionStore?.getStoredValue();
    const resolution = ProgramSelectionSourceResolver.resolve({
      queryValue: fromQuery,
      storageValue: fromStorage,
      validIds: this.validIds,
      canonicalIds: this.canonicalIds,
    });

    if (resolution.type === 'conflict') {
      const useQueryAgenda = await this.promptSelectionConflict();
      if (!this.isConnected || connectionVersion !== this.connectionVersion) return;

      this.selectedIds = new Set(useQueryAgenda ? resolution.querySelectedIds : resolution.storageSelectedIds);
      this.persistSelection(!useQueryAgenda);
      return;
    }

    this.selectedIds = new Set(resolution.selectedIds);
    this.persistSelection(resolution.updateUrl);
  }

  promptSelectionConflict() {
    const dialog = this.selectionConflictDialog;
    if (!dialog || typeof dialog.showModal !== 'function') {
      return Promise.resolve(
        window.confirm(
          this.dataset.selectionConflictPrompt ||
            'This link contains an agenda different from your saved agenda. Press OK to keep the agenda from the link, or Cancel to keep your saved agenda.'
        )
      );
    }

    this.selectionConflictAbort?.abort();
    const controller = new AbortController();
    this.selectionConflictAbort = controller;
    return new Promise<boolean>((resolve) => {
      const finish = (useQuery: boolean) => {
        dialog.removeEventListener('close', handleClose);
        controller.signal.removeEventListener('abort', handleAbort);
        if (this.selectionConflictAbort === controller) this.selectionConflictAbort = null;
        resolve(useQuery);
      };
      const handleClose = () => {
        // A close event queued before reconnecting must not resolve a newly reopened dialog.
        if (!dialog.open) finish(dialog.returnValue === 'query');
      };
      const handleAbort = () => {
        finish(false);
        if (dialog.open) dialog.close();
      };

      dialog.addEventListener('close', handleClose);
      controller.signal.addEventListener('abort', handleAbort, { once: true });
      dialog.showModal();
    });
  }

  loadLiveState() {
    const searchParams = new URL(window.location.href).searchParams;
    this.liveEnabled = ProgramLiveView.isEnabled(searchParams.get(ProgramLiveView.liveParam));
    this.dataset.liveEnabled = String(this.liveEnabled);
    if (this.liveToggle) {
      this.liveToggle.checked = this.liveEnabled;
    }
    this.syncLiveRefreshTimer();
  }

  persistSelection(updateUrl = false) {
    this.selectionStore?.setIds(this.selectedIds);
    if (!updateUrl) {
      return;
    }

    const token = ProgramSelectionCodec.encode(this.selectedIds, this.validIds);
    const url = new URL(window.location.href);
    if (token) {
      url.searchParams.set('agenda', token);
    } else {
      url.searchParams.delete('agenda');
    }
    window.history.replaceState({}, '', url);
  }

  handleFilters() {
    const query = ProgramSearchTextNormalizer.normalize(this.searchInput?.value || '');
    const room = this.roomSelect?.value || '';
    const selectedOnly = Boolean(this.selectedToggle?.checked);
    const now = AppClock.now();

    let visibleCards = 0;

    this.cards.forEach((card) => {
      const searchText = card.dataset.searchText || '';
      const roomIds = (card.dataset.roomIds || '').split(',');
      const isSelected = this.selectedIds.has(card.dataset.sessionId || '');
      const liveState = this.getSlotLiveState(card, now);

      const matchesQuery = !query || searchText.includes(query);
      const matchesRoom = !room || roomIds.includes(room);
      const matchesSelection = !selectedOnly || isSelected;
      const matchesLive = !this.liveEnabled || liveState !== 'past';
      const isVisible = matchesQuery && matchesRoom && matchesSelection && matchesLive;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCards += 1;
      }
    });

    this.slots.forEach((slot) => {
      const hasVisibleCards = [...slot.querySelectorAll<HTMLElement>('[data-program-session]')].some(
        (card) => !card.hidden
      );
      slot.hidden = !hasVisibleCards;
    });

    const visibleRoomIds = new Set(
      this.cards.filter((card) => !card.hidden).flatMap((card) => (card.dataset.roomIds || '').split(','))
    );
    const roomColumns = new Map<string, number>();
    this.roomHeaders.forEach((header) => {
      const id = header.dataset.roomId || '';
      const ids = (header.dataset.roomIds || id).split(',');
      header.hidden = !ids.some((id) => visibleRoomIds.has(id)) || Boolean(room && !ids.includes(room));
      if (!header.hidden) {
        roomColumns.set(id, roomColumns.size + 1);
        header.style.setProperty('--program-room-column', String(roomColumns.size));
      }
    });

    if (this.roomGrid) {
      this.roomGrid.hidden = visibleCards === 0;
      this.roomGrid.style.setProperty('--program-room-count', String(Math.max(roomColumns.size, 1)));
      const visibleSlots = this.slots.filter((slot) => !slot.hidden);
      const timeline = buildProgramTimelineLayout(
        visibleSlots.map((slot) => ({ startsAt: slot.dataset.startsAt || '', endsAt: slot.dataset.endsAt || '' }))
      );
      this.roomGrid.style.setProperty('--program-time-rows', String(timeline.rowCount));
      visibleSlots.forEach((slot) => {
        slot.style.setProperty(
          '--program-slot-start',
          String((timeline.lines.get(Date.parse(slot.dataset.startsAt || '')) ?? 1) + 1)
        );
        slot.style.setProperty(
          '--program-slot-end',
          String((timeline.lines.get(Date.parse(slot.dataset.endsAt || '')) ?? 2) + 1)
        );
        const ids: string[] = slot.dataset.columnIds ? JSON.parse(slot.dataset.columnIds) : [slot.dataset.roomId || ''];
        const columns = ids.flatMap((id) => (roomColumns.has(id) ? [roomColumns.get(id)!] : []));
        slot.style.setProperty('--program-room-column', String(Math.min(...columns, roomColumns.size || 1)));
        slot.style.setProperty('--program-room-span', String(Math.max(columns.length, 1)));
      });
    }

    if (this.emptyState) {
      this.emptyState.hidden = visibleCards > 0;
    }
    this.applySelectionState();
  }

  handleReset() {
    if (this.searchInput) this.searchInput.value = '';
    if (this.roomSelect) this.roomSelect.value = '';
    if (this.selectedToggle) this.selectedToggle.checked = false;
    this.handleFilters();
    this.setStatus('');
  }

  handleLiveToggle() {
    this.liveEnabled = Boolean(this.liveToggle?.checked);
    this.dataset.liveEnabled = String(this.liveEnabled);
    const url = ProgramLiveView.updateUrl(new URL(window.location.href), this.liveEnabled);
    window.history.replaceState({}, '', url);
    this.syncLiveRefreshTimer();
    this.applyLiveState();
    this.handleFilters();
  }

  handleClearSelection() {
    if (this.selectedIds.size === 0) {
      return;
    }

    this.selectedIds.clear();
    this.persistSelection(true);
    this.applySelectionState();
    this.handleFilters();
    this.setStatus(this.dataset.emptySelection || '');
  }

  handleCardClick(event: Event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const toggle = target.closest('[data-program-toggle]') as HTMLButtonElement | null;
    if (!toggle) {
      return;
    }

    const id = toggle.dataset.programToggle;
    if (!id) {
      return;
    }

    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }

    this.persistSelection(true);
    this.applySelectionState();
    this.handleFilters();
  }

  applySelectionState() {
    const now = AppClock.now();
    this.cards.forEach((card) => {
      const id = card.dataset.sessionId || '';
      const toggle = card.querySelector<HTMLButtonElement>('[data-program-toggle]');
      const isSelected = this.selectedIds.has(id);

      card.classList.toggle('ring-2', isSelected);
      card.classList.toggle('ring-sky-400', isSelected);
      const startingSoon =
        isSelected &&
        ProgramSessionReminder.isStartingSoon(
          { startsAt: card.dataset.startsAt || '', endsAt: card.dataset.endsAt || '' },
          now
        );
      card.classList.toggle('session-starting-soon', startingSoon);
      card.querySelector('[data-session-starting-soon]')?.toggleAttribute('hidden', !startingSoon);

      if (toggle) {
        const label = isSelected ? toggle.dataset.removeLabel || '' : toggle.dataset.addLabel || '';
        const toggleLabel = toggle.querySelector<HTMLElement>('[data-program-toggle-label]');
        const addIcon = toggle.querySelector<HTMLElement>('[data-program-toggle-add-icon]');
        const removeIcon = toggle.querySelector<HTMLElement>('[data-program-toggle-remove-icon]');

        toggle.setAttribute('aria-pressed', String(isSelected));
        toggle.setAttribute('aria-label', label);
        toggle.setAttribute('title', label);
        if (toggleLabel) {
          toggleLabel.textContent = label;
        }
        if (addIcon) {
          addIcon.hidden = isSelected;
        }
        if (removeIcon) {
          removeIcon.hidden = !isSelected;
        }
        toggle.classList.toggle('bg-sky-500', !isSelected);
        toggle.classList.toggle('text-white', !isSelected);
        toggle.classList.toggle('hover:bg-sky-400', !isSelected);
        toggle.classList.toggle('bg-sky-50', isSelected);
        toggle.classList.toggle('text-sky-700', isSelected);
        toggle.classList.toggle('hover:bg-sky-100', isSelected);
      }
    });

    if (this.selectedCount) {
      this.selectedCount.textContent = String(this.selectedIds.size);
    }

    if (this.clearSelectionButton) {
      this.clearSelectionButton.disabled = this.selectedIds.size === 0;
    }
  }

  applyLiveState() {
    const liveNowLabel = this.dataset.liveNow || '';
    const upcomingLabel = this.dataset.upcoming || '';
    const now = AppClock.now();

    this.slots.forEach((slot) => {
      const badge = slot.querySelector<HTMLElement>('[data-slot-live-badge]');

      if (!this.liveEnabled) {
        delete slot.dataset.liveState;
        if (badge) {
          badge.hidden = true;
          badge.textContent = '';
        }
        return;
      }

      const liveState = this.getSlotLiveState(slot, now);

      slot.dataset.liveState = liveState;

      if (!badge) {
        return;
      }

      if (liveState === 'past') {
        badge.hidden = true;
        badge.textContent = '';
        return;
      }

      badge.hidden = false;
      badge.textContent = liveState === 'live' ? liveNowLabel : upcomingLabel;
    });
  }

  async handleShare() {
    const selection = ProgramSelectionCodec.encode(this.selectedIds, this.validIds);
    if (!selection) {
      this.setStatus(this.dataset.emptySelection || this.dataset.exportEmpty || '');
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('agenda', selection);

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: document.title,
          url: url.toString(),
        });
        this.setStatus(this.dataset.shareSuccess || '');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        this.setStatus(this.dataset.shareSuccess || '');
        return;
      }
    } catch {
      this.setStatus(this.dataset.shareUnavailable || '');
      return;
    }

    this.setStatus(this.dataset.shareUnavailable || '');
  }

  handleExport() {
    const selectedEvents = this.cards
      .filter((card) => this.selectedIds.has(card.dataset.sessionId || ''))
      .map((card) => this.createCalendarEvent(card));

    if (selectedEvents.length === 0) {
      this.setStatus(this.dataset.exportEmpty || '');
      return;
    }

    const blob = new Blob([ProgramCalendarExporter.build(selectedEvents)], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const href = URL.createObjectURL(blob);
    link.href = href;
    link.download = 'kcd-provence-program.ics';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    this.setStatus('');
  }

  syncLiveRefreshTimer() {
    if (this.liveRefreshTimer) {
      window.clearTimeout(this.liveRefreshTimer);
      this.liveRefreshTimer = null;
    }
    if (document.hidden) return;
    const now = AppClock.now();
    const next = ProgramSessionReminder.getNextBoundary(
      [...this.cards, ...(this.liveEnabled ? this.slots : [])].map((element) => ({
        startsAt: element.dataset.startsAt || '',
        endsAt: element.dataset.endsAt || '',
      })),
      now
    );
    if (!next) return;
    this.liveRefreshTimer = window.setTimeout(
      () => {
        this.applyLiveState();
        this.handleFilters();
        this.syncLiveRefreshTimer();
      },
      Math.min(86_400_000, Math.max(100, next.getTime() - now.getTime() + 50))
    );
  }

  private getSlotLiveState(slot: HTMLElement, referenceTime: Date = AppClock.now()) {
    return ProgramLiveView.getState(
      {
        startsAt: slot.dataset.startsAt || '',
        endsAt: slot.dataset.endsAt || '',
      },
      referenceTime
    );
  }

  private createCalendarEvent(card: HTMLElement): ProgramCalendarEvent {
    return {
      id: card.dataset.sessionId || '',
      title: card.dataset.sessionTitle || '',
      description: card.dataset.sessionDescription || '',
      location: card.dataset.sessionLocation || '',
      startsAt: card.dataset.startsAt || '',
      endsAt: card.dataset.endsAt || '',
    };
  }

  setStatus(message: string) {
    if (this.status) {
      this.status.textContent = message;
    }
  }
}

if (!customElements.get('program-schedule')) {
  customElements.define('program-schedule', ProgramScheduleElement);
}
