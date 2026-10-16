/**
 * Editable trace of the organiser's plan-v1.png (3203 × 2290 pixels).
 * Coordinates use the source raster: x increases rightward, y downward.
 * Boundaries follow wall centre lines; curves are sampled as short segments.
 * Raster tracing has a few pixels of uncertainty and does not specify height.
 * Wall height in the 3D presentation is therefore illustrative, not measured.
 *
 * This is the supplied event layout, not the venue's older public floor plan.
 * The amphitheatre itself is not present in this document: only its access is.
 */
export type PlanPoint = readonly [number, number];

export type VenueRoom = {
  id: string;
  name: string;
  polygon: readonly PlanPoint[];
  label: PlanPoint;
  kind: 'room' | 'circulation' | 'service' | 'outdoor';
  capacity?: number;
};

export type VenueWall = {
  start: PlanPoint;
  end: PlanPoint;
  thickness?: number;
};

export type VenueFixture = {
  kind: 'stage' | 'stand' | 'buffet' | 'stairs' | 'counter' | 'table' | 'seat-block' | 'plant';
  polygon: readonly PlanPoint[];
  /** Clockwise degrees in source-image coordinates; seats face east at 90°. */
  rotation?: number;
  /** Seat-block rows run along source y, columns along source x. */
  rows?: number;
  columns?: number;
};

export type VenueOpening = {
  id: string;
  from: string;
  to: string;
  start: PlanPoint;
  end: PlanPoint;
};

