import { create } from 'zustand';
import type {
  Artwork,
  LightingConfig,
  MaterialConfig,
  Preset,
  AppState,
  GalleryScheme,
  WallArtwork,
  WallPosition,
  LightingStrategy,
  SchemePanelTab,
  AppMode,
} from '../types';
import {
  DEFAULT_LIGHTING,
  DEFAULT_MATERIAL,
  DEFAULT_WALL_POSITION,
  DEFAULT_LIGHTING_STRATEGY,
} from '../types';
import { mockArtworks, mockGallerySchemes } from '../data/mockData';
import {
  loadPresets,
  savePresets,
  loadLastArtwork,
  saveLastArtwork,
  loadLastLighting,
  saveLastLighting,
  loadLastMaterial,
  saveLastMaterial,
  loadGallerySchemes,
  saveGallerySchemes,
  loadCurrentSchemeId,
  saveCurrentSchemeId,
  loadAppMode,
  saveAppMode,
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
  createScheme: (name: string, description?: string) => void;
  deleteScheme: (id: string) => void;
  setCurrentScheme: (id: string | null) => void;
  updateScheme: (id: string, updates: Partial<GalleryScheme>) => void;
  addArtworksToScheme: (artworkIds: string[]) => void;
  removeWallArtwork: (wallArtworkId: string) => void;
  updateWallArtworkPosition: (wallArtworkId: string, position: Partial<WallPosition>) => void;
  updateWallArtworkLighting: (wallArtworkId: string, lighting: Partial<LightingConfig>) => void;
  updateWallArtworkMaterial: (wallArtworkId: string, material: Partial<MaterialConfig>) => void;
  setLightingStrategy: (strategy: Partial<LightingStrategy>) => void;
  applyLightingStrategyToSelected: () => void;
  selectWallArtwork: (id: string, multiSelect?: boolean) => void;
  clearWallArtworkSelection: () => void;
  setSchemePanelTab: (tab: SchemePanelTab) => void;
  duplicateScheme: (id: string, newName: string) => void;
  exportScheme: (id: string) => void;
  importScheme: (scheme: GalleryScheme) => void;
  saveSchemeSnapshot: (schemeId: string, name: string) => void;
  setSchemeWallMaterial: (wallMaterial: AppState['material']['wallMaterial']) => void;
  setAppMode: (mode: AppMode) => void;
}

