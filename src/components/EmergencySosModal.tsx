import React, { useState } from 'react';
import { SOSPriority, SOSRequest } from '../types/disaster';
import { AlertOctagon, Users, MapPin, Check, X, ShieldAlert, HeartPulse, HelpCircle } from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: [number, number];
  userLocationName: string;
  onSubmitSOS: (sos: Omit<SOSRequest, 'id' | 'timestamp' | 'status'>) => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  userLocationName,
  onSubmitSOS,
}) => {
  const [people, setPeople] = useState<number>(4);
  const [habitation, setHabitation] = useState<string>(userLocationName);
  const [priority, setPriority] = useState<SOSPriority>('HIGH');
  const [emergencyType, setEmergencyType] = useState<string>('trapped_water');
  const [notes, setNotes] = useState<string>('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSos = {
      habitation,
      people,
      request_type: (emergencyType.includes('medical')
        ? 'medical'
        : emergencyType.includes('boat')
        ? 'evacuation'
        : emergencyType.includes('food')
        ? 'supplies'
        : 'trapped') as any,
      priority,
      latitude: userCoords[0] + (Math.random() - 0.5) * 0.005, // precise local jitter
      longitude: userCoords[1] + (Math.random() - 0.5) * 0.005,
      notes: `${emergencyType.replace('_', ' ').toUpperCase()}: ${notes || 'Immediate evacuation / aid requested.'}`,
    };

    onSubmitSOS(newSos);
    setSubmittedId('SOS-' + Math.floor(1000 + Math.random() * 9000));
  };

  const handleDone = () => {
    setSubmittedId(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
              <AlertOctagon size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Emergency Distress Beacon (SOS)</h3>
                <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.2 rounded-md font-mono font-bold">
                  HIGH PRIORITY
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Directly transmits GPS coordinates to Disaster Management Officers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {submittedId ? (
          <div className="text-center py-6 space-y-3.5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">SOS Distress Beacon Broadcasted</h4>
              <p className="text-xs font-mono text-emerald-700 font-bold mt-1">Distress ID: {submittedId}</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                Your emergency request for <strong>{people} people</strong> has been pinned on the GIS Map and placed in the top priority verification queue for Relief Coordinators.
              </p>
            </div>
            <button
              onClick={handleDone}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Return to Disaster Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Number of People */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-red-600" />
                  People Trapped / Needing Rescue:
                </span>
                <span className="text-sm font-mono font-bold text-red-600">{people} Members</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 4, 6, 8, 12, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPeople(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      people === num
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Type Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Emergency Nature:</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'trapped_water', label: '🌊 Trapped by Floodwater', prio: 'CRITICAL' },
                  { id: 'medical_urgent', label: '🏥 Severe Medical Emergency', prio: 'CRITICAL' },
                  { id: 'landslide_blocked', label: '⛰️ Landslide Road Cutoff', prio: 'HIGH' },
                  { id: 'food_water_exhausted', label: '🍚 Supplies Exhausted (48h+)', prio: 'MEDIUM' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEmergencyType(item.id);
                      setPriority(item.prio as SOSPriority);
                    }}
                    className={`p-2.5 rounded-xl text-left font-medium transition border ${
                      emergencyType === item.id
                        ? 'bg-red-50 border-red-300 text-red-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Confirmation */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-blue-600" />
                  Your Current Location / Landmark:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {userCoords[0].toFixed(3)}°N, {userCoords[1].toFixed(3)}°E
                </span>
              </label>
              <input
                type="text"
                value={habitation}
                onChange={(e) => setHabitation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="Village / Ward / Landmark name"
                required
              />
            </div>

            {/* Additional details */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Additional Details (Optional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. 2 elderly persons, water level is rising up to waist height..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-md shadow-red-200 active:scale-95"
              >
                <AlertOctagon size={16} />
                <span>TRANSMIT EMERGENCY SOS BEACON NOW</span>
              </button>
              <p className="text-[10px] text-center text-slate-500 mt-2">
                Coordinates and request details are broadcasted to District Control Room & NDRF/SDRF units.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
