import React, { useState } from 'react';
import {
  DisasterAlert,
  Habitation,
  HazardZone,
  RelocationFilterCriteria,
  RelocationSite,
  ResidentVoiceQuery,
  ResourcePoint,
  ResourceStatus,
  SOSRequest,
} from './types/disaster';
import { INDIAN_STATES } from './data/statesData';
import { INITIAL_HAZARDS } from './data/hazardsData';
import { INITIAL_RELOCATION_SITES } from './data/relocationSitesData';
import { INITIAL_RESOURCES } from './data/resourcesData';
import { INITIAL_HABITATIONS } from './data/habitationsData';
import { INITIAL_ALERTS } from './data/alertsData';
import { INITIAL_SOS_REQUESTS } from './data/initialSosData';

import { Header } from './components/Header';
import { BhuvanDisasterMap } from './map/BhuvanDisasterMap';
import { AlertsPanel } from './components/AlertsPanel';
import { FindSafePlacePanel } from './components/FindSafePlacePanel';
import { RiskMapsMenuPage } from './components/RiskMapsMenuPage';
import { ResourcesPanel } from './components/ResourcesPanel';
import { ReliefCoordinatorView } from './components/ReliefCoordinatorView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencySosModal } from './components/EmergencySosModal';
import { EmergencyAlertOverlay } from './components/EmergencyAlertOverlay';

