import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Lightbulb,
  Layers,
  Sparkles,
  Image,
  Calendar,
  Clock,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { CustomerProposal } from '../../types';
import { FRAME_MATERIAL_LABELS, WALL_MATERIAL_LABELS } from '../../types';

interface ProposalShareViewProps {
  shareToken: string;
  onClose: () => void;
}

export const ProposalShareView: React.FC<ProposalShareViewProps> = ({
  shareToken,
  onClose,
}) => {
  const { proposals } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [proposal, setProposal] = useState<CustomerProposal | null>(null);
  const [activeArtworkIndex, setActiveArtworkIndex] = useState(0);

  useEffect(() => {
    try {
      const decoded = atob(shareToken);
      const data = JSON.parse(decoded);
      const { proposalId, token } = data;

      const foundProposal = proposals.find(
        (p) => p.id === proposalId && p.shareToken === token
      );

      if (foundProposal) {
        if (foundProposal.shareExpiresAt && Date.now() > foundProposal.shareExpiresAt) {
          setIsExpired(true);
        } else {
          setProposal(foundProposal);
          setIsValid(true);
        }
      } else {
        setIsValid(false);
      }
    } catch {
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, proposals]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600">正在加载提案...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <FileText className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-3">
            链接无效
          </h2>
          <p className="text-gray-500 mb-6">
            抱歉，您访问的提案链接无效或已被删除。
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-3">
            链接已过期
          </h2>
          <p className="text-gray-500 mb-6">
            抱歉，此提案分享链接已过期。请联系策展人获取新的链接。
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  const activeArtwork = proposal.artworks[activeArtworkIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto"
    >
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-gray-800">
                {proposal.title}
              </h1>
              <p className="text-xs text-gray-500">{proposal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-amber-900 to-amber-700 rounded-2xl p-12 text-white mb-12">
          <h1 className="text-4xl font-display font-bold mb-3">{proposal.title}</h1>
          <p className="text-xl text-amber-200 mb-8">{proposal.subtitle}</p>
          <div className="flex items-center gap-8 text-sm text-amber-200">
            <span className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              {proposal.artworks.length} 件作品
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(proposal.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Lumina Curator
            </span>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-4">
            方案引言
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {proposal.introduction}
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Image className="w-5 h-5 text-amber-600" />
            </span>
            作品讲解
          </h2>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {proposal.artworks.map((artwork, index) => (
              <button
                key={artwork.artworkId}
                onClick={() => setActiveArtworkIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  activeArtworkIndex === index
                    ? 'ring-2 ring-amber-500 ring-offset-2 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeArtwork && (
              <motion.div
                key={activeArtwork.artworkId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 aspect-[3/4] bg-gray-100">
                    <img
                      src={activeArtwork.imageUrl}
                      alt={activeArtwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-3/5 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-display font-semibold text-gray-800">
                          {activeArtworkIndex + 1}. {activeArtwork.title}
                        </h3>
                        <p className="text-gray-500 mt-1">
                          {activeArtwork.artist} · {activeArtwork.year} ·{' '}
                          {activeArtwork.medium}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                      {activeArtwork.description}
                    </p>

                    <div className="space-y-4">
                      <div className="bg-amber-50 rounded-xl p-5">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          灯光设计
                        </h4>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          {activeArtwork.lightingDescription}
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-5">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          材质装裱
                        </h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {activeArtwork.materialDescription}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          策展人备注
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed italic">
                          "{activeArtwork.curatorNote}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </span>
            {proposal.lightingSection.title}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            {proposal.lightingSection.description}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {proposal.lightingSection.specifications.map((spec, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 text-center"
              >
                <p className="text-3xl font-bold text-amber-700 mb-1">
                  {spec.value}
                </p>
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
            {proposal.materialSection.title}
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-6">
            {proposal.materialSection.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                画框推荐
              </h3>
              <p className="text-2xl font-bold text-amber-600 mb-3">
                {FRAME_MATERIAL_LABELS[proposal.materialSection.frameRecommendation.material]}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {proposal.materialSection.frameRecommendation.reason}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                墙面推荐
              </h3>
              <p className="text-2xl font-bold text-blue-600 mb-3">
                {WALL_MATERIAL_LABELS[proposal.materialSection.wallRecommendation.material]}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {proposal.materialSection.wallRecommendation.reason}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-900 to-amber-700 rounded-2xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl font-display font-semibold mb-4">结语</h2>
          <p className="text-amber-100 leading-relaxed text-lg mb-8">
            {proposal.conclusion}
          </p>
          <div className="pt-6 border-t border-amber-600/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-medium">Lumina Curator 团队</p>
              <p className="text-sm text-amber-200 mt-1">
                {formatDate(proposal.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-sm text-amber-200">
                由 Lumina Curator 生成
              </span>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm pb-8">
          <p>本提案由 Lumina Curator 专业策展系统生成</p>
          <p className="mt-1">© {new Date().getFullYear()} Lumina. All rights reserved.</p>
        </footer>
      </div>
    </motion.div>
  );
};
