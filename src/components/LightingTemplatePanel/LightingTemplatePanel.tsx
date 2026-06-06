import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Plus, Play, Download, Trash2, Edit2, Check, X, Search, Filter, Save, Eye, Layers, BookmarkMinus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { kelvinToHex } from '../../utils/color';
import { LIGHT_TYPE_LABELS, LIGHTING_TEMPLATE_CATEGORIES } from '../../types';

export const LightingTemplatePanel: React.FC = () => {
  const {
    lightingTemplates,
    selectedLightingTemplateId,
    lighting,
    selectedWallArtworkIds,
    themeCollections,
    selectedThemeCollectionId,
    createLightingTemplate,
    updateLightingTemplate,
    deleteLightingTemplate,
    applyLightingTemplate,
    applyLightingTemplateToSelectedWallArtworks,
    saveCurrentLightingAsTemplate,
    selectLightingTemplate,
    exportLightingTemplate,
    getFilteredLightingTemplates,
    setThemeLibraryTab,
    addLightingTemplateToThemeCollection,
    removeLightingTemplateFromThemeCollection,
    selectThemeCollection,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', category: 'contemporary' });
  const [editData, setEditData] = useState({ name: '', description: '', category: '' });

  const filteredTemplates = getFilteredLightingTemplates(categoryFilter, searchQuery);
  const selectedTemplate = lightingTemplates.find((t) => t.id === selectedLightingTemplateId);

  const handleCreate = () => {
    if (!newTemplate.name.trim()) return;
    createLightingTemplate({
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      tags: [],
      lighting: { ...lighting },
      artworkIds: [],
      isPublic: true,
    });
    setNewTemplate({ name: '', description: '', category: 'contemporary' });
    setIsCreating(false);
  };

  const handleSaveCurrentAsTemplate = () => {
    const name = prompt('请输入模板名称：', `我的灯光模板 ${new Date().toLocaleDateString()}`);
    if (name) {
      saveCurrentLightingAsTemplate(name);
    }
  };

  const handleStartEdit = (template: typeof lightingTemplates[0]) => {
    setEditingId(template.id);
    setEditData({
      name: template.name,
      description: template.description || '',
      category: template.category,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editData.name.trim()) return;
    updateLightingTemplate(editingId, {
      name: editData.name,
      description: editData.description,
      category: editData.category,
    });
    setEditingId(null);
  };

  const handleApplyToCurrent = (templateId: string) => {
    applyLightingTemplate(templateId);
  };

  const handleApplyToSelected = (templateId: string) => {
    applyLightingTemplateToSelectedWallArtworks(templateId);
  };

  const getCategoryLabel = (categoryId: string) => {
    return LIGHTING_TEMPLATE_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" />
          灯光模板库
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
            placeholder="搜索灯光模板..."
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
            {LIGHTING_TEMPLATE_CATEGORIES.map((cat) => (
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
          新建模板
        </button>
        <button
          onClick={handleSaveCurrentAsTemplate}
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
              <h4 className="text-sm font-medium text-gold mb-3">创建新模板</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="模板名称"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <textarea
                  placeholder="模板描述（可选）"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none resize-none"
                />
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:border-gold/50 focus:outline-none cursor-pointer"
                >
                  {LIGHTING_TEMPLATE_CATEGORIES.map((cat) => (
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

      {selectedThemeCollectionId && (
        <div className="mb-4 p-3 rounded-lg border border-gold/30 bg-gold/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              <span className="text-xs text-gold">
                当前馆藏：{themeCollections.find((c) => c.id === selectedThemeCollectionId)?.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectThemeCollection(null);
              }}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              取消选择
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Lightbulb className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无灯光模板</p>
            <p className="text-sm text-white/40">点击上方按钮创建或保存灯光配置为模板</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
              const lightColor = kelvinToHex(template.lighting.colorTemperature);
              const isSelected = selectedLightingTemplateId === template.id;
              const isEditing = editingId === template.id;
              const currentCollection = themeCollections.find((c) => c.id === selectedThemeCollectionId);
              const isInCollection = currentCollection?.lightingTemplateIds.includes(template.id);

              return (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''} ${isInCollection ? 'ring-2 ring-gold/30' : ''}`}
                  onClick={() => selectLightingTemplate(isSelected ? null : template.id)}
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
                          {LIGHTING_TEMPLATE_CATEGORIES.map((cat) => (
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
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white text-sm">{template.name}</h4>
                              {isInCollection && (
                                <span className="text-xs px-1.5 py-0.5 bg-gold/20 text-gold rounded flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  已入馆藏
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/40 line-clamp-2">{template.description}</p>
                          </div>
                          <div
                            className="w-10 h-10 rounded-lg ml-3 flex-shrink-0"
                            style={{
                              backgroundColor: lightColor,
                              boxShadow: `0 0 20px ${lightColor}40`,
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-3">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: lightColor }}
                            />
                            <span>{template.lighting.colorTemperature}K</span>
                          </div>
                          <div>{LIGHT_TYPE_LABELS[template.lighting.type]}</div>
                          <div>亮度 {Math.round(template.lighting.intensity * 100)}%</div>
                          <div>角度 {template.lighting.angle}°</div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded">
                            {getCategoryLabel(template.category)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-white/40">
                            <Eye className="w-3 h-3" />
                            <span>使用 {template.useCount} 次</span>
                          </div>
                        </div>

                        {template.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {selectedThemeCollectionId && (
                          <div className="mb-3 p-2 rounded-lg bg-white/5 border border-gallery-border">
                            {isInCollection ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLightingTemplateFromThemeCollection(selectedThemeCollectionId, template.id);
                                }}
                                className="w-full text-xs py-1.5 text-red-400 hover:text-red-300 flex items-center justify-center gap-1"
                              >
                                <BookmarkMinus className="w-3 h-3" />
                                从馆藏移除
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addLightingTemplateToThemeCollection(selectedThemeCollectionId, template.id);
                                }}
                                className="w-full text-xs py-1.5 text-gold hover:text-gold/80 flex items-center justify-center gap-1"
                              >
                                <Layers className="w-3 h-3" />
                                加入馆藏
                              </button>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyToCurrent(template.id);
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
                                handleApplyToSelected(template.id);
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
                              handleStartEdit(template);
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
                                exportLightingTemplate(template.id);
                              }}
                              className="btn-secondary text-xs py-1.5 px-2 flex items-center justify-center"
                              title="导出"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('确定要删除这个灯光模板吗？')) {
                                  deleteLightingTemplate(template.id);
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
              已选择 {selectedWallArtworkIds.length} 件墙面作品，可使用"批量"应用灯光模板
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
