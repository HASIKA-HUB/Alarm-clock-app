import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Plus, 
  Clock, 
  Compass, 
  BellRing 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';

interface CosmicHeaderProps {
  onOpenCreateAlarm: () => void;
  onNavigate: (view: string) => void;
}

export const CosmicHeader: React.FC<CosmicHeaderProps> = ({ onOpenCreateAlarm, onNavigate }) => {
  const { 
    currentTime, 
    stars, 
    rankInfo, 
    isAudioReady, 
    handleUnlockAudio, 
    settings 
  } = useAlarmClock();

  // Format hours and minutes
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');

  let displayTime = '';
  let ampm = '';

  if (settings.militaryTime24h) {
    displayTime = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  } else {
    const formattedHour = hours % 12 || 12;
    ampm = hours >= 12 ? 'PM' : 'AM';
    displayTime = `${formattedHour}:${minutes}:${seconds}`;
  }

  // Format date: e.g. "Thursday, Oct 24, 2025"
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-[#050816]/80 border-b border-[#7C3AED]/20 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#A855F7] to-[#38BDF8] p-[1.5px] shadow-lg shadow-[#7C3AED]/30 group-hover:shadow-[#A855F7]/50 transition-all">
            <div className="w-full h-full bg-[#0B1026] rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#38BDF8] group-hover:text-[#A855F7] transition-colors" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#F472B6] opacity-30 blur-sm group-hover:opacity-70 transition-opacity" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-outfit font-extrabold text-lg lg:text-xl tracking-tight text-white">
                Alarm<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] via-[#38BDF8] to-[#F472B6]">Clock</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/30">
                Galaxy
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] hidden sm:block">Cosmic Mission & Focus</p>
          </div>
        </div>

        {/* Live Digital Clock & Date */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-lg bg-[#0B1026]/90 border border-[#7C3AED]/30 shadow-inner shadow-[#7C3AED]/10">
            <span className="font-mono-clock text-base sm:text-xl lg:text-2xl font-bold tracking-wider text-white">
              {displayTime}
            </span>
            {ampm && (
              <span className="font-mono-clock text-xs font-semibold text-[#A855F7]">
                {ampm}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-[#94A3B8] mt-0.5 tracking-wide hidden sm:block">
            {dateString}
          </span>
        </div>

        {/* Actions & Star Rewards Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Audio Engine Unlock Pill */}
          <button
            onClick={() => handleUnlockAudio()}
            title={isAudioReady ? "Cosmic Web Audio Engine Ready" : "Click to unlock Web Audio alarms"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isAudioReady
                ? 'bg-[#0B1026] text-[#38BDF8] border-[#38BDF8]/30 hover:border-[#38BDF8]/60'
                : 'bg-[#7C3AED]/20 text-[#F472B6] border-[#F472B6]/40 animate-pulse hover:bg-[#7C3AED]/30'
            }`}
          >
            {isAudioReady ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">
              {isAudioReady ? 'Audio Active' : 'Enable Audio'}
            </span>
          </button>

          {/* Star Rewards Balance */}
          <button
            onClick={() => onNavigate('rewards')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F59E0B]/15 to-[#F472B6]/15 border border-[#F59E0B]/40 hover:border-[#F59E0B]/70 text-[#FCD34D] transition-all cursor-pointer group shadow-sm hover:shadow-[#F59E0B]/20"
            title={`${stars} Stars earned • Rank: ${rankInfo.rank}`}
          >
            <Sparkles className="w-4 h-4 text-[#FCD34D] group-hover:rotate-12 transition-transform" />
            <span className="font-mono-clock text-sm font-bold text-white">
              {stars}
            </span>
            <span className="text-xs text-[#FCD34D] hidden sm:inline font-medium">
              ★
            </span>
          </button>

          {/* New Alarm Button */}
          <button
            onClick={onOpenCreateAlarm}
            className="cosmic-button-primary px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New Alarm</span>
          </button>

        </div>
      </div>
    </header>
  );
};
