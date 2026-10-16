import {
  Box3,
  BufferGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  InstancedMesh,
  LineLoop,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type OrthographicCamera,
  type Scene,
  Shape,
  Vector3,
} from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface RenderedFrame {
  scene: Scene;
  camera: OrthographicCamera;
}

const boundary = vi.hoisted(() => ({
  createCanvas: vi.fn(),
  failRenderer: false,
  render: vi.fn<(scene: Scene, camera: OrthographicCamera) => void>(),
  setSize: vi.fn(),
  setPixelRatio: vi.fn(),
  rendererDispose: vi.fn(),
  loseContext: vi.fn(),
  controlsDispose: vi.fn(),
  controls: null as null | { enabled: boolean; change: () => void },
}));

// Keep Three's actual geometry, camera, matrices, raycaster and scene graph.
// Only WebGL creation/rendering crosses the unavailable GPU boundary in Node.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: class {
      domElement: TestCanvas;
      shadowMap = {};
      setClearColor = vi.fn();
      setPixelRatio = boundary.setPixelRatio;
      setSize = boundary.setSize;
      dispose = boundary.rendererDispose;
      forceContextLoss = boundary.loseContext;

      constructor() {
        if (boundary.failRenderer) throw new Error('WebGL unavailable');
        this.domElement = boundary.createCanvas();
      }

      render(scene: Scene, camera: OrthographicCamera): void {
        // WebGLRenderer normally propagates transforms before rendering/picking.
        scene.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        boundary.render(scene, camera);
      }
    },
  };
});

vi.mock('three/addons/controls/OrbitControls.js', async () => {
  const { EventDispatcher, Vector3 } = await vi.importActual<typeof import('three')>('three');
  return {
    OrbitControls: class extends EventDispatcher<{ change: object }> {
      target = new Vector3();
      enabled = true;
      dispose = boundary.controlsDispose;

      constructor(private readonly camera: OrthographicCamera) {
        super();
        boundary.controls = this;
      }

      update(): void {
        this.camera.lookAt(this.target);
        this.camera.updateMatrixWorld(true);
        this.change();
      }

      change(): void {
        this.dispatchEvent({ type: 'change' });
      }
    },
  };
});

import { venueInterfaceFr } from '../content/fr';
import { venueLayout } from '../model/venue-layout';
import { detachedAmphitheatre } from '../model/venue-presentation';
import { type ProjectedRoom, VenueScene } from './venue-scene';
import { type VenueTheme, venueScenePalettes } from './venue-theme';

class TestContainer {
  children: TestCanvas[] = [];
  constructor(
    public width = 1120,
    public height = 680
  ) {}

  getBoundingClientRect(): DOMRect {
    return {
      x: 20,
      y: 30,
      left: 20,
      top: 30,
      right: this.width + 20,
      bottom: this.height + 30,
      width: this.width,
      height: this.height,
    } as DOMRect;
  }

  append(canvas: TestCanvas): void {
    canvas.parent = this;
    this.children.push(canvas);
  }
}

class TestCanvas extends EventTarget {
  parent: TestContainer | null = null;
  style = { cssText: '', touchAction: '', cursor: '' };
  attributes = new Map<string, string>();

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getBoundingClientRect(): DOMRect {
    return this.parent?.getBoundingClientRect() ?? new TestContainer().getBoundingClientRect();
  }

  remove(): void {
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
    this.parent = null;
  }
}

interface TestView {
  view: VenueScene;
  container: TestContainer;
  canvas: TestCanvas;
  onSelect: ReturnType<typeof vi.fn<(id: string) => void>>;
  onProject: ReturnType<typeof vi.fn<(positions: ProjectedRoom[]) => void>>;
  onUnavailable: ReturnType<typeof vi.fn<() => void>>;
}

let frameId = 0;
let frameCallbacks: Map<number, FrameRequestCallback>;
let views: VenueScene[];
let observers: { notify: () => void; disconnect: ReturnType<typeof vi.fn> }[];

const flushFrame = (): void => {
  const callbacks = [...frameCallbacks.values()];
  frameCallbacks.clear();
  for (const callback of callbacks) callback(16);
};

