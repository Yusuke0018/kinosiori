// ParticleEngine.ts - Pure functions for particle creation, physics, and rendering
// No React dependency - Canvas 2D API only

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  rotation: number;
  rotationSpeed: number;
  depth: number;
  life: number;
  maxLife: number;
  phase: number;
  color: string;
  type: string;
}

export interface ParticleConfig {
  count?: number;
  sizeRange?: [number, number];
  speedRange?: [number, number];
  colors?: string[];
  opacityRange?: [number, number];
  /** Extra config per animation type */
  [key: string]: unknown;
}

export interface Wind {
  x: number;
  y: number;
}

// ─── Utility ────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Particle Factory ───────────────────────────────────────────────────────

export function createParticle(
  type: string,
  canvasW: number,
  canvasH: number,
  config: ParticleConfig
): Particle {
  const depth = Math.random();
  const depthScale = 0.3 + depth * 0.7;
  const depthOpacity = 0.3 + depth * 0.7;

  const base: Particle = {
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    vx: 0,
    vy: 0,
    size: 4,
    baseSize: 4,
    opacity: 0.6,
    baseOpacity: 0.6,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: rand(-0.02, 0.02),
    depth,
    life: 0,
    maxLife: rand(300, 800),
    phase: Math.random() * Math.PI * 2,
    color: '#ffffff',
    type,
  };

  switch (type) {
    case 'sakura': {
      const colors = config.colors ?? ['#FFB7C5', '#FADADD', '#FFFFFF', '#F8A4B8'];
      const sz = rand(6, 14) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.5, 0.9) * depthOpacity,
        baseOpacity: rand(0.5, 0.9) * depthOpacity,
        vy: rand(0.3, 1.2) * depthScale,
        vx: rand(-0.3, 0.3),
        rotationSpeed: rand(-0.03, 0.03),
        color: pick(colors),
      };
    }

    case 'snow': {
      const sz = rand(2, 12) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.4, 0.9) * depthOpacity,
        baseOpacity: rand(0.4, 0.9) * depthOpacity,
        vy: rand(0.2, 0.8) * depthScale,
        vx: rand(-0.2, 0.2),
        rotationSpeed: rand(-0.01, 0.01),
        color: pick(config.colors ?? ['#FFFFFF', '#E8F0FE', '#D6EAF8']),
      };
    }

    case 'rain': {
      const sz = rand(8, 20) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.15, 0.4) * depthOpacity,
        baseOpacity: rand(0.15, 0.4) * depthOpacity,
        vy: rand(6, 14) * depthScale,
        vx: rand(0.5, 2),
        rotationSpeed: 0,
        color: pick(config.colors ?? ['#A4C8E1', '#87CEEB', '#B0C4DE']),
      };
    }

    case 'leaf': {
      const sz = rand(8, 16) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.5, 0.85) * depthOpacity,
        baseOpacity: rand(0.5, 0.85) * depthOpacity,
        vy: rand(0.6, 2.0) * depthScale,
        vx: rand(-0.5, 0.5),
        rotationSpeed: rand(-0.02, 0.02),
        color: pick(config.colors ?? ['#D4A017', '#C0392B', '#8B4513', '#DAA520', '#A0522D']),
      };
    }

    case 'gold': {
      const sz = rand(2, 5) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.3, 0.7) * depthOpacity,
        baseOpacity: rand(0.3, 0.7) * depthOpacity,
        vy: rand(-0.1, 0.2),
        vx: rand(-0.1, 0.1),
        rotationSpeed: 0,
        color: pick(config.colors ?? ['#FFD700', '#FFC107', '#FFEB3B', '#F9A825']),
        maxLife: rand(200, 500),
      };
    }

    case 'star': {
      return {
        ...base,
        x: Math.random() * canvasW,
        y: Math.random() * canvasH * 0.7,
        size: rand(1, 3) * depthScale,
        baseSize: rand(1, 3) * depthScale,
        opacity: rand(0.1, 0.7) * depthOpacity,
        baseOpacity: rand(0.1, 0.7) * depthOpacity,
        vy: 0,
        vx: 0,
        rotationSpeed: 0,
        color: pick(config.colors ?? ['#FFFFFF', '#FFFDE7', '#FFF9C4']),
        maxLife: rand(400, 1200),
      };
    }

    case 'sparkle': {
      return {
        ...base,
        size: rand(2, 6) * depthScale,
        baseSize: rand(2, 6) * depthScale,
        opacity: 0,
        baseOpacity: rand(0.3, 0.8) * depthOpacity,
        vy: 0,
        vx: 0,
        rotationSpeed: rand(-0.01, 0.01),
        color: pick(config.colors ?? ['#FFFFFF', '#E0F7FA', '#B2EBF2']),
        maxLife: rand(100, 300),
      };
    }

    case 'crystal': {
      const sz = rand(8, 20) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: 0,
        baseOpacity: rand(0.2, 0.5) * depthOpacity,
        vy: 0,
        vx: 0,
        rotationSpeed: rand(-0.005, 0.005),
        color: pick(config.colors ?? ['#E0F7FA', '#B2EBF2', '#80DEEA', '#FFFFFF']),
        maxLife: rand(300, 600),
      };
    }

    default: {
      // generic
      const sz = rand(2, 6) * depthScale;
      return {
        ...base,
        size: sz,
        baseSize: sz,
        opacity: rand(0.2, 0.6) * depthOpacity,
        baseOpacity: rand(0.2, 0.6) * depthOpacity,
        vy: rand(0.1, 0.5) * depthScale,
        vx: rand(-0.2, 0.2),
        color: pick(config.colors ?? ['#FFFFFF', '#E0E0E0']),
      };
    }
  }
}

