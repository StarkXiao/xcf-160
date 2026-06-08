import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Sun,
  Sparkles,
  Layers,
  Zap,
  Users,
  User,
  Grid3X3,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Slider } from '../ui/Slider';
import {
  LIGHT_TYPE_LABELS,
  LIGHTING_STRATEGY_MODE_LABELS,
} from '../../types';
import { generateTemperatureGradient } from '../../utils/color';
import type { LightType, LightingStrategyMode } from '../../types';

const lightTypeIcons: Record<LightType, React.ReactNode> = {
  spotlight: <Sparkles className="w-4 h-4" />,
  floodlight: <Sun className="w-4 h-4" />,
  ambient: <Lightbulb className="w-4 h-4" />,
};

const modeIcons: Record<LightingStrategyMode, React.ReactNode> = {
  uniform: <Users className="w-4 h-4" />,
  individual: <User className="w-4 h-4" />,
  zone: <Grid3X3 className="w-4 h-4" />,
};

export const LightingStrategyPanel: React.FC = () => {
  const {
    gallerySchemes,
    currentSchemeId,
    selectedWallArtworkIds,
    setLightingStrategy,
    applyLightingStrategyToSelected,
    updateWallArtworkLighting,
  } = useAppStore();

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const strategy = currentScheme?.lightingStrategy;

  if (!currentScheme || !strategy) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        请先选择一个方案
      </div>
    );
  }

  const temperatureGradient = generateTemperatureGradient();
  const globalLighting = strategy.globalLighting;

  const handleGlobalLightingChange = (updates: Partial<typeof globalLighting>) => {
    setLightingStrategy({
      globalLighting: { ...globalLighting, ...updates },
    });

    if (strategy.mode === 'uniform') {
      currentScheme.wallArtworks.forEach((wa) => {
        updateWallArtworkLighting(wa.id, updates, {
          description: '同步全局灯光策略',
          source: 'preset',
        });
      });
    }
  };

  const handleModeChange = (mode: LightingStrategyMode) => {
    setLightingStrategy({ mode });

    if (mode === 'uniform') {
      currentScheme.wallArtworks.forEach((wa) => {
        updateWallArtworkLighting(wa.id, { ...globalLighting }, {
          description: '应用统一灯光模式',
          source: 'preset',
        });
      });
    }
  };

  const handleApplyToSelected = () => {
    applyLightingStrategyToSelected();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold" />
          灯光策略
        </h3>
        <button
          onClick={() =>
            handleGlobalLightingChange({
              type: 'spotlight',
              colorTemperature: 3500,
              intensity: 0.8,
              angle: 45,
              positionX: 0,
              positionY: 2,
              positionZ: 3,
            })
          }
          className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
          title="重置灯光"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        <div>
          <label className="block text-sm text-white/70 mb-3">策略模式</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LIGHTING_STRATEGY_MODE_LABELS) as LightingStrategyMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                    strategy.mode === mode
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-gallery-border bg-gallery-bg text-white/60 hover:border-gold/50 hover:text-white'
                  }`}
                >
                  {modeIcons[mode]}
                  <span className="text-xs font-medium">
                    {LIGHTING_STRATEGY_MODE_LABELS[mode]}
                  </span>
                </button>
              )
            )}
          </div>
          <p className="mt-2 text-xs text-white/40">
            {strategy.mode === 'uniform' && '所有作品使用相同的灯光配置'}
            {strategy.mode === 'individual' && '每件作品独立配置灯光'}
            {strategy.mode === 'zone' && '按区域分组配置灯光'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              全局灯光配置
            </h4>
            {selectedWallArtworkIds.length > 0 && strategy.mode !== 'uniform' && (
              <button
                onClick={handleApplyToSelected}
                className="text-xs px-3 py-1.5 bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                应用到选中
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-3">光源类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(LIGHT_TYPE_LABELS) as LightType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleGlobalLightingChange({ type })}
                    className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${
                      globalLighting.type === type
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gallery-border bg-gallery-surface text-white/60 hover:border-gold/50 hover:text-white'
                    }`}
                  >
                    {lightTypeIcons[type]}
                    <span className="text-xs font-medium">
                      {LIGHT_TYPE_LABELS[type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">色温</label>
              <div
                className="h-2 rounded-full mb-3"
                style={{ background: temperatureGradient }}
              />
              <Slider
                value={globalLighting.colorTemperature}
                min={2000}
                max={10000}
                step={100}
                onChange={(v) => handleGlobalLightingChange({ colorTemperature: v })}
                unit="K"
                gradient={temperatureGradient}
              />
              <div className="flex justify-between mt-2 text-xs text-white/40">
                <span className="text-warm">暖光</span>
                <span className="text-cool">冷光</span>
              </div>
            </div>

            <div>
              <Slider
                value={globalLighting.intensity}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => handleGlobalLightingChange({ intensity: v })}
                label="亮度"
                unit="%"
                showValue={false}
              />
              <div className="flex justify-between mt-1 text-xs text-white/40">
                <span>0%</span>
                <span className="text-gold">
                  {Math.round(globalLighting.intensity * 100)}%
                </span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <Slider
                value={globalLighting.angle}
                min={15}
                max={90}
                step={1}
                onChange={(v) => handleGlobalLightingChange({ angle: v })}
                label="光束角度"
                unit="°"
              />
            </div>

            <div className="pt-4 border-t border-gallery-border">
              <h4 className="text-sm font-medium text-white/70 mb-4">灯光位置</h4>

              <div className="space-y-4">
                <div>
                  <Slider
                    value={globalLighting.positionX}
                    min={-3}
                    max={3}
                    step={0.1}
                    onChange={(v) => handleGlobalLightingChange({ positionX: v })}
                    label="水平位置"
                  />
                </div>

                <div>
                  <Slider
                    value={globalLighting.positionY}
                    min={-2}
                    max={4}
                    step={0.1}
                    onChange={(v) => handleGlobalLightingChange({ positionY: v })}
                    label="垂直位置"
                  />
                </div>

                <div>
                  <Slider
                    value={globalLighting.positionZ}
                    min={1}
                    max={6}
                    step={0.1}
                    onChange={(v) => handleGlobalLightingChange({ positionZ: v })}
                    label="照射距离"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
          <h4 className="text-sm font-medium text-white mb-3">快速预设</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'spotlight',
                  colorTemperature: 3200,
                  intensity: 0.85,
                  angle: 30,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-warm/10 border border-warm/30 text-warm hover:bg-warm/20 transition-colors"
            >
              温暖聚光
            </button>
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'spotlight',
                  colorTemperature: 5500,
                  intensity: 0.9,
                  angle: 25,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-cool/10 border border-cool/30 text-cool hover:bg-cool/20 transition-colors"
            >
              冷调聚光
            </button>
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'floodlight',
                  colorTemperature: 4200,
                  intensity: 0.6,
                  angle: 60,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
            >
              柔和泛光
            </button>
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'ambient',
                  colorTemperature: 3000,
                  intensity: 0.4,
                  angle: 90,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
            >
              环境光
            </button>
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'spotlight',
                  colorTemperature: 4000,
                  intensity: 0.75,
                  angle: 40,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            >
              博物馆标准
            </button>
            <button
              onClick={() =>
                handleGlobalLightingChange({
                  type: 'floodlight',
                  colorTemperature: 5000,
                  intensity: 0.7,
                  angle: 55,
                })
              }
              className="px-3 py-2 text-xs rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white transition-colors"
            >
              自然日光
            </button>
          </div>
        </div>

        {strategy.mode === 'zone' && strategy.zones.length > 0 && (
          <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
            <h4 className="text-sm font-medium text-white mb-3">灯光分区</h4>
            <div className="space-y-2">
              {strategy.zones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-3 rounded-lg bg-gallery-surface border border-gallery-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {zone.name}
                    </span>
                    <span className="text-xs text-white/50">
                      {zone.artworkIds.length} 件作品
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{zone.lighting.colorTemperature}K</span>
                    <span>·</span>
                    <span>{Math.round(zone.lighting.intensity * 100)}%</span>
                    <span>·</span>
                    <span>{LIGHT_TYPE_LABELS[zone.lighting.type]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
          <h4 className="text-sm font-medium text-white mb-2">当前方案统计</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gallery-surface">
              <p className="text-2xl font-display font-semibold text-gold">
                {currentScheme.wallArtworks.length}
              </p>
              <p className="text-xs text-white/50">作品数量</p>
            </div>
            <div className="p-3 rounded-lg bg-gallery-surface">
              <p className="text-2xl font-display font-semibold text-white">
                {Math.round(globalLighting.intensity * 100)}%
              </p>
              <p className="text-xs text-white/50">平均亮度</p>
            </div>
            <div className="p-3 rounded-lg bg-gallery-surface">
              <p className="text-2xl font-display font-semibold text-warm">
                {globalLighting.colorTemperature}
              </p>
              <p className="text-xs text-white/50">色温 (K)</p>
            </div>
            <div className="p-3 rounded-lg bg-gallery-surface">
              <p className="text-2xl font-display font-semibold text-cool">
                {globalLighting.angle}°
              </p>
              <p className="text-xs text-white/50">光束角度</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
