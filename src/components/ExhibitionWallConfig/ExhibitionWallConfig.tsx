import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Palette, Sun, Maximize2, RotateCcw, Check, Crosshair, Ruler, Move, Eye, Monitor, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  WALL_UNIT_LABELS,
  AMBIENT_LIGHT_PRESETS,
  AMBIENT_LIGHT_PRESET_LABELS,
  PREVIEW_ASPECT_RATIO_LABELS,
  PREVIEW_FIT_MODE_LABELS,
  DIMENSION_UNIT_LABELS,
  DEFAULT_GUIDE_LINES,
  DEFAULT_ZOOM_PAN,
  DEFAULT_DIMENSIONS,
  DEFAULT_DISPLAY_MODE,
} from '../../types';
import type {
  WallDimensions,
  AmbientLightTemplate,
  PreviewAspectRatio,
  PreviewFitMode,
  DimensionConfig,
} from '../../types';
import { kelvinToHex } from '../../utils/color';

type ConfigTab = 'dimensions' | 'wallColor' | 'ambientLight' | 'preview' | 'guidelines' | 'dimensionsPanel' | 'zoomPan' | 'display';

const tabConfig: { id: ConfigTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dimensions', label: '墙面尺寸', icon: <Maximize2 className="w-4 h-4" /> },
  { id: 'wallColor', label: '底色材质', icon: <Palette className="w-4 h-4" /> },
  { id: 'ambientLight', label: '环境光', icon: <Sun className="w-4 h-4" /> },
  { id: 'preview', label: '预览适配', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'guidelines', label: '参考线', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'dimensionsPanel', label: '尺寸标注', icon: <Ruler className="w-4 h-4" /> },
  { id: 'zoomPan', label: '缩放平移', icon: <Move className="w-4 h-4" /> },
  { id: 'display', label: '显示模式', icon: <Monitor className="w-4 h-4" /> },
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
    setGuideLines,
    setZoomPan,
    setDimensionsConfig,
    setDisplayMode,
    resetExhibitionWallConfig,
    resetZoomPan,
    resetGuideLines,
  } = useAppStore();

  const { dimensions, wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;
  const { guideLines, zoomPan, dimensions: dimensionsConfig, displayMode } = previewAdaptation;

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
              className="relative border-2 border-dashed border-gold/30 rounded-lg overflow-hidden"
              style={{
                width: '240px',
                height: '240px',
                backgroundColor: '#0a0a0a',
              }}
            >
              <div className="absolute top-1 left-1 text-[9px] text-white/30">预览区域</div>
              
              <div
                className="absolute transition-all duration-300 rounded bg-gallery-surface"
                style={{
                  width: `${previewWidth}px`,
                  height: `${previewHeight}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: wallColor.baseColor,
                }}
              >
                {wallColor.gradientEnabled && (
                  <div
                    className="absolute inset-0 rounded"
                    style={{
                      background: `linear-gradient(${wallColor.gradientAngle}deg, ${wallColor.baseColor}, ${wallColor.gradientColor})`,
                    }}
                  />
                )}
                
                {wallColor.textureEnabled && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,${wallColor.textureIntensity * 0.3}) 100%)`,
                    }}
                  />
                )}
                
                {previewAdaptation.showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: `${previewAdaptation.gridSize / 3}px ${previewAdaptation.gridSize / 3}px`,
                    }}
                  />
                )}
                
                {previewAdaptation.showSafeArea && (
                  <div
                    className="absolute border border-dashed border-red-500/50 pointer-events-none rounded"
                    style={{
                      top: `${previewAdaptation.safeAreaMargin}%`,
                      left: `${previewAdaptation.safeAreaMargin}%`,
                      right: `${previewAdaptation.safeAreaMargin}%`,
                      bottom: `${previewAdaptation.safeAreaMargin}%`,
                    }}
                  />
                )}
                
                <div
                  className="absolute rounded"
                  style={{
                    left: '20%',
                    top: '25%',
                    width: '25%',
                    height: '40%',
                    backgroundColor: '#d4af37',
                    opacity: 0.6,
                  }}
                />
                <div
                  className="absolute rounded"
                  style={{
                    left: '55%',
                    top: '35%',
                    width: '30%',
                    height: '30%',
                    backgroundColor: '#e0f0ff',
                    opacity: 0.6,
                  }}
                />
                
                <div className="absolute bottom-1 right-1 text-[9px] text-white/40">
                  {ratio.w}:{ratio.h}
                </div>
              </div>
              
              <div className="absolute bottom-1 left-1 text-[9px] text-white/30">
                {PREVIEW_FIT_MODE_LABELS[previewAdaptation.fitMode]}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGuideLinesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">启用参考线</p>
          <p className="text-xs text-white/40">显示构图辅助线</p>
        </div>
        <button
          onClick={() => setGuideLines({ enabled: !guideLines.enabled })}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            guideLines.enabled ? 'bg-gold' : 'bg-gallery-border'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              guideLines.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {guideLines.enabled && (
        <>
          <div className="space-y-4 pt-4 border-t border-gallery-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">中心线</p>
                <p className="text-xs text-white/40">水平和垂直中心轴线</p>
              </div>
              <button
                onClick={() => setGuideLines({ showCenterLines: !guideLines.showCenterLines })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  guideLines.showCenterLines ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    guideLines.showCenterLines ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">三等分线</p>
                <p className="text-xs text-white/40">三分构图法辅助线</p>
              </div>
              <button
                onClick={() => setGuideLines({ showThirds: !guideLines.showThirds })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  guideLines.showThirds ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    guideLines.showThirds ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">黄金分割线</p>
                <p className="text-xs text-white/40">38.2% 和 61.8% 分割线</p>
              </div>
              <button
                onClick={() => setGuideLines({ showGoldenRatio: !guideLines.showGoldenRatio })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  guideLines.showGoldenRatio ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    guideLines.showGoldenRatio ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">十字准星</p>
                <p className="text-xs text-white/40">中心定位十字标记</p>
              </div>
              <button
                onClick={() => setGuideLines({ showCrosshair: !guideLines.showCrosshair })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  guideLines.showCrosshair ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    guideLines.showCrosshair ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">边界标记</p>
                <p className="text-xs text-white/40">边缘安全区指示</p>
              </div>
              <button
                onClick={() => setGuideLines({ showBorderMarkers: !guideLines.showBorderMarkers })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  guideLines.showBorderMarkers ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    guideLines.showBorderMarkers ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gallery-border">
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>参考线颜色</span>
              </div>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={guideLines.color}
                  onChange={(e) => setGuideLines({ color: e.target.value })}
                  className="w-12 h-12 rounded-lg border-2 border-gallery-border cursor-pointer"
                />
                <input
                  type="text"
                  value={guideLines.color}
                  onChange={(e) => setGuideLines({ color: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>透明度</span>
                <span className="text-gold">{Math.round(guideLines.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={guideLines.opacity}
                onChange={(e) => setGuideLines({ opacity: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          </div>

          <button
            onClick={resetGuideLines}
            className="w-full py-2 px-4 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white/70 hover:text-white hover:border-gold/50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置参考线设置
          </button>
        </>
      )}

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">参考线预览</h4>
        <div className="relative w-full aspect-[4/3] bg-gallery-surface rounded-lg overflow-hidden">
          {guideLines.enabled && (
            <>
              {guideLines.showCenterLines && (
                <>
                  <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity }} />
                  <div className="absolute top-1/2 left-0 right-0 h-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity }} />
                </>
              )}
              {guideLines.showThirds && (
                <>
                  <div className="absolute left-[33.33%] top-0 bottom-0 w-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.7 }} />
                  <div className="absolute left-[66.67%] top-0 bottom-0 w-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.7 }} />
                  <div className="absolute top-[33.33%] left-0 right-0 h-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.7 }} />
                  <div className="absolute top-[66.67%] left-0 right-0 h-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.7 }} />
                </>
              )}
              {guideLines.showGoldenRatio && (
                <>
                  <div className="absolute left-[38.2%] top-0 bottom-0 w-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.8 }} />
                  <div className="absolute left-[61.8%] top-0 bottom-0 w-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.8 }} />
                  <div className="absolute top-[38.2%] left-0 right-0 h-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.8 }} />
                  <div className="absolute top-[61.8%] left-0 right-0 h-px" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity * 0.8 }} />
                </>
              )}
              {guideLines.showCrosshair && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity }} />
                    <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity }} />
                    <div className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: guideLines.color, opacity: guideLines.opacity }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div className="absolute bottom-2 left-2 text-[10px] text-white/40">
            {guideLines.enabled ? '参考线已启用' : '参考线已关闭'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDimensionsPanelTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">启用尺寸标注</p>
          <p className="text-xs text-white/40">显示尺寸和比例信息</p>
        </div>
        <button
          onClick={() => setDimensionsConfig({ enabled: !dimensionsConfig.enabled })}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            dimensionsConfig.enabled ? 'bg-gold' : 'bg-gallery-border'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              dimensionsConfig.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {dimensionsConfig.enabled && (
        <>
          <div className="space-y-4 pt-4 border-t border-gallery-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">作品尺寸</p>
                <p className="text-xs text-white/40">显示每件作品的尺寸信息</p>
              </div>
              <button
                onClick={() => setDimensionsConfig({ showArtworkDimensions: !dimensionsConfig.showArtworkDimensions })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dimensionsConfig.showArtworkDimensions ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    dimensionsConfig.showArtworkDimensions ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">墙面尺寸</p>
                <p className="text-xs text-white/40">显示墙面整体尺寸</p>
              </div>
              <button
                onClick={() => setDimensionsConfig({ showWallDimensions: !dimensionsConfig.showWallDimensions })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dimensionsConfig.showWallDimensions ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    dimensionsConfig.showWallDimensions ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">标尺</p>
                <p className="text-xs text-white/40">显示边缘刻度标尺</p>
              </div>
              <button
                onClick={() => setDimensionsConfig({ showRuler: !dimensionsConfig.showRuler })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dimensionsConfig.showRuler ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    dimensionsConfig.showRuler ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">比例参考</p>
                <p className="text-xs text-white/40">显示比例尺参照物</p>
              </div>
              <button
                onClick={() => setDimensionsConfig({ showScaleReference: !dimensionsConfig.showScaleReference })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dimensionsConfig.showScaleReference ? 'bg-gold' : 'bg-gallery-border'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    dimensionsConfig.showScaleReference ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gallery-border">
            <div>
              <label className="block text-sm text-white/70 mb-3">单位</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DIMENSION_UNIT_LABELS) as DimensionConfig['unit'][]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setDimensionsConfig({ unit })}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      dimensionsConfig.unit === unit
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gallery-border bg-gallery-bg text-white/70 hover:border-gold/50 hover:text-white'
                    }`}
                  >
                    {DIMENSION_UNIT_LABELS[unit]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>小数精度</span>
                <span className="text-gold">{dimensionsConfig.precision} 位</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={dimensionsConfig.precision}
                onChange={(e) => setDimensionsConfig({ precision: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>
          </div>

          <button
            onClick={() => setDimensionsConfig({ ...DEFAULT_DIMENSIONS })}
            className="w-full py-2 px-4 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white/70 hover:text-white hover:border-gold/50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置尺寸设置
          </button>
        </>
      )}

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">尺寸标注预览</h4>
        <div className="relative w-full aspect-[4/3] bg-gallery-surface rounded-lg overflow-hidden">
          {dimensionsConfig.enabled && dimensionsConfig.showRuler && (
            <>
              <div className="absolute top-0 left-0 right-0 h-4 bg-gallery-bg/80 flex items-end overflow-hidden">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex-1 relative">
                    <div
                      className="absolute bottom-0 left-0 w-px bg-gold/60"
                      style={{ height: i % 2 === 0 ? '10px' : '5px' }}
                    />
                    {i % 2 === 0 && (
                      <span className="absolute bottom-0.5 left-1 text-[7px] text-gold/80">
                        {i * 10}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute top-0 left-0 bottom-0 w-4 bg-gallery-bg/80 flex flex-col items-end overflow-hidden">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 relative w-full">
                    <div
                      className="absolute right-0 top-0 h-px bg-gold/60"
                      style={{ width: i % 2 === 0 ? '10px' : '5px' }}
                    />
                    {i % 2 === 0 && (
                      <span className="absolute top-0.5 right-0.5 text-[7px] text-gold/80">
                        {i * 10}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="absolute left-[25%] top-[30%] w-[20%] h-[40%] bg-gold/30 rounded">
            {dimensionsConfig.enabled && dimensionsConfig.showArtworkDimensions && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gallery-surface/90 rounded text-[8px] text-gold whitespace-nowrap">
                50 × 100 {dimensionsConfig.unit}
              </div>
            )}
          </div>
          <div className="absolute left-[55%] top-[40%] w-[25%] h-[30%] bg-blue-200/30 rounded">
            {dimensionsConfig.enabled && dimensionsConfig.showArtworkDimensions && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gallery-surface/90 rounded text-[8px] text-gold whitespace-nowrap">
                60 × 70 {dimensionsConfig.unit}
              </div>
            )}
          </div>
          {dimensionsConfig.enabled && dimensionsConfig.showScaleReference && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-gallery-bg/90 rounded text-[8px] text-white/80">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-0.5 bg-gold/60 relative">
                  <div className="absolute top-0 left-0 w-px h-1.5 bg-gold/60 -translate-y-1/2" />
                  <div className="absolute top-0 right-0 w-px h-1.5 bg-gold/60 -translate-y-1/2" />
                </div>
                <span>50 {dimensionsConfig.unit}</span>
              </div>
            </div>
          )}
          {dimensionsConfig.enabled && dimensionsConfig.showWallDimensions && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-gallery-bg/90 rounded text-[8px] text-white/80">
              <div className="flex items-center gap-1">
                <Ruler className="w-2.5 h-2.5 text-gold" />
                <span>800 × 400 cm</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderZoomPanTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">启用缩放平移</p>
          <p className="text-xs text-white/40">滚轮缩放和拖拽平移</p>
        </div>
        <button
          onClick={() => setZoomPan({ enabled: !zoomPan.enabled })}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            zoomPan.enabled ? 'bg-gold' : 'bg-gallery-border'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              zoomPan.enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {zoomPan.enabled && (
        <>
          <div className="space-y-4 pt-4 border-t border-gallery-border">
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>当前缩放</span>
                <span className="text-gold">{Math.round(zoomPan.zoomLevel * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newZoom = Math.max(zoomPan.minZoom, zoomPan.zoomLevel - zoomPan.zoomStep);
                    setZoomPan({ zoomLevel: newZoom });
                  }}
                  className="p-2 bg-gallery-bg border border-gallery-border rounded-lg text-white/70 hover:text-white hover:border-gold/50 transition-all"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={zoomPan.minZoom}
                  max={zoomPan.maxZoom}
                  step={zoomPan.zoomStep}
                  value={zoomPan.zoomLevel}
                  onChange={(e) => setZoomPan({ zoomLevel: Number(e.target.value) })}
                  className="flex-1 h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <button
                  onClick={() => {
                    const newZoom = Math.min(zoomPan.maxZoom, zoomPan.zoomLevel + zoomPan.zoomStep);
                    setZoomPan({ zoomLevel: newZoom });
                  }}
                  className="p-2 bg-gallery-bg border border-gallery-border rounded-lg text-white/70 hover:text-white hover:border-gold/50 transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>最小缩放</span>
                <span className="text-gold">{Math.round(zoomPan.minZoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="1"
                step="0.05"
                value={zoomPan.minZoom}
                onChange={(e) => setZoomPan({ minZoom: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>最大缩放</span>
                <span className="text-gold">{Math.round(zoomPan.maxZoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={zoomPan.maxZoom}
                onChange={(e) => setZoomPan({ maxZoom: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>缩放步长</span>
                <span className="text-gold">{Math.round(zoomPan.zoomStep * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={zoomPan.zoomStep}
                onChange={(e) => setZoomPan({ zoomStep: Number(e.target.value) })}
                className="w-full h-2 bg-gallery-border rounded-lg appearance-none cursor-pointer accent-gold"
              />
            </div>

            <div className="p-3 rounded-lg bg-gallery-bg/50 border border-gallery-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">当前位置</p>
                  <p className="text-[10px] text-white/40 font-mono">
                    X: {zoomPan.panX.toFixed(0)}, Y: {zoomPan.panY.toFixed(0)}
                  </p>
                </div>
                <button
                  onClick={resetZoomPan}
                  className="px-3 py-1.5 bg-gold/10 text-gold text-xs rounded-lg hover:bg-gold/20 transition-colors"
                >
                  重置位置
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setZoomPan({ ...DEFAULT_ZOOM_PAN })}
            className="w-full py-2 px-4 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white/70 hover:text-white hover:border-gold/50 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置缩放设置
          </button>
        </>
      )}

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">快捷键</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/60">放大</span>
            <span className="text-gold font-mono">+ 或 滚轮上</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">缩小</span>
            <span className="text-gold font-mono">- 或 滚轮下</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">重置视图</span>
            <span className="text-gold font-mono">R</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">平移</span>
            <span className="text-gold font-mono">拖拽 (缩放 {'>'} 100% 时)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">显示控制栏</p>
            <p className="text-xs text-white/40">显示顶部标题栏</p>
          </div>
          <button
            onClick={() => setDisplayMode({ showControls: !displayMode.showControls })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              displayMode.showControls ? 'bg-gold' : 'bg-gallery-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                displayMode.showControls ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">显示信息覆盖层</p>
            <p className="text-xs text-white/40">显示角落的配置信息</p>
          </div>
          <button
            onClick={() => setDisplayMode({ showInfoOverlay: !displayMode.showInfoOverlay })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              displayMode.showInfoOverlay ? 'bg-gold' : 'bg-gallery-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                displayMode.showInfoOverlay ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-4">快捷模式</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDisplayMode({ isFullscreen: !displayMode.isFullscreen })}
            className={`p-4 rounded-xl border text-left transition-all ${
              displayMode.isFullscreen
                ? 'border-gold bg-gold/10'
                : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className={`w-5 h-5 ${displayMode.isFullscreen ? 'text-gold' : 'text-white/60'}`} />
              <span className={`font-medium ${displayMode.isFullscreen ? 'text-gold' : 'text-white'}`}>
                全屏模式
              </span>
            </div>
            <p className="text-[10px] text-white/40">预览区域全屏显示</p>
            <p className="text-[10px] text-gold/60 mt-1">快捷键: F</p>
          </button>

          <button
            onClick={() => setDisplayMode({ immersiveMode: !displayMode.immersiveMode })}
            className={`p-4 rounded-xl border text-left transition-all ${
              displayMode.immersiveMode
                ? 'border-gold bg-gold/10'
                : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className={`w-5 h-5 ${displayMode.immersiveMode ? 'text-gold' : 'text-white/60'}`} />
              <span className={`font-medium ${displayMode.immersiveMode ? 'text-gold' : 'text-white'}`}>
                沉浸模式
              </span>
            </div>
            <p className="text-[10px] text-white/40">2秒无操作自动隐藏UI</p>
            <p className="text-[10px] text-gold/60 mt-1">快捷键: I</p>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-4">快速预设</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              setDisplayMode({ showControls: true, showInfoOverlay: true, immersiveMode: false, isFullscreen: false });
              setGuideLines({ ...DEFAULT_GUIDE_LINES });
              setZoomPan({ ...DEFAULT_ZOOM_PAN });
              setDimensionsConfig({ ...DEFAULT_DIMENSIONS });
            }}
            className="w-full p-3 rounded-lg border border-gallery-border bg-gallery-bg text-left hover:border-gold/50 transition-all"
          >
            <p className="text-sm text-white font-medium">标准模式</p>
            <p className="text-xs text-white/40">显示所有控制，无辅助线</p>
          </button>

          <button
            onClick={() => {
              setDisplayMode({ showControls: true, showInfoOverlay: true, immersiveMode: false, isFullscreen: false });
              setGuideLines({ enabled: true, showCenterLines: true, showThirds: true, showGoldenRatio: false, showCrosshair: false, showBorderMarkers: false, color: '#d4af37', opacity: 0.6 });
              setDimensionsConfig({ enabled: true, showArtworkDimensions: true, showWallDimensions: true, showRuler: true, showScaleReference: true, unit: 'cm', precision: 1 });
            }}
            className="w-full p-3 rounded-lg border border-gallery-border bg-gallery-bg text-left hover:border-gold/50 transition-all"
          >
            <p className="text-sm text-white font-medium">布展模式</p>
            <p className="text-xs text-white/40">显示辅助线和尺寸标注</p>
          </button>

          <button
            onClick={() => {
              setDisplayMode({ showControls: false, showInfoOverlay: false, immersiveMode: true, isFullscreen: true });
              setGuideLines({ enabled: false, showCenterLines: false, showGoldenRatio: false, showThirds: false, showCrosshair: false, showBorderMarkers: false, color: '#d4af37', opacity: 0.6 });
              setDimensionsConfig({ enabled: false, showArtworkDimensions: false, showWallDimensions: false, showRuler: false, showScaleReference: false, unit: 'cm', precision: 1 });
            }}
            className="w-full p-3 rounded-lg border border-gallery-border bg-gallery-bg text-left hover:border-gold/50 transition-all"
          >
            <p className="text-sm text-white font-medium">欣赏模式</p>
            <p className="text-xs text-white/40">全屏沉浸，无干扰</p>
          </button>
        </div>
      </div>

      <button
        onClick={() => setDisplayMode({ ...DEFAULT_DISPLAY_MODE })}
        className="w-full py-2 px-4 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white/70 hover:text-white hover:border-gold/50 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        重置显示设置
      </button>

      <div className="p-4 rounded-xl bg-gallery-bg border border-gallery-border">
        <h4 className="text-sm font-medium text-white mb-3">快捷键</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/60">全屏模式</span>
            <span className="text-gold font-mono">F</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">沉浸模式</span>
            <span className="text-gold font-mono">I</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">退出全屏/沉浸</span>
            <span className="text-gold font-mono">ESC</span>
          </div>
        </div>
      </div>
    </div>
  );

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
      case 'guidelines':
        return renderGuideLinesTab();
      case 'dimensionsPanel':
        return renderDimensionsPanelTab();
      case 'zoomPan':
        return renderZoomPanTab();
      case 'display':
        return renderDisplayTab();
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
