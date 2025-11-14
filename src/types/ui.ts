/**
 * UI Type Definitions
 *
 * Defines types for UI state, modals, notifications, and panels.
 */

/**
 * UI State
 *
 * Complete UI state for the application.
 */
export interface UIState {
  /** Active modal (if any) */
  readonly activeModal: ActiveModal | null;

  /** Active notifications */
  readonly notifications: ReadonlyArray<Notification>;

  /** Active panels */
  readonly activePanels: ReadonlyArray<string>;

  /** HUD visibility */
  readonly hudVisible: boolean;

  /** Current tooltip (if any) */
  readonly tooltip: Tooltip | null;

  /** Loading state */
  readonly loading: LoadingState;

  /** Confirmation dialog (if any) */
  readonly confirmDialog: ConfirmDialog | null;
}

// ============================================================================
// MODALS
// ============================================================================

/**
 * Active Modal
 *
 * Currently displayed modal window.
 */
export interface ActiveModal {
  /** Modal type */
  readonly type: ModalType;

  /** Modal data/props */
  readonly data?: unknown;

  /** Can be closed by clicking outside? */
  readonly dismissible: boolean;

  /** Modal size */
  readonly size: ModalSize;
}

/**
 * Modal Type
 */
export enum ModalType {
  // Farm
  ZOMBIE_DETAILS = 'zombieDetails',
  ZOMBIE_INVENTORY = 'zombieInventory',
  CRYPT_MANAGEMENT = 'cryptManagement',
  BUILDING_MENU = 'buildingMenu',
  PLOT_ACTIONS = 'plotActions',

  // Combat
  SQUAD_SELECTION = 'squadSelection',
  BATTLE_RESULTS = 'battleResults',
  LOCATION_INFO = 'locationInfo',

  // Progression
  LEVEL_UP = 'levelUp',
  QUEST_LOG = 'questLog',
  ACHIEVEMENT = 'achievement',
  TECH_TREE = 'techTree',

  // Inventory & Shop
  INVENTORY = 'inventory',
  SHOP = 'shop',
  CRAFTING = 'crafting',

  // Settings
  SETTINGS = 'settings',
  CONTROLS = 'controls',

  // System
  PAUSE_MENU = 'pauseMenu',
  SAVE_LOAD = 'saveLoad',
  CONFIRM = 'confirm',
  ERROR = 'error',
}

/**
 * Modal Size
 */
export enum ModalSize {
  SMALL = 'small',                  // 400px
  MEDIUM = 'medium',                // 600px
  LARGE = 'large',                  // 800px
  FULL = 'full',                    // Full screen
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notification
 *
 * Toast/snackbar notification.
 */
export interface Notification {
  /** Unique notification ID */
  readonly id: string;

  /** Notification type */
  readonly type: NotificationType;

  /** Message text */
  readonly message: string;

  /** Optional title */
  readonly title?: string;

  /** Duration in milliseconds (0 = persistent) */
  readonly duration: number;

  /** Time when notification was created */
  readonly createdAt: number;

  /** Is dismissible? */
  readonly dismissible: boolean;

  /** Optional action button */
  readonly action?: NotificationAction;

  /** Optional icon */
  readonly icon?: string;
}

/**
 * Notification Type
 */
export enum NotificationType {
  INFO = 'info',                    // Blue, informational
  SUCCESS = 'success',              // Green, success message
  WARNING = 'warning',              // Yellow, warning
  ERROR = 'error',                  // Red, error
  ACHIEVEMENT = 'achievement',      // Special styling for achievements
  LEVEL_UP = 'levelUp',             // Special styling for level ups
}

/**
 * Notification Action
 *
 * Optional action button in notification.
 */
export interface NotificationAction {
  /** Action label */
  readonly label: string;

  /** Action handler */
  readonly handler: () => void;
}

// ============================================================================
// TOOLTIPS
// ============================================================================

/**
 * Tooltip
 *
 * Hover tooltip information.
 */
export interface Tooltip {
  /** Tooltip content */
  readonly content: string | TooltipContent;

  /** Position on screen */
  readonly position: { readonly x: number; readonly y: number };

  /** Tooltip placement */
  readonly placement: TooltipPlacement;

  /** Delay before showing (ms) */
  readonly delay: number;
}

/**
 * Tooltip Content
 *
 * Rich tooltip with structured data.
 */
export interface TooltipContent {
  /** Title */
  readonly title: string;

  /** Description */
  readonly description?: string;

  /** Stats or key-value pairs */
  readonly stats?: ReadonlyArray<{ readonly label: string; readonly value: string }>;

