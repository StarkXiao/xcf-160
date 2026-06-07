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
  StorageMetadata,
  StorageBackup,
  BackupInfo,
  StorageConflict,
  ConflictResolutionStrategy,
  StorageValidationError,
  StorageValidationResult,
  ImportValidationResult,
  ImportResult,
  DataMigrationStep,
  DataMigrationResult,
  AutoRecoveryResult,
  StorageSnapshot,
  StorageHealthStatus,
  StorageConfig,
  ExportOptions,
  ExportScope,
} from '../types';
import {
  STORAGE_VERSION,
  STORAGE_SCHEMA_VERSION,
  DEFAULT_STORAGE_CONFIG,
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
      } catch {
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
      } catch {
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
      } catch {
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
  } catch {
    try {
      const decoded = atob(encoded);
      const data = JSON.parse(decoded);
      return {
        isFullData: false,
        proposalId: data.proposalId,
        token: data.token,
      };
    } catch {
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

const STORAGE_METADATA_KEY = 'artwork_preview_storage_metadata';
const STORAGE_BACKUPS_KEY = 'artwork_preview_storage_backups';
const STORAGE_SNAPSHOTS_KEY = 'artwork_preview_storage_snapshots';
const STORAGE_CONFIG_KEY = 'artwork_preview_storage_config';

const STORAGE_KEYS = {
  presets: PRESETS_KEY,
  presetGroups: PRESET_GROUPS_KEY,
  gallerySchemes: GALLERY_SCHEMES_KEY,
  curatorProjects: CURATOR_PROJECTS_KEY,
  proposals: PROPOSALS_KEY,
  lightingTemplates: LIGHTING_TEMPLATES_KEY,
  materialCombos: MATERIAL_COMBOS_KEY,
  sceneRecommendations: SCENE_RECOMMENDATIONS_KEY,
  themeCollections: THEME_COLLECTIONS_KEY,
  lightingPresets: LIGHTING_PRESETS_KEY,
  lightingHistory: LIGHTING_HISTORY_KEY,
  exhibitionWallConfig: EXHIBITION_WALL_CONFIG_KEY,
} as const;

function generateChecksum(data: unknown): string {
  const json = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDataSize(data: unknown): number {
  return new Blob([JSON.stringify(data)]).size;
}

function getCurrentStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total;
}

function countStorageItems(): number {
  let count = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          count += parsed.length;
        } else if (parsed && typeof parsed === 'object') {
          count += 1;
        }
      }
    } catch {
      console.error('Failed to parse storage item');
    }
  });
  return count;
}

export function getStorageConfig(): StorageConfig {
  try {
    const data = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (data) {
      return { ...DEFAULT_STORAGE_CONFIG, ...JSON.parse(data) };
    }
  } catch {
    console.error('Failed to load storage config, using default');
  }
  return { ...DEFAULT_STORAGE_CONFIG };
}

export function saveStorageConfig(config: Partial<StorageConfig>): void {
  try {
    const current = getStorageConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save storage config:', e);
  }
}

