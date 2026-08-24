import React from 'react';
import { DisasterAlert, HazardZone, RelocationSite } from '../types/disaster';
import {
  AlertTriangle,
  MapPin,
  LifeBuoy,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ResidentEmergencyBannerProps {
  activeAlert: DisasterAlert | null;
  activeHazard: HazardZone | null;
  userLocationName: string;
  isUserInHighRiskArea: boolean;
  safePlacesCount: number;
  nearestSafePlaceDistanceKm: number;
  onOpenNeedSafePlaceModal: () => void;
  onViewHazardOnMap: () => void;
  onViewSafePlacesOnMap: () => void;
}

export const ResidentEmergencyBanner: React.FC<ResidentEmergencyBannerProps> = ({
  activeAlert,
  activeHazard,
  userLocationName,
  isUserInHighRiskArea,
  safePlacesCount,
  nearestSafePlaceDistanceKm,
  onOpenNeedSafePlaceModal,
  onViewHazardOnMap,
  onViewSafePlacesOnMap,
}) => {
  const hazardTitle = activeAlert?.message || activeHazard?.name || 'Active Monsoon Flood & Landslide Alert';
  const affectedArea = activeAlert?.affected_area || activeHazard?.affected_area || 'Uttarakhand Corridor';
  const riskLevel = activeAlert?.severity === 'critical' || activeHazard?.severity === 'critical' ? 'CRITICAL RISK' : 'HIGH RISK';

  return (
    <div className="bg-[#0B1120] border-b border-gray-800 p-3 sm:p-4 text-gray-200 select-none shadow-md">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Highlight Journey Flow: Alert -> Location -> Safe Places -> Action */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 1. CURRENT HAZARD ALERT (5 cols) */}
          <div className="md:col-span-4 bg-red-950/40 border border-red-800/60 rounded-xl p-2.5 sm:p-3 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1.5 pb-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>🔴 CURRENT ALERT</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                {riskLevel} • ACTIVE
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white truncate" title={hazardTitle}>
                {hazardTitle}
              </div>
              <div className="text-[11px] text-red-200 truncate">
                Affected Area: <strong className="text-white">{affectedArea}</strong>
              </div>
            </div>

            <button
              onClick={onViewHazardOnMap}
              className="mt-2 text-[11px] text-red-300 hover:text-white font-semibold flex items-center gap-1 transition self-start"
            >
              <span>View High-Risk Area on Map</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* 2. YOUR LOCATION & SAFE PLACES NEARBY (4 cols) */}
          <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
            {/* Location Check */}
            <div className="bg-[#0F172A] border border-gray-800 rounded-xl p-2.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  <MapPin size={11} className="text-blue-400" />
                  YOUR LOCATION
                </span>
                <div className="text-xs font-bold text-white truncate max-w-[170px]">
                  {userLocationName}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isUserInHighRiskArea
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {isUserInHighRiskArea ? '⚠️ Near Hazard Zone' : '🟢 Safe Distance'}
              </span>
            </div>

            {/* Safe Places Nearby */}
            <div
              onClick={onViewSafePlacesOnMap}
              className="bg-[#0F172A] hover:bg-[#131E35] border border-gray-800 hover:border-blue-500/40 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  SAFE PLACES NEARBY
                </span>
                <div className="text-xs font-bold text-emerald-400">
                  {safePlacesCount} Open Safe Places
                </div>
              </div>
              <span className="text-[10px] font-mono text-gray-300 bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                Nearest: {nearestSafePlaceDistanceKm} km
              </span>
            </div>
          </div>

          {/* 3. PRIMARY ACTION: 🛟 I NEED A SAFE PLACE (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-center">
            <button
              onClick={onOpenNeedSafePlaceModal}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-blue-950/60 border border-blue-400/40 transition active:scale-[0.98] group"
            >
              <LifeBuoy size={20} className="text-cyan-200 group-hover:rotate-45 transition-transform" />
              <div className="text-left">
                <div className="font-extrabold tracking-tight">I Need a Safe Place</div>
                <div className="text-[10px] text-blue-100 font-normal">
                  Find nearest open shelter & get route
                </div>
              </div>
              <ArrowRight size={16} className="ml-auto text-blue-200 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
