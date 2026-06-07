import type { LightingConfig, MaterialConfig, LightType, LightingParameterConstraint, LightingRecommendation, LightingValidationResult, LightingParameterWarning, MaterialDescription, MaterialEffectPreview, MaterialParameterWarning, MaterialValidationResult, MaterialParameterConstraint, MaterialRecommendation, MaterialComboFavorite } from '../types';
import { LIGHTING_PARAMETER_CONSTRAINTS, LIGHTING_RECOMMENDATIONS, FRAME_MATERIAL_DESCRIPTIONS, WALL_MATERIAL_DESCRIPTIONS, MATERIAL_PARAMETER_CONSTRAINTS, WALL_MATERIAL_PARAMETER_CONSTRAINTS, MATERIAL_RECOMMENDATIONS, MATERIAL_COMBO_FAVORITES_KEY } from '../types';
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

export function getFrameMaterialDescription(material: string): MaterialDescription | undefined {
  return FRAME_MATERIAL_DESCRIPTIONS[material as keyof typeof FRAME_MATERIAL_DESCRIPTIONS];
}

export function getWallMaterialDescription(material: string): MaterialDescription | undefined {
  return WALL_MATERIAL_DESCRIPTIONS[material as keyof typeof WALL_MATERIAL_DESCRIPTIONS];
}

export function getMaterialDescription(frameMaterial: string, wallMaterial: string): {
  frame: MaterialDescription | undefined;
  wall: MaterialDescription | undefined;
} {
  return {
    frame: getFrameMaterialDescription(frameMaterial),
    wall: getWallMaterialDescription(wallMaterial),
  };
}

export function getMaterialConstraint(frameMaterial: string): MaterialParameterConstraint {
  return MATERIAL_PARAMETER_CONSTRAINTS[frameMaterial as keyof typeof MATERIAL_PARAMETER_CONSTRAINTS];
}

export function getWallMaterialConstraint(wallMaterial: string): MaterialParameterConstraint {
  return WALL_MATERIAL_PARAMETER_CONSTRAINTS[wallMaterial as keyof typeof WALL_MATERIAL_PARAMETER_CONSTRAINTS];
}

export function validateMaterialParameter(
  material: MaterialConfig,
  param: keyof Pick<MaterialConfig, 'reflectivity' | 'roughness'>,
  value: number
): { isValid: boolean; warnings: MaterialParameterWarning[]; suggestions: string[]; constrainedValue?: number } {
  const frameConstraint = MATERIAL_PARAMETER_CONSTRAINTS[material.frameMaterial];
  const wallConstraint = WALL_MATERIAL_PARAMETER_CONSTRAINTS[material.wallMaterial];
  const warnings: MaterialParameterWarning[] = [];
  const suggestions: string[] = [];

  const frameRange = param === 'reflectivity' ? frameConstraint.reflectivityRange : frameConstraint.roughnessRange;
  const wallRange = param === 'reflectivity' ? wallConstraint.reflectivityRange : wallConstraint.roughnessRange;

  const combinedRange = {
    min: Math.max(frameRange.min, wallRange.min),
    max: Math.min(frameRange.max, wallRange.max),
  };

  const paramName = param === 'reflectivity' ? '反光度' : '粗糙度';

  let constrainedValue = value;
  if (value < combinedRange.min) {
    warnings.push({
      param,
      message: `${paramName}低于建议范围 ${combinedRange.min * 100}% - ${combinedRange.max * 100}%`,
      severity: 'warning',
      suggestion: { [param]: combinedRange.min },
    });
    constrainedValue = combinedRange.min;
  } else if (value > combinedRange.max) {
    warnings.push({
      param,
      message: `${paramName}高于建议范围 ${combinedRange.min * 100}% - ${combinedRange.max * 100}%`,
      severity: 'warning',
      suggestion: { [param]: combinedRange.max },
    });
    constrainedValue = combinedRange.max;
  }

  const frameRecommended = param === 'reflectivity' ? frameConstraint.recommendedReflectivity : frameConstraint.recommendedRoughness;
  const wallRecommended = param === 'reflectivity' ? wallConstraint.recommendedReflectivity : wallConstraint.recommendedRoughness;

  const combinedRecommended = {
    min: Math.max(frameRecommended.min, wallRecommended.min),
    max: Math.min(frameRecommended.max, wallRecommended.max),
  };

  if (value < combinedRecommended.min || value > combinedRecommended.max) {
    warnings.push({
      param,
      message: `${paramName}不在最佳推荐范围 ${combinedRecommended.min * 100}% - ${combinedRecommended.max * 100}%，可能影响展示效果`,
      severity: 'info',
    });
  }

  const allConstraints = [...frameConstraint.linkedParameters, ...wallConstraint.linkedParameters];
  for (const link of allConstraints) {
    if (link.source === param) {
      const suggestedValue = link.formula(value);
      suggestions.push(`${link.description}，建议${link.target === 'reflectivity' ? '反光度' : '粗糙度'}: ${Math.round(suggestedValue * 100)}%`);
    }
  }

  return {
    isValid: warnings.filter((w) => w.severity === 'error').length === 0,
    warnings,
    suggestions,
    constrainedValue,
  };
}

