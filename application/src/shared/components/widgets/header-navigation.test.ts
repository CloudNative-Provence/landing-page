import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppClock } from '~/shared/time/app-clock';

// Minimal DOM fixture: browser rendering is verified separately with Playwright.
class TestElement extends EventTarget {
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  classes = new Set<string>();
  classList = {
    add: (name: string) => this.classes.add(name),
    remove: (name: string) => this.classes.delete(name),
    toggle: (name: string, active: boolean) => (active ? this.classes.add(name) : this.classes.delete(name)),
    contains: (name: string) => this.classes.has(name),
  };
  children: TestElement[] = [];
  parentElement: TestElement | null = null;
  open = false;
  rendered = true;
  visibility = 'visible';

  constructor(readonly tag = 'div') {
    super();
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
      return this.dataset[key] ?? this.attributes.get(name);
    }
    return this.attributes.get(name);
  }
  hasAttribute(name: string) {
    return this.getAttribute(name) !== undefined;
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  append(child: TestElement) {
    this.insertBefore(child, null);
  }
  insertBefore(child: TestElement, reference: TestElement | null) {
    const previous = child.parentElement;
    if (previous) previous.children.splice(previous.children.indexOf(child), 1);
    child.parentElement = this;
    this.children.splice(reference ? this.children.indexOf(reference) : this.children.length, 0, child);
  }
  contains(other: TestElement | null): boolean {
    return this === other || this.children.some((child) => child.contains(other));
  }
  private matches(selector: string): boolean {
    if (selector.startsWith('.')) return this.classes.has(selector.slice(1));
    const attribute = /^(\w*)\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);
    if (attribute) {
      const [, tag, name, value] = attribute;
      return (
        (!tag || tag === this.tag) &&
        this.hasAttribute(name) &&
        (value === undefined || this.getAttribute(name) === value)
      );
    }
    return selector === this.tag;
  }
  querySelectorAll(selector: string): TestElement[] {
    const selectors = selector.split(',').map((part) => part.trim());
    return this.children.flatMap((child) => [
      ...(selectors.some((part) => child.matches(part)) ? [child] : []),
      ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector: string): TestElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }
  closest(selector: string): TestElement | null {
    return this.matches(selector) ? this : (this.parentElement?.closest(selector) ?? null);
  }
  getClientRects() {
    return this.rendered ? [{}] : [];
  }
  focus() {
    testDocument.activeElement = this;
  }
}

type HeaderElement = TestElement & { connectedCallback(): void; disconnectedCallback(): void };
let Header: new () => HeaderElement;
let testDocument: EventTarget & { body: TestElement; activeElement: TestElement | null; hidden: boolean };
let desktop: EventTarget & { matches: boolean };
let connected: HeaderElement[];

beforeAll(async () => {
  vi.stubGlobal('HTMLElement', TestElement);
  vi.stubGlobal('Element', TestElement);
  vi.stubGlobal('Node', TestElement);
  vi.stubGlobal('customElements', {
    get: () => undefined,
    define: (_name: string, constructor: typeof Header) => {
      Header = constructor;
    },
  });
  vi.stubGlobal('getComputedStyle', (element: TestElement) => ({ visibility: element.visibility }));
  await import('./header-navigation');
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-12-09T22:59:30Z'));
  connected = [];
  desktop = Object.assign(new EventTarget(), { matches: false });
  testDocument = Object.assign(new EventTarget(), {
    body: new TestElement('body'),
    activeElement: null as TestElement | null,
    hidden: false,
  });
  vi.stubGlobal('document', testDocument);
  vi.stubGlobal('window', Object.assign(new EventTarget(), { matchMedia: () => desktop, setTimeout, clearTimeout }));
});

afterEach(() => {
  for (const header of connected) header.disconnectedCallback();
  vi.useRealTimers();
});
afterAll(() => vi.unstubAllGlobals());

