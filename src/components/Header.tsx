import React from 'react';
import {
  Map,
  BellRing,
  LayoutGrid,
  AlertOctagon,
  Building2,
  Home,
} from 'lucide-react';

interface HeaderProps {
  currentRole: 'resident' | 'coordinator';
  onRoleChange: (role: 'resident' | 'coordinator') => void;
  activePanel: 'map' | 'alerts' | 'risk_maps' | 'safe_place' | 'resources';
  onPanelChange: (panel: 'map' | 'alerts' | 'risk_maps' | 'safe_place' | 'resources') => void;
  onOpenSosModal: () => void;
  pendingSosCount: number;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activePanel,
  onPanelChange,
  onOpenSosModal,
  pendingSosCount,
  activeAlertsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 select-none shadow-xs">
      {/* Main Navigation Bar (Brand + Horizontal Nav Tabs + Single SOS Action) */}
      <div className="px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Name */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                DRISHTI
              </h1>
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold font-mono">
                DISASTER RESPONSE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Citizen Disaster Response & Safe Relocation Guidance
            </p>
          </div>
        </div>

        {/* Horizontal Nav Bar */}
        <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs order-3 lg:order-2 w-full lg:w-auto overflow-x-auto justify-start sm:justify-center">
          <button
            onClick={() => {
              onRoleChange('resident');
              onPanelChange('map');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-bold whitespace-nowrap ${
              currentRole === 'resident' && activePanel === 'map'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Map size={14} className="text-blue-600" />
            <span>Disaster Map</span>
          </button>

          <button
            onClick={() => {
              onRoleChange('resident');
              onPanelChange('safe_place');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-bold whitespace-nowrap ${
              currentRole === 'resident' && activePanel === 'safe_place'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Home size={14} className="text-emerald-600" />
            <span>I Need a Safe Place</span>
          </button>

          <button
            onClick={() => {
              onRoleChange('resident');
              onPanelChange('alerts');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-bold whitespace-nowrap ${
              currentRole === 'resident' && activePanel === 'alerts'
                ? 'bg-white text-red-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BellRing size={14} className="text-red-600" />
            <span>Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Consolidated Menu Page: Risk Maps & Services (JMA Style) */}
          <button
            onClick={() => {
              onRoleChange('resident');
              onPanelChange('risk_maps');
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-bold whitespace-nowrap ${
              currentRole === 'resident' && activePanel === 'risk_maps'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <LayoutGrid size={14} className="text-purple-600" />
            <span>Risk Maps & Services</span>
          </button>

          {/* Field Coordinator Tab */}
          <button
            onClick={() => onRoleChange('coordinator')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-xs font-bold whitespace-nowrap ${
              currentRole === 'coordinator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 size={14} />
            <span>Coordinator View</span>
            {pendingSosCount > 0 && currentRole !== 'coordinator' && (
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            )}
          </button>
        </nav>

        {/* Right Action: SINGLE "I Need Help" / SOS Button in the entire app */}
        <div className="flex items-center gap-2 order-2 lg:order-3">
          <button
            onClick={onOpenSosModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-200 border border-red-500 transition active:scale-95 cursor-pointer"
            title="Broadcast emergency distress signal (SOS) to disaster response team"
          >
            <AlertOctagon size={16} className="animate-pulse" />
            <span>I Need Help (SOS)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
