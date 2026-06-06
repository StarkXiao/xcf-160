import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Palette, Sun, Maximize2, RotateCcw, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  WALL_UNIT_LABELS,
  AMBIENT_LIGHT_PRESETS,
  AMBIENT_LIGHT_PRESET_LABELS,
  PREVIEW_ASPECT_RATIO_LABELS,
  PREVIEW_FIT_MODE_LABELS,
  DEFAULT_EXHIBITION_WALL_CONFIG,
} from '../../types';
import type {
  WallDimensions,
  AmbientLightTemplate,
  PreviewAspectRatio,
  PreviewFitMode,
} from '../../types';
import { kelvinToHex } from '../../utils/color';

type ConfigTab = 'dimensions' | 'wallColor' | 'ambientLight' | 'preview';

const tabConfig: { id: ConfigTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dimensions', label: '墙面尺寸', icon: <Maximize2 className="w-4 h-4" /> },
  { id: 'wallColor', label: '底色材质', icon: <Palette className="w-4 h-4" /> },
  { id: 'ambientLight', label: '环境光', icon: <Sun className="w-4 h-4" /> },
  { id: 'preview', label: '预览适配', icon: <Grid3X3 className="w-4 h-4" /> },
];

const presetWallColors = [
  { name: '经典黑', color: '#1a1a1a' },
  { name: '深灰', color: '#2d2d2d' },
  { name: '暖灰', color: '#3d352d' },
  { name: '冷灰', color: '#2d353d' },
  { name: '深蓝', color: '#1a2a3a' },
  { name: '深棕', color: '#2a1f1a' },
  { name: '米白', color: '#f5f0e6' },
  { name: '象牙白', color: '#fff8e7' },
];

