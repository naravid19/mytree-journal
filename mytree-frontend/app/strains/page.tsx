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
  Alert,
  Toast,
  Tooltip,
  Card,
  Badge,
} from "flowbite-react";
import { HiCheckCircle, HiXCircle, HiTrash, HiArrowLeft, HiPencil, HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type Strain = {
  id: number;
  name: string;
  description: string;
};

export default function StrainsPage() {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState<Strain | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [strainDuplicateError, setStrainDuplicateError] = useState("");

  const addNameRef = useRef<HTMLInputElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const fetchStrains = () => {
    fetch(`${API_BASE}/api/strains/`)
      .then((res) => res.json())
      .then(setStrains)
      .catch(() => {
        setErrorMessage("โหลดข้อมูลไม่สำเร็จ");
        setTimeout(() => setErrorMessage(""), 3000);
      });
  };

  useEffect(() => {
    fetchStrains();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormError("");
  };

  const handleAddSubmit = async () => {
    if (checkDuplicateStrainName(formName, selectedStrain?.id)) {
      setStrainDuplicateError("ชื่อสายพันธุ์นี้ถูกใช้แล้ว");
      return;
    }
    if (!formName.trim()) {
      setFormError("กรุณากรอกชื่อสายพันธุ์");
      return;
    }
    setFormError("");
    try {
      const res = await fetch(`${API_BASE}/api/strains/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, description: formDescription }),
      });
      if (!res.ok) throw new Error(await res.text());
      setShowAddModal(false);
      resetForm();
      fetchStrains();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleShowEdit = (strain: Strain) => {
    setSelectedStrain(strain);
    setFormName(strain.name);
    setFormDescription(strain.description || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedStrain) return;
    if (checkDuplicateStrainName(formName, selectedStrain.id)) {
      setStrainDuplicateError("ชื่อสายพันธุ์นี้ถูกใช้แล้ว");
      return;
    }
    if (!formName.trim()) {
      setFormError("กรุณากรอกชื่อสายพันธุ์");
      return;
    }
    setFormError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/strains/${selectedStrain.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formName, description: formDescription }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setShowEditModal(false);
      resetForm();
      fetchStrains();
      setSuccessMessage("แก้ไขข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStrain) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/strains/${selectedStrain.id}/`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      setShowDeleteModal(false);
      fetchStrains();
      setSuccessMessage("ลบข้อมูลสำเร็จ");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  function checkDuplicateStrainName(name: string, editingId?: number) {
    if (!name.trim()) return "";
    const found = strains.find(
      (s) => s.name.trim() === name.trim() && s.id !== editingId
    );
    return found ? "ชื่อสายพันธุ์นี้ถูกใช้แล้ว" : "";
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">
      {/* ปุ่มเปลี่ยนโหมดแสง/มืด (Floating) */}

      <main className="px-4 py-8 mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
              สายพันธุ์ทั้งหมด
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">จัดการข้อมูลสายพันธุ์ต้นไม้ของคุณ</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="shadow-lg transition-transform hover:scale-105 bg-linear-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none"
          >
            <HiPlus className="mr-2 w-5 h-5" />
            เพิ่มสายพันธุ์
          </Button>
        </div>
        
        <Button color="gray" size="sm" className="flex gap-2 items-center mb-6 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => router.push('/')}> 
          <HiArrowLeft className="mr-2 w-4 h-4" />
          กลับหน้ารายการต้นไม้
        </Button>

        <Card className="overflow-hidden rounded-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left text-gray-500 dark:text-gray-400">
              <TableHead className="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <TableRow>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold">ชื่อสายพันธุ์</TableHeadCell>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold">รายละเอียด</TableHeadCell>
                  <TableHeadCell className="px-6 py-4 text-sm font-bold text-right">
                    จัดการ
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {strains.length > 0 ? (
                  strains.map((strain) => (
                    <TableRow key={strain.id} className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700">
                      <TableCell className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {strain.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-md truncate">
                        {strain.description || <span className="italic text-gray-400">ไม่มีรายละเอียด</span>}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip content="แก้ไข">
                            <Button size="xs" color="light" className="border-gray-200 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:hover:bg-gray-600" onClick={() => handleShowEdit(strain)}>
                              <HiPencil className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="ลบ">
                            <Button size="xs" color="light" className="border-gray-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-600 dark:hover:bg-gray-600" onClick={() => { setSelectedStrain(strain); setShowDeleteModal(true); }}>
                              <HiTrash className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                      ไม่พบข้อมูลสายพันธุ์
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Add Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} initialFocus={addNameRef} size="md">
        <ModalHeader className="border-b-0">
          <span className="text-xl font-bold text-green-700 dark:text-green-400">เพิ่มสายพันธุ์ใหม่</span>
        </ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="strainAddError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          {strainDuplicateError && (
            <Alert color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{strainDuplicateError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">ชื่อสายพันธุ์ <span className="text-red-500">*</span></Label>
              <TextInput
                ref={addNameRef}
                id="name"
                placeholder="เช่น Cannabis, Durian"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setStrainDuplicateError(checkDuplicateStrainName(e.target.value));
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
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับสายพันธุ์นี้..."
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                className="focus:ring-green-500"
                shadow
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="border-t-0 justify-end gap-2">
          <Button color="gray" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-linear-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none" onClick={handleAddSubmit} disabled={!!strainDuplicateError || !formName.trim()}>
            บันทึกข้อมูล
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} initialFocus={editNameRef} size="md">
        <ModalHeader className="border-b-0">
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">แก้ไขสายพันธุ์</span>
        </ModalHeader>
        <ModalBody>
          {formError && (
            <Alert id="strainEditError" color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          {strainDuplicateError && (
            <Alert color="failure" className="mb-4 rounded-xl">
              <span className="font-medium">{strainDuplicateError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nameEdit" className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">ชื่อสายพันธุ์ <span className="text-red-500">*</span></Label>
              <TextInput
                ref={editNameRef}
                id="nameEdit"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setStrainDuplicateError(checkDuplicateStrainName(e.target.value, selectedStrain?.id));
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
          </div>
        </ModalBody>
        <ModalFooter className="border-t-0 justify-end gap-2">
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            ยกเลิก
          </Button>
          <Button className="bg-linear-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white border-none" onClick={handleEditSubmit} disabled={!!strainDuplicateError || !formName.trim()}>
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
              คุณต้องการลบสายพันธุ์ <span className="font-bold text-gray-900 dark:text-white">"{selectedStrain?.name}"</span> ใช่หรือไม่?
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
