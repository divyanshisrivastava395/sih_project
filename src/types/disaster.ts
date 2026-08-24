// Types for SIH26191 Citizen Disaster Response & Safe Relocation System
// Student Prototype Data Structures

export type HazardSeverity = 'critical' | 'high' | 'medium' | 'low';
export type HazardType = 'flood' | 'cyclone' | 'landslide' | 'earthquake' | 'tsunami' | 'industrial';

export interface HazardZone {
  id: string;
  name: string;
  type: HazardType;
  severity: HazardSeverity;
  latitude: number;
  longitude: number;
  polygonCoords: [number, number][];
  radiusKm?: number;
  radiusMeters?: number;
  affected_area: string;
  district: string;
  state: string;
  active: boolean;
  description: string;
  estimatedPopulationAtRisk: number;
  riverBasinOrFeature?: string;
  updatedAt: string;
}

export interface Habitation {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  population: number;
  hazard_score: number; // 0 to 1
  exposure_score: number; // 0 to 1
  vulnerability_score: number; // 0 to 1
  priority_score: number; // Calculated: (H * 0.4) + (E * 0.3) + (V * 0.3)
  priority_level: 'CRITICAL' | 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM' | 'LOW';
  nearestHazardName?: string;
}

export type ResourceAvailability = 'AVAILABLE' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
export type ResourceStatus = ResourceAvailability;
export type RoadAccessStatus = 'GOOD' | 'PARTIAL' | 'BLOCKED';
export type ShelterSafetyRisk = 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';

export interface RelocationSite {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  occupied: number;
  available_capacity: number; // dynamically computed: total_capacity - occupied
  hazard_risk: ShelterSafetyRisk;
  water: ResourceAvailability;
  medical: ResourceAvailability;
  food: ResourceAvailability;
  sanitation: ResourceAvailability;
  electricity: ResourceAvailability;
  road_access: RoadAccessStatus;
  livelihood_access: 'GOOD' | 'MODERATE' | 'LOW';
  active: boolean;
  contactPerson?: string;
  contactPhone?: string;
  address?: string;
  lastUpdatedMinutesAgo?: number;
}

export type ResourceType =
  | 'water'
  | 'medical'
  | 'food'
  | 'shelter'
  | 'emergency_help'
  | 'WATER'
  | 'MEDICAL'
  | 'FOOD'
  | 'SHELTER'
  | 'EMERGENCY_HELP'
  | 'RESCUE_BOAT';

export interface ResourcePoint {
  id: string;
  name: string;
  type: ResourceType;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  availability?: ResourceAvailability;
  status: string;
  operator?: string;
  distanceKm?: number;
  capacityNote?: string;
  quantity?: string;
  operationalHours?: string;
  verifiedMinutesAgo?: number;
  address?: string;
  contact?: string;
  updatedMinutesAgo?: number;
}

export interface DisasterAlert {
  id: string;
  type: string;
  hazardType: HazardType;
  severity: HazardSeverity;
  affected_area: string;
  state: string;
  district: string;
  message: string;
  recommendedAction: string;
  active: boolean;
  timestamp: string;
  centerCoords: [number, number];
  isCriticalAlertModalTrigger?: boolean;
}

export type SOSStatus = 'PENDING' | 'VERIFIED' | 'FORWARDED_FOR_RESCUE' | 'RESOLVED';
export type SOSPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SOSType = 'medical' | 'trapped' | 'supplies' | 'evacuation' | 'general';

export interface SOSRequest {
  id: string;
  habitation: string;
  latitude: number;
  longitude: number;
  people: number;
  request_type: SOSType;
  priority: SOSPriority;
  status: SOSStatus;
  timestamp: string;
  notes?: string;
  contactPhone?: string;
  verifiedBy?: string;
  forwardedTo?: string; // Simulated handoff e.g. "Simulated NDRF 4th Bn Handoff"
  forwardedAt?: string;
}

export interface ResourceRequest {
  id: string;
  from_site: string; // Site ID requesting supplies
  from_site_name: string;
  to_site: string; // Site ID with surplus
  to_site_name: string;
  resource: 'water' | 'food' | 'medical' | 'sanitation' | 'electricity';
  quantity: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'REQUESTED' | 'DISPATCHED_SIMULATED' | 'RECEIVED_SIMULATED';
  timestamp: string;
}

export interface ResidentVoiceQuery {
  raw_transcript?: string;
  intent: 'relocation' | 'resource_search' | 'sos' | 'hazard_check';
  people?: number;
  water_required?: boolean;
  medical_required?: boolean;
  food_required?: boolean;
  sanitation_required?: boolean;
  safety_required?: boolean;
  resource_type?: ResourceType;
  location_name?: string;
  max_distance_km?: number;
  extractedLanguage?: string;
}

export interface RelocationFilterCriteria {
  peopleCount: number;
  waterRequired: boolean;
  medicalRequired: boolean;
  foodRequired: boolean;
  sanitationRequired: boolean;
  safetyRequired: boolean;
  maxDistanceKm: number;
  userCoords: [number, number];
}

export interface RelocationScoreBreakdown {
  safetyScore: number; // out of 30
  capacityScore: number; // out of 25
  resourceScore: number; // out of 20
  distanceScore: number; // out of 15
  livelihoodScore: number; // out of 10
  totalSuitability: number; // out of 100
  rationale: string[];
}

export interface RelocationRankingResult {
  site: RelocationSite;
  distanceKm: number;
  isEligible: boolean;
  rejectionReasons: string[];
  scoreBreakdown: RelocationScoreBreakdown;
}

export type BaseMapProviderType = 'bhuvan_2d' | 'bhuvan_satellite' | 'carto_dark' | 'osm_standard';
