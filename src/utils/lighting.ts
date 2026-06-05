import type { LightingConfig, MaterialConfig } from '../types';
import { kelvinToRGB } from './color';

export interface LightingResult {
  ambientColor: string;
  spotlightColor: string;
  spotlightIntensity: number;
  shadowOpacity: number;
  bloomIntensity: number;
}

export function calculateLighting(
  lighting: LightingConfig,
  material: MaterialConfig
): LightingResult {
  const { colorTemperature, intensity, type } = lighting;
  const { reflectivity, roughness } = material;

  const { r, g, b } = kelvinToRGB(colorTemperature);

  const ambientIntensity = type === 'ambient' ? intensity * 0.8 : intensity * 0.3;
  const ambientColor = `rgba(${r}, ${g}, ${b}, ${ambientIntensity})`;

  const spotIntensity = type === 'spotlight' ? intensity : type === 'floodlight' ? intensity * 0.7 : 0;
  const spotlightColor = `rgba(${r}, ${g}, ${b}, ${spotIntensity})`;

  const baseShadow = 0.4;
  const shadowOpacity = Math.max(0.1, baseShadow - reflectivity * 0.3 + roughness * 0.2);

  const bloomIntensity = intensity * (1 - roughness) * 0.6;

  return {
    ambientColor,
    spotlightColor,
    spotlightIntensity: spotIntensity,
    shadowOpacity,
    bloomIntensity,
  };
}

export function calculateSpotlightPosition(
  positionX: number,
  positionY: number,
  angle: number
): { left: string; top: string; spread: number } {
  const left = 50 + positionX * 15;
  const top = 5 + positionY * 8;
  const spread = 30 + angle * 0.8;

  return {
    left: `${left}%`,
    top: `${top}%`,
    spread,
  };
}

export function getFrameStyle(frameMaterial: string): {
  borderColor: string;
  borderWidth: string;
  boxShadow: string;
} {
  const styles: Record<string, { borderColor: string; borderWidth: string; boxShadow: string }> = {
    wood: {
      borderColor: '#5D4037',
      borderWidth: '12px',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.5)',
    },
    metal: {
      borderColor: '#78909C',
      borderWidth: '8px',
      boxShadow: 'inset 0 0 15px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.5)',
    },
    gold: {
      borderColor: 'linear-gradient(135deg, #d4af37, #f4e4bc, #d4af37)',
      borderWidth: '10px',
      boxShadow: 'inset 0 0 20px rgba(212,175,55,0.3), 0 8px 32px rgba(0,0,0,0.5)',
    },
    silver: {
      borderColor: 'linear-gradient(135deg, #C0C0C0, #E8E8E8, #C0C0C0)',
      borderWidth: '8px',
      boxShadow: 'inset 0 0 15px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.5)',
    },
    none: {
      borderColor: 'transparent',
      borderWidth: '0px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
  };

  return styles[frameMaterial] || styles.none;
}

export function getWallStyle(wallMaterial: string, reflectivity: number): {
  background: string;
  specular: string;
} {
  const baseColor = '#1a1a1a';
  const styles: Record<string, string> = {
    matte: baseColor,
    satin: '#1f1f1f',
    glossy: '#252525',
    concrete: '#1e1e1e',
  };

  const specularAmount = reflectivity * 0.3;

  return {
    background: styles[wallMaterial] || baseColor,
    specular: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,${specularAmount * 0.15}), transparent 60%)`,
  };
}
