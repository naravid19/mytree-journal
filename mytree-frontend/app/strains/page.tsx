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
import { HiCheckCircle, HiXCircle, HiTrash, HiArrowLeft, HiPencil, HiPlus, HiCollection } from "react-icons/hi";
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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <main className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
              จัดการสายพันธุ์
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              เพิ่มและแก้ไขข้อมูลสายพันธุ์พืชของคุณ
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
              เพิ่มสายพันธุ์
            </Button>
          </div>
        </div>

        <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/50 dark:border-gray-700">
          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left text-gray-500 dark:text-gray-400">
              <TableHead className="text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-800/50 dark:text-gray-400 backdrop-blur-sm">
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
                    <TableRow key={strain.id} className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-gray-800/80">
                      <TableCell className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
                          <span className="text-base">{strain.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 max-w-md truncate text-gray-600 dark:text-gray-300">
                        {strain.description || <span className="italic text-gray-400 opacity-70">ไม่มีรายละเอียด</span>}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip content="แก้ไข">
                            <Button size="xs" color="light" className="rounded-full w-8 h-8 p-0 flex items-center justify-center border-gray-200 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all" onClick={() => handleShowEdit(strain)}>
                              <HiPencil className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="ลบ">
                            <Button size="xs" color="light" className="rounded-full w-8 h-8 p-0 flex items-center justify-center border-gray-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-all" onClick={() => { setSelectedStrain(strain); setShowDeleteModal(true); }}>
                              <HiTrash className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <HiCollection className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-lg font-medium">ไม่พบข้อมูลสายพันธุ์</span>
                        <p className="text-sm text-gray-400 mt-1">เริ่มเพิ่มสายพันธุ์ใหม่ได้เลย</p>
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
