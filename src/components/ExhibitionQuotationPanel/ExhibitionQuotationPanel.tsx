import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  ChevronRight,
  Edit3,
  Save,
  X,
  DollarSign,
  Frame,
  Lightbulb,
  Ruler,
  Box,
  Users,
  Truck,
  Settings,
  ChevronDown,
  Percent,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ExhibitionQuotation, FrameMaterialGrade } from '../../types';
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  FRAME_MATERIAL_GRADE_LABELS,
  FRAME_MATERIAL_LABELS,
  WALL_MATERIAL_LABELS,
  FRAME_MATERIAL_PRICING,
  GLASS_TYPES,
  MAT_BOARDS,
  LIGHTING_EQUIPMENT,
  CONSTRUCTION_CATEGORY_LABELS,
  CONSTRUCTION_UNIT_LABELS,
} from '../../types';

interface ExhibitionQuotationPanelProps {
  projectId: string;
}

export const ExhibitionQuotationPanel: React.FC<ExhibitionQuotationPanelProps> = ({ projectId }) => {
  const {
    quotations,
    currentQuotationId,
    curatorProjects,
    gallerySchemes,
    quotationConfig,
    generateQuotation,
    updateQuotation,
    deleteQuotation,
    setCurrentQuotation,
    updateQuotationConfig,
    recalculateQuotation,
    getQuotationsByProjectId,
    getQuotationSummary,
    exportQuotation,
  } = useAppStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [newQuotationTitle, setNewQuotationTitle] = useState('');
  const [newQuotationSchemeId, setNewQuotationSchemeId] = useState('');
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState('0');

  const project = useMemo(
    () => curatorProjects.find((p) => p.id === projectId),
    [curatorProjects, projectId]
  );

  const projectSchemes = useMemo(() => {
    if (!project) return [];
    return gallerySchemes.filter((s) => project.schemeIds.includes(s.id));
  }, [project, gallerySchemes]);

  const projectQuotations = useMemo(
    () => getQuotationsByProjectId(projectId),
    [quotations, projectId]
  );

  const currentQuotation = useMemo(
    () => quotations.find((q) => q.id === currentQuotationId) || null,
    [quotations, currentQuotationId]
  );

  const currentScheme = useMemo(() => {
    if (!currentQuotation) return null;
    return gallerySchemes.find((s) => s.id === currentQuotation.schemeId);
  }, [currentQuotation, gallerySchemes]);

  const quotationSummary = useMemo(() => {
    if (!currentQuotation) return null;
    return getQuotationSummary(currentQuotation);
  }, [currentQuotation]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: quotationConfig.currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateQuotation = () => {
    if (!newQuotationTitle.trim() || !newQuotationSchemeId) return;

    generateQuotation(projectId, newQuotationSchemeId, newQuotationTitle.trim());

    setNewQuotationTitle('');
    setNewQuotationSchemeId('');
    setShowCreateDialog(false);
  };

  const handleDiscountChange = () => {
    if (!currentQuotation) return;
    const discount = Math.max(0, Math.min(100, Number(discountInput))) / 100;
    const discountAmount = currentQuotation.subtotal * discount;
    const grandTotal = currentQuotation.subtotal + currentQuotation.taxAmount - discountAmount;

    updateQuotation(currentQuotation.id, {
      discountRate: discount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    });
    setEditingDiscount(false);
  };

  const handleStatusChange = (status: ExhibitionQuotation['status']) => {
    if (!currentQuotation) return;
    updateQuotation(currentQuotation.id, { status });
  };

  const renderQuotationList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">报价单列表</h3>
        <button
          onClick={() => {
            setNewQuotationSchemeId(projectSchemes[0]?.id || '');
            setShowCreateDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          新建报价
        </button>
      </div>

      {projectQuotations.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl">
          <Calculator className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">暂无报价单</p>
          <p className="text-gray-500 text-sm">点击上方按钮创建第一个布展报价</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectQuotations.map((quotation) => (
            <motion.div
              key={quotation.id}
              onClick={() => setCurrentQuotation(quotation.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                currentQuotationId === quotation.id
                  ? 'bg-blue-600/20 border border-blue-500'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-white">{quotation.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${QUOTATION_STATUS_COLORS[quotation.status]}`}>
                      {QUOTATION_STATUS_LABELS[quotation.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{quotation.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(quotation.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={12} />
                      {quotation.artworkCosts.length} 件作品
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(quotation.grandTotal)}
                  </p>
                  <ChevronRight size={20} className="text-gray-500 mt-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConfigPanel = () => (
    <div className="bg-gray-800/50 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings size={20} />
          报价配置
        </h3>
        <button
          onClick={() => setShowConfigPanel(false)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">画框等级</label>
          <select
            value={quotationConfig.defaultFrameGrade}
            onChange={(e) => updateQuotationConfig({ defaultFrameGrade: e.target.value as FrameMaterialGrade })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(FRAME_MATERIAL_GRADE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">画框宽度 (cm)</label>
          <select
            value={quotationConfig.defaultFrameWidth}
            onChange={(e) => updateQuotationConfig({ defaultFrameWidth: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[3, 4, 5, 6, 8, 10].map((w) => (
              <option key={w} value={w}>{w} cm</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">卡纸边框 (cm)</label>
          <input
            type="number"
            value={quotationConfig.defaultMatBorderWidth}
            onChange={(e) => updateQuotationConfig({ defaultMatBorderWidth: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">玻璃类型</label>
          <select
            value={quotationConfig.defaultGlassType}
            onChange={(e) => updateQuotationConfig({ defaultGlassType: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {GLASS_TYPES.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">射灯类型</label>
          <select
            value={quotationConfig.defaultSpotlightType}
            onChange={(e) => updateQuotationConfig({ defaultSpotlightType: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LIGHTING_EQUIPMENT.filter((l) => l.type === 'spotlight').map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">环境光类型</label>
          <select
            value={quotationConfig.defaultAmbientLightType}
            onChange={(e) => updateQuotationConfig({ defaultAmbientLightType: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LIGHTING_EQUIPMENT.filter((l) => l.type === 'ambient').map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">税率 (%)</label>
          <input
            type="number"
            value={quotationConfig.taxRate * 100}
            onChange={(e) => updateQuotationConfig({ taxRate: Number(e.target.value) / 100 })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="50"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">轨道灯价格 (元/米)</label>
          <input
            type="number"
            value={quotationConfig.trackLightingPricePerMeter}
            onChange={(e) => updateQuotationConfig({ trackLightingPricePerMeter: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="10"
          />
        </div>
      </div>

      {currentQuotation && (
        <button
          onClick={() => recalculateQuotation(currentQuotation.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          使用新配置重新计算
        </button>
      )}
    </div>
  );

  const renderQuotationDetail = () => {
    if (!currentQuotation || !quotationSummary || !currentScheme) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentQuotation(null)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">{currentQuotation.title}</h2>
              <p className="text-sm text-gray-400">{currentQuotation.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentQuotation.status}
              onChange={(e) => handleStatusChange(e.target.value as ExhibitionQuotation['status'])}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(QUOTATION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => recalculateQuotation(currentQuotation.id)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="重新计算"
            >
              <RefreshCw size={20} className="text-gray-400" />
            </button>
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`p-2 rounded-lg transition-colors ${showConfigPanel ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
              title="报价配置"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => exportQuotation(currentQuotation.id)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="导出报价"
            >
              <Download size={20} className="text-gray-400" />
            </button>
            <button
              onClick={() => {
                if (confirm('确定要删除这个报价单吗？')) {
                  deleteQuotation(currentQuotation.id);
                }
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="删除报价"
            >
              <Trash2 size={20} className="text-red-400" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">作品费用小计</p>
              <p className="text-2xl font-bold text-blue-400">
                {formatCurrency(currentQuotation.artworkCosts.reduce((sum, c) => sum + c.artworkTotal, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">空间费用小计</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(currentQuotation.spaceCost.spaceTotal)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">税前总计</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(currentQuotation.subtotal)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">总计</p>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(currentQuotation.grandTotal)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">税率:</span>
              <span className="text-white font-medium">{(currentQuotation.taxRate * 100).toFixed(1)}%</span>
              <span className="text-green-400 font-medium">+ {formatCurrency(currentQuotation.taxAmount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">折扣:</span>
              {editingDiscount ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
                    min="0"
                    max="100"
                    autoFocus
                  />
                  <span className="text-gray-400">%</span>
                  <button
                    onClick={handleDiscountChange}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <CheckCircle2 size={18} className="text-green-400" />
                  </button>
                  <button
                    onClick={() => setEditingDiscount(false)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <X size={18} className="text-red-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setDiscountInput((currentQuotation.discountRate * 100).toString());
                    setEditingDiscount(true);
                  }}
                  className="flex items-center gap-2 text-orange-400 font-medium hover:text-orange-300"
                >
                  <Percent size={16} />
                  {(currentQuotation.discountRate * 100).toFixed(1)}%
                  <span>- {formatCurrency(currentQuotation.discountAmount)}</span>
                  <Edit3 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showConfigPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {renderConfigPanel()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Frame size={20} className="text-blue-400" />
            作品费用明细
          </h3>

          <div className="grid gap-4">
            {currentQuotation.artworkCosts.map((cost) => (
              <div key={cost.artworkId} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-white text-lg">{cost.artworkTitle}</h4>
                    <p className="text-sm text-gray-400">
                      尺寸: {cost.dimensions.width} × {cost.dimensions.height} cm
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(cost.artworkTotal)}
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler size={16} className="text-amber-400" />
                      <span className="text-sm text-gray-400">画框</span>
                    </div>
                    <p className="text-white font-medium">
                      {FRAME_MATERIAL_LABELS[cost.frameCost.material]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {FRAME_MATERIAL_GRADE_LABELS[cost.frameCost.grade]} · {cost.frameCost.width}cm
                    </p>
                    <p className="text-sm text-amber-400 mt-1 font-medium">
                      {formatCurrency(cost.frameCost.subtotal)}
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Box size={16} className="text-cyan-400" />
                      <span className="text-sm text-gray-400">玻璃</span>
                    </div>
                    <p className="text-white font-medium">
                      {GLASS_TYPES.find((g) => g.id === cost.glassCost.glassType)?.name || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cost.glassCost.area.toFixed(2)} m²
                    </p>
                    <p className="text-sm text-cyan-400 mt-1 font-medium">
                      {formatCurrency(cost.glassCost.subtotal)}
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={16} className="text-purple-400" />
                      <span className="text-sm text-gray-400">卡纸</span>
                    </div>
                    <p className="text-white font-medium">
                      {MAT_BOARDS.find((m) => m.id === cost.matBoardCost.matBoard)?.name || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cost.matBoardCost.borderWidth}cm边框 · {cost.matBoardCost.area.toFixed(2)} m²
                    </p>
                    <p className="text-sm text-purple-400 mt-1 font-medium">
                      {formatCurrency(cost.matBoardCost.subtotal)}
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-yellow-400" />
                      <span className="text-sm text-gray-400">灯光</span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {cost.lightingCost.equipmentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cost.lightingCost.quantity} 台
                    </p>
                    <p className="text-sm text-yellow-400 mt-1 font-medium">
                      {formatCurrency(cost.lightingCost.subtotal)}
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-green-400" />
                      <span className="text-sm text-gray-400">装挂</span>
                    </div>
                    <p className="text-white font-medium">
                      {cost.mountingCost.item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cost.mountingCost.quantity} {CONSTRUCTION_UNIT_LABELS[cost.mountingCost.item.unit]}
                    </p>
                    <p className="text-sm text-green-400 mt-1 font-medium">
                      {formatCurrency(cost.mountingCost.subtotal)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            空间工程费用明细
          </h3>

          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Box size={18} className="text-amber-400" />
                  墙面处理
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">
                      {WALL_MATERIAL_LABELS[currentQuotation.spaceCost.wallTreatmentCost.wallMaterial]}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.wallTreatmentCost.area.toFixed(2)} m² × {formatCurrency(currentQuotation.spaceCost.wallTreatmentCost.unitPrice)}/m²
                    </p>
                  </div>
                  <p className="text-lg font-bold text-amber-400">
                    {formatCurrency(currentQuotation.spaceCost.wallTreatmentCost.subtotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-400" />
                  环境照明
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">
                      {currentQuotation.spaceCost.ambientLightingCost.equipment.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.ambientLightingCost.quantity} 台 × {formatCurrency(currentQuotation.spaceCost.ambientLightingCost.unitPrice)}/台
                    </p>
                  </div>
                  <p className="text-lg font-bold text-yellow-400">
                    {formatCurrency(currentQuotation.spaceCost.ambientLightingCost.subtotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Zap size={18} className="text-cyan-400" />
                  轨道灯系统
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">轨道安装</p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.trackLightingCost.length.toFixed(2)} 米 × {formatCurrency(currentQuotation.spaceCost.trackLightingCost.unitPrice)}/米
                    </p>
                  </div>
                  <p className="text-lg font-bold text-cyan-400">
                    {formatCurrency(currentQuotation.spaceCost.trackLightingCost.subtotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Zap size={18} className="text-blue-400" />
                  电气工程
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">
                      {currentQuotation.spaceCost.electricalCost.item.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.electricalCost.quantity} {CONSTRUCTION_UNIT_LABELS[currentQuotation.spaceCost.electricalCost.item.unit]} × {formatCurrency(currentQuotation.spaceCost.electricalCost.unitPrice)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-400">
                    {formatCurrency(currentQuotation.spaceCost.electricalCost.subtotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Users size={18} className="text-green-400" />
                  人工费用
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">
                      {currentQuotation.spaceCost.laborCost.item.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.laborCost.quantity} {CONSTRUCTION_UNIT_LABELS[currentQuotation.spaceCost.laborCost.item.unit]} × {formatCurrency(currentQuotation.spaceCost.laborCost.unitPrice)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(currentQuotation.spaceCost.laborCost.subtotal)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Truck size={18} className="text-orange-400" />
                  运输与包装
                </h4>
                <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-white">
                      {currentQuotation.spaceCost.transportCost.item.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {currentQuotation.spaceCost.transportCost.quantity} {CONSTRUCTION_UNIT_LABELS[currentQuotation.spaceCost.transportCost.item.unit]} × {formatCurrency(currentQuotation.spaceCost.transportCost.unitPrice)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-orange-400">
                    {formatCurrency(currentQuotation.spaceCost.transportCost.subtotal)}
                  </p>
                </div>
              </div>
            </div>

            {currentQuotation.spaceCost.otherCosts.length > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <h4 className="font-medium text-white mb-4">其他费用</h4>
                <div className="grid grid-cols-2 gap-4">
                  {currentQuotation.spaceCost.otherCosts.map((cost, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <p className="text-white">{cost.item.name}</p>
                        <p className="text-sm text-gray-400">
                          {cost.quantity} {CONSTRUCTION_UNIT_LABELS[cost.item.unit]} × {formatCurrency(cost.unitPrice)}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-300">
                        {formatCurrency(cost.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">空间费用总计</h4>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(currentQuotation.spaceCost.spaceTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">报价汇总</h3>
              <p className="text-sm text-gray-400">
                方案: {currentScheme.name} · {currentQuotation.artworkCosts.length} 件作品
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">最终报价</p>
              <p className="text-4xl font-bold text-green-400">
                {formatCurrency(currentQuotation.grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateDialog = () => (
    <AnimatePresence>
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">新建报价单</h3>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">报价单名称</label>
                <input
                  type="text"
                  value={newQuotationTitle}
                  onChange={(e) => setNewQuotationTitle(e.target.value)}
                  placeholder="例如：2026春季大师展布展报价"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">关联方案</label>
                <select
                  value={newQuotationSchemeId}
                  onChange={(e) => setNewQuotationSchemeId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择方案</option>
                  {projectSchemes.map((scheme) => (
                    <option key={scheme.id} value={scheme.id}>
                      {scheme.name} ({scheme.wallArtworks.length} 件作品)
                    </option>
                  ))}
                </select>
              </div>

              {newQuotationSchemeId && (
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
                  <p className="text-sm text-blue-300 flex items-center gap-2">
                    <AlertCircle size={16} />
                    系统将根据方案中的作品尺寸、装裱材质、灯光配置自动计算费用明细
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateQuotation}
                  disabled={!newQuotationTitle.trim() || !newQuotationSchemeId}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator size={18} />
                  生成报价
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calculator className="text-green-400" />
            布展报价
          </h2>
          <p className="text-gray-400 mt-1">
            根据作品尺寸、装裱材质、灯光设备和施工项自动生成费用明细
          </p>
        </div>
        {project && (
          <div className="text-right">
            <p className="text-white font-medium">{project.name}</p>
            <p className="text-sm text-gray-400">{projectSchemes.length} 个方案</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentQuotation ? renderQuotationDetail() : renderQuotationList()}
      </div>

      {renderCreateDialog()}
    </div>
  );
};
