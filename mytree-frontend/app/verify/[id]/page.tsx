
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Tree, TreeLog } from "../../types";
import { treeService } from "../../../services/treeService"; 
import { Spinner } from "flowbite-react";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import { formatDate } from "../../utils";

export default function VerifyPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [tree, setTree] = useState<Tree | null>(null);
  const [logs, setLogs] = useState<TreeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       const fetchData = async () => {
         try {
           // In a real scenario, these endpoints should be public or this page serves generic data
           // For this MVP, we re-use existing service. 
           const [treeData, logsData] = await Promise.all([
             treeService.getTree(id),
             treeService.getLogs(Number(id))
           ]);
           setTree(treeData);
           setLogs(logsData);
         } catch (error) {
           console.error("Verification failed", error);
         } finally {
           setLoading(false);
         }
       };
       fetchData();
    }
  }, [id]);

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <Spinner size="xl" color="success" />
     </div>
  );

  if (!tree) return <div className="text-center p-10 text-destructive">Invalid Certificate Code</div>;

  const harvestLog = logs.find(l => l.action_type === 'harvest');
  const harvestDate = harvestLog ? formatDate(harvestLog.action_date) : "-";

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-10 px-4 font-kanit">
       <div className="max-w-md mx-auto bg-surface dark:bg-surface-dark rounded-3xl shadow-xl overflow-hidden border-t-8 border-primary relative">
          
          {/* Watermark / Background Decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <HiShieldCheck className="w-64 h-64 text-primary" />
          </div>

          <div className="p-8 text-center relative z-10">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4 animate-bounce-slow">
                <HiCheckCircle className="w-12 h-12" />
             </div>
             
             <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-1">CERTIFICATE OF ORIGIN</h1>
             <p className="text-sm text-primary font-medium tracking-wider uppercase mb-6">Mytree Journal Verified</p>
             
             <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-6"></div>

             <div className="space-y-4 text-left">
                <div className="bg-background-soft dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                   <span className="text-xs text-text-muted uppercase block mb-1">Strain Name</span>
                   <span className="text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {tree.nickname || tree.strain?.name}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-background-soft dark:bg-gray-700/50 p-3 rounded-lg">
                      <span className="text-xs text-text-muted uppercase block mb-1">Batch ID</span>
                      <span className="font-semibold text-text dark:text-text-dark">{tree.batch?.batch_code || "-"}</span>
                   </div>
                   <div className="bg-background-soft dark:bg-gray-700/50 p-3 rounded-lg">
                      <span className="text-xs text-text-muted uppercase block mb-1">Planted</span>
                      <span className="font-semibold text-text dark:text-text-dark">{formatDate(tree.plant_date)}</span>
                   </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg border border-primary/20 dark:border-primary/30">
                      <span className="text-xs text-primary uppercase block mb-1">Harvest Date</span>
                      <span className="font-bold text-primary dark:text-primary-light">{harvestDate}</span>
                   </div>
                   <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-lg border border-secondary/20 dark:border-secondary/30">
                      <span className="text-xs text-secondary uppercase block mb-1">Quality</span>
                      <span className="font-bold text-secondary dark:text-secondary-light">Premium Organic</span>
                   </div>
                </div>
             </div>
             
             <div className="mt-8">
                {tree.images && tree.images.length > 0 ? (
                   <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-600">
                      <img src={tree.images[0].thumbnail || tree.images[0].image} alt="Tree" className="w-full h-48 object-cover" />
                   </div>
                ) : (
                   <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-text-muted">No Image</div>
                )}
             </div>

             <div className="mt-6 text-xs text-text-muted">
                Verified by MyTree Journal Blockchain
                <br/>
                ID: {tree.id}
             </div>
          </div>
       </div>
    </div>
  );
}
