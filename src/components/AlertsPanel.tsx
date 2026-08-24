import React from 'react';
import { DisasterAlert, HazardSeverity } from '../types/disaster';
import { ShieldAlert, BellRing, Sparkles, Navigation, Home } from 'lucide-react';

interface AlertsPanelProps {
  alerts: DisasterAlert[];
  onTriggerEmergencySimulation: (alert: DisasterAlert) => void;
  onFindSafePlace: () => void;
  onShowOnMap: (coords: [number, number], title: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onTriggerEmergencySimulation,
  onFindSafePlace,
  onShowOnMap,
}) => {
  const getSeverityBadge = (severity: HazardSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600 text-white border border-red-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            🚨 CRITICAL RISK LEVEL
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white border border-amber-500">
            ⚠️ HIGH RISK LEVEL
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            🟡 MODERATE RISK LEVEL
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
            ℹ️ LOW RISK ADVISORY
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5 select-none animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl mt-0.5">
            <BellRing size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Hazard Alerts</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono font-bold">
                {alerts.length} Active Bulletins
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Official emergency bulletins detailing active danger perimeters, water surges, and safe relocation guidance.
            </p>
          </div>
        </div>

        {/* Emergency Simulator Trigger */}
        {alerts.length > 0 && (
          <button
            onClick={() => onTriggerEmergencySimulation(alerts[0])}
            className="w-full sm:w-auto px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Sparkles size={13} className="text-red-600" />
            <span>Simulate Critical Alert</span>
          </button>
        )}
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3.5">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          return (
            <div
              key={alert.id}
              className={`rounded-2xl border transition shadow-xs overflow-hidden ${
                isCritical
                  ? 'bg-white border-red-300'
                  : alert.severity === 'high'
                  ? 'bg-white border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="p-4 sm:p-5">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {alert.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>

                {/* Body Content */}
                <div className="my-3 space-y-2">
                  <div className="flex items-baseline gap-1.5 text-xs text-slate-700">
                    <span className="text-slate-500 font-medium">High-Risk / Affected Area:</span>
                    <strong className="text-slate-900 font-bold">{alert.affected_area}</strong>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {alert.message}
                  </p>
                  <div className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <ShieldAlert size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-800">Safety Recommendation: </span>
                      <span>{alert.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onShowOnMap(alert.centerCoords, alert.affected_area)}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition"
                  >
                    <Navigation size={13} className="text-blue-600" />
                    <span>View High-Risk Zone on Map</span>
                  </button>

                  <button
                    onClick={onFindSafePlace}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <Home size={14} />
                    <span>Find Safe Relocation</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
