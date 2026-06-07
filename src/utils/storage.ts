import type {
  Preset,
  PresetGroup,
  LightingConfig,
  MaterialConfig,
  GalleryScheme,
  CuratorProject,
  CustomerProposal,
  ExhibitionWallConfig,
  LightingTemplate,
  MaterialCombo,
  SceneRecommendation,
  ThemeCollection,
  LightingPreset,
  LightingHistoryEntry,
} from '../types';

const PRESETS_KEY = 'artwork_preview_presets';
const PRESET_GROUPS_KEY = 'artwork_preview_preset_groups';
const LAST_ARTWORK_KEY = 'artwork_preview_last_artwork';
const LAST_LIGHTING_KEY = 'artwork_preview_last_lighting';
const LAST_MATERIAL_KEY = 'artwork_preview_last_material';
const PRESET_RECENTLY_USED_KEY = 'artwork_preview_preset_recently_used';
const GALLERY_SCHEMES_KEY = 'artwork_preview_gallery_schemes';
const CURRENT_SCHEME_KEY = 'artwork_preview_current_scheme';
const APP_MODE_KEY = 'artwork_preview_app_mode';
const CURATOR_PROJECTS_KEY = 'artwork_preview_curator_projects';
const CURRENT_PROJECT_KEY = 'artwork_preview_current_project';
const PROPOSALS_KEY = 'artwork_preview_proposals';
const CURRENT_PROPOSAL_KEY = 'artwork_preview_current_proposal';
const EXHIBITION_WALL_CONFIG_KEY = 'artwork_preview_exhibition_wall_config';
const LIGHTING_TEMPLATES_KEY = 'artwork_preview_lighting_templates';
const MATERIAL_COMBOS_KEY = 'artwork_preview_material_combos';
const SCENE_RECOMMENDATIONS_KEY = 'artwork_preview_scene_recommendations';
const THEME_COLLECTIONS_KEY = 'artwork_preview_theme_collections';
const LIGHTING_PRESETS_KEY = 'artwork_preview_lighting_presets';
const LIGHTING_HISTORY_KEY = 'artwork_preview_lighting_history';

export interface ProjectExportData {
  project: CuratorProject;
  schemes: GalleryScheme[];
  exportTime: number;
  version: string;
}

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

