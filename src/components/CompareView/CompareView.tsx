import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, Plus, Play } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GalleryPreview } from '../GalleryPreview/GalleryPreview';
import { kelvinToHex } from '../../utils/color';
import { LIGHT_TYPE_LABELS, FRAME_MATERIAL_LABELS } from '../../types';

export const CompareView: React.FC = () => {
  const { presets, compareList, addToCompare, removeFromCompare, loadPreset, setActivePanel } =
    useAppStore();

  const comparePresets = presets.filter((p) => compareList.includes(p.id));

  const availablePresets = presets.filter((p) => !compareList.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-gold" />
          方案对比
        </h3>
        <span className="text-xs text-white/40">
          {compareList.length}/4 个方案
        </span>
      </div>

      {compareList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
            <GitCompare className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/60 mb-2">暂无对比方案</p>
          <p className="text-sm text-white/40 mb-4">
            从下方选择已保存的方案添加到对比列表
          </p>
          <button
            onClick={() => setActivePanel('storage')}
            className="btn-primary text-sm"
          >
            去保存方案
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-1 mb-4">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${Math.min(compareList.length, 2)}, 1fr)`,
              }}
            >
              <AnimatePresence mode="popLayout">
                {comparePresets.map((preset) => {
                  const lightColor = kelvinToHex(preset.lighting.colorTemperature);
                  return (
                    <motion.div
                      key={preset.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="card overflow-hidden"
                    >
                      <div className="relative aspect-video bg-gallery-bg">
                        <div className="absolute inset-0 scale-[0.85]">
                          <GalleryPreview
                            overrideLighting={preset.lighting}
                            overrideMaterial={preset.material}
                            overrideArtworkId={preset.artworkId}
                            showControls={false}
                          />
                        </div>
                        <button
                          onClick={() => removeFromCompare(preset.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-white text-sm mb-2">
                          {preset.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: lightColor }}
                            />
                            <span>{preset.lighting.colorTemperature}K</span>
                          </div>
                          <div>
                            {LIGHT_TYPE_LABELS[preset.lighting.type]}
                          </div>
                          <div>
                            {FRAME_MATERIAL_LABELS[preset.material.frameMaterial]}
                          </div>
                          <div>
                            亮度 {Math.round(preset.lighting.intensity * 100)}%
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            loadPreset(preset);
                            setActivePanel('lighting');
                          }}
                          className="w-full mt-3 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          应用此方案
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {availablePresets.length > 0 && compareList.length < 4 && (
        <div className="pt-4 border-t border-gallery-border">
          <h4 className="text-sm text-white/70 mb-3">可添加的方案</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availablePresets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded overflow-hidden bg-gallery-surface"
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: kelvinToHex(preset.lighting.colorTemperature),
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-white">{preset.name}</p>
                    <p className="text-xs text-white/40">
                      {preset.lighting.colorTemperature}K ·{' '}
                      {LIGHT_TYPE_LABELS[preset.lighting.type]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => addToCompare(preset.id)}
                  className="p-1.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {compareList.length >= 4 && (
        <div className="p-3 rounded-lg bg-warm/10 border border-warm/30 text-warm text-xs text-center">
          已达到最大对比数量（4个）
        </div>
      )}
    </motion.div>
  );
};
