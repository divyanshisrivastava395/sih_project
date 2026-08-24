import L from 'leaflet';
import { BaseMapProviderType } from '../types/disaster';

export interface MapLayerConfig {
  id: BaseMapProviderType;
  name: string;
  provider: 'Bhuvan / ISRO-NRSC' | 'CartoDB Dark GIS' | 'OpenStreetMap';
  attribution: string;
  url: string;
  options: L.TileLayerOptions;
  isBhuvan: boolean;
}

export const MAP_PROVIDERS: Record<BaseMapProviderType, MapLayerConfig> = {
  carto_dark: {
    id: 'carto_dark',
    name: 'Emergency High-Contrast Dark (Recommended)',
    provider: 'CartoDB Dark GIS',
    attribution: '&copy; CartoDB, OpenStreetMap contributors | Bhuvan ISRO GeoPlatform Layer Top',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      subdomains: 'abcd',
    },
    isBhuvan: false,
  },
  bhuvan_2d: {
    id: 'bhuvan_2d',
    name: 'Bhuvan ISRO Base (Indian Geo-Platform)',
    provider: 'Bhuvan / ISRO-NRSC',
    attribution: '&copy; Bhuvan / ISRO-NRSC National Remote Sensing Centre &copy; OSM',
    // Bhuvan WMS / Geo-Web-Cache Tile URL with resilient tile fallback
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 18,
      attribution: 'Map data &copy; Bhuvan ISRO-NRSC / OSM',
    },
    isBhuvan: true,
  },
  bhuvan_satellite: {
    id: 'bhuvan_satellite',
    name: 'Bhuvan ISRO Satellite / Terrain View',
    provider: 'Bhuvan / ISRO-NRSC',
    attribution: '&copy; ISRO Bhuvan Satellite Imagery &copy; Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 18,
    },
    isBhuvan: true,
  },
  osm_standard: {
    id: 'osm_standard',
    name: 'Standard Topographic Map',
    provider: 'OpenStreetMap',
    attribution: '&copy; OpenStreetMap contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      subdomains: 'abc',
    },
    isBhuvan: false,
  },
};

// India Geographic Bounding Box (Lat/Lng)
export const INDIA_MAP_CENTER: [number, number] = [22.5937, 78.9629];
export const INDIA_DEFAULT_ZOOM = 5;
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.75, 68.1],
  [35.5, 97.4],
];
