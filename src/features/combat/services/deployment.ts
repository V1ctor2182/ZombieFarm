/**
 * Deployment System
 *
 * Handles squad selection, validation, composition analysis, and deployment ordering.
 * Per DOMAIN-COMBAT.md Battle Preparation specifications.
 */

import type { Zombie } from '../../../types/farm';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Deployment slot with zombie assignment
 */
export interface DeploymentSlot {
  readonly slotIndex: number;
  readonly zombie: Zombie;
}

/**
 * Squad composition validation result
 */
export interface SquadCompositionResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

/**
 * Squad statistics summary
 */
export interface SquadStats {
  readonly totalHp: number;
  readonly totalMaxHp: number;
  readonly avgAttack: number;
  readonly avgDefense: number;
  readonly avgSpeed: number;
  readonly composition: Record<string, number>;
}

/**
 * Squad suggestion strategy
 */
export type SquadStrategy = 'balanced' | 'defensive' | 'aggressive' | 'fast';

/**
 * Squad composition suggestion
 */
export interface SquadSuggestion {
  readonly squad: Zombie[];
  readonly reasoning: string;
}

// ============================================================================
// SQUAD SIZE CALCULATION
// ============================================================================

/**
 * Calculates maximum squad size based on Command Center level
 *
 * Per DOMAIN-COMBAT.md:
 * - Base squad size: 3 (early game)
 * - Increases by 1 per Command Center level (up to level 7)
 * - Maximum squad size: 10
 *
 * @param commandCenterLevel - Command Center building level (0 = not built)
 * @returns Maximum squad size
 */
export function getMaxSquadSize(commandCenterLevel: number): number {
  const MIN_SQUAD_SIZE = 3;
  const MAX_SQUAD_SIZE = 10;

  // Handle invalid inputs
  if (commandCenterLevel < 0) {
    return MIN_SQUAD_SIZE;
  }

  // Base size + bonus from Command Center
  const calculatedSize = MIN_SQUAD_SIZE + Math.max(0, commandCenterLevel - 1);

  // Cap at maximum
  return Math.min(calculatedSize, MAX_SQUAD_SIZE);
}

// ============================================================================
// ZOMBIE AVAILABILITY
// ============================================================================

/**
 * Checks if a zombie is available for deployment
 *
 * Available zombies must be:
 * - Alive (HP > 0)
 * - Not in the inCombatZombieIds set
 *
 * Note: This function should only be called on zombies from activeZombies array.
 * Zombies in Crypt or growing should not be passed to this function.
 *
 * @param zombie - Zombie to check
 * @param inCombatZombieIds - Set of zombie IDs currently in combat
 * @returns True if zombie can be deployed
 */
export function isZombieAvailable(zombie: Zombie, inCombatZombieIds: Set<string> = new Set()): boolean {
  // Must be alive
  if (zombie.stats.hp <= 0) {
    return false;
  }

  // Must not be in combat
  if (inCombatZombieIds.has(zombie.id)) {
    return false;
  }

  return true;
}

/**
 * Filters zombies to only those available for deployment
 *
 * @param activeZombies - Active zombies on the farm (not in Crypt)
 * @param inCombatZombieIds - Set of zombie IDs currently in combat (optional)
 * @returns Array of available zombies
 */
export function getAvailableZombies(activeZombies: Zombie[], inCombatZombieIds: Set<string> = new Set()): Zombie[] {
  return activeZombies.filter((z) => isZombieAvailable(z, inCombatZombieIds));
}

// ============================================================================
// SQUAD VALIDATION
// ============================================================================

/**
 * Checks if squad contains duplicate zombies
 *
 * @param squad - Squad to check
 * @returns True if duplicates found
 */
export function hasZombieDuplicates(squad: Zombie[]): boolean {
  const ids = squad.map((z) => z.id);
  const uniqueIds = new Set(ids);
  return ids.length !== uniqueIds.size;
}

/**
 * Checks if zombie is a tank (high defense)
 */
function isTankUnit(zombie: Zombie): boolean {
  const tankTypes = ['brute', 'boneKnight'];
  return zombie.stats.defense >= 20 || tankTypes.includes(zombie.type as string);
}

/**
 * Checks if zombie is ranged
 */
function isRangedUnit(zombie: Zombie): boolean {
  const rangedTypes = ['spitter', 'lich', 'necromancer'];
  return rangedTypes.includes(zombie.type as string);
}

