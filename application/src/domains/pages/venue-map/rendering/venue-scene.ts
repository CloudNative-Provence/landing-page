import {
  ACESFilmicToneMapping,
  Box3,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  HemisphereLight,
  InstancedMesh,
  LineBasicMaterial,
  LineLoop,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PCFShadowMap,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  Shape,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { type PlanPoint, type VenueFixture, venueLayout } from '../model/venue-layout';
import { type VenueMapRoom, venuePresentation } from '../model/venue-presentation';
import { type ScreenBounds, type ScreenPoint, VenueCardLayout } from './venue-card-layout';
import { type VenueTheme, venueScenePalettes } from './venue-theme';

export interface ProjectedRoom {
  id: string;
  center: ScreenPoint;
  x: number;
  y: number;
  visible: boolean;
  bounds: ScreenBounds;
  outline: ScreenPoint[];
}

export interface VenueSceneOptions {
  container: HTMLElement;
  theme?: VenueTheme;
  onSelect: (roomId: string) => void;
  onProject: (positions: ProjectedRoom[]) => void;
  onUnavailable?: () => void;
}

// Coordinates retain the source drawing's proportions. Heights are illustrative;
// the supplied floor plan does not specify building elevations.
const SOURCE_SCALE = 0.012;
const FLOOR_HEIGHT = 0.28;
const WALL_HEIGHT = 1.25;
const PRIMARY_ROOM_IDS = new Set([
  'entrance',
  'milhaud',
  'forbin',
  'sainte-victoire',
  'picasso',
  'terrasse-picasso',
  'hall',
  'accueil',
  'vestiaire',
  'sponsors',
  'bar',
  'amphitheatre-access',
  'amphitheatre',
  'lift',
]);

interface RoomSurface {
  material: MeshStandardMaterial;
  baseColor: Color;
  outline: LineLoop<BufferGeometry, LineBasicMaterial>;
}

export class VenueScene {
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-20, 20, 20, -20, 0.1, 150);
  private readonly renderer: WebGLRenderer;
  private readonly controls: OrbitControls<OrthographicCamera>;
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  private readonly eventController = new AbortController();
  private readonly resizeObserver: ResizeObserver;
  private readonly roomSurfaces = new Map<string, RoomSurface>();
  private readonly pickableFloors: Mesh[] = [];
  private readonly unitBox = new BoxGeometry(1, 1, 1);
  private readonly model = new Object3D();
  private readonly bounds = new Box3();
  private readonly sourceCenter: PlanPoint = [venueLayout.source.width / 2, venueLayout.source.height / 2];
  private readonly whiteMaterial = new MeshStandardMaterial({ color: venueScenePalettes.light.wall, roughness: 0.84 });
  private readonly furnitureMaterial = new MeshStandardMaterial({
    color: venueScenePalettes.light.furniture,
    roughness: 0.83,
  });
  private readonly counterMaterial = new MeshStandardMaterial({
    color: venueScenePalettes.light.counter,
    roughness: 0.8,
  });
  private readonly chairMaterial = new MeshStandardMaterial({ color: venueScenePalettes.light.chair, roughness: 0.9 });
  private readonly plantMaterial = new MeshStandardMaterial({ color: venueScenePalettes.light.plant, roughness: 1 });
  private readonly screenMaterial = new MeshStandardMaterial({
    color: venueScenePalettes.light.screen,
    roughness: 0.85,
  });
  private readonly shadowMaterial = new ShadowMaterial({
    color: venueScenePalettes.light.shadow,
    opacity: venueScenePalettes.light.shadowOpacity,
  });
  private readonly fillLight = new HemisphereLight(venueScenePalettes.light.sky, venueScenePalettes.light.ground, 1.4);
  private readonly keyLight = new DirectionalLight(venueScenePalettes.light.key, 2.8);
  private readonly selectedColor = new Color(venueScenePalettes.light.selected);
  private readonly plannedColor = new Color(venueScenePalettes.light.planned);
  private theme: VenueTheme = 'light';
  private selectedRoom: string | null = null;
  private plannedRooms = new Set<string>();
  private hoveredRoom: string | null = null;
  private pointerStart: { x: number; y: number; id: number; dragged: boolean } | null = null;
  private frame = 0;
  private disposed = false;
  private unavailable = false;
  private interactive = true;

  constructor(private readonly options: VenueSceneOptions) {
    try {
      this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (error) {
      options.onUnavailable?.();
      throw error;
    }

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = venueScenePalettes.light.exposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    // Geometry and lights remain fixed while only the camera/room colours change.
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;';
    options.container.append(this.renderer.domElement);

    this.scene.add(this.model);
    this.createFloors();
    this.createWalls();
    this.createFixtures();
    this.createDetachedAmphitheatre();
    this.bounds.setFromObject(this.model);
    this.createLighting();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = Math.PI / 5;
    this.controls.maxPolarAngle = Math.PI / 3;
    this.controls.minAzimuthAngle = -Math.PI / 4;
    this.controls.maxAzimuthAngle = Math.PI / 5;
    this.controls.minZoom = 0.85;
    this.controls.maxZoom = 2.2;
    this.controls.rotateSpeed = 0.45;
    this.controls.zoomSpeed = 0.7;
    this.controls.addEventListener('change', this.scheduleRender);

    this.bindEvents();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(options.container);
    this.setInteractive(window.matchMedia('(min-width: 768px)').matches);
    this.reset();
    this.setTheme(options.theme ?? 'light');
  }

  setTheme(theme: VenueTheme): void {
    if (this.disposed || this.unavailable || theme === this.theme) return;
    this.theme = theme;
    const palette = venueScenePalettes[theme];
    this.whiteMaterial.color.set(palette.wall);
    this.furnitureMaterial.color.set(palette.furniture);
    this.counterMaterial.color.set(palette.counter);
    this.chairMaterial.color.set(palette.chair);
    this.plantMaterial.color.set(palette.plant);
    this.screenMaterial.color.set(palette.screen);
    this.selectedColor.set(palette.selected);
    this.plannedColor.set(palette.planned);
    for (const room of venuePresentation.rooms) {
      const surface = this.roomSurfaces.get(room.id);
      if (!surface) continue;
      surface.baseColor.set(this.floorColor(room));
      surface.outline.material.color.set(palette.outline);
    }
    this.fillLight.color.set(palette.sky);
    this.fillLight.groundColor.set(palette.ground);
    this.keyLight.color.set(palette.key);
    this.shadowMaterial.color.set(palette.shadow);
    this.shadowMaterial.opacity = palette.shadowOpacity;
    this.renderer.toneMappingExposure = palette.exposure;
    this.updateRoomAppearance();
  }

  select(roomId: string | null): void {
    this.selectedRoom = roomId && this.roomSurfaces.has(roomId) ? roomId : null;
    this.updateRoomAppearance();
  }

  setPlannedRooms(roomIds: Iterable<string>): void {
    this.plannedRooms = new Set(roomIds);
    this.updateRoomAppearance();
  }

  resize(): void {
    if (this.disposed || this.unavailable) return;
    const { width, height } = this.options.container.getBoundingClientRect();
    if (width < 1 || height < 1) return;

    this.renderer.setSize(width, height, false);
    this.fitCamera(width / height);
    this.scheduleRender();
  }

  zoom(direction: 1 | -1): void {
    this.camera.zoom = Math.max(
      this.controls.minZoom,
      Math.min(this.controls.maxZoom, this.camera.zoom * 1.2 ** direction)
    );
    this.camera.updateProjectionMatrix();
    this.scheduleRender();
  }

  reset(): void {
    const center = this.bounds.getCenter(new Vector3());
    center.y = FLOOR_HEIGHT;
    this.controls.target.copy(center);
    this.camera.position.copy(center).add(new Vector3(-9, 32, 34));
    this.camera.zoom = 1;
    this.controls.update();
    this.resize();
  }

  setInteractive(enabled: boolean): void {
    this.interactive = enabled;
    this.controls.enabled = enabled;
    // OrbitControls sets touch-action:none when connected. Restore page scrolling
    // until the attendee explicitly enables manipulation on a touch screen.
    this.renderer.domElement.style.touchAction = enabled ? 'none' : 'pan-y';
    this.renderer.domElement.style.cursor = enabled ? 'grab' : 'default';
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.eventController.abort();
    this.resizeObserver.disconnect();
    this.controls.removeEventListener('change', this.scheduleRender);
    this.controls.dispose();

    const geometries = new Set<BufferGeometry>([this.unitBox]);
    const materials = new Set<Material>([
      this.whiteMaterial,
      this.furnitureMaterial,
      this.counterMaterial,
      this.chairMaterial,
      this.plantMaterial,
      this.screenMaterial,
      this.shadowMaterial,
    ]);
    this.scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof LineLoop) {
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of objectMaterials) materials.add(material);
      }
      if (object instanceof InstancedMesh || object instanceof DirectionalLight) object.dispose();
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.roomSurfaces.clear();
    this.pickableFloors.length = 0;
  }

  private worldPoint(point: PlanPoint, elevation = 0): Vector3 {
    return new Vector3(
      (point[0] - this.sourceCenter[0]) * SOURCE_SCALE,
      elevation,
      (point[1] - this.sourceCenter[1]) * SOURCE_SCALE
    );
  }

  private polygonGeometry(polygon: readonly PlanPoint[], height: number, bevel = 0.025): ExtrudeGeometry {
    const shape = new Shape();
    for (const [index, point] of polygon.entries()) {
      const position = this.worldPoint(point);
      if (index === 0) shape.moveTo(position.x, -position.z);
      else shape.lineTo(position.x, -position.z);
    }
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 4,
      steps: 1,
    });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }

  private floorColor(room: VenueMapRoom): string {
    const palette = venueScenePalettes[this.theme];
    if (room.id === 'sponsors') return palette.sponsors;
    if (room.kind === 'outdoor') return palette.outdoor;
    return room.kind === 'room' ? palette.room : palette.circulation;
  }

  private createFloors(): void {
    for (const room of venuePresentation.rooms) {
      const color = this.floorColor(room);
      const material = new MeshStandardMaterial({ color, roughness: 0.95 });
      const floor = new Mesh(this.polygonGeometry(room.polygon, FLOOR_HEIGHT), material);
      floor.position.y = (room.elevation ?? 0) + (room.id === 'sponsors' ? 0.035 : 0);
      floor.castShadow = true;
      floor.receiveShadow = true;
      floor.userData.roomId = room.id;
      this.model.add(floor);
      this.pickableFloors.push(floor);

      const outline = new LineLoop(
        new BufferGeometry().setFromPoints(
          room.polygon.map((point) => this.worldPoint(point, FLOOR_HEIGHT + 0.055 + floor.position.y))
        ),
        new LineBasicMaterial({ color: venueScenePalettes.light.outline, transparent: true, opacity: 0.9 })
      );
      outline.visible = false;
      this.model.add(outline);
      this.roomSurfaces.set(room.id, { material, baseColor: new Color(color), outline });
    }
  }

  private createWalls(): void {
    const walls = new InstancedMesh(this.unitBox, this.whiteMaterial, venueLayout.walls.length);
    const transform = new Object3D();
    for (const [index, wall] of venueLayout.walls.entries()) {
      const start = this.worldPoint(wall.start);
      const end = this.worldPoint(wall.end);
      const delta = end.clone().sub(start);
      const height = wall.thickness === 8 ? 0.38 : WALL_HEIGHT;
      transform.position.copy(start).add(end).multiplyScalar(0.5);
      transform.position.y = FLOOR_HEIGHT + height / 2;
      transform.rotation.set(0, -Math.atan2(delta.z, delta.x), 0);
      transform.scale.set(delta.length(), height, (wall.thickness ?? 12) * SOURCE_SCALE);
      transform.updateMatrix();
      walls.setMatrixAt(index, transform.matrix);
    }
    walls.instanceMatrix.needsUpdate = true;
    walls.castShadow = true;
    walls.receiveShadow = true;
    this.model.add(walls);
  }

  private createDetachedAmphitheatre(): void {
    const room = venuePresentation.rooms.find((item) => item.id === 'amphitheatre');
    if (!room?.detached) return;

    // The supplied auditorium photograph informs these furnishings. Its detached
    // footprint and representative rows do not assert measured dimensions or capacity.
    const xs = room.polygon.map(([x]) => x);
    const ys = room.polygon.map(([, y]) => y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const rear = Math.min(...ys);
    const front = Math.max(...ys);
    const width = right - left;
    const depth = front - rear;
    const centerX = (left + right) / 2;
    const base = (room.elevation ?? 0) + FLOOR_HEIGHT;
    const auditorium = new Object3D();
    auditorium.name = 'detached-amphitheatre';
    auditorium.userData.detached = true;

    const addSurface = (polygon: PlanPoint[], height: number, material: MeshStandardMaterial): Mesh => {
      const mesh = new Mesh(this.polygonGeometry(polygon, height, 0.035), material);
      mesh.position.y = base;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      auditorium.add(mesh);
      return mesh;
    };

    const stage = addSurface(
      [
        [centerX - width * 0.29, rear + depth * 0.08],
        [centerX + width * 0.29, rear + depth * 0.08],
        [centerX + width * 0.29, rear + depth * 0.25],
        [centerX + width * 0.17, rear + depth * 0.29],
        [centerX - width * 0.17, rear + depth * 0.29],
        [centerX - width * 0.29, rear + depth * 0.25],
      ],
      0.38,
      this.whiteMaterial
    );
    stage.name = 'amphitheatre-stage';

    const addBox = (
      name: string,
      point: PlanPoint,
      elevation: number,
      size: readonly [number, number, number],
      material = this.whiteMaterial
    ): void => {
      const mesh = new Mesh(this.unitBox, material);
      mesh.name = name;
      mesh.position.copy(this.worldPoint(point, base + elevation));
      mesh.scale.set(...size);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      auditorium.add(mesh);
    };
    addBox('amphitheatre-backdrop', [centerX, rear + depth * 0.08], 1.03, [width * SOURCE_SCALE * 0.43, 1.3, 0.16]);
    for (const side of [-1, 1]) {
      const screenX = centerX + side * width * 0.36;
      const screenWidth = width * SOURCE_SCALE * 0.17;
      addBox('amphitheatre-screen-frame', [screenX, rear + depth * 0.12], 1.05, [screenWidth + 0.12, 1.12, 0.12]);
      addBox(
        'amphitheatre-screen',
        [screenX, rear + depth * 0.135],
        1.05,
        [screenWidth, 1, 0.035],
        this.screenMaterial
      );
    }

    const seats: { point: PlanPoint; elevation: number }[] = [];
    const banks = [
      { from: -1, to: -0.48, seats: 6 },
      { from: -0.3, to: 0.3, seats: 7 },
      { from: 0.48, to: 1, seats: 6 },
    ];
    for (let row = 0; row < 8; row++) {
      const halfWidth = width * (0.36 + row * 0.01);
      const rowCenter = rear + depth * (0.45 + row * 0.06);
      const height = 0.1 + row * 0.11;
      const rowPoint = (across: number, offset = 0): PlanPoint => [
        centerX + halfWidth * across,
        rowCenter - depth * 0.08 * across ** 2 + offset,
      ];
      const terrace: PlanPoint[] = [];
      for (let index = 0; index <= 24; index++) terrace.push(rowPoint((index / 24) * 2.08 - 1.04, -depth * 0.03));
      for (let index = 24; index >= 0; index--) terrace.push(rowPoint((index / 24) * 2.08 - 1.04, depth * 0.035));
      addSurface(terrace, height, this.whiteMaterial);
      for (const bank of banks) {
        for (let seat = 0; seat < bank.seats; seat++) {
          seats.push({
            point: rowPoint(bank.from + (seat / (bank.seats - 1)) * (bank.to - bank.from)),
            elevation: base + height,
          });
        }
      }
    }
    this.createAuditoriumSeats(auditorium, seats, [centerX, rear + depth * 0.18]);

    const edges: [PlanPoint, PlanPoint][] = [
      [
        [left, rear],
        [right, rear],
      ],
      [
        [left, rear],
        [left, front],
      ],
      [
        [right, rear],
        [right, front],
      ],
    ];
    for (const [startPoint, endPoint] of edges) {
      const start = this.worldPoint(startPoint);
      const end = this.worldPoint(endPoint);
      const delta = end.clone().sub(start);
      const wall = new Mesh(this.unitBox, this.whiteMaterial);
      wall.position.copy(start).add(end).multiplyScalar(0.5);
      wall.position.y = base + 0.42;
      wall.rotation.y = -Math.atan2(delta.z, delta.x);
      wall.scale.set(delta.length(), 0.84, 0.16);
      wall.castShadow = true;
      wall.receiveShadow = true;
      auditorium.add(wall);
    }
    this.model.add(auditorium);
  }

  private createAuditoriumSeats(
    auditorium: Object3D,
    seats: { point: PlanPoint; elevation: number }[],
    stageCenter: PlanPoint
  ): void {
    const cushions = new InstancedMesh(this.unitBox, this.chairMaterial, seats.length);
    const backs = new InstancedMesh(this.unitBox, this.chairMaterial, seats.length);
    const bases = new InstancedMesh(this.unitBox, this.whiteMaterial, seats.length);
    cushions.name = 'amphitheatre-seat-cushions';
    backs.name = 'amphitheatre-seat-backs';
    bases.name = 'amphitheatre-seat-bases';
    const transform = new Object3D();
    const stage = this.worldPoint(stageCenter);
    for (const [index, seat] of seats.entries()) {
      const position = this.worldPoint(seat.point);
      const awayFromStage = position.clone().sub(stage).normalize();
      transform.rotation.y = Math.atan2(awayFromStage.x, awayFromStage.z);
      transform.position.set(position.x, seat.elevation + 0.2, position.z);
      transform.scale.set(0.38, 0.08, 0.3);
      transform.updateMatrix();
      cushions.setMatrixAt(index, transform.matrix);

      transform.position.copy(position).addScaledVector(awayFromStage, 0.13);
      transform.position.y = seat.elevation + 0.35;
      transform.scale.set(0.38, 0.34, 0.065);
      transform.updateMatrix();
      backs.setMatrixAt(index, transform.matrix);

      transform.position.set(position.x, seat.elevation + 0.1, position.z);
      transform.scale.set(0.22, 0.18, 0.22);
      transform.updateMatrix();
      bases.setMatrixAt(index, transform.matrix);
    }
    for (const mesh of [cushions, backs, bases]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      auditorium.add(mesh);
    }
  }

  private fixtureBounds(fixture: VenueFixture): { minX: number; maxX: number; minY: number; maxY: number } {
    const xs = fixture.polygon.map(([x]) => x);
    const ys = fixture.polygon.map(([, y]) => y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }

  private createFixtures(): void {
    const seats: PlanPoint[] = [];
    const roundGeometry = new CylinderGeometry(1, 1, 1, 20);
    let roundGeometryUsed = false;
    for (const fixture of venueLayout.fixtures) {
      const { minX, maxX, minY, maxY } = this.fixtureBounds(fixture);
      if (fixture.kind === 'seat-block') {
        const rows = fixture.rows ?? 1;
        const columns = fixture.columns ?? 1;
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            seats.push([
              minX + ((column + 0.5) / columns) * (maxX - minX),
              minY + ((row + 0.5) / rows) * (maxY - minY),
            ]);
          }
        }
        continue;
      }
      if (fixture.kind === 'stairs') {
        this.createStairs(fixture);
        continue;
      }
      if (fixture.kind === 'table' || fixture.kind === 'plant') {
        roundGeometryUsed = true;
        const plant = fixture.kind === 'plant';
        const material = plant ? this.plantMaterial : this.counterMaterial;
        const table = new Mesh(roundGeometry, material);
        const radius = ((maxX - minX) * SOURCE_SCALE) / 2;
        const height = plant ? 0.65 : 0.09;
        table.position.copy(this.worldPoint([(minX + maxX) / 2, (minY + maxY) / 2], FLOOR_HEIGHT + 0.55));
        table.scale.set(radius, height, ((maxY - minY) * SOURCE_SCALE) / 2);
        table.castShadow = true;
        table.receiveShadow = true;
        this.model.add(table);
        if (!plant) {
          const pedestal = new Mesh(roundGeometry, this.whiteMaterial);
          pedestal.position.copy(table.position);
          pedestal.position.y = FLOOR_HEIGHT + 0.25;
          pedestal.scale.set(0.065, 0.5, 0.065);
          pedestal.castShadow = true;
          this.model.add(pedestal);
        }
        continue;
      }

      const height = fixture.kind === 'stage' ? 0.38 : fixture.kind === 'counter' ? 0.72 : 0.5;
      const mesh = new Mesh(
        this.polygonGeometry(fixture.polygon, height, 0.035),
        fixture.kind === 'stage' ? this.furnitureMaterial : this.counterMaterial
      );
      mesh.position.y = FLOOR_HEIGHT;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.model.add(mesh);
    }
    if (!roundGeometryUsed) roundGeometry.dispose();
    this.createSeats(seats);
  }

  private createStairs(fixture: VenueFixture): void {
    const { minX, maxX, minY, maxY } = this.fixtureBounds(fixture);
    const steps = 10;
    const depth = ((maxY - minY) * SOURCE_SCALE) / steps;
    for (let index = 0; index < steps; index++) {
      const height = 0.06 + ((steps - index) / steps) * 0.72;
      const step = new Mesh(this.unitBox, this.whiteMaterial);
      step.position.copy(
        this.worldPoint([(minX + maxX) / 2, minY + ((index + 0.5) / steps) * (maxY - minY)], FLOOR_HEIGHT + height / 2)
      );
      step.scale.set((maxX - minX) * SOURCE_SCALE, height, depth);
      step.castShadow = true;
      step.receiveShadow = true;
      this.model.add(step);
    }
  }

  private createSeats(positions: PlanPoint[]): void {
    if (!positions.length) return;
    const cushions = new InstancedMesh(this.unitBox, this.chairMaterial, positions.length);
    const backs = new InstancedMesh(this.unitBox, this.chairMaterial, positions.length);
    const bases = new InstancedMesh(this.unitBox, this.whiteMaterial, positions.length);
    const transform = new Object3D();
    for (const [index, point] of positions.entries()) {
      const position = this.worldPoint(point);
      transform.position.set(position.x, FLOOR_HEIGHT + 0.24, position.z);
      transform.scale.set(0.3, 0.08, 0.29);
      transform.updateMatrix();
      cushions.setMatrixAt(index, transform.matrix);
      // The host's Milhaud seating faces its stage on the right of the source plan.
      transform.position.set(position.x - 0.13, FLOOR_HEIGHT + 0.4, position.z);
      transform.scale.set(0.065, 0.29, 0.29);
      transform.updateMatrix();
      backs.setMatrixAt(index, transform.matrix);
      transform.position.set(position.x, FLOOR_HEIGHT + 0.12, position.z);
      transform.scale.set(0.2, 0.2, 0.22);
      transform.updateMatrix();
      bases.setMatrixAt(index, transform.matrix);
    }
    for (const mesh of [cushions, backs, bases]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.model.add(mesh);
    }
  }

  private createLighting(): void {
    this.scene.add(this.fillLight);
    const center = this.bounds.getCenter(new Vector3());
    const key = this.keyLight;
    key.position.copy(center).add(new Vector3(-16, 35, 24));
    key.target.position.copy(center);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -26;
    key.shadow.camera.right = 26;
    key.shadow.camera.top = 26;
    key.shadow.camera.bottom = -26;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 90;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 4;
    this.scene.add(key, key.target);

    const ground = new Mesh(new PlaneGeometry(180, 180), this.shadowMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.045;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  private fitCamera(aspect: number): void {
    this.camera.updateMatrixWorld();
    const projectedBounds = new Box3();
    for (const x of [this.bounds.min.x, this.bounds.max.x]) {
      for (const y of [this.bounds.min.y, this.bounds.max.y]) {
        for (const z of [this.bounds.min.z, this.bounds.max.z]) {
          projectedBounds.expandByPoint(new Vector3(x, y, z).applyMatrix4(this.camera.matrixWorldInverse));
        }
      }
    }
    const size = projectedBounds.getSize(new Vector3());
    const height = Math.max(size.y + 3, (size.x + 3) / aspect);
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;
    this.camera.left = (-height * aspect) / 2;
    this.camera.right = (height * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }

  private updateRoomAppearance(): void {
    for (const [id, surface] of this.roomSurfaces) {
      surface.material.color.copy(surface.baseColor);
      if (this.plannedRooms.has(id)) surface.material.color.copy(this.plannedColor);
      else if (id === this.selectedRoom) surface.material.color.copy(this.selectedColor);
      else if (id === this.hoveredRoom) surface.material.color.lerp(this.selectedColor, 0.4);
      surface.outline.visible = id === this.selectedRoom;
    }
    this.scheduleRender();
  }

  private pickRoom(event: PointerEvent): string | null {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersection = this.raycaster.intersectObjects(this.pickableFloors, false)[0];
    return typeof intersection?.object.userData.roomId === 'string' ? intersection.object.userData.roomId : null;
  }

  private bindEvents(): void {
    const canvas = this.renderer.domElement;
    const options = { signal: this.eventController.signal };
    canvas.addEventListener(
      'pointerdown',
      (event) => {
        if (!event.isPrimary || event.button !== 0) {
          this.pointerStart = null;
          return;
        }
        this.pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId, dragged: false };
      },
      options
    );
    canvas.addEventListener(
      'pointermove',
      (event) => {
        if (
          this.pointerStart &&
          Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 6
        ) {
          this.pointerStart.dragged = true;
        }
        if (event.pointerType !== 'mouse' || event.buttons) return;
        const roomId = this.pickRoom(event);
        if (roomId !== this.hoveredRoom) {
          this.hoveredRoom = roomId;
          this.updateRoomAppearance();
        }
        canvas.style.cursor = roomId ? 'pointer' : this.interactive ? 'grab' : 'default';
      },
      options
    );
    canvas.addEventListener(
      'pointerup',
      (event) => {
        const start = this.pointerStart;
        this.pointerStart = null;
        if (!start || start.id !== event.pointerId || start.dragged) return;
        const roomId = this.pickRoom(event);
        if (roomId) this.options.onSelect(roomId);
      },
      options
    );
    canvas.addEventListener(
      'pointercancel',
      () => {
        this.pointerStart = null;
      },
      options
    );
    canvas.addEventListener(
      'pointerleave',
      () => {
        this.hoveredRoom = null;
        this.updateRoomAppearance();
      },
      options
    );
    canvas.addEventListener(
      'webglcontextlost',
      () => {
        if (this.disposed || this.unavailable) return;
        this.unavailable = true;
        cancelAnimationFrame(this.frame);
        this.options.onUnavailable?.();
      },
      options
    );
  }

  private readonly scheduleRender = (): void => {
    if (this.frame || this.disposed || this.unavailable) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.render(this.scene, this.camera);
      const { width, height } = this.options.container.getBoundingClientRect();
      this.options.onProject(
        venuePresentation.rooms
          .filter((room) => PRIMARY_ROOM_IDS.has(room.id))
          .map((room) => {
            const project = (point: PlanPoint, elevation: number): ScreenPoint => {
              const projected = this.worldPoint(point, elevation).project(this.camera);
              return { x: ((projected.x + 1) / 2) * width, y: ((1 - projected.y) / 2) * height };
            };
            const base = (room.elevation ?? 0) + FLOOR_HEIGHT;
            const outline = room.polygon.map((point) => project(point, base + WALL_HEIGHT));
            const footprint = [...outline, ...room.polygon.map((point) => project(point, base))];
            const anchor = this.worldPoint(room.label, (room.elevation ?? 0) + FLOOR_HEIGHT + 0.45).project(
              this.camera
            );
            return {
              id: room.id,
              center: VenueCardLayout.center(room.polygon.map((point) => project(point, base))),
              x: ((anchor.x + 1) / 2) * width,
              y: ((1 - anchor.y) / 2) * height,
              visible: Math.abs(anchor.x) < 0.96 && Math.abs(anchor.y) < 0.94 && Math.abs(anchor.z) < 1,
              outline,
              bounds: {
                left: Math.min(...footprint.map((point) => point.x)),
                right: Math.max(...footprint.map((point) => point.x)),
                top: Math.min(...footprint.map((point) => point.y)),
                bottom: Math.max(...footprint.map((point) => point.y)),
              },
            };
          })
      );
    });
  };
}
