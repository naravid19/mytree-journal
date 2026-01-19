
import { getApiBaseUrl } from "../app/constants";
import { Tree, Strain, Batch } from "../app/types";

const API_BASE = getApiBaseUrl();

export interface TreeService {
  getTrees: () => Promise<Tree[]>;
  getStrains: () => Promise<Strain[]>;
  getBatches: () => Promise<Batch[]>;
  getTree: (id: string | number) => Promise<Tree>;
  createTree: (formData: FormData) => Promise<Tree>;
  updateTree: (id: number, formData: FormData) => Promise<Tree>;
  deleteTree: (id: number) => Promise<void>;
  bulkDeleteTrees: (ids: number[]) => Promise<void>;
  deleteTreeImage: (id: number) => Promise<void>;
  deleteAllTreeImages: (treeId: number) => Promise<void>;
  deleteTreeDocument: (treeId: number) => Promise<void>;
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || errorJson.error || `Error ${res.status}: ${res.statusText}`);
    } catch (e: any) {
      throw new Error(`Error ${res.status}: ${errorText || res.statusText}`);
    }
  }
  // Delete operations returns 204 No Content
  if (res.status === 204) return null;
  return res.json();
};

export const treeService: TreeService = {
  getTrees: async () => {
    const res = await fetch(`${API_BASE}/api/trees/`);
    return handleResponse(res);
  },

  getStrains: async () => {
    const res = await fetch(`${API_BASE}/api/strains/`);
    return handleResponse(res);
  },

  getBatches: async () => {
    const res = await fetch(`${API_BASE}/api/batches/`);
    return handleResponse(res);
  },

  getTree: async (id) => {
    const res = await fetch(`${API_BASE}/api/trees/${id}/`);
    return handleResponse(res);
  },

  createTree: async (formData) => {
    const res = await fetch(`${API_BASE}/api/trees/`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  updateTree: async (id, formData) => {
    const res = await fetch(`${API_BASE}/api/trees/${id}/`, {
      method: "PUT",
      body: formData,
    });
    return handleResponse(res);
  },

  deleteTree: async (id) => {
    const res = await fetch(`${API_BASE}/api/trees/${id}/`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  bulkDeleteTrees: async (ids) => {
    const res = await fetch(`${API_BASE}/api/trees/bulk_delete/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
  },

  deleteTreeImage: async (id) => {
    const res = await fetch(`${API_BASE}/api/tree-images/${id}/`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  deleteAllTreeImages: async (treeId) => {
    // Note: Assuming endpoint exists or handling via loop if strictly following current backend
    // Based on previous code, page.tsx was calling deleteTreeImage in a loop or similar.
    // If there's no dedicated endpoint, we might need to adjust.
    // However, for Pro code, we should have a bulk delete or clear endpoint.
    // Checking `page.tsx` again, `handleDeleteAllImages` calls `${API_BASE}/api/trees/${selectedTree.id}/delete_all_images/`
    const res = await fetch(`${API_BASE}/api/trees/${treeId}/delete_all_images/`, {
      method: "POST", // or DELETE depending on backend implementation, usually custom actions are POST
    });
    return handleResponse(res);
  },
  
  deleteTreeDocument: async (treeId) => {
     // Based on page.tsx: `${API_BASE}/api/trees/${selectedTree.id}/delete_document/`
    const res = await fetch(`${API_BASE}/api/trees/${treeId}/delete_document/`, {
      method: "POST", // or DELETE
    });
    return handleResponse(res);
  }
};