const rooms: readonly VenueRoom[] = [
  {
    id: 'milhaud',
    name: 'Milhaud',
    kind: 'room',
    capacity: 176,
    polygon: [
      [1593, 39],
      [3038, 39],
      [3038, 741],
      [2978, 741],
      [2978, 853],
      [1593, 853],
    ],
    label: [2214, 449],
  },
  {
    id: 'forbin',
    name: 'Forbin',
    kind: 'room',
    polygon: [
      [1954, 853],
      [3038, 853],
      [3038, 994],
      [2973, 994],
      [2973, 1117],
      [3038, 1117],
      [3038, 1406],
      [1954, 1406],
    ],
    label: [2492, 1055],
  },
  {
    id: 'sainte-victoire',
    name: 'Sainte-Victoire',
    kind: 'room',
    polygon: [
      [1589, 1406],
      [3038, 1406],
      [3038, 1518],
      [3118, 1518],
      [3118, 1626],
      [3038, 1626],
      [3038, 2250],
      [1882, 2250],
      [1589, 1957],
    ],
    label: [2338, 1664],
  },
  {
    id: 'picasso',
    name: 'Picasso',
    kind: 'room',
    polygon: [
      [840, 1507],
      [1227, 1507],
      [1227, 1401],
      [1589, 1401],
      [1589, 1957],
      [1296, 2250],
      [840, 2250],
    ],
    label: [1225, 1790],
  },
  {
    id: 'terrasse-picasso',
    name: 'Terrasse Picasso',
    kind: 'outdoor',
    polygon: [
      [47, 1563],
      [550, 1644],
      [665, 1644],
      [665, 1380],
      [840, 1380],
      [840, 2250],
      [47, 2250],
    ],
    label: [630, 2102],
  },
  {
    id: 'hall',
    name: 'Hall',
    kind: 'circulation',
    // The sponsor area deliberately overlays this open hall, without a partition.
    polygon: [
      [600, 423],
      [1087, 423],
      [1087, 326],
      [1593, 326],
      [1593, 853],
      [1954, 853],
      [1954, 1401],
      [1237, 1401],
      [1237, 784],
      [1106, 784],
      [1106, 725],
      [1030, 698],
      [968, 690],
      [900, 700],
      [830, 729],
      [842, 784],
      [600, 784],
    ],
    label: [1455, 1080],
  },
  {
    id: 'accueil',
    name: 'Accueil',
    kind: 'service',
    polygon: [
      [842, 784],
      [830, 729],
      [900, 700],
      [968, 690],
      [1030, 698],
      [1106, 725],
      [1078, 784],
      [1078, 1000],
      [1237, 1000],
      [1237, 1062],
      [842, 1062],
    ],
    label: [950, 900],
  },
  {
    id: 'vestiaire',
    name: 'Vestiaire',
    kind: 'service',
    polygon: [
      [1217, 39],
      [1593, 39],
      [1593, 326],
      [1217, 326],
    ],
    label: [1384, 252],
  },
  {
    id: 'sponsors',
    name: 'Zone sponsors',
    kind: 'service',
    polygon: [
      [1593, 863],
      [1941, 863],
      [1941, 1391],
      [1768, 1391],
      [1768, 1336],
    ],
    label: [1830, 1091],
  },
  {
    id: 'bar',
    name: 'Bar',
    kind: 'service',
    polygon: [
      [1589, 1957],
      [1882, 2250],
      [1296, 2250],
    ],
    label: [1589, 2180],
  },
  {
    id: 'amphitheatre-access',
    name: 'Accès amphithéâtre',
    kind: 'circulation',
    polygon: [
      [842, 1062],
      [1237, 1062],
      [1237, 1348],
      [842, 1348],
    ],
    label: [1030, 1210],
  },
  {
    id: 'lift',
    name: 'Ascenseur PMR',
    kind: 'service',
    polygon: [
      [1087, 850],
      [1217, 850],
      [1217, 1000],
      [1087, 1000],
    ],
    label: [1152, 929],
  },
  {
    id: 'accessible-toilets',
    name: 'Toilettes accessibles',
    kind: 'service',
    polygon: [
      [1087, 784],
      [1217, 784],
      [1217, 850],
      [1087, 850],
    ],
    label: [1152, 817],
  },
  {
    id: 'toilets-access',
    name: 'Accès toilettes',
    kind: 'circulation',
    polygon: [
      [1087, 39],
      [1217, 39],
      [1217, 326],
      [1087, 326],
    ],
    label: [1152, 282],
  },
  {
    id: 'congress-storage',
    name: 'Stockage congrès',
    kind: 'service',
    polygon: [
      [485, 800],
      [842, 800],
      [842, 1062],
      [485, 1062],
    ],
    label: [650, 935],
  },
  {
    id: 'congress-office',
    name: 'Bureau congrès',
    kind: 'service',
    polygon: [
      [485, 1062],
      [842, 1062],
      [842, 1380],
      [485, 1380],
    ],
    label: [659, 1150],
  },
  {
    id: 'technical-storage',
    name: 'Rangement technique',
    kind: 'service',
    polygon: [
      [840, 1380],
      [1227, 1380],
      [1227, 1507],
      [840, 1507],
    ],
    label: [1035, 1442],
  },
  {
    id: 'catering-north',
    name: 'Local traiteur',
    kind: 'service',
    polygon: [
      [3038, 1626],
      [3191, 1626],
      [3191, 1925],
      [3038, 1925],
    ],
    label: [3115, 1766],
  },
  {
    id: 'catering-south',
    name: 'Local traiteur',
    kind: 'service',
    polygon: [
      [3038, 1925],
      [3191, 1925],
      [3191, 2132],
      [3038, 2132],
    ],
    label: [3115, 2030],
  },
  {
    id: 'accessible-access',
    name: 'Accès PMR',
    kind: 'circulation',
    polygon: [
      [47, 790],
      [485, 790],
      [485, 1380],
      [665, 1380],
      [665, 1644],
      [550, 1644],
      [47, 1563],
    ],
    label: [414, 1186],
  },
  {
    id: 'entrance',
    name: 'Entrée',
    kind: 'circulation',
    // Sampled points follow the curved external entrance shown at the left.
    polygon: [
      [47, 790],
      [47, 640],
      [77, 496],
      [110, 417],
      [176, 268],
      [257, 120],
      [315, 159],
      [371, 205],
      [538, 413],
      [600, 423],
      [600, 790],
    ],
    label: [431, 682],
  },
];

