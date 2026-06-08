import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Layers,
  GitCompare,
  Save,
  Menu,
  X,
  Sparkles,
  LayoutGrid,
  Image,
  ChevronDown,
  Folder,
  Check,
  FolderOpen,
  Archive,
  Grid3X3,
  BookOpen,
  Building2,
  HardDrive,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { ToastProvider, ToastContainer, useToast } from './components/Toast';
import { initStorageSystem, checkStorageHealth, getStorageMetadata, loadBackups } from './utils/storage';
import type { AutoRecoveryResult, DataMigrationResult } from './types';
import { ArtworkList } from './components/ArtworkList/ArtworkList';
import { GalleryPreview } from './components/GalleryPreview/GalleryPreview';
import { GalleryWallPreview } from './components/GalleryPreview/GalleryWallPreview';
import { LightingPanel } from './components/LightingPanel/LightingPanel';
import { MaterialPanel } from './components/MaterialPanel/MaterialPanel';
import { CompareView } from './components/CompareView/CompareView';
import { StoragePanel } from './components/StoragePanel/StoragePanel';
import { SchemeOrchestrator } from './components/SchemeOrchestrator/SchemeOrchestrator';
import { CuratorHub } from './components/CuratorHub/CuratorHub';
import { ProposalShareView } from './components/ProposalView/ProposalShareView';
import { ArtworkIngestionWorkstation } from './components/ArtworkIngestionWorkstation/ArtworkIngestionWorkstation';
import { ExhibitionWallConfig } from './components/ExhibitionWallConfig/ExhibitionWallConfig';
import { ThemeLibrary } from './components/ThemeLibrary/ThemeLibrary';
import { TourAdaptationPanel } from './components/TourAdaptationPanel';
import type { AppState, AppMode } from './types';
import { APP_MODE_LABELS, PROJECT_STATUS_LABELS } from './types';

type PanelTab = AppState['activePanel'];

const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'scheme', label: '方案编排', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'wallConfig', label: '展墙', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'lighting', label: '灯光', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'material', label: '材质', icon: <Layers className="w-4 h-4" /> },
  { id: 'compare', label: '对比', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'tourAdaptation', label: '巡展', icon: <Building2 className="w-4 h-4" /> },
  { id: 'storage', label: '保存', icon: <Save className="w-4 h-4" /> },
  { id: 'workstation', label: '入库', icon: <Archive className="w-4 h-4" /> },
  { id: 'themeLibrary', label: '馆藏', icon: <BookOpen className="w-4 h-4" /> },
];

const artworkModeTabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'wallConfig', label: '展墙', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'lighting', label: '灯光', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'material', label: '材质', icon: <Layers className="w-4 h-4" /> },
  { id: 'compare', label: '对比', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'tourAdaptation', label: '巡展', icon: <Building2 className="w-4 h-4" /> },
  { id: 'storage', label: '保存', icon: <Save className="w-4 h-4" /> },
  { id: 'workstation', label: '入库', icon: <Archive className="w-4 h-4" /> },
  { id: 'themeLibrary', label: '馆藏', icon: <BookOpen className="w-4 h-4" /> },
];

