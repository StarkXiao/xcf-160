import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { calculateLighting } from '../../utils/lighting';
import { kelvinToHex, kelvinToRGB } from '../../utils/color';
import { Layers, Info, Eye, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, RotateCcw, EyeOff, Grid3X3, Ruler } from 'lucide-react';
import { WALL_UNIT_LABELS, PREVIEW_FIT_MODE_LABELS } from '../../types';
import type { PreviewFitMode } from '../../types';

export const GalleryWallPreview: React.FC = () => {
  const {
    artworks,
    gallerySchemes,
    currentSchemeId,
    selectedWallArtworkIds,
    selectWallArtwork,
    clearWallArtworkSelection,
    exhibitionWallConfig,
    setZoomPan,
    setDisplayMode,
    resetZoomPan,
    toggleFullscreen,
    toggleImmersiveMode,
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const wallArtworks = currentScheme?.wallArtworks || [];

  const getArtwork = (artworkId: string) => {
    return artworks.find((a) => a.id === artworkId);
  };

  const { dimensions, wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;
  const { zoomPan, guideLines, dimensions: dimensionsConfig, displayMode } = previewAdaptation;

  const wallBackgroundStyle = useMemo(() => {
    const { baseColor, textureEnabled, textureIntensity, gradientEnabled, gradientColor, gradientAngle } = wallColor;

    let background: string;
    if (gradientEnabled) {
      background = `linear-gradient(${gradientAngle}deg, ${baseColor}, ${gradientColor})`;
    } else {
      background = baseColor;
    }

    const textureOverlay = textureEnabled
      ? `radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,${textureIntensity * 0.3}) 100%)`
      : 'none';

    return {
      background,
      '--texture-overlay': textureOverlay,
    } as React.CSSProperties;
  }, [wallColor]);

  const previewContainerStyle = useMemo(() => {
    const { aspectRatio, customWidth, customHeight, fitMode } = previewAdaptation;
    let ratio: number;

    switch (aspectRatio) {
      case '16:9': ratio = 16 / 9; break;
      case '4:3': ratio = 4 / 3; break;
      case '1:1': ratio = 1; break;
      case '9:16': ratio = 9 / 16; break;
      case 'custom': ratio = (customWidth || 16) / (customHeight || 9); break;
      default: ratio = 16 / 9;
    }

    const containerRatio = containerSize.width > 0 && containerSize.height > 0
      ? containerSize.width / containerSize.height
      : 16 / 9;

    let width: string | number = '100%';
    let height: string | number = '100%';

    switch (fitMode as PreviewFitMode) {
      case 'contain':
        if (ratio > containerRatio) {
          width = '100%';
          height = `${100 / ratio * containerRatio}%`;
        } else {
          width = `${100 * ratio / containerRatio}%`;
          height = '100%';
        }
        break;
      case 'cover':
        if (ratio > containerRatio) {
          width = `${100 * ratio / containerRatio}%`;
          height = '100%';
        } else {
          width = '100%';
          height = `${100 / ratio * containerRatio}%`;
        }
        break;
      case 'fill':
        width = '100%';
        height = '100%';
        break;
      case 'fit_width':
        width = '100%';
        height = `${100 / ratio}%`;
        break;
      case 'fit_height':
        width = `${100 * ratio}%`;
        height = '100%';
        break;
    }

    return {
      aspectRatio: `${ratio}`,
      width,
      height,
    };
  }, [previewAdaptation, containerSize]);

  const ambientLightStyle = useMemo(() => {
    const { colorTemperature, intensity, ambientColor } = ambientLight;
    const { r, g, b } = kelvinToRGB(colorTemperature);

    return {
      '--ambient-light': `rgba(${r}, ${g}, ${b}, ${intensity * 0.15})`,
      '--ambient-glow': `radial-gradient(ellipse at 50% 30%, ${ambientColor}30, transparent 70%)`,
    } as React.CSSProperties;
  }, [ambientLight]);

  const transformStyle = useMemo(() => {
    if (zoomPan.zoomLevel === 1 && zoomPan.panX === 0 && zoomPan.panY === 0) {
      return undefined;
    }
    return {
      transform: `translate(${zoomPan.panX}px, ${zoomPan.panY}px) scale(${zoomPan.zoomLevel})`,
      transformOrigin: 'center center',
    };
  }, [zoomPan.zoomLevel, zoomPan.panX, zoomPan.panY]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!zoomPan.enabled) return;
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -zoomPan.zoomStep : zoomPan.zoomStep;
    const newZoom = Math.max(zoomPan.minZoom, Math.min(zoomPan.maxZoom, zoomPan.zoomLevel + delta));
    setZoomPan({ zoomLevel: newZoom });
  }, [zoomPan, setZoomPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomPan.enabled || zoomPan.zoomLevel <= 1) return;
    if (e.button !== 0) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - zoomPan.panX, y: e.clientY - zoomPan.panY });
  }, [zoomPan.enabled, zoomPan.zoomLevel, zoomPan.panX, zoomPan.panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPanX = e.clientX - dragStart.x;
    const newPanY = e.clientY - dragStart.y;
    setZoomPan({ panX: newPanX, panY: newPanY });
  }, [isDragging, dragStart, setZoomPan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomPan.maxZoom, zoomPan.zoomLevel + zoomPan.zoomStep);
    setZoomPan({ zoomLevel: newZoom });
  }, [zoomPan, setZoomPan]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomPan.minZoom, zoomPan.zoomLevel - zoomPan.zoomStep);
    setZoomPan({ zoomLevel: newZoom });
  }, [zoomPan, setZoomPan]);

  const handleMouseMoveShowToolbar = useCallback(() => {
    setShowToolbar(true);
    if (toolbarTimerRef.current) {
      clearTimeout(toolbarTimerRef.current);
    }
    if (displayMode.immersiveMode) {
      toolbarTimerRef.current = setTimeout(() => {
        setShowToolbar(false);
      }, 2000);
    }
  }, [displayMode.immersiveMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (displayMode.isFullscreen || displayMode.immersiveMode)) {
        setDisplayMode({ isFullscreen: false, immersiveMode: false, showControls: true, showInfoOverlay: true });
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'i' || e.key === 'I') {
        toggleImmersiveMode();
      }
      if (e.key === 'r' || e.key === 'R') {
        resetZoomPan();
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayMode.isFullscreen, displayMode.immersiveMode, setDisplayMode, toggleFullscreen, toggleImmersiveMode, resetZoomPan, handleZoomIn, handleZoomOut]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const renderGuideLines = () => {
    if (!guideLines.enabled) return null;

    const { color, opacity, showCenterLines, showGoldenRatio, showThirds, showCrosshair, showBorderMarkers } = guideLines;
    const lineStyle: React.CSSProperties = {
      backgroundColor: color,
      opacity,
      pointerEvents: 'none',
      zIndex: 100,
    };

    return (
      <div className="absolute inset-0 pointer-events-none">
        {showCenterLines && (
          <>
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={lineStyle} />
            <div className="absolute top-1/2 left-0 right-0 h-px" style={lineStyle} />
          </>
        )}

        {showThirds && (
          <>
            <div className="absolute left-[33.33%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.7 }} />
            <div className="absolute left-[66.67%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.7 }} />
            <div className="absolute top-[33.33%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.7 }} />
            <div className="absolute top-[66.67%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.7 }} />
          </>
        )}

        {showGoldenRatio && (
          <>
            <div className="absolute left-[38.2%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.8 }} />
            <div className="absolute left-[61.8%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.8 }} />
            <div className="absolute top-[38.2%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.8 }} />
            <div className="absolute top-[61.8%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.8 }} />
          </>
        )}

        {showCrosshair && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={lineStyle} />
              <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={lineStyle} />
              <div
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ backgroundColor: color, opacity }}
              />
            </div>
          </div>
        )}

        {showBorderMarkers && (
          <>
            <div className="absolute top-2 left-2 right-2 h-px" style={{ ...lineStyle, opacity: opacity * 0.5 }} />
            <div className="absolute bottom-2 left-2 right-2 h-px" style={{ ...lineStyle, opacity: opacity * 0.5 }} />
            <div className="absolute left-2 top-2 bottom-2 w-px" style={{ ...lineStyle, opacity: opacity * 0.5 }} />
            <div className="absolute right-2 top-2 bottom-2 w-px" style={{ ...lineStyle, opacity: opacity * 0.5 }} />
          </>
        )}
      </div>
    );
  };

  const renderDimensions = () => {
    if (!dimensionsConfig.enabled) return null;

    const { showWallDimensions, showRuler, showScaleReference, unit, precision } = dimensionsConfig;

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 110 }}>
        {showWallDimensions && (
          <div className="absolute top-2 right-2 px-3 py-1.5 bg-gallery-surface/90 rounded text-xs text-white/80 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Ruler className="w-3 h-3 text-gold" />
              <span>墙面: {exhibitionWallConfig.dimensions.width} × {exhibitionWallConfig.dimensions.height} {exhibitionWallConfig.dimensions.unit}</span>
            </div>
          </div>
        )}

        {showRuler && (
          <>
            <div className="absolute top-0 left-0 right-0 h-5 bg-gallery-surface/80 flex items-end overflow-hidden">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="flex-1 relative">
                  <div
                    className="absolute bottom-0 left-0 w-px bg-gold/60"
                    style={{ height: i % 5 === 0 ? '12px' : '6px' }}
                  />
                  {i % 5 === 0 && (
                    <span className="absolute bottom-1 left-1 text-[8px] text-gold/80 transform -translate-x-1/2">
                      {i * 5}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-5 bg-gallery-surface/80 flex flex-col items-end overflow-hidden">
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="flex-1 relative w-full">
                  <div
                    className="absolute right-0 top-0 h-px bg-gold/60"
                    style={{ width: i % 5 === 0 ? '12px' : '6px' }}
                  />
                  {i % 5 === 0 && (
                    <span className="absolute top-1 right-1 text-[8px] text-gold/80 transform -translate-y-1/2 rotate-90 origin-center">
                      {i * 5}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {showScaleReference && (
          <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-gallery-surface/90 rounded text-xs text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-10 h-0.5 bg-gold/60 relative">
                <div className="absolute top-0 left-0 w-px h-2 bg-gold/60 -translate-y-1/2" />
                <div className="absolute top-0 right-0 w-px h-2 bg-gold/60 -translate-y-1/2" />
              </div>
              <span>50 {unit}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentScheme) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        <div className="text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl mb-2">请选择或创建一个展厅方案</p>
          <p className="text-sm text-white/30">
            在右侧面板中管理您的展厅方案
          </p>
        </div>
      </div>
    );
  }

  const containerClasses = [
    'h-full flex flex-col overflow-hidden transition-all duration-300',
    displayMode.isFullscreen ? 'fixed inset-0 z-50 bg-black' : '',
    displayMode.immersiveMode ? 'bg-black' : '',
  ].join(' ');

  return (
    <div
      className={containerClasses}
      onMouseMove={handleMouseMoveShowToolbar}
      onWheel={handleWheel}
    >
      <AnimatePresence>
        {displayMode.showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-6 py-3 bg-gallery-surface/50 border-b border-gallery-border flex items-center justify-between transition-opacity duration-300 ${displayMode.immersiveMode && !showToolbar ? 'opacity-0 pointer-events-none absolute top-0 left-0 right-0 z-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <Eye className="w-5 h-5 text-gallery-bg" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-white">
                  {currentScheme.name}
                </h2>
                <p className="text-xs text-white/50">
                  {currentScheme.description || '展厅墙面预览'} · {wallArtworks.length} 件作品 ·
                  墙面尺寸: {dimensions.width} × {dimensions.height} {WALL_UNIT_LABELS[dimensions.unit]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-white/50 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                点击作品可在右侧编辑
              </div>
              <div className="text-sm text-white/60">
                缩放: {Math.round(zoomPan.zoomLevel * 100)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        className={`flex-1 flex items-center justify-center p-6 overflow-hidden ${isDragging ? 'cursor-grabbing' : zoomPan.zoomLevel > 1 ? 'cursor-grab' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ padding: `${previewAdaptation.padding}px` }}
        >
          <div
            ref={previewContainerRef}
            className="relative overflow-hidden rounded-xl transition-all duration-150"
            style={{
              ...wallBackgroundStyle,
              ...previewContainerStyle,
              ...ambientLightStyle,
              ...transformStyle,
              cursor: isDragging ? 'grabbing' : zoomPan.zoomLevel > 1 ? 'grab' : 'default',
            }}
            onClick={clearWallArtworkSelection}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'var(--ambient-glow)',
              }}
            />

            {wallColor.textureEnabled && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'var(--texture-overlay)',
                }}
              />
            )}

            {previewAdaptation.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(212, 175, 55, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(212, 175, 55, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: `${previewAdaptation.gridSize}px ${previewAdaptation.gridSize}px`,
                }}
              />
            )}

            {previewAdaptation.showSafeArea && (
              <div
                className="absolute border-2 border-dashed border-red-500/50 pointer-events-none rounded-lg"
                style={{
                  top: `${previewAdaptation.safeAreaMargin}%`,
                  left: `${previewAdaptation.safeAreaMargin}%`,
                  right: `${previewAdaptation.safeAreaMargin}%`,
                  bottom: `${previewAdaptation.safeAreaMargin}%`,
                }}
              />
            )}

            {renderGuideLines()}
            {renderDimensions()}

            {displayMode.showInfoOverlay && (
              <>
                <div className="absolute top-4 left-4 flex items-center gap-2 text-white/40 text-[10px] z-10">
                  <div className="w-2 h-2 rounded-full bg-gold/60" />
                  底色: {wallColor.baseColor.toUpperCase()}
                  {wallColor.textureEnabled && <span className="mx-1">·</span>}
                  {wallColor.textureEnabled && '带纹理'}
                  {wallColor.gradientEnabled && <span className="mx-1">·</span>}
                  {wallColor.gradientEnabled && '渐变'}
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/40 text-[10px] z-10">
                  <div className="w-2 h-2 rounded-full bg-warm/60" />
                  环境光: {ambientLight.name} · {ambientLight.colorTemperature}K
                  <span className="mx-1">·</span>
                  适配: {PREVIEW_FIT_MODE_LABELS[previewAdaptation.fitMode]}
                </div>

                <div className="absolute top-4 right-4 text-white/40 text-[10px] z-10">
                  {wallArtworks.length} 件作品 · {previewAdaptation.aspectRatio}
                </div>
              </>
            )}

            {wallArtworks.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/30">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-xl mb-2">墙面为空</p>
                  <p className="text-sm">在右侧"挂墙布局"标签页中添加作品</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {wallArtworks
                  .sort((a, b) => a.position.layer - b.position.layer)
                  .map((wallArtwork) => {
                    const artwork = getArtwork(wallArtwork.artworkId);
                    if (!artwork) return null;

                    const lightingResult = calculateLighting(
                      wallArtwork.lighting,
                      wallArtwork.material
                    );
                    const lightColor = kelvinToHex(
                      wallArtwork.lighting.colorTemperature
                    );
                    const bloomFilter = `blur(${lightingResult.bloomIntensity * 25}px)`;
                    const isSelected = selectedWallArtworkIds.includes(
                      wallArtwork.id
                    );

                    const frameWidth = wallArtwork.material.frameMaterial !== 'none' ? 12 : 0;

                    return (
                      <motion.div
                        key={wallArtwork.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute cursor-pointer transition-all duration-200 ${
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
                        onClick={(e) => {
                          e.stopPropagation();
                          selectWallArtwork(wallArtwork.id, e.shiftKey);
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded transition-all duration-500"
                          style={{
                            transform: 'translateY(15px)',
                            background: `rgba(0, 0, 0, ${lightingResult.shadowOpacity * 0.7})`,
                            filter: 'blur(15px)',
                            zIndex: -1,
                          }}
                        />

                        <div
                          className="relative w-full h-full overflow-hidden rounded transition-all duration-300"
                          style={{
                            border: wallArtwork.material.frameMaterial !== 'none'
                              ? `${frameWidth}px solid ${
                                  wallArtwork.material.frameMaterial === 'gold'
                                    ? '#d4af37'
                                    : wallArtwork.material.frameMaterial === 'silver'
                                    ? '#c0c0c0'
                                    : wallArtwork.material.frameMaterial === 'metal'
                                    ? '#4a4a4a'
                                    : '#8b4513'
                                }`
                              : 'none',
                            boxShadow: isSelected
                              ? `0 0 0 3px rgba(212, 175, 55, 0.5), 0 25px 50px rgba(0,0,0,0.5)`
                              : `0 10px 30px rgba(0,0,0,0.3)`,
                          }}
                        >
                          <div
                            className="absolute inset-0 transition-all duration-500 pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at 50% 25%, ${lightColor}60, transparent 65%)`,
                              mixBlendMode: 'soft-light',
                              opacity: lightingResult.spotlightIntensity,
                              filter: bloomFilter,
                            }}
                          />

                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-full h-full object-cover select-none"
                            style={{
                              filter: `brightness(${0.65 + wallArtwork.lighting.intensity * 0.6}) contrast(${1 + wallArtwork.lighting.intensity * 0.25})`,
                            }}
                            draggable={false}
                          />

                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at 50% 25%, transparent 0%, rgba(0,0,0,${0.6 - wallArtwork.lighting.intensity * 0.4}) 100%)`,
                            }}
                          />

                          <div
                            className="absolute inset-0 pointer-events-none opacity-30"
                            style={{
                              background: `linear-gradient(135deg, ${lightColor}10 0%, transparent 50%, ${lightColor}08 100%)`,
                            }}
                          />
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gallery-surface border border-gold rounded-lg text-xs text-gold font-medium whitespace-nowrap shadow-lg"
                          >
                            {artwork.title}
                          </motion.div>
                        )}

                        {dimensionsConfig.enabled && dimensionsConfig.showArtworkDimensions && artwork && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-gallery-surface/90 rounded text-[10px] text-gold font-medium whitespace-nowrap"
                          >
                            {artwork.width} × {artwork.height} {dimensionsConfig.unit}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            )}
          </div>
        </div>

        <AnimatePresence>
          {(displayMode.showControls || zoomPan.zoomLevel > 1) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showToolbar ? 1 : 0, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-gallery-surface/90 backdrop-blur-md rounded-full border border-gallery-border shadow-xl z-50"
            >
              <button
                onClick={handleZoomOut}
                className="p-2 text-white/70 hover:text-gold hover:bg-gallery-hover rounded-lg transition-all"
                title="缩小 (-)"
                disabled={zoomPan.zoomLevel <= zoomPan.minZoom}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs text-white/60 min-w-[60px] text-center font-mono">
                {Math.round(zoomPan.zoomLevel * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                className="p-2 text-white/70 hover:text-gold hover:bg-gallery-hover rounded-lg transition-all"
                title="放大 (+)"
                disabled={zoomPan.zoomLevel >= zoomPan.maxZoom}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gallery-border mx-1" />

              <button
                onClick={resetZoomPan}
                className="p-2 text-white/70 hover:text-gold hover:bg-gallery-hover rounded-lg transition-all"
                title="重置视图 (R)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gallery-border mx-1" />

              <button
                onClick={() => setZoomPan({ enabled: !zoomPan.enabled })}
                className={`p-2 rounded-lg transition-all ${zoomPan.enabled ? 'text-gold bg-gold/10' : 'text-white/70 hover:text-gold hover:bg-gallery-hover'}`}
                title="缩放拖拽"
              >
                <Move className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gallery-border mx-1" />

              <button
                onClick={toggleImmersiveMode}
                className={`p-2 rounded-lg transition-all ${displayMode.immersiveMode ? 'text-gold bg-gold/10' : 'text-white/70 hover:text-gold hover:bg-gallery-hover'}`}
                title="沉浸模式 (I)"
              >
                {displayMode.immersiveMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-all ${displayMode.isFullscreen ? 'text-gold bg-gold/10' : 'text-white/70 hover:text-gold hover:bg-gallery-hover'}`}
                title="全屏 (F)"
              >
                {displayMode.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {displayMode.immersiveMode && !showToolbar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="text-white/20 text-xs font-mono">
                移动鼠标显示工具栏 · ESC 退出
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {guideLines.enabled && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 px-3 py-2 bg-gallery-surface/90 backdrop-blur-md rounded-lg border border-gallery-border text-xs text-white/60 z-40"
            >
              <div className="flex items-center gap-2 mb-1">
                <Grid3X3 className="w-3 h-3 text-gold" />
                <span className="font-medium text-white/80">参考线</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                {guideLines.showCenterLines && <div>· 中心线</div>}
                {guideLines.showThirds && <div>· 三等分线</div>}
                {guideLines.showGoldenRatio && <div>· 黄金分割线</div>}
                {guideLines.showCrosshair && <div>· 十字准星</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {displayMode.isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 px-3 py-2 bg-gold/20 backdrop-blur-sm rounded-lg border border-gold/50 text-xs text-gold z-40"
            >
              全屏模式 · 按 ESC 或 F 退出
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
