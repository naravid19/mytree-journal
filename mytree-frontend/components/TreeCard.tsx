import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import { Tree } from "../app/types";
import { HiPencil, HiTrash, HiEye, HiPhotograph } from "react-icons/hi";
import Image from "next/image";

interface TreeCardProps {
  tree: Tree;
  onEdit: (tree: Tree) => void;
  onDelete: (tree: Tree) => void;
  onView: (tree: Tree) => void;
}

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onEdit, onDelete, onView }) => {
  const thumbnail = tree.images.length > 0 ? tree.images[0].thumbnail || tree.images[0].image : null;

  return (
    <Card
      className="max-w-sm transition-all duration-300 border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800"
      renderImage={() => (
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden dark:bg-gray-700 group">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={tree.nickname}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-600">
              <HiPhotograph className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge color={tree.status === "มีชีวิต" ? "success" : "failure"} className="shadow-sm">
              {tree.status}
            </Badge>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 font-kanit dark:text-white">
            {tree.nickname || "Unnamed Tree"}
          </h5>
          <Badge color="info" className="text-xs shadow-sm">
            {tree.strain?.name || "Unknown Strain"}
          </Badge>
        </div>
        
        <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300 font-kanit">
          <p className="flex items-center gap-2">
            <span className="w-5 text-center">📍</span> 
            <span className="font-medium text-gray-900 dark:text-gray-100">{tree.location || "-"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-5 text-center">🧬</span> 
            <span className="font-medium text-gray-900 dark:text-gray-100">{tree.sex}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-5 text-center">📅</span> 
            <span className="font-medium text-gray-900 dark:text-gray-100">{tree.plant_date}</span>
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button size="xs" color="gray" onClick={() => onView(tree)} className="transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
            <HiEye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button size="xs" color="light" onClick={() => onEdit(tree)} className="transition-colors hover:bg-gray-200 dark:hover:bg-gray-600">
            <HiPencil className="w-4 h-4" />
          </Button>
          <Button size="xs" color="failure" onClick={() => onDelete(tree)} className="transition-colors hover:bg-red-700">
            <HiTrash className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
