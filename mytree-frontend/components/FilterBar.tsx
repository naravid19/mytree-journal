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
        <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === "table"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            aria-label="Table View"
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-md transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            aria-label="Grid View"
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
