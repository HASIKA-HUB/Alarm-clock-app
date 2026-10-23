import React, { useState } from 'react';
import { 
  Hourglass, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Flame, 
  BookOpen, 
  Code, 
  Briefcase, 
  Palette, 
  Dumbbell, 
  ListFilter 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { FocusTimerWidget } from '../components/FocusTimerWidget';
import { FocusCategory } from '../types/alarmclock';

const CATEGORIES: { id: FocusCategory; name: string; icon: React.ElementType; color: string }[] = [
  { id: 'Study', name: 'Study & Academics', icon: BookOpen, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
  { id: 'Coding', name: 'Coding & Engineering', icon: Code, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
  { id: 'Reading', name: 'Reading & Literature', icon: BookOpen, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
  { id: 'Work', name: 'Productive Work', icon: Briefcase, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  { id: 'Creative', name: 'Creative & Design', icon: Palette, color: 'text-pink-400 bg-pink-950/40 border-pink-500/30' },
  { id: 'Fitness', name: 'Fitness & Health', icon: Dumbbell, color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
];

export const FocusSessionsView: React.FC = () => {
  const { 
    focusTimer, 
    startFocusSession, 
    focusSessions, 
    stars, 
    rankInfo 
  } = useAlarmClock();

  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<FocusCategory>('Coding');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);

  const completedSessions = focusSessions.filter(s => s.status === 'completed');
  const totalFocusMinutes = completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    startFocusSession(taskTitle.trim() || 'Cosmic Deep Focus', category, durationMinutes);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
            <Hourglass className="w-7 h-7 text-[#38BDF8]" />
            <span>Cosmic Focus Sessions</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Immerse in uninterrupted deep work. Earn stellar stars for every completed session.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#0B1026] border border-[#7C3AED]/30 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-[#94A3B8]">Logged:</span>
            <span className="font-mono-clock font-bold text-white">{totalFocusMinutes} mins</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-[#0B1026] border border-[#F59E0B]/30 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-[#FCD34D]" />
            <span className="font-mono-clock font-bold text-white">{stars} ★</span>
          </div>
        </div>
      </div>

      {/* Main Focus Chamber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Focus Timer Widget (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <FocusTimerWidget />

          {/* Preset Launcher Form */}
          <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#F472B6]" />
              <span>Configure New Focus Orbit</span>
            </h3>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                  Focus Task Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master React Concurrency or Physics Orbit"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full bg-[#050816] border border-[#7C3AED]/30 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">
                  Session Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C3AED]/30 border-[#38BDF8] text-white shadow-sm'
                            : 'bg-[#0B1026] border-[#7C3AED]/20 text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#38BDF8]" />
                        <span className="text-xs font-semibold truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">
                  Duration (Minutes)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationMinutes(dur)}
                      className={`py-2 rounded-xl border text-center font-mono-clock text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        durationMinutes === dur
                          ? 'bg-[#A855F7] text-white border-white/40 shadow-sm'
                          : 'bg-[#0B1026] text-[#94A3B8] border-[#7C3AED]/20 hover:text-white'
                      }`}
                    >
                      {dur}m {dur === 25 ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full cosmic-button-primary py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Orbit Timer ({durationMinutes} mins)</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Focus History & Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Star Reward Rule Card */}
          <div className="cosmic-card-glow rounded-3xl p-5 border border-[#F59E0B]/30 space-y-3">
            <div className="flex items-center gap-2 text-[#FCD34D] font-bold text-sm">
              <Sparkles className="w-5 h-5 text-[#FCD34D]" />
              <span>Stellar Star Policy</span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              To preserve authentic productivity, <strong>exactly 1 Star</strong> is awarded when you explicitly complete a session. Cancelling or abandoning a timer will not award any stars.
            </p>
            <div className="text-[11px] text-[#94A3B8] pt-2 border-t border-[#7C3AED]/20">
              Current Rank: <span className="text-white font-bold">{rankInfo.rank}</span> ({stars} / {rankInfo.nextThreshold} ★)
            </div>
          </div>

          {/* Session Logs */}
          <div className="cosmic-card rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#7C3AED]/20">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-[#38BDF8]" />
                <span>Recent Focus History</span>
              </h3>
              <span className="text-[11px] text-[#94A3B8]">
                {completedSessions.length} Completed
              </span>
            </div>

            {focusSessions.length === 0 ? (
              <div className="py-8 text-center text-[#94A3B8] text-xs">
                No focus sessions logged yet. Launch your first session!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {focusSessions.map(session => {
                  const isSuccess = session.status === 'completed';
                  return (
                    <div
                      key={session.id}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                        isSuccess
                          ? 'bg-[#0B1026] border-[#7C3AED]/30'
                          : 'bg-[#18113A]/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{session.taskTitle}</span>
                          {session.starsAwarded > 0 && (
                            <span className="text-[10px] text-[#FCD34D] font-bold">
                              +1 ★
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] flex items-center gap-2 mt-0.5">
                          <span className="text-[#38BDF8]">{session.category}</span>
                          <span>•</span>
                          <span>{session.durationMinutes} mins</span>
                          <span>•</span>
                          <span>
                            {new Date(session.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSuccess ? (
                          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Done</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">Cancelled</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