export function validateMaterialConfig(material: Partial<MaterialConfig>, currentMaterial?: MaterialConfig): MaterialValidationResult {
  const warnings: MaterialParameterWarning[] = [];
  const currentFrame = material.frameMaterial || currentMaterial?.frameMaterial || 'gold';
  const currentWall = material.wallMaterial || currentMaterial?.wallMaterial || 'matte';

  const frameConstraint = MATERIAL_PARAMETER_CONSTRAINTS[currentFrame as keyof typeof MATERIAL_PARAMETER_CONSTRAINTS];
  const wallConstraint = WALL_MATERIAL_PARAMETER_CONSTRAINTS[currentWall as keyof typeof WALL_MATERIAL_PARAMETER_CONSTRAINTS];

  let autoAdjusted: Partial<MaterialConfig> | undefined;

  if (material.reflectivity !== undefined) {
    const minReflectivity = Math.max(frameConstraint.reflectivityRange.min, wallConstraint.reflectivityRange.min);
    const maxReflectivity = Math.min(frameConstraint.reflectivityRange.max, wallConstraint.reflectivityRange.max);

    if (material.reflectivity < minReflectivity) {
      warnings.push({
        param: 'reflectivity',
        message: `反光度低于建议范围 ${minReflectivity * 100}% - ${maxReflectivity * 100}%`,
        severity: 'warning',
        suggestion: { reflectivity: minReflectivity },
        relatedArtworkMedium: ['油画', '水彩'],
      });
      autoAdjusted = { ...autoAdjusted, reflectivity: minReflectivity };
    } else if (material.reflectivity > maxReflectivity) {
      warnings.push({
        param: 'reflectivity',
        message: `反光度高于建议范围 ${minReflectivity * 100}% - ${maxReflectivity * 100}%，可能产生眩光`,
        severity: 'warning',
        suggestion: { reflectivity: maxReflectivity },
        relatedArtworkMedium: ['摄影', '纸面作品'],
      });
      autoAdjusted = { ...autoAdjusted, reflectivity: maxReflectivity };
    }

    const recommendedMin = Math.max(frameConstraint.recommendedReflectivity.min, wallConstraint.recommendedReflectivity.min);
    const recommendedMax = Math.min(frameConstraint.recommendedReflectivity.max, wallConstraint.recommendedReflectivity.max);
    if (material.reflectivity < recommendedMin || material.reflectivity > recommendedMax) {
      warnings.push({
        param: 'reflectivity',
        message: `反光度不在最佳推荐范围 ${recommendedMin * 100}% - ${recommendedMax * 100}%`,
        severity: 'info',
      });
    }
  }

  if (material.roughness !== undefined) {
    const minRoughness = Math.max(frameConstraint.roughnessRange.min, wallConstraint.roughnessRange.min);
    const maxRoughness = Math.min(frameConstraint.roughnessRange.max, wallConstraint.roughnessRange.max);

    if (material.roughness < minRoughness) {
      warnings.push({
        param: 'roughness',
        message: `粗糙度低于建议范围 ${minRoughness * 100}% - ${maxRoughness * 100}%`,
        severity: 'warning',
        suggestion: { roughness: minRoughness },
      });
      autoAdjusted = { ...autoAdjusted, roughness: minRoughness };
    } else if (material.roughness > maxRoughness) {
      warnings.push({
        param: 'roughness',
        message: `粗糙度高于建议范围 ${minRoughness * 100}% - ${maxRoughness * 100}%`,
        severity: 'warning',
        suggestion: { roughness: maxRoughness },
      });
      autoAdjusted = { ...autoAdjusted, roughness: maxRoughness };
    }

    const recommendedMin = Math.max(frameConstraint.recommendedRoughness.min, wallConstraint.recommendedRoughness.min);
    const recommendedMax = Math.min(frameConstraint.recommendedRoughness.max, wallConstraint.recommendedRoughness.max);
    if (material.roughness < recommendedMin || material.roughness > recommendedMax) {
      warnings.push({
        param: 'roughness',
        message: `粗糙度不在最佳推荐范围 ${recommendedMin * 100}% - ${recommendedMax * 100}%`,
        severity: 'info',
      });
    }
  }

  if (material.frameMaterial && material.wallMaterial) {
    const frameDesc = getFrameMaterialDescription(material.frameMaterial);
    const wallDesc = getWallMaterialDescription(material.wallMaterial);

    if (frameDesc && wallDesc) {
      const frameWarm = frameDesc.costLevel === 'premium' && material.frameMaterial === 'gold';
      const wallCool = material.wallMaterial === 'glossy';

      if (frameWarm && wallCool) {
        warnings.push({
          param: 'frameMaterial',
          message: '金色画框与高光墙面搭配可能产生视觉冲突，建议使用哑光墙面',
          severity: 'info',
          suggestion: { wallMaterial: 'matte' },
        });
      }

      if (material.frameMaterial === 'none' && material.wallMaterial === 'matte') {
        warnings.push({
          param: 'frameMaterial',
          message: '无框展示配合哑光墙面是极简风格的经典组合，效果极佳',
          severity: 'info',
        });
      }
    }
  }

  return {
    isValid: warnings.filter((w) => w.severity === 'error').length === 0,
    warnings,
    autoAdjusted,
  };
}