export function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<'resident' | 'coordinator'>('resident');
  const [activePanel, setActivePanel] = useState<'map' | 'alerts' | 'risk_maps' | 'safe_place' | 'resources'>('map');

  // State & District Context
  const [selectedStateId, setSelectedStateId] = useState<string>('uttarakhand');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');

  const currentState = INDIAN_STATES.find((s) => s.id === selectedStateId) || INDIAN_STATES[0];
  const currentDistrict = currentState.districts.find((d) => d.id === selectedDistrictId) || currentState.districts[0];

  const userCoords: [number, number] = currentDistrict.id !== 'all' ? currentDistrict.coords : currentState.coords;
  const userLocationName =
    currentDistrict.id !== 'all'
      ? `${currentDistrict.name}, ${currentState.name}`
      : `${currentState.name} (${currentState.primaryDisasterType} Zone)`;

  // Domain State
  const [hazards, setHazards] = useState<HazardZone[]>(INITIAL_HAZARDS);
  const [relocationSites, setRelocationSites] = useState<RelocationSite[]>(INITIAL_RELOCATION_SITES);
  const [resources, setResources] = useState<ResourcePoint[]>(INITIAL_RESOURCES);
  const [habitations, setHabitations] = useState<Habitation[]>(INITIAL_HABITATIONS);
  const [alerts, setAlerts] = useState<DisasterAlert[]>(INITIAL_ALERTS);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>(INITIAL_SOS_REQUESTS);

  // Map Filter State
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Route State (ONLY shown after user clicks SHOW ROUTE)
  const [activeRouteDestination, setActiveRouteDestination] = useState<{
    lat: number;
    lng: number;
    title: string;
    type: 'shelter' | 'resource';
  } | null>(null);

  // Modals & Overlays
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<DisasterAlert | null>(null);

  // Preloaded Safe Place Criteria from Voice Assistant
  const [safePlaceCriteria, setSafePlaceCriteria] = useState<Partial<RelocationFilterCriteria>>({
    peopleCount: 4,
    waterRequired: true,
    medicalRequired: true,
    foodRequired: false,
    sanitationRequired: false,
    safetyRequired: true,
    maxDistanceKm: 40,
  });

  const pendingSosCount = sosRequests.filter((s) => s.status === 'PENDING').length;

  // Filtered domain data for active panels based on current state
  const stateRelocationSites = relocationSites.filter(
    (s) => s.state.toLowerCase() === currentState.name.toLowerCase()
  );
  const stateResources = resources.filter(
    (r) => r.state.toLowerCase() === currentState.name.toLowerCase()
  );
  const stateAlerts = alerts.filter(
    (a) => a.state.toLowerCase() === currentState.name.toLowerCase()
  );
  const stateHazards = hazards.filter(
    (h) => h.state.toLowerCase() === currentState.name.toLowerCase()
  );

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // Handle Voice Assistant Filter Application
  const handleApplyVoiceQuery = (query: ResidentVoiceQuery) => {
    if (query.intent === 'sos') {
      setSosModalOpen(true);
      return;
    }

    if (query.intent === 'resource_search') {
      setActivePanel('resources');
      if (query.resource_type) {
        setFilterType(query.resource_type.toUpperCase());
      }
      return;
    }

    if (query.intent === 'hazard_check') {
      setActivePanel('alerts');
      return;
    }

    // Default to Relocation
    setSafePlaceCriteria({
      peopleCount: query.people || 4,
      waterRequired: query.water_required,
      medicalRequired: query.medical_required,
      foodRequired: query.food_required,
      sanitationRequired: query.sanitation_required,
      safetyRequired: query.safety_required,
      maxDistanceKm: 45,
    });
    setActivePanel('safe_place');
  };

  // Route selection
  const handleSelectRouteToSite = (site: RelocationSite) => {
    setActiveRouteDestination({
      lat: site.latitude,
      lng: site.longitude,
      title: site.name,
      type: 'shelter',
    });
    setActivePanel('map');
  };

  const handleSelectRouteToResource = (res: ResourcePoint) => {
    setActiveRouteDestination({
      lat: res.latitude,
      lng: res.longitude,
      title: res.name,
      type: 'resource',
    });
    setActivePanel('map');
  };

  // SOS Submission
  const handleAddSOS = (newSosData: Omit<SOSRequest, 'id' | 'timestamp' | 'status'>) => {
    const newSos: SOSRequest = {
      ...newSosData,
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      status: 'PENDING',
    };
    setSosRequests((prev) => [newSos, ...prev]);
  };

  // Coordinator Actions
  const handleUpdateSOSStatus = (id: string, newStatus: SOSRequest['status']) => {
    setSosRequests((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

  const handleUpdateSiteCapacity = (id: string, total: number, occupied: number) => {
    setRelocationSites((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const validOccupied = Math.min(total, Math.max(0, occupied));
          const available = Math.max(0, total - validOccupied);
          return {
            ...s,
            total_capacity: total,
            occupied: validOccupied,
            available_capacity: available,
          };
        }
        return s;
      })
    );
  };

  const handleUpdateSiteResource = (
    id: string,
    key: 'water' | 'food' | 'medical' | 'sanitation' | 'power',
    status: ResourceStatus
  ) => {
    setRelocationSites((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: status } : s))
    );
  };

  const handleSimulateResourceTransfer = (
    fromSiteId: string,
    toSiteId: string,
    resourceName: string
  ) => {
    setRelocationSites((prev) =>
      prev.map((s) => {
        if (s.id === toSiteId) {
          if (resourceName.toLowerCase().includes('water')) return { ...s, water: 'AVAILABLE' };
          if (resourceName.toLowerCase().includes('med')) return { ...s, medical: 'AVAILABLE' };
          if (resourceName.toLowerCase().includes('food') || resourceName.toLowerCase().includes('ration'))
            return { ...s, food: 'AVAILABLE' };
        }
        return s;
      })
    );
  };

  // Locating elements on map
  const handleLocateOnMap = (coords: [number, number], label: string) => {
    setActiveRouteDestination({
      lat: coords[0],
      lng: coords[1],
      title: label,
      type: 'shelter',
    });
    setActivePanel('map');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Top Header with Horizontal Nav Bar */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        onOpenSosModal={() => setSosModalOpen(true)}
        pendingSosCount={pendingSosCount}
        activeAlertsCount={stateAlerts.length || alerts.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 relative flex flex-col overflow-y-auto bg-slate-50">
        {currentRole === 'coordinator' ? (
          <ReliefCoordinatorView
            alerts={stateAlerts.length > 0 ? stateAlerts : alerts}
            sosRequests={sosRequests}
            relocationSites={stateRelocationSites.length > 0 ? stateRelocationSites : relocationSites}
            resources={stateResources.length > 0 ? stateResources : resources}
            onUpdateSOSStatus={handleUpdateSOSStatus}
            onUpdateSiteCapacity={handleUpdateSiteCapacity}
            onUpdateSiteResource={handleUpdateSiteResource}
            onSimulateResourceTransfer={handleSimulateResourceTransfer}
            onLocateOnMap={handleLocateOnMap}
          />
        ) : (
          <>
            {/* Panel 1: Clean State-Based Topographic Map */}
            {activePanel === 'map' && (
              <div className="w-full h-full min-h-[500px] flex flex-col">
                <BhuvanDisasterMap
                  hazards={hazards}
                  relocationSites={relocationSites}
                  resources={resources}
                  habitations={habitations}
                  sosRequests={sosRequests}
                  userCoords={userCoords}
                  userLocationName={userLocationName}
                  selectedStateId={selectedStateId}
                  onStateChange={setSelectedStateId}
                  selectedDistrictId={selectedDistrictId}
                  onDistrictChange={setSelectedDistrictId}
                  activeRouteDestination={activeRouteDestination}
                  onClearRoute={() => setActiveRouteDestination(null)}
                  onSelectShelter={handleSelectRouteToSite}
                  onSelectResource={handleSelectRouteToResource}
                  onSelectHazard={() => {}}
                  onSelectSOS={() => setCurrentRole('coordinator')}
                  onSelectHabitation={() => setActivePanel('safe_place')}
                  onFindSafePlace={() => setActivePanel('safe_place')}
                  filterType={filterType}
                  filterSeverity={filterSeverity}
                  onFilterTypeChange={setFilterType}
                  onFilterSeverityChange={setFilterSeverity}
                />
              </div>
            )}

            {/* Panel 2: Alerts */}
            {activePanel === 'alerts' && (
              <AlertsPanel
                alerts={stateAlerts.length > 0 ? stateAlerts : alerts}
                onTriggerEmergencySimulation={(alert) => setActiveEmergencyAlert(alert)}
                onFindSafePlace={() => setActivePanel('safe_place')}
                onOpenSosModal={() => setSosModalOpen(true)}
                onShowOnMap={(coords, title) => {
                  setActiveRouteDestination({
                    lat: coords[0],
                    lng: coords[1],
                    title,
                    type: 'shelter',
                  });
                  setActivePanel('map');
                }}
              />
            )}

            {/* Panel 3: Consolidated Risk Maps & Services Menu Page (JMA Style) */}
            {activePanel === 'risk_maps' && (
              <RiskMapsMenuPage
                onOpenRedZonesMap={() => {
                  setFilterType('ALL');
                  setFilterSeverity('HIGH');
                  setActivePanel('map');
                }}
                onOpenRelocation={() => setActivePanel('safe_place')}
                onOpenWater={() => {
                  setFilterType('WATER');
                  setActivePanel('resources');
                }}
                onOpenFood={() => {
                  setFilterType('FOOD');
                  setActivePanel('resources');
                }}
                onOpenMedical={() => {
                  setFilterType('MEDICAL');
                  setActivePanel('resources');
                }}
                onOpenSosModal={() => setSosModalOpen(true)}
                hazards={stateHazards.length > 0 ? stateHazards : hazards}
                relocationSites={stateRelocationSites.length > 0 ? stateRelocationSites : relocationSites}
                resources={stateResources.length > 0 ? stateResources : resources}
                currentStateName={currentState.name}
              />
            )}

            {/* Panel 4: Find Safe Place (Decision Engine) */}
            {activePanel === 'safe_place' && (
              <FindSafePlacePanel
                relocationSites={stateRelocationSites.length > 0 ? stateRelocationSites : relocationSites}
                userCoords={userCoords}
                userLocationName={userLocationName}
                onSelectRouteToSite={handleSelectRouteToSite}
                onOpenVoiceModal={() => setVoiceModalOpen(true)}
                onShowSiteOnMap={handleSelectRouteToSite}
                initialCriteria={safePlaceCriteria}
              />
            )}

            {/* Panel 5: Resources Catalog */}
            {activePanel === 'resources' && (
              <ResourcesPanel
                resources={stateResources.length > 0 ? stateResources : resources}
                userCoords={userCoords}
                userLocationName={userLocationName}
                onShowResourceOnMap={handleSelectRouteToResource}
                onRouteToResource={handleSelectRouteToResource}
                onOpenVoiceModal={() => setVoiceModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Interactive Modals */}
      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        userLocationName={userLocationName}
        onApplyFilters={handleApplyVoiceQuery}
      />

      <EmergencySosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        userCoords={userCoords}
        userLocationName={userLocationName}
        onSubmitSOS={handleAddSOS}
      />

      <EmergencyAlertOverlay
        alert={activeEmergencyAlert}
        onDismiss={() => setActiveEmergencyAlert(null)}
        onFindSafePlace={() => {
          setActiveEmergencyAlert(null);
          setActivePanel('safe_place');
        }}
        onOpenSos={() => {
          setActiveEmergencyAlert(null);
          setSosModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
