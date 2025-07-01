"use client";
import { useEffect, useState, useCallback, useRef } from "react";
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
  Tooltip,
  Badge,
  Alert,
  Spinner,
  Toast,
  ToastToggle,
} from "flowbite-react";
import { HiSearch, HiCheckCircle, HiXCircle } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Image = {
  id: number;
  image: string;
  uploaded_at: string;
};

type Strain = {
  id: number;
  name: string;
  description: string;
};

type Batch = {
  id: number;
  batch_code: string;
  description: string;
  started_date: string;
};

type Tree = {
  id: number;
  nickname: string;
  strain: Strain | null;
  variety: string;
  batch: Batch | null;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
  germination_date: string;
  plant_date: string;
  growth_stage: string;
  harvest_date: string;
  sex: string;
  genotype: string;
  phenotype: string;
  parent_male: number | null;
  parent_female: number | null;
  clone_source: number | null;
  pollination_date: string;
  pollinated_by: number | null;
  yield_amount: number | null;
  flower_quality: string;
  seed_count: number | null;
  seed_harvest_date: string;
  disease_notes: string;
  document: string | null;
  images: Image[];
  notes: string;
};

function useDebouncedSearch(callback: (s: string) => void, delay = 300) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (val: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => callback(val), delay) as unknown as NodeJS.Timeout;
  };
}