export function calculateMaterialEffectPreview(
  material: MaterialConfig,
  lighting?: LightingConfig
): MaterialEffectPreview {
  const { reflectivity, roughness, frameMaterial, wallMaterial } = material;

  const shadowIntensity = Math.max(0.1, 0.5 - reflectivity * 0.4 + roughness * 0.3);
  const reflectionIntensity = reflectivity * (1 - roughness * 0.7);
  const glowIntensity = reflectivity * (1 - roughness) * 0.5;
  const contrastLevel = 0.5 + (1 - roughness) * 0.3 + reflectivity * 0.2;
  const colorSaturation = 0.8 + (1 - roughness) * 0.2 - reflectivity * 0.1;

  let visualTemperature: 'cool' | 'neutral' | 'warm' = 'neutral';
  if (frameMaterial === 'gold' || frameMaterial === 'wood') {
    visualTemperature = 'warm';
  } else if (frameMaterial === 'silver' || frameMaterial === 'metal') {
    visualTemperature = 'cool';
  }

  if (wallMaterial === 'glossy') {
    visualTemperature = visualTemperature === 'warm' ? 'neutral' : 'cool';
  } else if (wallMaterial === 'concrete') {
    visualTemperature = 'cool';
  }

  let atmosphere = '专业典雅';
  if (frameMaterial === 'gold' && wallMaterial === 'matte') {
    atmosphere = '经典奢华';
  } else if (frameMaterial === 'none' && wallMaterial === 'glossy') {
    atmosphere = '现代极简';
  } else if (frameMaterial === 'metal' && wallMaterial === 'concrete') {
    atmosphere = '工业粗犷';
  } else if (frameMaterial === 'silver' && wallMaterial === 'satin') {
    atmosphere = '时尚精致';
  } else if (frameMaterial === 'wood' && wallMaterial === 'matte') {
    atmosphere = '自然温馨';
  }

  const recommendedLighting: Partial<LightingConfig> = {};
  if (reflectivity > 0.6) {
    recommendedLighting.intensity = Math.max(0.3, (lighting?.intensity || 0.8) * 0.8);
    recommendedLighting.angle = Math.max(30, (lighting?.angle || 45) + 10);
  }
  if (roughness > 0.8) {
    recommendedLighting.intensity = Math.min(1, (lighting?.intensity || 0.8) * 1.1);
  }
  if (visualTemperature === 'warm') {
    recommendedLighting.colorTemperature = Math.max(2700, Math.min(4000, lighting?.colorTemperature || 3500));
  } else if (visualTemperature === 'cool') {
    recommendedLighting.colorTemperature = Math.max(4500, Math.min(6500, lighting?.colorTemperature || 3500));
  }

  return {
    shadowIntensity,
    reflectionIntensity,
    glowIntensity,
    contrastLevel,
    colorSaturation,
    visualTemperature,
    atmosphere,
    recommendedLighting,
  };
}