const lastFrame = (): RenderedFrame => {
  const call = boundary.render.mock.lastCall;
  if (!call) throw new Error('Expected a rendered frame');
  return { scene: call[0], camera: call[1] };
};

const createView = (
  width = 1120,
  height = 680,
  theme: VenueTheme = 'light',
  canSelectRoom = (id: string) => !!venueInterfaceFr.roomDetails[id]?.trim()
): TestView => {
  const container = new TestContainer(width, height);
  const canvas = new TestCanvas();
  boundary.createCanvas.mockReturnValue(canvas);
  const onSelect = vi.fn<(id: string) => void>();
  const onProject = vi.fn<(positions: ProjectedRoom[]) => void>();
  const onUnavailable = vi.fn<() => void>();
  const view = new VenueScene({
    container: container as unknown as HTMLElement,
    theme,
    canSelectRoom,
    onSelect,
    onProject,
    onUnavailable,
  });
  views.push(view);
  flushFrame();
  return { view, container, canvas, onSelect, onProject, onUnavailable };
};

const roomFloor = (id: string): Mesh<BufferGeometry, MeshStandardMaterial> => {
  let floor: Mesh<BufferGeometry, MeshStandardMaterial> | undefined;
  lastFrame().scene.traverse((object) => {
    if (object instanceof Mesh && object.userData.roomId === id) floor = object;
  });
  if (!floor) throw new Error(`Missing room ${id}`);
  return floor;
};

const projectedRoom = (testView: TestView, id: string): ProjectedRoom => {
  const room = testView.onProject.mock.lastCall?.[0].find((item) => item.id === id);
  if (!room) throw new Error(`Missing projected room ${id}`);
  return room;
};

const pointer = (
  canvas: TestCanvas,
  type: string,
  point: { x: number; y: number },
  overrides: Partial<PointerEvent> = {}
): void => {
  const bounds = canvas.getBoundingClientRect();
  const event = Object.assign(new Event(type), {
    clientX: bounds.left + point.x,
    clientY: bounds.top + point.y,
    pointerId: 1,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerdown' ? 1 : 0,
    pointerType: 'mouse',
    ...overrides,
  });
  canvas.dispatchEvent(event);
};

beforeEach(() => {
  vi.clearAllMocks();
  boundary.failRenderer = false;
  boundary.controls = null;
  frameId = 0;
  frameCallbacks = new Map();
  observers = [];
  views = [];
  vi.stubGlobal('window', { devicePixelRatio: 3, matchMedia: () => ({ matches: true }) });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++frameId;
    frameCallbacks.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frameCallbacks.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: () => void) {
        observers.push({ notify: callback, disconnect: this.disconnect });
      }
    }
  );
});

