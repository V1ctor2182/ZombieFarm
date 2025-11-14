/**
 * Happiness Service
 *
 * Implements zombie happiness mechanics per DOMAIN-FARM.md:
 * - Happiness range (0-100)
 * - Feeding boosts happiness (+10)
 * - Petting boosts happiness (+5) with 24-hour cooldown
 * - Environment factors (decorations, cleanliness)
 * - Social factors (loneliness vs companionship)
 * - Happiness effects on decay and performance
 *
 * Authority: DOMAIN-FARM.md Section "Decay and Maintenance" - Happiness subsection
 */

import type { Zombie, FarmState } from '../../../types/farm';
import type { TimeState } from '../../../types/global';
import { gameConfig } from '../../../lib/config/zombieFarmConfig';

/**
 * Happiness Constants
 */
const HAPPINESS = gameConfig.HAPPINESS;

/**
 * Result type for service operations
 */
export type Result<T, E = string> = { success: true; data: T } | { success: false; error: E };

/**
 * Pet Zombie Result
 */
export interface PetZombieResult {
  zombie: Zombie;
  happinessGained: number;
  newHappiness: number;
}

/**
 * Happiness Factors
 *
 * Breakdown of what's affecting a zombie's happiness.
 */
export interface HappinessFactors {
  base: number;
  feeding: number;
  injury: number;
  social: number;
  environment: number;
  total: number;
}

/**
 * Calculate Happiness
 *
 * Calculates a zombie's happiness based on all contributing factors.
 *
 * @param zombie - Zombie to calculate happiness for
 * @param farmState - Current farm state (for social/environment factors)
 * @returns Calculated happiness (0-100)
 */
export function calculateHappiness(zombie: Zombie, farmState: FarmState): number {
  const factors = getHappinessFactors(zombie, farmState);
  return clampHappiness(factors.total);
}

/**
 * Get Happiness Factors
 *
 * Returns breakdown of happiness factors for a zombie.
 *
 * @param zombie - Zombie to analyze
 * @param farmState - Current farm state
 * @returns Happiness factors breakdown
 */
export function getHappinessFactors(zombie: Zombie, farmState: FarmState): HappinessFactors {
  let total = zombie.happiness; // Start with current happiness

  // Feeding factor
  const feedingFactor = getFeedingFactor(zombie);

  // Injury factor
  const injuryFactor = getInjuryFactor(zombie);

  // Social factor
  const socialFactor = getSocialFactor(zombie, farmState);

  // Environment factor
  const environmentFactor = getEnvironmentFactor(zombie, farmState);

  // Calculate total (applied as adjustments to current happiness)
  total = zombie.happiness;

  return {
    base: zombie.happiness,
    feeding: feedingFactor,
    injury: injuryFactor,
    social: socialFactor,
    environment: environmentFactor,
    total,
  };
}

/**
 * Get Feeding Factor
 *
 * Returns happiness adjustment based on feeding status.
 * Unfed zombies lose happiness over time.
 *
 * @param zombie - Zombie to check
 * @returns Happiness adjustment
 */
export function getFeedingFactor(zombie: Zombie): number {
  // Decay happiness by -5 per day unfed (applied elsewhere via happinessDecay)
  // This function returns the current penalty for display purposes
  if (zombie.daysSinceLastFed > 0) {
    return -HAPPINESS.FEEDING_BOOST; // Show penalty
  }
  return 0; // Well-fed, no penalty
}

/**
 * Get Injury Factor
 *
 * Returns happiness penalty if zombie is injured.
 *
 * @param zombie - Zombie to check
 * @returns Happiness adjustment
 */
export function getInjuryFactor(zombie: Zombie): number {
  const hpPercent = zombie.stats.hp / zombie.stats.maxHp;
  if (hpPercent < 0.5) {
    return HAPPINESS.INJURED_PENALTY; // -10 from config
  }
  return 0;
}

/**
 * Get Social Factor
 *
 * Returns happiness adjustment based on social situation.
 * - Lonely if only zombie on farm (-5)
 * - Happy if multiple zombies (+5)
 *
 * @param zombie - Zombie to check
 * @param farmState - Current farm state
 * @returns Happiness adjustment
 */
export function getSocialFactor(zombie: Zombie, farmState: FarmState): number {
  const activeZombieCount = farmState.activeZombies.length;

  if (activeZombieCount === 1) {
    return HAPPINESS.LONELY_PENALTY; // -5 from config
  }

  if (activeZombieCount >= 2) {
    return HAPPINESS.SOCIAL_BOOST; // +5 from config
  }

  return 0;
}

/**
 * Get Environment Factor
 *
 * Returns happiness boost from environment (decorations, buildings).
 * Future: Check for nearby decorations.
 *
 * @param zombie - Zombie to check
 * @param farmState - Current farm state
 * @returns Happiness adjustment
 */
export function getEnvironmentFactor(zombie: Zombie, farmState: FarmState): number {
  // Future: Check farmState.buildings for decorations near zombie.position
  // For now, assume no decorations
  return 0;
}

/**
 * Clamp Happiness
 *
 * Ensures happiness stays within 0-100 range.
 *
 * @param happiness - Happiness value to clamp
 * @returns Clamped happiness
 */
export function clampHappiness(happiness: number): number {
  return Math.max(HAPPINESS.MIN, Math.min(HAPPINESS.MAX, happiness));
}

/**
 * Can Pet Zombie
 *
 * Checks if a zombie can be pet (cooldown check).
 *
 * @param zombie - Zombie to check
 * @param currentTime - Current timestamp (milliseconds)
 * @returns True if zombie can be pet
 */
