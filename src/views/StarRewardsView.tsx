/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FocusSession,
  MissionResult,
  StarReward,
} from '../types/alarm';
import {
  calculateAchievements,
  COSMIC_RANKS,
  getCosmicRank,
} from '../utils/gamification';
import { triggerStarCelebration } from '../utils/confetti';
import { cosmicAudio } from '../utils/audio';
import {
  Sparkles,
  Award,
  Crown,
  Lock,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';

interface StarRewardsViewProps {
  stars: StarReward[];
  sessions: FocusSession[];
  missions: MissionResult[];
  enableAnimations: boolean;
}

export const StarRewardsView: React.FC<StarRewardsViewProps> = ({
  stars,
  sessions,
  missions,
  enableAnimations,
}) => {
  const rank = getCosmicRank(stars.length);
  const achievements = calculateAchievements(sessions, stars, missions);
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const handleTestCelebration = () => {
    cosmicAudio.playCelebrationSound();
    triggerStarCelebration(enableAnimations);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span>Cosmic Star Rewards & Rank</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every completed focus session earns exactly 1 Cosmic Star toward your galaxy rank
          </p>
        </div>

        <button
          onClick={handleTestCelebration}
          className="py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 flex items-center gap-2 cursor-pointer transition shadow-sm"
          title="Preview the celebration effect and cosmic fanfare"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Test Celebration</span>
        </button>
      </div>

      {/* Hero Rank Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-glow p-6 md:p-8 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-sky-400 p-1 shadow-xl shadow-purple-600/30">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-4xl md:text-5xl">
                {rank.currentRank.badge}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-purple-300 font-mono font-semibold">
                Current Cosmic Standing
              </span>
              <h3 className="text-2xl md:text-3xl font-orbitron font-black text-white">
                {rank.currentRank.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Completed Tasks: <strong className="text-white">{completedSessions.length}</strong></span>
                <span>•</span>
                <span>Total Stars: <strong className="text-yellow-400">{stars.length} ⭐</strong></span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Progression</span>
              <span className="text-purple-300 font-bold">{rank.progressPercent}%</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-purple-500/30">
              <div
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${rank.progressPercent}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>{stars.length} ⭐ current</span>
              {rank.currentRank.nextRankTitle ? (
                <span className="text-yellow-300 font-semibold">
                  {rank.starsToNext} ⭐ to {rank.currentRank.nextRankTitle}
                </span>
              ) : (
                <span className="text-yellow-300 font-semibold">Maximum Rank Reached</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranks Ladder Breakdown */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span>Cosmic Rank Thresholds</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COSMIC_RANKS.map((r) => {
            const isCurrent = rank.currentRank.title === r.title;
            const isUnlocked = stars.length >= r.minStars;
            return (
              <div
                key={r.title}
                className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                  isCurrent
                    ? 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-500/30'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-700/80'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{r.badge}</span>
                  {isCurrent && (
                    <span className="text-[9px] font-orbitron font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      Current
                    </span>
                  )}
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                </div>

                <h4 className="font-orbitron font-bold text-xs text-white truncate">{r.title}</h4>
                <p className="text-[11px] font-mono text-purple-300/80 mt-1">
                  {r.maxStars < 9000 ? `${r.minStars}–${r.maxStars} Stars` : `${r.minStars}+ Stars`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Achievement Badges</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly against real completed sessions, categories, and missions
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 border border-purple-700/50">
            Unlocked: {achievements.filter((a) => a.isUnlocked).length} / {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                ach.isUnlocked
                  ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/60 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ach.icon}</span>
                  {ach.isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {ach.progress}/{ach.maxProgress}
                    </span>
                  )}
                </div>

                <h4 className="font-orbitron font-bold text-xs text-white">{ach.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{ach.description}</p>
              </div>

              {/* Mini progress bar if locked */}
              {!ach.isUnlocked && (
                <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Star Rewards History Ledger */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white">
          Star Rewards Transaction Ledger
        </h3>

        {stars.length > 0 ? (
          <div className="space-y-2">
            {stars.map((reward) => (
              <div
                key={reward.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    <Sparkles className="w-4 h-4 fill-yellow-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{reward.taskName}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>Category: {reward.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        {new Date(reward.awardedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="font-orbitron font-bold text-xs text-yellow-300 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  +1 Star
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">
            No star rewards earned yet. Launch a focus task and mark it complete to earn your first star!
          </p>
        )}
      </div>
    </div>
  );
};
