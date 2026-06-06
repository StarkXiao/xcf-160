import React, { useState, useMemo, useRef } from 'react';
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
  Archive,
  FileText,
  Tag,
  Settings,
  History,
  ChevronRight,
  ArrowLeft,
  Save,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  importScheme as importSchemeUtil,
  importProject as importProjectUtil,
} from '../../utils/storage';
import type { GalleryScheme, CuratorProject, ProjectViewTab } from '../../types';
import { PROJECT_VIEW_TABS, PROJECT_STATUS_LABELS } from '../../types';

interface CuratorHubProps {
  onClose: () => void;
}

export const CuratorHub: React.FC<CuratorHubProps> = ({ onClose }) => {
  const {
    gallerySchemes,
    currentSchemeId,
    curatorProjects,
    currentProjectId,
    projectViewTab,
    createScheme,
    deleteScheme,
    duplicateScheme,
    exportScheme,
    importScheme,
    updateScheme,
    setCurrentScheme,
    setAppMode,
    setActivePanel,
    setProjectViewTab,
    createProject,
    deleteProject,
    updateProject,
    duplicateProject,
    saveProjectVersion,
    loadProjectVersion,
    deleteProjectVersion,
    exportProject,
    importProject,
    openProject,
  } = useAppStore();

  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showCreateSchemeDialog, setShowCreateSchemeDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [selectedProjectForVersion, setSelectedProjectForVersion] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectTags, setNewProjectTags] = useState('');
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeDescription, setNewSchemeDescription] = useState('');
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const schemeFileInputRef = useRef<HTMLInputElement>(null);

  const currentProject = useMemo(
    () => curatorProjects.find((p) => p.id === currentProjectId) || null,
    [curatorProjects, currentProjectId]
  );

  const viewingProject = useMemo(
    () => curatorProjects.find((p) => p.id === viewingProjectId) || null,
    [curatorProjects, viewingProjectId]
  );

  const viewingProjectSchemes = useMemo(
    () => gallerySchemes.filter((s) => viewingProject?.schemeIds.includes(s.id)),
    [gallerySchemes, viewingProject]
  );

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const tags = newProjectTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createProject(
      newProjectName.trim(),
      newProjectDescription.trim() || undefined,
      tags
    );
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectTags('');
    setShowCreateProjectDialog(false);
  };

  const handleDeleteProject = (id: string) => {
    const project = curatorProjects.find((p) => p.id === id);
    if (project && confirm(`确定要删除项目"${project.name}"吗？这将同时删除项目下的所有方案和版本。`)) {
      deleteProject(id);
      if (viewingProjectId === id) {
        setViewingProjectId(null);
      }
    }
  };

  const handleDuplicateProject = (id: string) => {
    const project = curatorProjects.find((p) => p.id === id);
    if (project) {
      duplicateProject(id, `${project.name} (副本)`);
    }
  };

  const handleCreateScheme = () => {
    if (!newSchemeName.trim() || !viewingProjectId) return;
    const newScheme = createScheme(newSchemeName.trim(), newSchemeDescription.trim() || undefined);
    if (newScheme) {
      useAppStore.getState().addSchemeToProject(viewingProjectId, newScheme.id);
    }
    setNewSchemeName('');
    setNewSchemeDescription('');
    setShowCreateSchemeDialog(false);
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importProjectUtil(file);
      importProject(data);
    } catch (err) {
      alert('导入失败：无效的项目文件');
    }
    e.target.value = '';
  };

  const handleImportScheme = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scheme = await importSchemeUtil(file);
      const newScheme = importScheme(scheme);
      if (newScheme && viewingProjectId) {
        useAppStore.getState().addSchemeToProject(viewingProjectId, newScheme.id);
      }
    } catch (err) {
      alert('导入失败：无效的方案文件');
    }
    e.target.value = '';
  };

  const handleStartEditProject = (project: CuratorProject) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEditProject = (id: string) => {
    if (!editingName.trim()) return;
    updateProject(id, { name: editingName.trim() });
    setEditingProjectId(null);
    setEditingName('');
  };

  const handleCancelEditProject = () => {
    setEditingProjectId(null);
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

  const handleSaveVersion = () => {
    if (!selectedProjectForVersion || !newVersionName.trim()) return;
    saveProjectVersion(selectedProjectForVersion, newVersionName.trim(), newVersionDescription.trim() || undefined);
    setNewVersionName('');
    setNewVersionDescription('');
    setShowVersionDialog(false);
    setSelectedProjectForVersion(null);
  };

  const handleOpenVersionDialog = (projectId: string) => {
    setSelectedProjectForVersion(projectId);
    setShowVersionDialog(true);
  };

  const handleLoadVersion = (projectId: string, versionId: string) => {
    if (confirm('确定要恢复此版本吗？将创建一个新的方案。')) {
      loadProjectVersion(projectId, versionId);
    }
  };

  const handleDeleteVersion = (projectId: string, versionId: string) => {
    if (confirm('确定要删除此版本吗？此操作不可撤销。')) {
      deleteProjectVersion(projectId, versionId);
    }
  };

  const getStatusColor = (status: CuratorProject['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'archived': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
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

  const renderProjectCard = (project: CuratorProject) => {
    const isCurrent = project.id === currentProjectId;
    const schemeCount = project.schemeIds.length;
    const versionCount = project.versions.length;

    return (
      <motion.div
        key={project.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="card p-4 hover:border-gold/50 transition-all cursor-pointer group"
        onClick={() => {
          setViewingProjectId(project.id);
          setShowVersionHistory(false);
        }}
      >
        <div className="aspect-video bg-gallery-bg rounded-lg mb-3 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full p-2">
              {project.schemeIds.slice(0, 3).map((schemeId, idx) => {
                const scheme = gallerySchemes.find((s) => s.id === schemeId);
                if (!scheme) return null;

                const cols = Math.min(3, project.schemeIds.length);
                const width = 100 / cols;
                const height = 100 / Math.ceil(project.schemeIds.length / cols);
                const col = idx % cols;
                const row = Math.floor(idx / cols);

                return (
                  <div
                    key={schemeId}
                    className="absolute rounded overflow-hidden"
                    style={{
                      left: `${col * width + 1}%`,
                      top: `${row * height + 1}%`,
                      width: `${width - 2}%`,
                      height: `${height - 2}%`,
                    }}
                  >
                    <div className="w-full h-full bg-gallery-surface/50 flex items-center justify-center">
                      {scheme.wallArtworks.slice(0, 4).map((wa, i) => {
                        const artwork = useAppStore
                          .getState()
                          .artworks.find((a) => a.id === wa.artworkId);
                        if (!artwork) return null;

                        const smallCols = 2;
                        const smallWidth = 100 / smallCols;
                        const smallHeight = 100 / smallCols;
                        const smallCol = i % smallCols;
                        const smallRow = Math.floor(i / smallCols);

                        return (
                          <div
                            key={wa.id}
                            className="absolute"
                            style={{
                              left: `${smallCol * smallWidth + 0.5}%`,
                              top: `${smallRow * smallHeight + 0.5}%`,
                              width: `${smallWidth - 1}%`,
                              height: `${smallHeight - 1}%`,
                            }}
                          >
                            <img
                              src={artwork.imageUrl}
                              alt={artwork.title}
                              className="w-full h-full object-cover rounded"
                              style={{
                                filter: `brightness(${0.6 + wa.lighting.intensity * 0.5})`,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {project.schemeIds.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <FolderOpen className="w-10 h-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gold text-gallery-bg rounded-full text-xs font-medium">
              <ChevronRight className="w-3.5 h-3.5" />
              查看项目
            </div>
          </div>

          {isCurrent && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold text-gallery-bg text-xs font-medium rounded">
              当前
            </div>
          )}

          <div className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
            {PROJECT_STATUS_LABELS[project.status]}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 mb-2">
          {editingProjectId === project.id ? (
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
                  if (e.key === 'Enter') handleSaveEditProject(project.id);
                  if (e.key === 'Escape') handleCancelEditProject();
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEditProject(project.id);
                }}
                className="p-1 text-green-400 hover:bg-green-500/20 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEditProject();
                }}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h4 className="font-medium text-white truncate flex-1">
                {project.name}
              </h4>
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditProject(project);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="重命名"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateProject(project.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="复制项目"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportProject(project.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                  title="导出项目"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="删除项目"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-white/50 truncate mb-2">
            {project.description}
          </p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gold/10 text-gold/70 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-white/40 text-xs">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{schemeCount} 方案</span>
            </div>
            <div className="flex items-center gap-1">
              <History className="w-3 h-3" />
              <span>{versionCount} 版本</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>
      </motion.div>
    );
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
        className="card p-3 hover:border-gold/50 transition-all cursor-pointer group"
        onClick={() => handleOpenScheme(scheme)}
      >
        <div className="aspect-video bg-gallery-bg rounded-lg mb-2 overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full p-1.5">
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
              <Image className="w-8 h-8" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gold text-gallery-bg rounded-full text-xs font-medium">
              <Play className="w-3 h-3" />
              打开
            </div>
          </div>

          {isCurrent && (
            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-gold text-gallery-bg text-xs font-medium rounded">
              当前
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2 mb-1">
          <h5 className="font-medium text-white truncate flex-1 text-sm">
            {scheme.name}
          </h5>
          <div
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateScheme(scheme.id, `${scheme.name} (副本)`);
              }}
              className="p-1 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
              title="复制"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                exportScheme(scheme.id);
              }}
              className="p-1 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
              title="导出"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Image className="w-2.5 h-2.5" />
            <span>{scheme.wallArtworks.length} 件</span>
          </div>
          <span>{formatRelativeTime(scheme.updatedAt)}</span>
        </div>
      </motion.div>
    );
  };

  const renderVersionHistory = () => {
    if (!viewingProject) return null;

    return (
      <div className="space-y-3">
        {viewingProject.versions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-sm">暂无版本记录</p>
            <p className="text-white/30 text-xs mt-1">保存当前方案状态以创建版本</p>
          </div>
        ) : (
          viewingProject.versions
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((version) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-4 hover:border-gold/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{version.name}</h4>
                      <span className="px-2 py-0.5 bg-gold/10 text-gold/70 text-xs rounded">
                        v{version.id.split('-')[1]}
                      </span>
                    </div>
                    {version.description && (
                      <p className="text-sm text-white/50 mb-2">{version.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        {version.scheme.wallArtworks.length} 件作品
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(version.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {version.scheme.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLoadVersion(viewingProject.id, version.id)}
                      className="p-2 text-white/40 hover:text-gold hover:bg-gold/10 rounded transition-colors"
                      title="恢复此版本"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVersion(viewingProject.id, version.id)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="删除版本"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
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
          {viewingProjectId ? (
            <button
              onClick={() => {
                setViewingProjectId(null);
                setShowVersionHistory(false);
              }}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-gallery-hover transition-colors -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-gallery-bg" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-white">
              {viewingProject ? viewingProject.name : '策展项目中心'}
            </h1>
            <p className="text-xs text-white/50">
              {viewingProject
                ? `管理项目方案和版本 · ${viewingProject.schemeIds.length} 个方案 · ${viewingProject.versions.length} 个版本`
                : '管理您的策展项目、方案和编排'}
            </p>
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

          {!viewingProjectId && (
            <>
              <label className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                导入项目
                <input
                  ref={projectFileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportProject}
                />
              </label>
              <button
                onClick={() => setShowCreateProjectDialog(true)}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                创建新项目
              </button>
            </>
          )}

          {viewingProjectId && (
            <>
              <label className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                导入方案
                <input
                  ref={schemeFileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportScheme}
                />
              </label>
              <button
                onClick={() => handleOpenVersionDialog(viewingProjectId!)}
                className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存版本
              </button>
              <button
                onClick={() => setShowCreateSchemeDialog(true)}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建方案
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-gallery-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {viewingProjectId && (
        <div className="h-12 border-b border-gallery-border bg-gallery-surface/30 flex items-center gap-1 px-6">
          <button
            onClick={() => setShowVersionHistory(false)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              !showVersionHistory
                ? 'bg-gold/20 text-gold'
                : 'text-white/60 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            方案列表
          </button>
          <button
            onClick={() => setShowVersionHistory(true)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              showVersionHistory
                ? 'bg-gold/20 text-gold'
                : 'text-white/60 hover:text-white hover:bg-gallery-hover'
            }`}
          >
            <History className="w-4 h-4" />
            版本历史
            {viewingProject?.versions.length ? (
              <span className="px-1.5 py-0.5 bg-gold/30 text-gallery-bg text-xs rounded-full">
                {viewingProject.versions.length}
              </span>
            ) : null}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getCurrentProjectStatusColor(viewingProject)}`} />
              {viewingProject ? PROJECT_STATUS_LABELS[viewingProject.status] : ''}
            </div>
            {viewingProject?.description && (
              <div className="max-w-xs truncate">{viewingProject.description}</div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {!viewingProjectId && curatorProjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-gold" />
                  我的项目
                </h2>
                <span className="text-sm text-white/50">
                  共 {curatorProjects.length} 个项目
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {curatorProjects
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((project) => renderProjectCard(project))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {viewingProjectId && !showVersionHistory && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  项目方案
                </h2>
                <span className="text-sm text-white/50">
                  共 {viewingProjectSchemes.length} 个方案
                </span>
              </div>
              {viewingProjectSchemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {viewingProjectSchemes
                      .sort((a, b) => b.updatedAt - a.updatedAt)
                      .map((scheme) => renderSchemeCard(scheme))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-white/10" />
                  <h3 className="text-lg font-medium text-white mb-2">暂无方案</h3>
                  <p className="text-white/50 text-sm mb-6">创建第一个方案开始编排</p>
                  <button
                    onClick={() => setShowCreateSchemeDialog(true)}
                    className="btn-primary px-5 py-2.5 flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    新建方案
                  </button>
                </div>
              )}
            </section>
          )}

          {viewingProjectId && showVersionHistory && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-gold" />
                  版本历史
                </h2>
                <button
                  onClick={() => handleOpenVersionDialog(viewingProjectId!)}
                  className="px-4 py-2 rounded-lg border border-gallery-border text-white/70 hover:text-white hover:border-gold/50 transition-colors text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存新版本
                </button>
              </div>
              {renderVersionHistory()}
            </section>
          )}

          {!viewingProjectId && curatorProjects.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-gold" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-white mb-3">
                  开始您的第一个策展项目
                </h3>
                <p className="text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
                  创建策展项目，管理多个方案，保存版本历史，支持项目级导入导出。
                  批量添加作品到墙面，调整灯光策略，实现专业级展厅编排。
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCreateProjectDialog(true)}
                    className="btn-primary px-8 py-3.5 flex items-center gap-2 text-base"
                  >
                    <Plus className="w-5 h-5" />
                    创建新项目
                  </button>
                  <label className="btn-secondary px-8 py-3.5 flex items-center gap-2 cursor-pointer text-base">
                    <Upload className="w-5 h-5" />
                    导入项目
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportProject}
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
            <span>上次同步: {formatDate(Date.now())}</span>
          </div>
          {currentProject && (
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getCurrentProjectStatusColor(currentProject)}`} />
              <span>当前项目: {currentProject.name}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-white/40">
          Lumina Curator · 专业策展项目中心
        </div>
      </footer>

      <AnimatePresence>
        {showCreateProjectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateProjectDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                创建新项目
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    项目名称
                  </label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="input-field"
                    placeholder="输入项目名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProject();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    项目描述（可选）
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="输入项目描述..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    标签（可选，用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={newProjectTags}
                    onChange={(e) => setNewProjectTags(e.target.value)}
                    className="input-field"
                    placeholder="例如: 博物馆, 现代艺术, 特展"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateProjectDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateSchemeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateSchemeDialog(false)}
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
                  onClick={() => setShowCreateSchemeDialog(false)}
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

        {showVersionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowVersionDialog(false);
              setSelectedProjectForVersion(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4">
                保存项目版本
              </h3>
              <p className="text-sm text-white/50 mb-4">
                保存当前方案的完整状态，便于后续恢复和对比
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    版本名称
                  </label>
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="input-field"
                    placeholder="例如: 初版方案、评审版、最终版..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveVersion();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    版本说明（可选）
                  </label>
                  <textarea
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="描述此版本的变更内容..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowVersionDialog(false);
                    setSelectedProjectForVersion(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveVersion}
                  disabled={!newVersionName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  保存版本
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function getCurrentProjectStatusColor(project: CuratorProject | null): string {
  if (!project) return 'bg-gray-500';
  switch (project.status) {
    case 'draft': return 'bg-gray-500';
    case 'in_progress': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'archived': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}
