/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Alarm,
  FocusSession,
  StarReward,
  UserSettings,
  ActivityLogItem,
} from '../types/alarm';
import { getCosmicRank } from '../utils/gamification';
import {
  Clock,
  Sparkles,
  Target,
  PlusCircle,
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Volume2,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  alarms: Alarm[];
  sessions: FocusSession[];
  stars: StarReward[];
  logs: ActivityLogItem[];
  settings: UserSettings;
  onToggleAlarm: (id: string) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onOpenCreateAlarm: () => void;
  onOpenQuickFocus: () => void;
  onNavigate: (viewId: string) => void;
  onTestAlarm: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  alarms,
  sessions,
  stars,
  logs,
  settings,
  onToggleAlarm,
  onEditAlarm,
  onOpenCreateAlarm,
  onOpenQuickFocus,
  onNavigate,
  onTestAlarm,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Next Upcoming Alarm
  const activeAlarms = alarms.filter((a) => a.isEnabled);
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentDay = currentTime.getDay();

  let nextAlarm: { alarm: Alarm; diffMinutes: number; timeString: string } | null = null;

  if (activeAlarms.length > 0) {
    const candidateList = activeAlarms.map((alarm) => {
      const [hStr, mStr] = alarm.time.split(':');
      const targetMins = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
      let diff = targetMins - nowMinutes;

      // Check repeat day
      const isRepeating = alarm.repeatDays.length > 0;
      if (!isRepeating) {
        if (diff <= 0) {
          // Scheduled for tomorrow same time
          diff += 24 * 60;
        }
      } else {
        // Find days until next repeat occurrence
        let dayOffset = 0;
        if (alarm.repeatDays.includes(currentDay) && diff > 0) {
          dayOffset = 0;
        } else {
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (alarm.repeatDays.includes(checkDay)) {
              dayOffset = i;
              break;
            }
          }
        }
        diff += dayOffset * 24 * 60;
      }

      return { alarm, diffMinutes: diff, timeString: alarm.time };
    });

    candidateList.sort((a, b) => a.diffMinutes - b.diffMinutes);
    if (candidateList.length > 0) {
      nextAlarm = candidateList[0];
    }
  }

  // Today's completed focus sessions
  const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()).getTime();
  const todaySessions = sessions.filter(
    (s) => s.status === 'completed' && s.startedAt >= startOfToday
  );

  // Today's scheduled alarms
  const todayAlarms = alarms.filter(
    (a) => a.isEnabled && (a.repeatDays.length === 0 || a.repeatDays.includes(currentDay))
  );

  const rank = getCosmicRank(stars.length);

  // Format countdown string
  const formatCountdown = (mins: number) => {
    if (mins <= 0) return 'Ringing soon...';
    const d = Math.floor(mins / (24 * 60));
    const h = Math.floor((mins % (24 * 60)) / 60);
    const m = mins % 60;
    if (d > 0) return `in ${d}d ${h}h ${m}m`;
    if (h > 0) return `in ${h}h ${m}m`;
    return `in ${m} min${m !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Cosmic Clock & Next Alarm Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-glow p-6 md:p-8 border border-purple-500/30">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Prominent Animated Cosmic Clock */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-orbitron uppercase tracking-widest text-purple-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cosmic Chronometer Active</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-orbitron font-black text-5xl sm:text-6xl md:text-7xl text-white tracking-wider">
                {String(
                  settings.timeFormat24h
                    ? currentTime.getHours()
                    : currentTime.getHours() % 12 || 12
                ).padStart(2, '0')}
                :{String(currentTime.getMinutes()).padStart(2, '0')}
              </span>
              <span className="font-orbitron font-bold text-2xl sm:text-3xl text-sky-400">
                :{String(currentTime.getSeconds()).padStart(2, '0')}
              </span>
              {!settings.timeFormat24h && (
                <span className="font-orbitron text-lg text-purple-300 font-semibold ml-1">
                  {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 font-medium">
              {currentTime.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Next Alarm Card or Setup Shortcut */}
          <div className="w-full lg:w-96 p-5 rounded-2xl bg-slate-950/70 border border-purple-500/30 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-orbitron font-semibold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Next Upcoming Alarm
              </span>
              {nextAlarm && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  {formatCountdown(nextAlarm.diffMinutes)}
                </span>
              )}
            </div>

            {nextAlarm ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="font-orbitron font-black text-3xl text-white">
                    {nextAlarm.alarm.time}
                  </div>
                  <span className="text-xs text-sky-300 font-medium truncate max-w-[140px]">
                    {nextAlarm.alarm.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {nextAlarm.alarm.missionConfig?.enabled && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1">
                      <BrainCircuit className="w-3 h-3" />
                      {nextAlarm.alarm.missionConfig.type} mission
                    </span>
                  )}
                  {nextAlarm.alarm.linkedTask && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      {nextAlarm.alarm.linkedTask.durationMinutes}m focus
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-400 text-xs">
                <p>No active alarms scheduled right now.</p>
                <button
                  onClick={onOpenCreateAlarm}
                  className="mt-2 text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
                >
                  Create your first alarm
                </button>
              </div>
            )}

            {/* Quick Actions Bar */}
            <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={onOpenCreateAlarm}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/30"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Alarm</span>
              </button>

              <button
                onClick={onOpenQuickFocus}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
              >
                <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Start Focus</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Honest Browser Wake-up Limitations Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-purple-500/20 text-xs text-slate-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-purple-200">
            Important College Demo & Browser Notice:
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Web browsers require this website tab to remain open and your computer active for scheduled alarms to sound on time. Use the{' '}
            <strong className="text-purple-300 cursor-pointer underline" onClick={onTestAlarm}>
              Demo Ring
            </strong>{' '}
            button in the header or in any alarm card to instantly demonstrate the mission challenge, audio synthesis, and focus session handoff to faculty!
          </p>
        </div>
      </div>

      {/* Gamification Rank & Star Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Stars Card */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
              Total Stars Earned
            </span>
            <div className="font-orbitron font-black text-3xl text-white flex items-center gap-2">
              <span>{stars.length}</span>
              <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-[11px] text-slate-400">1 star per completed focus task</p>
          </div>

          <div
            onClick={() => onNavigate('rewards')}
            className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner cursor-pointer hover:border-purple-400 transition"
          >
            {rank.currentRank.badge}
          </div>
        </div>

        {/* Level & XP Progress Card */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold font-orbitron">
                Cosmic Rank
              </span>
              <h3 className="font-orbitron font-bold text-lg text-white">
                {rank.currentRank.title}
              </h3>
            </div>
            {rank.currentRank.nextRankTitle && (
              <span className="text-xs font-mono text-purple-300">
                Next: {rank.currentRank.nextRankTitle} ({rank.starsToNext} ⭐ needed)
              </span>
            )}
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-purple-500/20">
            <div
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${rank.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Current: {stars.length} stars</span>
            <span>{rank.progressPercent}% to next rank</span>
          </div>
        </div>
      </div>

      {/* Today's Alarms & Today's Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Scheduled Alarms */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="font-orbitron font-bold text-base text-white">
                Today's Scheduled Alarms
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alarms')}
              className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAlarms.length > 0 ? (
            <div className="space-y-2.5">
              {todayAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-orbitron font-bold text-2xl text-white">
                      {alarm.time}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{alarm.label}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Sound: {alarm.sound}</span>
                        {alarm.missionConfig?.enabled && (
                          <span className="text-purple-300">• {alarm.missionConfig.type} mission</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleAlarm(alarm.id)}
                      className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${
                        alarm.isEnabled ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition transform ${
                          alarm.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No alarms scheduled for today</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Create a scheduled alarm or adjust repeating days.
              </p>
              <button
                onClick={onOpenCreateAlarm}
                className="py-1.5 px-3.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-bold font-orbitron transition cursor-pointer"
              >
                + Add Alarm
              </button>
            </div>
          )}
        </div>

        {/* Today's Completed Focus Sessions */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" />
              <h3 className="font-orbitron font-bold text-base text-white">
                Today's Completed Focus
              </h3>
            </div>
            <button
              onClick={() => onNavigate('focus')}
              className="text-xs text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>Focus Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySessions.length > 0 ? (
            <div className="space-y-2.5">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{session.taskName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {session.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Duration: {Math.round(session.actualDurationSeconds / 60)}m</span>
                      <span>•</span>
                      <span>Target: {session.plannedDurationMinutes}m</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold font-orbitron">
                    <Sparkles className="w-3.5 h-3.5 fill-yellow-400" />
                    <span>+1⭐</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80">
              <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No focus sessions completed yet today</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Complete a 25m or custom focus task to earn your star!
              </p>
              <button
                onClick={onOpenQuickFocus}
                className="py-1.5 px-3.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-500/40 text-xs font-bold font-orbitron transition cursor-pointer"
              >
                Launch Focus Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Cosmic Activity Timeline */}
      <div className="glass-panel p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-base text-white">Recent Cosmic Activity</h3>
          <button
            onClick={() => onNavigate('stats')}
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-2">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <div>
                    <span className="font-bold text-white mr-1.5">{log.title}</span>
                    <span className="text-slate-400">{log.detail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No activity recorded yet. Create an alarm or complete a focus session to begin!
          </p>
        )}
      </div>
    </div>
  );
};
