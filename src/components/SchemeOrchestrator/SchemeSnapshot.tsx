import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Plus,
  Trash2,
  Download,
  Copy,
  Calendar,
  Image,
  FolderOpen,
  Clock,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { GalleryScheme } from '../../types';

export const SchemeSnapshot: React.FC = () => {
  const {
    gallerySchemes,
    currentSchemeId,
    saveSchemeSnapshot,
    setCurrentScheme,
    duplicateScheme,
    exportScheme,
    deleteScheme,
  } = useAppStore();

  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const snapshots = useMemo(
    () => gallerySchemes.filter((s) => s.id.startsWith('snapshot-')),
    [gallerySchemes]
  );

  const mainSchemes = useMemo(
    () => gallerySchemes.filter((s) => !s.id.startsWith('snapshot-')),
    [gallerySchemes]
  );

  const handleCreateSnapshot = () => {
    if (!snapshotName.trim() || !currentSchemeId) return;
    saveSchemeSnapshot(currentSchemeId, snapshotName.trim());
    setSnapshotName('');
    setShowSnapshotDialog(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return formatDate(timestamp);
  };

  const handlePreviewScheme = (scheme: GalleryScheme) => {
    setSelectedPreviewId(scheme.id);
  };

  const handleLoadScheme = (schemeId: string) => {
    setCurrentScheme(schemeId);
    setSelectedPreviewId(null);
  };

  const renderSchemeCard = (scheme: GalleryScheme, isSnapshot = false) => {
    const isCurrent = scheme.id === currentSchemeId;

    return (
      <motion.div
        key={scheme.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`card p-3 cursor-pointer transition-all ${
          isCurrent ? 'border-gold ring-1 ring-gold/30' : ''
        }`}
        onClick={() => handlePreviewScheme(scheme)}
      >
        <div className="aspect-video bg-gallery-bg rounded-lg mb-3 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full p-2">
              {scheme.wallArtworks.slice(0, 6).map((wa, index) => {
                const artwork = useAppStore
                  .getState()
                  .artworks.find((a) => a.id === wa.artworkId);
                if (!artwork) return null;

                const cols = scheme.wallArtworks.length <= 3 ? scheme.wallArtworks.length : 3;
                const row = Math.floor(index / cols);
                const col = index % cols;
                const width = 100 / cols;
                const height = 100 / Math.ceil(scheme.wallArtworks.length / cols);

                return (
                  <div
                    key={wa.id}
                    className="absolute rounded overflow-hidden"
                    style={{
                      left: `${col * width + 1}%`,
                      top: `${row * height + 1}%`,
                      width: `${width - 2}%`,
                      height: `${height - 2}%`,
                    }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      style={{
                        filter: `brightness(${0.7 + wa.lighting.intensity * 0.4})`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {scheme.wallArtworks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <Image className="w-8 h-8" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-xs text-white font-medium">点击预览</span>
          </div>

          {isCurrent && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold text-gallery-bg text-xs font-medium rounded">
              当前
            </div>
          )}
        </div>

        <h4 className="font-medium text-white text-sm truncate mb-1">
          {scheme.name}
        </h4>

        {scheme.description && (
          <p className="text-xs text-white/50 truncate mb-2">
            {scheme.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Image className="w-3 h-3" />
            <span>{scheme.wallArtworks.length} 件作品</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(scheme.updatedAt)}</span>
          </div>
        </div>

        {isSnapshot && (
          <div className="mt-2 pt-2 border-t border-gallery-border">
            <div className="flex items-center gap-1 text-xs text-gold">
              <Camera className="w-3 h-3" />
              <span>快照</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const selectedScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === selectedPreviewId),
    [gallerySchemes, selectedPreviewId]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-gold" />
          方案快照
        </h3>
        {currentScheme && (
          <button
            onClick={() => {
              setSnapshotName(
                `${currentScheme.name} ${formatDate(Date.now()).replace(/\//g, '-')}`
              );
              setShowSnapshotDialog(true);
            }}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            创建快照
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1">
        {currentScheme && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              当前方案
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {currentScheme && renderSchemeCard(currentScheme)}
            </div>
          </div>
        )}

        {mainSchemes.length > 1 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              所有方案
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {mainSchemes
                  .filter((s) => s.id !== currentSchemeId)
                  .map((scheme) => renderSchemeCard(scheme))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {snapshots.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              历史快照 ({snapshots.length})
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {snapshots
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((snapshot) => renderSchemeCard(snapshot, true))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {gallerySchemes.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">暂无方案</p>
            <p className="text-sm">创建第一个方案开始编排</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSnapshotDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSnapshotDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                创建方案快照
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    快照名称
                  </label>
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    className="input-field"
                    placeholder="输入快照名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateSnapshot();
                    }}
                  />
                </div>
                <p className="text-xs text-white/40">
                  快照将保存当前方案的完整状态，包括所有作品位置、灯光配置和材质设置。
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSnapshotDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateSnapshot}
                  disabled={!snapshotName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  创建快照
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedScheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white">
                    {selectedScheme.name}
                  </h3>
                  {selectedScheme.description && (
                    <p className="text-sm text-white/50">
                      {selectedScheme.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedScheme.id.startsWith('snapshot-') && (
                    <span className="px-2 py-1 bg-gold/10 border border-gold/30 text-gold text-xs rounded">
                      快照
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="aspect-video bg-gallery-bg rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 p-4">
                      <div className="relative w-full h-full">
                        {selectedScheme.wallArtworks.map((wa, index) => {
                          const artwork = useAppStore
                            .getState()
                            .artworks.find((a) => a.id === wa.artworkId);
                          if (!artwork) return null;

                          return (
                            <div
                              key={wa.id}
                              className="absolute rounded overflow-hidden transition-all hover:z-10 hover:scale-105"
                              style={{
                                left: `${wa.position.x - wa.position.width / 2}%`,
                                top: `${wa.position.y - wa.position.height / 2}%`,
                                width: `${wa.position.width}%`,
                                height: `${wa.position.height}%`,
                                transform: `rotate(${wa.position.rotation}deg)`,
                                zIndex: wa.position.layer,
                              }}
                            >
                              <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                                style={{
                                  filter: `brightness(${0.7 + wa.lighting.intensity * 0.4})`,
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedScheme.wallArtworks.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/30">
                        <Image className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gallery-bg rounded-lg border border-gallery-border">
                      <h4 className="text-sm font-medium text-white mb-2">
                        方案信息
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/50">作品数量</span>
                          <span className="text-white">
                            {selectedScheme.wallArtworks.length} 件
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">灯光模式</span>
                          <span className="text-white">
                            {selectedScheme.lightingStrategy.mode === 'uniform' && '统一灯光'}
                            {selectedScheme.lightingStrategy.mode === 'individual' && '独立灯光'}
                            {selectedScheme.lightingStrategy.mode === 'zone' && '分区灯光'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">墙面材质</span>
                          <span className="text-white">
                            {selectedScheme.wallMaterial === 'matte' && '哑光'}
                            {selectedScheme.wallMaterial === 'satin' && '丝光'}
                            {selectedScheme.wallMaterial === 'glossy' && '高光'}
                            {selectedScheme.wallMaterial === 'concrete' && '水泥'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">全局色温</span>
                          <span className="text-white">
                            {selectedScheme.lightingStrategy.globalLighting.colorTemperature}K
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">全局亮度</span>
                          <span className="text-white">
                            {Math.round(selectedScheme.lightingStrategy.globalLighting.intensity * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-gallery-bg rounded-lg border border-gallery-border">
                      <h4 className="text-sm font-medium text-white mb-2">
                        时间信息
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-white/70">
                          <Calendar className="w-3.5 h-3.5 text-gold" />
                          <span>
                            创建于 {formatDate(selectedScheme.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span>
                            更新于 {formatDate(selectedScheme.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedScheme.wallArtworks.length > 0 && (
                  <div className="p-4 bg-gallery-bg rounded-lg border border-gallery-border">
                    <h4 className="text-sm font-medium text-white mb-3">
                      作品列表
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedScheme.wallArtworks.map((wa) => {
                        const artwork = useAppStore
                          .getState()
                          .artworks.find((a) => a.id === wa.artworkId);
                        if (!artwork) return null;

                        return (
                          <div
                            key={wa.id}
                            className="p-2 bg-gallery-surface rounded-lg border border-gallery-border"
                          >
                            <div className="aspect-square rounded overflow-hidden mb-2 bg-gallery-bg">
                              <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                                style={{
                                  filter: `brightness(${0.7 + wa.lighting.intensity * 0.4})`,
                                }}
                              />
                            </div>
                            <p className="text-xs font-medium text-white truncate">
                              {artwork.title}
                            </p>
                            <p className="text-xs text-white/40 truncate">
                              {artwork.artist}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gallery-border">
                <button
                  onClick={() => setSelectedPreviewId(null)}
                  className="flex-1 btn-secondary"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    duplicateScheme(selectedScheme.id, `${selectedScheme.name} (副本)`);
                    setSelectedPreviewId(null);
                  }}
                  className="btn-secondary px-4 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
                <button
                  onClick={() => exportScheme(selectedScheme.id)}
                  className="btn-secondary px-4 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
                <button
                  onClick={() => handleLoadScheme(selectedScheme.id)}
                  className="btn-primary px-4 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  加载此方案
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
