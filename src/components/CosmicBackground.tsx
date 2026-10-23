/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  enableAnimations: boolean;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ enableAnimations }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate stars
    const starCount = Math.min(100, Math.floor((width * height) / 12000));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speedY: (Math.random() * 0.15 + 0.05),
      alpha: Math.random() * 0.7 + 0.3,
      alphaChange: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      color: ['#ffffff', '#e0e7ff', '#c084fc', '#38bdf8', '#f472b6'][Math.floor(Math.random() * 5)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space base gradients
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#050816');
      bgGrad.addColorStop(0.5, '#070c20');
      bgGrad.addColorStop(1, '#050816');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Soft cosmic nebulae
      const nebula1 = ctx.createRadialGradient(width * 0.2, height * 0.15, 10, width * 0.2, height * 0.15, width * 0.45);
      nebula1.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
      nebula1.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.85, height * 0.75, 10, width * 0.85, height * 0.75, width * 0.4);
      nebula2.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
      nebula2.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      const nebula3 = ctx.createRadialGradient(width * 0.5, height * 0.9, 10, width * 0.5, height * 0.9, width * 0.35);
      nebula3.addColorStop(0, 'rgba(244, 114, 182, 0.06)');
      nebula3.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, width, height);

      // Render drifting twinkling stars
      stars.forEach((star) => {
        if (enableAnimations) {
          star.y -= star.speedY;
          if (star.y < 0) {
            star.y = height;
            star.x = Math.random() * width;
          }

          star.alpha += star.alphaChange;
          if (star.alpha > 0.9 || star.alpha < 0.2) {
            star.alphaChange *= -1;
          }
        }

        ctx.save();
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (enableAnimations) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [enableAnimations]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
