/**
 * Tree Status Constants
 * Centralized status strings to avoid magic strings throughout the codebase
 */

export const TREE_STATUS = {
  GROWING: 'กำลังปลูก',
  ALIVE: 'มีชีวิต',
  HARVESTED: 'เก็บเกี่ยว',
  DRY: 'Dry',
  CURE: 'Cure',
} as const;

export const GROWTH_STAGE = {
  SEEDLING: 'seedling',
  VEGETATIVE: 'veg',
  FLOWERING: 'flower',
} as const;

export type TreeStatusType = typeof TREE_STATUS[keyof typeof TREE_STATUS];
export type GrowthStageType = typeof GROWTH_STAGE[keyof typeof GROWTH_STAGE];

/**
 * Check if tree is in active/growing state
 */
export const isTreeActive = (status: string): boolean => {
  return status === TREE_STATUS.GROWING || status === TREE_STATUS.ALIVE;
};

/**
 * Check if tree is harvested
 */
export const isTreeHarvested = (status: string): boolean => {
  return (
    status.includes(TREE_STATUS.HARVESTED) ||
    status.includes(TREE_STATUS.DRY) ||
    status.includes(TREE_STATUS.CURE)
  );
};

/**
 * Check if tree is in flowering stage
 */
export const isFlowering = (growthStage: string | undefined): boolean => {
  return growthStage?.toLowerCase().includes(GROWTH_STAGE.FLOWERING) ?? false;
};

/**
 * Check if tree is in vegetative stage
 */
export const isVegetative = (growthStage: string | undefined): boolean => {
  const stage = growthStage?.toLowerCase() ?? '';
  return stage.includes(GROWTH_STAGE.VEGETATIVE) || stage.includes(GROWTH_STAGE.SEEDLING);
};
