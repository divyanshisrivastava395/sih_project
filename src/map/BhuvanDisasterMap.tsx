import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  DisasterAlert,
  Habitation,
  HazardZone,
  RelocationSite,
  ResourcePoint,
  SOSRequest,
} from '../types/disaster';
import {
  INDIAN_STATES,
  StateInfo,
  DistrictInfo,
} from '../data/statesData';
import {
  createResourceMarkerIcon,
  createShelterMarkerIcon,
  createSOSMarkerIcon,
  createUserMarkerIcon,
  createHabitationMarkerIcon,
} from './mapIcons';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Compass,
  Search,
  Eye,
} from 'lucide-react';

interface BhuvanDisasterMapProps {
  hazards: HazardZone[];
  relocationSites: RelocationSite[];
  resources: ResourcePoint[];
  habitations: Habitation[];
  sosRequests: SOSRequest[];
  userCoords: [number, number];
  userLocationName: string;
  selectedStateId?: string;
  onStateChange?: (stateId: string) => void;
  selectedDistrictId?: string;
  onDistrictChange?: (districtId: string) => void;
  activeRouteDestination: {
    lat: number;
    lng: number;
    title: string;
    type: 'shelter' | 'resource';
  } | null;
  onClearRoute: () => void;
  onSelectShelter: (site: RelocationSite) => void;
  onSelectResource: (res: ResourcePoint) => void;
  onSelectHazard: (haz: HazardZone) => void;
  onSelectSOS: (sos: SOSRequest) => void;
  onSelectHabitation: (hab: Habitation) => void;
  onFindSafePlace?: () => void;
  recommendedSiteId?: string;
  filterType: string;
  filterSeverity: string;
  onFilterTypeChange: (filter: string) => void;
  onFilterSeverityChange: (severity: string) => void;
}

