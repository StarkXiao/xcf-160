import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  TrendingUp,
  Calendar,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Circle,
  PlayCircle,
  XCircle,
  PlusCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
} from '../../types';
import type { ProgressStatus, ProgressStep } from '../../types';

interface ProgressTrackerProps {
  projectId: string;
  compact?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  projectId,
  compact = false,
}) => {
  const {
    curatorProjects,
    updateProgressStep,
    setProgressStepStatus,
    addProgressStep,
    removeProgressStep,
  } = useAppStore();

  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const project = useMemo(
    () => curatorProjects.find((p) => p.id === projectId),
    [curatorProjects, projectId]
  );

  const sortedSteps = useMemo(
    () => [...(project?.progress.steps || [])].sort((a, b) => a.order - b.order),
    [project]
  );

  const overallProgress = project?.progress.overallProgress || 0;

  const handleAddStep = () => {
    if (!newStepName.trim()) return;
    addProgressStep(projectId, {
      name: newStepName.trim(),
      description: newStepDescription.trim() || undefined,
      status: 'not_started',
      order: sortedSteps.length,
    });
    setNewStepName('');
    setNewStepDescription('');
    setShowAddStep(false);
  };

  const handleStatusChange = (stepId: string, status: ProgressStatus) => {
    setProgressStepStatus(projectId, stepId, status);
  };

  const handleDeleteStep = (stepId: string) => {
    const step = sortedSteps.find((s) => s.id === stepId);
    if (step && confirm(`确定要删除步骤"${step.name}"吗？`)) {
      removeProgressStep(projectId, stepId);
    }
  };

  const handleToggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleStartEditNotes = (step: ProgressStep) => {
    setEditingStepId(step.id);
    setEditingNotes(step.notes || '');
  };

  const handleSaveNotes = (stepId: string) => {
    updateProgressStep(projectId, stepId, { notes: editingNotes || undefined });
    setEditingStepId(null);
    setEditingNotes(null);
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setEditingNotes(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDueDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusIcon = (status: ProgressStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
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
          <TrendingUp className="w-5 h-5 text-gold" />
          布展进度
        </h3>
        <button
          onClick={() => setShowAddStep(true)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          添加步骤
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">总体进度</span>
          <span className="text-sm font-medium text-white">
            {overallProgress}%
          </span>
        </div>
        <div className="h-3 bg-gallery-bg rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              backgroundColor:
                overallProgress === 100
                  ? '#22c55e'
                  : overallProgress >= 50
                  ? '#d4af37'
                  : overallProgress > 0
                  ? '#3b82f6'
                  : '#6b7280',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-white/40">
          <span>
            {sortedSteps.filter((s) => s.status === 'completed').length} /{' '}
            {sortedSteps.length} 个步骤已完成
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            预计完成时间: {formatDueDate(
              sortedSteps[sortedSteps.length - 1]?.dueDate ||
                sortedSteps[sortedSteps.length - 1]?.completedAt ||
                project.updatedAt
            )}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {sortedSteps.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-sm mb-2">暂无进度步骤</p>
            <p className="text-white/30 text-xs">
              点击上方按钮添加进度追踪步骤
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gallery-border" />

            {sortedSteps.map((step, index) => {
              const isExpanded = expandedSteps.has(step.id);
              const isEditing = editingStepId === step.id;
              const isLast = index === sortedSteps.length - 1;

              return (
                <motion.div
                  key={step.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative pl-10 pb-4"
                >
                  <div
                    className={`absolute left-2 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.status === 'completed'
                        ? 'bg-green-500/20'
                        : step.status === 'in_progress'
                        ? 'bg-blue-500/20'
                        : step.status === 'blocked'
                        ? 'bg-red-500/20'
                        : 'bg-gray-500/20'
                    }`}
                  >
                    {getStatusIcon(step.status)}
                  </div>

                  <div className="card p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`font-medium truncate ${
                              step.status === 'completed'
                                ? 'text-white/50 line-through'
                                : 'text-white'
                            }`}
                          >
                            {step.name}
                          </h4>
                          <span
                            className="px-2 py-0.5 text-xs rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: `${PROGRESS_STATUS_COLORS[step.status]}20`,
                              color: PROGRESS_STATUS_COLORS[step.status].replace(
                                'bg-',
                                'text-'
                              ),
                            }}
                          >
                            {PROGRESS_STATUS_LABELS[step.status]}
                          </span>
                        </div>
                        {step.description && (
                          <p className="text-xs text-white/40 mb-2">
                            {step.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          {step.assignee && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {step.assignee}
                            </span>
                          )}
                          {step.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              截止: {formatDueDate(step.dueDate)}
                            </span>
                          )}
                          {step.completedAt && (
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              完成: {formatDate(step.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={step.status}
                          onChange={(e) =>
                            handleStatusChange(step.id, e.target.value as ProgressStatus)
                          }
                          className="bg-gallery-bg border border-gallery-border rounded px-2 py-1 text-xs text-white/70 focus:outline-none focus:border-gold/50"
                        >
                          <option value="not_started">未开始</option>
                          <option value="in_progress">进行中</option>
                          <option value="completed">已完成</option>
                          <option value="blocked">已阻塞</option>
                        </select>
                        <button
                          onClick={() => handleToggleExpand(step.id)}
                          className="p-1 text-white/40 hover:text-white hover:bg-gallery-hover rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="删除步骤"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-gallery-border">
                            {isEditing ? (
                              <div>
                                <label className="block text-xs text-white/60 mb-2">
                                  备注
                                </label>
                                <textarea
                                  value={editingNotes || ''}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  className="input-field resize-none text-sm"
                                  rows={3}
                                  placeholder="添加备注信息..."
                                  autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleSaveNotes(step.id)}
                                    className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    保存
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" />
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs text-white/60">备注</label>
                                  <button
                                    onClick={() => handleStartEditNotes(step)}
                                    className="text-xs text-gold hover:text-gold/80 flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    编辑
                                  </button>
                                </div>
                                {step.notes ? (
                                  <p className="text-sm text-white/70 bg-gallery-bg p-3 rounded-lg">
                                    {step.notes}
                                  </p>
                                ) : (
                                  <p className="text-sm text-white/30 italic">
                                    暂无备注，点击编辑添加
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddStep(false);
              setNewStepName('');
              setNewStepDescription('');
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
                添加进度步骤
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    步骤名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    className="input-field"
                    placeholder="输入步骤名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddStep();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    步骤描述（可选）
                  </label>
                  <textarea
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="输入步骤描述..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddStep(false);
                    setNewStepName('');
                    setNewStepDescription('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAddStep}
                  disabled={!newStepName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
