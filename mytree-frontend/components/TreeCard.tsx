import React from "react";
import { Card, Badge, Button, Tooltip } from "flowbite-react";
import { Tree } from "../app/types";
import { HiPencil, HiTrash, HiEye, HiPhotograph, HiCalendar, HiLocationMarker } from "react-icons/hi";
import { TbGenderMale, TbGenderFemale, TbGenderBigender, TbGenderAgender, TbHelp } from "react-icons/tb";
import Image from "next/image";
import { calcAge, sexLabel, getSecureImageUrl } from "../app/utils";

interface TreeCardProps {
  tree: Tree;
  onEdit: (tree: Tree) => void;
  onDelete: (tree: Tree) => void;
  onView: (tree: Tree) => void;
}

const getSexIcon = (sex: string) => {
  switch (sex) {
    case 'male': return <TbGenderMale className="w-4 h-4" />;
    case 'female': return <TbGenderFemale className="w-4 h-4" />;
    case 'bisexual': return <TbGenderBigender className="w-4 h-4" />;
    case 'mixed': return <TbGenderBigender className="w-4 h-4" />; // Using Bigender for mixed as well
    case 'monoecious': return <TbGenderBigender className="w-4 h-4" />; // Using Bigender for monoecious
    case 'unknown': return <TbHelp className="w-4 h-4" />;
    default: return <TbHelp className="w-4 h-4" />;
  }
};

const getSexColorClass = (sex: string) => {
  switch (sex) {
    case 'male': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'female': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    case 'bisexual': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'mixed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    case 'monoecious': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  }
};

export const TreeCardSkeleton = () => (
  <div className="h-full w-full max-w-sm">
    <Card className="h-full border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
      <div className="relative w-full h-56 bg-gray-200 animate-pulse dark:bg-gray-700" />
      <div className="flex flex-col gap-3 p-1">
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
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </div>
      </div>
    </Card>
  </div>
);

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onEdit, onDelete, onView }) => {
  const thumbnail = tree.images.length > 0 ? getSecureImageUrl(tree.images[0].thumbnail || tree.images[0].image) : null;

  return (
    <div 
      onClick={() => onView(tree)}
      className="group relative h-full w-full max-w-sm cursor-pointer transition-all duration-500 hover:-translate-y-2"
    >
      <Card
        className="h-full border-0 shadow-lg transition-all duration-500 hover:shadow-2xl dark:bg-gray-800 overflow-hidden glass"
        renderImage={() => (
          <div className="relative w-full h-56 bg-gray-100 overflow-hidden dark:bg-gray-700">
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
              <Badge color={tree.status === "มีชีวิต" ? "success" : "failure"} className="shadow-md backdrop-blur-md bg-opacity-90 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {tree.status}
              </Badge>
            </div>

            {/* Sex Badge (Bottom Right) */}
            {tree.sex && tree.sex !== 'unknown' && (
              <div className="absolute bottom-3 right-3 z-10">
                <Tooltip content={sexLabel(tree.sex)} placement="left">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-md backdrop-blur-md border ${getSexColorClass(tree.sex)} transition-transform hover:scale-110`}>
                    {getSexIcon(tree.sex)}
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
        )}
      >
        <div className="flex flex-col gap-3 p-1">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="text-xl font-bold tracking-tight text-gray-900 font-kanit dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-1">
                {tree.nickname || "Unnamed Tree"}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {tree.strain?.name || "Unknown Strain"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-300 font-kanit mt-2">
            <div className="flex items-center gap-2">
              <HiLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate font-medium">{tree.location || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">อายุ</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {calcAge(tree, "day")} วัน
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-xs text-gray-500">
              <HiCalendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium">ปลูกเมื่อ {tree.plant_date}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <Button size="xs" color="gray" onClick={() => onView(tree)} className="transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-200">
              <HiEye className="w-4 h-4 mr-1.5" />
              View
            </Button>
            <Button size="xs" color="light" onClick={() => onEdit(tree)} className="transition-all hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 dark:hover:text-blue-400 border-gray-200 dark:border-gray-600">
              <HiPencil className="w-4 h-4" />
            </Button>
            <Button size="xs" color="failure" onClick={() => onDelete(tree)} className="transition-all hover:bg-red-700 shadow-sm">
              <HiTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
