import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  calculateLighting,
  calculateSpotlightPosition,
  getFrameStyle,
  getWallStyle,
} from '../../utils/lighting';
import { kelvinToHex } from '../../utils/color';
import type { LightingConfig, MaterialConfig } from '../../types';

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
  const { artworks, selectedArtworkId, lighting, material } = useAppStore();

  const currentArtworkId = overrideArtworkId || selectedArtworkId;
  const currentLighting = overrideLighting || lighting;
  const currentMaterial = overrideMaterial || material;

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

  const wallStyle = useMemo(
    () => getWallStyle(currentMaterial.wallMaterial, currentMaterial.reflectivity),
    [currentMaterial.wallMaterial, currentMaterial.reflectivity]
  );

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
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{ backgroundColor: wallStyle.background }}
        />

        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: wallStyle.specular,
            opacity: currentMaterial.reflectivity,
          }}
        />

        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse at ${spotlightPos.left} ${spotlightPos.top}, ${lightingResult.spotlightColor}, transparent ${spotlightPos.spread}%)`,
            filter: currentLighting.type === 'spotlight' ? bloomFilter : 'none',
          }}
        />

        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${lightingResult.ambientColor}, transparent 70%)`,
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
  );
};
