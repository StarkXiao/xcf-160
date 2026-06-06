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
  CustomerProposal,
  ProposalArtworkSection,
  ArtworkTag,
  IngestionFormData,
  IngestionValidationError,
  WorkstationTab,
  IngestionStatus,
} from '../types';
import {
  DEFAULT_LIGHTING,
  DEFAULT_MATERIAL,
  DEFAULT_WALL_POSITION,
  DEFAULT_LIGHTING_STRATEGY,
  DEFAULT_PROJECT,
  DEFAULT_EXPORT_CONFIG,
  DEFAULT_PROGRESS_STEPS,
  EXPORT_FORMAT_LABELS,
  EXPORT_RESOLUTION_PIXELS,
  LIGHT_TYPE_LABELS,
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  DEFAULT_ARTWORK_TAGS,
  DEFAULT_INGESTION_FORM,
} from '../types';
import type {
  ArtworkGroup,
  ProgressStep,
  ProgressStatus,
  VersionComment,
  ExportConfig,
  CuratorHubTab,
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
  type ProjectExportData,
  loadProposals,
  saveProposals,
  loadCurrentProposalId,
  saveCurrentProposalId,
  exportProposal as exportProposalUtil,
  generateShareLink as generateShareLinkUtil,
  generateFullShareLink,
  parseShareData,
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
  createScheme: (name: string, description?: string) => GalleryScheme;
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
  duplicateScheme: (id: string, newName: string) => GalleryScheme;
  exportScheme: (id: string) => void;
  importScheme: (scheme: GalleryScheme) => GalleryScheme;
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
  importProject: (data: ProjectExportData) => void;
  openProject: (projectId: string) => void;
  setCuratorHubTab: (tab: CuratorHubTab) => void;
  setSelectedGroupId: (id: string | null) => void;
  setSelectedVersionId: (id: string | null) => void;
  createGroup: (schemeId: string, name: string, color: string, description?: string) => void;
  updateGroup: (schemeId: string, groupId: string, updates: Partial<ArtworkGroup>) => void;
  deleteGroup: (schemeId: string, groupId: string) => void;
  addArtworksToGroup: (schemeId: string, groupId: string, artworkIds: string[]) => void;
  removeArtworksFromGroup: (schemeId: string, groupId: string, artworkIds: string[]) => void;
  reorderGroups: (schemeId: string, groupIds: string[]) => void;
  updateProgressStep: (projectId: string, stepId: string, updates: Partial<ProgressStep>) => void;
  setProgressStepStatus: (projectId: string, stepId: string, status: ProgressStatus) => void;
  addProgressStep: (projectId: string, step: Omit<ProgressStep, 'id'>) => void;
  removeProgressStep: (projectId: string, stepId: string) => void;
  reorderProgressSteps: (projectId: string, stepIds: string[]) => void;
  recalculateProgress: (projectId: string) => void;
  addVersionComment: (projectId: string, versionId: string, author: string, content: string) => void;
  deleteVersionComment: (projectId: string, commentId: string) => void;
  compareVersions: (projectId: string, versionId1: string, versionId2: string) => { version1: ProjectVersion; version2: ProjectVersion; differences: string[] } | null;
  exportProjectPreview: (projectId: string, config: ExportConfig) => void;
  createProposal: (projectId: string, schemeId: string, title: string) => CustomerProposal;
  updateProposal: (proposalId: string, updates: Partial<CustomerProposal>) => void;
  deleteProposal: (proposalId: string) => void;
  setCurrentProposal: (proposalId: string | null) => void;
  generateProposalShareLink: (proposalId: string, expiresInDays?: number) => string;
  exportProposal: (proposalId: string) => void;
  regenerateProposalArtworkDescription: (proposalId: string, artworkId: string) => void;
  parseShareLink: (encoded: string) => ReturnType<typeof parseShareData>;
  setWorkstationTab: (tab: WorkstationTab) => void;
  setIngestionSearchQuery: (query: string) => void;
  setIngestionStatus: (status: IngestionStatus) => void;
  addArtworkTag: (tag: Omit<ArtworkTag, 'id'>) => void;
  updateArtworkTag: (tagId: string, updates: Partial<ArtworkTag>) => void;
  removeArtworkTag: (tagId: string) => void;
  addArtworkWithTags: (artwork: Omit<Artwork, 'id' | 'createdAt' | 'updatedAt' | 'tagIds'> & { tagIds: string[] }) => void;
  updateArtworkWithTags: (artworkId: string, updates: Partial<Artwork> & { tagIds?: string[] }) => void;
  validateIngestionForm: (formData: IngestionFormData) => IngestionValidationError[];
  submitIngestion: (formData: IngestionFormData) => Promise<Artwork | null>;
  getFilteredArtworks: () => Artwork[];
  getArtworksByTagId: (tagId: string) => Artwork[];
  filterArtworks: (query: string) => Artwork[];
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
  const savedProposals = loadProposals();
  const savedCurrentProposalId = loadCurrentProposalId();

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
    curatorHubTab: 'overview',
    selectedGroupId: null,
    selectedVersionId: null,
    proposals: savedProposals,
    currentProposalId: savedCurrentProposalId,
    artworkTags: DEFAULT_ARTWORK_TAGS,
    workstationTab: 'ingestion',
    ingestionSearchQuery: '',
    ingestionStatus: 'draft',
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
      groups: [],
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
    return newScheme;
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
    if (!scheme) return undefined as unknown as GalleryScheme;

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
    return newScheme;
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
    return newScheme;
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
      groups: [],
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

  importProject: (data) => {
    const { project, schemes: importedSchemes } = data;
    const newProjectId = Date.now().toString();
    const schemeIdMap: Record<string, string> = {};
    const timestamp = Date.now();

    const newSchemes: GalleryScheme[] = project.schemeIds
      .map((oldSchemeId) => {
        const scheme = importedSchemes.find((s) => s.id === oldSchemeId);
        if (!scheme) return null;

        const newSchemeId = `${newProjectId}-scheme-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
        schemeIdMap[oldSchemeId] = newSchemeId;

        return {
          ...scheme,
          id: newSchemeId,
          createdAt: timestamp,
          updatedAt: timestamp,
          wallArtworks: scheme.wallArtworks.map((w) => ({
            ...w,
            id: `${newSchemeId}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
          })),
        };
      })
      .filter(Boolean) as GalleryScheme[];

    if (importedSchemes.length > 0 && newSchemes.length === 0) {
      const fallbackSchemes: GalleryScheme[] = importedSchemes.map((scheme) => {
        const newSchemeId = `${newProjectId}-scheme-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
        schemeIdMap[scheme.id] = newSchemeId;
        return {
          ...scheme,
          id: newSchemeId,
          createdAt: timestamp,
          updatedAt: timestamp,
          wallArtworks: scheme.wallArtworks.map((w) => ({
            ...w,
            id: `${newSchemeId}-${w.artworkId}-${Math.random().toString(36).substr(2, 9)}`,
          })),
        };
      });
      newSchemes.push(...fallbackSchemes);
    }

    const remappedSchemeIds = newSchemes.map((s) => s.id);
    const remappedCurrentSchemeId = project.currentSchemeId
      ? schemeIdMap[project.currentSchemeId]
      : newSchemes[0]?.id || null;

    const newProject: CuratorProject = {
      ...project,
      id: newProjectId,
      schemeIds: remappedSchemeIds,
      currentSchemeId: remappedCurrentSchemeId,
      versions: project.versions.map((v) => ({
        ...v,
        id: `version-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: timestamp,
        scheme: {
          ...v.scheme,
          id: `${newProjectId}-version-scheme-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          wallArtworks: v.scheme.wallArtworks.map((w) => ({
            ...w,
            id: `${newProjectId}-version-${timestamp}-${w.id}`,
          })),
        },
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
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

  setCuratorHubTab: (tab) => set({ curatorHubTab: tab }),

  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  setSelectedVersionId: (id) => set({ selectedVersionId: id }),

  createGroup: (schemeId, name, color, description) => {
    const newGroup: ArtworkGroup = {
      id: `group-${Date.now()}`,
      name,
      color,
      description,
      artworkIds: [],
      order: get().gallerySchemes.find(s => s.id === schemeId)?.groups.length || 0,
    };

    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? { ...s, groups: [...s.groups, newGroup], updatedAt: Date.now() }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  updateGroup: (schemeId, groupId, updates) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              groups: s.groups.map((g) =>
                g.id === groupId ? { ...g, ...updates } : g
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  deleteGroup: (schemeId, groupId) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              groups: s.groups.filter((g) => g.id !== groupId),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  addArtworksToGroup: (schemeId, groupId, artworkIds) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              groups: s.groups.map((g) =>
                g.id === groupId
                  ? { ...g, artworkIds: [...new Set([...g.artworkIds, ...artworkIds])] }
                  : g
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  removeArtworksFromGroup: (schemeId, groupId, artworkIds) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              groups: s.groups.map((g) =>
                g.id === groupId
                  ? { ...g, artworkIds: g.artworkIds.filter((id) => !artworkIds.includes(id)) }
                  : g
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  reorderGroups: (schemeId, groupIds) => {
    set((state) => ({
      gallerySchemes: state.gallerySchemes.map((s) =>
        s.id === schemeId
          ? {
              ...s,
              groups: groupIds.map((id, index) => {
                const group = s.groups.find((g) => g.id === id);
                return group ? { ...group, order: index } : group!;
              }),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    saveGallerySchemes(get().gallerySchemes);
  },

  updateProgressStep: (projectId, stepId, updates) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                steps: p.progress.steps.map((s) =>
                  s.id === stepId ? { ...s, ...updates } : s
                ),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    get().recalculateProgress(projectId);
    saveCuratorProjects(get().curatorProjects);
  },

  setProgressStepStatus: (projectId, stepId, status) => {
    const updates: Partial<ProgressStep> = { status };
    if (status === 'completed') {
      updates.completedAt = Date.now();
    } else {
      updates.completedAt = undefined;
    }
    get().updateProgressStep(projectId, stepId, updates);
  },

  addProgressStep: (projectId, step) => {
    const newStep: ProgressStep = {
      ...step,
      id: `step-${Date.now()}`,
    };

    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                steps: [...p.progress.steps, newStep],
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    get().recalculateProgress(projectId);
    saveCuratorProjects(get().curatorProjects);
  },

  removeProgressStep: (projectId, stepId) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                steps: p.progress.steps.filter((s) => s.id !== stepId),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    get().recalculateProgress(projectId);
    saveCuratorProjects(get().curatorProjects);
  },

  reorderProgressSteps: (projectId, stepIds) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                steps: stepIds.map((id, index) => {
                  const step = p.progress.steps.find((s) => s.id === id);
                  return step ? { ...step, order: index } : step!;
                }),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  recalculateProgress: (projectId) => {
    const project = get().curatorProjects.find((p) => p.id === projectId);
    if (!project || project.progress.steps.length === 0) return;

    const completedSteps = project.progress.steps.filter(
      (s) => s.status === 'completed'
    ).length;
    const overallProgress = Math.round((completedSteps / project.progress.steps.length) * 100);

    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                overallProgress,
              },
              status:
                overallProgress === 100
                  ? 'completed'
                  : overallProgress > 0
                    ? 'in_progress'
                    : p.status,
            }
          : p
      ),
    }));
  },

  addVersionComment: (projectId, versionId, author, content) => {
    const comment: VersionComment = {
      id: `comment-${Date.now()}`,
      versionId,
      author,
      content,
      createdAt: Date.now(),
    };

    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              versionComments: [...p.versionComments, comment],
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  deleteVersionComment: (projectId, commentId) => {
    set((state) => ({
      curatorProjects: state.curatorProjects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              versionComments: p.versionComments.filter((c) => c.id !== commentId),
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveCuratorProjects(get().curatorProjects);
  },

  compareVersions: (projectId, versionId1, versionId2) => {
    const project = get().curatorProjects.find((p) => p.id === projectId);
    if (!project) return null;

    const version1 = project.versions.find((v) => v.id === versionId1);
    const version2 = project.versions.find((v) => v.id === versionId2);
    if (!version1 || !version2) return null;

    const differences: string[] = [];

    if (version1.scheme.wallArtworks.length !== version2.scheme.wallArtworks.length) {
      differences.push(
        `作品数量: ${version1.scheme.wallArtworks.length} → ${version2.scheme.wallArtworks.length}`
      );
    }

    if (version1.scheme.lightingStrategy.mode !== version2.scheme.lightingStrategy.mode) {
      differences.push(
        `灯光策略: ${version1.scheme.lightingStrategy.mode} → ${version2.scheme.lightingStrategy.mode}`
      );
    }

    if (version1.scheme.wallMaterial !== version2.scheme.wallMaterial) {
      differences.push(
        `墙面材质: ${version1.scheme.wallMaterial} → ${version2.scheme.wallMaterial}`
      );
    }

    const artworkIds1 = new Set(version1.scheme.wallArtworks.map((w) => w.artworkId));
    const artworkIds2 = new Set(version2.scheme.wallArtworks.map((w) => w.artworkId));

    const added = [...artworkIds2].filter((id) => !artworkIds1.has(id));
    const removed = [...artworkIds1].filter((id) => !artworkIds2.has(id));

    if (added.length > 0) {
      differences.push(`新增作品: ${added.length} 件`);
    }
    if (removed.length > 0) {
      differences.push(`移除作品: ${removed.length} 件`);
    }

    return { version1, version2, differences };
  },

  exportProjectPreview: async (projectId, config) => {
    const { curatorProjects, gallerySchemes, artworks } = get();
    const project = curatorProjects.find((p) => p.id === projectId);
    if (!project) return;

    const projectSchemes = gallerySchemes.filter((s) => project.schemeIds.includes(s.id));

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    if (config.format === 'json') {
      const exportData = {
        project: {
          name: project.name,
          description: project.description,
          status: project.status,
          tags: project.tags,
          progress: project.progress.overallProgress,
        },
        schemes: projectSchemes.map((scheme) => ({
          name: scheme.name,
          description: scheme.description,
          wallMaterial: scheme.wallMaterial,
          lightingStrategy: scheme.lightingStrategy,
          groups: config.includeArtworkInfo ? scheme.groups : undefined,
          artworks: config.includeArtworkInfo
            ? scheme.wallArtworks.map((wa) => {
                const artwork = artworks.find((a) => a.id === wa.artworkId);
                return {
                  title: artwork?.title,
                  artist: artwork?.artist,
                  year: artwork?.year,
                  medium: artwork?.medium,
                  position: wa.position,
                  lighting: config.includeLightingSpec ? wa.lighting : undefined,
                  material: config.includeLightingSpec ? wa.material : undefined,
                };
              })
            : scheme.wallArtworks.length,
        })),
        versions: project.versions.map((v) => ({
          name: v.name,
          description: v.description,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
        })),
        exportTime: Date.now(),
        resolution: config.resolution,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_preview.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (config.format === 'image') {
      const { width, height } = EXPORT_RESOLUTION_PIXELS[config.resolution];
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = width / 1920;
      const padding = 40 * scale;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
      ctx.fillRect(0, 0, width, 120 * scale);

      ctx.fillStyle = '#d4af37';
      ctx.font = `bold ${36 * scale}px "Noto Serif SC", serif`;
      ctx.textAlign = 'left';
      ctx.fillText(project.name, padding, 70 * scale);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = `${18 * scale}px "Inter", sans-serif`;
      ctx.fillText(
        `${formatDate(project.createdAt)} · ${project.status === 'completed' ? '已完成' : project.status === 'in_progress' ? '进行中' : project.status === 'draft' ? '草稿' : '已归档'}`,
        padding,
        100 * scale
      );

      if (project.description && config.includeMetadata) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `${16 * scale}px "Inter", sans-serif`;
        ctx.fillText(project.description, padding, 140 * scale);
      }

      const statsY = 180 * scale;
      const statWidth = (width - padding * 2 - 40 * scale * 2) / 3;

      const stats = [
        { label: '方案', value: projectSchemes.length.toString(), color: '#d4af37' },
        { label: '作品', value: projectSchemes.reduce((sum, s) => sum + s.wallArtworks.length, 0).toString(), color: '#60a5fa' },
        { label: '进度', value: `${project.progress.overallProgress}%`, color: '#4ade80' },
      ];

      stats.forEach((stat, i) => {
        const x = padding + i * (statWidth + 40 * scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(x, statsY, statWidth, 100 * scale, 12 * scale);
        ctx.fill();

        ctx.fillStyle = stat.color;
        ctx.font = `bold ${40 * scale}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(stat.value, x + statWidth / 2, statsY + 55 * scale);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = `${14 * scale}px "Inter", sans-serif`;
        ctx.fillText(stat.label, x + statWidth / 2, statsY + 80 * scale);
      });

      if (config.includeArtworkInfo && projectSchemes.length > 0) {
        let currentY = 320 * scale;
        const schemeCardHeight = 200 * scale;
        const artworkSize = 80 * scale;
        const artworkGap = 10 * scale;

        for (let sIdx = 0; sIdx < Math.min(projectSchemes.length, 3); sIdx++) {
          const scheme = projectSchemes[sIdx];
          const cardX = padding;
          const cardWidth = width - padding * 2;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.beginPath();
          ctx.roundRect(cardX, currentY, cardWidth, schemeCardHeight, 16 * scale);
          ctx.fill();

          ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.roundRect(cardX, currentY, cardWidth, schemeCardHeight, 16 * scale);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${22 * scale}px "Inter", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(scheme.name, cardX + 24 * scale, currentY + 45 * scale);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = `${14 * scale}px "Inter", sans-serif`;
          ctx.fillText(`${scheme.wallArtworks.length} 件作品`, cardX + 24 * scale, currentY + 70 * scale);

          if (scheme.groups.length > 0) {
            let groupX = cardX + 24 * scale;
            scheme.groups.slice(0, 4).forEach((group) => {
              ctx.fillStyle = group.color + '40';
              ctx.beginPath();
              ctx.roundRect(groupX, currentY + 85 * scale, 100 * scale, 28 * scale, 14 * scale);
              ctx.fill();

              ctx.fillStyle = group.color;
              ctx.font = `${12 * scale}px "Inter", sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(`${group.name} (${group.artworkIds.length})`, groupX + 50 * scale, currentY + 103 * scale);
              groupX += 110 * scale;
            });
          }

          const artworksStartX = cardX + 24 * scale;
          const artworksStartY = currentY + 125 * scale;
          const maxArtworks = Math.min(scheme.wallArtworks.length, 8);

          for (let i = 0; i < maxArtworks; i++) {
            const wa = scheme.wallArtworks[i];
            const artwork = artworks.find((a) => a.id === wa.artworkId);
            const ax = artworksStartX + i * (artworkSize + artworkGap);
            const ay = artworksStartY;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.roundRect(ax, ay, artworkSize, artworkSize, 8 * scale);
            ctx.fill();

            if (artwork?.imageUrl) {
              try {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.src = artwork.imageUrl;
                if (img.complete && img.naturalWidth > 0) {
                  ctx.save();
                  ctx.beginPath();
                  ctx.roundRect(ax, ay, artworkSize, artworkSize, 8 * scale);
                  ctx.clip();
                  ctx.drawImage(img, ax, ay, artworkSize, artworkSize);
                  ctx.restore();
                }
              } catch (e) {
              }
            }
          }

          if (scheme.wallArtworks.length > 8) {
            const moreX = artworksStartX + 8 * (artworkSize + artworkGap);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(moreX, artworksStartY, artworkSize, artworkSize, 8 * scale);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = `${16 * scale}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`+${scheme.wallArtworks.length - 8}`, moreX + artworkSize / 2, artworksStartY + artworkSize / 2 + 6 * scale);
          }

          currentY += schemeCardHeight + 20 * scale;
        }
      }

      if (config.watermark) {
        ctx.save();
        ctx.translate(width / 2, height - 60 * scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `${14 * scale}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(config.watermark, 0, 0);
        ctx.restore();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = `${12 * scale}px "Inter", sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`Lumina Curator · ${formatDate(Date.now())}`, width - padding, height - padding);

      const loadImages = async () => {
        const images: HTMLImageElement[] = [];
        for (const scheme of projectSchemes.slice(0, 3)) {
          for (const wa of scheme.wallArtworks.slice(0, 8)) {
            const artwork = artworks.find((a) => a.id === wa.artworkId);
            if (artwork?.imageUrl) {
              const img = new window.Image();
              img.crossOrigin = 'anonymous';
              img.src = artwork.imageUrl;
              images.push(img);
            }
          }
        }
        await Promise.all(images.map(img => new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })));
        return images;
      };

      const images = await loadImages();

      let imgIdx = 0;
      let currentY = 320 * scale;
      const schemeCardHeight = 200 * scale;
      const artworkSize = 80 * scale;
      const artworkGap = 10 * scale;

      for (let sIdx = 0; sIdx < Math.min(projectSchemes.length, 3); sIdx++) {
        const scheme = projectSchemes[sIdx];
        const cardX = padding;
        const artworksStartX = cardX + 24 * scale;
        const artworksStartY = currentY + 125 * scale;
        const maxArtworks = Math.min(scheme.wallArtworks.length, 8);

        for (let i = 0; i < maxArtworks && imgIdx < images.length; i++) {
          const img = images[imgIdx];
          if (img.complete && img.naturalWidth > 0) {
            const ax = artworksStartX + i * (artworkSize + artworkGap);
            const ay = artworksStartY;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(ax, ay, artworkSize, artworkSize, 8 * scale);
            ctx.clip();
            ctx.drawImage(img, ax, ay, artworkSize, artworkSize);
            ctx.restore();
          }
          imgIdx++;
        }
        currentY += schemeCardHeight + 20 * scale;
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}_preview.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } else {
      alert(`${EXPORT_FORMAT_LABELS[config.format]} 格式导出功能正在开发中，当前支持 JSON 和图片格式`);
    }
  },

  createProposal: (projectId, schemeId, title) => {
    const { gallerySchemes, artworks, proposals } = get();
    const scheme = gallerySchemes.find((s) => s.id === schemeId);
    if (!scheme) return undefined as unknown as CustomerProposal;

    const generateLightingDescription = (lighting: LightingConfig) => {
      const typeLabel = LIGHT_TYPE_LABELS[lighting.type];
      const intensity = Math.round(lighting.intensity * 100);
      return `采用${typeLabel}，色温 ${lighting.colorTemperature}K，亮度 ${intensity}%，光束角度 ${lighting.angle}°。此配置能够突出作品的质感，营造专业的展览氛围。`;
    };

    const generateMaterialDescription = (material: MaterialConfig) => {
      const frameLabel = FRAME_MATERIAL_LABELS[material.frameMaterial];
      const wallLabel = WALL_MATERIAL_LABELS[material.wallMaterial];
      return `搭配${frameLabel}画框与${wallLabel}墙面，反射率 ${Math.round(material.reflectivity * 100)}%，粗糙度 ${Math.round(material.roughness * 100)}%，完美平衡作品的视觉呈现与空间的整体协调。`;
    };

    const artworkSections: ProposalArtworkSection[] = scheme.wallArtworks.map((wa) => {
      const artwork = artworks.find((a) => a.id === wa.artworkId);
      if (!artwork) return null;

      return {
        artworkId: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        medium: artwork.medium,
        description: artwork.description || `这件${artwork.medium}作品展现了艺术家独特的创作视角和艺术风格。`,
        imageUrl: artwork.imageUrl,
        lightingDescription: generateLightingDescription(wa.lighting),
        materialDescription: generateMaterialDescription(wa.material),
        curatorNote: `这件作品在展览中占据重要位置，通过精心设计的灯光和材质搭配，将其艺术价值最大化呈现。`,
      };
    }).filter(Boolean) as ProposalArtworkSection[];

    const avgColorTemp = Math.round(
      scheme.wallArtworks.reduce((sum, wa) => sum + wa.lighting.colorTemperature, 0) /
      (scheme.wallArtworks.length || 1)
    );
    const avgIntensity = Math.round(
      (scheme.wallArtworks.reduce((sum, wa) => sum + wa.lighting.intensity, 0) /
        (scheme.wallArtworks.length || 1)) * 100
    );

    const newProposal: CustomerProposal = {
      id: `proposal-${Date.now()}`,
      projectId,
      schemeId,
      title,
      subtitle: '专业展览方案建议书',
      introduction: `尊敬的客户，感谢您对我们策展方案的关注。本提案基于您的需求，为您精心设计了一套完整的展览呈现方案。我们从作品特点出发，结合空间美学与灯光艺术，为每件作品量身定制最佳展示效果，力求将艺术价值完美呈现。`,
      artworks: artworkSections,
      lightingSection: {
        title: '灯光设计理念',
        description: '我们采用分层照明设计理念，结合重点照明与环境照明，为每件作品营造独特的视觉体验。灯光设计充分考虑作品材质、色彩与展示空间的关系，确保最佳观赏效果。',
        specifications: [
          { label: '平均色温', value: `${avgColorTemp}K` },
          { label: '平均亮度', value: `${avgIntensity}%` },
          { label: '灯光策略', value: scheme.lightingStrategy.mode === 'uniform' ? '统一灯光' : scheme.lightingStrategy.mode === 'individual' ? '独立灯光' : '分区灯光' },
          { label: '作品数量', value: `${scheme.wallArtworks.length} 件` },
        ],
      },
      materialSection: {
        title: '材质与装裱建议',
        description: '材质选择是展览呈现的重要环节。我们根据作品风格、尺寸和展示环境，为您推荐最适合的画框材质和墙面处理方式，确保每件作品都能得到完美衬托。',
        frameRecommendation: {
          material: scheme.wallMaterial === 'concrete' ? 'metal' : scheme.wallMaterial === 'glossy' ? 'gold' : 'wood',
          reason: scheme.wallMaterial === 'concrete'
            ? '金属画框与水泥墙面形成现代感对话，突显当代艺术气质'
            : scheme.wallMaterial === 'glossy'
            ? '金色画框与高光墙面相得益彰，营造奢华典雅氛围'
            : '木质画框温润质朴，与哑光墙面完美融合，展现经典美学',
        },
        wallRecommendation: {
          material: scheme.wallMaterial,
          reason: `${WALL_MATERIAL_LABELS[scheme.wallMaterial]}墙面能够最大程度衬托作品的色彩和质感，同时保持空间的整体协调性。`,
        },
      },
      conclusion: '我们相信，通过专业的灯光设计、精心的材质选择和合理的空间布局，本次展览将为观众带来一场难忘的艺术盛宴。期待与您进一步沟通，共同完善这一方案。',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newProposals = [...proposals, newProposal];
    set({ proposals: newProposals, currentProposalId: newProposal.id });
    saveProposals(newProposals);
    saveCurrentProposalId(newProposal.id);
    return newProposal;
  },

  updateProposal: (proposalId, updates) => {
    const { proposals } = get();
    const newProposals = proposals.map((p) =>
      p.id === proposalId ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    set({ proposals: newProposals });
    saveProposals(newProposals);
  },

  deleteProposal: (proposalId) => {
    const { proposals, currentProposalId } = get();
    const newProposals = proposals.filter((p) => p.id !== proposalId);
    const newCurrentId = currentProposalId === proposalId
      ? (newProposals[0]?.id || null)
      : currentProposalId;
    set({ proposals: newProposals, currentProposalId: newCurrentId });
    saveProposals(newProposals);
    if (newCurrentId) saveCurrentProposalId(newCurrentId);
  },

  setCurrentProposal: (proposalId) => {
    set({ currentProposalId: proposalId });
    if (proposalId) saveCurrentProposalId(proposalId);
  },

  generateProposalShareLink: (proposalId, expiresInDays = 7) => {
    const { proposals } = get();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return '';

    const shareToken = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

    const updatedProposal = {
      ...proposal,
      shareToken,
      shareExpiresAt: expiresAt,
      updatedAt: Date.now(),
    };

    const newProposals = proposals.map((p) =>
      p.id === proposalId ? updatedProposal : p
    );
    set({ proposals: newProposals });
    saveProposals(newProposals);

    return generateFullShareLink(updatedProposal);
  },

  exportProposal: (proposalId) => {
    const { proposals } = get();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;
    exportProposalUtil(proposal);
  },

  parseShareLink: (encoded) => {
    return parseShareData(encoded);
  },

  regenerateProposalArtworkDescription: (proposalId, artworkId) => {
    const { proposals, artworks } = get();
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) return;

    const newArtworks = proposal.artworks.map((aw) => {
      if (aw.artworkId === artworkId) {
        return {
          ...aw,
          curatorNote: `这件${artwork.medium}作品展现了${artwork.artist}在${artwork.year}年的创作巅峰。我们通过精心设计的呈现方式，将作品的艺术内涵和视觉冲击力最大化。`,
          description: artwork.description || aw.description,
        };
      }
      return aw;
    });

    const updatedProposal = {
      ...proposal,
      artworks: newArtworks,
      updatedAt: Date.now(),
    };

    const newProposals = proposals.map((p) =>
      p.id === proposalId ? updatedProposal : p
    );
    set({ proposals: newProposals });
    saveProposals(newProposals);
  },

  setWorkstationTab: (tab) => set({ workstationTab: tab }),

  setIngestionSearchQuery: (query) => set({ ingestionSearchQuery: query }),

  setIngestionStatus: (status) => set({ ingestionStatus: status }),

  addArtworkTag: (tag) => {
    const newTag: ArtworkTag = {
      ...tag,
      id: `tag-${Date.now()}`,
    };
    set((state) => ({ artworkTags: [...state.artworkTags, newTag] }));
  },

  updateArtworkTag: (tagId, updates) => {
    set((state) => ({
      artworkTags: state.artworkTags.map((t) =>
        t.id === tagId ? { ...t, ...updates } : t
      ),
    }));
  },

  removeArtworkTag: (tagId) => {
    set((state) => ({
      artworkTags: state.artworkTags.filter((t) => t.id !== tagId),
      artworks: state.artworks.map((artwork) => ({
        ...artwork,
        tagIds: artwork.tagIds.filter((id) => id !== tagId),
        updatedAt: Date.now(),
      })),
    }));
  },

  addArtworkWithTags: (artwork) => {
    const now = Date.now();
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ artworks: [...state.artworks, newArtwork] }));
  },

  updateArtworkWithTags: (artworkId, updates) => {
    set((state) => ({
      artworks: state.artworks.map((a) =>
        a.id === artworkId
          ? { ...a, ...updates, updatedAt: Date.now() }
          : a
      ),
    }));
  },

  validateIngestionForm: (formData) => {
    const errors: IngestionValidationError[] = [];

    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: '请输入作品标题' });
    } else if (formData.title.length > 100) {
      errors.push({ field: 'title', message: '标题不能超过100个字符' });
    }

    if (!formData.artist.trim()) {
      errors.push({ field: 'artist', message: '请输入艺术家名称' });
    }

    const year = Number(formData.year);
    if (!formData.year) {
      errors.push({ field: 'year', message: '请输入创作年份' });
    } else if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      errors.push({ field: 'year', message: '请输入有效的年份' });
    }

    const width = Number(formData.width);
    if (!formData.width) {
      errors.push({ field: 'width', message: '请输入作品宽度' });
    } else if (isNaN(width) || width <= 0 || width > 1000) {
      errors.push({ field: 'width', message: '宽度必须在0-1000cm之间' });
    }

    const height = Number(formData.height);
    if (!formData.height) {
      errors.push({ field: 'height', message: '请输入作品高度' });
    } else if (isNaN(height) || height <= 0 || height > 1000) {
      errors.push({ field: 'height', message: '高度必须在0-1000cm之间' });
    }

    if (formData.depth) {
      const depth = Number(formData.depth);
      if (isNaN(depth) || depth <= 0 || depth > 500) {
        errors.push({ field: 'depth', message: '深度必须在0-500cm之间' });
      }
    }

    if (!formData.medium.trim()) {
      errors.push({ field: 'medium', message: '请输入创作媒介' });
    }

    if (!formData.imageUrl && !formData.imageFile) {
      errors.push({ field: 'imageUrl', message: '请上传作品图片或输入图片URL' });
    }

    return errors;
  },

  submitIngestion: async (formData) => {
    const { validateIngestionForm, addArtworkWithTags } = get();

    const errors = validateIngestionForm(formData);
    if (errors.length > 0) {
      set({ ingestionStatus: 'error' });
      return null;
    }

    set({ ingestionStatus: 'uploading' });

    await new Promise((resolve) => setTimeout(resolve, 500));

    set({ ingestionStatus: 'validating' });

    await new Promise((resolve) => setTimeout(resolve, 300));

    let imageUrl = formData.imageUrl;

    if (formData.imageFile) {
      imageUrl = URL.createObjectURL(formData.imageFile);
    }

    const newArtwork = {
      title: formData.title.trim(),
      artist: formData.artist.trim(),
      year: Number(formData.year),
      width: Number(formData.width),
      height: Number(formData.height),
      depth: formData.depth ? Number(formData.depth) : undefined,
      medium: formData.medium.trim(),
      description: formData.description.trim(),
      imageUrl,
      tagIds: formData.tagIds,
    };

    addArtworkWithTags(newArtwork);

    set({ ingestionStatus: 'completed' });

    const { artworks } = get();
    return artworks[artworks.length - 1];
  },

  getFilteredArtworks: () => {
    const { artworks, ingestionSearchQuery, artworkTags } = get();

    if (!ingestionSearchQuery.trim()) {
      return artworks;
    }

    const query = ingestionSearchQuery.toLowerCase();

    return artworks.filter((artwork) => {
      const matchesTitle = artwork.title.toLowerCase().includes(query);
      const matchesArtist = artwork.artist.toLowerCase().includes(query);
      const matchesMedium = artwork.medium.toLowerCase().includes(query);
      const matchesYear = artwork.year.toString().includes(query);

      const artworkTagNames = artwork.tagIds
        .map((tagId) => {
          const tag = artworkTags.find((t) => t.id === tagId);
          return tag?.name.toLowerCase() || '';
        })
        .filter(Boolean);
      const matchesTag = artworkTagNames.some((name) => name.includes(query));

      return matchesTitle || matchesArtist || matchesMedium || matchesYear || matchesTag;
    });
  },

  getArtworksByTagId: (tagId) => {
    const { artworks } = get();
    return artworks.filter((artwork) => artwork.tagIds.includes(tagId));
  },

  filterArtworks: (query) => {
    const { artworks, artworkTags } = get();

    if (!query.trim()) {
      return artworks;
    }

    const lowerQuery = query.toLowerCase();

    return artworks.filter((artwork) => {
      const matchesTitle = artwork.title.toLowerCase().includes(lowerQuery);
      const matchesArtist = artwork.artist.toLowerCase().includes(lowerQuery);
      const matchesMedium = artwork.medium.toLowerCase().includes(lowerQuery);
      const matchesYear = artwork.year.toString().includes(lowerQuery);

      const artworkTagNames = artwork.tagIds
        .map((tagId) => {
          const tag = artworkTags.find((t) => t.id === tagId);
          return tag?.name.toLowerCase() || '';
        })
        .filter(Boolean);
      const matchesTag = artworkTagNames.some((name) => name.includes(lowerQuery));

      return matchesTitle || matchesArtist || matchesMedium || matchesYear || matchesTag;
    });
  },
}));
