
"use client";

import React, { useState } from "react";
import { TreeLog, Image as TreeImage } from "../app/types";
import { HiPlus, HiPhotograph, HiPencil, HiTrash, HiCheck, HiX, HiBeaker, HiScissors, HiLightningBolt } from "react-icons/hi";
import { Button, Modal, ModalHeader, ModalBody, Label, TextInput, Textarea, Select, FileInput, Spinner } from "flowbite-react";
import { ACTION_LABELS } from "../app/constants";
import { formatDate, formatTime } from "../app/utils";

interface TreeTimelineProps {
  logs: TreeLog[];
  onAddLog: (formData: FormData) => Promise<void>;
  onDeleteLog: (id: number) => Promise<void>;
  loading?: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  water: <span className="text-blue-500 text-xl">💧</span>,
  feed: <span className="text-green-500 text-xl">🍼</span>,
  flush: <span className="text-cyan-500 text-xl">🚿</span>,
  prune: <HiScissors className="text-orange-500 text-xl" />,
  train: <span className="text-purple-500 text-xl">➰</span>,
  flip: <HiLightningBolt className="text-yellow-400 text-xl" />,
  harvest: <span className="text-red-500 text-xl">✂️</span>,
  dry: <span className="text-amber-700 text-xl">🍂</span>,
  cure: <span className="text-green-700 text-xl">🏺</span>,
  photo: <HiPhotograph className="text-pink-500 text-xl" />,
  issue: <span className="text-red-600 text-xl">🐛</span>,
  environment: <span className="text-gray-500 text-xl">🌡️</span>,
  note: <HiPencil className="text-gray-400 text-xl" />,
  other: <span className="text-gray-400 text-xl">📌</span>
};

