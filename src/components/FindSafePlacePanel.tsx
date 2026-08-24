import React, { useState, useEffect } from 'react';
import {
  RelocationFilterCriteria,
  RelocationRankingResult,
  RelocationSite,
} from '../types/disaster';
import { rankRelocationSites } from '../logic/relocationEngine';
import { VoiceAndTextInputSection } from './VoiceAndTextInputSection';
import {
  Home,
  Users,
  Droplet,
  HeartPulse,
  Utensils,
  Navigation,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react';

interface FindSafePlacePanelProps {
  relocationSites: RelocationSite[];
  userCoords: [number, number];
  userLocationName: string;
  onSelectRouteToSite: (site: RelocationSite) => void;
  onOpenVoiceModal?: () => void;
  onShowSiteOnMap: (site: RelocationSite) => void;
  initialCriteria?: Partial<RelocationFilterCriteria>;
}

export const FindSafePlacePanel: React.FC<FindSafePlacePanelProps> = ({
  relocationSites,
  userCoords,
  userLocationName,
  onSelectRouteToSite,
  onShowSiteOnMap,
  initialCriteria,
}) => {
  // Search Criteria State
  const [peopleCount, setPeopleCount] = useState<number>(initialCriteria?.peopleCount || 4);
  const [waterRequired, setWaterRequired] = useState<boolean>(
    initialCriteria?.waterRequired !== undefined ? initialCriteria.waterRequired : true
  );
  const [medicalRequired, setMedicalRequired] = useState<boolean>(
    initialCriteria?.medicalRequired !== undefined ? initialCriteria.medicalRequired : true
  );
  const [foodRequired, setFoodRequired] = useState<boolean>(
    initialCriteria?.foodRequired !== undefined ? initialCriteria.foodRequired : false
  );
  const [sanitationRequired, setSanitationRequired] = useState<boolean>(
    initialCriteria?.sanitationRequired !== undefined ? initialCriteria.sanitationRequired : false
  );
  const [safetyRequired, setSafetyRequired] = useState<boolean>(
    initialCriteria?.safetyRequired !== undefined ? initialCriteria.safetyRequired : true
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(
    initialCriteria?.maxDistanceKm || 40
  );

  // Sync initial criteria changes if any
  useEffect(() => {
    if (initialCriteria) {
      if (initialCriteria.peopleCount !== undefined) setPeopleCount(initialCriteria.peopleCount);
      if (initialCriteria.waterRequired !== undefined) setWaterRequired(initialCriteria.waterRequired);
      if (initialCriteria.medicalRequired !== undefined) setMedicalRequired(initialCriteria.medicalRequired);
      if (initialCriteria.foodRequired !== undefined) setFoodRequired(initialCriteria.foodRequired);
      if (initialCriteria.sanitationRequired !== undefined) setSanitationRequired(initialCriteria.sanitationRequired);
      if (initialCriteria.safetyRequired !== undefined) setSafetyRequired(initialCriteria.safetyRequired);
      if (initialCriteria.maxDistanceKm !== undefined) setMaxDistanceKm(initialCriteria.maxDistanceKm);
    }
  }, [initialCriteria]);

  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);

  // Apply structured requirements from voice or text input
  const handleApplyVoiceOrTextRequirements = (reqs: {
    peopleCount: number;
    waterRequired: boolean;
    medicalRequired: boolean;
    foodRequired: boolean;
    sanitationRequired: boolean;
    safetyRequired: boolean;
  }) => {
    setPeopleCount(reqs.peopleCount);
    setWaterRequired(reqs.waterRequired);
    setMedicalRequired(reqs.medicalRequired);
    setFoodRequired(reqs.foodRequired);
    setSanitationRequired(reqs.sanitationRequired);
    setSafetyRequired(reqs.safetyRequired);
  };

  // Compute Results dynamically
  const rankingResults: RelocationRankingResult[] = rankRelocationSites(relocationSites, {
    peopleCount,
    waterRequired,
    medicalRequired,
    foodRequired,
    sanitationRequired,
    safetyRequired,
    maxDistanceKm,
    userCoords,
  });

  const eligibleSites = rankingResults.filter((r) => r.isEligible);
  const excludedSites = rankingResults.filter((r) => !r.isEligible);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. Prominent Voice & Text Request Section */}
      <VoiceAndTextInputSection
        userLocationName={userLocationName}
        onApplyStructuredRequirements={handleApplyVoiceOrTextRequirements}
      />

      {/* 2. Manual Group Requirements & Filter Adjustments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Adjust Requirements & Radius
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Active Location: <strong className="text-slate-800">{userLocationName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* People Counter */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-700 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-blue-600" />
                Number of People:
              </span>
              <span className="text-sm font-bold text-blue-600 font-mono">{peopleCount}</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setPeopleCount(cnt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    peopleCount === cnt
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Essential Resource Requirements */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-700 font-medium block">
              Essential Needs:
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => setWaterRequired(!waterRequired)}
                className={`p-2 rounded-lg font-medium flex items-center gap-1.5 transition border ${
                  waterRequired
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Droplet size={13} className={waterRequired ? 'text-blue-600' : 'text-slate-400'} />
                <span>Drinking Water</span>
              </button>

              <button
                onClick={() => setMedicalRequired(!medicalRequired)}
                className={`p-2 rounded-lg font-medium flex items-center gap-1.5 transition border ${
                  medicalRequired
                    ? 'bg-purple-50 border-purple-300 text-purple-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartPulse size={13} className={medicalRequired ? 'text-purple-600' : 'text-slate-400'} />
                <span>Medical Care</span>
              </button>

              <button
                onClick={() => setFoodRequired(!foodRequired)}
                className={`p-2 rounded-lg font-medium flex items-center gap-1.5 transition border ${
                  foodRequired
                    ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Utensils size={13} className={foodRequired ? 'text-amber-600' : 'text-slate-400'} />
                <span>Food Relief</span>
              </button>

              <button
                onClick={() => setSanitationRequired(!sanitationRequired)}
                className={`p-2 rounded-lg font-medium flex items-center gap-1.5 transition border ${
                  sanitationRequired
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚻 Restrooms</span>
              </button>
            </div>
          </div>

          {/* Safety & Distance Bounds */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">Preferred Distance:</span>
              <strong className="text-emerald-700 font-mono font-bold">Up to {maxDistanceKm} km</strong>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyRequired}
                  onChange={(e) => setSafetyRequired(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span>Exclude high-risk / red zones</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusion Summary if any sites are rejected */}
      {excludedSites.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
            <span className="flex items-center gap-1.5 text-amber-700 text-xs">
              <XCircle size={13} />
              Full / Excluded Shelters ({excludedSites.length} shelter{excludedSites.length > 1 ? 's' : ''})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {excludedSites.map((ex) => (
              <span
                key={ex.site.id}
                className="bg-slate-50 text-slate-700 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1"
                title={ex.rejectionReasons.join(' ')}
              >
                <span className="text-red-500 font-bold">✕</span>
                <span className="font-medium truncate max-w-[180px]">{ex.site.name}</span>
                <span className="text-slate-500 text-[10px]">
                  ({ex.site.available_capacity} beds vs {peopleCount} needed)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ranked Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Available Safe Places</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold">
              {eligibleSites.length} Open
            </span>
          </h3>
        </div>

        {eligibleSites.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <XCircle size={32} className="text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No Safe Places Match Current Criteria</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Nearby shelters either have insufficient available spaces for {peopleCount} people or exceed {maxDistanceKm} km.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setMaxDistanceKm(80);
                  setMedicalRequired(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Expand Search Distance (up to 80 km)
              </button>
            </div>
          </div>
        ) : (
          eligibleSites.map((result, idx) => {
            const { site, distanceKm, scoreBreakdown } = result;
            const isTopRanked = idx === 0;
            const isExpanded = expandedSiteId === site.id;

            return (
              <div
                key={site.id}
                className={`rounded-2xl border transition shadow-xs overflow-hidden ${
                  isTopRanked
                    ? 'bg-white border-emerald-300 ring-1 ring-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {isTopRanked && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          TOP RECOMMENDED
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {site.district}, {site.state}
                      </span>
                    </div>

                    {/* Match Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Suitability:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                        {scoreBreakdown.totalSuitability}% Match
                      </span>
                    </div>
                  </div>

                  {/* Title and Distance */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h4 className="text-base font-bold text-slate-900">{site.name}</h4>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit font-mono">
                      📍 {distanceKm} km away
                    </span>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Available Beds:</span>
                      <strong className="text-emerald-700 text-sm font-bold font-mono">
                        {site.available_capacity} Beds
                      </strong>
                      <span className="text-slate-400 text-[10px] block">Total Capacity: {site.total_capacity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Hazard Safety:</span>
                      <strong className="text-slate-800 text-xs font-semibold">
                        {site.hazard_risk.replace('_', ' ')}
                      </strong>
                      <span className="text-slate-400 text-[10px] block">Road: {site.road_access}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Drinking Water:</span>
                      <strong
                        className={`text-xs font-semibold ${
                          site.water === 'AVAILABLE' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {site.water === 'AVAILABLE' ? 'Available' : site.water}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Medical Care:</span>
                      <strong
                        className={`text-xs font-semibold ${
                          site.medical === 'AVAILABLE' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {site.medical === 'AVAILABLE' ? 'Available' : site.medical}
                      </strong>
                    </div>
                  </div>

                  {/* Extended Details Dropdown */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 space-y-2 bg-slate-50 p-3 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500">Address:</span>{' '}
                          <span className="text-slate-800">{site.address || 'Designated Shelter Facility'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Shelter In-Charge:</span>{' '}
                          <span className="text-slate-800">{site.contactPerson} ({site.contactPhone})</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Facilities:</span>{' '}
                          <span className="text-slate-800">Food: {site.food} • Sanitation: {site.sanitation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Communal Space:</span>{' '}
                          <span className="text-slate-800">{site.livelihood_access} Access</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedSiteId(isExpanded ? null : site.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details & Contacts'}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onShowSiteOnMap(site)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
                      >
                        View on Map
                      </button>

                      <button
                        onClick={() => onSelectRouteToSite(site)}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <Navigation size={13} />
                        <span>SHOW ROUTE</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
