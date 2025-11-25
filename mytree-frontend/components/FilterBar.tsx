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
    <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl shadow-lg sm:flex-row sm:items-center sm:justify-between dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-1 gap-3 items-center w-full">
        <div className="relative w-full sm:max-w-md">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <HiSearch className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block p-2.5 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500 transition-all shadow-sm hover:bg-white dark:hover:bg-gray-600"
            placeholder="ค้นหาชื่อ, สายพันธุ์, หรือสถานที่..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-inner">
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === "table"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400 transform scale-105"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            aria-label="Table View"
          >
            <HiViewList className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400 transform scale-105"
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
