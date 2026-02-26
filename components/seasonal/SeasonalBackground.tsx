'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  getSekkiTransition,
  getInterpolatedSekkiStyle,
} from '@/lib/sekki';
import type { SekkiData } from '@/lib/sekki';
import {
  createParticle,
  updateParticle,
  drawParticle,
  type Particle,
  type ParticleConfig,
  type Wind,
} from './ParticleEngine';
import {
  drawFlare,
  drawHeatHaze,
  drawBreathing,
  drawWaveLines,
  drawFog,
  drawCrystalGrowth,
  type FlareConfig,
  type HeatHazeConfig,
  type BreathingConfig,
  type WaveLinesConfig,
  type FogConfig,
  type CrystalGrowthConfig,
} from './EnvironmentEngine';

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_DPR = 2;
const FPS_SAMPLE_FRAMES = 30;
const LOW_FPS_THRESHOLD = 20;
const PARTICLE_REDUCTION_FACTOR = 0.7;
const MIN_PARTICLES = 10;

// ─── Helper: resolve particle count from animation params ───────────────────

function getTargetParticleCount(sekki: SekkiData): number {
  const params = sekki.animationParams as Record<string, unknown> | undefined;
  if (params && typeof params.particleCount === 'number') {
    return params.particleCount;
  }
  // Sensible defaults per animation type
  const defaults: Record<string, number> = {
    sakura: 50,
    snow: 60,
    rain: 80,
    leaf: 40,
    gold: 30,
    star: 40,
    sparkle: 25,
    crystal: 20,
    generic: 30,
  };
  return defaults[sekki.animationType] ?? 30;
}

function getParticleConfig(sekki: SekkiData): ParticleConfig {
  const params = sekki.animationParams as Record<string, unknown> | undefined;
  return {
    colors: params?.colors as string[] | undefined,
    sizeRange: params?.sizeRange as [number, number] | undefined,
    speedRange: params?.speedRange as [number, number] | undefined,
  };
}

