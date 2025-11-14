/**
 * Type Definitions - Index
 *
 * Central export point for all type definitions.
 * Import types using: import type { GameState, Zombie } from '@types';
 */

// ============================================================================
// GLOBAL TYPES
// ============================================================================

export type {
  GameState,
  Player,
  PlayerStats,
  TimeState,
  SaveMetadata,
  Position,
  Dimensions,
  ZombieId,
  PlotId,
  BuildingId,
  LocationId,
  EnemyId,
  BattleId,
  ResourceType,
  ItemId,
} from './global';

export {
  GameMode,
  Season,
  Weather,
  QualityTier,
} from './global';

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export type {
  Inventory,
  Item,
  ResourceCost,
  ResourceReward,
  ResourceNode,
  ResourceAmount,
  CurrencyAmount,
  SeedAmount,
} from './resources';

export {
  Resource,
  Currency,
  SeedType,
  ItemQuality,
  ResourceNodeType,
  ResourceNodeState,
} from './resources';

// ============================================================================
// FARM TYPES
// ============================================================================

export type {
  FarmState,
  Plot,
  Zombie,
  ZombieStats,
  ZombieEquipment,
  Building,
  ZombieGrowthConfig,
  DecayConfig,
  HappinessFactor,
} from './farm';

export {
  PlotState,
  ZombieType,
  ZombieQuality,
  ZombieAIState,
  BuildingType,
  BuildingState,
} from './farm';

// ============================================================================
// COMBAT TYPES
// ============================================================================

export type {
  CombatState,
  CombatUnit,
  CombatStats,
  Enemy,
  EnemyAIProfile,
  EnemyAbility,
  AbilityEffect,
  Obstacle,
  TrapData,
  ActiveStatusEffect,
  BattleResult,
  BattleStats,
  BattleLogEntry,
  DamageCalculation,
  DamageModifiers,
} from './combat';

export {
  BattlePhase,
  UnitAIState,
  EnemyType,
  TargetPriority,
  AbilityEffectType,
  AbilityTargetType,
  ObstacleType,
  DamageType,
  StatusEffect,
  BattleLogEventType,
} from './combat';

// ============================================================================
// EVENT TYPES
// ============================================================================

export type {
  GameEvent,
  FarmEvent,
  CombatEvent,
  WorldEvent,
  SystemEvent,
  UIEvent,
  EventType,
  EventPayload,
  EventHandler,
  EventListener,
  EventBus,
  EventMetadata,
} from './events';

// ============================================================================
// WORLD TYPES
// ============================================================================

export type {
  WorldState,
  Location,
  LocationEnemy,
  LocationPrerequisites,
  Region,
  RegionPrerequisites,
  WorldMapNode,
} from './world';

export {
  LocationType,
  RegionBiome,
  NodeVisualState,
} from './world';

// ============================================================================
// UI TYPES
// ============================================================================

export type {
  UIState,
  ActiveModal,
  Notification,
  NotificationAction,
  Tooltip,
  TooltipContent,
  LoadingState,
  ConfirmDialog,
  HUDElement,
  HUDLayout,
  ContextMenu,
  ContextMenuItem,
  DragState,
  DraggedItem,
} from './ui';

export {
  ModalType,
  ModalSize,
  NotificationType,
  TooltipPlacement,
  PanelType,
  ButtonStyle,
} from './ui';
