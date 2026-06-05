import type { Preset, LightingConfig, MaterialConfig } from '../types';

const PRESETS_KEY = 'artwork_preview_presets';
const LAST_ARTWORK_KEY = 'artwork_preview_last_artwork';
const LAST_LIGHTING_KEY = 'artwork_preview_last_lighting';
const LAST_MATERIAL_KEY = 'artwork_preview_last_material';

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save presets:', e);
  }
}

export function loadPresets(): Preset[] {
  try {
    const data = localStorage.getItem(PRESETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load presets:', e);
    return [];
  }
}

export function saveLastArtwork(artworkId: string): void {
  try {
    localStorage.setItem(LAST_ARTWORK_KEY, artworkId);
  } catch (e) {
    console.error('Failed to save last artwork:', e);
  }
}

export function loadLastArtwork(): string | null {
  try {
    return localStorage.getItem(LAST_ARTWORK_KEY);
  } catch (e) {
    console.error('Failed to load last artwork:', e);
    return null;
  }
}

export function saveLastLighting(lighting: LightingConfig): void {
  try {
    localStorage.setItem(LAST_LIGHTING_KEY, JSON.stringify(lighting));
  } catch (e) {
    console.error('Failed to save last lighting:', e);
  }
}

export function loadLastLighting(): LightingConfig | null {
  try {
    const data = localStorage.getItem(LAST_LIGHTING_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load last lighting:', e);
    return null;
  }
}

export function saveLastMaterial(material: MaterialConfig): void {
  try {
    localStorage.setItem(LAST_MATERIAL_KEY, JSON.stringify(material));
  } catch (e) {
    console.error('Failed to save last material:', e);
  }
}

export function loadLastMaterial(): MaterialConfig | null {
  try {
    const data = localStorage.getItem(LAST_MATERIAL_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load last material:', e);
    return null;
  }
}

export function exportPreset(preset: Preset): void {
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.name.replace(/\s+/g, '_')}_${preset.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importPreset(file: File): Promise<Preset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target?.result as string);
        resolve(preset);
      } catch (err) {
        reject(new Error('Invalid preset file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
