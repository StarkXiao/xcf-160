import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Search,
  Tag,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Edit3,
  Save,
  Archive,
  Ruler,
  Info,
  FolderPlus,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  AlertTriangle,
  FileJson,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type {
  IngestionFormData,
  IngestionValidationError,
  ArtworkTag,
  Artwork,
  ArtworkSortType,
  ArtworkDeletionValidation,
  BatchImportResult,
} from '../../types';
import {
  DEFAULT_INGESTION_FORM,
  WORKSTATION_TABS,
  TAG_CATEGORIES,
  INGESTION_STATUS_LABELS,
  ARTWORK_SORT_TYPES,
} from '../../types';
import Empty from '../Empty';

export const ArtworkIngestionWorkstation: React.FC = () => {
  const {
    workstationTab,
    setWorkstationTab,
    ingestionSearchQuery,
    setIngestionSearchQuery,
    ingestionStatus,
    setIngestionStatus,
    artworkTags,
    addArtworkTag,
    updateArtworkTag,
    removeArtworkTag,
    validateIngestionForm,
    submitIngestion,
    getArtworksByTagId,
    updateArtworkWithTags,
    filterAndSortArtworks,
    artworkSortType,
    artworkSortDirection,
    setArtworkSortType,
    setArtworkSortDirection,
    selectedArtworkIds,
    toggleArtworkSelection,
    selectAllArtworks,
    clearArtworkSelections,
    validateArtworkDeletion,
    removeArtworkWithValidation,
    batchRemoveArtworks,
    batchAddArtworksWithTags,
  } = useAppStore();

  const [formData, setFormData] = useState<IngestionFormData>({ ...DEFAULT_INGESTION_FORM });
  const [errors, setErrors] = useState<IngestionValidationError[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoDetectedSize, setAutoDetectedSize] = useState<{ width: number; height: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [selectedFilterTagIds, setSelectedFilterTagIds] = useState<string[]>([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagForm, setNewTagForm] = useState({ name: '', color: '#E91E63', category: 'style' });
  const [editingTag, setEditingTag] = useState<ArtworkTag | null>(null);
  const [expandCategories, setExpandCategories] = useState<Record<string, boolean>>({});
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importResult, setImportResult] = useState<BatchImportResult | null>(null);
  const [deleteValidation, setDeleteValidation] = useState<ArtworkDeletionValidation | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);

  const filteredArtworks = useMemo(() => {
    return filterAndSortArtworks(ingestionSearchQuery, selectedFilterTagIds);
  }, [filterAndSortArtworks, ingestionSearchQuery, selectedFilterTagIds]);

  const groupedTags = useMemo(() => {
    const groups: Record<string, ArtworkTag[]> = {};
    artworkTags.forEach((tag) => {
      if (!groups[tag.category]) {
        groups[tag.category] = [];
      }
      groups[tag.category].push(tag);
    });
    return groups;
  }, [artworkTags]);

  const handleFormChange = useCallback(
    (field: keyof IngestionFormData, value: string | string[] | File | undefined) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => prev.filter((e) => e.field !== field));
      setIngestionStatus('draft');
    },
    [setIngestionStatus]
  );

  const handleTagToggle = useCallback(
    (tagId: string) => {
      setFormData((prev) => ({
        ...prev,
        tagIds: prev.tagIds.includes(tagId)
          ? prev.tagIds.filter((id) => id !== tagId)
          : [...prev.tagIds, tagId],
      }));
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processImageFile(file);
      }
    },
    []
  );

  const processImageFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewImage(dataUrl);
      handleFormChange('imageFile', file);
      handleFormChange('imageUrl', '');

      const img = new window.Image();
      img.onload = () => {
        const dpi = 72;
        const widthCm = Math.round((img.naturalWidth / dpi) * 2.54 * 10) / 10;
        const heightCm = Math.round((img.naturalHeight / dpi) * 2.54 * 10) / 10;
        setAutoDetectedSize({ width: widthCm, height: heightCm });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [handleFormChange]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        processImageFile(file);
      }
    },
    [processImageFile]
  );

  const applyAutoSize = useCallback(() => {
    if (autoDetectedSize) {
      handleFormChange('width', autoDetectedSize.width.toString());
      handleFormChange('height', autoDetectedSize.height.toString());
      setAutoDetectedSize(null);
    }
  }, [autoDetectedSize, handleFormChange]);

  const validateForm = useCallback(() => {
    const validationErrors = validateIngestionForm(formData);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [formData, validateIngestionForm]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      setIngestionStatus('error');
      return;
    }

    const result = await submitIngestion(formData);

    if (result) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFormData({ ...DEFAULT_INGESTION_FORM });
      setPreviewImage(null);
      setAutoDetectedSize(null);
    }
  }, [formData, validateForm, submitIngestion, setIngestionStatus]);

  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_INGESTION_FORM });
    setErrors([]);
    setPreviewImage(null);
    setAutoDetectedSize(null);
    setShowSuccess(false);
    setEditingArtwork(null);
    setIngestionStatus('draft');
  }, [setIngestionStatus]);

  const getFieldError = useCallback(
    (field: keyof IngestionFormData) => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  const getTagColorClass = (color: string) => {
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`,
    };
  };

  const toggleCategory = (categoryId: string) => {
    setExpandCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAddTag = useCallback(() => {
    if (newTagForm.name.trim()) {
      addArtworkTag({
        name: newTagForm.name.trim(),
        color: newTagForm.color,
        category: newTagForm.category,
      });
      setNewTagForm({ name: '', color: '#E91E63', category: 'style' });
    }
  }, [newTagForm, addArtworkTag]);

  const handleUpdateTag = useCallback(
    (tagId: string) => {
      if (editingTag) {
        updateArtworkTag(tagId, {
          name: editingTag.name,
          color: editingTag.color,
          category: editingTag.category,
        });
        setEditingTag(null);
      }
    },
    [editingTag, updateArtworkTag]
  );

  const handleEditArtwork = useCallback(
    (artwork: Artwork) => {
      setEditingArtwork(artwork);
      setFormData({
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year.toString(),
        width: artwork.width.toString(),
        height: artwork.height.toString(),
        depth: artwork.depth?.toString() || '',
        medium: artwork.medium,
        description: artwork.description || '',
        tagIds: [...artwork.tagIds],
        imageUrl: artwork.imageUrl,
      });
      setPreviewImage(artwork.imageUrl);
      setWorkstationTab('ingestion');
    },
    [setWorkstationTab]
  );

  const handleUpdateArtwork = useCallback(() => {
    if (editingArtwork && validateForm()) {
      updateArtworkWithTags(editingArtwork.id, {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        year: Number(formData.year),
        width: Number(formData.width),
        height: Number(formData.height),
        depth: formData.depth ? Number(formData.depth) : undefined,
        medium: formData.medium.trim(),
        description: formData.description.trim(),
        imageUrl: previewImage || formData.imageUrl,
        tagIds: formData.tagIds,
      });
      resetForm();
    }
  }, [editingArtwork, formData, validateForm, updateArtworkWithTags, previewImage, resetForm]);

  const handleDeleteArtwork = useCallback(
    (artworkId: string, _title: string) => {
      const validation = validateArtworkDeletion(artworkId);
      setArtworkToDelete(artworkId);
      setDeleteValidation(validation);
    },
    [validateArtworkDeletion]
  );

  const confirmDelete = useCallback(
    (force: boolean) => {
      if (artworkToDelete) {
        const success = removeArtworkWithValidation(artworkToDelete, force);
        if (success) {
          setShowDeleteSuccess(true);
          setTimeout(() => setShowDeleteSuccess(false), 2000);
        }
      }
      setDeleteValidation(null);
      setArtworkToDelete(null);
    },
    [artworkToDelete, removeArtworkWithValidation]
  );

  const handleBatchDelete = useCallback(() => {
    const ids = Array.from(selectedArtworkIds);
    const result = batchRemoveArtworks(ids, 'safe');
    if (result.deletedCount > 0) {
      setShowDeleteSuccess(true);
      setTimeout(() => setShowDeleteSuccess(false), 2000);
    }
    setShowBatchDeleteConfirm(false);
    clearArtworkSelections();
    setIsBatchMode(false);
  }, [selectedArtworkIds, batchRemoveArtworks, clearArtworkSelections]);

  const handleSortChange = (sortType: ArtworkSortType) => {
    if (artworkSortType === sortType) {
      setArtworkSortDirection(artworkSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setArtworkSortType(sortType);
    }
    setShowSortMenu(false);
  };

  const toggleFilterTag = (tagId: string) => {
    setSelectedFilterTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilterTags = () => {
    setSelectedFilterTagIds([]);
  };

  const handleBatchImport = () => {
    try {
      const artworks = JSON.parse(importJson);
      if (Array.isArray(artworks)) {
        const result = batchAddArtworksWithTags(artworks);
        setImportResult(result);
        if (result.successCount > 0) {
          setImportJson('');
          setTimeout(() => setImportResult(null), 3000);
        }
      }
    } catch {
      alert('JSON 格式错误，请检查输入');
    }
  };

  const SortIcon = () => {
    if (artworkSortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3" />;
    }
    return <ArrowDown className="w-3 h-3" />;
  };

  const renderIngestionPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Archive className="w-5 h-5 text-gold" />
          {editingArtwork ? '编辑作品' : '作品入库登记'}
        </h3>
        {editingArtwork && (
          <button onClick={resetForm} className="text-xs text-white/50 hover:text-white transition-colors">
            取消编辑
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center gap-2 text-green-400 text-sm"
          >
            <Check className="w-4 h-4" />
            作品入库成功！
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-gold bg-gold/10'
              : previewImage
              ? 'border-gallery-border bg-gallery-bg'
              : 'border-gallery-border hover:border-gold/50 hover:bg-gallery-bg/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {previewImage ? (
            <div className="relative">
              <img
                ref={imagePreviewRef}
                src={previewImage}
                alt="预览"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(null);
                  handleFormChange('imageFile', undefined);
                  handleFormChange('imageUrl', '');
                  setAutoDetectedSize(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <div className="py-8">
              <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-gold' : 'text-white/30'}`} />
              <p className={`font-medium ${isDragging ? 'text-gold' : 'text-white/70'}`}>
                {isDragging ? '松开以上传图片' : '拖拽图片到此处'}
              </p>
              <p className="text-xs text-white/40 mt-1">或点击选择文件 · 支持 JPG、PNG、WebP</p>
            </div>
          )}
        </div>

        {autoDetectedSize && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-gold/10 border border-gold/30 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold text-sm">
                <Ruler className="w-4 h-4" />
                <span>
                  检测到尺寸: {autoDetectedSize.width} × {autoDetectedSize.height} cm
                </span>
              </div>
              <button
                onClick={applyAutoSize}
                className="text-xs bg-gold text-gallery-bg px-3 py-1 rounded-md hover:bg-gold-light transition-colors"
              >
                应用尺寸
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              作品标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              placeholder="请输入作品标题"
              className={`input-field ${getFieldError('title') ? 'border-red-500/50' : ''}`}
            />
            {getFieldError('title') && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('title')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              艺术家 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => handleFormChange('artist', e.target.value)}
              placeholder="请输入艺术家名称"
              className={`input-field ${getFieldError('artist') ? 'border-red-500/50' : ''}`}
            />
            {getFieldError('artist') && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {getFieldError('artist')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                创作年份 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleFormChange('year', e.target.value)}
                placeholder="如: 2024"
                className={`input-field ${getFieldError('year') ? 'border-red-500/50' : ''}`}
              />
              {getFieldError('year') && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('year')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                创作媒介 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.medium}
                onChange={(e) => handleFormChange('medium', e.target.value)}
                placeholder="如: 布面油画"
                className={`input-field ${getFieldError('medium') ? 'border-red-500/50' : ''}`}
              />
              {getFieldError('medium') && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('medium')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                宽度 (cm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.width}
                onChange={(e) => handleFormChange('width', e.target.value)}
                placeholder="宽度"
                className={`input-field ${getFieldError('width') ? 'border-red-500/50' : ''}`}
              />
              {getFieldError('width') && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('width')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                高度 (cm) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleFormChange('height', e.target.value)}
                placeholder="高度"
                className={`input-field ${getFieldError('height') ? 'border-red-500/50' : ''}`}
              />
              {getFieldError('height') && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('height')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                深度 (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.depth}
                onChange={(e) => handleFormChange('depth', e.target.value)}
                placeholder="可选"
                className={`input-field ${getFieldError('depth') ? 'border-red-500/50' : ''}`}
              />
              {getFieldError('depth') && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError('depth')}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1.5">
              作品描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="请输入作品描述（可选）"
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-2">
              标签分类
            </label>
            <div className="space-y-2">
              {TAG_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="border border-gallery-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gallery-bg hover:bg-gallery-hover transition-colors text-left"
                  >
                    <span className="text-xs font-medium text-white/70">{category.label}</span>
                    {expandCategories[category.id] ? (
                      <ChevronUp className="w-3.5 h-3.5 text-white/40" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandCategories[category.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 flex flex-wrap gap-1.5">
                          {groupedTags[category.id]?.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleTagToggle(tag.id)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                formData.tagIds.includes(tag.id)
                                  ? 'border-transparent shadow-md'
                                  : 'bg-transparent hover:bg-white/5'
                              }`}
                              style={
                                formData.tagIds.includes(tag.id)
                                  ? getTagColorClass(tag.color)
                                  : {
                                      borderColor: `${tag.color}30`,
                                      color: `${tag.color}aa`,
                                    }
                              }
                            >
                              {tag.name}
                            </button>
                          ))}
                          {(!groupedTags[category.id] || groupedTags[category.id].length === 0) && (
                            <p className="text-xs text-white/30 py-1">暂无标签</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {formData.tagIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-xs text-white/40 py-1">已选标签:</span>
                {formData.tagIds.map((tagId) => {
                  const tag = artworkTags.find((t) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tagId}
                      className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                      style={getTagColorClass(tag.color)}
                    >
                      {tag.name}
                      <button onClick={() => handleTagToggle(tagId)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gallery-border flex gap-2">
        <button
          onClick={resetForm}
          className="flex-1 btn-secondary text-sm"
        >
          重置
        </button>
        <button
          onClick={validateForm}
          className="btn-secondary text-sm px-4"
        >
          <Info className="w-4 h-4" />
          校验
        </button>
        {editingArtwork ? (
          <button
            onClick={handleUpdateArtwork}
            className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存修改
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={ingestionStatus === 'uploading' || ingestionStatus === 'validating'}
            className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {ingestionStatus === 'uploading' || ingestionStatus === 'validating' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {INGESTION_STATUS_LABELS[ingestionStatus]}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                提交入库
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderLibraryPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gold" />
          作品库
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            共 {filteredArtworks.length} 件作品
          </span>
          {selectedFilterTagIds.length > 0 && (
            <span className="text-xs text-gold/80 bg-gold/10 px-2 py-0.5 rounded-full">
              已选 {selectedFilterTagIds.length} 个标签
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="搜索作品标题、艺术家、标签..."
              value={ingestionSearchQuery}
              onChange={(e) => setIngestionSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white/70 hover:text-white hover:border-gold/50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <SortIcon />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-gallery-bg border border-gallery-border rounded-lg shadow-xl z-20 min-w-[140px] overflow-hidden">
                {ARTWORK_SORT_TYPES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSortChange(item.id)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${
                      artworkSortType === item.id ? 'text-gold bg-gold/10' : 'text-white/80'
                    }`}
                  >
                    <span>{item.label}</span>
                    {artworkSortType === item.id && <SortIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsBatchMode(!isBatchMode)}
            className={`p-2 rounded-lg border transition-colors ${
              isBatchMode
                ? 'bg-gold/20 border-gold/50 text-gold'
                : 'bg-gallery-bg border-gallery-border text-white/70 hover:text-white hover:border-gold/50'
            }`}
            title="批量模式"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowBatchImport(true)}
            className="p-2 bg-gallery-bg border border-gallery-border rounded-lg text-white/70 hover:text-gold hover:border-gold/50 transition-colors"
            title="批量导入"
          >
            <FileJson className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-2">
          <Filter className="w-3.5 h-3.5 text-white/40 mt-1.5" />
          <div className="flex-1">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={clearFilterTags}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedFilterTagIds.length === 0
                    ? 'bg-gold/20 text-gold border-gold/40'
                    : 'border-gallery-border text-white/50 hover:text-white/70'
                }`}
              >
                全部
              </button>
              {artworkTags.map((tag) => {
                const count = getArtworksByTagId(tag.id).length;
                const isSelected = selectedFilterTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleFilterTag(tag.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'shadow-md'
                        : 'bg-transparent hover:bg-white/5'
                    }`}
                    style={
                      isSelected
                        ? getTagColorClass(tag.color)
                        : {
                            borderColor: `${tag.color}30`,
                            color: `${tag.color}aa`,
                          }
                    }
                  >
                    {tag.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isBatchMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between px-3 py-2 bg-gold/10 border border-gold/30 rounded-lg"
          >
            <span className="text-sm text-white/80">
              已选择 <span className="text-gold font-medium">{selectedArtworkIds.size}</span> / {filteredArtworks.length} 件作品
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAllArtworks(filteredArtworks.map((a) => a.id))}
                className="text-xs px-2 py-1 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                全选
              </button>
              <button
                onClick={clearArtworkSelections}
                className="text-xs px-2 py-1 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowBatchDeleteConfirm(true)}
                disabled={selectedArtworkIds.size === 0}
                className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                批量删除
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {filteredArtworks.length === 0 ? (
          <Empty
            icon={ImageIcon}
            title="暂无作品"
            description="搜索条件下没有找到匹配的作品"
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredArtworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card p-2 group ${
                    selectedArtworkIds.has(artwork.id) ? 'ring-2 ring-gold' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {isBatchMode && (
                      <button
                        onClick={() => toggleArtworkSelection(artwork.id)}
                        className="mt-5 p-1"
                      >
                        {selectedArtworkIds.has(artwork.id) ? (
                          <CheckSquare className="w-5 h-5 text-gold" />
                        ) : (
                          <Square className="w-5 h-5 text-white/30" />
                        )}
                      </button>
                    )}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gallery-bg">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white text-sm truncate">
                            {artwork.title}
                          </h4>
                          <p className="text-xs text-white/60 truncate">
                            {artwork.artist} · {artwork.year}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditArtwork(artwork)}
                            className="p-1 bg-gallery-bg/80 rounded hover:bg-gold/20 transition-colors"
                            title="编辑"
                          >
                            <Edit3 className="w-3 h-3 text-gold" />
                          </button>
                          <button
                            onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                            className="p-1 bg-gallery-bg/80 rounded hover:bg-red-500/30 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {artwork.width} × {artwork.height}
                        {artwork.depth ? ` × ${artwork.depth}` : ''} cm · {artwork.medium}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {artwork.tagIds.slice(0, 3).map((tagId) => {
                          const tag = artworkTags.find((t) => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={getTagColorClass(tag.color)}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                        {artwork.tagIds.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-white/40">
                            +{artwork.tagIds.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gallery-border">
        <button
          onClick={() => {
            resetForm();
            setWorkstationTab('ingestion');
          }}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加入库新作品
        </button>
      </div>

      {/* 删除确认对话框 */}
      <AnimatePresence>
        {deleteValidation && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gallery-bg border border-gallery-border rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">确认删除</h3>
                  <p className="text-sm text-white/70">
                    {deleteValidation.canDelete
                      ? '确定要删除该作品吗？此操作不可恢复。'
                      : '该作品已被以下内容引用，删除可能影响相关数据：'}
                  </p>
                </div>
              </div>

              {!deleteValidation.canDelete && (
                <div className="mb-4 space-y-2">
                  {deleteValidation.usageInfo.map((info, idx) => (
                    <div key={idx} className="px-3 py-2 bg-gallery-hover rounded-lg">
                      <p className="text-sm text-white/90">
                        {info.type === 'scheme' && '展览方案: '}
                        {info.type === 'theme' && '主题集合: '}
                        {info.type === 'project' && '策展项目: '}
                        <span className="text-gold">{info.name}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeleteValidation(null);
                    setArtworkToDelete(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                {deleteValidation.canDelete ? (
                  <button
                    onClick={() => confirmDelete(false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                  >
                    确认删除
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => confirmDelete(false)}
                      className="flex-1 btn-secondary"
                      disabled
                    >
                      作品被使用，无法删除
                    </button>
                    <button
                      onClick={() => confirmDelete(true)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      强制删除
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 批量删除确认对话框 */}
      <AnimatePresence>
        {showBatchDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gallery-bg border border-gallery-border rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">批量删除</h3>
                  <p className="text-sm text-white/70">
                    确定要删除选中的 <span className="text-gold font-medium">{selectedArtworkIds.size}</span> 件作品吗？
                    被使用的作品将被跳过。此操作不可恢复。
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBatchDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 批量导入对话框 */}
      <AnimatePresence>
        {showBatchImport && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gallery-bg border border-gallery-border rounded-xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-gold" />
                  批量导入作品
                </h3>
                <button
                  onClick={() => {
                    setShowBatchImport(false);
                    setImportJson('');
                    setImportResult(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {importResult && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-4"
                >
                  <div className={`p-4 rounded-lg ${
                    importResult.successCount > 0 ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    <p className="text-sm text-white/90 mb-2">
                      导入完成: 成功 <span className="text-green-400 font-medium">{importResult.successCount}</span> 条，
                      失败 <span className="text-red-400 font-medium">{importResult.failCount}</span> 条
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-400">
                            第 {error.index + 1} 条: {error.errors.join(', ')}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="mb-4">
                <label className="block text-xs text-white/60 mb-2">
                  JSON 数据格式
                </label>
                <div className="p-3 bg-gallery-hover rounded-lg text-xs text-white/50 mb-2">
                  <pre className="whitespace-pre-wrap">{`[
  {
    "title": "作品标题",
    "artist": "艺术家",
    "year": 2024,
    "imageUrl": "图片URL",
    "width": 100,
    "height": 80,
    "medium": "媒介",
    "description": "描述",
    "tags": ["标签1", "标签2"]
  }
]`}</pre>
                </div>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder="粘贴 JSON 数据..."
                  rows={8}
                  className="w-full input-field resize-none font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBatchImport(false);
                    setImportJson('');
                    setImportResult(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchImport}
                  disabled={!importJson.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileJson className="w-4 h-4 inline mr-1" />
                  导入
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 删除成功提示 */}
      <AnimatePresence>
        {showDeleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-green-500/90 text-white rounded-lg shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">删除成功</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTagsPanel = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-gold" />
          标签管理
        </h3>
        <button
          onClick={() => setShowTagManager(!showTagManager)}
          className="text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
        >
          {showTagManager ? '收起' : '管理标签'}
          {showTagManager ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <AnimatePresence>
        {showTagManager && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-gallery-bg border border-gallery-border rounded-xl space-y-3">
              <h4 className="text-sm font-medium text-white">添加新标签</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="标签名称"
                  value={newTagForm.name}
                  onChange={(e) => setNewTagForm({ ...newTagForm, name: e.target.value })}
                  className="input-field text-sm"
                />
                <select
                  value={newTagForm.category}
                  onChange={(e) => setNewTagForm({ ...newTagForm, category: e.target.value })}
                  className="input-field text-sm"
                >
                  {TAG_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-white/60">颜色</label>
                <input
                  type="color"
                  value={newTagForm.color}
                  onChange={(e) => setNewTagForm({ ...newTagForm, color: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent"
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: newTagForm.color }}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTagForm.name.trim()}
                  className="ml-auto btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  添加
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {TAG_CATEGORIES.map((category) => {
          const tags = groupedTags[category.id] || [];
          return (
            <div
              key={category.id}
              className="border border-gallery-border rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 bg-gallery-bg flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">{category.label}</h4>
                  <p className="text-xs text-white/40">{tags.length} 个标签</p>
                </div>
                <FolderPlus className="w-4 h-4 text-gold" />
              </div>
              <div className="p-3">
                {tags.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-2">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="group relative"
                      >
                        {editingTag?.id === tag.id ? (
                          <div className="flex items-center gap-1 p-1.5 rounded-lg bg-gallery-bg border border-gold/50">
                            <input
                              type="text"
                              value={editingTag.name}
                              onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                              className="w-20 bg-transparent text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <input
                              type="color"
                              value={editingTag.color}
                              onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent"
                            />
                            <button
                              onClick={() => handleUpdateTag(tag.id)}
                              className="p-1 hover:bg-green-500/20 rounded"
                            >
                              <Check className="w-3 h-3 text-green-400" />
                            </button>
                            <button
                              onClick={() => setEditingTag(null)}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all hover:scale-105"
                            style={{
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                              borderColor: `${tag.color}40`,
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {tag.name}
                            <div className="ml-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTag(tag);
                                }}
                                className="p-0.5 hover:bg-white/10 rounded"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`确定要删除标签"${tag.name}"吗？`)) {
                                    removeArtworkTag(tag.id);
                                  }
                                }}
                                className="p-0.5 hover:bg-red-500/20 rounded"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg mb-4">
        {WORKSTATION_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setWorkstationTab(tab.id)}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
              workstationTab === tab.id
                ? 'bg-gold text-gallery-bg shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={workstationTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {workstationTab === 'ingestion' && renderIngestionPanel()}
            {workstationTab === 'library' && renderLibraryPanel()}
            {workstationTab === 'tags' && renderTagsPanel()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