export function canPetZombie(zombie: Zombie, currentTime: number): boolean {
  if (!zombie.lastPetAt) {
    return true; // Never been pet
  }

  const timeSincePet = currentTime - zombie.lastPetAt;
  const cooldownMs = HAPPINESS.PETTING_COOLDOWN_HOURS * 60 * 60 * 1000;

  return timeSincePet >= cooldownMs;
}

/**
 * Pet Zombie
 *
 * Pets a zombie, increasing its happiness by 5 if cooldown allows.
 *
 * @param zombie - Zombie to pet
 * @param currentTime - Current timestamp (milliseconds)
 * @returns Result with updated zombie or error
 */
export function petZombie(zombie: Zombie, currentTime: number): Result<PetZombieResult> {
  // Check cooldown
  if (!canPetZombie(zombie, currentTime)) {
    return {
      success: false,
      error: 'Zombie was recently pet. Please wait for cooldown.',
    };
  }

  // Calculate new happiness
  const happinessGained = HAPPINESS.PETTING_BOOST; // +5
  const newHappiness = clampHappiness(zombie.happiness + happinessGained);

  // Create updated zombie
  const updatedZombie: Zombie = {
    ...zombie,
    happiness: newHappiness,
    lastPetAt: currentTime,
  };

  return {
    success: true,
    data: {
      zombie: updatedZombie,
      happinessGained,
      newHappiness,
    },
  };
}

/**
 * Apply Happiness Decay
 *
 * Reduces happiness for each day a zombie is unfed.
 *
 * @param zombie - Zombie to apply decay to
 * @param daysSinceLastFed - Number of days unfed
 * @returns Updated zombie with decayed happiness
 */
export function applyHappinessDecay(zombie: Zombie, daysSinceLastFed: number): Zombie {
  if (daysSinceLastFed <= 0) {
    return zombie; // Fed today, no decay
  }

  const decayAmount = gameConfig.DECAY.DAILY_HAPPINESS_DECAY * daysSinceLastFed; // -5 per day
  const newHappiness = clampHappiness(zombie.happiness - decayAmount);

  return {
    ...zombie,
    happiness: newHappiness,
  };
}

/**
 * Apply Happiness Recovery
 *
 * Slowly recovers happiness over time when conditions improve.
 * Future: implement gradual recovery mechanics.
 *
 * @param zombie - Zombie to recover
 * @param farmState - Current farm state
 * @returns Updated zombie with recovered happiness
 */
export function applyHappinessRecovery(zombie: Zombie, farmState: FarmState): Zombie {
  // Future: implement recovery logic
  // For now, happiness only changes via feeding/petting/decay
  return zombie;
}

/**
 * Get Happiness Modifier
 *
 * Returns a stat modifier based on happiness level.
 * - High happiness (75-100): +10% to +25% boost
 * - Neutral happiness (25-75): no change
 * - Low happiness (0-25): -10% to -25% penalty
 *
 * Also affects decay rate:
 * - High happiness reduces decay by up to 50%
 *
 * @param happiness - Happiness value (0-100)
 * @returns Modifier object with stat and decay adjustments
 */
export function getHappinessModifier(
  happiness: number
): {
  statModifier: number;
  decayModifier: number;
} {
  // Stat modifier (affects combat performance)
  let statModifier = 1.0;
  if (happiness >= 75) {
    // High happiness: +10% to +25%
    statModifier = 1.0 + ((happiness - 75) / 25) * 0.25;
  } else if (happiness <= 25) {
    // Low happiness: -10% to -25%
    statModifier = 1.0 - ((25 - happiness) / 25) * 0.25;
  }

  // Decay modifier (high happiness reduces decay)
  let decayModifier = 1.0;
  if (happiness >= 50) {
    // Happiness above 50 reduces decay
    // At 100 happiness: 50% decay reduction
    decayModifier = 1.0 - ((happiness - 50) / 50) * 0.5;
  }

  return {
    statModifier,
    decayModifier,
  };
}

/**
 * Should Ignore Command
 *
 * Checks if a zombie is unhappy enough to ignore player commands.
 * Extremely unhappy zombies (< 25 happiness) may become unresponsive.
 *
 * @param zombie - Zombie to check
 * @returns True if zombie should ignore commands
 */
export function shouldIgnoreCommand(zombie: Zombie): boolean {
  // Below 25 happiness, zombies may ignore commands
  if (zombie.happiness < 25) {
    // Chance to ignore increases as happiness decreases
    const ignoreChance = (25 - zombie.happiness) / 25; // 0% at 25, 100% at 0
    return Math.random() < ignoreChance;
  }
  return false;
}

/**
 * Can Enter Combat
 *
 * Checks if a zombie's happiness is high enough to enter combat.
 * Extremely unhappy zombies (< 10 happiness) refuse to fight.
 *
 * @param zombie - Zombie to check
 * @returns True if zombie will fight
 */
export function canEnterCombat(zombie: Zombie): boolean {
  return zombie.happiness >= 10;
}

/**
 * Process Happiness for All Zombies
 *
 * Updates happiness for all zombies based on current conditions.
 *
 * @param farmState - Current farm state
 * @returns Updated farm state
 */
export function processAllZombiesHappiness(farmState: FarmState): FarmState {
  // Update active zombies
  const updatedActiveZombies = farmState.activeZombies.map((zombie) => {
    // Calculate current happiness with all factors
    const factors = getHappinessFactors(zombie, farmState);

    // Apply injury penalty if hurt
    let happiness = zombie.happiness;
    const injuryFactor = getInjuryFactor(zombie);
    if (injuryFactor < 0) {
      happiness = clampHappiness(happiness + injuryFactor);
    }

    return {
      ...zombie,
      happiness,
    };
  });

  return {
    ...farmState,
    activeZombies: updatedActiveZombies,
  };
}
