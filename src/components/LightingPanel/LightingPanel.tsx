import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sun, Sparkles, RotateCcw } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { useAppStore } from '../../store/useAppStore';
import { LIGHT_TYPE_LABELS } from '../../types';
import { generateTemperatureGradient } from '../../utils/color';
import type { LightType } from '../../types';

const lightTypeIcons: Record<LightType, React.ReactNode> = {
  spotlight: <Sparkles className="w-4 h-4" />,
  floodlight: <Sun className="w-4 h-4" />,
  ambient: <Lightbulb className="w-4 h-4" />,
};

export const LightingPanel: React.FC = () => {
  const { lighting, setLighting, resetLighting } = useAppStore();

  const handleTypeChange = (type: LightType) => {
    setLighting({ type });
  };

  const temperatureGradient = generateTemperatureGradient();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" />
          灯光参数
        </h3>
        <button
          onClick={resetLighting}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
          title="重置灯光"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        <div>
          <label className="block text-sm text-white/70 mb-3">光源类型</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LIGHT_TYPE_LABELS) as LightType[]).map((type) => (
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
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">色温</label>
          <div className="h-2 rounded-full mb-3" style={{ background: temperatureGradient }} />
          <Slider
            value={lighting.colorTemperature}
            min={2000}
            max={10000}
            step={100}
            onChange={(v) => setLighting({ colorTemperature: v })}
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
            value={lighting.intensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setLighting({ intensity: v })}
            label="亮度"
            unit="%"
            showValue={false}
          />
          <div className="flex justify-between mt-1 text-xs text-white/40">
            <span>0%</span>
            <span className="text-gold">{Math.round(lighting.intensity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <Slider
            value={lighting.angle}
            min={15}
            max={90}
            step={1}
            onChange={(v) => setLighting({ angle: v })}
            label="光束角度"
            unit="°"
          />
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
                onChange={(v) => setLighting({ positionX: v })}
                label="水平位置"
              />
            </div>

            <div>
              <Slider
                value={lighting.positionY}
                min={-2}
                max={4}
                step={0.1}
                onChange={(v) => setLighting({ positionY: v })}
                label="垂直位置"
              />
            </div>

            <div>
              <Slider
                value={lighting.positionZ}
                min={1}
                max={6}
                step={0.1}
                onChange={(v) => setLighting({ positionZ: v })}
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
                setLighting({
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
                setLighting({
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
                setLighting({
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
                setLighting({
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};
