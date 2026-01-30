
import React from "react";
import { Tree } from "../app/types";
import { HiCollection, HiLightningBolt, HiSun, HiArchive } from "react-icons/hi";

interface DashboardStatsProps {
  trees: Tree[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ trees }) => {
  const total = trees.length;
  // Note: Adjust status checks based on actual implementation literals
  const vegetative = trees.filter(t => 
    t.status === "กำลังปลูก" && 
    (t.growth_stage?.toLowerCase().includes("veg") || t.growth_stage?.toLowerCase().includes("seedling"))
  ).length;
  
  const flowering = trees.filter(t => 
    t.status === "กำลังปลูก" && 
    t.growth_stage?.toLowerCase().includes("flower")
  ).length;

  const harvested = trees.filter(t => t.status.includes("เก็บเกี่ยว") || t.status.includes("Dry") || t.status.includes("Cure")).length;
  
  // Fallback if specific stages aren't set but status is "Alive"
  const active = trees.filter(t => t.status === "กำลังปลูก" || t.status === "มีชีวิต").length;

  const stats = [
    { 
      label: "ทั้งหมด", 
      value: total, 
      icon: <HiCollection className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400" 
    },
    { 
      label: "กำลังปลูก", 
      value: active, 
      icon: <HiSun className="w-6 h-6" />,
      color: "from-primary to-secondary",
      bg: "bg-green-50 dark:bg-primary/10",
      text: "text-primary dark:text-primary-light"
    },
    { 
      label: "ทำดอก", 
      value: flowering, 
      icon: <HiLightningBolt className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400"
    },
    { 
      label: "เก็บเกี่ยวแล้ว", 
      value: harvested, 
      icon: <HiArchive className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:-translate-y-1">
          <div>
            <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
            <h4 className="text-2xl font-bold text-text dark:text-text-dark">{stat.value}</h4>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br ${stat.color} text-white shadow-lg`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