export function getStorageMetadata(): StorageMetadata | null {
  try {
    const data = localStorage.getItem(STORAGE_METADATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load storage metadata:', e);
    return null;
  }
}

export function updateStorageMetadata(updates?: Partial<StorageMetadata>): StorageMetadata {
  const now = Date.now();
  const existing = getStorageMetadata();
  const metadata: StorageMetadata = {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    appVersion: STORAGE_VERSION,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastBackupAt: existing?.lastBackupAt,
    lastMigrationAt: existing?.lastMigrationAt,
    dataSize: getCurrentStorageSize(),
    itemCount: countStorageItems(),
    ...updates,
  };
  try {
    localStorage.setItem(STORAGE_METADATA_KEY, JSON.stringify(metadata));
  } catch (e) {
    console.error('Failed to save storage metadata:', e);
  }
  return metadata;
}

export function validatePreset(preset: unknown): StorageValidationError[] {
  const errors: StorageValidationError[] = [];
  const p = preset as Record<string, unknown>;

  if (!p || typeof p !== 'object') {
    errors.push({ field: 'preset', message: '预设必须是对象', code: 'invalid_type', severity: 'error' });
    return errors;
  }

  if (!p.id || typeof p.id !== 'string') {
    errors.push({ field: 'preset.id', message: '缺少预设ID', code: 'missing_required', severity: 'error' });
  }

  if (!p.name || typeof p.name !== 'string') {
    errors.push({ field: 'preset.name', message: '缺少预设名称', code: 'missing_required', severity: 'error' });
  }

  if (!p.artworkId || typeof p.artworkId !== 'string') {
    errors.push({ field: 'preset.artworkId', message: '缺少作品ID', code: 'missing_required', severity: 'error' });
  }

  if (!p.lighting || typeof p.lighting !== 'object') {
    errors.push({ field: 'preset.lighting', message: '缺少灯光配置', code: 'missing_required', severity: 'error' });
  }

  if (!p.material || typeof p.material !== 'object') {
    errors.push({ field: 'preset.material', message: '缺少材质配置', code: 'missing_required', severity: 'error' });
  }

  if (typeof p.useCount !== 'number' || p.useCount < 0) {
    errors.push({ field: 'preset.useCount', message: '使用次数无效', code: 'invalid_value', severity: 'warning' });
  }

  return errors;
}

export function validateGalleryScheme(scheme: unknown): StorageValidationError[] {
  const errors: StorageValidationError[] = [];
  const s = scheme as Record<string, unknown>;

  if (!s || typeof s !== 'object') {
    errors.push({ field: 'scheme', message: '方案必须是对象', code: 'invalid_type', severity: 'error' });
    return errors;
  }

  if (!s.id || typeof s.id !== 'string') {
    errors.push({ field: 'scheme.id', message: '缺少方案ID', code: 'missing_required', severity: 'error' });
  }

  if (!s.name || typeof s.name !== 'string') {
    errors.push({ field: 'scheme.name', message: '缺少方案名称', code: 'missing_required', severity: 'error' });
  }

  if (!Array.isArray(s.wallArtworks)) {
    errors.push({ field: 'scheme.wallArtworks', message: '墙作品必须是数组', code: 'invalid_type', severity: 'error' });
  }

  if (!s.lightingStrategy || typeof s.lightingStrategy !== 'object') {
    errors.push({ field: 'scheme.lightingStrategy', message: '缺少灯光策略', code: 'missing_required', severity: 'error' });
  }

  return errors;
}

export function validateCuratorProject(project: unknown): StorageValidationError[] {
  const errors: StorageValidationError[] = [];
  const p = project as Record<string, unknown>;

  if (!p || typeof p !== 'object') {
    errors.push({ field: 'project', message: '项目必须是对象', code: 'invalid_type', severity: 'error' });
    return errors;
  }

  if (!p.id || typeof p.id !== 'string') {
    errors.push({ field: 'project.id', message: '缺少项目ID', code: 'missing_required', severity: 'error' });
  }

  if (!p.name || typeof p.name !== 'string') {
    errors.push({ field: 'project.name', message: '缺少项目名称', code: 'missing_required', severity: 'error' });
  }

  if (!Array.isArray(p.schemeIds)) {
    errors.push({ field: 'project.schemeIds', message: '方案ID必须是数组', code: 'invalid_type', severity: 'error' });
  }

  if (!p.status || !['draft', 'in_progress', 'completed', 'archived'].includes(p.status as string)) {
    errors.push({ field: 'project.status', message: '项目状态无效', code: 'invalid_value', severity: 'warning' });
  }

  return errors;
}

const VALIDATORS: Record<string, (data: unknown) => StorageValidationError[]> = {
  presets: validatePreset,
  gallerySchemes: validateGalleryScheme,
  curatorProjects: validateCuratorProject,
};

export function validateStorageData(data: Record<string, unknown>): StorageValidationResult {
  const errors: StorageValidationError[] = [];
  const warnings: StorageValidationError[] = [];
  const fixedCount = 0;

  for (const [key, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;

    const validator = VALIDATORS[key];
    if (!validator) continue;

    items.forEach((item, index) => {
      const itemErrors = validator(item);
      itemErrors.forEach((err) => {
        const fullError = { ...err, field: `${key}[${index}].${err.field}` };
        if (err.severity === 'error') {
          errors.push(fullError);
        } else {
          warnings.push(fullError);
        }
      });
    });
  }

  const size = getDataSize(data);
  if (size > DEFAULT_STORAGE_CONFIG.maxStorageSize) {
    errors.push({
      field: 'dataSize',
      message: `数据大小(${Math.round(size / 1024 / 1024)}MB)超过限制(${Math.round(DEFAULT_STORAGE_CONFIG.maxStorageSize / 1024 / 1024)}MB)`,
      code: 'too_large',
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedCount,
  };
}

const MIGRATION_STEPS: DataMigrationStep[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: (data) => {
      const migrated = { ...data };
      if (migrated.presets && Array.isArray(migrated.presets)) {
        migrated.presets = (migrated.presets as Array<Record<string, unknown>>).map((preset) => ({
          ...preset,
          keywords: preset.keywords || [],
          useCount: preset.useCount || 0,
          createdAt: preset.createdAt || Date.now(),
          updatedAt: preset.updatedAt || Date.now(),
        }));
      }
      if (migrated.curatorProjects && Array.isArray(migrated.curatorProjects)) {
        migrated.curatorProjects = (migrated.curatorProjects as Array<Record<string, unknown>>).map((project) => ({
          ...project,
          status: project.status || 'draft',
          tags: project.tags || [],
        }));
      }
      return migrated;
    },
    description: '添加keywords、useCount字段到preset；添加status、tags字段到project',
  },
];

export function detectSchemaVersion(data: Record<string, unknown>): number {
  if (data._schemaVersion) {
    return Number(data._schemaVersion);
  }
  if (data.metadata && typeof data.metadata === 'object' && 'schemaVersion' in data.metadata) {
    return Number((data.metadata as Record<string, unknown>).schemaVersion);
  }
  const presets = data.presets as Array<Record<string, unknown>> | undefined;
  if (presets && presets.length > 0 && presets[0].keywords !== undefined) {
    return 2;
  }
  return 1;
}

export function migrateData(
  data: Record<string, unknown>,
  targetVersion: number = STORAGE_SCHEMA_VERSION,
): DataMigrationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let stepsApplied = 0;
  let migratedData = { ...data };

  const currentVersion = detectSchemaVersion(data);

  if (currentVersion === targetVersion) {
    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      stepsApplied: 0,
      warnings: ['数据已是最新版本，无需迁移'],
      errors: [],
      migratedData,
    };
  }

  if (currentVersion > targetVersion) {
    return {
      success: false,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      stepsApplied: 0,
      warnings: [],
      errors: [`无法降级：当前版本(${currentVersion})高于目标版本(${targetVersion})`],
    };
  }

  const applicableSteps = MIGRATION_STEPS.filter(
    (step) => step.fromVersion >= currentVersion && step.toVersion <= targetVersion,
  ).sort((a, b) => a.fromVersion - b.fromVersion);

  for (const step of applicableSteps) {
    try {
      migratedData = step.migrate(migratedData);
      stepsApplied++;
      warnings.push(`已应用迁移：v${step.fromVersion} → v${step.toVersion} - ${step.description}`);
    } catch (e) {
      errors.push(`迁移失败 v${step.fromVersion} → v${step.toVersion}: ${e instanceof Error ? e.message : '未知错误'}`);
      break;
    }
  }

  const finalVersion = detectSchemaVersion(migratedData);

  return {
    success: errors.length === 0 && finalVersion >= targetVersion,
    fromVersion: currentVersion,
    toVersion: finalVersion,
    stepsApplied,
    warnings,
    errors,
    migratedData: errors.length === 0 ? migratedData : undefined,
  };
}

export function checkNeedsMigration(): boolean {
  const metadata = getStorageMetadata();
  const currentVersion = metadata?.schemaVersion || 1;
  return currentVersion < STORAGE_SCHEMA_VERSION;
}

export function performMigrationIfNeeded(): DataMigrationResult | null {
  if (!checkNeedsMigration()) return null;

  const allData = getAllStorageData();
  const result = migrateData(allData);

  if (result.success && result.migratedData) {
    restoreStorageData(result.migratedData);
    updateStorageMetadata({
      schemaVersion: STORAGE_SCHEMA_VERSION,
      lastMigrationAt: Date.now(),
    });
  }

  return result;
}

export function getAllStorageData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  try {
    data.presets = loadPresets();
    data.presetGroups = loadPresetGroups();
    data.gallerySchemes = loadGallerySchemes();
    data.curatorProjects = loadCuratorProjects();
    data.proposals = loadProposals();
    data.lightingTemplates = loadLightingTemplates();
    data.materialCombos = loadMaterialCombos();
    data.sceneRecommendations = loadSceneRecommendations();
    data.themeCollections = loadThemeCollections();
    data.lightingPresets = loadLightingPresets();
    data.lightingHistory = loadLightingHistory();
    data.exhibitionWallConfig = loadExhibitionWallConfig();
    data._schemaVersion = STORAGE_SCHEMA_VERSION;
  } catch (e) {
    console.error('Failed to get all storage data:', e);
  }

  return data;
}

