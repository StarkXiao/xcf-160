import type { Preset, CompareParameterKey, ParameterDifference, LightingConfig, MaterialConfig } from '../types';
import { DEFAULT_LIGHTING, DEFAULT_MATERIAL } from '../types';

export function getParameterValue(preset: Preset, key: CompareParameterKey): unknown {
  const parts = key.split('.');
  if (parts.length === 2) {
    const [category, field] = parts;
    if (category === 'lighting') {
      return preset.lighting[field as keyof LightingConfig];
    } else if (category === 'material') {
      return preset.material[field as keyof MaterialConfig];
    }
  }
  return undefined;
}

export function setParameterValue(
  preset: Preset,
  key: CompareParameterKey,
  value: unknown
): Preset {
  const parts = key.split('.');
  if (parts.length !== 2) return preset;

  const [category, field] = parts;
  const now = Date.now();

  if (category === 'lighting') {
    return {
      ...preset,
      lighting: { ...preset.lighting, [field]: value },
      updatedAt: now,
    };
  } else if (category === 'material') {
    return {
      ...preset,
      material: { ...preset.material, [field]: value },
      updatedAt: now,
    };
  }

  return preset;
}

export function getParameterDifferences(
  presets: Preset[],
  presetIds: string[]
): ParameterDifference[] {
  const comparePresets = presets.filter((p) => presetIds.includes(p.id));
  if (comparePresets.length < 2) return [];

  const paramKeys: CompareParameterKey[] = [
    'lighting.type',
    'lighting.colorTemperature',
    'lighting.intensity',
    'lighting.angle',
    'lighting.positionX',
    'lighting.positionY',
    'lighting.positionZ',
    'material.frameMaterial',
    'material.wallMaterial',
    'material.reflectivity',
    'material.roughness',
  ];

  return paramKeys.map((key) => {
    const values: Record<string, unknown> = {};
    comparePresets.forEach((preset) => {
      values[preset.id] = getParameterValue(preset, key);
    });

    const valueArray = Object.values(values);
    const isDifferent = !valueArray.every(
      (v) => JSON.stringify(v) === JSON.stringify(valueArray[0])
    );

    return {
      key,
      values,
      isDifferent,
    };
  });
}

export function getDifferenceCount(differences: ParameterDifference[]): number {
  return differences.filter((d) => d.isDifferent).length;
}

export function formatParameterValue(
  key: CompareParameterKey,
  value: unknown
): string {
  if (value === undefined || value === null) return '-';

  switch (key) {
    case 'lighting.colorTemperature':
      return `${value}K`;
    case 'lighting.intensity':
    case 'material.reflectivity':
    case 'material.roughness':
      return `${Math.round((value as number) * 100)}%`;
    case 'lighting.angle':
    case 'lighting.positionX':
    case 'lighting.positionY':
    case 'lighting.positionZ':
      return `${value}°`;
    default:
      return String(value);
  }
}

export function copyParameters(
  sourcePreset: Preset,
  targetPresets: Preset[],
  parameterKeys?: CompareParameterKey[]
): Preset[] {
  const keys: CompareParameterKey[] = parameterKeys || [
    'lighting.type',
    'lighting.colorTemperature',
    'lighting.intensity',
    'lighting.angle',
    'lighting.positionX',
    'lighting.positionY',
    'lighting.positionZ',
    'material.frameMaterial',
    'material.wallMaterial',
    'material.reflectivity',
    'material.roughness',
  ];

  return targetPresets.map((target) => {
    let updated = { ...target };
    keys.forEach((key) => {
      const value = getParameterValue(sourcePreset, key);
      updated = setParameterValue(updated, key, value);
    });
    return updated;
  });
}

export function resetParametersToDefault(
  presets: Preset[],
  parameterKeys?: CompareParameterKey[]
): Preset[] {
  const keys: CompareParameterKey[] = parameterKeys || [
    'lighting.type',
    'lighting.colorTemperature',
    'lighting.intensity',
    'lighting.angle',
    'lighting.positionX',
    'lighting.positionY',
    'lighting.positionZ',
    'material.frameMaterial',
    'material.wallMaterial',
    'material.reflectivity',
    'material.roughness',
  ];

  const defaultPreset: Preset = {
    id: 'default',
    name: 'Default',
    artworkId: '',
    lighting: { ...DEFAULT_LIGHTING },
    material: { ...DEFAULT_MATERIAL },
    keywords: [],
    useCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return copyParameters(defaultPreset, presets, keys);
}

export function calculateSimilarityScore(
  preset1: Preset,
  preset2: Preset
): number {
  const differences = getParameterDifferences([preset1, preset2], [
    preset1.id,
    preset2.id,
  ]);
  const differentCount = differences.filter((d) => d.isDifferent).length;
  const totalCount = differences.length;
  return Math.round(((totalCount - differentCount) / totalCount) * 100);
}

export function findChangedParameters(
  original: Preset,
  modified: Preset
): CompareParameterKey[] {
  const differences = getParameterDifferences([original, modified], [
    original.id,
    modified.id,
  ]);
  return differences.filter((d) => d.isDifferent).map((d) => d.key);
}