// Explicit wall segments: opening gaps are never reconstructed from room polygons.
const walls: readonly VenueWall[] = [
  // Milhaud; its long south wall is continuous, with no passage into Forbin.
  { start: [1593, 39], end: [3038, 39], thickness: 20 },
  { start: [3038, 39], end: [3038, 741], thickness: 20 },
  { start: [3038, 741], end: [2978, 741] },
  { start: [2978, 741], end: [2978, 749] },
  { start: [2978, 815], end: [2978, 853] },
  { start: [1593, 853], end: [3038, 853], thickness: 20 },
  { start: [1593, 39], end: [1593, 359], thickness: 16 },
  { start: [1593, 424], end: [1593, 507], thickness: 12 },
  { start: [1593, 572], end: [1593, 853], thickness: 12 },
  // Forbin's west wall separates it from the hall/sponsor wedge.
  { start: [1954, 853], end: [1954, 1406], thickness: 20 },
  { start: [3038, 853], end: [3038, 994], thickness: 20 },
  { start: [3038, 994], end: [2973, 994] },
  { start: [2973, 994], end: [2973, 1005] },
  { start: [2973, 1109], end: [2973, 1117] },
  { start: [2973, 1117], end: [3038, 1117] },
  { start: [3038, 1117], end: [3038, 1518], thickness: 20 },
  { start: [1954, 1406], end: [2028, 1406] },
  { start: [2239, 1406], end: [2752, 1406] },
  { start: [2965, 1406], end: [3038, 1406] },
  // The substantial piers extend below the two Forbin openings in the plan.
  { start: [1954, 1406], end: [1954, 1518], thickness: 20 },
  { start: [2315, 1352], end: [2315, 1518], thickness: 20 },
  { start: [2678, 1352], end: [2678, 1518], thickness: 20 },
  // Hall to Sainte-Victoire: one double-door opening beside the sponsor wedge.
  { start: [1237, 1401], end: [1634, 1401] },
  { start: [1768, 1401], end: [1954, 1401] },
  // Picasso east wall, interrupted twice. No wall across the bar counter.
  { start: [1589, 1348], end: [1589, 1717], thickness: 20 },
  { start: [1589, 1825], end: [1589, 1833], thickness: 14 },
  { start: [1589, 1939], end: [1589, 1987], thickness: 20 },
  // Sainte-Victoire exterior and catering rooms.
  { start: [3038, 1518], end: [3118, 1518] },
  { start: [3118, 1626], end: [3038, 1626] },
  { start: [3038, 1626], end: [3038, 1843], thickness: 20 },
  { start: [3038, 1912], end: [3038, 1956], thickness: 20 },
  { start: [3038, 2027], end: [3038, 2132], thickness: 20 },
  { start: [3038, 2132], end: [3191, 2132], thickness: 20 },
  { start: [3191, 2132], end: [3191, 2250], thickness: 20 },
  { start: [1296, 2250], end: [3191, 2250], thickness: 20 },
  { start: [3038, 1626], end: [3191, 1626], thickness: 20 },
  { start: [3191, 1626], end: [3191, 2132], thickness: 16 },
  { start: [3038, 1925], end: [3191, 1925] },
  // Picasso and the terrace; the west door remains clear.
  { start: [840, 2250], end: [1296, 2250], thickness: 20 },
  { start: [840, 1507], end: [840, 1768], thickness: 16 },
  { start: [840, 1878], end: [840, 2250], thickness: 16 },
  { start: [840, 1507], end: [1227, 1507] },
  { start: [1227, 1507], end: [1227, 1348], thickness: 20 },
  { start: [840, 1380], end: [1227, 1380], thickness: 20 },
  { start: [840, 1380], end: [840, 1507] },
  // Amphitheatre access: stairs occupy only the footprint actually supplied.
  { start: [842, 1062], end: [842, 1380], thickness: 20 },
  { start: [842, 1348], end: [1237, 1348], thickness: 16 },
  { start: [1237, 1000], end: [1237, 1104], thickness: 20 },
  { start: [1237, 1218], end: [1237, 1237], thickness: 20 },
  { start: [1237, 1328], end: [1237, 1401], thickness: 20 },
  // Reception and accessible facilities.
  { start: [1087, 784], end: [1087, 1000], thickness: 16 },
  { start: [1087, 1000], end: [1237, 1000], thickness: 20 },
  { start: [1217, 784], end: [1217, 1000], thickness: 20 },
  { start: [1087, 850], end: [1109, 850] },
  { start: [1197, 850], end: [1217, 850] },
  { start: [842, 800], end: [842, 916] },
  // Congress storage and office, preserving their documented door gaps.
  { start: [485, 800], end: [744, 800], thickness: 20 },
  { start: [485, 800], end: [485, 1380], thickness: 20 },
  { start: [485, 1062], end: [732, 1062], thickness: 20 },
  { start: [791, 1062], end: [842, 1062], thickness: 20 },
  { start: [485, 1380], end: [596, 1380], thickness: 20 },
  { start: [661, 1380], end: [842, 1380], thickness: 20 },
  // Vestiaire is open towards the hall, behind its curved service counter.
  { start: [1217, 39], end: [1593, 39], thickness: 20 },
  { start: [1217, 39], end: [1217, 326], thickness: 20 },
  { start: [1087, 39], end: [1087, 326], thickness: 20 },
  // North-west hall boundary and the two main entrance doors.
  { start: [538, 413], end: [1087, 413], thickness: 20 },
  { start: [1087, 413], end: [1087, 396] },
  { start: [1087, 350], end: [1087, 326] },
  { start: [600, 423], end: [600, 462], thickness: 12 },
  { start: [600, 598], end: [600, 615], thickness: 12 },
  { start: [600, 748], end: [600, 790], thickness: 12 },
  { start: [485, 790], end: [600, 790] },
  // Terrace edge is a low perimeter in the presentation, not an added building.
  { start: [47, 1563], end: [550, 1644], thickness: 8 },
  { start: [665, 1644], end: [665, 1380], thickness: 8 },
  { start: [47, 1563], end: [47, 2250], thickness: 8 },
  { start: [47, 2250], end: [840, 2250], thickness: 8 },
];

