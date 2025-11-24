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
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <Table hoverable className="min-w-[650px] text-base md:text-lg font-kanit dark:bg-gray-900/80 dark:text-gray-100">
        <TableHead className="bg-green-50 dark:bg-gray-800/80 dark:text-gray-100">
          <TableRow>
            <TableHeadCell>
              <input
                type="checkbox"
                checked={trees.length > 0 && trees.every((tree) => selectedIds.includes(tree.id))}
                onChange={(e) => onSelectAll(e.target.checked, trees.map((t) => t.id))}
                aria-label="เลือกต้นไม้ทั้งหมดในหน้านี้"
              />
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg dark:text-gray-100"
              onClick={() => onSort("strain")}
            >
              สายพันธุ์ {renderSortIcon("strain")}
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
              onClick={() => onSort("variety")}
            >
              พันธุ์ {renderSortIcon("variety")}
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
              onClick={() => onSort("nickname")}
            >
              ชื่อเล่น {renderSortIcon("nickname")}
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
              onClick={() => onSort("sex")}
            >
              เพศ {renderSortIcon("sex")}
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
              onClick={() => onSort("plant_date")}
            >
              <div className="flex gap-2 items-center">
                <span className="flex gap-1 items-center">
                  <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                  </svg>
                  <span>อายุ {renderSortIcon("plant_date")}</span>
                </span>
                <ButtonGroup>
                  {(["day", "month", "year"] as const).map((unit) => (
                    <Button
                      key={unit}
                      color={ageUnit === unit ? "success" : "gray"}
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAgeUnit(unit);
                      }}
                      className={`transition-all font-kanit ${ageUnit === unit ? "font-bold" : ""}`}
                    >
                      {unit === "day" ? "วัน" : unit === "month" ? "เดือน" : "ปี"}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </TableHeadCell>
            <TableHeadCell
              className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
              onClick={() => onSort("status")}
            >
              สถานะ {renderSortIcon("status")}
            </TableHeadCell>
            <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">รูป</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : trees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-6 text-center text-gray-400">
                <span className="block text-lg font-medium md:text-2xl">🌱 ยังไม่มีข้อมูลต้นไม้</span>
              </TableCell>
            </TableRow>
          ) : (
            trees.map((tree) => (
              <TableRow
                key={tree.id}
                className="transition cursor-pointer hover:bg-green-50/40 dark:hover:bg-gray-700/40"
                onClick={() => onRowClick(tree)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tree.id)}
                    onChange={(e) => onSelect(tree.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="dark:text-gray-200">{tree.strain?.name || "-"}</TableCell>
                <TableCell>{tree.variety}</TableCell>
                <TableCell>{tree.nickname}</TableCell>
                <TableCell>
                  <Badge
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
                <TableCell className="font-mono text-center">{calcAge(tree, ageUnit)}</TableCell>
                <TableCell>
                  <Badge
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
                <TableCell>
                  {tree.images && tree.images.length > 0 ? (
                    <div className="flex gap-1">
                      {tree.images.slice(0, 2).map((img, idx) => (
                        <div key={img.id} className="relative group">
                          <Image
                            src={img.thumbnail || img.image}
                            alt={`รูปที่ ${idx + 1}`}
                            width={40}
                            height={40}
                            className="object-cover w-10 h-10 rounded-xl border-2 border-gray-300 shadow transition-all hover:scale-105 dark:border-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">ไม่มีรูป</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
