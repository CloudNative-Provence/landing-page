import { AppClock } from '~/shared/time/app-clock';
import type { ProgramRoom, ProgramSession } from '../../program/model/schedule';
import { ProgramLiveView } from '../../program/services/live-view';
import { ProgramSelectionStore } from '../../program/services/selection-store';
import { type VenueInterface, venueInterface } from '../content/interface';
import { venuePresentation } from '../model/venue-presentation';
import { VenueCardLayout } from '../rendering/venue-card-layout';
import { VenuePopoverLayout } from '../rendering/venue-popover-layout';
import type { ProjectedRoom, VenueScene } from '../rendering/venue-scene';
import type { VenueTheme } from '../rendering/venue-theme';
import { VenueFullscreen } from '../services/venue-fullscreen';
import { VenueProgram } from '../services/venue-program';

interface VenueConfig {
  lang: 'fr' | 'en';
  timeZone: string;
  programEnabled: boolean;
  rooms: ProgramRoom[];
  sessions: ProgramSession[];
}

class VenueMapElement extends HTMLElement {
  private config!: VenueConfig;
  private copy!: VenueInterface;
  private program!: VenueProgram;
  private store!: ProgramSelectionStore;
  private selectedIds = new Set<string>();
  private selectedRoom: string | null = null;
  private plannedRooms = new Set<string>();
  private startingSoonRooms = new Set<string>();
  private startingSoonSessions = new Set<string>();
  private agendaOpen = false;
  private panelOpener: HTMLElement | SVGElement | null = null;
  private scene: VenueScene | null = null;
  private fullscreen: VenueFullscreen | null = null;
  private fullscreenActive = false;
  private projectedRooms: ProjectedRoom[] = [];
  private globalRoomIds = new Set<string>();
  private unsubscribe: (() => void) | null = null;
  private observer: IntersectionObserver | null = null;
  private themeObserver: MutationObserver | null = null;
  private popoverObserver: ResizeObserver | null = null;
  private connectorObserver: ResizeObserver | null = null;
  private timer: number | null = null;
  private connection = 0;
  private mobile = window.matchMedia('(max-width: 760px)');
  private timeFormat!: Intl.DateTimeFormat;

