import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  Trash2,
  MessageSquare,
  RotateCcw,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Plus,
  FileText,
  PlusCircle,
  Send,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ProjectVersion, VersionComment } from '../../types';

interface VersionManagerProps {
  projectId: string;
  compact?: boolean;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  projectId,
  compact = false,
}) => {
  const {
    curatorProjects,
    gallerySchemes,
    currentSchemeId,
    saveProjectVersion,
    loadProjectVersion,
    deleteProjectVersion,
    addVersionComment,
    deleteVersionComment,
    compareVersions,
  } = useAppStore();

  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [compareVersion1, setCompareVersion1] = useState<string | null>(null);
  const [compareVersion2, setCompareVersion2] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showSaveVersion, setShowSaveVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentVersionId, setCommentVersionId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const project = useMemo(
    () => curatorProjects.find((p) => p.id === projectId),
    [curatorProjects, projectId]
  );

  const sortedVersions = useMemo(
    () => [...(project?.versions || [])].sort((a, b) => b.createdAt - a.createdAt),
    [project]
  );

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const comparisonResult = useMemo(() => {
    if (!compareVersion1 || !compareVersion2) return null;
    return compareVersions(projectId, compareVersion1, compareVersion2);
  }, [compareVersions, projectId, compareVersion1, compareVersion2]);

  const versionComments = useMemo(() => {
    if (!expandedVersionId || !project) return [];
    return project.versionComments.filter((c) => c.versionId === expandedVersionId);
  }, [expandedVersionId, project]);

  const handleSaveVersion = () => {
    if (!newVersionName.trim()) return;
    saveProjectVersion(
      projectId,
      newVersionName.trim(),
      newVersionDescription.trim() || undefined
    );
    setNewVersionName('');
    setNewVersionDescription('');
    setShowSaveVersion(false);
  };

  const handleLoadVersion = (versionId: string) => {
    const version = sortedVersions.find((v) => v.id === versionId);
    if (version && confirm(`确定要恢复到版本"${version.name}"吗？这将创建一个新方案。`)) {
      loadProjectVersion(projectId, versionId);
    }
  };

  const handleDeleteVersion = (versionId: string) => {
    const version = sortedVersions.find((v) => v.id === versionId);
    if (version && confirm(`确定要删除版本"${version.name}"吗？此操作不可撤销。`)) {
      deleteProjectVersion(projectId, versionId);
      if (expandedVersionId === versionId) setExpandedVersionId(null);
      if (compareVersion1 === versionId) setCompareVersion1(null);
      if (compareVersion2 === versionId) setCompareVersion2(null);
    }
  };

  const handleToggleExpand = (versionId: string) => {
    setExpandedVersionId(expandedVersionId === versionId ? null : versionId);
    setCommentVersionId(null);
    setNewComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !expandedVersionId) return;
    addVersionComment(projectId, expandedVersionId, '策展人', newComment.trim());
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('确定要删除这条评论吗？')) {
      deleteVersionComment(projectId, commentId);
    }
  };

  const handleSelectForCompare = (versionId: string) => {
    if (!compareVersion1) {
      setCompareVersion1(versionId);
    } else if (!compareVersion2 && compareVersion1 !== versionId) {
      setCompareVersion2(versionId);
      setShowCompare(true);
      setCompareMode(false);
    } else {
      setCompareVersion1(versionId);
      setCompareVersion2(null);
    }
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
    setCompareVersion1(null);
    setCompareVersion2(null);
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

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <p>请选择一个项目</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-gold" />
          版本历史
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${
              compareMode ? 'ring-2 ring-gold/50' : ''
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {compareMode ? '取消对比' : '对比版本'}
          </button>
          <button
            onClick={() => setShowSaveVersion(true)}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            保存版本
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
          <p className="text-xs text-gold mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            请选择两个版本进行对比
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60">已选择:</span>
            <span className={compareVersion1 ? 'text-gold' : 'text-white/30'}>
              {compareVersion1
                ? sortedVersions.find((v) => v.id === compareVersion1)?.name
                : '版本 1'}
            </span>
            <ArrowRight className="w-3 h-3 text-white/40" />
            <span className={compareVersion2 ? 'text-gold' : 'text-white/30'}>
              {compareVersion2
                ? sortedVersions.find((v) => v.id === compareVersion2)?.name
                : '版本 2'}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {sortedVersions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-sm mb-2">暂无版本记录</p>
            <p className="text-white/30 text-xs">点击上方按钮保存当前方案为版本</p>
          </div>
        ) : (
          sortedVersions.map((version, index) => {
            const isExpanded = expandedVersionId === version.id;
            const isSelectedForCompare =
              compareVersion1 === version.id || compareVersion2 === version.id;
            const comments = project.versionComments.filter(
              (c) => c.versionId === version.id
            );

            return (
              <motion.div
                key={version.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div
                  className={`card p-4 transition-all ${
                    isSelectedForCompare ? 'ring-2 ring-gold/50 bg-gold/5' : ''
                  } ${compareMode ? 'cursor-pointer hover:ring-2 hover:ring-gold/30' : ''}`}
                  onClick={() => compareMode && handleSelectForCompare(version.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getVersionColor(index)}20` }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: getVersionColor(index) }}
                      >
                        V{sortedVersions.length - index}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white truncate">{version.name}</h4>
                        {compareMode && isSelectedForCompare && (
                          <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded">
                            已选择
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-xs text-white/40 mb-2 line-clamp-2">
                          {version.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {version.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {version.scheme.wallArtworks.length} 件作品
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {comments.length} 条评论
                        </span>
                      </div>
                    </div>
                    {!compareMode && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadVersion(version.id);
                          }}
                          className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          title="恢复此版本"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(version.id);
                          }}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVersion(version.id);
                          }}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="删除版本"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && !compareMode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gallery-border">
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-gold" />
                              评论 ({comments.length})
                            </h5>
                            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                              {comments.length === 0 ? (
                                <p className="text-xs text-white/30 italic text-center py-4">
                                  暂无评论，添加第一条评论吧
                                </p>
                              ) : (
                                comments.map((comment) => (
                                  <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onDelete={() => handleDeleteComment(comment.id)}
                                  />
                                ))
                              )}
                            </div>
                            {commentVersionId === version.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="input-field flex-1 text-sm"
                                  placeholder="输入评论..."
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment();
                                    }
                                  }}
                                />
                                <button
                                  onClick={handleAddComment}
                                  disabled={!newComment.trim()}
                                  className="btn-primary px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCommentVersionId(null);
                                    setNewComment('');
                                  }}
                                  className="btn-secondary px-3"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCommentVersionId(version.id)}
                                className="w-full py-2 border border-dashed border-gallery-border rounded-lg text-sm text-white/40 hover:text-white hover:border-gold/50 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-4 h-4" />
                                添加评论
                              </button>
                            )}
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-white mb-2 flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-gold" />
                              版本详情
                            </h5>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-gallery-bg p-3 rounded-lg">
                                <span className="text-white/40">作品数量</span>
                                <p className="text-white font-medium mt-1">
                                  {version.scheme.wallArtworks.length} 件
                                </p>
                              </div>
                              <div className="bg-gallery-bg p-3 rounded-lg">
                                <span className="text-white/40">灯光策略</span>
                                <p className="text-white font-medium mt-1 capitalize">
                                  {version.scheme.lightingStrategy.mode}
                                </p>
                              </div>
                              <div className="bg-gallery-bg p-3 rounded-lg">
                                <span className="text-white/40">墙面材质</span>
                                <p className="text-white font-medium mt-1 capitalize">
                                  {version.scheme.wallMaterial}
                                </p>
                              </div>
                              <div className="bg-gallery-bg p-3 rounded-lg">
                                <span className="text-white/40">分组数量</span>
                                <p className="text-white font-medium mt-1">
                                  {version.scheme.groups.length} 组
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showSaveVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowSaveVersion(false);
              setNewVersionName('');
              setNewVersionDescription('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-gold" />
                保存新版本
              </h3>
              {currentScheme && (
                <div className="mb-4 p-3 bg-gallery-bg rounded-lg">
                  <p className="text-xs text-white/40 mb-1">当前方案</p>
                  <p className="text-sm text-white">{currentScheme.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {currentScheme.wallArtworks.length} 件作品
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    版本名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    className="input-field"
                    placeholder="例如：初稿方案、评审版、最终版..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveVersion();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    版本描述（可选）
                  </label>
                  <textarea
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="记录此版本的变更内容..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSaveVersion(false);
                    setNewVersionName('');
                    setNewVersionDescription('');
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
                  <Check className="w-4 h-4" />
                  保存版本
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompare && comparisonResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseCompare}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-gold" />
                  版本对比
                </h3>
                <button
                  onClick={handleCloseCompare}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gallery-bg p-4 rounded-lg">
                  <p className="text-xs text-white/40 mb-1">版本 1</p>
                  <p className="text-sm font-medium text-white">
                    {comparisonResult.version1.name}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {formatDate(comparisonResult.version1.createdAt)}
                  </p>
                </div>
                <div className="bg-gold/10 p-4 rounded-lg border border-gold/30">
                  <p className="text-xs text-gold/60 mb-1">版本 2（较新）</p>
                  <p className="text-sm font-medium text-gold">
                    {comparisonResult.version2.name}
                  </p>
                  <p className="text-xs text-gold/60 mt-1">
                    {formatDate(comparisonResult.version2.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <h4 className="text-sm font-medium text-white mb-3">变更内容</h4>
                {comparisonResult.differences.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-10 h-10 mx-auto mb-3 text-green-500" />
                    <p className="text-white/50">两个版本完全相同</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comparisonResult.differences.map((diff, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gallery-bg rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm text-white">{diff}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gallery-border">
                <button onClick={handleCloseCompare} className="flex-1 btn-secondary">
                  关闭
                </button>
                <button
                  onClick={() => {
                    handleLoadVersion(comparisonResult.version2.id);
                    handleCloseCompare();
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  恢复到新版本
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentItem: React.FC<{
  comment: VersionComment;
  onDelete: () => void;
}> = ({ comment, onDelete }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gallery-bg p-3 rounded-lg group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-gold" />
          </div>
          <span className="text-xs font-medium text-white">{comment.author}</span>
          <span className="text-xs text-white/30">{formatDate(comment.createdAt)}</span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="删除评论"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-sm text-white/70 ml-8">{comment.content}</p>
    </div>
  );
};

const getVersionColor = (index: number): string => {
  const colors = ['#d4af37', '#45B7D1', '#96CEB4', '#FF6B6B', '#DDA0DD', '#F7DC6F'];
  return colors[index % colors.length];
};
