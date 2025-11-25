import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, ButtonGroup, Button } from "flowbite-react";
import { Tree } from "../app/types";
import Image from "next/image";

interface TreeTableProps {
  trees: Tree[];
  loading: boolean;
  selectedIds: number[];
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean, ids: number[]) => void;
  sortKey: string | null;
  sortOrder: "asc" | "desc";
  onSort: (key: string) => void;
  onRowClick: (tree: Tree) => void;
  ageUnit: "day" | "month" | "year";
  setAgeUnit: (unit: "day" | "month" | "year") => void;
  calcAge: (tree: Tree, unit: "day" | "month" | "year") => string;
}

export const TreeTable: React.FC<TreeTableProps> = ({
  trees,
  loading,
  selectedIds,
  onSelect,
  onSelectAll,
  sortKey,
  sortOrder,
  onSort,
  onRowClick,
  ageUnit,
  setAgeUnit,
  calcAge,
}) => {
  const SkeletonRow = () => (
    <TableRow>
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}>
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  );

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? "▲" : "▼";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg dark:border-gray-700">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <Table hoverable className="min-w-[800px] text-base font-kanit dark:bg-gray-800 dark:text-gray-100">
          <TableHead className="bg-linear-to-r from-green-50 to-blue-50 text-gray-700 uppercase dark:from-gray-700 dark:to-gray-800 dark:text-gray-200">
            <TableRow className="border-b border-gray-200 dark:border-gray-600">
              <TableHeadCell className="p-4 w-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={trees.length > 0 && trees.every((tree) => selectedIds.includes(tree.id))}
                  onChange={(e) => onSelectAll(e.target.checked, trees.map((t) => t.id))}
                  aria-label="เลือกต้นไม้ทั้งหมดในหน้านี้"
                />
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("strain")}
              >
                สายพันธุ์ {renderSortIcon("strain")}
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("variety")}
              >
                พันธุ์ {renderSortIcon("variety")}
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("nickname")}
              >
                ชื่อเล่น {renderSortIcon("nickname")}
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("sex")}
              >
                เพศ {renderSortIcon("sex")}
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("plant_date")}
              >
                <div className="flex gap-3 items-center">
                  <span className="flex gap-1 items-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                    </svg>
                    <span>อายุ {renderSortIcon("plant_date")}</span>
                  </span>
                  <ButtonGroup className="shadow-sm">
                    {(["day", "month", "year"] as const).map((unit) => (
                      <Button
                        key={unit}
                        color={ageUnit === unit ? "success" : "gray"}
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAgeUnit(unit);
                        }}
                        className={`transition-all font-kanit ${ageUnit === unit ? "font-bold ring-1 ring-green-500" : "hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                      >
                        {unit === "day" ? "วัน" : unit === "month" ? "เดือน" : "ปี"}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </TableHeadCell>
              <TableHeadCell
                className="py-4 px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors"
                onClick={() => onSort("status")}
              >
                สถานะ {renderSortIcon("status")}
              </TableHeadCell>
              <TableHeadCell className="py-4 px-6 font-bold">รูป</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : trees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-gray-400 bg-white dark:bg-gray-800">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">🌱</span>
                    <span className="text-lg font-medium">ยังไม่มีข้อมูลต้นไม้</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              trees.map((tree) => (
                <TableRow
                  key={tree.id}
                  className="bg-white dark:bg-gray-800 transition-colors duration-200 cursor-pointer hover:bg-green-50/50 dark:hover:bg-gray-700/50"
                  onClick={() => onRowClick(tree)}
                >
                  <TableCell className="p-4 w-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectedIds.includes(tree.id)}
                      onChange={(e) => onSelect(tree.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tree.strain?.name || "-"}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tree.variety}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{tree.nickname}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      className="w-fit shadow-sm"
                      color={
                        tree.sex === "male" ? "info"
                        : tree.sex === "female" ? "pink"
                        : tree.sex === "bisexual" ? "success"
                        : tree.sex === "mixed" ? "warning"
                        : tree.sex === "monoecious" ? "blue"
                        : "gray"
                      }
                    >
                      {{
                        "bisexual": "สมบูรณ์เพศ",
                        "male": "ตัวผู้",
                        "female": "ตัวเมีย",
                        "monoecious": "แยกเพศในต้นเดียวกัน",
                        "mixed": "ผสมหลายเพศ",
                        "unknown": "ไม่ระบุ/ไม่แน่ใจ"
                      }[tree.sex] || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">{calcAge(tree, ageUnit)}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      className="w-fit shadow-sm"
                      color={
                        tree.status === "มีชีวิต" ? "success"
                        : tree.status === "ตายแล้ว" ? "failure"
                        : tree.status === "ถูกย้าย" ? "warning"
                        : "gray"
                      }
                    >
                      {tree.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {tree.images && tree.images.length > 0 ? (
                      <div className="flex -space-x-3 group transition-all duration-300">
                        {tree.images.slice(0, 3).map((img, idx) => (
                          <div
                            key={img.id}
                            className={`relative z-0 hover:z-10 transition-transform duration-300 ${
                              idx === 1 ? "group-hover:translate-x-4" : idx === 2 ? "group-hover:translate-x-8" : ""
                            }`}
                          >
                            <Image
                              src={img.thumbnail || img.image}
                              alt={`รูปที่ ${idx + 1}`}
                              width={40}
                              height={40}
                              className="object-cover w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 dark:border-gray-700"
                            />
                          </div>
                        ))}
                        {tree.images.length > 3 && (
                          <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-400 rounded-full border-2 border-white dark:border-gray-700 z-0 transition-transform duration-300 group-hover:translate-x-12">
                            +{tree.images.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">ไม่มีรูป</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
