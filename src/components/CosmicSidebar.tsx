import React from 'react';
import { 
  LayoutDashboard, 
  AlarmClock as AlarmClockIcon, 
  Hourglass, 
  BrainCircuit, 
  Star, 
  BarChart3, 
  Settings as SettingsIcon,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';

interface CosmicSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const CosmicSidebar: React.FC<CosmicSidebarProps> = ({ currentView, onNavigate }) => {
  const { stars, rankInfo, alarms, focusTimer } = useAlarmClock();

  const activeAlarmsCount = alarms.filter(a => a.enabled).length;

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
      icon: AlarmClockIcon,
      badge: activeAlarmsCount > 0 ? `${activeAlarmsCount} active` : null,
      badgeColor: 'bg-[#7C3AED]/30 text-[#C4B5FD] border-[#7C3AED]/40',
    },
    {
      id: 'focus',
      label: 'Focus Sessions',
      icon: Hourglass,
      badge: focusTimer.status === 'running' ? 'Active' : null,
      badgeColor: 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40 animate-pulse',
    },
    {
      id: 'missions',
      label: 'Mission Arena',
      icon: BrainCircuit,
      badge: '3 Types',
      badgeColor: 'bg-[#F472B6]/20 text-[#F472B6] border-[#F472B6]/30',
    },
    {
      id: 'rewards',
      label: 'Star Rewards',
      icon: Star,
      badge: `${stars} ★`,
      badgeColor: 'bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/40',
    },
    {
      id: 'history',
      label: 'History & Stats',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-[calc(100vh-61px)] bg-[#0B1026]/70 backdrop-blur-xl border-r border-[#7C3AED]/20 p-4 justify-between">
        <div className="space-y-6">
          
          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED]/30 to-[#A855F7]/15 text-white border border-[#A855F7]/40 shadow-lg shadow-[#7C3AED]/15'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1E1B4B]/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${item.badgeColor || 'bg-[#1E293B] text-[#94A3B8] border-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Cosmic Rank Badge */}
        <div 
          onClick={() => onNavigate('rewards')}
          className="p-3.5 rounded-xl bg-gradient-to-b from-[#18113A]/90 to-[#0B1026]/90 border border-[#7C3AED]/30 shadow-md cursor-pointer hover:border-[#A855F7]/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FCD34D]" />
              <span className="text-xs font-semibold text-white tracking-wide">
                {rankInfo.rank}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="w-full bg-[#050816] rounded-full h-1.5 overflow-hidden border border-[#7C3AED]/30">
            <div 
              className="bg-gradient-to-r from-[#7C3AED] via-[#38BDF8] to-[#F472B6] h-full rounded-full transition-all duration-500"
              style={{ width: `${rankInfo.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#94A3B8]">
            <span>{stars} Stars</span>
            <span>Next: {rankInfo.nextThreshold} ★</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Navigation */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#050816]/95 backdrop-blur-xl border-t border-[#7C3AED]/30 px-2 py-1.5 flex items-center justify-around"
      >
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-[#38BDF8]' : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#7C3AED]/30' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[64px]">{item.label}</span>
            </button>
          );
        })}
        
        {/* Overflow / More button for mobile to access History & Settings */}
        <button
          onClick={() => onNavigate(currentView === 'settings' ? 'history' : 'settings')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
            currentView === 'settings' || currentView === 'history' ? 'text-[#38BDF8]' : 'text-[#64748B]'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'settings' || currentView === 'history' ? 'bg-[#7C3AED]/30' : ''}`}>
            <SettingsIcon className="w-4 h-4" />
          </div>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