  connectedCallback() {
    const configText = this.querySelector('[data-venue-config]')?.textContent;
    if (!configText) return;
    this.config = JSON.parse(configText) as VenueConfig;
    this.copy = venueInterface[this.config.lang];
    this.setHidden('[data-load-status]', false);
    this.program = new VenueProgram(this.config.sessions, this.config.rooms);
    this.store = new ProgramSelectionStore({
      validIds: this.program.validIds,
      canonicalIds: this.program.canonicalIds,
    });
    this.selectedIds = new Set(this.store.getIds());
    this.timeFormat = new Intl.DateTimeFormat(this.config.lang, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.config.timeZone,
    });
    const requestedRoom = new URL(location.href).searchParams.get('room');
    this.selectedRoom = this.isPublicRoom(requestedRoom) ? requestedRoom : null;
    this.unsubscribe = this.store.subscribe((ids) => {
      this.selectedIds = new Set(ids);
      this.refresh();
    });
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('pointerdown', this.handleRoomListOutside);
    const panel = this.querySelector<HTMLElement>('[data-panel]');
    panel?.addEventListener('toggle', this.handlePopoverToggle);
    this.popoverObserver = new ResizeObserver(this.positionPopover);
    if (panel) this.popoverObserver.observe(panel);
    this.connectorObserver = new ResizeObserver(this.positionGlobalCard);
    for (const element of this.querySelectorAll('.venue-canvas-wrap, [data-global-card]')) {
      this.connectorObserver.observe(element);
    }
    window.addEventListener('resize', this.positionPopover);
    window.addEventListener('scroll', this.positionPopover, { capture: true, passive: true });
    window.visualViewport?.addEventListener('resize', this.positionPopover);
    window.visualViewport?.addEventListener('scroll', this.positionPopover);
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener(AppClock.changeEvent, this.handleVisibility);
    this.mobile.addEventListener('change', this.handleViewport);
    this.themeObserver = new MutationObserver(() => this.scene?.setTheme(this.currentTheme()));
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    this.fullscreen = new VenueFullscreen(this, this.updateFullscreen);
    this.setHidden('[data-view-controls]', false);
    this.refresh();
    const connection = ++this.connection;
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.observer?.disconnect();
            void this.loadScene(connection);
          }
        },
        { rootMargin: '250px' }
      );
      this.observer.observe(this);
    } else {
      void this.loadScene(connection);
    }
  }

  disconnectedCallback() {
    this.connection++;
    this.fullscreen?.dispose();
    this.fullscreen = null;
    this.fullscreenActive = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.observer?.disconnect();
    this.observer = null;
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.popoverObserver?.disconnect();
    this.popoverObserver = null;
    this.connectorObserver?.disconnect();
    this.connectorObserver = null;
    this.querySelector('[data-panel]')?.removeEventListener('toggle', this.handlePopoverToggle);
    window.removeEventListener('resize', this.positionPopover);
    window.removeEventListener('scroll', this.positionPopover, true);
    window.visualViewport?.removeEventListener('resize', this.positionPopover);
    window.visualViewport?.removeEventListener('scroll', this.positionPopover);
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.scene?.dispose();
    this.scene = null;
    this.projectedRooms = [];
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('pointerdown', this.handleRoomListOutside);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener(AppClock.changeEvent, this.handleVisibility);
    this.mobile.removeEventListener('change', this.handleViewport);
  }

  private async loadScene(connection: number) {
    try {
      const { VenueScene } = await import('../rendering/venue-scene');
      if (!this.isConnected || connection !== this.connection) return;
      const container = this.querySelector<HTMLElement>('[data-renderer]');
      if (!container) return;
      this.scene = new VenueScene({
        container,
        theme: this.currentTheme(),
        canSelectRoom: (id) => this.isPublicRoom(id),
        onSelect: (id) => this.selectRoom(id),
        onProject: (positions) => this.positionLabels(positions),
        onUnavailable: () => this.showFallback(),
      });
      this.scene.select(this.selectedRoom);
      this.scene.setPlannedRooms(this.plannedRooms);
      this.setHidden('[data-fallback]', true);
      this.setHidden('[data-labels]', false);
      this.setHidden('[data-session-cards]', !this.config.programEnabled);
      this.setHidden('[data-load-status]', true);
      this.setHidden('[data-scene-controls]', false);
      this.handleViewport();
      this.dataset.rendererReady = 'true';
      this.positionPopover();
    } catch {
      if (connection === this.connection) this.showFallback();
    }
  }

  private currentTheme(): VenueTheme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  private showFallback() {
    this.scene?.dispose();
    this.scene = null;
    this.setHidden('[data-fallback]', false);
    this.setHidden('[data-labels]', true);
    this.setHidden('[data-session-cards]', true);
    this.setHidden('[data-scene-controls]', true);
    this.setHidden('[data-action="interact"]', true);
    const status = this.querySelector<HTMLElement>('[data-load-status]');
    if (status) {
      status.textContent = this.copy.fallback;
      status.hidden = false;
    }
    this.dataset.rendererReady = 'fallback';
    this.positionGlobalCard();
    this.positionPopover();
  }

  private positionLabels(positions: ProjectedRoom[]) {
    this.projectedRooms = positions;
    const canvas = this.querySelector<HTMLElement>('[data-labels]');
    if (!canvas) return;
    this.positionRoomCards(positions);
    const placed: { left: number; right: number; top: number; bottom: number }[] = [];
    // Keep the main entrance visible, then prefer the selected room and main spaces on narrow screens.
    const priority = [
      'milhaud',
      'amphitheatre',
      'forbin',
      'sainte-victoire',
      'picasso',
      'sponsors',
      'amphitheatre-access',
      'accueil',
      'terrasse-picasso',
    ];
    const rank = (id: string) =>
      id === 'entrance' ? -2 : id === this.selectedRoom ? -1 : priority.includes(id) ? priority.indexOf(id) : 100;
    for (const position of [...positions].sort((a, b) => rank(a.id) - rank(b.id))) {
      const label = canvas.querySelector<HTMLButtonElement>(`.venue-room-label[data-room="${position.id}"]`);
      if (!label) continue;
      const width = label.offsetWidth || 90;
      const height = label.offsetHeight || 28;
      const x = Math.max(width / 2 + 4, Math.min(canvas.clientWidth - width / 2 - 4, position.x));
      const y = Math.max(height / 2 + 4, Math.min(canvas.clientHeight - height / 2 - 4, position.y));
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;
      const box = {
        left: x - width / 2 - 3,
        right: x + width / 2 + 3,
        top: y - height / 2 - 3,
        bottom: y + height / 2 + 3,
      };
      const overlap = placed.some(
        (other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top
      );
      label.style.visibility = position.visible && !overlap ? 'visible' : 'hidden';
      if (position.visible && !overlap) placed.push(box);
    }
    this.positionGlobalCard();
    this.positionPopover();
  }

  private positionGlobalCard = () => {
    const connectors = this.querySelector<SVGSVGElement>('[data-global-connectors]');
    const card = this.querySelector<HTMLElement>('[data-global-card]');
    const viewport = this.querySelector<HTMLElement>('[data-model-viewport]');
    if (!connectors || !card || !viewport || !connectors.parentElement) return;
    if (card.hidden) {
      connectors.style.display = 'none';
      return;
    }
    const frame = connectors.parentElement.getBoundingClientRect();
    const model = viewport.getBoundingClientRect();
    const rooms = this.scene
      ? this.projectedRooms
          .filter((room) => room.visible)
          .map((room) => ({
            id: room.id,
            center: {
              x: room.center.x + model.left - frame.left,
              y: room.center.y + model.top - frame.top,
            },
            outline: room.outline.map((point) => ({
              x: point.x + model.left - frame.left,
              y: point.y + model.top - frame.top,
            })),
          }))
      : venuePresentation.rooms.flatMap((room) => {
          const polygon = this.querySelector<SVGPolygonElement>(`.venue-fallback polygon[data-room="${room.id}"]`);
          const matrix = polygon?.getScreenCTM();
          if (!matrix) return [];
          const outline = room.polygon.map(([x, y]) => {
            const point = new DOMPoint(x, y).matrixTransform(matrix);
            return { x: point.x - frame.left, y: point.y - frame.top };
          });
          return [
            {
              id: room.id,
              outline,
              center: VenueCardLayout.center(outline),
            },
          ];
        });
    const controls = this.querySelector<HTMLElement>('[data-view-controls]')?.getBoundingClientRect();
    const placement = VenueCardLayout.placeShared(
      { width: card.offsetWidth, height: card.offsetHeight },
      rooms,
      this.globalRoomIds,
      frame.width,
      controls?.height ? Math.min(frame.height, controls.top - frame.top - 12) : frame.height
    );
    card.style.visibility = placement ? 'visible' : 'hidden';
    connectors.style.display = placement ? 'block' : 'none';
    if (!placement) return;
    card.style.left = `${placement.left}px`;
    card.style.top = `${placement.top}px`;
    for (const group of connectors.querySelectorAll<SVGGElement>('[data-global-connector]')) {
      const connector = placement.connectors.find((item) => item.id === group.dataset.globalConnector);
      group.style.display = connector ? '' : 'none';
      group.removeAttribute('display');
      group.classList.toggle('is-selected', group.dataset.globalConnector === this.selectedRoom);
      if (!connector) continue;
      group
        .querySelector('path')
        ?.setAttribute('d', `M ${connector.start.x} ${connector.start.y} L ${connector.end.x} ${connector.end.y}`);
      const dot = group.querySelector('circle');
      dot?.setAttribute('cx', String(connector.end.x));
      dot?.setAttribute('cy', String(connector.end.y));
    }
  };

  private positionRoomCards(positions: ProjectedRoom[]) {
    const connectors = this.querySelector<SVGSVGElement>('[data-connectors]');
    const viewport = this.querySelector<HTMLElement>('[data-model-viewport]');
    const wrapper = viewport?.parentElement;
    if (!connectors || !viewport || !wrapper) return;
    const cards = [...this.querySelectorAll<HTMLElement>('.venue-room-card')];
    const sizes = cards.map((card) => ({
      id: card.dataset.room ?? '',
      width: card.offsetWidth,
      height: card.offsetHeight,
    }));
    // Set headroom before measuring offsets: changing it also moves the mobile viewport.
    wrapper.style.setProperty('--venue-card-space', `${Math.max(0, ...sizes.map((card) => card.height)) + 8}px`);
    const frame = connectors.getBoundingClientRect();
    const model = viewport.getBoundingClientRect();
    const offsetX = model.left - frame.left;
    const offsetY = model.top - frame.top;
    const clampX = (x: number) => Math.max(0, Math.min(model.width, x)) + offsetX;
    const clampY = (y: number) => Math.max(0, Math.min(model.height, y)) + offsetY;
    const rooms = positions.map((room) => ({
      ...room,
      center: { x: room.center.x + offsetX, y: room.center.y + offsetY },
      x: clampX(room.x),
      y: clampY(room.y),
      outline: room.outline.map((point) => ({ x: clampX(point.x), y: clampY(point.y) })),
      bounds: {
        left: clampX(room.bounds.left),
        right: clampX(room.bounds.right),
        top: clampY(room.bounds.top),
        bottom: clampY(room.bounds.bottom),
      },
    }));
    for (const placement of VenueCardLayout.place(sizes, rooms, frame.width, frame.height)) {
      const card = cards.find((item) => item.dataset.room === placement.id);
      const connector = connectors.querySelector<SVGGElement>(`[data-room-connector="${placement.id}"]`);
      if (!card || !connector) continue;
      card.style.left = `${placement.left}px`;
      card.style.top = `${placement.top}px`;
      connector.style.display = positions.find((room) => room.id === placement.id)?.visible ? '' : 'none';
      connector.classList.toggle('is-selected', placement.id === this.selectedRoom);
      connector
        .querySelector('path')
        ?.setAttribute('d', `M ${placement.start.x} ${placement.start.y} L ${placement.end.x} ${placement.end.y}`);
      const dot = connector.querySelector('circle');
      dot?.setAttribute('cx', String(placement.end.x));
      dot?.setAttribute('cy', String(placement.end.y));
    }
  }

  private handleViewport = () => {
    this.scene?.setInteractive(!this.mobile.matches);
    this.setHidden('[data-action="interact"]', !this.mobile.matches || !this.scene);
    const toggle = this.querySelector<HTMLButtonElement>('[data-action="interact"]');
    toggle?.setAttribute('aria-pressed', 'false');
    if (toggle) {
      toggle.title = this.copy.interact;
      toggle.setAttribute('aria-label', this.copy.interact);
    }
  };

  private handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement | SVGElement>('[data-action], [data-room], [data-save]');
    if (!target) return;
    if (target.dataset.room && this.isPublicRoom(target.dataset.room)) {
      event.preventDefault();
      this.selectRoom(target.dataset.room, target);
      return;
    }
    if (target.dataset.save) {
      const ids = new Set(this.selectedIds);
      if (ids.has(target.dataset.save)) ids.delete(target.dataset.save);
      else ids.add(target.dataset.save);
      this.store.setIds(ids);
      return;
    }
    switch (target.dataset.action) {
      case 'fullscreen':
        this.fullscreen?.toggle();
        break;
      case 'zoom-in':
        this.scene?.zoom(1);
        break;
      case 'zoom-out':
        this.scene?.zoom(-1);
        break;
      case 'reset':
        this.scene?.reset();
        break;
      case 'close':
        this.closePanel();
        break;
      case 'agenda':
        this.panelOpener = target;
        this.agendaOpen = true;
        this.selectedRoom = null;
        this.scene?.select(null);
        this.refresh();
        break;
      case 'interact': {
        const enabled = target.getAttribute('aria-pressed') !== 'true';
        this.scene?.setInteractive(enabled);
        target.setAttribute('aria-pressed', String(enabled));
        const label = enabled ? this.copy.stopInteract : this.copy.interact;
        target.setAttribute('title', label);
        target.setAttribute('aria-label', label);
        break;
      }
    }
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    const rooms = this.querySelector<HTMLDetailsElement>('.venue-room-list');
    if (rooms?.open) {
      event.preventDefault();
      rooms.open = false;
      rooms.querySelector<HTMLElement>('summary')?.focus();
    }
    if (this.selectedRoom || this.agendaOpen) {
      event.preventDefault();
      this.closePanel();
    }
  };

  private updateFullscreen = (active: boolean) => {
    const entering = active && !this.fullscreenActive;
    this.fullscreenActive = active;
    const button = this.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
    const label = active ? this.copy.exitFullscreen : this.copy.fullscreen;
    button?.setAttribute('aria-pressed', String(active));
    button?.setAttribute('aria-label', label);
    button?.setAttribute('title', label);
    this.setHidden('[data-fullscreen-enter]', active);
    this.setHidden('[data-fullscreen-exit]', !active);
    if (entering) {
      const rooms = this.querySelector<HTMLDetailsElement>('.venue-room-list');
      if (rooms) rooms.open = false;
      if (this.selectedRoom || this.agendaOpen) {
        this.closePanel(false);
        button?.focus({ preventScroll: true });
      }
    }
    this.scene?.resize();
    this.positionPopover();
  };

  private handleRoomListOutside = (event: PointerEvent) => {
    const rooms = this.querySelector<HTMLDetailsElement>('.venue-room-list');
    if (rooms?.open && event.target instanceof Node && !rooms.contains(event.target)) rooms.open = false;
  };

  private handlePopoverToggle = () => {
    const panel = this.querySelector<HTMLElement>('[data-panel]');
    // Native light-dismiss can race with a click that opens another room.
    if (!panel?.matches(':popover-open') && (this.selectedRoom || this.agendaOpen)) this.closePanel(false);
  };

  private closePanel(restoreFocus = true) {
    this.agendaOpen = false;
    this.selectedRoom = null;
    this.scene?.select(null);
    this.refresh();
    if (!restoreFocus) return;
    const opener = this.panelOpener;
    if (opener?.isConnected && opener.getClientRects().length && getComputedStyle(opener).visibility !== 'hidden') {
      opener.focus({ preventScroll: true });
    } else {
      this.querySelector<HTMLElement>(
        this.fullscreenActive ? '[data-action="fullscreen"]' : '.venue-room-list summary'
      )?.focus({ preventScroll: true });
    }
  }

  private isPublicRoom(id: string | null): id is string {
    return !!id && !!this.copy.roomDetails[id]?.trim() && venuePresentation.rooms.some((room) => room.id === id);
  }

  private roomName(id: string): string {
    const room = venuePresentation.rooms.find((room) => room.id === id);
    return this.copy.roomNames[id] ?? room?.name ?? id;
  }

  private selectRoom(id: string, opener?: HTMLElement | SVGElement) {
    if (!this.isPublicRoom(id)) return;
    const rooms = this.querySelector<HTMLDetailsElement>('.venue-room-list');
    if (rooms) rooms.open = false;
    if (opener?.closest('.venue-room-list')) {
      this.panelOpener = rooms?.querySelector<HTMLElement>('summary') ?? null;
    } else {
      this.panelOpener =
        opener && !opener.closest('[data-panel]')
          ? opener
          : this.querySelector<HTMLButtonElement>(`.venue-room-label[data-room="${id}"]`);
    }
    this.selectedRoom = id;
    this.agendaOpen = false;
    this.scene?.select(id);
    this.refresh();
    this.querySelector<HTMLElement>('[data-room-title]')?.focus({ preventScroll: true });
    const announcement = this.querySelector('[data-announcement]');
    if (announcement) announcement.textContent = `${this.copy.roomSelected} ${this.roomName(id)}`;
  }

  private refresh() {
    const focusedId = (document.activeElement as HTMLElement | null)?.dataset.save;
    const now = AppClock.now();
    this.startingSoonSessions = new Set(
      this.program.getStartingSoonSavedSessions(this.selectedIds, now).map((session) => session.id)
    );
    const startingSoonProgramRooms = new Set(this.program.getStartingSoonRoomIds(this.selectedIds, now));
    this.startingSoonRooms = new Set(
      venuePresentation.rooms
        .filter((room) => room.programRoomId && startingSoonProgramRooms.has(room.programRoomId))
        .map((room) => room.id)
    );
    const plannedProgramRooms = new Set([
      ...this.program.getPlannedRoomIds(this.selectedIds, now),
      ...startingSoonProgramRooms,
    ]);
    this.plannedRooms = new Set(
      venuePresentation.rooms
        .filter((room) => room.programRoomId && plannedProgramRooms.has(room.programRoomId))
        .map((room) => room.id)
    );
    this.scene?.setPlannedRooms(this.plannedRooms);
    this.renderPanel();
    this.renderAgendaStrip(now);
    this.querySelectorAll<HTMLElement>('[data-room]').forEach((element) => {
      const selected = element.dataset.room === this.selectedRoom;
      if (element.tagName === 'BUTTON') {
        element.setAttribute('aria-pressed', String(selected));
      }
      if (element.matches('button, a')) {
        element.setAttribute('aria-expanded', String(selected));
        element.setAttribute('aria-haspopup', 'dialog');
        element.setAttribute('aria-controls', 'venue-room-details');
      }
      element.classList.toggle('is-selected', selected);
      const planned = this.plannedRooms.has(element.dataset.room ?? '');
      element.classList.toggle('is-planned', planned);
      element.querySelector('[data-room-planned]')?.toggleAttribute('hidden', !planned);
      const startingSoon = this.startingSoonRooms.has(element.dataset.room ?? '');
      element.classList.toggle('is-starting-soon', startingSoon);
      element.classList.toggle('session-starting-soon', startingSoon && element.tagName === 'BUTTON');
      element.querySelector('[data-room-starting-soon]')?.toggleAttribute('hidden', !startingSoon);
      const fallbackLabel = element.querySelector('.venue-flat-planned-label');
      if (fallbackLabel) fallbackLabel.textContent = startingSoon ? this.copy.startingSoon : this.copy.plannedSession;
    });
    this.renderRoomLabels();
    this.renderGlobalSession();
    if (this.scene && this.projectedRooms.length) this.positionLabels(this.projectedRooms);
    this.syncPopover();
    if (focusedId) {
      const focusTarget =
        this.querySelector<HTMLElement>(`[data-save="${CSS.escape(focusedId)}"]`) ??
        this.querySelector<HTMLElement>('[data-room-sessions] [data-save]') ??
        this.querySelector<HTMLElement>('[data-room-title]');
      focusTarget?.focus({ preventScroll: true });
    }
    this.scheduleRefresh();
  }

  private syncPopover() {
    const panel = this.querySelector<HTMLElement>('[data-panel]');
    if (!panel) return;
    const open = !!this.selectedRoom || this.agendaOpen;
    this.querySelectorAll('[data-action="agenda"]').forEach((button) => {
      button.setAttribute('aria-expanded', String(this.agendaOpen));
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', panel.id);
    });
    if (open && !panel.matches(':popover-open')) {
      panel.showPopover();
      this.positionPopover();
      panel.querySelector<HTMLElement>('[data-room-title]')?.focus({ preventScroll: true });
    } else if (!open && panel.matches(':popover-open')) {
      panel.hidePopover();
    } else if (open) this.positionPopover();
  }

  private positionPopover = () => {
    const panel = this.querySelector<HTMLElement>('[data-panel]');
    if (!panel?.matches(':popover-open')) return;
    const visible = (element: Element | null): element is Element =>
      !!element && !!element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
    const roomAnchor = this.selectedRoom
      ? [
          ...this.querySelectorAll(
            `.venue-room-label[data-room="${this.selectedRoom}"], .venue-fallback a[data-room="${this.selectedRoom}"]`
          ),
        ].find(visible)
      : null;
    const anchor = roomAnchor ?? (visible(this.panelOpener) ? this.panelOpener : this.querySelector('.venue-heading'));
    if (!anchor) return;
    const screen = window.visualViewport;
    const viewport = {
      left: screen?.offsetLeft ?? 0,
      top: screen?.offsetTop ?? 0,
      right: (screen?.offsetLeft ?? 0) + (screen?.width ?? window.innerWidth),
      bottom: (screen?.offsetTop ?? 0) + (screen?.height ?? window.innerHeight),
    };
    panel.style.maxWidth = `${Math.max(0, viewport.right - viewport.left - 24)}px`;
    panel.style.maxHeight = `${Math.max(0, viewport.bottom - viewport.top - 24)}px`;
    const projected = this.projectedRooms.find((room) => room.id === this.selectedRoom);
    const model = this.querySelector('[data-model-viewport]')?.getBoundingClientRect();
    const room =
      this.scene && projected && model
        ? {
            left: projected.bounds.left + model.left,
            right: projected.bounds.right + model.left,
            top: projected.bounds.top + model.top,
            bottom: projected.bounds.bottom + model.top,
          }
        : undefined;
    const placement = VenuePopoverLayout.place(
      anchor.getBoundingClientRect(),
      panel.getBoundingClientRect(),
      viewport,
      room
    );
    panel.style.left = `${placement.left}px`;
    panel.style.top = `${placement.top}px`;
  };

  private renderRoomLabels() {
    const now = AppClock.now();
    this.querySelectorAll<HTMLButtonElement>('.venue-room-label').forEach((button) => {
      const room = venuePresentation.rooms.find((item) => item.id === button.dataset.room);
      const state = room?.programRoomId ? this.program.getRoomState(room.programRoomId, now) : null;
      const liveSessions = state?.current ?? [];
      const currentLocation = this.sessionLocationLabel(liveSessions[0]?.id, room?.programRoomId);
      const nextLocation = this.sessionLocationLabel(state?.next[0]?.id, room?.programRoomId);
      const currentTitle = [...new Set(liveSessions.map((session) => session.title))].join(' · ');
      const nextTitle = [...new Set(state?.next.map((session) => session.title))].join(' · ');
      const nextSession = state?.next[0];
      const nextTime = nextSession
        ? [this.copy.next, this.time(nextSession.startsAt), nextLocation].filter(Boolean).join(' · ')
        : '';
      const live = button.querySelector<HTMLElement>('[data-label-live]');
      const upcoming = button.querySelector<HTMLElement>('[data-label-next]');
      if (live) live.hidden = !currentTitle;
      if (upcoming) upcoming.hidden = !nextTitle;
      const liveText = button.querySelector<HTMLElement>('[data-live-title]');
      const nextText = button.querySelector<HTMLElement>('[data-next-title]');
      const timeText = button.querySelector<HTMLElement>('[data-next-time]');
      const locationText = button.querySelector<HTMLElement>('[data-live-location]');
      if (locationText) {
        locationText.textContent = currentLocation;
        locationText.hidden = !currentLocation;
      }
      if (liveText) liveText.textContent = currentTitle;
      if (nextText) nextText.textContent = nextTitle;
      if (timeText) timeText.textContent = nextTime;
      button.classList.toggle('has-sessions', !!currentTitle || !!nextTitle);
      const tooltip = [
        this.startingSoonRooms.has(room?.id ?? '') ? this.copy.startingSoon : '',
        this.plannedRooms.has(room?.id ?? '') ? this.copy.plannedSession : '',
        [currentLocation, currentTitle].filter(Boolean).join(' · '),
        nextTitle ? `${nextTime} : ${nextTitle}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      if (tooltip) button.title = tooltip;
      else button.removeAttribute('title');
    });
  }

  private renderGlobalSession() {
    const card = this.querySelector<HTMLElement>('[data-global-card]');
    if (!card) return;
    const state = this.program.getHallwayState();
    const isLive = state.current.length > 0;
    const sessions = this.config.programEnabled ? (isLive ? state.current : state.next) : [];
    const startingSoon = sessions.some((session) => this.startingSoonSessions.has(session.id));
    card.classList.toggle('session-starting-soon', startingSoon);
    card.querySelector('[data-global-starting-soon]')?.toggleAttribute('hidden', !startingSoon);
    const roomIds = new Set(sessions.flatMap((session) => this.program.getSessionRoomIds(session.id)));
    this.globalRoomIds = new Set(
      venuePresentation.rooms
        .filter((room) => room.programRoomId && roomIds.has(room.programRoomId))
        .map((room) => room.id)
    );
    const title = [...new Set(sessions.map((session) => session.title))].join(' · ');
    card.hidden = !title;
    const titleText = card.querySelector<HTMLElement>('[data-global-title]');
    const timeText = card.querySelector<HTMLElement>('[data-global-time]');
    const statusText = card.querySelector<HTMLElement>('[data-global-status]');
    const roomText = card.querySelector<HTMLElement>('[data-global-rooms]');
    card.querySelector('[data-global-live]')?.toggleAttribute('hidden', !isLive);
    if (statusText) statusText.textContent = isLive ? this.copy.current : this.copy.next;
    if (titleText) titleText.textContent = title;
    if (roomText) {
      roomText.textContent = [...this.globalRoomIds].map((id) => this.roomName(id)).join(' · ');
    }
    if (timeText) {
      const starts = sessions.map((session) => Date.parse(session.startsAt));
      const ends = sessions.map((session) => Date.parse(session.endsAt));
      timeText.textContent = sessions.length
        ? `${this.time(new Date(Math.min(...starts)).toISOString())} – ${this.time(new Date(Math.max(...ends)).toISOString())}`
        : '';
    }
    this.positionGlobalCard();
  }

  private renderPanel() {
    const title = this.querySelector<HTMLElement>('[data-room-title]');
    const description = this.querySelector<HTMLElement>('[data-room-description]');
    const container = this.querySelector<HTMLElement>('[data-room-sessions]');
    const allContainer = this.querySelector<HTMLElement>('[data-all-session-list]');
    if (!title || !description || !container || !allContainer) return;
    container.replaceChildren();
    allContainer.replaceChildren();
    this.setHidden('[data-all-sessions]', true);
    this.setHidden('[data-live-note]', true);
    this.setHidden('[data-room-note]', true);
    this.setHidden('[data-related-room]', true);
    if (this.agendaOpen) {
      title.textContent = this.copy.agenda;
      description.textContent = this.copy.savedAgenda;
      const sessions = this.program.sessions.filter((session) => this.selectedIds.has(session.id));
      if (!sessions.length) container.append(this.text('p', this.copy.emptySaved, 'venue-empty'));
      sessions.forEach((session) => container.append(this.sessionCard(session, true)));
      return;
    }
    const room = venuePresentation.rooms.find((item) => item.id === this.selectedRoom);
    if (!room) return;
    title.textContent = this.roomName(room.id);
    description.textContent = this.copy.roomDetails[room.id] ?? '';
    const note = this.querySelector<HTMLElement>('[data-room-note]');
    if (note && room.level) {
      note.textContent = this.copy.firstFloor;
      note.hidden = false;
    }
    const relatedRoom = this.querySelector<HTMLButtonElement>('[data-related-room]');
    if (relatedRoom && room.relatedRoomId) {
      relatedRoom.dataset.room = room.relatedRoomId;
      relatedRoom.textContent = room.level ? this.copy.viewAccess : this.copy.viewAmphitheatre;
      relatedRoom.hidden = false;
    }
    if (!this.config.programEnabled) {
      container.append(this.text('p', this.copy.programUnavailable, 'venue-empty'));
      return;
    }
    if (!room.programRoomId) return;
    const state = this.program.getRoomState(room.programRoomId);
    const visible = [...state.current, ...state.next];
    if (!visible.length)
      container.append(
        this.text('p', state.sessions.length ? this.copy.noCurrent : this.copy.noSessions, 'venue-empty')
      );
    visible.forEach((session) => container.append(this.sessionCard(session)));
    const remaining = state.sessions.filter((session) => !visible.some((item) => item.id === session.id));
    this.setHidden('[data-all-sessions]', !remaining.length);
    remaining.forEach((session) => allContainer.append(this.sessionCard(session)));
    this.setHidden('[data-live-note]', !state.sessions.length);
  }

  private sessionCard(session: ProgramSession, showRoom = false): HTMLElement {
    const article = this.text('article', '', 'venue-session');
    const startingSoon = this.startingSoonSessions.has(session.id);
    article.classList.toggle('session-starting-soon', startingSoon);
    const kicker = this.text('div', '', 'venue-session-kicker');
    const state = ProgramLiveView.getState(session, AppClock.now());
    const badge = this.text(
      'span',
      startingSoon
        ? this.copy.startingSoon
        : state === 'live'
          ? this.copy.current
          : state === 'past'
            ? this.copy.past
            : this.copy.next,
      startingSoon ? 'session-reminder-label' : `venue-session-status${state === 'live' ? ' is-live' : ''}`
    );
    kicker.append(badge, this.text('span', `${this.time(session.startsAt)} – ${this.time(session.endsAt)}`));
    article.append(kicker, this.text('h3', session.title));
    if (!showRoom) {
      const room = venuePresentation.rooms.find((item) => item.id === this.selectedRoom);
      const location = this.sessionLocationLabel(session.id, room?.programRoomId);
      if (location) article.append(this.text('p', location, 'venue-session-speakers'));
    }
    if (session.speakers?.length)
      article.append(
        this.text('p', session.speakers.map((speaker) => speaker.name).join(' · '), 'venue-session-speakers')
      );
    if (showRoom) {
      const rooms = this.sessionRooms(session.id);
      for (const room of rooms) {
        const location = this.sessionLocationLabel(session.id, room.programRoomId);
        const label = [this.roomName(room.id), location].filter(Boolean).join(' · ');
        const link = this.text('button', `${label} ↗`, 'venue-agenda-room') as HTMLButtonElement;
        link.type = 'button';
        link.dataset.room = room.id;
        article.append(link);
      }
      if (!rooms.length) article.append(this.text('p', this.copy.globalSession, 'venue-session-speakers'));
    }
    const saved = this.selectedIds.has(session.id);
    const button = this.text(
      'button',
      `${saved ? '✓' : '+'}  ${saved ? this.copy.saved : this.copy.save}`,
      'venue-save'
    ) as HTMLButtonElement;
    button.type = 'button';
    button.dataset.save = session.id;
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? this.copy.remove : this.copy.save} : ${session.title}`);
    article.append(button);
    return article;
  }

  private renderAgendaStrip(now: Date) {
    const count = this.querySelector('[data-agenda-count]');
    if (count) count.textContent = String(this.selectedIds.size);
    const container = this.querySelector('[data-next-saved]');
    if (!container) return;
    container.replaceChildren();
    const next = this.program.getUpcomingSavedSessions(this.selectedIds, now);
    this.setHidden('[data-next-strip]', !next.length);
    if (!next.length) return;
    for (const session of next) {
      const rooms = this.sessionRooms(session.id);
      const preferredRoom = this.preferredSessionRoom(session.id);
      const roomNames = rooms
        .map((room) => {
          const location = this.sessionLocationLabel(session.id, room.programRoomId);
          return `${this.roomName(room.id)}${location ? ` (${location})` : ''}`;
        })
        .join(' · ');
      const button = this.text(
        'button',
        `${this.time(session.startsAt)} · ${session.title}${preferredRoom ? ` · ${this.roomName(preferredRoom.id)}` : ''}`
      ) as HTMLButtonElement;
      button.type = 'button';
      button.title = `${this.time(session.startsAt)} · ${session.title}${roomNames ? ` · ${roomNames}` : ''}`;
      button.setAttribute('aria-label', button.title);
      if (preferredRoom) button.dataset.room = preferredRoom.id;
      else button.dataset.action = 'agenda';
      container.append(button);
    }
  }

  private sessionRooms(sessionId: string) {
    const roomIds = this.program.getSessionRoomIds(sessionId);
    return roomIds.flatMap((id) => venuePresentation.rooms.filter((room) => room.programRoomId === id));
  }

  private preferredSessionRoom(sessionId: string) {
    const roomId = this.program.getPreferredRoomId(sessionId);
    const rooms = venuePresentation.rooms.filter((room) => room.programRoomId === roomId && this.isPublicRoom(room.id));
    return rooms.length === 1 ? rooms[0] : undefined;
  }

  private sessionLocationLabel(sessionId?: string, roomId?: string): string {
    if (!sessionId || !roomId) return '';
    const role = this.program.getSessionLocations(sessionId).find((location) => location.roomId === roomId)?.role;
    return role === 'main' ? this.copy.mainRoom : role === 'broadcast' ? this.copy.broadcastRoom : '';
  }

  private handleVisibility = () => {
    if (!document.hidden) this.refresh();
    else if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  };

  private scheduleRefresh() {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    if (document.hidden) return;
    const next = this.program.getNextBoundary();
    if (next)
      this.timer = window.setTimeout(
        () => this.refresh(),
        Math.min(86_400_000, Math.max(100, next.getTime() - AppClock.timestamp() + 50))
      );
  }

  private time(value: string): string {
    return this.timeFormat.format(new Date(value));
  }

  private setHidden(selector: string, hidden: boolean) {
    const element = this.querySelector(selector);
    element?.toggleAttribute('hidden', hidden);
  }

  private text<K extends keyof HTMLElementTagNameMap>(tag: K, text: string, className = ''): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
}

if (!customElements.get('venue-map')) customElements.define('venue-map', VenueMapElement);
