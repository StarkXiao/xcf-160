import type {
  VenueCondition,
  GalleryScheme,
  WallArtwork,
  Artwork,
  WallPosition,
  LightingConfig,
  MountingAdjustment,
  LightingAdjustment,
  CompatibilityHint,
  TourAdaptationResult,
  TourAdaptationConfig,
  CompatibilityLevel,
} from '../types';
import {
  DEFAULT_TOUR_ADAPTATION_CONFIG,
  DEFAULT_LIGHTING,
} from '../types';

interface ArtworkWithWallArtwork {
  artwork: Artwork;
  wallArtwork: WallArtwork;
}

function estimateArtworkWeight(artwork: Artwork, wallStructure: string): number {
  const area = artwork.width * artwork.height / 10000;
  let baseWeight = area * 2;

  if (artwork.medium.includes('油画')) baseWeight *= 1.5;
  if (artwork.medium.includes('雕塑')) baseWeight *= 5;
  if (artwork.medium.includes('大理石')) baseWeight *= 10;
  if (artwork.medium.includes('木板')) baseWeight *= 2;

  if (wallStructure === 'plasterboard') baseWeight *= 0.8;
  if (wallStructure === 'glass') baseWeight *= 0.5;

  return Math.round(baseWeight * 100) / 100;
}

function convertPositionToCm(
  position: WallPosition,
  wallWidthCm: number,
  wallHeightCm: number
): { xCm: number; yCm: number; widthCm: number; heightCm: number } {
  return {
    xCm: (position.x / 100) * wallWidthCm,
    yCm: (position.y / 100) * wallHeightCm,
    widthCm: (position.width / 100) * wallWidthCm,
    heightCm: (position.height / 100) * wallHeightCm,
  };
}

function convertCmToPosition(
  xCm: number,
  yCm: number,
  widthCm: number,
  heightCm: number,
  wallWidthCm: number,
  wallHeightCm: number
): WallPosition {
  return {
    x: (xCm / wallWidthCm) * 100,
    y: (yCm / wallHeightCm) * 100,
    width: (widthCm / wallWidthCm) * 100,
    height: (heightCm / wallHeightCm) * 100,
    rotation: 0,
    layer: 0,
  };
}

