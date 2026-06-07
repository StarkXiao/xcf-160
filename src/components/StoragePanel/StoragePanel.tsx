import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  Archive,
  Settings,
  FileJson,
  UploadCloud,
  ChevronRight,
  AlertCircle,
  Wrench,
  Copy,
  ArrowRight,
  X,
  FolderOpen,
  Layers,
  FileText,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  validateImportData,
  downloadBackup,
} from '../../utils/storage';
import type {
  StorageConflict,
  ConflictResolutionStrategy,
  ImportValidationResult,
  StorageOperationType,
} from '../../types';

type StorageTab = 'management' | 'backups' | 'import' | 'health';

const TAB_CONFIG: Record<StorageTab, { label: string; icon: React.ElementType }> = {
  management: { label: '管理', icon: Settings },
  backups: { label: '备份', icon: Archive },
  import: { label: '导入', icon: Upload },
  health: { label: '健康', icon: Shield },
};

const STRATEGY_LABELS: Record<ConflictResolutionStrategy, string> = {
  keepLocal: '保留本地',
  keepImported: '使用导入',
  merge: '合并数据',
  renameImported: '重命名导入',
  skip: '跳过',
};

const OPERATION_TYPE_LABELS: Record<StorageOperationType, string> = {
  createBackup: '创建备份',
  restoreBackup: '恢复备份',
  deleteBackup: '删除备份',
  createSnapshot: '创建快照',
  restoreSnapshot: '恢复快照',
  importData: '导入数据',
  exportData: '导出数据',
  autoRecovery: '自动恢复',
  migration: '数据迁移',
  healthCheck: '健康检查',
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const StoragePanel: React.FC = () => {
  const {
    storageHealth,
    storageMetadata,
    backups,
    snapshots,
    activeStorageTab,
    setActiveStorageTab,
    refreshFromStorage,
    createStorageBackup,
    restoreStorageBackup,
    deleteStorageBackup,
    createStorageSnapshot,
    restoreStorageSnapshot,
    importStorageData,
    exportStorageData,
    runStorageAutoRecovery,
    runStorageMigration,
    storageOperationResult,
    clearStorageOperationResult,
    presets,
    gallerySchemes,
    curatorProjects,
    lightingTemplates,
    materialCombos,
  } = useAppStore();

  const [showCreateBackupDialog, setShowCreateBackupDialog] = useState(false);
  const [showRestoreConfirmDialog, setShowRestoreConfirmDialog] = useState<string | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null);
  const [conflicts, setConflicts] = useState<StorageConflict[]>([]);
  const [conflictStrategies, setConflictStrategies] = useState<Record<string, ConflictResolutionStrategy>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showOperationResult, setShowOperationResult] = useState(false);

  useEffect(() => {
    if (storageOperationResult) {
      setShowOperationResult(true);
      const timer = setTimeout(() => {
        setShowOperationResult(false);
        clearStorageOperationResult();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storageOperationResult, clearStorageOperationResult]);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  const handleCreateBackup = () => {
    if (!backupName.trim()) return;
    createStorageBackup(backupName.trim(), backupDescription.trim() || undefined);
    setBackupName('');
    setBackupDescription('');
    setShowCreateBackupDialog(false);
  };

  const handleRestoreBackup = (backupId: string) => {
    restoreStorageBackup(backupId);
    setShowRestoreConfirmDialog(null);
  };

  const handleDeleteBackup = (backupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个备份吗？')) {
      deleteStorageBackup(backupId);
    }
  };

  const handleDownloadBackup = (backupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadBackup(backupId);
  };

  const handleCreateSnapshot = () => {
    createStorageSnapshot();
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    if (confirm('确定要恢复到此快照吗？这将覆盖当前所有数据。')) {
      restoreStorageSnapshot(snapshotId);
    }
  };

  const handleExportAll = () => {
    const name = `all_data_${Date.now()}`;
    exportStorageData(name);
  };

  const handleRunMigration = () => {
    runStorageMigration();
  };

  const handleRunAutoRecovery = () => {
    setIsRecovering(true);
    setTimeout(() => {
      runStorageAutoRecovery();
      setIsRecovering(false);
    }, 1000);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) {
      return;
    }
    setImportFile(file);
    setImportValidation(null);
    setConflicts([]);
    setConflictStrategies({});

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const validation = validateImportData(data);
        setImportValidation(validation);
        setConflicts(validation.conflicts);
      } catch {
        setImportValidation({
          isValid: false,
          errors: [{ field: 'file', message: '文件解析失败', code: 'invalid_type', severity: 'error' }],
          warnings: [],
          fixedCount: 0,
          needsMigration: false,
          canImport: false,
          conflicts: [],
          statistics: { totalItems: 0, validItems: 0, invalidItems: 0, conflictingItems: 0 },
        });
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleConflictStrategyChange = (conflictKey: string, strategy: ConflictResolutionStrategy) => {
    setConflictStrategies((prev) => ({ ...prev, [conflictKey]: strategy }));
  };

  const handleApplyConflictResolutions = () => {
    setShowConflictDialog(false);
    handleImport();
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);

    await importStorageData(importFile, conflictStrategies);

    setIsImporting(false);
    setImportFile(null);
    setImportValidation(null);
    setConflicts([]);
    setConflictStrategies({});
  };

  const handleCheckHealth = () => {
    setIsCheckingHealth(true);
    setTimeout(() => {
      refreshFromStorage();
      setIsCheckingHealth(false);
    }, 1000);
  };

  const handleOneClickFix = () => {
    if (!confirm('这将执行自动恢复和数据迁移，确定继续吗？')) return;
    handleRunAutoRecovery();
    handleRunMigration();
    handleCheckHealth();
  };

  const getHealthStatusColor = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal': return 'text-green-400';
      case 'warning': return 'text-warm';
      case 'error': return 'text-red-400';
    }
  };

  const getHealthStatusIcon = (status: 'normal' | 'warning' | 'error') => {
    switch (status) {
      case 'normal': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
    }
  };

  const renderHealthCheckItem = (
    title: string,
    description: string,
    status: 'normal' | 'warning' | 'error',
    detail?: string
  ) => {
    const Icon = getHealthStatusIcon(status);
    return (
      <div className="flex items-start gap-3 p-3 bg-gallery-bg/50 rounded-lg">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getHealthStatusColor(status)}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              status === 'normal' ? 'bg-green-500/20 text-green-400' :
              status === 'warning' ? 'bg-warm/20 text-warm' :
              'bg-red-500/20 text-red-400'
            }`}>
              {status === 'normal' ? '正常' : status === 'warning' ? '警告' : '错误'}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">{description}</p>
          {detail && <p className="text-xs text-white/40 mt-1">{detail}</p>}
        </div>
      </div>
    );
  };

  const healthCheckItems = (): Array<{ title: string; description: string; status: 'normal' | 'warning' | 'error'; detail?: string }> => {
    const items: Array<{ title: string; description: string; status: 'normal' | 'warning' | 'error'; detail?: string }> = [];

    if (storageHealth) {
      items.push({
        title: '数据完整性',
        description: '检查存储数据是否完整且格式正确',
        status: storageHealth.corruptedKeys.length > 0 ? 'error' : 'normal',
        detail: storageHealth.corruptedKeys.length > 0
          ? `检测到 ${storageHealth.corruptedKeys.length} 个损坏的键: ${storageHealth.corruptedKeys.join(', ')}`
          : '所有数据键完整有效',
      });

      items.push({
        title: '备份状态',
        description: '检查是否有近期备份',
        status: storageHealth.hasRecentBackup ? 'normal' : 'warning',
        detail: storageHealth.hasRecentBackup ? '最近24小时内有备份' : '建议尽快创建备份',
      });

      items.push({
        title: '数据版本',
        description: '检查数据 schema 版本是否最新',
        status: storageHealth.needsMigration ? 'warning' : 'normal',
        detail: storageHealth.needsMigration
          ? `需要从 v${storageHealth.currentSchemaVersion} 迁移到 v${storageHealth.latestSchemaVersion}`
          : `当前版本 v${storageHealth.currentSchemaVersion} 已是最新`,
      });

      if (storageHealth.recommendations.length > 0) {
        items.push({
          title: '优化建议',
          description: '存储系统的优化建议',
          status: storageHealth.isHealthy ? 'normal' : 'warning',
          detail: storageHealth.recommendations.join('; '),
        });
      }
    }

    items.push({
      title: '预设数据',
      description: '检查预设数据有效性',
      status: presets.length >= 0 ? 'normal' : 'error',
      detail: `共 ${presets.length} 个预设`,
    });

    items.push({
      title: '方案数据',
      description: '检查展览方案数据有效性',
      status: gallerySchemes.length >= 0 ? 'normal' : 'error',
      detail: `共 ${gallerySchemes.length} 个方案`,
    });

    items.push({
      title: '项目数据',
      description: '检查策展项目数据有效性',
      status: curatorProjects.length >= 0 ? 'normal' : 'error',
      detail: `共 ${curatorProjects.length} 个项目`,
    });

    items.push({
      title: '模板数据',
      description: '检查模板和组合数据有效性',
      status: lightingTemplates.length >= 0 && materialCombos.length >= 0 ? 'normal' : 'error',
      detail: `共 ${lightingTemplates.length} 个灯光模板, ${materialCombos.length} 个材质组合`,
    });

    return items;
  };

  const stats = [
    { label: '预设数', value: presets.length, icon: Layers },
    { label: '方案数', value: gallerySchemes.length, icon: FileText },
    { label: '项目数', value: curatorProjects.length, icon: FolderOpen },
    { label: '模板数', value: lightingTemplates.length + materialCombos.length, icon: Copy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-gold" />
          存储管理
        </h3>
        {storageMetadata && (
          <span className="text-xs text-white/40">
            已使用 {formatSize(storageMetadata.dataSize)}
          </span>
        )}
      </div>

      <AnimatePresence>
        {showOperationResult && storageOperationResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
              storageOperationResult.success
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            {storageOperationResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                storageOperationResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {OPERATION_TYPE_LABELS[storageOperationResult.type]}
                {storageOperationResult.success ? '成功' : '失败'}
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                {storageOperationResult.message}
              </p>
            </div>
            <button
              onClick={() => {
                setShowOperationResult(false);
                clearStorageOperationResult();
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1 mb-4 p-1 bg-gallery-bg rounded-lg">
        {(Object.keys(TAB_CONFIG) as StorageTab[]).map((tab) => {
          const { label, icon: Icon } = TAB_CONFIG[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveStorageTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeStorageTab === tab
                  ? 'bg-gold text-gallery-bg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeStorageTab === 'management' && (
          <motion.div
            key="management"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto pr-1 space-y-4"
          >
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                {storageHealth ? (
                  <>
                    {storageHealth.isHealthy ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warm" />
                    )}
                    <h4 className="font-medium text-white">
                      {storageHealth.isHealthy ? '存储状态良好' : '存储需要关注'}
                    </h4>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 text-white/40 animate-spin" />
                    <h4 className="font-medium text-white/60">正在检查状态...</h4>
                  </>
                )}
              </div>
              {storageHealth && storageHealth.recommendations.length > 0 && (
                <div className="space-y-1">
                  {storageHealth.recommendations.slice(0, 2).map((rec, i) => (
                    <p key={i} className="text-xs text-warm flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {rec}
                    </p>
                  ))}
                </div>
              )}
              <button
                onClick={handleCheckHealth}
                disabled={isCheckingHealth}
                className="mt-3 w-full btn-secondary text-xs py-1.5 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                {isCheckingHealth ? '检查中...' : '重新检查'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-gold/70" />
                    <span className="text-xs text-white/50">{label}</span>
                  </div>
                  <p className="text-2xl font-display font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            {storageMetadata && (
              <div className="card p-3">
                <h4 className="text-sm font-medium text-white mb-2">存储信息</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">数据大小</span>
                    <span className="text-white">{formatSize(storageMetadata.dataSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">项目总数</span>
                    <span className="text-white">{storageMetadata.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Schema 版本</span>
                    <span className="text-white">v{storageMetadata.schemaVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">最后更新</span>
                    <span className="text-white">{formatDate(storageMetadata.updatedAt)}</span>
                  </div>
                  {storageMetadata.lastBackupAt && (
                    <div className="flex justify-between">
                      <span className="text-white/50">最后备份</span>
                      <span className="text-white">{formatDate(storageMetadata.lastBackupAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card p-4">
              <h4 className="text-sm font-medium text-white mb-3">快速操作</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCreateBackupDialog(true)}
                  className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  创建备份
                </button>
                <button
                  onClick={handleCreateSnapshot}
                  className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  创建快照
                </button>
                <button
                  onClick={handleExportAll}
                  className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  导出全部
                </button>
                <button
                  onClick={handleRunMigration}
                  className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  数据迁移
                </button>
                <button
                  onClick={handleRunAutoRecovery}
                  disabled={isRecovering}
                  className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5 col-span-2"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRecovering ? 'animate-spin' : ''}`} />
                  {isRecovering ? '恢复中...' : '执行自动恢复'}
                </button>
              </div>
            </div>

            {snapshots.length > 0 && (
              <div className="card p-4">
                <h4 className="text-sm font-medium text-white mb-3">最近快照</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {snapshots.slice(-3).reverse().map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="flex items-center justify-between p-2 bg-gallery-bg/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-xs text-white">{formatDate(snapshot.timestamp)}</span>
                      </div>
                      <button
                        onClick={() => handleRestoreSnapshot(snapshot.id)}
                        className="text-xs text-gold hover:text-gold-light transition-colors"
                      >
                        恢复
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeStorageTab === 'backups' && (
          <motion.div
            key="backups"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto pr-1 space-y-4"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateBackupDialog(true)}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                新建备份
              </button>
              <button
                onClick={refreshFromStorage}
                className="btn-secondary px-3"
                title="刷新列表"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-8 h-8 text-white/30" />
                </div>
                <p className="text-white/60 mb-1">暂无备份</p>
                <p className="text-sm text-white/40">点击上方按钮创建第一个备份</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backups.slice().reverse().map((backup) => (
                  <motion.div
                    key={backup.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-3"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-white text-sm truncate">{backup.name}</h5>
                          {backup.isAutoBackup && (
                            <span className="text-xs px-1.5 py-0.5 bg-cool/20 text-cool rounded flex-shrink-0">
                              自动
                            </span>
                          )}
                        </div>
                        {backup.description && (
                          <p className="text-xs text-white/50 truncate mb-1">{backup.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(backup.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatSize(backup.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRestoreConfirmDialog(backup.id)}
                        className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        恢复
                      </button>
                      <button
                        onClick={(e) => handleDownloadBackup(backup.id, e)}
                        className="btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBackup(backup.id, e)}
                        className="btn-secondary text-xs py-1.5 px-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeStorageTab === 'import' && (
          <motion.div
            key="import"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto pr-1 space-y-4"
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`card p-8 text-center cursor-pointer transition-all ${
                isDragging ? 'border-gold bg-gold/5' : 'hover:border-gold/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className={`w-16 h-16 rounded-full ${isDragging ? 'bg-gold/20' : 'bg-gallery-border'} flex items-center justify-center mx-auto mb-4 transition-colors`}>
                <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-gold' : 'text-white/30'}`} />
              </div>
              <p className="text-white/60 mb-1">
                {isDragging ? '松开以选择文件' : '拖放 JSON 文件到此处'}
              </p>
              <p className="text-sm text-white/40">或点击选择文件</p>
            </div>

            {importFile && (
              <div className="card p-3">
                <div className="flex items-center gap-3">
                  <FileJson className="w-8 h-8 text-gold flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{importFile.name}</p>
                    <p className="text-xs text-white/50">{formatSize(importFile.size)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setImportFile(null);
                      setImportValidation(null);
                      setConflicts([]);
                    }}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {importValidation && (
              <div className="card p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  {importValidation.canImport ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  校验结果
                </h4>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gallery-bg/50 rounded-lg p-2 text-center">
                    <p className="text-lg font-display font-semibold text-white">
                      {importValidation.statistics.totalItems}
                    </p>
                    <p className="text-xs text-white/50">总项目数</p>
                  </div>
                  <div className="bg-gallery-bg/50 rounded-lg p-2 text-center">
                    <p className={`text-lg font-display font-semibold ${
                      importValidation.statistics.invalidItems > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {importValidation.statistics.validItems}
                    </p>
                    <p className="text-xs text-white/50">有效项目</p>
                  </div>
                  <div className="bg-gallery-bg/50 rounded-lg p-2 text-center">
                    <p className={`text-lg font-display font-semibold ${
                      importValidation.statistics.conflictingItems > 0 ? 'text-warm' : 'text-green-400'
                    }`}>
                      {importValidation.statistics.conflictingItems}
                    </p>
                    <p className="text-xs text-white/50">冲突项目</p>
                  </div>
                  <div className="bg-gallery-bg/50 rounded-lg p-2 text-center">
                    <p className={`text-lg font-display font-semibold ${
                      importValidation.needsMigration ? 'text-warm' : 'text-green-400'
                    }`}>
                      {importValidation.needsMigration ? '是' : '否'}
                    </p>
                    <p className="text-xs text-white/50">需要迁移</p>
                  </div>
                </div>

                {importValidation.errors.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-red-400 mb-2">错误</h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {importValidation.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-400/80 flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {importValidation.warnings.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-warm mb-2">警告</h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {importValidation.warnings.map((warn, i) => (
                        <p key={i} className="text-xs text-warm/80 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {warn.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {conflicts.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-warm mb-2">检测到 {conflicts.length} 个冲突</h5>
                    <button
                      onClick={() => setShowConflictDialog(true)}
                      className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      解决冲突
                    </button>
                  </div>
                )}

                <button
                  onClick={conflicts.length > 0 ? () => setShowConflictDialog(true) : handleImport}
                  disabled={!importValidation.canImport || isImporting}
                  className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {conflicts.length > 0 ? '解决冲突并导入' : '开始导入'}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeStorageTab === 'health' && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto pr-1 space-y-4"
          >
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">健康状态总览</h4>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  storageHealth?.isHealthy
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-warm/20 text-warm'
                }`}>
                  {storageHealth?.isHealthy ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {storageHealth?.isHealthy ? '健康' : '需要关注'}
                </div>
              </div>

              {storageHealth && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gallery-bg/50 rounded-lg p-2">
                    <p className="text-lg font-display font-semibold text-green-400">
                      {storageHealth.corruptedKeys.length === 0 ? '✓' : storageHealth.corruptedKeys.length}
                    </p>
                    <p className="text-xs text-white/50">损坏项</p>
                  </div>
                  <div className="bg-gallery-bg/50 rounded-lg p-2">
                    <p className="text-lg font-display font-semibold text-green-400">
                      {storageHealth.missingKeys.length === 0 ? '✓' : storageHealth.missingKeys.length}
                    </p>
                    <p className="text-xs text-white/50">缺失项</p>
                  </div>
                  <div className="bg-gallery-bg/50 rounded-lg p-2">
                    <p className={`text-lg font-display font-semibold ${
                      storageHealth.hasRecentBackup ? 'text-green-400' : 'text-warm'
                    }`}>
                      {storageHealth.hasRecentBackup ? '✓' : '!'}
                    </p>
                    <p className="text-xs text-white/50">近期备份</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCheckHealth}
                disabled={isCheckingHealth}
                className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                {isCheckingHealth ? '检查中...' : '执行检查'}
              </button>
              <button
                onClick={handleOneClickFix}
                className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                一键修复
              </button>
            </div>

            <div className="card p-4">
              <h4 className="text-sm font-medium text-white mb-3">检查项</h4>
              <div className="space-y-2">
                {healthCheckItems().map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {renderHealthCheckItem(item.title, item.description, item.status, item.detail)}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h4 className="text-sm font-medium text-white mb-3">维护操作</h4>
              <div className="space-y-2">
                <button
                  onClick={handleRunAutoRecovery}
                  disabled={isRecovering}
                  className="w-full btn-secondary text-sm py-2.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
                    自动恢复
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
                <button
                  onClick={handleRunMigration}
                  className="w-full btn-secondary text-sm py-2.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    数据迁移
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
                <button
                  onClick={handleExportAll}
                  className="w-full btn-secondary text-sm py-2.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    导出完整备份
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('这将刷新所有本地存储数据，确定继续吗？')) {
                      refreshFromStorage();
                    }
                  }}
                  className="w-full btn-secondary text-sm py-2.5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    刷新存储数据
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateBackupDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateBackupDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-display font-semibold text-white mb-4">创建备份</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1">备份名称 *</label>
                  <input
                    type="text"
                    placeholder="输入备份名称..."
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">描述（可选）</label>
                  <textarea
                    placeholder="输入备份描述..."
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateBackupDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={!backupName.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRestoreConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRestoreConfirmDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-warm/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warm" />
                </div>
                <div>
                  <h4 className="text-lg font-display font-semibold text-white">确认恢复</h4>
                  <p className="text-sm text-white/50">此操作将覆盖当前所有数据</p>
                </div>
              </div>
              <p className="text-sm text-white/70 mb-6">
                恢复备份将替换当前所有存储数据，包括预设、方案、项目等。此操作不可撤销，建议先创建当前状态的备份。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRestoreConfirmDialog(null)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleRestoreBackup(showRestoreConfirmDialog)}
                  className="flex-1 btn-primary"
                >
                  确认恢复
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConflictDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConflictDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-lg max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-display font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warm" />
                解决冲突
              </h4>
              <p className="text-sm text-white/60 mb-4">
                检测到 {conflicts.length} 个冲突项，请为每个冲突选择解决策略
              </p>

              <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                {conflicts.map((conflict) => {
                  const conflictKey = `${conflict.key}:${conflict.itemId}`;
                  const strategy = conflictStrategies[conflictKey] || 'keepLocal';
                  const localItem = conflict.localData as Record<string, unknown> | undefined;
                  const importedItem = conflict.importedData as Record<string, unknown> | undefined;

                  return (
                    <div key={conflictKey} className="bg-gallery-bg/50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white">
                            {conflict.key} / {String(localItem?.name || importedItem?.name || conflict.itemId)}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5">{conflict.message}</p>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                          conflict.severity === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-warm/20 text-warm'
                        }`}>
                          {conflict.severity === 'error' ? '错误' : '警告'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div className="bg-gallery-surface rounded p-2">
                          <p className="text-white/40 mb-1">本地版本</p>
                          <p className="text-white truncate">
                            {String(localItem?.name || '-')}
                            {localItem?.updatedAt && (
                              <span className="text-white/40 ml-1">
                                ({formatDate(localItem.updatedAt as number)})
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="bg-gallery-surface rounded p-2">
                          <p className="text-white/40 mb-1">导入版本</p>
                          <p className="text-white truncate">
                            {String(importedItem?.name || '-')}
                            {importedItem?.updatedAt && (
                              <span className="text-white/40 ml-1">
                                ({formatDate(importedItem.updatedAt as number)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {(Object.keys(STRATEGY_LABELS) as ConflictResolutionStrategy[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleConflictStrategyChange(conflictKey, s)}
                            className={`text-xs py-1.5 rounded transition-colors ${
                              strategy === s
                                ? 'bg-gold text-gallery-bg font-medium'
                                : 'bg-gallery-border text-white/60 hover:bg-gallery-hover hover:text-white'
                            }`}
                          >
                            {STRATEGY_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowConflictDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyConflictResolutions}
                  className="flex-1 btn-primary"
                >
                  应用并导入
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
