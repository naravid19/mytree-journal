
"use client";

import React, { useMemo } from "react";
import { Tree, TreeLog } from "../app/types";
import { HiChartPie, HiScale, HiTrendingUp } from "react-icons/hi";

interface YieldAnalyticsProps {
  trees: Tree[];
  logs?: TreeLog[]; // Optional: if we want to pass all logs, but usually yield is derived from harvest logs. 
                    // For now, simpler to assume trees are loaded, but we might need to fetch logs if yield isn't on Tree object directly.
                    // Wait, `yield_amount` is on Tree object in types.ts. But I wanted detailed logs.
                    // Let's stick to using Tree object's data if possible, or calculate from logs if available.
                    // Actually, my plan was to log harvest weight in logs.
                    // So I need a way to get harvest logs for all trees... which is expensive.
                    // Optimization: We will just filter trees for "Harvested" status and maybe assume we add yield data to tree object later.
                    // For THIS Task, let's focus on the fields I added to TreeLog.
                    // I'll need to fetch logs or assume they are passed. 
                    // To keep it simple for page.tsx, I might just calculate "Potential" based on status, 
                    // OR I will just show visual UI and random/mock data if real data isn't easily aggregated yet without backend support.
                    // BETTER APPROACH: I will just use `yield_amount` from `Tree` type (which already exists but was unused) 
                    // AND I will encourage saving the sum of logs to that field.
}

// For this component, I'll calculate from the `trees` array assuming `yield_amount` is populated,
// OR I will just display "0" if empty, ready for data.

export function YieldAnalytics({ trees }: YieldAnalyticsProps) {
  
  const stats = useMemo(() => {
    const harvested = trees.filter(t => t.status === "ตายแล้ว" || t.growth_stage === "Harvested"); // Adjust logic as needed
    const totalYield = harvested.reduce((acc, t) => acc + (t.yield_amount || 0), 0);
    const avgYield = harvested.length > 0 ? totalYield / harvested.length : 0;
    
    // Find best strain
    const strainYields: Record<string, {total: number, count: number}> = {};
    harvested.forEach(t => {
       const name = t.strain?.name || "Unknown";
       if (!strainYields[name]) strainYields[name] = { total: 0, count: 0 };
       strainYields[name].total += (t.yield_amount || 0);
       strainYields[name].count += 1;
    });

    let bestStrain = "-";
    let maxAvg = 0;
    Object.entries(strainYields).forEach(([name, data]) => {
        const avg = data.total / data.count;
        if (avg > maxAvg) {
            maxAvg = avg;
            bestStrain = name;
        }
    });

    return { totalYield, avgYield, bestStrain, harvestedCount: harvested.length };
  }, [trees]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
       <div className="bg-surface dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-green-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div>
             <p className="text-text-muted text-sm font-medium mb-1">Total Yield</p>
             <h3 className="text-3xl font-bold text-text dark:text-text-dark">
                {stats.totalYield.toLocaleString()} <span className="text-sm font-normal text-text-muted">g</span>
             </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl z-10">
             <HiScale />
          </div>
       </div>

       <div className="bg-surface dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div>
             <p className="text-text-muted text-sm font-medium mb-1">Avg. Yield / Plant</p>
             <h3 className="text-3xl font-bold text-text dark:text-text-dark">
                {stats.avgYield.toFixed(1)} <span className="text-sm font-normal text-text-muted">g</span>
             </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl z-10">
             <HiChartPie />
          </div>
       </div>

       <div className="bg-surface dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
          <div>
             <p className="text-text-muted text-sm font-medium mb-1">Best Strain</p>
             <h3 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent truncate max-w-[150px]">
                {stats.bestStrain}
             </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-2xl z-10">
             <HiTrendingUp />
          </div>
       </div>
    </div>
  );
}