/**
 * Validates squad composition
 *
 * Checks:
 * - Squad size within limits
 * - No duplicates
 * - All zombies alive
 * - Composition warnings (tanks, ranged, HP)
 *
 * Note: Caller should ensure squad only contains active zombies (not from Crypt).
 * Use getAvailableZombies() to filter first if needed.
 *
 * @param squad - Squad to validate
 * @param maxSquadSize - Maximum allowed squad size
 * @param inCombatZombieIds - Optional set of zombie IDs already in combat
 * @returns Validation result
 */
export function validateSquadComposition(
  squad: Zombie[],
  maxSquadSize: number,
  inCombatZombieIds: Set<string> = new Set()
): SquadCompositionResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Size validation
  if (squad.length === 0) {
    errors.push('Squad cannot be empty');
    return { isValid: false, errors, warnings };
  }

  if (squad.length > maxSquadSize) {
    errors.push(`Squad size (${squad.length}) exceeds maximum (${maxSquadSize})`);
  }

  // Duplicate check
  if (hasZombieDuplicates(squad)) {
    errors.push('Squad contains duplicate zombies');
  }

  // Availability check (HP and combat status)
  const unavailableCount = squad.filter((z) => !isZombieAvailable(z, inCombatZombieIds)).length;
  if (unavailableCount > 0) {
    errors.push('Squad contains unavailable zombies');
  }

  // Stop here if errors found
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Composition warnings
  const hasTank = squad.some(isTankUnit);
  if (!hasTank) {
    warnings.push('Squad has no tank units (consider adding Brute or high-defense zombies)');
  }

  const hasRanged = squad.some(isRangedUnit);
  if (!hasRanged && squad.length >= 2) {
    warnings.push('Squad has no ranged units (consider adding Spitter)');
  }

  // HP warning
  const avgHpPercent =
    squad.reduce((sum, z) => sum + z.stats.hp / z.stats.maxHp, 0) / squad.length;
  if (avgHpPercent < 0.5) {
    warnings.push('Squad average HP is low (below 50%)');
  }

  return { isValid: true, errors, warnings };
}

// ============================================================================
// SQUAD STATISTICS
// ============================================================================

/**
 * Calculates comprehensive squad statistics
 *
 * @param squad - Squad to analyze
 * @returns Squad stats summary
 */
export function calculateSquadStats(squad: Zombie[]): SquadStats {
  if (squad.length === 0) {
    return {
      totalHp: 0,
      totalMaxHp: 0,
      avgAttack: 0,
      avgDefense: 0,
      avgSpeed: 0,
      composition: {},
    };
  }

  const totalHp = squad.reduce((sum, z) => sum + z.stats.hp, 0);
  const totalMaxHp = squad.reduce((sum, z) => sum + z.stats.maxHp, 0);
  const avgAttack = squad.reduce((sum, z) => sum + z.stats.attack, 0) / squad.length;
  const avgDefense = squad.reduce((sum, z) => sum + z.stats.defense, 0) / squad.length;
  const avgSpeed = squad.reduce((sum, z) => sum + z.stats.speed, 0) / squad.length;

  // Count unit types
  const composition: Record<string, number> = {};
  for (const zombie of squad) {
    const type = zombie.type as string;
    composition[type] = (composition[type] || 0) + 1;
  }

  return {
    totalHp,
    totalMaxHp,
    avgAttack,
    avgDefense,
    avgSpeed,
    composition,
  };
}

// ============================================================================
// DEPLOYMENT ORDERING
// ============================================================================

/**
 * Applies deployment order from slot assignments
 *
 * Sorts zombies by their slot index to determine battlefield formation order.
 * Per DOMAIN-COMBAT.md: "Deployment order affects formation - slot 1 leads the charge"
 *
 * @param slots - Deployment slots with zombie assignments
 * @returns Ordered array of zombies
 */
export function applyDeploymentOrder(slots: DeploymentSlot[]): Zombie[] {
  // Sort slots by index
  const sortedSlots = [...slots].sort((a, b) => a.slotIndex - b.slotIndex);

  // Extract zombies in order
  return sortedSlots.map((slot) => slot.zombie);
}

// ============================================================================
// SQUAD SUGGESTIONS
// ============================================================================

