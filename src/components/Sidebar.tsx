import React from 'react';
import {
  Sparkles,
  MapPin,
  LifeBuoy,
  Activity,
  Building2,
  User,
} from 'lucide-react';

interface SidebarProps {
  currentRole: 'resident' | 'coordinator';
  onRoleChange: (role: 'resident' | 'coordinator') => void;
  activePanel: 'map' | 'alerts' | 'safe_place' | 'resources';
  onPanelChange: (panel: 'map' | 'alerts' | 'safe_place' | 'resources') => void;
  onOpenNeedSafePlaceModal: () => void;
  onOpenDemoDrawer: () => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  pendingSosCount: number;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  activePanel,
  onPanelChange,
  onOpenNeedSafePlaceModal,
  onOpenDemoDrawer,
  selectedRegion,
  onRegionChange,
  pendingSosCount,
  activeAlertsCount,
}) => {
  return (
    <aside className="w-64 border-r border-gray-800 flex flex-col bg-[#0F172A] z-30 shrink-0 h-screen sticky top-0 hidden lg:flex select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white shadow-md shadow-red-900/30">
              R
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                RAAHAT
              </h1>
              <span className="text-[10px] block font-medium text-red-300">
                Disaster Response & Safe Relocation
              </span>
            </div>
          </div>

          <button
            onClick={onOpenDemoDrawer}
            title="Prototype Presets & Scenarios"
            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded transition"
          >
            <Sparkles size={14} />
          </button>
        </div>

        {/* Region / Zone Selector */}
        <div className="flex items-center gap-1.5 bg-black/40 border border-gray-800 rounded px-2 py-1.5 text-xs">
          <MapPin size={13} className="text-emerald-400 shrink-0" />
          <select
            value={selectedRegion}
            onChange={(e) => onRegionChange(e.target.value)}
            className="bg-transparent text-gray-300 text-xs font-medium focus:outline-none cursor-pointer w-full"
          >
            <option value="uttarakhand" className="bg-[#0F172A] text-white">Uttarakhand (Rudraprayag)</option>
            <option value="assam" className="bg-[#0F172A] text-white">Assam (Golaghat)</option>
            <option value="odisha" className="bg-[#0F172A] text-white">Odisha (Puri)</option>
            <option value="maharashtra" className="bg-[#0F172A] text-white">Maharashtra (Nanded)</option>
            <option value="kerala" className="bg-[#0F172A] text-white">Kerala (Idukki Hills)</option>
          </select>
        </div>
      </div>

      {/* Mode Toggle Switch: 👤 Resident Mode | 🏛️ Coordinator Mode */}
      <div className="p-3 border-b border-gray-800/80">
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-1 pb-1.5">
          Select View Mode:
        </div>
        <div className="grid grid-cols-2 gap-1 bg-black/50 p-1 rounded-xl border border-gray-800 text-[11px] font-bold">
          <button
            onClick={() => onRoleChange('resident')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
              currentRole === 'resident'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={12} />
            <span>Resident</span>
          </button>
          <button
            onClick={() => onRoleChange('coordinator')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 relative ${
              currentRole === 'coordinator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 size={12} />
            <span>Coordinator</span>
            {pendingSosCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links in Plain Language */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-1">
        {currentRole === 'resident' ? (
          <>
            <button
              onClick={() => onPanelChange('map')}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-colors text-sm font-medium ${
                activePanel === 'map'
                  ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">🗺️</span>
              <span>Disaster Map</span>
            </button>

            <button
              onClick={() => onPanelChange('alerts')}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-colors text-sm font-medium ${
                activePanel === 'alerts'
                  ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-lg text-orange-500">🚨</span>
              <span>Hazard Alerts</span>
              {activeAlertsCount > 0 && (
                <span className="ml-auto bg-orange-600 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold text-white">
                  0{activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onPanelChange('safe_place')}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-colors text-sm font-medium ${
                activePanel === 'safe_place'
                  ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-lg text-green-500">🏠</span>
              <span>Safe Places</span>
            </button>

            <button
              onClick={() => onPanelChange('resources')}
              className={`w-full flex items-center gap-3.5 px-5 py-3.5 transition-colors text-sm font-medium ${
                activePanel === 'resources'
                  ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500 font-semibold'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className="text-lg text-blue-300">💧</span>
              <span>Emergency Supplies</span>
            </button>
          </>
        ) : (
          <div className="px-4 py-3 space-y-2">
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider px-1">
              Field Coordinator Console
            </div>
            <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-3 text-xs text-purple-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-purple-300">
                <Activity size={14} /> Operations Management
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Review high-risk zones, update available spaces & supplies at safe places, and verify pending relocation requests.
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Emergency Action: ONE clear primary action */}
      {currentRole === 'resident' && (
        <div className="p-4 border-t border-gray-800 space-y-2 bg-[#0F172A]">
          <button
            onClick={onOpenNeedSafePlaceModal}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all active:scale-95 border border-blue-400/30"
          >
            <LifeBuoy size={17} className="text-cyan-200" />
            <span>I Need a Safe Place</span>
          </button>
          <div className="text-[10px] text-gray-400 text-center">
            Instant matching with nearby open safe shelters
          </div>
        </div>
      )}
    </aside>
  );
};
