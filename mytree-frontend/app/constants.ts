/**
 * Application Constants
 * Centralized constants for status, sex values, and file validation
 */

// ==========================================
// Tree Status Constants
// ==========================================
export const TREE_STATUS = {
  ALIVE: "มีชีวิต",
  DEAD: "ตายแล้ว",
  MOVED: "ถูกย้าย",
  OTHER: "อื่นๆ",
} as const;

export type TreeStatusValue = typeof TREE_STATUS[keyof typeof TREE_STATUS];

export const TREE_STATUS_OPTIONS = [
  { value: TREE_STATUS.ALIVE, label: "มีชีวิต" },
  { value: TREE_STATUS.DEAD, label: "ตายแล้ว" },
  { value: TREE_STATUS.MOVED, label: "ถูกย้าย" },
  { value: TREE_STATUS.OTHER, label: "อื่นๆ" },
] as const;

// ==========================================
// Sex Constants
// ==========================================
export const SEX = {
  BISEXUAL: "bisexual",
  MALE: "male",
  FEMALE: "female",
  MONOECIOUS: "monoecious",
  MIXED: "mixed",
  UNKNOWN: "unknown",
} as const;

export type SexValue = typeof SEX[keyof typeof SEX];

export const SEX_OPTIONS = [
  { value: SEX.BISEXUAL, label: "สมบูรณ์เพศ" },
  { value: SEX.MALE, label: "ตัวผู้" },
  { value: SEX.FEMALE, label: "ตัวเมีย" },
  { value: SEX.MONOECIOUS, label: "แยกเพศในต้นเดียวกัน" },
  { value: SEX.MIXED, label: "ผสมหลายเพศ" },
  { value: SEX.UNKNOWN, label: "ไม่ระบุ/ไม่แน่ใจ" },
] as const;

export const SEX_LABELS: Record<string, string> = {
  [SEX.BISEXUAL]: "สมบูรณ์เพศ",
  [SEX.MALE]: "ตัวผู้",
  [SEX.FEMALE]: "ตัวเมีย",
  [SEX.MONOECIOUS]: "แยกเพศในต้นเดียวกัน",
  [SEX.MIXED]: "ผสมหลายเพศ",
  [SEX.UNKNOWN]: "ไม่ระบุ/ไม่แน่ใจ",
};

// Badge colors for sex types
export const SEX_BADGE_COLORS: Record<string, string> = {
  [SEX.MALE]: "info",
  [SEX.FEMALE]: "pink",
  [SEX.BISEXUAL]: "success",
  [SEX.MIXED]: "warning",
  [SEX.MONOECIOUS]: "blue",
  [SEX.UNKNOWN]: "gray",
};

// ==========================================
// Growth Stage Constants
// ==========================================
export const GROWTH_STAGES = {
  SEEDLING: "Seedling",
  VEGETATIVE: "Vegetative",
  FLOWERING: "Flowering",
  HARVESTED: "Harvested",
  CURING: "Curing",
  DRIED: "Dried",
} as const;

export const GROWTH_STAGE_OPTIONS = [
  { value: GROWTH_STAGES.SEEDLING, label: "Seedling (ต้นกล้า)" },
  { value: GROWTH_STAGES.VEGETATIVE, label: "Vegetative (ทำใบ)" },
  { value: GROWTH_STAGES.FLOWERING, label: "Flowering (ทำดอก)" },
  { value: GROWTH_STAGES.HARVESTED, label: "Harvested (เก็บเกี่ยวแล้ว)" },
  { value: GROWTH_STAGES.CURING, label: "Curing (บ่ม)" },
  { value: GROWTH_STAGES.DRIED, label: "Dried (แห้ง)" },
] as const;

// ==========================================
// File Upload Constants
// ==========================================
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
] as const;

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  ...ACCEPTED_IMAGE_TYPES,
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.webp";
export const ACCEPTED_DOCUMENT_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";

// ==========================================
// Pagination Constants
// ==========================================
export const DEFAULT_ITEMS_PER_PAGE = 20;

// ==========================================
// API Configuration
// ==========================================
export const getApiBaseUrl = () => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000";
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
};

// ==========================================
// Toast/Notification Timeouts
// ==========================================
export const TOAST_DURATION = 3000; // 3 seconds
export const DEBOUNCE_DELAY = 350; // milliseconds

// ==========================================
// Z-Index Layers (for consistent stacking)
// ==========================================
export const Z_INDEX = {
  STICKY_HEADER: 40,
  MODAL_BACKDROP: 100,
  MODAL: 200,
  TOAST: 300,
  LIGHTBOX: 400,
  UPLOADING_OVERLAY: 500,
} as const;
