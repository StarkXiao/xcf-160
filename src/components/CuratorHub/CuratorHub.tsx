import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Image,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Edit3,
  Check,
  X,
  Calendar,
  Clock,
  Sparkles,
  FolderOpen,
  Camera,
  Play,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { importScheme as importSchemeUtil } from '../../utils/storage';
import type { GalleryScheme } from '../../types';

interface CuratorHubProps {
  onClose: () => void;
}

export const CuratorHub: React.FC<CuratorHubProps> = ({ onClose }) => {
  const {
    gallerySchemes,
    currentSchemeId,
    createScheme,
    deleteScheme,
    duplicateScheme,
    exportScheme,
    importScheme,
    updateScheme,
    setCurrentScheme,
    setAppMode,
    setActivePanel,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeDescription, setNewSchemeDescription] = useState('');
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const mainSchemes = useMemo(
    () => gallerySchemes.filter((s) => !s.id.startsWith('snapshot-')),
    [gallerySchemes]
  );

  const snapshots = useMemo(
    () => gallerySchemes.filter((s) => s.id.startsWith('snapshot-')),
    [gallerySchemes]
  );

  const handleCreateScheme = () => {
    if (!newSchemeName.trim()) return;
    createScheme(newSchemeName.trim(), newSchemeDescription.trim() || undefined);
    setNewSchemeName('');
    setNewSchemeDescription('');
    setShowCreateDialog(false);
  };

  const handleDeleteScheme = (id: string) => {
    const scheme = gallerySchemes.find((s) => s.id === id);
    if (scheme && confirm(`确定要删除方案"${scheme.name}"吗？`)) {
      deleteScheme(id);
    }
  };

  const handleDuplicateScheme = (id: string) => {
    const scheme = gallerySchemes.find((s) => s.id === id);
    if (scheme) {
      duplicateScheme(id, `${scheme.name} (副本)`);
    }
  };

  const handleImportScheme = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scheme = await importSchemeUtil(file);
      importScheme(scheme);
    } catch (err) {
      alert('导入失败：无效的方案文件');
    }
    e.target.value = '';
  };

  const handleStartEdit = (scheme: GalleryScheme) => {
    setEditingSchemeId(scheme.id);
    setEditingName(scheme.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    updateScheme(id, { name: editingName.trim() });
    setEditingSchemeId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingSchemeId(null);
    setEditingName('');
  };

  const handleOpenScheme = (scheme: GalleryScheme) => {
    setCurrentScheme(scheme.id);
    setAppMode('curator');
    setActivePanel('scheme');
    onClose();
  };

  const handleSwitchToArtworkMode = () => {
    setAppMode('artwork');
    setActivePanel('lighting');
    onClose();
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
        className="card p-4 hover:border-gold/50 transition-all cursor-pointer group"
        onClick={() => handleOpenScheme(scheme)}
      >
        <div className="aspect-video bg-gallery-bg rounded-lg mb-3 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full p-2">
              {scheme.wallArtworks.slice(0, 6).map((wa, index) => {
                const artwork = useAppStore
                  .getState()
                  .artworks.find((a) => a.id === wa.artworkId);
                if (!artwork) return null;

                const total = scheme.wallArtworks.length;
                const cols = total <= 3 ? total : 3;
                const row = Math.floor(index / cols);
                const col = index % cols;
                const width = 100 / cols;
                const height = 100 / Math.ceil(total / cols);

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
              <Image className="w-10 h-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gold text-gallery-bg rounded-full text-xs font-medium">
              <Play className="w-3.5 h-3.5" />
              打开方案
            </div>
          </div>

          {isCurrent && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold text-gallery-bg text-xs font-medium rounded">
              当前
            </div>
          )}

          {isSnapshot && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-gallery-surface/90 text-gold text-xs font-medium rounded flex items-center gap-1">
              <Camera className="w-3 h-3" />
              快照
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          {editingSchemeId === scheme.id ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 input-field text-sm py-1"
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') handleSaveEdit(scheme.id);
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit(scheme.id);
                }}
                className="p-1 text-green-400 hover:bg-green-500/20 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h4 className="font-medium text-white truncate flex-1">
                {scheme.name}
              </h4>
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(scheme);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="重命名"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateScheme(scheme.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="复制方案"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportScheme(scheme.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="导出方案"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScheme(scheme.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="删除方案"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

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
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gallery-bg/95 backdrop-blur-md z-50 flex flex-col"
    >
      <header className="h-16 border-b border-gallery-border bg-gallery-surface/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-gallery-bg" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-white">
              策展项目中心
            </h1>
            <p className="text-xs text-white/50">管理您的展厅方案和编排</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSwitchToArtworkMode}
            className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            单作品预览
          </button>
          <label className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            导入方案
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportScheme}
            />
          </label>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建新方案
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-gallery-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {mainSchemes.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-gold" />
                  我的方案
                </h2>
                <span className="text-sm text-white/50">
                  共 {mainSchemes.length} 个方案
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {mainSchemes
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((scheme) => renderSchemeCard(scheme))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {snapshots.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gold" />
                  历史快照
                </h2>
                <span className="text-sm text-white/50">
                  共 {snapshots.length} 个快照
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {snapshots
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((snapshot) => renderSchemeCard(snapshot, true))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {gallerySchemes.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-gold" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">
                  开始您的第一个策展项目
                </h3>
                <p className="text-white/50 mb-6 max-w-md mx-auto">
                  创建展厅方案，批量添加作品到墙面，调整灯光策略，保存方案快照，轻松实现跨场景复用
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="btn-primary px-6 py-3 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    创建新方案
                  </button>
                  <label className="btn-secondary px-6 py-3 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    导入方案
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportScheme}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="h-12 border-t border-gallery-border bg-gallery-surface/30 flex items-center justify-between px-6">
        <div className="text-xs text-white/40 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              上次同步: {formatDate(Date.now())}
            </span>
          </div>
        </div>
        <div className="text-xs text-white/40">
          Lumina Curator · 专业展厅方案编排
        </div>
      </footer>

      <AnimatePresence>
        {showCreateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                创建新方案
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    方案名称
                  </label>
                  <input
                    type="text"
                    value={newSchemeName}
                    onChange={(e) => setNewSchemeName(e.target.value)}
                    className="input-field"
                    placeholder="输入方案名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateScheme();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    方案描述（可选）
                  </label>
                  <textarea
                    value={newSchemeDescription}
                    onChange={(e) => setNewSchemeDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="输入方案描述..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateScheme}
                  disabled={!newSchemeName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
