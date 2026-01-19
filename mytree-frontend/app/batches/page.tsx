"use client";
import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  TextInput,
  Textarea,
  Datepicker,
  Alert,
  Toast,
  Tooltip,
} from "flowbite-react";
import { HiCheckCircle, HiXCircle, HiTrash, HiArrowLeft, HiPlus, HiPencil, HiOutlineBeaker } from "react-icons/hi";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type Batch = {
  id: number;
  batch_code: string;
  description: string;
  started_date: string;
};

function formatDateLocal(date: Date | null): string {
  if (!date) return "";
  // เอาวันที่แบบ local จริงๆ
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date to Thai display format (e.g., "30 พ.ย. 2568")
function formatThaiDate(dateStr: string | null): string {
  if (!dateStr) return "ไม่ระบุ";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
                      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Buddhist Era
  return `${day} ${month} ${year}`;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartedDate, setFormStartedDate] = useState<Date | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  const addCodeRef = useRef<HTMLInputElement>(null);
  const editCodeRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const fetchBatches = () => {
    fetch(`${API_BASE}/api/batches/`)
      .then((res) => res.json())
      .then(setBatches)
      .catch(() => {
        setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
        setTimeout(() => setErrorMessage(""), 3000);
      });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const resetForm = () => {
    setFormCode("");
    setFormDescription("");
    setFormStartedDate(null);
    setFormError("");
  };

  const checkDuplicateBatchCode = (code: string, editingId?: number) => {
    if (!code.trim()) return "";
    const found = batches.find(
      (b) => b.batch_code.trim() === code.trim() && b.id !== editingId
    );
    return found ? "รหัสชุดการปลูกนี้ถูกใช้แล้ว" : "";
  };

  const handleAddSubmit = async () => {
    if (!formCode.trim()) {
      setFormError("กรุณากรอกรหัสชุดการปลูก");
      return;
    }
    if (checkDuplicateBatchCode(formCode, selectedBatch?.id)) {
      setDuplicateError("รหัสชุดการปลูกนี้ถูกใช้แล้ว");
      return;
    }
    setFormError("");
    try {
      const started_date_str = formatDateLocal(formStartedDate);
      const res = await fetch(`${API_BASE}/api/batches/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_code: formCode,
          description: formDescription,
          started_date: started_date_str,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowAddModal(false);
      resetForm();
      fetchBatches();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleShowEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormCode(batch.batch_code);
    setFormDescription(batch.description || "");
    setFormStartedDate(batch.started_date ? new Date(batch.started_date) : null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedBatch) return;
    if (!formCode.trim()) {
      setFormError("กรุณากรอกรหัสชุดการปลูก");
      return;
    }
    if (checkDuplicateBatchCode(formCode, selectedBatch.id)) {
      setDuplicateError("รหัสชุดการปลูกนี้ถูกใช้แล้ว");
      return;
    }
    setFormError("");
    try {
      const started_date_str = formatDateLocal(formStartedDate);
      const res = await fetch(
        `${API_BASE}/api/batches/${selectedBatch.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_code: formCode,
            description: formDescription,
            started_date: started_date_str,
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setShowEditModal(false);
      resetForm();
      fetchBatches();
      setSuccessMessage("แก้ไขข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedBatch) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/batches/${selectedBatch.id}/`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      setShowDeleteModal(false);
      fetchBatches();
      setSuccessMessage("ลบข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <main className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
              จัดการชุดการปลูก
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              เพิ่มและแก้ไขข้อมูลชุดการปลูกพืชของคุณ
            </p>
          </div>
          <div className="flex gap-3">
            <Button color="gray" size="sm" className="shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 border-0" onClick={() => router.push('/')}> 
              <HiArrowLeft className="mr-2 w-4 h-4" />
              กลับหน้าหลัก
            </Button>
            <Button 
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="shadow-lg transition-transform hover:scale-105 bg-linear-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none"
            >
              <HiPlus className="mr-2 w-5 h-5" />
              เพิ่มชุดการปลูก
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/50 dark:border-gray-700">
          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left text-gray-500 dark:text-gray-400">
              <TableHead className="text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-800/50 dark:text-gray-400 backdrop-blur-sm">
                <TableRow>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold">รหัสชุด</TableHeadCell>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold">รายละเอียด</TableHeadCell>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold">เริ่มเมื่อ</TableHeadCell>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold text-right">
                    จัดการ
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <TableRow key={batch.id} className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-gray-800/80">
                      <TableCell className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></div>
                          <span className="text-base font-mono">{batch.batch_code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-md text-gray-600 dark:text-gray-300">
                        <span className="line-clamp-2">{batch.description || <span className="italic text-gray-400 opacity-70">ไม่มีรายละเอียด</span>}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {formatThaiDate(batch.started_date)}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip content="แก้ไข">
                            <Button size="xs" color="light" aria-label="แก้ไขชุดการปลูก" className="rounded-full w-8 h-8 p-0 flex items-center justify-center border-gray-200 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all" onClick={() => handleShowEdit(batch)}>
                              <HiPencil className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="ลบ">
                            <Button size="xs" color="light" aria-label="ลบชุดการปลูก" className="rounded-full w-8 h-8 p-0 flex items-center justify-center border-gray-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-all" onClick={() => { setSelectedBatch(batch); setShowDeleteModal(true); }}>
                              <HiTrash className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <HiOutlineBeaker className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-lg font-medium">ไม่พบข้อมูลชุดการปลูก</span>
                        <p className="text-sm text-gray-400 mt-1">เริ่มเพิ่มชุดการปลูกใหม่ได้เลย</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} initialFocus={addCodeRef} size="md">
        <ModalHeader className="border-b-0">
          <span className="text-xl font-bold text-green-700 dark:text-green-400">เพิ่มชุดการปลูก</span>
        </ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="batchAddError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          {duplicateError && (
            <Alert id="batchAddError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{duplicateError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="code" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">รหัสชุดการปลูก <span className="text-red-500">*</span></Label>
              <TextInput
                ref={addCodeRef}
                id="code"
                placeholder="เช่น BATCH-001"
                value={formCode}
                onChange={(e) => {
                  setFormCode(e.target.value);
                  setDuplicateError(checkDuplicateBatchCode(e.target.value));
                }}
                className="focus:ring-green-500"
                shadow
              />
            </div>
            <div>
              <Label htmlFor="desc" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">รายละเอียด</Label>
              <Textarea 
                id="desc" 
                rows={4} 
                placeholder="รายละเอียดเกี่ยวกับชุดการปลูกนี้..."
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                className="focus:ring-green-500"
                shadow
              />
            </div>
            <div>
              <Label htmlFor="started" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">วันที่เริ่มต้น</Label>
              <Datepicker
                id="started"
                value={formStartedDate}
                onChange={(date: Date | null) => setFormStartedDate(date)}
                placeholder="เลือกวันที่เริ่มต้น"
                className="w-full"
                showClearButton={true}
                weekStart={0}
                autoHide={true}
                theme={{
                  popup: {
                    header: {
                      base: "z-9999 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 flex items-center justify-between gap-2 mt-2"
                    },
                    view: {
                      base: ""
                    },
                    footer: {
                      base: ""
                    }
                  }
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t-0 justify-end gap-2">
          <Button color="gray" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-linear-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none" onClick={handleAddSubmit} disabled={!!duplicateError || !!formError}>
            บันทึกข้อมูล
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} initialFocus={editCodeRef} size="md">
        <ModalHeader className="border-b-0">
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">แก้ไขชุดการปลูก</span>
        </ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="batchEditError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          {duplicateError && (
            <Alert id="batchEditError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{duplicateError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="codeEdit" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">รหัสชุดการปลูก <span className="text-red-500">*</span></Label>
              <TextInput
                ref={editCodeRef}
                id="codeEdit"
                value={formCode}
                onChange={(e) => {
                  setFormCode(e.target.value);
                  setDuplicateError(checkDuplicateBatchCode(e.target.value, selectedBatch?.id));
                }}
                className="focus:ring-blue-500"
                shadow
              />
            </div>
            <div>
              <Label htmlFor="descEdit" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">รายละเอียด</Label>
              <Textarea 
                id="descEdit" 
                rows={4} 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                className="focus:ring-blue-500"
                shadow
              />
            </div>
            <div>
              <Label htmlFor="startedEdit" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">วันที่เริ่มต้น</Label>
              <Datepicker
                id="startedEdit"
                value={formStartedDate}
                onChange={(d: Date | null) => setFormStartedDate(d)}
                className="w-full"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t-0 justify-end gap-2">
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-none" onClick={handleEditSubmit} disabled={!!duplicateError || !!formError}>
            บันทึกการแก้ไข
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
        <ModalHeader className="border-b-0" />
        <ModalBody>
          <div className="text-center">
            <HiTrash className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-red-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              คุณต้องการลบชุดการปลูก <span className="font-bold text-gray-900 dark:text-white">"{selectedBatch?.batch_code}"</span> ใช่หรือไม่?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteSubmit}>
                ยืนยันลบ
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
        {successMessage && (
          <Toast className="flex gap-2 items-center text-green-800 bg-green-50 border border-green-300 shadow-lg rounded-xl dark:bg-green-800 dark:text-green-100">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            <span className="font-semibold">{successMessage}</span>
          </Toast>
        )}
        {errorMessage && (
          <Toast className="flex gap-2 items-center text-red-800 bg-red-50 border border-red-300 shadow-lg rounded-xl dark:bg-red-800 dark:text-red-100">
            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            <span className="font-semibold">{errorMessage}</span>
          </Toast>
        )}
      </div>
    </div>
  );
}
