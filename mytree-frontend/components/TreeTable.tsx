import React from "react";
import { HiQrcode, HiExternalLink, HiPencil, HiTrash } from "react-icons/hi";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, ButtonGroup, Button, Tooltip } from "flowbite-react";
import { Tree } from "../app/types";
import Image from "next/image";
import { getSecureImageUrl } from "../app/utils";

interface TreeTableProps {
  trees: Tree[];
  loading: boolean;
  selectedIds: number[];
  onSelect: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean, ids: number[]) => void;
  sortKey: keyof Tree | "strain" | null;
  sortOrder: "asc" | "desc";
  onSort: (key: keyof Tree | "strain") => void;
  onRowClick: (tree: Tree) => void;
  ageUnit: "day" | "month" | "year";
  setAgeUnit: (unit: "day" | "month" | "year") => void;
  calcAge: (tree: Tree, unit: "day" | "month" | "year") => string;
  onEdit: (tree: Tree) => void;
  onDelete: (tree: Tree) => void;
  onShowQR: (tree: Tree) => void;
  onViewImages: (images: string[], index: number) => void;
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
  onEdit,
  onDelete,
  onShowQR,
  onViewImages,
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
        <Table hoverable className="min-w-full text-base font-kanit dark:bg-gray-800 dark:text-gray-100">
          <TableHead className="bg-linear-to-r from-green-50 to-blue-50 text-gray-700 uppercase dark:from-gray-700 dark:to-gray-800 dark:text-gray-200">
            <TableRow className="border-b border-gray-200 dark:border-gray-600">
              <TableHeadCell className="p-2 md:p-4 w-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={trees.length > 0 && trees.every((tree) => selectedIds.includes(tree.id))}
                  onChange={(e) => onSelectAll(e.target.checked, trees.map((t) => t.id))}
                  aria-label="เลือกต้นไม้ทั้งหมดในหน้านี้"
                />
              </TableHeadCell>
              <TableHeadCell
                className="py-2 px-2 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap"
                onClick={() => onSort("strain")}
              >
                ชื่อ/สายพันธุ์ {renderSortIcon("strain")}
              </TableHeadCell>
              <TableHeadCell
                className="py-3 px-3 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors hidden xl:table-cell whitespace-nowrap"
                onClick={() => onSort("variety")}
              >
                พันธุ์ {renderSortIcon("variety")}
              </TableHeadCell>
              <TableHeadCell
                className="py-3 px-3 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors hidden lg:table-cell whitespace-nowrap"
                onClick={() => onSort("nickname")}
              >
                ชื่อเล่น {renderSortIcon("nickname")}
              </TableHeadCell>
              <TableHeadCell
                className="py-3 px-3 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors hidden md:table-cell whitespace-nowrap"
                onClick={() => onSort("sex")}
              >
                เพศ {renderSortIcon("sex")}
              </TableHeadCell>
              <TableHeadCell
                className="py-3 px-3 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap hidden sm:table-cell"
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
                        {unit === "day" ? "วัน" : unit === "month" ? "ด." : "ปี"}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
              </TableHeadCell>
              <TableHeadCell
                className="py-2 px-2 md:py-4 md:px-6 font-bold cursor-pointer select-none hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap"
                onClick={() => onSort("status")}
              >
                สถานะ {renderSortIcon("status")}
              </TableHeadCell>
              <TableHeadCell className="py-2 px-2 md:py-4 md:px-6 font-bold whitespace-nowrap">รูป</TableHeadCell>
              <TableHeadCell className="py-2 px-2 md:py-4 md:px-6 font-bold whitespace-nowrap text-center">จัดการ</TableHeadCell>
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
                  <TableCell className="p-2 md:p-4 w-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectedIds.includes(tree.id)}
                      onChange={(e) => onSelect(tree.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="px-2 py-2 md:px-6 md:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base">{tree.nickname || tree.strain?.name || "-"}</span>
                      {tree.nickname && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal md:hidden">
                          {tree.strain?.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-300 hidden xl:table-cell whitespace-nowrap">{tree.variety}</TableCell>
                  <TableCell className="px-3 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-300 hidden lg:table-cell whitespace-nowrap">{tree.nickname}</TableCell>
                  <TableCell className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">
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
                  <TableCell className="px-3 py-3 md:px-6 md:py-4 font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap hidden sm:table-cell">{calcAge(tree, ageUnit)}</TableCell>
                  <TableCell className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap">
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
                  <TableCell className="px-2 py-2 md:px-6 md:py-4">
                    {tree.images && tree.images.length > 0 ? (
                      <>
                        {/* Mobile: Single Thumbnail with Badge */}
                        <div 
                          className="relative md:hidden w-10 h-10 shrink-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewImages(tree.images.map(img => getSecureImageUrl(img.image)), 0);
                          }}
                        >
                           <Image
                              src={getSecureImageUrl(tree.images[0].thumbnail || tree.images[0].image)}
                              alt="รูปหลัก"
                              width={40}
                              height={40}
                              className="object-cover w-10 h-10 rounded-lg border border-gray-200 shadow-sm dark:border-gray-700"
                            />
                            {tree.images.length > 1 && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-green-500 rounded-full ring-1 ring-white dark:ring-gray-800 shadow-sm px-1">
                                +{tree.images.length - 1}
                              </div>
                            )}
                        </div>

                        {/* Desktop: Stacked Avatars */}
                        <div className="hidden md:flex -space-x-3 group transition-all duration-300">
                          {tree.images.slice(0, 3).map((img, idx) => (
                            <div
                              key={img.id}
                              className={`relative z-0 hover:z-10 transition-transform duration-300 cursor-pointer ${
                                idx === 1 ? "group-hover:translate-x-4" : idx === 2 ? "group-hover:translate-x-8" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewImages(tree.images.map(img => getSecureImageUrl(img.image)), idx);
                              }}
                            >
                              <Image
                                src={getSecureImageUrl(img.thumbnail || img.image)}
                                alt={`รูปที่ ${idx + 1}`}
                                width={40}
                                height={40}
                                className="object-cover w-10 h-10 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 dark:border-gray-700 hover:ring-2 hover:ring-green-400"
                              />
                            </div>
                          ))}
                          {tree.images.length > 3 && (
                            <div 
                              className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-400 rounded-full border-2 border-white dark:border-gray-700 z-0 transition-transform duration-300 group-hover:translate-x-12 cursor-pointer hover:bg-gray-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewImages(tree.images.map(img => getSecureImageUrl(img.image)), 3);
                              }}
                            >
                              +{tree.images.length - 3}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">ไม่มีรูป</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2 md:px-6 md:py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="หน้าสาธารณะ">
                        <Button
                          size="xs"
                          color="light"
                          aria-label="เปิดหน้าสาธารณะของต้นไม้นี้"
                          className="p-1! border-gray-200 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/tree/${tree.id}`, '_blank');
                          }}
                        >
                          <HiExternalLink className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </Button>
                      </Tooltip>
                       <Tooltip content="QR Code">
                        <Button
                          size="xs"
                          color="light"
                          aria-label="แสดง QR Code"
                          className="p-1! border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowQR(tree);
                          }}
                        >
                          <HiQrcode className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="แก้ไข">
                        <Button
                          size="xs"
                          color="light"
                          aria-label="แก้ไขข้อมูลต้นไม้"
                          className="p-1! border-gray-200 dark:border-gray-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tree);
                          }}
                        >
                          <HiPencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="ลบ">
                        <Button
                          size="xs"
                          color="light"
                          aria-label="ลบต้นไม้นี้"
                          className="p-1! border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(tree);
                          }}
                        >
                          <HiTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </Button>
                      </Tooltip>
                    </div>
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
