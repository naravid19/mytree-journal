import { useState, useMemo, useEffect } from "react";
import { TreeFormState, getDefaultFormState, validateTreeForm, validateImageFiles, validateDocumentFile, buildTreeFormData } from "../app/formHelpers";
import { treeService } from "../services/treeService";
import { Tree, Strain } from "../app/types";

export const useTreeForm = (onSuccess?: () => void, strains: Strain[] = []) => {
  const [form, setForm] = useState<TreeFormState>(getDefaultFormState());
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Reset form to default state
  const resetForm = () => {
    setForm(getDefaultFormState());
    setImageFiles([]);
    setFormError("");
    setEditingId(null);
  };

  // Initialize form for editing
  const setFormForEdit = (tree: Tree) => {
    setEditingId(tree.id);
    setForm({
      strainUuid: tree.strain?.name || "", 
      variety: tree.variety || "",
      nickname: tree.nickname || "",
      plant_date: tree.plant_date || "",
      germination_date: tree.germination_date || "",
      growth_stage: tree.growth_stage || "",
      harvest_date: tree.harvest_date || "",
      location: tree.location || "",
      phenotype: tree.phenotype || "",
      status: tree.status || "มีชีวิต",
      sex: tree.sex || "unknown",
      genotype: tree.genotype || "",
      parent_male: tree.parent_male || null,
      parent_female: tree.parent_female || null,
      batch_id: tree.batch?.id || null,
      clone_source: tree.clone_source || null,
      pollinated_by: tree.pollinated_by || null,
      pollination_date: tree.pollination_date || "",
      yield_amount: tree.yield_amount || null,
      flower_quality: tree.flower_quality || "",
      seed_count: tree.seed_count || null,
      seed_harvest_date: tree.seed_harvest_date || "",
      disease_notes: tree.disease_notes || "",
      document: null, // Documents are not pre-filled as files
      notes: tree.notes || "",
      generation: tree.generation || "",
    });
    setImageFiles([]); // Reset new files
  };

  // Handle Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle number inputs
    if (type === 'number') {
        const numValue = value === '' ? null : Number(value);
        setForm(prev => ({ ...prev, [name]: numValue }));
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Select Change (Flowbite/Custom) or direct value setting
  const setFieldValue = (name: keyof TreeFormState, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Files
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validation = validateImageFiles(files);
    
    if (validation.error) {
      setFormError(validation.error);
    } else {
      setFormError("");
    }
    
    // According to original logic, we replace or add? Original replaced `setImageFiles(valid)`.
    // But drag and drop added. Let's support adding if needed, but standard input usually replaces.
    // Let's stick to replacing for the input field to match standard behavior, 
    // or we can append if that's the desired UX.
    // The original code: `setImageFiles(valid);` (Replace). 
    setImageFiles(validation.validFiles);
  };

  // Image Previews & Memory Leak Prevention
  const imagePreviewUrls = useMemo(() => {
    return imageFiles.map(file => URL.createObjectURL(file));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  // Handle Document File
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validation = validateDocumentFile(file);
      if (!validation.isValid) {
        setFormError(validation.error || "Invalid file");
        return;
      }
    }
    setFormError("");
    setForm(prev => ({ ...prev, document: file }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    const validation = validateTreeForm(form, strains);
    if (!validation.isValid) {
      setFormError(validation.error || "Please check the form");
      return;
    }

    try {
      setSubmitting(true);
      const formData = buildTreeFormData(form, imageFiles, strains);

      if (editingId) {
        await treeService.updateTree(editingId, formData);
      } else {
        await treeService.createTree(formData);
      }

      resetForm();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setFormError(err.message || "Failed to submit form");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    imageFiles,
    imagePreviewUrls,
    formError,
    submitting,
    editingId,
    setForm,
    setImageFiles,
    setFieldValue,
    handleInputChange,
    handleImageFilesChange,
    handleDocumentChange,
    handleSubmit,
    resetForm,
    setFormForEdit,
    setFormError,
    // Add drag and drop logic integration helpers if needed
    appendImageFiles: (files: File[]) => setImageFiles(prev => [...prev, ...files])
  };
};