/**
 * Suggests optimal squad composition based on available zombies and strategy
 *
 * @param availableZombies - Zombies available for deployment
 * @param maxSquadSize - Maximum squad size
 * @param strategy - Desired squad strategy
 * @returns Squad suggestion with reasoning
 */
export function suggestSquadComposition(
  availableZombies: Zombie[],
  maxSquadSize: number,
  strategy: SquadStrategy
): SquadSuggestion {
  if (availableZombies.length === 0) {
    return {
      squad: [],
      reasoning: 'No zombies available for deployment',
    };
  }

  const targetSize = Math.min(maxSquadSize, availableZombies.length);

  if (availableZombies.length < maxSquadSize) {
    return {
      squad: [...availableZombies],
      reasoning: `Insufficient zombies available. Deploying all ${availableZombies.length} available zombies.`,
    };
  }

  // Score and sort zombies based on strategy
  const scored = availableZombies.map((zombie) => ({
    zombie,
    score: calculateZombieScore(zombie, strategy),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Take top zombies
  const selectedZombies = scored.slice(0, targetSize).map((s) => s.zombie);

  // Ensure balanced composition (at least 1 tank if possible)
  const hasTank = selectedZombies.some(isTankUnit);
  if (!hasTank && strategy !== 'fast') {
    // Try to swap in a tank
    const tank = availableZombies.find(isTankUnit);
    if (tank && !selectedZombies.includes(tank)) {
      // Replace lowest-scored non-tank
      const lowestNonTank = selectedZombies.reverse().find((z) => !isTankUnit(z));
      if (lowestNonTank) {
        const index = selectedZombies.indexOf(lowestNonTank);
        selectedZombies[index] = tank;
      }
    }
  }

  const reasoning = generateSquadReasoning(selectedZombies, strategy);

  return {
    squad: selectedZombies,
    reasoning,
  };
}

/**
 * Calculates zombie score for strategy-based selection
 */
function calculateZombieScore(zombie: Zombie, strategy: SquadStrategy): number {
  let score = 0;

  // Base score on level
  score += zombie.level * 10;

  // Strategy-specific scoring
  switch (strategy) {
    case 'balanced':
      score += zombie.stats.attack * 1.0;
      score += zombie.stats.defense * 1.0;
      score += zombie.stats.speed * 5;
      score += (zombie.stats.hp / zombie.stats.maxHp) * 20; // Favor healthy zombies
      break;

    case 'defensive':
      score += zombie.stats.defense * 2.0;
      score += zombie.stats.hp * 0.5;
      score += isTankUnit(zombie) ? 50 : 0;
      break;

    case 'aggressive':
      score += zombie.stats.attack * 2.0;
      score += zombie.stats.speed * 10;
      score += isRangedUnit(zombie) ? 30 : 0;
      break;

    case 'fast':
      score += zombie.stats.speed * 20;
      score += zombie.stats.attack * 1.0;
      score += zombie.type === 'runner' ? 50 : 0;
      break;
  }

  // Penalize injured zombies
  const hpPercent = zombie.stats.hp / zombie.stats.maxHp;
  if (hpPercent < 0.5) {
    score *= hpPercent;
  }

  return score;
}

/**
 * Generates human-readable reasoning for squad suggestion
 */
function generateSquadReasoning(squad: Zombie[], strategy: SquadStrategy): string {
  const stats = calculateSquadStats(squad);

  const parts: string[] = [];

  parts.push(`Suggested ${strategy} squad composition:`);

  // Composition breakdown
  const compositionStr = Object.entries(stats.composition)
    .map(([type, count]) => `${count}x ${type}`)
    .join(', ');
  parts.push(`Composition: ${compositionStr}`);

  // Stats summary
  parts.push(
    `Total HP: ${stats.totalHp}/${stats.totalMaxHp}, Avg Attack: ${Math.round(stats.avgAttack)}, Avg Defense: ${Math.round(stats.avgDefense)}`
  );

  // Strategy note
  switch (strategy) {
    case 'balanced':
      parts.push('Balanced mix of offense and defense.');
      break;
    case 'defensive':
      parts.push('Tank-heavy composition for sustained combat.');
      break;
    case 'aggressive':
      parts.push('High damage output focused on eliminating enemies quickly.');
      break;
    case 'fast':
      parts.push('Speed-focused composition for hit-and-run tactics.');
      break;
  }

  return parts.join(' ');
}