export function getMaterialRecommendations(
  artworkMedium?: string,
  currentMaterial?: MaterialConfig
): MaterialRecommendation[] {
  let recommendations = [...MATERIAL_RECOMMENDATIONS];

  if (artworkMedium) {
    recommendations = recommendations.map((rec) => {
      let confidence = rec.confidence;
      if (rec.artworkMedium && rec.artworkMedium === artworkMedium) {
        confidence = Math.min(1, confidence + 0.15);
      }
      return { ...rec, confidence };
    });
  }

  if (currentMaterial) {
    recommendations = recommendations.map((rec) => {
      let similarity = 0;
      let totalParams = 0;

      if (rec.material.frameMaterial === currentMaterial.frameMaterial) similarity += 0.3;
      totalParams++;

      if (rec.material.wallMaterial === currentMaterial.wallMaterial) similarity += 0.25;
      totalParams++;

      if (rec.material.reflectivity !== undefined) {
        const reflectivityDiff = Math.abs(rec.material.reflectivity - currentMaterial.reflectivity);
        similarity += Math.max(0, 0.25 - reflectivityDiff);
        totalParams++;
      }

      if (rec.material.roughness !== undefined) {
        const roughnessDiff = Math.abs(rec.material.roughness - currentMaterial.roughness);
        similarity += Math.max(0, 0.2 - roughnessDiff);
        totalParams++;
      }

      return { ...rec, confidence: Math.min(1, rec.confidence * 0.7 + similarity / totalParams * 0.3) };
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export function formatMaterialDescription(material: MaterialConfig): string {
  const parts = [];
  const frameLabels: Record<string, string> = {
    wood: '木质',
    metal: '金属',
    gold: '金色',
    silver: '银色',
    none: '无框',
  };
  const wallLabels: Record<string, string> = {
    matte: '哑光',
    satin: '丝光',
    glossy: '高光',
    concrete: '水泥',
  };
  parts.push(`画框: ${frameLabels[material.frameMaterial] || material.frameMaterial}`);
  parts.push(`墙面: ${wallLabels[material.wallMaterial] || material.wallMaterial}`);
  parts.push(`反光度: ${Math.round(material.reflectivity * 100)}%`);
  parts.push(`粗糙度: ${Math.round(material.roughness * 100)}%`);
  return parts.join(' | ');
}

export function getMaterialComboFavorites(): MaterialComboFavorite[] {
  try {
    const stored = localStorage.getItem(MATERIAL_COMBO_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMaterialComboFavorites(favorites: MaterialComboFavorite[]): void {
  localStorage.setItem(MATERIAL_COMBO_FAVORITES_KEY, JSON.stringify(favorites));
}

export function addMaterialComboToFavorites(comboId: string, name: string, note?: string): MaterialComboFavorite {
  const favorites = getMaterialComboFavorites();
  const existing = favorites.find((f) => f.comboId === comboId);
  if (existing) return existing;

  const newFavorite: MaterialComboFavorite = {
    id: `fav-${Date.now()}`,
    comboId,
    name,
    note,
    createdAt: Date.now(),
    useCount: 0,
  };

  favorites.push(newFavorite);
  saveMaterialComboFavorites(favorites);
  return newFavorite;
}

export function removeMaterialComboFromFavorites(favoriteId: string): void {
  const favorites = getMaterialComboFavorites();
  const filtered = favorites.filter((f) => f.id !== favoriteId);
  saveMaterialComboFavorites(filtered);
}

export function isMaterialComboFavorited(comboId: string): boolean {
  const favorites = getMaterialComboFavorites();
  return favorites.some((f) => f.comboId === comboId);
}

export function incrementMaterialComboFavoriteUse(comboId: string): void {
  const favorites = getMaterialComboFavorites();
  const updated = favorites.map((f) =>
    f.comboId === comboId
      ? { ...f, useCount: f.useCount + 1, lastUsedAt: Date.now() }
      : f
  );
  saveMaterialComboFavorites(updated);
}

export function getMaterialParameterLimits(frameMaterial: string, wallMaterial: string): {
  reflectivity: { min: number; max: number; recommendedMin: number; recommendedMax: number };
  roughness: { min: number; max: number; recommendedMin: number; recommendedMax: number };
} {
  const frameConstraint = MATERIAL_PARAMETER_CONSTRAINTS[frameMaterial as keyof typeof MATERIAL_PARAMETER_CONSTRAINTS];
  const wallConstraint = WALL_MATERIAL_PARAMETER_CONSTRAINTS[wallMaterial as keyof typeof WALL_MATERIAL_PARAMETER_CONSTRAINTS];

  return {
    reflectivity: {
      min: Math.max(frameConstraint.reflectivityRange.min, wallConstraint.reflectivityRange.min),
      max: Math.min(frameConstraint.reflectivityRange.max, wallConstraint.reflectivityRange.max),
      recommendedMin: Math.max(frameConstraint.recommendedReflectivity.min, wallConstraint.recommendedReflectivity.min),
      recommendedMax: Math.min(frameConstraint.recommendedReflectivity.max, wallConstraint.recommendedReflectivity.max),
    },
    roughness: {
      min: Math.max(frameConstraint.roughnessRange.min, wallConstraint.roughnessRange.min),
      max: Math.min(frameConstraint.roughnessRange.max, wallConstraint.roughnessRange.max),
      recommendedMin: Math.max(frameConstraint.recommendedRoughness.min, wallConstraint.recommendedRoughness.min),
      recommendedMax: Math.min(frameConstraint.recommendedRoughness.max, wallConstraint.recommendedRoughness.max),
    },
  };
}

export function clampMaterialParameters(
  material: Partial<MaterialConfig>,
  currentFrameMaterial: string,
  currentWallMaterial: string
): Partial<MaterialConfig> {
  const clamped: Partial<MaterialConfig> = { ...material };
  const limits = getMaterialParameterLimits(
    material.frameMaterial || currentFrameMaterial,
    material.wallMaterial || currentWallMaterial
  );

  if (clamped.reflectivity !== undefined) {
    clamped.reflectivity = Math.max(
      limits.reflectivity.min,
      Math.min(limits.reflectivity.max, clamped.reflectivity)
    );
  }
  if (clamped.roughness !== undefined) {
    clamped.roughness = Math.max(
      limits.roughness.min,
      Math.min(limits.roughness.max, clamped.roughness)
    );
  }

  return clamped;
}