export function restoreStorageData(data: Record<string, unknown>): void {
  try {
    if (data.presets && Array.isArray(data.presets)) savePresets(data.presets as Preset[]);
    if (data.presetGroups && Array.isArray(data.presetGroups)) savePresetGroups(data.presetGroups as PresetGroup[]);
    if (data.gallerySchemes && Array.isArray(data.gallerySchemes)) saveGallerySchemes(data.gallerySchemes as GalleryScheme[]);
    if (data.curatorProjects && Array.isArray(data.curatorProjects)) saveCuratorProjects(data.curatorProjects as CuratorProject[]);
    if (data.proposals && Array.isArray(data.proposals)) saveProposals(data.proposals as CustomerProposal[]);
    if (data.lightingTemplates && Array.isArray(data.lightingTemplates)) saveLightingTemplates(data.lightingTemplates as LightingTemplate[]);
    if (data.materialCombos && Array.isArray(data.materialCombos)) saveMaterialCombos(data.materialCombos as MaterialCombo[]);
    if (data.sceneRecommendations && Array.isArray(data.sceneRecommendations)) saveSceneRecommendations(data.sceneRecommendations as SceneRecommendation[]);
    if (data.themeCollections && Array.isArray(data.themeCollections)) saveThemeCollections(data.themeCollections as ThemeCollection[]);
    if (data.lightingPresets && Array.isArray(data.lightingPresets)) saveLightingPresets(data.lightingPresets as LightingPreset[]);
    if (data.lightingHistory && Array.isArray(data.lightingHistory)) saveLightingHistory(data.lightingHistory as LightingHistoryEntry[]);
    if (data.exhibitionWallConfig && typeof data.exhibitionWallConfig === 'object') {
      saveExhibitionWallConfig(data.exhibitionWallConfig as ExhibitionWallConfig);
    }
    updateStorageMetadata();
  } catch (e) {
    console.error('Failed to restore storage data:', e);
    throw e;
  }
}

