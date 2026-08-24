import { Habitation } from '../types/disaster';

/**
 * RESEARCH-GROUNDED HABITATION PRIORITY SCORE FORMULA
 * Priority Score = (Hazard * 0.4) + (Exposure * 0.3) + (Vulnerability * 0.3)
 */
export function calculateHabitationPriorityScore(
  hazard: number,
  exposure: number,
  vulnerability: number
): { score: number; level: Habitation['priority_level'] } {
  // Clamp values between 0 and 1
  const h = Math.max(0, Math.min(1, hazard));
  const e = Math.max(0, Math.min(1, exposure));
  const v = Math.max(0, Math.min(1, vulnerability));

  const rawScore = (h * 0.4) + (e * 0.3) + (v * 0.3);
  const score = Math.round(rawScore * 1000) / 1000;

  let level: Habitation['priority_level'] = 'LOW';
  if (score >= 0.85) {
    level = 'CRITICAL';
  } else if (score >= 0.75) {
    level = 'HIGH';
  } else if (score >= 0.60) {
    level = 'MEDIUM-HIGH';
  } else if (score >= 0.45) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { score, level };
}