export function TreeTimeline({ logs, onAddLog, onDeleteLog, loading }: TreeTimelineProps) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<{
    action_type: string;
    title: string;
    notes: string;
    action_date: string;
    ph: string;
    ec: string;
    temp: string;
    humidity: string;
    wet_weight: string;
    dry_weight: string;
  }>({
    action_type: "note",
    title: "",
    notes: "",
    action_date: new Date().toISOString().split('T')[0],
    ph: "",
    ec: "",
    temp: "",
    humidity: "",
    wet_weight: "",
    dry_weight: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      images.forEach((file) => {
        formData.append("images", file);
      });

      await onAddLog(formData);
      setShowModal(false);
      setForm({
        action_type: "note",
        title: "",
        notes: "",
        action_date: new Date().toISOString().split('T')[0],
        ph: "",
        ec: "",
        temp: "",
        humidity: "",
        wet_weight: "",
        dry_weight: ""
      });
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-gray-200 flex items-center gap-2">
            <span className="text-2xl">📅</span> Timeline & Journal
          </h3>
          <Button 
            color="custom"
            className="bg-linear-to-br from-green-500 to-blue-500 text-white border-none"
            onClick={() => setShowModal(true)}
          >
             <HiPlus className="mr-2 h-5 w-5" />
             เพิ่มบันทึก
          </Button>
       </div>

       <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8">
          {logs.length === 0 && (
             <div className="ml-6 p-4 bg-background dark:bg-background-dark rounded-lg text-text-muted text-center">
                ยังไม่มีรายการบันทึก
             </div>
          )}

          {logs.map((log) => (
             <div key={log.id} className="relative ml-6 group">
                <span className="absolute -left-[37px] top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface ring-4 ring-surface dark:bg-surface-dark dark:ring-surface-dark shadow-sm">
                   {ACTION_ICONS[log.action_type] || ACTION_ICONS.other}
                </span>
                
                <div className="p-4 bg-surface dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="text-sm text-text-muted mb-1">
                             {formatDate(log.action_date)} • {formatTime(log.created_at)}
                          </div>
                          <h4 className="text-lg font-semibold text-text dark:text-text-dark flex items-center gap-2">
                             {ACTION_LABELS[log.action_type]}
                             {log.title && <span className="font-normal text-text-muted">- {log.title}</span>}
                          </h4>
                       </div>
                       <button 
                          onClick={() => onDeleteLog(log.id)}
                          className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                       >
                          <HiTrash className="w-5 h-5"/>
                       </button>
                    </div>

                    {log.notes && (
                       <p className="mt-2 text-text dark:text-gray-300 bg-background dark:bg-background-dark p-3 rounded-lg text-sm">
                          {log.notes}
                       </p>
                    )}

                    {/* Harvest Data Display */}
                    {(log.wet_weight || log.dry_weight) && (
                        <div className="mt-2 flex gap-3">
                            {log.wet_weight && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    💦 Wet: {log.wet_weight}g
                                </span>
                            )}
                            {log.dry_weight && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    🍂 Dry: {log.dry_weight}g
                                </span>
                            )}
                        </div>
                    )}

                    {(log.ph || log.ec || log.temp || log.humidity) && (
                       <div className="mt-3 flex flex-wrap gap-3 text-xs md:text-sm">
                          {log.ph && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">pH: {log.ph}</span>}
                          {log.ec && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">EC: {log.ec}</span>}
                          {log.temp && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md">Temp: {log.temp}°C</span>}
                          {log.humidity && <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-md">RH: {log.humidity}%</span>}
                       </div>
                    )}

                    {log.images && log.images.length > 0 && (
                       <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {log.images.map((img) => (
                             <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-600">
                                <img src={img.thumbnail || img.image} alt="Log update" className="object-cover w-full h-full" />
                             </div>
                          ))}
                       </div>
                    )}
                </div>
             </div>
          ))}
       </div>

       {/* Add Log Modal */}
       <Modal show={showModal} onClose={() => setShowModal(false)} size="2xl">
          <ModalHeader>เพิ่มบันทึกใหม่ - Journal Entry</ModalHeader>
          <ModalBody>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <div className="mb-2 block"><Label>ประเภทกิจกรรม</Label></div>
                      <Select 
                         value={form.action_type} 
                         onChange={e => setForm({...form, action_type: e.target.value})}
                         required
                      >
                         {Object.entries(ACTION_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                         ))}
                      </Select>
                   </div>
                   <div>
                       <div className="mb-2 block"><Label>วันที่</Label></div>
                       <TextInput 
                          type="date" 
                          value={form.action_date}
                          onChange={e => setForm({...form, action_date: e.target.value})}
                          required
                       />
                   </div>
                </div>

                <div>
                   <div className="mb-2 block"><Label>หัวข้อ (ไม่บังคับ)</Label></div>
                   <TextInput 
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                      placeholder="เช่น เปลี่ยนสูตรปุ๋ย, พบใบเหลือง" 
                   />
                </div>

                <div>
                   <div className="mb-2 block"><Label>รายละเอียด / บันทึกช่วยจำ</Label></div>
                   <Textarea 
                      rows={3}
                      value={form.notes}
                      onChange={e => setForm({...form, notes: e.target.value})}
                      placeholder="รายละเอียดเพิ่มเติม..." 
                   />
                </div>

                {/* Env Stats */}
                <div className="p-3 bg-background-soft rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                   <div className="text-sm font-medium mb-3 text-gray-500">สภาพแวดล้อม (Environmental Stats)</div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                         <Label className="text-xs">pH</Label>
                         <TextInput sizing="sm" type="number" step="0.01" placeholder="6.2" value={form.ph} onChange={e => setForm({...form, ph: e.target.value})} />
                      </div>
                      <div>
                         <Label className="text-xs">EC (uS/cm)</Label>
                         <TextInput sizing="sm" type="number" step="0.01" placeholder="1200" value={form.ec} onChange={e => setForm({...form, ec: e.target.value})} />
                      </div>
                      <div>
                         <Label className="text-xs">Temp (°C)</Label>
                         <TextInput sizing="sm" type="number" step="0.1" placeholder="28.5" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} />
                      </div>
                      <div>
                         <Label className="text-xs">Humidity (%)</Label>
                         <TextInput sizing="sm" type="number" step="0.1" placeholder="60.0" value={form.humidity} onChange={e => setForm({...form, humidity: e.target.value})} />
                      </div>
                   </div>
                </div>

                {/* Weight Inputs (Only for Harvest/Dry) */}
                {(form.action_type === 'harvest' || form.action_type === 'dry' || form.action_type === 'cure') && (
                     <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-dashed border-green-300 dark:border-green-700 animate-fade-in">
                        <div className="text-sm font-medium mb-3 text-green-700 dark:text-green-400">ข้อมูลผลผลิต (Harvest Data)</div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <Label className="text-xs">น้ำหนักสด (Wet Weight - g)</Label>
                              <TextInput sizing="sm" type="number" step="0.01" placeholder="0.00" value={form.wet_weight} onChange={e => setForm({...form, wet_weight: e.target.value})} />
                           </div>
                           <div>
                              <Label className="text-xs">น้ำหนักแห้ง (Dry Weight - g)</Label>
                              <TextInput sizing="sm" type="number" step="0.01" placeholder="0.00" value={form.dry_weight} onChange={e => setForm({...form, dry_weight: e.target.value})} />
                           </div>
                        </div>
                     </div>
                )}

                <div>
                   <div className="mb-2 block"><Label>รูปภาพประกอบ</Label></div>
                   <FileInput 
                      multiple 
                      accept="image/*"
                      onChange={e => {
                         if (e.target.files) {
                            setImages(Array.from(e.target.files));
                         }
                      }}
                   />
                   <p className="text-xs text-gray-500 mt-1">เลือกได้หลายรูป</p>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                   <Button color="gray" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                      ยกเลิก
                   </Button>
                   <Button 
                    type="submit" 
                    color="custom"
                    className="bg-linear-to-br from-green-500 to-blue-500 text-white border-none"
                    disabled={isSubmitting}
                   >
                    {isSubmitting ? <><Spinner size="sm" className="mr-2" /> กำลังบันทึก...</> : "บันทึกข้อมูล"}
                   </Button>
                </div>
             </form>
          </ModalBody>
       </Modal>
    </div>
  );
}
