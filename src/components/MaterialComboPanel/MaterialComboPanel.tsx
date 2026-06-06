import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, Play, Download, Trash2, Edit2, Check, X, Search, Filter, Save, Eye } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FRAME_MATERIAL_LABELS, WALL_MATERIAL_LABELS, MATERIAL_COMBO_CATEGORIES } from '../../types';

export const MaterialComboPanel: React.FC = () => {
  const {
    materialCombos,
    selectedMaterialComboId,
    material,
    selectedWallArtworkIds,
    createMaterialCombo,
    updateMaterialCombo,
    deleteMaterialCombo,
    applyMaterialCombo,
    applyMaterialComboToSelectedWallArtworks,
    saveCurrentMaterialAsCombo,
    selectMaterialCombo,
    exportMaterialCombo,
    getFilteredMaterialCombos,
    setThemeLibraryTab,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCombo, setNewCombo] = useState({ name: '', description: '', category: 'modern_museum' });
  const [editData, setEditData] = useState({ name: '', description: '', category: '' });

  const filteredCombos = getFilteredMaterialCombos(categoryFilter, searchQuery);

  const handleCreate = () => {
    if (!newCombo.name.trim()) return;
    createMaterialCombo({
      name: newCombo.name,
      description: newCombo.description,
      category: newCombo.category,
      tags: [],
      material: { ...material },
      artworkIds: [],
      isPublic: true,
    });
    setNewCombo({ name: '', description: '', category: 'modern_museum' });
    setIsCreating(false);
  };

  const handleSaveCurrentAsCombo = () => {
    const name = prompt('请输入材质组合名称：', `我的材质组合 ${new Date().toLocaleDateString()}`);
    if (name) {
      saveCurrentMaterialAsCombo(name);
    }
  };

  const handleStartEdit = (combo: typeof materialCombos[0]) => {
    setEditingId(combo.id);
    setEditData({
      name: combo.name,
      description: combo.description || '',
      category: combo.category,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editData.name.trim()) return;
    updateMaterialCombo(editingId, {
      name: editData.name,
      description: editData.description,
      category: editData.category,
    });
    setEditingId(null);
  };

  const getCategoryLabel = (categoryId: string) => {
    return MATERIAL_COMBO_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getMaterialPreviewColor = (combo: typeof materialCombos[0]) => {
    const frameColors: Record<string, string> = {
      wood: '#8B4513',
      metal: '#708090',
      gold: '#d4af37',
      silver: '#C0C0C0',
      none: 'transparent',
    };
    const wallColors: Record<string, string> = {
      matte: '#2a2a2a',
      satin: '#3a3a3a',
      glossy: '#4a4a4a',
      concrete: '#5a5a5a',
    };
    return {
      frame: frameColors[combo.material.frameMaterial] || '#d4af37',
      wall: wallColors[combo.material.wallMaterial] || '#2a2a2a',
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-gold" />
          材质组合库
        </h3>
        <button
          onClick={() => setThemeLibraryTab('collections')}
          className="text-xs text-white/40 hover:text-gold transition-colors"
        >
          ← 返回主题库
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="搜索材质组合..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value || undefined)}
            className="pl-10 pr-8 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm appearance-none focus:border-gold/50 focus:outline-none cursor-pointer"
          >
            <option value="">全部分类</option>
            {MATERIAL_COMBO_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建组合
        </button>
        <button
          onClick={handleSaveCurrentAsCombo}
          className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          保存当前配置
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 bg-gallery-bg border border-gold/30 rounded-lg">
              <h4 className="text-sm font-medium text-gold mb-3">创建新材质组合</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="组合名称"
                  value={newCombo.name}
                  onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <textarea
                  placeholder="组合描述（可选）"
                  value={newCombo.description}
                  onChange={(e) => setNewCombo({ ...newCombo, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none resize-none"
                />
                <select
                  value={newCombo.category}
                  onChange={(e) => setNewCombo({ ...newCombo, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:border-gold/50 focus:outline-none cursor-pointer"
                >
                  {MATERIAL_COMBO_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    创建
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {filteredCombos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Palette className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无材质组合</p>
            <p className="text-sm text-white/40">点击上方按钮创建或保存材质配置为组合</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCombos.map((combo) => {
              const isSelected = selectedMaterialComboId === combo.id;
              const isEditing = editingId === combo.id;
              const previewColors = getMaterialPreviewColor(combo);

              return (
                <motion.div
                  key={combo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''}`}
                  onClick={() => selectMaterialCombo(isSelected ? null : combo.id)}
                >
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gold/50 rounded-lg text-white text-sm focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none resize-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {MATERIAL_COMBO_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            保存
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm mb-1">{combo.name}</h4>
                            <p className="text-xs text-white/40 line-clamp-2">{combo.description}</p>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <div
                              className="w-8 h-8 rounded border-2 border-white/20"
                              style={{
                                backgroundColor: previewColors.frame,
                                borderColor: combo.material.frameMaterial === 'none' ? 'transparent' : undefined,
                              }}
                            />
                            <div
                              className="w-8 h-8 rounded"
                              style={{ backgroundColor: previewColors.wall }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-3">
                          <div className="flex items-center gap-1">
                            <span className="text-white/40">画框：</span>
                            <span>{FRAME_MATERIAL_LABELS[combo.material.frameMaterial]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-white/40">墙面：</span>
                            <span>{WALL_MATERIAL_LABELS[combo.material.wallMaterial]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-white/40">反射：</span>
                            <span>{Math.round(combo.material.reflectivity * 100)}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-white/40">粗糙：</span>
                            <span>{Math.round(combo.material.roughness * 100)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded">
                            {getCategoryLabel(combo.category)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-white/40">
                            <Eye className="w-3 h-3" />
                            <span>使用 {combo.useCount} 次</span>
                          </div>
                        </div>

                        {combo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {combo.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              applyMaterialCombo(combo.id);
                            }}
                            className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                            title="应用到当前"
                          >
                            <Play className="w-3 h-3" />
                            应用
                          </button>
                          {selectedWallArtworkIds.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                applyMaterialComboToSelectedWallArtworks(combo.id);
                              }}
                              className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                              title="应用到选中作品"
                            >
                              <Play className="w-3 h-3" />
                              批量
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(combo);
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                            title="编辑"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportMaterialCombo(combo.id);
                              }}
                              className="btn-secondary text-xs py-1.5 px-2 flex items-center justify-center"
                              title="导出"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('确定要删除这个材质组合吗？')) {
                                  deleteMaterialCombo(combo.id);
                                }
                              }}
                              className="btn-secondary text-xs py-1.5 px-2 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              title="删除"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {selectedWallArtworkIds.length > 0 && (
        <div className="pt-4 border-t border-gallery-border">
          <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
            <p className="text-xs text-gold text-center">
              已选择 {selectedWallArtworkIds.length} 件墙面作品，可使用"批量"应用材质组合
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
