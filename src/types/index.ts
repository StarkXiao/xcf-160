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

export type CuratorHubTab = 'overview' | 'groups' | 'progress' | 'versions' | 'export' | 'proposal' | 'approval' | 'quotation';

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
  quotations: ExhibitionQuotation[];
  currentQuotationId: string | null;
  quotationConfig: QuotationConfig;
  favoriteLightingTemplateIds: string[];
  favoriteMaterialComboIds: string[];
  presetMarketTab: PresetMarketTab;
  presetMarketCategory: PresetMarketCategory;
  presetMarketSort: PresetSortType;
  venueConditions: VenueCondition[];
  currentVenueId: string | null;
  tourAdaptationResults: TourAdaptationResult[];
  currentTourAdaptationId: string | null;
  tourAdaptationConfig: TourAdaptationConfig;
  tourAdaptationPanelTab: TourAdaptationPanelTab;
  isPerformingAdaptation: boolean;
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
  { id: 'quotation', label: '布展报价' },
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
  isOfficial: boolean;
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
  isOfficial: boolean;
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

export type ActivePanel = 'lighting' | 'material' | 'compare' | 'storage' | 'scheme' | 'workstation' | 'wallConfig' | 'themeLibrary' | 'lightingTemplates' | 'materialCombos' | 'sceneRecommendations' | 'tourAdaptation';

export type ThemeLibraryTab = 'collections' | 'lighting' | 'materials' | 'scenes' | 'presetMarket';

export type PresetMarketTab = 'all' | 'official' | 'favorites';
export type PresetMarketCategory = 'lighting' | 'material' | 'all';
export type PresetSortType = 'popular' | 'latest' | 'name';

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
  { id: 'presetMarket', label: '预设市场', icon: 'Store' },
];

export const PRESET_MARKET_TABS: { id: PresetMarketTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'official', label: '官方模板' },
  { id: 'favorites', label: '我的收藏' },
];

export const PRESET_MARKET_CATEGORIES: { id: PresetMarketCategory; label: string }[] = [
  { id: 'all', label: '全部类型' },
  { id: 'lighting', label: '灯光模板' },
  { id: 'material', label: '材质组合' },
];

export const PRESET_SORT_TYPES: { id: PresetSortType; label: string }[] = [
  { id: 'popular', label: '热度优先' },
  { id: 'latest', label: '最新发布' },
  { id: 'name', label: '名称排序' },
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
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
    isOfficial: true,
  },
];

export type FrameMaterialGrade = 'economy' | 'standard' | 'premium' | 'luxury';

export interface FrameMaterialPricing {
  material: FrameMaterial;
  grade: FrameMaterialGrade;
  pricePerMeter: number;
  widthOptions: number[];
  description: string;
}

export interface GlassType {
  id: string;
  name: string;
  pricePerSquareMeter: number;
  uvProtection: number;
  antiGlare: boolean;
  description: string;
}

export interface MatBoard {
  id: string;
  name: string;
  color: string;
  pricePerSquareMeter: number;
  thickness: number;
  acidFree: boolean;
  description: string;
}

export interface LightingEquipment {
  id: string;
  name: string;
  type: LightType;
  brand: string;
  model: string;
  pricePerUnit: number;
  power: number;
  colorTemperatureRange: [number, number];
  beamAngleRange: [number, number];
  lifespan: number;
  description: string;
}

export interface ConstructionItem {
  id: string;
  name: string;
  category: 'wall' | 'floor' | 'ceiling' | 'electrical' | 'labor' | 'transport' | 'other';
  unit: 'item' | 'meter' | 'squareMeter' | 'hour' | 'personDay';
  unitPrice: number;
  description: string;
}

