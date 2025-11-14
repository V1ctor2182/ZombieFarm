/**
 * Utility Libraries - Main Export
 *
 * Comprehensive utility functions for the Zombie Farm game.
 * All utilities are pure, well-tested, and type-safe.
 *
 * @module lib/utils
 */

// Math & Random Utilities
export {
  clamp,
  lerp,
  percentage,
  percentageOf,
  randomInt,
  randomFloat,
  randomBoolean,
  randomFromArray,
  weightedRandom,
  SeededRandom,
  type WeightedItem,
} from './math';

// Format Utilities
export {
  formatNumber,
  formatLargeNumber,
  formatTime,
  formatPercentage,
  formatDarkCoins,
  formatSoulEssence,
  formatDuration,
  formatCountdown,
} from './format';

// Validation Utilities
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isNull,
  isUndefined,
  isDefined,
  isEmpty,
  isValidNumber,
  isInRange,
  isPositive,
  isNonNegative,
  isInteger,
  isValidEnum,
  hasProperty,
  hasProperties,
  validateSchema,
  ValidationError,
  SchemaValidator,
  type Schema,
  type FieldSchema,
} from './validation';

// Collections Utilities
export {
  shuffle,
  sample,
  unique,
  chunk,
  flatten,
  deepClone,
  deepMerge,
  objectDiff,
  pick,
  omit,
  groupBy,
  type DiffChange,
  type DiffAdded,
  type DiffRemoved,
  type DiffResult,
} from './collections';
