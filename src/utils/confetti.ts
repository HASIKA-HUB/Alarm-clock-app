/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from 'canvas-confetti';

export function triggerStarCelebration(enableAnimations: boolean = true) {
  if (!enableAnimations) return;

  // Star and cosmic particle burst
  const count = 70;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Neon violet, sky blue, gold, and pink cosmic colors
  const cosmicColors = ['#A855F7', '#38BDF8', '#F472B6', '#FBBF24', '#7C3AED'];

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: cosmicColors,
    shapes: ['star', 'circle'],
  });

  fire(0.2, {
    spread: 60,
    colors: cosmicColors,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.1,
    colors: cosmicColors,
    shapes: ['star'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#FBBF24', '#F472B6'],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: cosmicColors,
  });
}