export interface ArtworkCostBreakdown {
  artworkId: string;
  artworkTitle: string;
  dimensions: { width: number; height: number; unit: string };
  frameCost: {
    material: FrameMaterial;
    grade: FrameMaterialGrade;
    perimeter: number;
    width: number;
    unitPrice: number;
    subtotal: number;
  };
  glassCost: {
    glassType: string;
    area: number;
    unitPrice: number;
    subtotal: number;
  };
  matBoardCost: {
    matBoard: string;
    area: number;
    borderWidth: number;
    unitPrice: number;
    subtotal: number;
  };
  lightingCost: {
    equipmentId: string;
    equipmentName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  mountingCost: {
    item: ConstructionItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  artworkTotal: number;
}

export interface SpaceCostBreakdown {
  wallTreatmentCost: {
    wallMaterial: WallMaterial;
    area: number;
    unitPrice: number;
    subtotal: number;
  };
  ambientLightingCost: {
    equipment: LightingEquipment;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  trackLightingCost: {
    length: number;
    unitPrice: number;
    subtotal: number;
  };
  electricalCost: {
    item: ConstructionItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  laborCost: {
    item: ConstructionItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  transportCost: {
    item: ConstructionItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  };
  otherCosts: {
    item: ConstructionItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  spaceTotal: number;
}

export interface QuotationSummary {
  artworkCosts: ArtworkCostBreakdown[];
  spaceCost: SpaceCostBreakdown;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  grandTotal: number;
}

export interface ExhibitionQuotation {
  id: string;
  projectId: string;
  schemeId: string;
  title: string;
  description?: string;
  artworkCosts: ArtworkCostBreakdown[];
  spaceCost: SpaceCostBreakdown;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  grandTotal: number;
  status: 'draft' | 'finalized' | 'sent' | 'approved' | 'rejected';
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  notes?: string;
}

export interface QuotationConfig {
  defaultFrameGrade: FrameMaterialGrade;
  defaultFrameWidth: number;
  defaultMatBorderWidth: number;
  defaultGlassType: string;
  defaultSpotlightType: string;
  defaultAmbientLightType: string;
  defaultWallMaterialPrice: Record<WallMaterial, number>;
  trackLightingPricePerMeter: number;
  taxRate: number;
  currency: string;
}

export const FRAME_MATERIAL_GRADE_LABELS: Record<FrameMaterialGrade, string> = {
  economy: '经济型',
  standard: '标准型',
  premium: '优质型',
  luxury: '奢华型',
};

export const FRAME_MATERIAL_PRICING: FrameMaterialPricing[] = [
  { material: 'wood', grade: 'economy', pricePerMeter: 80, widthOptions: [3, 4, 5], description: '松木材质，适合批量展览' },
  { material: 'wood', grade: 'standard', pricePerMeter: 150, widthOptions: [4, 5, 6], description: '胡桃木或橡木，质量稳定' },
  { material: 'wood', grade: 'premium', pricePerMeter: 280, widthOptions: [5, 6, 8], description: '珍贵实木，手工打磨' },
  { material: 'wood', grade: 'luxury', pricePerMeter: 500, widthOptions: [6, 8, 10], description: '定制高端实木，雕花工艺' },
  { material: 'metal', grade: 'economy', pricePerMeter: 60, widthOptions: [2, 3, 4], description: '铝合金材质，轻便耐用' },
  { material: 'metal', grade: 'standard', pricePerMeter: 120, widthOptions: [3, 4, 5], description: '拉丝铝合金，质感细腻' },
  { material: 'metal', grade: 'premium', pricePerMeter: 220, widthOptions: [4, 5, 6], description: '不锈钢材质，镜面抛光' },
  { material: 'metal', grade: 'luxury', pricePerMeter: 400, widthOptions: [5, 6, 8], description: '钛金属，航空级品质' },
  { material: 'gold', grade: 'standard', pricePerMeter: 200, widthOptions: [4, 5, 6], description: '金色喷涂，古典风格' },
  { material: 'gold', grade: 'premium', pricePerMeter: 350, widthOptions: [5, 6, 8], description: '金色电镀，持久保色' },
  { material: 'gold', grade: 'luxury', pricePerMeter: 600, widthOptions: [6, 8, 10], description: '24K金箔贴金，奢华典藏' },
  { material: 'silver', grade: 'standard', pricePerMeter: 180, widthOptions: [4, 5, 6], description: '银色喷涂，现代简约' },
  { material: 'silver', grade: 'premium', pricePerMeter: 320, widthOptions: [5, 6, 8], description: '镀银工艺，光亮如镜' },
  { material: 'silver', grade: 'luxury', pricePerMeter: 550, widthOptions: [6, 8, 10], description: '纯银镀层，收藏级品质' },
  { material: 'none', grade: 'economy', pricePerMeter: 20, widthOptions: [0], description: '无框装裱，仅画布处理' },
  { material: 'none', grade: 'standard', pricePerMeter: 40, widthOptions: [0], description: '无框装裱，专业画布处理' },
];

export const GLASS_TYPES: GlassType[] = [
  { id: 'regular', name: '普通玻璃', pricePerSquareMeter: 80, uvProtection: 0, antiGlare: false, description: '标准透明玻璃' },
  { id: 'uv', name: '防紫外线玻璃', pricePerSquareMeter: 180, uvProtection: 99, antiGlare: false, description: '阻挡99%紫外线，保护艺术品' },
  { id: 'museum', name: '博物馆级玻璃', pricePerSquareMeter: 350, uvProtection: 99, antiGlare: true, description: '防眩光+防紫外线，专业博物馆标准' },
  { id: 'acrylic', name: '亚克力板', pricePerSquareMeter: 120, uvProtection: 90, antiGlare: false, description: '轻便安全，适合运输' },
  { id: 'none', name: '无玻璃', pricePerSquareMeter: 0, uvProtection: 0, antiGlare: false, description: '不使用玻璃，直接展示' },
];

export const MAT_BOARDS: MatBoard[] = [
  { id: 'white', name: '白色卡纸', color: '#FFFFFF', pricePerSquareMeter: 50, thickness: 1.5, acidFree: false, description: '标准白色卡纸' },
  { id: 'cream', name: '米白卡纸', color: '#FFFDD0', pricePerSquareMeter: 60, thickness: 1.5, acidFree: false, description: '温暖米白色' },
  { id: 'black', name: '黑色卡纸', color: '#1a1a1a', pricePerSquareMeter: 60, thickness: 1.5, acidFree: false, description: '经典黑色' },
  { id: 'acid-free-white', name: '无酸白纸', color: '#FFFFFF', pricePerSquareMeter: 120, thickness: 2, acidFree: true, description: '博物馆级无酸卡纸，永久保存' },
  { id: 'acid-free-cream', name: '无酸米白', color: '#FFFDD0', pricePerSquareMeter: 130, thickness: 2, acidFree: true, description: '无酸材质，适合长期收藏' },
  { id: 'none', name: '无卡纸', color: 'transparent', pricePerSquareMeter: 0, thickness: 0, acidFree: false, description: '不使用卡纸' },
];

export const LIGHTING_EQUIPMENT: LightingEquipment[] = [
  {
    id: 'spot-economy',
    name: '经济型LED轨道射灯',
    type: 'spotlight',
    brand: '国产品牌',
    model: 'LED-SPOT-10W',
    pricePerUnit: 280,
    power: 10,
    colorTemperatureRange: [3000, 5000],
    beamAngleRange: [15, 45],
    lifespan: 30000,
    description: '基础款LED射灯，适合临时展览',
  },
  {
    id: 'spot-standard',
    name: '标准型LED轨道射灯',
    type: 'spotlight',
    brand: '飞利浦',
    model: 'ST-30',
    pricePerUnit: 680,
    power: 30,
    colorTemperatureRange: [2700, 6500],
    beamAngleRange: [10, 60],
    lifespan: 50000,
    description: '高品质LED，显色指数Ra>95',
  },
  {
    id: 'spot-premium',
    name: '专业级博物馆射灯',
    type: 'spotlight',
    brand: 'ERCO',
    model: 'Museum-Spot-50W',
    pricePerUnit: 2500,
    power: 50,
    colorTemperatureRange: [2700, 5700],
    beamAngleRange: [8, 80],
    lifespan: 60000,
    description: '德国专业博物馆级，精确控光，紫外线过滤',
  },
  {
    id: 'flood-economy',
    name: '经济型LED泛光灯',
    type: 'floodlight',
    brand: '国产品牌',
    model: 'LED-FLOOD-20W',
    pricePerUnit: 350,
    power: 20,
    colorTemperatureRange: [3000, 5000],
    beamAngleRange: [60, 120],
    lifespan: 30000,
    description: '基础款LED泛光灯，均匀照明',
  },
  {
    id: 'flood-standard',
    name: '标准型LED泛光灯',
    type: 'floodlight',
    brand: '飞利浦',
    model: 'FL-50',
    pricePerUnit: 850,
    power: 50,
    colorTemperatureRange: [2700, 6500],
    beamAngleRange: [40, 120],
    lifespan: 50000,
    description: '高品质泛光照明，均匀无暗区',
  },
  {
    id: 'ambient-standard',
    name: '标准环境照明',
    type: 'ambient',
    brand: '欧普',
    model: 'AMBIENT-40W',
    pricePerUnit: 450,
    power: 40,
    colorTemperatureRange: [3000, 6000],
    beamAngleRange: [120, 180],
    lifespan: 40000,
    description: '均匀环境照明，营造舒适观展氛围',
  },
  {
    id: 'ambient-premium',
    name: '专业环境照明系统',
    type: 'ambient',
    brand: 'ERCO',
    model: 'Ambient-Pro-60W',
    pricePerUnit: 1800,
    power: 60,
    colorTemperatureRange: [2700, 6500],
    beamAngleRange: [90, 180],
    lifespan: 60000,
    description: '专业级环境光，无缝拼接，无级调光',
  },
];

export const CONSTRUCTION_ITEMS: ConstructionItem[] = [
  { id: 'wall-paint', name: '墙面刷漆', category: 'wall', unit: 'squareMeter', unitPrice: 80, description: '墙面清理+底漆+面漆' },
  { id: 'wall-paper', name: '墙布铺贴', category: 'wall', unit: 'squareMeter', unitPrice: 150, description: '专业展览墙布' },
  { id: 'wall-panel', name: '木饰面板', category: 'wall', unit: 'squareMeter', unitPrice: 350, description: '高密度木饰面板' },
  { id: 'track-install', name: '轨道安装', category: 'electrical', unit: 'meter', unitPrice: 120, description: '三线轨道含配件' },
  { id: 'wiring', name: '电路改造', category: 'electrical', unit: 'meter', unitPrice: 80, description: '国标铜线+穿管' },
  { id: 'mounting-artwork', name: '作品装挂', category: 'labor', unit: 'item', unitPrice: 150, description: '专业挂钩+水平调整' },
  { id: 'install-lighting', name: '灯具安装调试', category: 'labor', unit: 'item', unitPrice: 100, description: '灯具安装+角度调试' },
  { id: 'technician', name: '技术工人', category: 'labor', unit: 'personDay', unitPrice: 600, description: '持证电工/木工' },
  { id: 'curator', name: '策展顾问', category: 'labor', unit: 'personDay', unitPrice: 1500, description: '专业策展指导' },
  { id: 'transport-small', name: '小型运输', category: 'transport', unit: 'item', unitPrice: 300, description: '市内小型货车' },
  { id: 'transport-large', name: '大型运输', category: 'transport', unit: 'item', unitPrice: 800, description: '专业艺术品运输车' },
  { id: 'packing', name: '专业包装', category: 'other', unit: 'item', unitPrice: 200, description: '防震+防潮+定制木箱' },
  { id: 'insurance', name: '运输保险', category: 'other', unit: 'item', unitPrice: 500, description: '艺术品运输保险' },
  { id: 'cleaning', name: '现场清洁', category: 'other', unit: 'squareMeter', unitPrice: 15, description: '展后清洁复原' },
];

export const DEFAULT_WALL_MATERIAL_PRICES: Record<WallMaterial, number> = {
  matte: 80,
  satin: 100,
  glossy: 120,
  concrete: 200,
};

export const DEFAULT_QUOTATION_CONFIG: QuotationConfig = {
  defaultFrameGrade: 'standard',
  defaultFrameWidth: 5,
  defaultMatBorderWidth: 8,
  defaultGlassType: 'uv',
  defaultSpotlightType: 'spot-standard',
  defaultAmbientLightType: 'ambient-standard',
  defaultWallMaterialPrice: DEFAULT_WALL_MATERIAL_PRICES,
  trackLightingPricePerMeter: 150,
  taxRate: 0.13,
  currency: 'CNY',
};

export const QUOTATION_STATUS_LABELS: Record<ExhibitionQuotation['status'], string> = {
  draft: '草稿',
  finalized: '已确认',
  sent: '已发送',
  approved: '已批准',
  rejected: '已驳回',
};

export const QUOTATION_STATUS_COLORS: Record<ExhibitionQuotation['status'], string> = {
  draft: 'bg-gray-500',
  finalized: 'bg-blue-500',
  sent: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

export const CONSTRUCTION_CATEGORY_LABELS: Record<ConstructionItem['category'], string> = {
  wall: '墙面工程',
  floor: '地面工程',
  ceiling: '天花工程',
  electrical: '电气工程',
  labor: '人工费用',
  transport: '运输费用',
  other: '其他费用',
};

export const CONSTRUCTION_UNIT_LABELS: Record<ConstructionItem['unit'], string> = {
  item: '件',
  meter: '米',
  squareMeter: '平方米',
  hour: '小时',
  personDay: '人天',
};

export type VenueType = 'museum' | 'gallery' | 'cultural_center' | 'shopping_mall' | 'outdoor' | 'custom';
export type WallStructure = 'solid' | 'plasterboard' | 'glass' | 'mobile' | 'brick';
export type PowerType = 'single_phase' | 'three_phase' | 'solar' | 'generator';
export type CompatibilityLevel = 'compatible' | 'warning' | 'incompatible' | 'requires_adjustment';

export interface VenueCondition {
  id: string;
  name: string;
  venueType: VenueType;
  venuePhotoUrl?: string;
  
  wallDimensions: WallDimensions;
  ceilingHeight: number;
  wallStructure: WallStructure;
  maxLoadPerSquareMeter: number;
  
  ambientLightLevel: number;
  hasNaturalLight: boolean;
  naturalLightDirection?: 'north' | 'south' | 'east' | 'west' | 'multiple';
  hasWindowCoverings: boolean;
  
  powerType: PowerType;
  totalPowerCapacity: number;
  hasDimmingSystem: boolean;
  trackLightingAvailable: boolean;
  trackLength?: number;
  
  temperatureRange: [number, number];
  humidityRange: [number, number];
  hasClimateControl: boolean;
  hasUVProtection: boolean;
  
  viewingDistanceMin: number;
  viewingDistanceMax: number;
  trafficFlow: 'low' | 'medium' | 'high';
  hasSecuritySystem: boolean;
  
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MountingAdjustment {
  wallArtworkId: string;
  artworkId: string;
  artworkTitle: string;
  
  originalPosition: WallPosition;
  adjustedPosition: WallPosition;
  
  centerLineHeight: number;
  bottomMargin: number;
  topMargin: number;
  
  spacingToLeft: number;
  spacingToRight: number;
  spacingToTop: number;
  spacingToBottom: number;
  
  requiresReinforcement: boolean;
  reinforcementType?: 'anchor' | 'bracket' | 'stand';
  estimatedWeight: number;
  
  adjustmentReason: string;
}

export interface LightingAdjustment {
  wallArtworkId: string;
  artworkId: string;
  artworkTitle: string;
  
  originalLighting: LightingConfig;
  adjustedLighting: LightingConfig;
  
  recommendedFixtureCount: number;
  recommendedFixtureType: LightType;
  mountingHeight: number;
  horizontalOffset: number;
  
  glareRisk: 'low' | 'medium' | 'high';
  uvExposure: 'low' | 'medium' | 'high';
  
  powerConsumption: number;
  heatOutput: number;
  
  adjustmentReason: string;
}

export interface CompatibilityHint {
  id: string;
  level: CompatibilityLevel;
  category: 'mounting' | 'lighting' | 'power' | 'environment' | 'safety' | 'weight' | 'transport';
  title: string;
  description: string;
  suggestion: string;
  affectedArtworkIds?: string[];
  estimatedCostImpact?: number;
  estimatedTimeImpact?: number;
}

export interface TourAdaptationResult {
  id: string;
  schemeId: string;
  venueId: string;
  venueName: string;
  
  mountingAdjustments: MountingAdjustment[];
  lightingAdjustments: LightingAdjustment[];
  compatibilityHints: CompatibilityHint[];
  
  overallCompatibility: CompatibilityLevel;
  compatibilityScore: number;
  
  totalPowerRequired: number;
  totalWeightEstimate: number;
  estimatedInstallationTime: number;
  
  notes?: string;
  createdAt: number;
}

export interface TourAdaptationConfig {
  standardCenterLineHeight: number;
  minBottomMargin: number;
  minTopMargin: number;
  minSpacingHorizontal: number;
  minSpacingVertical: number;
  maxArtworksPerWall: number;
  maxLoadPerAnchor: number;
  safetyFactor: number;
  glareThreshold: number;
  maxColorTemperatureShift: number;
}

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  museum: '博物馆',
  gallery: '画廊',
  cultural_center: '文化中心',
  shopping_mall: '商业空间',
  outdoor: '户外场地',
  custom: '自定义场地',
};

export const WALL_STRUCTURE_LABELS: Record<WallStructure, string> = {
  solid: '实体墙',
  plasterboard: '石膏板墙',
  glass: '玻璃墙',
  mobile: '移动展墙',
  brick: '砖墙',
};

export const POWER_TYPE_LABELS: Record<PowerType, string> = {
  single_phase: '单相电',
  three_phase: '三相电',
  solar: '太阳能',
  generator: '发电机',
};

export const COMPATIBILITY_LEVEL_LABELS: Record<CompatibilityLevel, string> = {
  compatible: '完全兼容',
  warning: '需要注意',
  requires_adjustment: '需要调整',
  incompatible: '不兼容',
};

export const COMPATIBILITY_LEVEL_COLORS: Record<CompatibilityLevel, string> = {
  compatible: 'text-green-400 bg-green-400/10 border-green-400/30',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  requires_adjustment: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  incompatible: 'text-red-400 bg-red-400/10 border-red-400/30',
};

export const DEFAULT_TOUR_ADAPTATION_CONFIG: TourAdaptationConfig = {
  standardCenterLineHeight: 150,
  minBottomMargin: 80,
  minTopMargin: 50,
  minSpacingHorizontal: 30,
  minSpacingVertical: 30,
  maxArtworksPerWall: 20,
  maxLoadPerAnchor: 20,
  safetyFactor: 1.5,
  glareThreshold: 0.7,
  maxColorTemperatureShift: 500,
};

export const DEFAULT_VENUE_CONDITION: Omit<VenueCondition, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  venueType: 'gallery',
  wallDimensions: { ...DEFAULT_WALL_DIMENSIONS },
  ceilingHeight: 400,
  wallStructure: 'solid',
  maxLoadPerSquareMeter: 50,
  ambientLightLevel: 200,
  hasNaturalLight: false,
  hasWindowCoverings: true,
  powerType: 'single_phase',
  totalPowerCapacity: 5000,
  hasDimmingSystem: true,
  trackLightingAvailable: true,
  trackLength: 800,
  temperatureRange: [18, 25],
  humidityRange: [40, 60],
  hasClimateControl: true,
  hasUVProtection: true,
  viewingDistanceMin: 100,
  viewingDistanceMax: 300,
  trafficFlow: 'medium',
  hasSecuritySystem: true,
};

export const MOCK_VENUE_CONDITIONS: Omit<VenueCondition, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '北京当代美术馆 - 主展厅',
    venueType: 'museum',
    wallDimensions: { width: 1200, height: 450, unit: 'cm' },
    ceilingHeight: 600,
    wallStructure: 'solid',
    maxLoadPerSquareMeter: 80,
    ambientLightLevel: 150,
    hasNaturalLight: false,
    hasWindowCoverings: true,
    powerType: 'three_phase',
    totalPowerCapacity: 20000,
    hasDimmingSystem: true,
    trackLightingAvailable: true,
    trackLength: 1500,
    temperatureRange: [20, 24],
    humidityRange: [45, 55],
    hasClimateControl: true,
    hasUVProtection: true,
    viewingDistanceMin: 150,
    viewingDistanceMax: 500,
    trafficFlow: 'high',
    hasSecuritySystem: true,
    notes: '专业博物馆级展厅，配备完整的安保和环境控制系统',
  },
  {
    name: '798艺术区画廊空间',
    venueType: 'gallery',
    wallDimensions: { width: 800, height: 350, unit: 'cm' },
    ceilingHeight: 450,
    wallStructure: 'brick',
    maxLoadPerSquareMeter: 60,
    ambientLightLevel: 250,
    hasNaturalLight: true,
    naturalLightDirection: 'north',
    hasWindowCoverings: true,
    powerType: 'single_phase',
    totalPowerCapacity: 8000,
    hasDimmingSystem: true,
    trackLightingAvailable: true,
    trackLength: 1000,
    temperatureRange: [18, 26],
    humidityRange: [40, 65],
    hasClimateControl: true,
    hasUVProtection: true,
    viewingDistanceMin: 100,
    viewingDistanceMax: 300,
    trafficFlow: 'medium',
    hasSecuritySystem: true,
    notes: '典型商业画廊空间，北向自然光柔和稳定',
  },
  {
    name: '城市文化中心临展厅',
    venueType: 'cultural_center',
    wallDimensions: { width: 1000, height: 400, unit: 'cm' },
    ceilingHeight: 500,
    wallStructure: 'plasterboard',
    maxLoadPerSquareMeter: 30,
    ambientLightLevel: 300,
    hasNaturalLight: true,
    naturalLightDirection: 'multiple',
    hasWindowCoverings: true,
    powerType: 'three_phase',
    totalPowerCapacity: 15000,
    hasDimmingSystem: false,
    trackLightingAvailable: false,
    temperatureRange: [16, 28],
    humidityRange: [35, 70],
    hasClimateControl: true,
    hasUVProtection: false,
    viewingDistanceMin: 80,
    viewingDistanceMax: 400,
    trafficFlow: 'high',
    hasSecuritySystem: true,
    notes: '临展厅为轻质隔墙，承重有限，需特别注意挂装安全',
  },
  {
    name: '购物中心艺术长廊',
    venueType: 'shopping_mall',
    wallDimensions: { width: 600, height: 300, unit: 'cm' },
    ceilingHeight: 350,
    wallStructure: 'plasterboard',
    maxLoadPerSquareMeter: 20,
    ambientLightLevel: 500,
    hasNaturalLight: true,
    naturalLightDirection: 'south',
    hasWindowCoverings: false,
    powerType: 'single_phase',
    totalPowerCapacity: 5000,
    hasDimmingSystem: false,
    trackLightingAvailable: true,
    trackLength: 600,
    temperatureRange: [22, 26],
    humidityRange: [45, 60],
    hasClimateControl: true,
    hasUVProtection: false,
    viewingDistanceMin: 50,
    viewingDistanceMax: 200,
    trafficFlow: 'high',
    hasSecuritySystem: false,
    notes: '商业空间人流量大，环境光强，需要加强灯光对比度',
  },
  {
    name: '城市公园户外展墙',
    venueType: 'outdoor',
    wallDimensions: { width: 1500, height: 300, unit: 'cm' },
    ceilingHeight: 500,
    wallStructure: 'mobile',
    maxLoadPerSquareMeter: 15,
    ambientLightLevel: 1000,
    hasNaturalLight: true,
    naturalLightDirection: 'multiple',
    hasWindowCoverings: false,
    powerType: 'generator',
    totalPowerCapacity: 3000,
    hasDimmingSystem: false,
    trackLightingAvailable: false,
    temperatureRange: [5, 35],
    humidityRange: [30, 90],
    hasClimateControl: false,
    hasUVProtection: false,
    viewingDistanceMin: 150,
    viewingDistanceMax: 500,
    trafficFlow: 'medium',
    hasSecuritySystem: false,
    notes: '户外展览需考虑天气因素，建议使用全天候展示材料',
  },
];

export type TourAdaptationPanelTab = 'venue' | 'mounting' | 'lighting' | 'compatibility';

export const TOUR_ADAPTATION_PANEL_TABS: { id: TourAdaptationPanelTab; label: string; icon: string }[] = [
  { id: 'venue', label: '场馆条件', icon: 'Building2' },
  { id: 'mounting', label: '挂装调整', icon: 'Ruler' },
  { id: 'lighting', label: '灯光调整', icon: 'Lightbulb' },
  { id: 'compatibility', label: '兼容提示', icon: 'AlertTriangle' },
];
