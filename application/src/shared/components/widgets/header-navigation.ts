import { EventDay } from '~/domains/event/model/event-day';
import { AppClock } from '~/shared/time/app-clock';

class HeaderNavigation extends HTMLElement {
  private events: AbortController | null = null;
  private desktop = window.matchMedia('(min-width: 1100px)');
  private eventDay: EventDay | null = null;
  private dayTimer: number | null = null;

  connectedCallback() {
    this.events?.abort();
    this.events = new AbortController();
    const { signal } = this.events;
    this.setAttribute('data-enhanced', '');
    this.addEventListener('click', this.onClick, { signal });
    this.addEventListener('keydown', this.onKeydown, { signal });
    this.addEventListener('focusout', this.onFocusOut, { signal });
    document.addEventListener('pointerdown', this.onOutsidePointer, { signal });
    this.desktop.addEventListener('change', this.onViewportChange, { signal });
    window.addEventListener('pageshow', this.onPageShow, { signal });
    window.addEventListener(AppClock.changeEvent, this.refreshEventNavigation, { signal });
    document.addEventListener('visibilitychange', this.refreshEventNavigation, { signal });
    this.eventDay =
      this.dataset.eventStartsAt && this.dataset.eventTimeZone
        ? new EventDay(this.dataset.eventStartsAt, this.dataset.eventTimeZone)
        : null;
    this.refreshEventNavigation();
  }

  disconnectedCallback() {
    this.closeMenu();
    this.events?.abort();
    this.events = null;
    if (this.dayTimer !== null) window.clearTimeout(this.dayTimer);
    this.dayTimer = null;
    this.eventDay = null;
  }

  private get toggle() {
    return this.querySelector<HTMLButtonElement>('[data-aw-toggle-menu]');
  }

  private get groups() {
    return [...this.querySelectorAll<HTMLDetailsElement>('[data-nav-group]')];
  }

  private closeMenu(restoreFocus = false) {
    this.removeAttribute('data-menu-open');
    this.toggle?.setAttribute('aria-expanded', 'false');
    this.toggle?.classList.remove('expanded');
    document.body.classList.remove('header-menu-open');
    for (const group of this.groups) group.open = false;
    if (restoreFocus) this.toggle?.focus();
  }

  private onClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-aw-toggle-menu]')) {
      if (this.hasAttribute('data-menu-open')) this.closeMenu();
      else if (!this.desktop.matches) {
        this.setAttribute('data-menu-open', '');
        this.toggle?.setAttribute('aria-expanded', 'true');
        this.toggle?.classList.add('expanded');
        document.body.classList.add('header-menu-open');
      }
    } else if (event.target.closest('a[href]')) this.closeMenu();
  };

  private onOutsidePointer = (event: PointerEvent) => {
    if (event.target instanceof Node && !this.contains(event.target)) {
      for (const group of this.groups) group.open = false;
    }
  };

  private onFocusOut = (event: FocusEvent) => {
    if (!this.desktop.matches) return;
    const next = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    for (const group of this.groups) {
      if (!group.contains(next)) group.open = false;
    }
  };

  private onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.hasAttribute('data-menu-open')) {
        event.preventDefault();
        this.closeMenu(true);
      } else {
        const group = this.groups.find((item) => item.open);
        if (group) {
          event.preventDefault();
          group.open = false;
          group.querySelector('summary')?.focus();
        }
      }
      return;
    }
    if (event.key !== 'Tab' || !this.hasAttribute('data-menu-open')) return;
    const focusable = [...this.querySelectorAll<HTMLElement>('a[href], button, summary')].filter(
      (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  private onViewportChange = () => {
    const focused = document.activeElement;
    const group = this.groups.find((item) => item.contains(focused));
    this.closeMenu();
    if (
      !this.desktop.matches &&
      focused instanceof Node &&
      this.querySelector('[data-header-panel]')?.contains(focused)
    ) {
      this.toggle?.focus();
    } else if (group) group.querySelector('summary')?.focus();
  };

  private refreshEventNavigation = () => {
    if (this.dayTimer !== null) window.clearTimeout(this.dayTimer);
    this.dayTimer = null;
    if (!this.eventDay || document.hidden) return;
    const eventDay = this.eventDay.includes();
    const primary = this.querySelector('.header-links');
    const eventSection = primary?.querySelector<HTMLLIElement>('[data-nav-section="event"]');
    const eventLinks = eventSection?.querySelector('.header-submenu');
    if (primary && eventSection && eventLinks && this.dataset.eventDay !== String(eventDay)) {
      const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const items = [...primary.querySelectorAll<HTMLLIElement>('[data-nav-order]')].sort(
        (a, b) => Number(a.dataset.navOrder) - Number(b.dataset.navOrder)
      );
      for (const item of items) {
        const promoted =
          item.dataset.navPromotion === 'always' ||
          item.dataset.navPromotion === (eventDay ? 'event-day' : 'other-days');
        const anchor = item.querySelector('a');
        anchor?.classList.toggle('header-link', promoted);
        anchor?.classList.toggle('header-sublink', !promoted);
        if (promoted) primary.insertBefore(item, eventSection);
        else eventLinks.append(item);
      }
      const group = eventSection.querySelector('details');
      group
        ?.querySelector('summary')
        ?.classList.toggle('is-active', !!eventLinks.querySelector('[aria-current="page"]'));
      if (focused && items.some((item) => item.contains(focused))) {
        if (group?.contains(focused)) group.open = true;
        focused.focus({ preventScroll: true });
      }
      this.dataset.eventDay = String(eventDay);
    }
    // Align checks to minute boundaries so an open page also switches at local midnight.
    this.dayTimer = window.setTimeout(this.refreshEventNavigation, 60_000 - (AppClock.timestamp() % 60_000));
  };

  private onPageShow = () => {
    this.closeMenu();
    this.refreshEventNavigation();
  };
}

if (!customElements.get('header-navigation')) customElements.define('header-navigation', HeaderNavigation);
