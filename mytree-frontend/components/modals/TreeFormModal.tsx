import React, { useRef } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Textarea,
  FileInput,
  Select,
  Spinner,
} from "flowbite-react";
import { HiUpload, HiX, HiInformationCircle } from "react-icons/hi";
import Image from "next/image";
import { TreeFormState } from "../../app/formHelpers";
import { Strain, Batch } from "../../app/types";
import { TREE_STATUS, SEX, SEX_OPTIONS, TREE_STATUS_OPTIONS, GROWTH_STAGE_OPTIONS } from "../../app/constants";

interface TreeFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: TreeFormState; // Using shared type
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Drag and drop props
  onDragOverDoc: (e: React.DragEvent) => void;
  onDragLeaveDoc: (e: React.DragEvent) => void;
  onDropDoc: (e: React.DragEvent) => void;
  isDraggingDoc: boolean;
  onDragOverImages: (e: React.DragEvent) => void;
  onDragLeaveImages: (e: React.DragEvent) => void;
  onDropImages: (e: React.DragEvent) => void;
  isDraggingImages: boolean;
  // State props
  imageFiles: File[];
  imagePreviewUrls: string[];
  clearImageFiles: () => void;
  // Data props
  strains: Strain[];
  batches: Batch[];
  // Status props
  submitting: boolean;
  isEditMode?: boolean;
  formError?: string;
}

