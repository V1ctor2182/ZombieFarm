# Shared Libraries

This directory contains shared libraries and utilities used across multiple features.

## Structure

### config/

Game configuration and balance values.

- `zombieFarmConfig.ts` - Central game configuration
- Zombie type definitions
- Resource definitions
- Building definitions
- Balance values (costs, timers, rates)

### storage/

Persistence and save system.

- `localSaveSystem.ts` - Local storage save/load
- Save versioning and migration
- Serialization/deserialization
- Compression (if needed)

### utils/

General-purpose utility functions.

- `math.ts` - Math utilities (clamp, lerp, random, weighted random)
- `format.ts` - Formatting (numbers, time, currency)
- `validation.ts` - Type guards, schema validation
- `array.ts` - Array operations (shuffle, sample)
- `object.ts` - Object operations (deepClone, deepMerge, diff)

### test-utils/

Testing utilities and helpers (managed by test-qa-guardian agent).

- Test data factories
- Mock utilities
- Custom matchers
- Integration test helpers
- See `META/TODOs/TODO-TEST.md` for details

## Guidelines

1. **Pure Functions**: Utilities should be pure, stateless functions
2. **Well-Typed**: Use strict TypeScript types
3. **Well-Tested**: Aim for 100% coverage on utilities
4. **Well-Documented**: JSDoc comments for all public functions
5. **No Feature Logic**: Keep feature-specific logic in feature modules
