
"use client";
import React, { useState } from "react";
import { Button, Toast, ToastToggle } from "flowbite-react";
import { HiPlus, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { Tree } from "./types";
import { calcAge } from "./utils";
import { TreeCard, TreeCardSkeleton } from "../components/TreeCard";
import { QRCodeModal } from "../components/QRCodeModal";
import { TreeTable } from "../components/TreeTable";
import { FilterBar } from "../components/FilterBar";
import { TreeFormModal } from "../components/modals/TreeFormModal";
import { ImageViewerModal } from "../components/modals/ImageViewerModal";
import { ConfirmDeleteModal } from "../components/modals/ConfirmDeleteModal";
import { DashboardStats } from "../components/DashboardStats";
import { YieldAnalytics } from "../components/YieldAnalytics";
import { useTreeData } from "../hooks/useTreeData";
import { useTreeForm } from "../hooks/useTreeForm";
import { useDashboardLogic } from "../hooks/useDashboardLogic";
import { treeService } from "../services/treeService";
import { TOAST_DURATION } from "./constants";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  // Data Hook
  const { trees, strains, batches, loading, refreshTrees, error: dataError } = useTreeData();
  
  // UI State for Modals & Messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [viewingImageIndex, setViewingImageIndex] = useState(0);

  // Dashboard Logic Hook
  const {
      viewMode, setViewMode,
      search, setSearch,
      selectedIds, setSelectedIds,
      sortKey, setSortKey,
      sortOrder, setSortOrder,
      ageUnit, setAgeUnit,
      deleting, setDeleting,
      filteredTrees,
      handleSort,
      handleSelect,
      handleSelectAll,
      handleBulkDelete
  } = useDashboardLogic(trees, refreshTrees, setSuccessMessage, setErrorMessage);

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
    editingId
  } = useTreeForm(async () => {
    // On Success
    await refreshTrees();
    setShowFormModal(false);
    setSuccessMessage(editingId ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มต้นไม้ใหม่สำเร็จ");
    resetForm();
    setTimeout(() => setSuccessMessage(""), TOAST_DURATION);
  }, strains);

  // Handlers
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

  const handleView = (tree: Tree) => {
    router.push(`/tree/${tree.id}`);
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
    <div className="min-h-screen font-kanit transition-colors duration-200">
      
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
        {/* Header with Background Accent */}
        <div className="relative mb-8 pb-4">
           {/* Abstract Circle Decoration */}
           <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-light/30 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
           <div className="absolute -top-10 left-20 w-32 h-32 bg-secondary-light/30 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>

           <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
             <div>
               <h1 className="text-4xl font-bold font-heading bg-linear-to-r from-primary-dark to-secondary-dark bg-clip-text text-transparent dark:from-primary-light dark:to-secondary-light">
                 MyTree Journal
               </h1>
               <p className="text-text-muted mt-1">
                 ระบบติดตามและบันทึกข้อมูลการปลูกพืชเศรษฐกิจแบบครบวงจร
               </p>
             </div>
             
             <Button 
                 color="custom"
                 size="lg" 
                 className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 w-full md:w-auto font-kanit bg-linear-to-br from-primary to-secondary text-white border-none focus:ring-4 focus:ring-primary-light/30"
                 onClick={handleCreate}
             >
               <HiPlus className="mr-2 h-5 w-5" />
               เพิ่มต้นไม้ใหม่
             </Button>
           </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats trees={trees} />
        
        {/* Yield Analytics (Pro Feature) */}
        <YieldAnalytics trees={trees} />

        {/* Filter Bar */}
        <div className="mb-6 sticky top-4 z-20 backdrop-blur-md bg-surface/80 dark:bg-surface-dark/80 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
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
                onRowClick={handleView}
                ageUnit={ageUnit}
                setAgeUnit={setAgeUnit}
                calcAge={calcAge} 
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
                    <div className="flex flex-col items-center justify-center py-20 bg-surface dark:bg-surface-dark rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary-light/20 rounded-full blur-xl opacity-70"></div>
                            <HiPlus className="relative w-20 h-20 text-primary mb-4 opacity-80" />
                        </div>
                        <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-2 font-heading">ไม่พบข้อมูลต้นไม้</h3>
                        <p className="text-text-muted mb-6 max-w-sm">
                            {search ? `ไม่พบผลลัพธ์สำหรับ "${search}"` : "เริ่มต้นการปลูกครั้งแรกของคุณได้ง่ายๆ"}
                        </p>
                        <Button 
                            color="custom"
                            className="font-kanit shadow-lg shadow-primary/20 category-btn bg-linear-to-br from-primary to-secondary text-white border-none" 
                            onClick={handleCreate}
                        >
                            <HiPlus className="mr-2 h-5 w-5" />
                            เพิ่มต้นไม้แรก
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTrees.map(tree => (
                            <TreeCard 
                                key={tree.id} 
                                tree={tree} 
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onShowQR={handleShowQR}
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
        processing={deleting} 
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
