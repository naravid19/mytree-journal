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
} from "flowbite-react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

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
  const [formStartedDate, setFormStartedDate] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const addCodeRef = useRef<HTMLInputElement>(null);
  const editCodeRef = useRef<HTMLInputElement>(null);

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
    setFormStartedDate("");
    setFormError("");
  };

  const handleAddSubmit = async () => {
    if (!formCode.trim()) {
      setFormError("กรุณากรอกรหัสชุดการปลูก");
      return;
    }
    setFormError("");
    try {
      const res = await fetch(`${API_BASE}/api/batches/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_code: formCode,
          description: formDescription,
          started_date: formStartedDate || null,
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
    setFormStartedDate(batch.started_date || "");
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
      const res = await fetch(
        `${API_BASE}/api/batches/${selectedBatch.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_code: formCode,
            description: formDescription,
            started_date: formStartedDate || null,
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
      <main className="px-2 py-6 mx-auto w-full max-w-3xl md:max-w-4xl">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-800 md:text-3xl lg:text-4xl dark:text-green-300">
            🪴 ชุดการปลูกทั้งหมด
          </h1>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            เพิ่มชุดการปลูก
          </Button>
        </div>
        <Table>
          <TableHead>
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
                    <Button color="failure" size="xs" onClick={() => { setSelectedBatch(batch); setShowDeleteModal(true); }}>
                      ลบ
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
              <Label htmlFor="started">วันที่เริ่มต้น</Label>
              <Datepicker id="started" value={formStartedDate} onSelectedDateChanged={(d) => setFormStartedDate(d?.toISOString().split('T')[0] ?? "")} />
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
              <Datepicker id="startedEdit" value={formStartedDate} onSelectedDateChanged={(d) => setFormStartedDate(d?.toISOString().split('T')[0] ?? "")} />
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
