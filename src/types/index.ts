export interface ArtworkTag {
  id: string;
  name: string;
  color: string;
  category: string;
}

export type IngestionStatus = 'draft' | 'uploading' | 'validating' | 'pending' | 'completed' | 'error';

export interface IngestionFormData {
  title: string;
  artist: string;
  year: number | string;
  width: number | string;
  height: number | string;
  depth?: number | string;
  medium: string;
  description: string;
  tagIds: string[];
  imageUrl: string;
  imageFile?: File;
}

export interface IngestionValidationError {
  field: keyof IngestionFormData | 'general';
  message: string;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  imageUrl: string;
  width: number;
  height: number;
  depth?: number;
  medium: string;
  description?: string;
  tagIds: string[];
  createdAt: number;
  updatedAt: number;
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
export type WorkstationTab = 'ingestion' | 'library' | 'tags';

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

export interface WallDimensions {
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'ft';
}

export interface WallColor {
  baseColor: string;
  textureEnabled: boolean;
  textureIntensity: number;
  gradientEnabled: boolean;
  gradientColor: string;
  gradientAngle: number;
}

export type AmbientLightPreset = 'warm_gallery' | 'cool_museum' | 'natural_daylight' | 'dramatic_evening' | 'soft_ambient' | 'neutral_white';

export interface AmbientLightTemplate {
  id: string;
  name: string;
  preset: AmbientLightPreset;
  colorTemperature: number;
  intensity: number;
  ambientColor: string;
  description?: string;
}

export type PreviewAspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | 'custom';
export type PreviewFitMode = 'contain' | 'cover' | 'fill' | 'fit_width' | 'fit_height';

export interface PreviewAdaptation {
  aspectRatio: PreviewAspectRatio;
  customWidth?: number;
  customHeight?: number;
  fitMode: PreviewFitMode;
  padding: number;
  showGrid: boolean;
  gridSize: number;
  showSafeArea: boolean;
  safeAreaMargin: number;
}

export interface ExhibitionWallConfig {
  dimensions: WallDimensions;
  wallColor: WallColor;
  ambientLight: AmbientLightTemplate;
  previewAdaptation: PreviewAdaptation;
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

export const WORKSTATION_TABS: { id: WorkstationTab; label: string }[] = [
  { id: 'ingestion', label: '入库登记' },
  { id: 'library', label: '作品库' },
  { id: 'tags', label: '标签管理' },
];

export const INGESTION_STATUS_LABELS: Record<IngestionStatus, string> = {
  draft: '草稿',
  uploading: '上传中',
  validating: '校验中',
  pending: '待确认',
  completed: '已完成',
  error: '出错',
};

export const TAG_CATEGORIES: { id: string; label: string }[] = [
  { id: 'style', label: '艺术风格' },
  { id: 'medium', label: '创作媒介' },
  { id: 'era', label: '年代时期' },
  { id: 'theme', label: '主题内容' },
  { id: 'size', label: '尺寸规格' },
  { id: 'collection', label: '收藏分类' },
];

export const DEFAULT_ARTWORK_TAGS: ArtworkTag[] = [
  { id: 'tag-1', name: '油画', color: '#E91E63', category: 'medium' },
  { id: 'tag-2', name: '水彩', color: '#2196F3', category: 'medium' },
  { id: 'tag-3', name: '雕塑', color: '#9C27B0', category: 'medium' },
  { id: 'tag-4', name: '摄影', color: '#00BCD4', category: 'medium' },
  { id: 'tag-5', name: '版画', color: '#FF9800', category: 'medium' },
  { id: 'tag-6', name: '印象派', color: '#4CAF50', category: 'style' },
  { id: 'tag-7', name: '现实主义', color: '#F44336', category: 'style' },
  { id: 'tag-8', name: '抽象派', color: '#9575CD', category: 'style' },
  { id: 'tag-9', name: '现代艺术', color: '#009688', category: 'style' },
  { id: 'tag-10', name: '古典主义', color: '#FFC107', category: 'style' },
  { id: 'tag-11', name: '19世纪', color: '#795548', category: 'era' },
  { id: 'tag-12', name: '20世纪', color: '#607D8B', category: 'era' },
  { id: 'tag-13', name: '当代', color: '#FF5722', category: 'era' },
  { id: 'tag-14', name: '文艺复兴', color: '#E91E63', category: 'era' },
  { id: 'tag-15', name: '风景画', color: '#8BC34A', category: 'theme' },
  { id: 'tag-16', name: '肖像画', color: '#FF4081', category: 'theme' },
  { id: 'tag-17', name: '静物', color: '#03A9F4', category: 'theme' },
  { id: 'tag-18', name: '人物', color: '#4CAF50', category: 'theme' },
  { id: 'tag-19', name: '小品', color: '#CDDC39', category: 'size' },
  { id: 'tag-20', name: '中幅', color: '#FFEB3B', category: 'size' },
  { id: 'tag-21', name: '大幅', color: '#FF9800', category: 'size' },
  { id: 'tag-22', name: '巨幅', color: '#F44336', category: 'size' },
  { id: 'tag-23', name: '常设展品', color: '#3F51B5', category: 'collection' },
  { id: 'tag-24', name: '临时展览', color: '#00BCD4', category: 'collection' },
  { id: 'tag-25', name: '馆藏精品', color: '#FF5722', category: 'collection' },
];

export const DEFAULT_INGESTION_FORM: IngestionFormData = {
  title: '',
  artist: '',
  year: '',
  width: '',
  height: '',
  depth: '',
  medium: '',
  description: '',
  tagIds: [],
  imageUrl: '',
};

export const WALL_UNIT_LABELS: Record<WallDimensions['unit'], string> = {
  cm: '厘米',
  m: '米',
  ft: '英尺',
};

export const AMBIENT_LIGHT_PRESET_LABELS: Record<AmbientLightPreset, string> = {
  warm_gallery: '温暖画廊',
  cool_museum: '冷调博物馆',
  natural_daylight: '自然日光',
  dramatic_evening: '戏剧夜景',
  soft_ambient: '柔和环境',
  neutral_white: '中性白光',
};

export const AMBIENT_LIGHT_PRESETS: AmbientLightTemplate[] = [
  {
    id: 'preset-warm',
    name: '温暖画廊',
    preset: 'warm_gallery',
    colorTemperature: 3200,
    intensity: 0.7,
    ambientColor: '#FFE4B5',
    description: '传统画廊风格，温暖柔和的光线突出艺术品质感',
  },
  {
    id: 'preset-cool',
    name: '冷调博物馆',
    preset: 'cool_museum',
    colorTemperature: 5500,
    intensity: 0.6,
    ambientColor: '#E0F0FF',
    description: '现代博物馆风格，冷静专业的展示环境',
  },
  {
    id: 'preset-daylight',
    name: '自然日光',
    preset: 'natural_daylight',
    colorTemperature: 6500,
    intensity: 0.8,
    ambientColor: '#FFF8E7',
    description: '模拟自然日光，最真实的色彩还原',
  },
  {
    id: 'preset-dramatic',
    name: '戏剧夜景',
    preset: 'dramatic_evening',
    colorTemperature: 2700,
    intensity: 0.4,
    ambientColor: '#FFDAB9',
    description: '低亮度暖光，营造戏剧性的观赏氛围',
  },
  {
    id: 'preset-soft',
    name: '柔和环境',
    preset: 'soft_ambient',
    colorTemperature: 4000,
    intensity: 0.5,
    ambientColor: '#F5F5DC',
    description: '均匀柔和的环境光，适合长时间观赏',
  },
  {
    id: 'preset-neutral',
    name: '中性白光',
    preset: 'neutral_white',
    colorTemperature: 4500,
    intensity: 0.65,
    ambientColor: '#FAFAFA',
    description: '标准中性白光，准确还原作品本色',
  },
];

export const PREVIEW_ASPECT_RATIO_LABELS: Record<PreviewAspectRatio, string> = {
  '16:9': '16:9 宽屏',
  '4:3': '4:3 标准',
  '1:1': '1:1 方形',
  '9:16': '9:16 竖屏',
  'custom': '自定义',
};

export const PREVIEW_FIT_MODE_LABELS: Record<PreviewFitMode, string> = {
  contain: '等比包含',
  cover: '等比覆盖',
  fill: '拉伸填充',
  fit_width: '适应宽度',
  fit_height: '适应高度',
};

export const DEFAULT_WALL_DIMENSIONS: WallDimensions = {
  width: 800,
  height: 400,
  unit: 'cm',
};

export const DEFAULT_WALL_COLOR: WallColor = {
  baseColor: '#1a1a1a',
  textureEnabled: false,
  textureIntensity: 0.3,
  gradientEnabled: false,
  gradientColor: '#2a2a2a',
  gradientAngle: 180,
};

export const DEFAULT_AMBIENT_LIGHT: AmbientLightTemplate = AMBIENT_LIGHT_PRESETS[0];

export const DEFAULT_PREVIEW_ADAPTATION: PreviewAdaptation = {
  aspectRatio: '16:9',
  fitMode: 'contain',
  padding: 24,
  showGrid: false,
  gridSize: 50,
  showSafeArea: false,
  safeAreaMargin: 5,
};

export const DEFAULT_EXHIBITION_WALL_CONFIG: ExhibitionWallConfig = {
  dimensions: { ...DEFAULT_WALL_DIMENSIONS },
  wallColor: { ...DEFAULT_WALL_COLOR },
  ambientLight: { ...DEFAULT_AMBIENT_LIGHT },
  previewAdaptation: { ...DEFAULT_PREVIEW_ADAPTATION },
};

export type ApprovalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revised' | 'archived';

export interface ApprovalComment {
  id: string;
  approvalId: string;
  author: string;
  content: string;
  createdAt: number;
  resolved?: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface ApprovalHistory {
  id: string;
  approvalId: string;
  status: ApprovalStatus;
  operator: string;
  comment?: string;
  createdAt: number;
}

export interface ApprovalRequest {
  id: string;
  projectId: string;
  schemeId: string;
  versionId?: string;
  title: string;
  description?: string;
  status: ApprovalStatus;
  submitter: string;
  reviewers: string[];
  currentReviewer?: string;
  createdAt: number;
  submittedAt?: number;
  reviewedAt?: number;
  approvedAt?: number;
  archivedAt?: number;
  deadline?: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export type CuratorHubTab = 'overview' | 'groups' | 'progress' | 'versions' | 'export' | 'proposal' | 'approval';

export interface AppState {
  artworks: Artwork[];
  selectedArtworkId: string | null;
  selectedArtworkIds: Set<string>;
  lighting: LightingConfig;
  material: MaterialConfig;
  presets: Preset[];
  compareList: string[];
  activePanel: ActivePanel;
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
  artworkTags: ArtworkTag[];
  workstationTab: WorkstationTab;
  ingestionSearchQuery: string;
  ingestionStatus: IngestionStatus;
  exhibitionWallConfig: ExhibitionWallConfig;
  approvalRequests: ApprovalRequest[];
  approvalComments: ApprovalComment[];
  approvalHistories: ApprovalHistory[];
  currentApprovalId: string | null;
  lightingTemplates: LightingTemplate[];
  materialCombos: MaterialCombo[];
  sceneRecommendations: SceneRecommendation[];
  themeCollections: ThemeCollection[];
  themeLibraryTab: ThemeLibraryTab;
  selectedLightingTemplateId: string | null;
  selectedMaterialComboId: string | null;
  selectedSceneRecommendationId: string | null;
  selectedThemeCollectionId: string | null;
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '评审中',
  approved: '已通过',
  rejected: '已驳回',
  revised: '需修改',
  archived: '已归档',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  draft: 'bg-gray-500',
  submitted: 'bg-blue-500',
  under_review: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  revised: 'bg-orange-500',
  archived: 'bg-purple-500',
};

export const APPROVAL_PRIORITY_LABELS: Record<ApprovalRequest['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const APPROVAL_PRIORITY_COLORS: Record<ApprovalRequest['priority'], string> = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-red-500/20 text-red-400',
};

export const CURATOR_HUB_TABS: { id: CuratorHubTab; label: string }[] = [
  { id: 'overview', label: '项目概览' },
  { id: 'groups', label: '作品分组' },
  { id: 'progress', label: '布展进度' },
  { id: 'versions', label: '版本历史' },
  { id: 'export', label: '预览输出' },
  { id: 'proposal', label: '客户提案' },
  { id: 'approval', label: '审批流程' },
];

export interface LightingTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  lighting: LightingConfig;
  artworkIds: string[];
  useCount: number;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
}

export interface MaterialCombo {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  material: MaterialConfig;
  artworkIds: string[];
  useCount: number;
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
}

export type SceneType = 'solo_exhibition' | 'group_exhibition' | 'thematic_exhibition' | 'retrospective' | 'site_specific' | 'permanent_collection';

export interface SceneRecommendation {
  id: string;
  name: string;
  description: string;
  sceneType: SceneType;
  artworkIds: string[];
  suggestedLightingTemplateId?: string;
  suggestedMaterialComboId?: string;
  layoutHint: string;
  curatorNote: string;
  tags: string[];
  matchScore?: number;
  createdAt: number;
}

export interface ThemeCollection {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  coverArtworkId?: string;
  themeColor: string;
  artworkIds: string[];
  lightingTemplateIds: string[];
  materialComboIds: string[];
  sceneRecommendationIds: string[];
  projectIds: string[];
  category: string;
  tags: string[];
  curator: string;
  viewCount: number;
  useCount: number;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ActivePanel = 'lighting' | 'material' | 'compare' | 'storage' | 'scheme' | 'workstation' | 'wallConfig' | 'themeLibrary' | 'lightingTemplates' | 'materialCombos' | 'sceneRecommendations';

export type ThemeLibraryTab = 'collections' | 'lighting' | 'materials' | 'scenes';

export const SCENE_TYPE_LABELS: Record<SceneType, string> = {
  solo_exhibition: '个展',
  group_exhibition: '群展',
  thematic_exhibition: '主题展',
  retrospective: '回顾展',
  site_specific: '在地艺术',
  permanent_collection: '常设展览',
};

export const LIGHTING_TEMPLATE_CATEGORIES: { id: string; label: string }[] = [
  { id: 'classical', label: '古典主义' },
  { id: 'modern', label: '现代主义' },
  { id: 'contemporary', label: '当代艺术' },
  { id: 'photography', label: '摄影作品' },
  { id: 'sculpture', label: '雕塑装置' },
  { id: 'watercolor', label: '水彩作品' },
  { id: 'oil', label: '油画作品' },
  { id: 'minimalist', label: '极简风格' },
  { id: 'dramatic', label: '戏剧效果' },
  { id: 'natural', label: '自然光感' },
];

export const MATERIAL_COMBO_CATEGORIES: { id: string; label: string }[] = [
  { id: 'classic_gallery', label: '经典画廊' },
  { id: 'modern_museum', label: '现代博物馆' },
  { id: 'white_cube', label: '白盒子空间' },
  { id: 'industrial', label: '工业风格' },
  { id: 'luxury', label: '奢华典藏' },
  { id: 'minimal', label: '极简主义' },
  { id: 'warm_wood', label: '温暖木质' },
  { id: 'cool_metal', label: '冷调金属' },
];

export const SCENE_RECOMMENDATION_CATEGORIES: { id: string; label: string }[] = [
  { id: 'solo_exhibition', label: '个展' },
  { id: 'group_exhibition', label: '群展' },
  { id: 'thematic_exhibition', label: '主题展' },
  { id: 'retrospective', label: '回顾展' },
  { id: 'permanent', label: '常设展' },
];

export const THEME_COLLECTION_CATEGORIES: { id: string; label: string }[] = [
  { id: 'impressionism', label: '印象派' },
  { id: 'modern_art', label: '现代艺术' },
  { id: 'contemporary', label: '当代艺术' },
  { id: 'chinese_ink', label: '中国水墨' },
  { id: 'photography', label: '摄影艺术' },
  { id: 'sculpture', label: '雕塑装置' },
  { id: 'portrait', label: '肖像艺术' },
  { id: 'landscape', label: '风景艺术' },
  { id: 'abstract', label: '抽象艺术' },
  { id: 'fine_art', label: '美术典藏' },
  { id: 'new_media', label: '新媒体艺术' },
];

export const THEME_LIBRARY_TABS: { id: ThemeLibraryTab; label: string; icon: string }[] = [
  { id: 'collections', label: '馆藏主题', icon: 'Layers' },
  { id: 'lighting', label: '灯光模板', icon: 'Lightbulb' },
  { id: 'materials', label: '材质组合', icon: 'Palette' },
  { id: 'scenes', label: '场景推荐', icon: 'Sparkles' },
];

export const DEFAULT_LIGHTING_TEMPLATES: Omit<LightingTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '经典油画照明',
    description: '温暖聚光，突出油画厚重质感和笔触层次',
    category: 'oil',
    tags: ['油画', '经典', '温暖'],
    lighting: { type: 'spotlight', colorTemperature: 3200, intensity: 0.85, angle: 35, positionX: 0, positionY: 2.5, positionZ: 2.5 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '水彩柔和照明',
    description: '柔和泛光，展现水彩通透感和色彩层次',
    category: 'watercolor',
    tags: ['水彩', '柔和', '通透'],
    lighting: { type: 'floodlight', colorTemperature: 4500, intensity: 0.65, angle: 60, positionX: 0, positionY: 2, positionZ: 3 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '摄影高保真',
    description: '中性白光，准确还原摄影作品色彩细节',
    category: 'photography',
    tags: ['摄影', '保真', '中性'],
    lighting: { type: 'spotlight', colorTemperature: 5000, intensity: 0.75, angle: 40, positionX: 0, positionY: 2.2, positionZ: 2.8 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '雕塑立体照明',
    description: '多维度光影，突出雕塑立体感和材质表现',
    category: 'sculpture',
    tags: ['雕塑', '立体', '多光源'],
    lighting: { type: 'floodlight', colorTemperature: 3800, intensity: 0.8, angle: 55, positionX: 0.5, positionY: 1.8, positionZ: 2.5 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '极简冷调照明',
    description: '冷调白光，营造极简主义冷静氛围',
    category: 'minimalist',
    tags: ['极简', '冷调', '现代'],
    lighting: { type: 'ambient', colorTemperature: 5500, intensity: 0.6, angle: 90, positionX: 0, positionY: 3, positionZ: 3.5 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '戏剧性聚光',
    description: '高对比度聚光，营造戏剧性视觉焦点',
    category: 'dramatic',
    tags: ['戏剧', '聚焦', '高对比'],
    lighting: { type: 'spotlight', colorTemperature: 2800, intensity: 0.9, angle: 25, positionX: 0, positionY: 2.8, positionZ: 2 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '自然光模拟',
    description: '模拟自然日光，呈现作品最真实的色彩',
    category: 'natural',
    tags: ['自然', '日光', '真实'],
    lighting: { type: 'floodlight', colorTemperature: 6500, intensity: 0.7, angle: 70, positionX: 0, positionY: 3, positionZ: 4 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
];

export const DEFAULT_MATERIAL_COMBOS: Omit<MaterialCombo, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '金色画框配哑光墙',
    description: '经典金色画框搭配深灰哑光墙，适合古典作品',
    category: 'classic_gallery',
    tags: ['经典', '金色', '哑光'],
    material: { frameMaterial: 'gold', wallMaterial: 'matte', reflectivity: 0.25, roughness: 0.75 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '现代白框白墙',
    description: '简洁白色画框配白墙，白盒子空间标准配置',
    category: 'white_cube',
    tags: ['现代', '白色', '极简'],
    material: { frameMaterial: 'none', wallMaterial: 'satin', reflectivity: 0.15, roughness: 0.6 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '工业金属水泥墙',
    description: '银色金属画框配水泥质感墙面，工业风格',
    category: 'industrial',
    tags: ['工业', '金属', '水泥'],
    material: { frameMaterial: 'metal', wallMaterial: 'concrete', reflectivity: 0.35, roughness: 0.8 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '温暖木纹配丝光墙',
    description: '深木色画框配丝光墙面，温暖雅致的展示效果',
    category: 'warm_wood',
    tags: ['温暖', '木质', '丝光'],
    material: { frameMaterial: 'wood', wallMaterial: 'satin', reflectivity: 0.3, roughness: 0.65 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '奢华金框高光墙',
    description: '金色画框配高光墙面，营造奢华典藏氛围',
    category: 'luxury',
    tags: ['奢华', '金色', '高光'],
    material: { frameMaterial: 'gold', wallMaterial: 'glossy', reflectivity: 0.5, roughness: 0.3 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '银色金属冷调',
    description: '银色金属画框配哑光墙，冷调现代风格',
    category: 'cool_metal',
    tags: ['冷调', '银色', '现代'],
    material: { frameMaterial: 'silver', wallMaterial: 'matte', reflectivity: 0.3, roughness: 0.7 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
  {
    name: '博物馆标准配置',
    description: '无框展示配专业博物馆墙面，最大化作品本身',
    category: 'modern_museum',
    tags: ['博物馆', '无框', '专业'],
    material: { frameMaterial: 'none', wallMaterial: 'matte', reflectivity: 0.1, roughness: 0.8 },
    artworkIds: [],
    useCount: 0,
    isPublic: true,
  },
];
