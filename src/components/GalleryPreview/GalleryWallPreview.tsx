import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { calculateLighting, getWallStyle } from '../../utils/lighting';
import { kelvinToHex, kelvinToRGB } from '../../utils/color';
import { Layers, Info, Eye } from 'lucide-react';
import { WALL_UNIT_LABELS } from '../../types';

export const GalleryWallPreview: React.FC = () => {
  const {
    artworks,
    gallerySchemes,
    currentSchemeId,
    selectedWallArtworkIds,
    selectWallArtwork,
    clearWallArtworkSelection,
    exhibitionWallConfig,
  } = useAppStore();

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const wallArtworks = currentScheme?.wallArtworks || [];

  const getArtwork = (artworkId: string) => {
    return artworks.find((a) => a.id === artworkId);
  };

  const { dimensions, wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;

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

  const aspectRatioStyle = useMemo(() => {
    const { aspectRatio, customWidth, customHeight } = previewAdaptation;
    let ratio: number;
    
    switch (aspectRatio) {
      case '16:9': ratio = 16 / 9; break;
      case '4:3': ratio = 4 / 3; break;
      case '1:1': ratio = 1; break;
      case '9:16': ratio = 9 / 16; break;
      case 'custom': ratio = (customWidth || 16) / (customHeight || 9); break;
      default: ratio = 16 / 9;
    }
    
    return {
      aspectRatio: `${ratio}`,
      maxHeight: '100%',
      maxWidth: '100%',
    };
  }, [previewAdaptation]);

  const ambientLightStyle = useMemo(() => {
    const { colorTemperature, intensity, ambientColor } = ambientLight;
    const { r, g, b } = kelvinToRGB(colorTemperature);
    
    return {
      '--ambient-light': `rgba(${r}, ${g}, ${b}, ${intensity * 0.15})`,
      '--ambient-glow': `radial-gradient(ellipse at 50% 30%, ${ambientColor}30, transparent 70%)`,
    } as React.CSSProperties;
  }, [ambientLight]);

  const wallStyle = currentScheme
    ? getWallStyle(currentScheme.wallMaterial, 0.15)
    : getWallStyle('matte', 0.15);

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

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 bg-gallery-surface/50 border-b border-gallery-border flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/50 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            点击作品可在右侧编辑
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ padding: `${previewAdaptation.padding}px` }}
        >
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              ...wallBackgroundStyle,
              ...aspectRatioStyle,
              ...ambientLightStyle,
              width: '100%',
              height: '100%',
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

            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            <div className="absolute top-4 left-4 flex items-center gap-2 text-white/40 text-[10px] z-10">
              <div className="w-2 h-2 rounded-full bg-gold/60" />
              墙面: {currentScheme.wallMaterial === 'matte' && '哑光'}
              {currentScheme.wallMaterial === 'satin' && '丝光'}
              {currentScheme.wallMaterial === 'glossy' && '高光'}
              {currentScheme.wallMaterial === 'concrete' && '水泥'}
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/40 text-[10px] z-10">
              <div className="w-2 h-2 rounded-full bg-warm/60" />
              环境光: {ambientLight.name} · {ambientLight.colorTemperature}K
              <span className="mx-1">·</span>
              灯光策略: {currentScheme.lightingStrategy.mode === 'uniform' && '统一模式'}
              {currentScheme.lightingStrategy.mode === 'individual' && '独立模式'}
              {currentScheme.lightingStrategy.mode === 'zone' && '分区模式'}
            </div>

            <div className="absolute top-4 right-4 text-white/40 text-[10px] z-10">
              {wallArtworks.length} 件作品 · {previewAdaptation.aspectRatio}
            </div>

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
                        className="w-full h-full object-cover"
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
                  </motion.div>
                );
              })}
          </AnimatePresence>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
