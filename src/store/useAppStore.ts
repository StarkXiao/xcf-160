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
  CuratorProject,
  ProjectVersion,
  ProjectViewTab,
} from '../types';
import {
  DEFAULT_LIGHTING,
  DEFAULT_MATERIAL,
  DEFAULT_WALL_POSITION,
  DEFAULT_LIGHTING_STRATEGY,
  DEFAULT_PROJECT,
} from '../types';
import { mockArtworks, mockGallerySchemes, mockCuratorProjects } from '../data/mockData';
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
  loadCuratorProjects,
  saveCuratorProjects,
  loadCurrentProjectId,
  saveCurrentProjectId,
  exportProject as exportProjectUtil,
  importProject as importProjectUtil,
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
  setShowCuratorHub: (show: boolean) => void;
  setProjectViewTab: (tab: ProjectViewTab) => void;
  createProject: (name: string, description?: string, tags?: string[]) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  updateProject: (id: string, updates: Partial<CuratorProject>) => void;
  duplicateProject: (id: string, newName: string) => void;
  addSchemeToProject: (projectId: string, schemeId: string) => void;
  removeSchemeFromProject: (projectId: string, schemeId: string) => void;
  saveProjectVersion: (projectId: string, name: string, description?: string) => void;
  loadProjectVersion: (projectId: string, versionId: string) => void;
  deleteProjectVersion: (projectId: string, versionId: string) => void;
  exportProject: (id: string) => void;
  importProject: (project: CuratorProject) => void;
  openProject: (projectId: string) => void;
}

