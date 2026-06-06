import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Move,
  Maximize2,
  RotateCw,
  CheckSquare,
  Square,
  Layers,
  ChevronUp,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  calculateLighting,
  getFrameStyle,
  getWallStyle,
} from '../../utils/lighting';
import { kelvinToHex } from '../../utils/color';
import type { WallArtwork, WallPosition } from '../../types';

interface DragState {
  isDragging: boolean;
  wallArtworkId: string | null;
  startX: number;
  startY: number;
  startPosX: number;
  startPosY: number;
}

interface ResizeState {
  isResizing: boolean;
  wallArtworkId: string | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  aspectRatio: number;
}

export const WallLayout: React.FC = () => {
  const {
    artworks,
    currentSchemeId,
    gallerySchemes,
    selectedWallArtworkIds,
    addArtworksToScheme,
    removeWallArtwork,
    updateWallArtworkPosition,
    updateWallArtworkLighting,
    updateWallArtworkMaterial,
    selectWallArtwork,
    clearWallArtworkSelection,
    setSchemeWallMaterial,
  } = useAppStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    wallArtworkId: null,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    wallArtworkId: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 1,
  });

  const wallRef = useRef<HTMLDivElement>(null);

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const wallArtworks = currentScheme?.wallArtworks || [];

  const filteredArtworks = useMemo(
    () =>
      artworks.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.artist.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [artworks, searchQuery]
  );

  const getWallArtworkArtwork = (wallArtwork: WallArtwork) => {
    return artworks.find((a) => a.id === wallArtwork.artworkId);
  };

  const handleAddArtworks = () => {
    if (selectedArtworkIds.length === 0) return;
    addArtworksToScheme(selectedArtworkIds);
    setSelectedArtworkIds([]);
    setShowAddDialog(false);
    setSearchQuery('');
  };

  const handleSelectAll = () => {
    const availableIds = filteredArtworks.map((a) => a.id);
    const allSelected = availableIds.every((id) => selectedArtworkIds.includes(id));
    setSelectedArtworkIds(allSelected ? [] : availableIds);
  };

  const handleToggleArtworkSelect = (artworkId: string) => {
    setSelectedArtworkIds((prev) =>
      prev.includes(artworkId)
        ? prev.filter((id) => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const handleDragStart = useCallback(
    (e: React.MouseEvent, wallArtworkId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const wallArtwork = wallArtworks.find((w) => w.id === wallArtworkId);
      if (!wallArtwork) return;

      if (!selectedWallArtworkIds.includes(wallArtworkId)) {
        selectWallArtwork(wallArtworkId, e.shiftKey);
      }

      setDragState({
        isDragging: true,
        wallArtworkId,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: wallArtwork.position.x,
        startPosY: wallArtwork.position.y,
      });
    },
    [wallArtworks, selectedWallArtworkIds, selectWallArtwork]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !wallRef.current) return;

      const rect = wallRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragState.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - dragState.startY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, dragState.startPosX + deltaX));
      const newY = Math.max(0, Math.min(100, dragState.startPosY + deltaY));

      if (dragState.wallArtworkId) {
        updateWallArtworkPosition(dragState.wallArtworkId, {
          x: newX,
          y: newY,
        });
      }
    },
    [dragState, updateWallArtworkPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      wallArtworkId: null,
      startX: 0,
      startY: 0,
      startPosX: 0,
      startPosY: 0,
    });
    setResizeState({
      isResizing: false,
      wallArtworkId: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      aspectRatio: 1,
    });
  }, []);

  React.useEffect(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, wallArtworkId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const wallArtwork = wallArtworks.find((w) => w.id === wallArtworkId);
      const artwork = wallArtwork ? getWallArtworkArtwork(wallArtwork) : null;
      if (!wallArtwork || !artwork) return;

      setResizeState({
        isResizing: true,
        wallArtworkId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: wallArtwork.position.width,
        startHeight: wallArtwork.position.height,
        aspectRatio: artwork.width / artwork.height,
      });
    },
    [wallArtworks]
  );

  const handleResizeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !wallRef.current) return;

      const rect = wallRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - resizeState.startX) / rect.width) * 100;
      const deltaY = ((e.clientY - resizeState.startY) / rect.height) * 100;

      const newWidth = Math.max(5, Math.min(50, resizeState.startWidth + deltaX));
      const newHeight = newWidth / resizeState.aspectRatio;

      if (resizeState.wallArtworkId) {
        updateWallArtworkPosition(resizeState.wallArtworkId, {
          width: newWidth,
          height: Math.max(5, Math.min(50, newHeight)),
        });
      }
    },
    [resizeState, updateWallArtworkPosition]
  );

  React.useEffect(() => {
    if (resizeState.isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
      };
    }
  }, [resizeState.isResizing, handleResizeMouseMove]);

  const handleWallClick = () => {
    clearWallArtworkSelection();
  };

  const handleLayerChange = (wallArtworkId: string, direction: 'up' | 'down') => {
    const wallArtwork = wallArtworks.find((w) => w.id === wallArtworkId);
    if (!wallArtwork) return;

    const sorted = [...wallArtworks].sort((a, b) => a.position.layer - b.position.layer);
    const currentIndex = sorted.findIndex((w) => w.id === wallArtworkId);

    if (direction === 'up' && currentIndex < sorted.length - 1) {
      const next = sorted[currentIndex + 1];
      updateWallArtworkPosition(wallArtworkId, { layer: next.position.layer });
      updateWallArtworkPosition(next.id, { layer: wallArtwork.position.layer });
    } else if (direction === 'down' && currentIndex > 0) {
      const prev = sorted[currentIndex - 1];
      updateWallArtworkPosition(wallArtworkId, { layer: prev.position.layer });
      updateWallArtworkPosition(prev.id, { layer: wallArtwork.position.layer });
    }
  };

  const handleRotate = (wallArtworkId: string) => {
    const wallArtwork = wallArtworks.find((w) => w.id === wallArtworkId);
    if (!wallArtwork) return;
    const newRotation = (wallArtwork.position.rotation + 15) % 360;
    updateWallArtworkPosition(wallArtworkId, { rotation: newRotation });
  };

  const handleDeleteSelected = () => {
    if (selectedWallArtworkIds.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedWallArtworkIds.length} 件作品吗？`)) {
      selectedWallArtworkIds.forEach((id) => removeWallArtwork(id));
      clearWallArtworkSelection();
    }
  };

  const renderWallArtwork = (wallArtwork: WallArtwork) => {
    const artwork = getWallArtworkArtwork(wallArtwork);
    if (!artwork) return null;

    const lightingResult = calculateLighting(wallArtwork.lighting, wallArtwork.material);
    const frameStyle = getFrameStyle(wallArtwork.material.frameMaterial);
    const lightColor = kelvinToHex(wallArtwork.lighting.colorTemperature);
    const bloomFilter = `blur(${lightingResult.bloomIntensity * 20}px)`;

    const isSelected = selectedWallArtworkIds.includes(wallArtwork.id);
    const aspectRatio = artwork.width / artwork.height;

    return (
      <motion.div
        key={wallArtwork.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`absolute cursor-move transition-shadow ${
          isSelected ? 'z-50' : ''
        }`}
        style={{
          left: `${wallArtwork.position.x}%`,
          top: `${wallArtwork.position.y}%`,
          width: `${wallArtwork.position.width}%`,
          height: `${wallArtwork.position.height}%`,
          transform: `translate(-50%, -50%) rotate(${wallArtwork.position.rotation}deg)`,
          zIndex: wallArtwork.position.layer + (isSelected ? 100 : 0),
        }}
        onMouseDown={(e) => handleDragStart(e, wallArtwork.id)}
        onClick={(e) => {
          e.stopPropagation();
          selectWallArtwork(wallArtwork.id, e.shiftKey);
        }}
      >
        <div
          className={`absolute inset-0 rounded transition-all duration-300 ${
            isSelected
              ? 'ring-2 ring-gold ring-offset-2 ring-offset-gallery-bg shadow-lg shadow-gold/30'
              : ''
          }`}
          style={{
            transform: 'translateY(10px)',
            background: `rgba(0, 0, 0, ${lightingResult.shadowOpacity * 0.8})`,
            filter: 'blur(10px)',
            zIndex: -1,
          }}
        />

        <div
          className="relative w-full h-full overflow-hidden transition-all duration-500"
          style={{
            borderStyle: 'solid',
            borderWidth: wallArtwork.material.frameMaterial !== 'none' ? frameStyle.borderWidth : '0',
            borderColor:
              wallArtwork.material.frameMaterial !== 'gold' &&
              wallArtwork.material.frameMaterial !== 'silver'
                ? frameStyle.borderColor
                : 'transparent',
            borderImage:
              wallArtwork.material.frameMaterial === 'gold' ||
              wallArtwork.material.frameMaterial === 'silver'
                ? `${frameStyle.borderColor} 1`
                : 'none',
            boxShadow: frameStyle.boxShadow,
          }}
        >
          <div
            className="absolute inset-0 transition-all duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${lightColor}40, transparent 60%)`,
              mixBlendMode: 'soft-light',
              opacity: lightingResult.spotlightIntensity,
              filter: bloomFilter,
            }}
          />

          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover"
            style={{
              filter: `brightness(${0.7 + wallArtwork.lighting.intensity * 0.5}) contrast(${1 + wallArtwork.lighting.intensity * 0.2})`,
            }}
            draggable={false}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, transparent 0%, rgba(0,0,0,${0.5 - wallArtwork.lighting.intensity * 0.3}) 100%)`,
            }}
          />
        </div>

        {isSelected && (
          <div className="absolute -right-1 -bottom-1 flex gap-0.5 bg-gallery-surface border border-gallery-border rounded-lg p-0.5 shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLayerChange(wallArtwork.id, 'up');
              }}
              className="p-1 hover:bg-gallery-hover rounded transition-colors"
              title="上移一层"
            >
              <ChevronUp className="w-3 h-3 text-white/70" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLayerChange(wallArtwork.id, 'down');
              }}
              className="p-1 hover:bg-gallery-hover rounded transition-colors"
              title="下移一层"
            >
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(wallArtwork.id);
              }}
              className="p-1 hover:bg-gallery-hover rounded transition-colors"
              title="旋转"
            >
              <RotateCw className="w-3 h-3 text-white/70" />
            </button>
            <button
              onMouseDown={(e) => handleResizeStart(e, wallArtwork.id)}
              className="p-1 hover:bg-gallery-hover rounded cursor-se-resize transition-colors"
              title="调整大小"
            >
              <Maximize2 className="w-3 h-3 text-white/70" />
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const wallStyle = currentScheme
    ? getWallStyle(currentScheme.wallMaterial, 0.3)
    : getWallStyle('matte', 0.3);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/60">
            {wallArtworks.length} 件作品
          </span>
          {selectedWallArtworkIds.length > 0 && (
            <span className="text-xs text-gold">
              已选择 {selectedWallArtworkIds.length} 件
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedWallArtworkIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除选中
            </button>
          )}
          <button
            onClick={() => setShowAddDialog(true)}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            添加作品
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-white/60 mb-1.5">墙面材质</label>
        <div className="flex gap-2">
          {(['matte', 'satin', 'glossy', 'concrete'] as const).map((material) => (
            <button
              key={material}
              onClick={() => setSchemeWallMaterial(material)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                currentScheme?.wallMaterial === material
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gallery-border bg-gallery-bg text-white/60 hover:border-gold/50 hover:text-white'
              }`}
            >
              {material === 'matte' && '哑光'}
              {material === 'satin' && '丝光'}
              {material === 'glossy' && '高光'}
              {material === 'concrete' && '水泥'}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wallRef}
        className="flex-1 relative rounded-xl overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: wallStyle.background }}
        onClick={handleWallClick}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {wallArtworks.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/40">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2">墙面为空</p>
              <p className="text-sm mb-4">点击上方按钮添加作品到墙面</p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                批量添加作品
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {wallArtworks
              .sort((a, b) => a.position.layer - b.position.layer)
              .map(renderWallArtwork)}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddDialog(false);
              setSelectedArtworkIds([]);
              setSearchQuery('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 max-w-2xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-display font-semibold text-white">
                  批量添加作品
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-white/60 hover:text-white flex items-center gap-1.5"
                  >
                    {filteredArtworks.length > 0 &&
                    filteredArtworks.every((a) => selectedArtworkIds.includes(a.id)) ? (
                      <CheckSquare className="w-4 h-4 text-gold" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    全选
                  </button>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="搜索作品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gallery-bg border border-gallery-border rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold/50 transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <AnimatePresence>
                  {filteredArtworks.map((artwork) => {
                    const isSelected = selectedArtworkIds.includes(artwork.id);
                    return (
                      <motion.div
                        key={artwork.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => handleToggleArtworkSelect(artwork.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-gold bg-gold/10'
                            : 'border-gallery-border bg-gallery-bg hover:border-gold/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gallery-surface">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {artwork.title}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {artwork.artist} · {artwork.year}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-gold bg-gold'
                              : 'border-gallery-border'
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3.5 h-3.5 text-gallery-bg" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredArtworks.length === 0 && (
                  <div className="text-center py-8 text-white/40 text-sm">
                    未找到匹配的作品
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gallery-border mt-4">
                <span className="text-sm text-white/60">
                  已选择 {selectedArtworkIds.length} 件作品
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddDialog(false);
                      setSelectedArtworkIds([]);
                      setSearchQuery('');
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddArtworks}
                    disabled={selectedArtworkIds.length === 0}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加到墙面
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
