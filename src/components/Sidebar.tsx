/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Target,
  BrainCircuit,
  Sparkles,
  BarChart3,
  Settings,
  PlusCircle,
  PlayCircle,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  alarmsCount: number;
  activeAlarmsCount: number;
  isFocusRunning: boolean;
  onOpenCreateAlarm: () => void;
  onOpenQuickFocus: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeAlarmsCount,
  isFocusRunning,
  onOpenCreateAlarm,
  onOpenQuickFocus,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'alarms',
      label: 'My Alarms',
      icon: Clock,
      badge: activeAlarmsCount > 0 ? `${activeAlarmsCount} active` : null,
    },
    {
      id: 'focus',
      label: 'Focus Sessions',
      icon: Target,
      badge: isFocusRunning ? 'RUNNING' : null,
      badgePulse: isFocusRunning,
    },
    {
      id: 'missions',
      label: 'Mission Arena',
      icon: BrainCircuit,
      badge: 'Interactive',
    },
    {
      id: 'rewards',
      label: 'Star Rewards',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'stats',
      label: 'History & Stats',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 glass-panel border-r border-purple-500/20 z-30 transition-transform duration-300 ease-in-out flex flex-col justify-between p-4 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-orbitron font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition ${
                      isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.badgePulse
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-pulse'
                        : isActive
                        ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Cosmic Actions at Bottom of Sidebar */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/20 space-y-2 mt-4">
          <div className="text-[11px] font-orbitron uppercase text-purple-300 font-semibold mb-2 flex items-center justify-between">
            <span>Quick Launch</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          </div>

          <button
            onClick={() => {
              onOpenCreateAlarm();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold font-orbitron flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span>New Alarm</span>
          </button>

          <button
            onClick={() => {
              onOpenQuickFocus();
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 hover:text-white text-xs font-bold font-orbitron flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-sky-400" />
            <span>Focus Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