function AppContent() {
  const {
    activePanel,
    setActivePanel,
    compareList,
    appMode,
    setAppMode,
    gallerySchemes,
    currentSchemeId,
    curatorProjects,
    currentProjectId,
    setCurrentProject,
    setCurrentScheme,
    storageHealth,
    storageMetadata,
    setStorageHealth,
    setStorageMetadata,
    refreshFromStorage,
    hasAnyDirtyScheme,
    getDirtySchemesCount,
    saveCurrentSchemeDraft,
  } = useAppStore();
  const { addToast } = useToast();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showCuratorHub, setShowCuratorHub] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [showStorageStatus, setShowStorageStatus] = useState(false);
  const storageInitRef = useRef(false);

  const currentScheme = gallerySchemes.find((s) => s.id === currentSchemeId);
  const currentProject = curatorProjects.find((p) => p.id === currentProjectId);
  const activeTabs = appMode === 'curator' ? tabs : artworkModeTabs;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyDirtyScheme()) {
        const count = getDirtySchemesCount();
        const message = `您有${count}个方案存在未保存的更改，确定要离开吗？`;
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyDirtyScheme, getDirtySchemesCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasAnyDirtyScheme()) {
        saveCurrentSchemeDraft(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasAnyDirtyScheme, saveCurrentSchemeDraft]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const handleProjectSwitch = (projectId: string) => {
    setCurrentProject(projectId);
    const project = curatorProjects.find((p) => p.id === projectId);
    if (project?.currentSchemeId) {
      setCurrentScheme(project.currentSchemeId);
    }
    setShowProjectDropdown(false);
  };

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share) {
      setShareToken(share);
    }
  }, []);

  useEffect(() => {
    if (storageInitRef.current) return;
    storageInitRef.current = true;

    const initializeStorage = async () => {
      try {
        const result = initStorageSystem();
        setStorageHealth(result.health);
        setStorageMetadata(getStorageMetadata());

        const messages: string[] = [];

        const backupCount = loadBackups().length;

        if (result.health.isHealthy) {
          messages.push('存储系统运行正常');
        } else {
          messages.push(`检测到 ${result.health.corruptedKeys.length} 个损坏项`);
        }

        if (result.migrationResult) {
          const mr = result.migrationResult as DataMigrationResult;
          if (mr.success && mr.stepsApplied > 0) {
            messages.push(`数据已从 v${mr.fromVersion} 迁移到 v${mr.toVersion}`);
            addToast('success', `数据迁移完成：v${mr.fromVersion} → v${mr.toVersion}`);
          } else if (!mr.success) {
            addToast('error', `数据迁移失败：${mr.errors[0] || '未知错误'}`);
          }
        }

        if (result.recoveryResult) {
          const rr = result.recoveryResult as AutoRecoveryResult;
          if (rr.recovered && rr.recoverySource) {
            messages.push(`已从 ${rr.recoverySource} 恢复数据`);
            addToast('success', `数据已自动恢复（来源：${rr.recoverySource}）`);
          } else if (!rr.recovered && rr.errors.length > 0) {
            addToast('error', `自动恢复失败：${rr.errors[0]}`);
          }
        }

        if (result.health.needsMigration) {
          addToast('warning', '检测到数据版本更新，建议立即迁移');
        }

        if (backupCount > 0) {
          messages.push(`${backupCount} 个备份可用`);
        }

        refreshFromStorage();

        if (messages.length > 0) {
          setTimeout(() => {
            addToast('info', messages.join(' · '), 5000);
          }, 1000);
        }
      } catch {
        addToast('error', '存储系统初始化失败');
      }
    };

    initializeStorage();
  }, [addToast, refreshFromStorage, setStorageHealth, setStorageMetadata]);

  useEffect(() => {
    const interval = setInterval(() => {
      const health = checkStorageHealth();
      setStorageHealth(health);
      const metadata = getStorageMetadata();
      setStorageMetadata(metadata);

      if (!health.hasRecentBackup) {
        addToast('warning', '已超过24小时未自动备份');
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setStorageHealth, setStorageMetadata, addToast]);

  const getHealthColor = () => {
    if (!storageHealth) return 'bg-gray-500';
    if (storageHealth.isHealthy) return 'bg-green-500';
    if (storageHealth.corruptedKeys.length > 0) return 'bg-red-500';
    if (storageHealth.needsMigration) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'scheme':
        return <SchemeOrchestrator />;
      case 'wallConfig':
        return <ExhibitionWallConfig />;
      case 'lighting':
        return <LightingPanel />;
      case 'material':
        return <MaterialPanel />;
      case 'compare':
        return <CompareView />;
      case 'storage':
        return <StoragePanel />;
      case 'workstation':
        return <ArtworkIngestionWorkstation />;
      case 'themeLibrary':
        return <ThemeLibrary />;
      case 'tourAdaptation':
        return <TourAdaptationPanel />;
      default:
        return appMode === 'curator' ? <SchemeOrchestrator /> : <LightingPanel />;
    }
  };

  const handleModeSwitch = (mode: AppMode) => {
    setAppMode(mode);
    setActivePanel(mode === 'curator' ? 'scheme' : 'lighting');
    setShowModeDropdown(false);
  };

  const modeIcon = appMode === 'curator' ? <LayoutGrid className="w-4 h-4" /> : <Image className="w-4 h-4" />;

  return (
    <div className="h-screen w-screen flex flex-col bg-gallery-bg overflow-hidden">
      <AnimatePresence>
        {showCuratorHub && (
          <CuratorHub onClose={() => setShowCuratorHub(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareToken && (
          <ProposalShareView
            shareToken={shareToken}
            onClose={() => {
              setShareToken(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('share');
              window.history.replaceState({}, '', url.toString());
            }}
          />
        )}
      </AnimatePresence>

      <header ref={headerRef} className="h-14 border-b border-gallery-border bg-gallery-surface flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="p-2 rounded-lg hover:bg-gallery-hover text-white/70 hover:text-white transition-colors lg:hidden"
          >
            {leftCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowCuratorHub(true)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gallery-hover transition-colors group"
            title="打开策展项目中心"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gallery-bg" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-display font-semibold text-white leading-tight group-hover:text-gold transition-colors">
                Lumina
              </h1>
              <p className="text-[10px] text-white/40 leading-tight flex items-center gap-1">
                {appMode === 'curator' ? (
                  <>
                    <LayoutGrid className="w-3 h-3" />
                    展厅编排
                  </>
                ) : (
                  <>
                    <Image className="w-3 h-3" />
                    单作品预览
                  </>
                )}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentProject && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${getStatusColor(currentProject.status)}`} />
                <FolderOpen className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs text-white/80 font-medium truncate max-w-[120px]">
                  {currentProject.name}
                </span>
                <span className="text-[10px] text-white/40 hidden md:inline">
                  {PROJECT_STATUS_LABELS[currentProject.status]}
                </span>
                <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProjectDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full right-0 mt-1 bg-gallery-surface border border-gallery-border rounded-lg overflow-hidden z-50 min-w-[200px] shadow-xl"
                  >
                    <div className="px-3 py-2 border-b border-gallery-border">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">切换项目</p>
                    </div>
                    {curatorProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSwitch(project.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                          currentProjectId === project.id
                            ? 'bg-gold/10 text-gold'
                            : 'text-white/70 hover:bg-gallery-hover hover:text-white'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium truncate">{project.name}</p>
                          <p className="text-[10px] text-white/40">
                            {project.schemeIds.length} 方案 · {project.versions.length} 版本
                          </p>
                        </div>
                        {currentProjectId === project.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    ))}
                    <div className="px-3 py-2 border-t border-gallery-border">
                      <button
                        onClick={() => {
                          setShowProjectDropdown(false);
                          setShowCuratorHub(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-gold/10 text-gold text-xs hover:bg-gold/20 transition-colors"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        打开策展项目中心
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {appMode === 'curator' && currentScheme && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gallery-bg border border-gallery-border">
              <Folder className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-white/80 font-medium truncate max-w-[130px]">
                {currentScheme.name}
              </span>
              <span className="text-[10px] text-white/40 hidden md:inline">
                {currentScheme.wallArtworks.length}件作品
              </span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors text-xs"
            >
              {modeIcon}
              <span className="text-white/80">{APP_MODE_LABELS[appMode]}</span>
              <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showModeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full right-0 mt-1 bg-gallery-surface border border-gallery-border rounded-lg overflow-hidden z-50 min-w-[140px] shadow-xl"
                >
                  {(Object.keys(APP_MODE_LABELS) as AppMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleModeSwitch(mode)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                        appMode === mode
                          ? 'bg-gold/10 text-gold'
                          : 'text-white/70 hover:bg-gallery-hover hover:text-white'
                      }`}
                    >
                      {mode === 'curator' ? <LayoutGrid className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                      {APP_MODE_LABELS[mode]}
                      {appMode === mode && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowStorageStatus(!showStorageStatus)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors text-xs"
              title="存储系统状态"
            >
              <div className={`w-2 h-2 rounded-full ${getHealthColor()} ${storageHealth && !storageHealth.isHealthy ? 'animate-pulse' : ''}`} />
              <HardDrive className="w-3.5 h-3.5 text-gold" />
              <span className="hidden md:inline text-white/80">存储</span>
              {storageMetadata && (
                <span className="hidden lg:inline text-white/40">
                  {Math.round(storageMetadata.dataSize / 1024)}KB
                </span>
              )}
            </button>

            <AnimatePresence>
              {showStorageStatus && storageHealth && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full right-0 mt-1 bg-gallery-surface border border-gallery-border rounded-lg overflow-hidden z-50 min-w-64 shadow-xl"
                >
                  <div className="px-3 py-2 border-b border-gallery-border">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">存储系统状态</p>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">健康状态</span>
                      <span className={`text-xs font-medium ${storageHealth.isHealthy ? 'text-green-400' : 'text-red-400'}`}>
                        {storageHealth.isHealthy ? '正常' : '异常'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">数据项</span>
                      <span className="text-xs text-white/80">{storageMetadata?.itemCount || 0} 项</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">数据大小</span>
                      <span className="text-xs text-white/80">{Math.round((storageMetadata?.dataSize || 0) / 1024)} KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Schema 版本</span>
                      <span className="text-xs text-white/80">v{storageMetadata?.schemaVersion || 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">备份数量</span>
                      <span className="text-xs text-white/80">{loadBackups().length} 个</span>
                    </div>
                    {storageHealth.corruptedKeys.length > 0 && (
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                        <p className="text-xs text-red-400">
                          ⚠️ {storageHealth.corruptedKeys.length} 个损坏项
                        </p>
                      </div>
                    )}
                    {storageHealth.needsMigration && (
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <p className="text-xs text-yellow-400">
                          ⚠️ 需要数据迁移
                        </p>
                      </div>
                    )}
                    {storageMetadata?.lastBackupAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">最近备份</span>
                        <span className="text-xs text-white/80">
                          {new Date(storageMetadata.lastBackupAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-gallery-border">
                    <button
                      onClick={() => {
                        setActivePanel('storage');
                        setShowStorageStatus(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-gold/10 text-gold text-xs hover:bg-gold/20 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      打开存储管理
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {compareList.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30">
              <GitCompare className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-gold font-medium">
                {compareList.length} 个对比方案
              </span>
            </div>
          )}
          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="p-2 rounded-lg hover:bg-gallery-hover text-white/70 hover:text-white transition-colors lg:hidden"
          >
            {rightCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {!leftCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 overflow-hidden lg:w-72"
            >
              <ArtworkList />
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={appMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {appMode === 'curator' ? <GalleryWallPreview /> : <GalleryPreview />}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence mode="wait">
          {!rightCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 bg-gallery-surface border-l border-gallery-border overflow-hidden lg:w-80"
            >
              <div className="h-full flex flex-col p-4">
                <div className="flex gap-1 p-1 bg-gallery-bg rounded-lg mb-4">
                  {activeTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePanel(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                        activePanel === tab.id
                          ? 'bg-gold text-gallery-bg shadow-lg shadow-gold/20'
                          : 'text-white/60 hover:text-white hover:bg-gallery-hover'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePanel}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      {renderPanel()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
}
