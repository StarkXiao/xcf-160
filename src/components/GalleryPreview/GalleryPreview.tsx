import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  calculateLighting,
  calculateSpotlightPosition,
  getFrameStyle,
} from '../../utils/lighting';
import { kelvinToHex, kelvinToRGB } from '../../utils/color';
import type { LightingConfig, MaterialConfig, PreviewFitMode } from '../../types';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
  Ruler,
  Grid3X3,
  RotateCcw,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';

interface GalleryPreviewProps {
  overrideLighting?: LightingConfig;
  overrideMaterial?: MaterialConfig;
  overrideArtworkId?: string;
  showControls?: boolean;
}

export const GalleryPreview: React.FC<GalleryPreviewProps> = ({
  overrideLighting,
  overrideMaterial,
  overrideArtworkId,
  showControls = true,
}) => {
  const {
    artworks,
    selectedArtworkId,
    lighting,
    material,
    exhibitionWallConfig,
    setZoomPan,
    setDisplayMode,
    resetZoomPan,
    toggleFullscreen,
    toggleImmersiveMode,
  } = useAppStore();

  const currentArtworkId = overrideArtworkId || selectedArtworkId;
  const currentLighting = overrideLighting || lighting;
  const currentMaterial = overrideMaterial || material;

  const { wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;
  const { zoomPan, guideLines, dimensions, displayMode } = previewAdaptation;

  const containerRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(true);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedArtwork = useMemo(
    () => artworks.find((a) => a.id === currentArtworkId),
    [artworks, currentArtworkId]
  );

  const lightingResult = useMemo(
    () => calculateLighting(currentLighting, currentMaterial),
    [currentLighting, currentMaterial]
  );

  const spotlightPos = useMemo(
    () =>
      calculateSpotlightPosition(
        currentLighting.positionX,
        currentLighting.positionY,
        currentLighting.angle
      ),
    [currentLighting.positionX, currentLighting.positionY, currentLighting.angle]
  );

  const frameStyle = useMemo(
    () => getFrameStyle(currentMaterial.frameMaterial),
    [currentMaterial.frameMaterial]
  );

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

  const ambientLightStyle = useMemo(() => {
    const { colorTemperature, intensity, ambientColor } = ambientLight;
    const { r, g, b } = kelvinToRGB(colorTemperature);

    return {
      '--ambient-light': `rgba(${r}, ${g}, ${b}, ${intensity * 0.15})`,
      '--ambient-glow': `radial-gradient(ellipse at 50% 30%, ${ambientColor}30, transparent 70%)`,
    } as React.CSSProperties;
  }, [ambientLight]);

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

    let width: string | number = '100%';
    let height: string | number = '100%';

    switch (fitMode as PreviewFitMode) {
      case 'contain':
      case 'cover':
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
  }, [previewAdaptation]);

  const lightColor = kelvinToHex(currentLighting.colorTemperature);
  const bloomFilter = `blur(${lightingResult.bloomIntensity * 40}px)`;

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
            <div className="absolute left-[38.2%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.8, borderStyle: 'dashed' }} />
            <div className="absolute left-[61.8%] top-0 bottom-0 w-px" style={{ ...lineStyle, opacity: opacity * 0.8, borderStyle: 'dashed' }} />
            <div className="absolute top-[38.2%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.8, borderStyle: 'dashed' }} />
            <div className="absolute top-[61.8%] left-0 right-0 h-px" style={{ ...lineStyle, opacity: opacity * 0.8, borderStyle: 'dashed' }} />
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
    if (!dimensions.enabled) return null;
    if (!selectedArtwork) return null;

    const { showArtworkDimensions, showWallDimensions, showRuler, showScaleReference, unit, precision } = dimensions;

    const formatDimension = (value: number) => {
      return value.toFixed(precision);
    };

    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 110 }}>
        {showArtworkDimensions && artworkRef.current && (
          <>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 px-3 py-1 bg-gallery-surface/90 rounded text-xs text-gold font-medium whitespace-nowrap"
              style={{ transform: `translate(-50%, 0) translateY(10px) translateY(${zoomPan.zoomLevel > 1 ? -6 * zoomPan.zoomLevel : 0}px)` }}
            >
              {formatDimension(selectedArtwork.width)} × {formatDimension(selectedArtwork.height)} {unit}
            </div>
          </>
        )}

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

  if (!selectedArtwork) {
    return (
      <div className="h-full flex items-center justify-center bg-gallery-bg">
        <div className="text-center text-white/40">
          <p className="text-lg mb-2">请选择一件艺术品</p>
          <p className="text-sm">从左侧列表中选择或添加作品</p>
        </div>
      </div>
    );
  }

  const aspectRatio = selectedArtwork.width / selectedArtwork.height;

  const containerClasses = [
    'h-full flex flex-col bg-gallery-bg overflow-hidden transition-all duration-300',
    displayMode.isFullscreen ? 'fixed inset-0 z-50' : '',
    displayMode.immersiveMode ? 'bg-black' : '',
  ].join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onMouseMove={handleMouseMoveShowToolbar}
      onWheel={handleWheel}
    >
      <AnimatePresence>
        {(showControls && displayMode.showControls) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`px-6 py-4 border-b border-gallery-border flex items-center justify-between transition-opacity duration-300 ${displayMode.immersiveMode && !showToolbar ? 'opacity-0 pointer-events-none absolute top-0 left-0 right-0 z-50' : ''}`}
          >
            <div>
              <h2 className="text-xl font-display font-semibold text-white">
                {selectedArtwork.title}
              </h2>
              <p className="text-sm text-white/60">
                {selectedArtwork.artist} · {selectedArtwork.year}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: lightColor }}
                />
                <span>{currentLighting.colorTemperature}K</span>
              </div>
              <div className="text-sm text-white/60">
                亮度: {Math.round(currentLighting.intensity * 100)}%
              </div>
              <div className="text-sm text-white/60">
                缩放: {Math.round(zoomPan.zoomLevel * 100)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex-1 relative overflow-hidden ${isDragging ? 'cursor-grabbing' : zoomPan.zoomLevel > 1 ? 'cursor-grab' : 'cursor-default'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: `${previewAdaptation.padding}px` }}>
          <div
            ref={artworkRef}
            className="relative transition-all duration-150 overflow-hidden"
            style={{
              ...wallBackgroundStyle,
              ...previewContainerStyle,
              ...ambientLightStyle,
              ...transformStyle,
              cursor: isDragging ? 'grabbing' : zoomPan.zoomLevel > 1 ? 'grab' : 'default',
            }}
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
                className="absolute border-2 border-dashed border-red-500/50 pointer-events-none"
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

            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: `radial-gradient(ellipse at ${spotlightPos.left} ${spotlightPos.top}, ${lightingResult.spotlightColor}, transparent ${spotlightPos.spread}%)`,
                filter: currentLighting.type === 'spotlight' ? bloomFilter : 'none',
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative"
                style={{
                  width: 'min(60%, 600px)',
                  aspectRatio: aspectRatio,
                }}
              >
                <div
                  className="absolute inset-0 rounded transition-all duration-500"
                  style={{
                    transform: 'translateY(20px)',
                    background: `rgba(0, 0, 0, ${lightingResult.shadowOpacity})`,
                    filter: 'blur(20px)',
                    zIndex: 0,
                  }}
                />

                <div
                  className="relative w-full h-full overflow-hidden transition-all duration-500"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: currentMaterial.frameMaterial !== 'none' ? frameStyle.borderWidth : '0',
                    borderImage:
                      currentMaterial.frameMaterial === 'gold' ||
                      currentMaterial.frameMaterial === 'silver'
                        ? `${frameStyle.borderColor} 1`
                        : 'none',
                    borderColor:
                      currentMaterial.frameMaterial !== 'gold' &&
                      currentMaterial.frameMaterial !== 'silver'
                        ? frameStyle.borderColor
                        : 'transparent',
                    boxShadow: frameStyle.boxShadow,
                    zIndex: 1,
                  }}
                >
                  <div
                    className="absolute inset-0 transition-all duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${lightingResult.spotlightColor} 0%, transparent 50%)`,
                      mixBlendMode: 'soft-light',
                      opacity: lightingResult.spotlightIntensity * 0.5,
                    }}
                  />

                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    style={{
                      filter: `brightness(${0.7 + currentLighting.intensity * 0.5}) contrast(${1 + currentLighting.intensity * 0.2})`,
                    }}
                  />

                  <div
                    className="absolute inset-0 transition-all duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at ${spotlightPos.left} ${spotlightPos.top}, transparent 0%, rgba(0,0,0,${0.6 - currentLighting.intensity * 0.4}) 100%)`,
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
              }}
            />
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

              <button
                onClick={() => setDisplayMode({ showInfoOverlay: !displayMode.showInfoOverlay })}
                className={`p-2 rounded-lg transition-all ${displayMode.showInfoOverlay ? 'text-gold bg-gold/10' : 'text-white/70 hover:text-gold hover:bg-gallery-hover'}`}
                title="信息覆盖"
              >
                <Info className="w-4 h-4" />
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
