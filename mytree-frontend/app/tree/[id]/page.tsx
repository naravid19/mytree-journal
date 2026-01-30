
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tree, TreeLog } from "../../types";
import { treeService } from "../../../services/treeService";
import { TreeTimeline } from "../../../components/TreeTimeline";
import { Button, Spinner } from "flowbite-react";
import { HiHome, HiChevronLeft, HiChevronRight, HiPencil, HiQrcode } from "react-icons/hi";
import { formatDate, calcAge, sexLabel } from "../../utils";
import { QRCodeModal } from "../../../components/QRCodeModal";

export default function TreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [tree, setTree] = useState<Tree | null>(null);
  const [logs, setLogs] = useState<TreeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [treeData, logsData] = await Promise.all([
        treeService.getTree(id),
        treeService.getLogs(Number(id))
      ]);
      setTree(treeData);
      setLogs(logsData);
    } catch (error) {
      console.error(error);
      // alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddLog = async (formData: FormData) => {
    try {
      formData.append("tree", id);
      await treeService.createLog(formData);
      await fetchData(); 
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if(!confirm("คุณต้องการลบบันทึกนี้ใช่หรือไม่?")) return;
    try {
      await treeService.deleteLog(logId);
      await fetchData();
    } catch (error) {
      console.error(error);
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  };

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
           <Spinner size="xl" color="success" />
        </div>
     );
  }

  if (!tree) return <div className="text-center p-10 text-text-muted">Tree not found</div>;

  const coverImage = tree.images && tree.images.length > 0 
      ? (tree.images.find(img => img.is_cover) || tree.images[0]).image 
      : null;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark font-kanit pb-20">
       
       {/* 🌟 Hero Section (Cover Image) */}
       <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden group">
          {coverImage ? (
             <React.Fragment>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
             </React.Fragment>
          ) : (
             <div className="absolute inset-0 bg-linear-to-r from-primary-dark to-secondary-dark flex items-center justify-center">
                <span className="text-6xl opacity-20">🌿</span>
             </div>
          )}
          
          {/* Navigation Overlay */}
          <div className="absolute top-4 left-4 z-20">
               <Button color="light" size="xs" pill className="backdrop-blur-md bg-white/30 border-none text-white hover:bg-white/40" onClick={() => router.back()}>
                  <HiChevronLeft className="mr-1 h-5 w-5" /> Back
               </Button>
          </div>
       </div>

       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          
          {/* 🌟 Main Info Card (Glassmorphism) */}
          <div className="bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 dark:border-gray-700/50 flex flex-col md:flex-row gap-8 items-start animate-fade-in-up">
             
             {/* Profile Image (Square with rounded corners) */}
             <div className="w-full md:w-auto flex flex-col items-center gap-4">
                 <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl shadow-lg overflow-hidden border-4 border-white dark:border-gray-700 shrink-0 relative group">
                    {coverImage ? (
                        <img src={coverImage} alt={tree.nickname} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/50 text-5xl">🌱</div>
                    )}
                 </div>
                 <div className="flex gap-2">
                     <Button size="xs" color="gray" onClick={() => setShowQRModal(true)}>
                        <HiQrcode className="mr-1" /> QR Code
                     </Button>
                 </div>
             </div>

             {/* Details */}
             <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-4xl font-bold text-text dark:text-text-dark tracking-tight">
                                {tree.nickname}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                tree.sex === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' : 
                                tree.sex === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {sexLabel(tree.sex)}
                            </span>
                        </div>
                        <h2 className="text-xl font-medium text-primary dark:text-primary-light mb-2">
                           {tree.strain?.name}
                        </h2>
                    </div>
                  <div className="text-right">
                        <div className="text-sm text-text-muted">Current Values</div>
                        <div className="text-3xl font-bold font-mono text-text dark:text-text-dark">
                           {calcAge(tree, 'day')} <span className="text-sm font-sans text-text-muted">Days</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">สถานะ</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{tree.status || "-"}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">ชุดการปลูก</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{tree.batch?.batch_code || "-"}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">สถานที่</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{tree.location || "-"}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">ระยะการเติบโต</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{tree.growth_stage || "-"}</div>
                    </div>
                    {tree.yield_amount && (
                       <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800">
                           <div className="text-xs text-green-600 uppercase mb-1">ผลผลิต</div>
                           <div className="font-bold text-green-700 dark:text-green-400">{tree.yield_amount} g</div>
                       </div>
                    )}
                </div>
             </div>
          </div>

          {/* 🌟 Detailed Information Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             
             {/* 📅 วันที่สำคัญ */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">📅</span> วันที่สำคัญ
                </h3>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">วันเพาะ</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tree.germination_date) || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">วันปลูก</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tree.plant_date) || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">วันเก็บเกี่ยว</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tree.harvest_date) || "-"}</span>
                   </li>
                   <li className="flex justify-between">
                      <span className="text-text-muted">อายุปัจจุบัน</span>
                      <span className="font-bold text-primary dark:text-primary-light">{calcAge(tree, 'day')} วัน</span>
                   </li>
                </ul>
             </div>

             {/* 🧬 พันธุกรรม & การผสมพันธุ์ */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">🧬</span> พันธุกรรม
                </h3>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">สายพันธุ์</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.strain?.name || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">พันธุ์ย่อย</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.variety || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">Genotype</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.genotype || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">Phenotype</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.phenotype || "-"}</span>
                   </li>
                   <li className="flex justify-between">
                      <span className="text-text-muted">รุ่น (Generation)</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.generation || "-"}</span>
                   </li>
                </ul>
             </div>

             {/* 👨‍👩‍👧 สายเลือด & Clone */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">👨‍👩‍👧</span> สายเลือด
                </h3>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">แม่พันธุ์ (Female)</span>
                      <span className="font-medium text-pink-600 dark:text-pink-400">{tree.parent_female_data?.nickname || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">พ่อพันธุ์ (Male)</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{tree.parent_male_data?.nickname || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">Clone จาก</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.clone_source ? `#${tree.clone_source}` : "-"}</span>
                   </li>
                   <li className="flex justify-between">
                      <span className="text-text-muted">ที่มา</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.clone_source ? "🌿 Clone" : "🌱 เมล็ด"}</span>
                   </li>
                </ul>
             </div>

             {/* 🌸 การผสมเกสร & เมล็ด */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">🌸</span> การผสมเกสร & เมล็ด
                </h3>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">วันผสมเกสร</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tree.pollination_date) || "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">ผสมโดย (Male)</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.pollinated_by ? `#${tree.pollinated_by}` : "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">จำนวนเมล็ด</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{tree.seed_count || "-"}</span>
                   </li>
                   <li className="flex justify-between">
                      <span className="text-text-muted">วันเก็บเมล็ด</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{formatDate(tree.seed_harvest_date) || "-"}</span>
                   </li>
                </ul>
             </div>

             {/* 📊 ผลผลิต & คุณภาพ */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">📊</span> ผลผลิต & คุณภาพ
                </h3>
                <ul className="space-y-3 text-sm">
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">ผลผลิต (Yield)</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{tree.yield_amount ? `${tree.yield_amount} g` : "-"}</span>
                   </li>
                   <li className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-text-muted">คุณภาพดอก</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{tree.flower_quality || "-"}</span>
                   </li>
                   <li className="flex justify-between">
                      <span className="text-text-muted">รหัสต้นไม้</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{tree.code || `T-${tree.id}`}</span>
                   </li>
                </ul>
             </div>

             {/* 📝 หมายเหตุ */}
             <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-text dark:text-text-dark mb-4 flex items-center gap-2">
                   <span className="text-lg">📝</span> หมายเหตุ
                </h3>
                <div className="space-y-4 text-sm">
                   {tree.notes && (
                      <div>
                         <div className="text-xs text-text-muted uppercase mb-1">บันทึกทั่วไป</div>
                         <p className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">{tree.notes}</p>
                      </div>
                   )}
                   {tree.disease_notes && (
                      <div>
                         <div className="text-xs text-red-500 uppercase mb-1">⚠️ บันทึกโรค/ปัญหา</div>
                         <p className="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{tree.disease_notes}</p>
                      </div>
                   )}
                   {!tree.notes && !tree.disease_notes && (
                      <p className="text-text-muted italic">ไม่มีหมายเหตุ</p>
                   )}
                </div>
             </div>
          </div>

          {/* 🌟 Timeline Section */}
          <div className="mt-8">
             <TreeTimeline 
                 logs={logs} 
                 onAddLog={handleAddLog} 
                 onDeleteLog={handleDeleteLog} 
             />
          </div>

       </div>

      {tree && (
        <QRCodeModal
          show={showQRModal}
          onClose={() => setShowQRModal(false)}
          tree={tree}
         />
      )}

    </div>
  );
}
