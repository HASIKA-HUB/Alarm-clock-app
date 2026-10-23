/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MissionConfig,
  MissionDifficulty,
  MissionResult,
  MissionType,
  UserSettings,
} from '../types/alarm';
import { MissionSolver } from '../components/missions/MissionSolver';
import {
  BrainCircuit,
  Calculator,
  Eye,
  Binary,
  CheckCircle2,
  Award,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface MissionSettingsViewProps {
  missions: MissionResult[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onRecordPracticeMission: (result: MissionResult) => void;
}

export const MissionSettingsView: React.FC<MissionSettingsViewProps> = ({
  missions,
  settings,
  onUpdateSettings,
  onRecordPracticeMission,
}) => {
  // Practice Arena state
  const [practiceType, setPracticeType] = useState<MissionType>('math');
  const [practiceDifficulty, setPracticeDifficulty] = useState<MissionDifficulty>('easy');
  const [practiceKey, setPracticeKey] = useState<number>(1);
  const [lastPracticeSuccess, setLastPracticeSuccess] = useState<{
    attempts: number;
    time: number;
  } | null>(null);

  const handlePracticeSuccess = (attempts: number, timeSpentSeconds: number) => {
    setLastPracticeSuccess({ attempts, time: timeSpentSeconds });
    const result: MissionResult = {
      id: `practice-${Date.now()}`,
      alarmLabel: 'Practice Arena',
      missionType: practiceType,
      difficulty: practiceDifficulty,
      attempts,
      solved: true,
      completedAt: Date.now(),
      timeSpentSeconds,
    };
    onRecordPracticeMission(result);
  };

  const handleNextChallenge = () => {
    setLastPracticeSuccess(null);
    setPracticeKey((prev) => prev + 1);
  };

  // Metrics
  const totalSolved = missions.filter((m) => m.solved).length;
  const totalAttempts = missions.reduce((acc, curr) => acc + curr.attempts, 0);
  const avgAttempts = totalSolved > 0 ? (totalAttempts / totalSolved).toFixed(1) : '1.0';
  const avgTime =
    totalSolved > 0
      ? (missions.reduce((acc, curr) => acc + curr.timeSpentSeconds, 0) / totalSolved).toFixed(0)
      : '0';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          <span>Mission Challenge Arena & Configuration</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Solve brain-engaging missions before an alarm can be dismissed, ensuring full alertness
        </p>
      </div>

      {/* Default Mission Defaults Configuration Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>Default Mission Preferences for New Alarms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">
              Default Mission Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'math', label: 'Math', icon: Calculator },
                { id: 'memory', label: 'Memory', icon: Eye },
                { id: 'sequence', label: 'Sequence', icon: Binary },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = settings.defaultMissionType === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        defaultMissionType: m.id as MissionType,
                      })
                    }
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm shadow-purple-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-orbitron text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">
              Default Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map((d) => {
                const isSelected = settings.defaultMissionDifficulty === d;
                return (
                  <button
                    key={d}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        defaultMissionDifficulty: d,
                      })
                    }
                    className={`py-3 rounded-xl border font-orbitron text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm shadow-purple-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
            Missions Cleared
          </span>
          <div className="font-orbitron font-bold text-2xl text-white mt-1">{totalSolved}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
            Total Attempts
          </span>
          <div className="font-orbitron font-bold text-2xl text-purple-300 mt-1">{totalAttempts}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
            Avg Attempts / Solved
          </span>
          <div className="font-orbitron font-bold text-2xl text-sky-300 mt-1">{avgAttempts}</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
            Avg Solve Speed
          </span>
          <div className="font-orbitron font-bold text-2xl text-pink-300 mt-1">{avgTime}s</div>
        </div>
      </div>

      {/* Interactive Practice Arena */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Interactive Mission Arena (Try Now)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Demonstrate the challenge gameplay anytime without waiting for an alarm to ring!
            </p>
          </div>

          {/* Type & Difficulty Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
              {(['math', 'memory', 'sequence'] as MissionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setPracticeType(t);
                    setLastPracticeSuccess(null);
                    setPracticeKey((k) => k + 1);
                  }}
                  className={`py-1 px-2.5 rounded-lg text-xs font-orbitron font-bold capitalize transition ${
                    practiceType === t
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
              {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setPracticeDifficulty(d);
                    setLastPracticeSuccess(null);
                    setPracticeKey((k) => k + 1);
                  }}
                  className={`py-1 px-2.5 rounded-lg text-xs font-orbitron font-bold capitalize transition ${
                    practiceDifficulty === d
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Practice Box */}
        <div className="py-2">
          {lastPracticeSuccess ? (
            <div className="max-w-md mx-auto p-6 rounded-2xl glass-panel-glow text-center space-y-4 border-emerald-500/40 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-orbitron font-bold text-xl text-white">Challenge Cleared!</h4>
              <p className="text-xs text-emerald-300">
                Solved in {lastPracticeSuccess.time}s with {lastPracticeSuccess.attempts} attempt
                {lastPracticeSuccess.attempts > 1 ? 's' : ''}.
              </p>

              <button
                onClick={handleNextChallenge}
                className="py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-md transition cursor-pointer"
              >
                Next Challenge
              </button>
            </div>
          ) : (
            <MissionSolver
              key={`${practiceType}-${practiceDifficulty}-${practiceKey}`}
              missionConfig={{
                enabled: true,
                type: practiceType,
                difficulty: practiceDifficulty,
              }}
              onSuccess={handlePracticeSuccess}
              isPractice={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