const getInitialState = (): AppState => {
  const savedLighting = loadLastLighting();
  const savedMaterial = loadLastMaterial();
  const savedArtworkId = loadLastArtwork();
  const savedPresets = loadPresets();
  const savedSchemes = loadGallerySchemes();
  const savedCurrentSchemeId = loadCurrentSchemeId();
  const savedAppMode = loadAppMode();
  const savedProjects = loadCuratorProjects();
  const savedCurrentProjectId = loadCurrentProjectId();

  const schemes = savedSchemes.length > 0 ? savedSchemes : mockGallerySchemes;
  const projects = savedProjects.length > 0 ? savedProjects : mockCuratorProjects;
  const currentProjectId = savedCurrentProjectId || projects[0]?.id || null;
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
    curatorProjects: projects,
    currentProjectId,
    projectViewTab: 'projects',
    showCuratorHub: false,
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

  setShowCuratorHub: (show) => {
    set({ showCuratorHub: show });
  },

  setProjectViewTab: (tab) => {
    set({ projectViewTab: tab });
  },

  createProject: (name, description, tags = []) => {
    const newProject: CuratorProject = {
      ...DEFAULT_PROJECT,
      id: Date.now().toString(),
      name,
      description,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const defaultScheme: GalleryScheme = {
      id: `scheme-${Date.now()}`,
      name: `${name} - 主方案`,
      description: '默认创建的主方案',
      wallArtworks: [],
      lightingStrategy: { ...DEFAULT_LIGHTING_STRATEGY },
      wallMaterial: 'matte',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    newProject.schemeIds = [defaultScheme.id];
    newProject.currentSchemeId = defaultScheme.id;

    set((state) => ({
      curatorProjects: [...state.curatorProjects, newProject],
      gallerySchemes: [...state.gallerySchemes, defaultScheme],
      currentProjectId: newProject.id,
      currentSchemeId: defaultScheme.id,
      selectedWallArtworkIds: [],
    }));

    saveCuratorProjects(get().curatorProjects);
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentProjectId(newProject.id);
    saveCurrentSchemeId(defaultScheme.id);
  },

  deleteProject: (id) => {
    set((state) => {
      const project = state.curatorProjects.find((p) => p.id === id);
      if (!project) return state;

      const newProjects = state.curatorProjects.filter((p) => p.id !== id);
      const newSchemes = state.gallerySchemes.filter((s) => !project.schemeIds.includes(s.id));
      const newCurrentProjectId = state.currentProjectId === id
        ? (newProjects[0]?.id || null)
        : state.currentProjectId;
      const newCurrentSchemeId = newCurrentProjectId
        ? (newProjects.find((p) => p.id === newCurrentProjectId)?.currentSchemeId || null)
        : null;

      saveCuratorProjects(newProjects);
      saveGallerySchemes(newSchemes);
      if (newCurrentProjectId) saveCurrentProjectId(newCurrentProjectId);
      if (newCurrentSchemeId) saveCurrentSchemeId(newCurrentSchemeId);

      return {
        curatorProjects: newProjects,
        gallerySchemes: newSchemes,
        currentProjectId: newCurrentProjectId,
        currentSchemeId: newCurrentSchemeId,
        selectedWallArtworkIds: [],
      };
    });
  },

  setCurrentProject: (id) => {
    set((state) => {
      const project = state.curatorProjects.find((p) => p.id === id);
      const newSchemeId = project?.currentSchemeId || state.currentSchemeId;
      return {
        currentProjectId: id,
        currentSchemeId: newSchemeId,
        selectedWallArtworkIds: [],
      };
    });
    if (id) saveCurrentProjectId(id);
  },

  updateProject: (id, updates) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  duplicateProject: (id, newName) => {
    const { curatorProjects, gallerySchemes } = get();
    const project = curatorProjects.find((p) => p.id === id);
    if (!project) return;

    const newProjectId = Date.now().toString();
    const schemeIdMap: Record<string, string> = {};

    const newSchemes: GalleryScheme[] = project.schemeIds.map((schemeId) => {
      const scheme = gallerySchemes.find((s) => s.id === schemeId);
      if (!scheme) return null;

      const newSchemeId = `${newProjectId}-scheme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      schemeIdMap[schemeId] = newSchemeId;

      return {
        ...scheme,
        id: newSchemeId,
        name: `${newName} - ${scheme.name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        wallArtworks: scheme.wallArtworks.map((w) => ({
          ...w,
          id: `${newSchemeId}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        lightingStrategy: { ...scheme.lightingStrategy },
      };
    }).filter(Boolean) as GalleryScheme[];

    const newProject: CuratorProject = {
      ...project,
      id: newProjectId,
      name: newName,
      schemeIds: newSchemes.map((s) => s.id),
      currentSchemeId: schemeIdMap[project.currentSchemeId || ''] || newSchemes[0]?.id || null,
      versions: project.versions.map((v) => ({
        ...v,
        id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scheme: {
          ...v.scheme,
          id: `${newProjectId}-version-scheme-${Date.now()}`,
          wallArtworks: v.scheme.wallArtworks.map((w) => ({
            ...w,
            id: `${newProjectId}-version-${w.id}`,
          })),
        },
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      curatorProjects: [...state.curatorProjects, newProject],
      gallerySchemes: [...state.gallerySchemes, ...newSchemes],
      currentProjectId: newProject.id,
      currentSchemeId: newProject.currentSchemeId,
      selectedWallArtworkIds: [],
    }));

    saveCuratorProjects(get().curatorProjects);
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentProjectId(newProject.id);
    if (newProject.currentSchemeId) saveCurrentSchemeId(newProject.currentSchemeId);
  },

  addSchemeToProject: (projectId, schemeId) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              schemeIds: [...p.schemeIds, schemeId],
              currentSchemeId: p.currentSchemeId || schemeId,
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  removeSchemeFromProject: (projectId, schemeId) => {
    set((state) => {
      const project = state.curatorProjects.find((p) => p.id === projectId);
      if (!project) return state;

      const remainingSchemeIds = project.schemeIds.filter((id) => id !== schemeId);
      const newCurrentSchemeId = project.currentSchemeId === schemeId
        ? (remainingSchemeIds[0] || null)
        : project.currentSchemeId;

      return {
        curatorProjects: state.curatorProjects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                schemeIds: remainingSchemeIds,
                currentSchemeId: newCurrentSchemeId,
                updatedAt: Date.now(),
              }
            : p
        ),
        gallerySchemes: state.gallerySchemes.filter((s) => s.id !== schemeId),
        currentSchemeId: state.currentSchemeId === schemeId ? newCurrentSchemeId : state.currentSchemeId,
      };
    });
    saveCuratorProjects(get().curatorProjects);
    saveGallerySchemes(get().gallerySchemes);
  },

  saveProjectVersion: (projectId, name, description) => {
    const { curatorProjects, gallerySchemes, currentSchemeId } = get();
    const project = curatorProjects.find((p) => p.id === projectId);
    if (!project || !currentSchemeId) return;

    const scheme = gallerySchemes.find((s) => s.id === currentSchemeId);
    if (!scheme) return;

    const version: ProjectVersion = {
      id: `version-${Date.now()}`,
      name,
      description,
      scheme: JSON.parse(JSON.stringify(scheme)),
      createdAt: Date.now(),
      createdBy: 'curator',
    };

    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? { ...p, versions: [...p.versions, version], updatedAt: Date.now() }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  loadProjectVersion: (projectId, versionId) => {
    const { curatorProjects } = get();
    const project = curatorProjects.find((p) => p.id === projectId);
    if (!project) return;

    const version = project.versions.find((v) => v.id === versionId);
    if (!version) return;

    const restoredScheme: GalleryScheme = {
      ...version.scheme,
      id: `restored-${Date.now()}`,
      name: `${version.scheme.name} (恢复自 ${version.name})`,
      updatedAt: Date.now(),
      wallArtworks: version.scheme.wallArtworks.map((w) => ({
        ...w,
        id: `restored-${Date.now()}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    set((state) => ({
      gallerySchemes: [...state.gallerySchemes, restoredScheme],
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              schemeIds: [...p.schemeIds, restoredScheme.id],
              currentSchemeId: restoredScheme.id,
              updatedAt: Date.now(),
            }
          : p
      ),
      currentSchemeId: restoredScheme.id,
      selectedWallArtworkIds: [],
    }));

    saveCuratorProjects(get().curatorProjects);
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentSchemeId(restoredScheme.id);
  },

  deleteProjectVersion: (projectId, versionId) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? { ...p, versions: p.versions.filter((v) => v.id !== versionId), updatedAt: Date.now() }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  exportProject: (id) => {
    const { curatorProjects, gallerySchemes } = get();
    const project = curatorProjects.find((p) => p.id === id);
    if (!project) return;

    const projectSchemes = gallerySchemes.filter((s) => project.schemeIds.includes(s.id));
    const exportData = {
      project,
      schemes: projectSchemes,
      exportTime: Date.now(),
      version: '1.0',
    };

    exportProjectUtil(exportData);
  },

  importProject: (project) => {
    const newProjectId = Date.now().toString();
    const schemeIdMap: Record<string, string> = {};

    const newSchemes: GalleryScheme[] = project.schemeIds.map((oldSchemeId) => {
      const scheme = get().gallerySchemes.find((s) => s.id === oldSchemeId);
      if (!scheme) return null;

      const newSchemeId = `${newProjectId}-scheme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      schemeIdMap[oldSchemeId] = newSchemeId;

      return {
        ...scheme,
        id: newSchemeId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        wallArtworks: scheme.wallArtworks.map((w) => ({
          ...w,
          id: `${newSchemeId}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };
    }).filter(Boolean) as GalleryScheme[];

    const newProject: CuratorProject = {
      ...project,
      id: newProjectId,
      schemeIds: newSchemes.map((s) => s.id),
      currentSchemeId: project.currentSchemeId ? schemeIdMap[project.currentSchemeId] : newSchemes[0]?.id || null,
      versions: project.versions.map((v) => ({
        ...v,
        id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        scheme: {
          ...v.scheme,
          id: `${newProjectId}-version-scheme-${Date.now()}`,
          wallArtworks: v.scheme.wallArtworks.map((w) => ({
            ...w,
            id: `${newProjectId}-version-${w.id}`,
          })),
        },
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      curatorProjects: [...state.curatorProjects, newProject],
      gallerySchemes: [...state.gallerySchemes, ...newSchemes],
      currentProjectId: newProject.id,
      currentSchemeId: newProject.currentSchemeId,
      selectedWallArtworkIds: [],
    }));

    saveCuratorProjects(get().curatorProjects);
    saveGallerySchemes(get().gallerySchemes);
    saveCurrentProjectId(newProject.id);
    if (newProject.currentSchemeId) saveCurrentSchemeId(newProject.currentSchemeId);
  },

  openProject: (projectId) => {
    const { curatorProjects } = get();
    const project = curatorProjects.find((p) => p.id === projectId);
    if (!project) return;

    set({
      currentProjectId: projectId,
      currentSchemeId: project.currentSchemeId,
      appMode: 'curator',
      activePanel: 'scheme',
      showCuratorHub: false,
      selectedWallArtworkIds: [],
    });

    saveCurrentProjectId(projectId);
    if (project.currentSchemeId) saveCurrentSchemeId(project.currentSchemeId);
    saveAppMode('curator');
  },
}));
