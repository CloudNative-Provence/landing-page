class PracticalInfoStayFinderElement extends HTMLElement {
  chips: HTMLButtonElement[] = [];
  cards: HTMLElement[] = [];
  countEl: HTMLElement | null = null;
  emptyEl: HTMLElement | null = null;
  resetButton: HTMLButtonElement | null = null;
  searchLink: HTMLAnchorElement | null = null;
  searchContextLabelEl: HTMLElement | null = null;
  searchBaseQuery = '';
  searchContextBase = '';
  searchFallbackHref = '';

  connectedCallback() {
    this.chips = [...this.querySelectorAll<HTMLButtonElement>('[data-filter-chip]')];
    this.cards = [...this.querySelectorAll<HTMLElement>('[data-stay]')];
    this.countEl = this.querySelector<HTMLElement>('[data-count]');
    this.emptyEl = this.querySelector<HTMLElement>('[data-empty]');
    this.resetButton = this.querySelector<HTMLButtonElement>('[data-reset]');
    this.searchLink = this.querySelector<HTMLAnchorElement>('[data-search-link]');
    this.searchContextLabelEl = this.querySelector<HTMLElement>('[data-search-context-label]');
    this.searchBaseQuery = this.dataset.searchBase?.trim() ?? '';
    this.searchContextBase = this.dataset.searchContext?.trim() ?? '';
    this.searchFallbackHref = this.dataset.searchFallbackHref?.trim() ?? '';

    this.chips.forEach((chip) => chip.addEventListener('click', this.handleToggle));
    this.resetButton?.addEventListener('click', this.handleReset);

    this.applyFilters();
  }

  disconnectedCallback() {
    this.chips.forEach((chip) => chip.removeEventListener('click', this.handleToggle));
    this.resetButton?.removeEventListener('click', this.handleReset);
  }

  private readonly handleToggle = (event: Event) => {
    const chip = event.currentTarget;
    if (!(chip instanceof HTMLButtonElement)) {
      return;
    }

    const isActive = chip.dataset.active === 'true';
    chip.dataset.active = String(!isActive);
    chip.setAttribute('aria-pressed', String(!isActive));
    this.applyFilters();
  };

  private readonly handleReset = () => {
    this.chips.forEach((chip) => {
      chip.dataset.active = 'false';
      chip.setAttribute('aria-pressed', 'false');
    });
    this.applyFilters();
  };

  private selectedByGroup(): Map<string, Set<string>> {
    const selected = new Map<string, Set<string>>();

    this.chips
      .filter((chip) => chip.dataset.active === 'true')
      .forEach((chip) => {
        const group = chip.dataset.group ?? '';
        const value = chip.dataset.value ?? '';
        if (!selected.has(group)) {
          selected.set(group, new Set<string>());
        }
        selected.get(group)?.add(value);
      });

    return selected;
  }

  private selectedSearchTerms(): string[] {
    const terms = new Set(
      this.chips
        .filter((chip) => chip.dataset.active === 'true')
        .map((chip) => chip.dataset.query?.trim() ?? '')
        .filter(Boolean)
    );

    return [...terms];
  }

  private selectedFilterLabels(): string[] {
    const labels = new Set(
      this.chips
        .filter((chip) => chip.dataset.active === 'true')
        .map((chip) => chip.textContent?.trim() ?? '')
        .filter(Boolean)
    );

    return [...labels];
  }

  private buildSearchContextLabel(filterLabels: string[]): string {
    return [this.searchContextBase, ...filterLabels].filter(Boolean).join(' · ');
  }

  private buildMapsSearchHref(searchTerms: string[]): string {
    const href = new URL('https://www.google.com/maps/search/');
    const query = [this.searchBaseQuery, ...searchTerms].filter(Boolean).join(' ');

    href.searchParams.set('api', '1');
    href.searchParams.set('query', query);

    return href.toString();
  }

  private matchesFilters(card: HTMLElement, selected: Map<string, Set<string>>): boolean {
    for (const [group, values] of selected) {
      const cardValues = (card.dataset[group] ?? '').split(',').filter(Boolean);
      const hasMatch = [...values].some((value) => cardValues.includes(value));
      if (!hasMatch) {
        return false;
      }
    }
    return true;
  }

  private applyFilters() {
    const selected = this.selectedByGroup();
    const searchTerms = this.selectedSearchTerms();
    const filterLabels = this.selectedFilterLabels();
    let visible = 0;

    this.cards.forEach((card) => {
      const show = this.matchesFilters(card, selected);
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (this.countEl) {
      this.countEl.textContent = String(visible);
    }
    if (this.emptyEl) {
      this.emptyEl.hidden = visible > 0;
    }
    if (this.searchLink) {
      this.searchLink.href =
        searchTerms.length > 0
          ? this.buildMapsSearchHref(searchTerms)
          : this.searchFallbackHref || this.buildMapsSearchHref(searchTerms);
      this.searchLink.title = this.buildSearchContextLabel(filterLabels);
    }
    if (this.searchContextLabelEl) {
      this.searchContextLabelEl.textContent = this.buildSearchContextLabel(filterLabels);
    }
  }
}

if (!customElements.get('practical-info-stay-finder')) {
  customElements.define('practical-info-stay-finder', PracticalInfoStayFinderElement);
}
