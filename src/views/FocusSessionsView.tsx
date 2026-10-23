/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FocusSession } from '../types/alarm';
import { FocusTimer } from '../components/FocusTimer';
import {
  Target,
  PlayCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Calendar,
} from 'lucide-react';

interface FocusSessionsViewProps {
  sessions: FocusSession[];
  activeSession: FocusSession | null;
  onStartNewSession: () => void;
  onCompleteActiveSession: (session: FocusSession, actualDurationSeconds: number) => void;
  onCancelActiveSession: (session: FocusSession, actualDurationSeconds: number) => void;
}

export const FocusSessionsView: React.FC<FocusSessionsViewProps> = ({
  sessions,
  activeSession,
  onStartNewSession,
  onCompleteActiveSession,
  onCancelActiveSession,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'completed') return s.status === 'completed';
    if (filter === 'cancelled') return s.status === 'cancelled';
    return true;
  });

  const totalFocusSeconds = sessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, curr) => acc + curr.actualDurationSeconds, 0);

  const totalCompleted = sessions.filter((s) => s.status === 'completed').length;
  const totalCancelled = sessions.filter((s) => s.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-sky-400" />
            <span>Focus Sessions & Study Tasks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete focus missions to earn cosmic stars (+1⭐ per session)
          </p>
        </div>

        {!activeSession && (
          <button
            onClick={onStartNewSession}
            className="py-2.5 px-5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-lg shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Focus Session</span>
          </button>
        )}
      </div>

      {/* Active Focus Session Runner */}
      {activeSession ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-orbitron uppercase tracking-wider text-sky-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Active Hyperspace Mission in Progress</span>
          </div>
          <FocusTimer
            session={activeSession}
            onComplete={onCompleteActiveSession}
            onCancel={onCancelActiveSession}
          />
        </div>
      ) : null}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
              Completed Tasks
            </span>
            <div className="font-orbitron font-bold text-2xl text-white mt-0.5">
              {totalCompleted}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
              Total Deep Work
            </span>
            <div className="font-orbitron font-bold text-2xl text-white mt-0.5">
              {Math.floor(totalFocusSeconds / 3600)}h {Math.floor((totalFocusSeconds % 3600) / 60)}m
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
              Stars Awarded
            </span>
            <div className="font-orbitron font-bold text-2xl text-yellow-400 flex items-center gap-1.5 mt-0.5">
              <span>{totalCompleted}</span>
              <Sparkles className="w-5 h-5 fill-yellow-400" />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* History List Section */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-purple-500/20">
          <h3 className="font-orbitron font-bold text-lg text-white">
            Focus Session History
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            {(['all', 'completed', 'cancelled'] as typeof filter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-1 px-3 rounded-lg text-xs font-medium capitalize transition cursor-pointer border ${
                  filter === tab
                    ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{s.taskName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-900/50">
                      {s.category}
                    </span>
                    {s.status === 'completed' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                        CANCELLED
                      </span>
                    )}
                  </div>

                  {s.description && (
                    <p className="text-xs text-slate-400">{s.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Focus: {Math.round(s.actualDurationSeconds / 60)}m (Planned {s.plannedDurationMinutes}m)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      {new Date(s.startedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {s.status === 'completed' && s.starAwarded && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-orbitron font-bold">
                      <Sparkles className="w-4 h-4 fill-yellow-400" />
                      <span>+1 Star Earned</span>
                    </div>
                  )}

                  {s.status === 'cancelled' && (
                    <span className="text-xs text-slate-500 font-mono">0 Stars (Cancelled)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="font-orbitron font-bold text-white text-base">No Sessions Recorded</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {filter !== 'all'
                ? 'No sessions match this filter criteria.'
                : 'Connect your alarm to a task or start a quick focus session to build momentum.'}
            </p>
            <button
              onClick={onStartNewSession}
              className="py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-orbitron font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Start Focus Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
