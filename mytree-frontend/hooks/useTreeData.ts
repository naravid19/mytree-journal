import { useState, useEffect, useCallback } from "react";
import { Tree, Strain, Batch } from "../app/types";
import { treeService } from "../services/treeService";

export const useTreeData = () => {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [treesData, strainsData, batchesData] = await Promise.all([
        treeService.getTrees(),
        treeService.getStrains(),
        treeService.getBatches(),
      ]);

      // Sort trees by ID descending (newest first) by default
      const sortedTrees = Array.isArray(treesData) 
        ? treesData.sort((a, b) => b.id - a.id) 
        : [];
        
      setTrees(sortedTrees);
      setStrains(Array.isArray(strainsData) ? strainsData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
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
    } catch (err: any) {
      console.error("Error refreshing trees:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
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
