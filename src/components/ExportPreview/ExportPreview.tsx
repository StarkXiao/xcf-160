import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileJson,
  FileImage,
  Printer,
  Settings,
  Check,
  Eye,
  Image,
  FileText,
  Info,
  ToggleLeft,
  ToggleRight,
  Palette,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  EXPORT_FORMAT_LABELS,
  EXPORT_RESOLUTION_LABELS,
  DEFAULT_EXPORT_CONFIG,
  PROJECT_STATUS_LABELS,
} from '../../types';
import type { ExportFormat, ExportResolution, ExportConfig } from '../../types';

interface ExportPreviewProps {
  projectId: string;
  compact?: boolean;
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  projectId,
  compact = false,
}) => {
  const { curatorProjects, gallerySchemes, artworks, exportProjectPreview } =
    useAppStore();

  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    ...DEFAULT_EXPORT_CONFIG,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const project = useMemo(
    () => curatorProjects.find((p) => p.id === projectId),
    [curatorProjects, projectId]
  );

  const projectSchemes = useMemo(() => {
    if (!project) return [];
    return gallerySchemes.filter((s) => project.schemeIds.includes(s.id));
  }, [project, gallerySchemes]);

  const totalArtworks = useMemo(() => {
    return projectSchemes.reduce(
      (sum, scheme) => sum + scheme.wallArtworks.length,
      0
    );
  }, [projectSchemes]);

  const handleFormatChange = (format: ExportFormat) => {
    setExportConfig((prev) => ({ ...prev, format }));
  };

  const handleResolutionChange = (resolution: ExportResolution) => {
    setExportConfig((prev) => ({ ...prev, resolution }));
  };

  const handleToggleMetadata = () => {
    setExportConfig((prev) => ({
      ...prev,
      includeMetadata: !prev.includeMetadata,
    }));
  };

  const handleToggleArtworkInfo = () => {
    setExportConfig((prev) => ({
      ...prev,
      includeArtworkInfo: !prev.includeArtworkInfo,
    }));
  };

  const handleToggleLightingSpec = () => {
    setExportConfig((prev) => ({
      ...prev,
      includeLightingSpec: !prev.includeLightingSpec,
    }));
  };

  const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExportConfig((prev) => ({ ...prev, watermark: e.target.value }));
  };

  const handleExport = async () => {
    if (!project) return;
    setIsExporting(true);
    try {
      await exportProjectPreview(projectId, exportConfig);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <p>请选择一个项目</p>
      </div>
    );
  }

  const exportFormats: { id: ExportFormat; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'json',
      icon: <FileJson className="w-6 h-6" />,
      desc: '完整数据导出，可用于数据备份和迁移',
    },
    {
      id: 'pdf',
      icon: <FileText className="w-6 h-6" />,
      desc: '高清 PDF 文档，包含方案说明和作品清单',
    },
    {
      id: 'image',
      icon: <FileImage className="w-6 h-6" />,
      desc: '展厅布局渲染图，可用于展示和汇报',
    },
    {
      id: 'print',
      icon: <Printer className="w-6 h-6" />,
      desc: '打印规格文件，包含尺寸标注和施工说明',
    },
  ];

  const resolutions: { id: ExportResolution; desc: string }[] = [
    { id: 'low', desc: '适合屏幕预览和快速分享' },
    { id: 'medium', desc: '适合一般展示和在线查看' },
    { id: 'high', desc: '适合高质量打印和展示' },
    { id: 'print', desc: '适合专业印刷和出版' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-gold" />
          预览输出
        </h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${
            showPreview ? 'ring-2 ring-gold/50' : ''
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? '隐藏预览' : '预览效果'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-6">
        <div className="card p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-gold" />
            项目概览
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">项目名称</span>
              <p className="text-white font-medium mt-1 truncate">{project.name}</p>
            </div>
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">项目状态</span>
              <p className="text-white font-medium mt-1">
                {PROJECT_STATUS_LABELS[project.status]}
              </p>
            </div>
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">方案数量</span>
              <p className="text-white font-medium mt-1">
                {projectSchemes.length} 个方案
              </p>
            </div>
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">作品总数</span>
              <p className="text-white font-medium mt-1">{totalArtworks} 件</p>
            </div>
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">布展进度</span>
              <p className="text-white font-medium mt-1">
                {project.progress.overallProgress}%
              </p>
            </div>
            <div className="bg-gallery-bg p-3 rounded-lg">
              <span className="text-white/40">版本数量</span>
              <p className="text-white font-medium mt-1">
                {project.versions.length} 个版本
              </p>
            </div>
          </div>
          {project.description && (
            <div className="mt-3 p-3 bg-gallery-bg rounded-lg">
              <span className="text-xs text-white/40">项目描述</span>
              <p className="text-sm text-white/70 mt-1">{project.description}</p>
            </div>
          )}
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gold" />
            导出格式
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleFormatChange(format.id)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  exportConfig.format === format.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gallery-border hover:border-gold/50'
                }`}
              >
                <div
                  className={`mb-1 ${
                    exportConfig.format === format.id ? 'text-gold' : 'text-white/60'
                  }`}
                >
                  {format.icon}
                </div>
                <p
                  className={`text-sm font-medium ${
                    exportConfig.format === format.id ? 'text-gold' : 'text-white'
                  }`}
                >
                  {EXPORT_FORMAT_LABELS[format.id]}
                </p>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">
                  {format.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
            <Image className="w-4 h-4 text-gold" />
            分辨率
          </h4>
          <div className="space-y-2">
            {resolutions.map((res) => (
              <button
                key={res.id}
                onClick={() => handleResolutionChange(res.id)}
                className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                  exportConfig.resolution === res.id
                    ? 'border-gold bg-gold/10'
                    : 'border-gallery-border hover:border-gold/50'
                }`}
              >
                <div className="text-left">
                  <p
                    className={`text-sm font-medium ${
                      exportConfig.resolution === res.id
                        ? 'text-gold'
                        : 'text-white'
                    }`}
                  >
                    {EXPORT_RESOLUTION_LABELS[res.id]}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{res.desc}</p>
                </div>
                {exportConfig.resolution === res.id && (
                  <Check className="w-5 h-5 text-gold flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-gold" />
            导出内容
          </h4>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-3 bg-gallery-bg rounded-lg cursor-pointer hover:bg-gallery-hover transition-colors"
              onClick={handleToggleMetadata}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Info className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-white">包含元数据</p>
                  <p className="text-xs text-white/40">
                    项目信息、标签、创建时间等
                  </p>
                </div>
              </div>
              {exportConfig.includeMetadata ? (
                <ToggleRight className="w-6 h-6 text-gold" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-white/30" />
              )}
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gallery-bg rounded-lg cursor-pointer hover:bg-gallery-hover transition-colors"
              onClick={handleToggleArtworkInfo}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white">包含作品信息</p>
                  <p className="text-xs text-white/40">
                    作品标题、艺术家、年代、材质等
                  </p>
                </div>
              </div>
              {exportConfig.includeArtworkInfo ? (
                <ToggleRight className="w-6 h-6 text-gold" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-white/30" />
              )}
            </div>

            <div
              className="flex items-center justify-between p-3 bg-gallery-bg rounded-lg cursor-pointer hover:bg-gallery-hover transition-colors"
              onClick={handleToggleLightingSpec}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-white">包含灯光规格</p>
                  <p className="text-xs text-white/40">
                    灯光类型、色温、强度、角度等参数
                  </p>
                </div>
              </div>
              {exportConfig.includeLightingSpec ? (
                <ToggleRight className="w-6 h-6 text-gold" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-white/30" />
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-white/70 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-gold" />
              水印文字（可选）
            </label>
            <input
              type="text"
              value={exportConfig.watermark || ''}
              onChange={handleWatermarkChange}
              className="input-field"
              placeholder="例如：© 2024 美术馆名称"
            />
          </div>
        </div>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gold" />
                  导出预览
                </h4>
                <div className="bg-gallery-bg rounded-lg p-4 border border-gallery-border">
                  <div className="text-center mb-4 pb-4 border-b border-gallery-border">
                    <h2 className="text-xl font-display font-bold text-white mb-1">
                      {project.name}
                    </h2>
                    <p className="text-sm text-white/40">
                      {formatDate(project.createdAt)} · {PROJECT_STATUS_LABELS[project.status]}
                    </p>
                    {project.description && (
                      <p className="text-sm text-white/60 mt-3 max-w-md mx-auto">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gold">
                        {projectSchemes.length}
                      </p>
                      <p className="text-xs text-white/40">方案</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {totalArtworks}
                      </p>
                      <p className="text-xs text-white/40">作品</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {project.progress.overallProgress}%
                      </p>
                      <p className="text-xs text-white/40">进度</p>
                    </div>
                  </div>

                  {exportConfig.includeArtworkInfo && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-white/80">方案列表</h5>
                      {projectSchemes.map((scheme) => (
                        <div
                          key={scheme.id}
                          className="p-3 bg-gallery-dark/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="text-sm font-medium text-white">
                              {scheme.name}
                            </h6>
                            <span className="text-xs text-white/40">
                              {scheme.wallArtworks.length} 件作品
                            </span>
                          </div>
                          {scheme.groups.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {scheme.groups.map((group) => (
                                <span
                                  key={group.id}
                                  className="px-2 py-0.5 text-xs rounded-full"
                                  style={{
                                    backgroundColor: `${group.color}20`,
                                    color: group.color,
                                  }}
                                >
                                  {group.name} ({group.artworkIds.length})
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="grid grid-cols-4 gap-1.5">
                            {scheme.wallArtworks.slice(0, 8).map((wa) => {
                              const artwork = artworks.find(
                                (a) => a.id === wa.artworkId
                              );
                              return (
                                <div
                                  key={wa.id}
                                  className="aspect-square bg-gallery-border/30 rounded overflow-hidden"
                                >
                                  {artwork?.imageUrl && (
                                    <img
                                      src={artwork.imageUrl}
                                      alt={artwork.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              );
                            })}
                            {scheme.wallArtworks.length > 8 && (
                              <div className="aspect-square bg-gallery-border/30 rounded flex items-center justify-center">
                                <span className="text-xs text-white/40">
                                  +{scheme.wallArtworks.length - 8}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {exportConfig.watermark && (
                    <div className="mt-4 pt-4 border-t border-gallery-border text-center">
                      <p className="text-xs text-white/30">
                        {exportConfig.watermark}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-gallery-border">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              导出 {EXPORT_FORMAT_LABELS[exportConfig.format]}
            </>
          )}
        </button>
        <p className="text-xs text-white/30 text-center mt-2">
          导出文件将自动下载到您的设备
        </p>
      </div>
    </motion.div>
  );
};
