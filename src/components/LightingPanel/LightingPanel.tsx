import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Sun,
  Sparkles,
  RotateCcw,
  Undo2,
  Redo2,
  BookmarkPlus,
  Link,
  Link2Off,
  History,
  Sparkles as SparklesIcon,
  Sliders,
  Bookmark,
  Save,
  Trash2,
  Play,
  Clock,
  AlertTriangle,
  Lightbulb as LightbulbIcon,
  Check,
  X,
  Star,
  StarOff,
  Search,
} from 'lucide-react';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../store/useAppStore';
import { LIGHT_TYPE_LABELS, LIGHTING_PANEL_TABS, LIGHTING_PARAMETER_CONSTRAINTS, LIGHTING_PARAM_LABELS } from '../../types';
import { generateTemperatureGradient } from '../../utils/color';
import { getParameterLimits, validateLightingParameter, getLinkedParameterSuggestion } from '../../utils/lighting';
import type { LightType, LightingPanelTab, LightingRecommendation, LightingParameterWarning } from '../../types';

const lightTypeIcons: Record<LightType, React.ReactNode> = {
  spotlight: <Sparkles className="w-4 h-4" />,
  floodlight: <Sun className="w-4 h-4" />,
  ambient: <Lightbulb className="w-4 h-4" />,
};

const tabIcons: Record<LightingPanelTab, React.ReactNode> = {
  parameters: <Sliders className="w-4 h-4" />,
  presets: <Bookmark className="w-4 h-4" />,
  history: <History className="w-4 h-4" />,
  recommendations: <SparklesIcon className="w-4 h-4" />,
};

