import { RelocationFilterCriteria, RelocationRankingResult, RelocationSite, ResourceAvailability } from '../types/disaster';

/**
 * Calculates Great-Circle Distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function resourcePoints(status: ResourceAvailability): number {
  switch (status) {
    case 'AVAILABLE':
      return 1.0;
    case 'MEDIUM':
      return 0.65;
    case 'LOW':
      return 0.35;
    case 'UNAVAILABLE':
      return 0.0;
    default:
      return 0.5;
  }
}

/**
 * PROTOTYPE RELOCATION DECISION ENGINE
 * 
 * STEP 1: Hard Exclusion Filters
 * STEP 2: Multi-Factor Weighted Suitability Ranking
 * 
 * Weights (Prototype Methodology):
 * 1. Safety / Hazard Suitability = 30%
 * 2. Available Carrying Capacity = 25%
 * 3. Essential Resources = 20%
 * 4. Accessibility / Distance = 15%
 * 5. Livelihood / Community Suitability = 10%
 */
export function rankRelocationSites(
  sites: RelocationSite[],
  criteria: RelocationFilterCriteria
): RelocationRankingResult[] {
  const {
    peopleCount,
    waterRequired,
    medicalRequired,
    foodRequired,
    sanitationRequired,
    safetyRequired,
    maxDistanceKm,
    userCoords,
  } = criteria;

  const results: RelocationRankingResult[] = sites.map((site) => {
    // Dynamic available capacity computation
    const computedAvailableCapacity = Math.max(0, site.total_capacity - site.occupied);
    const distanceKm = calculateDistanceKm(
      userCoords[0],
      userCoords[1],
      site.latitude,
      site.longitude
    );

    // ----------------------------------------------------
    // STEP 1: HARD FILTER EXCLUSIONS
    // ----------------------------------------------------
    const rejectionReasons: string[] = [];

    // Capacity check: If required people > available capacity => REJECT
    if (peopleCount > computedAvailableCapacity) {
      rejectionReasons.push(
        `Insufficient available capacity (${computedAvailableCapacity} beds available, ${peopleCount} required).`
      );
    }

    // Safety check: High risk site rejected if safety required
    if (safetyRequired && site.hazard_risk === 'HIGH_RISK') {
      rejectionReasons.push('Site is located in a high-risk secondary hazard zone.');
    }

    // Mandatory resource checks
    if (waterRequired && site.water === 'UNAVAILABLE') {
      rejectionReasons.push('Mandatory drinking water supply is completely unavailable.');
    }
    if (medicalRequired && site.medical === 'UNAVAILABLE') {
      rejectionReasons.push('Mandatory emergency medical facility is unavailable.');
    }
    if (foodRequired && site.food === 'UNAVAILABLE') {
      rejectionReasons.push('Mandatory food/ration supplies are unavailable.');
    }
    if (sanitationRequired && site.sanitation === 'UNAVAILABLE') {
      rejectionReasons.push('Sanitation/hygiene blocks are unavailable.');
    }

    // Inaccessible road check
    if (site.road_access === 'BLOCKED') {
      rejectionReasons.push('Approach road is currently blocked by floodwater/debris.');
    }

    // Distance bound check (with a generous soft threshold for display purposes)
    if (distanceKm > maxDistanceKm) {
      rejectionReasons.push(`Distance (${distanceKm} km) exceeds maximum search radius (${maxDistanceKm} km).`);
    }

    const isEligible = rejectionReasons.length === 0 && site.active;

    // ----------------------------------------------------
    // STEP 2: SUITABILITY SCORING
    // ----------------------------------------------------
    const rationale: string[] = [];

    // 1. Safety Score (Max: 30)
    let safetyScore = 0;
    if (site.hazard_risk === 'SAFE') {
      safetyScore = 30;
      rationale.push('Elevated terrain with zero active flood or landslide threat (30/30 pts)');
    } else if (site.hazard_risk === 'LOW_RISK') {
      safetyScore = 24;
      rationale.push('Low-risk buffer zone outside primary inundation path (24/30 pts)');
    } else if (site.hazard_risk === 'MEDIUM_RISK') {
      safetyScore = 14;
      rationale.push('Moderate vulnerability to secondary runoff (14/30 pts)');
    } else {
      safetyScore = 4;
      rationale.push('High-risk perimeter requires caution (4/30 pts)');
    }

    // 2. Capacity Score (Max: 25)
    // Evaluates both headroom and capacity margin for the family
    let capacityScore = 0;
    if (computedAvailableCapacity >= peopleCount) {
      const marginRatio = (computedAvailableCapacity - peopleCount) / Math.max(1, site.total_capacity);
      capacityScore = Math.min(25, Math.round(18 + marginRatio * 7));
      rationale.push(
        `Accommodates ${peopleCount} people with ${computedAvailableCapacity} total available slots (${capacityScore}/25 pts)`
      );
    } else {
      capacityScore = Math.max(0, Math.round((computedAvailableCapacity / peopleCount) * 10));
      rationale.push(`Overcrowded shelter with only ${computedAvailableCapacity} slots remaining (${capacityScore}/25 pts)`);
    }

    // 3. Resource Score (Max: 20)
    // Water (5), Medical (5), Food (4), Sanitation (3), Electricity (3)
    const waterPts = resourcePoints(site.water) * 5;
    const medPts = resourcePoints(site.medical) * 5;
    const foodPts = resourcePoints(site.food) * 4;
    const sanPts = resourcePoints(site.sanitation) * 3;
    const elecPts = resourcePoints(site.electricity) * 3;
    const resourceScore = Math.round(waterPts + medPts + foodPts + sanPts + elecPts);
    rationale.push(
      `Essential services: Water (${site.water}), Medical (${site.medical}), Food (${site.food}) (${resourceScore}/20 pts)`
    );

    // 4. Distance / Accessibility Score (Max: 15)
    let distanceScore = 0;
    if (distanceKm <= 5) {
      distanceScore = 15;
    } else if (distanceKm <= 15) {
      distanceScore = 12;
    } else if (distanceKm <= 35) {
      distanceScore = 8;
    } else if (distanceKm <= 75) {
      distanceScore = 4;
    } else {
      distanceScore = 2;
    }
    if (site.road_access === 'GOOD') {
      // Keep full
    } else if (site.road_access === 'PARTIAL') {
      distanceScore = Math.max(1, distanceScore - 3);
    } else {
      distanceScore = 0;
    }
    rationale.push(`Distance of ${distanceKm} km with ${site.road_access.toLowerCase()} transit access (${distanceScore}/15 pts)`);

    // 5. Livelihood / Community Suitability (Max: 10)
    let livelihoodScore = 0;
    if (site.livelihood_access === 'GOOD') {
      livelihoodScore = 10;
      rationale.push('Livestock holding pen & family kitchen facilities available (10/10 pts)');
    } else if (site.livelihood_access === 'MODERATE') {
      livelihoodScore = 6;
      rationale.push('Basic communal space with moderate livestock shelter (6/10 pts)');
    } else {
      livelihoodScore = 3;
      rationale.push('Restricted auxiliary space (3/10 pts)');
    }

    const totalSuitability = Math.min(
      100,
      safetyScore + capacityScore + resourceScore + distanceScore + livelihoodScore
    );

    return {
      site: {
        ...site,
        available_capacity: computedAvailableCapacity,
      },
      distanceKm,
      isEligible,
      rejectionReasons,
      scoreBreakdown: {
        safetyScore,
        capacityScore,
        resourceScore,
        distanceScore,
        livelihoodScore,
        totalSuitability,
        rationale,
      },
    };
  });

  // Sort: Eligible sites first (sorted by highest suitability score, then shortest distance), then ineligible sites
  return results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    if (a.isEligible && b.isEligible) {
      if (b.scoreBreakdown.totalSuitability !== a.scoreBreakdown.totalSuitability) {
        return b.scoreBreakdown.totalSuitability - a.scoreBreakdown.totalSuitability;
      }
      return a.distanceKm - b.distanceKm;
    }
    return a.distanceKm - b.distanceKm;
  });
}