const getInitialState = (): AppState => {
  const savedLighting = loadLastLighting();
  const savedMaterial = loadLastMaterial();
  const savedArtworkId = loadLastArtwork();
  const savedPresets = loadPresets();
  const savedSchemes = loadGallerySchemes();
  const savedCurrentSchemeId = loadCurrentSchemeId();
  const savedAppMode = loadAppMode();

  const schemes = savedSchemes.length > 0 ? savedSchemes : mockGallerySchemes;
  const currentSchemeId = savedCurrentSchemeId || schemes[0]?.id || null;
  const appMode = (savedAppMode as AppMode) || 'curator';

  return {
    artworks: mockArtworks,
    selectedArtworkId: savedArtworkId || mockArtworks[0]?.id || null,
    lighting: savedLighting || DEFAULT_LIGHTING,
    material: savedMaterial || DEFAULT_MATERIAL,
    presets: savedPresets,
    compareList: [],
    activePanel: 'scheme',
    gallerySchemes: schemes,
    currentSchemeId,
    selectedWallArtworkIds: [],
    schemePanelTab: 'layout',
    appMode,
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

  createScheme: (name, description) => {
    const newScheme: GalleryScheme = {
      id: Date.now().toString(),
      name,
      description,
      wallArtworks: [],
      lightingStrategy: { ...DEFAULT_LIGHTING_STRATEGY },
      wallMaterial: 'matte',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({
      gallerySchemes: [...state.gallerySchemes, newScheme],
      currentSchemeId: newScheme.id,
      selectedWallArtworkIds: [],
    }));
    saveGallerySchemes([...get().gallerySchemes, newScheme]);
    saveCurrentSchemeId(newScheme.id);
  },

  deleteScheme: (id) => {
    set((state) => {
      const newSchemes = state.gallerySchemes.filter((s) => s.id !== id);
      const newCurrentId = state.currentSchemeId === id
        ? (newSchemes[0]?.id || null)
        : state.currentSchemeId;
      saveGallerySchemes(newSchemes);
      if (newCurrentId) saveCurrentSchemeId(newCurrentId);
      return {
        gallerySchemes: newSchemes,
        currentSchemeId: newCurrentId,
        selectedWallArtworkIds: [],
      };
    });
  },

  setCurrentScheme: (id) => {
    set({ currentSchemeId: id, selectedWallArtworkIds: [] });
    if (id) saveCurrentSchemeId(id);
  },

  updateScheme: (id, updates) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  addArtworksToScheme: (artworkIds) => {
    const { currentSchemeId, gallerySchemes, lighting, material } = get();
    if (!currentSchemeId) return;

    const scheme = gallerySchemes.find((s) => s.id === currentSchemeId);
    if (!scheme) return;

    const existingCount = scheme.wallArtworks.length;
    const newWallArtworks: WallArtwork[] = artworkIds.map((artworkId, index) => {
      const artwork = get().artworks.find((a) => a.id === artworkId);
      const aspectRatio = artwork ? artwork.width / artwork.height : 1;
      const baseWidth = 20;
      const height = baseWidth / aspectRatio;

      const gridIndex = existingCount + index;
      const cols = 3;
      const row = Math.floor(gridIndex / cols);
      const col = gridIndex % cols;
      const spacing = 5;
      const startX = 15 + col * (baseWidth + spacing);
      const startY = 20 + row * (height + spacing);

      return {
        id: `${currentSchemeId}-${artworkId}-${Date.now()}-${index}`,
        artworkId,
        position: {
          ...DEFAULT_WALL_POSITION,
          x: startX + baseWidth / 2,
          y: startY + height / 2,
          width: baseWidth,
          height,
        },
        lighting: scheme.lightingStrategy.mode === 'uniform'
          ? { ...scheme.lightingStrategy.globalLighting }
          : { ...lighting },
        material: { ...material },
      };
    });

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: [...s.wallArtworks, ...newWallArtworks],
              updatedAt: Date.now(),
            }
          : s
      ),
      selectedWallArtworkIds: newWallArtworks.map((w) => w.id),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  removeWallArtwork: (wallArtworkId) => {
    const { currentSchemeId, gallerySchemes, selectedWallArtworkIds } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: s.wallArtworks.filter((w) => w.id !== wallArtworkId),
              updatedAt: Date.now(),
            }
          : s
      ),
      selectedWallArtworkIds: selectedWallArtworkIds.filter((id) => id !== wallArtworkId),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  updateWallArtworkPosition: (wallArtworkId, position) => {
    const { currentSchemeId } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: s.wallArtworks.map((w) =>
                w.id === wallArtworkId
                  ? { ...w, position: { ...w.position, ...position } }
                  : w
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  updateWallArtworkLighting: (wallArtworkId, lighting) => {
    const { currentSchemeId } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: s.wallArtworks.map((w) =>
                w.id === wallArtworkId
                  ? { ...w, lighting: { ...w.lighting, ...lighting } }
                  : w
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  updateWallArtworkMaterial: (wallArtworkId, material) => {
    const { currentSchemeId } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: s.wallArtworks.map((w) =>
                w.id === wallArtworkId
                  ? { ...w, material: { ...w.material, ...material } }
                  : w
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  setLightingStrategy: (strategy) => {
    const { currentSchemeId } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              lightingStrategy: { ...s.lightingStrategy, ...strategy },
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  applyLightingStrategyToSelected: () => {
    const { currentSchemeId, gallerySchemes, selectedWallArtworkIds } = get();
    if (!currentSchemeId) return;

    const scheme = gallerySchemes.find((s) => s.id === currentSchemeId);
    if (!scheme) return;

    const { globalLighting } = scheme.lightingStrategy;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? {
              ...s,
              wallArtworks: s.wallArtworks.map((w) =>
                selectedWallArtworkIds.includes(w.id)
                  ? { ...w, lighting: { ...globalLighting } }
                  : w
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  selectWallArtwork: (id, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedWallArtworkIds.includes(id);
        return {
          selectedWallArtworkIds: isSelected
            ? state.selectedWallArtworkIds.filter((wid) => wid !== id)
            : [...state.selectedWallArtworkIds, id],
        };
      }
      return { selectedWallArtworkIds: [id] };
    });
  },

  clearWallArtworkSelection: () => {
    set({ selectedWallArtworkIds: [] });
  },

  setSchemePanelTab: (tab) => {
    set({ schemePanelTab: tab });
  },

  duplicateScheme: (id, newName) => {
    const { gallerySchemes } = get();
    const scheme = gallerySchemes.find((s) => s.id === id);
    if (!scheme) return;

    const newScheme: GalleryScheme = {
      ...scheme,
      id: Date.now().toString(),
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wallArtworks: scheme.wallArtworks.map((w) => ({
        ...w,
        id: `${Date.now()}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
      })),
      lightingStrategy: { ...scheme.lightingStrategy },
    };

    set((state) => ({
      gallerySchemes: [...state.gallerySchemes, newScheme],
      currentSchemeId: newScheme.id,
      selectedWallArtworkIds: [],
    }));
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentSchemeId(newScheme.id);
  },

  exportScheme: (id) => {
    const { gallerySchemes } = get();
    const scheme = gallerySchemes.find((s) => s.id === id);
    if (!scheme) return;

    const blob = new Blob([JSON.stringify(scheme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheme.name.replace(/\s+/g, '_')}_${scheme.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importScheme: (scheme) => {
    const newScheme: GalleryScheme = {
      ...scheme,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wallArtworks: scheme.wallArtworks.map((w) => ({
        ...w,
        id: `${Date.now()}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    set((state) => ({
      gallerySchemes: [...state.gallerySchemes, newScheme],
      currentSchemeId: newScheme.id,
      selectedWallArtworkIds: [],
    }));
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentSchemeId(newScheme.id);
  },

  saveSchemeSnapshot: (schemeId, name) => {
    const { gallerySchemes } = get();
    const scheme = gallerySchemes.find((s) => s.id === schemeId);
    if (!scheme) return;

    const snapshot: GalleryScheme = {
      ...scheme,
      id: `snapshot-${Date.now()}`,
      name: `${scheme.name} - ${name}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wallArtworks: scheme.wallArtworks.map((w) => ({
        ...w,
        id: `snapshot-${Date.now()}-${w.id}`,
      })),
    };

    set((state) => ({
      gallerySchemes: [...state.gallerySchemes, snapshot],
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  setSchemeWallMaterial: (wallMaterial) => {
    const { currentSchemeId } = get();
    if (!currentSchemeId) return;

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === currentSchemeId
          ? { ...s, wallMaterial, updatedAt: Date.now() }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  setAppMode: (mode) => {
    set({ appMode: mode, selectedWallArtworkIds: [] });
    saveAppMode(mode);
  },
}));
