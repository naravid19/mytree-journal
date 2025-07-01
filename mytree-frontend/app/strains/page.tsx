"use client";
import { useEffect, useState } from "react";
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
} from "flowbite-react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">
      <main className="px-2 py-6 mx-auto w-full max-w-3xl md:max-w-4xl">
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-800 md:text-3xl lg:text-4xl dark:text-green-300">
            🦜 สายพันธุ์ทั้งหมด
          </h1>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
            เพิ่มสายพันธุ์
          </Button>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>ชื่อสายพันธุ์</TableHeadCell>
              <TableHeadCell>รายละเอียด</TableHeadCell>
              <TableHeadCell>
                <span className="sr-only">Actions</span>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {strains.map((strain) => (
              <TableRow key={strain.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <TableCell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {strain.name}
                </TableCell>
                <TableCell>{strain.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Button size="xs" onClick={() => handleShowEdit(strain)}>
                      แก้ไข
                    </Button>
                    <Button color="failure" size="xs" onClick={() => { setSelectedStrain(strain); setShowDeleteModal(true); }}>
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
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>เพิ่มสายพันธุ์</ModalHeader>
        <ModalBody>
          {formError && (
            <Alert color="failure" className="mb-4">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อสายพันธุ์</Label>
              <TextInput id="name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="desc">รายละเอียด</Label>
              <Textarea id="desc" rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
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
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalHeader>แก้ไขสายพันธุ์</ModalHeader>
        <ModalBody>
          {formError && (
            <Alert color="failure" className="mb-4">
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">ชื่อสายพันธุ์</Label>
              <TextInput id="nameEdit" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="descEdit">รายละเอียด</Label>
              <Textarea id="descEdit" rows={4} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
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
        <ModalBody>คุณต้องการลบสายพันธุ์ {selectedStrain?.name} ?</ModalBody>
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
