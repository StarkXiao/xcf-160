import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Trash2,
  Download,
  Upload,
  Play,
  Plus,
  FolderOpen,
  FolderPlus,
  Search,
  SortAsc,
  Copy,
  Check,
  X,
  Edit3,
  Image as ImageIcon,
  Tag,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  Star,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { exportPreset, importPreset } from '../../utils/storage';
import { kelvinToHex } from '../../utils/color';
import {
  LIGHT_TYPE_LABELS,
  FRAME_MATERIAL_LABELS,
  PRESET_GROUP_COLORS,
  LOCAL_PRESET_SORT_TYPES,
} from '../../types';
import type { Preset, PresetGroup } from '../../types';

export const StoragePanel: React.FC = () => {
  const {
    presets,
    presetGroups,
    selectedPresetGroupId,
    presetSearchQuery,
    presetSortType,
    artworks,
    selectedArtworkId,
    savePreset,
    deletePreset,
    loadPreset,
    addToCompare,
    createPresetGroup,
    updatePresetGroup,
    deletePresetGroup,
    addPresetToGroup,
    removePresetFromGroup,
    setSelectedPresetGroup,
    setPresetSearchQuery,
    setPresetSortType,
    updatePreset,
    duplicatePreset,
    copyPresetToClipboard,
    getFilteredPresets,
    getRecentlyUsedPresets,
    setPresetCover,
    addPresetKeywords,
    removePresetKeyword,
    getPresetsByGroup,
  } = useAppStore();

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(PRESET_GROUP_COLORS[0]);
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null);
  const [selectedPresetForMenu, setSelectedPresetForMenu] = useState<string | null>(null);
  const [showKeywordInput, setShowKeywordInput] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [showMoveToGroup, setShowMoveToGroup] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['ungrouped']));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPresets = useMemo(() => getFilteredPresets(), [getFilteredPresets]);
  const recentlyUsed = useMemo(() => getRecentlyUsedPresets(5), [getRecentlyUsedPresets]);

  const groupedPresets = useMemo(() => {
    const groups: { group: PresetGroup | null; presets: Preset[] }[] = [];

    const ungrouped = filteredPresets.filter((p) => !p.groupId);
    if (ungrouped.length > 0) {
      groups.push({ group: null, presets: ungrouped });
    }

    presetGroups.forEach((group) => {
      const groupPresets = filteredPresets.filter((p) => p.groupId === group.id);
      if (groupPresets.length > 0) {
        groups.push({ group, presets: groupPresets });
      }
    });

    return groups;
  }, [filteredPresets, presetGroups]);

  const selectedArtwork = artworks.find((a) => a.id === selectedArtworkId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    if (!newPresetName.trim() || !selectedArtworkId) return;
    savePreset(newPresetName.trim());
    setNewPresetName('');
    setShowSaveDialog(false);
  };

  const handleExport = (preset: Preset) => {
    exportPreset(preset);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preset = await importPreset(file);
      const now = Date.now();
      const migratedPreset = {
        ...preset,
        id: `preset-${now}`,
        keywords: preset.keywords || [],
        useCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      updatePreset(migratedPreset.id, migratedPreset);
    } catch (err) {
      alert('导入失败：无效的方案文件');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = async (presetId: string) => {
    await copyPresetToClipboard(presetId);
    setCopiedPresetId(presetId);
    setTimeout(() => setCopiedPresetId(null), 2000);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    if (editingGroupId) {
      updatePresetGroup(editingGroupId, {
        name: newGroupName.trim(),
        color: newGroupColor,
        description: newGroupDescription.trim() || undefined,
      });
    } else {
      createPresetGroup(newGroupName.trim(), newGroupColor, newGroupDescription.trim() || undefined);
    }

    setNewGroupName('');
    setNewGroupColor(PRESET_GROUP_COLORS[0]);
    setNewGroupDescription('');
    setEditingGroupId(null);
    setShowGroupDialog(false);
  };

  const handleEditGroup = (group: PresetGroup) => {
    setEditingGroupId(group.id);
    setNewGroupName(group.name);
    setNewGroupColor(group.color);
    setNewGroupDescription(group.description || '');
    setShowGroupDialog(true);
  };

  const handleAddKeyword = (presetId: string) => {
    if (!newKeyword.trim()) return;
    addPresetKeywords(presetId, [newKeyword.trim()]);
    setNewKeyword('');
    setShowKeywordInput(null);
  };

  const handleCoverUpload = (presetId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const imageUrl = ev.target?.result as string;
          setPresetCover(presetId, imageUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const toggleGroup = (groupId: string) => {
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

  const getArtwork = (artworkId: string) => artworks.find((a) => a.id === artworkId);

  const renderPresetCard = (preset: Preset, showGroupLabel = false) => {
    const artwork = getArtwork(preset.artworkId);
    const lightColor = kelvinToHex(preset.lighting.colorTemperature);
    const group = preset.groupId ? presetGroups.find((g) => g.id === preset.groupId) : null;
    const isMenuOpen = selectedPresetForMenu === preset.id;
    const isRecent = recentlyUsed.some((r) => r.id === preset.id);

    return (
      <motion.div
        key={preset.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card p-3 group relative"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer group/cover"
            style={{ backgroundColor: lightColor + '30' }}
            onClick={() => handleCoverUpload(preset.id)}
          >
            {preset.coverImageUrl ? (
              <img
                src={preset.coverImageUrl}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            ) : artwork ? (
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-full object-cover"
                style={{
                  filter: `sepia(0.2) hue-rotate(${(preset.lighting.colorTemperature - 5000) / 50}deg)`,
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-gallery-bg"
              style={{ backgroundColor: lightColor }}
            />
            {isRecent && (
              <div className="absolute top-1 left-1">
                <Clock className="w-3 h-3 text-gold" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-white text-sm truncate">{preset.name}</h4>
                  {showGroupLabel && group && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0"
                      style={{ backgroundColor: group.color + '20', color: group.color }}
                    >
                      <Layers className="w-3 h-3" />
                      {group.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 truncate">
                  {artwork?.title || '未知作品'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                  <span>{preset.lighting.colorTemperature}K</span>
                  <span>·</span>
                  <span>{LIGHT_TYPE_LABELS[preset.lighting.type]}</span>
                  <span>·</span>
                  <span>{FRAME_MATERIAL_LABELS[preset.material.frameMaterial]}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                  <span>{formatDate(preset.updatedAt)}</span>
                  {preset.useCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {preset.useCount}次
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPresetForMenu(isMenuOpen ? null : preset.id);
                  }}
                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-8 bg-gallery-bg border border-gallery-border rounded-lg shadow-xl z-20 min-w-40 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          duplicatePreset(preset.id);
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        复制方案
                      </button>
                      <button
                        onClick={() => {
                          handleCopy(preset.id);
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        {copiedPresetId === preset.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            复制到剪贴板
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          handleExport(preset);
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        导出方案
                      </button>
                      <button
                        onClick={() => {
                          setShowMoveToGroup(preset.id);
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Layers className="w-3 h-3" />
                        移动到分组
                      </button>
                      <button
                        onClick={() => {
                          setShowKeywordInput(preset.id);
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Tag className="w-3 h-3" />
                        管理关键词
                      </button>
                      <div className="border-t border-gallery-border" />
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除"${preset.name}"吗？`)) {
                            deletePreset(preset.id);
                          }
                          setSelectedPresetForMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除方案
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {preset.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {preset.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold rounded flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePresetKeyword(preset.id, keyword);
                      }}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showKeywordInput === preset.id && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="输入关键词..."
                  className="flex-1 input-field text-xs py-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword(preset.id);
                  }}
                />
                <button
                  onClick={() => handleAddKeyword(preset.id)}
                  className="btn-primary text-xs px-2"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowKeywordInput(null)}
                  className="btn-secondary text-xs px-2"
                >
                  取消
                </button>
              </div>
            )}

            {showMoveToGroup === preset.id && (
              <div className="mt-2 p-2 bg-white/5 rounded-lg border border-gallery-border">
                <p className="text-xs text-white/40 mb-2">选择目标分组：</p>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => {
                      if (preset.groupId) {
                        removePresetFromGroup(preset.groupId, preset.id);
                      }
                      setShowMoveToGroup(null);
                    }}
                    className="text-xs px-2 py-1 rounded border border-gallery-border text-white/60 hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    未分组
                  </button>
                  {presetGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        addPresetToGroup(g.id, preset.id);
                        setShowMoveToGroup(null);
                      }}
                      className="text-xs px-2 py-1 rounded border text-white/60 hover:text-white transition-colors"
                      style={{
                        borderColor: g.color + '50',
                        backgroundColor: g.color + '10',
                      }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowMoveToGroup(null)}
                  className="w-full mt-2 text-xs text-white/40 hover:text-white/60"
                >
                  取消
                </button>
              </div>
            )}

            <div className="flex gap-1 mt-3 opacity-100 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => loadPreset(preset)}
                className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3" />
                应用
              </button>
              <button
                onClick={() => addToCompare(preset.id)}
                className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-gold/50 hover:text-gold transition-colors"
                title="添加到对比"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleCopy(preset.id)}
                className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-gold/50 hover:text-gold transition-colors"
                title="复制到剪贴板"
              >
                {copiedPresetId === preset.id ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => handleExport(preset)}
                className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-cool/50 hover:text-cool transition-colors"
                title="导出方案"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
      onClick={() => {
        setSelectedPresetForMenu(null);
        setShowMoveToGroup(null);
        setShowKeywordInput(null);
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Save className="w-5 h-5 text-gold" />
          方案管理
        </h3>
        <span className="text-xs text-white/40">{presets.length} 个方案</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!selectedArtworkId}
          className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          保存当前
        </button>
        <button
          onClick={() => {
            setEditingGroupId(null);
            setNewGroupName('');
            setNewGroupColor(PRESET_GROUP_COLORS[0]);
            setNewGroupDescription('');
            setShowGroupDialog(true);
          }}
          className="btn-secondary text-sm px-3"
          title="新建分组"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary text-sm px-3"
          title="导入方案"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {!selectedArtworkId && (
        <div className="mb-4 p-3 rounded-lg bg-warm/10 border border-warm/30 text-warm text-xs">
          请先选择一件艺术品
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={presetSearchQuery}
            onChange={(e) => setPresetSearchQuery(e.target.value)}
            placeholder="搜索方案名称或关键词..."
            className="input-field pl-8 pr-3 py-2 text-sm w-full"
          />
          {presetSearchQuery && (
            <button
              onClick={() => setPresetSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="btn-secondary px-3 py-2 flex items-center gap-1"
          >
            <SortAsc className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-10 bg-gallery-bg border border-gallery-border rounded-lg shadow-xl z-20 min-w-36 overflow-hidden"
              >
                {LOCAL_PRESET_SORT_TYPES.map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => {
                      setPresetSortType(sort.id);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 flex items-center justify-between ${
                      presetSortType === sort.id ? 'text-gold' : 'text-white/70'
                    }`}
                  >
                    {sort.label}
                    {presetSortType === sort.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {presetGroups.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-white/40 mb-2 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              分组筛选
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedPresetGroup(null)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedPresetGroupId === null
                    ? 'bg-gold/20 border-gold/50 text-gold'
                    : 'border-gallery-border text-white/60 hover:border-gold/30 hover:text-white/80'
                }`}
              >
                全部
              </button>
              {presetGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() =>
                    setSelectedPresetGroup(selectedPresetGroupId === group.id ? null : group.id)
                  }
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                    selectedPresetGroupId === group.id
                      ? 'border-transparent'
                      : 'border-gallery-border text-white/60 hover:border-white/30 hover:text-white/80'
                  }`}
                  style={
                    selectedPresetGroupId === group.id
                      ? { backgroundColor: group.color + '20', borderColor: group.color + '50', color: group.color }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                  <span className="text-white/40">
                    ({getPresetsByGroup(group.id).length})
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGroup(group);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-white"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {recentlyUsed.length > 0 && !presetSearchQuery && !selectedPresetGroupId && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-white/40 mb-2 flex items-center gap-2">
              <Clock className="w-3 h-3" />
              最近使用
            </h4>
            <div className="space-y-2">
              {recentlyUsed.map((preset) => renderPresetCard(preset, true))}
            </div>
          </div>
        )}

        {groupedPresets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无保存的方案</p>
            <p className="text-sm text-white/40">
              调整灯光和材质后点击"保存当前"按钮
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {groupedPresets.map(({ group, presets: groupPresets }) => {
                const groupId = group?.id || 'ungrouped';
                const isExpanded = expandedGroups.has(groupId);

                return (
                  <motion.div key={groupId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(groupId);
                      }}
                      className="w-full flex items-center gap-2 mb-2 text-left group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      )}
                      {group ? (
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      ) : (
                        <FolderOpen className="w-3 h-3 text-white/40" />
                      )}
                      <span className="text-sm font-medium text-white/80">
                        {group ? group.name : '未分组'}
                      </span>
                      <span className="text-xs text-white/40">
                        ({groupPresets.length})
                      </span>
                      {group && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group);
                          }}
                          className="ml-auto opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 ml-6">
                            {groupPresets.map((preset) => renderPresetCard(preset))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-display font-semibold text-white mb-2">
                保存方案
              </h4>
              <p className="text-sm text-white/60 mb-4">
                当前作品：
                <span className="text-gold"> {selectedArtwork?.title}</span>
              </p>

              <div className="space-y-3 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">色温</span>
                  <span className="text-white">
                    {presets[0]?.lighting.colorTemperature || 3500}K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">亮度</span>
                  <span className="text-white">
                    {Math.round((presets[0]?.lighting.intensity || 0.8) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">画框</span>
                  <span className="text-white">
                    {FRAME_MATERIAL_LABELS[
                      presets[0]?.material.frameMaterial || 'gold'
                    ]}
                  </span>
                </div>
              </div>

              <input
                type="text"
                placeholder="输入方案名称..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="input-field mb-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />

              {selectedPresetGroupId && (
                <div className="mb-3 p-2 rounded-lg bg-gold/10 border border-gold/30">
                  <p className="text-xs text-gold">
                    将保存到分组：
                    {presetGroups.find((g) => g.id === selectedPresetGroupId)?.name}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newPresetName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGroupDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGroupDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-display font-semibold text-white mb-4">
                {editingGroupId ? '编辑分组' : '新建分组'}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">分组名称</label>
                  <input
                    type="text"
                    placeholder="输入分组名称..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="input-field w-full"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1">分组颜色</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_GROUP_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGroupColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
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
                  <label className="block text-xs text-white/40 mb-1">
                    描述（可选）
                  </label>
                  <textarea
                    placeholder="输入分组描述..."
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="input-field w-full resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    if (editingGroupId && confirm('确定要删除这个分组吗？分组内的方案将变为未分组。')) {
                      deletePresetGroup(editingGroupId);
                      setShowGroupDialog(false);
                    } else if (!editingGroupId) {
                      setShowGroupDialog(false);
                    }
                  }}
                  className={`flex-1 btn-secondary ${
                    editingGroupId ? 'text-red-400 hover:bg-red-500/20 hover:border-red-500/50' : ''
                  }`}
                >
                  {editingGroupId ? '删除分组' : '取消'}
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingGroupId ? '保存修改' : '创建分组'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
