import React, { useEffect, useRef } from 'react';
import { useAlarmClock } from '../context/AlarmClockContext';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  phase: number;
}

export const CosmicBackground: React.FC = () => {
  const { settings } = useAlarmClock();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 110 subtle twinkling stars
    const stars: Star[] = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space base
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, width, height);

      // Draw faint galactic nebula glows
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.2, height * 0.2, 600);
      grad1.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
      grad1.addColorStop(0.6, 'rgba(124, 58, 237, 0.03)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.85, height * 0.75, 40, width * 0.85, height * 0.75, 550);
      grad2.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
      grad2.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      const grad3 = ctx.createRadialGradient(width * 0.5, height * 0.9, 30, width * 0.5, height * 0.9, 450);
      grad3.addColorStop(0, 'rgba(244, 114, 182, 0.06)');
      grad3.addColorStop(1, 'transparent');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // Render stars
      stars.forEach(star => {
        const twinkle = settings.reducedMotion ? star.opacity : 0.3 + 0.7 * Math.sin(step * star.speed + star.phase);
        ctx.fillStyle = `rgba(226, 232, 240, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!settings.reducedMotion) {
        step += 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
};
