import React, { useState } from 'react';
import { AlarmClockProvider } from './context/AlarmClockContext';
import { CosmicBackground } from './components/CosmicBackground';
import { CosmicHeader } from './components/CosmicHeader';
import { CosmicSidebar } from './components/CosmicSidebar';
import { AlarmModal } from './components/AlarmModal';
import { RingingScreenModal } from './components/RingingScreenModal';

// Views
import { DashboardView } from './views/DashboardView';
import { MyAlarmsView } from './views/MyAlarmsView';
import { FocusSessionsView } from './views/FocusSessionsView';
import { MissionSettingsView } from './views/MissionSettingsView';
import { StarRewardsView } from './views/StarRewardsView';
import { HistoryStatisticsView } from './views/HistoryStatisticsView';
import { SettingsView } from './views/SettingsView';
import { Alarm } from './types/alarmclock';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [alarmToEdit, setAlarmToEdit] = useState<Alarm | null>(null);

  const handleOpenCreateAlarm = () => {
    setAlarmToEdit(null);
    setIsAlarmModalOpen(true);
  };

  const handleOpenEditAlarm = (alarm: Alarm) => {
    setAlarmToEdit(alarm);
    setIsAlarmModalOpen(true);
  };

  const handleCloseAlarmModal = () => {
    setIsAlarmModalOpen(false);
    setAlarmToEdit(null);
  };

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#F1F5F9] font-sans selection:bg-[#7C3AED] selection:text-white flex flex-col">
      {/* Dynamic Cosmic Background */}
      <CosmicBackground />

      {/* Persistent Global Header */}
      <CosmicHeader
        onOpenCreateAlarm={handleOpenCreateAlarm}
        onNavigate={view => setCurrentView(view)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar */}
        <CosmicSidebar
          currentView={currentView}
          onNavigate={view => setCurrentView(view)}
        />

        {/* View Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 z-10">
          {currentView === 'dashboard' && (
            <DashboardView
              onOpenCreateAlarm={handleOpenCreateAlarm}
              onNavigate={view => setCurrentView(view)}
            />
          )}

          {currentView === 'alarms' && (
            <MyAlarmsView
              onOpenCreateAlarm={handleOpenCreateAlarm}
              onOpenEditAlarm={handleOpenEditAlarm}
            />
          )}

          {currentView === 'focus' && <FocusSessionsView />}

          {currentView === 'missions' && <MissionSettingsView />}

          {currentView === 'rewards' && <StarRewardsView />}

          {currentView === 'history' && <HistoryStatisticsView />}

          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Ringing Alarm Modal Overlay */}
      <RingingScreenModal onNavigateToFocus={() => setCurrentView('focus')} />

      {/* Create / Edit Alarm Modal */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        onClose={handleCloseAlarmModal}
        alarmToEdit={alarmToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AlarmClockProvider>
      <MainApp />
    </AlarmClockProvider>
  );
}
