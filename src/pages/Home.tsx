import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  Palette,
  Lightbulb,
  Edit3,
  Save,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Bookmark,
  Sparkles,
  Layers,
  LayoutGrid,
  Download,
  CircleDot,
  Folder,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  LIGHT_TYPE_LABELS,
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  SCHEME_SOURCE_TYPE_LABELS,
} from '../types';
import type { SchemeSourceType } from '../types';

const schemeSourceIcons: Record<SchemeSourceType, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  preset: <Bookmark className="w-4 h-4" />,
  template: <Lightbulb className="w-4 h-4" />,
  recommendation: <Sparkles className="w-4 h-4" />,
  combo: <Palette className="w-4 h-4" />,
  theme: <Layers className="w-4 h-4" />,
  scene: <LayoutGrid className="w-4 h-4" />,
  import: <Download className="w-4 h-4" />,
};

const dirtyFieldLabels: Record<string, string> = {
  lighting: '灯光配置',
  material: '材质配置',
  artworks: '作品选择',
  scheme: '方案切换',
  project: '项目切换',
};

export default function Home() {
  const {
    artworks,
    lighting,
    material,
    homeState,
    getCurrentArtwork,
    getCurrentScheme,
    getCurrentProject,
    clearCurrentDirty,
    resetLighting,
    resetMaterial,
  } = useAppStore();

  const { currentArtwork, currentScheme, currentProject, schemeSource, isDirty, dirtyFields, lastSavedAt } = homeState;

  useEffect(() => {
    getCurrentArtwork();
    getCurrentScheme();
    getCurrentProject();
  }, [getCurrentArtwork, getCurrentScheme, getCurrentProject]);

  const handleSave = () => {
    clearCurrentDirty();
  };

  const handleReset = () => {
    resetLighting();
    resetMaterial();
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return '未保存';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            展陈方案工作台
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            实时预览当前作品配置，追踪方案来源与修改状态
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      当前作品
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {currentArtwork ? '已选择作品' : '未选择作品'}
                    </p>
                  </div>
                </div>
                {isDirty && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      有未保存的更改
                    </span>
                  </div>
                )}
              </div>

              {currentArtwork ? (
                <div className="p-5">
                  <div className="flex gap-5">
                    <div className="w-40 h-56 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                      <img
                        src={currentArtwork.imageUrl}
                        alt={currentArtwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {currentArtwork.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium">艺术家：</span>
                        {currentArtwork.artist} · {currentArtwork.year}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium">材质：</span>
                        {currentArtwork.medium}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        <span className="font-medium">尺寸：</span>
                        {currentArtwork.width} × {currentArtwork.height}
                        {currentArtwork.depth ? ` × ${currentArtwork.depth} cm` : ' cm'}
                      </p>
                      {currentArtwork.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                          {currentArtwork.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    请从作品库中选择一件作品
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      灯光配置
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {LIGHT_TYPE_LABELS[lighting.type]}
                    </p>
                  </div>
                  {dirtyFields.includes('lighting') && (
                    <CircleDot className="w-4 h-4 text-amber-500 ml-auto" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">色温</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {lighting.colorTemperature}K
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">强度</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {Math.round(lighting.intensity * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">角度</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {lighting.angle}°
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <Palette className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      材质配置
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      相框 + 墙面
                    </p>
                  </div>
                  {dirtyFields.includes('material') && (
                    <CircleDot className="w-4 h-4 text-amber-500 ml-auto" />
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">相框材质</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {FRAME_MATERIAL_LABELS[material.frameMaterial]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">墙面材质</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {WALL_MATERIAL_LABELS[material.wallMaterial]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">反光度</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {Math.round(material.reflectivity * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {currentProject && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Folder className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      当前项目
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentProject.status || '进行中'}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {currentProject.name}
                  </p>
                  {currentProject.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {currentProject.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentScheme && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-9 h-9 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      当前方案
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentScheme.wallArtworks?.length || 0} 件作品
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                    {currentScheme.name}
                  </p>
                  {currentScheme.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {currentScheme.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  方案来源
                </h3>
              </div>
              <div className="p-4">
                {schemeSource ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 dark:text-purple-400">
                        {schemeSourceIcons[schemeSource.type]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                        {schemeSource.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {SCHEME_SOURCE_TYPE_LABELS[schemeSource.type]}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        应用于 {formatTime(schemeSource.appliedAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      暂无方案来源
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  修改状态
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isDirty ? (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {isDirty ? '有未保存更改' : '所有更改已保存'}
                    </span>
                  </div>
                </div>

                {dirtyFields.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dirtyFields.map((field) => (
                      <span
                        key={field}
                        className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-md font-medium"
                      >
                        {dirtyFieldLabels[field] || field}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    上次保存：{formatTime(lastSavedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                <Save className="w-4 h-4" />
                保存方案
              </button>
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置配置
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