// ─── Particle Update ────────────────────────────────────────────────────────

export function updateParticle(
  p: Particle,
  wind: Wind,
  dt: number,
  canvasW: number,
  canvasH: number
): boolean {
  const depthSpeed = 0.4 + p.depth * 0.6;
  const heightFactor = 1 + (1 - p.y / canvasH) * 0.3;

  p.life += dt;

  switch (p.type) {
    case 'sakura': {
      // Lateral flutter using sin wave
      const flutter = Math.sin(p.life * 0.003 + p.phase) * 1.2;
      p.vx += (wind.x * heightFactor * 0.06 + flutter * 0.02) * dt;
      p.vy += 0.005 * dt;
      p.x += p.vx * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      p.vx *= 0.98;
      p.vy *= 0.995;
      // Oscillating rotation
      p.rotation += (p.rotationSpeed + Math.sin(p.life * 0.002 + p.phase) * 0.02) * dt;
      // Gentle size breathing
      p.size = p.baseSize * (0.9 + 0.1 * Math.sin(p.life * 0.004 + p.phase));
      break;
    }

    case 'snow': {
      // Perlin-like sway
      const sway = Math.sin(p.life * 0.0015 + p.phase) * 0.4 +
                    Math.sin(p.life * 0.0037 + p.phase * 1.7) * 0.2;
      p.vx += (wind.x * heightFactor * 0.03 + sway * 0.01) * dt;
      p.vy += 0.002 * dt;
      p.x += p.vx * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      p.vx *= 0.99;
      p.vy *= 0.998;
      p.rotation += p.rotationSpeed * dt;
      break;
    }

    case 'rain': {
      p.vx += wind.x * heightFactor * 0.02 * dt;
      // Rain falls fast
      p.x += p.vx * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      p.vx *= 0.99;
      break;
    }

    case 'leaf': {
      const leafFlutter = Math.sin(p.life * 0.002 + p.phase) * 0.8;
      p.vx += (wind.x * heightFactor * 0.05 + leafFlutter * 0.015) * dt;
      p.vy += 0.008 * dt;
      p.x += p.vx * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      p.vx *= 0.98;
      p.vy *= 0.997;
      p.rotation += (p.rotationSpeed + Math.sin(p.life * 0.0015 + p.phase) * 0.015) * dt;
      break;
    }

    case 'gold': {
      // Gentle drift with twinkle
      p.x += (p.vx + wind.x * 0.01) * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      // Twinkle: oscillate opacity
      p.opacity = p.baseOpacity * (0.4 + 0.6 * Math.abs(Math.sin(p.life * 0.005 + p.phase)));
      break;
    }

    case 'star': {
      // Stars are fixed, only twinkle
      const twinkle = Math.sin(p.life * 0.003 + p.phase) * 0.5 + 0.5;
      p.opacity = 0.1 + (p.baseOpacity - 0.1) * twinkle;
      // Occasional flash: 1% chance per frame of bright flash
      if (Math.random() < 0.001 * dt) {
        p.opacity = Math.min(1, p.baseOpacity * 1.8);
      }
      break;
    }

    case 'sparkle': {
      // Fade in/out cycle
      const cycleProgress = (p.life % p.maxLife) / p.maxLife;
      if (cycleProgress < 0.3) {
        p.opacity = p.baseOpacity * (cycleProgress / 0.3);
      } else if (cycleProgress < 0.7) {
        p.opacity = p.baseOpacity;
      } else {
        p.opacity = p.baseOpacity * (1 - (cycleProgress - 0.7) / 0.3);
      }
      p.rotation += p.rotationSpeed * dt;
      break;
    }

    case 'crystal': {
      // Form and dissolve
      const crystalProgress = p.life / p.maxLife;
      if (crystalProgress < 0.3) {
        p.opacity = p.baseOpacity * (crystalProgress / 0.3);
        p.size = p.baseSize * (crystalProgress / 0.3);
      } else if (crystalProgress < 0.7) {
        p.opacity = p.baseOpacity;
        p.size = p.baseSize;
      } else {
        p.opacity = p.baseOpacity * (1 - (crystalProgress - 0.7) / 0.3);
        p.size = p.baseSize * (1 - (crystalProgress - 0.7) / 0.3 * 0.3);
      }
      p.rotation += p.rotationSpeed * dt;
      break;
    }

    default: {
      // generic
      p.x += (p.vx + wind.x * 0.02) * depthSpeed * dt;
      p.y += p.vy * depthSpeed * dt;
      break;
    }
  }

  // Wrap around screen edges (except fixed types)
  if (p.type !== 'star' && p.type !== 'sparkle' && p.type !== 'crystal') {
    const margin = p.size * 2;
    if (p.y > canvasH + margin) {
      p.y = -margin;
      p.x = Math.random() * canvasW;
    }
    if (p.x > canvasW + margin) {
      p.x = -margin;
    } else if (p.x < -margin) {
      p.x = canvasW + margin;
    }
    if (p.y < -margin && p.vy < 0) {
      p.y = canvasH + margin;
    }
  }

  // Life check for ephemeral types
  if (p.type === 'crystal' || p.type === 'gold') {
    if (p.life > p.maxLife) {
      return false; // dead
    }
  }
  // Sparkle loops, so always alive unless explicitly removed
  if (p.type === 'sparkle' || p.type === 'star') {
    // Keep alive but cycle
    if (p.life > p.maxLife) {
      p.life = 0;
      if (p.type === 'sparkle') {
        p.x = Math.random() * canvasW;
        p.y = Math.random() * canvasH;
      }
    }
  }

  return true; // alive
}

