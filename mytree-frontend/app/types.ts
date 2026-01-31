/**
 * MyTree Journal - Type Definitions
 * Central type definitions for the application
 */

// =============================================================================
// Base Types
// =============================================================================

/** Common fields for entities with timestamps */
interface BaseEntity {
  id: number;
  created_at: string;
}

/** Entity with update tracking */
interface TimestampedEntity extends BaseEntity {
  updated_at: string;
}

// =============================================================================
// Media Types
// =============================================================================

/**
 * Image attachment with thumbnail support
 */
export interface Image {
  id: number;
  /** Full-size image URL */
  image: string;
  /** Thumbnail URL for previews */
  thumbnail: string;
  /** ISO date string of upload time */
  uploaded_at: string;
  /** Whether this is the cover/primary image */
  is_cover?: boolean;
}

// =============================================================================
// Reference Types
// =============================================================================

/**
 * Plant strain/genetics information
 */
export interface Strain {
  id: number;
  name: string;
  description: string;
}

/**
 * Batch/grow cycle information
 */
export interface Batch {
  id: number;
  batch_code: string;
  description: string;
  /** ISO date string for batch start */
  started_date: string;
}

/**
 * Minimal parent reference for tree lineage
 */
export interface TreeParentRef {
  id: number;
  nickname: string;
}

// =============================================================================
// Enum-like Types
// =============================================================================

/**
 * Biological sex classification for plants
 */
export type SexType =
  | 'bisexual'   // Perfect flowers (both organs)
  | 'male'       // Pollen producer
  | 'female'     // Seed/flower producer
  | 'monoecious' // Both sexes on same plant
  | 'mixed'      // Multiple sex expressions
  | 'unknown';   // Not yet determined

/**
 * Tree lifecycle status
 */
export type TreeStatus =
  | 'กำลังปลูก'  // Growing/Active
  | 'มีชีวิต'    // Alive
  | 'ตายแล้ว'    // Dead
  | 'เก็บเกี่ยว' // Harvested
  | 'Dry'        // Drying
  | 'Cure';      // Curing

/**
 * Growth stages for plant development
 */
export type GrowthStage =
  | 'seedling'
  | 'vegetative'
  | 'flowering'
  | 'harvest'
  | 'drying'
  | 'curing';

/**
 * Log entry action types
 */
export type LogActionType =
  | 'water'       // Watering
  | 'feed'        // Nutrient feeding
  | 'flush'       // Flushing
  | 'prune'       // Pruning/trimming
  | 'train'       // Training (LST, HST, etc.)
  | 'flip'        // Light cycle change
  | 'harvest'     // Harvest action
  | 'dry'         // Drying process
  | 'cure'        // Curing process
  | 'note'        // General note
  | 'photo'       // Photo documentation
  | 'issue'       // Problem/issue report
  | 'environment' // Environment changes
  | 'other';      // Other actions

// =============================================================================
// Log Types
// =============================================================================

/**
 * Environment measurements for logging
 */
export interface EnvironmentData {
  /** pH level (0-14) */
  ph?: number;
  /** EC/PPM measurement */
  ec?: number;
  /** Temperature in Celsius */
  temp?: number;
  /** Relative humidity percentage (0-100) */
  humidity?: number;
}

/**
 * Harvest weight measurements
 */
export interface HarvestWeights {
  /** Wet weight in grams */
  wet_weight?: number;
  /** Dry weight in grams */
  dry_weight?: number;
  /** Trim weight in grams */
  trim_weight?: number;
}

/**
 * Tree activity log entry
 */
export interface TreeLog extends EnvironmentData, HarvestWeights {
  id: number;
  /** Reference to parent tree ID */
  tree: number;
  /** Date of the action (ISO string) */
  action_date: string;
  /** Type of action performed */
  action_type: LogActionType;
  /** Optional title for the log entry */
  title?: string;
  /** Detailed notes */
  notes?: string;
  /** When this log was created */
  created_at: string;
  /** Attached images */
  images: Image[];
}

// =============================================================================
// Tree Types
// =============================================================================

/**
 * Lineage/parentage information
 */
export interface TreeLineage {
  /** Father plant ID */
  parent_male: number | null;
  /** Mother plant ID */
  parent_female: number | null;
  /** Expanded father data */
  parent_male_data?: TreeParentRef | null;
  /** Expanded mother data */
  parent_female_data?: TreeParentRef | null;
  /** If cloned, source tree ID */
  clone_source: number | null;
  /** Generation number (F1, F2, etc.) */
  generation?: string;
}

/**
 * Pollination and seed production data
 */
export interface PollinationData {
  /** Date of pollination (ISO string) */
  pollination_date: string;
  /** ID of male plant used for pollination */
  pollinated_by: number | null;
  /** Number of seeds produced */
  seed_count: number | null;
  /** Date seeds were harvested (ISO string) */
  seed_harvest_date: string;
}

/**
 * Harvest and quality data
 */
export interface HarvestData {
  /** Total yield in grams */
  yield_amount: number | null;
  /** Quality rating/notes */
  flower_quality: string;
}

/**
 * Complete tree entity with all attributes
 */
export interface Tree extends TimestampedEntity, TreeLineage, PollinationData, HarvestData {
  /** Display name for the tree */
  nickname: string;
  /** Strain/genetics reference */
  strain: Strain | null;
  /** Variety name (sub-strain) */
  variety: string;
  /** Batch/grow cycle reference */
  batch: Batch | null;
  /** Physical location */
  location: string;
  /** Current lifecycle status */
  status: string; // Could be TreeStatus but API returns string
  /** Germination date (ISO string) */
  germination_date: string;
  /** Planting date (ISO string) */
  plant_date: string;
  /** Current growth stage */
  growth_stage: string; // Could be GrowthStage but API returns string
  /** Harvest date (ISO string) */
  harvest_date: string;
  /** Plant sex */
  sex: SexType;
  /** Genetic information */
  genotype: string;
  /** Physical characteristics */
  phenotype: string;
  /** Health/disease notes */
  disease_notes: string;
  /** Attached document URL */
  document: string | null;
  /** Tree images */
  images: Image[];
  /** General notes */
  notes: string;
  /** Unique tree code */
  code?: string;
  /** Most recent log entry */
  latest_log?: TreeLog;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Tree creation/update payload (without server-generated fields)
 */
export type TreeInput = Omit<Tree, 'id' | 'created_at' | 'updated_at' | 'images' | 'latest_log' | 'parent_male_data' | 'parent_female_data'>;

/**
 * Tree list item (minimal data for grids/lists)
 */
export type TreeListItem = Pick<Tree, 'id' | 'nickname' | 'strain' | 'status' | 'sex' | 'plant_date' | 'location' | 'images' | 'growth_stage'>;

/**
 * Log creation payload
 */
export type TreeLogInput = Omit<TreeLog, 'id' | 'created_at' | 'images'> & {
  images?: File[];
};