export default function Dashboard() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [showDeleteAllImagesModal, setShowDeleteAllImagesModal] = useState(false);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);

  const deleteConfirmRef = useRef<HTMLButtonElement>(null);
  const deleteImagesConfirmRef = useRef<HTMLButtonElement>(null);
  const deleteDocConfirmRef = useRef<HTMLButtonElement>(null);

  // initial focus targets for modals
  const addInitialRef = useRef<HTMLSelectElement>(null);
  const editInitialRef = useRef<HTMLSelectElement>(null);

  // เพิ่ม state สำหรับ form error
  const [formError, setFormError] = useState<string>("");

  // เพิ่ม state สำหรับ success message
  const [successMessage, setSuccessMessage] = useState<string>("");

  // แจ้งเตือนข้อผิดพลาดแบบ toast
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [strainsLoading, setStrainsLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);

  // State สำหรับ loading ข้อมูล detail
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(""), 3000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  // เก็บ ID ของต้นไม้ที่ถูกเลือกในตาราง
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // modal ยืนยันการลบหลายรายการ
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);


  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [form, setForm] = useState({
    strainUuid: "",
    batch_id: null as number | null,
    variety: "",
    nickname: "",
    plant_date: todayStr, // default เป็นวันนี้
    germination_date: "",
    growth_stage: "",
    harvest_date: "",
    location: "",
    phenotype: "",
    status: "มีชีวิต", // default เป็น 'มีชีวิต'
    sex: "unknown",
    genotype: "",
    parent_male: null as number | null,
    parent_female: null as number | null,
    clone_source: null as number | null,
    pollinated_by: null as number | null,
    pollination_date: "",
    yield_amount: null as number | null,
    flower_quality: "",
    seed_count: null as number | null,
    seed_harvest_date: "",
    disease_notes: "",
    document: null as File | null,
    notes: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [ageUnit, setAgeUnit] = useState<"day" | "month" | "year">("day");

  // State สำหรับการเรียงลำดับตาราง
  const [sortKey, setSortKey] = useState<
    "strain" | "nickname" | "plant_date" | "variety" | "sex" | "status" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // State สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, 350);

  // Fetch Data
  const fetchTrees = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/trees/`)
      .then((res) => res.json())
      .then((data) => setTrees(data))
      .catch(() => setErrorMessage("โหลดข้อมูลไม่สำเร็จ"))
      .finally(() => setLoading(false));
  };

  const fetchStrains = () => {
    setStrainsLoading(true);
    fetch(`${API_BASE}/api/strains/`)
      .then((res) => res.json())
      .then((data) => setStrains(data))
      .catch(() => setErrorMessage("โหลดสายพันธุ์ไม่สำเร็จ"))
      .finally(() => setStrainsLoading(false));
  };

  const fetchBatches = () => {
    setBatchesLoading(true);
    fetch(`${API_BASE}/api/batches/`)
      .then((res) => res.json())
      .then((data) => setBatches(data))
      .catch(() => setErrorMessage("โหลดชุดการปลูกไม่สำเร็จ"))
      .finally(() => setBatchesLoading(false));
  };

  useEffect(() => {
    fetchTrees();
    fetchStrains();
    fetchBatches();
    setMounted(true);
  }, []);

  useEffect(() => {
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [imageFiles]);

  // ฟังก์ชัน filter
  const filteredTrees = trees.filter(tree => {
    const q = search.toLowerCase();
    return (
      tree.nickname?.toLowerCase().includes(q) ||
      tree.strain?.name?.toLowerCase().includes(q) ||
      tree.variety?.toLowerCase().includes(q) ||
      tree.status?.toLowerCase().includes(q) ||
      tree.sex?.toLowerCase().includes(q)
    );
  });

  const sortedTrees = [...filteredTrees].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = getSortValue(a, sortKey);
    const valB = getSortValue(b, sortKey);
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  const pagedTrees = sortedTrees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTrees.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [trees, totalPages, currentPage]);
  // CRUD
  const handleSubmit = useCallback(async () => {
    // ตรวจสอบ required fields
    if (!form.strainUuid) {
      setFormError("กรุณาเลือกสายพันธุ์");
      return;
    }
    if (!form.status) {
      setFormError("กรุณาเลือกสถานะ");
      return;
    }
    if (!form.sex) {
      setFormError("กรุณาเลือกเพศ");
      return;
    }
    if (!form.plant_date) {
      setFormError("กรุณาเลือกวันที่ปลูก");
      return;
    }

    // ตรวจสอบ yield_amount
    if (form.yield_amount !== null && form.yield_amount < 0) {
      setFormError("ปริมาณผลผลิตต้องไม่ติดลบ");
      return;
    }

    setFormError(""); // ล้าง error
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (key === 'strainUuid') {
          formData.append('strain_id', value ? value.toString() : "");
        } else if (key === 'batch_id') {
          if (value === null || value === "") {
            formData.append('batch_id', "");
          } else {
            formData.append('batch_id', value.toString());
          }
        } else if (key === 'document') {
          if (value === null) {
            // ถ้าต้องการลบไฟล์ document ให้ append เป็น "" หรือไม่ส่งเลย (ขึ้นกับ backend)
            formData.append('document', "");
          } else if (value instanceof File) {
            formData.append('document', value);
          }
        } else if (
          ["parent_male", "parent_female", "clone_source", "pollinated_by", "yield_amount", "seed_count"].includes(key)
        ) {
          // ถ้าเป็น number field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else if (
          ["germination_date", "harvest_date", "pollination_date", "seed_harvest_date", "plant_date"].includes(key)
        ) {
          // ถ้าเป็น date field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else {
          // text field
          formData.append(key, value === null ? "" : value.toString());
        }
      }
      imageFiles.forEach(file => {
        formData.append('uploaded_images', file);
      });
      if (form.document) formData.append('document', form.document);
      if (form.parent_male) formData.append('parent_male', form.parent_male.toString());
      const res = await fetch(`${API_BASE}/api/trees/`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        setFormError("บันทึกข้อมูลไม่สำเร็จ: " + errorText);
        return;
      }
      setShowAddModal(false);
      setForm({
        strainUuid: "",
        batch_id: null as number | null,
        variety: "",
        nickname: "",
        plant_date: todayStr,
        germination_date: "",
        growth_stage: "",
        harvest_date: "",
        location: "",
        phenotype: "",
        status: "มีชีวิต",
        sex: "unknown",
        genotype: "",
        parent_male: null as number | null,
        parent_female: null as number | null,
        clone_source: null as number | null,
        pollinated_by: null as number | null,
        pollination_date: "",
        yield_amount: null as number | null,
        flower_quality: "",
        seed_count: null as number | null,
        seed_harvest_date: "",
        disease_notes: "",
        document: null as File | null,
        notes: "",
      });
      setImageFiles([]);
      fetchTrees();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError("บันทึกข้อมูลไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  }, [form, imageFiles, todayStr]);

  const handleShowEdit = () => {
    if (!selectedTree) return;
    setForm({
      strainUuid: selectedTree.strain?.id?.toString() || "",
      batch_id: selectedTree.batch?.id || null,
      variety: selectedTree.variety || "",
      nickname: selectedTree.nickname || "",
      plant_date: selectedTree.plant_date || "",
      germination_date: selectedTree.germination_date || "",
      growth_stage: selectedTree.growth_stage || "",
      harvest_date: selectedTree.harvest_date || "",
      location: selectedTree.location || "",
      phenotype: selectedTree.phenotype || "",
      status: selectedTree.status || "",
      sex: selectedTree.sex || "unknown",
      genotype: selectedTree.genotype || "",
      parent_male: selectedTree.parent_male,
      parent_female: selectedTree.parent_female,
      clone_source: selectedTree.clone_source,
      pollinated_by: selectedTree.pollinated_by,
      pollination_date: selectedTree.pollination_date || "",
      yield_amount: selectedTree.yield_amount,
      flower_quality: selectedTree.flower_quality || "",
      seed_count: selectedTree.seed_count,
      seed_harvest_date: selectedTree.seed_harvest_date || "",
      disease_notes: selectedTree.disease_notes || "",
      document: null as File | null,
      notes: selectedTree.notes || "",
    });
    setImageFiles([]);
    setShowEditModal(true);
  };

  const handleEditSubmit = useCallback(async () => {
    if (!selectedTree) return;
    
    // ตรวจสอบ required fields
    if (!form.strainUuid) {
      setFormError("กรุณาเลือกสายพันธุ์");
      return;
    }
    if (!form.status) {
      setFormError("กรุณาเลือกสถานะ");
      return;
    }
    if (!form.sex) {
      setFormError("กรุณาเลือกเพศ");
      return;
    }
    if (!form.plant_date) {
      setFormError("กรุณาเลือกวันที่ปลูก");
      return;
    }

    // ตรวจสอบ yield_amount
    if (form.yield_amount !== null && form.yield_amount < 0) {
      setFormError("ปริมาณผลผลิตต้องไม่ติดลบ");
      return;
    }

    setFormError(""); // ล้าง error
    setSubmitting(true);
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (key === 'strainUuid') {
          formData.append('strain_id', value ? value.toString() : "");
        } else if (key === 'batch_id') {
          if (value === null || value === "") {
            formData.append('batch_id', "");
          } else {
            formData.append('batch_id', value.toString());
          }
        } else if (key === 'document') {
          if (value === null) {
            // ถ้าต้องการลบไฟล์ document ให้ append เป็น "" หรือไม่ส่งเลย (ขึ้นกับ backend)
            formData.append('document', "");
          } else if (value instanceof File) {
            formData.append('document', value);
          }
        } else if (
          ["parent_male", "parent_female", "clone_source", "pollinated_by", "yield_amount", "seed_count"].includes(key)
        ) {
          // ถ้าเป็น number field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else if (
          ["germination_date", "harvest_date", "pollination_date", "seed_harvest_date", "plant_date"].includes(key)
        ) {
          // ถ้าเป็น date field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else {
          // text field
          formData.append(key, value === null ? "" : value.toString());
        }
      }
      imageFiles.forEach(file => {
        formData.append('uploaded_images', file);
      });
      if (form.document) formData.append('document', form.document);
      if (form.parent_male) formData.append('parent_male', form.parent_male.toString());
      const res = await fetch(`${API_BASE}/api/trees/${selectedTree.id}/`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        setFormError("แก้ไขข้อมูลไม่สำเร็จ: " + errorText);
        return;
      }
      setShowEditModal(false);
      setShowDetailModal(false);
      setForm({
        strainUuid: "",
        batch_id: null as number | null,
        variety: "",
        nickname: "",
        plant_date: todayStr,
        germination_date: "",
        growth_stage: "",
        harvest_date: "",
        location: "",
        phenotype: "",
        status: "มีชีวิต",
        sex: "unknown",
        genotype: "",
        parent_male: null as number | null,
        parent_female: null as number | null,
        clone_source: null as number | null,
        pollinated_by: null as number | null,
        pollination_date: "",
        yield_amount: null as number | null,
        flower_quality: "",
        seed_count: null as number | null,
        seed_harvest_date: "",
        disease_notes: "",
        document: null as File | null,
        notes: "",
      });
      setImageFiles([]);
      fetchTrees();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError("แก้ไขข้อมูลไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  }, [form, imageFiles, selectedTree, todayStr]);

  const handleShowDelete = () => setShowDeleteModal(true);

  const handleDelete = async () => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/trees/${selectedTree.id}/`, {
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
      setSuccessMessage("ลบข้อมูลสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage("ลบข้อมูลไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  // เพิ่มฟังก์ชันลบรูปภาพ
  const handleDeleteImage = async (id: number) => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/images/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("ลบรูปภาพไม่สำเร็จ");
        return;
      }
      // อัปเดต selectedTree state โดยลบรูปภาพออก
      setSelectedTree(prev => prev ? {
        ...prev,
        images: prev.images.filter(img => img.id !== id)
      } : null);
      // รีเฟรชข้อมูลต้นไม้ทั้งหมด
      fetchTrees();
      setSuccessMessage("ลบรูปภาพสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage("ลบรูปภาพไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  // เพิ่มฟังก์ชันลบรูปภาพทั้งหมด
  const handleDeleteAllImages = async () => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setSubmitting(true);
    try {
      // ลบรูปภาพทีละรูป
      for (const image of selectedTree.images) {
        const res = await fetch(`${API_BASE}/api/images/${image.id}/`, {
          method: "DELETE",
        });
        if (!res.ok) {
          alert(`ลบรูปภาพ ${image.id} ไม่สำเร็จ`);
          return;
        }
      }
      // อัปเดต selectedTree state
      setSelectedTree(prev => prev ? {
        ...prev,
        images: []
      } : null);
      // รีเฟรชข้อมูลต้นไม้ทั้งหมด
      fetchTrees();
      // ปิด modal ยืนยัน
      setShowDeleteAllImagesModal(false);
      setSuccessMessage("ลบรูปภาพทั้งหมดสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage("ลบรูปภาพทั้งหมดไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  // เพิ่มฟังก์ชันแสดง modal ยืนยันการลบรูปภาพทั้งหมด
  const handleShowDeleteAllImagesModal = () => {
    setShowDeleteAllImagesModal(true);
  };

  const handleShowDeleteDocumentModal = () => {
    setShowDeleteDocumentModal(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedTree) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/trees/${selectedTree.id}/delete_document/`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert("ลบเอกสารไม่สำเร็จ: " + errorText);
        return;
      }
      setShowDeleteDocumentModal(false);
      fetchTrees();
      // อัปเดต selectedTree เพื่อให้แสดงผลถูกต้อง
      const updatedTree = await fetch(`${API_BASE}/api/trees/${selectedTree.id}/`).then(res => res.json());
      setSelectedTree(updatedTree);
      setSuccessMessage("ลบเอกสารสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage("ลบเอกสารไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  // ลบต้นไม้หลายรายการตามที่เลือกในตาราง
  const performBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      for (const id of selectedIds) {
        const res = await fetch(`${API_BASE}/api/trees/${id}/`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }
      }
      setSelectedIds([]);
      fetchTrees();
      setSuccessMessage("ลบรายการที่เลือกสำเร็จ");
      setShowBulkDeleteModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMessage("ลบรายการไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  // Gallery/Detail/Lightbox
  const handleShowDetail = useCallback(async (tree: Tree) => {
    setDetailLoading(true);
    // ถ้า fetch ข้อมูล detail ใหม่จาก API ให้ใส่ logic ที่นี่
    // const res = await fetch(`${API_BASE}/api/trees/${tree.id}/`);
    // const data = await res.json();
    // setSelectedTree(data);
    setSelectedTree(tree);
    setGalleryIndex(0);
    setShowDetailModal(true);
    setTimeout(() => setDetailLoading(false), 400); // simulate loading (ลบทิ้งถ้า fetch จริง)
  }, []);
  const handlePrevImage = useCallback(() => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setGalleryIndex(idx => (idx - 1 + selectedTree.images.length) % selectedTree.images.length);
  }, [selectedTree]);
  const handleNextImage = useCallback(() => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setGalleryIndex(idx => (idx + 1) % selectedTree.images.length);
  }, [selectedTree]);
  const handleOpenLightbox = useCallback((idx: number) => {
    setLightboxIndex(idx);
    setShowImageLightbox(true);
    setShowDetailModal(false);
  }, []);
  const handleCloseLightbox = useCallback(() => {
    setShowImageLightbox(false);
    setGalleryIndex(lightboxIndex);
    setShowDetailModal(true);
  }, [lightboxIndex]);
  const handleLightboxPrev = useCallback(() => {
    if (!selectedTree) return;
    setLightboxIndex(idx => (idx - 1 + selectedTree.images.length) % selectedTree.images.length);
  }, [selectedTree]);
  const handleLightboxNext = useCallback(() => {
    if (!selectedTree) return;
    setLightboxIndex(idx => (idx + 1) % selectedTree.images.length);
  }, [selectedTree]);
  useEffect(() => {
    if (!showImageLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowLeft") handleLightboxPrev();
      if (e.key === "ArrowRight") handleLightboxNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageLightbox, selectedTree, handleCloseLightbox, handleLightboxPrev, handleLightboxNext]);

  // Hotkey: submit form with Enter key when modal is open
  useEffect(() => {
    if (!showAddModal && !showEditModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'TEXTAREA') return;
      e.preventDefault();
      if (showAddModal) handleSubmit();
      if (showEditModal) handleEditSubmit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showAddModal, showEditModal, handleSubmit, handleEditSubmit]);

  // Skeleton Row Loader (Shimmer)
  const SkeletonRow = () => (
    <TableRow>
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}>
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  );
  
  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">
      {/* Overlay Spinner กลางจอ ขณะ loading */}
      {loading && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Spinner size="xl" color="success" aria-label="กำลังโหลดข้อมูล..." />
          <span className="ml-4 text-lg font-bold text-green-700 dark:text-green-300" role="status">กำลังโหลดข้อมูล...</span>
        </div>
      )}
      <main className="px-2 py-6 mx-auto w-full max-w-3xl md:max-w-6xl sm:px-4">
        {/* HEADER */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-800 md:text-3xl lg:text-4xl dark:text-green-300 font-kanit">
            🌳 รายการต้นไม้ที่ปลูก
          </h1>
          <DarkThemeToggle className="self-end sm:self-auto" />
        </div>
        {/* Search Bar ด้านบน Table */}
        <div className="flex justify-end mb-4">
          <TextInput
            id="search"
            type="search"
            icon={HiSearch}
            value={search}
            onChange={e => debouncedSearch(e.target.value)}
            placeholder="ค้นหาต้นไม้..."
            className="w-full max-w-xs"
            autoComplete="off"
            aria-label="ค้นหาต้นไม้"
            disabled={loading}
            aria-disabled={loading}
          />
        </div>
        <div className="flex gap-3 items-center mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-200">เลือก {selectedIds.length} รายการ</span>
          {selectedIds.length > 0 && (
            <>
              <Button color="red" onClick={() => setShowBulkDeleteModal(true)} disabled={submitting || loading} aria-disabled={submitting || loading}>
                {submitting ? "กำลังลบ..." : "ลบรายการที่เลือก"}
              </Button>
              <Button color="gray" onClick={() => setSelectedIds([])} disabled={submitting || loading} aria-disabled={submitting || loading}>
                ยกเลิกเลือก
              </Button>
            </>
          )}
        </div>
        {/* TABLE */}
        <Card className="overflow-visible pb-6 w-full rounded-2xl border border-gray-200 shadow-2xl bg-white/70 dark:bg-gray-900/80 dark:border-gray-700">
          <div
            className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
            aria-busy={loading ? "true" : "false"}
            role="status"
          >
          <Table hoverable className="min-w-[650px] text-base md:text-lg font-kanit dark:bg-gray-900/80 dark:text-gray-100">
              <TableHead className="bg-green-50 dark:bg-gray-800/80 dark:text-gray-100">
                <TableRow>
                  <TableHeadCell>
                    <input
                      type="checkbox"
                      checked={pagedTrees.length > 0 && pagedTrees.every(tree => selectedIds.includes(tree.id))}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedIds([
                            ...selectedIds,
                            ...pagedTrees.filter(tree => !selectedIds.includes(tree.id)).map(tree => tree.id),
                          ]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => !pagedTrees.map(tree => tree.id).includes(id)));
                        }
                      }}
                      aria-label="เลือกต้นไม้ทั้งหมดในหน้านี้"
                    />
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg dark:text-gray-100"
                    onClick={() => {
                      if (sortKey === "strain") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("strain");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    สายพันธุ์ {sortKey === "strain" && (sortOrder === "asc" ? "▲" : "▼")}
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
                    onClick={() => {
                      if (sortKey === "variety") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("variety");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    พันธุ์ {sortKey === "variety" && (sortOrder === "asc" ? "▲" : "▼")}
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
                    onClick={() => {
                      if (sortKey === "nickname") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("nickname");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    ชื่อเล่น {sortKey === "nickname" && (sortOrder === "asc" ? "▲" : "▼")}
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
                    onClick={() => {
                      if (sortKey === "sex") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("sex");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    เพศ {sortKey === "sex" && (sortOrder === "asc" ? "▲" : "▼")}
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
                    onClick={() => {
                      if (sortKey === "plant_date") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("plant_date");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      <span className="flex gap-1 items-center">
                        <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                        </svg>
                        <span>
                          อายุ {sortKey === "plant_date" && (sortOrder === "asc" ? "▲" : "▼")}
                        </span>
                      </span>
                      <ButtonGroup>
                        <Button
                          color={ageUnit === "day" ? "success" : "gray"}
                          aria-pressed={ageUnit === "day"}
                          size="xs"
                          onClick={e => { e.stopPropagation(); setAgeUnit("day"); }}
                          className={`transition-all font-kanit ${ageUnit === "day" ? "font-bold" : ""}`}
                        >วัน</Button>
                        <Button
                          color={ageUnit === "month" ? "success" : "gray"}
                          aria-pressed={ageUnit === "month"}
                          size="xs"
                          onClick={e => { e.stopPropagation(); setAgeUnit("month"); }}
                          className={`transition-all font-kanit ${ageUnit === "month" ? "font-bold" : ""}`}
                        >เดือน</Button>
                        <Button
                          color={ageUnit === "year" ? "success" : "gray"}
                          aria-pressed={ageUnit === "year"}
                          size="xs"
                          onClick={e => { e.stopPropagation(); setAgeUnit("year"); }}
                          className={`transition-all font-kanit ${ageUnit === "year" ? "font-bold" : ""}`}
                        >ปี</Button>
                      </ButtonGroup>
                    </div>
                  </TableHeadCell>
                  <TableHeadCell
                    className="text-sm font-bold cursor-pointer select-none md:text-base lg:text-lg"
                    onClick={() => {
                      if (sortKey === "status") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortKey("status");
                        setSortOrder("asc");
                      }
                    }}
                  >
                    สถานะ {sortKey === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </TableHeadCell>
                  <TableHeadCell className="text-sm font-bold md:text-base lg:text-lg">รูป</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : pagedTrees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-gray-400">
                      <span className="block text-lg font-medium md:text-2xl">🌱 ยังไม่มีข้อมูลต้นไม้</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedTrees.map((tree) => (
                    <TableRow
                      key={tree.id}
                      className="transition cursor-pointer hover:bg-green-50/40 dark:hover:bg-gray-700/40"
                      onClick={() => handleShowDetail(tree)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(tree.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, tree.id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== tree.id));
                            }
                          }}
                          onClick={e => e.stopPropagation()}
                          aria-label={`เลือกต้นไม้: ${tree.nickname}`}
                        />
                      </TableCell>
                      <TableCell className="dark:text-gray-200">{tree.strain?.name || "-"}</TableCell>
                      <TableCell>{tree.variety}</TableCell>
                      <TableCell>{tree.nickname}</TableCell>
                      <TableCell>
                        <Badge
                          color={
                            tree.sex === 'male' ? 'info'
                            : tree.sex === 'female' ? 'pink'
                            : tree.sex === 'bisexual' ? 'success'
                            : tree.sex === 'mixed' ? 'warning'
                            : tree.sex === 'monoecious' ? 'blue'
                            : 'gray'
                          }
                          className={`
                            ${tree.sex === 'female' ? 'dark:bg-pink-400 dark:text-black' : ''}
                            ${tree.sex === 'male' ? 'dark:bg-sky-400 dark:text-black' : ''}
                            ${tree.sex === 'bisexual' ? 'dark:bg-green-400 dark:text-black' : ''}
                            ${tree.sex === 'mixed' ? 'dark:bg-yellow-300 dark:text-black' : ''}
                            ${tree.sex === 'monoecious' ? 'dark:bg-blue-400 dark:text-black' : ''}
                            ${tree.sex === 'unknown' ? 'dark:bg-gray-600 dark:text-white' : ''}
                          `}
                        >
                          {{
                            "bisexual": "สมบูรณ์เพศ",
                            "male": "ตัวผู้",
                            "female": "ตัวเมีย",
                            "monoecious": "แยกเพศในต้นเดียวกัน",
                            "mixed": "ผสมหลายเพศ",
                            "unknown": "ไม่ระบุ/ไม่แน่ใจ"
                          }[tree.sex] || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-center">{calcAge(tree.plant_date, ageUnit)}</TableCell>
                      <TableCell>
                        <Badge
                          color={
                            tree.status === 'มีชีวิต' ? 'success'
                            : tree.status === 'ตายแล้ว' ? 'failure'
                            : tree.status === 'ถูกย้าย' ? 'warning'
                            : 'gray'
                          }
                          className={
                            tree.status === 'มีชีวิต'
                              ? 'dark:bg-green-600 dark:text-white'
                              : tree.status === 'ตายแล้ว'
                              ? 'dark:bg-red-600 dark:text-white'
                              : tree.status === 'ถูกย้าย'
                              ? 'dark:bg-yellow-400 dark:text-black'
                              : 'dark:bg-gray-700 dark:text-white'
                          }
                        >
                          {tree.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tree.images && tree.images.length > 0 ? (
                          <div className="flex gap-1">
                            {tree.images.slice(0, 2).map((img, idx) => (
                              <Image
                                key={img.id}
                                src={img.image}
                                alt={`รูปที่ ${idx + 1}`}
                                width={40}
                                height={40}
                                className="object-cover w-10 h-10 rounded-xl border-2 border-gray-300 shadow transition-all hover:scale-105 dark:border-gray-700"
                                tabIndex={0}
                                loading="lazy"
                                aria-label={`ดูรูปที่ ${idx + 1}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedTree(tree);
                                  setLightboxIndex(idx);
                                  setShowImageLightbox(true);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedTree(tree);
                                    setLightboxIndex(idx);
                                    setShowImageLightbox(true);
                                  }
                                }}
                              />
                            ))}
                          </div>
                          ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">ไม่มีรูป</span>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="flex justify-center mt-6 w-full">
              <ul className="flex items-center -space-x-px h-10 text-base">
                <li>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex justify-center items-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ms-0 border-e-0 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
                    </svg>
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page}>
                    <button
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${currentPage === page ? 'z-10 text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white' : 'bg-white'}`}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex justify-center items-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </Card>
        <div className="flex justify-end mt-6">
          <Button
            size="lg"
            className="px-8 py-3 text-xl bg-gradient-to-br from-green-400 to-blue-600 rounded-full shadow-md hover:from-green-500 hover:to-blue-700 dark:from-green-700 dark:to-blue-900 dark:text-white font-kanit focus:ring-2 focus:ring-green-400 dark:focus:ring-green-700"
            onClick={() => setShowAddModal(true)}
            disabled={loading || submitting}
            aria-disabled={loading || submitting}
          >
            <span className="mr-2 text-2xl font-bold">+</span> เพิ่มต้นไม้
          </Button>
        </div>
      </main>

      {/* Modal เพิ่มต้นไม้ใหม่ */}
      <Modal
        show={showAddModal}
        size="lg"
        aria-modal="true"
        initialFocus={addInitialRef}
        onClose={() => {
          setShowAddModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700"
        // modalOverlayClassName="!fixed !inset-0" // ถ้า overlay ไม่เต็มจอ ให้ uncomment บรรทัดนี้
      >
        <ModalHeader>
          <span className="text-2xl font-extrabold text-green-700 font-kanit sm:text-3xl md:text-4xl dark:text-green-300">เพิ่มต้นไม้ใหม่</span>
        </ModalHeader>
        <ModalBody className="rounded-b-2xl bg-slate-50 dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          {/* แสดง error message */}
          {formError && (
            <Alert id="addFormError" color="failure" className="mb-4" onDismiss={() => setFormError("")}> 
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <form
            aria-describedby={formError ? "addFormError" : undefined}
            onSubmit={e => {
              e.preventDefault();
              handleSubmit();
            }}
            className="grid grid-cols-1 gap-y-4 gap-x-8 text-base md:grid-cols-2 sm:text-lg font-kanit"
          >
            {/* กลุ่มที่ 1: ข้อมูลพื้นฐาน (สำคัญที่สุด) */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-green-700 border-b border-green-200 dark:text-green-300 dark:border-green-700">
                📋 ข้อมูลพื้นฐาน
              </h3>
            </div>
            {/* สายพันธุ์ (required) */}
            <div>
              <Label className="mb-1 font-semibold">สายพันธุ์ <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Select
                  ref={addInitialRef}
                  required
                  value={form.strainUuid}
                  onChange={e => setForm(f => ({ ...f, strainUuid: e.target.value }))}
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  disabled={strainsLoading}
                  aria-disabled={strainsLoading}
                >
                  <option value="">-- เลือกสายพันธุ์ --</option>
                  {strains.map(strain => (
                    <option key={strain.id} value={strain.id.toString()}>
                      {strain.name}
                    </option>
                  ))}
                </Select>
                {strainsLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner size="sm" color="info" aria-label="กำลังโหลดสายพันธุ์..." />
                  </div>
                )}
              </div>
              <Link href="/strains" className="text-sm text-blue-600">
                ไปหน้าจัดการสายพันธุ์
              </Link>
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
              <Label className="mb-1 font-semibold">ชุดการปลูก</Label>
              <div className="relative">
                <Select
                  value={form.batch_id ?? ""}
                  onChange={e => setForm(f => ({ ...f, batch_id: e.target.value ? Number(e.target.value) : null }))}
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={batchesLoading}
                  aria-disabled={batchesLoading}
                >
                  <option value="">-- เลือกชุดการปลูก --</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_code}
                    </option>
                  ))}
                </Select>
                {batchesLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner size="sm" color="info" aria-label="กำลังโหลดชุดการปลูก..." />
                  </div>
                )}
              </div>
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
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            {/* สถานะ (required) */}
            <div>
              <Label className="mb-1 font-semibold">สถานะ <span className="text-red-500">*</span></Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required>
                <option value="มีชีวิต">มีชีวิต</option>
                <option value="ตายแล้ว">ตายแล้ว</option>
                <option value="ถูกย้าย">ถูกย้าย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Select>
            </div>

            {/* กลุ่มที่ 2: ข้อมูลการปลูก */}
            <div className="md:col-span-2">
            <h3 className="pb-2 mb-3 text-lg font-bold text-blue-700 border-b border-blue-200 dark:text-blue-300 dark:border-blue-700">
                🌱 ข้อมูลการปลูก
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เมล็ดเริ่มงอก</Label>
              <TextInput
                type="date"
                value={form.germination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, germination_date: e.target.value }))}
              />
            </div>
            {/* วันที่ปลูก (required) */}
            <div>
              <Label className="mb-1 font-semibold">
                วันที่ปลูก <span className="text-red-500">*</span>
              </Label>
              <TextInput
                type="date"
                required
                value={form.plant_date}
                onChange={e => setForm(f => ({ ...f, plant_date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ระยะการเจริญเติบโต</Label>
              <TextInput value={form.growth_stage} placeholder="เช่น ต้นกล้า โตเต็มวัย" className="mt-1" onChange={e => setForm(f => ({ ...f, growth_stage: e.target.value }))} />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเกี่ยว</Label>
              <TextInput type="date" value={form.harvest_date} className="mt-1" onChange={e => setForm(f => ({ ...f, harvest_date: e.target.value }))} />
            </div>

            {/* กลุ่มที่ 3: ข้อมูลพันธุกรรม */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-purple-700 border-b border-purple-200 dark:text-purple-300 dark:border-purple-700">
                🧬 ข้อมูลพันธุกรรม
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">เพศ <span className="text-red-500">*</span></Label>
              <Select
                required
                value={form.sex}
                onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                className="mt-1"
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
              <Label className="mb-1 font-semibold">ข้อมูลพันธุกรรม</Label>
              <TextInput value={form.genotype} placeholder="ข้อมูลทางพันธุกรรม" className="mt-1" onChange={e => setForm(f => ({ ...f, genotype: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.phenotype}
                placeholder="เช่น ผลใหญ่ รสหวาน"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, phenotype: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นพ่อพันธุ์</Label>
              <Select
                value={form.parent_male ?? ""}
                onChange={e => setForm(f => ({ ...f, parent_male: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นพ่อพันธุ์ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่พันธุ์</Label>
              <Select
                value={form.parent_female ?? ""}
                onChange={e => setForm(f => ({ ...f, parent_female: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่พันธุ์ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่ที่ใช้ปักชำ</Label>
              <Select
                value={form.clone_source ?? ""}
                onChange={e => setForm(f => ({ ...f, clone_source: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่ที่ใช้ปักชำ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นที่ใช้ผสมเกสร</Label>
              <Select
                value={form.pollinated_by ?? ""}
                onChange={e => setForm(f => ({ ...f, pollinated_by: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นที่ใช้ผสมเกสร --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ผสมเกสร</Label>
              <TextInput
                type="date"
                value={form.pollination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, pollination_date: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 4: ข้อมูลผลผลิต */}
            <div className="md:col-span-2">
              <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-amber-700 border-b border-amber-200 dark:text-amber-300 dark:border-amber-700">
                <span>🌸</span> ข้อมูลผลผลิต
              </h3>
            </div>
            {/* ปริมาณผลผลิต (ไม่ติดลบ) */}
            <div>
              <Label className="mb-1 font-semibold">ปริมาณผลผลิต (กรัม)</Label>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.yield_amount ?? ""}
                onChange={e => {
                  const val = e.target.value ? parseFloat(e.target.value) : null;
                  if (val !== null && val < 0) return; // validation: ไม่ให้ติดลบ
                  setForm(f => ({ ...f, yield_amount: val }));
                }}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">จำนวนเมล็ด</Label>
              <TextInput
                type="number"
                min="0"
                value={form.seed_count ?? ""}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, seed_count: e.target.value ? parseInt(e.target.value) : null }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเมล็ด</Label>
              <TextInput
                type="date"
                value={form.seed_harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, seed_harvest_date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">คุณภาพ/ลักษณะของดอก</Label>
              <Textarea
                rows={2}
                value={form.flower_quality}
                placeholder="เช่น สี กลิ่น ขนาด ฯลฯ"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, flower_quality: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 5: ข้อมูลสุขภาพ */}
            <div className="md:col-span-2">
              <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-cyan-700 border-b border-cyan-200 dark:text-cyan-300 dark:border-cyan-700">
                <span>🩺</span> ข้อมูลสุขภาพ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">โรค/ศัตรูพืช</Label>
              <Textarea
                rows={2}
                value={form.disease_notes}
                placeholder="บันทึกโรคหรือปัญหาศัตรูพืช"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, disease_notes: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 6: ไฟล์และหมายเหตุ */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                📎 ไฟล์และหมายเหตุ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">เอกสาร (PDF, JPG, PNG)</Label>
              <FileInput
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setForm(f => ({ ...f, document: e.target.files?.[0] || null }))}
                className="mt-1"
              />
              {/* แสดง preview เอกสารเดิม ถ้ามี */}
              {selectedTree?.document && !form.document && (
                <div className="flex justify-between items-center p-4 mt-2 rounded-xl border border-gray-200 shadow bg-white/80 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 bg-blue-50 rounded-lg dark:bg-blue-900">
                      <svg className="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">เอกสารปัจจุบัน</span>
                        <Badge color={getFileType(selectedTree.document) === "PDF" ? "red" : "info"} className="ml-1">
                          {getFileType(selectedTree.document)}
                        </Badge>
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <Tooltip content={getFileName(selectedTree.document)} placement="bottom">
                          <a
                            href={selectedTree.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 transition hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            ดูเอกสาร
                          </a>
                        </Tooltip>
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{getFileName(selectedTree.document)}</span>
                      </div>
                    </div>
                  </div>
                  <Tooltip content="ลบเอกสารนี้" placement="left">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={handleShowDeleteDocumentModal}
                      className="ml-4 text-xs font-semibold"
                    >
                      ลบเอกสาร
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">รูปภาพ (เลือกได้หลายไฟล์)</Label>
              <FileInput
                multiple
                onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="mt-1"
              />
              {/* แสดง preview รูปภาพเดิม ถ้ามี */}
              {(selectedTree?.images?.length ?? 0) > 0 && imageFiles.length === 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedTree?.images ?? []).map((img, idx) => (
                    <div key={img.id} className="relative group">
                  <Image
                    src={img.image}
                    alt={`รูปที่ ${idx + 1}`}
                    width={56}
                    height={56}
                    className="object-cover w-14 h-14 rounded-xl border border-gray-200 shadow"
                  />
                      <Tooltip content="ลบรูปนี้" placement="top">
                        <button
                          type="button"
                          aria-label="ลบรูปภาพนี้"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer z-10 p-0"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  ))}
                  {/* ปุ่มลบรูปทั้งหมด */}
                  <Tooltip content="ลบรูปภาพทั้งหมด" placement="top">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={handleShowDeleteAllImagesModal}
                      className="flex justify-center items-center w-14 h-14 rounded-xl border border-gray-200 shadow"
                    >
                      ลบทั้งหมด
                    </Button>
                  </Tooltip>
              </div>
              )}

              {/* preview รูปใหม่ที่เลือก */}
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageFiles.map((file, idx) => (
                    <Image
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`รูปที่ ${idx + 1}`}
                      width={56}
                      height={56}
                      className="object-cover w-14 h-14 rounded-xl border border-gray-200 shadow"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">หมายเหตุ</Label>
              <Textarea
                rows={2}
                value={form.notes}
                placeholder="หมายเหตุเพิ่มเติม"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </ModalBody>
        <ModalFooter className="gap-3 justify-end pt-4 rounded-b-2xl bg-slate-50 dark:bg-gray-900">
        <Button
          color="green"
          size="lg"
          className="px-8 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-700 active:scale-95"
          onClick={handleSubmit}
          disabled={submitting}
          aria-label="บันทึกต้นไม้"
        >
          {submitting ? <Spinner size="sm" className="mr-2" /> : null}
          บันทึก
        </Button>
          <Button color="gray" size="lg" className="px-8 text-lg font-semibold transition-colors duration-200" onClick={() => setShowAddModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal ยืนยันการลบหลายรายการ */}
      <Modal
        show={showBulkDeleteModal}
        size="sm"
        aria-modal="true"
        onClose={() => {
          setShowBulkDeleteModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="xl:max-w-2xl"
      >
        <ModalHeader>ยืนยันการลบ</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบต้นไม้ {selectedIds.length} รายการ ใช่หรือไม่?
          </div>
          <div className="mt-4 text-sm text-center text-gray-600">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button color="red" disabled={submitting} onClick={performBulkDelete}>
            {submitting ? "กำลังลบ..." : "ลบ"}
          </Button>
          <Button color="gray" onClick={() => setShowBulkDeleteModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
      
      {/* Modal แสดงรายละเอียดต้นไม้ */}
      <Modal
        show={showDetailModal}
        size="xl"
        aria-modal="true"
        onClose={() => {
          setShowDetailModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
          setDetailLoading(false);
        }}
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700"
      >
        <ModalHeader className="rounded-t-2xl border-b border-gray-200 bg-white/80 dark:bg-gray-900/90 dark:border-gray-700">
          <span className="flex gap-2 items-center text-2xl font-extrabold text-green-700 font-kanit sm:text-3xl md:text-4xl dark:text-green-300">
            🌳 รายละเอียดต้นไม้
          </span>
        </ModalHeader>
        <ModalBody className="px-4 py-6 rounded-b-2xl transition-colors duration-300 bg-slate-50 dark:bg-gray-900/95 max-h-[80vh] overflow-y-auto">
          {detailLoading ? (
            <div className="flex flex-col gap-6 w-full animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-xl dark:bg-gray-700" />
              <div className="w-1/2 h-6 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-2/3 h-4 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-1/3 h-4 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-1/2 h-4 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-1/3 h-4 bg-gray-200 rounded dark:bg-gray-700" />
              <div className="w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700" />
            </div>
          ) : selectedTree ? (
            <div className="flex flex-col gap-6 w-full">
              {/* GALLERY */}
              <div className="flex flex-col items-center w-full">
                <h3 className="flex gap-2 items-center pb-2 mb-2 w-full text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-100 dark:border-gray-700">
                  <span className="text-2xl">🖼️</span> รูปภาพ
                </h3>
                {selectedTree.images?.length === 0 ? (
                  <span className="mb-2 text-lg text-gray-400 dark:text-gray-500">ไม่มีรูป</span>
                ) : (
                  <div className="flex relative justify-center items-center mb-2 w-48 h-48 bg-gray-50 rounded-xl shadow sm:w-60 sm:h-60 md:w-72 md:h-72 dark:bg-gray-800">
                    <Image
                      src={selectedTree.images[galleryIndex].image}
                      alt=""
                      width={192}
                      height={192}
                      className="object-contain w-full h-full rounded-xl border border-gray-200 shadow transition cursor-pointer hover:scale-105 dark:border-gray-700"
                      onClick={() => handleOpenLightbox(galleryIndex)}
                    />
                    {/* ปุ่มลบรูปภาพปัจจุบัน */}
                    {selectedTree.images && (selectedTree.images?.length ?? 0) > 0 && (
                        <button
                          type="button"
                        aria-label="ลบรูปภาพนี้"
                        onClick={() => handleDeleteImage(selectedTree.images[galleryIndex].id)}
                        className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer z-10 p-0"
                        >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        </button>
                    )}
                  </div>
                )}
                {selectedTree.images && (selectedTree.images?.length ?? 0) > 1 && (
                  <div className="flex gap-2 justify-center mt-2">
                    <Button
                      size="xs"
                      color="gray"
                      onClick={handlePrevImage}
                      className="px-2 py-1 rounded-full"
                      aria-label="ดูรูปก่อนหน้า"
                    >
                      &lt;
                    </Button>
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      {galleryIndex + 1} / {selectedTree.images?.length ?? 0}
                    </span>
                    <Button
                      size="xs"
                      color="gray"
                          onClick={handleNextImage}
                      className="px-2 py-1 rounded-full"
                      aria-label="ดูรูปถัดไป"
                    >
                      &gt;
                    </Button>
                        </div>
                )}
                {/* ปุ่มลบรูปภาพทั้งหมด */}
                {selectedTree.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      color="red"
                      size="sm"
                      onClick={handleShowDeleteAllImagesModal}
                      disabled={submitting}
                      className="text-xs"
                    >
                      {submitting ? "กำลังลบ..." : "ลบรูปภาพทั้งหมด"}
                    </Button>
                  </div>
                )}
              </div>

              {/* กลุ่มข้อมูลพื้นฐาน */}
                <div className="mb-4">
                  <h3 className="pb-2 mb-3 text-lg font-bold text-green-700 border-b border-green-200 dark:text-green-300 dark:border-green-700">
                  📋 ข้อมูลพื้นฐาน
                  </h3>
                  <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-base sm:text-lg md:grid-cols-2">
                    <div className="dark:text-gray-200"><span className="font-medium">สายพันธุ์: </span>{selectedTree.strain?.name || "-"}</div>
                    <div className="dark:text-gray-200"><span className="font-medium">พันธุ์: </span>{selectedTree.variety || "-"}</div>
                    <div className="dark:text-gray-200"><span className="font-medium">ชุดการปลูก: </span>{selectedTree.batch?.batch_code || "-"}</div>
                    <div className="dark:text-gray-200"><span className="font-medium">ชื่อเล่น: </span>{selectedTree.nickname || "-"}</div>
                    <div className="dark:text-gray-200"><span className="font-medium">สถานที่ปลูก: </span>{selectedTree.location || "-"}</div>
                    <div className="flex gap-2 items-center dark:text-gray-200"><span className="font-medium">สถานะ: </span>
                      <Badge
                        color={
                          selectedTree.status === 'มีชีวิต' ? 'success'
                          : selectedTree.status === 'ตายแล้ว' ? 'failure'
                          : selectedTree.status === 'ถูกย้าย' ? 'warning'
                          : 'gray'
                        }
                        className={
                          selectedTree.status === 'มีชีวิต'
                            ? 'dark:bg-green-600 dark:text-white'
                            : selectedTree.status === 'ตายแล้ว'
                            ? 'dark:bg-red-600 dark:text-white'
                            : selectedTree.status === 'ถูกย้าย'
                            ? 'dark:bg-yellow-400 dark:text-black'
                            : 'dark:bg-gray-700 dark:text-white'
                        }
                      >
                        {selectedTree.status}
                      </Badge>
                </div>
                    <div className="dark:text-gray-200"><span className="font-medium">วันที่ปลูก: </span>{selectedTree.plant_date || "-"}</div>
                    <div className="dark:text-gray-200"><span className="font-medium">อายุ: </span>{calcAge(selectedTree.plant_date, ageUnit)} {ageUnit === "day" ? "วัน" : ageUnit === "month" ? "เดือน" : "ปี"}</div>
                </div>
                </div>

              {/* กลุ่มข้อมูลการปลูก */}
              <div className="mb-4">
                <h3 className="pb-2 mb-3 text-lg font-bold text-blue-700 border-b border-blue-200 dark:text-blue-300 dark:border-blue-700">
                  🌱 ข้อมูลการปลูก
                </h3>
                <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-base sm:text-lg md:grid-cols-2">
                  <div className="dark:text-gray-200"><span className="font-semibold">วันที่เมล็ดเริ่มงอก: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.germination_date || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ระยะการเจริญเติบโต: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.growth_stage || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">วันที่เก็บเกี่ยว: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.harvest_date || "-"}</span></div>
                </div>
                </div>

              {/* กลุ่มข้อมูลพันธุกรรม */}
              <div className="mb-4">
                <h3 className="pb-2 mb-3 text-lg font-bold text-purple-700 border-b border-purple-200 dark:text-purple-300 dark:border-purple-700">
                  🧬 ข้อมูลพันธุกรรม
                </h3>
                <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-base sm:text-lg md:grid-cols-2">
                  <div className="flex gap-2 items-center dark:text-gray-200"><span className="font-semibold">เพศ: </span>
                    <Badge color={getSexBadgeColor(selectedTree.sex)} className="text-xs capitalize dark:bg-blue-400 dark:text-black">
                      {sexLabel(selectedTree.sex)}
                    </Badge>
                </div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ข้อมูลพันธุกรรม: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.genotype || "-"}</span></div>
                  <div className="md:col-span-2 dark:text-gray-200"><span className="font-semibold">ลักษณะเด่น: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.phenotype || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ต้นพ่อพันธุ์: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.parent_male || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ต้นแม่พันธุ์: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.parent_female || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ต้นแม่ที่ใช้ปักชำ: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.clone_source || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">ต้นที่ใช้ผสมเกสร: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.pollinated_by || "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">วันที่ผสมเกสร: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.pollination_date || "-"}</span></div>
                </div>
                </div>

              {/* กลุ่มข้อมูลผลผลิต */}
              <div className="mb-4">
                <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-amber-700 border-b border-amber-200 dark:text-amber-300 dark:border-amber-700">
                  <span>🌸</span> ข้อมูลผลผลิต
                </h3>
                <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-base sm:text-lg md:grid-cols-2">
                  <div className="dark:text-gray-200"><span className="font-semibold">ปริมาณผลผลิต (กรัม): </span><span className="text-white/90 dark:text-gray-100">{selectedTree.yield_amount ?? "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">จำนวนเมล็ด: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.seed_count ?? "-"}</span></div>
                  <div className="dark:text-gray-200"><span className="font-semibold">วันที่เก็บเมล็ด: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.seed_harvest_date || "-"}</span></div>
                  <div className="md:col-span-2 dark:text-gray-200"><span className="font-semibold">คุณภาพ/ลักษณะของดอก: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.flower_quality || "-"}</span></div>
                </div>
              </div>

              {/* กลุ่มข้อมูลสุขภาพ */}
              <div className="mb-4">
                <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-cyan-700 border-b border-cyan-200 dark:text-cyan-300 dark:border-cyan-700">
                  <span>🩺</span> ข้อมูลสุขภาพ
                </h3>
                <div className="w-full text-base sm:text-lg dark:text-gray-200">
                  <span className="font-semibold">โรค/ศัตรูพืช: </span><span className="text-white/90 dark:text-gray-100">{selectedTree.disease_notes || "-"}</span>
                </div>
              </div>

              {/* กลุ่มข้อมูลไฟล์/หมายเหตุ */}
                <div>
                <h3 className="pb-2 mb-3 text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                  📎 ไฟล์และหมายเหตุ
                </h3>
                <div className="grid grid-cols-1 gap-y-2 gap-x-8 w-full text-base sm:text-lg md:grid-cols-2">
                  <div className="flex gap-2 items-center dark:text-gray-200">
                    <span className="font-medium">เอกสาร:</span>
                    {selectedTree.document ? (
                      <div className="flex gap-3 items-center p-2 bg-gray-50 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex justify-center items-center w-8 h-8 bg-red-50 rounded-lg dark:bg-red-900">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7L15 2.586A2 2 0 0 0 13.586 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex gap-2 items-center">
                            <Tooltip content={getFileName(selectedTree.document)} placement="bottom">
                              <a
                                href={selectedTree.document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline truncate max-w-[120px] dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                              >
                                {getFileName(selectedTree.document)}
                              </a>
                            </Tooltip>
                            <Badge color="red" className="text-xs px-2 py-0.5 ml-1 dark:bg-red-500 dark:text-white">
                              PDF
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="ml-2 text-gray-400 dark:text-gray-500">ไม่มีเอกสาร</span>
                    )}
                  </div>
                  <div className="md:col-span-2 dark:text-gray-200">
                  <span className="font-medium">หมายเหตุ: </span>{selectedTree.notes || "-"}
                </div>
                </div>
              </div>

              <div className="pt-2 w-full text-xs text-right text-gray-400 dark:text-gray-500">
                เพิ่มเมื่อ: {selectedTree.created_at?.split("T")[0]}
                {selectedTree.updated_at && selectedTree.updated_at !== selectedTree.created_at &&
                  <>, อัพเดทล่าสุด: {selectedTree.updated_at?.split("T")[0]}</>
                }
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูล</div>
          )}
        </ModalBody>
        <ModalFooter className="justify-between rounded-b-2xl border-t border-gray-200 transition-colors duration-300 bg-slate-50 dark:bg-gray-900/95 dark:border-gray-700">
          <div className="flex gap-2">
            <Button color="blue" className="transition-colors duration-200 font-kanit dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700" onClick={handleShowEdit}>
              แก้ไข
            </Button>
            <Button color="red" className="transition-colors duration-200 font-kanit dark:bg-red-700 dark:text-white dark:hover:bg-red-800 focus:ring-2 focus:ring-red-400 dark:focus:ring-red-700" onClick={handleShowDelete}>
              ลบ
            </Button>
          </div>
          <Button color="gray" className="transition-colors duration-200 font-kanit dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700" onClick={() => setShowDetailModal(false)}>
            ปิด
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal แก้ไขต้นไม้ */}
      <Modal
        show={showEditModal}
        size="lg"
        aria-modal="true"
        initialFocus={editInitialRef}
        onClose={() => {
          setShowEditModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalHeader>แก้ไขต้นไม้</ModalHeader>
        <ModalBody className="rounded-b-2xl bg-slate-50 dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          {/* แสดง error message */}
          {formError && (
            <Alert id="editFormError" color="failure" className="mb-4" onDismiss={() => setFormError("")}> 
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <form
            aria-describedby={formError ? "editFormError" : undefined}
            onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}
            className="grid grid-cols-1 gap-y-4 gap-x-8 text-base md:grid-cols-2 sm:text-lg font-kanit"
          >
            {/* กลุ่มที่ 1: ข้อมูลพื้นฐาน (สำคัญที่สุด) */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-green-700 border-b border-green-200 dark:text-green-300 dark:border-green-700">
                📋 ข้อมูลพื้นฐาน
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">สายพันธุ์ <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Select
                  ref={editInitialRef}
                  required
                  value={form.strainUuid}
                  onChange={e => setForm(f => ({ ...f, strainUuid: e.target.value }))}
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  disabled={strainsLoading}
                  aria-disabled={strainsLoading}
                >
                  <option value="">-- เลือกสายพันธุ์ --</option>
                  {strains.map(strain => (
                    <option key={strain.id} value={strain.id.toString()}>
                      {strain.name}
                    </option>
                  ))}
                </Select>
                {strainsLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner size="sm" color="info" aria-label="กำลังโหลดสายพันธุ์..." />
                  </div>
                )}
              </div>
              <Link href="/strains" className="text-sm text-blue-600">
                ไปหน้าจัดการสายพันธุ์
              </Link>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชุดการปลูก</Label>
              <div className="relative">
                <Select
                  value={form.batch_id ?? ""}
                  onChange={e => setForm(f => ({ ...f, batch_id: e.target.value ? Number(e.target.value) : null }))}
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={batchesLoading}
                  aria-disabled={batchesLoading}
                >
                  <option value="">-- เลือกชุดการปลูก --</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_code}
                    </option>
                  ))}
                </Select>
                {batchesLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner size="sm" color="info" aria-label="กำลังโหลดชุดการปลูก..." />
                  </div>
                )}
              </div>
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
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">สถานะ <span className="text-red-500">*</span></Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required>
                <option value="มีชีวิต">มีชีวิต</option>
                <option value="ตายแล้ว">ตายแล้ว</option>
                <option value="ถูกย้าย">ถูกย้าย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </Select>
            </div>

            {/* กลุ่มที่ 2: ข้อมูลการปลูก */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-blue-700 border-b border-blue-200 dark:text-blue-300 dark:border-blue-700">
                🌱 ข้อมูลการปลูก
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เมล็ดเริ่มงอก</Label>
              <TextInput
                type="date"
                value={form.germination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, germination_date: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ปลูก <span className="text-red-500">*</span></Label>
              <TextInput type="date" value={form.plant_date} className="mt-1" onChange={e => setForm(f => ({ ...f, plant_date: e.target.value }))} required />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ระยะการเจริญเติบโต</Label>
              <TextInput
                value={form.growth_stage}
                placeholder="เช่น ต้นกล้า โตเต็มวัย"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, growth_stage: e.target.value }))}
              />
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

            {/* กลุ่มที่ 3: ข้อมูลพันธุกรรม */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-purple-700 border-b border-purple-200 dark:text-purple-300 dark:border-purple-700">
                🧬 ข้อมูลพันธุกรรม
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">เพศ <span className="text-red-500">*</span></Label>
              <Select value={form.sex} className="mt-1" onChange={e => setForm(f => ({ ...f, sex: e.target.value }))} required>
                <option value="bisexual">สมบูรณ์เพศ</option>
                <option value="male">ตัวผู้</option>
                <option value="female">ตัวเมีย</option>
                <option value="monoecious">แยกเพศในต้นเดียวกัน</option>
                <option value="mixed">ผสมหลายเพศ</option>
                <option value="unknown">ไม่ระบุ/ไม่แน่ใจ</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ข้อมูลพันธุกรรม</Label>
              <TextInput
                value={form.genotype}
                placeholder="ข้อมูลทางพันธุกรรม"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, genotype: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.phenotype}
                placeholder="เช่น ผลใหญ่ รสหวาน"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, phenotype: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นพ่อพันธุ์</Label>
              <Select
                value={form.parent_male ?? ""}
                onChange={e => setForm(f => ({ ...f, parent_male: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นพ่อพันธุ์ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่พันธุ์</Label>
              <Select
                value={form.parent_female ?? ""}
                onChange={e => setForm(f => ({ ...f, parent_female: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่พันธุ์ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่ที่ใช้ปักชำ</Label>
              <Select
                value={form.clone_source ?? ""}
                onChange={e => setForm(f => ({ ...f, clone_source: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่ที่ใช้ปักชำ --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นที่ใช้ผสมเกสร</Label>
              <Select
                value={form.pollinated_by ?? ""}
                onChange={e => setForm(f => ({ ...f, pollinated_by: e.target.value ? Number(e.target.value) : null }))}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นที่ใช้ผสมเกสร --</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>{tree.nickname || tree.id}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ผสมเกสร</Label>
              <TextInput
                type="date"
                value={form.pollination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, pollination_date: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 4: ข้อมูลผลผลิต */}
            <div className="md:col-span-2">
              <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-amber-700 border-b border-amber-200 dark:text-amber-300 dark:border-amber-700">
                <span>🌸</span> ข้อมูลผลผลิต
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ปริมาณผลผลิต (กรัม)</Label>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={form.yield_amount ?? ""}
                onChange={e => {
                  const val = e.target.value ? parseFloat(e.target.value) : null;
                  if (val !== null && val < 0) return; // validation: ไม่ให้ติดลบ
                  setForm(f => ({ ...f, yield_amount: val }));
                }}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">จำนวนเมล็ด</Label>
              <TextInput
                type="number"
                min="0"
                value={form.seed_count ?? ""}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, seed_count: e.target.value ? parseInt(e.target.value) : null }))}
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเมล็ด</Label>
              <TextInput
                type="date"
                value={form.seed_harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, seed_harvest_date: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">คุณภาพ/ลักษณะของดอก</Label>
              <Textarea
                rows={2}
                value={form.flower_quality}
                placeholder="เช่น สี กลิ่น ขนาด ฯลฯ"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, flower_quality: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 5: ข้อมูลสุขภาพ */}
            <div className="md:col-span-2">
              <h3 className="flex gap-2 items-center pb-2 mb-3 text-lg font-bold text-cyan-700 border-b border-cyan-200 dark:text-cyan-300 dark:border-cyan-700">
                <span>🩺</span> ข้อมูลสุขภาพ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">โรค/ศัตรูพืช</Label>
              <Textarea
                rows={2}
                value={form.disease_notes}
                placeholder="บันทึกโรคหรือปัญหาศัตรูพืช"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, disease_notes: e.target.value }))}
              />
            </div>

            {/* กลุ่มที่ 6: ไฟล์และหมายเหตุ */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                📎 ไฟล์และหมายเหตุ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">เอกสาร (PDF, JPG, PNG)</Label>
              <FileInput
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setForm(f => ({ ...f, document: e.target.files?.[0] || null }))}
                className="mt-1"
              />
              {/* แสดง preview เอกสารเดิม ถ้ามี */}
              {selectedTree?.document && !form.document && (
                <div className="flex justify-between items-center p-4 mt-2 rounded-xl border border-gray-200 shadow bg-white/80 dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 bg-blue-50 rounded-lg dark:bg-blue-900">
                      <svg className="w-7 h-7 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">เอกสารปัจจุบัน</span>
                        <Badge color={getFileType(selectedTree.document) === "PDF" ? "red" : "info"} className="ml-1">
                          {getFileType(selectedTree.document)}
                        </Badge>
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <Tooltip content={getFileName(selectedTree.document)} placement="bottom">
                          <a
                            href={selectedTree.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 transition hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          >
                            ดูเอกสาร
                          </a>
                        </Tooltip>
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{getFileName(selectedTree.document)}</span>
                      </div>
                    </div>
                  </div>
                  <Tooltip content="ลบเอกสารนี้" placement="left">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={handleShowDeleteDocumentModal}
                      className="ml-4 text-xs font-semibold"
                    >
                      ลบเอกสาร
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">รูปภาพ (เลือกได้หลายไฟล์)</Label>
              <FileInput
                multiple
                onChange={e => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                className="mt-1"
              />
              {/* แสดง preview รูปภาพเดิม ถ้ามี */}
              {(selectedTree?.images?.length ?? 0) > 0 && imageFiles.length === 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(selectedTree?.images ?? []).map((img, idx) => (
                    <div key={img.id} className="relative group">
                  <Image
                    src={img.image}
                    alt={`รูปที่ ${idx + 1}`}
                    width={56}
                    height={56}
                    className="object-cover w-14 h-14 rounded-xl border border-gray-200 shadow"
                  />
                      <Tooltip content="ลบรูปนี้" placement="top">
                        <button
                          type="button"
                          aria-label="ลบรูปภาพนี้"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 border-2 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer z-10 p-0"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  ))}
                  {/* ปุ่มลบรูปทั้งหมด */}
                  <Tooltip content="ลบรูปภาพทั้งหมด" placement="top">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={handleShowDeleteAllImagesModal}
                      className="flex justify-center items-center w-14 h-14 rounded-xl border border-gray-200 shadow"
                    >
                      ลบทั้งหมด
                    </Button>
                  </Tooltip>
              </div>
              )}

              {/* preview รูปใหม่ที่เลือก */}
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {imageFiles.map((file, idx) => (
                    <Image
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`รูปที่ ${idx + 1}`}
                      width={56}
                      height={56}
                      className="object-cover w-14 h-14 rounded-xl border border-gray-200 shadow"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">หมายเหตุ</Label>
              <Textarea
                rows={2}
                value={form.notes}
                placeholder="หมายเหตุเพิ่มเติม"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" />
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
        aria-modal="true"
        initialFocus={deleteConfirmRef}
        onClose={() => {
          setShowDeleteModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="xl:max-w-2xl"
        // modalOverlayClassName="!fixed !inset-0"
      >
        <ModalHeader>ยืนยันการลบ</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบต้นไม้ &quot;{selectedTree?.strain?.name || ''} ({selectedTree?.nickname})&quot; ใช่หรือไม่?
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button ref={deleteConfirmRef} color="red" disabled={submitting} onClick={handleDelete}>
            {submitting ? "กำลังลบ..." : "ลบ"}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal ยืนยันการลบรูปภาพทั้งหมด */}
      <Modal
        show={showDeleteAllImagesModal}
        size="sm"
        aria-modal="true"
        initialFocus={deleteImagesConfirmRef}
        onClose={() => {
          setShowDeleteAllImagesModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="xl:max-w-2xl"
      >
        <ModalHeader>ยืนยันการลบรูปภาพทั้งหมด</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบรูปภาพทั้งหมด ({selectedTree?.images?.length ?? 0} รูป) ของต้นไม้ &quot;{selectedTree?.strain?.name || ''} ({selectedTree?.nickname})&quot; ใช่หรือไม่?
          </div>
          <div className="mt-4 text-sm text-center text-gray-600">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button ref={deleteImagesConfirmRef} color="red" disabled={submitting} onClick={handleDeleteAllImages}>
            {submitting ? "กำลังลบ..." : "ลบรูปภาพทั้งหมด"}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteAllImagesModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal ยืนยันการลบเอกสาร */}
      <Modal
        show={showDeleteDocumentModal}
        size="sm"
        aria-modal="true"
        initialFocus={deleteDocConfirmRef}
        onClose={() => {
          setShowDeleteDocumentModal(false);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="xl:max-w-2xl"
      >
        <ModalHeader>ยืนยันการลบเอกสาร</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบเอกสารของต้นไม้ &quot;{selectedTree?.strain?.name || ''} ({selectedTree?.nickname})&quot; ใช่หรือไม่?
          </div>
          <div className="mt-4 text-sm text-center text-gray-600">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button ref={deleteDocConfirmRef} color="red" disabled={submitting} onClick={handleDeleteDocument}>
            {submitting ? "กำลังลบ..." : "ลบเอกสาร"}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteDocumentModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Lightbox Modal for images (fullscreen) */}
      <Modal
        show={showImageLightbox}
        size="5xl"
        aria-modal="true"
        onClose={() => {
          handleCloseLightbox();
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
          setImageFiles([]);
          setSelectedTree(null);
        }}
        className="z-[9999] xl:max-w-5xl"
      >
        <ModalBody className="bg-black/80 flex flex-col items-center justify-center min-h-[60vh] relative p-0">
          {/* ปุ่มปิด */}
          <button
            onClick={handleCloseLightbox}
            className="flex absolute top-4 right-4 z-20 justify-center items-center w-12 h-12 text-white bg-red-500 rounded-full shadow-lg transition hover:bg-red-600 focus:ring-2 focus:ring-red-300"
            aria-label="ปิดดูรูป"
      >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* ลำดับรูป */}
          {selectedTree && selectedTree.images?.length > 1 && (
            <span className="absolute top-4 left-4 z-20 px-3 py-1 text-sm text-white rounded-full select-none bg-black/60">
              {lightboxIndex + 1} / {selectedTree.images.length}
            </span>
          )}
          {/* ปุ่มเลื่อนซ้าย */}
          {selectedTree && (selectedTree.images?.length ?? 0) > 1 && (
            <button
              onClick={handleLightboxPrev}
              className="flex absolute left-4 top-1/2 z-20 justify-center items-center w-14 h-14 text-gray-800 rounded-full shadow-lg transition -translate-y-1/2 bg-white/80 hover:bg-white focus:ring-2 focus:ring-blue-300"
              aria-label="ดูรูปก่อนหน้า"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {/* รูปภาพหลัก */}
          {selectedTree && selectedTree.images?.length > 0 && (
            <Image
              src={selectedTree.images[lightboxIndex].image}
              alt={`รูปที่ ${lightboxIndex + 1}`}
              width={768}
              height={768}
              className="object-contain max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl border-4 border-white dark:border-gray-800 transition select-none"
              draggable={false}
            />
          )}

          {/* ปุ่มเลื่อนขวา */}
          {selectedTree && (selectedTree.images?.length ?? 0) > 1 && (
                    <button
                      onClick={handleLightboxNext}
              className="flex absolute right-4 top-1/2 z-20 justify-center items-center w-14 h-14 text-gray-800 rounded-full shadow-lg transition -translate-y-1/2 bg-white/80 hover:bg-white focus:ring-2 focus:ring-blue-300"
              aria-label="ดูรูปถัดไป"
                    >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
                    </button>
                )}
          {/* Thumbnails */}
          <div
            className="flex flex-row flex-nowrap gap-2 justify-center px-4 mt-6 mb-2 max-w-full max-h-[4.5rem] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
          >
            {selectedTree?.images?.map((img, idx) => (
              <Image
                key={img.id ?? idx}
                src={img.image}
                alt={`thumbnail ${idx + 1}`}
                width={64}
                height={64}
                className={`w-16 h-16 object-cover rounded-xl border-4 transition cursor-pointer select-none ${
                  lightboxIndex === idx
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-white opacity-70 hover:scale-105'
                }`}
                onClick={() => setLightboxIndex(idx)}
                draggable={false}
              />
            ))}
              </div>

          {/* ปุ่มปิด (mobile) */}
          <Button color="gray" className="mt-2 md:hidden" onClick={handleCloseLightbox}>
            ปิดรูป
              </Button>
        </ModalBody>
      </Modal>
      <div className="fixed top-4 right-4 z-[10000] space-y-2" aria-live="polite">
        {successMessage && (
          <Toast className="flex gap-2 items-center text-green-800 bg-green-50 border border-green-300 shadow dark:bg-green-800 dark:text-green-100">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            <span className="font-semibold" aria-live="polite">{successMessage}</span>
            <ToastToggle onDismiss={() => setSuccessMessage("")} />
          </Toast>
        )}
        {errorMessage && (
          <Toast className="flex gap-2 items-center text-red-800 bg-red-50 border border-red-300 shadow dark:bg-red-800 dark:text-red-100">
            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            <span className="font-semibold" aria-live="polite">{errorMessage}</span>
            <ToastToggle onDismiss={() => setErrorMessage("")} />
          </Toast>
        )}
      </div>
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

function getSortValue(
  tree: Tree,
  key: "strain" | "nickname" | "plant_date" | "variety" | "sex" | "status"
) {
  if (key === "strain") return tree.strain?.name?.toLowerCase() || "";
  if (key === "nickname") return tree.nickname?.toLowerCase() || "";
  if (key === "plant_date") return tree.plant_date || "";
  if (key === "variety") return tree.variety?.toLowerCase() || "";
  if (key === "sex") return tree.sex?.toLowerCase() || "";
  if (key === "status") return tree.status?.toLowerCase() || "";
  return "";
}

function getFileName(url: string) {
  try {
    return decodeURIComponent(url.split("/").pop() || "");
  } catch {
    return url;
  }
}

function getFileType(url: string) {
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (["jpg", "jpeg", "png"].includes(ext || "")) return "Image";
  return "File";
}

// Helper: แปลง sex เป็นสี badge (Flowbite)
function getSexBadgeColor(sex: string): string {
  switch (sex) {
    case 'male': return 'info'; // ฟ้า
    case 'female': return 'pink'; // ชมพู
    case 'bisexual': return 'success'; // เขียว
    case 'mixed': return 'warning'; // เหลือง
    case 'monoecious': return 'blue'; // น้ำเงิน
    case 'unknown': return 'gray'; // เทา
    default: return 'gray';
  }
}

// Helper: แปลง sex เป็น label ภาษาไทย
function sexLabel(sex: string): string {
  switch (sex) {
    case 'bisexual': return 'สมบูรณ์เพศ';
    case 'male': return 'ตัวผู้';
    case 'female': return 'ตัวเมีย';
    case 'monoecious': return 'แยกเพศในต้นเดียวกัน';
    case 'mixed': return 'ผสมหลายเพศ';
    case 'unknown': return 'ไม่ระบุ/ไม่แน่ใจ';
    default: return '-';
  }
}
