import { StampLocation, StampSettings, ImageAdjustment } from '../types/stamp';
import { formatCoordinates, formatIndonesianDate } from './geo';
import { getFontStyleOption } from './fontStyles';

/**
 * Draws the reference-matched Compass Dial with dark circular ring, bold cardinal letters, and vivid cyan needle.
 */
export function drawCompass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  headingDeg: number
) {
  ctx.save();
  const normalizedHeading = Math.round(((headingDeg % 360) + 360) % 360);

  // 1. Outer Dark Circular Disc / Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.78)');
  grad.addColorStop(0.7, 'rgba(30, 41, 59, 0.88)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = Math.max(1.5, radius * 0.04);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.stroke();

  // 2. Inner Track Ring Groove
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Graduation Tick Marks (every 15 degrees)
  ctx.save();
  for (let angle = 0; angle < 360; angle += 15) {
    const isMajor = angle % 90 === 0;
    const isMedium = angle % 45 === 0;
    const rad = (angle * Math.PI) / 180;
    const rInner = isMajor ? radius * 0.82 : isMedium ? radius * 0.86 : radius * 0.9;
    const rOuter = radius * 0.97;

    const x1 = cx + rInner * Math.sin(rad);
    const y1 = cy - rInner * Math.cos(rad);
    const x2 = cx + rOuter * Math.sin(rad);
    const y2 = cy - rOuter * Math.cos(rad);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isMajor ? '#ffffff' : isMedium ? '#7dd3fc' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = isMajor ? Math.max(1.8, radius * 0.035) : 1;
    ctx.stroke();
  }
  ctx.restore();

  // 4. Cardinal Letters (N, E, S, W in crisp bold white inside ring track)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(radius * 0.26)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 3;
  ctx.fillText('N', cx, cy - radius * 0.58);
  ctx.fillText('S', cx, cy + radius * 0.6);
  ctx.fillText('E', cx + radius * 0.58, cy);
  ctx.fillText('W', cx - radius * 0.58, cy);
  ctx.shadowBlur = 0;

  // 5. Rotate Cyan Needle based on heading
  ctx.save();
  ctx.translate(cx, cy);
  const needleRad = ((-headingDeg) * Math.PI) / 180;
  ctx.rotate(needleRad);

  // North needle left side (Vivid Cyan)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.72);
  ctx.lineTo(-radius * 0.16, 0);
  ctx.lineTo(0, -radius * 0.08);
  ctx.closePath();
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  // North needle right side (Royal Blue)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.72);
  ctx.lineTo(radius * 0.16, 0);
  ctx.lineTo(0, -radius * 0.08);
  ctx.closePath();
  ctx.fillStyle = '#0284c7';
  ctx.fill();

  // North needle highlight sheen
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.72);
  ctx.lineTo(-radius * 0.06, -radius * 0.35);
  ctx.lineTo(0, -radius * 0.12);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fill();

  // South needle (Light & Dark Slate)
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.62);
  ctx.lineTo(-radius * 0.14, 0);
  ctx.lineTo(0, radius * 0.06);
  ctx.closePath();
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, radius * 0.62);
  ctx.lineTo(radius * 0.14, 0);
  ctx.lineTo(0, radius * 0.06);
  ctx.closePath();
  ctx.fillStyle = '#64748b';
  ctx.fill();

  // Center Metallic Pivot
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.065, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.restore();

  // 6. Degree and Direction Pill Badge under compass
  const dirNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const dirIdx = Math.round(normalizedHeading / 45) % 8;
  const dirText = dirNames[dirIdx];

  const pillText = `${normalizedHeading}° ${dirText}`;
  ctx.font = `600 ${Math.max(10, Math.round(radius * 0.22))}px monospace`;
  const badgeWidth = ctx.measureText(pillText).width + radius * 0.25;
  const badgeHeight = Math.max(14, radius * 0.32);
  const badgeY = cy + radius * 1.08;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const rad = 6;
  const bx = cx - badgeWidth / 2;
  const by = badgeY;
  ctx.roundRect ? ctx.roundRect(bx, by, badgeWidth, badgeHeight, rad) : ctx.rect(bx, by, badgeWidth, badgeHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#7dd3fc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pillText, cx, by + badgeHeight / 2);

  ctx.restore();
}

