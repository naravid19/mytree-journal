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
    <div className="flex flex-col gap-3 p-3 bg-white rounded-2xl shadow-lg md:flex-row md:items-center md:justify-between md:p-4 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto flex-1">
        <div className="relative w-full sm:max-w-md group">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <HiSearch className="w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block p-2.5 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 transition-all shadow-sm hover:bg-white dark:hover:bg-gray-600"
            placeholder="ค้นหาชื่อ, สายพันธุ์, หรือสถานที่..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-center p-1 bg-gray-100 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-inner w-full sm:w-auto">
          <button
            onClick={() => onViewModeChange("table")}
            className={`flex-1 sm:flex-none justify-center p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              viewMode === "table"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400 transform scale-105 font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            aria-label="Table View"
          >
            <HiViewList className="w-5 h-5" />
            <span className="text-xs">List</span>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`flex-1 sm:flex-none justify-center p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              viewMode === "grid"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400 transform scale-105 font-medium"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            aria-label="Grid View"
          >
            <HiViewGrid className="w-5 h-5" />
            <span className="text-xs">Grid</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center justify-end h-10 min-w-fit">
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              เลือก {selectedCount} รายการ
            </span>
            <Button color="failure" size="sm" onClick={onBulkDelete} disabled={loading} className="shadow-sm hover:shadow transition-all">
              ลบที่เลือก
            </Button>
            <Button color="light" size="sm" onClick={onClearSelection} disabled={loading} className="border-gray-300 dark:border-gray-600">
              ยกเลิก
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
