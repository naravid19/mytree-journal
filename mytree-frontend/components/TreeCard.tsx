import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import { Tree } from "../app/types";
import { HiPencil, HiTrash, HiEye } from "react-icons/hi";
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
      className="max-w-sm hover:shadow-lg transition-shadow duration-300"
      renderImage={() => (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={tree.nickname}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <span className="text-sm">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge color={tree.status === "มีชีวิต" ? "success" : "failure"}>
              {tree.status}
            </Badge>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {tree.nickname || "Unnamed Tree"}
          </h5>
          <Badge color="info" className="text-xs">
            {tree.strain?.name || "Unknown Strain"}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📍 {tree.location || "-"}</p>
          <p>🧬 {tree.sex}</p>
          <p>📅 {tree.plant_date}</p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button size="xs" color="gray" onClick={() => onView(tree)}>
            <HiEye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button size="xs" color="light" onClick={() => onEdit(tree)}>
            <HiPencil className="h-4 w-4" />
          </Button>
          <Button size="xs" color="failure" onClick={() => onDelete(tree)}>
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
