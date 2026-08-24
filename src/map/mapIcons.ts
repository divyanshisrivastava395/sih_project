import L from 'leaflet';
import { HazardSeverity, ResourceType, ShelterSafetyRisk, SOSPriority } from '../types/disaster';

/**
 * Creates custom HTML divIcon markers for independent GIS pins
 */

// User Location Pin
export function createUserMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.35);" class="animate-user-ping"></div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #3b82f6; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center; font-size: 11px;">
          📍
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

// Relocation Site (Shelter) Pin
export function createShelterMarkerIcon(
  availableCapacity: number,
  safetyRisk: ShelterSafetyRisk,
  isRecommended = false
): L.DivIcon {
  let borderColor = '#22c55e'; // Green
  let badgeColor = '#15803d';

  if (safetyRisk === 'LOW_RISK') {
    borderColor = '#10b981';
    badgeColor = '#047857';
  } else if (safetyRisk === 'MEDIUM_RISK') {
    borderColor = '#eab308';
    badgeColor = '#a16207';
  } else if (safetyRisk === 'HIGH_RISK') {
    borderColor = '#ef4444';
    badgeColor = '#b91c1c';
  }

  const highlightRing = isRecommended ? 'box-shadow: 0 0 0 4px #38bdf8, 0 0 16px rgba(56, 189, 248, 0.9); transform: scale(1.15);' : 'box-shadow: 0 4px 10px rgba(0,0,0,0.5);';

  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; ${highlightRing} background: #0f172a; border: 2.5px solid ${borderColor}; border-radius: 10px; transition: all 0.2s;">
        <span style="font-size: 18px; line-height: 1;">🏠</span>
        <span style="position: absolute; top: -7px; right: -7px; background: ${badgeColor}; color: #ffffff; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 6px; border: 1px solid #ffffff; white-space: nowrap;">
          ${availableCapacity}
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// Resource Point Pin (Water, Medical, Food, Emergency Help)
export function createResourceMarkerIcon(type: ResourceType): L.DivIcon {
  let iconEmoji = '💧';
  let bgGradient = '#0284c7'; // Blue for water
  let borderColor = '#38bdf8';

  if (type === 'medical') {
    iconEmoji = '🏥';
    bgGradient = '#dc2626';
    borderColor = '#f87171';
  } else if (type === 'food') {
    iconEmoji = '🍚';
    bgGradient = '#d97706';
    borderColor = '#fbbf24';
  } else if (type === 'emergency_help') {
    iconEmoji = '🚑';
    bgGradient = '#7c3aed';
    borderColor = '#c084fc';
  } else if (type === 'shelter') {
    iconEmoji = '⛺';
    bgGradient = '#059669';
    borderColor = '#34d399';
  }

  return L.divIcon({
    className: 'custom-resource-marker',
    html: `
      <div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: #0f172a; border: 2px solid ${borderColor}; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.6);">
        <span style="font-size: 15px; line-height: 1;">${iconEmoji}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

// SOS Emergency Beacon Pin
export function createSOSMarkerIcon(priority: SOSPriority, status: string): L.DivIcon {
  const isVerified = status === 'VERIFIED' || status === 'FORWARDED_FOR_RESCUE';
  const color = isVerified ? '#3b82f6' : '#ef4444';

  return L.divIcon({
    className: 'custom-sos-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}44;" class="animate-emergency-pulse"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
          <span style="font-size: 14px; line-height: 1;">🆘</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// Hazard Zone Center Marker Pin
export function createHazardCenterMarkerIcon(severity: HazardSeverity): L.DivIcon {
  let color = '#ef4444'; // red
  if (severity === 'high') color = '#f97316'; // orange
  if (severity === 'medium') color = '#eab308'; // yellow
  if (severity === 'low') color = '#3b82f6'; // blue

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #0f172a; border: 2px solid ${color}; border-radius: 8px; box-shadow: 0 0 10px ${color}88;">
        <span style="font-size: 14px; line-height: 1;">⚠️</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Habitation Pin
export function createHabitationMarkerIcon(priorityLevel: string, priorityScore: number): L.DivIcon {
  let color = '#ef4444';
  if (priorityLevel === 'HIGH') color = '#f97316';
  if (priorityLevel === 'MEDIUM-HIGH') color = '#eab308';
  if (priorityLevel === 'MEDIUM') color = '#38bdf8';
  if (priorityLevel === 'LOW') color = '#22c55e';

  return L.divIcon({
    className: 'custom-habitation-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: #0f172a; border: 2px solid ${color}; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
        <span style="font-size: 13px; line-height: 1;">🏘️</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}
