import React, { useState, useEffect } from 'react';
import { RelocationSite } from '../types/disaster';
import { calculateDistanceKm, rankRelocationSites } from '../logic/relocationEngine';
import {
  LifeBuoy,
  MapPin,
  Users,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X,
  HeartPulse,
  Baby,
  Accessibility,
  Droplet,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface NeedSafePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  relocationSites: RelocationSite[];
  userCoords: [number, number];
  userLocationName: string;
  onSelectRouteToSite: (site: RelocationSite) => void;
  onRequestAssistance?: (details: {
    site: RelocationSite;
    people: number;
    locationName: string;
    specialNeeds: string[];
  }) => void;
}

export const NeedSafePlaceModal: React.FC<NeedSafePlaceModalProps> = ({
  isOpen,
  onClose,
  relocationSites,
  userCoords,
  userLocationName,
  onSelectRouteToSite,
  onRequestAssistance,
}) => {
  // Step state: 'form' | 'results' | 'confirmed'
  const [step, setStep] = useState<'form' | 'results' | 'confirmed'>('form');

  // Form State
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [currentLocationText, setCurrentLocationText] = useState<string>(userLocationName);
  const [customCoords, setCustomCoords] = useState<[number, number]>(userCoords);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);

  // Special Needs
  const [specialNeeds, setSpecialNeeds] = useState<{
    medical: boolean;
    wheelchair: boolean;
    children: boolean;
    water: boolean;
    food: boolean;
  }>({
    medical: false,
    wheelchair: false,
    children: false,
    water: true,
    food: false,
  });

  // Preferred Distance
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(35);
  const [selectedSiteForConfirm, setSelectedSiteForConfirm] = useState<RelocationSite | null>(null);

  // Sync user location on open
  useEffect(() => {
    if (isOpen) {
      setCurrentLocationText(userLocationName);
      setCustomCoords(userCoords);
      setStep('form');
      setSelectedSiteForConfirm(null);
    }
  }, [isOpen, userLocationName, userCoords]);

  if (!isOpen) return null;

  // GPS Geolocation Handler
  const handleDetectBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not supported on this device. Using current area selection.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCustomCoords([lat, lng]);
        setCurrentLocationText(`GPS Location (${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E)`);
        setIsDetectingGps(false);
        setGpsSuccess(true);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsDetectingGps(false);
        // Fallback to manual location text
        setCurrentLocationText(userLocationName);
      },
      { timeout: 8000 }
    );
  };

  const toggleNeed = (key: keyof typeof specialNeeds) => {
    setSpecialNeeds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Rank Safe Places based on the simple form criteria
  const rankedResults = rankRelocationSites(relocationSites, {
    peopleCount,
    waterRequired: specialNeeds.water,
    medicalRequired: specialNeeds.medical,
    foodRequired: specialNeeds.food,
    sanitationRequired: false,
    safetyRequired: true,
    maxDistanceKm,
    userCoords: customCoords,
  });

  const suitableSites = rankedResults.filter((r) => r.isEligible);
  const backupSites = rankedResults.filter((r) => !r.isEligible);

  const handleChooseSite = (site: RelocationSite) => {
    onSelectRouteToSite(site);
    onClose();
  };

  const handleRequestRelocationAid = (site: RelocationSite) => {
    setSelectedSiteForConfirm(site);
    const activeNeeds: string[] = [];
    if (specialNeeds.medical) activeNeeds.push('Medical Assistance / Elderly Care');
    if (specialNeeds.wheelchair) activeNeeds.push('Wheelchair / Accessibility Support');
    if (specialNeeds.children) activeNeeds.push('Infants / Children in Family');
    if (specialNeeds.water) activeNeeds.push('Drinking Water Supplies');
    if (specialNeeds.food) activeNeeds.push('Meal / Food Packets');

    if (onRequestAssistance) {
      onRequestAssistance({
        site,
        people: peopleCount,
        locationName: currentLocationText,
        specialNeeds: activeNeeds,
      });
    }
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none overflow-y-auto">
      <div className="bg-[#0F172A] border border-blue-500/30 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <LifeBuoy size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight">
                  I Need a Safe Place
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-bold">
                  Relocation Aid
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Find suitable, open safe places away from high-risk disaster areas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: SIMPLE, BEGINNER-FRIENDLY FORM */}
        {/* ------------------------------------------------------------- */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* 1. Location */}
            <div className="space-y-1.5 bg-[#0A0E14] p-3 rounded-xl border border-gray-800">
              <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <MapPin size={14} />
                  1. Your Current Location:
                </span>
                {gpsSuccess && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> GPS Active
                  </span>
                )}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentLocationText}
                  onChange={(e) => setCurrentLocationText(e.target.value)}
                  placeholder="e.g. Rudraprayag, Uttarakhand"
                  className="flex-1 px-3 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleDetectBrowserLocation}
                  disabled={isDetectingGps}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                >
                  <MapPin size={13} className={isDetectingGps ? 'animate-bounce' : ''} />
                  <span>{isDetectingGps ? 'Detecting...' : 'Use GPS'}</span>
                </button>
              </div>
            </div>

            {/* 2. Number of people */}
            <div className="space-y-2 bg-[#0A0E14] p-3 rounded-xl border border-gray-800">
              <label className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Users size={14} />
                  2. Number of People with You:
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {peopleCount} {peopleCount === 1 ? 'Person' : 'People'}
                </span>
              </label>

              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeopleCount(num)}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      peopleCount === num
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#0F172A] text-gray-300 hover:text-white border border-gray-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Special Needs (Optional) */}
            <div className="space-y-2 bg-[#0A0E14] p-3 rounded-xl border border-gray-800">
              <label className="text-xs font-semibold text-gray-200 block">
                3. Any Special Needs? <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleNeed('medical')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    specialNeeds.medical
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <HeartPulse size={14} className={specialNeeds.medical ? 'text-red-400' : 'text-gray-500'} />
                  <span>Medical Care / Elderly</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleNeed('wheelchair')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    specialNeeds.wheelchair
                      ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                      : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Accessibility size={14} className={specialNeeds.wheelchair ? 'text-blue-400' : 'text-gray-500'} />
                  <span>Wheelchair Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleNeed('children')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    specialNeeds.children
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Baby size={14} className={specialNeeds.children ? 'text-amber-400' : 'text-gray-500'} />
                  <span>Infants / Children</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleNeed('water')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    specialNeeds.water
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                      : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Droplet size={14} className={specialNeeds.water ? 'text-cyan-400' : 'text-gray-500'} />
                  <span>Drinking Water</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleNeed('food')}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition col-span-2 sm:col-span-2 ${
                    specialNeeds.food
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Utensils size={14} className={specialNeeds.food ? 'text-emerald-400' : 'text-gray-500'} />
                  <span>Meal / Food Supply</span>
                </button>
              </div>
            </div>

            {/* 4. Preferred Distance (Optional) */}
            <div className="space-y-2 bg-[#0A0E14] p-3 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-200">
                  4. Preferred Distance: <span className="text-gray-400 font-normal">(Optional)</span>
                </span>
                <strong className="text-blue-400 font-mono">Up to {maxDistanceKm} km</strong>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'Nearest (< 15 km)', km: 15 },
                  { label: 'Moderate (< 35 km)', km: 35 },
                  { label: 'Any Safe (< 60 km)', km: 60 },
                ].map((dist) => (
                  <button
                    key={dist.km}
                    type="button"
                    onClick={() => setMaxDistanceKm(dist.km)}
                    className={`p-2 rounded-lg border text-center font-medium transition ${
                      maxDistanceKm === dist.km
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-[#0F172A] border-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {dist.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setStep('results')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition active:scale-[0.98]"
            >
              <span>Show Suitable Safe Places</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: SUITABLE SAFE RELOCATION OPTIONS */}
        {/* ------------------------------------------------------------- */}
        {step === 'results' && (
          <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            {/* Top Bar with back button */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium transition"
              >
                <ArrowLeft size={13} />
                <span>Adjust Requirements</span>
              </button>
              <span className="text-xs font-semibold text-emerald-400">
                Found {suitableSites.length} Suitable Safe {suitableSites.length === 1 ? 'Place' : 'Places'}
              </span>
            </div>

            {suitableSites.length === 0 ? (
              <div className="bg-[#0A0E14] border border-gray-800 rounded-xl p-6 text-center space-y-3">
                <AlertCircle size={32} className="text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No exact matches within {maxDistanceKm} km</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Nearby safe places are either currently full or outside your preferred distance limit.
                </p>
                <button
                  type="button"
                  onClick={() => setMaxDistanceKm(80)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Expand Search Radius (up to 80 km)
                </button>
              </div>
            ) : (
              suitableSites.map((res, index) => {
                const { site, distanceKm } = res;
                const isTop = index === 0;

                return (
                  <div
                    key={site.id}
                    className={`rounded-xl border p-4 transition shadow-md space-y-3 ${
                      isTop
                        ? 'bg-[#0F172A] border-emerald-500/60 ring-1 ring-emerald-500/20'
                        : 'bg-[#0F172A] border-gray-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        {isTop && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            TOP MATCH
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{site.district}, {site.state}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-mono">
                        📍 {distanceKm} km away
                      </span>
                    </div>

                    {/* Site Title */}
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{site.name}</h4>
                      <p className="text-xs text-gray-300 mt-0.5">{site.address || 'Designated Government Safe Facility'}</p>
                    </div>

                    {/* Available Spaces & Facilities */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#0A0E14] p-2.5 rounded-lg border border-gray-800">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Available Spaces:</span>
                        <strong className="text-emerald-400 text-sm font-bold font-mono">
                          {site.available_capacity} Spaces
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Risk Level:</span>
                        <strong className="text-emerald-300 text-xs font-semibold flex items-center gap-1">
                          <ShieldCheck size={12} className="text-emerald-400" />
                          Safe Zone
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Water & Food:</span>
                        <span className="text-gray-200 text-xs font-medium">
                          {site.water === 'AVAILABLE' ? '💧 Water Ready' : '💧 Limited'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Medical Aid:</span>
                        <span className="text-gray-200 text-xs font-medium">
                          {site.medical === 'AVAILABLE' ? '🏥 Doctor on-site' : '🏥 Basic First-Aid'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleChooseSite(site)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 transition active:scale-95"
                      >
                        <Navigation size={14} />
                        <span>View Route on Map</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRequestRelocationAid(site)}
                        className="px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <span>Notify Coordinator</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: RELOCATION ASSISTANCE CONFIRMED */}
        {/* ------------------------------------------------------------- */}
        {step === 'confirmed' && selectedSiteForConfirm && (
          <div className="text-center py-5 space-y-4">
            <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Relocation Request Sent</h4>
              <p className="text-xs text-gray-300 max-w-sm mx-auto mt-1.5">
                Your relocation assistance request for <strong>{peopleCount} people</strong> at{' '}
                <strong className="text-white">{selectedSiteForConfirm.name}</strong> has been logged in the Field Coordinator console.
              </p>
              {selectedSiteForConfirm.contactPhone && (
                <div className="inline-flex items-center gap-2 bg-[#0A0E14] border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 mt-3">
                  <Phone size={13} />
                  <span>Site Contact: {selectedSiteForConfirm.contactPerson || 'Helpline'} ({selectedSiteForConfirm.contactPhone})</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleChooseSite(selectedSiteForConfirm)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition active:scale-95"
              >
                <Navigation size={14} />
                <span>Navigate on Map Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
