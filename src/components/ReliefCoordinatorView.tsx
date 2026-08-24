import React, { useState } from 'react';
import {
  DisasterAlert,
  RelocationSite,
  ResourcePoint,
  ResourceStatus,
  SOSRequest,
} from '../types/disaster';
import {
  Activity,
  AlertOctagon,
  CheckCircle2,
  Send,
  Building2,
  Share2,
  Clock,
} from 'lucide-react';

interface ReliefCoordinatorViewProps {
  alerts: DisasterAlert[];
  sosRequests: SOSRequest[];
  relocationSites: RelocationSite[];
  resources: ResourcePoint[];
  onUpdateSOSStatus: (id: string, newStatus: SOSRequest['status']) => void;
  onUpdateSiteCapacity: (id: string, total: number, occupied: number) => void;
  onUpdateSiteResource: (
    id: string,
    resourceKey: 'water' | 'food' | 'medical' | 'sanitation' | 'power',
    status: ResourceStatus
  ) => void;
  onSimulateResourceTransfer: (fromSiteId: string, toSiteId: string, resourceName: string) => void;
  onLocateOnMap: (coords: [number, number], label: string) => void;
}

export const ReliefCoordinatorView: React.FC<ReliefCoordinatorViewProps> = ({
  alerts,
  sosRequests,
  relocationSites,
  resources,
  onUpdateSOSStatus,
  onUpdateSiteCapacity,
  onUpdateSiteResource,
  onSimulateResourceTransfer,
  onLocateOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'sos_queue' | 'capacity_mgr' | 'shelter_network'>('sos_queue');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(relocationSites[0]?.id || '');
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  const selectedSite = relocationSites.find((s) => s.id === selectedSiteId) || relocationSites[0];
  const pendingSos = sosRequests.filter((s) => s.status === 'PENDING');

  const handleTransfer = (fromId: string, toId: string, resource: string) => {
    onSimulateResourceTransfer(fromId, toId, resource);
    const fromSite = relocationSites.find((s) => s.id === fromId);
    const toSite = relocationSites.find((s) => s.id === toId);
    setTransferFeedback(
      `✓ Inter-Shelter Dispatch: ${resource} transfer initiated from ${fromSite?.name} to ${toSite?.name}.`
    );
    setTimeout(() => setTransferFeedback(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5 select-none animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Relief Coordinator Field Console
              </h2>
              <span className="text-xs text-slate-500">
                Focused Field Command: SOS Verification, Dynamic Shelter Capacity & Resource Logistics
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-700 mt-2 max-w-xl">
            Live updates directly propagate to citizen safe-relocation matching and map GIS layers in real time.
          </p>
        </div>

        {/* Operational Metrics */}
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] text-slate-500 block font-medium">Pending SOS</span>
            <strong className="text-sm font-mono font-bold text-red-600">{pendingSos.length}</strong>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center min-w-[90px]">
            <span className="text-[10px] text-slate-500 block font-medium">Active Shelters</span>
            <strong className="text-sm font-mono font-bold text-emerald-600">{relocationSites.length}</strong>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('sos_queue')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'sos_queue'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <AlertOctagon size={14} />
          <span>SOS Distress Queue</span>
          {pendingSos.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold">
              {pendingSos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('capacity_mgr')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'capacity_mgr'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>Shelter Capacity & Facilities</span>
        </button>

        <button
          onClick={() => setActiveTab('shelter_network')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'shelter_network'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Share2 size={14} />
          <span>Inter-Shelter Resource Sharing</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {transferFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{transferFeedback}</span>
        </div>
      )}

      {/* TAB 1: SOS DISTRESS QUEUE */}
      {activeTab === 'sos_queue' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Review incoming distress beacons, verify field priority, and simulate dispatch to rescue teams.
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {sosRequests.map((sos) => {
              const isPending = sos.status === 'PENDING';
              const isVerified = sos.status === 'VERIFIED';
              const isForwarded = sos.status === 'FORWARDED_FOR_RESCUE';

              return (
                <div
                  key={sos.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isPending
                      ? 'bg-white border-red-300 ring-1 ring-red-200'
                      : isVerified
                      ? 'bg-white border-blue-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Info */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {sos.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          sos.priority === 'CRITICAL'
                            ? 'bg-red-600 text-white'
                            : sos.priority === 'HIGH'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {sos.priority} PRIORITY
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isPending
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : isVerified
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        STATUS: {sos.status}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock size={11} />
                        {sos.timestamp}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{sos.habitation}</h4>
                      <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        👥 {sos.people} People Trapped / Affected
                      </span>
                    </div>

                    {sos.notes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {sos.notes}
                      </p>
                    )}
                  </div>

                  {/* Coordinator Action Buttons */}
                  <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => onLocateOnMap([sos.latitude, sos.longitude], `${sos.id} (${sos.habitation})`)}
                      className="flex-1 md:flex-initial px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
                    >
                      Locate on Map
                    </button>

                    {isPending && (
                      <button
                        onClick={() => onUpdateSOSStatus(sos.id, 'VERIFIED')}
                        className="flex-1 md:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 size={13} />
                        <span>Verify SOS</span>
                      </button>
                    )}

                    {isVerified && (
                      <button
                        onClick={() => onUpdateSOSStatus(sos.id, 'FORWARDED_FOR_RESCUE')}
                        className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Send size={13} />
                        <span>Dispatch Rescue Team</span>
                      </button>
                    )}

                    {isForwarded && (
                      <button
                        onClick={() => onUpdateSOSStatus(sos.id, 'RESOLVED')}
                        className="flex-1 md:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition"
                      >
                        Mark Evacuation Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SHELTER CAPACITY & FACILITIES MANAGER */}
      {activeTab === 'capacity_mgr' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Adjust carrying capacity dynamically. As occupancy changes, citizen search results update instantly.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {relocationSites.map((site) => (
              <div
                key={site.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{site.name}</h4>
                    <span className="text-[11px] text-slate-500">{site.district}, {site.state}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      site.available_capacity > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {site.available_capacity} BEDS AVAILABLE
                  </span>
                </div>

                {/* Capacity Controls */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Occupied Beds:</span>
                    <strong className="text-amber-700 font-mono text-sm font-bold">{site.occupied}</strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={site.total_capacity}
                    value={site.occupied}
                    onChange={(e) =>
                      onUpdateSiteCapacity(site.id, site.total_capacity, parseInt(e.target.value, 10))
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Total Capacity: <strong>{site.total_capacity}</strong></span>
                    <span>Available: <strong className="text-emerald-700 font-mono">{site.available_capacity}</strong></span>
                  </div>
                </div>

                {/* Facility Status Toggles */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Facility Supplies Status (Tap to toggle):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { key: 'water', label: '💧 Water', val: site.water },
                      { key: 'medical', label: '🏥 Medical', val: site.medical },
                      { key: 'food', label: '🍚 Food', val: site.food },
                      { key: 'sanitation', label: '🚽 Sanitation', val: site.sanitation },
                    ].map((fac) => (
                      <button
                        key={fac.key}
                        onClick={() => {
                          const nextStatus: ResourceStatus =
                            fac.val === 'AVAILABLE'
                              ? 'LOW'
                              : fac.val === 'LOW'
                              ? 'UNAVAILABLE'
                              : 'AVAILABLE';
                          onUpdateSiteResource(site.id, fac.key as any, nextStatus);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          fac.val === 'AVAILABLE'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : fac.val === 'MEDIUM' || fac.val === 'LOW'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        <span className="font-semibold text-xs">{fac.label}</span>
                        <span className="text-[10px] font-bold uppercase">{fac.val}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTER-SHELTER RESOURCE NETWORK */}
      {activeTab === 'shelter_network' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Network between relief centres to coordinate surplus supply distribution during regional shortages.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            {/* Center Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Hub Center:</h4>
              <div className="space-y-1.5">
                {relocationSites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`w-full p-3 rounded-xl border text-left transition text-xs ${
                      selectedSite.id === site.id
                        ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{site.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Occupied: {site.occupied}/{site.total_capacity}</span>
                      <span className="text-emerald-700 font-mono">Water: {site.water}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Exchange Actions */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedSite.name}</h4>
                  <span className="text-xs text-purple-700 font-medium">Active Supply Coordinator</span>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-xs font-mono">
                  {selectedSite.district}
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-700 block">
                  Connected Relief Hubs for Resource Balancing:
                </span>

                <div className="space-y-2">
                  {relocationSites
                    .filter((s) => s.id !== selectedSite.id)
                    .map((otherSite) => (
                      <div
                        key={otherSite.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                      >
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{otherSite.name}</h5>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex gap-2">
                            <span>Available: <strong className="text-emerald-700 font-mono">{otherSite.available_capacity}</strong></span>
                            <span>•</span>
                            <span>Water: <strong className="text-slate-700">{otherSite.water}</strong></span>
                          </div>
                        </div>

                        {/* Quick Transfer Actions */}
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <button
                            onClick={() => handleTransfer(selectedSite.id, otherSite.id, 'Water Tanker (5000L)')}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Send Water
                          </button>
                          <button
                            onClick={() => handleTransfer(selectedSite.id, otherSite.id, 'Emergency Medical Kit')}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Send Meds
                          </button>
                          <button
                            onClick={() => handleTransfer(selectedSite.id, otherSite.id, 'Ration Supplies (200 Meals)')}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold transition"
                          >
                            Send Food
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