export function calculateMountingAdjustment(
  wallArtwork: WallArtwork,
  artwork: Artwork,
  venue: VenueCondition,
  allArtworks: ArtworkWithWallArtwork[],
  config: TourAdaptationConfig = DEFAULT_TOUR_ADAPTATION_CONFIG
): MountingAdjustment {
  const wallHeight = venue.wallDimensions.height;
  const wallWidth = venue.wallDimensions.width;
  const pos = wallArtwork.position;

  const { xCm, yCm, widthCm, heightCm } = convertPositionToCm(pos, wallWidth, wallHeight);

  const artworkHeightCm = artwork.height;
  const artworkWidthCm = artwork.width;

  const centerLineY = config.standardCenterLineHeight;
  const bottomMargin = centerLineY - artworkHeightCm / 2;
  const topMargin = wallHeight - (bottomMargin + artworkHeightCm);

  let adjustedBottomMargin = bottomMargin;
  let adjustedCenterLineY = centerLineY;

  if (adjustedBottomMargin < config.minBottomMargin) {
    adjustedBottomMargin = config.minBottomMargin;
    adjustedCenterLineY = adjustedBottomMargin + artworkHeightCm / 2;
  }

  if (topMargin < config.minTopMargin) {
    adjustedBottomMargin = wallHeight - artworkHeightCm - config.minTopMargin;
    adjustedCenterLineY = adjustedBottomMargin + artworkHeightCm / 2;
  }

  if (venue.ceilingHeight < 300) {
    adjustedCenterLineY = Math.min(adjustedCenterLineY, 130);
    adjustedBottomMargin = adjustedCenterLineY - artworkHeightCm / 2;
  }

  if (venue.trafficFlow === 'high') {
    adjustedBottomMargin = Math.max(adjustedBottomMargin, 100);
    adjustedCenterLineY = adjustedBottomMargin + artworkHeightCm / 2;
  }

  let adjustedXCm = xCm;
  let spacingToLeft = xCm - widthCm / 2;
  let spacingToRight = wallWidth - (xCm + widthCm / 2);

  const sortedArtworks = [...allArtworks].sort((a, b) => {
    const posA = convertPositionToCm(a.wallArtwork.position, wallWidth, wallHeight);
    const posB = convertPositionToCm(b.wallArtwork.position, wallWidth, wallHeight);
    return posA.xCm - posB.xCm;
  });

  const currentIndex = sortedArtworks.findIndex(a => a.wallArtwork.id === wallArtwork.id);
  let spacingToLeftArtwork = spacingToLeft;
  let spacingToRightArtwork = spacingToRight;

  if (currentIndex > 0) {
    const prevArtwork = sortedArtworks[currentIndex - 1];
    const prevPos = convertPositionToCm(prevArtwork.wallArtwork.position, wallWidth, wallHeight);
    const prevRight = prevPos.xCm + prevPos.widthCm / 2;
    const currentLeft = xCm - widthCm / 2;
    spacingToLeftArtwork = currentLeft - prevRight;
  }

  if (currentIndex < sortedArtworks.length - 1) {
    const nextArtwork = sortedArtworks[currentIndex + 1];
    const nextPos = convertPositionToCm(nextArtwork.wallArtwork.position, wallWidth, wallHeight);
    const nextLeft = nextPos.xCm - nextPos.widthCm / 2;
    const currentRight = xCm + widthCm / 2;
    spacingToRightArtwork = nextLeft - currentRight;
  }

  const estimatedWeight = estimateArtworkWeight(artwork, venue.wallStructure);
  const maxSafeWeight = config.maxLoadPerAnchor / config.safetyFactor;
  const requiresReinforcement = estimatedWeight > maxSafeWeight || 
    (venue.wallStructure === 'plasterboard' && estimatedWeight > 5) ||
    (venue.wallStructure === 'mobile' && estimatedWeight > 3) ||
    (venue.wallStructure === 'glass' && estimatedWeight > 2);

  let reinforcementType: 'anchor' | 'bracket' | 'stand' | undefined;
  if (requiresReinforcement) {
    if (venue.wallStructure === 'solid' || venue.wallStructure === 'brick') {
      reinforcementType = estimatedWeight > 15 ? 'bracket' : 'anchor';
    } else if (venue.wallStructure === 'plasterboard') {
      reinforcementType = estimatedWeight > 10 ? 'stand' : 'bracket';
    } else {
      reinforcementType = 'stand';
    }
  }

  const adjustedYCm = adjustedBottomMargin + artworkHeightCm / 2;
  const adjustedPosition = convertCmToPosition(
    adjustedXCm,
    adjustedYCm,
    widthCm,
    heightCm,
    wallWidth,
    wallHeight
  );

  const reasons: string[] = [];
  if (adjustedBottomMargin !== bottomMargin) {
    if (venue.ceilingHeight < 300) {
      reasons.push('场馆层高较低，调整挂装高度');
    } else if (venue.trafficFlow === 'high') {
      reasons.push('人流量大，提高挂装高度防止碰撞');
    } else if (topMargin < config.minTopMargin) {
      reasons.push('上方空间不足，调整挂装位置');
    } else {
      reasons.push('调整至标准观展视线高度');
    }
  }

  if (spacingToLeftArtwork < config.minSpacingHorizontal) {
    reasons.push('左侧间距不足，建议调整布局');
  }
  if (spacingToRightArtwork < config.minSpacingHorizontal) {
    reasons.push('右侧间距不足，建议调整布局');
  }

  if (requiresReinforcement) {
    reasons.push(`作品重量(${estimatedWeight}kg)需加固挂装`);
  }

  return {
    wallArtworkId: wallArtwork.id,
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    originalPosition: { ...pos },
    adjustedPosition,
    centerLineHeight: Math.round(adjustedCenterLineY),
    bottomMargin: Math.round(adjustedBottomMargin),
    topMargin: Math.round(wallHeight - (adjustedBottomMargin + artworkHeightCm)),
    spacingToLeft: Math.round(spacingToLeftArtwork),
    spacingToRight: Math.round(spacingToRightArtwork),
    spacingToTop: Math.round(adjustedCenterLineY - artworkHeightCm / 2),
    spacingToBottom: Math.round(wallHeight - (adjustedCenterLineY + artworkHeightCm / 2)),
    requiresReinforcement,
    reinforcementType,
    estimatedWeight,
    adjustmentReason: reasons.length > 0 ? reasons.join('；') : '挂装位置符合标准',
  };
}

