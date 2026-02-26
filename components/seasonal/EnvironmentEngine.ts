// EnvironmentEngine.ts - Pure functions for environment/atmosphere effects
// No React dependency - Canvas 2D API only

export interface FlareConfig {
  color: string;
  opacity: number;
  interval: number; // seconds between flares
  speed: number;    // pixels per second
}

export interface HeatHazeConfig {
  intensity: number;   // 0-1 distortion strength
  coverage: number;    // 0-1 vertical coverage ratio
}

export interface BreathingConfig {
  color: string;
  period: number;        // seconds for one full cycle
  opacityRange: [number, number];
}

export interface WaveLinesConfig {
  count: number;
  color: string;
  amplitude: number;
}

export interface FogConfig {
  color: string;
  count: number;
  sizeRange: [number, number];
  opacity: number;
  speed: number;
}

export interface CrystalGrowthConfig {
  color: string;
  armCount: number;
  maxDepth: number;
  lineWidth: number;
  opacity: number;
}

// ─── Light Flare ────────────────────────────────────────────────────────────

export function drawFlare(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: FlareConfig
): void {
  const interval = config.interval * 1000;
  const cycleTime = time % interval;
  const progress = cycleTime / interval;

  // Only draw during active phase (first 60% of interval)
  if (progress > 0.6) return;

  const activeProgress = progress / 0.6;

  // Flare moves diagonally from top-left to bottom-right
  const startX = -w * 0.3;
  const startY = -h * 0.1;
  const endX = w * 1.3;
  const endY = h * 0.5;

  const cx = startX + (endX - startX) * activeProgress;
  const cy = startY + (endY - startY) * activeProgress;

  // Fade in/out
  let alpha = config.opacity;
  if (activeProgress < 0.2) {
    alpha *= activeProgress / 0.2;
  } else if (activeProgress > 0.8) {
    alpha *= (1 - activeProgress) / 0.2;
  }

  // Elongated elliptical flare
  const flareW = w * 0.15;
  const flareH = h * 0.4;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 6); // diagonal angle

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flareW);
  gradient.addColorStop(0, colorWithAlpha(config.color, alpha));
  gradient.addColorStop(0.4, colorWithAlpha(config.color, alpha * 0.4));
  gradient.addColorStop(1, colorWithAlpha(config.color, 0));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, flareW, flareH, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Heat Haze ──────────────────────────────────────────────────────────────

