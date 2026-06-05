import { create } from 'zustand';
import type {
  Artwork,
  LightingConfig,
  MaterialConfig,
  Preset,
  AppState,
} from '../types';
import { DEFAULT_LIGHTING, DEFAULT_MATERIAL } from '../types';
import { mockArtworks } from '../data/mockData';
import {
  loadPresets,
  savePresets,
  loadLastArtwork,
  saveLastArtwork,
  loadLastLighting,
  saveLastLighting,
  loadLastMaterial,
  saveLastMaterial,
} from '../utils/storage';

interface AppStore extends AppState {
  setSelectedArtwork: (id: string | null) => void;
  setLighting: (lighting: Partial<LightingConfig>) => void;
  setMaterial: (material: Partial<MaterialConfig>) => void;
  setActivePanel: (panel: AppState['activePanel']) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  loadPreset: (preset: Preset) => void;
  addToCompare: (presetId: string) => void;
  removeFromCompare: (presetId: string) => void;
  addArtwork: (artwork: Omit<Artwork, 'id'>) => void;
  removeArtwork: (id: string) => void;
  resetLighting: () => void;
  resetMaterial: () => void;
  initializeFromStorage: () => void;
}

const getInitialState = (): AppState => {
  const savedLighting = loadLastLighting();
  const savedMaterial = loadLastMaterial();
  const savedArtworkId = loadLastArtwork();
  const savedPresets = loadPresets();

  return {
    artworks: mockArtworks,
    selectedArtworkId: savedArtworkId || mockArtworks[0]?.id || null,
    lighting: savedLighting || DEFAULT_LIGHTING,
    material: savedMaterial || DEFAULT_MATERIAL,
    presets: savedPresets,
    compareList: [],
    activePanel: 'lighting',
  };
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...getInitialState(),

  initializeFromStorage: () => {
    const state = getInitialState();
    set(state);
  },

  setSelectedArtwork: (id) => {
    set({ selectedArtworkId: id });
    if (id) saveLastArtwork(id);
  },

  setLighting: (lighting) => {
    set((state) => {
      const newLighting = { ...state.lighting, ...lighting };
      saveLastLighting(newLighting);
      return { lighting: newLighting };
    });
  },

  setMaterial: (material) => {
    set((state) => {
      const newMaterial = { ...state.material, ...material };
      saveLastMaterial(newMaterial);
      return { material: newMaterial };
    });
  },

  setActivePanel: (panel) => set({ activePanel: panel }),

  savePreset: (name) => {
    const { selectedArtworkId, lighting, material, presets } = get();
    if (!selectedArtworkId) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      artworkId: selectedArtworkId,
      lighting: { ...lighting },
      material: { ...material },
      createdAt: Date.now(),
    };

    const newPresets = [...presets, newPreset];
    set({ presets: newPresets });
    savePresets(newPresets);
  },

  deletePreset: (id) => {
    const { presets, compareList } = get();
    const newPresets = presets.filter((p) => p.id !== id);
    const newCompareList = compareList.filter((pid) => pid !== id);
    set({ presets: newPresets, compareList: newCompareList });
    savePresets(newPresets);
  },

  loadPreset: (preset) => {
    set({
      selectedArtworkId: preset.artworkId,
      lighting: { ...preset.lighting },
      material: { ...preset.material },
    });
    saveLastArtwork(preset.artworkId);
    saveLastLighting(preset.lighting);
    saveLastMaterial(preset.material);
  },

  addToCompare: (presetId) => {
    const { compareList } = get();
    if (compareList.length >= 4) return;
    if (!compareList.includes(presetId)) {
      set({ compareList: [...compareList, presetId] });
    }
  },

  removeFromCompare: (presetId) => {
    const { compareList } = get();
    set({ compareList: compareList.filter((id) => id !== presetId) });
  },

  addArtwork: (artwork) => {
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now().toString(),
    };
    set((state) => ({ artworks: [...state.artworks, newArtwork] }));
  },

  removeArtwork: (id) => {
    set((state) => ({
      artworks: state.artworks.filter((a) => a.id !== id),
      selectedArtworkId: state.selectedArtworkId === id ? null : state.selectedArtworkId,
    }));
  },

  resetLighting: () => {
    set({ lighting: { ...DEFAULT_LIGHTING } });
    saveLastLighting(DEFAULT_LIGHTING);
  },

  resetMaterial: () => {
    set({ material: { ...DEFAULT_MATERIAL } });
    saveLastMaterial(DEFAULT_MATERIAL);
  },
}));
