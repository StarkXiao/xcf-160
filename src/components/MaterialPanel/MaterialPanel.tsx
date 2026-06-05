import React from 'react';
import { motion } from 'framer-motion';
import { Layers, RotateCcw } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../store/useAppStore';
import {
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
} from '../../types';
import type { FrameMaterial, WallMaterial } from '../../types';

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

export const MaterialPanel: React.FC = () => {
  const { material, setMaterial, resetMaterial } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-gold" />
          材质反射
        </h3>
        <button
          onClick={resetMaterial}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
          title="重置材质"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
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
          <h4 className="text-sm font-medium text-white mb-3">材质预设</h4>
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
          <h4 className="text-sm font-medium text-white mb-3">材质参数预览</h4>
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
  );
};
