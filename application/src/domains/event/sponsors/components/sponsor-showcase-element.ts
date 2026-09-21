class SponsorShowcaseElement extends HTMLElement {
  private controller?: AbortController;

  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();

    this.addEventListener(
      'click',
      (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return;

        const trigger = event.target.closest<HTMLButtonElement>('[data-sponsor-open]');
        if (trigger) {
          const dialog = document.getElementById(trigger.dataset.sponsorOpen ?? '');
          if (dialog instanceof HTMLDialogElement && this.contains(dialog)) {
            dialog.showModal();
            const body = dialog.querySelector<HTMLElement>('.dialog-body');
            if (body) body.scrollTop = 0;
          }
          return;
        }

        if (event.target instanceof HTMLDialogElement) {
          const bounds = event.target.getBoundingClientRect();
          const outside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;
          if (outside) event.target.close();
        }
      },
      { signal: this.controller.signal }
    );

    this.querySelectorAll<HTMLButtonElement>('[data-sponsor-open]').forEach((button) => {
      button.hidden = false;
    });
  }

  disconnectedCallback() {
    this.controller?.abort();
  }
}

if (!customElements.get('sponsor-showcase')) {
  customElements.define('sponsor-showcase', SponsorShowcaseElement);
}