export const BhuvanDisasterMap: React.FC<BhuvanDisasterMapProps> = ({
  hazards,
  relocationSites,
  resources,
  habitations,
  sosRequests,
  userCoords,
  userLocationName,
  selectedStateId = 'uttarakhand',
  onStateChange,
  selectedDistrictId = 'all',
  onDistrictChange,
  activeRouteDestination,
  onClearRoute,
  onSelectShelter,
  onSelectResource,
  onSelectHazard,
  onSelectSOS,
  onSelectHabitation,
  onFindSafePlace,
  recommendedSiteId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Dedicated Layer Groups
  const userLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const hazardPolygonLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const shelterLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const resourceLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const sosLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const habitationsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const routeLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // State
  const [currentStateId, setCurrentStateId] = useState<string>(selectedStateId);
  const [currentDistrictId, setCurrentDistrictId] = useState<string>(selectedDistrictId);
  const [selectedRedZoneId, setSelectedRedZoneId] = useState<string>('none');
  const [activeBaseMapStyle, setActiveBaseMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(8);

  // Selected item info card
  const [selectedItemCard, setSelectedItemCard] = useState<{
    type: 'hazard' | 'shelter' | 'resource' | 'sos' | 'habitation';
    data: any;
    distanceKm: number;
  } | null>(null);

  // Category filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    'ALL' | 'HAZARDS' | 'SHELTERS' | 'WATER' | 'MEDICAL' | 'FOOD' | 'SOS'
  >('ALL');

  // Quick State & District Definition
  const currentState = INDIAN_STATES.find((s) => s.id === currentStateId) || INDIAN_STATES[0];
  const currentDistrict = currentState.districts.find((d) => d.id === currentDistrictId) || currentState.districts[0];

  // State-specific hazards
  const stateHazards = hazards.filter(
    (h) => h.state.toLowerCase() === currentState.name.toLowerCase()
  );

  // Calculate straight-line distance in KM
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = currentState.coords;
    const initialZoom = currentState.zoom;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    // Topographic / Standard Base Map Tile Layer with clear labels for roads, rivers, towns
    const standardUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(standardUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Attach Layer Groups (Ordered for proper rendering)
    hazardPolygonLayerGroupRef.current.addTo(map);
    habitationsLayerGroupRef.current.addTo(map);
    shelterLayerGroupRef.current.addTo(map);
    resourceLayerGroupRef.current.addTo(map);
    sosLayerGroupRef.current.addTo(map);
    routeLayerGroupRef.current.addTo(map);
    userLayerGroupRef.current.addTo(map);

    // Track zoom level
    map.on('zoomend', () => {
      setCurrentZoomLevel(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Basemap Style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    if (activeBaseMapStyle === 'satellite') {
      tileLayerRef.current.setUrl(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      );
    } else {
      tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    }
  }, [activeBaseMapStyle]);

  // 3. Handle State & District Change (Center and Zoom Map)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (currentDistrictId && currentDistrictId !== 'all') {
      const dist = currentState.districts.find((d) => d.id === currentDistrictId);
      if (dist) {
        mapInstanceRef.current.flyTo(dist.coords, dist.zoom, {
          duration: 1.2,
          easeLinearity: 0.25,
        });
        return;
      }
    }

    // Default to State Zoom
    mapInstanceRef.current.flyTo(currentState.coords, currentState.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [currentStateId, currentDistrictId]);

  // Sync external state changes
  useEffect(() => {
    if (selectedStateId && selectedStateId !== currentStateId) {
      setCurrentStateId(selectedStateId);
      setCurrentDistrictId('all');
      setSelectedRedZoneId('none');
    }
  }, [selectedStateId]);

  // 4. Handle Red Zone selection & zooming
  const handleSelectRedZone = (hazardId: string) => {
    setSelectedRedZoneId(hazardId);
    if (hazardId === 'none') {
      setSelectedItemCard(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(currentState.coords, currentState.zoom, { duration: 1 });
      }
      return;
    }

    const hazard = hazards.find((h) => h.id === hazardId);
    if (hazard && mapInstanceRef.current) {
      const radiusMeters = hazard.radiusMeters || 25000;
      const circleBounds = L.latLng(hazard.latitude, hazard.longitude).toBounds(radiusMeters * 2);
      mapInstanceRef.current.fitBounds(circleBounds, {
        padding: [60, 60],
        maxZoom: 13,
        animate: true,
      });

      const dist = calculateDistance(userCoords[0], userCoords[1], hazard.latitude, hazard.longitude);
      setSelectedItemCard({
        type: 'hazard',
        data: hazard,
        distanceKm: dist,
      });
      onSelectHazard(hazard);
    }
  };

  // 5. Render Hazards & Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear previous layers
    hazardPolygonLayerGroupRef.current.clearLayers();
    userLayerGroupRef.current.clearLayers();
    shelterLayerGroupRef.current.clearLayers();
    resourceLayerGroupRef.current.clearLayers();
    sosLayerGroupRef.current.clearLayers();
    habitationsLayerGroupRef.current.clearLayers();

    // -------------------------------------------------------------
    // A. RENDER SEMI-TRANSPARENT CIRCULAR RED ZONES FOR HIGH-RISK AREAS
    // -------------------------------------------------------------
    if (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'HAZARDS') {
      stateHazards.forEach((hazard) => {
        const isSelected = hazard.id === selectedRedZoneId;
        const radiusMeters = hazard.radiusMeters || 25000;

        // Circular Red Zone with semi-transparent red styling & dashed boundary
        const circle = L.circle([hazard.latitude, hazard.longitude], {
          radius: radiusMeters,
          color: '#dc2626', // strong red border
          weight: isSelected ? 3.5 : 2,
          opacity: 0.9,
          fillColor: '#ef4444', // semi-transparent red fill
          fillOpacity: isSelected ? 0.42 : 0.28,
          dashArray: '6, 6',
          interactive: true,
        });

        const dist = calculateDistance(userCoords[0], userCoords[1], hazard.latitude, hazard.longitude);

        // Hover styling
        circle.on('mouseover', (e) => {
          const layer = e.target as L.Circle;
          layer.setStyle({
            fillOpacity: 0.48,
            weight: 3.5,
          });
        });

        circle.on('mouseout', (e) => {
          const layer = e.target as L.Circle;
          layer.setStyle({
            fillOpacity: isSelected ? 0.42 : 0.28,
            weight: isSelected ? 3.5 : 2,
          });
        });

        // Click on Circular Red Zone: zoom & center, open info card
        circle.on('click', () => {
          setSelectedRedZoneId(hazard.id);
          if (mapInstanceRef.current) {
            const circleBounds = L.latLng(hazard.latitude, hazard.longitude).toBounds(radiusMeters * 2);
            mapInstanceRef.current.fitBounds(circleBounds, {
              padding: [60, 60],
              maxZoom: 13,
              animate: true,
            });
          }
          setSelectedItemCard({
            type: 'hazard',
            data: hazard,
            distanceKm: dist,
          });
          onSelectHazard(hazard);
        });

        circle.bindTooltip(
          `<div class="p-1 text-xs font-bold text-red-600 flex items-center gap-1">
            <span>🔴 Circular Red Zone:</span>
            <span>${hazard.name}</span>
          </div>`,
          { sticky: true, direction: 'top', offset: [0, -10] }
        );

        hazardPolygonLayerGroupRef.current.addLayer(circle);
      });
    }

    // -------------------------------------------------------------
    // B. RENDER 📍 MY LOCATION PIN
    // -------------------------------------------------------------
    const userMarker = L.marker(userCoords, {
      icon: createUserMarkerIcon(),
      zIndexOffset: 1000,
    });
    userMarker.bindTooltip(
      `<div class="p-1 text-xs font-bold text-gray-900">📍 You Are Here: ${userLocationName}</div>`,
      { direction: 'top', offset: [0, -18] }
    );
    userLayerGroupRef.current.addLayer(userMarker);

    // Filter data by selected state
    const stateRelocationSites = relocationSites.filter(
      (s) => s.state.toLowerCase() === currentState.name.toLowerCase()
    );
    const stateResources = resources.filter(
      (r) => r.state.toLowerCase() === currentState.name.toLowerCase()
    );
    const stateHabitations = habitations.filter(
      (h) => h.state.toLowerCase() === currentState.name.toLowerCase()
    );
    const stateSOS = sosRequests;

    // -------------------------------------------------------------
    // C. RENDER 🏠 RELOCATION SITES (Independent Pins)
    // -------------------------------------------------------------
    if (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'SHELTERS') {
      stateRelocationSites.forEach((site) => {
        const isRec = site.id === recommendedSiteId;
        const shelterMarker = L.marker([site.latitude, site.longitude], {
          icon: createShelterMarkerIcon(site.available_capacity, site.hazard_risk, isRec),
          zIndexOffset: isRec ? 800 : 500,
        });

        const dist = calculateDistance(userCoords[0], userCoords[1], site.latitude, site.longitude);

        shelterMarker.on('click', () => {
          setSelectedItemCard({
            type: 'shelter',
            data: site,
            distanceKm: dist,
          });
        });

        shelterMarker.bindTooltip(
          `<div class="text-xs p-1 font-semibold">🏠 ${site.name} (${dist} km)<br/><span class="text-emerald-700 font-bold">${site.available_capacity} beds available</span></div>`,
          { direction: 'top', offset: [0, -20] }
        );

        shelterLayerGroupRef.current.addLayer(shelterMarker);
      });
    }

    // -------------------------------------------------------------
    // D. RENDER 💧 WATER, 🏥 MEDICAL, 🍚 FOOD (Independent Pins)
    // -------------------------------------------------------------
    if (activeCategoryFilter !== 'SHELTERS' && activeCategoryFilter !== 'SOS' && activeCategoryFilter !== 'HAZARDS') {
      stateResources.forEach((res) => {
        const typeMatch =
          activeCategoryFilter === 'ALL' ||
          (activeCategoryFilter === 'WATER' && (res.type === 'WATER' || res.type === 'water')) ||
          (activeCategoryFilter === 'MEDICAL' && (res.type === 'MEDICAL' || res.type === 'medical')) ||
          (activeCategoryFilter === 'FOOD' && (res.type === 'FOOD' || res.type === 'food'));

        if (!typeMatch) return;

        const resMarker = L.marker([res.latitude, res.longitude], {
          icon: createResourceMarkerIcon(
            res.type === 'WATER' || res.type === 'water'
              ? 'water'
              : res.type === 'MEDICAL' || res.type === 'medical'
              ? 'medical'
              : res.type === 'FOOD' || res.type === 'food'
              ? 'food'
              : 'emergency_help'
          ),
          zIndexOffset: 400,
        });

        const dist = calculateDistance(userCoords[0], userCoords[1], res.latitude, res.longitude);

        resMarker.on('click', () => {
          setSelectedItemCard({
            type: 'resource',
            data: res,
            distanceKm: dist,
          });
        });

        resMarker.bindTooltip(
          `<div class="text-xs p-1 font-semibold">${
            res.type.toString().toUpperCase() === 'WATER' ? '💧' : res.type.toString().toUpperCase() === 'MEDICAL' ? '🏥' : '🍚'
          } ${res.name} (${dist} km)</div>`,
          { direction: 'top', offset: [0, -16] }
        );

        resourceLayerGroupRef.current.addLayer(resMarker);
      });
    }

    // -------------------------------------------------------------
    // E. RENDER 🆘 SOS DISTRESS BEACONS
    // -------------------------------------------------------------
    if (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'SOS') {
      stateSOS.forEach((sos) => {
        const sosMarker = L.marker([sos.latitude, sos.longitude], {
          icon: createSOSMarkerIcon(sos.priority, sos.status),
          zIndexOffset: 700,
        });

        const dist = calculateDistance(userCoords[0], userCoords[1], sos.latitude, sos.longitude);

        sosMarker.on('click', () => {
          setSelectedItemCard({
            type: 'sos',
            data: sos,
            distanceKm: dist,
          });
        });

        sosMarker.bindTooltip(
          `<div class="text-xs p-1 font-bold text-red-600">🆘 ${sos.id}: ${sos.habitation} (${sos.people} people)</div>`,
          { direction: 'top', offset: [0, -18] }
        );

        sosLayerGroupRef.current.addLayer(sosMarker);
      });
    }

    // -------------------------------------------------------------
    // F. AT CLOSER ZOOM (>=10): SHOW VILLAGE / HABITATION LABELS
    // -------------------------------------------------------------
    if (currentZoomLevel >= 10) {
      stateHabitations.forEach((hab) => {
        const habMarker = L.marker([hab.latitude, hab.longitude], {
          icon: createHabitationMarkerIcon(hab.priority_level, hab.priority_score),
          zIndexOffset: 350,
        });

        const dist = calculateDistance(userCoords[0], userCoords[1], hab.latitude, hab.longitude);

        habMarker.on('click', () => {
          setSelectedItemCard({
            type: 'habitation',
            data: hab,
            distanceKm: dist,
          });
          onSelectHabitation(hab);
        });

        habMarker.bindTooltip(
          `<div class="text-xs p-1 font-semibold">🏘️ ${hab.name}<br/><span class="text-gray-600 text-[10px]">Pop: ${hab.population.toLocaleString()} • ${hab.priority_level} Risk</span></div>`,
          { direction: 'top', offset: [0, -15] }
        );

        habitationsLayerGroupRef.current.addLayer(habMarker);
      });
    }
  }, [
    userCoords,
    userLocationName,
    currentStateId,
    selectedRedZoneId,
    currentZoomLevel,
    hazards,
    relocationSites,
    resources,
    habitations,
    sosRequests,
    activeCategoryFilter,
    recommendedSiteId,
  ]);

  // 6. Render Active Route ONLY when user explicitly clicks "SHOW ROUTE"
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    routeLayerGroupRef.current.clearLayers();

    if (!activeRouteDestination) return;

    const start: [number, number] = userCoords;
    const end: [number, number] = [activeRouteDestination.lat, activeRouteDestination.lng];

    // Generate simulated road waypoint path
    const mid1: [number, number] = [
      start[0] + (end[0] - start[0]) * 0.35 + (end[1] - start[1]) * 0.08,
      start[1] + (end[1] - start[1]) * 0.35 - (end[0] - start[0]) * 0.08,
    ];
    const mid2: [number, number] = [
      start[0] + (end[0] - start[0]) * 0.7 - (end[1] - start[1]) * 0.05,
      start[1] + (end[1] - start[1]) * 0.7 + (end[0] - start[0]) * 0.05,
    ];

    const routeCoords = [start, mid1, mid2, end];

    // Outer glow line
    const outerLine = L.polyline(routeCoords, {
      color: '#0284c7',
      weight: 8,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    });

    // Inner crisp navigation line
    const innerLine = L.polyline(routeCoords, {
      color: '#2563eb',
      weight: 4,
      opacity: 0.95,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round',
    });

    routeLayerGroupRef.current.addLayer(outerLine);
    routeLayerGroupRef.current.addLayer(innerLine);

    // Zoom to fit the entire route comfortably
    const bounds = L.latLngBounds([start, end]);
    mapInstanceRef.current.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 15,
      animate: true,
    });
  }, [activeRouteDestination, userCoords]);

  // Handle State Selection
  const handleStateSelect = (stateId: string) => {
    setCurrentStateId(stateId);
    setCurrentDistrictId('all');
    setSelectedRedZoneId('none');
    setSelectedItemCard(null);
    if (onStateChange) onStateChange(stateId);
    if (onDistrictChange) onDistrictChange('all');
  };

  // Handle District Selection
  const handleDistrictSelect = (distId: string) => {
    setCurrentDistrictId(distId);
    setSelectedRedZoneId('none');
    setSelectedItemCard(null);
    if (onDistrictChange) onDistrictChange(distId);
  };

  // Quick GPS / My Location center action
  const handleCenterOnUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCoords, 13, {
        duration: 1,
      });
    }
  };

  // Helper for hazard type formatting
  const getHazardTypeLabel = (type: string) => {
    switch (type) {
      case 'flood':
        return '🌊 Flood & River Inundation';
      case 'landslide':
        return '⛰️ Landslide & Slope Instability';
      case 'cyclone':
        return '🌀 Cyclone & Storm Surge';
      case 'earthquake':
        return '⚡ Earthquake Shock Zone';
      default:
        return '⚠️ High-Risk Disaster Zone';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] flex flex-col bg-slate-50 overflow-hidden select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. SIMPLE MAP HEADER: State & District Selector Only */}
      {/* ------------------------------------------------------------- */}
      <div className="z-20 bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Location Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={15} className="text-blue-600" />
              Active Region:
            </span>

            {/* State Dropdown */}
            <select
              value={currentStateId}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="bg-slate-50 border border-slate-300 hover:border-blue-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              {INDIAN_STATES.map((state) => (
                <option key={state.id} value={state.id} className="bg-white text-slate-900">
                  {state.name} {state.hindiName ? `(${state.hindiName})` : ''}
                </option>
              ))}
            </select>

            {/* District Dropdown */}
            <select
              value={currentDistrictId}
              onChange={(e) => handleDistrictSelect(e.target.value)}
              className="bg-slate-50 border border-slate-300 hover:border-blue-500 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              {currentState.districts.map((dist) => (
                <option key={dist.id} value={dist.id} className="bg-white text-slate-900">
                  {dist.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. LEAFLET MAP CONTAINER (No zoom controls, no satellite toggle, no tooltip) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-100" />

        {/* ------------------------------------------------------------- */}
        {/* 3. ACTIVE ROUTE NOTIFICATION BANNER (When Route is Shown) */}
        {/* ------------------------------------------------------------- */}
        {activeRouteDestination && (
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-blue-300 rounded-xl p-3 shadow-lg flex items-center gap-3 max-w-md animate-in slide-in-from-top duration-200">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Navigation size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                Route to: {activeRouteDestination.title}
              </div>
              <div className="text-[11px] text-blue-600 font-medium">
                Safe evacuation path mapped from your location
              </div>
            </div>
            <button
              onClick={onClearRoute}
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
              title="Clear Route"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. LIGHT THEMED INFORMATION CARDS (Pins & Red Zone Polygons) */}
        {/* ------------------------------------------------------------- */}
        {selectedItemCard && (
          <div className="absolute bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:w-96 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-3.5 max-h-[80vh] overflow-y-auto">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {selectedItemCard.type === 'hazard'
                    ? '🔴'
                    : selectedItemCard.type === 'shelter'
                    ? '🏠'
                    : selectedItemCard.type === 'sos'
                    ? '🆘'
                    : selectedItemCard.type === 'habitation'
                    ? '🏘️'
                    : selectedItemCard.data.type === 'WATER' || selectedItemCard.data.type === 'water'
                    ? '💧'
                    : selectedItemCard.data.type === 'MEDICAL' || selectedItemCard.data.type === 'medical'
                    ? '🏥'
                    : '🍚'}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedItemCard.type === 'hazard'
                      ? selectedItemCard.data.name
                      : selectedItemCard.type === 'shelter'
                      ? selectedItemCard.data.name
                      : selectedItemCard.type === 'sos'
                      ? `Distress Beacon: ${selectedItemCard.data.habitation}`
                      : selectedItemCard.type === 'habitation'
                      ? selectedItemCard.data.name
                      : selectedItemCard.data.name}
                  </h3>
                  <span className="text-xs text-blue-600 font-semibold font-mono">
                    📍 {selectedItemCard.distanceKm} km from your location
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedItemCard(null);
                  setSelectedRedZoneId('none');
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* A. RED ZONE / HAZARD INFORMATION CARD */}
            {selectedItemCard.type === 'hazard' && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl space-y-2 text-xs">
                  {/* Hazard Type */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hazard Type:</span>
                    <strong className="text-red-700 font-bold">
                      {getHazardTypeLabel(selectedItemCard.data.type)}
                    </strong>
                  </div>

                  {/* Severity */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Severity:</span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                      {selectedItemCard.data.severity === 'critical' ? '🚨 CRITICAL DANGER' : '⚠️ HIGH RISK'}
                    </span>
                  </div>

                  {/* Location */}
                  <div>
                    <span className="text-slate-500 block text-[11px]">Location / Corridor:</span>
                    <strong className="text-slate-900 text-xs block">
                      {selectedItemCard.data.affected_area} ({selectedItemCard.data.district}, {selectedItemCard.data.state})
                    </strong>
                    {selectedItemCard.data.riverBasinOrFeature && (
                      <span className="text-red-700 text-[11px]">
                        Basin: {selectedItemCard.data.riverBasinOrFeature}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-1 border-t border-red-200">
                    <span className="text-slate-600">Status:</span>
                    <span className="text-red-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      🔴 Active Circular Danger Zone
                    </span>
                  </div>

                  {/* Impact Radius */}
                  {selectedItemCard.data.radiusKm && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Hazard Perimeter Radius:</span>
                      <strong className="text-red-800 font-mono">
                        {selectedItemCard.data.radiusKm} km radius
                      </strong>
                    </div>
                  )}

                  {/* Population at risk */}
                  {selectedItemCard.data.estimatedPopulationAtRisk && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Population at Risk:</span>
                      <strong className="text-amber-800 font-mono">
                        {selectedItemCard.data.estimatedPopulationAtRisk.toLocaleString()} residents
                      </strong>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedItemCard.data.description}
                </p>

                {/* Direct Action */}
                <button
                  onClick={() => {
                    if (onFindSafePlace) {
                      onFindSafePlace();
                    } else {
                      onSelectHabitation(selectedItemCard.data);
                    }
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>FIND SAFE PLACE</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* B. RELOCATION SITE CARD */}
            {selectedItemCard.type === 'shelter' && (
              <>
                <div className="space-y-2 text-xs">
                  {/* Availability & Safety Status */}
                  <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-slate-700 font-medium">Available Space:</span>
                    <strong className="text-emerald-700 font-mono text-sm font-bold">
                      {selectedItemCard.data.available_capacity} Beds Available
                    </strong>
                  </div>

                  {/* Resource Availability List */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">💧 Water</span>
                      <strong className="text-emerald-700">✓ Available</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">🏥 Medical</span>
                      <strong className="text-emerald-700">✓ Available</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">🍚 Food</span>
                      <strong className="text-emerald-700">✓ Available</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700">🛡️ Safety</span>
                      <strong className="text-emerald-700">✓ Safe Elevation</strong>
                    </div>
                  </div>

                  {/* "Why this place?" explanation box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] space-y-1">
                    <span className="font-bold text-blue-900 block">Why this place?</span>
                    <div className="text-slate-700 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>Outside active red zone perimeter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>Sufficient capacity for your family</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                        <span>Drinking water & medical supplies active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: SHOW ROUTE */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectShelter(selectedItemCard.data);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Navigation size={14} />
                    <span>SHOW ROUTE</span>
                  </button>
                </div>
              </>
            )}

            {/* C. RESOURCE CARD */}
            {selectedItemCard.type === 'resource' && (
              <>
                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      {selectedItemCard.data.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Supply Details:</span>
                    <strong className="text-slate-900 text-xs">{selectedItemCard.data.quantity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Operational Hours:</span>
                    <span className="text-slate-700 text-xs">{selectedItemCard.data.operationalHours}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectResource(selectedItemCard.data);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Navigation size={14} />
                    <span>SHOW ROUTE</span>
                  </button>
                </div>
              </>
            )}

            {/* D. SOS DISTRESS CARD */}
            {selectedItemCard.type === 'sos' && (
              <>
                <div className="space-y-2 text-xs bg-red-50 p-3 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-red-800 font-bold">Priority:</span>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                      {selectedItemCard.data.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[10px]">People Affected:</span>
                    <strong className="text-slate-900 text-xs">{selectedItemCard.data.people} Members</strong>
                  </div>
                  {selectedItemCard.data.notes && (
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-red-200">
                      {selectedItemCard.data.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    onSelectSOS(selectedItemCard.data);
                    setSelectedItemCard(null);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Open in Coordinator Queue</span>
                  <ArrowRight size={13} />
                </button>
              </>
            )}

            {/* E. HABITATION CARD */}
            {selectedItemCard.type === 'habitation' && (
              <>
                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Risk Assessment:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      {selectedItemCard.data.priority_level} PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Population:</span>
                    <strong className="text-slate-900 font-mono">
                      {selectedItemCard.data.population.toLocaleString()} residents
                    </strong>
                  </div>
                  {selectedItemCard.data.nearestHazardName && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Nearest Threat:</span>
                      <span className="text-red-700 font-semibold">{selectedItemCard.data.nearestHazardName}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (onFindSafePlace) onFindSafePlace();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 size={15} />
                  <span>FIND SAFE PLACE FOR THIS VILLAGE</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