export function calculateLightingAdjustment(
  wallArtwork: WallArtwork,
  artwork: Artwork,
  venue: VenueCondition,
  config: TourAdaptationConfig = DEFAULT_TOUR_ADAPTATION_CONFIG
): LightingAdjustment {
  const originalLighting = wallArtwork.lighting;
  const adjustedLighting: LightingConfig = { ...originalLighting };

  const mountingHeight = Math.max(venue.ceilingHeight * 0.8, venue.wallDimensions.height + 50);
  const horizontalOffset = artwork.width * 0.1;
  const viewingDistance = (venue.viewingDistanceMin + venue.viewingDistanceMax) / 2;

  const distanceRatio = Math.min(3, viewingDistance / 150);
  adjustedLighting.intensity = Math.min(1, originalLighting.intensity * distanceRatio);

  if (venue.ambientLightLevel > 300) {
    adjustedLighting.intensity = Math.min(1, adjustedLighting.intensity * 1.3);
  }

  if (venue.hasNaturalLight && !venue.hasWindowCoverings) {
    adjustedLighting.intensity = Math.min(1, adjustedLighting.intensity * 1.5);
    adjustedLighting.colorTemperature = Math.max(2700, Math.min(6500, adjustedLighting.colorTemperature + 500));
  }

  if (venue.ceilingHeight > 500) {
    adjustedLighting.intensity = Math.min(1, adjustedLighting.intensity * 1.2);
    adjustedLighting.angle = Math.max(20, adjustedLighting.angle - 10);
  } else if (venue.ceilingHeight < 300) {
    adjustedLighting.angle = Math.min(80, adjustedLighting.angle + 15);
  }

  const artworkSize = Math.max(artwork.width, artwork.height);
  if (artworkSize > 150) {
    adjustedLighting.angle = Math.min(90, adjustedLighting.angle + 20);
  } else if (artworkSize < 50) {
    adjustedLighting.angle = Math.max(15, adjustedLighting.angle - 10);
  }

  adjustedLighting.positionY = mountingHeight / 100;
  adjustedLighting.positionZ = viewingDistance / 100;

  const reflectionCoefficient = {
    matte: 0.05,
    satin: 0.15,
    glossy: 0.3,
    concrete: 0.1,
  };
  const wallReflectivity = reflectionCoefficient[venue.wallStructure as keyof typeof reflectionCoefficient] || 0.1;

  let glareRisk: 'low' | 'medium' | 'high' = 'low';
  if (adjustedLighting.intensity * wallReflectivity > config.glareThreshold) {
    glareRisk = 'high';
  } else if (adjustedLighting.intensity * wallReflectivity > config.glareThreshold * 0.7) {
    glareRisk = 'medium';
  }

  if (glareRisk === 'high') {
    adjustedLighting.positionX = horizontalOffset / 100;
    adjustedLighting.angle = Math.min(90, adjustedLighting.angle + 10);
  }

  let uvExposure: 'low' | 'medium' | 'high' = 'low';
  if (venue.hasNaturalLight && !venue.hasUVProtection) {
    uvExposure = 'high';
  } else if (venue.hasNaturalLight) {
    uvExposure = 'medium';
  }

  if (uvExposure === 'high' && artwork.medium.includes('水彩')) {
    adjustedLighting.intensity = Math.max(0.3, adjustedLighting.intensity * 0.7);
  }

  const powerConsumption = adjustedLighting.intensity * (adjustedLighting.type === 'spotlight' ? 50 : adjustedLighting.type === 'floodlight' ? 35 : 25);
  const heatOutput = powerConsumption * 0.8;

  let recommendedFixtureCount = 1;
  if (artworkSize > 200) recommendedFixtureCount = 3;
  else if (artworkSize > 120) recommendedFixtureCount = 2;

  if (!venue.trackLightingAvailable) {
    adjustedLighting.type = 'floodlight';
  }

  const reasons: string[] = [];
  if (venue.ambientLightLevel > 300) {
    reasons.push(`环境光较强(${venue.ambientLightLevel}lux)，提高灯光强度`);
  }
  if (venue.hasNaturalLight && !venue.hasWindowCoverings) {
    reasons.push('有自然光且无遮光设备，提高对比度');
  }
  if (venue.ceilingHeight > 500) {
    reasons.push(`层高较高(${venue.ceilingHeight}cm)，调整光束角度`);
  }
  if (glareRisk === 'high') {
    reasons.push('存在眩光风险，调整灯光入射角');
  }
  if (uvExposure === 'high') {
    reasons.push('紫外线暴露较高，注意作品保护');
  }
  if (!venue.trackLightingAvailable) {
    reasons.push('无轨道灯系统，建议使用泛光照明');
  }

  return {
    wallArtworkId: wallArtwork.id,
    artworkId: artwork.id,
    artworkTitle: artwork.title,
    originalLighting: { ...originalLighting },
    adjustedLighting,
    recommendedFixtureCount,
    recommendedFixtureType: adjustedLighting.type,
    mountingHeight: Math.round(mountingHeight),
    horizontalOffset: Math.round(horizontalOffset),
    glareRisk,
    uvExposure,
    powerConsumption: Math.round(powerConsumption),
    heatOutput: Math.round(heatOutput),
    adjustmentReason: reasons.length > 0 ? reasons.join('；') : '灯光参数符合场馆条件',
  };
}

