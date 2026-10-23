import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  X, 
  Hourglass 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';

interface FocusTimerWidgetProps {
  onOpenFocusModal?: () => void;
}

export const FocusTimerWidget: React.FC<FocusTimerWidgetProps> = () => {
  const { 
    focusTimer, 
    pauseFocusSession, 
    resumeFocusSession, 
    cancelFocusSession, 
    completeFocusSession 
  } = useAlarmClock();

  const totalSec = focusTimer.totalDurationMinutes * 60;
  const remainingSec = focusTimer.remainingSeconds;
  const progressPercent = totalSec > 0 ? ((totalSec - remainingSec) / totalSec) * 100 : 0;

  // Format mm:ss
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  const timeDisplay = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG Circular parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isRunning = focusTimer.status === 'running';
  const isPaused = focusTimer.status === 'paused';
  const isCompleted = focusTimer.status === 'completed';
  const isIdle = focusTimer.status === 'idle';

  return (
    <div className="cosmic-card-glow rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
      
      {/* Decorative celestial background orb */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center gap-2 mb-2">
        <Hourglass className={`w-4 h-4 ${isRunning ? 'text-[#38BDF8] animate-spin' : 'text-[#A855F7]'}`} />
        <span className="text-xs font-bold uppercase tracking-wider text-[#CBD5E1]">
          Cosmic Focus Chamber
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-bold font-outfit text-white">
        {focusTimer.title}
      </h3>

      <div className="mt-1 flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED]/30 text-[#C4B5FD] text-[11px] font-semibold border border-[#7C3AED]/40">
          {focusTimer.category}
        </span>
        <span className="text-xs text-[#94A3B8]">
          {focusTimer.totalDurationMinutes} min target
        </span>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative my-6 w-52 h-52 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          {/* Background circle track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-[#0B1026]"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-[url(#focusGradient)] transition-all duration-500 ease-linear"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
          <defs>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Time Display */}
        <div className="absolute flex flex-col items-center">
          <span className="font-mono-clock text-4xl sm:text-5xl font-black text-white tracking-wider">
            {timeDisplay}
          </span>
          <span className="text-[11px] font-medium text-[#94A3B8] uppercase tracking-wider mt-1">
            {isPaused ? 'Paused' : isCompleted ? 'Target Met!' : isRunning ? 'In Orbit' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm">
        
        {/* Pause / Resume */}
        {isRunning && (
          <button
            onClick={pauseFocusSession}
            className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Pause className="w-4 h-4 text-[#38BDF8]" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={resumeFocusSession}
            className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 text-[#A855F7]" />
            <span>Resume</span>
          </button>
        )}

        {/* Cancel Session */}
        {(isRunning || isPaused) && (
          <button
            onClick={cancelFocusSession}
            className="px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Cancel session without reward"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}

        {/* EXPLICIT COMPLETION BUTTON: AWARDS EXACTLY 1 STAR */}
        {!isIdle && (
          <button
            onClick={completeFocusSession}
            className="cosmic-button-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#7C3AED]/30 animate-pulse-slow"
          >
            <Sparkles className="w-4 h-4 text-[#FCD34D]" />
            <span>Complete & Claim Star (+1 ★)</span>
          </button>
        )}

      </div>

      {/* Helpful Star Rule Disclaimer */}
      <div className="mt-4 pt-3 border-t border-[#7C3AED]/20 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[#FCD34D]" />
        <span>Each completed session awards exactly 1 Star towards your cosmic rank.</span>
      </div>

    </div>
  );
};
