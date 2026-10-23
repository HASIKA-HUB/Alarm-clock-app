/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Achievement,
  FocusSession,
  MissionResult,
  StarReward,
} from '../types/alarm';

export interface CosmicRank {
  title: string;
  minStars: number;
  maxStars: number;
  color: string;
  badge: string;
  nextRankTitle?: string;
}

export const COSMIC_RANKS: CosmicRank[] = [
  {
    title: 'Cosmic Beginner',
    minStars: 0,
    maxStars: 4,
    color: '#38BDF8', // Sky blue
    badge: '🚀',
    nextRankTitle: 'Rising Star',
  },
  {
    title: 'Rising Star',
    minStars: 5,
    maxStars: 14,
    color: '#A855F7', // Neon violet
    badge: '⭐',
    nextRankTitle: 'Galaxy Achiever',
  },
  {
    title: 'Galaxy Achiever',
    minStars: 15,
    maxStars: 29,
    color: '#EC4899', // Pink
    badge: '🪐',
    nextRankTitle: 'Cosmic Champion',
  },
  {
    title: 'Cosmic Champion',
    minStars: 30,
    maxStars: 49,
    color: '#F59E0B', // Amber
    badge: '👑',
    nextRankTitle: 'Cosmic Legend',
  },
  {
    title: 'Cosmic Legend',
    minStars: 50,
    maxStars: 9999,
    color: '#F43F5E', // Rose
    badge: '🌌',
  },
];

export function getCosmicRank(starCount: number): {
  currentRank: CosmicRank;
  progressPercent: number;
  starsToNext: number;
} {
  const rank = COSMIC_RANKS.find(
    (r) => starCount >= r.minStars && starCount <= r.maxStars
  ) || COSMIC_RANKS[COSMIC_RANKS.length - 1];

  if (!rank.nextRankTitle) {
    return {
      currentRank: rank,
      progressPercent: 100,
      starsToNext: 0,
    };
  }

  const range = rank.maxStars - rank.minStars + 1;
  const currentInTier = starCount - rank.minStars;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
  const starsToNext = rank.maxStars + 1 - starCount;

  return {
    currentRank: rank,
    progressPercent,
    starsToNext,
  };
}

/**
 * Calculates and evaluates real achievements from stored history.
 * Strictly checks real database facts, no fake metrics.
 */
