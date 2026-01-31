import React from 'react';
import { Tree } from '../app/types';
import { HiCollection, HiLightningBolt, HiSun, HiArchive } from 'react-icons/hi';
import { isTreeActive, isTreeHarvested, isFlowering, TREE_STATUS } from '../constants/treeStatus';

interface DashboardStatsProps {
  trees: Tree[];
}

/** Individual stat card configuration */
interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  isHero: boolean;
}

/**
 * DashboardStats - Displays tree statistics in a Bento Grid layout
 * Uses Claymorphism styling with gradient icon backgrounds
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ trees }) => {
  const total = trees.length;

  const flowering = trees.filter(
    (t) => t.status === TREE_STATUS.GROWING && isFlowering(t.growth_stage)
  ).length;

  const harvested = trees.filter((t) => isTreeHarvested(t.status)).length;

  const active = trees.filter((t) => isTreeActive(t.status)).length;

  const stats: StatItem[] = [
    {
      label: 'ทั้งหมด',
      value: total,
      icon: <HiCollection className="w-7 h-7" aria-hidden="true" />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      isHero: true,
    },
    {
      label: 'กำลังปลูก',
      value: active,
      icon: <HiSun className="w-6 h-6" aria-hidden="true" />,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      isHero: false,
    },
    {
      label: 'ทำดอก',
      value: flowering,
      icon: <HiLightningBolt className="w-6 h-6" aria-hidden="true" />,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      isHero: false,
    },
    {
      label: 'เก็บเกี่ยวแล้ว',
      value: harvested,
      icon: <HiArchive className="w-6 h-6" aria-hidden="true" />,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      isHero: false,
    },
  ];

  return (
    <div className="bento-grid mb-8" role="region" aria-label="สถิติต้นไม้">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`clay-card p-5 flex items-center justify-between ${
            stat.isHero ? 'bento-hero' : ''
          }`}
        >
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {stat.label}
            </p>
            <h4
              className={`font-bold text-slate-800 dark:text-slate-100 ${
                stat.isHero ? 'text-4xl' : 'text-2xl'
              }`}
            >
              {stat.value}
            </h4>
            {stat.isHero && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ต้น</p>
            )}
          </div>
          <div
            className={`${stat.isHero ? 'w-14 h-14' : 'w-12 h-12'} rounded-2xl flex items-center justify-center ${stat.iconBg} text-white shadow-lg`}
          >
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
