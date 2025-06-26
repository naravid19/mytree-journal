"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Card,
  Button,
  DarkThemeToggle,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Label,
  TextInput,
  Textarea,
  FileInput,
  Select,
} from "flowbite-react";

// ---- DATA TYPE ----
type Image = {
  id: number;
  image: string;
  uploaded_at: string;
};
type Tree = {
  id: number;
  species: string;
  variety: string;
  nickname: string;
  plant_date: string;
  location: string;
  main_characteristics: string;
  notes: string;
  harvest_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  images: Image[];
};

export default function Dashboard() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    species: "",
    variety: "",
    nickname: "",
    plant_date: "",
    location: "",
    main_characteristics: "",
    notes: "",
    harvest_date: "",
    status: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchTrees = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/trees/")
      .then((res) => res.json())
      .then((data) => setTrees(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrees();
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        formData.append(key, value);
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }
      const res = await fetch("http://localhost:8000/api/trees/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        alert("บันทึกข้อมูลไม่สำเร็จ");
        return;
      }
      setShowAddModal(false);
      setForm({
        species: "",
        variety: "",
        nickname: "",
        plant_date: "",
        location: "",
        main_characteristics: "",
        notes: "",
        harvest_date: "",
        status: "",
      });
      setImageFile(null);
      fetchTrees();
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen px-2 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          รายการต้นไม้ที่ปลูก
        </h1>
        <DarkThemeToggle />
      </div>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>สายพันธุ์</TableHeadCell>
                <TableHeadCell>พันธุ์</TableHeadCell>
                <TableHeadCell>ชื่อเล่น</TableHeadCell>
                <TableHeadCell>วันที่ปลูก</TableHeadCell>
                <TableHeadCell>สถานะ</TableHeadCell>
                <TableHeadCell>รูป</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>กำลังโหลดข้อมูล...</TableCell>
                </TableRow>
              ) : trees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>ไม่มีข้อมูลต้นไม้</TableCell>
                </TableRow>
              ) : (
                trees.map((tree) => (
                  <TableRow key={tree.id} className="bg-white dark:bg-gray-800">
                    <TableCell>{tree.species}</TableCell>
                    <TableCell>{tree.variety}</TableCell>
                    <TableCell>{tree.nickname}</TableCell>
                    <TableCell>{tree.plant_date}</TableCell>
                    <TableCell>{tree.status}</TableCell>
                    <TableCell>
                      {tree.images?.[0] ? (
                        <img
                          src={tree.images[0].image}
                          alt="tree"
                          className="object-cover w-12 h-12 rounded"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      <div className="flex justify-end mt-4">
        <Button color="primary" onClick={() => setShowAddModal(true)}>
          + เพิ่มต้นไม้
        </Button>
      </div>
      {/* Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>เพิ่มต้นไม้ใหม่</ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            <div>
              <Label>สายพันธุ์</Label>
              <TextInput
                required
                value={form.species}
                onChange={(e) =>
                  setForm((f) => ({ ...f, species: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>พันธุ์</Label>
              <TextInput
                value={form.variety}
                onChange={(e) =>
                  setForm((f) => ({ ...f, variety: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>ชื่อเล่น</Label>
              <TextInput
                value={form.nickname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nickname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>วันที่ปลูก</Label>
              <TextInput
                type="date"
                value={form.plant_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, plant_date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.main_characteristics}
                onChange={(e) =>
                  setForm((f) => ({ ...f, main_characteristics: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>สถานะ</Label>
              <Select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                <option value="">-- เลือกสถานะ --</option>
                <option value="มีชีวิต">มีชีวิต</option>
                <option value="ตายแล้ว">ตายแล้ว</option>
                <option value="ถูกย้าย">ถูกย้าย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Select>
            </div>
            <div>
              <Label>หมายเหตุ</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>วันที่เก็บเกี่ยว</Label>
              <TextInput
                type="date"
                value={form.harvest_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, harvest_date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>รูปภาพ</Label>
              <FileInput onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? (
              <>
                <svg
                  className="inline w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
          <Button color="gray" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
