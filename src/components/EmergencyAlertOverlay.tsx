import React, { useState, useEffect } from 'react';
import { DisasterAlert } from '../types/disaster';
import { AlertOctagon, ArrowRight, Home } from 'lucide-react';

interface EmergencyAlertOverlayProps {
  alert: DisasterAlert | null;
  onDismiss: () => void;
  onFindSafePlace: (alert: DisasterAlert) => void;
  onOpenSos: () => void;
}

export const EmergencyAlertOverlay: React.FC<EmergencyAlertOverlayProps> = ({
  alert,
  onDismiss,
  onFindSafePlace,
  onOpenSos,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  useEffect(() => {
    if (!alert) return;
    setSecondsRemaining(30);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alert]);

  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative bg-white border border-red-300 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-center space-y-4">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-200 text-red-800 text-xs font-bold uppercase tracking-wider mx-auto">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          CRITICAL EMERGENCY ALERT BROADCAST
        </div>

        {/* Warning Icon & Countdown */}
        <div className="flex flex-col items-center justify-center space-y-1.5">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200">
            <AlertOctagon size={36} />
          </div>
          <div className="text-xs font-mono text-slate-500">
            Auto-Acknowledging in: <strong className="text-slate-900 text-sm">{secondsRemaining}s</strong>
          </div>
        </div>

        {/* Headline and Details */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            CRITICAL DISASTER WARNING: {alert.affected_area}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed bg-red-50 border border-red-200 p-3 rounded-2xl">
            {alert.message}
          </p>
        </div>

        {/* Recommended Action */}
        <div className="text-left bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
          <span className="font-semibold text-emerald-800 block">Recommended Emergency Guideline:</span>
          <p className="text-slate-700">{alert.recommendedAction}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              onDismiss();
              onFindSafePlace(alert);
            }}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 uppercase tracking-wide"
          >
            <Home size={15} />
            <span>Find Safe Relocation Place</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={() => {
              onDismiss();
              onOpenSos();
            }}
            className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95 uppercase tracking-wide"
          >
            <AlertOctagon size={15} />
            <span>I Need Help (SOS)</span>
          </button>
        </div>

        {/* Dismiss trigger */}
        <div>
          <button
            onClick={onDismiss}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium transition"
          >
            Dismiss Alert Overlay & View Map
          </button>
        </div>
      </div>
    </div>
  );
};
