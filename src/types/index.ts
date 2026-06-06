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

export interface ArtworkGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  artworkIds: string[];
  order: number;
}

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface ProgressStep {
  id: string;
  name: string;
  description?: string;
  status: ProgressStatus;
  order: number;
  assignee?: string;
  dueDate?: number;
  completedAt?: number;
  notes?: string;
}

export interface ProjectProgress {
  steps: ProgressStep[];
  overallProgress: number;
}

export interface VersionComment {
  id: string;
  versionId: string;
  author: string;
  content: string;
  createdAt: number;
}

export type ExportFormat = 'json' | 'pdf' | 'image' | 'print';
export type ExportResolution = 'low' | 'medium' | 'high' | 'print';

export interface ExportConfig {
  format: ExportFormat;
  resolution: ExportResolution;
  includeMetadata: boolean;
  includeArtworkInfo: boolean;
  includeLightingSpec: boolean;
  watermark?: string;
}

export interface GalleryScheme {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  wallArtworks: WallArtwork[];
  lightingStrategy: LightingStrategy;
  wallMaterial: WallMaterial;
  groups: ArtworkGroup[];
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
  versionComments: VersionComment[];
  progress: ProjectProgress;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type SchemePanelTab = 'layout' | 'lighting' | 'snapshots' | 'groups' | 'progress';
export type AppMode = 'artwork' | 'curator';
export type ProjectViewTab = 'projects' | 'schemes' | 'versions' | 'progress' | 'export';
export type CuratorHubTab = 'overview' | 'groups' | 'progress' | 'versions' | 'export' | 'proposal';

export interface ProposalLightingSection {
  title: string;
  description: string;
  specifications: {
    label: string;
    value: string;
  }[];
}

export interface ProposalMaterialSection {
  title: string;
  description: string;
  frameRecommendation: {
    material: FrameMaterial;
    reason: string;
  };
  wallRecommendation: {
    material: WallMaterial;
    reason: string;
  };
}

export interface ProposalArtworkSection {
  artworkId: string;
  title: string;
  artist: string;
  year: number;
  medium: string;
  description: string;
  imageUrl: string;
  lightingDescription: string;
  materialDescription: string;
  curatorNote: string;
}

export interface CustomerProposal {
  id: string;
  projectId: string;
  schemeId: string;
  title: string;
  subtitle: string;
  introduction: string;
  artworks: ProposalArtworkSection[];
  lightingSection: ProposalLightingSection;
  materialSection: ProposalMaterialSection;
  conclusion: string;
  createdAt: number;
  updatedAt: number;
  shareToken?: string;
  shareExpiresAt?: number;
}

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
  curatorHubTab: CuratorHubTab;
  selectedGroupId: string | null;
  selectedVersionId: string | null;
  proposals: CustomerProposal[];
  currentProposalId: string | null;
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
  { id: 'groups', label: '作品分组' },
  { id: 'progress', label: '布展进度' },
  { id: 'snapshots', label: '方案快照' },
];

export const PROGRESS_STATUS_LABELS: Record<ProgressStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  blocked: '已阻塞',
};

export const PROGRESS_STATUS_COLORS: Record<ProgressStatus, string> = {
  not_started: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
};

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  json: 'JSON 数据',
  pdf: 'PDF 文档',
  image: '图片导出',
  print: '打印规格',
};

export const EXPORT_RESOLUTION_LABELS: Record<ExportResolution, string> = {
  low: '低清 (72dpi)',
  medium: '标清 (150dpi)',
  high: '高清 (300dpi)',
  print: '印刷级 (600dpi)',
};

export const EXPORT_RESOLUTION_PIXELS: Record<ExportResolution, { width: number; height: number }> = {
  low: { width: 1280, height: 720 },
  medium: { width: 1920, height: 1080 },
  high: { width: 3840, height: 2160 },
  print: { width: 7680, height: 4320 },
};

export const CURATOR_HUB_TABS: { id: CuratorHubTab; label: string }[] = [
  { id: 'overview', label: '项目概览' },
  { id: 'groups', label: '作品分组' },
  { id: 'progress', label: '布展进度' },
  { id: 'versions', label: '版本历史' },
  { id: 'export', label: '预览输出' },
  { id: 'proposal', label: '客户提案' },
];

export const DEFAULT_PROGRESS_STEPS: Omit<ProgressStep, 'id'>[] = [
  { name: '确定展览主题', description: '明确展览的主题、目标和受众', status: 'not_started', order: 0 },
  { name: '作品筛选与分组', description: '选择参展作品并进行主题分组', status: 'not_started', order: 1 },
  { name: '空间规划设计', description: '设计展厅布局和作品陈列方案', status: 'not_started', order: 2 },
  { name: '灯光方案设计', description: '为每件作品设计专属灯光方案', status: 'not_started', order: 3 },
  { name: '材质与装裱', description: '确定画框材质和墙面处理', status: 'not_started', order: 4 },
  { name: '方案评审', description: '内部评审并收集反馈意见', status: 'not_started', order: 5 },
  { name: '方案调整', description: '根据评审意见调整方案', status: 'not_started', order: 6 },
  { name: '最终确认', description: '最终方案确认并准备实施', status: 'not_started', order: 7 },
];

export const DEFAULT_PROGRESS: ProjectProgress = {
  steps: [],
  overallProgress: 0,
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  format: 'json',
  resolution: 'high',
  includeMetadata: true,
  includeArtworkInfo: true,
  includeLightingSpec: true,
};

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
  versionComments: [],
  progress: {
    steps: DEFAULT_PROGRESS_STEPS.map((step, index) => ({
      ...step,
      id: `step-${index}`,
    })),
    overallProgress: 0,
  },
  status: 'draft',
  tags: [],
};