export function savePresetGroups(groups: PresetGroup[]): void {
  try {
    localStorage.setItem(PRESET_GROUPS_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save preset groups:', e);
  }
}

export function loadPresetGroups(): PresetGroup[] {
  try {
    const data = localStorage.getItem(PRESET_GROUPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load preset groups:', e);
    return [];
  }
}

export function saveRecentlyUsedPresetIds(ids: string[]): void {
  try {
    localStorage.setItem(PRESET_RECENTLY_USED_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save recently used presets:', e);
  }
}

export function loadRecentlyUsedPresetIds(): string[] {
  try {
    const data = localStorage.getItem(PRESET_RECENTLY_USED_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load recently used presets:', e);
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

export function saveGallerySchemes(schemes: GalleryScheme[]): void {
  try {
    localStorage.setItem(GALLERY_SCHEMES_KEY, JSON.stringify(schemes));
  } catch (e) {
    console.error('Failed to save gallery schemes:', e);
  }
}

export function loadGallerySchemes(): GalleryScheme[] {
  try {
    const data = localStorage.getItem(GALLERY_SCHEMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load gallery schemes:', e);
    return [];
  }
}

export function saveCurrentSchemeId(schemeId: string): void {
  try {
    localStorage.setItem(CURRENT_SCHEME_KEY, schemeId);
  } catch (e) {
    console.error('Failed to save current scheme:', e);
  }
}

export function loadCurrentSchemeId(): string | null {
  try {
    return localStorage.getItem(CURRENT_SCHEME_KEY);
  } catch (e) {
    console.error('Failed to load current scheme:', e);
    return null;
  }
}

export function exportScheme(scheme: GalleryScheme): void {
  const blob = new Blob([JSON.stringify(scheme, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scheme.name.replace(/\s+/g, '_')}_${scheme.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importScheme(file: File): Promise<GalleryScheme> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scheme = JSON.parse(e.target?.result as string);
        resolve(scheme);
      } catch (err) {
        reject(new Error('Invalid scheme file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function saveAppMode(mode: string): void {
  try {
    localStorage.setItem(APP_MODE_KEY, mode);
  } catch (e) {
    console.error('Failed to save app mode:', e);
  }
}

export function loadAppMode(): string | null {
  try {
    return localStorage.getItem(APP_MODE_KEY);
  } catch (e) {
    console.error('Failed to load app mode:', e);
    return null;
  }
}

export function saveCuratorProjects(projects: CuratorProject[]): void {
  try {
    localStorage.setItem(CURATOR_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save curator projects:', e);
  }
}

export function loadCuratorProjects(): CuratorProject[] {
  try {
    const data = localStorage.getItem(CURATOR_PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load curator projects:', e);
    return [];
  }
}

export function saveCurrentProjectId(projectId: string): void {
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId);
  } catch (e) {
    console.error('Failed to save current project:', e);
  }
}

export function loadCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROJECT_KEY);
  } catch (e) {
    console.error('Failed to load current project:', e);
    return null;
  }
}

export function exportProject(data: ProjectExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.project.name.replace(/\s+/g, '_')}_${data.project.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProject(file: File): Promise<ProjectExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.project && data.schemes && Array.isArray(data.schemes)) {
          resolve(data as ProjectExportData);
        } else if (data.id && data.schemeIds) {
          resolve({
            project: data,
            schemes: [],
            exportTime: Date.now(),
            version: '1.0',
          });
        } else {
          reject(new Error('Invalid project file format'));
        }
      } catch (err) {
        reject(new Error('Invalid project file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function saveProposals(proposals: CustomerProposal[]): void {
  try {
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  } catch (e) {
    console.error('Failed to save proposals:', e);
  }
}

export function loadProposals(): CustomerProposal[] {
  try {
    const data = localStorage.getItem(PROPOSALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load proposals:', e);
    return [];
  }
}

export function saveCurrentProposalId(proposalId: string): void {
  try {
    localStorage.setItem(CURRENT_PROPOSAL_KEY, proposalId);
  } catch (e) {
    console.error('Failed to save current proposal:', e);
  }
}

export function loadCurrentProposalId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROPOSAL_KEY);
  } catch (e) {
    console.error('Failed to load current proposal:', e);
    return null;
  }
}

export function exportProposal(proposal: CustomerProposal): void {
  const blob = new Blob([JSON.stringify(proposal, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proposal.title.replace(/\s+/g, '_')}_${proposal.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateShareLink(proposal: CustomerProposal): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareData = btoa(JSON.stringify({
    proposalId: proposal.id,
    token: proposal.shareToken,
  }));
  return `${baseUrl}?share=${shareData}`;
}

export function generateFullShareLink(proposal: CustomerProposal): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const shareData = {
    v: 1,
    d: proposal,
    exp: proposal.shareExpiresAt,
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareData))));
  return `${baseUrl}?share=${encoded}`;
}

export function parseShareData(encoded: string): {
  isFullData: boolean;
  proposal?: CustomerProposal;
  proposalId?: string;
  token?: string;
  expiresAt?: number;
} | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(decoded);
    
    if (data.v === 1 && data.d) {
      return {
        isFullData: true,
        proposal: data.d,
        expiresAt: data.exp,
      };
    }
    return {
      isFullData: false,
      proposalId: data.proposalId,
      token: data.token,
    };
  } catch (e) {
    try {
      const decoded = atob(encoded);
      const data = JSON.parse(decoded);
      return {
        isFullData: false,
        proposalId: data.proposalId,
        token: data.token,
      };
    } catch (err) {
      return null;
    }
  }
}

export function saveExhibitionWallConfig(config: ExhibitionWallConfig): void {
  try {
    localStorage.setItem(EXHIBITION_WALL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save exhibition wall config:', e);
  }
}

export function loadExhibitionWallConfig(): ExhibitionWallConfig | null {
  try {
    const data = localStorage.getItem(EXHIBITION_WALL_CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load exhibition wall config:', e);
    return null;
  }
}

export function saveLightingTemplates(templates: LightingTemplate[]): void {
  try {
    localStorage.setItem(LIGHTING_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save lighting templates:', e);
  }
}

export function loadLightingTemplates(): LightingTemplate[] {
  try {
    const data = localStorage.getItem(LIGHTING_TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load lighting templates:', e);
    return [];
  }
}

export function saveMaterialCombos(combos: MaterialCombo[]): void {
  try {
    localStorage.setItem(MATERIAL_COMBOS_KEY, JSON.stringify(combos));
  } catch (e) {
    console.error('Failed to save material combos:', e);
  }
}

export function loadMaterialCombos(): MaterialCombo[] {
  try {
    const data = localStorage.getItem(MATERIAL_COMBOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load material combos:', e);
    return [];
  }
}

export function saveSceneRecommendations(recommendations: SceneRecommendation[]): void {
  try {
    localStorage.setItem(SCENE_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
  } catch (e) {
    console.error('Failed to save scene recommendations:', e);
  }
}

export function loadSceneRecommendations(): SceneRecommendation[] {
  try {
    const data = localStorage.getItem(SCENE_RECOMMENDATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load scene recommendations:', e);
    return [];
  }
}

export function saveThemeCollections(collections: ThemeCollection[]): void {
  try {
    localStorage.setItem(THEME_COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (e) {
    console.error('Failed to save theme collections:', e);
  }
}

export function loadThemeCollections(): ThemeCollection[] {
  try {
    const data = localStorage.getItem(THEME_COLLECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load theme collections:', e);
    return [];
  }
}

export function exportLightingTemplate(template: LightingTemplate): void {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lighting_${template.name.replace(/\s+/g, '_')}_${template.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMaterialCombo(combo: MaterialCombo): void {
  const blob = new Blob([JSON.stringify(combo, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `material_${combo.name.replace(/\s+/g, '_')}_${combo.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportThemeCollection(collection: ThemeCollection): void {
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `theme_${collection.name.replace(/\s+/g, '_')}_${collection.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function saveLightingPresets(presets: LightingPreset[]): void {
  try {
    localStorage.setItem(LIGHTING_PRESETS_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save lighting presets:', e);
  }
}

export function loadLightingPresets(): LightingPreset[] {
  try {
    const data = localStorage.getItem(LIGHTING_PRESETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load lighting presets:', e);
    return [];
  }
}

export function saveLightingHistory(history: LightingHistoryEntry[]): void {
  try {
    localStorage.setItem(LIGHTING_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save lighting history:', e);
  }
}

export function loadLightingHistory(): LightingHistoryEntry[] {
  try {
    const data = localStorage.getItem(LIGHTING_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load lighting history:', e);
    return [];
  }
}