export function checkCompatibility(
  scheme: GalleryScheme,
  venue: VenueCondition,
  artworks: Artwork[],
  config: TourAdaptationConfig = DEFAULT_TOUR_ADAPTATION_CONFIG
): CompatibilityHint[] {
  const hints: CompatibilityHint[] = [];
  let hintId = 0;

  const createHint = (
    level: CompatibilityLevel,
    category: CompatibilityHint['category'],
    title: string,
    description: string,
    suggestion: string,
    affectedArtworkIds?: string[],
    estimatedCostImpact?: number,
    estimatedTimeImpact?: number
  ): CompatibilityHint => ({
    id: `hint-${++hintId}`,
    level,
    category,
    title,
    description,
    suggestion,
    affectedArtworkIds,
    estimatedCostImpact,
    estimatedTimeImpact,
  });

  if (scheme.wallArtworks.length > config.maxArtworksPerWall) {
    hints.push(createHint(
      'warning',
      'mounting',
      '作品数量过多',
      `当前方案包含 ${scheme.wallArtworks.length} 件作品，建议单墙不超过 ${config.maxArtworksPerWall} 件`,
      '考虑减少作品数量或分多个墙面展示',
      scheme.wallArtworks.map(w => w.artworkId),
      scheme.wallArtworks.length * 50,
      scheme.wallArtworks.length * 0.5
    ));
  }

  const heavyArtworks: string[] = [];
  let totalWeight = 0;

  scheme.wallArtworks.forEach(wallArtwork => {
    const artwork = artworks.find(a => a.id === wallArtwork.artworkId);
    if (artwork) {
      const weight = estimateArtworkWeight(artwork, venue.wallStructure);
      totalWeight += weight;
      if (weight > config.maxLoadPerAnchor / config.safetyFactor) {
        heavyArtworks.push(artwork.id);
      }
    }
  });

  const wallArea = (venue.wallDimensions.width * venue.wallDimensions.height) / 10000;
  const maxTotalWeight = wallArea * venue.maxLoadPerSquareMeter;

  if (heavyArtworks.length > 0) {
    hints.push(createHint(
      'requires_adjustment',
      'weight',
      '超重作品需要加固',
      `${heavyArtworks.length} 件作品重量超过安全限值，需要特殊加固处理`,
      '使用重型膨胀螺栓或落地展架，必要时进行承重测试',
      heavyArtworks,
      heavyArtworks.length * 200,
      heavyArtworks.length * 1
    ));
  }

  if (totalWeight > maxTotalWeight) {
    hints.push(createHint(
      'incompatible',
      'weight',
      '墙面承重超限',
      `总预估重量 ${totalWeight.toFixed(1)}kg 超过墙面最大承重 ${maxTotalWeight.toFixed(1)}kg`,
      '减少作品数量或更换承重能力更强的展墙',
      scheme.wallArtworks.map(w => w.artworkId),
      undefined,
      undefined
    ));
  }

  let totalPower = 0;
  scheme.wallArtworks.forEach(() => {
    totalPower += 50;
  });
  totalPower += 200;

  if (totalPower > venue.totalPowerCapacity) {
    hints.push(createHint(
      'incompatible',
      'power',
      '电力容量不足',
      `预估总功率 ${totalPower}W 超过场馆供电容量 ${venue.totalPowerCapacity}W`,
      '减少灯具数量或使用低功率LED灯具，考虑申请扩容',
      undefined,
      (venue.totalPowerCapacity - totalPower) * 0.5,
      3
    ));
  }

  if (!venue.hasDimmingSystem) {
    hints.push(createHint(
      'warning',
      'lighting',
      '无调光系统',
      '场馆无灯光调光系统，无法精确调整光照强度',
      '考虑使用自带调光功能的灯具或安装临时调光设备',
      undefined,
      scheme.wallArtworks.length * 100,
      2
    ));
  }

  if (!venue.trackLightingAvailable) {
    hints.push(createHint(
      'requires_adjustment',
      'lighting',
      '无轨道灯系统',
      '场馆未安装轨道灯系统，无法灵活调整灯光位置',
      '使用落地灯架或安装临时轨道，调整为泛光照明方案',
      undefined,
      2000,
      2
    ));
  }

  if (venue.hasNaturalLight && !venue.hasWindowCoverings) {
    hints.push(createHint(
      'warning',
      'lighting',
      '自然光干扰',
      '场馆有自然光入射且无遮光设备，可能影响展示效果',
      '使用遮光窗帘或调整展览时间避开强光时段',
      undefined,
      1500,
      1
    ));
  }

  if (venue.hasNaturalLight && !venue.hasUVProtection) {
    const sensitiveArtworks = scheme.wallArtworks
      .map(w => artworks.find(a => a.id === w.artworkId))
      .filter(a => a && (a.medium.includes('水彩') || a.medium.includes('版画') || a.medium.includes('摄影')))
      .map(a => a!.id);

    if (sensitiveArtworks.length > 0) {
      hints.push(createHint(
        'requires_adjustment',
        'environment',
        '紫外线防护不足',
        `${sensitiveArtworks.length} 件对紫外线敏感的作品在无防护环境下可能受损`,
        '使用防紫外线玻璃或贴膜，控制光照时间',
        sensitiveArtworks,
        sensitiveArtworks.length * 300,
        sensitiveArtworks.length * 0.5
      ));
    }
  }

  const tempRange = venue.temperatureRange;
  const humidityRange = venue.humidityRange;
  if (tempRange[0] < 15 || tempRange[1] > 30) {
    hints.push(createHint(
      'warning',
      'environment',
      '温度范围超标',
      `场馆温度范围 ${tempRange[0]}°C - ${tempRange[1]}°C 超出艺术品保存推荐范围`,
      '使用空调或加热设备调节温度，避免极端温度',
      undefined,
      500,
      0.5
    ));
  }

  if (humidityRange[0] < 30 || humidityRange[1] > 75) {
    hints.push(createHint(
      'warning',
      'environment',
      '湿度范围超标',
      `场馆湿度范围 ${humidityRange[0]}% - ${humidityRange[1]}% 超出艺术品保存推荐范围`,
      '使用除湿机或加湿器调节湿度',
      undefined,
      500,
      0.5
    ));
  }

  if (!venue.hasClimateControl) {
    hints.push(createHint(
      'warning',
      'environment',
      '无温湿度控制',
      '场馆无独立的温湿度控制系统，环境条件可能波动',
      '建议配备便携式温湿度监测设备，定期检查',
      undefined,
      200,
      0.5
    ));
  }

  if (venue.trafficFlow === 'high') {
    hints.push(createHint(
      'warning',
      'safety',
      '人流量大',
      '场馆人流量大，作品存在被触碰或碰撞的风险',
      '设置防护栏或展柜，安排安保人员巡逻',
      undefined,
      1000,
      1
    ));
  }

  if (!venue.hasSecuritySystem) {
    hints.push(createHint(
      'requires_adjustment',
      'safety',
      '无安保系统',
      '场馆无专业安保系统，作品安全存在隐患',
      '安排专人看守或安装临时监控设备',
      undefined,
      2000,
      1
    ));
  }

  if (venue.wallStructure === 'glass') {
    hints.push(createHint(
      'warning',
      'mounting',
      '玻璃墙面',
      '玻璃墙面承重能力有限，且可能产生反光问题',
      '使用专用玻璃挂架，调整灯光角度减少反光',
      scheme.wallArtworks.map(w => w.artworkId),
      scheme.wallArtworks.length * 100,
      scheme.wallArtworks.length * 0.5
    ));
  }

  if (venue.wallStructure === 'mobile') {
    hints.push(createHint(
      'warning',
      'mounting',
      '移动展墙',
      '移动展墙稳定性有限，不适合展示过重或过大的作品',
      '确认展墙承重，必要时使用配重底座加固',
      scheme.wallArtworks.map(w => w.artworkId),
      scheme.wallArtworks.length * 50,
      scheme.wallArtworks.length * 0.3
    ));
  }

  if (venue.venueType === 'outdoor') {
    const outdoorSensitiveArtworks = scheme.wallArtworks
      .map(w => artworks.find(a => a.id === w.artworkId))
      .filter(a => a && !a.medium.includes('雕塑') && !a.medium.includes('大理石'))
      .map(a => a!.id);

    if (outdoorSensitiveArtworks.length > 0) {
      hints.push(createHint(
        'incompatible',
        'environment',
        '户外场地不适合',
        `${outdoorSensitiveArtworks.length} 件作品不适合在户外环境长期展示`,
        '选择耐候材料的作品，或使用防护展箱',
        outdoorSensitiveArtworks,
        undefined,
        undefined
      ));
    }
  }

  const artworkHeightCm = scheme.wallArtworks
    .map(w => artworks.find(a => a.id === w.artworkId)?.height || 0);
  
  const totalArtworkHeight = artworkHeightCm.reduce((sum, h) => sum + h, 0) + 
    (scheme.wallArtworks.length - 1) * config.minSpacingVertical;
  
  if (totalArtworkHeight > venue.wallDimensions.height * 0.8) {
    hints.push(createHint(
      'requires_adjustment',
      'mounting',
      '垂直空间不足',
      `所有作品垂直排列所需空间 ${totalArtworkHeight}cm 超过墙面可用高度`,
      '调整为多行排列或减少展品数量',
      scheme.wallArtworks.map(w => w.artworkId),
      500,
      2
    ));
  }

  return hints;
}

