import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  RotateCcw,
  Info,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info as InfoIcon,
  Bookmark,
  BookmarkCheck,
  Heart,
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../store/useAppStore';
import {
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  FRAME_MATERIAL_DESCRIPTIONS,
  WALL_MATERIAL_DESCRIPTIONS,
  formatMaterialDescription,
} from '../../types';
import type {
  FrameMaterial,
  WallMaterial,
  MaterialDescription,
  MaterialEffectPreview,
  MaterialParameterWarning,
  MaterialComboFavorite,
  MaterialCombo,
} from '../../types';

const frameMaterialColors: Record<FrameMaterial, string> = {
  wood: 'linear-gradient(135deg, #5D4037, #8D6E63)',
  metal: 'linear-gradient(135deg, #78909C, #B0BEC5)',
  gold: 'linear-gradient(135deg, #d4af37, #f4e4bc)',
  silver: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)',
  none: 'transparent',
};

const wallMaterialColors: Record<WallMaterial, string> = {
  matte: '#1a1a1a',
  satin: '#1f1f1f',
  glossy: '#252525',
  concrete: '#1e1e1e',
};

const costLevelLabels: Record<string, string> = {
  economy: '经济型',
  standard: '标准型',
  premium: '优质型',
  luxury: '奢华型',
};

const visualTempLabels: Record<string, string> = {
  cool: '冷调',
  neutral: '中性',
  warm: '暖调',
};