const openings: readonly VenueOpening[] = [
  { id: 'hall-milhaud-north', from: 'hall', to: 'milhaud', start: [1593, 359], end: [1593, 424] },
  { id: 'hall-milhaud-south', from: 'hall', to: 'milhaud', start: [1593, 507], end: [1593, 572] },
  { id: 'forbin-sainte-victoire-west', from: 'forbin', to: 'sainte-victoire', start: [2028, 1406], end: [2239, 1406] },
  { id: 'forbin-sainte-victoire-east', from: 'forbin', to: 'sainte-victoire', start: [2752, 1406], end: [2965, 1406] },
  {
    id: 'picasso-sainte-victoire-north',
    from: 'picasso',
    to: 'sainte-victoire',
    start: [1589, 1717],
    end: [1589, 1825],
  },
  {
    id: 'picasso-sainte-victoire-south',
    from: 'picasso',
    to: 'sainte-victoire',
    start: [1589, 1833],
    end: [1589, 1939],
  },
  { id: 'hall-amphitheatre-north', from: 'hall', to: 'amphitheatre-access', start: [1237, 1104], end: [1237, 1218] },
  { id: 'hall-amphitheatre-south', from: 'hall', to: 'amphitheatre-access', start: [1237, 1237], end: [1237, 1328] },
  { id: 'hall-sainte-victoire', from: 'hall', to: 'sainte-victoire', start: [1634, 1401], end: [1768, 1401] },
  { id: 'picasso-terrace', from: 'picasso', to: 'terrasse-picasso', start: [840, 1768], end: [840, 1878] },
  { id: 'terrace-access', from: 'accessible-access', to: 'terrasse-picasso', start: [550, 1644], end: [665, 1644] },
  { id: 'entrance-hall-north', from: 'entrance', to: 'hall', start: [600, 462], end: [600, 598] },
  { id: 'entrance-hall-south', from: 'entrance', to: 'hall', start: [600, 615], end: [600, 748] },
  { id: 'milhaud-exit', from: 'milhaud', to: 'outside', start: [2978, 749], end: [2978, 815] },
  { id: 'forbin-exit', from: 'forbin', to: 'outside', start: [2973, 1005], end: [2973, 1109] },
  { id: 'sainte-victoire-exit', from: 'sainte-victoire', to: 'outside', start: [3118, 1518], end: [3118, 1626] },
  { id: 'catering-north-door', from: 'sainte-victoire', to: 'catering-north', start: [3038, 1843], end: [3038, 1912] },
  { id: 'catering-south-door', from: 'sainte-victoire', to: 'catering-south', start: [3038, 1956], end: [3038, 2027] },
];