export function calculateOverallCompatibility(hints: CompatibilityHint[]): {
  level: CompatibilityLevel;
  score: number;
} {
  if (hints.length === 0) {
    return { level: 'compatible', score: 100 };
  }

  let totalPenalty = 0;
  const weights: Record<CompatibilityLevel, number> = {
    compatible: 0,
    warning: 5,
    requires_adjustment: 15,
    incompatible: 50,
  };

  hints.forEach(hint => {
    totalPenalty += weights[hint.level];
  });

  const score = Math.max(0, Math.min(100, 100 - totalPenalty));

  let level: CompatibilityLevel = 'compatible';
  if (hints.some(h => h.level === 'incompatible')) {
    level = 'incompatible';
  } else if (hints.some(h => h.level === 'requires_adjustment')) {
    level = 'requires_adjustment';
  } else if (hints.some(h => h.level === 'warning')) {
    level = 'warning';
  }

  return { level, score };
}

export function performTourAdaptation(
  scheme: GalleryScheme,
  venue: VenueCondition,
  artworks: Artwork[],
  config: TourAdaptationConfig = DEFAULT_TOUR_ADAPTATION_CONFIG
): TourAdaptationResult {
  const artworksWithWall: ArtworkWithWallArtwork[] = scheme.wallArtworks
    .map(wallArtwork => {
      const artwork = artworks.find(a => a.id === wallArtwork.artworkId);
      return artwork ? { artwork, wallArtwork } : null;
    })
    .filter(Boolean) as ArtworkWithWallArtwork[];

  const mountingAdjustments: MountingAdjustment[] = artworksWithWall.map(({ artwork, wallArtwork }) =>
    calculateMountingAdjustment(wallArtwork, artwork, venue, artworksWithWall, config)
  );

  const lightingAdjustments: LightingAdjustment[] = artworksWithWall.map(({ artwork, wallArtwork }) =>
    calculateLightingAdjustment(wallArtwork, artwork, venue, config)
  );

  const compatibilityHints = checkCompatibility(scheme, venue, artworks, config);

  const { level, score } = calculateOverallCompatibility(compatibilityHints);

  const totalPowerRequired = lightingAdjustments.reduce((sum, adj) => sum + adj.powerConsumption, 0) + 200;
  const totalWeightEstimate = mountingAdjustments.reduce((sum, adj) => sum + adj.estimatedWeight, 0);
  const estimatedInstallationTime = mountingAdjustments.length * 0.5 + lightingAdjustments.length * 0.3 +
    (compatibilityHints.filter(h => h.estimatedTimeImpact).reduce((sum, h) => sum + (h.estimatedTimeImpact || 0), 0));

  return {
    id: `adaptation-${Date.now()}`,
    schemeId: scheme.id,
    venueId: venue.id,
    venueName: venue.name,
    mountingAdjustments,
    lightingAdjustments,
    compatibilityHints,
    overallCompatibility: level,
    compatibilityScore: score,
    totalPowerRequired: Math.round(totalPowerRequired),
    totalWeightEstimate: Math.round(totalWeightEstimate * 100) / 100,
    estimatedInstallationTime: Math.round(estimatedInstallationTime * 10) / 10,
    createdAt: Date.now(),
  };
}

export function applyAdaptationToScheme(
  scheme: GalleryScheme,
  adaptation: TourAdaptationResult
): GalleryScheme {
  const updatedWallArtworks = scheme.wallArtworks.map(wallArtwork => {
    const mountingAdj = adaptation.mountingAdjustments.find(a => a.wallArtworkId === wallArtwork.id);
    const lightingAdj = adaptation.lightingAdjustments.find(a => a.wallArtworkId === wallArtwork.id);

    return {
      ...wallArtwork,
      position: mountingAdj ? { ...mountingAdj.adjustedPosition } : wallArtwork.position,
      lighting: lightingAdj ? { ...lightingAdj.adjustedLighting } : wallArtwork.lighting,
    };
  });

  return {
    ...scheme,
    wallArtworks: updatedWallArtworks,
    updatedAt: Date.now(),
  };
}
