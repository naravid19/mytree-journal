import { useState, useEffect, useCallback } from "react";
import { Tree, Strain, Batch } from "../app/types";
import { treeService } from "../services/treeService";

export const useTreeData = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      // Create individual fetch promises with abort support
      const fetchWithSignal = async <T,>(fetcher: () => Promise<T>): Promise<T> => {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        return fetcher();
      };
      
      const [treesData, strainsData, batchesData] = await Promise.all([
        fetchWithSignal(() => treeService.getTrees()),
        fetchWithSignal(() => treeService.getStrains()),
        fetchWithSignal(() => treeService.getBatches()),
      ]);

      // Check if aborted before setting state
      if (signal?.aborted) return;

      // Sort trees by ID descending (newest first) by default
      const sortedTrees = Array.isArray(treesData) 
        ? treesData.sort((a, b) => b.id - a.id) 
        : [];
        
      setTrees(sortedTrees);
      setStrains(Array.isArray(strainsData) ? strainsData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setError(null);
    } catch (err: unknown) {
      // Ignore abort errors
      if (err instanceof DOMException && err.name === 'AbortError') return;
      
      const message = err instanceof Error ? err.message : "Failed to load data";
      console.error("Error fetching data:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTrees = useCallback(async () => {
    try {
      const treesData = await treeService.getTrees();
      const sortedTrees = Array.isArray(treesData) 
        ? treesData.sort((a, b) => b.id - a.id) 
        : [];
      setTrees(sortedTrees);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error refreshing trees";
      console.error("Error refreshing trees:", message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    
    // Cleanup: abort fetch on unmount
    return () => controller.abort();
  }, [fetchData]);

  return {
    trees,
    strains,
    batches,
    loading,
    error,
    refreshTrees,
    fetchData,
    setTrees, // Expose setter if optimistic updates are needed
  };
};
