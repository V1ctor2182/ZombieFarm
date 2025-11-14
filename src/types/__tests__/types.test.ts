/**
 * Type Definition Tests
 *
 * These tests validate that types compile correctly and work as expected.
 * They test type inference, discriminated unions, and type compatibility.
 */

import type {
  GameState,
  Player,
  TimeState,
  Inventory,
  Zombie,
  Plot,
  Building,
  Enemy,
  GameEvent,
  FarmEvent,
  CombatEvent,
  SystemEvent,
  Location,
  UIState,
} from '../index';

import {
  GameMode,
  Season,
  Weather,
  Resource,
  Currency,
  SeedType,
  ZombieType,
  ZombieQuality,
  ZombieAIState,
  PlotState,
  BuildingType,
  BuildingState,
  EnemyType,
  TargetPriority,
  UnitAIState,
  DamageType,
  StatusEffect,
  LocationType,
  ModalType,
  ModalSize,
  NotificationType,
} from '../index';

describe('Type Definitions', () => {
  describe('Global Types', () => {
    it('should create a valid Player object', () => {
      const player: Player = {
        id: 'player-1',
        name: 'Test Necromancer',
        level: 5,
        xp: 250,
        xpToNextLevel: 500,
        achievements: ['first-harvest', 'first-battle'],
        completedQuests: ['tutorial-1'],
        activeQuests: ['harvest-10-zombies'],
        unlockedTech: ['basic-plots'],
        tutorialFlags: { plantingSeen: true, harvestingSeen: false },
        stats: {
          zombiesHarvested: 10,
          zombiesLost: 2,
          battlesWon: 5,
          battlesLost: 1,
          locationsConquered: 3,
          darkCoinsEarned: 1000,
          resourcesGathered: { rottedWood: 50 },
          highestZombieLevel: 8,
          totalPlayTime: 3600,
        },
      };

      expect(player.id).toBe('player-1');
      expect(player.level).toBe(5);
      expect(player.stats.zombiesHarvested).toBe(10);
    });

    it('should create a valid TimeState object', () => {
      const timeState: TimeState = {
        day: 1,
        hour: 12,
        minute: 30,
        season: Season.SPRING,
        isDaytime: true,
        weather: Weather.CLEAR,
        lastUpdate: Date.now(),
      };

      expect(timeState.day).toBe(1);
      expect(timeState.isDaytime).toBe(true);
      expect(timeState.weather).toBe(Weather.CLEAR);
    });

    it('should enforce GameMode enum values', () => {
      const mode: GameMode = GameMode.FARM;
      expect(mode).toBe('farm');
    });
  });

  describe('Resource Types', () => {
    it('should create a valid Inventory object', () => {
      const inventory: Inventory = {
        resources: {
          [Resource.ROTTEN_WOOD]: 100,
          [Resource.BONES]: 50,
          [Resource.BLOOD_WATER]: 25,
          [Resource.CORPSE_DUST]: 10,
          [Resource.SOUL_FRAGMENTS]: 5,
          [Resource.IRON_SCRAPS]: 0,
          [Resource.CLOTH]: 0,
          [Resource.BRAINS]: 0,
          [Resource.ROTTEN_MEAT]: 0,
          [Resource.HOLY_WATER]: 0,
          [Resource.COAL]: 0,
          [Resource.TAR]: 0,
          [Resource.GRAVE_DIRT]: 0,
          [Resource.BONE_MEAL]: 0,
          [Resource.EMBALMING_FLUID]: 0,
          [Resource.DARK_ESSENCE]: 0,
        },
        currencies: {
          [Currency.DARK_COINS]: 500,
          [Currency.SOUL_ESSENCE]: 2,
        },
        seeds: {
          [SeedType.SHAMBLER_SEED]: 10,
          [SeedType.RUNNER_SEED]: 5,
          [SeedType.BRUTE_SEED]: 0,
          [SeedType.SPITTER_SEED]: 0,
          [SeedType.GHOUL_SEED]: 0,
          [SeedType.ABOMINATION_SEED]: 0,
          [SeedType.LICH_SEED]: 0,
          [SeedType.BONE_KNIGHT_SEED]: 0,
          [SeedType.PRIEST_ZOMBIE_SEED]: 0,
          [SeedType.EXPLOSIVE_ZOMBIE_SEED]: 0,
          [SeedType.NECROMANCER_ZOMBIE_SEED]: 0,
        },
        items: [],
        capacity: 1000,
        currentCount: 0,
      };

      expect(inventory.resources[Resource.ROTTEN_WOOD]).toBe(100);
      expect(inventory.currencies[Currency.DARK_COINS]).toBe(500);
      expect(inventory.seeds[SeedType.SHAMBLER_SEED]).toBe(10);
    });
  });

  describe('Farm Types', () => {
    it('should create a valid Zombie object', () => {
      const zombie: Zombie = {
        id: 'zombie-1',
        type: ZombieType.SHAMBLER,
        name: 'Shambles',
        quality: ZombieQuality.BRONZE,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        stats: {
          hp: 100,
          maxHp: 100,
          attack: 10,
          defense: 5,
          speed: 1.0,
          range: 1,
          attackCooldown: 1.5,
          decayRate: 1.0,
        },
        happiness: 50,
        daysSinceLastFed: 0,
        lastFedAt: Date.now(),
        lastPetAt: null,
        mutations: [],
        equipment: {
          weapon: null,
          armor: null,
          accessory: null,
        },
        position: { x: 10, y: 10 },
        aiState: ZombieAIState.IDLE,
        createdAt: Date.now(),
      };

      expect(zombie.type).toBe(ZombieType.SHAMBLER);
      expect(zombie.quality).toBe(ZombieQuality.BRONZE);
      expect(zombie.stats.hp).toBe(100);
    });

    it('should create a valid Plot object', () => {
      const plot: Plot = {
        id: 'plot-1',
        position: { x: 5, y: 5 },
        state: PlotState.EMPTY,
        plantedSeed: null,
        plantedAt: null,
        baseGrowthTime: null,
        growthTimeRemaining: null,
        isWatered: false,
        isFertilized: false,
        zombieId: null,
      };

      expect(plot.state).toBe(PlotState.EMPTY);
      expect(plot.plantedSeed).toBeNull();
    });

    it('should create a valid Building object', () => {
      const building: Building = {
        id: 'building-1',
        type: BuildingType.COMMAND_CENTER,
        position: { x: 0, y: 0 },
        level: 1,
        state: BuildingState.ACTIVE,
        constructionStartedAt: null,
        constructionTimeRemaining: null,
        data: {},
      };

      expect(building.type).toBe(BuildingType.COMMAND_CENTER);
      expect(building.level).toBe(1);
    });
  });

  describe('Combat Types', () => {
    it('should create a valid Enemy object', () => {
      const enemy: Enemy = {
        id: 'enemy-1',
        type: EnemyType.PEASANT,
        name: 'Peasant',
        position: { x: 20, y: 10 },
        stats: {
          hp: 50,
          maxHp: 50,
          attack: 5,
          defense: 2,
          speed: 1.5,
          range: 1,
          attackCooldown: 1.0,
          resistances: {},
        },
        statusEffects: [],
        aiProfile: {
          aggression: 0.5,
          targetPriority: TargetPriority.CLOSEST,
          preferredRange: 1,
          canRetreat: true,
          useAbilities: false,
        },
        aiState: UnitAIState.ADVANCING,
        targetId: null,
        lastAttackAt: 0,
        abilities: [],
        isDead: false,
      };

      expect(enemy.type).toBe(EnemyType.PEASANT);
      expect(enemy.stats.hp).toBe(50);
    });

    it('should enforce DamageType enum', () => {
      const damageType: DamageType = DamageType.HOLY;
      expect(damageType).toBe('holy');
    });

    it('should enforce StatusEffect enum', () => {
      const effect: StatusEffect = StatusEffect.POISONED;
      expect(effect).toBe('poisoned');
    });
  });

  describe('Event Types (Discriminated Unions)', () => {
    it('should create valid FarmEvent variants', () => {
      const plantEvent: FarmEvent = {
        type: 'seed.planted',
        payload: {
          plotId: 'plot-1',
          seedType: SeedType.SHAMBLER_SEED,
          timestamp: Date.now(),
        },
      };

      const harvestEvent: FarmEvent = {
        type: 'zombie.harvested',
        payload: {
          plotId: 'plot-1',
          zombieId: 'zombie-1',
          timestamp: Date.now(),
        },
      };

      expect(plantEvent.type).toBe('seed.planted');
      expect(harvestEvent.type).toBe('zombie.harvested');
    });

    it('should create valid CombatEvent variants', () => {
      const battleStartEvent: CombatEvent = {
        type: 'battle.started',
        payload: {
          battleId: 'battle-1',
          timestamp: Date.now(),
        },
      };

      const attackEvent: CombatEvent = {
        type: 'unit.attacked',
        payload: {
          battleId: 'battle-1',
          attackerId: 'zombie-1',
          targetId: 'enemy-1',
          damage: 15,
          damageType: 'physical',
        },
      };

      expect(battleStartEvent.type).toBe('battle.started');
      expect(attackEvent.type).toBe('unit.attacked');
    });

    it('should create valid SystemEvent variants', () => {
      const saveEvent: SystemEvent = {
        type: 'game.saved',
        payload: {
          timestamp: Date.now(),
        },
      };

      const levelUpEvent: SystemEvent = {
        type: 'player.levelUp',
        payload: {
          newLevel: 6,
          timestamp: Date.now(),
        },
      };

      expect(saveEvent.type).toBe('game.saved');
      expect(levelUpEvent.type).toBe('player.levelUp');
    });

    it('should allow GameEvent to be any event type', () => {
      const farmEvent: GameEvent = {
        type: 'seed.planted',
        payload: {
          plotId: 'plot-1',
          seedType: SeedType.SHAMBLER_SEED,
          timestamp: Date.now(),
        },
      };

      const combatEvent: GameEvent = {
        type: 'battle.started',
        payload: {
          battleId: 'battle-1',
          timestamp: Date.now(),
        },
      };

      const systemEvent: GameEvent = {
        type: 'game.saved',
        payload: {
          timestamp: Date.now(),
        },
      };

      // All should be valid GameEvent types
      expect(farmEvent.type).toBe('seed.planted');
      expect(combatEvent.type).toBe('battle.started');
      expect(systemEvent.type).toBe('game.saved');
    });

    it('should allow type narrowing based on event type', () => {
      const event: GameEvent = {
        type: 'seed.planted',
        payload: {
          plotId: 'plot-1',
          seedType: SeedType.SHAMBLER_SEED,
          timestamp: Date.now(),
        },
      };

      if (event.type === 'seed.planted') {
        // TypeScript should know the payload structure here
        expect(event.payload.plotId).toBe('plot-1');
        expect(event.payload.seedType).toBe(SeedType.SHAMBLER_SEED);
      }
    });
  });

  describe('World Types', () => {
    it('should create a valid Location object', () => {
      const location: Location = {
        id: 'village-1',
        name: 'Peaceful Village',
        description: 'A small village ripe for raiding',
        type: LocationType.VILLAGE,
        regionId: 'grassland',
        difficulty: 1,
        recommendedLevel: 1,
        mapPosition: { x: 100, y: 100 },
        isUnlocked: true,
        isConquered: false,
        enemies: [
          {
            type: EnemyType.PEASANT,
            count: 5,
            wave: 1,
          },
        ],
        fortifications: [],
        waves: 1,
        firstTimeRewards: {
          currencies: {
            [Currency.DARK_COINS]: 100,
          },
        },
        repeatRewards: {
          currencies: {
            [Currency.DARK_COINS]: 50,
          },
        },
        unlocks: [],
        raidCooldown: 24,
        nextRaidAvailable: null,
        prerequisites: {},
      };

      expect(location.type).toBe(LocationType.VILLAGE);
      expect(location.difficulty).toBe(1);
    });
  });

  describe('UI Types', () => {
    it('should create a valid UIState object', () => {
      const uiState: UIState = {
        activeModal: null,
        notifications: [],
        activePanels: [],
        hudVisible: true,
        tooltip: null,
        loading: {
          isLoading: false,
          cancellable: false,
        },
        confirmDialog: null,
      };

      expect(uiState.hudVisible).toBe(true);
      expect(uiState.notifications).toHaveLength(0);
    });

    it('should create valid modal types', () => {
      const modal: UIState['activeModal'] = {
        type: ModalType.ZOMBIE_DETAILS,
        data: { zombieId: 'zombie-1' },
        dismissible: true,
        size: ModalSize.MEDIUM,
      };

      expect(modal?.type).toBe(ModalType.ZOMBIE_DETAILS);
    });

    it('should create valid notification types', () => {
      const notification: UIState['notifications'][number] = {
        id: 'notif-1',
        type: NotificationType.SUCCESS,
        message: 'Zombie harvested!',
        duration: 3000,
        createdAt: Date.now(),
        dismissible: true,
      };

      expect(notification.type).toBe(NotificationType.SUCCESS);
    });
  });

  describe('Complete GameState', () => {
    it('should create a minimal valid GameState', () => {
      const gameState: GameState = {
        mode: GameMode.FARM,
        player: {
          id: 'player-1',
          name: 'Test',
          level: 1,
          xp: 0,
          xpToNextLevel: 100,
          achievements: [],
          completedQuests: [],
          activeQuests: [],
          unlockedTech: [],
          tutorialFlags: {},
          stats: {
            zombiesHarvested: 0,
            zombiesLost: 0,
            battlesWon: 0,
            battlesLost: 0,
            locationsConquered: 0,
            darkCoinsEarned: 0,
            resourcesGathered: {},
            highestZombieLevel: 0,
            totalPlayTime: 0,
          },
        },
        farm: {
          plots: [],
          activeZombies: [],
          cryptZombies: [],
          buildings: [],
          resourceNodes: [],
          activeZombieCapacity: 10,
          expansionLevel: 0,
          gridSize: { width: 20, height: 20 },
        },
        combat: null,
        inventory: {
          resources: {} as any,
          currencies: {} as any,
          seeds: {} as any,
          items: [],
          capacity: 1000,
          currentCount: 0,
        },
        world: {
          locations: [],
          unlockedLocations: [],
          conqueredLocations: [],
          currentRegion: 'grassland',
          unlockedRegions: ['grassland'],
        },
        ui: {
          activeModal: null,
          notifications: [],
          activePanels: [],
          hudVisible: true,
          tooltip: null,
          loading: { isLoading: false, cancellable: false },
          confirmDialog: null,
        },
        time: {
          day: 1,
          hour: 8,
          minute: 0,
          season: Season.SPRING,
          isDaytime: true,
          weather: Weather.CLEAR,
          lastUpdate: Date.now(),
        },
        meta: {
          version: '1.0.0',
          createdAt: Date.now(),
          lastSavedAt: Date.now(),
          totalPlayTime: 0,
        },
      };

      expect(gameState.mode).toBe(GameMode.FARM);
      expect(gameState.player.level).toBe(1);
      expect(gameState.farm.activeZombieCapacity).toBe(10);
    });
  });

  describe('Type Inference', () => {
    it('should infer readonly arrays correctly', () => {
      const zombies: ReadonlyArray<Zombie> = [];
      // Should not compile: zombies.push({} as Zombie);
      expect(zombies).toHaveLength(0);
    });

    it('should infer readonly records correctly', () => {
      const resources: Readonly<Record<Resource, number>> = {
        [Resource.ROTTEN_WOOD]: 10,
      } as any;

      // Should not compile: resources[Resource.ROTTEN_WOOD] = 20;
      expect(resources[Resource.ROTTEN_WOOD]).toBe(10);
    });
  });
});
