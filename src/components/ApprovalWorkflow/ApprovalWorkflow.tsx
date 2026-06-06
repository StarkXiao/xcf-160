import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Plus,
  Trash2,
  MessageSquare,
  RotateCcw,
  Clock,
  User,
  X,
  Check,
  Send,
  AlertCircle,
  ChevronRight,
  History,
  Archive,
  Eye,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Edit3,
  Tag,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Users,
  Save,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ApprovalRequest, ApprovalStatus } from '../../types';
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  APPROVAL_PRIORITY_LABELS,
  APPROVAL_PRIORITY_COLORS,
} from '../../types';

interface ApprovalWorkflowProps {
  projectId: string;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ projectId }) => {
  const {
    approvalRequests,
    currentApprovalId,
    gallerySchemes,
    curatorProjects,
    createApprovalRequest,
    submitApprovalRequest,
    updateApprovalStatus,
    addApprovalComment,
    resolveApprovalComment,
    deleteApprovalRequest,
    setCurrentApproval,
    archiveApprovalRequest,
    rollbackToVersion,
    updateApprovalRequest,
    getApprovalComments,
    getApprovalHistory,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState<ApprovalRequest | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [statusComment, setStatusComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApprovalStatus | 'all'>('all');
  const [editingApproval, setEditingApproval] = useState<ApprovalRequest | null>(null);

  const [newApprovalTitle, setNewApprovalTitle] = useState('');
  const [newApprovalDescription, setNewApprovalDescription] = useState('');
  const [newApprovalSchemeId, setNewApprovalSchemeId] = useState('');
  const [newApprovalVersionId, setNewApprovalVersionId] = useState('');
  const [newApprovalReviewers, setNewApprovalReviewers] = useState('');
  const [newApprovalPriority, setNewApprovalPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newApprovalTags, setNewApprovalTags] = useState('');

  const project = useMemo(
    () => curatorProjects.find((p) => p.id === projectId),
    [curatorProjects, projectId]
  );

  const projectSchemes = useMemo(() => {
    if (!project) return [];
    return gallerySchemes.filter((s) => project.schemeIds.includes(s.id));
  }, [project, gallerySchemes]);

  const projectApprovals = useMemo(
    () => approvalRequests.filter((a) => a.projectId === projectId),
    [approvalRequests, projectId]
  );

  const filteredApprovals = useMemo(() => {
    if (filterStatus === 'all') return projectApprovals;
    return projectApprovals.filter((a) => a.status === filterStatus);
  }, [projectApprovals, filterStatus]);

  const currentApproval = useMemo(
    () => approvalRequests.find((a) => a.id === currentApprovalId) || null,
    [approvalRequests, currentApprovalId]
  );

  const currentApprovalComments = useMemo(
    () => (currentApproval ? getApprovalComments(currentApproval.id) : []),
    [currentApproval, getApprovalComments]
  );

  const currentApprovalHistory = useMemo(
    () => (currentApproval ? getApprovalHistory(currentApproval.id) : []),
    [currentApproval, getApprovalHistory]
  );

  const currentScheme = useMemo(() => {
    if (!currentApproval) return null;
    return gallerySchemes.find((s) => s.id === currentApproval.schemeId);
  }, [currentApproval, gallerySchemes]);

  const currentVersion = useMemo(() => {
    if (!currentApproval?.versionId || !project) return null;
    return project.versions.find((v) => v.id === currentApproval.versionId);
  }, [currentApproval, project]);

  const handleCreateApproval = () => {
    if (!newApprovalTitle.trim() || !newApprovalSchemeId) return;

    const reviewers = newApprovalReviewers
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    const tags = newApprovalTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createApprovalRequest({
      projectId,
      schemeId: newApprovalSchemeId,
      versionId: newApprovalVersionId || undefined,
      title: newApprovalTitle.trim(),
      description: newApprovalDescription.trim() || undefined,
      submitter: '策展人',
      reviewers: reviewers.length > 0 ? reviewers : ['评审员'],
      currentReviewer: reviewers[0] || '评审员',
      priority: newApprovalPriority,
      tags,
    });

    setNewApprovalTitle('');
    setNewApprovalDescription('');
    setNewApprovalSchemeId('');
    setNewApprovalVersionId('');
    setNewApprovalReviewers('');
    setNewApprovalPriority('medium');
    setNewApprovalTags('');
    setShowCreateDialog(false);
  };

  const handleSubmitApproval = (approvalId: string) => {
    if (confirm('确定要提交此评审请求吗？提交后状态将变为"已提交"。')) {
      submitApprovalRequest(approvalId);
    }
  };

  const handleUpdateStatus = (status: ApprovalStatus) => {
    if (!showStatusDialog) return;

    const operator = status === 'under_review' ? '评审员' : '策展人';
    updateApprovalStatus(showStatusDialog.id, status, operator, statusComment || undefined);
    setShowStatusDialog(null);
    setStatusComment('');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentApproval) return;
    addApprovalComment(currentApproval.id, '策展人', newComment.trim());
    setNewComment('');
  };

  const handleResolveComment = (commentId: string) => {
    if (confirm('确定要标记此评论为已解决吗？')) {
      resolveApprovalComment(commentId, '策展人');
    }
  };

  const handleDeleteApproval = (approvalId: string) => {
    if (confirm('确定要删除此评审请求吗？此操作不可撤销。')) {
      deleteApprovalRequest(approvalId);
    }
  };

  const handleArchiveApproval = (approvalId: string) => {
    if (confirm('确定要归档此评审结果吗？归档后将无法修改。')) {
      archiveApprovalRequest(approvalId);
    }
  };

  const handleRollback = () => {
    if (!currentApproval || !selectedVersionId) return;
    if (confirm('确定要回退到此版本吗？这将创建一个新方案。')) {
      rollbackToVersion(currentApproval.id, projectId, selectedVersionId);
      setSelectedVersionId(null);
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

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'submitted':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'revised':
        return <Edit3 className="w-5 h-5 text-orange-500" />;
      case 'archived':
        return <Archive className="w-5 h-5 text-purple-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusStepIndex = (status: ApprovalStatus): number => {
    const steps: ApprovalStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'archived'];
    return steps.indexOf(status);
  };

  const renderApprovalCard = (approval: ApprovalRequest) => {
    const scheme = gallerySchemes.find((s) => s.id === approval.schemeId);
    const isCurrent = approval.id === currentApprovalId;

    return (
      <motion.div
        key={approval.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`card p-4 hover:border-gold/50 transition-all cursor-pointer group ${
          isCurrent ? 'ring-2 ring-gold/50 bg-gold/5' : ''
        }`}
        onClick={() => setCurrentApproval(approval.id)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getStatusIcon(approval.status)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">{approval.title}</h4>
              {scheme && (
                <p className="text-xs text-white/40 truncate">方案: {scheme.name}</p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${APPROVAL_PRIORITY_COLORS[approval.priority]}`}
          >
            {APPROVAL_PRIORITY_LABELS[approval.priority]}
          </span>
        </div>

        {approval.description && (
          <p className="text-xs text-white/50 mb-3 line-clamp-2">{approval.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {currentApproval ? getApprovalComments(approval.id).length : 0}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {approval.reviewers.length}
            </span>
          </div>
          <span>{formatDate(approval.createdAt)}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-gallery-border/50">
          <div className="flex items-center justify-between">
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: `${APPROVAL_STATUS_COLORS[approval.status]}20`,
                color: APPROVAL_STATUS_COLORS[approval.status].replace('bg-', 'text-'),
              }}
            >
              {APPROVAL_STATUS_LABELS[approval.status]}
            </span>
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              {approval.status === 'draft' && (
                <>
                  <button
                    onClick={() => setEditingApproval(approval)}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                    title="编辑"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSubmitApproval(approval.id)}
                    className="p-1.5 text-white/40 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="提交评审"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              {approval.status === 'approved' && (
                <button
                  onClick={() => handleArchiveApproval(approval.id)}
                  className="p-1.5 text-white/40 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-colors"
                  title="归档"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDeleteApproval(approval.id)}
                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
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
          <FileCheck className="w-5 h-5 text-gold" />
          审批流程
        </h3>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          发起评审
        </button>
      </div>

      <div className="flex gap-4 h-full overflow-hidden">
        <div className="w-80 flex flex-col flex-shrink-0 border-r border-gallery-border pr-4">
          <div className="flex gap-1 mb-4 flex-wrap">
            {(['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'revised', 'archived'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    filterStatus === status
                      ? 'bg-gold/20 text-gold'
                      : 'text-white/40 hover:text-white hover:bg-gallery-hover'
                  }`}
                >
                  {status === 'all' ? '全部' : APPROVAL_STATUS_LABELS[status]}
                </button>
              )
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <FileCheck className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/50 text-sm mb-2">暂无评审请求</p>
                  <p className="text-white/30 text-xs">点击右上角按钮发起新的评审</p>
                </div>
              ) : (
                filteredApprovals
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((approval) => renderApprovalCard(approval))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pl-4">
          {currentApproval ? (
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-display font-semibold text-white mb-2">
                      {currentApproval.title}
                    </h4>
                    {currentApproval.description && (
                      <p className="text-white/60 mb-3">{currentApproval.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        提交者: {currentApproval.submitter}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        创建: {formatDate(currentApproval.createdAt)}
                      </span>
                      {currentApproval.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          提交: {formatDate(currentApproval.submittedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${APPROVAL_PRIORITY_COLORS[currentApproval.priority]}`}
                  >
                    优先级: {APPROVAL_PRIORITY_LABELS[currentApproval.priority]}
                  </span>
                </div>

                <div className="mb-6">
                  <h5 className="text-sm font-medium text-white mb-3">审批进度</h5>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gallery-border" />
                    <div className="space-y-4">
                      {(['draft', 'submitted', 'under_review', 'approved', 'archived'] as const).map(
                        (status, index) => {
                          const stepIndex = getStatusStepIndex(status);
                          const currentStepIndex = getStatusStepIndex(currentApproval.status);
                          const isCompleted = stepIndex <= currentStepIndex;
                          const isCurrent = status === currentApproval.status;

                          return (
                            <div key={status} className="relative pl-10">
                              <div
                                className={`absolute left-2 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                  isCompleted
                                    ? APPROVAL_STATUS_COLORS[status]
                                    : 'bg-gray-700'
                                } ${isCurrent ? 'ring-2 ring-white/30' : ''}`}
                              >
                                {isCompleted && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="py-1">
                                <p
                                  className={`text-sm font-medium ${
                                    isCompleted ? 'text-white' : 'text-white/40'
                                  }`}
                                >
                                  {APPROVAL_STATUS_LABELS[status]}
                                </p>
                                {isCurrent && currentApprovalHistory.length > 0 && (
                                  <p className="text-xs text-white/40 mt-1">
                                    操作时间:{' '}
                                    {formatDate(
                                      currentApprovalHistory[
                                        currentApprovalHistory.length - 1
                                      ].createdAt
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {currentScheme && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gold" />
                      关联方案
                    </h5>
                    <div className="bg-gallery-bg rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{currentScheme.name}</p>
                          <p className="text-xs text-white/40 mt-1">
                            {currentScheme.wallArtworks.length} 件作品 ·{' '}
                            {currentScheme.groups.length} 个分组
                          </p>
                        </div>
                        {currentVersion && (
                          <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">
                            版本: {currentVersion.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentApproval.reviewers.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold" />
                      评审人员
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentApproval.reviewers.map((reviewer, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 text-xs rounded-full ${
                            currentApproval.currentReviewer === reviewer
                              ? 'bg-gold/20 text-gold'
                              : 'bg-gallery-bg text-white/60'
                          }`}
                        >
                          {reviewer}
                          {currentApproval.currentReviewer === reviewer && ' (当前)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentApproval.tags.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gold" />
                      标签
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentApproval.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gold/10 text-gold/70 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {currentApproval.status === 'draft' && (
                    <>
                      <button
                        onClick={() => setEditingApproval(currentApproval)}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleSubmitApproval(currentApproval.id)}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        提交评审
                      </button>
                    </>
                  )}
                  {currentApproval.status === 'submitted' && (
                    <button
                      onClick={() => setShowStatusDialog(currentApproval)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      <ClockIcon className="w-3.5 h-3.5" />
                      开始评审
                    </button>
                  )}
                  {currentApproval.status === 'under_review' && (
                    <>
                      <button
                        onClick={() => {
                          setShowStatusDialog(currentApproval);
                        }}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        通过
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusDialog(currentApproval);
                        }}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        驳回
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusDialog(currentApproval);
                        }}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 text-orange-400 border-orange-400/30 hover:bg-orange-500/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        需修改
                      </button>
                    </>
                  )}
                  {currentApproval.status === 'approved' && (
                    <button
                      onClick={() => handleArchiveApproval(currentApproval.id)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      归档结果
                    </button>
                  )}
                  {(currentApproval.status === 'rejected' ||
                    currentApproval.status === 'revised') &&
                    project.versions.length > 0 && (
                      <div className="w-full">
                        <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-gold" />
                          版本回退
                        </h5>
                        <div className="flex gap-2">
                          <select
                            value={selectedVersionId || ''}
                            onChange={(e) => setSelectedVersionId(e.target.value)}
                            className="input-field flex-1 text-sm"
                          >
                            <option value="">选择要回退的版本</option>
                            {project.versions.map((version) => (
                              <option key={version.id} value={version.id}>
                                {version.name} ({formatDate(version.createdAt)})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={handleRollback}
                            disabled={!selectedVersionId}
                            className="btn-primary text-xs px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            回退
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="card p-6">
                <h4 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold" />
                  评论反馈 ({currentApprovalComments.length})
                </h4>

                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {currentApprovalComments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 text-white/20" />
                      <p className="text-white/40 text-sm">暂无评论，添加第一条评论吧</p>
                    </div>
                  ) : (
                    currentApprovalComments
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 rounded-lg ${
                            comment.resolved ? 'bg-green-500/5 border border-green-500/20' : 'bg-gallery-bg'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-gold" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{comment.author}</p>
                                <p className="text-xs text-white/40">
                                  {formatDate(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                            {!comment.resolved && (
                              <button
                                onClick={() => handleResolveComment(comment.id)}
                                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                标记已解决
                              </button>
                            )}
                            {comment.resolved && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                已解决
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 ml-10">{comment.content}</p>
                          {comment.resolvedAt && comment.resolvedBy && (
                            <p className="text-xs text-white/40 mt-2 ml-10">
                              由 {comment.resolvedBy} 于 {formatDate(comment.resolvedAt)} 标记解决
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input-field flex-1 text-sm"
                    placeholder="添加评论..."
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
                    className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    发送
                  </button>
                </div>
              </div>

              <div className="card p-6">
                <h4 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-gold" />
                  操作历史
                </h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gallery-border" />
                  <div className="space-y-4">
                    {currentApprovalHistory.length === 0 ? (
                      <p className="text-center py-8 text-white/40 text-sm">暂无操作记录</p>
                    ) : (
                      currentApprovalHistory
                        .sort((a, b) => a.createdAt - b.createdAt)
                        .map((record, index) => (
                          <div key={record.id} className="relative pl-10">
                            <div
                              className={`absolute left-2 top-0 w-5 h-5 rounded-full flex items-center justify-center ${APPROVAL_STATUS_COLORS[record.status]}`}
                            >
                              {index === currentApprovalHistory.length - 1 ? (
                                <AlertCircle className="w-3 h-3 text-white" />
                              ) : (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="px-2 py-0.5 text-xs rounded-full"
                                  style={{
                                    backgroundColor: `${APPROVAL_STATUS_COLORS[record.status]}20`,
                                    color: APPROVAL_STATUS_COLORS[record.status].replace(
                                      'bg-',
                                      'text-'
                                    ),
                                  }}
                                >
                                  {APPROVAL_STATUS_LABELS[record.status]}
                                </span>
                                <span className="text-xs text-white/40">
                                  操作人: {record.operator}
                                </span>
                                <span className="text-xs text-white/40">
                                  {formatDate(record.createdAt)}
                                </span>
                              </div>
                              {record.comment && (
                                <p className="text-sm text-white/60">{record.comment}</p>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              <div className="text-center">
                <FileCheck className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/50 mb-2">请选择一个评审请求</p>
                <p className="text-white/30 text-sm">从左侧列表选择或创建新的评审</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
              className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold" />
                发起评审请求
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    评审标题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newApprovalTitle}
                    onChange={(e) => setNewApprovalTitle(e.target.value)}
                    className="input-field"
                    placeholder="例如：主方案评审、灯光方案终审..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateApproval();
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">评审描述</label>
                  <textarea
                    value={newApprovalDescription}
                    onChange={(e) => setNewApprovalDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="描述评审的目的和要求..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    关联方案 <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newApprovalSchemeId}
                    onChange={(e) => setNewApprovalSchemeId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">请选择方案</option>
                    {projectSchemes.map((scheme) => (
                      <option key={scheme.id} value={scheme.id}>
                        {scheme.name} ({scheme.wallArtworks.length} 件作品)
                      </option>
                    ))}
                  </select>
                </div>

                {newApprovalSchemeId && project.versions.length > 0 && (
                  <div>
                    <label className="block text-sm text-white/70 mb-2">关联版本（可选）</label>
                    <select
                      value={newApprovalVersionId}
                      onChange={(e) => setNewApprovalVersionId(e.target.value)}
                      className="input-field"
                    >
                      <option value="">不指定版本（使用当前方案）</option>
                      {project.versions
                        .filter((v) => v.scheme.id === newApprovalSchemeId)
                        .map((version) => (
                          <option key={version.id} value={version.id}>
                            {version.name} ({formatDate(version.createdAt)})
                          </option>
                        ))}
                      {project.versions.filter((v) => v.scheme.id === newApprovalSchemeId)
                        .length === 0 && (
                        <option value="" disabled>
                          此方案暂无版本记录
                        </option>
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    评审人员（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={newApprovalReviewers}
                    onChange={(e) => setNewApprovalReviewers(e.target.value)}
                    className="input-field"
                    placeholder="例如：张总监,李经理,王顾问"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">优先级</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setNewApprovalPriority(priority)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                          newApprovalPriority === priority
                            ? APPROVAL_PRIORITY_COLORS[priority]
                            : 'bg-gallery-bg text-white/50 hover:text-white'
                        }`}
                      >
                        {APPROVAL_PRIORITY_LABELS[priority]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={newApprovalTags}
                    onChange={(e) => setNewApprovalTags(e.target.value)}
                    className="input-field"
                    placeholder="例如：灯光,布局,材质"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewApprovalTitle('');
                    setNewApprovalDescription('');
                    setNewApprovalSchemeId('');
                    setNewApprovalVersionId('');
                    setNewApprovalReviewers('');
                    setNewApprovalPriority('medium');
                    setNewApprovalTags('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateApproval}
                  disabled={!newApprovalTitle.trim() || !newApprovalSchemeId}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatusDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowStatusDialog(null);
              setStatusComment('');
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
                <AlertTriangle className="w-5 h-5 text-gold" />
                更新审批状态
              </h3>

              <p className="text-white/60 mb-4">
                当前: <span className="text-white font-medium">{showStatusDialog.title}</span>
              </p>

              <div className="space-y-3 mb-4">
                {showStatusDialog.status === 'submitted' && (
                  <button
                    onClick={() => handleUpdateStatus('under_review')}
                    className="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ClockIcon className="w-5 h-5" />
                    开始评审
                  </button>
                )}
                {showStatusDialog.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus('approved')}
                      className="w-full p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      审核通过
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      审核驳回
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('revised')}
                      className="w-full p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-5 h-5" />
                      需要修改
                    </button>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">备注（可选）</label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="填写状态变更的原因或说明..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowStatusDialog(null);
                    setStatusComment('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingApproval(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-gold" />
                编辑评审请求
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">评审标题</label>
                  <input
                    type="text"
                    value={editingApproval.title}
                    onChange={(e) =>
                      setEditingApproval({ ...editingApproval, title: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">评审描述</label>
                  <textarea
                    value={editingApproval.description || ''}
                    onChange={(e) =>
                      setEditingApproval({ ...editingApproval, description: e.target.value })
                    }
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">优先级</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setEditingApproval({ ...editingApproval, priority })}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                          editingApproval.priority === priority
                            ? APPROVAL_PRIORITY_COLORS[priority]
                            : 'bg-gallery-bg text-white/50 hover:text-white'
                        }`}
                      >
                        {APPROVAL_PRIORITY_LABELS[priority]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    评审人员（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={editingApproval.reviewers.join(', ')}
                    onChange={(e) =>
                      setEditingApproval({
                        ...editingApproval,
                        reviewers: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingApproval(null)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    updateApprovalRequest(editingApproval.id, editingApproval);
                    setEditingApproval(null);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
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