// ─── Particle Drawing ───────────────────────────────────────────────────────

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  if (p.opacity <= 0.01 || p.size <= 0.2) return;

  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  switch (p.type) {
    case 'sakura':
      drawSakuraPetal(ctx, p);
      break;
    case 'snow':
      drawSnowflake(ctx, p);
      break;
    case 'rain':
      drawRaindrop(ctx, p);
      break;
    case 'leaf':
      drawLeaf(ctx, p);
      break;
    case 'gold':
      drawGoldParticle(ctx, p);
      break;
    case 'star':
      drawStarParticle(ctx, p);
      break;
    case 'sparkle':
      drawSparkle(ctx, p);
      break;
    case 'crystal':
      drawCrystal(ctx, p);
      break;
    default:
      drawGeneric(ctx, p);
      break;
  }

  ctx.restore();
}

// ─── Per-type renderers ─────────────────────────────────────────────────────

function drawSakuraPetal(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  // Heart-inverted petal shape via bezier curves
  ctx.moveTo(0, -s * 0.3);
  ctx.bezierCurveTo(s * 0.5, -s * 0.8, s * 0.8, -s * 0.1, 0, s * 0.5);
  ctx.bezierCurveTo(-s * 0.8, -s * 0.1, -s * 0.5, -s * 0.8, 0, -s * 0.3);
  ctx.fill();
  // Subtle center vein
  ctx.strokeStyle = p.color;
  ctx.globalAlpha = p.opacity * 0.3;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.2);
  ctx.lineTo(0, s * 0.35);
  ctx.stroke();
}

