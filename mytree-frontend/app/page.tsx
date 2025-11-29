"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
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
import {
  HiSearch,
  HiCheckCircle,
  HiXCircle,
  HiCollection,
  HiOutlineBeaker,
  HiTrash,
  HiPlus,
} from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import { Tree, Strain, Batch } from "./types";
import {
  calcAge,
  getSortValue,
  getFileName,
  getFileType,
  getSexBadgeColor,
  sexLabel,
} from "./utils";
import { TreeCard, TreeCardSkeleton } from "../components/TreeCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { TreeTable } from "../components/TreeTable";
import { FilterBar } from "../components/FilterBar";
import { useDebouncedSearch } from "./hooks";

const API_BASE = process.env.NODE_ENV === 'development' 
  ? "http://127.0.0.1:8000" 
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", ...ACCEPTED_IMAGE_TYPES];

const getDefaultForm = (todayStr = new Date().toISOString().split("T")[0]) => ({
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
  generation: "",
});

export default function Dashboard() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRTree, setSelectedQRTree] = useState<Tree | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [showDeleteAllImagesModal, setShowDeleteAllImagesModal] =
    useState(false);
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

  // เพิ่ม state สำหรับ uploading overlay
  const [uploading, setUploading] = useState(false);

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
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
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
    generation: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const valid: File[] = [];
    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setFormError("รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError("ขนาดไฟล์ต้องไม่เกิน 20MB");
        continue;
      }
      valid.push(file);
    }
    if (valid.length === files.length) setFormError("");
    setImageFiles(valid);
  };
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
        setFormError("เอกสารต้องเป็น PDF หรือภาพ JPG, PNG, WEBP");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError("ขนาดเอกสารต้องไม่เกิน 20MB");
        return;
      }
    }
    setFormError("");
    setForm((f) => ({ ...f, document: file }));
  };

  // Drag & Drop Handlers
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  const handleDragOverDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(true);
  };

  const handleDragLeaveDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
  };

  const handleDropDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type)) {
        setFormError("เอกสารต้องเป็น PDF หรือภาพ JPG, PNG, WEBP");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFormError("ขนาดเอกสารต้องไม่เกิน 20MB");
        return;
      }
      setFormError("");
      setForm((f) => ({ ...f, document: file }));
    }
  };

  const handleDragOverImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(true);
  };

  const handleDragLeaveImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
  };
  const handleDropImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles: File[] = [];
    let errorMsg = "";

    files.forEach((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        errorMsg = "บางไฟล์ไม่ใช่รูปภาพที่รองรับ (JPG, PNG, WEBP)";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        errorMsg = "บางรูปภาพมีขนาดเกิน 20MB";
        return;
      }
      validFiles.push(file);
    });

    if (errorMsg) {
      setFormError(errorMsg);
    } else {
      setFormError("");
    }

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
    }
  };
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const debouncedSearch = useDebouncedSearch((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, 350);

  // Fetch Data
  const fetchTrees = () => {
    const url = `${API_BASE}/api/trees/`;
    console.log("Fetching trees from:", url);
    // setLoading(true); // Remove redundant loading (handled by skeleton in table)
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => setTrees(data))
      .catch((err) => {
        console.error("Error fetching trees:", err);
        setErrorMessage("โหลดข้อมูลไม่สำเร็จ: " + (err.message || "Unknown error"));
      })
      .finally(() => setLoading(false));
  };

  const fetchStrains = () => {
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
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  // ฟังก์ชัน filter
  const filteredTrees = trees.filter((tree) => {
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
  const pagedTrees = sortedTrees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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
    setUploading(true); // แสดง overlay uploading
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (key === "strainUuid") {
          formData.append("strain_id", value ? value.toString() : "");
        } else if (key === "batch_id") {
          if (value === null || value === "") {
            formData.append("batch_id", "");
          } else {
            formData.append("batch_id", value.toString());
          }
        } else if (key === "document") {
          if (value === null) {
            // ถ้าต้องการลบไฟล์ document ให้ append เป็น "" หรือไม่ส่งเลย (ขึ้นกับ backend)
            formData.append("document", "");
          } else if (value instanceof File) {
            formData.append("document", value);
          }
        } else if (
          [
            "parent_male",
            "parent_female",
            "clone_source",
            "pollinated_by",
            "yield_amount",
            "seed_count",
          ].includes(key)
        ) {
          // ถ้าเป็น number field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else if (
          [
            "germination_date",
            "harvest_date",
            "pollination_date",
            "seed_harvest_date",
            "plant_date",
          ].includes(key)
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
      imageFiles.forEach((file) => {
        formData.append("uploaded_images", file);
      });
      if (form.document) formData.append("document", form.document);
      if (form.parent_male)
        formData.append("parent_male", form.parent_male.toString());
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
        generation: "",
      });
      setImageFiles([]);
      fetchTrees();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError("บันทึกข้อมูลไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
      setUploading(false); // ซ่อน overlay uploading
    }
  }, [form, imageFiles, todayStr]);

  const handleShowEdit = (tree?: Tree) => {
    const target = tree || selectedTree;
    if (!target) return;
    setSelectedTree(target);
    setForm({
      strainUuid: target.strain?.id?.toString() || "",
      batch_id: target.batch?.id || null,
      variety: target.variety || "",
      nickname: target.nickname || "",
      plant_date: target.plant_date || "",
      germination_date: target.germination_date || "",
      growth_stage: target.growth_stage || "",
      harvest_date: target.harvest_date || "",
      location: target.location || "",
      phenotype: target.phenotype || "",
      status: target.status || "",
      sex: target.sex || "unknown",
      genotype: target.genotype || "",
      parent_male: target.parent_male,
      parent_female: target.parent_female,
      clone_source: target.clone_source,
      pollinated_by: target.pollinated_by,
      pollination_date: target.pollination_date || "",
      yield_amount: target.yield_amount,
      flower_quality: target.flower_quality || "",
      seed_count: target.seed_count,
      seed_harvest_date: target.seed_harvest_date || "",
      disease_notes: target.disease_notes || "",
      document: null as File | null,
      notes: target.notes || "",
      generation: target.generation || "",
    });
    setImageFiles([]);
    setShowDetailModal(false);
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
    setUploading(true); // แสดง overlay uploading
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (key === "strainUuid") {
          formData.append("strain_id", value ? value.toString() : "");
        } else if (key === "batch_id") {
          if (value === null || value === "") {
            formData.append("batch_id", "");
          } else {
            formData.append("batch_id", value.toString());
          }
        } else if (key === "document") {
          if (value === null) {
            // ถ้าต้องการลบไฟล์ document ให้ append เป็น "" หรือไม่ส่งเลย (ขึ้นกับ backend)
            formData.append("document", "");
          } else if (value instanceof File) {
            formData.append("document", value);
          }
        } else if (
          [
            "parent_male",
            "parent_female",
            "clone_source",
            "pollinated_by",
            "yield_amount",
            "seed_count",
          ].includes(key)
        ) {
          // ถ้าเป็น number field
          if (value === null || value === "") {
            formData.append(key, "");
          } else {
            formData.append(key, value.toString());
          }
        } else if (
          [
            "germination_date",
            "harvest_date",
            "pollination_date",
            "seed_harvest_date",
            "plant_date",
          ].includes(key)
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
      imageFiles.forEach((file) => {
        formData.append("uploaded_images", file);
      });
      if (form.document) formData.append("document", form.document);
      if (form.parent_male)
        formData.append("parent_male", form.parent_male.toString());
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
        generation: selectedTree.generation || "",
      });
      setImageFiles([]);
      fetchTrees();
      setSuccessMessage("บันทึกข้อมูลสำเร็จ");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError("แก้ไขข้อมูลไม่สำเร็จ: " + message);
    } finally {
      setSubmitting(false);
      setUploading(false); // ซ่อน overlay uploading
    }
  }, [form, imageFiles, selectedTree, todayStr]);

  const handleShowQR = (tree: Tree) => {
    setSelectedQRTree(tree);
    setShowQRModal(true);
  };

  const handleShowDelete = (tree?: Tree) => {
    if (tree) setSelectedTree(tree);
    setShowDeleteModal(true);
  };

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
      setSelectedTree((prev) =>
        prev
          ? {
              ...prev,
              images: prev.images.filter((img) => img.id !== id),
            }
          : null
      );
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
      setSelectedTree((prev) =>
        prev
          ? {
              ...prev,
              images: [],
            }
          : null
      );
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
      const res = await fetch(
        `${API_BASE}/api/trees/${selectedTree.id}/delete_document/`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        alert("ลบเอกสารไม่สำเร็จ: " + errorText);
        return;
      }
      setShowDeleteDocumentModal(false);
      fetchTrees();
      // อัปเดต selectedTree เพื่อให้แสดงผลถูกต้อง
      const updatedTree = await fetch(
        `${API_BASE}/api/trees/${selectedTree.id}/`
      ).then((res) => res.json());
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
        const res = await fetch(`${API_BASE}/api/trees/${id}/`, {
          method: "DELETE",
        });
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
    setGalleryIndex(
      (idx) =>
        (idx - 1 + selectedTree.images.length) % selectedTree.images.length
    );
  }, [selectedTree]);
  const handleNextImage = useCallback(() => {
    if (!selectedTree || selectedTree.images.length === 0) return;
    setGalleryIndex((idx) => (idx + 1) % selectedTree.images.length);
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
    setLightboxIndex(
      (idx) =>
        (idx - 1 + selectedTree.images.length) % selectedTree.images.length
    );
  }, [selectedTree]);
  const handleLightboxNext = useCallback(() => {
    if (!selectedTree) return;
    setLightboxIndex((idx) => (idx + 1) % selectedTree.images.length);
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
  }, [
    showImageLightbox,
    selectedTree,
    handleCloseLightbox,
    handleLightboxPrev,
    handleLightboxNext,
  ]);

  // Hotkey: submit form with Enter key when modal is open
  useEffect(() => {
    if (!showAddModal && !showEditModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA") return;
      e.preventDefault();
      if (showAddModal) handleSubmit();
      if (showEditModal) handleEditSubmit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showAddModal, showEditModal, handleSubmit, handleEditSubmit]);


  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-kanit">

      {/* Overlay Spinner กลางจอ ขณะ loading */}
      {loading && (
        <div className="fixed inset-0 z-20000 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Spinner size="xl" color="success" aria-label="กำลังโหลดข้อมูล..." />
          <span
            className="ml-4 text-lg font-bold text-green-700 dark:text-green-300"
            role="status"
          >
            กำลังโหลดข้อมูล...
          </span>
        </div>
      )}
      <main className="px-3 py-4 mx-auto w-full max-w-7xl sm:px-6 lg:px-8 md:py-8 pb-24">
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white font-kanit text-center sm:text-left">
            รายการต้นไม้ที่ปลูก
          </h1>
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex">
            <Tooltip content="ไปหน้าจัดการสายพันธุ์">
              <Link href="/strains" className="w-full sm:w-auto">
                <Button
                  color="light"
                  size="sm"
                  className="flex justify-center items-center gap-2 w-full font-kanit shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <HiCollection className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">สายพันธุ์</span>
                </Button>
              </Link>
            </Tooltip>
            <Tooltip content="ไปหน้าจัดการชุดการปลูก">
              <Link href="/batches" className="w-full sm:w-auto">
                <Button
                  color="light"
                  size="sm"
                  className="flex justify-center items-center gap-2 w-full font-kanit shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <HiOutlineBeaker className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="ml-2">ชุดการปลูก</span>
                </Button>
              </Link>
            </Tooltip>
          </div>
        </div>
        {/* Filter Bar & View Toggle */}
        <div className="mb-6">
          <FilterBar
            search={search}
            onSearchChange={debouncedSearch}
            selectedCount={selectedIds.length}
            onBulkDelete={() => setShowBulkDeleteModal(true)}
            onClearSelection={() => setSelectedIds([])}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* CONTENT */}
        {viewMode === "table" ? (
          <Card className="overflow-visible pb-6 w-full rounded-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <TreeTable
              trees={pagedTrees}
              loading={loading}
              selectedIds={selectedIds}
              onSelect={(id, checked) => {
                if (checked) setSelectedIds((prev) => [...prev, id]);
                else setSelectedIds((prev) => prev.filter((pid) => pid !== id));
              }}
              onSelectAll={(checked, ids) => {
                if (checked)
                  setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
                else
                  setSelectedIds((prev) =>
                    prev.filter((id) => !ids.includes(id))
                  );
              }}
              sortKey={sortKey}
              sortOrder={sortOrder}
              onSort={(key) => {
                if (sortKey === key) {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortKey(key as any);
                  setSortOrder("asc");
                }
              }}
              onRowClick={handleShowDetail}
              ageUnit={ageUnit}
              setAgeUnit={setAgeUnit}
              calcAge={calcAge}
              onEdit={handleShowEdit}
              onDelete={(t) => {
                setSelectedTree(t);
                setShowDeleteModal(true);
              }}
              onShowQR={handleShowQR}
            />
            {totalPages > 1 && (
              <nav
                aria-label="Page navigation"
                className="flex justify-center mt-8 w-full"
              >
                <ul className="flex items-center -space-x-px h-10 text-base shadow-sm rounded-lg">
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex justify-center items-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ms-0 border-e-0 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="w-3 h-3 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 1 1 5l4 4"
                        />
                      </svg>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li key={page}>
                        <button
                          onClick={() => setCurrentPage(page)}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors ${
                            currentPage === page
                              ? "z-10 text-green-600 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-700 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                              : "bg-white"
                          }`}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}
                  <li>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex justify-center items-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="w-3 h-3 rtl:rotate-180"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 9 4-4-4-4"
                        />
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TreeCardSkeleton key={i} />
              ))
            ) : pagedTrees.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                <span className="text-xl font-medium">
                  🌱 ยังไม่มีข้อมูลต้นไม้
                </span>
              </div>
            ) : (
              pagedTrees.map((tree) => (
                <TreeCard
                  key={tree.id}
                  tree={tree}
                  onEdit={handleShowEdit}
                  onDelete={(t) => {
                    setSelectedTree(t);
                    setShowDeleteModal(true);
                  }}
                  onView={handleShowDetail}
                  onShowQR={handleShowQR}
                />
              ))
            )}
          </div>
        )}
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-1000">
          <Button
            size="xl"
            className="rounded-full shadow-2xl bg-linear-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-none transform hover:scale-110 transition-all duration-300 w-16 h-16 flex items-center justify-center focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
            onClick={() => {
              setForm(getDefaultForm());
              setImageFiles([]);
              setSelectedTree(null);
              setShowAddModal(true);
            }}
            disabled={loading || submitting}
            aria-label="เพิ่มต้นไม้ใหม่"
          >
            <HiPlus className="w-8 h-8" />
          </Button>
        </div>
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        tree={selectedQRTree}
      />

      {/* Modal เพิ่มต้นไม้ใหม่ */}
      <Modal
        show={showAddModal}
        size="xl"
        aria-modal="true"
        initialFocus={addInitialRef}
        onClose={() => {
          setShowAddModal(false);
          setForm(getDefaultForm());
          setImageFiles([]);
          setSelectedTree(null);
          setFormError("");
          setSuccessMessage("");
          setErrorMessage("");
        }}
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700 [&>div]:p-0 [&>div]:h-full [&>div]:md:h-auto [&>div]:w-full [&>div]:max-w-full [&>div]:md:max-w-4xl"
      >
        <ModalHeader>
          <span className="text-2xl font-extrabold text-green-700 font-kanit sm:text-3xl md:text-4xl dark:text-green-300">
            เพิ่มต้นไม้ใหม่
          </span>
        </ModalHeader>
        <ModalBody className="rounded-b-2xl bg-slate-50 dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          {/* แสดง error message */}
          {formError && (
            <Alert
              id="addFormError"
              color="failure"
              className="mb-4"
              onDismiss={() => setFormError("")}
            >
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <form
            aria-describedby={formError ? "addFormError" : undefined}
            onSubmit={(e) => {
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
              <Label className="mb-1 font-semibold">
                สายพันธุ์ <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  ref={addInitialRef}
                  required
                  value={form.strainUuid}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, strainUuid: e.target.value }))
                  }
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  disabled={strainsLoading}
                  aria-disabled={strainsLoading}
                >
                  <option value="">-- เลือกสายพันธุ์ --</option>
                  {strains.map((strain) => (
                    <option key={strain.id} value={strain.id.toString()}>
                      {strain.name}
                    </option>
                  ))}
                </Select>
                {strainsLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner
                      size="sm"
                      color="info"
                      aria-label="กำลังโหลดสายพันธุ์..."
                    />
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, nickname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชุดการปลูก</Label>
              <div className="relative">
                <Select
                  value={form.batch_id ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      batch_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={batchesLoading}
                  aria-disabled={batchesLoading}
                >
                  <option value="">-- เลือกชุดการปลูก --</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batch_code}
                    </option>
                  ))}
                </Select>
                {batchesLoading && (
                  <div className="flex absolute top-2 right-3 items-center">
                    <Spinner
                      size="sm"
                      color="info"
                      aria-label="กำลังโหลดชุดการปลูก..."
                    />
                  </div>
                )}
              </div>
              <Link href="/batches" className="text-sm text-blue-600">
                ไปหน้าจัดการชุดการปลูก
              </Link>
            </div>
            <div>
              <Label className="mb-1 font-semibold">พันธุ์</Label>
              <TextInput
                value={form.variety}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, variety: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">รุ่น (Generation)</Label>
              <TextInput
                value={form.generation || ""}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, generation: e.target.value }))
                }
                placeholder="เช่น F1, F2 ฯลฯ"
                aria-label="รุ่นของต้นไม้"
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            {/* สถานะ (required) */}
            <div>
              <Label className="mb-1 font-semibold">
                สถานะ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                required
              >
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, germination_date: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, plant_date: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ระยะการเจริญเติบโต</Label>
              <TextInput
                value={form.growth_stage}
                placeholder="เช่น ต้นกล้า โตเต็มวัย"
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, growth_stage: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเกี่ยว</Label>
              <TextInput
                type="date"
                value={form.harvest_date}
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, harvest_date: e.target.value }))
                }
              />
            </div>

            {/* กลุ่มที่ 3: ข้อมูลพันธุกรรม */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-purple-700 border-b border-purple-200 dark:text-purple-300 dark:border-purple-700">
                🧬 ข้อมูลพันธุกรรม
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">
                เพศ <span className="text-red-500">*</span>
              </Label>
              <Select
                required
                value={form.sex}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sex: e.target.value }))
                }
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
              <TextInput
                value={form.genotype}
                placeholder="ข้อมูลทางพันธุกรรม"
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, genotype: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.phenotype}
                placeholder="เช่น ผลใหญ่ รสหวาน"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, phenotype: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นพ่อพันธุ์</Label>
              <Select
                value={form.parent_male ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parent_male: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นพ่อพันธุ์ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่พันธุ์</Label>
              <Select
                value={form.parent_female ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parent_female: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่พันธุ์ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่ที่ใช้ปักชำ</Label>
              <Select
                value={form.clone_source ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    clone_source: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่ที่ใช้ปักชำ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นที่ใช้ผสมเกสร</Label>
              <Select
                value={form.pollinated_by ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pollinated_by: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นที่ใช้ผสมเกสร --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ผสมเกสร</Label>
              <TextInput
                type="date"
                value={form.pollination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, pollination_date: e.target.value }))
                }
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
                onChange={(e) => {
                  const val = e.target.value
                    ? parseFloat(e.target.value)
                    : null;
                  if (val !== null && val < 0) return; // validation: ไม่ให้ติดลบ
                  setForm((f) => ({ ...f, yield_amount: val }));
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seed_count: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเมล็ด</Label>
              <TextInput
                type="date"
                value={form.seed_harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, seed_harvest_date: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">คุณภาพ/ลักษณะของดอก</Label>
              <Textarea
                rows={2}
                value={form.flower_quality}
                placeholder="เช่น สี กลิ่น ขนาด ฯลฯ"
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, flower_quality: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, disease_notes: e.target.value }))
                }
              />
            </div>

            {/* กลุ่มที่ 6: ไฟล์และหมายเหตุ */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                📎 ไฟล์และหมายเหตุ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                เอกสาร (PDF, JPG, PNG)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file-doc-add"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDraggingDoc
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  }`}
                  onDragOver={handleDragOverDoc}
                  onDragLeave={handleDragLeaveDoc}
                  onDrop={handleDropDoc}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className={`w-8 h-8 mb-3 ${
                        isDraggingDoc
                          ? "text-blue-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p
                      className={`mb-2 text-sm ${
                        isDraggingDoc
                          ? "text-blue-500 font-bold"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-semibold">คลิกเพื่ออัปโหลด</span>{" "}
                      หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, PNG, JPG (สูงสุด 10MB)
                    </p>
                  </div>
                  <FileInput
                    id="dropzone-file-doc-add"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleDocumentChange}
                  />
                </label>
              </div>
              {form.document && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                  <HiCheckCircle className="w-5 h-5" />
                  <span>เลือกไฟล์แล้ว: {form.document.name}</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                รูปภาพ (เลือกได้หลายไฟล์)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file-images-add"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDraggingImages
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  }`}
                  onDragOver={handleDragOverImages}
                  onDragLeave={handleDragLeaveImages}
                  onDrop={handleDropImages}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className={`w-8 h-8 mb-3 ${
                        isDraggingImages
                          ? "text-blue-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p
                      className={`mb-2 text-sm ${
                        isDraggingImages
                          ? "text-blue-500 font-bold"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-semibold">
                        คลิกเพื่ออัปโหลดรูปภาพ
                      </span>{" "}
                      หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG (สูงสุด 10MB)
                    </p>
                  </div>
                  <FileInput
                    id="dropzone-file-images-add"
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageFilesChange}
                  />
                </label>
              </div>
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                    รูปภาพที่เลือก ({imageFiles.length} รูป):
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`รูปที่ ${idx + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-20 h-20 rounded-xl border border-green-200 shadow-sm"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setImageFiles([])}
                      className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <span className="text-xs font-medium">ยกเลิก</span>
                    </button>
                  </div>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
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
          <Button
            color="gray"
            size="lg"
            className="px-8 text-lg font-semibold transition-colors duration-200"
            onClick={() => setShowAddModal(false)}
          >
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
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700 z-1000"
      >
        <ModalHeader className="rounded-t-2xl border-b border-gray-200 bg-white/80 dark:bg-gray-900/90 dark:border-gray-700">
          <span className="flex gap-2 items-center text-2xl font-extrabold text-green-700 font-kanit sm:text-3xl md:text-4xl dark:text-green-300">
            🌳 รายละเอียดต้นไม้
          </span>
        </ModalHeader>
        <ModalBody className="px-4 py-6 rounded-b-2xl transition-colors duration-300 bg-slate-50 dark:bg-gray-900/95 max-h-[80vh] overflow-y-auto">
          {detailLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="xl" color="success" />
            </div>
          ) : selectedTree ? (
            <div className="space-y-8 font-kanit">
              {/* ส่วนหัว: รูปภาพและข้อมูลหลัก */}
              <div className="flex flex-col gap-6 md:flex-row">
                {/* รูปภาพหลัก */}
                <div className="shrink-0 w-full md:w-1/3">
                  <div className="overflow-hidden relative w-full rounded-2xl shadow-lg aspect-square group">
                    {selectedTree.images && selectedTree.images.length > 0 ? (
                      <>
                        <Image
                          src={
                            selectedTree.images[galleryIndex]?.image ||
                            "/placeholder.svg"
                          }
                          alt={selectedTree.nickname}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onClick={() => handleOpenLightbox(galleryIndex)}
                        />
                        {/* ปุ่มเลื่อนรูป */}
                        {selectedTree.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrevImage();
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage();
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                            {/* Dots Indicator */}
                            <div className="flex absolute bottom-2 left-1/2 gap-1.5 -translate-x-1/2">
                              {selectedTree.images.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === galleryIndex
                                      ? "bg-white scale-125"
                                      : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        <div className="flex absolute top-2 right-2 gap-2">
                          <Badge
                            color="gray"
                            className="backdrop-blur-md bg-white/30 text-white border-none shadow-sm"
                          >
                            {selectedTree.images.length} รูป
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full bg-gray-100 dark:bg-gray-800">
                        <span className="text-4xl">🌳</span>
                      </div>
                    )}
                  </div>
                  {/* Gallery Thumbnails */}
                  {selectedTree.images && selectedTree.images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {selectedTree.images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => setGalleryIndex(idx)}
                          className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === galleryIndex
                              ? "border-green-500 ring-2 ring-green-200"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={img.thumbnail || img.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ข้อมูลหลัก */}
                <div className="flex-1 space-y-6">
                  {/* Header Section */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3 items-center">
                      <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white font-kanit">
                        {selectedTree.nickname}
                      </h2>
                      <div className="flex gap-2">
                        <Badge
                          color={
                            selectedTree.status === "มีชีวิต"
                              ? "success"
                              : "failure"
                          }
                          size="sm"
                          className="px-2.5 py-0.5 text-sm font-medium shadow-sm"
                        >
                          {selectedTree.status}
                        </Badge>
                        <Badge
                          color={getSexBadgeColor(selectedTree.sex)}
                          size="sm"
                          className="px-2.5 py-0.5 text-sm font-medium shadow-sm"
                        >
                          {sexLabel(selectedTree.sex)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-2xl font-bold text-green-600 dark:text-green-400">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        {selectedTree.strain?.name || "ไม่ระบุสายพันธุ์"}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {selectedTree.variety && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            พันธุ์: {selectedTree.variety}
                          </span>
                        )}
                        {selectedTree.generation && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            รุ่น: {selectedTree.generation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Batch */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          ชุดการปลูก
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 truncate dark:text-white">
                        {selectedTree.batch?.batch_code || "-"}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1 text-red-600 dark:text-red-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          สถานที่
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 truncate dark:text-white">
                        {selectedTree.location || "-"}
                      </p>
                    </div>

                    {/* Age */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1 text-amber-600 dark:text-amber-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          อายุต้นไม้
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {calcAge(selectedTree, "day")}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          วัน
                        </span>
                      </p>
                    </div>

                    {/* Growth Stage */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          ระยะการเจริญเติบโต
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 truncate dark:text-white">
                        {selectedTree.growth_stage || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Document Link */}
                  {selectedTree.document && (
                    <div className="group flex items-center p-4 rounded-xl border border-blue-100 bg-linear-to-r from-blue-50 to-white shadow-sm transition-all hover:shadow-md dark:from-blue-900/20 dark:to-gray-800 dark:border-blue-800">
                      <div className="p-3 mr-4 bg-white rounded-full shadow-sm ring-1 ring-blue-100 dark:bg-blue-800 dark:ring-blue-700">
                        <svg
                          className="w-6 h-6 text-blue-600 dark:text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {getFileName(selectedTree.document)}
                        </p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide dark:text-gray-400">
                          {getFileType(selectedTree.document)}
                        </p>
                      </div>
                      <a
                        href={selectedTree.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all dark:bg-gray-800 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-700"
                      >
                        ดูไฟล์
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* แท็บข้อมูลเพิ่มเติม (Accordion style or simple sections) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ข้อมูลการปลูก */}
                <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  <h3 className="flex items-center mb-4 text-lg font-bold text-blue-700 dark:text-blue-300">
                    <span className="mr-2 text-xl">🌱</span> ข้อมูลการปลูก
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        วันที่เมล็ดงอก
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.germination_date
                          ? new Date(
                              selectedTree.germination_date
                            ).toLocaleDateString("th-TH")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        วันที่ปลูก
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedTree.plant_date).toLocaleDateString(
                          "th-TH"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        วันที่เก็บเกี่ยว
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.harvest_date
                          ? new Date(
                              selectedTree.harvest_date
                            ).toLocaleDateString("th-TH")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลพันธุกรรม */}
                <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  <h3 className="flex items-center mb-4 text-lg font-bold text-purple-700 dark:text-purple-300">
                    <span className="mr-2 text-xl">🧬</span> ข้อมูลพันธุกรรม
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Genotype
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.genotype || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        Phenotype
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.phenotype || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        พ่อพันธุ์
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.parent_male_data?.nickname || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        แม่พันธุ์
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.parent_female_data?.nickname || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        ต้นแม่ที่ใช้ปักชำ
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.clone_source
                          ? `Tree_${selectedTree.clone_source}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        ผสมเกสรโดย
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.pollinated_by
                          ? `Tree_${selectedTree.pollinated_by}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        วันที่ผสมเกสร
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.pollination_date
                          ? new Date(
                              selectedTree.pollination_date
                            ).toLocaleDateString("th-TH")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลผลผลิต */}
                <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  <h3 className="flex items-center mb-4 text-lg font-bold text-amber-700 dark:text-amber-300">
                    <span className="mr-2 text-xl">🌸</span> ข้อมูลผลผลิต
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        ปริมาณผลผลิต
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.yield_amount
                          ? `${selectedTree.yield_amount} กรัม`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        จำนวนเมล็ด
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.seed_count || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        วันที่เก็บเมล็ด
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.seed_harvest_date
                          ? new Date(
                              selectedTree.seed_harvest_date
                            ).toLocaleDateString("th-TH")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        คุณภาพดอก
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedTree.flower_quality || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลสุขภาพ */}
                <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  <h3 className="flex items-center mb-4 text-lg font-bold text-cyan-700 dark:text-cyan-300">
                    <span className="mr-2 text-xl">🩺</span> ข้อมูลสุขภาพ
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-col gap-1 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">
                        โรค/ศัตรูพืช
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedTree.disease_notes || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* หมายเหตุ */}
                <div className="p-5 rounded-2xl border border-gray-100 shadow-sm bg-white/60 dark:bg-gray-800/60 dark:border-gray-700">
                  <h3 className="flex items-center mb-4 text-lg font-bold text-gray-700 dark:text-gray-300">
                    <span className="mr-2 text-xl">📝</span> หมายเหตุ
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedTree.notes || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              ไม่พบข้อมูลต้นไม้
            </div>
          )}
        </ModalBody>
        <ModalFooter className="justify-between rounded-b-2xl border-t border-gray-200 transition-colors duration-300 bg-slate-50 dark:bg-gray-900/95 dark:border-gray-700">
          <div className="flex gap-2">
            <Button
              color="blue"
              className="transition-colors duration-200 font-kanit dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700"
              onClick={() => handleShowEdit()}
            >
              แก้ไข
            </Button>
            <Button
              color="red"
              className="transition-colors duration-200 font-kanit dark:bg-red-700 dark:text-white dark:hover:bg-red-800 focus:ring-2 focus:ring-red-400 dark:focus:ring-red-700"
              onClick={() => handleShowDelete()}
            >
              ลบ
            </Button>
          </div>
          <Button
            color="gray"
            className="transition-colors duration-200 font-kanit dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700"
            onClick={() => setShowDetailModal(false)}
          >
            ปิด
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal แก้ไขข้อมูลต้นไม้ */}
      <Modal
        show={showEditModal}
        size="xl"
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
        className="rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-lg xl:max-w-2xl dark:border-gray-700 [&>div]:p-0 [&>div]:h-full [&>div]:md:h-auto [&>div]:w-full [&>div]:max-w-full [&>div]:md:max-w-4xl"
      >
        <ModalHeader>
          <span className="text-2xl font-extrabold text-blue-700 font-kanit sm:text-3xl md:text-4xl dark:text-blue-300">
            แก้ไขข้อมูลต้นไม้
          </span>
        </ModalHeader>
        <ModalBody className="rounded-b-2xl bg-slate-50 dark:bg-gray-900 max-h-[80vh] overflow-y-auto">
          {formError && (
            <Alert
              id="editFormError"
              color="failure"
              className="mb-4"
              onDismiss={() => setFormError("")}
            >
              <span className="font-medium">{formError}</span>
            </Alert>
          )}
          <form
            aria-describedby={formError ? "editFormError" : undefined}
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSubmit();
            }}
            className="grid grid-cols-1 gap-y-4 gap-x-8 text-base md:grid-cols-2 sm:text-lg font-kanit"
          >
            {/* กลุ่มที่ 1: ข้อมูลพื้นฐาน */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-green-700 border-b border-green-200 dark:text-green-300 dark:border-green-700">
                📋 ข้อมูลพื้นฐาน
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">
                สายพันธุ์ <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select
                  ref={editInitialRef}
                  required
                  value={form.strainUuid}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, strainUuid: e.target.value }))
                  }
                  className="pr-10 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={strainsLoading}
                >
                  <option value="">-- เลือกสายพันธุ์ --</option>
                  {strains.map((strain) => (
                    <option key={strain.id} value={strain.id.toString()}>
                      {strain.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชื่อเล่น</Label>
              <TextInput
                value={form.nickname}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, nickname: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ชุดการปลูก</Label>
              <Select
                value={form.batch_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    batch_id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={batchesLoading}
              >
                <option value="">-- เลือกชุดการปลูก --</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batch_code}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">พันธุ์</Label>
              <TextInput
                value={form.variety}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, variety: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">รุ่น (Generation)</Label>
              <TextInput
                value={form.generation || ""}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, generation: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">สถานที่ปลูก</Label>
              <TextInput
                value={form.location}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">
                สถานะ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.status}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                required
              >
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, germination_date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">
                วันที่ปลูก <span className="text-red-500">*</span>
              </Label>
              <TextInput
                type="date"
                required
                value={form.plant_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, plant_date: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ระยะการเจริญเติบโต</Label>
              <TextInput
                value={form.growth_stage}
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, growth_stage: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเกี่ยว</Label>
              <TextInput
                type="date"
                value={form.harvest_date}
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, harvest_date: e.target.value }))
                }
              />
            </div>

            {/* กลุ่มที่ 3: ข้อมูลพันธุกรรม */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-purple-700 border-b border-purple-200 dark:text-purple-300 dark:border-purple-700">
                🧬 ข้อมูลพันธุกรรม
              </h3>
            </div>
            <div>
              <Label className="mb-1 font-semibold">
                เพศ <span className="text-red-500">*</span>
              </Label>
              <Select
                required
                value={form.sex}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sex: e.target.value }))
                }
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
              <TextInput
                value={form.genotype}
                className="mt-1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, genotype: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">ลักษณะเด่น</Label>
              <Textarea
                rows={2}
                value={form.phenotype}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, phenotype: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นพ่อพันธุ์</Label>
              <Select
                value={form.parent_male ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parent_male: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นพ่อพันธุ์ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่พันธุ์</Label>
              <Select
                value={form.parent_female ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    parent_female: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่พันธุ์ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นแม่ที่ใช้ปักชำ</Label>
              <Select
                value={form.clone_source ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    clone_source: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นแม่ที่ใช้ปักชำ --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">ต้นที่ใช้ผสมเกสร</Label>
              <Select
                value={form.pollinated_by ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    pollinated_by: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- เลือกต้นที่ใช้ผสมเกสร --</option>
                {trees.map((tree) => (
                  <option key={tree.id} value={tree.id}>
                    {tree.nickname || tree.id}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่ผสมเกสร</Label>
              <TextInput
                type="date"
                value={form.pollination_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, pollination_date: e.target.value }))
                }
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
                onChange={(e) => {
                  const val = e.target.value
                    ? parseFloat(e.target.value)
                    : null;
                  if (val !== null && val < 0) return;
                  setForm((f) => ({ ...f, yield_amount: val }));
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    seed_count: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 font-semibold">วันที่เก็บเมล็ด</Label>
              <TextInput
                type="date"
                value={form.seed_harvest_date}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, seed_harvest_date: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">คุณภาพ/ลักษณะของดอก</Label>
              <Textarea
                rows={2}
                value={form.flower_quality}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, flower_quality: e.target.value }))
                }
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
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, disease_notes: e.target.value }))
                }
              />
            </div>

            {/* กลุ่มที่ 6: ไฟล์และหมายเหตุ */}
            <div className="md:col-span-2">
              <h3 className="pb-2 mb-3 text-lg font-bold text-gray-700 border-b border-gray-200 dark:text-gray-300 dark:border-gray-700">
                📎 ไฟล์และหมายเหตุ
              </h3>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                เอกสาร (PDF, JPG, PNG)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file-doc"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">คลิกเพื่ออัปโหลด</span>{" "}
                      หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, PNG, JPG (สูงสุด 10MB)
                    </p>
                  </div>
                  <FileInput
                    id="dropzone-file-doc"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleDocumentChange}
                  />
                </label>
              </div>

              {selectedTree?.document && !form.document && (
                <div className="flex justify-between items-center p-4 mt-3 rounded-xl border border-gray-200 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex gap-4 items-center">
                    <div className="flex justify-center items-center w-12 h-12 bg-blue-50 rounded-lg dark:bg-blue-900/50">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          เอกสารปัจจุบัน
                        </span>
                        <Badge
                          color={
                            getFileType(selectedTree.document) === "PDF"
                              ? "red"
                              : "info"
                          }
                          className="ml-1"
                        >
                          {getFileType(selectedTree.document)}
                        </Badge>
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <a
                          href={selectedTree.document}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 transition hover:underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          {getFileName(selectedTree.document)}
                        </a>
                      </div>
                    </div>
                  </div>
                  <Tooltip content="ลบเอกสารนี้" placement="left">
                    <Button
                      color="failure"
                      size="xs"
                      onClick={handleShowDeleteDocumentModal}
                      className="ml-4"
                    >
                      <HiTrash className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              )}
              {form.document && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                  <HiCheckCircle className="w-5 h-5" />
                  <span>เลือกไฟล์แล้ว: {form.document.name}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-700 dark:text-gray-300">
                รูปภาพ (เลือกได้หลายไฟล์)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file-images"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDraggingImages
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  }`}
                  onDragOver={handleDragOverImages}
                  onDragLeave={handleDragLeaveImages}
                  onDrop={handleDropImages}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className={`w-8 h-8 mb-3 ${
                        isDraggingImages
                          ? "text-blue-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p
                      className={`mb-2 text-sm ${
                        isDraggingImages
                          ? "text-blue-500 font-bold"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-semibold">
                        คลิกเพื่ออัปโหลดรูปภาพ
                      </span>{" "}
                      หรือลากไฟล์มาวาง
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG (สูงสุด 10MB)
                    </p>
                  </div>
                  <FileInput
                    id="dropzone-file-images"
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageFilesChange}
                  />
                </label>
              </div>

              {/* Existing Images */}
              {(selectedTree?.images?.length ?? 0) > 0 &&
                imageFiles.length === 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      รูปภาพปัจจุบัน:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(selectedTree?.images ?? []).map((img, idx) => (
                        <div key={img.id} className="relative group">
                          <Image
                            src={img.thumbnail || img.image}
                            alt={`รูปที่ ${idx + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-20 h-20 rounded-xl border border-gray-200 shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            onClick={() => window.open(img.image, "_blank")}
                          />
                          <Tooltip content="ลบรูปนี้" placement="top">
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors z-10"
                            >
                              <HiTrash className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        </div>
                      ))}
                      <Tooltip content="ลบรูปภาพทั้งหมด" placement="top">
                        <button
                          type="button"
                          onClick={handleShowDeleteAllImagesModal}
                          className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                        >
                          <span className="text-xs font-medium">ลบทั้งหมด</span>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}

              {/* New Selected Images */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                    รูปภาพที่เลือกใหม่ ({imageFiles.length} รูป):
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`รูปที่ ${idx + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-20 h-20 rounded-xl border border-green-200 shadow-sm"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setImageFiles([])}
                      className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                      <span className="text-xs font-medium">ยกเลิก</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 font-semibold">หมายเหตุ</Label>
              <Textarea
                rows={2}
                value={form.notes}
                className="mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        </ModalBody>
        <ModalFooter className="gap-3 justify-end pt-4 rounded-b-2xl bg-slate-50 dark:bg-gray-900">
          <Button
            color="blue"
            size="lg"
            className="px-8 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-700 active:scale-95"
            onClick={handleEditSubmit}
            disabled={submitting}
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            บันทึกแก้ไข
          </Button>
          <Button
            color="gray"
            size="lg"
            className="px-8 text-lg font-semibold transition-colors duration-200"
            onClick={() => setShowEditModal(false)}
          >
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
        }}
        className="xl:max-w-2xl"
      >
        <ModalHeader>ยืนยันการลบรูปภาพทั้งหมด</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบรูปภาพทั้งหมดของต้นไม้นี้ใช่หรือไม่?
          </div>
          <div className="mt-4 text-sm text-center text-gray-600">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button
            ref={deleteImagesConfirmRef}
            color="red"
            disabled={submitting}
            onClick={handleDeleteAllImages}
          >
            {submitting ? "กำลังลบ..." : "ลบทั้งหมด"}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowDeleteAllImagesModal(false)}
          >
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal ยืนยันการลบเอกสาร */}
      <Modal
        show={showDeleteDocumentModal}
        size="sm"
        aria-modal="true"
        onClose={() => setShowDeleteDocumentModal(false)}
        className="xl:max-w-2xl"
      >
        <ModalHeader>ยืนยันการลบเอกสาร</ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          <div className="py-2 text-lg font-semibold text-center text-red-500">
            คุณต้องการลบเอกสารนี้ใช่หรือไม่?
          </div>
          <div className="mt-4 text-sm text-center text-gray-600">
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button
            color="red"
            disabled={submitting}
            onClick={handleDeleteDocument}
          >
            {submitting ? "กำลังลบ..." : "ลบเอกสาร"}
          </Button>
          <Button
            color="gray"
            onClick={() => setShowDeleteDocumentModal(false)}
          >
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>

      {/* Image Lightbox Overlay */}
      {showImageLightbox && selectedTree && selectedTree.images.length > 0 && (
        <div
          className="fixed inset-0 z-30000 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={handleCloseLightbox}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 z-30001 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {selectedTree.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightboxPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30001 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLightboxNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30001 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={
                selectedTree.images[lightboxIndex]?.image || "/placeholder.svg"
              }
              alt="Full size"
              fill
              className="object-contain"
              quality={100}
              priority
            />

            {/* Image Counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white font-medium">
              {lightboxIndex + 1} / {selectedTree.images.length}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-10000 space-y-2" aria-live="polite">
        {successMessage && (
          <Toast className="flex gap-2 items-center text-green-800 bg-green-50 border border-green-300 shadow dark:bg-green-800 dark:text-green-100">
            <HiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            <span className="font-semibold" aria-live="polite">
              {successMessage}
            </span>
            <ToastToggle onDismiss={() => setSuccessMessage("")} />
          </Toast>
        )}
        {errorMessage && (
          <Toast className="flex gap-2 items-center text-red-800 bg-red-50 border border-red-300 shadow dark:bg-red-800 dark:text-red-100">
            <HiXCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
            <span className="font-semibold" aria-live="polite">
              {errorMessage}
            </span>
            <ToastToggle onDismiss={() => setErrorMessage("")} />
          </Toast>
        )}
      </div>

      {/* Uploading Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-30000 flex flex-col items-center justify-center bg-amber-100/80 dark:bg-amber-900/80 backdrop-blur-[2px] animate-fade-in">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl shadow-2xl bg-white/90 dark:bg-gray-900/90 border-4 border-amber-300 dark:border-amber-700">
            <svg
              className="w-14 h-14 text-amber-500 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-200 font-kanit tracking-wide drop-shadow">
              กำลังอัปโหลดข้อมูล...
            </span>
            <Spinner
              size="xl"
              color="warning"
              aria-label="กำลังอัปโหลดข้อมูล..."
            />
            <span className="text-base text-amber-600 dark:text-amber-300 font-kanit">
              โปรดรอสักครู่ ข้อมูลและไฟล์กำลังถูกส่งขึ้นระบบ
            </span>
          </div>
        </div>
      )}
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
            คุณต้องการลบต้นไม้ &quot;{selectedTree?.strain?.name || ""} (
            {selectedTree?.nickname})&quot; ใช่หรือไม่?
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 justify-end">
          <Button
            ref={deleteConfirmRef}
            color="red"
            disabled={submitting}
            onClick={handleDelete}
          >
            {submitting ? "กำลังลบ..." : "ลบ"}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
