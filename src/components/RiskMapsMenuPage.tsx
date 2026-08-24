import React from 'react';
import {
  ShieldAlert,
  Home,
  Droplet,
  Utensils,
  AlertOctagon,
  ArrowRight,
  HeartPulse,
  Radio,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { HazardZone, RelocationSite, ResourcePoint } from '../types/disaster';

interface RiskMapsMenuPageProps {
  onOpenRedZonesMap: () => void;
  onOpenRelocation: () => void;
  onOpenWater: () => void;
  onOpenFood: () => void;
  onOpenMedical: () => void;
  onOpenSosModal: () => void;
  hazards: HazardZone[];
  relocationSites: RelocationSite[];
  resources: ResourcePoint[];
  currentStateName: string;
}

export const RiskMapsMenuPage: React.FC<RiskMapsMenuPageProps> = ({
  onOpenRedZonesMap,
  onOpenRelocation,
  onOpenWater,
  onOpenFood,
  onOpenMedical,
  onOpenSosModal,
  hazards,
  relocationSites,
  resources,
  currentStateName,
}) => {
  const activeHazardsCount = hazards.length;
  const availableSheltersCount = relocationSites.filter((s) => s.available_capacity > 0).length;
  const waterPointsCount = resources.filter((r) => r.type.toLowerCase() === 'water').length;
  const foodPointsCount = resources.filter((r) => r.type.toLowerCase() === 'food').length;
  const medicalPointsCount = resources.filter((r) => r.type.toLowerCase() === 'medical').length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Banner - JMA Risk Maps Portal Style */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
              JMA RISK MAPS CATALOG
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Region: <strong className="text-slate-800">{currentStateName}</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Disaster Risk Maps & Emergency Services
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Select a specialized category below to access real-time hazard perimeters, verified relocation shelters, essential relief supplies, or broadcast distress signals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700">
          <Radio size={15} className="text-emerald-600 animate-pulse" />
          <span>Live ISRO / NDMA Feed Active</span>
        </div>
      </div>

      {/* Grid of 5-6 Consolidated Services (JMA Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. RED ZONES & HAZARD PERIMETERS */}
        <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <ShieldAlert size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                {activeHazardsCount} Danger Zones
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition">
                Red Zones & Hazard Perimeters
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Active flood inundation areas, landslide slopes, and flash flood perimeters mapped with satellite topography.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-red-500" />
              <span>Includes river basins and danger buffer radius</span>
            </div>
          </div>

          <button
            onClick={onOpenRedZonesMap}
            className="mt-5 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Red Zones on Map</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 2. SAFE RELOCATION SHELTERS */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Home size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {availableSheltersCount} Open Shelters
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Safe Relocation Shelters
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Designated public emergency shelters outside hazard zones with real-time bed space tracking and family amenities.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Safe elevation and verified capacity</span>
            </div>
          </div>

          <button
            onClick={onOpenRelocation}
            className="mt-5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Find Safe Relocation</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 3. DRINKING WATER STATIONS */}
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Droplet size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                {waterPointsCount} Water Points
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                Drinking Water Stations
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Emergency potable drinking water tankers, purification units, and certified municipal distribution points.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-blue-500" />
              <span>Tested clean drinking water supply</span>
            </div>
          </div>

          <button
            onClick={onOpenWater}
            className="mt-5 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Locate Water Stations</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 4. EMERGENCY FOOD RELIEF */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Utensils size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                {foodPointsCount} Relief Centers
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                Food Relief & Community Kitchens
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                NDRF/SDRF hot meal distribution centers, dry ration distribution, and emergency nourishment camps.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-amber-500" />
              <span>Daily hot meals and dry ration packets</span>
            </div>
          </div>

          <button
            onClick={onOpenFood}
            className="mt-5 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Locate Food Relief</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 5. MEDICAL & FIRST-AID POSTS */}
        <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <HeartPulse size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                {medicalPointsCount} Health Posts
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                Medical & First-Aid Posts
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Emergency triage stations, field hospitals, ambulance dispatch bases, and emergency medical personnel.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-purple-500" />
              <span>Emergency doctor triage & ambulances</span>
            </div>
          </div>

          <button
            onClick={onOpenMedical}
            className="mt-5 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Locate Medical Posts</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 6. SOS EMERGENCY DISTRESS */}
        <div className="bg-white border-2 border-red-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group bg-gradient-to-b from-red-50/40 to-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-200">
                <AlertOctagon size={26} />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-xs animate-pulse">
                EMERGENCY SOS
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-red-900 group-hover:text-red-700 transition">
                Emergency Distress Beacon (SOS)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Broadcast an urgent rescue beacon with family headcount and medical needs directly to disaster management officers.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-red-700 font-medium">
              <MapPin size={13} className="text-red-600" />
              <span>Immediate GPS beacon transmission</span>
            </div>
          </div>

          <button
            onClick={onOpenSosModal}
            className="mt-5 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-2 shadow-md shadow-red-200"
          >
            <AlertOctagon size={15} />
            <span>I NEED HELP (SOS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
