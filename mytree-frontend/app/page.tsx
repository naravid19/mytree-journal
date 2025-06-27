"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Card,
  Button,
  ButtonGroup,
  DarkThemeToggle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  TextInput,
  Textarea,
  FileInput,
  Select,
} from "flowbite-react";

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
  sex: string;
};

export default function Dashboard() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
    sex: "unknown",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [ageUnit, setAgeUnit] = useState<"day" | "month" | "year">("day");

  // Fetch Data
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

  // CRUD
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        formData.append(key, value);
      }
      imageFiles.forEach(file => {
        formData.append('uploaded_images', file);
      });
      const res = await fetch("http://localhost:8000/api/trees/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert("บันทึกข้อมูลไม่สำเร็จ: " + errorText);
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
        sex: "unknown",
      });
      setImageFiles([]);
      fetchTrees();
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowEdit = () => {
    if (!selectedTree) return;
    setForm({
      species: selectedTree.species || "",
      variety: selectedTree.variety || "",
      nickname: selectedTree.nickname || "",
      plant_date: selectedTree.plant_date || "",
      location: selectedTree.location || "",
      main_characteristics: selectedTree.main_characteristics || "",
      notes: selectedTree.notes || "",
      harvest_date: selectedTree.harvest_date || "",
      status: selectedTree.status || "",
      sex: selectedTree.sex || "unknown",
    });
    setImageFiles([]);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        formData.append(key, value);
      }
      imageFiles.forEach(file => {
        formData.append('uploaded_images', file);
      });
      const res = await fetch(`http://localhost:8000/api/trees/${selectedTree.id}/`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert("แก้ไขข้อมูลไม่สำเร็จ: " + errorText);
        return;
      }
      setShowEditModal(false);
      setShowDetailModal(false);
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
        sex: "unknown",
      });
      setImageFiles([]);
      setSelectedTree(null);
      fetchTrees();
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowDelete = () => setShowDeleteModal(true);

  const handleDelete = async () => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8000/api/trees/${selectedTree.id}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("ลบไม่สำเร็จ");
        return;
      }
      setShowDeleteModal(false);
      setShowDetailModal(false);
      setSelectedTree(null);
      fetchTrees();
    } finally {
      setSubmitting(false);
    }
  };

  // Gallery/Detail/Lightbox
  const handleShowDetail = (tree: Tree) => {
    setSelectedTree(tree);
    setGalleryIndex(0);
    setShowDetailModal(true);
  };
  const handlePrevImage = () => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setGalleryIndex(idx => (idx - 1 + selectedTree.images.length) % selectedTree.images.length);
  };
  const handleNextImage = () => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setGalleryIndex(idx => (idx + 1) % selectedTree.images.length);
  };
  const handleOpenLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setShowImageLightbox(true);
    setShowDetailModal(false);
  };
  const handleCloseLightbox = useCallback(() => {
    setShowImageLightbox(false);
    setGalleryIndex(lightboxIndex);
    setShowDetailModal(true);
  }, [lightboxIndex]);
  const handleLightboxPrev = () => {
    if (!selectedTree) return;
    setLightboxIndex(idx => (idx - 1 + selectedTree.images.length) % selectedTree.images.length);
  };
  const handleLightboxNext = () => {
    if (!selectedTree) return;
    setLightboxIndex(idx => (idx + 1) % selectedTree.images.length);
  };
  useEffect(() => {
    if (!showImageLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowLeft") handleLightboxPrev();
      if (e.key === "ArrowRight") handleLightboxNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageLightbox, selectedTree, handleCloseLightbox]);

  // Skeleton Row Loader (Shimmer)
  const SkeletonRow = () => (
    <TableRow>
      {[...Array(7)].map((_, i) => (
        <TableCell key={i}>
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  );
  
  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">
      <main className="px-2 py-6 mx-auto w-full max-w-3xl md:max-w-6xl sm:px-4">
        {/* HEADER */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-800 md:text-3xl lg:text-4xl dark:text-green-300 font-kanit">
            🌳 รายการต้นไม้ที่ปลูก
          </h1>
          <DarkThemeToggle className="self-end sm:self-auto" />
        </div>
        {/* TABLE */}
        <Card className="p-0 rounded-2xl border-0 shadow-xl md:p-4 bg-white/90 dark:bg-gray-900/80">
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <Table hoverable className="min-w-[650px] text-base md:text-lg font-kanit">
              <TableHead className="bg-green-50 dark:bg-gray-800/50">
                <TableRow>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">สายพันธุ์</TableHeadCell>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">พันธุ์</TableHeadCell>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">ชื่อเล่น</TableHeadCell>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">วันที่ปลูก</TableHeadCell>
                  
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">
                    <div className="flex gap-2 items-center">
                      <span className="flex gap-1 items-center">
                        <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                        </svg>
                        อายุ
                      </span>
                      <ButtonGroup>
                        <Button
                          color={ageUnit === "day" ? "success" : "gray"}
                          aria-pressed={ageUnit === "day"}
                          size="xs"
                          onClick={() => setAgeUnit("day")}
                          className={`transition-all font-kanit ${ageUnit === "day" ? "font-bold" : ""}`}
                        >วัน</Button>
                        <Button
                          color={ageUnit === "month" ? "success" : "gray"}
                          aria-pressed={ageUnit === "month"}
                          size="xs"
                          onClick={() => setAgeUnit("month")}
                          className={`transition-all font-kanit ${ageUnit === "month" ? "font-bold" : ""}`}
                        >เดือน</Button>
                        <Button
                          color={ageUnit === "year" ? "success" : "gray"}
                          aria-pressed={ageUnit === "year"}
                          size="xs"
                          onClick={() => setAgeUnit("year")}
                          className={`transition-all font-kanit ${ageUnit === "year" ? "font-bold" : ""}`}
                        >ปี</Button>
                      </ButtonGroup>
                    </div>
                  </TableHeadCell>

                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">สถานะ</TableHeadCell>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">รูป</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : trees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-gray-400">
                      <span className="block text-lg font-medium md:text-2xl">ไม่มีข้อมูลต้นไม้</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  trees.map((tree) => (
                    <TableRow
                      key={tree.id}
                      className="transition-all duration-300 cursor-pointer bg-white/60 dark:bg-gray-800/60 hover:bg-green-100 dark:hover:bg-gray-700"
                      onClick={() => handleShowDetail(tree)}
                    >
                      <TableCell className="align-middle">{tree.species}</TableCell>
                      <TableCell className="align-middle">{tree.variety}</TableCell>
                      <TableCell className="align-middle">{tree.nickname}</TableCell>
                      <TableCell className="align-middle">{tree.plant_date}</TableCell>
                      <TableCell className="text-center align-middle">
                        {calcAge(tree.plant_date, ageUnit)}
                      </TableCell>
                      <TableCell className="align-middle">
                        <span className={`px-2 py-1 rounded-xl text-xs md:text-base font-semibold 
                          ${tree.status === 'มีชีวิต'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                            : tree.status === 'ตายแล้ว'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                              : tree.status === 'ถูกย้าย'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}
                        `}>
                          {tree.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 items-center">
                          {tree.images?.length ? (
                            tree.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={img.id}
                                src={img.image}
                                alt=""
                                className="object-cover w-9 h-9 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 cursor-pointer sm:w-11 sm:h-11 dark:border-gray-700 hover:ring-2 hover:ring-green-400"
                                onClick={e => { e.stopPropagation(); handleShowDetail(tree); }}
                              />
                            ))
                          ) : (
                            <span className="flex justify-center items-center w-9 h-9 text-xs text-gray-400 bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                              ไม่มีรูป
                            </span>
                          )}
                          {tree.images?.length > 3 && (
                            <span className="ml-2 text-xs text-gray-400">+{tree.images.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        <div className="flex justify-end mt-6">
          <Button
            size="lg"
            className="px-8 py-3 text-xl bg-gradient-to-br from-green-400 to-blue-600 rounded-full shadow-md hover:from-green-500 hover:to-blue-700 dark:from-green-600 dark:to-blue-800 font-kanit"
            onClick={() => setShowAddModal(true)}
          >
            <span className="mr-2 text-2xl font-bold">+</span> เพิ่มต้นไม้
          </Button>
        </div>
      </main>

      {/* Modal เพิ่มต้นไม้ใหม่ */}
      <Modal
        show={showAddModal}
        size="lg"
        onClose={() => setShowAddModal(false)}
        className="xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0" // ถ้า overlay ไม่เต็มจอ ให้ uncomment บรรทัดนี้
      >
        <ModalHeader>
          <span className="text-2xl font-extrabold text-green-700 font-kanit sm:text-3xl md:text-4xl dark:text-green-300">เพิ่มต้นไม้ใหม่</span>
        </ModalHeader>
        <ModalBody className="rounded-b-2xl bg-slate-50 dark:bg-gray-900">
          <form className="grid grid-cols-1 gap-y-4 gap-x-8 text-base md:grid-cols-2 sm:text-lg font-kanit">
            <div>
              <Label className="mb-1 font-semibold">สายพันธุ์</Label>
              <TextInput
                required value={form.species} placeholder="เช่น มะม่วง"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
              />
              <span className="text-xs text-gray-500">ตัวอย่าง: มะม่วง, ทุเรียน</span>
            </div>
            <div>
              <Label className="mb-1 font-semibold">พันธุ์</Label>
              <TextInput
                value={form.variety} placeholder="เช่น เขียวเสวย"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, variety: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชื่อเล่น</Label>
              <TextInput value={form.nickname}
                placeholder="ชื่อเล่นต้นไม้"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ปลูก</Label>
              <TextInput type="date" value={form.plant_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, plant_date: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput value={form.location}
                placeholder="เช่น หลังบ้าน"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea rows={2} value={form.main_characteristics}
                placeholder="เช่น ผลใหญ่ รสหวาน"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, main_characteristics: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1 font-semibold">สถานะ</Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required>
                <option value="">-- เลือกสถานะ --</option>
                <option value="มีชีวิต">มีชีวิต</option>
                <option value="ตายแล้ว">ตายแล้ว</option>
                <option value="ถูกย้าย">ถูกย้าย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">เพศ</Label>
              <Select
                value={form.sex}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                required
              >
                <option value="bisexual">สมบูรณ์เพศ</option>
                <option value="male">ตัวผู้</option>
                <option value="female">ตัวเมีย</option>
                <option value="monoecious">แยกเพศในต้นเดียวกัน</option>
                <option value="mixed">ผสมหลายเพศ</option>
                <option value="unknown">ไม่ระบุ/ไม่แน่ใจ</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเกี่ยว</Label>
              <TextInput
                type="date" value={form.harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, harvest_date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">หมายเหตุ</Label>
              <Textarea rows={2} value={form.notes}
                placeholder="หมายเหตุเพิ่มเติม"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">รูปภาพ (เลือกได้หลายไฟล์)</Label>
              <FileInput
                multiple
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {imageFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`รูปที่ ${idx + 1}`}
                    className="object-cover w-12 h-12 rounded-xl border border-gray-200 shadow"
                  />
                ))}
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter className="gap-3 justify-end pt-4 rounded-b-2xl bg-slate-50 dark:bg-gray-900">
          <Button
            color="green"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 text-lg font-semibold transition-colors duration-200"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
          <Button color="gray" size="lg" className="px-8 text-lg font-semibold transition-colors duration-200" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Modal แสดงรายละเอียดต้นไม้ */}
      <Modal
        show={showDetailModal}
        size="xl"
        onClose={() => setShowDetailModal(false)}
        className="xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalHeader>
          <span className="text-2xl font-semibold sm:text-3xl md:text-4xl font-kanit">รายละเอียดต้นไม้</span>
        </ModalHeader>
        <ModalBody>
          {selectedTree ? (
            <div className="flex flex-col items-center space-y-2 w-full md:space-y-4">
              {/* GALLERY */}
              <div className="flex flex-col items-center w-full">
                {selectedTree.images.length === 0 ? (
                  <span className="mb-2 text-lg text-gray-400">ไม่มีรูป</span>
                ) : (
                  <div className="flex relative justify-center items-center mb-2 w-48 h-48 bg-gray-50 rounded-xl shadow sm:w-60 sm:h-60 md:w-72 md:h-72 dark:bg-gray-800">
                    <img
                      src={selectedTree.images[galleryIndex].image}
                      alt=""
                      className="object-contain w-full h-full rounded-xl border shadow transition cursor-pointer hover:scale-105"
                      onClick={() => handleOpenLightbox(galleryIndex)}
                    />
                    {selectedTree.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="flex absolute left-0 top-1/2 z-10 justify-center items-center w-8 h-8 rounded-full border shadow -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={handlePrevImage}
                          aria-label="รูปก่อนหน้า"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          type="button"
                          className="flex absolute right-0 top-1/2 z-10 justify-center items-center w-8 h-8 rounded-full border shadow -translate-y-1/2 bg-white/80 hover:bg-white/90"
                          onClick={handleNextImage}
                          aria-label="รูปถัดไป"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="flex absolute bottom-2 left-1/2 gap-1 -translate-x-1/2">
                          {selectedTree.images.map((_, idx) => (
                            <span
                              key={idx}
                              className={`inline-block w-2.5 h-2.5 rounded-full ring-1 ring-gray-400 ${galleryIndex === idx ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}
                              onClick={() => setGalleryIndex(idx)}
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* DETAIL GRID */}
              <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-lg sm:text-xl md:text-2xl font-kanit sm:grid-cols-2">
                <div>
                  <span className="font-medium">สายพันธุ์: </span>{selectedTree.species}
                </div>
                <div>
                  <span className="font-medium">พันธุ์: </span>{selectedTree.variety || "-"}
                </div>
                <div>
                  <span className="font-medium">ชื่อเล่น: </span>{selectedTree.nickname || "-"}
                </div>
                <div>
                  <span className="font-medium">วันที่ปลูก: </span>{selectedTree.plant_date || "-"}
                </div>
                <div>
                  <span className="font-medium">อายุ: </span>
                  {calcAge(selectedTree.plant_date, ageUnit)} {ageUnit === "day" ? "วัน" : ageUnit === "month" ? "เดือน" : "ปี"}
                </div>
                <div>
                  <span className="font-medium">เพศ: </span>
                  {
                    // Optional: mapping display
                    {
                      "bisexual": "สมบูรณ์เพศ",
                      "male": "ตัวผู้",
                      "female": "ตัวเมีย",
                      "monoecious": "แยกเพศในต้นเดียวกัน",
                      "mixed": "ผสมหลายเพศ",
                      "unknown": "ไม่ระบุ/ไม่แน่ใจ"
                    }[selectedTree.sex] || "-"
                  }
                </div>
                <div>
                  <span className="font-medium">สถานที่ปลูก: </span>{selectedTree.location || "-"}
                </div>
                <div>
                  <span className="font-medium">ลักษณะเด่น: </span>{selectedTree.main_characteristics || "-"}
                </div>
                <div>
                  <span className="font-medium">สถานะ: </span>{selectedTree.status || "-"}
                </div>
                <div>
                  <span className="font-medium">หมายเหตุ: </span>{selectedTree.notes || "-"}
                </div>
                <div>
                  <span className="font-medium">วันที่เก็บเกี่ยว: </span>{selectedTree.harvest_date || "-"}
                </div>
              </div>
              <div className="pt-2 w-full text-xs text-right text-gray-400">
                เพิ่มเมื่อ: {selectedTree.created_at?.split("T")[0]}
                {selectedTree.updated_at && selectedTree.updated_at !== selectedTree.created_at &&
                  <>, อัพเดทล่าสุด: {selectedTree.updated_at?.split("T")[0]}</>
                }
              </div>
            </div>
          ) : (
            <div className="text-gray-500">ไม่พบข้อมูล</div>
          )}
        </ModalBody>
        <ModalFooter className="justify-between">
          <div className="flex gap-2">
            <Button color="blue" className="transition-colors duration-200 font-kanit" onClick={handleShowEdit}>
              แก้ไข
            </Button>
            <Button color="red" className="transition-colors duration-200 font-kanit" onClick={handleShowDelete}>
              ลบ
            </Button>
          </div>
          <Button color="gray" className="transition-colors duration-200 font-kanit" onClick={() => setShowDetailModal(false)}>
            ปิด
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal แก้ไขต้นไม้ */}
      <Modal
        show={showEditModal}
        size="lg"
        onClose={() => setShowEditModal(false)}
        className="xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalHeader>แก้ไขต้นไม้</ModalHeader>
        <ModalBody>
          <form className="grid grid-cols-1 gap-y-4 gap-x-8 text-base md:grid-cols-2 sm:text-lg font-kanit">
            <div>
              <Label className="mb-1 font-semibold">สายพันธุ์</Label>
              <TextInput
                required value={form.species}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">พันธุ์</Label>
              <TextInput
                value={form.variety}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, variety: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชื่อเล่น</Label>
              <TextInput
                value={form.nickname}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ปลูก</Label>
              <TextInput
                type="date"
                value={form.plant_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, plant_date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.main_characteristics}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, main_characteristics: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">สถานะ</Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required>
                <option value="">-- เลือกสถานะ --</option>
                <option value="มีชีวิต">มีชีวิต</option>
                <option value="ตายแล้ว">ตายแล้ว</option>
                <option value="ถูกย้าย">ถูกย้าย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">เพศ</Label>
              <Select
                value={form.sex}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                required
              >
                <option value="bisexual">สมบูรณ์เพศ</option>
                <option value="male">ตัวผู้</option>
                <option value="female">ตัวเมีย</option>
                <option value="monoecious">แยกเพศในต้นเดียวกัน</option>
                <option value="mixed">ผสมหลายเพศ</option>
                <option value="unknown">ไม่ระบุ/ไม่แน่ใจ</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเกี่ยว</Label>
              <TextInput
                type="date"
                value={form.harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, harvest_date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">หมายเหตุ</Label>
              <Textarea
                rows={2}
                value={form.notes}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">รูปภาพ (เพิ่มรูปใหม่เท่านั้น, ถ้าต้องการแทนที่)</Label>
              <FileInput
                multiple
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button color="blue" disabled={submitting} onClick={handleEditSubmit} className="transition-colors duration-200">
            {submitting ? (
              <>
                <span className="inline-block mr-2 w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกการแก้ไข"
            )}
          </Button>
          <Button color="gray" onClick={() => setShowEditModal(false)} className="transition-colors duration-200">
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal Delete confirm */}
      <Modal
        show={showDeleteModal}
        size="sm"
        onClose={() => setShowDeleteModal(false)}
        className="xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalHeader>ยืนยันการลบ</ModalHeader>
        <ModalBody>
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบต้นไม้ "{selectedTree?.species || ''} ({selectedTree?.nickname})" ใช่หรือไม่?
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button color="red" disabled={submitting} onClick={handleDelete}>
            {submitting ? "กำลังลบ..." : "ลบ"}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Lightbox Modal for images (fullscreen) */}
      <Modal
        show={showImageLightbox}
        size="5xl"
        onClose={handleCloseLightbox}
        className="z-[9999] xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalBody>
          {selectedTree && selectedTree.images.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-3xl h-[60vh] flex items-center justify-center bg-black/70 rounded-2xl shadow-lg">
                <img
                  src={selectedTree.images[lightboxIndex].image}
                  alt=""
                  className="object-contain max-w-full max-h-[55vh] rounded-xl shadow"
                  draggable={false}
                  style={{ userSelect: "none" }}
                />
                {selectedTree.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="flex absolute left-2 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow -translate-y-1/2 bg-white/80 hover:bg-white/95"
                      onClick={handleLightboxPrev}
                      aria-label="รูปก่อนหน้า"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      type="button"
                      className="flex absolute right-2 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow -translate-y-1/2 bg-white/80 hover:bg-white/95"
                      onClick={handleLightboxNext}
                      aria-label="รูปถัดไป"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                {selectedTree.images.map((img, idx) => (
                  <img
                    key={img.id}
                    src={img.image}
                    alt=""
                    className={`w-12 h-12 object-cover rounded-lg border-2 shadow cursor-pointer
                      ${idx === lightboxIndex ? "border-blue-600" : "border-gray-300"}
                      hover:ring-2 hover:ring-blue-400`}
                    onClick={() => setLightboxIndex(idx)}
                  />
                ))}
              </div>
              <Button color="gray" className="mt-6" onClick={handleCloseLightbox}>
                ปิดดูรูป
              </Button>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

function calcAge(plantDate: string, unit: "day" | "month" | "year") {
  if (!plantDate) return "-";
  const today = new Date();
  const plant = new Date(plantDate);
  if (isNaN(plant.getTime()) || plant > today) return "-";
  const diffTime = today.getTime() - plant.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (unit === "day") return diffDays;
  if (unit === "month") return Math.floor(diffDays / 30);
  if (unit === "year") return Math.floor(diffDays / 365);
  return diffDays;
}
