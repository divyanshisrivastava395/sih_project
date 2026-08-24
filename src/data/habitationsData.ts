import { Habitation } from '../types/disaster';

// RESEARCH-GROUNDED SYNTHETIC HABITATIONS DATA FOR SIH26191
// Formula: Priority Score = (Hazard * 0.4) + (Exposure * 0.3) + (Vulnerability * 0.3)
export const INITIAL_HABITATIONS: Habitation[] = [
  {
    id: 'hab_assam_01',
    name: 'Village Dhekial (Dhansiri Riverbank)',
    state: 'Assam',
    district: 'Golaghat',
    latitude: 26.6200,
    longitude: 93.3100,
    population: 3420,
    hazard_score: 0.95,
    exposure_score: 0.88,
    vulnerability_score: 0.85,
    priority_score: 0.899, // (0.95*0.4)+(0.88*0.3)+(0.85*0.3) = 0.38 + 0.264 + 0.255 = 0.899
    priority_level: 'CRITICAL',
    nearestHazardName: 'Brahmaputra Basin Severe Inundation Zone'
  },
  {
    id: 'hab_assam_02',
    name: 'Village Kamalabari Ghat',
    state: 'Assam',
    district: 'Majuli',
    latitude: 26.7500,
    longitude: 93.5800,
    population: 4150,
    hazard_score: 0.85,
    exposure_score: 0.78,
    vulnerability_score: 0.72,
    priority_score: 0.790, // (0.85*0.4)+(0.78*0.3)+(0.72*0.3) = 0.34 + 0.234 + 0.216 = 0.790
    priority_level: 'HIGH',
    nearestHazardName: 'Brahmaputra Basin Severe Inundation Zone'
  },
  {
    id: 'hab_odisha_01',
    name: 'Village Pentha Coastal Settlement',
    state: 'Odisha',
    district: 'Kendrapara',
    latitude: 19.8800,
    longitude: 85.9500,
    population: 2850,
    hazard_score: 0.82,
    exposure_score: 0.80,
    vulnerability_score: 0.75,
    priority_score: 0.793,
    priority_level: 'HIGH',
    nearestHazardName: 'Coastal Storm Surge Threat Zone'
  },
  {
    id: 'hab_odisha_02',
    name: 'Village Brahmagiri Inland Pocket',
    state: 'Odisha',
    district: 'Puri',
    latitude: 19.8000,
    longitude: 85.6500,
    population: 3900,
    hazard_score: 0.65,
    exposure_score: 0.60,
    vulnerability_score: 0.55,
    priority_score: 0.605,
    priority_level: 'MEDIUM-HIGH',
    nearestHazardName: 'Coastal Storm Surge Threat Zone'
  },
  {
    id: 'hab_uk_01',
    name: 'Village Tilwara (Mandakini Valley)',
    state: 'Uttarakhand',
    district: 'Rudraprayag',
    latitude: 30.4800,
    longitude: 79.1200,
    population: 1840,
    hazard_score: 0.92,
    exposure_score: 0.85,
    vulnerability_score: 0.90,
    priority_score: 0.893,
    priority_level: 'CRITICAL',
    nearestHazardName: 'Mandakini Valley Debris Flow'
  },
  {
    id: 'hab_uk_02',
    name: 'Village Augustmuni Terraces',
    state: 'Uttarakhand',
    district: 'Rudraprayag',
    latitude: 30.3900,
    longitude: 79.0200,
    population: 2600,
    hazard_score: 0.70,
    exposure_score: 0.65,
    vulnerability_score: 0.60,
    priority_score: 0.655,
    priority_level: 'MEDIUM-HIGH',
    nearestHazardName: 'Mandakini Valley Debris Flow'
  },
  {
    id: 'hab_mh_01',
    name: 'Village Biloli Riverside',
    state: 'Maharashtra',
    district: 'Nanded',
    latitude: 19.1200,
    longitude: 77.2900,
    population: 3200,
    hazard_score: 0.58,
    exposure_score: 0.52,
    vulnerability_score: 0.48,
    priority_score: 0.532,
    priority_level: 'MEDIUM',
    nearestHazardName: 'Godavari Basin Flash River Spill'
  },
  {
    id: 'hab_kl_01',
    name: 'Village Rajamala Estate Hamlet',
    state: 'Kerala',
    district: 'Idukki',
    latitude: 9.9400,
    longitude: 77.0200,
    population: 1950,
    hazard_score: 0.88,
    exposure_score: 0.82,
    vulnerability_score: 0.80,
    priority_score: 0.838,
    priority_level: 'HIGH',
    nearestHazardName: 'Western Ghats Highland Torrential Slip Risk'
  }
];
