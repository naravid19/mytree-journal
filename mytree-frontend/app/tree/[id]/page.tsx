"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spinner, Card, Badge, Button, Tabs } from "flowbite-react";
import { 
  HiArrowLeft, 
  HiLocationMarker, 
  HiInformationCircle, 
  HiCalendar, 
  HiChip, 
  HiBeaker, 
  HiClipboardList,
  HiPhotograph,
  HiDocumentText
} from "react-icons/hi";
import { TbGenderMale, TbGenderFemale, TbGenderBigender, TbHelp, TbDna } from "react-icons/tb";
import Link from "next/link";
import Image from "next/image";
import { Tree } from "../../types";
import { calcAge, getSecureImageUrl, sexLabel } from "../../utils";

export default function PublicTreePage() {
  const params = useParams();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('info');

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (params?.id) {
      fetch(`${API_BASE}/api/trees/${params.id}/`)
        .then((res) => {
          if (!res.ok) throw new Error("Tree not found");
          return res.json();
        })
        .then((data) => {
          setTree(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("ไม่พบข้อมูลต้นไม้ หรือเกิดข้อผิดพลาด");
          setLoading(false);
        });
    }
  }, [params, API_BASE]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">😕 {error}</h1>
        <Link href="/">
          <Button color="gray">กลับหน้าหลัก</Button>
        </Link>
      </div>
    );
  }

  const coverImage = tree.images && tree.images.length > 0 
    ? getSecureImageUrl(tree.images.find(img => img.is_cover)?.image || tree.images[0].image) 
    : "/placeholder-tree.png";

  const displayName = tree.nickname || tree.strain?.name || "Unnamed Tree";
  const altText = `รูปภาพของ ${displayName}`;

  const getSexIcon = (sex: string) => {
    switch (sex) {
      case 'male': return <TbGenderMale className="w-5 h-5" />;
      case 'female': return <TbGenderFemale className="w-5 h-5" />;
      case 'bisexual': return <TbGenderBigender className="w-5 h-5" />;
      case 'mixed': return <TbGenderBigender className="w-5 h-5" />;
      case 'monoecious': return <TbGenderBigender className="w-5 h-5" />;
      default: return <TbHelp className="w-5 h-5" />;
    }
  };



  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-kanit">
      <div className="mx-auto max-w-5xl">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg shadow-sm hover:text-green-600 hover:shadow-md dark:bg-gray-800 dark:text-gray-300 dark:hover:text-green-400 transition-all">
            <HiArrowLeft className="h-5 w-5" />
            กลับหน้าหลัก
          </Link>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 text-xs font-mono text-gray-500 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-400">ID: {tree.code || tree.id}</span>
             <Button size="xs" color="light" pill onClick={handleShare}>
                <HiClipboardList className="w-4 h-4 mr-1" />
                แชร์
             </Button>
                  className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute top-4 right-4">
                  <Badge color={tree.status === 'มีชีวิต' ? 'success' : 'failure'} size="lg" className="shadow-sm backdrop-blur-sm bg-opacity-90">
                    {tree.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6 text-center relative">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                    {displayName}
                  </h1>
                  {tree.strain?.name && tree.nickname && (
                    <p className="text-base text-gray-500 dark:text-gray-400 font-medium">{tree.strain.name}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {tree.batch && (
                    <Badge color="indigo" size="sm" icon={HiBeaker} className="px-3 py-1">
                      {tree.batch.batch_code}
                    </Badge>
                  )}
                  {tree.sex && (
                    <Badge color={tree.sex === 'female' ? 'pink' : tree.sex === 'male' ? 'blue' : 'gray'} size="sm" icon={() => getSexIcon(tree.sex)} className="px-3 py-1">
                      {sexLabel(tree.sex)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                    <p className="text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-wider mb-1">อายุ</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{calcAge(tree, "day")} <span className="text-sm font-normal">วัน</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider mb-1">ระยะ</p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300 line-clamp-1">{tree.growth_stage || "-"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl ring-1 ring-gray-900/5 dark:ring-gray-700/50 h-full">
              <div className="flex flex-col h-full">
                {/* Sticky Tab Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'info'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <HiInformationCircle className="w-5 h-5" />
                      ข้อมูลทั่วไป
                    </button>
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'timeline'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <HiCalendar className="w-5 h-5" />
                      ไทม์ไลน์ & การปลูก
                    </button>
                    <button
                      onClick={() => setActiveTab('genetics')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'genetics'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <TbDna className="w-5 h-5" />
                      พันธุกรรม & ผลผลิต
                    </button>
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'gallery'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <HiPhotograph className="w-5 h-5" />
                      รูปภาพ
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 min-h-[500px]">
                  {activeTab === 'info' && (
                    <div className="space-y-6 pt-2">
                      {/* Basic Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                              <HiLocationMarker className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">สถานที่ปลูก</p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-1">{tree.location || "-"}</p>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
                              <HiChip className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">พันธุ์ (Variety)</p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-1">{tree.variety || "-"}</p>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                              <TbDna className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">รุ่น (Generation)</p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-1">{tree.generation || "-"}</p>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/30 dark:text-orange-400">
                              <HiCalendar className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">วันที่ปลูก</p>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white pl-1">
                            {new Date(tree.plant_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      {tree.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-800/30">
                          <h3 className="text-base font-bold text-yellow-800 dark:text-yellow-400 mb-3 flex items-center gap-2">
                            <HiDocumentText className="w-5 h-5" /> หมายเหตุ
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{tree.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'timeline' && (
                    <div className="pt-4 px-2">
                      <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                        {tree.germination_date && (
                          <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                               <span className="text-lg">🌱</span>
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">เมล็ดเริ่มงอก</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {new Date(tree.germination_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                            </time>
                          </li>
                        )}
                        <li className="ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                             <span className="text-lg">🪴</span>
                          </span>
                          <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">ลงปลูก</h3>
                          <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                            {new Date(tree.plant_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                          </time>
                        </li>
                        {tree.pollination_date && (
                          <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-yellow-900">
                               <span className="text-lg">🐝</span>
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">ผสมเกสร</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {new Date(tree.pollination_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                            </time>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 inline-block">
                              โดย: {tree.pollinated_by ? `Tree #${tree.pollinated_by}` : "ไม่ระบุ"}
                            </p>
                          </li>
                        )}
                        {tree.harvest_date && (
                          <li className="ml-6">
                             <span className="absolute flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900 dark:bg-amber-900">
                               <span className="text-lg">🌾</span>
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">เก็บเกี่ยว</h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                              {new Date(tree.harvest_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                            </time>
                          </li>
                        )}
                      </ol>
                    </div>
                  )}

                  {activeTab === 'genetics' && (
                    <div className="space-y-8 pt-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                          🧬 พันธุกรรม
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">พ่อพันธุ์</span>
                            <span className="font-bold text-gray-800 dark:text-white text-lg">{tree.parent_male_data?.nickname || tree.parent_male || "-"}</span>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">แม่พันธุ์</span>
                            <span className="font-bold text-gray-800 dark:text-white text-lg">{tree.parent_female_data?.nickname || tree.parent_female || "-"}</span>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">ต้นแม่ (Clone)</span>
                            <span className="font-bold text-gray-800 dark:text-white text-lg">{tree.clone_source || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                          🌸 ผลผลิต
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-100 dark:border-green-800/30 shadow-sm">
                            <span className="text-sm text-green-700 dark:text-green-400 block font-bold mb-2">ปริมาณผลผลิต</span>
                            <span className="text-3xl font-bold text-green-800 dark:text-green-300">{tree.yield_amount ? `${tree.yield_amount} g` : "-"}</span>
                          </div>
                          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30 shadow-sm">
                            <span className="text-sm text-amber-700 dark:text-amber-400 block font-bold mb-2">จำนวนเมล็ด</span>
                            <span className="text-3xl font-bold text-amber-800 dark:text-amber-300">{tree.seed_count || "-"}</span>
                          </div>
                        </div>
                        {tree.flower_quality && (
                          <div className="mt-5 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">คุณภาพดอก / ลักษณะ</span>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{tree.flower_quality}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'gallery' && (
                    <div className="pt-2">
                       {tree.images && tree.images.length > 0 ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {tree.images.map((img) => (
                             <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                               <Image
                                 src={getSecureImageUrl(img.image)}
                                 alt={`Tree Image ${img.id}`}
                                 fill
                                 className="object-cover hover:scale-105 transition-transform duration-300"
                               />
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-center py-12 text-gray-400">
                           <HiPhotograph className="w-12 h-12 mx-auto mb-2 opacity-50" />
                           <p>ไม่มีรูปภาพเพิ่มเติม</p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-xs text-gray-400">
             บันทึกโดย MyTree Journal 🌳
           </p>
        </div>
      </div>
    </div>
  );
}
