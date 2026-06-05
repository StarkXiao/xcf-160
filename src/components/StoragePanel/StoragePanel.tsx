import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Trash2,
  Download,
  Upload,
  Play,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { exportPreset, importPreset } from '../../utils/storage';
import { kelvinToHex } from '../../utils/color';
import { LIGHT_TYPE_LABELS, FRAME_MATERIAL_LABELS } from '../../types';
import type { Preset } from '../../types';

export const StoragePanel: React.FC = () => {
  const {
    presets,
    savePreset,
    deletePreset,
    loadPreset,
    addToCompare,
    selectedArtworkId,
    artworks,
  } = useAppStore();

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!newPresetName.trim() || !selectedArtworkId) return;
    savePreset(newPresetName.trim());
    setNewPresetName('');
    setShowSaveDialog(false);
  };

  const handleExport = (preset: Preset) => {
    exportPreset(preset);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const preset = await importPreset(file);
      savePreset(preset.name);
    } catch (err) {
      alert('导入失败：无效的方案文件');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedArtwork = artworks.find((a) => a.id === selectedArtworkId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Save className="w-5 h-5 text-gold" />
          本地保存
        </h3>
        <span className="text-xs text-white/40">{presets.length} 个方案</span>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!selectedArtworkId}
          className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          保存当前
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary text-sm px-3"
          title="导入方案"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {!selectedArtworkId && (
        <div className="mb-4 p-3 rounded-lg bg-warm/10 border border-warm/30 text-warm text-xs">
          请先选择一件艺术品
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1">
        {presets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 mb-2">暂无保存的方案</p>
            <p className="text-sm text-white/40">
              调整灯光和材质后点击"保存当前"按钮
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {presets.map((preset) => {
                const artwork = artworks.find((a) => a.id === preset.artworkId);
                const lightColor = kelvinToHex(preset.lighting.colorTemperature);

                return (
                  <motion.div
                    key={preset.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card p-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative"
                        style={{ backgroundColor: lightColor + '40' }}
                      >
                        {artwork && (
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                            style={{
                              filter: `sepia(0.2) hue-rotate(${
                                (preset.lighting.colorTemperature - 5000) / 50
                              }deg)`,
                            }}
                          />
                        )}
                        <div
                          className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-gallery-bg"
                          style={{ backgroundColor: lightColor }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">
                          {preset.name}
                        </h4>
                        <p className="text-xs text-white/40 truncate">
                          {artwork?.title || '未知作品'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                          <span>{preset.lighting.colorTemperature}K</span>
                          <span>·</span>
                          <span>{LIGHT_TYPE_LABELS[preset.lighting.type]}</span>
                          <span>·</span>
                          <span>
                            {FRAME_MATERIAL_LABELS[preset.material.frameMaterial]}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">
                          {formatDate(preset.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 mt-3 opacity-100 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => loadPreset(preset)}
                        className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        应用
                      </button>
                      <button
                        onClick={() => addToCompare(preset.id)}
                        className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-gold/50 hover:text-gold transition-colors"
                        title="添加到对比"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleExport(preset)}
                        className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-cool/50 hover:text-cool transition-colors"
                        title="导出方案"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除"${preset.name}"吗？`)) {
                            deletePreset(preset.id);
                          }
                        }}
                        className="px-2 py-1.5 text-xs rounded-lg bg-gallery-bg border border-gallery-border text-white/60 hover:border-red-500/50 hover:text-red-400 transition-colors"
                        title="删除方案"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-display font-semibold text-white mb-2">
                保存方案
              </h4>
              <p className="text-sm text-white/60 mb-4">
                当前作品：
                <span className="text-gold"> {selectedArtwork?.title}</span>
              </p>

              <div className="space-y-3 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">色温</span>
                  <span className="text-white">
                    {presets[0]?.lighting.colorTemperature || 3500}K
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">亮度</span>
                  <span className="text-white">
                    {Math.round((presets[0]?.lighting.intensity || 0.8) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">画框</span>
                  <span className="text-white">
                    {FRAME_MATERIAL_LABELS[
                      presets[0]?.material.frameMaterial || 'gold'
                    ]}
                  </span>
                </div>
              </div>

              <input
                type="text"
                placeholder="输入方案名称..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="input-field mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newPresetName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
