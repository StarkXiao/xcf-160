import type { LightingConfig, MaterialConfig, LightType, LightingParameterConstraint, LightingRecommendation, LightingValidationResult, LightingParameterWarning } from '../types';
import { LIGHTING_PARAMETER_CONSTRAINTS, LIGHTING_RECOMMENDATIONS } from '../types';
import { kelvinToRGB } from './color';

export interface LightingResult {
  ambientColor: string;
  spotlightColor: string;
  spotlightIntensity: number;
  shadowOpacity: number;
  bloomIntensity: number;
}

export interface ParameterValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  constrainedValue?: number;
}

export function getLightingConstraint(type: LightType): LightingParameterConstraint {
  return LIGHTING_PARAMETER_CONSTRAINTS[type];
}

export function validateLightingParameter(
  type: LightType,
  param: keyof Pick<LightingConfig, 'intensity' | 'angle' | 'colorTemperature'>,
  value: number
): ParameterValidationResult {
  const constraint = LIGHTING_PARAMETER_CONSTRAINTS[type];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  let range: { min: number; max: number };
  let paramName: string;

  switch (param) {
    case 'intensity':
      range = constraint.intensityRange;
      paramName = '亮度';
      break;
    case 'angle':
      range = constraint.angleRange;
      paramName = '光束角度';
      break;
    case 'colorTemperature':
      range = constraint.temperatureRange;
      paramName = '色温';
      break;
    default:
      return { isValid: true, warnings: [], suggestions: [] };
  }

  let constrainedValue = value;
  if (value < range.min) {
    warnings.push(`${paramName}低于建议范围 ${range.min} - ${range.max}`);
    constrainedValue = range.min;
  } else if (value > range.max) {
    warnings.push(`${paramName}高于建议范围 ${range.min} - ${range.max}`);
    constrainedValue = range.max;
  }

  if (constraint.linkedParameters.length > 0) {
    for (const link of constraint.linkedParameters) {
      if (link.source === param) {
        const suggestedValue = link.formula(value);
        suggestions.push(`${link.description}，建议${link.target === 'intensity' ? '亮度' : link.target === 'angle' ? '光束角度' : '色温'}: ${Math.round(suggestedValue * (link.target === 'intensity' ? 100 : 1))}${link.target === 'intensity' ? '%' : link.target === 'angle' ? '°' : 'K'}`);
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
    constrainedValue,
  };
}

export function getLinkedParameterSuggestion(
  type: LightType,
  sourceParam: keyof LightingConfig,
  sourceValue: number
): { target: keyof LightingConfig; suggestedValue: number; description: string } | null {
  const constraint = LIGHTING_PARAMETER_CONSTRAINTS[type];
  const link = constraint.linkedParameters.find((l) => l.source === sourceParam);
  if (!link) return null;
  return {
    target: link.target,
    suggestedValue: link.formula(sourceValue),
    description: link.description,
  };
}

export function getRecommendationsForArtwork(
  artworkMedium?: string,
  currentLighting?: LightingConfig
): LightingRecommendation[] {
  let recommendations = [...LIGHTING_RECOMMENDATIONS];

  if (artworkMedium) {
    recommendations = recommendations.map((rec) => {
      let confidence = rec.confidence;
      if (rec.artworkMedium && rec.artworkMedium === artworkMedium) {
        confidence = Math.min(1, confidence + 0.15);
      }
      return { ...rec, confidence };
    });
  }

  if (currentLighting) {
    recommendations = recommendations.map((rec) => {
      let similarity = 0;
      let totalParams = 0;

      if (rec.lighting.type === currentLighting.type) similarity += 0.3;
      totalParams++;

      if (rec.lighting.colorTemperature !== undefined) {
        const tempDiff = Math.abs(rec.lighting.colorTemperature - currentLighting.colorTemperature);
        similarity += Math.max(0, 0.25 - tempDiff / 20000);
        totalParams++;
      }

      if (rec.lighting.intensity !== undefined) {
        const intensityDiff = Math.abs(rec.lighting.intensity - currentLighting.intensity);
        similarity += Math.max(0, 0.25 - intensityDiff);
        totalParams++;
      }

      if (rec.lighting.angle !== undefined) {
        const angleDiff = Math.abs(rec.lighting.angle - currentLighting.angle);
        similarity += Math.max(0, 0.2 - angleDiff / 100);
        totalParams++;
      }

      return { ...rec, confidence: Math.min(1, rec.confidence * 0.7 + similarity / totalParams * 0.3) };
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export function getParameterLimits(type: LightType): {
  intensity: { min: number; max: number };
  angle: { min: number; max: number };
  colorTemperature: { min: number; max: number };
} {
  const constraint = LIGHTING_PARAMETER_CONSTRAINTS[type];
  return {
    intensity: constraint.intensityRange,
    angle: constraint.angleRange,
    colorTemperature: constraint.temperatureRange,
  };
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

export function calculateLinkedParameterValue(
  type: LightType,
  sourceParam: keyof LightingConfig,
  sourceValue: number
): number | null {
  const suggestion = getLinkedParameterSuggestion(type, sourceParam, sourceValue);
  return suggestion ? suggestion.suggestedValue : null;
}

export function clampLightingParameters(
  lighting: Partial<LightingConfig>,
  currentType: LightType
): Partial<LightingConfig> {
  const clamped: Partial<LightingConfig> = { ...lighting };
  const constraint = LIGHTING_PARAMETER_CONSTRAINTS[lighting.type || currentType];

  if (constraint) {
    if (clamped.intensity !== undefined) {
      clamped.intensity = Math.max(
        constraint.intensityRange.min,
        Math.min(constraint.intensityRange.max, clamped.intensity)
      );
    }
    if (clamped.angle !== undefined) {
      clamped.angle = Math.max(
        constraint.angleRange.min,
        Math.min(constraint.angleRange.max, clamped.angle)
      );
    }
    if (clamped.colorTemperature !== undefined) {
      clamped.colorTemperature = Math.max(
        constraint.temperatureRange.min,
        Math.min(constraint.temperatureRange.max, clamped.colorTemperature)
      );
    }
  }

  return clamped;
}

export function getLightingRecommendations(
  artworkMedium?: string,
  currentLighting?: LightingConfig
): LightingRecommendation[] {
  const recommendations = LIGHTING_RECOMMENDATIONS.map((rec) => {
    let confidence = rec.confidence;

    if (artworkMedium && rec.artworkMedium && rec.artworkMedium === artworkMedium) {
      confidence = Math.min(1, confidence + 0.15);
    }

    if (currentLighting) {
      const diffCount = Object.keys(rec.lighting).filter(
        (key) => rec.lighting[key as keyof LightingConfig] !== currentLighting[key as keyof LightingConfig]
      ).length;
      const similarityBonus = 1 - diffCount / 7;
      confidence = confidence * 0.8 + similarityBonus * 0.2;
    }

    return { ...rec, confidence };
  });

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export function formatLightingDescription(lighting: LightingConfig): string {
  const parts = [];
  parts.push(`光源类型: ${lighting.type === 'spotlight' ? '聚光' : lighting.type === 'floodlight' ? '泛光' : '环境光'}`);
  parts.push(`色温: ${lighting.colorTemperature}K`);
  parts.push(`亮度: ${Math.round(lighting.intensity * 100)}%`);
  parts.push(`光束角度: ${lighting.angle}°`);
  return parts.join(' | ');
}