export function calculateAchievements(
  sessions: FocusSession[],
  stars: StarReward[],
  missions: MissionResult[]
): Achievement[] {
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalStars = stars.length;

  // 1. First Focus: Complete 1 focus session
  const firstFocusUnlocked = completedSessions.length >= 1;

  // 2. Three in a Row: Complete 3 focus sessions consecutively without any cancellation
  let maxConsecutive = 0;
  let currConsecutive = 0;
  // sort chronologically
  const sortedSessions = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
  for (const s of sortedSessions) {
    if (s.status === 'completed') {
      currConsecutive++;
      if (currConsecutive > maxConsecutive) maxConsecutive = currConsecutive;
    } else if (s.status === 'cancelled') {
      currConsecutive = 0;
    }
  }
  const threeInARowUnlocked = maxConsecutive >= 3;

  // 3. Star Collector: Earn 10 stars
  const starCollectorUnlocked = totalStars >= 10;

  // 4. Focus Explorer: Complete sessions in 3 different task categories
  const categoriesUsed = new Set(completedSessions.map((s) => s.category));
  const focusExplorerUnlocked = categoriesUsed.size >= 3;

  // 5. Deep Diver: Complete a session of 45 minutes or longer
  const deepDiverUnlocked = completedSessions.some(
    (s) => s.plannedDurationMinutes >= 45 || s.actualDurationSeconds >= 45 * 60
  );

  // 6. Early Bird: Complete a session before 9:00 AM local time
  const earlyBirdUnlocked = completedSessions.some((s) => {
    const d = new Date(s.endedAt || s.startedAt);
    return d.getHours() < 9;
  });

  // 7. Night Owl: Complete a session after 9:00 PM local time
  const nightOwlUnlocked = completedSessions.some((s) => {
    const d = new Date(s.endedAt || s.startedAt);
    return d.getHours() >= 21;
  });

  // 8. Mission Master: Successfully complete 5 alarm missions
  const solvedMissions = missions.filter((m) => m.solved);
  const missionMasterUnlocked = solvedMissions.length >= 5;

  return [
    {
      id: 'first_focus',
      title: 'First Cosmic Focus',
      description: 'Successfully complete your first focused work session.',
      icon: '🚀',
      tier: 'bronze',
      progress: Math.min(1, completedSessions.length),
      maxProgress: 1,
      isUnlocked: firstFocusUnlocked,
    },
    {
      id: 'three_in_a_row',
      title: 'Orbital Streak',
      description: 'Complete 3 focus sessions in a row without any cancellation.',
      icon: '⚡',
      tier: 'silver',
      progress: Math.min(3, maxConsecutive),
      maxProgress: 3,
      isUnlocked: threeInARowUnlocked,
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      description: 'Earn 10 cosmic stars across your completed sessions.',
      icon: '⭐',
      tier: 'gold',
      progress: Math.min(10, totalStars),
      maxProgress: 10,
      isUnlocked: starCollectorUnlocked,
    },
    {
      id: 'focus_explorer',
      title: 'Cosmic Explorer',
      description: 'Complete focus sessions in at least 3 distinct categories.',
      icon: '🧭',
      tier: 'silver',
      progress: Math.min(3, categoriesUsed.size),
      maxProgress: 3,
      isUnlocked: focusExplorerUnlocked,
    },
    {
      id: 'deep_diver',
      title: 'Deep Nebula Diver',
      description: 'Complete a planned 45+ minute deep focus session.',
      icon: '🌌',
      tier: 'gold',
      progress: deepDiverUnlocked ? 1 : 0,
      maxProgress: 1,
      isUnlocked: deepDiverUnlocked,
    },
    {
      id: 'early_bird',
      title: 'Solar Dawn',
      description: 'Complete a focus session before 09:00 AM.',
      icon: '🌅',
      tier: 'bronze',
      progress: earlyBirdUnlocked ? 1 : 0,
      maxProgress: 1,
      isUnlocked: earlyBirdUnlocked,
    },
    {
      id: 'night_owl',
      title: 'Astral Night Owl',
      description: 'Complete a focus session after 21:00 PM.',
      icon: '🌙',
      tier: 'bronze',
      progress: nightOwlUnlocked ? 1 : 0,
      maxProgress: 1,
      isUnlocked: nightOwlUnlocked,
    },
    {
      id: 'mission_master',
      title: 'Mission Prodigy',
      description: 'Successfully clear 5 alarm wake-up missions.',
      icon: '🧠',
      tier: 'cosmic',
      progress: Math.min(5, solvedMissions.length),
      maxProgress: 5,
      isUnlocked: missionMasterUnlocked,
    },
  ];
}

/**
 * Idempotently awards 1 star for a focus session.
 * Guarantees zero duplicate stars on double click or page refresh.
 */
export function awardStarForSession(
  session: FocusSession,
  currentStars: StarReward[]
): { updatedStars: StarReward[]; starAwarded: boolean; newReward?: StarReward } {
  // Must be marked completed with a valid task name
  if (session.status !== 'completed' || !session.taskName.trim()) {
    return { updatedStars: currentStars, starAwarded: false };
  }

  // Check if this session ID was already rewarded
  const alreadyRewarded = currentStars.some((s) => s.sessionId === session.id);
  if (alreadyRewarded) {
    return { updatedStars: currentStars, starAwarded: false };
  }

  const newReward: StarReward = {
    id: `star-${session.id}-${Date.now()}`,
    sessionId: session.id,
    taskName: session.taskName,
    category: session.category,
    awardedAt: Date.now(),
    starsCount: 1,
  };

  return {
    updatedStars: [newReward, ...currentStars],
    starAwarded: true,
    newReward,
  };
}
