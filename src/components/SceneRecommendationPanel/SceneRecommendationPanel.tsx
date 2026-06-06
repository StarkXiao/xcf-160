import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Lightbulb, Palette, Grid3X3, User, Users, BookOpen, Clock, Award, Check, X, RefreshCw, Layers, BookmarkMinus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SCENE_TYPE_LABELS, SCENE_RECOMMENDATION_CATEGORIES } from '../../types';

export const SceneRecommendationPanel: React.FC = () => {
  const {
    sceneRecommendations,
    selectedSceneRecommendationId,
    selectedArtworkIds,
    artworks,
    themeCollections,
    selectedThemeCollectionId,
    createSceneRecommendation,
    applySceneRecommendation,
    selectSceneRecommendation,
    generateSceneRecommendations,
    deleteSceneRecommendation,
    getSceneRecommendationsByArtwork,
    setThemeLibraryTab,
    lightingTemplates,
    materialCombos,
    addSceneRecommendationToThemeCollection,
    removeSceneRecommendationFromThemeCollection,
    selectThemeCollection,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const selectedArtworks = artworks.filter((a) => selectedArtworkIds.has(a.id));
  const recommendations = selectedArtworkIds.size > 0
    ? getSceneRecommendationsByArtwork(Array.from(selectedArtworkIds)[0])
    : sceneRecommendations;

  const handleGenerateRecommendations = async () => {
    if (selectedArtworkIds.size === 0) {
      alert('请先在馆藏中选择至少一件作品');
      return;
    }
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    generateSceneRecommendations(Array.from(selectedArtworkIds));
    setIsGenerating(false);
  };

  const getSceneTypeIcon = (sceneType: string) => {
    switch (sceneType) {
      case 'solo_exhibition':
        return <User className="w-4 h-4" />;
      case 'group_exhibition':
        return <Users className="w-4 h-4" />;
      case 'thematic_exhibition':
        return <BookOpen className="w-4 h-4" />;
      case 'retrospective':
        return <Clock className="w-4 h-4" />;
      case 'permanent':
        return <Award className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSceneTypeColor = (sceneType: string) => {
    switch (sceneType) {
      case 'solo_exhibition':
        return 'text-blue-400 bg-blue-400/10';
      case 'group_exhibition':
        return 'text-green-400 bg-green-400/10';
      case 'thematic_exhibition':
        return 'text-purple-400 bg-purple-400/10';
      case 'retrospective':
        return 'text-orange-400 bg-orange-400/10';
      case 'permanent':
        return 'text-gold bg-gold/10';
      default:
        return 'text-white/60 bg-white/5';
    }
  };

  const getSuggestedLighting = (templateId?: string) => {
    if (!templateId) return null;
    return lightingTemplates.find((t) => t.id === templateId);
  };

  const getSuggestedMaterial = (comboId?: string) => {
    if (!comboId) return null;
    return materialCombos.find((c) => c.id === comboId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          场景推荐
        </h3>
        <button
          onClick={() => setThemeLibraryTab('collections')}
          className="text-xs text-white/40 hover:text-gold transition-colors"
        >
          ← 返回主题库
        </button>
      </div>

      <div className="card mb-4 border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-medium text-gold mb-1">AI 智能策展</h4>
              <p className="text-xs text-white/50">
                基于选中的 {selectedArtworks.length} 件作品，智能生成展览场景方案
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating || selectedArtworkIds.size === 0}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成推荐
                </>
              )}
            </button>
          </div>
          {selectedArtworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedArtworks.slice(0, 5).map((artwork) => (
                <span
                  key={artwork.id}
                  className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded"
                >
                  {artwork.title}
                </span>
              ))}
              {selectedArtworks.length > 5 && (
                <span className="text-xs px-2 py-1 bg-white/10 text-white/70 rounded">
                  +{selectedArtworks.length - 5} 件
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {SCENE_RECOMMENDATION_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className={`flex-1 p-2 rounded-lg border border-gallery-border text-center ${getSceneTypeColor(cat.id)}`}
          >
            <div className="flex items-center justify-center gap-1 text-xs">
              {getSceneTypeIcon(cat.id)}
              <span>{cat.label}</span>
            </div>
          </div>
        ))}
      </div>

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
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无场景推荐</p>
            <p className="text-sm text-white/40 mb-4">
              选择作品后点击"生成推荐"按钮获取AI策展方案
            </p>
            <button
              onClick={handleGenerateRecommendations}
              disabled={selectedArtworkIds.size === 0}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              生成我的第一个推荐
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {recommendations.map((recommendation) => {
              const isSelected = selectedSceneRecommendationId === recommendation.id;
              const suggestedLighting = getSuggestedLighting(recommendation.suggestedLightingTemplateId);
              const suggestedMaterial = getSuggestedMaterial(recommendation.suggestedMaterialComboId);
              const currentCollection = themeCollections.find((c) => c.id === selectedThemeCollectionId);
              const isInCollection = currentCollection?.sceneRecommendationIds.includes(recommendation.id);

              return (
                <motion.div
                  key={recommendation.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`card ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''} ${isInCollection ? 'ring-2 ring-gold/30' : ''}`}
                  onClick={() => selectSceneRecommendation(isSelected ? null : recommendation.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${getSceneTypeColor(recommendation.sceneType)}`}>
                            {getSceneTypeIcon(recommendation.sceneType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white text-sm">{recommendation.name}</h4>
                              {isInCollection && (
                                <span className="text-xs px-1.5 py-0.5 bg-gold/20 text-gold rounded flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  已入馆藏
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-white/40">
                              {SCENE_TYPE_LABELS[recommendation.sceneType]}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-white/50 line-clamp-2">{recommendation.description}</p>
                      </div>
                      {recommendation.matchScore && (
                        <div className="text-right ml-3">
                          <div className="text-lg font-display font-bold text-gold">
                            {Math.round(recommendation.matchScore * 100)}%
                          </div>
                          <div className="text-xs text-white/40">匹配度</div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {suggestedLighting && (
                        <div
                          className="p-2 rounded-lg bg-white/5 border border-gallery-border cursor-pointer hover:border-gold/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setThemeLibraryTab('lighting');
                          }}
                        >
                          <div className="flex items-center gap-1 text-xs text-white/40 mb-1">
                            <Lightbulb className="w-3 h-3" />
                            推荐灯光
                          </div>
                          <div className="text-xs text-white/80 font-medium truncate">
                            {suggestedLighting.name}
                          </div>
                        </div>
                      )}
                      {suggestedMaterial && (
                        <div
                          className="p-2 rounded-lg bg-white/5 border border-gallery-border cursor-pointer hover:border-gold/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setThemeLibraryTab('materials');
                          }}
                        >
                          <div className="flex items-center gap-1 text-xs text-white/40 mb-1">
                            <Palette className="w-3 h-3" />
                            推荐材质
                          </div>
                          <div className="text-xs text-white/80 font-medium truncate">
                            {suggestedMaterial.name}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-1 text-xs text-white/40 mb-1">
                        <Grid3X3 className="w-3 h-3" />
                        布局建议
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2">{recommendation.layoutHint}</p>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-1 text-xs text-white/40 mb-1">
                        <User className="w-3 h-3" />
                        策展人笔记
                      </div>
                      <p className="text-xs text-white/60 italic line-clamp-2">
                        "{recommendation.curatorNote}"
                      </p>
                    </div>

                    {recommendation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recommendation.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded"
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
                              removeSceneRecommendationFromThemeCollection(selectedThemeCollectionId, recommendation.id);
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
                              addSceneRecommendationToThemeCollection(selectedThemeCollectionId, recommendation.id);
                            }}
                            className="w-full text-xs py-1.5 text-gold hover:text-gold/80 flex items-center justify-center gap-1"
                          >
                            <Layers className="w-3 h-3" />
                            加入馆藏
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applySceneRecommendation(recommendation.id);
                        }}
                        className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        一键应用方案
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个场景推荐吗？')) {
                            deleteSceneRecommendation(recommendation.id);
                          }
                        }}
                        className="btn-secondary text-xs py-2 px-3 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
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
