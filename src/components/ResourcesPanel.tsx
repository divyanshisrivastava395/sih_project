import React, { useState } from 'react';
import { ResourcePoint, ResourceType } from '../types/disaster';
import { Droplet, HeartPulse, Utensils, Home, Ambulance, Navigation, Search, Mic, MapPin, CheckCircle2 } from 'lucide-react';
import { calculateDistanceKm } from '../logic/relocationEngine';

interface ResourcesPanelProps {
  resources: ResourcePoint[];
  userCoords: [number, number];
  userLocationName: string;
  onShowResourceOnMap: (res: ResourcePoint) => void;
  onRouteToResource: (res: ResourcePoint) => void;
  onOpenVoiceModal: () => void;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  resources,
  userCoords,
  userLocationName,
  onShowResourceOnMap,
  onRouteToResource,
  onOpenVoiceModal,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate distances
  const resourcesWithDistance = resources.map((res) => {
    const distanceKm = calculateDistanceKm(userCoords[0], userCoords[1], res.latitude, res.longitude);
    return { ...res, distanceKm };
  });

  const filteredResources = resourcesWithDistance.filter((res) => {
    if (selectedType !== 'ALL' && res.type !== selectedType) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.status.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q) ||
        res.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'water':
        return <Droplet size={18} className="text-blue-600" />;
      case 'medical':
        return <HeartPulse size={18} className="text-purple-600" />;
      case 'food':
        return <Utensils size={18} className="text-amber-600" />;
      case 'emergency_help':
        return <Ambulance size={18} className="text-red-600" />;
      case 'shelter':
        return <Home size={18} className="text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5 select-none animate-in fade-in duration-200">
      {/* Header Banner with Voice Trigger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
              <Droplet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Emergency Resource Catalog
              </h2>
              <span className="text-xs text-slate-500">
                Verified Water Points, Medical Triage, Relief Food & Mobile Rescue Units
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-700 mt-2 max-w-xl">
            Locate critical supplies near <strong className="text-slate-900">{userLocationName}</strong> or use voice query.
          </p>
        </div>

        {/* Voice Search Trigger */}
        <button
          onClick={onOpenVoiceModal}
          className="w-full sm:w-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition active:scale-95 whitespace-nowrap"
        >
          <Mic size={14} className="text-emerald-600 animate-pulse" />
          <span>Ask: "Where is water/medical?"</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resource name, doctor, boat clinic, RO plant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All Resources', icon: '🌐' },
              { id: 'water', label: 'Water', icon: '💧' },
              { id: 'medical', label: 'Medical', icon: '🏥' },
              { id: 'food', label: 'Food', icon: '🍚' },
              { id: 'emergency_help', label: 'Rescue Boats', icon: '🚑' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedType === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredResources.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs">
            No emergency resources found matching your search criteria.
          </div>
        ) : (
          filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      {getResourceIcon(res.type)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">{res.name}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {res.district}, {res.state}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    📍 {res.distanceKm} km
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Quantity / Capacity:</span>
                    <strong className="text-slate-900">{res.quantity}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operational Hours:</span>
                    <span className="text-slate-700">{res.operationalHours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {res.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onShowResourceOnMap(res)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition"
                >
                  View on Map
                </button>
                <button
                  onClick={() => onRouteToResource(res)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Navigation size={13} />
                  <span>SHOW ROUTE</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