function drawSnowflake(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.color;

  if (s < 4) {
    // Small: simple circle
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (s < 8) {
    // Medium: 6-ray star
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const ex = Math.cos(angle) * s * 0.5;
      const ey = Math.sin(angle) * s * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Large: dendritic crystal with branches
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const armLen = s * 0.5;
      const ex = Math.cos(angle) * armLen;
      const ey = Math.sin(angle) * armLen;
      // Main arm
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      // Two branches per arm at 60% length
      const branchStart = 0.6;
      const branchLen = armLen * 0.35;
      const bx = Math.cos(angle) * armLen * branchStart;
      const by = Math.sin(angle) * armLen * branchStart;
      for (const dir of [-1, 1]) {
        const bAngle = angle + dir * (Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(
          bx + Math.cos(bAngle) * branchLen,
          by + Math.sin(bAngle) * branchLen
        );
        ctx.stroke();
      }
    }
  }
}

function drawRaindrop(ctx: CanvasRenderingContext2D, p: Particle): void {
  const w = rand(1, 1.5);
  const h = p.size;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLeaf(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  // Leaf shape: ellipse-like with pointed ends
  ctx.moveTo(-s * 0.5, 0);
  ctx.quadraticCurveTo(0, -s * 0.35, s * 0.5, 0);
  ctx.quadraticCurveTo(0, s * 0.35, -s * 0.5, 0);
  ctx.fill();
  // Center vein
  ctx.strokeStyle = p.color;
  ctx.globalAlpha = p.opacity * 0.4;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, 0);
  ctx.lineTo(s * 0.4, 0);
  ctx.stroke();
}

function drawGoldParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  ctx.globalAlpha = p.opacity * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, p.size, 0, Math.PI * 2);
  ctx.fill();
}

function drawStarParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.fillStyle = p.color;
  // Cross shape for twinkle
  ctx.fillRect(-s * 0.5, -0.5, s, 1);
  ctx.fillRect(-0.5, -s * 0.5, 1, s);
}

function drawSparkle(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 0.8;
  // 4-ray star (cross lines)
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.lineTo(s, 0);
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  // Diagonal shorter rays
  const d = s * 0.5;
  ctx.moveTo(-d, -d);
  ctx.lineTo(d, d);
  ctx.moveTo(d, -d);
  ctx.lineTo(-d, d);
  ctx.stroke();
}

function drawCrystal(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 0.6;
  // Hexagonal outline
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = Math.cos(angle) * s * 0.5;
    const y = Math.sin(angle) * s * 0.5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  // Inner structure: lines from center to vertices
  ctx.globalAlpha = p.opacity * 0.5;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * s * 0.5, Math.sin(angle) * s * 0.5);
    ctx.stroke();
  }
}

function drawGeneric(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
}
