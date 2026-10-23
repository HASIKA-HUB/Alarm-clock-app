import React, { useState } from 'react';
import { 
  Clock, 
  AlarmClock, 
  Sparkles, 
  Hourglass, 
  Plus, 
  Play, 
  Brain, 
  Info, 
  ChevronRight, 
  Flame, 
  Activity, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { FocusTimerWidget } from '../components/FocusTimerWidget';
import { FocusCategory, formatAlarmSchedule } from '../types/alarmclock';

interface DashboardViewProps {
  onOpenCreateAlarm: () => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateAlarm, onNavigate }) => {
  const { 
    currentTime, 
    alarms, 
    toggleAlarm, 
    triggerAlarmTest, 
    nextUpcomingAlarm, 
    stars, 
    rankInfo, 
    focusSessions, 
    focusTimer, 
    startFocusSession, 
    recentActivities,
    settings 
  } = useAlarmClock();

  // Quick focus launcher state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<FocusCategory>('Study');
  const [quickDuration, setQuickDuration] = useState<number>(25);

  // Stats today
  const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()).getTime();
  const todaySessions = focusSessions.filter(s => s.status === 'completed' && s.completedAt && s.completedAt >= startOfToday);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Active alarms
  const activeAlarms = alarms.filter(a => a.enabled);

  // Format large clock display
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = settings.militaryTime24h ? String(hours).padStart(2, '0') : String(hours % 12 || 12);

  const handleStartQuickFocus = (e: React.FormEvent) => {
    e.preventDefault();
    startFocusSession(quickTitle.trim() || 'Cosmic Deep Focus', quickCategory, quickDuration);
    onNavigate('focus');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Honest Browser Wakeup Advisory Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0B1026]/80 border border-[#7C3AED]/30 flex items-start gap-3 text-xs text-[#CBD5E1]">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold text-white">Browser Alarm Advisory:</span> Web browser alarms require this tab to stay open and your computer/screen to remain awake. For best results, keep AlarmClock active in a dedicated window!
        </div>
      </div>

      {/* Hero Grid: Big Cosmic Clock & Next Alarm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Animated Cosmic Clock Widget (2 columns) */}
        <div className="lg:col-span-2 cosmic-card-glow rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle cosmic planetary glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#7C3AED]/25 via-[#38BDF8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-xs font-semibold text-[#A855F7] uppercase tracking-wider">
                  Live Galaxy Chronometer
                </span>
              </div>
              <span className="text-xs text-[#94A3B8]">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>

            {/* Huge Clock Digits */}
            <div className="flex items-baseline gap-2 sm:gap-4 my-2">
              <span className="font-mono-clock text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-wider drop-shadow-[0_0_25px_rgba(124,58,237,0.35)]">
                {displayHours}:{minutes}
              </span>
              <div className="flex flex-col">
                {!settings.militaryTime24h && (
                  <span className="font-mono-clock text-lg sm:text-2xl font-bold text-[#A855F7]">
                    {ampm}
                  </span>
                )}
                <span className="font-mono-clock text-sm sm:text-lg font-semibold text-[#38BDF8]">
                  :{seconds}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#C4B5FD] font-medium mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Quick Action Buttons inside Clock Card */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-[#7C3AED]/20">
            <button
              onClick={onOpenCreateAlarm}
              className="cosmic-button-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Alarm</span>
            </button>

            <button
              onClick={() => onNavigate('missions')}
              className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-[#F472B6]" />
              <span>Practice Wake-up Missions</span>
            </button>
          </div>

        </div>

        {/* Next Upcoming Alarm Card */}
        <div className="cosmic-card rounded-3xl p-6 flex flex-col justify-between border border-[#7C3AED]/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
                <AlarmClock className="w-4 h-4 text-[#38BDF8]" />
                Next Alarm
              </span>
              {nextUpcomingAlarm && (
                <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-bold border border-[#38BDF8]/30">
                  {nextUpcomingAlarm.countdownText}
                </span>
              )}
            </div>

            {nextUpcomingAlarm ? (
              <div className="mt-4 space-y-3">
                <div className="font-mono-clock text-4xl sm:text-5xl font-black text-white">
                  {nextUpcomingAlarm.alarm.time}
                </div>
                <div className="text-sm font-bold text-[#E2E8F0]">
                  {nextUpcomingAlarm.alarm.label}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {nextUpcomingAlarm.alarm.missionType !== 'none' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#7C3AED]/30 text-[#C4B5FD] font-semibold border border-[#7C3AED]/30">
                      Mission: {nextUpcomingAlarm.alarm.missionType} ({nextUpcomingAlarm.alarm.missionDifficulty})
                    </span>
                  )}
                  {nextUpcomingAlarm.alarm.linkedFocusTask && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8] font-semibold border border-[#38BDF8]/30">
                      Focus: {nextUpcomingAlarm.alarm.linkedFocusTask.title}
                    </span>
                  )}
                </div>

                {/* Quick Test Trigger */}
                <button
                  onClick={() => triggerAlarmTest(nextUpcomingAlarm.alarm)}
                  className="mt-3 text-xs text-[#38BDF8] hover:text-[#7DD3FC] flex items-center gap-1 cursor-pointer"
                  title="Simulate ringing right now to test missions"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Ringing Screen Now</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-[#94A3B8] space-y-2">
                <AlarmClock className="w-10 h-10 mx-auto text-[#64748B]" />
                <p className="text-xs">No active alarms scheduled.</p>
                <button
                  onClick={onOpenCreateAlarm}
                  className="text-xs text-[#A855F7] font-semibold hover:underline"
                >
                  Set your first alarm &rarr;
                </button>
              </div>
            )}
          </div>

          <div 
            onClick={() => onNavigate('alarms')}
            className="pt-4 border-t border-[#7C3AED]/20 flex items-center justify-between text-xs text-[#C4B5FD] font-semibold cursor-pointer hover:text-white"
          >
            <span>View All ({alarms.length}) Alarms</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stars */}
        <div 
          onClick={() => onNavigate('rewards')}
          className="cosmic-card rounded-2xl p-4 cursor-pointer hover:border-[#F59E0B]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Stellar Stars</span>
            <Sparkles className="w-4 h-4 text-[#FCD34D]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {stars} ★
          </div>
          <div className="text-[11px] text-[#FCD34D] mt-0.5 font-medium">
            Rank: {rankInfo.rank}
          </div>
        </div>

        {/* Today's Focus */}
        <div 
          onClick={() => onNavigate('focus')}
          className="cosmic-card rounded-2xl p-4 cursor-pointer hover:border-[#38BDF8]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Today's Focus</span>
            <Hourglass className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {todayMinutes}m
          </div>
          <div className="text-[11px] text-[#38BDF8] mt-0.5">
            {todaySessions.length} sessions completed
          </div>
        </div>

        {/* Active Alarms */}
        <div 
          onClick={() => onNavigate('alarms')}
          className="cosmic-card rounded-2xl p-4 cursor-pointer hover:border-[#7C3AED]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Active Alarms</span>
            <AlarmClock className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {activeAlarms.length} / {alarms.length}
          </div>
          <div className="text-[11px] text-[#A855F7] mt-0.5">
            {alarms.filter(a => a.missionType !== 'none').length} with missions
          </div>
        </div>

        {/* Milestone Progress */}
        <div 
          onClick={() => onNavigate('rewards')}
          className="cosmic-card rounded-2xl p-4 cursor-pointer hover:border-[#F472B6]/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8] font-medium">Next Milestone</span>
            <Flame className="w-4 h-4 text-[#F472B6]" />
          </div>
          <div className="font-mono-clock text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {rankInfo.progressPercent}%
          </div>
          <div className="text-[11px] text-[#F472B6] mt-0.5">
            Target: {rankInfo.nextThreshold} ★
          </div>
        </div>

      </div>

      {/* Main Content Split: Alarms Schedule & Focus / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Alarms List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A855F7]" />
              <span>Cosmic Alarm Schedule</span>
            </h2>
            <button
              onClick={onOpenCreateAlarm}
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Alarm</span>
            </button>
          </div>

          {alarms.length === 0 ? (
            <div className="cosmic-card rounded-2xl p-8 text-center text-[#94A3B8] space-y-3">
              <AlarmClock className="w-12 h-12 mx-auto text-[#64748B]" />
              <h3 className="text-sm font-semibold text-white">No Cosmic Alarms Created Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Create an alarm with waking math or memory challenges to start each day sharp.
              </p>
              <button
                onClick={onOpenCreateAlarm}
                className="cosmic-button-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create Your First Alarm
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {alarms.slice(0, 4).map(alarm => (
                <div
                  key={alarm.id}
                  className={`cosmic-card rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
                    alarm.enabled ? 'border-[#7C3AED]/40' : 'opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        alarm.enabled ? 'bg-[#7C3AED]' : 'bg-[#1E293B]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-clock text-xl sm:text-2xl font-black text-white">
                          {alarm.time}
                        </span>
                        <span className="text-xs font-semibold text-[#CBD5E1]">
                          {alarm.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#94A3B8]">
                          {formatAlarmSchedule(alarm.days)}
                        </span>

                        {alarm.missionType !== 'none' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A855F7]/20 text-[#F472B6] font-semibold border border-[#A855F7]/30">
                            {alarm.missionType} • {alarm.missionDifficulty}
                          </span>
                        )}

                        {alarm.linkedFocusTask && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#38BDF8]/20 text-[#38BDF8] font-semibold border border-[#38BDF8]/30">
                            Focus: {alarm.linkedFocusTask.category} ({alarm.linkedFocusTask.durationMinutes}m)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerAlarmTest(alarm)}
                      className="p-2 rounded-xl text-[#38BDF8] hover:bg-[#38BDF8]/10 text-xs font-medium flex items-center gap-1"
                      title="Test alarm sound and missions"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Test</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick-Start Focus Session Card */}
          <div className="cosmic-card-glow rounded-3xl p-5 border border-[#38BDF8]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Hourglass className="w-4 h-4 text-[#38BDF8]" />
                <span>Quick-Start Focus Session</span>
              </div>
              <span className="text-[11px] text-[#FCD34D] font-semibold">
                +1 Star on Completion
              </span>
            </div>

            <form onSubmit={handleStartQuickFocus} className="space-y-3">
              <input
                type="text"
                placeholder="What cosmic task are you conquering? (e.g. Space Dynamics HW)"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                className="w-full bg-[#050816] border border-[#38BDF8]/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <select
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value as FocusCategory)}
                  className="bg-[#050816] border border-[#38BDF8]/30 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Study">Study</option>
                  <option value="Coding">Coding</option>
                  <option value="Reading">Reading</option>
                  <option value="Work">Work</option>
                  <option value="Creative">Creative</option>
                  <option value="Fitness">Fitness</option>
                </select>

                <select
                  value={quickDuration}
                  onChange={e => setQuickDuration(Number(e.target.value))}
                  className="bg-[#050816] border border-[#38BDF8]/30 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={25}>25m (Pomodoro)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>

                <button
                  type="submit"
                  className="cosmic-button-primary py-2 rounded-xl text-xs font-bold col-span-2 sm:col-span-1 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Focus Chamber Preview or Recent Activity */}
        <div className="space-y-6">
          
          {/* Active Focus Session Widget */}
          {focusTimer.status !== 'idle' ? (
            <FocusTimerWidget />
          ) : (
            <div className="cosmic-card rounded-3xl p-6 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#38BDF8]">
                <Hourglass className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white">Focus Chamber Idle</h3>
              <p className="text-xs text-[#94A3B8]">
                No active timer running. Complete a 15-60m session to claim your next stellar star.
              </p>
              <button
                onClick={() => onNavigate('focus')}
                className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Open Focus Chamber &rarr;
              </button>
            </div>
          )}

          {/* Recent Activity Timeline */}
          <div className="cosmic-card rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#7C3AED]/20">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#A855F7]" />
                Recent Cosmic Log
              </h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-[11px] text-[#38BDF8] hover:underline"
              >
                All History
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivities.slice(0, 4).map(act => (
                <div key={act.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {act.details && (
                    <p className="text-[11px] text-[#94A3B8] truncate">{act.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
