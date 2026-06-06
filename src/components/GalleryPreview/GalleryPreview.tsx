import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  calculateLighting,
  calculateSpotlightPosition,
  getFrameStyle,
} from '../../utils/lighting';
import { kelvinToHex, kelvinToRGB } from '../../utils/color';
import type { LightingConfig, MaterialConfig, PreviewFitMode } from '../../types';

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
  const { artworks, selectedArtworkId, lighting, material, exhibitionWallConfig } = useAppStore();

  const currentArtworkId = overrideArtworkId || selectedArtworkId;
  const currentLighting = overrideLighting || lighting;
  const currentMaterial = overrideMaterial || material;

  const { wallColor, ambientLight, previewAdaptation } = exhibitionWallConfig;

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

  return (
    <div className="h-full flex flex-col bg-gallery-bg overflow-hidden">
      {showControls && (
        <div className="px-6 py-4 border-b border-gallery-border flex items-center justify-between">
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
          </div>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center" style={{ padding: `${previewAdaptation.padding}px` }}>
          <div
            className="relative transition-all duration-500 overflow-hidden"
            style={{
              ...wallBackgroundStyle,
              ...previewContainerStyle,
              ...ambientLightStyle,
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
                    className="w-full h-full object-cover"
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
      </div>
    </div>
  );
};
