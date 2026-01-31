/**
 * Tree Service - API client for tree-related operations
 * Handles all HTTP requests to the backend API
 */

import { getApiBaseUrl } from '../app/constants';
import { Tree, Strain, Batch, TreeLog } from '../app/types';

// =============================================================================
// Constants
// =============================================================================

const API_BASE = getApiBaseUrl();

/** API endpoint paths */
const ENDPOINTS = {
  TREES: '/api/trees/',
  STRAINS: '/api/strains/',
  BATCHES: '/api/batches/',
  LOGS: '/api/logs/',
  TREE_IMAGES: '/api/tree-images/',
} as const;

// =============================================================================
// Types
// =============================================================================

/**
 * Custom API error with status code and message
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Tree service interface for dependency injection
 */
export interface TreeService {
  // Tree CRUD
  getTrees: () => Promise<Tree[]>;
  getTree: (id: string | number) => Promise<Tree>;
  createTree: (formData: FormData) => Promise<Tree>;
  updateTree: (id: number, formData: FormData) => Promise<Tree>;
  deleteTree: (id: number) => Promise<void>;
  bulkDeleteTrees: (ids: number[]) => Promise<void>;

  // Reference data
  getStrains: () => Promise<Strain[]>;
  getBatches: () => Promise<Batch[]>;

  // Tree images & documents
  deleteTreeImage: (id: number) => Promise<void>;
  deleteAllTreeImages: (treeId: number) => Promise<void>;
  deleteTreeDocument: (treeId: number) => Promise<void>;

  // Logs
  getLogs: (treeId: number) => Promise<TreeLog[]>;
  createLog: (formData: FormData) => Promise<TreeLog>;
  deleteLog: (id: number) => Promise<void>;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Parse error response and extract message
 */
const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorText = await response.text();
  
  if (!errorText) {
    return `Error ${response.status}: ${response.statusText}`;
  }

  try {
    const errorJson = JSON.parse(errorText);
    return errorJson.message || errorJson.error || errorJson.detail || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}: ${errorText}`;
  }
};

/**
 * Handle fetch response with proper error handling
 * @throws {ApiError} When response is not ok
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(response.status, message);
  }

  // DELETE operations return 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
};

/**
 * Build full URL from endpoint
 */
const buildUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const url = `${API_BASE}${endpoint}`;
  
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${url}?${searchParams.toString()}`;
};

// =============================================================================
// Service Implementation
// =============================================================================

export const treeService: TreeService = {
  // ---------------------------------------------------------------------------
  // Tree CRUD Operations
  // ---------------------------------------------------------------------------

  /**
   * Get all trees
   */
  getTrees: async () => {
    const response = await fetch(buildUrl(ENDPOINTS.TREES));
    return handleResponse<Tree[]>(response);
  },

  /**
   * Get a single tree by ID
   */
  getTree: async (id) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}${id}/`));
    return handleResponse<Tree>(response);
  },

  /**
   * Create a new tree
   */
  createTree: async (formData) => {
    const response = await fetch(buildUrl(ENDPOINTS.TREES), {
      method: 'POST',
      body: formData,
    });
    return handleResponse<Tree>(response);
  },

  /**
   * Update an existing tree
   */
  updateTree: async (id, formData) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}${id}/`), {
      method: 'PUT',
      body: formData,
    });
    return handleResponse<Tree>(response);
  },

  /**
   * Delete a tree by ID
   */
  deleteTree: async (id) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}${id}/`), {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  /**
   * Delete multiple trees at once
   */
  bulkDeleteTrees: async (ids) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}bulk_delete/`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return handleResponse<void>(response);
  },

  // ---------------------------------------------------------------------------
  // Reference Data
  // ---------------------------------------------------------------------------

  /**
   * Get all strains
   */
  getStrains: async () => {
    const response = await fetch(buildUrl(ENDPOINTS.STRAINS));
    return handleResponse<Strain[]>(response);
  },

  /**
   * Get all batches
   */
  getBatches: async () => {
    const response = await fetch(buildUrl(ENDPOINTS.BATCHES));
    return handleResponse<Batch[]>(response);
  },

  // ---------------------------------------------------------------------------
  // Tree Images & Documents
  // ---------------------------------------------------------------------------

  /**
   * Delete a single tree image
   */
  deleteTreeImage: async (id) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREE_IMAGES}${id}/`), {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  /**
   * Delete all images for a tree
   */
  deleteAllTreeImages: async (treeId) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}${treeId}/delete_all_images/`), {
      method: 'POST',
    });
    return handleResponse<void>(response);
  },

  /**
   * Delete the document attached to a tree
   */
  deleteTreeDocument: async (treeId) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.TREES}${treeId}/delete_document/`), {
      method: 'POST',
    });
    return handleResponse<void>(response);
  },

  // ---------------------------------------------------------------------------
  // Log Operations
  // ---------------------------------------------------------------------------

  /**
   * Get all logs for a tree
   */
  getLogs: async (treeId) => {
    const response = await fetch(buildUrl(ENDPOINTS.LOGS, { tree: treeId }));
    return handleResponse<TreeLog[]>(response);
  },

  /**
   * Create a new log entry
   */
  createLog: async (formData) => {
    const response = await fetch(buildUrl(ENDPOINTS.LOGS), {
      method: 'POST',
      body: formData,
    });
    return handleResponse<TreeLog>(response);
  },

  /**
   * Delete a log entry
   */
  deleteLog: async (id) => {
    const response = await fetch(buildUrl(`${ENDPOINTS.LOGS}${id}/`), {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};

