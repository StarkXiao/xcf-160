import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Lightbulb,
  Palette,
  Sparkles,
  Plus,
  Play,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Filter,
  Eye,
  User,
  Image,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { THEME_COLLECTION_CATEGORIES } from '../../types';
import { LightingTemplatePanel } from '../LightingTemplatePanel/LightingTemplatePanel';
import { MaterialComboPanel } from '../MaterialComboPanel/MaterialComboPanel';
import { SceneRecommendationPanel } from '../SceneRecommendationPanel/SceneRecommendationPanel';
import { PresetMarket } from '../PresetMarket/PresetMarket';

export const ThemeLibrary: React.FC = () => {
  const {
    themeCollections,
    selectedThemeCollectionId,
    themeLibraryTab,
    setThemeLibraryTab,
    artworks,
    lightingTemplates,
    materialCombos,
    sceneRecommendations,
    createThemeCollection,
    updateThemeCollection,
    deleteThemeCollection,
    applyThemeCollection,
    selectThemeCollection,
    exportThemeCollection,
    getFilteredThemeCollections,
    addArtworksToThemeCollection,
    removeArtworksFromThemeCollection,
    selectedArtworkIds,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState({
    name: '',
    subtitle: '',
    description: '',
    themeColor: '#d4af37',
    category: 'fine_art',
    curator: '',
  });
  const [editData, setEditData] = useState({
    name: '',
    subtitle: '',
    description: '',
    themeColor: '#d4af37',
    category: '',
    curator: '',
  });

  const filteredCollections = getFilteredThemeCollections(categoryFilter, searchQuery);
  const selectedCollection = themeCollections.find((c) => c.id === selectedThemeCollectionId);

  const tabs = [
    { id: 'collections', label: '主题馆藏', icon: Layers },
    { id: 'lighting', label: '灯光模板', icon: Lightbulb },
    { id: 'materials', label: '材质组合', icon: Palette },
    { id: 'scenes', label: '场景推荐', icon: Sparkles },
    { id: 'presetMarket', label: '预设市场', icon: Store },
  ] as const;

  const handleCreate = () => {
    if (!newCollection.name.trim()) return;
    createThemeCollection({
      name: newCollection.name,
      subtitle: newCollection.subtitle,
      description: newCollection.description,
      themeColor: newCollection.themeColor,
      category: newCollection.category,
      curator: newCollection.curator,
      tags: [],
      artworkIds: Array.from(selectedArtworkIds),
      lightingTemplateIds: [],
      materialComboIds: [],
      sceneRecommendationIds: [],
      projectIds: [],
      isPublic: true,
    });
    setNewCollection({
      name: '',
      subtitle: '',
      description: '',
      themeColor: '#d4af37',
      category: 'fine_art',
      curator: '',
    });
    setIsCreating(false);
  };

  const handleCreateFromSelected = () => {
    if (selectedArtworkIds.size === 0) {
      alert('请先在馆藏中选择至少一件作品');
      return;
    }
    const name = prompt('请输入主题馆藏名称：', `我的主题馆藏 ${new Date().toLocaleDateString()}`);
    if (name) {
      createThemeCollection({
        name,
        description: `包含 ${selectedArtworkIds.size} 件精选作品的主题馆藏`,
        themeColor: '#d4af37',
        category: 'fine_art',
        curator: '',
        tags: [],
        artworkIds: Array.from(selectedArtworkIds),
        lightingTemplateIds: [],
        materialComboIds: [],
        sceneRecommendationIds: [],
        projectIds: [],
        isPublic: true,
      });
    }
  };

  const handleStartEdit = (collection: typeof themeCollections[0]) => {
    setEditingId(collection.id);
    setEditData({
      name: collection.name,
      subtitle: collection.subtitle || '',
      description: collection.description,
      themeColor: collection.themeColor,
      category: collection.category,
      curator: collection.curator,
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editData.name.trim()) return;
    updateThemeCollection(editingId, {
      name: editData.name,
      subtitle: editData.subtitle,
      description: editData.description,
      themeColor: editData.themeColor,
      category: editData.category,
      curator: editData.curator,
    });
    setEditingId(null);
  };

  const getCategoryLabel = (categoryId: string) => {
    return THEME_COLLECTION_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCoverArtwork = (collection: typeof themeCollections[0]) => {
    if (collection.coverArtworkId) {
      return artworks.find((a) => a.id === collection.coverArtworkId);
    }
    if (collection.artworkIds.length > 0) {
      return artworks.find((a) => a.id === collection.artworkIds[0]);
    }
    return null;
  };

  const getCollectionAssets = (collection: typeof themeCollections[0]) => {
    const collectionLighting = lightingTemplates.filter((t) =>
      collection.lightingTemplateIds.includes(t.id)
    );
    const collectionMaterials = materialCombos.filter((c) =>
      collection.materialComboIds.includes(c.id)
    );
    const collectionScenes = sceneRecommendations.filter((s) =>
      collection.sceneRecommendationIds.includes(s.id)
    );
    const collectionArtworks = artworks.filter((a) =>
      collection.artworkIds.includes(a.id)
    );

    return {
      artworks: collectionArtworks,
      lighting: collectionLighting,
      materials: collectionMaterials,
      scenes: collectionScenes,
      artworkCount: collectionArtworks.length,
      lightingCount: collectionLighting.length,
      materialCount: collectionMaterials.length,
      sceneCount: collectionScenes.length,
    };
  };

  if (themeLibraryTab === 'lighting') {
    return <LightingTemplatePanel />;
  }
  if (themeLibraryTab === 'materials') {
    return <MaterialComboPanel />;
  }
  if (themeLibraryTab === 'scenes') {
    return <SceneRecommendationPanel />;
  }
  if (themeLibraryTab === 'presetMarket') {
    return <PresetMarket />;
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
          主题馆藏库
        </h3>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-gallery-bg rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = themeLibraryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setThemeLibraryTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gold text-gallery-bg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
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
            placeholder="搜索主题馆藏..."
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
            {THEME_COLLECTION_CATEGORIES.map((cat) => (
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
          新建馆藏
        </button>
        <button
          onClick={handleCreateFromSelected}
          disabled={selectedArtworkIds.size === 0}
          className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Image className="w-4 h-4" />
          从选中作品创建
          {selectedArtworkIds.size > 0 && (
            <span className="px-1.5 py-0.5 bg-gold text-gallery-bg rounded text-xs">
              {selectedArtworkIds.size}
            </span>
          )}
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
              <h4 className="text-sm font-medium text-gold mb-3">创建新主题馆藏</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="馆藏名称"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="副标题（可选）"
                  value={newCollection.subtitle}
                  onChange={(e) => setNewCollection({ ...newCollection, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <textarea
                  placeholder="馆藏描述"
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">主题色</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newCollection.themeColor}
                        onChange={(e) => setNewCollection({ ...newCollection, themeColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={newCollection.themeColor}
                        onChange={(e) => setNewCollection({ ...newCollection, themeColor: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:border-gold/50 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">分类</label>
                    <select
                      value={newCollection.category}
                      onChange={(e) => setNewCollection({ ...newCollection, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:border-gold/50 focus:outline-none cursor-pointer"
                    >
                      {THEME_COLLECTION_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="策展人（可选）"
                  value={newCollection.curator}
                  onChange={(e) => setNewCollection({ ...newCollection, curator: e.target.value })}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
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
        {filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无主题馆藏</p>
            <p className="text-sm text-white/40">点击上方按钮创建您的第一个主题馆藏</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCollections.map((collection) => {
              const isSelected = selectedThemeCollectionId === collection.id;
              const isEditing = editingId === collection.id;
              const coverArtwork = getCoverArtwork(collection);
              const assets = getCollectionAssets(collection);
              const isActiveCollection = selectedThemeCollectionId === collection.id;

              return (
                <motion.div
                  key={collection.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''} ${isActiveCollection ? 'ring-2 ring-gold/50' : ''}`}
                  onClick={() => selectThemeCollection(isSelected ? null : collection.id)}
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
                        <input
                          type="text"
                          value={editData.subtitle}
                          onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none resize-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">主题色</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={editData.themeColor}
                                onChange={(e) => setEditData({ ...editData, themeColor: e.target.value })}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="text"
                                value={editData.themeColor}
                                onChange={(e) => setEditData({ ...editData, themeColor: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none font-mono"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-white/40 mb-1 block">分类</label>
                            <select
                              value={editData.category}
                              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                              className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm focus:outline-none cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {THEME_COLLECTION_CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={editData.curator}
                          onChange={(e) => setEditData({ ...editData, curator: e.target.value })}
                          placeholder="策展人"
                          className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
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
                        <div className="flex items-start gap-3 mb-3">
                          {coverArtwork ? (
                            <div
                              className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                              style={{
                                backgroundImage: `url(${coverArtwork.imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                boxShadow: `0 0 0 2px ${collection.themeColor}40`,
                              }}
                            />
                          ) : (
                            <div
                              className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: collection.themeColor + '30' }}
                            >
                              <Image className="w-8 h-8" style={{ color: collection.themeColor }} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white text-sm truncate">
                                {collection.name}
                              </h4>
                              {collection.subtitle && (
                                <span className="text-xs text-white/40 truncate">
                                  · {collection.subtitle}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/40 line-clamp-2 mb-2">
                              {collection.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: collection.themeColor + '20',
                                  color: collection.themeColor,
                                }}
                              >
                                {getCategoryLabel(collection.category)}
                              </span>
                              {collection.curator && (
                                <span className="text-xs text-white/40 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {collection.curator}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="text-center p-2 bg-white/5 rounded-lg">
                            <div className="text-sm font-display font-bold text-white">
                              {assets.artworkCount}
                            </div>
                            <div className="text-xs text-white/40">作品</div>
                          </div>
                          <div
                            className="text-center p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: collection.themeColor + '10' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectThemeCollection(collection.id);
                              setThemeLibraryTab('lighting');
                            }}
                          >
                            <div className="text-sm font-display font-bold" style={{ color: collection.themeColor }}>
                              {assets.lightingCount}
                            </div>
                            <div className="text-xs text-white/40">灯光</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectThemeCollection(collection.id);
                              setThemeLibraryTab('materials');
                            }}
                          >
                            <div className="text-sm font-display font-bold text-white">
                              {assets.materialCount}
                            </div>
                            <div className="text-xs text-white/40">材质</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectThemeCollection(collection.id);
                              setThemeLibraryTab('scenes');
                            }}
                          >
                            <div className="text-sm font-display font-bold text-white">
                              {assets.sceneCount}
                            </div>
                            <div className="text-xs text-white/40">场景</div>
                          </div>
                        </div>

                        {collection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {collection.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {collection.tags.length > 4 && (
                              <span className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded">
                                +{collection.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {isSelected && (
                          <div className="mb-3 p-3 rounded-lg bg-white/5 border border-gallery-border">
                            <h5 className="text-xs font-medium text-white/70 mb-2 flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              关联资产详情
                            </h5>
                            
                            {assets.lightingCount > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-gold mb-1">灯光模板 ({assets.lightingCount})</div>
                                <div className="flex flex-wrap gap-1">
                                  {assets.lighting.slice(0, 3).map((t) => (
                                    <span
                                      key={t.id}
                                      className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded cursor-pointer hover:bg-gold/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectThemeCollection(collection.id);
                                        setThemeLibraryTab('lighting');
                                      }}
                                    >
                                      {t.name}
                                    </span>
                                  ))}
                                  {assets.lightingCount > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-white/5 text-white/40 rounded">
                                      +{assets.lightingCount - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {assets.materialCount > 0 && (
                              <div className="mb-2">
                                <div className="text-xs text-gold mb-1">材质组合 ({assets.materialCount})</div>
                                <div className="flex flex-wrap gap-1">
                                  {assets.materials.slice(0, 3).map((m) => (
                                    <span
                                      key={m.id}
                                      className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded cursor-pointer hover:bg-gold/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectThemeCollection(collection.id);
                                        setThemeLibraryTab('materials');
                                      }}
                                    >
                                      {m.name}
                                    </span>
                                  ))}
                                  {assets.materialCount > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-white/5 text-white/40 rounded">
                                      +{assets.materialCount - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {assets.sceneCount > 0 && (
                              <div>
                                <div className="text-xs text-gold mb-1">场景推荐 ({assets.sceneCount})</div>
                                <div className="flex flex-wrap gap-1">
                                  {assets.scenes.slice(0, 3).map((s) => (
                                    <span
                                      key={s.id}
                                      className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded cursor-pointer hover:bg-gold/20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        selectThemeCollection(collection.id);
                                        setThemeLibraryTab('scenes');
                                      }}
                                    >
                                      {s.name}
                                    </span>
                                  ))}
                                  {assets.sceneCount > 3 && (
                                    <span className="text-xs px-2 py-0.5 bg-white/5 text-white/40 rounded">
                                      +{assets.sceneCount - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {assets.lightingCount === 0 && assets.materialCount === 0 && assets.sceneCount === 0 && (
                              <div className="text-xs text-white/40 text-center py-2">
                                暂无关联资产，点击下方标签页添加灯光、材质或场景
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {collection.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {collection.useCount} 次使用
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {!isActiveCollection ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectThemeCollection(collection.id);
                                }}
                                className="btn-secondary text-xs py-1.5 px-2 flex items-center gap-1"
                                title="选为当前馆藏，可在子库中添加资产"
                              >
                                <Check className="w-3 h-3" />
                                选为当前
                              </button>
                            ) : (
                              <span className="text-xs px-2 py-1.5 bg-gold/20 text-gold rounded flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                当前馆藏
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const applyItems = [];
                                if (assets.artworkCount > 0) applyItems.push(`${assets.artworkCount}件作品`);
                                if (assets.lightingCount > 0) applyItems.push(`${assets.lightingCount}个灯光模板`);
                                if (assets.materialCount > 0) applyItems.push(`${assets.materialCount}个材质组合`);
                                if (assets.sceneCount > 0) applyItems.push(`${assets.sceneCount}个场景方案`);
                                const confirmMsg = applyItems.length > 0 
                                  ? `应用此馆藏将同时应用：\n${applyItems.join('\n')}\n\n是否继续？`
                                  : '确定要应用此馆藏吗？';
                                if (confirm(confirmMsg)) {
                                  applyThemeCollection(collection.id);
                                }
                              }}
                              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              应用馆藏
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(collection);
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportThemeCollection(collection.id);
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            导出
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个主题馆藏吗？')) {
                                deleteThemeCollection(collection.id);
                              }
                            }}
                            className="btn-secondary text-xs py-1.5 flex items-center justify-center gap-1 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
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
    </motion.div>
  );
};
