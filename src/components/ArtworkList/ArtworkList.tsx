import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Info,
  Tag,
  CheckSquare,
  Square,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Edit3,
  AlertTriangle,
  Filter,
  Check,
  Upload,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Artwork, ArtworkTag, ArtworkSortType, ArtworkDeletionValidation } from '../../types';
import { ARTWORK_SORT_TYPES } from '../../types';

export const ArtworkList: React.FC = () => {
  const {
    artworkTags,
    selectedArtworkId,
    setSelectedArtwork,
    filterAndSortArtworks,
    artworkSortType,
    artworkSortDirection,
    setArtworkSortType,
    setArtworkSortDirection,
    artworkFilterTagIds,
    toggleArtworkFilterTag,
    clearArtworkFilterTags,
    selectedArtworkIds,
    toggleArtworkSelection,
    selectAllArtworks,
    clearArtworkSelections,
    validateArtworkDeletion,
    removeArtworkWithValidation,
    batchRemoveArtworks,
    batchImportArtworks,
    updateArtworkWithTags,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfo, setSelectedInfo] = useState<Artwork | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editForm, setEditForm] = useState<Partial<Artwork> & { tagIds: string[] }>({
    title: '',
    artist: '',
    year: 0,
    width: 0,
    height: 0,
    medium: '',
    description: '',
    tagIds: [],
  });
  const [deleteValidation, setDeleteValidation] = useState<ArtworkDeletionValidation | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importResult, setImportResult] = useState<{ success: number; fail: number } | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const filteredArtworks = useMemo(
    () => filterAndSortArtworks(searchQuery),
    [searchQuery, filterAndSortArtworks]
  );

  const getTagById = (tagId: string): ArtworkTag | undefined => {
    return artworkTags.find((t) => t.id === tagId);
  };

  const handleTagClick = (tagName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery(tagName);
  };

  const getTagColorClass = (color: string) => ({
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}40`,
  });

  const handleSingleDelete = useCallback(
    (artworkId: string, artworkTitle: string, e: React.MouseEvent) => {
      e.stopPropagation();
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
  }, [selectedArtworkIds, batchRemoveArtworks, clearArtworkSelections]);

  const handleSortChange = (sortType: ArtworkSortType) => {
    if (artworkSortType === sortType) {
      setArtworkSortDirection(artworkSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setArtworkSortType(sortType);
    }
    setShowSortMenu(false);
  };

  const handleEditArtwork = (artwork: Artwork, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArtwork(artwork);
    setEditForm({
      title: artwork.title,
      artist: artwork.artist,
      year: artwork.year,
      width: artwork.width,
      height: artwork.height,
      depth: artwork.depth,
      medium: artwork.medium,
      description: artwork.description || '',
      tagIds: [...artwork.tagIds],
    });
  };

  const handleSaveEdit = () => {
    if (editingArtwork && editForm.title && editForm.artist) {
      updateArtworkWithTags(editingArtwork.id, {
        ...editForm,
        year: Number(editForm.year),
        width: Number(editForm.width),
        height: Number(editForm.height),
        depth: editForm.depth ? Number(editForm.depth) : undefined,
        updatedAt: Date.now(),
      });
      setEditingArtwork(null);
    }
  };

  const handleEditTagToggle = (tagId: string) => {
    setEditForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleBatchImport = () => {
    try {
      const artworks = JSON.parse(importJson);
      if (Array.isArray(artworks)) {
        const result = batchImportArtworks(artworks);
        setImportResult({ success: result.successCount, fail: result.failCount });
        if (result.successCount > 0) {
          setImportJson('');
          setTimeout(() => setImportResult(null), 3000);
        }
      }
    } catch {
      alert('JSON 格式错误，请检查输入');
    }
  };

  const handleCardClick = (artworkId: string) => {
    if (isBatchMode) {
      toggleArtworkSelection(artworkId);
    } else {
      setSelectedArtwork(artworkId);
    }
  };

  const SortIcon = () => {
    if (artworkSortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3" />;
    }
    return <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="h-full flex flex-col bg-gallery-surface border-r border-gallery-border">
      <div className="p-4 border-b border-gallery-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-white">
            作品收藏
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`p-1.5 rounded transition-colors ${
                isBatchMode
                  ? 'bg-gold/20 text-gold'
                  : 'text-white/40 hover:text-white/70 hover:bg-gallery-bg'
              }`}
              title={isBatchMode ? '退出批量模式' : '批量选择'}
            >
              {isBatchMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowBatchImport(true)}
              className="p-1.5 rounded text-white/40 hover:text-white/70 hover:bg-gallery-bg transition-colors"
              title="批量导入"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="搜索标题、艺术家、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-gallery-bg border border-gallery-border rounded-lg text-xs text-white/70 hover:border-gold/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
                {ARTWORK_SORT_TYPES.find((t) => t.id === artworkSortType)?.label || '排序'}
              </span>
              <SortIcon />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-gallery-surface border border-gallery-border rounded-lg shadow-xl z-20 overflow-hidden"
                >
                  {ARTWORK_SORT_TYPES.map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => handleSortChange(sort.id)}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-gallery-bg transition-colors flex items-center justify-between ${
                        artworkSortType === sort.id ? 'text-gold' : 'text-white/70'
                      }`}
                    >
                      {sort.label}
                      {artworkSortType === sort.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`px-3 py-1.5 bg-gallery-bg border rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
              artworkFilterTagIds.length > 0
                ? 'border-gold/50 text-gold'
                : 'border-gallery-border text-white/70 hover:border-gold/50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            标签
            {artworkFilterTagIds.length > 0 && (
              <span className="bg-gold text-gallery-bg rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {artworkFilterTagIds.length}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showTagFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-gallery-bg border border-gallery-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/70">按标签筛选</span>
                  {artworkFilterTagIds.length > 0 && (
                    <button
                      onClick={clearArtworkFilterTags}
                      className="text-xs text-gold hover:text-gold-light transition-colors"
                    >
                      清除全部
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {artworkTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleArtworkFilterTag(tag.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                        artworkFilterTagIds.includes(tag.id)
                          ? 'shadow-md'
                          : 'bg-transparent hover:bg-white/5'
                      }`}
                      style={
                        artworkFilterTagIds.includes(tag.id)
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isBatchMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gold">
                已选择 {selectedArtworkIds.size} 件作品
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => selectAllArtworks(filteredArtworks.map((a) => a.id))}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                全选
              </button>
              <button
                onClick={clearArtworkSelections}
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                取消
              </button>
              {selectedArtworkIds.size > 0 && (
                <button
                  onClick={() => setShowBatchDeleteConfirm(true)}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  删除选中
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showDeleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-4 right-4 z-50 p-3 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center gap-2 text-green-400 text-sm"
          >
            <Check className="w-4 h-4" />
            操作成功
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredArtworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`group relative card p-2 cursor-pointer transition-all ${
                selectedArtworkId === artwork.id && !isBatchMode
                  ? 'border-gold ring-1 ring-gold/30'
                  : ''
              } ${
                selectedArtworkIds.has(artwork.id)
                  ? 'border-blue-500/50 ring-1 ring-blue-500/30 bg-blue-500/5'
                  : ''
              }`}
              onClick={() => handleCardClick(artwork.id)}
            >
              {isBatchMode && (
                <div className="absolute top-2 left-2 z-10">
                  {selectedArtworkIds.has(artwork.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5 text-white/40" />
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gallery-bg ${isBatchMode ? 'opacity-70' : ''}`}>
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-xs text-white/60 truncate">
                    {artwork.artist}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {artwork.year} · {artwork.medium}
                  </p>
                  {artwork.tagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artwork.tagIds.slice(0, 3).map((tagId) => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            onClick={(e) => handleTagClick(tag.name, e)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full cursor-pointer transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[60px]">
                              {tag.name}
                            </span>
                          </span>
                        );
                      })}
                      {artwork.tagIds.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/10 text-white/50">
                          +{artwork.tagIds.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInfo(artwork);
                  }}
                  className="p-1 bg-gallery-bg/80 rounded hover:bg-gallery-hover transition-colors"
                >
                  <Info className="w-3 h-3 text-white/70" />
                </button>
                <button
                  onClick={(e) => handleEditArtwork(artwork, e)}
                  className="p-1 bg-gallery-bg/80 rounded hover:bg-gold/20 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-gold" />
                </button>
                <button
                  onClick={(e) => handleSingleDelete(artwork.id, artwork.title, e)}
                  className="p-1 bg-gallery-bg/80 rounded hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            未找到匹配的作品
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gallery-border">
        <button className="w-full btn-secondary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          添加作品
        </button>
      </div>

      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gallery-bg">
                <img
                  src={selectedInfo.imageUrl}
                  alt={selectedInfo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-1">
                {selectedInfo.title}
              </h3>
              <p className="text-gold mb-3">{selectedInfo.artist}</p>
              <div className="space-y-2 text-sm text-white/70">
                <p>
                  <span className="text-white/40">年份：</span>
                  {selectedInfo.year}
                </p>
                <p>
                  <span className="text-white/40">材质：</span>
                  {selectedInfo.medium}
                </p>
                <p>
                  <span className="text-white/40">尺寸：</span>
                  {selectedInfo.width} × {selectedInfo.height} cm
                </p>
                {selectedInfo.tagIds.length > 0 && (
                  <div className="mt-2">
                    <span className="text-white/40 mr-2">标签：</span>
                    <div className="inline-flex flex-wrap gap-1.5 mt-1">
                      {selectedInfo.tagIds.map((tagId) => {
                        const tag = getTagById(tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {tag.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedInfo.description && (
                  <p className="mt-4 pt-4 border-t border-gallery-border">
                    {selectedInfo.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedInfo(null)}
                className="mt-6 w-full btn-primary"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-white">
                  编辑作品信息
                </h3>
                <button
                  onClick={() => setEditingArtwork(null)}
                  className="p-1 hover:bg-gallery-bg rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">作品标题</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">艺术家</label>
                    <input
                      type="text"
                      value={editForm.artist}
                      onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">年份</label>
                    <input
                      type="number"
                      value={editForm.year}
                      onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">宽度 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.width}
                      onChange={(e) => setEditForm({ ...editForm, width: Number(e.target.value) })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1.5">高度 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.height}
                      onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">创作媒介</label>
                  <input
                    type="text"
                    value={editForm.medium}
                    onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1.5">作品描述</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="input-field text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2">标签</label>
                  <div className="flex flex-wrap gap-1.5">
                    {artworkTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleEditTagToggle(tag.id)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                          editForm.tagIds.includes(tag.id)
                            ? 'shadow-md'
                            : 'bg-transparent hover:bg-white/5'
                        }`}
                        style={
                          editForm.tagIds.includes(tag.id)
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
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setEditingArtwork(null)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 btn-primary"
                  disabled={!editForm.title || !editForm.artist}
                >
                  保存修改
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteValidation && artworkToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setDeleteValidation(null);
              setArtworkToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">确认删除</h3>
                  <p className="text-sm text-white/60">该操作无法撤销</p>
                </div>
              </div>

              {!deleteValidation.canDelete && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 mb-2">
                    ⚠️ 该作品正在被以下位置使用：
                  </p>
                  <ul className="space-y-1">
                    {deleteValidation.usageInfo.map((usage, index) => (
                      <li key={index} className="text-xs text-white/60">
                        • {usage.type === 'scheme' ? '方案' : usage.type === 'theme' ? '主题' : '项目'}：{usage.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-white/70 mb-6">
                确定要删除这件作品吗？
                {!deleteValidation.canDelete && ' 强制删除将同时移除所有关联引用。'}
              </p>

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
                {!deleteValidation.canDelete ? (
                  <button
                    onClick={() => confirmDelete(true)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    强制删除
                  </button>
                ) : (
                  <button
                    onClick={() => confirmDelete(false)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    确认删除
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBatchDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBatchDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">批量删除</h3>
                  <p className="text-sm text-white/60">
                    将删除 {selectedArtworkIds.size} 件作品
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/70 mb-6">
                安全模式下，正在被使用的作品将被跳过。确定要继续吗？
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowBatchDeleteConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBatchImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBatchImport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-white">
                  批量导入作品
                </h3>
                <button
                  onClick={() => setShowBatchImport(false)}
                  className="p-1 hover:bg-gallery-bg rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <p className="text-sm text-white/60 mb-4">
                请输入 JSON 格式的作品数据数组，每件作品需要包含 title、artist、year、imageUrl、width、height、medium 等字段。
              </p>

              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={`[\n  {\n    "title": "作品标题",\n    "artist": "艺术家",\n    "year": 2024,\n    "imageUrl": "https://...",\n    "width": 80,\n    "height": 60,\n    "medium": "布面油画",\n    "description": "作品描述",\n    "tagIds": ["tag-1", "tag-2"]\n  }\n]`}
                rows={12}
                className="input-field text-sm font-mono resize-none w-full"
              />

              {importResult && (
                <div className={`mt-4 p-3 rounded-lg ${
                  importResult.fail > 0
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                    : 'bg-green-500/10 border border-green-500/30 text-green-400'
                }`}>
                  导入完成：成功 {importResult.success} 件，失败 {importResult.fail} 件
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowBatchImport(false)}
                  className="flex-1 btn-secondary"
                >
                  关闭
                </button>
                <button
                  onClick={handleBatchImport}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  disabled={!importJson.trim()}
                >
                  <Upload className="w-4 h-4" />
                  导入
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
