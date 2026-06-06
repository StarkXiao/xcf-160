import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Lightbulb,
  Camera,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Edit3,
  Check,
  X,
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SCHEME_PANEL_TABS } from '../../types';
import type { SchemePanelTab, GalleryScheme } from '../../types';
import { WallLayout } from './WallLayout';
import { LightingStrategyPanel } from './LightingStrategyPanel';
import { SchemeSnapshot } from './SchemeSnapshot';
import { importScheme as importSchemeUtil } from '../../utils/storage';

export const SchemeOrchestrator: React.FC = () => {
  const {
    gallerySchemes,
    currentSchemeId,
    schemePanelTab,
    setCurrentScheme,
    setSchemePanelTab,
    createScheme,
    deleteScheme,
    duplicateScheme,
    exportScheme,
    importScheme,
    updateScheme,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeDescription, setNewSchemeDescription] = useState('');
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
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

  const tabIcons: Record<SchemePanelTab, React.ReactNode> = {
    layout: <LayoutGrid className="w-4 h-4" />,
    lighting: <Lightbulb className="w-4 h-4" />,
    snapshots: <Camera className="w-4 h-4" />,
  };

  const renderTabContent = () => {
    if (!currentScheme) {
      return (
        <div className="h-full flex items-center justify-center text-white/40">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">请选择或创建一个方案</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建新方案
            </button>
          </div>
        </div>
      );
    }

    switch (schemePanelTab) {
      case 'layout':
        return <WallLayout />;
      case 'lighting':
        return <LightingStrategyPanel />;
      case 'snapshots':
        return <SchemeSnapshot />;
      default:
        return <WallLayout />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-gold" />
            展厅方案编排
          </h3>
          <div className="flex items-center gap-1">
            <label className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportScheme}
              />
            </label>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-gallery-hover"
              title="创建新方案"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSchemeDropdown(!showSchemeDropdown)}
            className="w-full flex items-center justify-between p-3 bg-gallery-bg border border-gallery-border rounded-lg hover:border-gold/50 transition-colors"
          >
            <div className="text-left min-w-0">
              <p className="font-medium text-white truncate">
                {currentScheme?.name || '未选择方案'}
              </p>
              {currentScheme?.description && (
                <p className="text-xs text-white/50 truncate">
                  {currentScheme.description}
                </p>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white/60 transition-transform ${
                showSchemeDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showSchemeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-gallery-surface border border-gallery-border rounded-lg overflow-hidden z-10 max-h-80 overflow-y-auto"
              >
                {gallerySchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`p-3 border-b border-gallery-border last:border-b-0 hover:bg-gallery-hover transition-colors ${
                      scheme.id === currentSchemeId ? 'bg-gold/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {editingSchemeId === scheme.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 input-field text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(scheme.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(scheme.id)}
                            className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setCurrentScheme(scheme.id);
                              setShowSchemeDropdown(false);
                            }}
                            className="flex-1 text-left min-w-0"
                          >
                            <p className="font-medium text-white truncate">
                              {scheme.name}
                            </p>
                            <p className="text-xs text-white/50">
                              {scheme.wallArtworks.length} 件作品 ·{' '}
                              {new Date(scheme.updatedAt).toLocaleDateString()}
                            </p>
                          </button>
                          <div className="flex items-center gap-0.5">
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
                  </div>
                ))}

                {gallerySchemes.length === 0 && (
                  <div className="p-4 text-center text-white/40 text-sm">
                    暂无方案，点击上方按钮创建
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {currentScheme && (
        <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg mb-4">
          {SCHEME_PANEL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSchemePanelTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                schemePanelTab === tab.id
                  ? 'bg-gold text-gallery-bg shadow-lg shadow-gold/20'
                  : 'text-white/60 hover:text-white hover:bg-gallery-hover'
              }`}
            >
              {tabIcons[tab.id]}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>

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
