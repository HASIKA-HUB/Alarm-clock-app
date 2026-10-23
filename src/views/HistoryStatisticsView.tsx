/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Alarm,
  FocusSession,
  MissionResult,
  StarReward,
  TaskCategory,
  ActivityLogItem,
} from '../types/alarm';
import {
  BarChart3,
  Clock,
  Target,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  PieChart,
  Calendar,
} from 'lucide-react';

interface HistoryStatisticsViewProps {
  alarms: Alarm[];
  sessions: FocusSession[];
  missions: MissionResult[];
  stars: StarReward[];
  logs: ActivityLogItem[];
}

export const HistoryStatisticsView: React.FC<HistoryStatisticsViewProps> = ({
  alarms,
  sessions,
  missions,
  stars,
  logs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'all'>('7days');

  // Filter sessions by date range
  const now = Date.now();
  const filteredSessions = sessions.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (timeFilter === '7days') return now - s.startedAt <= 7 * 86400000;
    if (timeFilter === '30days') return now - s.startedAt <= 30 * 86400000;
    return true;
  });

  const completedSessions = filteredSessions.filter((s) => s.status === 'completed');
  const cancelledSessions = filteredSessions.filter((s) => s.status === 'cancelled');

  const totalFocusSeconds = completedSessions.reduce(
    (acc, curr) => acc + curr.actualDurationSeconds,
    0
  );
  const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

  // Missions metrics
  const totalMissions = missions.length;
  const solvedMissions = missions.filter((m) => m.solved).length;
  const totalAttempts = missions.reduce((acc, curr) => acc + curr.attempts, 0);

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  completedSessions.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + s.actualDurationSeconds;
  });

  // Last 7 days distribution chart data
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' });
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;

    const dayMinutes = Math.round(
      sessions
        .filter((s) => s.status === 'completed' && s.startedAt >= startOfDay && s.startedAt < endOfDay)
        .reduce((sum, s) => sum + s.actualDurationSeconds, 0) / 60
    );

    return { dayStr, minutes: dayMinutes };
  });

  const maxDayMinutes = Math.max(30, ...daysData.map((d) => d.minutes));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>History & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real performance telemetry derived strictly from your stored local database
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
            {(['7days', '30days', 'all'] as typeof timeFilter[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`py-1 px-3 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf === '7days' ? 'Last 7 Days' : tf === '30days' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Core KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">
              Total Deep Work
            </span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-orbitron font-bold text-2xl text-white">
            {totalFocusHours} <span className="text-xs text-slate-400 font-normal">hours</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {Math.round(totalFocusSeconds / 60)} active minutes
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">
              Completed Tasks
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-orbitron font-bold text-2xl text-emerald-400">
            {completedSessions.length}
          </div>
          <p className="text-[10px] text-rose-300/80 mt-0.5">
            {cancelledSessions.length} sessions cancelled
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">
              Stars Earned
            </span>
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="font-orbitron font-bold text-2xl text-yellow-300">
            {stars.length} ⭐
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified 1:1 with tasks</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider">
              Missions Cleared
            </span>
            <BrainCircuit className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-orbitron font-bold text-2xl text-purple-300">
            {solvedMissions}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {totalAttempts} total attempts
          </p>
        </div>
      </div>

      {/* Daily Focus Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Focus Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron font-bold text-base text-white">
              Daily Focus Minutes (Last 7 Days)
            </h3>
            <span className="text-xs font-mono text-purple-300">
              Peak: {maxDayMinutes} mins
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800">
            {daysData.map((d, idx) => {
              const heightPercent = Math.max(6, Math.round((d.minutes / maxDayMinutes) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-purple-300 opacity-0 group-hover:opacity-100 transition">
                    {d.minutes}m
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-900 rounded-t-xl h-40 flex items-end p-1 border border-slate-800">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 via-indigo-600 to-sky-400 rounded-t-lg transition-all duration-500 group-hover:from-purple-500 group-hover:to-sky-300 shadow-md"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-orbitron text-slate-400 font-semibold">
                    {d.dayStr}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Completed focus sessions automatically register onto your daily telemetry
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-sky-400" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Focus time by discipline</p>
          </div>

          {Object.keys(categoryCounts).length > 0 ? (
            <div className="space-y-3 my-auto">
              {Object.entries(categoryCounts).map(([cat, secs]) => {
                const mins = Math.round(secs / 60);
                const pct = totalFocusSeconds > 0 ? Math.round((secs / totalFocusSeconds) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{cat}</span>
                      <span className="font-mono text-slate-400">
                        {mins}m ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-sky-400 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No categories recorded yet. Complete your first task to see the breakdown.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Alarms in Database:</span>
            <strong className="text-white font-orbitron">{alarms.length}</strong>
          </div>
        </div>
      </div>

      {/* Comprehensive Activity Log */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white">
          System Activity Chronology
        </h3>

        {logs.length > 0 ? (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {logs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white mr-1.5">{item.title}</span>
                    <span className="text-slate-400">{item.detail}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-4">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-6 text-center">
            No system logs recorded yet.
          </p>
        )}
      </div>
    </div>
  );
};
