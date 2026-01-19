"use client";
import React, { useState, useMemo } from "react";
import { Button, Toast, ToastToggle } from "flowbite-react";
import { HiPlus, HiCheckCircle, HiXCircle, HiCollection } from "react-icons/hi";
import { Tree } from "./types";
import { calcAge } from "./utils";
import { TreeCard, TreeCardSkeleton } from "../components/TreeCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { TreeTable } from "../components/TreeTable";
import { FilterBar } from "../components/FilterBar";
import { TreeFormModal } from "../components/modals/TreeFormModal";
import { ImageViewerModal } from "../components/modals/ImageViewerModal";
import { ConfirmDeleteModal } from "../components/modals/ConfirmDeleteModal";
import { useDebouncedSearch } from "./hooks";
import { useTreeData } from "../hooks/useTreeData";
import { useTreeForm } from "../hooks/useTreeForm";
import { treeService } from "../services/treeService";
import { DEFAULT_ITEMS_PER_PAGE, TOAST_DURATION } from "./constants";

export default function Dashboard() {
  // Data Hook
  const { trees, strains, batches, loading, refreshTrees, error: dataError } = useTreeData();
  
  // UI State
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search, 300);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);
  
  // Loading State
  const [deleting, setDeleting] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState<keyof Tree | "strain">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default to desc (newest first)
  const [ageUnit, setAgeUnit] = useState<"day" | "month" | "year">("day");

  // Form Hook
  const {
    form,
    imageFiles,
    imagePreviewUrls,
    formError,
    submitting,
    setImageFiles,
    setFieldValue,
    handleInputChange,
    handleImageFilesChange,
    handleDocumentChange,
    handleSubmit,
    resetForm,
    setFormForEdit,
    setFormError: setHookFormError,
    editingId
  } = useTreeForm(async () => {
    // On Success
    await refreshTrees();
    setShowFormModal(false);
    setSuccessMessage(editingId ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มต้นไม้ใหม่สำเร็จ");
    resetForm();
    setTimeout(() => setSuccessMessage(""), TOAST_DURATION);
  }, strains);

  // Derived State (Filtering & Sorting)
  const filteredTrees = useMemo(() => {
    let result = trees;

    // Filter by Search
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.strain?.name.toLowerCase().includes(lowerSearch) ||
          t.nickname?.toLowerCase().includes(lowerSearch) ||
          t.location?.toLowerCase().includes(lowerSearch) ||
          t.batch?.batch_code.toLowerCase().includes(lowerSearch)
      );
    }

    // Sorting
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortKey === "strain") {
          valA = a.strain?.name || "";
          valB = b.strain?.name || "";
        } else if (sortKey === "plant_date") {
           valA = a.plant_date ? new Date(a.plant_date).getTime() : 0;
           valB = b.plant_date ? new Date(b.plant_date).getTime() : 0;
        } else {
           // Generic fallback for strict keys
           const key = sortKey as keyof Tree;
           const vA = a[key];
           const vB = b[key];
           if (typeof vA === 'string' || typeof vA === 'number') valA = vA;
           if (typeof vB === 'string' || typeof vB === 'number') valB = vB;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [trees, debouncedSearch, sortKey, sortOrder]);

  // Handlers
  const handleSort = (key: keyof Tree | "strain") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc"); // Default new sort to desc
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (checked: boolean, ids: number[]) => {
    if (checked) {
      // Add all visible IDs that aren't already selected
      const newIds = ids.filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...newIds]);
    } else {
      // Remove visible IDs from selection
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleCreate = () => {
    resetForm();
    setSelectedTree(null);
    setShowFormModal(true);
  };

  const handleEdit = (tree: Tree) => {
    resetForm();
    setSelectedTree(tree);
    setFormForEdit(tree);
    setShowFormModal(true);
  };

  const handleDeleteClick = (tree: Tree) => {
    setSelectedTree(tree);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTree) return;
    try {
        setDeleting(true);
        await treeService.deleteTree(selectedTree.id);
        await refreshTrees();
        setSuccessMessage("ลบข้อมูลสำเร็จ");
        setShowDeleteModal(false);
        setSelectedTree(null);
    } catch (err: any) {
        setErrorMessage(err.message || "ลบข้อมูลไม่สำเร็จ");
    } finally {
        setDeleting(false);
    }
    setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
    }, TOAST_DURATION);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`คุณต้องการลบ ${selectedIds.length} รายการที่เลือกใช่หรือไม่?`)) return;

    try {
      await treeService.bulkDeleteTrees(selectedIds);
      await refreshTrees();
      setSelectedIds([]);
      setSuccessMessage(`ลบ ${selectedIds.length} รายการสำเร็จ`);
    } catch (err: any) {
      setErrorMessage(err.message || "ลบข้อมูลหลายรายการไม่สำเร็จ");
    }
    setTimeout(() => setSuccessMessage(""), TOAST_DURATION);
  };

  const handleShowQR = (tree: Tree) => {
    setSelectedTree(tree);
    setShowQRModal(true);
  };

  const handleViewImages = (images: string[], index: number) => {
    setViewingImages(images);
    setViewingImageIndex(index);
    setShowImageModal(true);
  };

  // Drag and Drop Handlers
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [isDraggingImages, setIsDraggingImages] = useState(false);

  const onDragOverDoc = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingDoc(true); };
  const onDragLeaveDoc = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingDoc(false); };
  const onDropDoc = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
        // We need a way to set document via hook. Hook has `handleDocumentChange` for events.
        // We can manually set it if we expose `setFieldValue` or similar from hook.
        // Hook exposes `setForm`.
        // Let's just use `handleDocumentChange` with a fake event or update hook to accept File.
        // For now, let's manually update form state via setFieldValue from hook.
        setFieldValue('document', file);
    }
  };

  const onDragOverImages = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingImages(true); };
  const onDragLeaveImages = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingImages(false); };
  const onDropImages = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
    if (e.dataTransfer.files?.length) {
        setImageFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-kanit transition-colors duration-200">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-9999 space-y-2">
        {successMessage && (
          <Toast className="animate-fade-in border border-green-200">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheckCircle className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal text-green-800 dark:text-green-200">{successMessage}</div>
            <ToastToggle onDismiss={() => setSuccessMessage("")} />
          </Toast>
        )}
        {(errorMessage || dataError) && (
          <Toast className="animate-fade-in border border-red-200">
             <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiXCircle className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal text-red-800 dark:text-red-200">{errorMessage || dataError}</div>
            <ToastToggle onDismiss={() => setErrorMessage("")} />
          </Toast>
        )}
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-linear-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg shadow-green-200 dark:shadow-none">
              <HiCollection className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                MyTree Journal
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1">
                   <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                   {loading ? 'กำลังโหลด...' : 'ระบบพร้อมใช้งาน'}
                </span>
                <span>•</span>
                <span>{trees.length} รายการ</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
                color="success"
                size="lg" 
                className="shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 w-full md:w-auto font-kanit bg-linear-to-br from-green-500 to-teal-600 border-none"
                onClick={handleCreate}
            >
              <HiPlus className="mr-2 h-5 w-5" />
              เพิ่มต้นไม้
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 sticky top-4 z-20">
            <FilterBar 
                search={search}
                onSearchChange={setSearch}
                selectedCount={selectedIds.length}
                loading={loading}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds([])}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
        </div>

        {/* Content */}
        {viewMode === "table" ? (
            <TreeTable 
                trees={filteredTrees}
                loading={loading}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
                onRowClick={handleEdit}
                ageUnit={ageUnit}
                setAgeUnit={setAgeUnit}
                calcAge={calcAge} // Passing the utilized function
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onShowQR={handleShowQR}
                onViewImages={handleViewImages}
            />
        ) : (

            <div className="min-h-[50vh]">
                {loading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => <TreeCardSkeleton key={i} />)}
                   </div>
                ) : filteredTrees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-green-100 dark:bg-green-900/30 rounded-full blur-xl opacity-70"></div>
                            <HiCollection className="relative w-24 h-24 text-green-500 mb-4 opacity-80" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-kanit">ไม่พบข้อมูลต้นไม้</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            {search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "ยังไม่มีต้นไม้ในระบบ เริ่มต้นด้วยการเพิ่มต้นไม้ใหม่ได้เลย"}
                        </p>
                        <Button color="success" onClick={handleCreate} className="font-kanit shadow-lg shadow-green-200 dark:shadow-none">
                            <HiPlus className="mr-2 h-5 w-5" />
                            เพิ่มต้นไม้แรกของคุณ
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTrees.map(tree => (
                            <TreeCard 
                                key={tree.id} 
                                tree={tree} 
                                onView={() => handleEdit(tree)}
                                onEdit={() => handleEdit(tree)}
                                onDelete={() => handleDeleteClick(tree)}
                                onShowQR={() => handleShowQR(tree)}
                            />
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Modals */}
      <TreeFormModal 
        show={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
        form={form}
        onChange={handleInputChange}
        onImageFilesChange={handleImageFilesChange}
        onDocumentChange={handleDocumentChange}
        imageFiles={imageFiles}
        imagePreviewUrls={imagePreviewUrls}
        clearImageFiles={() => setImageFiles([])}
        strains={strains}
        batches={batches}
        submitting={submitting}
        isEditMode={!!editingId}
        formError={formError}
        // Drag and Drop
        isDraggingDoc={isDraggingDoc}
        onDragOverDoc={onDragOverDoc}
        onDragLeaveDoc={onDragLeaveDoc}
        onDropDoc={onDropDoc}
        isDraggingImages={isDraggingImages}
        onDragOverImages={onDragOverImages}
        onDragLeaveImages={onDragLeaveImages}
        onDropImages={onDropImages}
      />

      <ConfirmDeleteModal 
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        message={`คุณต้องการลบ "${selectedTree?.nickname || selectedTree?.strain?.name || 'ต้นไม้นี้'}" ใช่หรือไม่?`}
        processing={deleting} // Use specific deleting state
      />

      {selectedTree && (
        <QRCodeModal
          show={showQRModal}
          onClose={() => setShowQRModal(false)}
          tree={selectedTree}
         />
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        show={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={viewingImages}
        initialIndex={viewingImageIndex}
      />
      
    </div>
  );
}