export const ExhibitionWallConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('dimensions');
  const {
    exhibitionWallConfig,
    setWallDimensions,
    setWallColor,
    setAmbientLight,
    setPreviewAdaptation,
    resetExhibitionWallConfig,
  } = useAppStore();

  const { dimensions, wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;

  const handleDimensionChange = (key: keyof WallDimensions, value: number | string) => {
    setWallDimensions({ [key]: value } as Partial<WallDimensions>);
  };

  const handleWallColorChange = (key: string, value: unknown) => {
    setWallColor({ [key]: value });
  };

  const handlePresetColorClick = (color: string) => {
    setWallColor({ baseColor: color });
  };

  const handleAmbientLightSelect = (preset: AmbientLightTemplate) => {
    setAmbientLight(preset);
  };

  const handlePreviewAspectRatioChange = (ratio: PreviewAspectRatio) => {
    setPreviewAdaptation({ aspectRatio: ratio });
  };

  const handlePreviewFitModeChange = (mode: PreviewFitMode) => {
    setPreviewAdaptation({ fitMode: mode });
  };

  const getPreviewAspectRatioValue = () => {
    const ratioMap: Record<PreviewAspectRatio, { w: number; h: number }> = {
      '16:9': { w: 16, h: 9 },
      '4:3': { w: 4, h: 3 },
      '1:1': { w: 1, h: 1 },
      '9:16': { w: 9, h: 16 },
      'custom': { w: previewAdaptation.customWidth || 16, h: previewAdaptation.customHeight || 9 },
    };
    return ratioMap[previewAdaptation.aspectRatio];
  };

  const renderDimensionsTab = () => {
    const maxDim = Math.max(dimensions.width, dimensions.height);
    const previewWidth = Math.min(200, (dimensions.width / maxDim) * 200);
    const previewHeight = Math.min(200, (dimensions.height / maxDim) * 200);

    return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/70 mb-3">墙面尺寸</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-2">宽度</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2">高度</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-3">单位</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(WALL_UNIT_LABELS) as WallDimensions['unit'][]).map((unit) => (
            <button
              key={unit}
              onClick={() => handleDimensionChange('unit', unit)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                dimensions.unit === unit
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gallery-border bg-gallery-bg text-white/70 hover:border-gold/50 hover:text-white'
              }`}
            >
              {WALL_UNIT_LABELS[unit]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">尺寸预览</h4>
        <div className="flex items-center justify-center">
          <div
            className="relative border-2 border-dashed border-gold/30 rounded-lg"
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white/50">
                {dimensions.width} × {dimensions.height} {WALL_UNIT_LABELS[dimensions.unit]}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-white/40">宽高比</p>
            <p className="text-white font-medium">
              {(dimensions.width / dimensions.height).toFixed(2)}:1
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-white/40">面积</p>
            <p className="text-white font-medium">
              {dimensions.width * dimensions.height} {WALL_UNIT_LABELS[dimensions.unit]}²
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-gallery-bg to-gallery-surface border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">快速尺寸预设</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: '标准展墙', w: 600, h: 300 },
            { name: '大型展墙', w: 1000, h: 400 },
            { name: '小型展墙', w: 400, h: 250 },
            { name: '方形展墙', w: 400, h: 400 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setWallDimensions({
                  width: preset.w,
                  height: preset.h,
                  unit: 'cm',
                });
              }}
              className="px-3 py-2 rounded-lg bg-gallery-hover border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 text-xs transition-colors"
            >
              <p className="font-medium">{preset.name}</p>
              <p className="text-white/40 text-[10px]">{preset.w} × {preset.h} cm</p>
            </button>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderWallColorTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/70 mb-3">预设颜色</label>
        <div className="grid grid-cols-4 gap-2">
          {presetWallColors.map((preset) => (
            <button
              key={preset.color}
              onClick={() => handlePresetColorClick(preset.color)}
              className={`relative aspect-square rounded-lg border-2 transition-all ${
                wallColor.baseColor === preset.color
                  ? 'border-gold ring-2 ring-gold/30'
                  : 'border-gallery-border hover:border-gold/50'
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            >
              {wallColor.baseColor === preset.color && (
                <Check className="w-4 h-4 absolute top-1 right-1 text-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-3">自定义颜色</label>
        <div className="flex gap-3">
          <input
            type="color"
            value={wallColor.baseColor}
            onChange={(e) => handleWallColorChange('baseColor', e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gallery-border cursor-pointer"
          />
          <input
            type="text"
            value={wallColor.baseColor}
            onChange={(e) => handleWallColorChange('baseColor', e.target.value)}
            className="flex-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
            placeholder="#1a1a1a"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gallery-border">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-white/70">纹理效果</label>
          <button
            onClick={() => handleWallColorChange('textureEnabled', !wallColor.textureEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              wallColor.textureEnabled ? 'bg-gold' : 'bg-gallery-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                wallColor.textureEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {wallColor.textureEnabled && (
          <div>
            <div className="flex justify-between mt-2 mb-2 text-xs text-white/40">
              <span>纹理强度</span>
              <span className="text-gold">{Math.round(wallColor.textureIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={wallColor.textureIntensity}
              onChange={(e) => handleWallColorChange('textureIntensity', Number(e.target.value))}
              className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-white/70">渐变效果</label>
          <button
            onClick={() => handleWallColorChange('gradientEnabled', !wallColor.gradientEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              wallColor.gradientEnabled ? 'bg-gold' : 'bg-gallery-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                wallColor.gradientEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {wallColor.gradientEnabled && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
              <label className="block text-xs text-white/50 mb-2">渐变颜色</label>
              <input
                type="color"
                value={wallColor.gradientColor}
                onChange={(e) => handleWallColorChange('gradientColor', e.target.value)}
                className="w-full h-10 rounded-lg border-2 border-gallery-border cursor-pointer"
              />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-white/50 mb-2">角度</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={wallColor.gradientAngle}
                    onChange={(e) => handleWallColorChange('gradientAngle', Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
                  />
                  <span className="text-white/40 text-sm">°</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">效果预览</h4>
        <div
          className="w-full h-32 rounded-lg border border-gallery-border"
          style={{
            background: wallColor.gradientEnabled
              ? `linear-gradient(${wallColor.gradientAngle}deg, ${wallColor.baseColor}, ${wallColor.gradientColor})`
              : wallColor.baseColor,
          }}
        />
      </div>
    </div>
  );

  const renderAmbientLightTab = () => {
    const colorTempPercent = ((ambientLight.colorTemperature - 2000) / (10000 - 2000)) * 100;
    
    return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/70 mb-3">环境光预设</label>
        <div className="grid grid-cols-2 gap-2">
          {AMBIENT_LIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleAmbientLightSelect(preset)}
              className={`p-3 rounded-lg border text-left transition-all ${
                ambientLight.id === preset.id
                  ? 'border-gold bg-gold/10'
                  : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: preset.ambientColor }}
                />
                <span className={`text-sm font-medium ${
                  ambientLight.id === preset.id ? 'text-gold' : 'text-white'
                }`}>
                  {preset.name}
                </span>
              </div>
              <p className="text-[10px] text-white/40 line-clamp-2">
                {preset.description}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-white/50">
                <span>{preset.colorTemperature}K</span>
                <span>·</span>
                <span>强度 {Math.round(preset.intensity * 100)}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-gallery-bg to-gallery-surface border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">当前配置</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-gold/50"
              style={{
                backgroundColor: ambientLight.ambientColor,
                boxShadow: `0 0 20px ${ambientLight.ambientColor}40`,
              }}
            />
            <div>
              <p className="text-sm font-medium text-white">
                {AMBIENT_LIGHT_PRESET_LABELS[ambientLight.preset]}
              </p>
              <p className="text-xs text-white/50">
                {ambientLight.colorTemperature}K · 强度 {Math.round(ambientLight.intensity * 100)}%
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-white/40">
              <span>色温</span>
              <span className="text-gold">{ambientLight.colorTemperature}K</span>
            </div>
            <div
              className="w-full h-2 rounded-full mt-1"
              style={{
                background: `linear-gradient(to right, ${kelvinToHex(2000)}, ${kelvinToHex(6500)})`,
              }}
            >
              <div
                className="h-2 w-2 bg-white rounded-full relative"
                style={{
                  left: `${colorTempPercent}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-white/40">
              <span>环境光强度</span>
              <span className="text-gold">{Math.round(ambientLight.intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientLight.intensity}
              onChange={(e) => {
                const intensity = Number(e.target.value);
                setAmbientLight({
                  ...ambientLight,
                  intensity,
                });
              }}
              className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold mt-1"
            />
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderPreviewTab = () => {
    const ratio = getPreviewAspectRatioValue();
    const maxRatio = Math.max(ratio.w, ratio.h);
    const previewWidth = Math.min(240, (ratio.w / maxRatio) * 240);
    const previewHeight = Math.min(240, (ratio.h / maxRatio) * 240);

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-white/70 mb-3">宽高比</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PREVIEW_ASPECT_RATIO_LABELS) as PreviewAspectRatio[]).map((r) => (
              <button
                key={r}
                onClick={() => handlePreviewAspectRatioChange(r)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  previewAdaptation.aspectRatio === r
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gallery-border bg-gallery-bg text-white/70 hover:border-gold/50 hover:text-white'
                }`}
              >
                {PREVIEW_ASPECT_RATIO_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {previewAdaptation.aspectRatio === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-2">自定义宽度</label>
              <input
                type="number"
                value={previewAdaptation.customWidth || 16}
                onChange={(e) => setPreviewAdaptation({ customWidth: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2">自定义高度</label>
              <input
                type="number"
                value={previewAdaptation.customHeight || 9}
                onChange={(e) => setPreviewAdaptation({ customHeight: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-white/70 mb-3">适配模式</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PREVIEW_FIT_MODE_LABELS) as PreviewFitMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handlePreviewFitModeChange(mode)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  previewAdaptation.fitMode === mode
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-gallery-border bg-gallery-bg text-white/70 hover:border-gold/50 hover:text-white'
                }`}
              >
                {PREVIEW_FIT_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>内边距</span>
            <span className="text-gold">{previewAdaptation.padding}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={previewAdaptation.padding}
            onChange={(e) => setPreviewAdaptation({ padding: Number(e.target.value) })}
            className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-gallery-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">显示网格</p>
              <p className="text-xs text-white/40">辅助对齐参考线</p>
            </div>
            <button
              onClick={() => setPreviewAdaptation({ showGrid: !previewAdaptation.showGrid })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                previewAdaptation.showGrid ? 'bg-gold' : 'bg-gallery-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  previewAdaptation.showGrid ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {previewAdaptation.showGrid && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>网格大小</span>
                <span className="text-gold">{previewAdaptation.gridSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={previewAdaptation.gridSize}
                onChange={(e) => setPreviewAdaptation({ gridSize: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">安全区域</p>
              <p className="text-xs text-white/40">显示安全边距指示</p>
            </div>
            <button
              onClick={() => setPreviewAdaptation({ showSafeArea: !previewAdaptation.showSafeArea })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                previewAdaptation.showSafeArea ? 'bg-gold' : 'bg-gallery-border'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  previewAdaptation.showSafeArea ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {previewAdaptation.showSafeArea && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>安全边距</span>
                <span className="text-gold">{previewAdaptation.safeAreaMargin}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={previewAdaptation.safeAreaMargin}
                onChange={(e) => setPreviewAdaptation({ safeAreaMargin: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
          <h4 className="text-sm font-medium text-white mb-3">预览效果</h4>
          <div className="flex items-center justify-center">
            <div
              className="relative border-2 border-dashed border-gold/30 rounded-lg bg-gallery-surface overflow-hidden"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
              }}
            >
              {previewAdaptation.showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: `${previewAdaptation.gridSize}px ${previewAdaptation.gridSize}px`,
                  }}
                />
              )}
              {previewAdaptation.showSafeArea && (
                <div
                  className="absolute border-2 border-dashed border-red-500/50 pointer-events-none"
                  style={{
                    top: `${previewAdaptation.safeAreaMargin}%`,
                    left: `${previewAdaptation.safeAreaMargin}%`,
                    right: `${previewAdaptation.safeAreaMargin}%`,
                    bottom: `${previewAdaptation.safeAreaMargin}%`,
                  }}
                />
              )}
              <div
                className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-xs text-white/50">
                  {ratio.w}:{ratio.h}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dimensions':
        return renderDimensionsTab();
      case 'wallColor':
        return renderWallColorTab();
      case 'ambientLight':
        return renderAmbientLightTab();
      case 'preview':
        return renderPreviewTab();
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
          <Grid3X3 className="w-5 h-5 text-gold" />
          展墙环境配置
        </h3>
        <button
          onClick={resetExhibitionWallConfig}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
          title="重置配置"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg mb-4">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-md text-[10px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gold text-gallery-bg shadow-lg shadow-gold/20'
                : 'text-white/60 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {renderTabContent()}
      </div>

      <div className="mt-4 pt-4 border-t border-gallery-border">
        <div className="grid grid-cols-2 gap-2 text-[10px] text-white/50">
          <div className="space-y-1">
            <p className="text-white/40">墙面尺寸</p>
            <p className="text-white font-medium">
              {dimensions.width} × {dimensions.height} {WALL_UNIT_LABELS[dimensions.unit]}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-white/40">环境光</p>
            <p className="text-white font-medium">
              {AMBIENT_LIGHT_PRESET_LABELS[ambientLight.preset]}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-white/40">底色</p>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: wallColor.baseColor }}
              />
              <span className="text-white font-medium">{wallColor.baseColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-white/40">预览比例</p>
            <p className="text-white font-medium">
              {PREVIEW_ASPECT_RATIO_LABELS[previewAdaptation.aspectRatio]}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
