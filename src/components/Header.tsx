/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types/alarm';
import { getCosmicRank } from '../utils/gamification';
import {
  Sparkles,
  Bell,
  Clock,
  Menu,
  X,
  Volume2,
  Calendar,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  starCount: number;
  settings: UserSettings;
  onNavigate: (viewId: string) => void;
  currentView: string;
  onTestAlarm: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  starCount,
  settings,
  onNavigate,
  currentView,
  onTestAlarm,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const rank = getCosmicRank(starCount);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = (d: Date) => {
    if (settings.timeFormat24h) {
      return String(d.getHours()).padStart(2, '0');
    }
    const h = d.getHours() % 12 || 12;
    return String(h).padStart(2, '0');
  };

  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const ampm = settings.timeFormat24h ? '' : time.getHours() >= 12 ? 'PM' : 'AM';

  const dateString = time.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 px-4 md:px-8 py-3 flex items-center justify-between">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-purple-600/30 group-hover:shadow-purple-500/50 transition">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition duration-300" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-black text-lg text-white tracking-wider">
                Alarm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Clock</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 hidden sm:inline-block">
                GALAXY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Digital Clock & Date */}
      <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-2xl bg-slate-950/60 border border-purple-500/20 shadow-inner">
        <div className="flex items-center gap-1 text-slate-300 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>{dateString}</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-baseline gap-1 font-orbitron font-bold text-white tracking-widest text-base">
          <span>{formatHours(time)}:{minutes}</span>
          <span className="text-xs text-sky-400 opacity-90">:{seconds}</span>
          {!settings.timeFormat24h && (
            <span className="text-[11px] text-purple-300 ml-1 font-mono">{ampm}</span>
          )}
        </div>
      </div>

      {/* Star Rewards, Quick Test, & Settings */}
      <div className="flex items-center gap-2.5">
        {/* Quick Demo Test Alarm Button */}
        <button
          onClick={onTestAlarm}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-orbitron font-bold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-500/30 transition shadow-sm cursor-pointer"
          title="Fires a test alarm in 2 seconds for presentation demonstration"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span>Demo Ring</span>
        </button>

        {/* Stars Counter Badge */}
        <div
          onClick={() => onNavigate('rewards')}
          className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-950/70 to-slate-900/80 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition shadow-md group"
          title={`Cosmic Level: ${rank.currentRank.title}. Click to view Star Rewards.`}
        >
          <div className="flex items-center gap-1 text-yellow-400">
            <Sparkles className="w-4 h-4 fill-yellow-400 group-hover:scale-110 transition" />
            <span className="font-orbitron font-black text-sm text-white">
              {starCount}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-purple-300 pl-1 border-l border-purple-800/60">
            <span>{rank.currentRank.badge}</span>
            <span className="font-medium truncate max-w-[90px]">{rank.currentRank.title}</span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => onNavigate('settings')}
          className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition cursor-pointer ${
            currentView === 'settings' ? 'bg-purple-900/40 text-purple-300 border-purple-500/40' : ''
          }`}
          title="Open Settings"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
