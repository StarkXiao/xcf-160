import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  X,
  Plus,
  Play,
  Lock,
  Unlock,
  Link,
  Link2Off,
  Settings2,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  RotateCcw,
  Filter,
  Layers,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GalleryPreview } from '../GalleryPreview/GalleryPreview';
import { kelvinToHex } from '../../utils/color';
import ConfirmDialog from '../ConfirmDialog';
import { useToast } from '../Toast/ToastContext';
import {
  LIGHT_TYPE_LABELS,
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  COMPARE_PARAMETER_LABELS,
  type CompareParameterKey,
  type Preset,
  type BatchOperationType,
  type ConfirmDialogConfig,
  type GalleryScheme,
} from '../../types';
import { formatParameterValue } from '../../utils/compare';
import { cn } from '../../lib/utils';

export const CompareView: React.FC = () => {
  const {
    presets,
    compareList,
    addToCompare,
    removeFromCompare,
    loadPreset,
    setActivePanel,
    compareView,
    setLockedPreset,
    toggleParameterLink,
    clearLinkedParameters,
    togglePresetForBatch,
    selectAllForBatch,
    clearBatchSelection,
    setShowBatchPanel,
    setShowOnlyDifferences,
    getParameterDifferences,
    getParameterValue,
    setParameterValue,
    executeBatchOperation,
    batchCopyFrom,
    batchResetToDefault,
    gallerySchemes,
    currentSchemeId,
    isSchemeDirty,
    checkCurrentSchemeDirty,
    saveCurrentSchemeDraft,
    clearSchemeDirty,
    discardSchemeChanges,
    saveSchemeDirtySnapshot,
  } = useAppStore();

  const { addToast } = useToast();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lighting: true,
    material: true,
  });

  const [batchOperationType, setBatchOperationType] = useState<BatchOperationType>('copyFrom');
  const [batchSourcePresetId, setBatchSourcePresetId] = useState<string>('');
  const [batchParameterKey, setBatchParameterKey] = useState<CompareParameterKey | 'all'>('all');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);
  const [pendingPreset, setPendingPreset] = useState<Preset | null>(null);

  const currentScheme = useMemo(
    () => gallerySchemes.find((s) => s.id === currentSchemeId),
    [gallerySchemes, currentSchemeId]
  );

  const comparePresets = useMemo(
    () => presets.filter((p) => compareList.includes(p.id)),
    [presets, compareList]
  );

  const availablePresets = useMemo(
    () => presets.filter((p) => !compareList.includes(p.id)),
    [presets, compareList]
  );

  const differences = useMemo(
    () => getParameterDifferences(compareList),
    [getParameterDifferences, compareList]
  );

  const displayDifferences = useMemo(() => {
    if (!compareView.showOnlyDifferences) return differences;
    return differences.filter((d) => d.isDifferent);
  }, [differences, compareView.showOnlyDifferences]);

  const lightingParams = useMemo(
    () => displayDifferences.filter((d) => d.key.startsWith('lighting.')),
    [displayDifferences]
  );

  const materialParams = useMemo(
    () => displayDifferences.filter((d) => d.key.startsWith('material.')),
    [displayDifferences]
  );

  const differenceCount = useMemo(
    () => differences.filter((d) => d.isDifferent).length,
    [differences]
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleParameterEdit = (
    presetId: string,
    key: CompareParameterKey,
    value: unknown
  ) => {
    setParameterValue(presetId, key, value);
  };

  const handleApplyPreset = (preset: Preset) => {
    setPendingPreset(preset);

    if (currentSchemeId && isSchemeDirty(currentSchemeId)) {
      const result = checkCurrentSchemeDirty();
      setConfirmDialog({
        action: 'apply_template',
        title: '未保存的更改',
        message: (
          <div>
            <p className="mb-3">方案"{currentScheme?.name || '当前方案'}"有未保存的更改：</p>
            <ul className="text-xs text-white/60 space-y-1 mb-3">
              {result.changedFields.slice(0, 5).map((field) => (
                <li key={field} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  {field}
                </li>
              ))}
              {result.changedFields.length > 5 && (
                <li className="text-white/40">还有 {result.changedFields.length - 5} 项更改...</li>
              )}
            </ul>
            <p className="text-xs text-white/50">应用新方案"{preset.name}"将覆盖当前设置。您想如何处理？</p>
          </div>
        ),
        confirmText: '保存并应用',
        cancelText: '放弃更改',
        confirmType: 'primary',
        onConfirm: () => {
          saveCurrentSchemeDraft(false);
          clearSchemeDirty(currentSchemeId);
          loadPreset(preset);
          saveSchemeDirtySnapshot(currentSchemeId);
          setActivePanel('lighting');
          setConfirmDialog(null);
          setPendingPreset(null);
          addToast('success', '已保存当前方案并应用新方案');
        },
        onCancel: () => {
          discardSchemeChanges(currentSchemeId);
          loadPreset(preset);
          saveSchemeDirtySnapshot(currentSchemeId);
          setActivePanel('lighting');
          setConfirmDialog(null);
          setPendingPreset(null);
          addToast('info', '已放弃当前更改并应用新方案');
        },
        onClose: () => {
          setConfirmDialog(null);
          setPendingPreset(null);
        },
      });
    } else {
      setConfirmDialog({
        action: 'apply_template',
        title: '确认应用方案',
        message: (
          <div>
            <p className="mb-2">确定要应用方案"{preset.name}"吗？</p>
            <p className="text-xs text-white/50">应用后当前方案的灯光和材质设置将被覆盖。</p>
          </div>
        ),
        confirmText: '确认应用',
        cancelText: '取消',
        confirmType: 'primary',
        onConfirm: () => {
          loadPreset(preset);
          if (currentSchemeId) {
            saveSchemeDirtySnapshot(currentSchemeId);
          }
          setActivePanel('lighting');
          setConfirmDialog(null);
          setPendingPreset(null);
          addToast('success', `已应用方案"${preset.name}"`);
        },
        onCancel: () => {
          setConfirmDialog(null);
          setPendingPreset(null);
        },
        onClose: () => {
          setConfirmDialog(null);
          setPendingPreset(null);
        },
      });
    }
  };

  const handleBatchExecute = () => {
    const targetIds = Array.from(compareView.selectedForBatch);
    if (targetIds.length === 0) return;

    if (batchOperationType === 'copyFrom' && batchSourcePresetId) {
      const paramKeys = batchParameterKey === 'all' ? undefined : [batchParameterKey];
      batchCopyFrom(batchSourcePresetId, targetIds, paramKeys);
    } else if (batchOperationType === 'resetToDefault') {
      const paramKeys = batchParameterKey === 'all' ? undefined : [batchParameterKey];
      batchResetToDefault(targetIds, paramKeys);
    } else {
      executeBatchOperation({
        type: batchOperationType,
        sourcePresetId: batchSourcePresetId,
        parameterKey: batchParameterKey === 'all' ? undefined : batchParameterKey,
        targetPresetIds: targetIds,
      });
    }
  };

  const renderParameterCell = (
    preset: Preset,
    key: CompareParameterKey,
    isDifferent: boolean,
    lockedValue?: unknown
  ) => {
    const value = getParameterValue(preset, key);
    const isLocked = compareView.lockedPresetId === preset.id;
    const isLinked = compareView.linkedParameters.has(key);
    const isMainScheme = compareView.lockedPresetId === preset.id;
    const matchesLocked =
      lockedValue !== undefined && JSON.stringify(value) === JSON.stringify(lockedValue);

    const baseClasses = 'px-2 py-1.5 text-xs rounded transition-all';

    if (isLocked) {
      return (
        <div
          className={cn(
            baseClasses,
            'bg-gold/20 text-gold font-medium border border-gold/50'
          )}
        >
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {formatParameterValue(key, value)}
          </span>
        </div>
      );
    }

    if (isDifferent && !matchesLocked && compareView.lockedPresetId) {
      return (
        <div
          className={cn(
            baseClasses,
            'bg-red-500/20 text-red-400 border border-red-500/50'
          )}
        >
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formatParameterValue(key, value)}
          </span>
        </div>
      );
    }

    if (isLinked) {
      return (
        <div
          className={cn(
            baseClasses,
            'bg-blue-500/20 text-blue-400 border border-blue-500/50'
          )}
        >
          <span className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            {formatParameterValue(key, value)}
          </span>
        </div>
      );
    }

    if (isDifferent) {
      return (
        <div
          className={cn(
            baseClasses,
            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
          )}
        >
          {formatParameterValue(key, value)}
        </div>
      );
    }

    return (
      <div className={cn(baseClasses, 'bg-gallery-bg/50 text-white/70')}>
        {formatParameterValue(key, value)}
      </div>
    );
  };

  const renderParameterRow = (
    param: { key: CompareParameterKey; isDifferent: boolean },
    lockedPreset?: Preset
  ) => {
    const lockedValue = lockedPreset
      ? getParameterValue(lockedPreset, param.key)
      : undefined;
    const isLinked = compareView.linkedParameters.has(param.key);

    return (
      <motion.tr
        key={param.key}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          'border-b border-gallery-border/50 last:border-0',
          param.isDifferent && 'bg-yellow-500/5'
        )}
      >
        <td className="py-2 px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleParameterLink(param.key)}
              className={cn(
                'p-1 rounded transition-colors',
                isLinked
                  ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/10'
              )}
              title={isLinked ? '取消联动' : '启用联动'}
            >
              {isLinked ? (
                <Link className="w-3.5 h-3.5" />
              ) : (
                <Link2Off className="w-3.5 h-3.5" />
              )}
            </button>
            <span
              className={cn(
                'text-xs',
                param.isDifferent ? 'text-white font-medium' : 'text-white/60'
              )}
            >
              {COMPARE_PARAMETER_LABELS[param.key]}
            </span>
            {param.isDifferent && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                差异
              </span>
            )}
          </div>
        </td>
        {comparePresets.map((preset) => (
          <td key={preset.id} className="py-2 px-2 text-center">
            {renderParameterCell(preset, param.key, param.isDifferent, lockedValue)}
          </td>
        ))}
      </motion.tr>
    );
  };

  const renderPresetCard = (preset: Preset) => {
    const lightColor = kelvinToHex(preset.lighting.colorTemperature);
    const isLocked = compareView.lockedPresetId === preset.id;
    const isSelected = compareView.selectedForBatch.has(preset.id);

    return (
      <motion.div
        key={preset.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'card overflow-hidden relative',
          isLocked && 'ring-2 ring-gold',
          isSelected && 'ring-2 ring-blue-500'
        )}
      >
        {compareView.selectedForBatch.size > 0 && (
          <button
            onClick={() => togglePresetForBatch(preset.id)}
            className="absolute top-2 left-2 z-10 p-1.5 bg-black/60 rounded-full hover:bg-white/20 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-white/60" />
            )}
          </button>
        )}

        {isLocked && (
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gold text-black text-xs font-semibold rounded flex items-center gap-1">
            <Lock className="w-3 h-3" />
            主方案
          </div>
        )}

        <div className="relative aspect-video bg-gallery-bg">
          <div className="absolute inset-0 scale-[0.85]">
            <GalleryPreview
              overrideLighting={preset.lighting}
              overrideMaterial={preset.material}
              overrideArtworkId={preset.artworkId}
              showControls={false}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => setLockedPreset(isLocked ? null : preset.id)}
              className={cn(
                'p-1.5 rounded-full transition-colors',
                isLocked
                  ? 'bg-gold text-black'
                  : 'bg-black/60 hover:bg-gold/60 text-white/60 hover:text-white'
              )}
              title={isLocked ? '取消锁定' : '设为主方案'}
            >
              {isLocked ? (
                <Unlock className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => removeFromCompare(preset.id)}
              className="p-1.5 bg-black/60 rounded-full hover:bg-red-500/80 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <h4 className="font-medium text-white text-sm mb-2 truncate">
            {preset.name}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: lightColor }}
              />
              <span>{preset.lighting.colorTemperature}K</span>
            </div>
            <div>{LIGHT_TYPE_LABELS[preset.lighting.type]}</div>
            <div>{FRAME_MATERIAL_LABELS[preset.material.frameMaterial]}</div>
            <div>亮度 {Math.round(preset.lighting.intensity * 100)}%</div>
          </div>
          <button
            onClick={() => handleApplyPreset(preset)}
            className="w-full mt-3 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" />
            应用此方案
          </button>
        </div>
      </motion.div>
    );
  };

  const lockedPreset = comparePresets.find(
    (p) => p.id === compareView.lockedPresetId
  );

  if (compareList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-gold" />
            方案对比
          </h3>
          <span className="text-xs text-white/40">
            {compareList.length}/4 个方案
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-gallery-border flex items-center justify-center mb-4">
            <GitCompare className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/60 mb-2">暂无对比方案</p>
          <p className="text-sm text-white/40 mb-4">
            从下方选择已保存的方案添加到对比列表
          </p>
          <button
            onClick={() => setActivePanel('storage')}
            className="btn-primary text-sm"
          >
            去保存方案
          </button>
        </div>

        {availablePresets.length > 0 && (
          <div className="pt-4 border-t border-gallery-border">
            <h4 className="text-sm text-white/70 mb-3">可添加的方案</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availablePresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded overflow-hidden bg-gallery-surface">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: kelvinToHex(
                            preset.lighting.colorTemperature
                          ),
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-white">{preset.name}</p>
                      <p className="text-xs text-white/40">
                        {preset.lighting.colorTemperature}K ·{' '}
                        {LIGHT_TYPE_LABELS[preset.lighting.type]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCompare(preset.id)}
                    className="p-1.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-gold" />
          方案对比
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {compareList.length}/4 个方案
          </span>
          {differenceCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
              {differenceCount} 处差异
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowOnlyDifferences(!compareView.showOnlyDifferences)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
            compareView.showOnlyDifferences
              ? 'bg-gold/20 text-gold border border-gold/50'
              : 'bg-gallery-bg text-white/60 border border-gallery-border hover:border-gold/30'
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          仅显示差异
        </button>

        <button
          onClick={() => setShowBatchPanel(!compareView.showBatchPanel)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
            compareView.showBatchPanel
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'bg-gallery-bg text-white/60 border border-gallery-border hover:border-blue-500/30'
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          批量操作
          {compareView.selectedForBatch.size > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-500/30 rounded text-xs">
              {compareView.selectedForBatch.size}
            </span>
          )}
        </button>

        {compareView.linkedParameters.size > 0 && (
          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            <Link className="w-3 h-3 inline mr-1" />
            {compareView.linkedParameters.size} 项联动
          </span>
        )}

        {compareView.linkedParameters.size > 0 && (
          <button
            onClick={clearLinkedParameters}
            className="text-xs text-white/40 hover:text-white/60"
          >
            清除联动
          </button>
        )}
      </div>

      <AnimatePresence>
        {compareView.showBatchPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-lg bg-gallery-bg border border-gallery-border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  批量操作
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllForBatch}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    全选
                  </button>
                  <button
                    onClick={clearBatchSelection}
                    className="text-xs text-white/40 hover:text-white/60"
                  >
                    取消
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-white/60 mb-1 block">操作类型</label>
                  <select
                    value={batchOperationType}
                    onChange={(e) =>
                      setBatchOperationType(e.target.value as BatchOperationType)
                    }
                    className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="copyFrom">从指定方案复制</option>
                    <option value="resetToDefault">重置为默认值</option>
                  </select>
                </div>

                {batchOperationType === 'copyFrom' && (
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">
                      源方案
                    </label>
                    <select
                      value={batchSourcePresetId}
                      onChange={(e) => setBatchSourcePresetId(e.target.value)}
                      className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-sm text-white focus:outline-none focus:border-gold"
                    >
                      <option value="">选择源方案</option>
                      {comparePresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-white/60 mb-1 block">
                    应用参数
                  </label>
                  <select
                    value={batchParameterKey}
                    onChange={(e) =>
                      setBatchParameterKey(e.target.value as CompareParameterKey | 'all')
                    }
                    className="w-full px-3 py-2 bg-gallery-surface border border-gallery-border rounded-lg text-sm text-white focus:outline-none focus:border-gold"
                  >
                    <option value="all">全部参数</option>
                    {Object.entries(COMPARE_PARAMETER_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleBatchExecute}
                    disabled={
                      compareView.selectedForBatch.size === 0 ||
                      (batchOperationType === 'copyFrom' && !batchSourcePresetId)
                    }
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    应用到 {compareView.selectedForBatch.size} 个方案
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {comparePresets.map((preset) => {
                  const isSelected = compareView.selectedForBatch.has(preset.id);
                  const isLocked = compareView.lockedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => !isLocked && togglePresetForBatch(preset.id)}
                      disabled={isLocked}
                      className={cn(
                        'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                        isSelected
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                          : 'bg-gallery-surface text-white/60 border border-gallery-border hover:border-blue-500/30',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Square className="w-3 h-3" />
                      )}
                      {preset.name}
                      {isLocked && ' (锁定)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(compareList.length, 2)}, 1fr)`,
          }}
        >
          <AnimatePresence mode="popLayout">
            {comparePresets.map((preset) => renderPresetCard(preset))}
          </AnimatePresence>
        </div>

        {comparePresets.length >= 2 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-gold" />
              参数对比详情
              {compareView.lockedPresetId && (
                <span className="text-xs font-normal text-white/40 ml-2">
                  以「{lockedPreset?.name}」为基准
                </span>
              )}
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gallery-border">
                    <th className="py-2 px-3 text-left text-xs font-medium text-white/60 w-40">
                      参数
                    </th>
                    {comparePresets.map((preset) => (
                      <th
                        key={preset.id}
                        className={cn(
                          'py-2 px-2 text-center text-xs font-medium',
                          compareView.lockedPresetId === preset.id
                            ? 'text-gold'
                            : 'text-white/60'
                        )}
                      >
                        <div className="truncate max-w-[100px] mx-auto">
                          {preset.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lightingParams.length > 0 && (
                    <>
                      <tr className="bg-gallery-bg/50">
                        <td
                          colSpan={comparePresets.length + 1}
                          className="py-1.5 px-3"
                        >
                          <button
                            onClick={() => toggleSection('lighting')}
                            className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white transition-colors w-full"
                          >
                            {expandedSections.lighting ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                            灯光参数
                            <span className="ml-1 text-white/40 font-normal">
                              ({lightingParams.filter((d) => d.isDifferent).length} 处差异)
                            </span>
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedSections.lighting &&
                          lightingParams.map((param) =>
                            renderParameterRow(param, lockedPreset)
                          )}
                      </AnimatePresence>
                    </>
                  )}

                  {materialParams.length > 0 && (
                    <>
                      <tr className="bg-gallery-bg/50">
                        <td
                          colSpan={comparePresets.length + 1}
                          className="py-1.5 px-3"
                        >
                          <button
                            onClick={() => toggleSection('material')}
                            className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white transition-colors w-full"
                          >
                            {expandedSections.material ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                            材质参数
                            <span className="ml-1 text-white/40 font-normal">
                              ({materialParams.filter((d) => d.isDifferent).length} 处差异)
                            </span>
                          </button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedSections.material &&
                          materialParams.map((param) =>
                            renderParameterRow(param, lockedPreset)
                          )}
                      </AnimatePresence>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {displayDifferences.length === 0 && (
              <div className="text-center py-8 text-white/40 text-sm">
                <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
                {compareView.showOnlyDifferences
                  ? '所有参数均一致，无差异项'
                  : '暂无参数数据'}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 rounded-lg bg-gallery-bg/50 border border-gallery-border/50">
          <h5 className="text-xs font-medium text-white/80 mb-2">图例说明</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gold/50" />
              <span className="text-white/60">主方案（锁定）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500/50" />
              <span className="text-white/60">参数存在差异</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500/50" />
              <span className="text-white/60">与主方案不同</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500/50" />
              <span className="text-white/60">已启用联动</span>
            </div>
          </div>
        </div>
      </div>

      {availablePresets.length > 0 && compareList.length < 4 && (
        <div className="pt-4 border-t border-gallery-border mt-4">
          <h4 className="text-sm text-white/70 mb-3">可添加的方案</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availablePresets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gallery-bg border border-gallery-border hover:border-gold/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded overflow-hidden bg-gallery-surface">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: kelvinToHex(
                          preset.lighting.colorTemperature
                        ),
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-white">{preset.name}</p>
                    <p className="text-xs text-white/40">
                      {preset.lighting.colorTemperature}K ·{' '}
                      {LIGHT_TYPE_LABELS[preset.lighting.type]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => addToCompare(preset.id)}
                  className="p-1.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {compareList.length >= 4 && (
        <div className="p-3 rounded-lg bg-warm/10 border border-warm/30 text-warm text-xs text-center mt-4">
          已达到最大对比数量（4个）
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog !== null}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
        confirmText={confirmDialog?.confirmText}
        cancelText={confirmDialog?.cancelText}
        confirmType={confirmDialog?.confirmType}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={confirmDialog?.onCancel || (() => {})}
      />
    </motion.div>
  );
};
