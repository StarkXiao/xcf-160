import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Download,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Lightbulb,
  Layers,
  Sparkles,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  Image,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { FRAME_MATERIAL_LABELS, WALL_MATERIAL_LABELS } from '../../types';

interface ProposalViewProps {
  projectId: string;
}

type ProposalTab = 'list' | 'edit' | 'preview';

export const ProposalView: React.FC<ProposalViewProps> = ({ projectId }) => {
  const {
    proposals,
    currentProposalId,
    currentSchemeId,
    gallerySchemes,
    curatorProjects,
    createProposal,
    updateProposal,
    deleteProposal,
    setCurrentProposal,
    generateProposalShareLink,
    exportProposal,
    regenerateProposalArtworkDescription,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<ProposalTab>('list');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [expandedArtworkId, setExpandedArtworkId] = useState<string | null>(null);

  const currentProject = curatorProjects.find((p) => p.id === projectId);
  const projectProposals = useMemo(
    () => proposals.filter((p) => p.projectId === projectId),
    [proposals, projectId]
  );

  const currentProposal = useMemo(
    () => proposals.find((p) => p.id === currentProposalId) || null,
    [proposals, currentProposalId]
  );

  const projectSchemes = useMemo(() => {
    if (!currentProject) return [];
    return gallerySchemes.filter((s) => currentProject.schemeIds.includes(s.id));
  }, [currentProject, gallerySchemes]);

  const handleCreateProposal = () => {
    if (!newProposalTitle.trim() || !currentSchemeId) return;
    createProposal(projectId, currentSchemeId, newProposalTitle.trim());
    setNewProposalTitle('');
    setShowCreateDialog(false);
    setActiveTab('edit');
  };

  const handleDeleteProposal = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal && confirm(`确定要删除提案"${proposal.title}"吗？`)) {
      deleteProposal(proposalId);
      if (currentProposalId === proposalId) {
        setActiveTab('list');
      }
    }
  };

  const handleStartEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveEdit = (field: string) => {
    if (!currentProposal || !editValue.trim()) return;

    if (field.includes('.')) {
      const [section, key] = field.split('.');
      if (section === 'lightingSection' || section === 'materialSection') {
        updateProposal(currentProposal.id, {
          [section]: {
            ...currentProposal[section],
            [key]: editValue.trim(),
          },
        });
      }
    } else {
      updateProposal(currentProposal.id, { [field]: editValue.trim() });
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleGenerateShareLink = (proposalId?: string, expiresInDays = 7) => {
    const targetProposalId = proposalId || currentProposalId;
    if (!targetProposalId) return;
    const link = generateProposalShareLink(targetProposalId, expiresInDays);
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  const handleEditArtworkField = (artworkId: string, field: string, value: string) => {
    if (!currentProposal) return;
    const newArtworks = currentProposal.artworks.map((aw) =>
      aw.artworkId === artworkId ? { ...aw, [field]: value } : aw
    );
    updateProposal(currentProposal.id, { artworks: newArtworks });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEditableField = (
    field: string,
    value: string,
    className: string = '',
    multiline: boolean = false
  ) => {
    if (editingField === field) {
      return (
        <div className="flex gap-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 input-field resize-none text-sm"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSaveEdit(field);
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 input-field text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(field);
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
          )}
          <button
            onClick={() => handleSaveEdit(field)}
            className="p-2 text-green-400 hover:bg-green-500/20 rounded"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        className={`group cursor-pointer ${className}`}
        onClick={() => handleStartEdit(field, value)}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">{value}</div>
          <Edit3 className="w-3.5 h-3.5 text-white/30 group-hover:text-gold transition-colors flex-shrink-0 mt-0.5" />
        </div>
      </div>
    );
  };

  const renderProposalList = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold" />
            客户提案
          </h2>
          <p className="text-sm text-white/50 mt-1">
            为客户生成专业的展览方案建议书，包含作品讲解、灯光说明和材质建议
          </p>
        </div>
        <div className="flex items-center gap-3">
          {projectSchemes.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <AlertCircle className="w-4 h-4" />
              请先创建方案
            </div>
          ) : (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              生成新提案
            </button>
          )}
        </div>
      </div>

      {projectProposals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <FileText className="w-10 h-10 text-gold" />
          </div>
          <h3 className="text-xl font-display font-semibold text-white mb-2">
            还没有客户提案
          </h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            基于您的展览方案，一键生成专业的客户提案。包含每件作品的详细讲解、
            灯光设计理念和材质装裱建议，让您的方案展示更加专业。
          </p>
          {projectSchemes.length > 0 && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              生成第一个提案
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {projectProposals
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((proposal) => (
                <motion.div
                  key={proposal.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card p-4 hover:border-gold/50 transition-all cursor-pointer group"
                  onClick={() => {
                    setCurrentProposal(proposal.id);
                    setActiveTab('edit');
                  }}
                >
                  <div className="aspect-video bg-gradient-to-br from-gold/20 to-gallery-surface rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    <FileText className="w-12 h-12 text-gold/50" />
                    {proposal.shareToken && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        已分享
                      </div>
                    )}
                  </div>

                  <h4 className="font-medium text-white mb-1 truncate">
                    {proposal.title}
                  </h4>
                  <p className="text-xs text-white/40 mb-2">{proposal.subtitle}</p>

                  <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                    <span className="flex items-center gap-1">
                      <Image className="w-3 h-3" />
                      {proposal.artworks.length} 件作品
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(proposal.updatedAt).split(' ')[0]}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProposal(proposal.id);
                        setActiveTab('preview');
                      }}
                      className="flex-1 py-1.5 text-xs text-white/70 hover:text-white hover:bg-gallery-hover rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      预览
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProposal(proposal.id);
                        setShareLink('');
                        setShowShareDialog(true);
                        handleGenerateShareLink(proposal.id);
                      }}
                      className="flex-1 py-1.5 text-xs text-gold hover:bg-gold/10 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3 h-3" />
                      分享
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProposal(proposal.id);
                        exportProposal(proposal.id);
                      }}
                      className="flex-1 py-1.5 text-xs text-white/70 hover:text-white hover:bg-gallery-hover rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      导出
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProposal(proposal.id);
                      }}
                      className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  const renderEditView = () => {
    if (!currentProposal) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('list')}
            className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 返回提案列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={() => {
                setShareLink('');
                setShowShareDialog(true);
                handleGenerateShareLink();
              }}
              className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              生成分享链接
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="border-b border-gallery-border pb-4 mb-6">
            <div className="mb-2">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                提案标题
              </label>
              {renderEditableField('title', currentProposal.title, 'text-xl font-display font-semibold text-white')}
            </div>
            <div className="mb-2">
              <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                副标题
              </label>
              {renderEditableField('subtitle', currentProposal.subtitle, 'text-sm text-gold')}
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                创建于 {formatDate(currentProposal.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                更新于 {formatDate(currentProposal.updatedAt)}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm font-medium text-white mb-3 block flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              方案引言
            </label>
            {renderEditableField('introduction', currentProposal.introduction, 'text-white/70 leading-relaxed text-sm', true)}
          </div>

          <div className="mb-8">
            <label className="text-sm font-medium text-white mb-4 block flex items-center gap-2">
              <Image className="w-4 h-4 text-gold" />
              作品讲解 ({currentProposal.artworks.length} 件)
            </label>
            <div className="space-y-4">
              {currentProposal.artworks.map((artwork) => (
                <motion.div
                  key={artwork.artworkId}
                  className="bg-gallery-bg rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-gallery-hover/50 transition-colors"
                    onClick={() => setExpandedArtworkId(
                      expandedArtworkId === artwork.artworkId ? null : artwork.artworkId
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gallery-surface">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-medium text-white">{artwork.title}</h5>
                            <p className="text-xs text-white/50">
                              {artwork.artist} · {artwork.year} · {artwork.medium}
                            </p>
                          </div>
                          <ChevronRight
                            className={`w-5 h-5 text-white/40 transition-transform flex-shrink-0 ${
                              expandedArtworkId === artwork.artworkId ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedArtworkId === artwork.artworkId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gallery-border overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
                              作品描述
                            </label>
                            <textarea
                              value={artwork.description}
                              onChange={(e) =>
                                handleEditArtworkField(artwork.artworkId, 'description', e.target.value)
                              }
                              className="w-full input-field resize-none text-sm"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              灯光说明
                            </label>
                            <textarea
                              value={artwork.lightingDescription}
                              onChange={(e) =>
                                handleEditArtworkField(artwork.artworkId, 'lightingDescription', e.target.value)
                              }
                              className="w-full input-field resize-none text-sm"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              材质说明
                            </label>
                            <textarea
                              value={artwork.materialDescription}
                              onChange={(e) =>
                                handleEditArtworkField(artwork.artworkId, 'materialDescription', e.target.value)
                              }
                              className="w-full input-field resize-none text-sm"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              策展人备注
                            </label>
                            <div className="flex gap-2">
                              <textarea
                                value={artwork.curatorNote}
                                onChange={(e) =>
                                  handleEditArtworkField(artwork.artworkId, 'curatorNote', e.target.value)
                                }
                                className="flex-1 input-field resize-none text-sm"
                                rows={2}
                              />
                              <button
                                onClick={() => regenerateProposalArtworkDescription(
                                  currentProposal.id,
                                  artwork.artworkId
                                )}
                                className="px-3 py-2 text-xs text-gold hover:bg-gold/10 rounded-lg transition-colors flex items-center gap-1 self-start"
                              >
                                <RefreshCw className="w-3 h-3" />
                                重新生成
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm font-medium text-white mb-4 block flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-gold" />
              灯光设计说明
            </label>
            <div className="bg-gallery-bg rounded-lg p-5">
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                  标题
                </label>
                {renderEditableField(
                  'lightingSection.title',
                  currentProposal.lightingSection.title,
                  'text-white font-medium'
                )}
              </div>
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                  设计理念
                </label>
                {renderEditableField(
                  'lightingSection.description',
                  currentProposal.lightingSection.description,
                  'text-white/70 text-sm leading-relaxed',
                  true
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {currentProposal.lightingSection.specifications.map((spec, idx) => (
                  <div key={idx} className="bg-gallery-surface rounded-lg p-3">
                    <p className="text-xs text-white/40 mb-1">{spec.label}</p>
                    <p className="text-lg font-semibold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm font-medium text-white mb-4 block flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold" />
              材质与装裱建议
            </label>
            <div className="bg-gallery-bg rounded-lg p-5">
              <div className="mb-4">
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                  标题
                </label>
                {renderEditableField(
                  'materialSection.title',
                  currentProposal.materialSection.title,
                  'text-white font-medium'
                )}
              </div>
              <div className="mb-6">
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">
                  说明
                </label>
                {renderEditableField(
                  'materialSection.description',
                  currentProposal.materialSection.description,
                  'text-white/70 text-sm leading-relaxed',
                  true
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gallery-surface rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-gold" />
                    </div>
                    <span className="text-sm font-medium text-white">画框推荐</span>
                  </div>
                  <p className="text-lg font-semibold text-gold mb-2">
                    {FRAME_MATERIAL_LABELS[currentProposal.materialSection.frameRecommendation.material]}
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {currentProposal.materialSection.frameRecommendation.reason}
                  </p>
                </div>

                <div className="bg-gallery-surface rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-white">墙面推荐</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-400 mb-2">
                    {WALL_MATERIAL_LABELS[currentProposal.materialSection.wallRecommendation.material]}
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {currentProposal.materialSection.wallRecommendation.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-3 block flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              结语
            </label>
            {renderEditableField(
              'conclusion',
              currentProposal.conclusion,
              'text-white/70 leading-relaxed text-sm',
              true
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderPreview = () => {
    if (!currentProposal) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveTab('edit')}
            className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            ← 返回编辑
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportProposal(currentProposal.id)}
              className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              导出 JSON
            </button>
            <button
              onClick={() => {
                setShareLink('');
                setShowShareDialog(true);
                handleGenerateShareLink();
              }}
              className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              分享给客户
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-amber-900 to-amber-700 p-12 text-white">
            <h1 className="text-4xl font-display font-bold mb-3">{currentProposal.title}</h1>
            <p className="text-xl text-amber-200">{currentProposal.subtitle}</p>
            <div className="mt-6 pt-6 border-t border-amber-600/50 flex items-center gap-8 text-sm text-amber-200">
              <span>{currentProposal.artworks.length} 件作品</span>
              <span>{formatDate(currentProposal.createdAt).split(' ')[0]}</span>
              <span>Lumina Curator</span>
            </div>
          </div>

          <div className="p-12">
            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-gray-800 mb-4">
                方案引言
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {currentProposal.introduction}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Image className="w-5 h-5 text-amber-600" />
                </span>
                作品讲解
              </h2>
              <div className="space-y-8">
                {currentProposal.artworks.map((artwork, index) => (
                  <div
                    key={artwork.artworkId}
                    className="flex gap-8 pb-8 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-display font-semibold text-gray-800">
                            {index + 1}. {artwork.title}
                          </h3>
                          <p className="text-gray-500">
                            {artwork.artist} · {artwork.year} · {artwork.medium}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {artwork.description}
                      </p>
                      <div className="bg-amber-50 rounded-lg p-4 mb-3">
                        <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          灯光设计
                        </h4>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          {artwork.lightingDescription}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          材质装裱
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {artwork.materialDescription}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          策展人备注
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                          "{artwork.curatorNote}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </span>
                {currentProposal.lightingSection.title}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {currentProposal.lightingSection.description}
              </p>
              <div className="grid grid-cols-4 gap-4">
                {currentProposal.lightingSection.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 text-center"
                  >
                    <p className="text-3xl font-bold text-amber-700 mb-1">{spec.value}</p>
                    <p className="text-sm text-amber-600">{spec.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-600" />
                </span>
                {currentProposal.materialSection.title}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {currentProposal.materialSection.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">画框推荐</h3>
                  <p className="text-2xl font-bold text-amber-600 mb-3">
                    {FRAME_MATERIAL_LABELS[currentProposal.materialSection.frameRecommendation.material]}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {currentProposal.materialSection.frameRecommendation.reason}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">墙面推荐</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {WALL_MATERIAL_LABELS[currentProposal.materialSection.wallRecommendation.material]}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {currentProposal.materialSection.wallRecommendation.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-900 to-amber-700 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-display font-semibold mb-4">结语</h2>
              <p className="text-amber-100 leading-relaxed text-lg">
                {currentProposal.conclusion}
              </p>
              <div className="mt-8 pt-6 border-t border-amber-600/50 text-right text-amber-200">
                <p className="font-medium">Lumina Curator 团队</p>
                <p className="text-sm mt-1">
                  {formatDate(currentProposal.updatedAt).split(' ')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return renderProposalList();
      case 'edit':
        return renderEditView();
      case 'preview':
        return renderPreview();
      default:
        return renderProposalList();
    }
  };

  return (
    <div>
      {renderContent()}

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
                生成客户提案
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    提案标题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    className="input-field"
                    placeholder="例如：2024春季展览方案"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProposal();
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    基于方案
                  </label>
                  <select
                    value={currentSchemeId || ''}
                    onChange={(e) => {
                      useAppStore.getState().setCurrentScheme(e.target.value || null);
                    }}
                    className="input-field"
                  >
                    {projectSchemes.map((scheme) => (
                      <option key={scheme.id} value={scheme.id}>
                        {scheme.name} ({scheme.wallArtworks.length} 件作品)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-gallery-bg rounded-lg p-4">
                  <p className="text-xs text-white/50 leading-relaxed">
                    系统将自动为您生成：
                  </p>
                  <ul className="text-xs text-white/70 mt-2 space-y-1">
                    <li>• 每件作品的详细讲解和策展人备注</li>
                    <li>• 整体灯光设计理念和技术参数</li>
                    <li>• 画框和墙面材质的专业建议</li>
                    <li>• 完整的方案引言和结语</li>
                  </ul>
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
                  onClick={handleCreateProposal}
                  disabled={!newProposalTitle.trim() || !currentSchemeId}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  生成提案
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gold" />
                分享提案给客户
              </h3>

              {shareLink ? (
                <div className="space-y-4">
                  <div className="bg-gallery-bg rounded-lg p-4">
                    <p className="text-xs text-white/50 mb-2">分享链接</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 input-field text-xs font-mono"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-2 bg-gold text-gallery-bg rounded-lg text-xs font-medium hover:bg-gold/90 transition-colors flex items-center gap-1"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="w-4 h-4" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-white/50">
                    <p className="mb-2">链接有效期：7 天</p>
                    <p>客户可以通过此链接查看提案的全部内容，无需登录。</p>
                  </div>

                  <button
                    onClick={() => setShowShareDialog(false)}
                    className="w-full btn-primary"
                  >
                    完成
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center animate-spin">
                    <Sparkles className="w-8 h-8 text-gold" />
                  </div>
                  <p className="text-white/70">正在生成分享链接...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
