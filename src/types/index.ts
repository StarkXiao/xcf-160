export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  width: number;
  height: number;
  medium: string;
  description?: string;
}

export type LightType = 'spotlight' | 'floodlight' | 'ambient';

export interface LightingConfig {
  type: LightType;
  colorTemperature: number;
  intensity: number;
  angle: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export type FrameMaterial = 'wood' | 'metal' | 'gold' | 'silver' | 'none';
export type WallMaterial = 'matte' | 'satin' | 'glossy' | 'concrete';

export interface MaterialConfig {
  frameMaterial: FrameMaterial;
  wallMaterial: WallMaterial;
  reflectivity: number;
  roughness: number;
}

export interface Preset {
  id: string;
  name: string;
  artworkId: string;
  lighting: LightingConfig;
  material: MaterialConfig;
  createdAt: number;
}

export interface WallPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  layer: number;
}

export interface WallArtwork {
  id: string;
  artworkId: string;
  position: WallPosition;
  lighting: LightingConfig;
  material: MaterialConfig;
}

export type LightingStrategyMode = 'uniform' | 'individual' | 'zone';

export interface LightingStrategy {
  mode: LightingStrategyMode;
  globalLighting: LightingConfig;
  zones: {
    id: string;
    name: string;
    lighting: LightingConfig;
    artworkIds: string[];
  }[];
}

export interface GalleryScheme {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  wallArtworks: WallArtwork[];
  lightingStrategy: LightingStrategy;
  wallMaterial: WallMaterial;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectVersion {
  id: string;
  name: string;
  description?: string;
  scheme: GalleryScheme;
  createdAt: number;
  createdBy: string;
}

export interface CuratorProject {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  schemeIds: string[];
  currentSchemeId: string | null;
  versions: ProjectVersion[];
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type SchemePanelTab = 'layout' | 'lighting' | 'snapshots';
export type AppMode = 'artwork' | 'curator';
export type ProjectViewTab = 'projects' | 'schemes' | 'versions';

export interface AppState {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  lighting: LightingConfig;
  material: MaterialConfig;
  presets: Preset[];
  compareList: string[];
  activePanel: 'lighting' | 'material' | 'compare' | 'storage' | 'scheme';
  gallerySchemes: GalleryScheme[];
  currentSchemeId: string | null;
  selectedWallArtworkIds: string[];
  schemePanelTab: SchemePanelTab;
  appMode: AppMode;
  curatorProjects: CuratorProject[];
  currentProjectId: string | null;
  projectViewTab: ProjectViewTab;
  showCuratorHub: boolean;
}

export const LIGHT_TYPE_LABELS: Record<LightType, string> = {
  spotlight: '聚光灯',
  floodlight: '泛光灯',
  ambient: '环境光',
};

export const FRAME_MATERIAL_LABELS: Record<FrameMaterial, string> = {
  wood: '木质',
  metal: '金属',
  gold: '金色',
  silver: '银色',
  none: '无框',
};

export const WALL_MATERIAL_LABELS: Record<WallMaterial, string> = {
  matte: '哑光',
  satin: '丝光',
  glossy: '高光',
  concrete: '水泥',
};

export const DEFAULT_LIGHTING: LightingConfig = {
  type: 'spotlight',
  colorTemperature: 3500,
  intensity: 0.8,
  angle: 45,
  positionX: 0,
  positionY: 2,
  positionZ: 3,
};

export const DEFAULT_MATERIAL: MaterialConfig = {
  frameMaterial: 'gold',
  wallMaterial: 'matte',
  reflectivity: 0.3,
  roughness: 0.7,
};

export const DEFAULT_WALL_POSITION: WallPosition = {
  x: 50,
  y: 50,
  width: 20,
  height: 25,
  rotation: 0,
  layer: 0,
};

export const DEFAULT_LIGHTING_STRATEGY: LightingStrategy = {
  mode: 'uniform',
  globalLighting: { ...DEFAULT_LIGHTING },
  zones: [],
};

export const LIGHTING_STRATEGY_MODE_LABELS: Record<LightingStrategyMode, string> = {
  uniform: '统一灯光',
  individual: '独立灯光',
  zone: '分区灯光',
};

export const SCHEME_PANEL_TABS: { id: SchemePanelTab; label: string }[] = [
  { id: 'layout', label: '挂墙布局' },
  { id: 'lighting', label: '灯光策略' },
  { id: 'snapshots', label: '方案快照' },
];

export const APP_MODE_LABELS: Record<AppMode, string> = {
  artwork: '单作品预览',
  curator: '展厅编排',
};

export const PROJECT_STATUS_LABELS: Record<CuratorProject['status'], string> = {
  draft: '草稿',
  in_progress: '进行中',
  completed: '已完成',
  archived: '已归档',
};

export const PROJECT_VIEW_TABS: { id: ProjectViewTab; label: string }[] = [
  { id: 'projects', label: '项目列表' },
  { id: 'schemes', label: '方案管理' },
  { id: 'versions', label: '版本历史' },
];

export const DEFAULT_PROJECT: Omit<CuratorProject, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  schemeIds: [],
  currentSchemeId: null,
  versions: [],
  status: 'draft',
  tags: [],
};
