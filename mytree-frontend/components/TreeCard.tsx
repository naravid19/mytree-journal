import React, { useMemo } from 'react';
import { Button, Tooltip } from 'flowbite-react';
import { Tree } from '../app/types';
import {
  HiPencil,
  HiTrash,
  HiEye,
  HiPhotograph,
  HiCalendar,
  HiLocationMarker,
  HiQrcode,
  HiExternalLink,
} from 'react-icons/hi';
import {
  TbGenderMale,
  TbGenderFemale,
  TbGenderBigender,
  TbHelp,
} from 'react-icons/tb';
import Image from 'next/image';
import Link from 'next/link';
import { calcAge, sexLabel, getSecureImageUrl, getSexColorClass } from '../app/utils';
import { TREE_STATUS } from '../constants/treeStatus';

interface TreeCardProps {
  tree: Tree;
  onEdit: (tree: Tree) => void;
  onDelete: (tree: Tree) => void;
  onView: (tree: Tree) => void;
  onShowQR: (tree: Tree) => void;
}

/**
 * Get the appropriate gender icon for a tree
 */
const getSexIcon = (sex: string): React.ReactNode => {
  const iconClass = 'w-4 h-4';
  switch (sex) {
    case 'male':
      return <TbGenderMale className={iconClass} aria-hidden="true" />;
    case 'female':
      return <TbGenderFemale className={iconClass} aria-hidden="true" />;
    case 'bisexual':
    case 'mixed':
    case 'monoecious':
      return <TbGenderBigender className={iconClass} aria-hidden="true" />;
    default:
      return <TbHelp className={iconClass} aria-hidden="true" />;
  }
};


/**
 * TreeCardSkeleton - Loading placeholder for TreeCard
 * Uses clay-card styling for consistent appearance
 */
export const TreeCardSkeleton: React.FC = () => (
  <div className="h-full w-full max-w-sm" role="status" aria-label="กำลังโหลด">
    <div className="h-full clay-card overflow-hidden">
      <div className="relative w-full aspect-4/3 bg-gray-200 animate-pulse dark:bg-gray-700" />
      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="col-span-2 h-4 w-2/3 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * TreeCard - Displays a single tree in a card format
 * Uses Claymorphism styling with hover effects
 */
export const TreeCard: React.FC<TreeCardProps> = ({ tree, onEdit, onDelete, onView, onShowQR }) => {
  // Memoize thumbnail URL to prevent recalculation on every render
  const thumbnail = useMemo(() => {
    if (tree.images.length === 0) return null;
    return getSecureImageUrl(tree.images[0].thumbnail || tree.images[0].image);
  }, [tree.images]);

  // Memoize status badge class for performance
  const statusBadgeClass = useMemo(() => {
    return tree.status === TREE_STATUS.ALIVE
      ? 'bg-green-500/90 text-white'
      : 'bg-red-500/90 text-white';
  }, [tree.status]);


  return (
    <div 
      onClick={() => onView(tree)}
      className="group relative h-full w-full max-w-sm cursor-pointer"
    >
      <div className="h-full clay-card overflow-hidden transition-all duration-300">
        {/* Image Section */}
        <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden dark:bg-gray-800">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={tree.nickname}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-300 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 dark:text-gray-600">
              <HiPhotograph className="w-16 h-16 mb-3 opacity-40" />
              <span className="text-sm font-medium tracking-wide opacity-60">No Image</span>
            </div>
          )}
          
          {/* Status Badge (Top Right) */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${statusBadgeClass}`}
            >
              {tree.status}
            </span>
          </div>

          {/* Sex Badge (Bottom Right) */}
          {tree.sex && tree.sex !== 'unknown' && (
            <div className="absolute bottom-3 right-3 z-10">
              <Tooltip content={sexLabel(tree.sex)} placement="left">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg backdrop-blur-md border border-white/20 ${getSexColorClass(tree.sex)} transition-transform hover:scale-110`}>
                  {getSexIcon(tree.sex)}
                </div>
              </Tooltip>
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <h5 className="text-xl font-bold tracking-tight text-text font-heading dark:text-text-dark group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-1">
              {tree.nickname || "Unnamed Tree"}
            </h5>
            <p className="text-sm text-text-muted font-medium mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary/50 inline-block" />
              {tree.strain?.name || "Unknown Strain"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-text-muted font-kanit mt-1 bg-background/50 dark:bg-background-dark/50 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <HiLocationMarker className="w-4 h-4 text-primary/70 shrink-0" />
              <span className="truncate font-medium">{tree.location || "ไม่ระบุสถานที่"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-muted/70 uppercase tracking-wide">อายุ</span>
              <span className="font-bold text-text dark:text-text-dark">
                {calcAge(tree, "day")} วัน
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-xs text-text-muted/80 border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
              <HiCalendar className="w-4 h-4 text-text-muted/60 shrink-0" />
              <span className="font-medium">ปลูกเมื่อ {tree.plant_date}</span>
            </div>
          </div>

          {/* Actions - Visible on Hover (Desktop) / Always (Mobile) */}
          <div className="flex justify-end gap-2 mt-2 pt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
            <Tooltip content="ดูรายละเอียด">
              <Button size="xs" color="gray" aria-label="ดูรายละเอียดต้นไม้" onClick={() => onView(tree)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                <HiEye className="w-4 h-4" />
              </Button>
            </Tooltip>
            
            <Tooltip content="QR Code">
              <Button size="xs" color="light" aria-label="แสดง QR Code" onClick={() => onShowQR(tree)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all hover:text-purple-600 hover:bg-purple-50">
                <HiQrcode className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="หน้าสาธารณะ">
              <Link href={`/tree/${tree.id}`} passHref>
                <Button size="xs" color="light" aria-label="เปิดหน้าสาธารณะ" className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all hover:text-green-600 hover:bg-green-50">
                  <HiExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </Tooltip>

            <Tooltip content="แก้ไข">
              <Button size="xs" color="light" aria-label="แก้ไขข้อมูลต้นไม้" onClick={() => onEdit(tree)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all hover:text-blue-600 hover:bg-blue-50">
                <HiPencil className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="ลบ">
              <Button size="xs" color="failure" aria-label="ลบต้นไม้นี้" onClick={() => onDelete(tree)} className="rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all hover:bg-red-700">
                <HiTrash className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
