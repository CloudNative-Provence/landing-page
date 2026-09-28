import { ProgramSearchTextNormalizer } from '~/domains/pages/program/services/search-text-normalizer';

class SpeakerDirectory extends HTMLElement {
  private controller?: AbortController;

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const input = this.querySelector<HTMLInputElement>('input[type="search"]');
    const cards = [...this.querySelectorAll<HTMLElement>('[data-speaker-card]')];
    const count = this.querySelector<HTMLElement>('[data-speaker-count]');
    const emptyState = this.querySelector<HTMLElement>('[data-no-results]');
    const clearButton = this.querySelector<HTMLButtonElement>('.search-clear');
    const search = this.querySelector<HTMLElement>('[data-speaker-search]');

    const update = () => {
      const query = ProgramSearchTextNormalizer.normalize(input?.value ?? '');
      const terms = query.split(' ').filter(Boolean);
      let visible = 0;
      for (const card of cards) {
        card.hidden = !terms.every((term) => card.dataset.searchText?.includes(term));
        if (!card.hidden) visible += 1;
      }
      if (count) {
        count.textContent = (this.dataset.resultsLabel ?? '{count} / {total}')
          .replace('{count}', String(visible))
          .replace('{total}', String(cards.length));
      }
      if (emptyState) emptyState.hidden = visible > 0;
      if (clearButton) clearButton.hidden = !input?.value;
    };

    input?.addEventListener('input', update, { signal });
    this.querySelectorAll<HTMLButtonElement>('[data-clear-search]').forEach((button) => {
      button.addEventListener(
        'click',
        () => {
          if (input) input.value = '';
          update();
          input?.focus();
        },
        { signal }
      );
    });

    // Remote portraits can expire. Keep the initials visible if an image fails.
    this.querySelectorAll<HTMLImageElement>('[data-speaker-portrait]').forEach((portrait) => {
      const fallback = () => {
        const original = portrait.dataset.originalPortrait;
        if (original && portrait.getAttribute('src') !== original) {
          portrait.src = original;
        } else {
          portrait.hidden = true;
        }
      };
      portrait.addEventListener('error', fallback, { signal });
      if (portrait.complete && portrait.naturalWidth === 0) fallback();
    });

    if (search) search.hidden = false;
    update();
  }

  disconnectedCallback() {
    this.controller?.abort();
  }
}

if (!customElements.get('speaker-directory')) {
  customElements.define('speaker-directory', SpeakerDirectory);
}
