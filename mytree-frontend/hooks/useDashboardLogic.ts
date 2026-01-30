
import { useState, useMemo } from "react";
import { Tree } from "../app/types";
import { useDebouncedSearch } from "../app/hooks";
import { treeService } from "../services/treeService";

export const useDashboardLogic = (
  trees: Tree[], 
  refreshTrees: () => Promise<void>,
  setSuccessMessage: (msg: string) => void,
  setErrorMessage: (msg: string) => void
) => {
  // UI State
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search, 300);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Sorting State
  const [sortKey, setSortKey] = useState<keyof Tree | "strain">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [ageUnit, setAgeUnit] = useState<"day" | "month" | "year">("day");

  // Loading State for actions
  const [deleting, setDeleting] = useState(false);

  // Filter & Sort Logic
  const filteredTrees = useMemo(() => {
    let result = trees;

    // Filter
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.strain?.name.toLowerCase().includes(lowerSearch) ||
          t.nickname?.toLowerCase().includes(lowerSearch) ||
          t.location?.toLowerCase().includes(lowerSearch) ||
          t.batch?.batch_code.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortKey === "strain") {
          valA = a.strain?.name || "";
          valB = b.strain?.name || "";
        } else if (sortKey === "plant_date") {
           valA = a.plant_date ? new Date(a.plant_date).getTime() : 0;
           valB = b.plant_date ? new Date(b.plant_date).getTime() : 0;
        } else {
           const key = sortKey as keyof Tree;
           const vA = a[key];
           const vB = b[key];
           if (typeof vA === 'string' || typeof vA === 'number') valA = vA;
           if (typeof vB === 'string' || typeof vB === 'number') valB = vB;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [trees, debouncedSearch, sortKey, sortOrder]);

  // Handlers
  const handleSort = (key: keyof Tree | "strain") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (checked: boolean, ids: number[]) => {
    if (checked) {
      const newIds = ids.filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...newIds]);
    } else {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`คุณต้องการลบ ${selectedIds.length} รายการที่เลือกใช่หรือไม่?`)) return;

    try {
      await treeService.bulkDeleteTrees(selectedIds);
      await refreshTrees();
      setSelectedIds([]);
      setSuccessMessage(`ลบ ${selectedIds.length} รายการสำเร็จ`);
    } catch (err: any) {
      setErrorMessage(err.message || "ลบข้อมูลหลายรายการไม่สำเร็จ");
    }
  };

  return {
    viewMode, setViewMode,
    search, setSearch,
    selectedIds, setSelectedIds,
    sortKey, setSortKey,
    sortOrder, setSortOrder,
    ageUnit, setAgeUnit,
    deleting, setDeleting,
    filteredTrees,
    handleSort,
    handleSelect,
    handleSelectAll,
    handleBulkDelete
  };
};
