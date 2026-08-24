class PracticalInfoTravelPlannerElement extends HTMLElement {
  buttons: HTMLButtonElement[] = [];
  panels: HTMLElement[] = [];

  readonly activeClasses = ['bg-white', 'text-slate-900', 'shadow-sm', 'dark:bg-slate-700', 'dark:text-white'];

  readonly inactiveClasses = [
    'text-slate-500',
    'hover:text-slate-800',
    'dark:text-slate-400',
    'dark:hover:text-slate-200',
  ];

  connectedCallback() {
    this.buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-planner-tab]')];
    this.panels = [...this.querySelectorAll<HTMLElement>('[data-planner-panel]')];

    if (this.buttons.length === 0 || this.panels.length === 0) {
      return;
    }

    this.buttons.forEach((button) => {
      button.addEventListener('click', this.handleTabClick);
      button.addEventListener('keydown', this.handleTabKeydown);
    });

    this.activatePanel(0);
  }

  disconnectedCallback() {
    this.buttons.forEach((button) => {
      button.removeEventListener('click', this.handleTabClick);
      button.removeEventListener('keydown', this.handleTabKeydown);
    });
  }

  private readonly handleTabClick = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    this.activatePanel(this.readIndex(target));
  };

  private readonly handleTabKeydown = (event: KeyboardEvent) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const currentIndex = this.readIndex(target);
    const lastIndex = this.panels.length - 1;
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = lastIndex;
    } else {
      return;
    }

    event.preventDefault();
    this.buttons[nextIndex]?.focus();
    this.activatePanel(nextIndex);
  };

  private activatePanel(nextIndex: number) {
    this.buttons.forEach((button) => {
      const isActive = this.readIndex(button) === nextIndex;
      button.dataset.active = String(isActive);
      button.setAttribute('aria-selected', String(isActive));
      this.syncButtonClasses(button, isActive);
    });

    this.panels.forEach((panel) => {
      const isActive = this.readIndex(panel) === nextIndex;
      panel.hidden = !isActive;
      panel.classList.toggle('hidden', !isActive);
    });
  }

  private syncButtonClasses(button: HTMLButtonElement, isActive: boolean) {
    button.classList.remove(...(isActive ? this.inactiveClasses : this.activeClasses));
    button.classList.add(...(isActive ? this.activeClasses : this.inactiveClasses));
  }

  private readIndex(element: HTMLElement): number {
    const value = Number(element.dataset.index);
    return Number.isNaN(value) ? 0 : value;
  }
}

if (!customElements.get('practical-info-travel-planner')) {
  customElements.define('practical-info-travel-planner', PracticalInfoTravelPlannerElement);
}
