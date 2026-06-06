import React, { useState } from 'react';
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
  Home,
  ChevronDown,
  Folder,
  Check,
} from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { ArtworkList } from './components/ArtworkList/ArtworkList';
import { GalleryPreview } from './components/GalleryPreview/GalleryPreview';
import { GalleryWallPreview } from './components/GalleryPreview/GalleryWallPreview';
import { LightingPanel } from './components/LightingPanel/LightingPanel';
import { MaterialPanel } from './components/MaterialPanel/MaterialPanel';
import { CompareView } from './components/CompareView/CompareView';
import { StoragePanel } from './components/StoragePanel/StoragePanel';
import { SchemeOrchestrator } from './components/SchemeOrchestrator/SchemeOrchestrator';
import { CuratorHub } from './components/CuratorHub/CuratorHub';
import type { AppState, AppMode } from './types';
import { APP_MODE_LABELS } from './types';

type PanelTab = AppState['activePanel'];

const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'scheme', label: '方案编排', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'lighting', label: '灯光', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'material', label: '材质', icon: <Layers className="w-4 h-4" /> },
  { id: 'compare', label: '对比', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'storage', label: '保存', icon: <Save className="w-4 h-4" /> },
];

const artworkModeTabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
  { id: 'lighting', label: '灯光', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'material', label: '材质', icon: <Layers className="w-4 h-4" /> },
  { id: 'compare', label: '对比', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'storage', label: '保存', icon: <Save className="w-4 h-4" /> },
];

export default function App() {
  const { activePanel, setActivePanel, compareList, appMode, setAppMode, gallerySchemes, currentSchemeId } = useAppStore();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showCuratorHub, setShowCuratorHub] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const currentScheme = gallerySchemes.find((s) => s.id === currentSchemeId);
  const activeTabs = appMode === 'curator' ? tabs : artworkModeTabs;

  const renderPanel = () => {
    switch (activePanel) {
      case 'scheme':
        return <SchemeOrchestrator />;
      case 'lighting':
        return <LightingPanel />;
      case 'material':
        return <MaterialPanel />;
      case 'compare':
        return <CompareView />;
      case 'storage':
        return <StoragePanel />;
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

      <header className="h-14 border-b border-gallery-border bg-gallery-surface flex items-center justify-between px-4 flex-shrink-0">
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
          {appMode === 'curator' && currentScheme && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gallery-bg border border-gallery-border">
              <Folder className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs text-white/80 font-medium truncate max-w-[150px]">
                {currentScheme.name}
              </span>
              <span className="text-[10px] text-white/40">
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
