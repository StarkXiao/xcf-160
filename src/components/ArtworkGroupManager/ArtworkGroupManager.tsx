import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Layers,
  Palette,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ArtworkGroup } from '../../types';

const GROUP_COLORS = [
  '#d4af37',
  '#c0c0c0',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

interface ArtworkGroupManagerProps {
  schemeId: string;
  compact?: boolean;
}

export const ArtworkGroupManager: React.FC<ArtworkGroupManagerProps> = ({
  schemeId,
  compact = false,
}) => {
  const {
    gallerySchemes,
    artworks,
    createGroup,
    updateGroup,
    deleteGroup,
    addArtworksToGroup,
    removeArtworksFromGroup,
    selectedGroupId,
    setSelectedGroupId,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0]);
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showAddArtworkDialog, setShowAddArtworkDialog] = useState<string | null>(null);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);

  const scheme = useMemo(
    () => gallerySchemes.find((s) => s.id === schemeId),
    [gallerySchemes, schemeId]
  );

  const groups = useMemo(
    () => [...(scheme?.groups || [])].sort((a, b) => a.order - b.order),
    [scheme]
  );

  const ungroupedArtworks = useMemo(() => {
    const groupedIds = new Set(
      groups.flatMap((g) => g.artworkIds)
    );
    return artworks.filter((a) => !groupedIds.has(a.id));
  }, [artworks, groups]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroup(schemeId, newGroupName.trim(), newGroupColor, newGroupDescription.trim() || undefined);
    setNewGroupName('');
    setNewGroupColor(GROUP_COLORS[0]);
    setNewGroupDescription('');
    setShowCreateDialog(false);
  };

  const handleStartEdit = (group: ArtworkGroup) => {
    setEditingGroupId(group.id);
    setEditingName(group.name);
  };

  const handleSaveEdit = (groupId: string) => {
    if (!editingName.trim()) return;
    updateGroup(schemeId, groupId, { name: editingName.trim() });
    setEditingGroupId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditingName('');
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group && confirm(`确定要删除分组"${group.name}"吗？组内作品将变为未分组状态。`)) {
      deleteGroup(schemeId, groupId);
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    }
  };

  const handleToggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleOpenAddArtwork = (groupId: string) => {
    setShowAddArtworkDialog(groupId);
    setSelectedArtworkIds([]);
  };

  const handleAddArtworks = (groupId: string) => {
    if (selectedArtworkIds.length === 0) return;
    addArtworksToGroup(schemeId, groupId, selectedArtworkIds);
    setSelectedArtworkIds([]);
    setShowAddArtworkDialog(null);
  };

  const handleRemoveArtwork = (groupId: string, artworkId: string) => {
    removeArtworksFromGroup(schemeId, groupId, [artworkId]);
  };

  const getGroupArtworks = (group: ArtworkGroup) => {
    return group.artworkIds
      .map((id) => artworks.find((a) => a.id === id))
      .filter(Boolean);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!scheme) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <p>请选择一个方案</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-gold" />
          作品分组
        </h3>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          新建分组
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {groups.length === 0 && ungroupedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-sm mb-2">暂无分组</p>
            <p className="text-white/30 text-xs">创建分组来管理您的作品</p>
          </div>
        ) : (
          <>
            {groups.map((group) => {
              const groupArtworks = getGroupArtworks(group);
              const isExpanded = expandedGroups.has(group.id);
              const isEditing = editingGroupId === group.id;
              const isSelected = selectedGroupId === group.id;

              return (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-gold/50' : ''
                  }`}
                >
                  <div
                    className="p-3 cursor-pointer hover:bg-gallery-hover/50 transition-colors"
                    onClick={() => {
                      setSelectedGroupId(isSelected ? null : group.id);
                      handleToggleExpand(group.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white/30">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 input-field text-sm py-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') handleSaveEdit(group.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(group.id);
                              }}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium text-white truncate">
                              {group.name}
                            </h4>
                            {group.description && (
                              <p className="text-xs text-white/40 truncate">
                                {group.description}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-white/40 px-2 py-0.5 bg-gallery-bg rounded">
                          {group.artworkIds.length} 件
                        </span>
                        {!isEditing && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(group);
                              }}
                              className="p-1 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                              title="编辑分组"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddArtwork(group.id);
                              }}
                              className="p-1 text-white/40 hover:text-gold hover:bg-gold/10 rounded transition-colors"
                              title="添加作品"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                              title="删除分组"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-white/40" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && groupArtworks.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gallery-border"
                      >
                        <div className="p-3 space-y-2">
                          {groupArtworks.map((artwork) => (
                            artwork && (
                              <motion.div
                                key={artwork.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-2 rounded-lg bg-gallery-bg hover:bg-gallery-hover transition-colors group"
                              >
                                <div
                                  className="w-8 h-8 rounded overflow-hidden flex-shrink-0"
                                  style={{ borderLeft: `3px solid ${group.color}` }}
                                >
                                  <img
                                    src={artwork.imageUrl}
                                    alt={artwork.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">
                                    {artwork.title}
                                  </p>
                                  <p className="text-xs text-white/40 truncate">
                                    {artwork.artist}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveArtwork(group.id, artwork.id);
                                  }}
                                  className="p-1 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                  title="移出分组"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            )
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {ungroupedArtworks.length > 0 && (
              <div className="card overflow-hidden mt-4">
                <div
                  className="p-3 cursor-pointer hover:bg-gallery-hover/50 transition-colors"
                  onClick={() => handleToggleExpand('ungrouped')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 bg-white/20" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white/70">未分组作品</h4>
                      <p className="text-xs text-white/40">
                        这些作品还没有被分配到任何分组
                      </p>
                    </div>
                    <span className="text-xs text-white/40 px-2 py-0.5 bg-gallery-bg rounded">
                      {ungroupedArtworks.length} 件
                    </span>
                    {expandedGroups.has('ungrouped') ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedGroups.has('ungrouped') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gallery-border"
                    >
                      <div className="p-3 space-y-2">
                        {ungroupedArtworks.map((artwork) => (
                          <motion.div
                            key={artwork.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-2 rounded-lg bg-gallery-bg"
                          >
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80 truncate">
                                {artwork.title}
                              </p>
                              <p className="text-xs text-white/40 truncate">
                                {artwork.artist}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showCreateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                创建新分组
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    分组名称
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="input-field"
                    placeholder="输入分组名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateGroup();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    分组颜色
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGroupColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          newGroupColor === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-gallery-bg scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    分组描述（可选）
                  </label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="输入分组描述..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddArtworkDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddArtworkDialog(null);
              setSelectedArtworkIds([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-lg w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                添加作品到分组
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {ungroupedArtworks.length === 0 ? (
                  <div className="text-center py-8 text-white/40">
                    <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">没有可添加的作品</p>
                  </div>
                ) : (
                  ungroupedArtworks.map((artwork) => {
                    const isSelected = selectedArtworkIds.includes(artwork.id);
                    return (
                      <motion.div
                        key={artwork.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setSelectedArtworkIds((prev) =>
                            prev.includes(artwork.id)
                              ? prev.filter((id) => id !== artwork.id)
                              : [...prev, artwork.id]
                          );
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10'
                            : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {artwork.title}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {artwork.artist} · {artwork.year}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-gold bg-gold'
                              : 'border-gallery-border'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-gallery-bg" />}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gallery-border mt-4">
                <span className="text-sm text-white/60">
                  已选择 {selectedArtworkIds.length} 件作品
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddArtworkDialog(null);
                      setSelectedArtworkIds([]);
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleAddArtworks(showAddArtworkDialog!)}
                    disabled={selectedArtworkIds.length === 0}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
