/**
 * Form Helper Functions
 * Reusable logic for form handling, validation, and FormData building
 */

import { TREE_STATUS, SEX, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES, ACCEPTED_DOCUMENT_TYPES } from "./constants";
import { Strain } from "./types";

// ==========================================
// Form State Types
// ==========================================
export interface TreeFormState {
  strainUuid: string;
  batch_id: number | null;
  variety: string;
  nickname: string;
  plant_date: string;
  germination_date: string;
  growth_stage: string;
  harvest_date: string;
  location: string;
  phenotype: string;
  status: string;
  sex: string;
  genotype: string;
  parent_male: number | null;
  parent_female: number | null;
  clone_source: number | null;
  pollinated_by: number | null;
  pollination_date: string;
  yield_amount: number | null;
  flower_quality: string;
  seed_count: number | null;
  seed_harvest_date: string;
  disease_notes: string;
  document: File | null;
  notes: string;
  generation: string;
}

// ==========================================
// Default Form State
// ==========================================
export const getDefaultFormState = (todayStr?: string): TreeFormState => {
  const today = todayStr || new Date().toISOString().split("T")[0];
  return {
    strainUuid: "",
    batch_id: null,
    variety: "",
    nickname: "",
    plant_date: today,
    germination_date: "",
    growth_stage: "",
    harvest_date: "",
    location: "",
    phenotype: "",
    status: TREE_STATUS.ALIVE,
    sex: SEX.UNKNOWN,
    genotype: "",
    parent_male: null,
    parent_female: null,
    clone_source: null,
    pollinated_by: null,
    pollination_date: "",
    yield_amount: null,
    flower_quality: "",
    seed_count: null,
    seed_harvest_date: "",
    disease_notes: "",
    document: null,
    notes: "",
    generation: "",
  };
};

// ==========================================
// Form Validation
// ==========================================
export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export const validateTreeForm = (form: TreeFormState, strains: Strain[] = []): ValidationResult => {
  if (!form.strainUuid) {
    return { isValid: false, error: "กรุณาเลือกสายพันธุ์" };
  }
  // Check if strain exists
  const isValidStrain = strains.some(s => s.name === form.strainUuid);
  if (!isValidStrain) {
    return { isValid: false, error: "กรุณาเลือกสายพันธุ์ที่มีอยู่ในระบบ" };
  }
  if (!form.status) {
    return { isValid: false, error: "กรุณาเลือกสถานะ" };
  }
  if (!form.sex) {
    return { isValid: false, error: "กรุณาเลือกเพศ" };
  }
  if (!form.plant_date) {
    return { isValid: false, error: "กรุณาเลือกวันที่ปลูก" };
  }
  if (form.yield_amount !== null && form.yield_amount < 0) {
    return { isValid: false, error: "ปริมาณผลผลิตต้องไม่ติดลบ" };
  }
  return { isValid: true, error: "" };
};

// ==========================================
// File Validation
// ==========================================
export interface FileValidationResult {
  isValid: boolean;
  error: string;
  validFiles: File[];
}

export const validateImageFiles = (files: File[]): FileValidationResult => {
  const validFiles: File[] = [];
  let error = "";
  const acceptedTypes = ACCEPTED_IMAGE_TYPES as readonly string[];

  for (const file of files) {
    if (!acceptedTypes.includes(file.type)) {
      error = "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP";
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      error = "ขนาดไฟล์ต้องไม่เกิน 20MB";
      continue;
    }
    validFiles.push(file);
  }

  return {
    isValid: validFiles.length === files.length,
    error,
    validFiles,
  };
};

export const validateDocumentFile = (file: File): ValidationResult => {
  const acceptedTypes = ACCEPTED_DOCUMENT_TYPES as readonly string[];
  if (!acceptedTypes.includes(file.type)) {
    return { isValid: false, error: "เอกสารต้องเป็น PDF หรือภาพ JPG, PNG, WEBP" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "ขนาดเอกสารต้องไม่เกิน 20MB" };
  }
  return { isValid: true, error: "" };
};

// ==========================================
// FormData Builder
// ==========================================
const NUMBER_FIELDS = [
  "parent_male",
  "parent_female",
  "clone_source",
  "pollinated_by",
  "yield_amount",
  "seed_count",
];

const DATE_FIELDS = [
  "germination_date",
  "harvest_date",
  "pollination_date",
  "seed_harvest_date",
  "plant_date",
];

export const buildTreeFormData = (
  form: TreeFormState,
  imageFiles: File[],
  strains: Strain[] = []
): FormData => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(form)) {
    if (key === "strainUuid") {
      // Lookup strain ID from name
      const strain = strains.find((s) => s.name === value);
      formData.append("strain_id", strain ? String(strain.id) : "");
    } else if (key === "batch_id") {
      formData.append("batch_id", value === null || value === "" ? "" : String(value));
    } else if (key === "document") {
      // Document is handled separately with image files
      if (value === null) {
        formData.append("document", "");
      } else if (value instanceof File) {
        formData.append("document", value);
      }
    } else if (NUMBER_FIELDS.includes(key)) {
      formData.append(key, value === null || value === "" ? "" : String(value));
    } else if (DATE_FIELDS.includes(key)) {
      formData.append(key, value === null || value === "" ? "" : String(value));
    } else {
      formData.append(key, value === null ? "" : String(value));
    }
  }

  // Append image files
  imageFiles.forEach((file) => {
    formData.append("uploaded_images", file);
  });

  return formData;
};

// ==========================================
// Date Helpers
// ==========================================
export const getTodayString = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const formatDateThai = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("th-TH");
  } catch {
    return "-";
  }
};

// ==========================================
// Object URL Management (Memory Leak Prevention)
// ==========================================
export class ObjectURLManager {
  private urls: Set<string> = new Set();

  create(file: File): string {
    const url = URL.createObjectURL(file);
    this.urls.add(url);
    return url;
  }

  revoke(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  revokeAll(): void {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }

  getCount(): number {
    return this.urls.size;
  }
}