  /** Footer text */
  readonly footer?: string;
}

/**
 * Tooltip Placement
 */
export enum TooltipPlacement {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto',
}

// ============================================================================
// PANELS
// ============================================================================

/**
 * Panel Type
 *
 * Side panels and overlays.
 */
export enum PanelType {
  // Farm Panels
  ZOMBIE_ROSTER = 'zombieRoster',
  BUILDING_LIST = 'buildingList',
  RESOURCES = 'resources',

  // Combat Panels
  UNIT_INFO = 'unitInfo',
  BATTLE_LOG = 'battleLog',

  // World Panels
  WORLD_MAP = 'worldMap',
  LOCATION_LIST = 'locationList',

  // Progression Panels
  PLAYER_STATS = 'playerStats',
  QUESTS = 'quests',
  ACHIEVEMENTS = 'achievements',

  // System Panels
  HELP = 'help',
  KEYBINDS = 'keybinds',
}

// ============================================================================
// LOADING STATE
// ============================================================================

/**
 * Loading State
 */
export interface LoadingState {
  /** Is loading? */
  readonly isLoading: boolean;

  /** Loading message */
  readonly message?: string;

  /** Loading progress (0-100) */
  readonly progress?: number;

  /** Is cancellable? */
  readonly cancellable: boolean;
}

// ============================================================================
// CONFIRM DIALOG
// ============================================================================

/**
 * Confirm Dialog
 *
 * Confirmation dialog for destructive actions.
 */
export interface ConfirmDialog {
  /** Dialog title */
  readonly title: string;

  /** Dialog message */
  readonly message: string;

  /** Confirm button text */
  readonly confirmText: string;

  /** Cancel button text */
  readonly cancelText: string;

  /** Confirm button style */
  readonly confirmStyle: ButtonStyle;

  /** Callback when confirmed */
  readonly onConfirm: () => void;

  /** Callback when cancelled */
  readonly onCancel: () => void;

  /** Is this a dangerous action? */
  readonly dangerous: boolean;
}

/**
 * Button Style
 */
export enum ButtonStyle {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}

// ============================================================================
// HUD ELEMENTS
// ============================================================================

/**
 * HUD Element
 *
 * Individual HUD component state.
 */
export interface HUDElement {
  /** Element ID */
  readonly id: string;

  /** Is visible? */
  readonly visible: boolean;

  /** Position override (if any) */
  readonly position?: { readonly x: number; readonly y: number };

  /** Custom data */
  readonly data?: unknown;
}

/**
 * HUD Layout
 *
 * Configuration for HUD element positions.
 */
export interface HUDLayout {
  /** Top bar elements */
  readonly topBar: ReadonlyArray<string>;

  /** Bottom bar elements */
  readonly bottomBar: ReadonlyArray<string>;

  /** Left sidebar elements */
  readonly leftSidebar: ReadonlyArray<string>;

  /** Right sidebar elements */
  readonly rightSidebar: ReadonlyArray<string>;
}

// ============================================================================
// CONTEXT MENU
// ============================================================================

/**
 * Context Menu
 *
 * Right-click context menu.
 */
export interface ContextMenu {
  /** Menu items */
  readonly items: ReadonlyArray<ContextMenuItem>;

  /** Position on screen */
  readonly position: { readonly x: number; readonly y: number };

  /** Context data */
  readonly context?: unknown;
}

/**
 * Context Menu Item
 */
export interface ContextMenuItem {
  /** Item label */
  readonly label: string;

  /** Item icon (optional) */
  readonly icon?: string;

  /** Is disabled? */
  readonly disabled: boolean;

  /** Is separator? */
  readonly separator?: boolean;

  /** Handler when clicked */
  readonly handler?: () => void;

  /** Submenu items (if any) */
  readonly submenu?: ReadonlyArray<ContextMenuItem>;
}

// ============================================================================
// DRAG AND DROP
// ============================================================================

/**
 * Drag State
 *
 * State for drag-and-drop operations.
 */
export interface DragState {
  /** Is dragging? */
  readonly isDragging: boolean;

  /** Item being dragged */
  readonly draggedItem?: DraggedItem;

  /** Current drop target */
  readonly dropTarget?: string;

  /** Is drop valid? */
  readonly isValidDrop: boolean;
}

/**
 * Dragged Item
 */
export interface DraggedItem {
  /** Item type */
  readonly type: string;

  /** Item ID */
  readonly id: string;

  /** Item data */
  readonly data: unknown;

  /** Source container/location */
  readonly source: string;
}
