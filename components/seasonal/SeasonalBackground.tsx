'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  getSekkiTransition,
  getInterpolatedSekkiStyle,
} from '@/lib/sekki';

// ─── 24節気ごとのアニメーション設定 (LogBook 準拠) ────────────────────────────

const SEKKI_ANIMATIONS: Record<string, { types: string[]; count: number; colors: string[] }> = {
  // 冬
  '小寒': { types: ['snow', 'sparkle'], count: 36, colors: ['#FFFFFF', '#E0FFFF', '#F0F8FF'] },
  '大寒': { types: ['snow', 'sparkle'], count: 56, colors: ['#FFFFFF', '#DDEEFF', '#C6E2FF'] },
  '立冬': { types: ['leaf', 'sparkle'], count: 28, colors: ['#A0522D', '#8B4513', '#D2691E'] },
  '小雪': { types: ['snow'], count: 28, colors: ['#FFFFFF', '#F5F5F5', '#E6E6FA'] },
  '大雪': { types: ['snow'], count: 52, colors: ['#FFFFFF', '#FFFAFA', '#F0FFFF'] },
  '冬至': { types: ['sparkle', 'snow'], count: 44, colors: ['#FFD700', '#FFA500', '#FFFAF0'] },
  // 春
  '立春': { types: ['petal', 'sparkle'], count: 34, colors: ['#FFB6C1', '#FFC0CB', '#FF69B4'] },
  '雨水': { types: ['raindrop', 'petal'], count: 42, colors: ['#ADD8E6', '#B0E0E6', '#87CEFA'] },
  '啓蟄': { types: ['leaf', 'petal'], count: 30, colors: ['#9ACD32', '#ADFF2F', '#7CFC00'] },
  '春分': { types: ['petal', 'sparkle'], count: 40, colors: ['#FFC0CB', '#FFB6C1', '#DB7093'] },
  '清明': { types: ['petal', 'bubble'], count: 36, colors: ['#AFEEEE', '#E0FFFF', '#00CED1'] },
  '穀雨': { types: ['raindrop', 'leaf'], count: 48, colors: ['#87CEEB', '#ADD8E6', '#B0C4DE'] },
  // 夏
  '立夏': { types: ['leaf', 'sparkle'], count: 34, colors: ['#32CD32', '#00FF00', '#7FFF00'] },
  '小満': { types: ['sparkle', 'firefly'], count: 40, colors: ['#FFFF00', '#FFFACD', '#FFD700'] },
  '芒種': { types: ['leaf', 'seed'], count: 44, colors: ['#556B2F', '#6B8E23', '#808000'] },
  '夏至': { types: ['sparkle', 'firefly'], count: 54, colors: ['#FF4500', '#FFD700', '#FFA500'] },
  '小暑': { types: ['sparkle', 'firefly'], count: 46, colors: ['#4682B4', '#5F9EA0', '#00BFFF'] },
  '大暑': { types: ['sparkle', 'firefly'], count: 64, colors: ['#FF6347', '#FF4500', '#FF0000'] },
  // 秋
  '立秋': { types: ['leaf', 'sparkle'], count: 32, colors: ['#CD853F', '#D2B48C', '#F4A460'] },
  '処暑': { types: ['leaf', 'seed'], count: 38, colors: ['#DAA520', '#B8860B', '#CD853F'] },
  '白露': { types: ['bubble', 'sparkle'], count: 28, colors: ['#F0F8FF', '#F8F8FF', '#FFFFFF'] },
  '秋分': { types: ['leaf', 'sparkle'], count: 42, colors: ['#DC143C', '#B22222', '#FF4500'] },
  '寒露': { types: ['raindrop', 'leaf'], count: 36, colors: ['#6A5ACD', '#836FFF', '#9370DB'] },
  '霜降': { types: ['sparkle', 'snow'], count: 30, colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD'] },
};

// ─── タイプ別サイズ・速度 ────────────────────────────────────────────────────

const TYPE_SIZE: Record<string, { min: number; max: number }> = {
  snow: { min: 1.8, max: 3.6 },
  petal: { min: 4, max: 10 },
  leaf: { min: 4, max: 10 },
  sparkle: { min: 1.5, max: 3.5 },
  raindrop: { min: 3, max: 5 },
  firefly: { min: 1.5, max: 3.2 },
  bubble: { min: 3, max: 7 },
  seed: { min: 3, max: 6 },
};

const TYPE_SPEED: Record<string, { min: number; max: number }> = {
  snow: { min: 0.3, max: 0.8 },
  petal: { min: 0.5, max: 1.2 },
  leaf: { min: 0.6, max: 1.4 },
  sparkle: { min: 0.2, max: 0.6 },
  raindrop: { min: 1.6, max: 3.0 },
  firefly: { min: 0.05, max: 0.15 },
  bubble: { min: 0.15, max: 0.35 },
  seed: { min: 0.4, max: 0.9 },
};

// ─── Particle interface ──────────────────────────────────────────────────────

interface Particle {
  layer: { depth: number; opacity: number };
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  color: string;
  type: string;
  mode: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function hexToRgba(hex: string, a: number): string {
  if (hex.startsWith('rgb')) return hex;
  const c = hex.replace('#', '');
  const bigint = parseInt(
    c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function pickModeForType(t: string): string {
  switch (t) {
    case 'petal':
    case 'leaf':
    case 'seed':
      return Math.random() < 0.5 ? 'swirl' : 'fall';
    case 'bubble':
      return 'rise';
    case 'firefly':
      return 'wander';
    default:
      return 'fall';
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_DPR = 2;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SeasonalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgDivRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const windRef = useRef(0);
  const transitionAlphaRef = useRef(0);
  const prevSekkiNameRef = useRef<string>('');
  const sizeMultiplierRef = useRef(1);
  const windIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── CSS custom properties ─────────────────────────────────────────────

  const applyCssProperties = useCallback(() => {
    const style = getInterpolatedSekkiStyle(new Date());
    const root = document.documentElement;
    root.style.setProperty('--sekki-border-color', style.cardBorderColor);
    root.style.setProperty('--sekki-shadow-color', style.cardShadowColor);
    root.style.setProperty('--sekki-bg', style.bgGradient);

    if (bgDivRef.current) {
      bgDivRef.current.style.background = style.bgGradient;
    }
  }, []);

  // ─── Resize handler ────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ─── Particle factory ─────────────────────────────────────────────────

  const makeParticle = useCallback(
    (
      layer: { depth: number; opacity: number },
      types: string[],
      colors: string[],
      w: number,
      h: number
    ): Particle => {
      const chosenType = types[Math.floor(Math.random() * types.length)];
      const typeSize = TYPE_SIZE[chosenType] || TYPE_SIZE.snow;
      const typeSpeed = TYPE_SPEED[chosenType] || TYPE_SPEED.snow;
      const size = rand(typeSize.min, typeSize.max) * layer.depth * sizeMultiplierRef.current;
      const speed = rand(typeSpeed.min, typeSpeed.max) * layer.depth;
      const angle = Math.random() * Math.PI * 2;
      return {
        layer,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * 0.1,
        vy: speed,
        size,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: rand(-0.02, 0.02) * layer.depth,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: chosenType,
        mode: pickModeForType(chosenType),
      };
    },
    []
  );

  // ─── Draw single particle ─────────────────────────────────────────────

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, p: Particle, now: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const color = p.color;

      switch (p.type) {
        case 'snow': {
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          grd.addColorStop(0, color);
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'petal': {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'leaf': {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.2, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.2, 0, -p.size);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'sparkle': {
          const blink = 0.75 + 0.25 * (0.5 + 0.5 * Math.sin(now / 300 + p.x * 0.02));
          ctx.globalAlpha *= blink;
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.4);
          grd.addColorStop(0, hexToRgba(color, 0.35));
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.fillRect(-p.size * 0.05, -p.size, p.size * 0.1, p.size * 2);
          ctx.fillRect(-p.size, -p.size * 0.05, p.size * 2, p.size * 0.1);
          break;
        }
        case 'raindrop': {
          ctx.strokeStyle = hexToRgba(color, 0.8);
          ctx.lineWidth = Math.max(1, p.size * 0.12);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.6);
          ctx.lineTo(0, p.size * 1.6);
          ctx.stroke();
          break;
        }
        case 'firefly': {
          const blink = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now / 500 + p.y * 0.03));
          ctx.globalAlpha *= blink;
          const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
          grd.addColorStop(0, hexToRgba(color, 0.6));
          grd.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1, p.size * 0.4), 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'bubble': {
          ctx.strokeStyle = hexToRgba(color, 0.5);
          ctx.lineWidth = Math.max(1, p.size * 0.1);
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'seed': {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.ellipse(0, p.size * 0.2, p.size * 0.25, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = hexToRgba(color, 0.7);
          ctx.lineWidth = Math.max(1, p.size * 0.08);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.8);
          ctx.lineTo(0, p.size * 0.2);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();
    },
    []
  );

  // ─── Main animation loop ──────────────────────────────────────────────

  const animate = useCallback(
    (timestamp: number) => {
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Delta time (capped at 50ms)
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 50);
      lastTimeRef.current = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const now = new Date();

      // Get current sekki
      const transition = getSekkiTransition(now);
      const sekki = transition.current;
      const sekkiName = sekki.name;

      // If sekki changed, rebuild particles
      if (sekkiName !== prevSekkiNameRef.current) {
        prevSekkiNameRef.current = sekkiName;
        transitionAlphaRef.current = 0;
        applyCssProperties();

        const config = SEKKI_ANIMATIONS[sekkiName];
        if (config) {
          const isMobile = window.innerWidth <= 768;
          const baseCount = isMobile
            ? Math.min(Math.floor(config.count * 1.2), 90)
            : config.count;
          sizeMultiplierRef.current = isMobile ? 1.25 : 1.0;

          // 3-layer parallax
          const layers = [
            { depth: 0.5, opacity: 0.5, count: Math.floor(baseCount * 0.4) },
            { depth: 1.0, opacity: 0.8, count: Math.floor(baseCount * 0.45) },
            { depth: 1.6, opacity: 1.0, count: Math.floor(baseCount * 0.3) },
          ];

          const particles: Particle[] = [];
          for (const layer of layers) {
            for (let i = 0; i < layer.count; i++) {
              particles.push(makeParticle(layer, config.types, config.colors, w, h));
            }
          }
          particlesRef.current = particles;

          // Reset wind simulation
          if (windIntervalRef.current) clearInterval(windIntervalRef.current);
          windRef.current = 0;
          windIntervalRef.current = setInterval(() => {
            const target = (Math.random() - 0.5) * 3;
            const start = windRef.current;
            const duration = 3000 + Math.random() * 3000;
            const startTime = performance.now();
            const tick = () => {
              const t = Math.min(1, (performance.now() - startTime) / duration);
              const eased = t * (2 - t); // ease-out quadratic
              windRef.current = start + (target - start) * eased;
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, 5000 + Math.random() * 5000);
        }
      }

      // Fade-in transition
      if (transitionAlphaRef.current < 1) {
        transitionAlphaRef.current = Math.min(1, transitionAlphaRef.current + dt / 800);
      }

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Update and draw particles
      const particles = particlesRef.current;
      const tSec = timestamp / 1000;

      for (const p of particles) {
        const sway = Math.sin(tSec + p.y * 0.01 + p.x * 0.005) * 0.4;

        // Movement based on mode
        switch (p.mode) {
          case 'swirl': {
            p.vx = Math.cos(tSec + p.y * 0.005) * 0.3 + windRef.current * 0.002;
            p.vy = Math.sin(tSec * 0.7) * 0.2 + Math.abs(p.vy) * 0.6;
            p.x += p.vx * p.layer.depth;
            p.y += (p.vy + 0.2) * (dt / 16) * 0.8;
            p.rot += p.rotSpeed * (dt / 16) + 0.01;
            break;
          }
          case 'wander': {
            const turn = Math.sin(tSec * 0.8 + p.x * 0.01) * 0.02;
            p.vx += windRef.current * 0.001 + turn;
            p.vy += Math.cos(tSec * 1.1 + p.y * 0.01) * 0.01;
            p.x += p.vx * 0.8;
            p.y += p.vy * 0.8;
            p.rot += p.rotSpeed * 0.5;
            break;
          }
          case 'rise': {
            p.vx += windRef.current * 0.001 + Math.sin(tSec + p.x * 0.01) * 0.002;
            p.x += p.vx * p.layer.depth;
            p.y -= Math.abs(p.vy) * 0.5;
            p.rot += p.rotSpeed * 0.3;
            break;
          }
          default: {
            // 'fall'
            p.vx += windRef.current * 0.002 + sway * 0.002;
            p.x += p.vx * p.layer.depth;
            p.y += p.vy * (dt / 16) * 0.6;
            p.rot += p.rotSpeed * (dt / 16);
          }
        }

        // Wrap around edges
        if (p.y - p.size > h) {
          p.y = -p.size;
          p.x = Math.random() * w;
          p.vx = (Math.random() - 0.5) * 0.2;
        }
        if (p.y + p.size < 0 && p.mode === 'rise') {
          p.y = h + p.size;
          p.x = Math.random() * w;
        }
        if (p.x < -p.size) p.x = w + p.size;
        if (p.x > w + p.size) p.x = -p.size;

        // Draw with layer opacity and transition fade-in
        ctx.globalAlpha = transitionAlphaRef.current * p.layer.opacity;
        drawParticle(ctx, p, timestamp);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [makeParticle, drawParticle, applyCssProperties]
  );

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  useEffect(() => {
    resizeCanvas();
    applyCssProperties();

    // Start animation
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animate);

    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      if (!document.hidden) {
        lastTimeRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Update CSS properties periodically
    const cssInterval = setInterval(applyCssProperties, 60000);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(cssInterval);
      if (windIntervalRef.current) clearInterval(windIntervalRef.current);
    };
  }, [animate, resizeCanvas, applyCssProperties]);

  return (
    <>
      {/* Background gradient div */}
      <div
        ref={bgDivRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </>
  );
}
