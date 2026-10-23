import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Brain, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Filter, 
  Calendar 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { ActivityType } from '../types/alarmclock';

export const HistoryStatisticsView: React.FC = () => {
  const { 
    alarms, 
    focusSessions, 
    recentActivities, 
    stars 
  } = useAlarmClock();

  const [activityFilter, setActivityFilter] = useState<'all' | 'alarm' | 'mission' | 'focus' | 'star'>('all');

  // Metrics calculations
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter(a => a.enabled).length;

  const completedSessions = focusSessions.filter(s => s.status === 'completed');
  const cancelledSessions = focusSessions.filter(s => s.status === 'cancelled');
  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Missions metrics
  const missionSolvedLogs = recentActivities.filter(a => a.type === 'mission_solved').length;
  const missionFailedLogs = recentActivities.filter(a => a.type === 'mission_failed').length;
  const totalMissionAttempts = missionSolvedLogs + missionFailedLogs;
  const successRate = totalMissionAttempts > 0 
    ? Math.round((missionSolvedLogs / totalMissionAttempts) * 100) 
    : 100;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  completedSessions.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + s.durationMinutes;
  });

  const filteredActivities = recentActivities.filter(a => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'alarm') return a.type.startsWith('alarm_');
    if (activityFilter === 'mission') return a.type.startsWith('mission_');
    if (activityFilter === 'focus') return a.type.startsWith('focus_');
    if (activityFilter === 'star') return a.type === 'star_earned' || a.type === 'achievement_unlocked';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-[#38BDF8]" />
          <span>Cosmic Statistics & History</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Detailed metrics of your wakefulness verification, focus cycles, and celestial logs.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Focus Time */}
        <div className="cosmic-card rounded-2xl p-4 border border-[#38BDF8]/30">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Deep Work Logged</span>
            <Clock className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {totalFocusHours} hrs
          </div>
          <div className="text-[11px] text-[#38BDF8] mt-0.5">
            {totalFocusMinutes} total focus minutes
          </div>
        </div>

        {/* Mission Accuracy */}
        <div className="cosmic-card rounded-2xl p-4 border border-[#A855F7]/30">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Mission Accuracy</span>
            <Brain className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {successRate}%
          </div>
          <div className="text-[11px] text-[#A855F7] mt-0.5">
            {missionSolvedLogs} verified missions solved
          </div>
        </div>

        {/* Focus Sessions */}
        <div className="cosmic-card rounded-2xl p-4 border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Focus Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {completedSessions.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            {cancelledSessions.length} cancelled early
          </div>
        </div>

        {/* Stars Earned */}
        <div className="cosmic-card rounded-2xl p-4 border border-[#F59E0B]/30">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Stars Earned</span>
            <Sparkles className="w-4 h-4 text-[#FCD34D]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {stars} ★
          </div>
          <div className="text-[11px] text-[#FCD34D] mt-0.5">
            1 star per completed session
          </div>
        </div>

      </div>

      {/* Focus Category Distribution & Alarms Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Focus Time Distribution by Category
          </h2>

          {Object.keys(categoryCounts).length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No categorized focus time logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, mins]) => {
                const percent = totalFocusMinutes > 0 ? Math.round((mins / totalFocusMinutes) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{cat}</span>
                      <span className="text-[#94A3B8] font-mono-clock">{mins}m ({percent}%)</span>
                    </div>
                    <div className="w-full bg-[#050816] h-2 rounded-full overflow-hidden border border-[#7C3AED]/30">
                      <div
                        className="bg-gradient-to-r from-[#7C3AED] via-[#38BDF8] to-[#F472B6] h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alarms & Missions Breakdown */}
        <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Alarms & Guarded Missions Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
              <span className="text-[#CBD5E1]">Total Configured Alarms:</span>
              <span className="font-mono-clock font-bold text-white">{totalAlarms}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
              <span className="text-[#CBD5E1]">Currently Active Alarms:</span>
              <span className="font-mono-clock font-bold text-[#38BDF8]">{activeAlarms}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
              <span className="text-[#CBD5E1]">Guarded with Wake-up Missions:</span>
              <span className="font-mono-clock font-bold text-[#F472B6]">
                {alarms.filter(a => a.missionType !== 'none').length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
              <span className="text-[#CBD5E1]">Linked to Direct Focus Tasks:</span>
              <span className="font-mono-clock font-bold text-[#A855F7]">
                {alarms.filter(a => a.linkedFocusTask).length}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Chronological Activity Log */}
      <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#7C3AED]/20">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#A855F7]" />
            <h2 className="text-sm sm:text-base font-bold text-white font-outfit">
              Cosmic Activity Timeline
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'alarm', 'mission', 'focus', 'star'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activityFilter === f
                    ? 'bg-[#7C3AED] text-white'
                    : 'bg-[#0B1026] text-[#94A3B8] hover:text-white border border-[#7C3AED]/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            No activity logs found for this filter.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredActivities.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20 flex items-center justify-between text-xs gap-3 hover:border-[#7C3AED]/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{log.title}</div>
                  {log.details && (
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">{log.details}</div>
                  )}
                </div>

                <div className="text-[10px] text-[#64748B] shrink-0 font-mono-clock">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                  {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
