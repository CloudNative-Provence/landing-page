import { type ProgramCalendarEvent, ProgramCalendarExporter } from '~/domains/pages/program/services/calendar-exporter';
import { ProgramSearchTextNormalizer } from '~/domains/pages/program/services/search-text-normalizer';
import { ProgramSelectionCodec } from '~/domains/pages/program/services/selection-codec';

class ProgramScheduleElement extends HTMLElement {
  storageKey = 'cnp-program-selection';
  validIds: string[] = [];
  selectedIds = new Set<string>();
  cards: HTMLElement[] = [];
  slots: HTMLElement[] = [];
  emptyState: HTMLElement | null = null;
  status: HTMLElement | null = null;
  selectedCount: HTMLElement | null = null;
  searchInput: HTMLInputElement | null = null;
  trackSelect: HTMLSelectElement | null = null;
  roomSelect: HTMLSelectElement | null = null;
  selectedToggle: HTMLInputElement | null = null;
  resetButton: HTMLButtonElement | null = null;
  shareButton: HTMLButtonElement | null = null;
  exportButton: HTMLButtonElement | null = null;

  connectedCallback() {
    this.storageKey = this.dataset.storageKey || 'cnp-program-selection';
    this.validIds = (this.dataset.sessionIds || '').split(',').filter(Boolean);
    this.selectedIds = new Set<string>();
    this.cards = [...this.querySelectorAll<HTMLElement>('[data-program-session]')];
    this.slots = [...this.querySelectorAll<HTMLElement>('[data-program-slot]')];
    this.emptyState = this.querySelector<HTMLElement>('[data-empty-state]');
    this.status = this.querySelector<HTMLElement>('[data-program-status]');
    this.selectedCount = this.querySelector<HTMLElement>('[data-selected-count]');
    this.searchInput = this.querySelector<HTMLInputElement>('[data-filter-search]');
    this.trackSelect = this.querySelector<HTMLSelectElement>('[data-filter-track]');
    this.roomSelect = this.querySelector<HTMLSelectElement>('[data-filter-room]');
    this.selectedToggle = this.querySelector<HTMLInputElement>('[data-filter-selected]');
    this.resetButton = this.querySelector<HTMLButtonElement>('[data-filter-reset]');
    this.shareButton = this.querySelector<HTMLButtonElement>('[data-share-selection]');
    this.exportButton = this.querySelector<HTMLButtonElement>('[data-export-selection]');

    this.handleFilters = this.handleFilters.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleExport = this.handleExport.bind(this);

    this.searchInput?.addEventListener('input', this.handleFilters);
    this.trackSelect?.addEventListener('change', this.handleFilters);
    this.roomSelect?.addEventListener('change', this.handleFilters);
    this.selectedToggle?.addEventListener('change', this.handleFilters);
    this.resetButton?.addEventListener('click', this.handleReset);
    this.addEventListener('click', this.handleCardClick);
    this.shareButton?.addEventListener('click', this.handleShare);
    this.exportButton?.addEventListener('click', this.handleExport);

    this.loadSelection();
    this.applySelectionState();
    this.handleFilters();
  }

  disconnectedCallback() {
    this.searchInput?.removeEventListener('input', this.handleFilters);
    this.trackSelect?.removeEventListener('change', this.handleFilters);
    this.roomSelect?.removeEventListener('change', this.handleFilters);
    this.selectedToggle?.removeEventListener('change', this.handleFilters);
    this.resetButton?.removeEventListener('click', this.handleReset);
    this.removeEventListener('click', this.handleCardClick);
    this.shareButton?.removeEventListener('click', this.handleShare);
    this.exportButton?.removeEventListener('click', this.handleExport);
  }

  loadSelection() {
    const fromQuery = new URL(window.location.href).searchParams.get('agenda');
    const fromStorage = window.localStorage.getItem(this.storageKey);
    const source = fromQuery || fromStorage;

    this.selectedIds = new Set(ProgramSelectionCodec.parse(source, this.validIds));
    this.persistSelection(false);
  }

  persistSelection(updateUrl = false) {
    const value = ProgramSelectionCodec.serialize(this.selectedIds);
    window.localStorage.setItem(this.storageKey, value);
    if (!updateUrl) {
      return;
    }

    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('agenda', value);
    } else {
      url.searchParams.delete('agenda');
    }
    window.history.replaceState({}, '', url);
  }

  handleFilters() {
    const query = ProgramSearchTextNormalizer.normalize(this.searchInput?.value || '');
    const track = this.trackSelect?.value || '';
    const room = this.roomSelect?.value || '';
    const selectedOnly = Boolean(this.selectedToggle?.checked);

    let visibleCards = 0;

    this.cards.forEach((card) => {
      const searchText = card.dataset.searchText || '';
      const trackIds = (card.dataset.trackIds || '').split(',').filter(Boolean);
      const roomIds = (card.dataset.roomIds || '').split(',').filter(Boolean);
      const isSelected = this.selectedIds.has(card.dataset.sessionId || '');
      const isGlobal = card.dataset.global === 'true';

      const matchesQuery = !query || searchText.includes(query);
      const matchesTrack = !track || isGlobal || trackIds.includes(track);
      const matchesRoom = !room || roomIds.includes(room);
      const matchesSelection = !selectedOnly || isSelected;
      const isVisible = matchesQuery && matchesTrack && matchesRoom && matchesSelection;

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

    if (this.emptyState) {
      this.emptyState.hidden = visibleCards > 0;
    }
    this.applySelectionState();
  }

  handleReset() {
    if (this.searchInput) this.searchInput.value = '';
    if (this.trackSelect) this.trackSelect.value = '';
    if (this.roomSelect) this.roomSelect.value = '';
    if (this.selectedToggle) this.selectedToggle.checked = false;
    this.handleFilters();
    this.setStatus('');
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
    this.cards.forEach((card) => {
      const id = card.dataset.sessionId || '';
      const toggle = card.querySelector<HTMLButtonElement>('[data-program-toggle]');
      const isSelected = this.selectedIds.has(id);

      card.classList.toggle('ring-2', isSelected);
      card.classList.toggle('ring-sky-400', isSelected);

      if (toggle) {
        toggle.setAttribute('aria-pressed', String(isSelected));
        toggle.textContent = isSelected ? toggle.dataset.removeLabel || '' : toggle.dataset.addLabel || '';
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
  }

  async handleShare() {
    const selection = ProgramSelectionCodec.serialize(this.selectedIds);
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