/**
 * Draws the Red Map Pin Marker
 */
function drawPin(ctx: CanvasRenderingContext2D, px: number, py: number, size: number) {
  ctx.save();
  // Pin Shadow
  ctx.beginPath();
  ctx.ellipse(px + size * 0.15, py + size * 0.05, size * 0.25, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fill();

  // Pin Head
  ctx.beginPath();
  ctx.arc(px, py - size * 0.75, size * 0.4, Math.PI, 0, false);
  ctx.bezierCurveTo(
    px + size * 0.4,
    py - size * 0.4,
    px + size * 0.15,
    py - size * 0.1,
    px,
    py
  );
  ctx.bezierCurveTo(
    px - size * 0.15,
    py - size * 0.1,
    px - size * 0.4,
    py - size * 0.4,
    px - size * 0.4,
    py - size * 0.75
  );
  ctx.closePath();

  const grad = ctx.createLinearGradient(px - size * 0.4, py - size * 1.2, px + size * 0.4, py);
  grad.addColorStop(0, '#ef4444');
  grad.addColorStop(1, '#b91c1c');
  ctx.fillStyle = grad;
  ctx.fill();

  // Inner dot
  ctx.beginPath();
  ctx.arc(px, py - size * 0.75, size * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the Mini Map Box at bottom-left with custom opacity.
 */
export async function drawMiniMap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  lat: number,
  lon: number,
  mapImage?: HTMLImageElement | null,
  opacity: number = 0.85
) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.2, Math.min(1.0, opacity));

  // Background box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x, y, size, size);

  if (mapImage && mapImage.complete && mapImage.naturalWidth > 0) {
    try {
      ctx.drawImage(mapImage, x, y, size, size);
    } catch {
      drawVectorFallbackMap(ctx, x, y, size, lat, lon);
    }
  } else {
    drawVectorFallbackMap(ctx, x, y, size, lat, lon);
  }

  // Draw Pin in Center
  drawPin(ctx, x + size / 2, y + size / 2, size * 0.22);

  // Google styled colored logo
  ctx.font = `bold ${Math.max(10, Math.round(size * 0.08))}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  
  const logoX = x + size * 0.04;
  const logoY = y + size - size * 0.04;
  
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#4285F4';
  ctx.fillText('G', logoX, logoY);
  ctx.fillStyle = '#EA4335';
  ctx.fillText('o', logoX + size * 0.05, logoY);
  ctx.fillStyle = '#FBBC05';
  ctx.fillText('o', logoX + size * 0.085, logoY);
  ctx.fillStyle = '#4285F4';
  ctx.fillText('g', logoX + size * 0.12, logoY);
  ctx.fillStyle = '#34A853';
  ctx.fillText('l', logoX + size * 0.155, logoY);
  ctx.fillStyle = '#EA4335';
  ctx.fillText('e', logoX + size * 0.175, logoY);
  ctx.shadowBlur = 0;

  // Outer border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);

  ctx.restore();
}

/**
 * Fallback procedural vector map tile when network map image isn't available
 */
function drawVectorFallbackMap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  lat: number,
  lon: number
) {
  ctx.fillStyle = '#e8ecef';
  ctx.fillRect(x, y, size, size);

  // Parks
  ctx.fillStyle = '#d5e8d4';
  ctx.beginPath();
  ctx.rect(x + size * 0.05, y + size * 0.05, size * 0.35, size * 0.3);
  ctx.rect(x + size * 0.65, y + size * 0.55, size * 0.3, size * 0.35);
  ctx.fill();

  // Water feature
  ctx.fillStyle = '#b1d4e0';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.7);
  ctx.bezierCurveTo(x + size * 0.3, y + size * 0.75, x + size * 0.5, y + size * 0.85, x + size * 0.9, y + size);
  ctx.lineTo(x, y + size);
  ctx.closePath();
  ctx.fill();

  // Roads
  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.5);
  ctx.lineTo(x + size, y + size * 0.5);
  ctx.moveTo(x + size * 0.5, y);
  ctx.lineTo(x + size * 0.5, y + size);
  ctx.moveTo(x + size * 0.2, y);
  ctx.lineTo(x + size * 0.8, y + size);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Buildings
  ctx.fillStyle = '#f1f5f9';
  const seed = Math.abs(Math.sin(lat + lon) * 100);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((i + j + Math.floor(seed)) % 2 === 0) {
        ctx.fillRect(x + size * (0.12 + i * 0.22), y + size * (0.12 + j * 0.22), size * 0.12, size * 0.12);
      }
    }
  }
}

/**
 * Draws the Top-Right Logo with subtle drop shadow
 */
export function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoImg: HTMLImageElement,
  targetWidth: number,
  baseUnit: number,
  customSize: number = 80,
  targetHeight: number = targetWidth,
  corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
) {
  ctx.save();
  // Calculate size proportional to output canvas
  const sizeRatio = Math.max(0.08, Math.min(0.2, customSize / 650));
  const logoW = Math.round(baseUnit * sizeRatio);
  const logoH = logoW; // Square aspect container
  const margin = Math.round(baseUnit * 0.04);

  let x = targetWidth - margin - logoW;
  let y = margin;

  if (corner === 'bottom-right') {
    x = targetWidth - margin - logoW;
    y = targetHeight - margin - logoH;
  } else if (corner === 'bottom-left') {
    x = margin;
    y = targetHeight - margin - logoH;
  } else if (corner === 'top-left') {
    x = margin;
    y = margin;
  }

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;

  // Aspect fit the logo image inside the box
  const imgW = logoImg.naturalWidth || logoW;
  const imgH = logoImg.naturalHeight || logoH;
  const imgAspect = imgW / imgH;

  let drawW = logoW;
  let drawH = logoH;
  let drawX = x;
  let drawY = y;

  if (imgAspect > 1) {
    drawH = logoW / imgAspect;
    drawY = y + (logoH - drawH) / 2;
  } else {
    drawW = logoH * imgAspect;
    drawX = x + (logoW - drawW) / 2;
  }

  ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/**
 * Composites the full stamped image onto a canvas.
 */
export async function createStampedImage(
  imageSource: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  location: StampLocation,
  settings: StampSettings,
  mapImage?: HTMLImageElement | null,
  logoImage?: HTMLImageElement | null,
  adjustment?: ImageAdjustment
): Promise<string> {
  const canvas = document.createElement('canvas');

  // Determine output dimensions based on target aspect ratio
  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (settings.aspectRatio === 'original') {
    targetWidth = sourceWidth;
    targetHeight = sourceHeight;
  } else if (settings.aspectRatio === '1:1') {
    const minDim = Math.min(sourceWidth, sourceHeight);
    targetWidth = minDim;
    targetHeight = minDim;
  } else if (settings.aspectRatio === '4:3') {
    if (sourceWidth >= sourceHeight) {
      targetWidth = Math.round(sourceHeight * (4 / 3));
      targetHeight = sourceHeight;
    } else {
      targetWidth = sourceWidth;
      targetHeight = Math.round(sourceWidth * (4 / 3));
    }
  } else if (settings.aspectRatio === '16:9') {
    if (sourceWidth >= sourceHeight) {
      targetWidth = sourceWidth;
      targetHeight = Math.round(sourceWidth * (9 / 16));
    } else {
      targetWidth = Math.round(sourceHeight * (9 / 16));
      targetHeight = sourceHeight;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Fill canvas background with clean dark tone for letterboxing if needed
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 1. Draw transformed photograph with crop/zoom/pan/rotation adjustment
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, targetWidth, targetHeight);
  ctx.clip();

  const srcAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  let baseSw = sourceWidth;
  let baseSh = sourceHeight;
  let baseSx = 0;
  let baseSy = 0;

  if (settings.aspectRatio === 'original') {
    baseSw = sourceWidth;
    baseSh = sourceHeight;
    baseSx = 0;
    baseSy = 0;
  } else if (adjustment?.fitMode === 'fit') {
    // Fit entire image without cropping
    baseSw = sourceWidth;
    baseSh = sourceHeight;
    baseSx = 0;
    baseSy = 0;
  } else {
    // Fill mode: crop to aspect ratio
    if (srcAspect > targetAspect) {
      baseSw = sourceHeight * targetAspect;
      baseSx = (sourceWidth - baseSw) / 2;
    } else if (srcAspect < targetAspect) {
      baseSh = sourceWidth / targetAspect;
      baseSy = (sourceHeight - baseSh) / 2;
    }
  }

  // Apply user zoom and pan adjustments
  const zoom = adjustment?.zoom ?? 1.0;
  const panX = adjustment?.panX ?? 0;
  const panY = adjustment?.panY ?? 0;
  const rotate = adjustment?.rotate ?? 0;

  // Calculate destination bounds with center pivot
  const cx = targetWidth / 2;
  const cy = targetHeight / 2;

  ctx.translate(cx, cy);

  if (rotate !== 0) {
    ctx.rotate((rotate * Math.PI) / 180);
  }

  // Pan shift in pixels relative to viewport
  const shiftX = (panX / 100) * targetWidth;
  const shiftY = (panY / 100) * targetHeight;
  ctx.translate(shiftX, shiftY);

  // Scaled dimensions
  let drawWidth = targetWidth * zoom;
  let drawHeight = targetHeight * zoom;

  if (adjustment?.fitMode === 'fit' && settings.aspectRatio !== 'original') {
    const scaleFactor = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
    drawWidth = sourceWidth * scaleFactor * zoom;
    drawHeight = sourceHeight * scaleFactor * zoom;
  }

  // Night Mode: apply low-light exposure and contrast boost to image
  if (settings.nightMode) {
    ctx.filter = 'brightness(1.35) contrast(1.18) saturate(1.1)';
  }

  ctx.drawImage(
    imageSource,
    baseSx,
    baseSy,
    baseSw,
    baseSh,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  ctx.filter = 'none';
  ctx.restore();

  const baseUnit = Math.min(targetWidth, targetHeight);

  const placement = settings.stampPlacement || 'bottom-right';

  // 2. Draw Compass
  if (settings.showCompass) {
    const compassRadius = baseUnit * 0.11;
    const compassMargin = baseUnit * 0.04;
    let compX = compassMargin + compassRadius;
    let compY = compassMargin + compassRadius;

    if (placement === 'top-left') {
      compX = targetWidth - compassMargin - compassRadius;
      compY = compassMargin + compassRadius;
    }

    const heading = location.heading ?? 348;
    drawCompass(ctx, compX, compY, compassRadius, heading);
  }

  // 3. Draw Logo if configured
  if (settings.showLogo && logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    let logoCorner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
    if (placement === 'top-right') {
      logoCorner = 'bottom-right';
    } else if (placement === 'top-left') {
      logoCorner = 'bottom-left';
    }

    drawLogo(
      ctx,
      logoImage,
      targetWidth,
      baseUnit,
      settings.logoSize || 80,
      targetHeight,
      logoCorner
    );
  }

  // 4. Draw Mini Map with opacity
  const mapSize = baseUnit * 0.28;
  let mapX = 0;
  let mapY = targetHeight - mapSize;

  if (placement === 'bottom-left' || placement === 'top-left') {
    mapX = targetWidth - mapSize;
    mapY = targetHeight - mapSize;
  }

  if (settings.showMap) {
    await drawMiniMap(
      ctx,
      mapX,
      mapY,
      mapSize,
      location.latitude,
      location.longitude,
      mapImage,
      settings.mapOpacity ?? 0.85
    );
  }

  // 5. Draw Timestamp & Address Lines (Corner-Aware)
  const lines: string[] = [];

  // Optional Custom Header
  if (settings.customHeader?.trim()) {
    lines.push(settings.customHeader.trim());
  }

  const now = new Date();
  const timeStr = formatIndonesianDate(
    now,
    settings.timezone,
    settings.useRealTime ? undefined : settings.customTime,
    settings.useRealTime ? undefined : settings.customDate,
    {
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      showDayName: settings.showDayName,
    }
  );
  lines.push(timeStr);

  if (settings.showCoordinates) {
    lines.push(
      formatCoordinates(location.latitude, location.longitude, true, settings.coordinateFormat)
    );
  }

  if (settings.showAddress) {
    if (location.street) lines.push(location.street);
    if (location.suburb) lines.push(location.suburb);
    if (location.district) lines.push(location.district);
    if (location.city) lines.push(location.city);
    if (location.province) lines.push(location.province);
  }

  // Optional Custom Subtext / Additional Text
  if (settings.customSubtext?.trim()) {
    lines.push(settings.customSubtext.trim());
  }

  if (settings.watermarkNote) {
    lines.push(settings.watermarkNote);
  }
  if (location.projectName) {
    lines.push(`Proyek: ${location.projectName}`);
  }
  if (location.userName) {
    lines.push(`Petugas: ${location.userName}`);
  }

  if (lines.length > 0) {
    ctx.save();
    let fontSizeMultiplier = 0.038;
    if (settings.textSize === 'small') fontSizeMultiplier = 0.032;
    if (settings.textSize === 'large') fontSizeMultiplier = 0.045;

    const fontSize = Math.max(14, Math.round(baseUnit * fontSizeMultiplier));
    const lineHeight = fontSize * 1.35;

    const fontOption = getFontStyleOption(settings.fontFamily);
    const fontFamilyName = fontOption.canvasFont;

    ctx.font = `600 ${fontSize}px ${fontFamilyName}`;

    const isBottom = placement.startsWith('bottom');
    const isRight = placement.endsWith('right');

    ctx.textAlign = isRight ? 'right' : 'left';
    ctx.textBaseline = 'bottom';

    const marginH = targetWidth * 0.035;
    const marginV = targetHeight * 0.035;
    const textX = isRight ? targetWidth - marginH : marginH;

    // Night Mode: Render high-contrast backdrop behind text if active
    if (settings.nightMode) {
      let maxLineWidth = 0;
      lines.forEach((l) => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });

      const padX = fontSize * 0.8;
      const padY = fontSize * 0.6;
      const boxWidth = maxLineWidth + padX * 2;
      const boxHeight = lines.length * lineHeight + padY * 2;
      const boxX = isRight
        ? targetWidth - marginH - maxLineWidth - padX
        : marginH - padX;
      const boxY = isBottom
        ? targetHeight - marginV - (lines.length - 1) * lineHeight - fontSize - padY
        : marginV - padY;

      ctx.save();
      ctx.fillStyle =
        settings.nightModeContrast === 'ultra'
          ? 'rgba(0, 0, 0, 0.88)'
          : 'rgba(5, 10, 20, 0.72)';
      ctx.beginPath();
      // Rounded rect
      const radius = 10;
      ctx.roundRect ? ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius) : ctx.rect(boxX, boxY, boxWidth, boxHeight);
      ctx.fill();
      ctx.strokeStyle = settings.nightModeContrast === 'ultra' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Top-to-bottom line rendering for all placements
    const startY = isBottom
      ? targetHeight - marginV - (lines.length - 1) * lineHeight
      : marginV + fontSize;

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;

      if (settings.textShadow || settings.nightMode) {
        ctx.shadowColor = settings.nightMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = settings.nightMode ? 6 : 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.fillStyle = settings.textColor || '#ffffff';
      ctx.fillText(line, textX, lineY);
    });

    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.94);
}
