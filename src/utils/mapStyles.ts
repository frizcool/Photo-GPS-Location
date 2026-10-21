import { MapStyle } from '../types/stamp';

export interface MapStyleOption {
  id: MapStyle;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  previewUrl: string; // Fast representative thumbnail tile
}

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  {
    id: 'roadmap',
    name: 'Jalan (Roadmap)',
    shortName: 'Jalan',
    tagline: 'Vektor standar & kontras tinggi',
    description: 'Peta jalan bersih dengan penamaan jalan, batas wilayah, dan visibilitas teks maksimal.',
    iconName: 'Map',
    accentColor: '#3b82f6',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-blue-200',
    // Carto Voyager / OSM tile preview
    previewUrl: 'https://basemaps.cartocdn.com/rastertiles/voyager/14/13322/8456.png',
  },
  {
    id: 'satellite',
    name: 'Satelit (Satellite)',
    shortName: 'Satelit',
    tagline: 'Foto udara satelit resolusi tinggi',
    description: 'Citra satelit fotorealistik dunia nyata dari udara untuk survei lapangan akurat.',
    iconName: 'Satellite',
    accentColor: '#10b981',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-emerald-200',
    // Esri World Imagery tile preview
    previewUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/8456/13322',
  },
  {
    id: 'terrain',
    name: 'Topografi (Terrain)',
    shortName: 'Topografi',
    tagline: 'Kontur ketinggian & relief medan',
    description: 'Peta kontur topografi dengan elevasi ketinggian, lereng bukit, dan fitur geospasial.',
    iconName: 'Mountain',
    accentColor: '#f59e0b',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-amber-200',
    // Esri World Topo tile preview
    previewUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/14/8456/13322',
  },
];

/**
 * Computes Mercator OSM / Web Mercator tile coordinates from (lat, lon, zoom)
 */
export function getTileCoords(zoom: number, lat: number, lon: number): { x: number; y: number; z: number } {
  const z = Math.max(1, Math.min(19, Math.round(zoom)));
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z)
  );
  return { x, y, z };
}

/**
 * Returns a high-speed, reliable, CORS-enabled tile URL for the given map style
 */
export function getMapTileUrl(
  style: MapStyle = 'roadmap',
  zoom: number = 16,
  lat: number,
  lon: number
): string {
  const { x, y, z } = getTileCoords(zoom, lat, lon);

  switch (style) {
    case 'satellite':
      // Esri World Imagery (ArcGIS) with worldwide resolution and CORS enabled
      // Tile path convention: {level}/{row}/{col} -> {z}/{y}/{x}
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

    case 'terrain':
      // Esri World Topo Map with contours and relief, worldwide CORS enabled
      // Tile path convention: {level}/{row}/{col} -> {z}/{y}/{x}
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`;

    case 'roadmap':
    default:
      // Carto Voyager: high clarity, street labels, Google-like palette, fully cached with CORS
      // Also falls back to OSM if needed
      return `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  }
}

/**
 * Returns alternative tile URL if primary tile fails to load
 */
export function getBackupMapTileUrl(
  style: MapStyle = 'roadmap',
  zoom: number = 16,
  lat: number,
  lon: number
): string {
  const { x, y, z } = getTileCoords(zoom, lat, lon);
  if (style === 'roadmap') {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }
  return getMapTileUrl(style, zoom, lat, lon);
}

/**
 * Cycles to the next map style in rotation (Roadmap -> Satellite -> Terrain -> Roadmap)
 */
export function getNextMapStyle(current: MapStyle = 'roadmap'): MapStyle {
  if (current === 'roadmap') return 'satellite';
  if (current === 'satellite') return 'terrain';
  return 'roadmap';
}

/**
 * Returns metadata object for a specific map style
 */
export function getMapStyleMeta(style: MapStyle = 'roadmap'): MapStyleOption {
  return MAP_STYLE_OPTIONS.find((s) => s.id === style) || MAP_STYLE_OPTIONS[0];
}
