import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Info } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Artwork } from '../../types';

export const ArtworkList: React.FC = () => {
  const { artworks, selectedArtworkId, setSelectedArtwork, removeArtwork } =
    useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInfo, setSelectedInfo] = useState<Artwork | null>(null);

  const filteredArtworks = artworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gallery-surface border-r border-gallery-border">
      <div className="p-4 border-b border-gallery-border">
        <h2 className="text-lg font-display font-semibold text-white mb-3">
          作品收藏
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="搜索作品..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredArtworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`group relative card p-2 cursor-pointer transition-all ${
                selectedArtworkId === artwork.id
                  ? 'border-gold ring-1 ring-gold/30'
                  : ''
              }`}
              onClick={() => setSelectedArtwork(artwork.id)}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gallery-bg">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-xs text-white/60 truncate">
                    {artwork.artist}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {artwork.year} · {artwork.medium}
                  </p>
                </div>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedInfo(artwork);
                  }}
                  className="p-1 bg-gallery-bg/80 rounded hover:bg-gallery-hover transition-colors"
                >
                  <Info className="w-3 h-3 text-white/70" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除"${artwork.title}"吗？`)) {
                      removeArtwork(artwork.id);
                    }
                  }}
                  className="p-1 bg-gallery-bg/80 rounded hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm">
            未找到匹配的作品
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gallery-border">
        <button className="w-full btn-secondary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          添加作品
        </button>
      </div>

      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-gallery-bg">
                <img
                  src={selectedInfo.imageUrl}
                  alt={selectedInfo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-1">
                {selectedInfo.title}
              </h3>
              <p className="text-gold mb-3">{selectedInfo.artist}</p>
              <div className="space-y-2 text-sm text-white/70">
                <p>
                  <span className="text-white/40">年份：</span>
                  {selectedInfo.year}
                </p>
                <p>
                  <span className="text-white/40">材质：</span>
                  {selectedInfo.medium}
                </p>
                <p>
                  <span className="text-white/40">尺寸：</span>
                  {selectedInfo.width} × {selectedInfo.height} cm
                </p>
                {selectedInfo.description && (
                  <p className="mt-4 pt-4 border-t border-gallery-border">
                    {selectedInfo.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedInfo(null)}
                className="mt-6 w-full btn-primary"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
