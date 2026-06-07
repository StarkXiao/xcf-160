import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Search,
  Filter,
  ArrowUpDown,
  Heart,
  Copy,
  Play,
  Edit2,
  Lightbulb,
  Palette,
  Award,
  User,
  Eye,
  Check,
  X,
  Bookmark,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  PRESET_MARKET_TABS,
  PRESET_MARKET_CATEGORIES,
  PRESET_SORT_TYPES,
  LIGHTING_TEMPLATE_CATEGORIES,
  MATERIAL_COMBO_CATEGORIES,
  LIGHT_TYPE_LABELS,
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  type LightingTemplate,
  type MaterialCombo,
} from '../../types';
import { kelvinToHex } from '../../utils/color';

export const PresetMarket: React.FC = () => {
  const {
    presetMarketTab,
    presetMarketCategory,
    presetMarketSort,
    favoriteLightingTemplateIds,
    favoriteMaterialComboIds,
    setPresetMarketTab,
    setPresetMarketCategory,
    setPresetMarketSort,
    getPresetMarketItems,
    toggleLightingTemplateFavorite,
    toggleMaterialComboFavorite,
    duplicateLightingTemplate,
    duplicateMaterialCombo,
    applyLightingTemplate,
    applyMaterialCombo,
    setThemeLibraryTab,
    selectLightingTemplate,
    selectMaterialCombo,
    selectedLightingTemplateId,
    selectedMaterialComboId,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const items = useMemo(() => {
    return getPresetMarketItems(
      presetMarketTab,
      presetMarketCategory,
      presetMarketSort,
      searchQuery,
      categoryFilter
    );
  }, [presetMarketTab, presetMarketCategory, presetMarketSort, searchQuery, categoryFilter, getPresetMarketItems]);

  const availableCategories = useMemo(() => {
    if (presetMarketCategory === 'lighting') {
      return [{ id: 'all', label: '全部分类' }, ...LIGHTING_TEMPLATE_CATEGORIES];
    }
    if (presetMarketCategory === 'material') {
      return [{ id: 'all', label: '全部分类' }, ...MATERIAL_COMBO_CATEGORIES];
    }
    return [
      { id: 'all', label: '全部分类' },
      ...LIGHTING_TEMPLATE_CATEGORIES.map(c => ({ ...c, label: `灯光: ${c.label}` })),
      ...MATERIAL_COMBO_CATEGORIES.map(c => ({ ...c, label: `材质: ${c.label}` })),
    ];
  }, [presetMarketCategory]);

  const handleToggleFavorite = (type: 'lighting' | 'material', id: string, name?: string) => {
    if (type === 'lighting') {
      toggleLightingTemplateFavorite(id);
    } else {
      toggleMaterialComboFavorite(id, name || '材质组合');
    }
  };

  const handleDuplicate = (type: 'lighting' | 'material', id: string, newName: string) => {
    if (!newName.trim()) return;
    if (type === 'lighting') {
      const newTemplate = duplicateLightingTemplate(id, newName.trim());
      selectLightingTemplate(newTemplate.id);
    } else {
      const newCombo = duplicateMaterialCombo(id, newName.trim());
      selectMaterialCombo(newCombo.id);
    }
  };

  const handleApply = (type: 'lighting' | 'material', id: string) => {
    if (type === 'lighting') {
      applyLightingTemplate(id);
    } else {
      applyMaterialCombo(id);
    }
  };

  const handleStartEdit = (name: string, id: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const isFavorite = (type: 'lighting' | 'material', id: string) => {
    return type === 'lighting'
      ? favoriteLightingTemplateIds.includes(id)
      : favoriteMaterialComboIds.includes(id);
  };

  const getCategoryLabel = (type: 'lighting' | 'material', categoryId: string) => {
    const categories = type === 'lighting' ? LIGHTING_TEMPLATE_CATEGORIES : MATERIAL_COMBO_CATEGORIES;
    return categories.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const renderLightingPreview = (template: LightingTemplate) => {
    const lightColor = kelvinToHex(template.lighting.colorTemperature);
    return (
      <div className="flex gap-1 ml-3">
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0"
          style={{
            backgroundColor: lightColor,
            boxShadow: `0 0 15px ${lightColor}40`,
          }}
        />
      </div>
    );
  };

  const renderMaterialPreview = (combo: MaterialCombo) => {
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
    return (
      <div className="flex gap-1 ml-3">
        <div
          className="w-6 h-6 rounded border-2 border-white/20 flex-shrink-0"
          style={{
            backgroundColor: frameColors[combo.material.frameMaterial] || '#d4af37',
            borderColor: combo.material.frameMaterial === 'none' ? 'transparent' : undefined,
          }}
        />
        <div
          className="w-6 h-6 rounded flex-shrink-0"
          style={{ backgroundColor: wallColors[combo.material.wallMaterial] || '#2a2a2a' }}
        />
      </div>
    );
  };

  const renderItemDetails = (type: 'lighting' | 'material', data: LightingTemplate | MaterialCombo) => {
    if (type === 'lighting') {
      const template = data as LightingTemplate;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-3">
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: kelvinToHex(template.lighting.colorTemperature) }}
            />
            <span>{template.lighting.colorTemperature}K</span>
          </div>
          <div>{LIGHT_TYPE_LABELS[template.lighting.type]}</div>
          <div>亮度 {Math.round(template.lighting.intensity * 100)}%</div>
          <div>角度 {template.lighting.angle}°</div>
        </div>
      );
    }
    const combo = data as MaterialCombo;
    return (
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
    );
  };

  const getSelectedId = (type: 'lighting' | 'material') => {
    return type === 'lighting' ? selectedLightingTemplateId : selectedMaterialComboId;
  };

  const handleSelect = (type: 'lighting' | 'material', id: string) => {
    const currentSelected = getSelectedId(type);
    if (type === 'lighting') {
      selectLightingTemplate(currentSelected === id ? null : id);
    } else {
      selectMaterialCombo(currentSelected === id ? null : id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Store className="w-5 h-5 text-gold" />
          预设模板市场
        </h3>
        <button
          onClick={() => setThemeLibraryTab('collections')}
          className="text-xs text-white/40 hover:text-gold transition-colors"
        >
          ← 返回主题库
        </button>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-gallery-bg rounded-lg">
        {PRESET_MARKET_TABS.map((tab) => {
          const isActive = presetMarketTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setPresetMarketTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gold text-gallery-bg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.id === 'official' && <Award className="w-4 h-4" />}
              {tab.id === 'favorites' && <Heart className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm appearance-none focus:border-gold/50 focus:outline-none cursor-pointer"
          >
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg flex-1">
          {PRESET_MARKET_CATEGORIES.map((cat) => {
            const isActive = presetMarketCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setPresetMarketCategory(cat.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.id === 'lighting' && <Lightbulb className="w-3.5 h-3.5" />}
                {cat.id === 'material' && <Palette className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={presetMarketSort}
            onChange={(e) => setPresetMarketSort(e.target.value as typeof presetMarketSort)}
            className="pl-10 pr-8 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm appearance-none focus:border-gold/50 focus:outline-none cursor-pointer"
          >
            {PRESET_SORT_TYPES.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无模板</p>
            <p className="text-sm text-white/40">
              {presetMarketTab === 'favorites'
                ? '您还没有收藏任何模板，点击模板卡片上的心形图标添加收藏'
                : '尝试调整筛选条件或搜索关键词'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const { type, data } = item;
              const isSelected = getSelectedId(type) === data.id;
              const isEditing = editingId === `${type}-${data.id}`;
              const isFav = isFavorite(type, data.id);

              return (
                <motion.div
                  key={`${type}-${data.id}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`card cursor-pointer ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''}`}
                  onClick={() => handleSelect(type, data.id)}
                >
                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gold/50 rounded-lg text-white text-sm focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(type, data.id, editName);
                              handleCancelEdit();
                            }}
                            className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            确认复制
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
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
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div
                              className={`p-1.5 rounded-lg flex-shrink-0 ${
                                type === 'lighting'
                                  ? 'text-amber-400 bg-amber-400/10'
                                  : 'text-purple-400 bg-purple-400/10'
                              }`}
                            >
                              {type === 'lighting' ? (
                                <Lightbulb className="w-4 h-4" />
                              ) : (
                                <Palette className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium text-white text-sm truncate">
                                  {data.name}
                                </h4>
                                {data.isOfficial && (
                                  <span className="text-xs px-1.5 py-0.5 bg-gold/20 text-gold rounded flex items-center gap-1 flex-shrink-0">
                                    <Award className="w-3 h-3" />
                                    官方
                                  </span>
                                )}
                                {!data.isOfficial && (
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded flex items-center gap-1 flex-shrink-0">
                                    <User className="w-3 h-3" />
                                    个人
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40 line-clamp-1">
                                {data.description}
                              </p>
                            </div>
                          </div>
                          {type === 'lighting'
                            ? renderLightingPreview(data as LightingTemplate)
                            : renderMaterialPreview(data as MaterialCombo)}
                        </div>

                        {renderItemDetails(type, data)}

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded">
                            {getCategoryLabel(type, data.category)}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {data.useCount}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(type, data.id, data.name);
                              }}
                              className={`flex items-center gap-1 transition-colors ${
                                isFav ? 'text-red-400' : 'hover:text-red-400'
                              }`}
                              title={isFav ? '取消收藏' : '添加收藏'}
                            >
                              <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                              {isFav ? '已收藏' : '收藏'}
                            </button>
                          </div>
                        </div>

                        {data.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {data.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {data.tags.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded">
                                +{data.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(type, data.id);
                            }}
                            className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            应用
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(data.name, `${type}-${data.id}`);
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                            title="复制并编辑"
                          >
                            <Copy className="w-3 h-3" />
                            复制
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (type === 'lighting') {
                                setThemeLibraryTab('lighting');
                                selectLightingTemplate(data.id);
                              } else {
                                setThemeLibraryTab('materials');
                                selectMaterialCombo(data.id);
                              }
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                            title="前往编辑"
                          >
                            <Edit2 className="w-3 h-3" />
                            编辑
                          </button>
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

      <div className="pt-3 border-t border-gallery-border">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>共 {items.length} 个模板</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-gold" />
              官方模板
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-blue-400" />
              个人模板
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-red-400" />
              我的收藏
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
