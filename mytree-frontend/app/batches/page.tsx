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
  DarkThemeToggle,
  Card,
} from "flowbite-react";
import { HiCheckCircle, HiXCircle, HiTrash, HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Batch = {
  id: number;
  batch_code: string;
  description: string;
  started_date: string;
};

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

  const handleAddSubmit = async () => {
    if (!formCode.trim()) {
      setFormError("กรุณากรอกรหัสชุดการปลูก");
      return;
    }
    setFormError("");
    try {
      const started_date_str = formStartedDate
        ? formStartedDate.toISOString().split('T')[0]
        : "";
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
    setFormError("");
    try {
      const started_date_str = formStartedDate
        ? formStartedDate.toISOString().split('T')[0]
        : "";
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">
      {/* ปุ่มเปลี่ยนโหมดแสง/มืด (Floating) */}
      <div className="fixed top-4 right-4 z-[20001]">
        <Tooltip content="เปลี่ยนโหมดแสง/มืด" placement="left">
          <DarkThemeToggle className="rounded-full shadow-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 hover:scale-110 transition-all w-12 h-12 flex items-center justify-center" />
        </Tooltip>
      </div>
      <main className="px-2 py-6 mx-auto w-full max-w-3xl md:max-w-4xl">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-800 md:text-3xl lg:text-4xl dark:text-green-300">
            🪴 ชุดการปลูกทั้งหมด
          </h1>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            เพิ่มชุดการปลูก
          </Button>
        </div>
        <Button color="gray" size="sm" className="flex items-center gap-2 mb-4" onClick={() => router.push('/')}>
          <HiArrowLeft className="w-4 h-4" />
          กลับหน้ารายการต้นไม้
        </Button>
        <Card className="w-full rounded-2xl border border-gray-200 shadow-2xl bg-white/80 dark:bg-gray-900/90 dark:border-gray-700">
          <div className="overflow-x-auto rounded-xl">
            <Table hoverable className="min-w-[650px] text-base font-kanit dark:bg-gray-900/80 dark:text-gray-100">
              <TableHead className="bg-blue-50 dark:bg-gray-800/80 dark:text-gray-100">
                <TableRow>
                  <TableHeadCell>รหัสชุด</TableHeadCell>
                  <TableHeadCell>รายละเอียด</TableHeadCell>
                  <TableHeadCell>เริ่มเมื่อ</TableHeadCell>
                  <TableHeadCell>
                    <span className="sr-only">Actions</span>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {batch.batch_code}
                    </TableCell>
                    <TableCell>{batch.description}</TableCell>
                    <TableCell>{batch.started_date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Button size="xs" onClick={() => handleShowEdit(batch)}>
                          แก้ไข
                        </Button>
                        <Tooltip content="ลบ">
                          <Button color="failure" size="xs" className="flex items-center gap-1 px-3 py-1 rounded-lg shadow hover:scale-105 transition" onClick={() => { setSelectedBatch(batch); setShowDeleteModal(true); }}>
                            <HiTrash className="w-4 h-4" />
                            <span className="sr-only">ลบ</span>
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
      {/* Add Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} initialFocus={addCodeRef}>
        <ModalHeader>เพิ่มชุดการปลูก</ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="batchAddError" color="failure" className="mb-4">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">รหัสชุดการปลูก</Label>
              <TextInput ref={addCodeRef} id="code" value={formCode} onChange={(e) => setFormCode(e.target.value)} aria-describedby={formError ? 'batchAddError' : undefined} />
            </div>
            <div>
              <Label htmlFor="desc">รายละเอียด</Label>
              <Textarea id="desc" rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="started" className="font-semibold">วันที่เริ่มต้น</Label>
              <Datepicker
                id="started"
                value={formStartedDate}
                onChange={(date: Date | null) => setFormStartedDate(date)}
                placeholder="เลือกวันที่เริ่มต้น"
                className="mt-1 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 text-base font-kanit transition-all"
                aria-label="เลือกวันที่เริ่มต้นชุดการปลูก"
                required
                disabled={false}
                showClearButton={true}
                weekStart={0}
                autoHide={true}
                theme={{
                  popup: {
                    base: "z-[10000] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4",
                    title: "text-lg font-bold text-gray-800 dark:text-gray-100",
                    selectors: {
                      base: "flex items-center justify-between gap-2 mt-2",
                      button: {
                        base: "rounded-lg p-1 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700 transition",
                        prev: "mr-2",
                        next: "ml-2",
                        view: "font-bold text-blue-700 dark:text-blue-300"
                      }
                    }
                  },
                  input: {
                    base: "w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-700 text-base font-kanit transition-all",
                    icon: "text-gray-400 dark:text-gray-500"
                  }
                }}
                popperProps={{
                  strategy: "fixed"
                }}
              />
              {/* error state */}
              {formError && (
                <span className="text-xs text-red-500 mt-1 block">{formError}</span>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleAddSubmit}>บันทึก</Button>
          <Button color="gray" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} initialFocus={editCodeRef}>
        <ModalHeader>แก้ไขชุดการปลูก</ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="batchEditError" color="failure" className="mb-4">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="codeEdit">รหัสชุดการปลูก</Label>
              <TextInput ref={editCodeRef} id="codeEdit" value={formCode} onChange={(e) => setFormCode(e.target.value)} aria-describedby={formError ? 'batchEditError' : undefined} />
            </div>
            <div>
              <Label htmlFor="descEdit">รายละเอียด</Label>
              <Textarea id="descEdit" rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="startedEdit">วันที่เริ่มต้น</Label>
              <Datepicker
                id="startedEdit"
                value={formStartedDate}
                onChange={(d: Date | null) => setFormStartedDate(d)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleEditSubmit}>บันทึก</Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
      {/* Delete Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>ยืนยันการลบ</ModalHeader>
        <ModalBody>คุณต้องการลบชุดการปลูก {selectedBatch?.batch_code} ?</ModalBody>
        <ModalFooter>
          <Button color="failure" onClick={handleDeleteSubmit}>ลบ</Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
      <div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite">
        {successMessage && (
          <Toast className="flex gap-2 items-center text-green-800 bg-green-50 border border-green-300 shadow dark:bg-green-800 dark:text-green-100">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            <span className="font-semibold">{successMessage}</span>
          </Toast>
        )}
        {errorMessage && (
          <Toast className="flex gap-2 items-center text-red-800 bg-red-50 border border-red-300 shadow dark:bg-red-800 dark:text-red-100">
            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            <span className="font-semibold">{errorMessage}</span>
          </Toast>
        )}
      </div>
    </div>
  );
}