export const LightingPanel: React.FC = () => {
  const {
    lighting,
    lightingHistory,
    lightingHistoryIndex,
    lightingPanelTab,
    lightingAutoLink,
    lightingPresets,
    lightingValidationWarnings,
    selectedArtworkId,
    artworks,
    setLighting,
    resetLighting,
    undoLighting,
    redoLighting,
    canUndoLighting,
    canRedoLighting,
    jumpToLightingHistory,
    clearLightingHistory,
    setLightingPanelTab,
    setLightingAutoLink,
    createLightingPreset,
    updateLightingPreset,
    deleteLightingPreset,
    applyLightingPreset,
    toggleLightingPresetFavorite,
    selectLightingPreset,
    getFilteredLightingPresets,
    validateLightingConfig,
    getLightingRecommendations,
    applyLightingRecommendation,
    selectedLightingPresetId,
    setLightingWithHistory,
  } = useAppStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [newPresetTags, setNewPresetTags] = useState('');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editPresetData, setEditPresetData] = useState({ name: '', description: '', tags: '' });

  const selectedArtwork = useMemo(
    () => artworks.find((a) => a.id === selectedArtworkId),
    [artworks, selectedArtworkId]
  );

  const parameterLimits = useMemo(
    () => getParameterLimits(lighting.type),
    [lighting.type]
  );

  const recommendations = useMemo(
    () => getLightingRecommendations(selectedArtwork?.medium, lighting),
    [getLightingRecommendations, selectedArtwork?.medium, lighting]
  );

  const filteredPresets = useMemo(
    () => getFilteredLightingPresets(presetSearchQuery, showFavoritesOnly),
    [getFilteredLightingPresets, presetSearchQuery, showFavoritesOnly]
  );

  const canUndo = canUndoLighting();
  const canRedo = canRedoLighting();

  const handleTypeChange = (type: LightType) => {
    setLighting({ type });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const tags = newPresetTags.split(',').map((t) => t.trim()).filter(Boolean);
    createLightingPreset(newPresetName, newPresetDescription, tags);
    setNewPresetName('');
    setNewPresetDescription('');
    setNewPresetTags('');
    setShowSaveDialog(false);
  };

  const handleParameterChange = (key: string, value: number) => {
    const updates: Record<string, number> = { [key]: value };
    
    if (lightingAutoLink) {
      const constraint = LIGHTING_PARAMETER_CONSTRAINTS[lighting.type];
      const linked = constraint.linkedParameters.find((l) => l.source === key);
      if (linked) {
        const suggestion = getLinkedParameterSuggestion(lighting.type, key as keyof typeof lighting, value);
        if (suggestion) {
          updates[linked.target] = suggestion.suggestedValue;
        }
      }
    }

    setLightingWithHistory(updates);
    validateLightingConfig({ ...lighting, ...updates });
  };

  const renderWarningBanner = () => {
    if (lightingValidationWarnings.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-4 space-y-2"
      >
        {lightingValidationWarnings.map((warning: LightingParameterWarning, idx: number) => (
          <div
            key={`${warning.param}-${idx}`}
            className={`p-3 rounded-lg border ${
              warning.severity === 'error'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  warning.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                }`}
              />
              <div className="flex-1">
                <p className={`text-sm ${
                  warning.severity === 'error' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {warning.message}
                </p>
                {warning.suggestion && (
                  <p className="text-xs text-white/50 mt-1">
                    建议：{Object.entries(warning.suggestion).map(([k, v]) => 
                      `${LIGHTING_PARAM_LABELS[k as keyof typeof LIGHTING_PARAM_LABELS] || k}: ${typeof v === 'number' && k === 'intensity' ? `${Math.round(v * 100)}%` : v}${k === 'angle' ? '°' : k === 'colorTemperature' ? 'K' : ''}`
                    ).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const temperatureGradient = generateTemperatureGradient();

  const renderParametersTab = () => (
    <div className="space-y-6">
      {renderWarningBanner()}
      
      <div>
        <label className="block text-sm text-white/70 mb-3">光源类型</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(LIGHT_TYPE_LABELS) as LightType[]).map((type) => {
            const constraint = LIGHTING_PARAMETER_CONSTRAINTS[type];
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                  lighting.type === type
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gallery-border bg-gallery-bg text-white/60 hover:border-gold/50 hover:text-white'
                }`}
              >
                {lightTypeIcons[type]}
                <span className="text-xs font-medium">
                  {LIGHT_TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] opacity-60">
                  {constraint.intensityRange.min * 100}-{constraint.intensityRange.max * 100}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">参数联动</span>
        <button
          onClick={() => setLightingAutoLink(!lightingAutoLink)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
            lightingAutoLink
              ? 'bg-gold/20 text-gold border border-gold/50'
              : 'bg-gallery-bg text-white/40 border border-gallery-border'
          }`}
        >
          {lightingAutoLink ? <Link className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
          {lightingAutoLink ? '已启用' : '已禁用'}
        </button>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-2">色温</label>
        <div className="h-2 rounded-full mb-3" style={{ background: temperatureGradient }} />
        <Slider
          value={lighting.colorTemperature}
          min={parameterLimits.colorTemperature.min}
          max={parameterLimits.colorTemperature.max}
          step={100}
          onChange={(v) => handleParameterChange('colorTemperature', v)}
          unit="K"
          gradient={temperatureGradient}
        />
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span className="text-warm">暖光 {parameterLimits.colorTemperature.min}K</span>
          <span className="text-cool">冷光 {parameterLimits.colorTemperature.max}K</span>
        </div>
        {lightingAutoLink && (
          <div className="mt-2 p-2 rounded-lg bg-gold/5 border border-gold/20">
            <div className="flex items-start gap-2">
              <LightbulbIcon className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gold/80">
                {LIGHTING_PARAMETER_CONSTRAINTS[lighting.type].linkedParameters.find(l => l.source === 'colorTemperature')?.description || '参数联动已生效'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <Slider
          value={lighting.intensity}
          min={parameterLimits.intensity.min}
          max={parameterLimits.intensity.max}
          step={0.01}
          onChange={(v) => handleParameterChange('intensity', v)}
          label="亮度"
          unit="%"
          showValue={false}
        />
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>{Math.round(parameterLimits.intensity.min * 100)}%</span>
          <span className="text-gold">{Math.round(lighting.intensity * 100)}%</span>
          <span>{Math.round(parameterLimits.intensity.max * 100)}%</span>
        </div>
      </div>

      <div>
        <Slider
          value={lighting.angle}
          min={parameterLimits.angle.min}
          max={parameterLimits.angle.max}
          step={1}
          onChange={(v) => handleParameterChange('angle', v)}
          label="光束角度"
          unit="°"
        />
        {lightingAutoLink && lighting.type !== 'ambient' && (
          <div className="mt-2 p-2 rounded-lg bg-gold/5 border border-gold/20">
            <div className="flex items-start gap-2">
              <LightbulbIcon className="w-3 h-3 text-gold flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gold/80">
                {LIGHTING_PARAMETER_CONSTRAINTS[lighting.type].linkedParameters.find(l => l.source === 'angle')?.description || '参数联动已生效'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gallery-border">
        <h4 className="text-sm font-medium text-white/70 mb-4">灯光位置</h4>
        <div className="space-y-4">
          <div>
            <Slider
              value={lighting.positionX}
              min={-3}
              max={3}
              step={0.1}
              onChange={(v) => handleParameterChange('positionX', v)}
              label="水平位置"
            />
          </div>
          <div>
            <Slider
              value={lighting.positionY}
              min={-2}
              max={4}
              step={0.1}
              onChange={(v) => handleParameterChange('positionY', v)}
              label="垂直位置"
            />
          </div>
          <div>
            <Slider
              value={lighting.positionZ}
              min={1}
              max={6}
              step={0.1}
              onChange={(v) => handleParameterChange('positionZ', v)}
              label="照射距离"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">快速预设</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              setLightingWithHistory({
                type: 'spotlight',
                colorTemperature: 3200,
                intensity: 0.85,
                angle: 30,
              }, '温暖聚光')
            }
            className="px-3 py-2 text-xs rounded-lg bg-warm/10 border border-warm/30 text-warm hover:bg-warm/20 transition-colors"
          >
            温暖聚光
          </button>
          <button
            onClick={() =>
              setLightingWithHistory({
                type: 'spotlight',
                colorTemperature: 5500,
                intensity: 0.9,
                angle: 25,
              }, '冷调聚光')
            }
            className="px-3 py-2 text-xs rounded-lg bg-cool/10 border border-cool/30 text-cool hover:bg-cool/20 transition-colors"
          >
            冷调聚光
          </button>
          <button
            onClick={() =>
              setLightingWithHistory({
                type: 'floodlight',
                colorTemperature: 4200,
                intensity: 0.6,
                angle: 60,
              }, '柔和泛光')
            }
            className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
          >
            柔和泛光
          </button>
          <button
            onClick={() =>
              setLightingWithHistory({
                type: 'ambient',
                colorTemperature: 3000,
                intensity: 0.4,
                angle: 90,
              }, '环境光')
            }
            className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
          >
            环境光
          </button>
        </div>
      </div>
    </div>
  );

  const renderPresetsTab = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
        >
          <BookmarkPlus className="w-4 h-4" />
          保存当前配置
        </button>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gallery-bg border border-gold/30 rounded-lg">
              <h4 className="text-sm font-medium text-gold mb-3">保存为预设</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="预设名称"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <textarea
                  placeholder="预设描述（可选）"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none resize-none"
                />
                <input
                  type="text"
                  placeholder="标签（用逗号分隔，如：油画,暖光,古典）"
                  value={newPresetTags}
                  onChange={(e) => setNewPresetTags(e.target.value)}
                  className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setNewPresetName('');
                      setNewPresetDescription('');
                      setNewPresetTags('');
                    }}
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

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="搜索预设..."
            value={presetSearchQuery}
            onChange={(e) => setPresetSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`p-2 rounded-lg border transition-all ${
            showFavoritesOnly
              ? 'bg-gold/20 border-gold/50 text-gold'
              : 'bg-gallery-bg border-gallery-border text-white/60 hover:text-white'
          }`}
          title={showFavoritesOnly ? '显示全部' : '仅显示收藏'}
        >
          {showFavoritesOnly ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-3">
        {filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">
              {presetSearchQuery || showFavoritesOnly ? '没有找到匹配的预设' : '暂无自定义预设'}
            </p>
            <p className="text-sm text-white/40">
              {presetSearchQuery || showFavoritesOnly ? '尝试调整搜索条件' : '点击上方按钮保存当前灯光配置'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPresets.map((preset) => {
              const isSelected = selectedLightingPresetId === preset.id;
              const isEditing = editingPresetId === preset.id;
              
              return (
                <motion.div
                  key={preset.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`card ${isSelected ? 'border-gold ring-2 ring-gold/20' : ''}`}
                  onClick={() => selectLightingPreset(isSelected ? null : preset.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white text-sm">{preset.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/50 rounded">
                            使用 {preset.useCount} 次
                          </span>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-1">{preset.description || '暂无描述'}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLightingPresetFavorite(preset.id);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            preset.isFavorite
                              ? 'text-gold hover:bg-gold/20'
                              : 'text-white/30 hover:text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {preset.isFavorite ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                        </button>
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0"
                          style={{
                            backgroundColor: `hsl(${(preset.lighting.colorTemperature - 2000) / 8000 * 60 + 20}, 80%, 60%)`,
                            boxShadow: `0 0 15px hsl(${(preset.lighting.colorTemperature - 2000) / 8000 * 60 + 20}, 80%, 60%)40`,
                          }}
                        />
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2 mb-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editPresetData.name}
                          onChange={(e) => setEditPresetData({ ...editPresetData, name: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gallery-surface border border-gold/50 rounded text-white text-sm"
                          placeholder="预设名称"
                        />
                        <textarea
                          value={editPresetData.description}
                          onChange={(e) => setEditPresetData({ ...editPresetData, description: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gallery-surface border border-gold/50 rounded text-white text-sm resize-none"
                          placeholder="预设描述"
                          rows={2}
                        />
                        <input
                          type="text"
                          value={editPresetData.tags}
                          onChange={(e) => setEditPresetData({ ...editPresetData, tags: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gallery-surface border border-gold/50 rounded text-white text-sm"
                          placeholder="标签（用逗号分隔）"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const tags = editPresetData.tags.split(',').map((t) => t.trim()).filter(Boolean);
                              updateLightingPreset(preset.id, {
                                name: editPresetData.name,
                                description: editPresetData.description,
                                tags,
                                updatedAt: Date.now(),
                              });
                              setEditingPresetId(null);
                            }}
                            className="flex-1 btn-primary text-xs py-1.5"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingPresetId(null)}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {preset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {preset.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 bg-white/5 text-white/50 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {preset.tags.length > 3 && (
                              <span className="text-[10px] px-2 py-0.5 bg-white/5 text-white/50 rounded-full">
                                +{preset.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-4 gap-1 text-xs text-white/60 mb-3">
                          <div>{LIGHT_TYPE_LABELS[preset.lighting.type]}</div>
                          <div>{preset.lighting.colorTemperature}K</div>
                          <div>{Math.round(preset.lighting.intensity * 100)}%</div>
                          <div>{preset.lighting.angle}°</div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          applyLightingPreset(preset.id);
                        }}
                        className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        应用
                      </button>
                      {!isEditing && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPresetId(preset.id);
                              setEditPresetData({
                                name: preset.name,
                                description: preset.description || '',
                                tags: preset.tags.join(', '),
                              });
                            }}
                            className="btn-secondary text-xs py-1.5 px-3 text-white/60 hover:text-white"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个预设吗？')) {
                                deleteLightingPreset(preset.id);
                              }
                            }}
                            className="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-white">历史记录</span>
          <span className="text-xs text-white/40">({lightingHistory.length} 条)</span>
        </div>
        <span className="text-xs text-white/40">
          {lightingHistoryIndex + 1} / {lightingHistory.length}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={undoLighting}
          disabled={!canUndo}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
            canUndo
              ? 'btn-secondary text-white'
              : 'bg-gallery-bg text-white/30 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          撤销
        </button>
        <button
          onClick={redoLighting}
          disabled={!canRedo}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
            canRedo
              ? 'btn-secondary text-white'
              : 'bg-gallery-bg text-white/30 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
          重做
        </button>
      </div>

      {lightingHistory.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <div className="text-xs text-white/40">
            点击任意历史记录可直接跳转
          </div>
          <button
            onClick={() => {
              if (confirm('确定要清除所有历史记录吗？这将无法恢复。')) {
                clearLightingHistory();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            清除历史
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {[...lightingHistory].reverse().map((record, idx) => {
          const actualIndex = lightingHistory.length - 1 - idx;
          const isCurrent = actualIndex === lightingHistoryIndex;
          const isBeforeCurrent = actualIndex < lightingHistoryIndex;
          
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => jumpToLightingHistory(actualIndex)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-gold/10 border-gold/50'
                  : isBeforeCurrent
                  ? 'bg-gallery-bg/50 border-gallery-border hover:border-gold/30'
                  : 'bg-gallery-bg border-gallery-border hover:border-gold/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCurrent
                    ? 'bg-gold/20'
                    : isBeforeCurrent
                    ? 'bg-gallery-hover/50'
                    : 'bg-gallery-hover'
                }`}>
                  <Clock className={`w-4 h-4 ${
                    isCurrent
                      ? 'text-gold'
                      : isBeforeCurrent
                      ? 'text-white/20'
                      : 'text-white/40'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-gold'
                        : isBeforeCurrent
                        ? 'text-white/50'
                        : 'text-white'
                    }`}>
                      {record.description || '配置变更'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isBeforeCurrent && (
                        <span className="text-[10px] text-white/30 px-1.5 py-0.5 bg-white/5 rounded">
                          已撤销
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs text-gold px-2 py-0.5 bg-gold/10 rounded">
                          当前
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span>{formatTime(record.timestamp)}</span>
                    <span>{record.lighting.colorTemperature}K</span>
                    <span>{Math.round(record.lighting.intensity * 100)}%</span>
                    <span>{LIGHT_TYPE_LABELS[record.lighting.type]}</span>
                    <span>{record.lighting.angle}°</span>
                  </div>
                  {record.parameters && Object.keys(record.parameters).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(record.parameters).map(([key]) => {
                        const label = LIGHTING_PARAM_LABELS[key as keyof typeof LIGHTING_PARAM_LABELS] || key;
                        return (
                          <span
                            key={key}
                            className="text-[10px] px-1.5 py-0.5 bg-gold/10 text-gold/70 rounded"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderRecommendationsTab = () => (
    <div className="space-y-4">
      {selectedArtwork && (
        <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="text-sm text-gold/80">
              基于 <span className="font-medium">{selectedArtwork.title}</span> 的 {selectedArtwork.medium} 类型推荐
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {recommendations.map((rec: LightingRecommendation, idx: number) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{rec.name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded">
                      {Math.round(rec.confidence * 100)}% 匹配
                    </span>
                  </div>
                  <p className="text-xs text-white/60">{rec.description}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg ml-3 flex-shrink-0"
                  style={{
                    backgroundColor: rec.lighting.colorTemperature
                      ? `hsl(${(rec.lighting.colorTemperature - 2000) / 8000 * 60 + 20}, 80%, 60%)`
                      : '#d4af37',
                    boxShadow: rec.lighting.colorTemperature
                      ? `0 0 20px hsl(${(rec.lighting.colorTemperature - 2000) / 8000 * 60 + 20}, 80%, 60%)40`
                      : '0 0 20px #d4af3740',
                  }}
                />
              </div>

              <div className="p-2 rounded-lg bg-gallery-bg mb-3">
                <p className="text-xs text-white/50 mb-1">推荐理由</p>
                <p className="text-xs text-white/70">{rec.matchReason}</p>
              </div>

              {rec.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {rec.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-white/5 text-white/50 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {rec.lighting && (
                <div className="grid grid-cols-4 gap-2 text-xs text-white/60 mb-3">
                  {rec.lighting.type && (
                    <div>{LIGHT_TYPE_LABELS[rec.lighting.type]}</div>
                  )}
                  {rec.lighting.colorTemperature !== undefined && (
                    <div>{rec.lighting.colorTemperature}K</div>
                  )}
                  {rec.lighting.intensity !== undefined && (
                    <div>{Math.round(rec.lighting.intensity * 100)}%</div>
                  )}
                  {rec.lighting.angle !== undefined && (
                    <div>{rec.lighting.angle}°</div>
                  )}
                </div>
              )}

              <button
                onClick={() => applyLightingRecommendation(rec)}
                className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-2"
              >
                <SparklesIcon className="w-3 h-3" />
                应用推荐
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (lightingPanelTab) {
      case 'parameters':
        return renderParametersTab();
      case 'presets':
        return renderPresetsTab();
      case 'history':
        return renderHistoryTab();
      case 'recommendations':
        return renderRecommendationsTab();
      default:
        return renderParametersTab();
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
          <Lightbulb className="w-5 h-5 text-gold" />
          灯光参数
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={undoLighting}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all ${
              canUndo
                ? 'text-white/60 hover:text-white hover:bg-gallery-hover'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="撤销"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redoLighting}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all ${
              canRedo
                ? 'text-white/60 hover:text-white hover:bg-gallery-hover'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="重做"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={resetLighting}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
            title="重置灯光"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-gallery-bg rounded-lg border border-gallery-border">
        {LIGHTING_PANEL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLightingPanelTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
              lightingPanelTab === tab.id
                ? 'bg-gold/20 text-gold'
                : 'text-white/50 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            {tabIcons[tab.id]}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={lightingPanelTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