interface MaterialDescriptionCardProps {
  title: string;
  description: MaterialDescription | undefined;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const MaterialDescriptionCard: React.FC<MaterialDescriptionCardProps> = ({
  title,
  description,
  icon,
  isExpanded,
  onToggle,
}) => {
  if (!description) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-gallery-bg to-gallery-surface border border-gallery-border overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gallery-hover/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <h5 className="text-sm font-medium text-white">{title}</h5>
            <p className="text-xs text-white/50">{description.name}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
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
            <div className="px-3 pb-3 space-y-3">
              <p className="text-xs text-white/60 leading-relaxed">
                {description.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {description.features.map((feature, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-gold/10 text-gold/80 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <p className="text-white/40">耐用性</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < description.durability
                            ? 'bg-gold'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40">成本等级</p>
                  <p className="text-white font-medium">
                    {costLevelLabels[description.costLevel] || description.costLevel}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-white/40 mb-1">适合场景</p>
                  <div className="flex flex-wrap gap-1">
                    {description.suitableFor.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">不适合场景</p>
                  <div className="flex flex-wrap gap-1">
                    {description.notSuitableFor.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface EffectPreviewCardProps {
  effect: MaterialEffectPreview;
}

const EffectPreviewCard: React.FC<EffectPreviewCardProps> = ({ effect }) => {
  const renderBar = (value: number, label: string, color: string) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="text-white/80 font-medium">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-gold/5 to-transparent border border-gold/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gold" />
        </div>
        <div>
          <h5 className="text-sm font-medium text-white">效果预估</h5>
          <p className="text-xs text-gold">{effect.atmosphere}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {renderBar(effect.shadowIntensity, '阴影强度', '#6366f1')}
        {renderBar(effect.reflectionIntensity, '反射强度', '#d4af37')}
        {renderBar(effect.glowIntensity, '光晕强度', '#ec4899')}
        {renderBar(effect.contrastLevel, '对比度', '#8b5cf6')}
        {renderBar(effect.colorSaturation, '色彩饱和度', '#22c55e')}
      </div>

      <div className="flex items-center justify-between p-2 rounded-lg bg-gallery-bg">
        <span className="text-xs text-white/50">视觉温度</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            effect.visualTemperature === 'warm'
              ? 'bg-orange-500/20 text-orange-400'
              : effect.visualTemperature === 'cool'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {visualTempLabels[effect.visualTemperature]}
        </span>
      </div>

      {Object.keys(effect.recommendedLighting).length > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-400 font-medium mb-1">灯光调整建议</p>
          <div className="space-y-1">
            {effect.recommendedLighting.intensity !== undefined && (
              <p className="text-xs text-white/60">
                建议亮度: {Math.round(effect.recommendedLighting.intensity * 100)}%
              </p>
            )}
            {effect.recommendedLighting.angle !== undefined && (
              <p className="text-xs text-white/60">
                建议光束角度: {effect.recommendedLighting.angle}°
              </p>
            )}
            {effect.recommendedLighting.colorTemperature !== undefined && (
              <p className="text-xs text-white/60">
                建议色温: {effect.recommendedLighting.colorTemperature}K
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface WarningListProps {
  warnings: MaterialParameterWarning[];
}

const WarningList: React.FC<WarningListProps> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <InfoIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <h5 className="text-sm font-medium text-white">参数提醒</h5>
        <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
          {warnings.length}
        </span>
      </div>

      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border ${getBgColor(warning.severity)}`}
          >
            <div className="flex items-start gap-2">
              {getIcon(warning.severity)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/80">{warning.message}</p>
                {warning.suggestion && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(warning.suggestion).map(([key, value]) => {
                      const label =
                        key === 'reflectivity'
                          ? '反光度'
                          : key === 'roughness'
                          ? '粗糙度'
                          : key === 'frameMaterial'
                          ? '画框材质'
                          : key === 'wallMaterial'
                          ? '墙面材质'
                          : key;
                      const displayValue =
                        typeof value === 'number'
                          ? `${Math.round(value * 100)}%`
                          : value;
                      return (
                        <span
                          key={key}
                          className="text-xs px-1.5 py-0.5 bg-white/10 text-white/60 rounded"
                        >
                          建议{label}: {displayValue}
                        </span>
                      );
                    })}
                  </div>
                )}
                {warning.relatedArtworkMedium && warning.relatedArtworkMedium.length > 0 && (
                  <p className="text-xs text-white/40 mt-1">
                    相关媒介: {warning.relatedArtworkMedium.join('、')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

interface FavoritesListProps {
  favorites: MaterialComboFavorite[];
  materialCombos: MaterialCombo[];
  onApply: (comboId: string) => void;
  onRemove: (favoriteId: string) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  materialCombos,
  onApply,
  onRemove,
}) => {
  const getCombo = (comboId: string) =>
    materialCombos.find((c) => c.id === comboId);

  if (favorites.length === 0) {
    return (
      <div className="text-center py-6">
        <Bookmark className="w-12 h-12 text-white/20 mx-auto mb-2" />
        <p className="text-sm text-white/40">暂无收藏的材质组合</p>
        <p className="text-xs text-white/30 mt-1">
          点击上方收藏按钮保存当前配置
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favorites
        .sort((a, b) => (b.lastUsedAt || b.createdAt) - (a.lastUsedAt || a.createdAt))
        .map((favorite) => {
          const combo = getCombo(favorite.comboId);
          if (!combo) return null;

          return (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h6 className="text-sm font-medium text-white truncate">
                    {favorite.name || combo.name}
                  </h6>
                  {favorite.note && (
                    <p className="text-xs text-white/40 mt-0.5">{favorite.note}</p>
                  )}
                </div>
                <BookmarkCheck className="w-4 h-4 text-gold flex-shrink-0 ml-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-white/50 mb-2">
                <span>画框: {FRAME_MATERIAL_LABELS[combo.material.frameMaterial]}</span>
                <span>墙面: {WALL_MATERIAL_LABELS[combo.material.wallMaterial]}</span>
                <span>反光: {Math.round(combo.material.reflectivity * 100)}%</span>
                <span>粗糙: {Math.round(combo.material.roughness * 100)}%</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/30">
                  使用 {favorite.useCount} 次
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onApply(favorite.comboId)}
                    className="px-2 py-1 rounded bg-gold/10 text-gold hover:bg-gold/20 transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    应用
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要移除这个收藏吗？')) {
                        onRemove(favorite.id);
                      }
                    }}
                    className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
    </div>
  );
};

type PanelTab = 'config' | 'description' | 'effect' | 'favorites';

export const MaterialPanel: React.FC = () => {
  const {
    material,
    setMaterial,
    resetMaterial,
    materialValidationWarnings,
    getMaterialEffectPreview,
    getCurrentMaterialDescription,
    materialComboFavorites,
    materialCombos,
    applyMaterialCombo,
    removeMaterialComboFavorite,
    saveCurrentMaterialAsCombo,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<PanelTab>('config');
  const [expandedFrameDesc, setExpandedFrameDesc] = useState(true);
  const [expandedWallDesc, setExpandedWallDesc] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const materialDesc = useMemo(() => getCurrentMaterialDescription(), [material]);
  const effectPreview = useMemo(() => getMaterialEffectPreview(), [material]);

  const handleSaveCurrent = () => {
    const name = saveName.trim() || `我的材质组合 ${new Date().toLocaleDateString()}`;
    saveCurrentMaterialAsCombo(name);
    setSaveName('');
    setShowSaveDialog(false);
  };

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'config', label: '配置', icon: <Layers className="w-4 h-4" /> },
    { id: 'description', label: '说明', icon: <Info className="w-4 h-4" /> },
    { id: 'effect', label: '效果', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'favorites',
      label: '收藏',
      icon: <Heart className="w-4 h-4" />,
      badge: materialComboFavorites.length,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-gold" />
          材质反射
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="p-2 text-gold hover:bg-gold/10 transition-colors rounded-lg"
            title="收藏当前配置"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={resetMaterial}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
            title="重置材质"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-4 p-1 bg-gallery-bg rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs transition-all ${
              activeTab === tab.id
                ? 'bg-gold/20 text-gold'
                : 'text-white/50 hover:text-white/80 hover:bg-gallery-hover'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="text-xs px-1 py-0.5 bg-gold text-black rounded-full font-medium">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-y-auto pr-1"
          >
            <div className="space-y-5">
              {materialValidationWarnings.length > 0 && (
                <WarningList warnings={materialValidationWarnings} />
              )}

              <div>
                <label className="block text-sm text-white/70 mb-3">画框材质</label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(FRAME_MATERIAL_LABELS) as FrameMaterial[]).map(
                    (mat) => (
                      <button
                        key={mat}
                        onClick={() => setMaterial({ frameMaterial: mat })}
                        className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                          material.frameMaterial === mat
                            ? 'border-gold bg-gold/10'
                            : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded border-2 border-white/20"
                          style={{ background: frameMaterialColors[mat] }}
                        />
                        <span className="text-xs text-white/70">
                          {FRAME_MATERIAL_LABELS[mat]}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-3">墙面材质</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(WALL_MATERIAL_LABELS) as WallMaterial[]).map(
                    (mat) => (
                      <button
                        key={mat}
                        onClick={() => setMaterial({ wallMaterial: mat })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                          material.wallMaterial === mat
                            ? 'border-gold bg-gold/10'
                            : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded border border-white/10"
                          style={{
                            background: wallMaterialColors[mat],
                            boxShadow:
                              mat === 'glossy'
                                ? 'inset 0 -8px 16px rgba(255,255,255,0.1)'
                                : 'none',
                          }}
                        />
                        <span className="text-xs text-white/70">
                          {WALL_MATERIAL_LABELS[mat]}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gallery-border">
                <h4 className="text-sm font-medium text-white/70 mb-4">表面属性</h4>

                <div className="space-y-6">
                  <div>
                    <Slider
                      value={material.reflectivity}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(v) => setMaterial({ reflectivity: v })}
                      label="反光度"
                      unit="%"
                      showValue={false}
                    />
                    <div className="flex justify-between mt-1 text-xs text-white/40">
                      <span>低</span>
                      <span className="text-gold">
                        {Math.round(material.reflectivity * 100)}%
                      </span>
                      <span>高</span>
                    </div>
                  </div>

                  <div>
                    <Slider
                      value={material.roughness}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(v) => setMaterial({ roughness: v })}
                      label="粗糙度"
                      unit="%"
                      showValue={false}
                    />
                    <div className="flex justify-between mt-1 text-xs text-white/40">
                      <span>光滑</span>
                      <span className="text-gold">
                        {Math.round(material.roughness * 100)}%
                      </span>
                      <span>粗糙</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
                <h4 className="text-sm font-medium text-white mb-3">快速预设</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setMaterial({
                        frameMaterial: 'gold',
                        wallMaterial: 'matte',
                        reflectivity: 0.2,
                        roughness: 0.8,
                      })
                    }
                    className="px-3 py-2 text-xs rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
                  >
                    经典金框
                  </button>
                  <button
                    onClick={() =>
                      setMaterial({
                        frameMaterial: 'silver',
                        wallMaterial: 'satin',
                        reflectivity: 0.4,
                        roughness: 0.5,
                      })
                    }
                    className="px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    现代银框
                  </button>
                  <button
                    onClick={() =>
                      setMaterial({
                        frameMaterial: 'wood',
                        wallMaterial: 'concrete',
                        reflectivity: 0.15,
                        roughness: 0.85,
                      })
                    }
                    className="px-3 py-2 text-xs rounded-lg bg-orange-900/20 border border-orange-700/30 text-orange-300 hover:bg-orange-900/30 transition-colors"
                  >
                    自然原木
                  </button>
                  <button
                    onClick={() =>
                      setMaterial({
                        frameMaterial: 'none',
                        wallMaterial: 'glossy',
                        reflectivity: 0.6,
                        roughness: 0.2,
                      })
                    }
                    className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
                  >
                    极简无框
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-gallery-bg to-gallery-surface border border-gallery-border">
                <h4 className="text-sm font-medium text-white mb-3">当前配置</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-white/40">画框材质</p>
                    <p className="text-white font-medium">
                      {FRAME_MATERIAL_LABELS[material.frameMaterial]}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40">墙面材质</p>
                    <p className="text-white font-medium">
                      {WALL_MATERIAL_LABELS[material.wallMaterial]}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40">反光度</p>
                    <p className="text-gold font-medium">
                      {Math.round(material.reflectivity * 100)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/40">粗糙度</p>
                    <p className="text-gold font-medium">
                      {Math.round(material.roughness * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'description' && (
          <motion.div
            key="description"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto pr-1"
          >
            <div className="space-y-4">
              <MaterialDescriptionCard
                title="画框材质说明"
                description={materialDesc.frame}
                icon={<Layers className="w-4 h-4 text-gold" />}
                isExpanded={expandedFrameDesc}
                onToggle={() => setExpandedFrameDesc(!expandedFrameDesc)}
              />
              <MaterialDescriptionCard
                title="墙面材质说明"
                description={materialDesc.wall}
                icon={<Layers className="w-4 h-4 text-blue-400" />}
                isExpanded={expandedWallDesc}
                onToggle={() => setExpandedWallDesc(!expandedWallDesc)}
              />

              <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
                <h5 className="text-sm font-medium text-white mb-3">材质组合分析</h5>
                <p className="text-xs text-white/60 leading-relaxed">
                  {FRAME_MATERIAL_LABELS[material.frameMaterial]}
                  搭配
                  {WALL_MATERIAL_LABELS[material.wallMaterial]}
                  墙面，{effectPreview.atmosphere}的视觉效果适合
                  {materialDesc.frame?.suitableFor.slice(0, 2).join('、')}
                  等类型的作品展示。
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'effect' && (
          <motion.div
            key="effect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto pr-1"
          >
            <div className="space-y-4">
              <EffectPreviewCard effect={effectPreview} />

              {materialValidationWarnings.length > 0 && (
                <WarningList warnings={materialValidationWarnings} />
              )}

              <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
                <h5 className="text-sm font-medium text-white mb-2">配置摘要</h5>
                <p className="text-xs text-white/50 font-mono">
                  {formatMaterialDescription(material)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-y-auto pr-1"
          >
            <div className="space-y-4">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-gold/30 bg-gold/5 hover:bg-gold/10 hover:border-gold/50 transition-colors flex items-center justify-center gap-2"
              >
                <Bookmark className="w-5 h-5 text-gold" />
                <span className="text-gold font-medium">收藏当前材质配置</span>
              </button>

              <FavoritesList
                favorites={materialComboFavorites}
                materialCombos={materialCombos}
                onApply={applyMaterialCombo}
                onRemove={removeMaterialComboFavorite}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gallery-surface border border-gallery-border rounded-xl p-4 w-[90%] max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">收藏材质配置</h4>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="p-1 hover:bg-gallery-hover rounded transition-colors"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    配置名称
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="输入配置名称..."
                    className="w-full px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="p-3 rounded-lg bg-gallery-bg">
                  <p className="text-xs text-white/50 mb-2">当前配置</p>
                  <p className="text-xs text-white/80 font-mono">
                    {formatMaterialDescription(material)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gallery-hover text-white/70 hover:text-white transition-colors text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveCurrent}
                    className="flex-1 px-4 py-2 rounded-lg bg-gold text-black hover:bg-gold/90 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    保存
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
