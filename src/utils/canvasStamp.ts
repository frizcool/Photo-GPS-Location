import { StampLocation, StampSettings, ImageAdjustment } from '../types/stamp';
import { formatCoordinates, formatIndonesianDate } from './geo';

/**
 * Draws the enhanced Compass Dial with graduation ticks and 3D dual-tone needle.
 */
export function drawCompass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  headingDeg: number
) {
  ctx.save();

  // Glassmorphic dark circular disc with subtle outer border
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
  grad.addColorStop(0, 'rgba(45, 55, 72, 0.8)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = Math.max(1.5, radius * 0.05);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.stroke();

  // Graduation Tick Marks (every 15 degrees)
  ctx.save();
  for (let angle = 0; angle < 360; angle += 15) {
    const isMajor = angle % 90 === 0;
    const isMedium = angle % 45 === 0;
    const rad = (angle * Math.PI) / 180;
    const rInner = isMajor ? radius * 0.76 : isMedium ? radius * 0.82 : radius * 0.86;
    const rOuter = radius * 0.92;

    const x1 = cx + rInner * Math.sin(rad);
    const y1 = cy - rInner * Math.cos(rad);
    const x2 = cx + rOuter * Math.sin(rad);
    const y2 = cy - rOuter * Math.cos(rad);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.9)' : isMedium ? '#93c5fd' : 'rgba(148, 163, 184, 0.6)';
    ctx.lineWidth = isMajor ? Math.max(1.5, radius * 0.04) : 1;
    ctx.stroke();
  }
  ctx.restore();

  // Draw Cardinal Letters (Fixed to dial)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(radius * 0.3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // N (North)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 3;
  ctx.fillText('N', cx, cy - radius * 0.65);
  // S (South)
  ctx.fillText('S', cx, cy + radius * 0.67);
  // E (East)
  ctx.fillText('E', cx + radius * 0.65, cy);
  // W (West)
  ctx.fillText('W', cx - radius * 0.65, cy);
  ctx.shadowBlur = 0;

  // Rotate Needle based on heading
  ctx.save();
  ctx.translate(cx, cy);
  const needleRad = ((-headingDeg) * Math.PI) / 180;
  ctx.rotate(needleRad);

  // North needle left side (Bright Cyan)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.76);
  ctx.lineTo(-radius * 0.2, 0);
  ctx.lineTo(0, -radius * 0.08);
  ctx.closePath();
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  // North needle right side (Royal Blue)
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.76);
  ctx.lineTo(radius * 0.2, 0);
  ctx.lineTo(0, -radius * 0.08);
  ctx.closePath();
  ctx.fillStyle = '#0284c7';
  ctx.fill();

  // North needle highlight sheen
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.76);
  ctx.lineTo(-radius * 0.08, -radius * 0.3);
  ctx.lineTo(0, -radius * 0.1);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fill();

  // South needle (Silver / Slate)
  ctx.beginPath();
  ctx.moveTo(0, radius * 0.65);
  ctx.lineTo(-radius * 0.16, 0);
  ctx.lineTo(0, radius * 0.06);
  ctx.closePath();
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, radius * 0.65);
  ctx.lineTo(radius * 0.16, 0);
  ctx.lineTo(0, radius * 0.06);
  ctx.closePath();
  ctx.fillStyle = '#64748b';
  ctx.fill();

  // Metallic Center Pivot
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.restore();
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
  customSize: number = 80
) {
  ctx.save();
  // Calculate size proportional to output canvas
  const sizeRatio = Math.max(0.08, Math.min(0.2, customSize / 650));
  const logoW = Math.round(baseUnit * sizeRatio);
  const logoH = logoW; // Square aspect container
  const margin = Math.round(baseUnit * 0.04);
  const x = targetWidth - margin - logoW;
  const y = margin;

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

  if (settings.aspectRatio === '1:1') {
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

  // 1. Draw transformed photograph with crop/zoom/pan/rotation adjustment
  ctx.save();
  // Clip to output bounds
  ctx.beginPath();
  ctx.rect(0, 0, targetWidth, targetHeight);
  ctx.clip();

  const srcAspect = sourceWidth / sourceHeight;
  const targetAspect = targetWidth / targetHeight;

  let baseSw = sourceWidth;
  let baseSh = sourceHeight;
  let baseSx = 0;
  let baseSy = 0;

  if (srcAspect > targetAspect) {
    baseSw = sourceHeight * targetAspect;
    baseSx = (sourceWidth - baseSw) / 2;
  } else if (srcAspect < targetAspect) {
    baseSh = sourceWidth / targetAspect;
    baseSy = (sourceHeight - baseSh) / 2;
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
  const drawWidth = targetWidth * zoom;
  const drawHeight = targetHeight * zoom;

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

  ctx.restore();

  const baseUnit = Math.min(targetWidth, targetHeight);

  // 2. Draw Compass (Top-Left)
  if (settings.showCompass) {
    const compassRadius = baseUnit * 0.11;
    const compassMargin = baseUnit * 0.04;
    const compX = compassMargin + compassRadius;
    const compY = compassMargin + compassRadius;
    const heading = location.heading ?? 348;
    drawCompass(ctx, compX, compY, compassRadius, heading);
  }

  // 3. Draw Top-Right Logo if configured
  if (settings.showLogo && logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
    drawLogo(ctx, logoImage, targetWidth, baseUnit, settings.logoSize || 80);
  }

  // 4. Draw Mini Map (Bottom-Left) with opacity
  const mapSize = baseUnit * 0.28;
  const mapX = 0;
  const mapY = targetHeight - mapSize;

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

  // 5. Draw Timestamp & Address Lines (Bottom-Right)
  const lines: string[] = [];

  const now = new Date();
  const timeStr = formatIndonesianDate(
    now,
    settings.timezone,
    settings.useRealTime ? undefined : settings.customTime,
    settings.useRealTime ? undefined : settings.customDate
  );
  lines.push(timeStr);

  if (settings.showCoordinates) {
    lines.push(formatCoordinates(location.latitude, location.longitude, true));
  }

  if (settings.showAddress) {
    if (location.street) lines.push(location.street);
    if (location.suburb) lines.push(location.suburb);
    if (location.district) lines.push(location.district);
    if (location.city) lines.push(location.city);
    if (location.province) lines.push(location.province);
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

    ctx.font = `500 ${fontSize}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    const rightMargin = targetWidth * 0.035;
    const bottomMargin = targetHeight * 0.035;

    lines.reverse().forEach((line, index) => {
      const lineY = targetHeight - bottomMargin - index * lineHeight;

      if (settings.textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.fillStyle = settings.textColor || '#ffffff';
      ctx.fillText(line, targetWidth - rightMargin, lineY);
    });

    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.94);
}
