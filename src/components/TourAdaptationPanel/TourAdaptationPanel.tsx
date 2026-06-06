import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Ruler,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Trash2,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronRight,
  Zap,
  Weight,
  Clock,
  Gauge,
  Shield,
  Thermometer,
  Droplets,
  Eye,
  ArrowRight,
  MapPin,
  Maximize2,
  Sun,
  Plug,
  Truck,
  Edit2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  TOUR_ADAPTATION_PANEL_TABS,
  VENUE_TYPE_LABELS,
  WALL_STRUCTURE_LABELS,
  POWER_TYPE_LABELS,
  COMPATIBILITY_LEVEL_LABELS,
  COMPATIBILITY_LEVEL_COLORS,
  LIGHT_TYPE_LABELS,
} from '../../types';
import type {
  TourAdaptationPanelTab,
  CompatibilityLevel,
  VenueCondition,
  CompatibilityHint,
} from '../../types';

const getCompatibilityIcon = (level: CompatibilityLevel) => {
  switch (level) {
    case 'compatible':
      return <CheckCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4" />;
    case 'requires_adjustment':
      return <AlertTriangle className="w-4 h-4" />;
    case 'incompatible':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

const getCategoryIcon = (category: CompatibilityHint['category']) => {
  switch (category) {
    case 'mounting':
      return <Ruler className="w-4 h-4" />;
    case 'lighting':
      return <Lightbulb className="w-4 h-4" />;
    case 'power':
      return <Plug className="w-4 h-4" />;
    case 'environment':
      return <Thermometer className="w-4 h-4" />;
    case 'safety':
      return <Shield className="w-4 h-4" />;
    case 'weight':
      return <Weight className="w-4 h-4" />;
    case 'transport':
      return <Truck className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getTabIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    Building2: <Building2 className="w-4 h-4" />,
    Ruler: <Ruler className="w-4 h-4" />,
    Lightbulb: <Lightbulb className="w-4 h-4" />,
    AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  };
  return icons[iconName] || null;
};

export const TourAdaptationPanel: React.FC = () => {
  const {
    venueConditions,
    currentVenueId,
    currentSchemeId,
    gallerySchemes,
    artworks,
    tourAdaptationResults,
    currentTourAdaptationId,
    tourAdaptationPanelTab,
    isPerformingAdaptation,
    selectVenue,
    performTourAdaptation,
    applyTourAdaptation,
    deleteTourAdaptation,
    selectTourAdaptation,
    setTourAdaptationPanelTab,
    createVenueCondition,
    updateVenueCondition,
    deleteVenueCondition,
    getTourAdaptationsByScheme,
  } = useAppStore();

  const [expandedMountingId, setExpandedMountingId] = useState<string | null>(null);
  const [expandedLightingId, setExpandedLightingId] = useState<string | null>(null);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueCondition | null>(null);
  const [expandedHintId, setExpandedHintId] = useState<string | null>(null);

  const currentVenue = venueConditions.find((v) => v.id === currentVenueId);
  const currentScheme = gallerySchemes.find((s) => s.id === currentSchemeId);
  const currentAdaptation = tourAdaptationResults.find((a) => a.id === currentTourAdaptationId);
  const schemeAdaptations = currentSchemeId ? getTourAdaptationsByScheme(currentSchemeId) : [];

  const handlePerformAdaptation = async () => {
    if (!currentSchemeId || !currentVenueId) return;
    performTourAdaptation(currentSchemeId, currentVenueId);
  };

  const handleApplyAdaptation = () => {
    if (!currentTourAdaptationId) return;
    if (confirm('确定要将调整后的参数应用到当前方案吗？这将覆盖现有的挂装位置和灯光参数。')) {
      applyTourAdaptation(currentTourAdaptationId);
    }
  };

  const compatibilityStats = useMemo(() => {
    if (!currentAdaptation) return null;
    const hints = currentAdaptation.compatibilityHints;
    return {
      compatible: hints.filter((h) => h.level === 'compatible').length,
      warning: hints.filter((h) => h.level === 'warning').length,
      requires_adjustment: hints.filter((h) => h.level === 'requires_adjustment').length,
      incompatible: hints.filter((h) => h.level === 'incompatible').length,
    };
  }, [currentAdaptation]);

  const renderVenueTab = () => (
    <div className="space-y-4">
      <div className="card border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-medium text-gold mb-1">智能巡展适配</h4>
              <p className="text-xs text-white/50">
                根据场馆条件自动调整挂装尺寸、光位参数，并检测方案兼容性
              </p>
            </div>
            <button
              onClick={handlePerformAdaptation}
              disabled={isPerformingAdaptation || !currentSchemeId || !currentVenueId}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPerformingAdaptation ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  开始适配
                </>
              )}
            </button>
          </div>
          {currentScheme && (
            <div className="text-xs text-white/60">
              当前方案：<span className="text-white/80">{currentScheme.name}</span>
              （{currentScheme.wallArtworks.length} 件作品）
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-white/70">选择场馆</label>
          <button
            onClick={() => {
              setEditingVenue(null);
              setShowVenueForm(true);
            }}
            className="text-xs text-gold hover:text-gold/80 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            新建场馆
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {venueConditions.map((venue) => (
            <motion.div
              key={venue.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                currentVenueId === venue.id
                  ? 'border-gold bg-gold/10'
                  : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
              }`}
              onClick={() => selectVenue(venue.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`w-4 h-4 ${
                      currentVenueId === venue.id ? 'text-gold' : 'text-white/40'
                    }`} />
                    <span className={`text-sm font-medium ${
                      currentVenueId === venue.id ? 'text-gold' : 'text-white/80'
                    }`}>
                      {venue.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <span>{VENUE_TYPE_LABELS[venue.venueType]}</span>
                    <span>·</span>
                    <span>{venue.wallDimensions.width}×{venue.wallDimensions.height}cm</span>
                    <span>·</span>
                    <span>层高{venue.ceilingHeight}cm</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingVenue(venue);
                    setShowVenueForm(true);
                  }}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {currentVenue && (
        <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
          <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold" />
            场馆详细信息
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> 场馆类型
              </p>
              <p className="text-white font-medium">{VENUE_TYPE_LABELS[currentVenue.venueType]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> 墙面尺寸
              </p>
              <p className="text-white font-medium">
                {currentVenue.wallDimensions.width}×{currentVenue.wallDimensions.height}cm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> 层高
              </p>
              <p className="text-white font-medium">{currentVenue.ceilingHeight}cm</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> 墙体结构
              </p>
              <p className="text-white font-medium">{WALL_STRUCTURE_LABELS[currentVenue.wallStructure]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Weight className="w-3 h-3" /> 承重限制
              </p>
              <p className="text-white font-medium">{currentVenue.maxLoadPerSquareMeter}kg/㎡</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Sun className="w-3 h-3" /> 环境光
              </p>
              <p className="text-white font-medium">{currentVenue.ambientLightLevel}lux</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Plug className="w-3 h-3" /> 供电类型
              </p>
              <p className="text-white font-medium">{POWER_TYPE_LABELS[currentVenue.powerType]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Zap className="w-3 h-3" /> 供电容量
              </p>
              <p className="text-white font-medium">{currentVenue.totalPowerCapacity}W</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Thermometer className="w-3 h-3" /> 温度范围
              </p>
              <p className="text-white font-medium">
                {currentVenue.temperatureRange[0]}°C - {currentVenue.temperatureRange[1]}°C
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Droplets className="w-3 h-3" /> 湿度范围
              </p>
              <p className="text-white font-medium">
                {currentVenue.humidityRange[0]}% - {currentVenue.humidityRange[1]}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Eye className="w-3 h-3" /> 观展距离
              </p>
              <p className="text-white font-medium">
                {currentVenue.viewingDistanceMin}-{currentVenue.viewingDistanceMax}cm
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 flex items-center gap-1">
                <Gauge className="w-3 h-3" /> 人流量
              </p>
              <p className="text-white font-medium">
                {currentVenue.trafficFlow === 'low' ? '低' : currentVenue.trafficFlow === 'medium' ? '中' : '高'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gallery-border">
            <div className="flex flex-wrap gap-2">
              {currentVenue.hasNaturalLight && (
                <span className="text-[10px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                  有自然光
                </span>
              )}
              {currentVenue.hasWindowCoverings && (
                <span className="text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-400">
                  遮光设备
                </span>
              )}
              {currentVenue.hasDimmingSystem && (
                <span className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                  调光系统
                </span>
              )}
              {currentVenue.trackLightingAvailable && (
                <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                  轨道灯
                </span>
              )}
              {currentVenue.hasClimateControl && (
                <span className="text-[10px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
                  温湿度控制
                </span>
              )}
              {currentVenue.hasUVProtection && (
                <span className="text-[10px] px-2 py-1 rounded bg-pink-500/20 text-pink-400">
                  紫外线防护
                </span>
              )}
              {currentVenue.hasSecuritySystem && (
                <span className="text-[10px] px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                  安保系统
                </span>
              )}
            </div>
          </div>

          {currentVenue.notes && (
            <div className="mt-4 p-3 rounded-lg bg-gallery-hover border border-gallery-border">
              <p className="text-[10px] text-white/40 mb-1">备注</p>
              <p className="text-xs text-white/60">{currentVenue.notes}</p>
            </div>
          )}
        </div>
      )}

      {schemeAdaptations.length > 0 && (
        <div>
          <label className="block text-sm text-white/70 mb-3">历史适配记录</label>
          <div className="space-y-2">
            {schemeAdaptations.map((adaptation) => (
              <motion.div
                key={adaptation.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentTourAdaptationId === adaptation.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
                }`}
                onClick={() => selectTourAdaptation(adaptation.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${COMPATIBILITY_LEVEL_COLORS[adaptation.overallCompatibility]}`}>
                        {COMPATIBILITY_LEVEL_LABELS[adaptation.overallCompatibility]}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(adaptation.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="text-xs text-white/60">
                      {adaptation.venueName} · 匹配度 {adaptation.compatibilityScore}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-right mr-2">
                      <div className="text-xs text-white/80 font-medium">
                        {adaptation.compatibilityScore}%
                      </div>
                      <div className="text-[10px] text-white/40">匹配度</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这条适配记录吗？')) {
                          deleteTourAdaptation(adaptation.id);
                        }
                      }}
                      className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMountingTab = () => {
    if (!currentAdaptation) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
            <Ruler className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/60 mb-2">暂无挂装调整数据</p>
          <p className="text-sm text-white/40">请先在场馆条件页面执行适配分析</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <Weight className="w-3 h-3" />
              总预估重量
            </div>
            <div className="text-lg font-display font-bold text-white">
              {currentAdaptation.totalWeightEstimate}
              <span className="text-xs text-white/40 ml-1">kg</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <Clock className="w-3 h-3" />
              预估安装时间
            </div>
            <div className="text-lg font-display font-bold text-white">
              {currentAdaptation.estimatedInstallationTime}
              <span className="text-xs text-white/40 ml-1">小时</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {currentAdaptation.mountingAdjustments.map((adjustment) => {
            const artwork = artworks.find((a) => a.id === adjustment.artworkId);
            const isExpanded = expandedMountingId === adjustment.wallArtworkId;
            const hasChanges = 
              adjustment.originalPosition.x !== adjustment.adjustedPosition.x ||
              adjustment.originalPosition.y !== adjustment.adjustedPosition.y;

            return (
              <motion.div
                key={adjustment.wallArtworkId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedMountingId(isExpanded ? null : adjustment.wallArtworkId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {adjustment.requiresReinforcement && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            需加固
                          </span>
                        )}
                        {hasChanges && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            已调整
                          </span>
                        )}
                        <h4 className="text-sm font-medium text-white">{adjustment.artworkTitle}</h4>
                      </div>
                      {artwork && (
                        <div className="text-xs text-white/40 mb-2">
                          {artwork.width}×{artwork.height}cm · {artwork.medium}
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-white/40">中心线高度</p>
                          <p className="text-white font-medium">{adjustment.centerLineHeight}cm</p>
                        </div>
                        <div>
                          <p className="text-white/40">下缘距地</p>
                          <p className="text-white font-medium">{adjustment.bottomMargin}cm</p>
                        </div>
                        <div>
                          <p className="text-white/40">预估重量</p>
                          <p className="text-white font-medium">{adjustment.estimatedWeight}kg</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-gallery-border">
                        <div className="pt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-3">位置调整对比</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gallery-hover">
                              <p className="text-[10px] text-white/40 mb-2">原始位置</p>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-white/40">X坐标</span>
                                  <span className="text-white">{adjustment.originalPosition.x.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Y坐标</span>
                                  <span className="text-white">{adjustment.originalPosition.y.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">宽度</span>
                                  <span className="text-white">{adjustment.originalPosition.width.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">高度</span>
                                  <span className="text-white">{adjustment.originalPosition.height.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
                              <p className="text-[10px] text-gold mb-2">调整后位置</p>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-white/40">X坐标</span>
                                  <span className="text-gold">{adjustment.adjustedPosition.x.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">Y坐标</span>
                                  <span className="text-gold">{adjustment.adjustedPosition.y.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">宽度</span>
                                  <span className="text-gold">{adjustment.adjustedPosition.width.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">高度</span>
                                  <span className="text-gold">{adjustment.adjustedPosition.height.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-3">间距信息</h5>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">左侧</p>
                              <p className="text-white font-medium">{adjustment.spacingToLeft}cm</p>
                            </div>
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">右侧</p>
                              <p className="text-white font-medium">{adjustment.spacingToRight}cm</p>
                            </div>
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">上方</p>
                              <p className="text-white font-medium">{adjustment.spacingToTop}cm</p>
                            </div>
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">下方</p>
                              <p className="text-white font-medium">{adjustment.spacingToBottom}cm</p>
                            </div>
                          </div>
                        </div>

                        {adjustment.requiresReinforcement && (
                          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-red-400 mb-1">需要加固挂装</p>
                                <p className="text-xs text-white/60">
                                  建议使用：
                                  {adjustment.reinforcementType === 'anchor' && '重型膨胀螺栓'}
                                  {adjustment.reinforcementType === 'bracket' && '专用承重托架'}
                                  {adjustment.reinforcementType === 'stand' && '落地展架'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-2">调整原因</h5>
                          <p className="text-xs text-white/60">{adjustment.adjustmentReason}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLightingTab = () => {
    if (!currentAdaptation) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
            <Lightbulb className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/60 mb-2">暂无灯光调整数据</p>
          <p className="text-sm text-white/40">请先在场馆条件页面执行适配分析</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <Zap className="w-3 h-3" />
              总功率需求
            </div>
            <div className="text-lg font-display font-bold text-white">
              {currentAdaptation.totalPowerRequired}
              <span className="text-xs text-white/40 ml-1">W</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
              <Lightbulb className="w-3 h-3" />
              灯具数量
            </div>
            <div className="text-lg font-display font-bold text-white">
              {currentAdaptation.lightingAdjustments.reduce((sum, a) => sum + a.recommendedFixtureCount, 0)}
              <span className="text-xs text-white/40 ml-1">盏</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {currentAdaptation.lightingAdjustments.map((adjustment) => {
            const artwork = artworks.find((a) => a.id === adjustment.artworkId);
            const isExpanded = expandedLightingId === adjustment.wallArtworkId;
            const hasChanges = 
              adjustment.originalLighting.intensity !== adjustment.adjustedLighting.intensity ||
              adjustment.originalLighting.angle !== adjustment.adjustedLighting.angle ||
              adjustment.originalLighting.colorTemperature !== adjustment.adjustedLighting.colorTemperature;

            return (
              <motion.div
                key={adjustment.wallArtworkId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedLightingId(isExpanded ? null : adjustment.wallArtworkId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {hasChanges && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            已调整
                          </span>
                        )}
                        {adjustment.glareRisk === 'high' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                            眩光风险
                          </span>
                        )}
                        {adjustment.uvExposure === 'high' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            紫外线高
                          </span>
                        )}
                        <h4 className="text-sm font-medium text-white">{adjustment.artworkTitle}</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-white/40">灯具类型</p>
                          <p className="text-white font-medium">
                            {LIGHT_TYPE_LABELS[adjustment.recommendedFixtureType]}
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40">灯具数量</p>
                          <p className="text-white font-medium">{adjustment.recommendedFixtureCount}盏</p>
                        </div>
                        <div>
                          <p className="text-white/40">安装高度</p>
                          <p className="text-white font-medium">{adjustment.mountingHeight}cm</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-gallery-border">
                        <div className="pt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-3">灯光参数对比</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gallery-hover">
                              <p className="text-[10px] text-white/40 mb-2">原始参数</p>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-white/40">类型</span>
                                  <span className="text-white">{LIGHT_TYPE_LABELS[adjustment.originalLighting.type]}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">色温</span>
                                  <span className="text-white">{adjustment.originalLighting.colorTemperature}K</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">亮度</span>
                                  <span className="text-white">{Math.round(adjustment.originalLighting.intensity * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">光束角</span>
                                  <span className="text-white">{adjustment.originalLighting.angle}°</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
                              <p className="text-[10px] text-gold mb-2">调整后参数</p>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-white/40">类型</span>
                                  <span className="text-gold">{LIGHT_TYPE_LABELS[adjustment.adjustedLighting.type]}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">色温</span>
                                  <span className="text-gold">{adjustment.adjustedLighting.colorTemperature}K</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">亮度</span>
                                  <span className="text-gold">{Math.round(adjustment.adjustedLighting.intensity * 100)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/40">光束角</span>
                                  <span className="text-gold">{adjustment.adjustedLighting.angle}°</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-3">灯具安装位置</h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">安装高度</p>
                              <p className="text-white font-medium">{adjustment.mountingHeight}cm</p>
                            </div>
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">水平偏移</p>
                              <p className="text-white font-medium">{adjustment.horizontalOffset}cm</p>
                            </div>
                            <div className="p-2 rounded bg-gallery-hover">
                              <p className="text-white/40 mb-1">功率</p>
                              <p className="text-white font-medium">{adjustment.powerConsumption}W</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg border ${
                            adjustment.glareRisk === 'high' ? 'bg-yellow-500/10 border-yellow-500/30' :
                            adjustment.glareRisk === 'medium' ? 'bg-orange-500/10 border-orange-500/30' :
                            'bg-green-500/10 border-green-500/30'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Eye className={`w-3 h-3 ${
                                adjustment.glareRisk === 'high' ? 'text-yellow-400' :
                                adjustment.glareRisk === 'medium' ? 'text-orange-400' :
                                'text-green-400'
                              }`} />
                              <span className={`text-xs font-medium ${
                                adjustment.glareRisk === 'high' ? 'text-yellow-400' :
                                adjustment.glareRisk === 'medium' ? 'text-orange-400' :
                                'text-green-400'
                              }`}>
                                眩光风险：{adjustment.glareRisk === 'high' ? '高' : adjustment.glareRisk === 'medium' ? '中' : '低'}
                              </span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            adjustment.uvExposure === 'high' ? 'bg-purple-500/10 border-purple-500/30' :
                            adjustment.uvExposure === 'medium' ? 'bg-pink-500/10 border-pink-500/30' :
                            'bg-green-500/10 border-green-500/30'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <Sun className={`w-3 h-3 ${
                                adjustment.uvExposure === 'high' ? 'text-purple-400' :
                                adjustment.uvExposure === 'medium' ? 'text-pink-400' :
                                'text-green-400'
                              }`} />
                              <span className={`text-xs font-medium ${
                                adjustment.uvExposure === 'high' ? 'text-purple-400' :
                                adjustment.uvExposure === 'medium' ? 'text-pink-400' :
                                'text-green-400'
                              }`}>
                                紫外线：{adjustment.uvExposure === 'high' ? '高' : adjustment.uvExposure === 'medium' ? '中' : '低'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h5 className="text-xs font-medium text-white/70 mb-2">调整原因</h5>
                          <p className="text-xs text-white/60">{adjustment.adjustmentReason}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCompatibilityTab = () => {
    if (!currentAdaptation) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/60 mb-2">暂无兼容性检测数据</p>
          <p className="text-sm text-white/40">请先在场馆条件页面执行适配分析</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="card border-gold/30 bg-gradient-to-br from-gold/5 to-transparent">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gold mb-1">整体兼容性评估</h4>
                <p className="text-xs text-white/50">
                  {currentAdaptation.venueName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-gold">
                  {currentAdaptation.compatibilityScore}%
                </div>
                <div className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${
                  COMPATIBILITY_LEVEL_COLORS[currentAdaptation.overallCompatibility]
                }`}>
                  {COMPATIBILITY_LEVEL_LABELS[currentAdaptation.overallCompatibility]}
                </div>
              </div>
            </div>

            {compatibilityStats && (
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                  <div className="text-lg font-bold text-green-400">{compatibilityStats.compatible}</div>
                  <div className="text-[10px] text-green-400/70">完全兼容</div>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                  <div className="text-lg font-bold text-yellow-400">{compatibilityStats.warning}</div>
                  <div className="text-[10px] text-yellow-400/70">需要注意</div>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                  <div className="text-lg font-bold text-orange-400">{compatibilityStats.requires_adjustment}</div>
                  <div className="text-[10px] text-orange-400/70">需要调整</div>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                  <div className="text-lg font-bold text-red-400">{compatibilityStats.incompatible}</div>
                  <div className="text-[10px] text-red-400/70">不兼容</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Zap className="w-3 h-3" />
              总功率需求
            </div>
            <div className="text-base font-bold text-white">
              {currentAdaptation.totalPowerRequired}W
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Weight className="w-3 h-3" />
              总预估重量
            </div>
            <div className="text-base font-bold text-white">
              {currentAdaptation.totalWeightEstimate}kg
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gallery-bg border border-gallery-border">
            <div className="flex items-center gap-2 text-white/40 mb-1">
              <Clock className="w-3 h-3" />
              安装时间
            </div>
            <div className="text-base font-bold text-white">
              {currentAdaptation.estimatedInstallationTime}h
            </div>
          </div>
        </div>

        {currentAdaptation.compatibilityHints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">检测到的问题</h4>
            <div className="space-y-2">
              {currentAdaptation.compatibilityHints.map((hint) => {
                const isExpanded = expandedHintId === hint.id;
                return (
                  <motion.div
                    key={hint.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border overflow-hidden ${
                      COMPATIBILITY_LEVEL_COLORS[hint.level]
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedHintId(isExpanded ? null : hint.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-1.5 rounded ${
                            hint.level === 'compatible' ? 'bg-green-500/20 text-green-400' :
                            hint.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            hint.level === 'requires_adjustment' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {getCompatibilityIcon(hint.level)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(hint.category)}
                              <h5 className="text-sm font-medium text-white">{hint.title}</h5>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-1">{hint.description}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex items-center gap-2">
                          {hint.estimatedCostImpact && (
                            <span className="text-[10px] text-white/40">
                              ¥{hint.estimatedCostImpact}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white/40" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-white/10">
                            <div className="pt-4">
                              <p className="text-xs text-white/60 mb-3">{hint.description}</p>
                              
                              <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-3">
                                <p className="text-xs font-medium text-gold mb-1">建议方案</p>
                                <p className="text-xs text-white/70">{hint.suggestion}</p>
                              </div>

                              <div className="flex flex-wrap gap-3 text-xs">
                                {hint.estimatedCostImpact && (
                                  <div className="flex items-center gap-1 text-white/50">
                                    <span>预估费用影响：</span>
                                    <span className="text-white">¥{hint.estimatedCostImpact}</span>
                                  </div>
                                )}
                                {hint.estimatedTimeImpact && (
                                  <div className="flex items-center gap-1 text-white/50">
                                    <Clock className="w-3 h-3" />
                                    <span>预估时间影响：</span>
                                    <span className="text-white">{hint.estimatedTimeImpact}天</span>
                                  </div>
                                )}
                              </div>

                              {hint.affectedArtworkIds && hint.affectedArtworkIds.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-white/40 mb-2">受影响作品：</p>
                                  <div className="flex flex-wrap gap-1">
                                    {hint.affectedArtworkIds.map((artworkId) => {
                                      const artwork = artworks.find((a) => a.id === artworkId);
                                      return artwork ? (
                                        <span
                                          key={artworkId}
                                          className="text-[10px] px-2 py-0.5 bg-white/10 text-white/70 rounded"
                                        >
                                          {artwork.title}
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {currentAdaptation.compatibilityHints.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 font-medium mb-1">方案完全兼容</p>
            <p className="text-sm text-white/40">未检测到任何兼容性问题</p>
          </div>
        )}

        {currentAdaptation && (
          <div className="pt-4 border-t border-gallery-border">
            <button
              onClick={handleApplyAdaptation}
              disabled={currentAdaptation.overallCompatibility === 'incompatible'}
              className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              应用调整后的参数到方案
            </button>
            {currentAdaptation.overallCompatibility === 'incompatible' && (
              <p className="text-[10px] text-red-400 text-center mt-2">
                存在不兼容问题，需先解决后才能应用
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (tourAdaptationPanelTab) {
      case 'venue':
        return renderVenueTab();
      case 'mounting':
        return renderMountingTab();
      case 'lighting':
        return renderLightingTab();
      case 'compatibility':
        return renderCompatibilityTab();
      default:
        return null;
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
          <Building2 className="w-5 h-5 text-gold" />
          巡展适配
        </h3>
      </div>

      <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg mb-4">
        {TOUR_ADAPTATION_PANEL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTourAdaptationPanelTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-[10px] font-medium transition-all ${
              tourAdaptationPanelTab === tab.id
                ? 'bg-gold text-gallery-bg shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            {getTabIcon(tab.icon)}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {renderTabContent()}
      </div>

      {currentAdaptation && (
        <div className="mt-4 pt-4 border-t border-gallery-border">
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="space-y-1">
              <p className="text-white/40">适配场馆</p>
              <p className="text-white font-medium truncate">{currentAdaptation.venueName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40">兼容性</p>
              <p className={`font-medium ${COMPATIBILITY_LEVEL_COLORS[currentAdaptation.overallCompatibility].split(' ')[0]}`}>
                {COMPATIBILITY_LEVEL_LABELS[currentAdaptation.overallCompatibility]}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-white/40">匹配度</p>
              <p className="text-white font-medium">{currentAdaptation.compatibilityScore}%</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