export const TreeFormModal: React.FC<TreeFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  form,
  onChange,
  onImageFilesChange,
  onDocumentChange,
  onDragOverDoc,
  onDragLeaveDoc,
  onDropDoc,
  isDraggingDoc,
  onDragOverImages,
  onDragLeaveImages,
  onDropImages,
  isDraggingImages,
  imageFiles,
  imagePreviewUrls,
  clearImageFiles,
  strains,
  batches,
  submitting,
  isEditMode = false,
  formError,
}) => {
  const initialRef = useRef<HTMLSelectElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      show={show}
      size="5xl"
      aria-modal="true"
      initialFocus={initialRef}
      onClose={onClose}
      popup
    >
      <ModalHeader className="rounded-t-2xl border-b border-gray-100 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 dark:border-gray-700">
        <span className="text-2xl font-bold bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-kanit">
          {isEditMode ? "แก้ไขข้อมูลต้นไม้" : "เพิ่มต้นไม้ใหม่"}
        </span>
      </ModalHeader>
      <ModalBody className="p-0 overflow-y-auto max-h-[80vh] scrollbar-thin bg-background-soft/50 dark:bg-background-soft/50">
        {formError && (
          <div className="mx-6 mt-6 mb-2 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-center">
              <HiInformationCircle className="w-5 h-5 mr-2" />
              <p className="font-medium">เกิดข้อผิดพลาด!</p>
            </div>
            <p className="ml-7 mt-1 text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-6">
          {/* ข้อมูลทั่วไป */}
          <div className="mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-gray-700">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-6 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm dark:bg-green-900 dark:text-green-300">1</span>
              ข้อมูลทั่วไป
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Strain */}
              <div>
                <Label htmlFor="strain" className="mb-2 block font-semibold text-text-muted dark:text-gray-300">
                  สายพันธุ์ (Strain) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Select
                    id="strain"
                    name="strainUuid"
                    value={form.strainUuid}
                    onChange={onChange}
                    required
                  >
                    <option value="">กรุณาเลือกสายพันธุ์...</option>
                    {strains.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Batch */}
              <div>
                <Label htmlFor="batch" className="mb-2 block font-semibold text-text-muted dark:text-gray-300">Batch Code</Label>
                <Select id="batch" name="batch_id" value={form.batch_id || ""} onChange={onChange}>
                  <option value="">-- เลือก Batch --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Variety */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">Variety Type</Label>
                <Select name="variety" value={form.variety} onChange={onChange}>
                  <option value="Photoperiod">Photoperiod</option>
                  <option value="Auto-flowering">Auto-flowering</option>
                </Select>
              </div>

              {/* Nickname */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">ชื่อเล่น (Nickname)</Label>
                <TextInput
                  name="nickname"
                  value={form.nickname}
                  onChange={onChange}
                  placeholder="เช่น Alpha, B1, etc."
                />
              </div>

              {/* Sex */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">เพศ (Sex)</Label>
                <Select name="sex" value={form.sex} onChange={onChange} ref={initialRef}>
                   {SEX_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                   ))}
                </Select>
              </div>

              {/* Clone Source */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">ต้นแม่ (Clone Source ID)</Label>
                <TextInput
                  type="number"
                  name="clone_source"
                  value={form.clone_source || ""}
                  onChange={onChange}
                  placeholder="ระบุ ID ต้นแม่ (ถ้ามี)"
                />
              </div>

              {/* Generation */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">รุ่น (Generation)</Label>
                <TextInput
                  name="generation"
                  value={form.generation}
                  onChange={onChange}
                  placeholder="เช่น F1, S1, R1"
                />
              </div>

              {/* Location */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">สถานที่ปลูก</Label>
                <TextInput
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="เช่น Tent 1, Outdoor"
                />
              </div>

              {/* Status */}
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">สถานะ</Label>
                <Select name="status" value={form.status} onChange={onChange}>
                   {Object.values(TREE_STATUS).map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </Select>
              </div>
            </div>
          </div>

          {/* ไทม์ไลน์และการเติบโต */}
          <div className="mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-gray-700">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-6 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm dark:bg-blue-900 dark:text-blue-300">2</span>
              ไทม์ไลน์ & การเติบโต
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">วันที่เริ่มงอก</Label>
                <TextInput
                  type="date"
                  name="germination_date"
                  value={form.germination_date}
                  onChange={onChange}
                />
              </div>
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">วันที่ปลูก (Plant Date)</Label>
                <TextInput
                  type="date"
                  name="plant_date"
                  value={form.plant_date}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">ระยะการเจริญเติบโต</Label>
                <Select name="growth_stage" value={form.growth_stage} onChange={onChange}>
                    {GROWTH_STAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Select>
              </div>
            </div>
          </div>

           {/* พันธุกรรมและการผสมพันธุ์ */}
           <div className="mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-gray-700">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-6 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm dark:bg-purple-900 dark:text-purple-300">3</span>
              พันธุกรรม & การผสมพันธุ์
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">พ่อพันธุ์ (Male ID)</Label>
                    <TextInput type="number" name="parent_male" value={form.parent_male || ""} onChange={onChange} placeholder="ID" />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">แม่พันธุ์ (Female ID)</Label>
                    <TextInput type="number" name="parent_female" value={form.parent_female || ""} onChange={onChange} placeholder="ID" />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">ผสมโดย (Pollinated By ID)</Label>
                    <TextInput type="number" name="pollinated_by" value={form.pollinated_by || ""} onChange={onChange} placeholder="ID" />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">วันที่ผสมเกสร</Label>
                    <TextInput type="date" name="pollination_date" value={form.pollination_date} onChange={onChange} />
                 </div>
            </div>
          </div>

          {/* การเก็บเกี่ยว */}
          <div className="mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-gray-700">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-6 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm dark:bg-amber-900 dark:text-amber-300">4</span>
              การเก็บเกี่ยว
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">วันที่เก็บเกี่ยว</Label>
                    <TextInput type="date" name="harvest_date" value={form.harvest_date} onChange={onChange} />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">ปริมาณผลผลิต (g)</Label>
                    <TextInput type="number" name="yield_amount" value={form.yield_amount || ""} onChange={onChange} step="0.01" />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">คุณภาพดอก</Label>
                    <TextInput name="flower_quality" value={form.flower_quality} onChange={onChange} />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">จำนวนเมล็ดที่ได้</Label>
                    <TextInput type="number" name="seed_count" value={form.seed_count || ""} onChange={onChange} />
                 </div>
                 <div>
                    <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">วันที่เก็บเมล็ด</Label>
                    <TextInput type="date" name="seed_harvest_date" value={form.seed_harvest_date} onChange={onChange} />
                 </div>
            </div>
          </div>


          {/* Documents & Images */}
          <div className="mb-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-surface-dark dark:border-gray-700">
             <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-6 flex items-center gap-2 border-b pb-2 dark:border-gray-700">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm dark:bg-indigo-900 dark:text-indigo-300">5</span>
              เอกสาร & รูปภาพ
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Document Upload */}
               <div>
                  <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">เอกสารแนบ (PDF/Image)</Label>
                  <div
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-background-soft hover:bg-gray-100 transition-all ${
                      isDraggingDoc 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                    onDragOver={onDragOverDoc}
                    onDragLeave={onDragLeaveDoc}
                    onDrop={onDropDoc}
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <HiUpload className={`w-8 h-8 mb-3 ${isDraggingDoc ? "text-green-500" : "text-gray-400"}`} />
                      <p className="mb-2 text-sm text-text-muted dark:text-gray-400">
                        <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
                      </p>
                      <p className="text-xs text-text-muted dark:text-gray-400">PDF, PNG, JPG (MAX. 20MB)</p>
                    </div>
                    <FileInput
                      id="document"
                      name="document"
                      className="hidden"
                      onChange={onDocumentChange}
                      ref={documentInputRef}
                    />
                  </div>
                  {form.document && (
                     <div className="mt-3 flex items-center p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                        <span className="text-sm truncate flex-1 min-w-0">{form.document.name}</span>
                        <span className="ml-2 text-xs font-bold bg-green-200 px-2 py-0.5 rounded text-green-800 dark:bg-green-800 dark:text-green-100">NEW</span>
                     </div>
                  )}
               </div>

               {/* Image Upload */}
               <div>
                  <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">รูปภาพ (Multi-upload)</Label>
                  <div
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-background-soft hover:bg-gray-100 transition-all ${
                      isDraggingImages
                      ? "border-green-500 bg-green-50 dark:bg-green-900/10" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                    onDragOver={onDragOverImages}
                    onDragLeave={onDragLeaveImages}
                    onDrop={onDropImages}
                    onClick={() => imagesInputRef.current?.click()}
                  >
                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <HiUpload className={`w-8 h-8 mb-3 ${isDraggingImages ? "text-green-500" : "text-gray-400"}`} />
                      <p className="mb-2 text-sm text-text-muted dark:text-gray-400">
                        <span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง
                      </p>
                      <p className="text-xs text-text-muted dark:text-gray-400">PNG, JPG (MAX. 20MB)</p>
                    </div>
                    <FileInput
                      id="images"
                      name="images"
                      multiple
                      className="hidden"
                      onChange={onImageFilesChange}
                      ref={imagesInputRef}
                    />
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                         {imageFiles.length} รูปภาพที่เลือก:
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                         {imagePreviewUrls.map((url, idx) => (
                           <div key={idx} className="relative aspect-square">
                              <Image
                                src={url}
                                alt={`Preview ${idx}`}
                                fill
                                className="object-cover rounded-lg border border-gray-200"
                              />
                           </div>
                         ))}
                         {imageFiles.length > 0 && (
                            <button
                              type="button"
                              onClick={clearImageFiles}
                              className="flex items-center justify-center p-2 rounded-lg border-2 border-dashed border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                              title="ลบทั้งหมด"
                            >
                               <HiX className="w-5 h-5" />
                            </button>
                         )}
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
          
          {/* หมายเหตุ */}
          <div className="mb-8 p-6 rounded-2xl border border-gray-100 bg-surface dark:bg-surface-dark dark:border-gray-700">
             <Label className="mb-2 block font-semibold text-text-muted dark:text-gray-300">หมายเหตุเพิ่มเติม</Label>
             <Textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={4}
                className="focus:ring-2 focus:ring-green-500 focus:border-transparent"
             />
          </div>

          <button type="submit" className="hidden" aria-hidden="true" />
        </form>
      </ModalBody>
      <ModalFooter className="gap-3 justify-end pt-4 rounded-b-2xl bg-surface dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <Button
           onClick={onSubmit}
           disabled={submitting}
           color="success"
           size="lg"
           className="px-6 font-kanit font-medium shadow-lg shadow-green-200 dark:shadow-none transition-transform active:scale-95"
        >
           {submitting ? (
             <>
               <Spinner size="sm" className="mr-2" />
               กำลังบันทึก...
             </>
           ) : (
             isEditMode ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"
           )}
        </Button>
        <Button
          color="gray"
          size="lg"
          onClick={onClose}
          className="font-kanit"
        >
          ยกเลิก
        </Button>
      </ModalFooter>
    </Modal>
  );
};