function child(parent: TestElement, tag: string, attributes: Record<string, string> = {}) {
  const element = new TestElement(tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  parent.append(element);
  return element;
}

function fixture(withEvent = false) {
  const header = new Header();
  const logo = child(header, 'a', { href: '/' });
  const toggle = child(header, 'button', { 'data-aw-toggle-menu': '', 'aria-expanded': 'false' });
  const panel = child(header, 'nav', { 'data-header-panel': '' });
  const primary = child(panel, 'ul');
  primary.classList.add('header-links');
  const section = child(primary, 'li', { 'data-nav-section': 'event' });
  const group = child(section, 'details', { 'data-nav-group': '' });
  const summary = child(group, 'summary');
  const submenu = child(group, 'ul');
  submenu.classList.add('header-submenu');
  const items = ['programme', 'plan', 'sponsoring', 'speakers'].map((id, index) => {
    const item = child(submenu, 'li');
    item.dataset = { navOrder: String(index), navPromotion: ['always', 'event-day', 'other-days', ''][index] };
    const link = child(item, 'a', { href: `/${id}` });
    return { id, item, link };
  });
  if (withEvent) header.dataset = { eventStartsAt: '2026-12-10T09:00:00+01:00', eventTimeZone: 'Europe/Paris' };
  connected.push(header);
  return { header, logo, toggle, panel, primary, group, summary, submenu, items };
}

function fire(target: EventTarget, type: string, properties: Record<string, unknown> = {}) {
  const event = new Event(type, { cancelable: true });
  for (const [name, value] of Object.entries(properties)) Object.defineProperty(event, name, { value });
  target.dispatchEvent(event);
  return event;
}

function itemNames(container: TestElement) {
  return container.children
    .filter((element) => element.dataset.navOrder !== undefined)
    .map((element) => element.querySelector('a')?.getAttribute('href'));
}

describe('responsive header interactions', () => {
  it('toggles the mobile menu, locks scrolling and closes after choosing a link', () => {
    const { header, toggle, items, group } = fixture();
    header.connectedCallback();
    fire(header, 'click', { target: toggle });
    expect(header.hasAttribute('data-menu-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(testDocument.body.classList.contains('header-menu-open')).toBe(true);
    group.open = true;
    fire(header, 'click', { target: items[0].link });
    expect(header.hasAttribute('data-menu-open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(testDocument.body.classList.contains('header-menu-open')).toBe(false);
    expect(group.open).toBe(false);
    fire(header, 'click', { target: toggle });
    fire(header, 'click', { target: toggle });
    expect(header.hasAttribute('data-menu-open')).toBe(false);
    desktop.matches = true;
    fire(header, 'click', { target: toggle });
    expect(header.hasAttribute('data-menu-open')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restores toggle focus on Escape and cycles Tab only around visible mobile links', () => {
    const { header, toggle, logo, items } = fixture();
    header.connectedCallback();
    items[3].link.rendered = false;
    items[2].link.visibility = 'hidden';
    fire(header, 'click', { target: toggle });
    logo.focus();
    expect(fire(header, 'keydown', { key: 'Tab', shiftKey: true }).defaultPrevented).toBe(true);
    expect(testDocument.activeElement).toBe(items[1].link);
    expect(fire(header, 'keydown', { key: 'Tab', shiftKey: false }).defaultPrevented).toBe(true);
    expect(testDocument.activeElement).toBe(logo);
    toggle.focus();
    expect(fire(header, 'keydown', { key: 'Tab', shiftKey: false }).defaultPrevented).toBe(false);
    expect(fire(header, 'keydown', { key: 'Enter' }).defaultPrevented).toBe(false);
    expect(fire(header, 'keydown', { key: 'Escape' }).defaultPrevented).toBe(true);
    expect(testDocument.activeElement).toBe(toggle);
    expect(header.hasAttribute('data-menu-open')).toBe(false);
    expect(fire(header, 'keydown', { key: 'Tab' }).defaultPrevented).toBe(false);
    expect(fire(header, 'keydown', { key: 'Escape' }).defaultPrevented).toBe(false);
  });

  it('closes desktop dropdowns on Escape, outside click and focus departure', () => {
    desktop.matches = true;
    const { header, group, summary, items } = fixture();
    header.connectedCallback();
    group.open = true;
    items[0].link.focus();
    fire(header, 'keydown', { key: 'Escape' });
    expect(group.open).toBe(false);
    expect(testDocument.activeElement).toBe(summary);
    group.open = true;
    fire(testDocument, 'pointerdown', { target: items[0].link });
    expect(group.open).toBe(true);
    fire(testDocument, 'pointerdown', { target: new TestElement() });
    expect(group.open).toBe(false);
    group.open = true;
    fire(header, 'focusout', { relatedTarget: items[0].link });
    expect(group.open).toBe(true);
    fire(header, 'focusout', { relatedTarget: null });
    expect(group.open).toBe(false);
    desktop.matches = false;
    group.open = true;
    fire(header, 'focusout', { relatedTarget: null });
    expect(group.open).toBe(true);
  });

  it('keeps focus reachable when the viewport changes and closes menus on history restore', () => {
    const { header, toggle, group, summary, items, logo } = fixture();
    header.connectedCallback();
    fire(header, 'click', { target: toggle });
    group.open = true;
    items[0].link.focus();
    desktop.matches = true;
    desktop.dispatchEvent(new Event('change'));
    expect(testDocument.activeElement).toBe(summary);
    expect(header.hasAttribute('data-menu-open')).toBe(false);
    items[0].link.focus();
    desktop.matches = false;
    desktop.dispatchEvent(new Event('change'));
    expect(testDocument.activeElement).toBe(toggle);
    logo.focus();
    desktop.dispatchEvent(new Event('change'));
    expect(testDocument.activeElement).toBe(logo);
    fire(header, 'click', { target: toggle });
    window.dispatchEvent(new Event('pageshow'));
    expect(header.hasAttribute('data-menu-open')).toBe(false);
  });
});

describe('event-day navigation', () => {
  it('promotes the plan at Paris midnight, preserves focus and updates active dropdown styling', () => {
    const { header, primary, submenu, items, group, summary } = fixture(true);
    const sponsoring = items[2];
    sponsoring.link.setAttribute('aria-current', 'page');
    header.connectedCallback();
    expect(itemNames(primary)).toEqual(['/programme', '/sponsoring']);
    expect(itemNames(submenu)).toEqual(['/plan', '/speakers']);
    expect(summary.classList.contains('is-active')).toBe(false);
    sponsoring.link.focus();
    vi.advanceTimersByTime(30_000);
    expect(header.dataset.eventDay).toBe('true');
    expect(itemNames(primary)).toEqual(['/programme', '/plan']);
    expect(itemNames(submenu)).toEqual(['/sponsoring', '/speakers']);
    expect(sponsoring.link.classList.contains('header-sublink')).toBe(true);
    expect(sponsoring.link.classList.contains('header-link')).toBe(false);
    expect(items[1].link.classList.contains('header-link')).toBe(true);
    expect(summary.classList.contains('is-active')).toBe(true);
    expect(group.open).toBe(true);
    expect(testDocument.activeElement).toBe(sponsoring.link);
    expect(vi.getTimerCount()).toBe(1);
    // Remaining on the same day does not repeatedly move links or reopen groups.
    group.open = false;
    vi.advanceTimersByTime(60_000);
    expect(group.open).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
  });

  it('refreshes on clock changes and visibility resume, and cleans up on disconnect/reconnect', () => {
    const { header, primary, items, group } = fixture(true);
    header.connectedCallback();
    testDocument.hidden = true;
    testDocument.dispatchEvent(new Event('visibilitychange'));
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(new Date('2026-12-10T12:00:00Z'));
    testDocument.hidden = false;
    testDocument.dispatchEvent(new Event('visibilitychange'));
    expect(itemNames(primary)).toEqual(['/programme', '/plan']);
    expect(vi.getTimerCount()).toBe(1);
    items[0].link.focus();
    vi.setSystemTime(new Date('2026-12-11T12:00:00Z'));
    window.dispatchEvent(new Event(AppClock.changeEvent));
    expect(itemNames(primary)).toEqual(['/programme', '/sponsoring']);
    expect(testDocument.activeElement).toBe(items[0].link);
    expect(group.open).toBe(false);
    header.disconnectedCallback();
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(new Date('2026-12-10T12:00:00Z'));
    window.dispatchEvent(new Event(AppClock.changeEvent));
    expect(itemNames(primary)).toEqual(['/programme', '/sponsoring']);
    header.connectedCallback();
    header.connectedCallback();
    expect(itemNames(primary)).toEqual(['/programme', '/plan']);
    expect(vi.getTimerCount()).toBe(1);
  });
});
