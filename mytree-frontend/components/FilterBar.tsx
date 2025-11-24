import React from "react";
import { TextInput, Button } from "flowbite-react";
import { HiSearch, HiViewGrid, HiViewList } from "react-icons/hi";

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  loading: boolean;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedCount,
  onBulkDelete,
  onClearSelection,
  loading,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2 items-center">
        <TextInput
          id="search"
          type="search"
          icon={HiSearch}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาต้นไม้..."
          className="w-full max-w-xs"
          autoComplete="off"
          disabled={loading}
        />
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-2 ${viewMode === "table" ? "bg-green-100 text-green-700" : "bg-white text-gray-500"}`}
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-green-100 text-green-700" : "bg-white text-gray-500"}`}
          >
            <HiViewGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center h-10">
        {selectedCount > 0 && (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-200">
              เลือก {selectedCount} รายการ
            </span>
            <Button color="red" size="sm" onClick={onBulkDelete} disabled={loading}>
              ลบรายการที่เลือก
            </Button>
            <Button color="gray" size="sm" onClick={onClearSelection} disabled={loading}>
              ยกเลิก
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