function getEnvironmentEffects(sekki: SekkiData): Array<{ type: string; config: unknown }> {
  const params = sekki.animationParams as Record<string, unknown> | undefined;
  if (params && Array.isArray(params.environmentEffects)) {
    return params.environmentEffects as Array<{ type: string; config: unknown }>;
  }
  return [];
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SeasonalBackground() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgDivRef = useRef<HTMLDivElement>(null);

  // Mutable refs for animation state (avoid re-renders)
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const fpsFramesRef = useRef<number>(0);
  const fpsAccumRef = useRef<number>(0);
  const currentFpsRef = useRef<number>(60);
  const targetCountRef = useRef<number>(30);
  const reducedCountRef = useRef<number | null>(null);
  const prevSekkiNameRef = useRef<string>('');

  // ─── Wind simulation ───────────────────────────────────────────────────

  const computeWind = useCallback((time: number): Wind => {
    // Base direction: left to right
    // Speed: sin wave (period 8s) + random noise
    const period = 8000;
    const baseSpeed = 0.5 * Math.sin((time / period) * Math.PI * 2);
    const noise = (Math.random() - 0.5) * 0.4; // +/-0.2 effective
    return {
      x: baseSpeed + noise,
      y: 0,
    };
  }, []);

  // ─── Resize handler ────────────────────────────────────────────────────

  const resizeCanvases = useCallback(() => {
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const canvas of [bgCanvas, fgCanvas]) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  // ─── CSS custom properties ─────────────────────────────────────────────

  const applyCssProperties = useCallback(() => {
    const style = getInterpolatedSekkiStyle(new Date());
    const root = document.documentElement;
    root.style.setProperty('--sekki-border-color', style.cardBorderColor);
    root.style.setProperty('--sekki-shadow-color', style.cardShadowColor);
    root.style.setProperty('--sekki-bg', style.bgGradient);

    // Also apply gradient to the background div
    if (bgDivRef.current) {
      bgDivRef.current.style.background = style.bgGradient;
    }
  }, []);

  // ─── Particle management ──────────────────────────────────────────────

  const ensureParticles = useCallback(
    (animationType: string, config: ParticleConfig, canvasW: number, canvasH: number) => {
      const effectiveCount = reducedCountRef.current ?? targetCountRef.current;
      const particles = particlesRef.current;

      // Add particles if under count
      while (particles.length < effectiveCount) {
        particles.push(createParticle(animationType, canvasW, canvasH, config));
      }
      // Remove excess
      if (particles.length > effectiveCount) {
        particles.length = effectiveCount;
      }
    },
    []
  );

  // ─── FPS monitoring & auto-reduction ──────────────────────────────────

  const updateFps = useCallback((dt: number) => {
    fpsAccumRef.current += dt;
    fpsFramesRef.current += 1;

    if (fpsFramesRef.current >= FPS_SAMPLE_FRAMES) {
      const avgDt = fpsAccumRef.current / fpsFramesRef.current;
      currentFpsRef.current = 1000 / avgDt;
      fpsAccumRef.current = 0;
      fpsFramesRef.current = 0;

      // Auto-reduce particles if FPS is low
      if (currentFpsRef.current < LOW_FPS_THRESHOLD) {
        const current = reducedCountRef.current ?? targetCountRef.current;
        const newCount = Math.max(MIN_PARTICLES, Math.floor(current * PARTICLE_REDUCTION_FACTOR));
        if (newCount < current) {
          reducedCountRef.current = newCount;
        }
      }
    }
  }, []);

  // ─── Main animation loop ──────────────────────────────────────────────

  const animate = useCallback(
    (timestamp: number) => {
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const bgCanvas = bgCanvasRef.current;
      const fgCanvas = fgCanvasRef.current;
      if (!bgCanvas || !fgCanvas) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const bgCtx = bgCanvas.getContext('2d');
      const fgCtx = fgCanvas.getContext('2d');
      if (!bgCtx || !fgCtx) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Delta time (capped at 50ms to prevent big jumps)
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const rawDt = timestamp - lastTimeRef.current;
      const dt = Math.min(rawDt, 50);
      lastTimeRef.current = timestamp;
      elapsedRef.current += dt;

      updateFps(rawDt);

      const w = window.innerWidth;
      const h = window.innerHeight;
      const now = new Date();

      // Get current sekki data
      const transition = getSekkiTransition(now);
      const sekki = transition.current;

      // If sekki changed, reset particles
      if (sekki.name !== prevSekkiNameRef.current) {
        prevSekkiNameRef.current = sekki.name;
        particlesRef.current = [];
        reducedCountRef.current = null;
        targetCountRef.current = getTargetParticleCount(sekki);
        applyCssProperties();
      }

      const config = getParticleConfig(sekki);
      const animType = sekki.animationType;

      // Ensure particle pool
      ensureParticles(animType, config, w, h);

      // Wind
      const wind = computeWind(elapsedRef.current);

      // Update particles & cull dead ones
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const alive = updateParticle(particles[i], wind, dt / 16, w, h);
        if (!alive) {
          // Replace dead particle with a new one
          particles[i] = createParticle(animType, w, h, config);
        }
      }

      // ── Clear canvases ──
      bgCtx.clearRect(0, 0, w, h);
      fgCtx.clearRect(0, 0, w, h);

      // ── Draw environment effects on background canvas ──
      const effects = getEnvironmentEffects(sekki);
      for (const effect of effects) {
        const time = elapsedRef.current;
        switch (effect.type) {
          case 'flare':
            drawFlare(bgCtx, w, h, time, effect.config as FlareConfig);
            break;
          case 'heatHaze':
            drawHeatHaze(bgCtx, w, h, time, effect.config as HeatHazeConfig);
            break;
          case 'breathing':
            drawBreathing(bgCtx, w, h, time, effect.config as BreathingConfig);
            break;
          case 'waveLines':
            drawWaveLines(bgCtx, w, h, time, effect.config as WaveLinesConfig);
            break;
          case 'fog':
            drawFog(bgCtx, w, h, time, effect.config as FogConfig);
            break;
          case 'crystalGrowth':
            drawCrystalGrowth(bgCtx, w, h, time, effect.config as CrystalGrowthConfig);
            break;
        }
      }

      // ── Draw particles ──
      // Background particles (depth <= 0.7)
      // Foreground particles (depth > 0.7) go on fgCanvas with slight blur
      for (const p of particles) {
        if (p.depth > 0.7) {
          fgCtx.save();
          fgCtx.filter = 'blur(1px)';
          drawParticle(fgCtx, p);
          fgCtx.restore();
        } else {
          drawParticle(bgCtx, p);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [computeWind, ensureParticles, applyCssProperties, updateFps]
  );

  // ─── Lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    resizeCanvases();
    applyCssProperties();

    // Start animation
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animate);

    // Resize listener
    const onResize = () => resizeCanvases();
    window.addEventListener('resize', onResize);

    // Visibility listener: pause/resume
    const onVisibility = () => {
      if (!document.hidden) {
        // Reset timing to prevent big jump
        lastTimeRef.current = 0;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Update CSS properties periodically (sekki transitions are slow)
    const cssInterval = setInterval(applyCssProperties, 60000);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(cssInterval);
    };
  }, [animate, resizeCanvases, applyCssProperties]);

  return (
    <>
      {/* Background gradient div - behind everything */}
      <div
        ref={bgDivRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* Background canvas - particles and environment effects */}
      <canvas
        ref={bgCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Foreground canvas - depth-of-field front particles */}
      <canvas
        ref={fgCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </>
  );
}