afterEach(() => {
  for (const view of views) view.dispose();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('VenueScene', () => {
  it('uses the requested dark palette on the first rendered frame', () => {
    createView(1120, 680, 'dark');
    expect(roomFloor('milhaud').material.color.getHexString()).toBe(venueScenePalettes.dark.room.slice(1));
    expect(roomFloor('amphitheatre').material.color.getHexString()).toBe(venueScenePalettes.dark.room.slice(1));
    expect(roomFloor('hall').material.color.getHexString()).toBe(venueScenePalettes.dark.circulation.slice(1));
    expect(roomFloor('terrasse-picasso').material.color.getHexString()).toBe(venueScenePalettes.dark.outdoor.slice(1));
    expect(roomFloor('sponsors').material.color.getHexString()).toBe(venueScenePalettes.dark.sponsors.slice(1));
  });

  it('switches materials in place and restores light colours without losing camera or room selection', () => {
    const { view, container } = createView();
    view.select('amphitheatre');
    view.zoom(1);
    flushFrame();
    const { scene, camera } = lastFrame();
    const position = camera.position.clone();
    const zoom = camera.zoom;
    const materials = new Map<MeshStandardMaterial, string>();
    const geometries = new Set<BufferGeometry>();
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        geometries.add(object.geometry);
        if (object.material instanceof MeshStandardMaterial)
          materials.set(object.material, object.material.color.getHexString());
      }
    });
    view.setTheme('dark');
    flushFrame();
    expect([...materials].every(([material, color]) => material.color.getHexString() !== color)).toBe(true);
    expect(roomFloor('amphitheatre').material.color.getHexString()).toBe(venueScenePalettes.dark.selected.slice(1));
    expect(camera.position.equals(position)).toBe(true);
    expect(camera.zoom).toBe(zoom);
    expect(container.children).toHaveLength(1);
    scene.traverse((object) => {
      if (object instanceof Mesh) expect(geometries.has(object.geometry)).toBe(true);
    });
    const rendered = boundary.render.mock.calls.length;
    view.setTheme('dark');
    flushFrame();
    expect(boundary.render).toHaveBeenCalledTimes(rendered);
    view.setTheme('light');
    flushFrame();
    for (const [material, color] of materials) expect(material.color.getHexString()).toBe(color);
    expect(roomFloor('amphitheatre').material.color.getHexString()).toBe(venueScenePalettes.light.selected.slice(1));
  });

  it('keeps agenda highlights when inspecting another room or closing the details', () => {
    const { view } = createView();
    const planned = roomFloor('amphitheatre');
    const inspected = roomFloor('milhaud');
    const originalColor = inspected.material.color.clone();
    view.setPlannedRooms(['amphitheatre']);
    view.select('milhaud');
    flushFrame();
    expect(planned.material.color.getHexString()).toBe(venueScenePalettes.light.planned.slice(1));
    expect(inspected.material.color.getHexString()).toBe(venueScenePalettes.light.selected.slice(1));
    view.select(null);
    flushFrame();
    expect(planned.material.color.getHexString()).toBe(venueScenePalettes.light.planned.slice(1));
    expect(inspected.material.color.equals(originalColor)).toBe(true);
    view.setPlannedRooms([]);
    flushFrame();
    expect(planned.material.color.getHexString()).toBe(venueScenePalettes.light.room.slice(1));
  });

  it('combines planned fill and selection outline in both themes and preserves selection after unsaving', () => {
    const testView = createView();
    testView.view.setPlannedRooms(['amphitheatre', 'milhaud', 'missing']);
    testView.view.select('amphitheatre');
    for (const theme of ['light', 'dark', 'light'] as const) {
      testView.view.setTheme(theme);
      const point = projectedRoom(testView, 'amphitheatre');
      pointer(testView.canvas, 'pointermove', point);
      testView.canvas.dispatchEvent(new Event('pointerleave'));
      flushFrame();
      for (const id of ['amphitheatre', 'milhaud']) {
        expect(roomFloor(id).material.color.getHexString()).toBe(venueScenePalettes[theme].planned.slice(1));
      }
      const outlines: LineLoop[] = [];
      lastFrame().scene.traverse((object) => {
        if (object instanceof LineLoop && object.visible) outlines.push(object);
      });
      expect(outlines).toHaveLength(1);
      expect(new Box3().setFromObject(outlines[0]).getCenter(new Vector3()).x).toBeCloseTo(
        new Box3().setFromObject(roomFloor('amphitheatre')).getCenter(new Vector3()).x
      );
    }
    testView.view.setPlannedRooms([]);
    flushFrame();
    expect(roomFloor('amphitheatre').material.color.getHexString()).toBe(venueScenePalettes.light.selected.slice(1));
  });

  it.each([
    { width: 1120, height: 680 },
    { width: 390, height: 420 },
    { width: 1500, height: 400 },
  ])('fits the whole traced venue within a $width × $height canvas', ({ width, height }) => {
    const testView = createView(width, height);
    const { scene, camera } = lastFrame();
    scene.traverse((object) => {
      if (!(object instanceof Mesh) || !object.userData.roomId) return;
      const bounds = new Box3().setFromObject(object);
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            const point = new Vector3(x, y, z).project(camera);
            expect(Math.abs(point.x)).toBeLessThan(1);
            expect(Math.abs(point.y)).toBeLessThan(1);
          }
        }
      }
    });
    for (const id of ['milhaud', 'forbin', 'sainte-victoire', 'picasso', 'terrasse-picasso', 'amphitheatre']) {
      const label = projectedRoom(testView, id);
      expect(label.visible).toBe(true);
      expect(label.x).toBeGreaterThan(0);
      expect(label.x).toBeLessThan(width);
      expect(label.y).toBeGreaterThan(0);
      expect(label.y).toBeLessThan(height);
      expect(label.bounds.left).toBeLessThan(label.x);
      expect(label.bounds.right).toBeGreaterThan(label.x);
      expect(label.bounds.top).toBeLessThan(label.y);
      expect(label.bounds.bottom).toBeGreaterThan(label.y);
      expect(label.outline.length).toBeGreaterThanOrEqual(3);
      for (const point of label.outline) {
        expect(point.x).toBeGreaterThanOrEqual(label.bounds.left);
        expect(point.x).toBeLessThanOrEqual(label.bounds.right);
        expect(point.y).toBeGreaterThanOrEqual(label.bounds.top);
        expect(point.y).toBeLessThanOrEqual(label.bounds.bottom);
      }
    }
    expect(testView.onProject.mock.lastCall?.[0].some((label) => label.id === 'congress-storage')).toBe(false);
    expect(boundary.setPixelRatio).toHaveBeenCalledWith(1.7);
    expect(testView.canvas.attributes.get('aria-hidden')).toBe('true');
  });

  it('highlights a room without moving the camera and clears an invalid selection', () => {
    const { view } = createView();
    const floor = roomFloor('milhaud');
    const originalColor = floor.material.color.clone();
    const { camera, scene } = lastFrame();
    const position = camera.position.clone();
    const rotation = camera.quaternion.clone();
    const projection = camera.projectionMatrix.clone();

    view.select('milhaud');
    flushFrame();

    expect(floor.material.color.equals(originalColor)).toBe(false);
    expect(floor.material.color.b).toBeGreaterThan(floor.material.color.r);
    expect(camera.position.equals(position)).toBe(true);
    expect(camera.quaternion.equals(rotation)).toBe(true);
    expect(camera.projectionMatrix.equals(projection)).toBe(true);
    const outlines: LineLoop[] = [];
    scene.traverse((object) => {
      if (object instanceof LineLoop && object.visible) outlines.push(object);
    });
    expect(outlines).toHaveLength(1);

    view.select('unknown-room');
    flushFrame();
    expect(floor.material.color.equals(originalColor)).toBe(true);
    expect(outlines[0].visible).toBe(false);
    view.select(null);
    flushFrame();
    expect(floor.material.color.equals(originalColor)).toBe(true);
  });

  it.each(['milhaud', 'entrance'])('raycasts a tap at the projected %s label into its traced floor', (roomId) => {
    const testView = createView();
    const point = projectedRoom(testView, roomId);

    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);

    expect(testView.onSelect).toHaveBeenCalledExactlyOnceWith(roomId);
  });

  it('opens room details on click, after pointerup light-dismiss, and consumes each tap once', () => {
    const testView = createView();
    const point = projectedRoom(testView, 'milhaud');
    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point);

    // Native popovers opened during pointerup can be dismissed by that same gesture.
    expect(testView.onSelect).not.toHaveBeenCalled();
    pointer(testView.canvas, 'click', point);
    expect(testView.onSelect).toHaveBeenCalledExactlyOnceWith('milhaud');
    pointer(testView.canvas, 'click', point);
    expect(testView.onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps the detached auditorium elevated, selectable and visible in the permanent overview', () => {
    const testView = createView();
    const auditorium = roomFloor('amphitheatre');
    const ground = roomFloor('milhaud');
    const auditoriumBounds = new Box3().setFromObject(auditorium);
    const groundBounds = new Box3().setFromObject(ground);
    const point = projectedRoom(testView, 'amphitheatre');
    expect(auditorium.position.y).toBe(detachedAmphitheatre.elevation);
    expect(auditoriumBounds.min.y).toBeGreaterThan(groundBounds.max.y);
    expect(auditoriumBounds.max.z).toBeLessThan(groundBounds.min.z);
    expect(point.visible).toBe(true);

    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    expect(testView.onSelect).toHaveBeenCalledExactlyOnceWith('amphitheatre');

    const { camera, scene } = lastFrame();
    const originalCamera = camera.position.clone();
    const originalColor = auditorium.material.color.clone();
    testView.view.select('amphitheatre');
    flushFrame();
    expect(auditorium.material.color.equals(originalColor)).toBe(false);
    expect(camera.position.equals(originalCamera)).toBe(true);
    scene.traverse((object) => {
      if (object instanceof LineLoop && object.visible) {
        const outlineBounds = new Box3().setFromObject(object);
        expect(outlineBounds.min.y).toBeGreaterThan(auditoriumBounds.max.y);
        expect(outlineBounds.min.y - auditoriumBounds.max.y).toBeLessThan(0.1);
      }
    });
    const furnishing = scene.getObjectByName('detached-amphitheatre');
    expect(furnishing?.userData.detached).toBe(true);
    const furnishingBounds = new Box3().setFromObject(furnishing!);
    expect(furnishingBounds.min.y).toBeGreaterThan(auditoriumBounds.min.y);
    expect(furnishingBounds.min.z).toBeGreaterThan(auditoriumBounds.min.z - 0.1);
    expect(furnishingBounds.max.z).toBeLessThan(auditoriumBounds.max.z + 0.1);
  });

  it('faces individual auditorium seats toward the stage and raises successive rows without filling the aisles', () => {
    createView();
    const auditorium = lastFrame().scene.getObjectByName('detached-amphitheatre')!;
    const cushions = auditorium.getObjectByName('amphitheatre-seat-cushions') as InstancedMesh;
    const backs = auditorium.getObjectByName('amphitheatre-seat-backs') as InstancedMesh;
    const stage = auditorium.getObjectByName('amphitheatre-stage')!;
    const stageBounds = new Box3().setFromObject(stage);
    const stageCenter = stageBounds.getCenter(new Vector3());
    const floorBounds = new Box3().setFromObject(roomFloor('amphitheatre'));
    const rows = new Map<number, Vector3[]>();
    const matrix = new Matrix4();

    expect(cushions).toBeInstanceOf(InstancedMesh);
    expect(backs.count).toBe(cushions.count);
    for (let index = 0; index < cushions.count; index++) {
      cushions.getMatrixAt(index, matrix);
      const seat = new Vector3().setFromMatrixPosition(matrix);
      backs.getMatrixAt(index, matrix);
      const back = new Vector3().setFromMatrixPosition(matrix);
      const awayFromStage = seat.clone().sub(stageCenter).setY(0).normalize();
      const seatToBack = back.clone().sub(seat).setY(0).normalize();
      expect(seatToBack.dot(awayFromStage)).toBeGreaterThan(0.99);
      expect(back.y).toBeGreaterThan(seat.y);
      expect(seat.z).toBeGreaterThan(stageBounds.max.z);
      expect(seat.x).toBeGreaterThan(floorBounds.min.x);
      expect(seat.x).toBeLessThan(floorBounds.max.x);
      expect(seat.z).toBeLessThan(floorBounds.max.z);
      const row = rows.get(seat.y) ?? [];
      row.push(seat);
      rows.set(seat.y, row);
    }

    const ascendingRows = [...rows.entries()].sort(([a], [b]) => a - b);
    expect(ascendingRows.length).toBeGreaterThan(1);
    let previousCenter = Number.NEGATIVE_INFINITY;
    for (const [, seats] of ascendingRows) {
      const across = seats.sort((a, b) => a.x - b.x);
      const gaps = across.slice(1).map((seat, index) => seat.x - across[index].x);
      const typicalGap = [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
      expect(gaps.filter((gap) => gap > typicalGap * 1.6)).toHaveLength(2);
      const center = across[Math.floor(across.length / 2)];
      expect(center.z).toBeGreaterThan(previousCenter);
      expect(center.z).toBeGreaterThan(across[0].z);
      previousCenter = center.z;
    }
  });

  it('places two visible projection screens on either side of the auditorium stage', () => {
    createView();
    const auditorium = lastFrame().scene.getObjectByName('detached-amphitheatre')!;
    const stageBounds = new Box3().setFromObject(auditorium.getObjectByName('amphitheatre-stage')!);
    const backdropBounds = new Box3().setFromObject(auditorium.getObjectByName('amphitheatre-backdrop')!);
    const screens = auditorium.children
      .filter((object) => object.name === 'amphitheatre-screen')
      .map((object) => new Box3().setFromObject(object))
      .sort((a, b) => a.min.x - b.min.x);

    expect(screens).toHaveLength(2);
    expect(screens[0].max.x).toBeLessThan(backdropBounds.min.x);
    expect(screens[1].min.x).toBeGreaterThan(backdropBounds.max.x);
    for (const screen of screens) {
      expect(screen.min.y).toBeGreaterThan(stageBounds.max.y);
      expect(screen.min.z).toBeGreaterThan(backdropBounds.max.z);
    }
  });

  it('preserves every source-plan footprint and leaves original walls and fixtures untouched', () => {
    const originalPlan = structuredClone(venueLayout);
    createView();

    for (const room of originalPlan.rooms) {
      const floor = roomFloor(room.id);
      expect(floor.position.y).toBe(room.id === 'sponsors' ? 0.035 : 0);
      expect(floor.geometry).toBeInstanceOf(ExtrudeGeometry);
      const shape = (floor.geometry as ExtrudeGeometry).parameters.shapes;
      expect(shape).toBeInstanceOf(Shape);
      const actualPoints = (shape as Shape).getPoints();
      const expectedPoints = room.polygon.map(([x, y]) => [
        (x - originalPlan.source.width / 2) * 0.012,
        -(y - originalPlan.source.height / 2) * 0.012,
      ]);
      // Shape closes its path by repeating the first vertex.
      expect(actualPoints.map(({ x, y }) => [x, y])).toEqual([...expectedPoints, expectedPoints[0]]);
    }
    expect(venueLayout).toEqual(originalPlan);
  });

  it('does not treat dragging, canceled gestures, other pointers or empty space as room taps', () => {
    const testView = createView();
    const point = projectedRoom(testView, 'milhaud');
    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointermove', { ...point, x: point.x + 25 }, { buttons: 1 });
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    pointer(testView.canvas, 'pointerdown', point);
    testView.canvas.dispatchEvent(new Event('pointercancel'));
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    pointer(testView.canvas, 'pointerdown', point, { isPrimary: false });
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    pointer(testView.canvas, 'pointerdown', point, { button: 2 });
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point, { pointerId: 2 });
    pointer(testView.canvas, 'click', point, { pointerId: 2 });
    pointer(testView.canvas, 'pointerdown', { x: 1, y: 1 });
    pointer(testView.canvas, 'pointerup', { x: 1, y: 1 });
    pointer(testView.canvas, 'click', { x: 1, y: 1 });

    expect(testView.onSelect).not.toHaveBeenCalled();
  });

  it.each(venueLayout.rooms.filter((room) => !venueInterfaceFr.roomDetails[room.id]).map((room) => room.id))(
    'keeps %s visible without click, hover or selection feedback when it has no room information',
    (roomId) => {
      const testView = createView();
      const floor = roomFloor(roomId);
      const originalColor = floor.material.color.clone();
      const center = new Box3().setFromObject(floor).getCenter(new Vector3()).project(lastFrame().camera);
      const point = { x: ((center.x + 1) / 2) * 1120, y: ((1 - center.y) / 2) * 680 };

      pointer(testView.canvas, 'pointermove', point);
      flushFrame();
      expect(testView.canvas.style.cursor).toBe('grab');
      expect(floor.material.color.equals(originalColor)).toBe(true);
      pointer(testView.canvas, 'pointerdown', point);
      pointer(testView.canvas, 'pointerup', point);
      pointer(testView.canvas, 'click', point);
      expect(testView.onSelect).not.toHaveBeenCalled();
      testView.view.select(roomId);
      flushFrame();
      expect(floor.material.color.equals(originalColor)).toBe(true);
      expect(floor.visible).toBe(true);
      expect(testView.onProject.mock.lastCall?.[0].some((room) => room.id === roomId)).toBe(false);
      testView.view.setInteractive(false);
      pointer(testView.canvas, 'pointermove', point);
      expect(testView.canvas.style.cursor).toBe('default');
    }
  );

  it('uses the supplied room-information eligibility for both picking and projected controls', () => {
    const testView = createView(1120, 680, 'light', () => false);
    const floor = roomFloor('milhaud');
    const center = new Box3().setFromObject(floor).getCenter(new Vector3()).project(lastFrame().camera);
    const point = { x: ((center.x + 1) / 2) * 1120, y: ((1 - center.y) / 2) * 680 };
    pointer(testView.canvas, 'pointermove', point);
    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    expect(testView.canvas.style.cursor).toBe('grab');
    expect(testView.onSelect).not.toHaveBeenCalled();
    expect(testView.onProject).toHaveBeenLastCalledWith([]);
    expect(floor.visible).toBe(true);
  });

  it('shows temporary mouse hover feedback while preserving an active selection', () => {
    const testView = createView();
    const point = projectedRoom(testView, 'milhaud');
    const floor = roomFloor('milhaud');
    const originalColor = floor.material.color.clone();
    pointer(testView.canvas, 'pointermove', point);
    flushFrame();
    expect(floor.material.color.equals(originalColor)).toBe(false);
    expect(testView.canvas.style.cursor).toBe('pointer');
    pointer(testView.canvas, 'pointermove', point);
    expect(frameCallbacks.size).toBe(0);
    testView.canvas.dispatchEvent(new Event('pointerleave'));
    flushFrame();
    expect(floor.material.color.equals(originalColor)).toBe(true);

    testView.view.select('milhaud');
    flushFrame();
    const selectedColor = floor.material.color.clone();
    pointer(testView.canvas, 'pointermove', point);
    testView.canvas.dispatchEvent(new Event('pointerleave'));
    flushFrame();
    expect(floor.material.color.equals(selectedColor)).toBe(true);
    pointer(testView.canvas, 'pointermove', { x: 1, y: 1 });
    expect(testView.canvas.style.cursor).toBe('grab');
  });

  it('preserves mobile scrolling until interaction is enabled, while still accepting taps', () => {
    vi.stubGlobal('window', { devicePixelRatio: 0, matchMedia: () => ({ matches: false }) });
    const testView = createView(390, 420);
    const point = projectedRoom(testView, 'milhaud');
    expect(testView.canvas.style.touchAction).toBe('pan-y');
    expect(boundary.controls?.enabled).toBe(false);
    expect(boundary.setPixelRatio).toHaveBeenCalledWith(1);
    pointer(testView.canvas, 'pointermove', point, { pointerType: 'touch' });
    pointer(testView.canvas, 'pointerdown', point, { pointerType: 'touch' });
    pointer(testView.canvas, 'pointerup', point, { pointerType: 'touch' });
    pointer(testView.canvas, 'click', point, { pointerType: 'touch' });
    expect(testView.onSelect).toHaveBeenCalledWith('milhaud');

    testView.view.setInteractive(true);
    expect(testView.canvas.style.touchAction).toBe('none');
    expect(boundary.controls?.enabled).toBe(true);
    testView.view.setInteractive(false);
    pointer(testView.canvas, 'pointermove', { x: 1, y: 1 });
    expect(testView.canvas.style.cursor).toBe('default');
    expect(testView.canvas.style.touchAction).toBe('pan-y');
  });

  it('resizes the camera, constrains zoom and restores the overview on reset', () => {
    const testView = createView();
    const initialCamera = lastFrame().camera;
    const initialPosition = initialCamera.position.clone();
    const initialProjection = initialCamera.projectionMatrix.clone();
    for (let i = 0; i < 20; i++) testView.view.zoom(1);
    flushFrame();
    expect(lastFrame().camera.zoom).toBeGreaterThan(1);
    expect(lastFrame().camera.zoom).toBeLessThan(3);
    for (let i = 0; i < 30; i++) testView.view.zoom(-1);
    flushFrame();
    expect(lastFrame().camera.zoom).toBeGreaterThan(0.5);
    expect(lastFrame().camera.zoom).toBeLessThan(1);

    testView.container.width = 390;
    testView.container.height = 420;
    observers[0].notify();
    flushFrame();
    expect(boundary.setSize).toHaveBeenLastCalledWith(390, 420, false);
    expect(initialCamera.projectionMatrix.equals(initialProjection)).toBe(false);
    testView.view.reset();
    flushFrame();
    expect(initialCamera.zoom).toBe(1);
    expect(initialCamera.position.equals(initialPosition)).toBe(true);
    expect(projectedRoom(testView, 'milhaud').visible).toBe(true);

    const resizeCalls = boundary.setSize.mock.calls.length;
    testView.container.width = 0;
    testView.view.resize();
    expect(boundary.setSize).toHaveBeenCalledTimes(resizeCalls);
  });

  it('coalesces changes into one frame and settles without an idle animation loop', () => {
    const { view } = createView();
    const initialRenders = boundary.render.mock.calls.length;
    expect(frameCallbacks.size).toBe(0);
    view.select('milhaud');
    view.select('forbin');
    boundary.controls?.change();
    expect(frameCallbacks.size).toBe(1);
    flushFrame();
    expect(boundary.render).toHaveBeenCalledTimes(initialRenders + 1);
    expect(frameCallbacks.size).toBe(0);
    flushFrame();
    expect(boundary.render).toHaveBeenCalledTimes(initialRenders + 1);
  });

  it('reports context loss once and stops rendering so the UI can show its fallback', () => {
    const testView = createView();
    const renders = boundary.render.mock.calls.length;
    testView.view.zoom(1);
    expect(frameCallbacks.size).toBe(1);
    testView.canvas.dispatchEvent(new Event('webglcontextlost'));
    testView.canvas.dispatchEvent(new Event('webglcontextlost'));
    testView.view.resize();
    testView.view.select('forbin');
    flushFrame();

    expect(testView.onUnavailable).toHaveBeenCalledOnce();
    expect(frameCallbacks.size).toBe(0);
    expect(boundary.render).toHaveBeenCalledTimes(renders);
  });

  it('reports renderer construction failure without attaching a canvas', () => {
    boundary.failRenderer = true;
    const container = new TestContainer();
    const onUnavailable = vi.fn();
    expect(
      () =>
        new VenueScene({
          container: container as unknown as HTMLElement,
          canSelectRoom: () => false,
          onSelect: vi.fn(),
          onProject: vi.fn(),
          onUnavailable,
        })
    ).toThrow('WebGL unavailable');
    expect(onUnavailable).toHaveBeenCalledOnce();
    expect(container.children).toHaveLength(0);
    expect(frameCallbacks.size).toBe(0);
  });

  it('disposes shared geometry and materials once and removes all browser work', () => {
    const testView = createView();
    const point = projectedRoom(testView, 'milhaud');
    const geometry = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const objects: (InstancedMesh | DirectionalLight)[] = [];
    lastFrame().scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof LineLoop) {
        geometry.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material])
          materials.add(material);
      }
      if (object instanceof InstancedMesh || object instanceof DirectionalLight) objects.push(object);
    });
    const disposals = [...geometry, ...materials, ...objects].map((resource) => vi.spyOn(resource, 'dispose'));
    testView.view.select('milhaud');
    testView.view.dispose();
    testView.view.dispose();
    testView.view.resize();
    boundary.controls?.change();
    pointer(testView.canvas, 'pointerdown', point);
    pointer(testView.canvas, 'pointerup', point);
    pointer(testView.canvas, 'click', point);
    testView.canvas.dispatchEvent(new Event('webglcontextlost'));

    for (const dispose of disposals) expect(dispose).toHaveBeenCalledOnce();
    expect(boundary.rendererDispose).toHaveBeenCalledOnce();
    expect(boundary.loseContext).toHaveBeenCalledOnce();
    expect(boundary.controlsDispose).toHaveBeenCalledOnce();
    expect(observers[0].disconnect).toHaveBeenCalledOnce();
    expect(testView.container.children).toHaveLength(0);
    expect(testView.onSelect).not.toHaveBeenCalled();
    expect(testView.onUnavailable).not.toHaveBeenCalled();
    expect(frameCallbacks.size).toBe(0);
  });
});
