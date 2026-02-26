'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ProgressRingProps {
  completed: number;
  total: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

export default function ProgressRing({ completed, total }: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevCompletedRef = useRef(completed);
  const animationRef = useRef<number>(0);

  const rate = total > 0 ? completed / total : 0;
  const isAllDone = total > 0 && completed === total;

  // SVG dimensions
  const size = 120;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Animate progress
  useEffect(() => {
    const targetProgress = rate;
    const startProgress = animatedProgress;
    const startTime = performance.now();
    const duration = 500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - (1 - t) * (1 - t) * (1 - t);
      const current = startProgress + (targetProgress - startProgress) * eased;
      setAnimatedProgress(current);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  // Confetti on 100% completion
  const spawnConfetti = useCallback(() => {
    const colors = ['#F2724B', '#E74C3C', '#F39C12', '#3498DB', '#2ECC71', '#9B59B6'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 16; i++) {
      newParticles.push({
        id: i,
        x: center,
        y: center,
        angle: (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5,
        speed: 1.5 + Math.random() * 2,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
      });
    }
    setParticles(newParticles);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
      setParticles([]);
    }, 800);
  }, [center]);

  useEffect(() => {
    if (isAllDone && prevCompletedRef.current < total) {
      spawnConfetti();
    }
    prevCompletedRef.current = completed;
  }, [isAllDone, completed, total, spawnConfetti]);

  // Animate confetti particles
  useEffect(() => {
    if (!showConfetti || particles.length === 0) return;

    let frameId: number;
    const startTime = performance.now();

    const animateParticles = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 800, 1);

      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: center + Math.cos(p.angle) * p.speed * 30 * progress,
          y: center + Math.sin(p.angle) * p.speed * 30 * progress - 10 * progress + 20 * progress * progress,
          opacity: 1 - progress,
        }))
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animateParticles);
      }
    };

    frameId = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(frameId);
  }, [showConfetti, particles.length, center]);

  const strokeDashoffset = circumference * (1 - animatedProgress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E8E8ED"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F2724B"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-none"
            style={{
              filter: isAllDone ? 'drop-shadow(0 0 6px rgba(242, 114, 75, 0.5))' : 'none',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-semibold leading-none text-[#1A1A2E]">
            {completed}
            <span className="text-[14px] font-normal text-[#9999AA]"> / {total}</span>
          </span>
        </div>

        {/* Confetti particles */}
        {showConfetti &&
          particles.map(p => (
            <div
              key={p.id}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                opacity: p.opacity,
                transition: 'none',
              }}
            />
          ))}
      </div>

      {isAllDone && total > 0 && (
        <p className="text-center text-[14px] font-medium text-[#F2724B] animate-[fadeIn_0.3s_ease-in]">
          今日のタスク全完了！
        </p>
      )}
    </div>
  );
}
