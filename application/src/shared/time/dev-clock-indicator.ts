import { AppClock } from './app-clock';
import { ZonedDateTimeInput } from './zoned-date-time-input';
import './dev-clock-indicator.css';

/** A dev-only clock status, including in native fullscreen and after page navigation. */
class DevelopmentClockIndicator extends HTMLElement {
  private timer: number | null = null;
  private home: HTMLElement | null = null;
  private format!: Intl.DateTimeFormat;
  private dateTimeInput!: ZonedDateTimeInput;

  connectedCallback() {
    this.home ??= this.parentElement;
    this.format = new Intl.DateTimeFormat(this.lang, {
      dateStyle: 'short',
      timeStyle: 'medium',
      timeZone: this.dataset.timeZone,
    });
    this.title = this.dataset.timeZone ?? '';
    this.dateTimeInput = new ZonedDateTimeInput(this.dataset.timeZone ?? 'UTC');
    this.addEventListener('click', this.handleClick);
    this.addEventListener('submit', this.handleSubmit);
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('input', this.handleInput);
    window.addEventListener(AppClock.changeEvent, this.refresh);
    document.addEventListener('fullscreenchange', this.place);
    document.addEventListener('webkitfullscreenchange', this.place);
    this.refresh();
    this.place();
  }

  disconnectedCallback() {
    this.stopTimer();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('submit', this.handleSubmit);
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('input', this.handleInput);
    window.removeEventListener(AppClock.changeEvent, this.refresh);
    document.removeEventListener('fullscreenchange', this.place);
    document.removeEventListener('webkitfullscreenchange', this.place);
  }

  private refresh = () => {
    this.hidden = !window.devClock?.active;
    this.stopTimer();
    if (this.hidden) {
      this.closeEditor(false);
      return;
    }
    this.updateTime();
    this.timer = window.setInterval(this.updateTime, 1_000);
  };

  private updateTime = () => {
    const time = this.querySelector<HTMLTimeElement>('[data-dev-clock-time]');
    if (!time) return;
    const now = AppClock.now();
    time.dateTime = now.toISOString();
    time.textContent = this.format.format(now);
  };

  private stopTimer() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-dev-clock-reset]')) window.devClock?.reset();
    if (event.target.closest('[data-dev-clock-cancel]')) this.closeEditor();
    if (event.target.closest('[data-dev-clock-edit]')) {
      const editor = this.querySelector<HTMLFormElement>('[data-dev-clock-editor]');
      const input = this.querySelector<HTMLInputElement>('[data-dev-clock-input]');
      if (!editor || !input) return;
      if (!editor.hidden) {
        this.closeEditor();
        return;
      }
      input.value = this.dateTimeInput.toInput(AppClock.now());
      input.setCustomValidity('');
      editor.hidden = false;
      this.querySelector('[data-dev-clock-edit]')?.setAttribute('aria-expanded', 'true');
      input.focus();
    }
  };

  private closeEditor(restoreFocus = true) {
    const editor = this.querySelector<HTMLFormElement>('[data-dev-clock-editor]');
    if (!editor || editor.hidden) return;
    editor.hidden = true;
    const toggle = this.querySelector<HTMLButtonElement>('[data-dev-clock-edit]');
    toggle?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle?.focus();
  }

  private handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const input = this.querySelector<HTMLInputElement>('[data-dev-clock-input]');
    if (!input || !input.reportValidity()) return;
    const instant = this.dateTimeInput.toInstant(input.value);
    if (!instant) {
      input.setCustomValidity(input.dataset.invalidTime ?? 'Invalid date and time.');
      input.reportValidity();
      return;
    }
    window.devClock?.set(instant.toISOString());
    this.closeEditor();
  };

  private handleInput = () => {
    this.querySelector<HTMLInputElement>('[data-dev-clock-input]')?.setCustomValidity('');
  };

  private handleKeydown = (event: KeyboardEvent) => {
    const editor = this.querySelector<HTMLFormElement>('[data-dev-clock-editor]');
    if (event.key !== 'Escape' || !editor || editor.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeEditor();
  };

  private place = () => {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    const parent = doc.fullscreenElement ?? doc.webkitFullscreenElement ?? this.home;
    if (parent?.isConnected && this.parentElement !== parent) parent.append(this);
  };
}

if (!customElements.get('dev-clock-indicator')) {
  customElements.define('dev-clock-indicator', DevelopmentClockIndicator);
}