export function createSnapshot(): StorageSnapshot {
  const data = getAllStorageData();
  const snapshot: StorageSnapshot = {
    id: generateId(),
    timestamp: Date.now(),
    data,
    checksum: generateChecksum(data),
  };

  try {
    const snapshots = loadSnapshots();
    snapshots.push(snapshot);

    const config = getStorageConfig();
    while (snapshots.length > config.maxSnapshots) {
      snapshots.shift();
    }

    localStorage.setItem(STORAGE_SNAPSHOTS_KEY, JSON.stringify(snapshots));
  } catch (e) {
    console.error('Failed to create snapshot:', e);
  }

  return snapshot;
}

export function loadSnapshots(): StorageSnapshot[] {
  try {
    const data = localStorage.getItem(STORAGE_SNAPSHOTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load snapshots:', e);
    return [];
  }
}

export function restoreFromSnapshot(snapshotId: string): boolean {
  const snapshots = loadSnapshots();
  const snapshot = snapshots.find((s) => s.id === snapshotId);

  if (!snapshot) {
    console.error('Snapshot not found:', snapshotId);
    return false;
  }

  const currentChecksum = generateChecksum(snapshot.data);
  if (currentChecksum !== snapshot.checksum) {
    console.warn('Snapshot checksum mismatch, data may be corrupted');
  }

  try {
    restoreStorageData(snapshot.data);
    return true;
  } catch (e) {
    console.error('Failed to restore from snapshot:', e);
    return false;
  }
}

export function createBackup(
  name: string,
  description?: string,
  isAutoBackup: boolean = false,
): StorageBackup {
  const data = getAllStorageData();
  const checksum = generateChecksum(data);
  const size = getDataSize(data);

  const backup: StorageBackup = {
    id: generateId(),
    name,
    description,
    metadata: {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      appVersion: STORAGE_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dataSize: size,
      itemCount: countStorageItems(),
    },
    data,
    createdAt: Date.now(),
    size,
    checksum,
    isAutoBackup,
  };

  try {
    const backups = loadBackups();
    backups.push(backup);

    const config = getStorageConfig();
    if (isAutoBackup) {
      const autoBackups = backups.filter((b) => b.isAutoBackup);
      while (autoBackups.length > config.maxAutoBackups) {
        const oldest = autoBackups.shift();
        if (oldest) {
          const idx = backups.findIndex((b) => b.id === oldest.id);
          if (idx !== -1) backups.splice(idx, 1);
        }
      }
    }

    localStorage.setItem(STORAGE_BACKUPS_KEY, JSON.stringify(backups));
    updateStorageMetadata({ lastBackupAt: Date.now() });
  } catch (e) {
    console.error('Failed to create backup:', e);
  }

  return backup;
}

export function loadBackups(): StorageBackup[] {
  try {
    const data = localStorage.getItem(STORAGE_BACKUPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load backups:', e);
    return [];
  }
}

export function getBackupInfos(): BackupInfo[] {
  return loadBackups().map((backup) => ({
    id: backup.id,
    name: backup.name,
    description: backup.description,
    createdAt: backup.createdAt,
    size: backup.size,
    isAutoBackup: backup.isAutoBackup,
    schemaVersion: backup.metadata.schemaVersion,
    appVersion: backup.metadata.appVersion,
  }));
}

export function restoreFromBackup(backupId: string): boolean {
  const backups = loadBackups();
  const backup = backups.find((b) => b.id === backupId);

  if (!backup) {
    console.error('Backup not found:', backupId);
    return false;
  }

  const currentChecksum = generateChecksum(backup.data);
  if (currentChecksum !== backup.checksum) {
    console.error('Backup checksum mismatch, data may be corrupted');
    return false;
  }

  try {
    restoreStorageData(backup.data);
    return true;
  } catch (e) {
    console.error('Failed to restore from backup:', e);
    return false;
  }
}

export function deleteBackup(backupId: string): boolean {
  try {
    const backups = loadBackups();
    const filtered = backups.filter((b) => b.id !== backupId);
    localStorage.setItem(STORAGE_BACKUPS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete backup:', e);
    return false;
  }
}

export function downloadBackup(backupId: string): void {
  const backups = loadBackups();
  const backup = backups.find((b) => b.id === backupId);

  if (!backup) {
    console.error('Backup not found:', backupId);
    return;
  }

  const exportData = {
    ...backup,
    _exportType: 'storage_backup',
    _exportVersion: 1,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${backup.name.replace(/\s+/g, '_')}_${new Date(backup.createdAt).toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupFromFile(file: File): Promise<StorageBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data._exportType !== 'storage_backup') {
          reject(new Error('无效的备份文件格式'));
          return;
        }

        const backup = data as StorageBackup;
        const backups = loadBackups();
        backups.push({
          ...backup,
          id: generateId(),
          createdAt: Date.now(),
        });
        localStorage.setItem(STORAGE_BACKUPS_KEY, JSON.stringify(backups));

        resolve(backup);
      } catch {
        reject(new Error('备份文件解析失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export function detectConflicts(
  importedData: Record<string, unknown>,
  localData: Record<string, unknown>,
): StorageConflict[] {
  const conflicts: StorageConflict[] = [];

  for (const [key, importedItems] of Object.entries(importedData)) {
    if (!Array.isArray(importedItems)) continue;

    const localItems = (localData[key] as Array<Record<string, unknown>>) || [];
    const localIds = new Set(localItems.map((item) => item.id as string));

    for (const importedItem of importedItems) {
      if (!importedItem || typeof importedItem !== 'object' || !('id' in importedItem)) continue;

      const itemId = importedItem.id as string;
      if (localIds.has(itemId)) {
        const localItem = localItems.find((item) => item.id === itemId);
        const localJson = JSON.stringify(localItem);
        const importedJson = JSON.stringify(importedItem);

        if (localJson !== importedJson) {
          conflicts.push({
            type: 'content',
            key,
            itemId,
            localData: localItem,
            importedData: importedItem,
            message: `${key} 中存在 ID 相同但内容不同的项: ${itemId}`,
            severity: 'warning',
          });
        }
      }
    }
  }

  return conflicts;
}

export function resolveConflict(
  conflict: StorageConflict,
  strategy: ConflictResolutionStrategy,
  localData: Record<string, unknown>,
): { resolved: boolean; data: Record<string, unknown>; resolvedData?: unknown } {
  const result = { resolved: false, data: { ...localData }, resolvedData: undefined };

  if (!conflict.importedData) {
    return result;
  }

  const items = [...((result.data[conflict.key] as Array<Record<string, unknown>>) || [])];

  switch (strategy) {
    case 'keepLocal':
      result.resolved = true;
      break;

    case 'keepImported': {
      const idx = items.findIndex((item) => item.id === conflict.itemId);
      if (idx !== -1) {
        items[idx] = conflict.importedData as Record<string, unknown>;
        result.data[conflict.key] = items;
        result.resolved = true;
        result.resolvedData = conflict.importedData;
      }
      break;
    }

    case 'merge': {
      const idx = items.findIndex((item) => item.id === conflict.itemId);
      if (idx !== -1) {
        const merged = {
          ...items[idx],
          ...(conflict.importedData as Record<string, unknown>),
          updatedAt: Date.now(),
        };
        items[idx] = merged;
        result.data[conflict.key] = items;
        result.resolved = true;
        result.resolvedData = merged;
      }
      break;
    }

    case 'renameImported': {
      const imported = conflict.importedData as Record<string, unknown>;
      const renamed = {
        ...imported,
        id: generateId(),
        name: `${imported.name} (导入)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      items.push(renamed);
      result.data[conflict.key] = items;
      result.resolved = true;
      result.resolvedData = renamed;
      break;
    }

    case 'skip':
      result.resolved = true;
      break;

    default:
      break;
  }

  return result;
}

export function resolveConflicts(
  conflicts: StorageConflict[],
  strategies: Record<string, ConflictResolutionStrategy>,
  localData: Record<string, unknown>,
): { data: Record<string, unknown>; resolvedConflicts: StorageConflict[] } {
  let data = { ...localData };
  const resolvedConflicts: StorageConflict[] = [];

  for (const conflict of conflicts) {
    const strategy = strategies[`${conflict.key}:${conflict.itemId}`] || DEFAULT_STORAGE_CONFIG.conflictDefaultStrategy;
    const result = resolveConflict(conflict, strategy, data);

    if (result.resolved) {
      data = result.data;
      resolvedConflicts.push({
        ...conflict,
        resolution: strategy,
        resolvedData: result.resolvedData,
      });
    }
  }

  return { data, resolvedConflicts };
}

export function validateImportData(
  data: Record<string, unknown>,
  options: { checkConflicts?: boolean; localData?: Record<string, unknown> } = {},
): ImportValidationResult {
  const { checkConflicts = true, localData = getAllStorageData() } = options;

  const baseValidation = validateStorageData(data);
  const detectedSchemaVersion = detectSchemaVersion(data);
  const needsMigration = detectedSchemaVersion < STORAGE_SCHEMA_VERSION;

  let conflicts: StorageConflict[] = [];
  if (checkConflicts) {
    conflicts = detectConflicts(data, localData);
  }

  let totalItems = 0;
  let validItems = 0;
  let invalidItems = 0;

  for (const [, items] of Object.entries(data)) {
    if (!Array.isArray(items)) continue;
    totalItems += items.length;
  }

  invalidItems = baseValidation.errors.length;
  validItems = totalItems - invalidItems;

  const canImport =
    baseValidation.isValid ||
    baseValidation.errors.every((e) => e.severity === 'warning');

  return {
    ...baseValidation,
    detectedSchemaVersion,
    needsMigration,
    canImport,
    conflicts,
    statistics: {
      totalItems,
      validItems,
      invalidItems,
      conflictingItems: conflicts.length,
    },
  };
}

export async function importDataFromFile(
  file: File,
  options: {
    validate?: boolean;
    resolveConflicts?: boolean;
    conflictStrategies?: Record<string, ConflictResolutionStrategy>;
  } = {},
): Promise<ImportResult> {
  const { validate = true, resolveConflicts: shouldResolve = true, conflictStrategies = {} } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  let importedCount = 0;
  let skippedCount = 0;
  let conflicts: StorageConflict[] = [];
  let migrationResult: DataMigrationResult | undefined;

  try {
    const fileContent = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });

    let importedData: Record<string, unknown>;
    try {
      importedData = JSON.parse(fileContent);
    } catch {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        conflicts: [],
        errors: ['无效的 JSON 文件格式'],
        warnings: [],
      };
    }

    if (importedData._exportType === 'storage_backup' && importedData.data) {
      importedData = importedData.data as Record<string, unknown>;
    }

    if (validate) {
      const validation = validateImportData(importedData);
      if (!validation.canImport) {
        return {
          success: false,
          importedCount: 0,
          skippedCount: validation.statistics.invalidItems,
          conflicts: validation.conflicts,
          errors: validation.errors.map((e) => `${e.field}: ${e.message}`),
          warnings: validation.warnings.map((w) => `${w.field}: ${w.message}`),
        };
      }
      validation.warnings.forEach((w) => warnings.push(`${w.field}: ${w.message}`));
      conflicts = validation.conflicts;

      if (validation.needsMigration) {
        migrationResult = migrateData(importedData);
        if (migrationResult.success && migrationResult.migratedData) {
          importedData = migrationResult.migratedData;
          migrationResult.warnings.forEach((w) => warnings.push(w));
        } else if (!migrationResult.success) {
          return {
            success: false,
            importedCount: 0,
            skippedCount: validation.statistics.totalItems,
            conflicts: [],
            errors: migrationResult.errors,
            warnings: migrationResult.warnings,
            migrationApplied: migrationResult,
          };
        }
      }
    }

    let localData = getAllStorageData();

    if (shouldResolve && conflicts.length > 0) {
      const resolved = resolveConflicts(conflicts, conflictStrategies, localData);
      localData = resolved.data;
      conflicts = resolved.resolvedConflicts;
      skippedCount = conflicts.filter((c) => c.resolution === 'skip').length;
    }

    const mergedData: Record<string, unknown> = {};
    for (const key of Object.keys({ ...localData, ...importedData })) {
      const localItems = (localData[key] as Array<unknown>) || [];
      const importedItems = (importedData[key] as Array<unknown>) || [];

      if (Array.isArray(localItems) && Array.isArray(importedItems)) {
        const localIds = new Set(localItems.map((item: Record<string, unknown>) => item.id));
        const newItems = importedItems.filter(
          (item: Record<string, unknown>) => !localIds.has(item.id),
        );
        mergedData[key] = [...localItems, ...newItems];
        importedCount += newItems.length;
      } else if (importedItems && !localItems) {
        mergedData[key] = importedItems;
        if (Array.isArray(importedItems)) {
          importedCount += importedItems.length;
        }
      } else {
        mergedData[key] = localItems;
      }
    }

    restoreStorageData(mergedData);

    return {
      success: true,
      importedCount,
      skippedCount,
      conflicts,
      errors,
      warnings,
      migrationApplied: migrationResult,
    };
  } catch (e) {
    return {
      success: false,
      importedCount,
      skippedCount,
      conflicts,
      errors: [e instanceof Error ? e.message : '导入失败'],
      warnings,
      migrationApplied: migrationResult,
    };
  }
}

export function exportAllData(
  name: string,
  options: Partial<ExportOptions> = {},
): void {
  const {
    scope = 'all',
    includeMetadata = true,
    includeHistory = true,
    compress = false,
  } = options;

  let data = getAllStorageData();

  if (scope !== 'all') {
    const scopeKeys: Record<ExportScope, string[]> = {
      all: Object.keys(data),
      presets: ['presets', 'presetGroups'],
      schemes: ['gallerySchemes'],
      projects: ['curatorProjects', 'proposals'],
      templates: ['lightingTemplates', 'materialCombos', 'sceneRecommendations', 'themeCollections', 'lightingPresets'],
      custom: Object.keys(data),
    };
    const keys = scopeKeys[scope] || scopeKeys.all;
    const filtered: Record<string, unknown> = {};
    keys.forEach((key) => {
      if (data[key] !== undefined) {
        filtered[key] = data[key];
      }
    });
    data = filtered;
  }

  if (!includeHistory) {
    delete data.lightingHistory;
  }

  const exportData = {
    ...data,
    _exportType: 'storage_backup',
    _exportVersion: 1,
    _exportedAt: Date.now(),
    metadata: includeMetadata ? getStorageMetadata() : undefined,
  };

  const blob = new Blob([JSON.stringify(exportData, null, compress ? 0 : 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function checkStorageHealth(): StorageHealthStatus {
  const corruptedKeys: string[] = [];
  const missingKeys: string[] = [];
  const recommendations: string[] = [];

  Object.entries(STORAGE_KEYS).forEach(([, storageKey]) => {
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        JSON.parse(data);
      }
    } catch {
      corruptedKeys.push(storageKey);
    }
  });

  const backups = loadBackups();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const hasRecentBackup = backups.some((b) => b.createdAt > oneDayAgo);

  const metadata = getStorageMetadata();
  const currentVersion = metadata?.schemaVersion || 1;
  const needsMigration = currentVersion < STORAGE_SCHEMA_VERSION;

  if (corruptedKeys.length > 0) {
    recommendations.push(`检测到 ${corruptedKeys.length} 个损坏的数据项，建议立即执行自动恢复`);
  }
  if (!hasRecentBackup) {
    recommendations.push('建议立即创建数据备份');
  }
  if (needsMigration) {
    recommendations.push(`检测到数据版本(v${currentVersion})较低，建议升级到 v${STORAGE_SCHEMA_VERSION}`);
  }

  const storageSize = getCurrentStorageSize();
  if (storageSize > DEFAULT_STORAGE_CONFIG.maxStorageSize * 0.8) {
    recommendations.push(`存储使用量已达 ${Math.round((storageSize / DEFAULT_STORAGE_CONFIG.maxStorageSize) * 100)}%，建议清理旧数据`);
  }

  return {
    isHealthy: corruptedKeys.length === 0 && missingKeys.length === 0,
    corruptedKeys,
    missingKeys,
    lastCheckAt: Date.now(),
    recommendations,
    hasRecentBackup,
    needsMigration,
    currentSchemaVersion: currentVersion,
    latestSchemaVersion: STORAGE_SCHEMA_VERSION,
  };
}

export function autoRecovery(): AutoRecoveryResult {
  const config = getStorageConfig();
  if (!config.autoRecoveryEnabled) {
    return {
      recovered: false,
      recoverySource: null,
      recoveredItems: [],
      errors: ['自动恢复已禁用'],
      warnings: [],
    };
  }

  const recoveredItems: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  let recoverySource: 'backup' | 'snapshot' | 'default' | null = null;
  let backupUsed: BackupInfo | undefined;

  const health = checkStorageHealth();

  if (health.isHealthy) {
    return {
      recovered: true,
      recoverySource: null,
      recoveredItems: [],
      errors: [],
      warnings: ['存储状态良好，无需恢复'],
    };
  }

  const snapshots = loadSnapshots();
  if (snapshots.length > 0) {
    const latestSnapshot = snapshots[snapshots.length - 1];
    try {
      if (restoreFromSnapshot(latestSnapshot.id)) {
        recoverySource = 'snapshot';
        recoveredItems.push(...health.corruptedKeys);
        warnings.push(`已从快照恢复 ${health.corruptedKeys.length} 个数据项`);
      }
    } catch (e) {
      errors.push(`快照恢复失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }

  if (!recoverySource) {
    const backups = loadBackups();
    if (backups.length > 0) {
      const latestBackup = backups.sort((a, b) => b.createdAt - a.createdAt)[0];
      try {
        if (restoreFromBackup(latestBackup.id)) {
          recoverySource = 'backup';
          backupUsed = {
            id: latestBackup.id,
            name: latestBackup.name,
            createdAt: latestBackup.createdAt,
            size: latestBackup.size,
            isAutoBackup: latestBackup.isAutoBackup,
            schemaVersion: latestBackup.metadata.schemaVersion,
            appVersion: latestBackup.metadata.appVersion,
          };
          recoveredItems.push(...health.corruptedKeys);
          warnings.push(`已从备份恢复 ${health.corruptedKeys.length} 个数据项`);
        }
      } catch (e) {
        errors.push(`备份恢复失败: ${e instanceof Error ? e.message : '未知错误'}`);
      }
    }
  }

  if (!recoverySource && health.corruptedKeys.length > 0) {
    try {
      health.corruptedKeys.forEach((key) => {
        const dataKey = key as keyof typeof STORAGE_KEYS;
        if (STORAGE_KEYS[dataKey]) {
          localStorage.removeItem(STORAGE_KEYS[dataKey]);
          recoveredItems.push(key);
        }
      });
      recoverySource = 'default';
      warnings.push('已重置损坏的数据项为默认值');
    } catch (e) {
      errors.push(`默认恢复失败: ${e instanceof Error ? e.message : '未知错误'}`);
    }
  }

  return {
    recovered: recoverySource !== null,
    recoverySource,
    recoveredItems,
    errors,
    warnings,
    backupUsed,
  };
}

let autoBackupTimer: number | null = null;
let snapshotTimer: number | null = null;

export function startAutoBackup(): void {
  const config = getStorageConfig();
  if (!config.autoBackupEnabled) return;

  stopAutoBackup();

  autoBackupTimer = window.setInterval(() => {
    try {
      createBackup(`自动备份_${new Date().toLocaleString('zh-CN')}`, '系统自动创建的备份', true);
    } catch (e) {
      console.error('Auto backup failed:', e);
    }
  }, config.autoBackupInterval);
}

export function stopAutoBackup(): void {
  if (autoBackupTimer !== null) {
    clearInterval(autoBackupTimer);
    autoBackupTimer = null;
  }
}

export function startAutoSnapshot(): void {
  const config = getStorageConfig();
  if (!config.snapshotEnabled) return;

  stopAutoSnapshot();

  snapshotTimer = window.setInterval(() => {
    try {
      createSnapshot();
    } catch (e) {
      console.error('Auto snapshot failed:', e);
    }
  }, config.snapshotInterval);
}

export function stopAutoSnapshot(): void {
  if (snapshotTimer !== null) {
    clearInterval(snapshotTimer);
    snapshotTimer = null;
  }
}

export function initStorageSystem(): {
  health: StorageHealthStatus;
  migrationResult?: DataMigrationResult;
  recoveryResult?: AutoRecoveryResult;
} {
  const metadata = getStorageMetadata();
  if (!metadata) {
    updateStorageMetadata();
  }

  const health = checkStorageHealth();
  let migrationResult: DataMigrationResult | undefined;
  let recoveryResult: AutoRecoveryResult | undefined;

  if (health.needsMigration) {
    migrationResult = performMigrationIfNeeded();
  }

  if (!health.isHealthy) {
    recoveryResult = autoRecovery();
  }

  startAutoBackup();
  startAutoSnapshot();

  return { health, migrationResult, recoveryResult };
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  localStorage.removeItem(LAST_ARTWORK_KEY);
  localStorage.removeItem(LAST_LIGHTING_KEY);
  localStorage.removeItem(LAST_MATERIAL_KEY);
  localStorage.removeItem(PRESET_RECENTLY_USED_KEY);
  localStorage.removeItem(CURRENT_SCHEME_KEY);
  localStorage.removeItem(APP_MODE_KEY);
  localStorage.removeItem(CURRENT_PROJECT_KEY);
  localStorage.removeItem(CURRENT_PROPOSAL_KEY);
  localStorage.removeItem(STORAGE_METADATA_KEY);
  localStorage.removeItem(STORAGE_BACKUPS_KEY);
  localStorage.removeItem(STORAGE_SNAPSHOTS_KEY);
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  updateStorageMetadata();
}