const fixtures: readonly VenueFixture[] = [
  // Documented Milhaud stage and 176 chairs, facing east/right towards the stage.
  {
    kind: 'stage',
    polygon: [
      [2736, 90],
      [2967, 90],
      [2967, 695],
      [2736, 695],
    ],
  },
  {
    kind: 'seat-block',
    polygon: [
      [1774, 155],
      [2088, 155],
      [2088, 404],
      [1774, 404],
    ],
    rows: 7,
    columns: 5,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2115, 190],
      [2223, 190],
      [2223, 404],
      [2115, 404],
    ],
    rows: 6,
    columns: 2,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2251, 190],
      [2291, 190],
      [2291, 404],
      [2251, 404],
    ],
    rows: 6,
    columns: 1,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2319, 155],
      [2633, 155],
      [2633, 404],
      [2319, 404],
    ],
    rows: 7,
    columns: 5,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [1774, 511],
      [2088, 511],
      [2088, 759],
      [1774, 759],
    ],
    rows: 7,
    columns: 5,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2115, 511],
      [2223, 511],
      [2223, 723],
      [2115, 723],
    ],
    rows: 6,
    columns: 2,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2251, 511],
      [2291, 511],
      [2291, 723],
      [2251, 723],
    ],
    rows: 6,
    columns: 1,
    rotation: 90,
  },
  {
    kind: 'seat-block',
    polygon: [
      [2319, 511],
      [2633, 511],
      [2633, 759],
      [2319, 759],
    ],
    rows: 7,
    columns: 5,
    rotation: 90,
  },
  {
    kind: 'counter',
    polygon: [
      [1650, 100],
      [1707, 100],
      [1707, 282],
      [1650, 282],
    ],
  },
  // Forbin: six stands along the north wall and two along the south partition.
  {
    kind: 'stand',
    polygon: [
      [2044, 931],
      [2134, 931],
      [2134, 988],
      [2044, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2195, 931],
      [2285, 931],
      [2285, 988],
      [2195, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2346, 931],
      [2436, 931],
      [2436, 988],
      [2346, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2497, 931],
      [2587, 931],
      [2587, 988],
      [2497, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2648, 931],
      [2738, 931],
      [2738, 988],
      [2648, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2799, 931],
      [2889, 931],
      [2889, 988],
      [2799, 988],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2376, 1282],
      [2467, 1282],
      [2467, 1339],
      [2376, 1339],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2527, 1282],
      [2618, 1282],
      [2618, 1339],
      [2527, 1339],
    ],
  },
  {
    kind: 'buffet',
    polygon: [
      [2403, 1106],
      [2593, 1106],
      [2593, 1167],
      [2403, 1167],
    ],
  },
  // Sainte-Victoire: four stands and the two square buffets.
  {
    kind: 'stand',
    polygon: [
      [2013, 2095],
      [2104, 2095],
      [2104, 2152],
      [2013, 2152],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2240, 2095],
      [2331, 2095],
      [2331, 2152],
      [2240, 2152],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2467, 2095],
      [2558, 2095],
      [2558, 2152],
      [2467, 2152],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [2694, 2095],
      [2785, 2095],
      [2785, 2152],
      [2694, 2152],
    ],
  },
  {
    kind: 'buffet',
    polygon: [
      [2057, 1762],
      [2209, 1762],
      [2209, 1914],
      [2057, 1914],
    ],
  },
  {
    kind: 'buffet',
    polygon: [
      [2428, 1762],
      [2580, 1762],
      [2580, 1914],
      [2428, 1914],
    ],
  },
  // Picasso: one northern stand, two southern stands and the diagonal buffet.
  {
    kind: 'stand',
    polygon: [
      [1332, 1481],
      [1422, 1481],
      [1422, 1538],
      [1332, 1538],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [988, 2065],
      [1080, 2065],
      [1080, 2122],
      [988, 2122],
    ],
  },
  {
    kind: 'stand',
    polygon: [
      [1154, 2065],
      [1246, 2065],
      [1246, 2122],
      [1154, 2122],
    ],
  },
  {
    kind: 'buffet',
    polygon: [
      [1068, 1540],
      [1120, 1592],
      [960, 1751],
      [908, 1699],
    ],
  },
  // Two existing stair flights: these are not a reconstructed upper-floor room.
  {
    kind: 'stairs',
    polygon: [
      [860, 1097],
      [1101, 1097],
      [1101, 1201],
      [860, 1201],
    ],
    rows: 11,
    rotation: 90,
  },
  {
    kind: 'stairs',
    polygon: [
      [860, 1209],
      [1101, 1209],
      [1101, 1328],
      [860, 1328],
    ],
    rows: 11,
    rotation: 90,
  },
  {
    kind: 'stairs',
    polygon: [
      [1088, 111],
      [1217, 111],
      [1217, 248],
      [1088, 248],
    ],
    rows: 7,
  },
  // Curved reception and cloakroom counters are sampled from their actual arcs.
  {
    kind: 'counter',
    polygon: [
      [830, 729],
      [900, 700],
      [968, 690],
      [1030, 698],
      [1106, 725],
      [1078, 784],
      [1020, 764],
      [968, 757],
      [910, 765],
      [842, 790],
    ],
  },
  {
    kind: 'counter',
    polygon: [
      [1237, 296],
      [1302, 319],
      [1384, 330],
      [1460, 321],
      [1503, 307],
      [1518, 338],
      [1460, 356],
      [1384, 364],
      [1300, 352],
      [1217, 326],
    ],
  },
  {
    kind: 'counter',
    polygon: [
      [901, 1029],
      [1102, 1029],
      [1102, 1075],
      [901, 1075],
    ],
  },
  {
    kind: 'counter',
    polygon: [
      [1430, 2126],
      [1589, 1968],
      [1589, 2048],
      [1468, 2176],
    ],
  },
  {
    kind: 'counter',
    polygon: [
      [1589, 1968],
      [1839, 2218],
      [1790, 2217],
      [1589, 2048],
    ],
  },
  // Round tables are described by their source bounding squares.
  ...(
    [
      [2031, 1076],
      [2195, 1160],
      [2739, 1122],
      [2953, 1254],
      [2015, 1328],
      [2291, 1301],
      [2713, 1323],
      [1674, 1587],
      [1967, 1563],
      [2110, 1673],
      [2413, 1498],
      [2595, 1498],
      [2500, 1647],
      [2785, 1673],
      [1848, 1775],
      [2314, 1801],
      [2720, 1878],
      [1813, 1963],
      [2913, 1990],
      [1205, 1673],
      [1041, 1854],
      [1388, 1884],
      [1465, 1596],
      [947, 2007],
      [1287, 2006],
      [1374, 1341],
      [1520, 1319],
      [1278, 890],
      [1529, 849],
      [387, 1795],
      [619, 1810],
      [510, 1903],
      [390, 1981],
      [583, 2025],
      [218, 1703],
      [739, 1504],
    ] satisfies PlanPoint[]
  ).map(
    ([x, y]): VenueFixture => ({
      kind: 'table',
      polygon: [
        [x - 26, y - 26],
        [x + 26, y - 26],
        [x + 26, y + 26],
        [x - 26, y + 26],
      ],
    })
  ),
  ...(
    [
      [302, 864],
      [302, 1098],
      [302, 1332],
      [92, 1772],
      [92, 1907],
      [504, 1697],
      [878, 1551],
      [1188, 1074],
    ] satisfies PlanPoint[]
  ).map(
    ([x, y]): VenueFixture => ({
      kind: 'plant',
      polygon: [
        [x - 31, y - 31],
        [x + 31, y - 31],
        [x + 31, y + 31],
        [x - 31, y + 31],
      ],
    })
  ),
];

export const venueLayout = {
  source: { width: 3203, height: 2290 },
  rooms,
  walls,
  fixtures,
  openings,
} as const;