export function drawHeatHaze(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: HeatHazeConfig
): void {
  const bandTop = h * (1 - config.coverage);
  const bandH = h * config.coverage;
  const ellipseCount = 5;

  ctx.save();

  for (let i = 0; i < ellipseCount; i++) {
    const phase = (time * 0.0005 + i * 1.3) % (Math.PI * 2);
    const cx = (w * 0.1) + (w * 0.8) * ((Math.sin(phase * 0.7 + i) + 1) * 0.5);
    const cy = bandTop + bandH * ((Math.sin(phase * 0.5 + i * 0.9) + 1) * 0.5);
    const rx = w * 0.08 + Math.sin(phase) * w * 0.03;
    const ry = bandH * 0.06 + Math.sin(phase * 1.3) * bandH * 0.02;
    const alpha = config.intensity * 0.03 * (0.5 + 0.5 * Math.sin(phase * 2));

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── Breathing Overlay ──────────────────────────────────────────────────────

export function drawBreathing(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: BreathingConfig
): void {
  const periodMs = config.period * 1000;
  const phase = (time % periodMs) / periodMs;
  const [minOp, maxOp] = config.opacityRange;
  const alpha = minOp + (maxOp - minOp) * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2));

  const gradient = ctx.createRadialGradient(
    w * 0.5, h * 0.5, 0,
    w * 0.5, h * 0.5, Math.max(w, h) * 0.7
  );
  gradient.addColorStop(0, colorWithAlpha(config.color, alpha));
  gradient.addColorStop(1, colorWithAlpha(config.color, 0));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

// ─── Wave Lines ─────────────────────────────────────────────────────────────

export function drawWaveLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: WaveLinesConfig
): void {
  const { count, color, amplitude } = config;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i < count; i++) {
    const baseY = (h / (count + 1)) * (i + 1);
    const speed = 0.0003 + i * 0.00005;
    const freq = 0.003 + i * 0.0005;
    const offset = time * speed + i * 1.5;

    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const y = baseY +
        Math.sin(x * freq + offset) * amplitude +
        Math.sin(x * freq * 2.3 + offset * 1.7) * amplitude * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Fog ────────────────────────────────────────────────────────────────────

// Persistent fog blob state to avoid re-allocating each frame
const fogBlobs: Array<{ x: number; y: number; r: number; phase: number }> = [];

export function drawFog(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: FogConfig
): void {
  // Initialize blobs if needed
  while (fogBlobs.length < config.count) {
    fogBlobs.push({
      x: Math.random() * w * 1.5,
      y: Math.random() * h,
      r: config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
      phase: Math.random() * Math.PI * 2,
    });
  }
  // Trim excess
  fogBlobs.length = config.count;

  ctx.save();

  for (let i = 0; i < fogBlobs.length; i++) {
    const blob = fogBlobs[i];
    // Slow horizontal drift
    const bx = ((blob.x + time * config.speed * 0.001 * (0.5 + i * 0.1)) % (w * 1.5)) - w * 0.25;
    const by = blob.y + Math.sin(time * 0.0003 + blob.phase) * 20;

    const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.r);
    gradient.addColorStop(0, colorWithAlpha(config.color, config.opacity * 0.6));
    gradient.addColorStop(0.5, colorWithAlpha(config.color, config.opacity * 0.3));
    gradient.addColorStop(1, colorWithAlpha(config.color, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── Crystal Growth (frost from edges) ──────────────────────────────────────

export function drawCrystalGrowth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: CrystalGrowthConfig
): void {
  const growthProgress = Math.min(1, (time % 30000) / 20000); // 20s grow, 10s hold
  const maxLen = Math.min(w, h) * 0.15 * growthProgress;

  if (maxLen < 2) return;

  ctx.save();
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.lineWidth;
  ctx.globalAlpha = config.opacity * (0.5 + 0.5 * growthProgress);

  // Grow from corners
  const corners = [
    { x: 0, y: 0, baseAngle: Math.PI * 0.25 },
    { x: w, y: 0, baseAngle: Math.PI * 0.75 },
    { x: 0, y: h, baseAngle: -Math.PI * 0.25 },
    { x: w, y: h, baseAngle: -Math.PI * 0.75 },
  ];

  for (const corner of corners) {
    for (let arm = 0; arm < config.armCount; arm++) {
      const armAngle = corner.baseAngle + ((arm - (config.armCount - 1) / 2) * Math.PI) / (config.armCount * 2);
      drawFractalBranch(ctx, corner.x, corner.y, armAngle, maxLen, config.maxDepth, 0);
    }
  }

  ctx.restore();
}

function drawFractalBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  maxDepth: number,
  depth: number
): void {
  if (depth >= maxDepth || length < 3) return;

  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Sub-branches at 60-degree offsets (ice crystal structure)
  const subLen = length * 0.5;
  const branchPoint = 0.6;
  const bx = x + Math.cos(angle) * length * branchPoint;
  const by = y + Math.sin(angle) * length * branchPoint;

  drawFractalBranch(ctx, bx, by, angle + Math.PI / 3, subLen, maxDepth, depth + 1);
  drawFractalBranch(ctx, bx, by, angle - Math.PI / 3, subLen, maxDepth, depth + 1);

  // Tip sub-branch
  if (depth < maxDepth - 1) {
    drawFractalBranch(ctx, endX, endY, angle + Math.PI / 5, subLen * 0.7, maxDepth, depth + 1);
    drawFractalBranch(ctx, endX, endY, angle - Math.PI / 5, subLen * 0.7, maxDepth, depth + 1);
  }
}

// ─── Utility ────────────────────────────────────────────────────────────────

function colorWithAlpha(hex: string, alpha: number): string {
  // Support hex (#RRGGBB) or named colors
  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.startsWith('#') && hex.length === 4) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Fallback: return as-is with modified alpha via rgba
  return hex;
}
