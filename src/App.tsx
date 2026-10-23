/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Alarm,
  FocusSession,
  LinkedFocusTask,
  MissionResult,
  StarReward,
  UserSettings,
  ActivityLogItem,
} from './types/alarm';
import {
  getStoredAlarms,
  saveStoredAlarms,
  getStoredSessions,
  saveStoredSessions,
  getStoredStarRewards,
  saveStoredStarRewards,
  getStoredMissions,
  saveStoredMissions,
  getStoredSettings,
  saveStoredSettings,
  getStoredLogs,
  logActivity,
  clearAllApplicationData,
} from './utils/storage';
import { awardStarForSession, calculateAchievements } from './utils/gamification';
import { cosmicAudio } from './utils/audio';
import { triggerStarCelebration } from './utils/confetti';

// Components & Views
import { CosmicBackground } from './components/CosmicBackground';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlarmModal } from './components/AlarmModal';
import { QuickFocusModal } from './components/QuickFocusModal';
import { RingingScreen } from './components/RingingScreen';

import { DashboardView } from './views/DashboardView';
import { MyAlarmsView } from './views/MyAlarmsView';
import { FocusSessionsView } from './views/FocusSessionsView';
import { MissionSettingsView } from './views/MissionSettingsView';
import { StarRewardsView } from './views/StarRewardsView';
import { HistoryStatisticsView } from './views/HistoryStatisticsView';
import { SettingsView } from './views/SettingsView';

import { Sparkles, CheckCircle2, Award } from 'lucide-react';

export default function App() {
  // --- Persistent State ---
  const [alarms, setAlarms] = useState<Alarm[]>(() => getStoredAlarms());
  const [sessions, setSessions] = useState<FocusSession[]>(() => getStoredSessions());
  const [stars, setStars] = useState<StarReward[]>(() => getStoredStarRewards());
  const [missions, setMissions] = useState<MissionResult[]>(() => getStoredMissions());
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());
  const [logs, setLogs] = useState<ActivityLogItem[]>(() => getStoredLogs());

  // --- Runtime UI State ---
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const [alarmModalOpen, setAlarmModalOpen] = useState(false);
  const [alarmToEdit, setAlarmToEdit] = useState<Alarm | null>(null);
  const [quickFocusOpen, setQuickFocusOpen] = useState(false);
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevents firing multiple times in the same minute occurrence
  const lastTriggeredMinuteRef = useRef<Map<string, string>>(new Map());

  // First user interaction unlocks browser audio
  useEffect(() => {
    const unlockHandler = () => {
      cosmicAudio.unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };
    window.addEventListener('pointerdown', unlockHandler);
    window.addEventListener('keydown', unlockHandler);
    return () => {
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };
  }, []);

  // --- Central High-Accuracy Alarm Scheduler ---
  useEffect(() => {
    const checkAlarms = () => {
      if (ringingAlarm) return; // Wait until current ringing alarm is handled

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay();
      const todayDateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}_${currentTimeString}`;
      const nowMs = now.getTime();

      for (const alarm of alarms) {
        if (!alarm.isEnabled) continue;

        // Check if snoozed
        const isSnoozeDue = Boolean(alarm.isSnoozedUntil && nowMs >= alarm.isSnoozedUntil);
        const isScheduledTime = alarm.time === currentTimeString;

        // If not snoozed and not exact scheduled minute, continue
        if (!isSnoozeDue && !isScheduledTime) continue;

        // Check repeat day
        const isRepeatValid =
          alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);

        if (!isSnoozeDue && !isRepeatValid) continue;

        // Check if already fired in this exact minute
        const lastMinuteFired = lastTriggeredMinuteRef.current.get(alarm.id);
        if (!isSnoozeDue && lastMinuteFired === todayDateKey) {
          continue;
        }

        // --- Trigger Alarm ---
        lastTriggeredMinuteRef.current.set(alarm.id, todayDateKey);

        // If it was snoozed, clear snooze
        if (alarm.isSnoozedUntil) {
          const updated = alarms.map((a) =>
            a.id === alarm.id ? { ...a, isSnoozedUntil: null } : a
          );
          setAlarms(updated);
          saveStoredAlarms(updated);
        }

        // Fire browser notification if allowed
        if (
          settings.notificationsEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          try {
            new Notification(`Cosmic Alarm: ${alarm.label || 'Wake Up!'}`, {
              body: `Scheduled alarm for ${alarm.time}. Solve mission to dismiss.`,
            });
          } catch {
            // Ignore
          }
        }

        logActivity({
          type: 'alarm_rang',
          title: `Alarm Triggered`,
          detail: `"${alarm.label}" rang at ${alarm.time}`,
        });
        setLogs(getStoredLogs());

        setRingingAlarm(alarm);
        break; // Trigger one alarm at a time
      }
    };

    const interval = setInterval(checkAlarms, 1000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarm, settings.notificationsEnabled]);

  // --- Handlers: Alarms ---
  const handleSaveAlarm = (newAlarm: Alarm) => {
    let updated: Alarm[];
    const exists = alarms.some((a) => a.id === newAlarm.id);
    if (exists) {
      updated = alarms.map((a) => (a.id === newAlarm.id ? newAlarm : a));
      logActivity({
        type: 'alarm_created',
        title: 'Alarm Updated',
        detail: `"${newAlarm.label}" set for ${newAlarm.time}`,
      });
    } else {
      updated = [newAlarm, ...alarms];
      logActivity({
        type: 'alarm_created',
        title: 'Alarm Created',
        detail: `"${newAlarm.label}" set for ${newAlarm.time}`,
      });
    }
    setAlarms(updated);
    saveStoredAlarms(updated);
    setLogs(getStoredLogs());
    setAlarmModalOpen(false);
    setAlarmToEdit(null);
  };

  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map((a) =>
      a.id === id ? { ...a, isEnabled: !a.isEnabled, isSnoozedUntil: null } : a
    );
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter((a) => a.id !== id);
    setAlarms(updated);
    saveStoredAlarms(updated);
  };

  const handleOpenEditAlarm = (alarm: Alarm) => {
    setAlarmToEdit(alarm);
    setAlarmModalOpen(true);
  };

  const handleDismissRingingAlarm = (
    alarm: Alarm,
    missionResult?: MissionResult,
    startLinkedFocus?: LinkedFocusTask
  ) => {
    // If a mission was cleared, persist result
    if (missionResult) {
      const updatedMissions = [missionResult, ...missions];
      setMissions(updatedMissions);
      saveStoredMissions(updatedMissions);

      logActivity({
        type: 'mission_cleared',
        title: `Mission Solved`,
        detail: `${missionResult.missionType.toUpperCase()} challenge (${missionResult.difficulty}) completed in ${missionResult.timeSpentSeconds}s`,
      });
    }

    // If one-time alarm, auto-disable
    let updatedAlarms = alarms;
    if (alarm.repeatDays.length === 0) {
      updatedAlarms = alarms.map((a) =>
        a.id === alarm.id ? { ...a, isEnabled: false, isSnoozedUntil: null } : a
      );
      setAlarms(updatedAlarms);
      saveStoredAlarms(updatedAlarms);
    }

    setRingingAlarm(null);

    // If user clicked start linked focus task
    if (startLinkedFocus) {
      const newSession: FocusSession = {
        id: `focus-session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        taskName: startLinkedFocus.name,
        description: startLinkedFocus.description,
        category: startLinkedFocus.category,
        plannedDurationMinutes: startLinkedFocus.durationMinutes,
        actualDurationSeconds: 0,
        startedAt: Date.now(),
        status: 'in_progress',
        starAwarded: false,
        linkedAlarmId: alarm.id,
      };
      setActiveFocusSession(newSession);
      setCurrentView('focus');

      logActivity({
        type: 'alarm_rang',
        title: 'Focus Mission Launched',
        detail: `Linked task "${startLinkedFocus.name}" started for ${startLinkedFocus.durationMinutes}m`,
      });
      setLogs(getStoredLogs());
    } else {
      setLogs(getStoredLogs());
    }
  };

  const handleSnoozeRingingAlarm = (alarm: Alarm) => {
    const snoozeMs = alarm.snoozeDurationMinutes * 60 * 1000;
    const snoozeTarget = Date.now() + snoozeMs;

    const updatedAlarms = alarms.map((a) =>
      a.id === alarm.id ? { ...a, isSnoozedUntil: snoozeTarget } : a
    );
    setAlarms(updatedAlarms);
    saveStoredAlarms(updatedAlarms);
    setRingingAlarm(null);

    logActivity({
      type: 'alarm_rang',
      title: 'Alarm Snoozed',
      detail: `"${alarm.label}" snoozed for ${alarm.snoozeDurationMinutes}m`,
    });
    setLogs(getStoredLogs());

    showToast(
      'Alarm Snoozed',
      `Will ring again in ${alarm.snoozeDurationMinutes} minutes.`
    );
  };

  // Quick Demo Alarm for presentations
  const handleTestDemoAlarm = (specificAlarm?: Alarm) => {
    cosmicAudio.unlock();
    const target = specificAlarm || {
      id: 'demo-alarm-instant',
      label: 'College Demo Cosmic Wake-Up',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEnabled: true,
      repeatDays: [],
      sound: 'cosmic-beacon',
      snoozeEnabled: true,
      snoozeDurationMinutes: 5,
      missionConfig: {
        enabled: true,
        type: settings.defaultMissionType,
        difficulty: settings.defaultMissionDifficulty,
      },
      linkedTask: {
        name: 'Distributed Systems & Cloud Computing Lab',
        description: 'Demonstrating mission challenge and star award mechanics',
        durationMinutes: 25,
        category: 'Study',
      },
      createdAt: Date.now(),
    };

    showToast('Demo Alarm Initializing', 'Ringing screen launching now...');
    setTimeout(() => {
      setRingingAlarm(target);
    }, 400);
  };

  // --- Handlers: Focus Sessions & Star Rewards ---
  const handleStartFocusSession = (session: FocusSession) => {
    setActiveFocusSession(session);
    setQuickFocusOpen(false);
    setCurrentView('focus');
  };

  const handleCompleteActiveSession = (session: FocusSession, actualDurationSeconds: number) => {
    const completedSession: FocusSession = {
      ...session,
      actualDurationSeconds,
      endedAt: Date.now(),
      status: 'completed',
    };

    // Save session
    const updatedSessions = [completedSession, ...sessions.filter((s) => s.id !== session.id)];
    setSessions(updatedSessions);
    saveStoredSessions(updatedSessions);

    // Strictly Idempotent Star Award: Exactly 1 star
    const { updatedStars, starAwarded, newReward } = awardStarForSession(completedSession, stars);

    if (starAwarded && newReward) {
      setStars(updatedStars);
      saveStoredStarRewards(updatedStars);

      // Play fanfare sound and confetti
      cosmicAudio.playCelebrationSound();
      triggerStarCelebration(settings.enableCosmicAnimations);

      logActivity({
        type: 'star_earned',
        title: 'Cosmic Star Earned! (+1 ⭐)',
        detail: `Successfully completed focus task: "${completedSession.taskName}"`,
      });

      showToast(
        'Cosmic Star Earned! (+1 ⭐)',
        `Task "${completedSession.taskName}" successfully logged into the stars.`
      );
    }

    logActivity({
      type: 'focus_completed',
      title: 'Focus Task Completed',
      detail: `"${completedSession.taskName}" (${Math.round(actualDurationSeconds / 60)}m focus)`,
    });
    setLogs(getStoredLogs());
    setActiveFocusSession(null);
  };

  const handleCancelActiveSession = (session: FocusSession, actualDurationSeconds: number) => {
    const cancelledSession: FocusSession = {
      ...session,
      actualDurationSeconds,
      endedAt: Date.now(),
      status: 'cancelled',
      starAwarded: false,
    };

    const updatedSessions = [cancelledSession, ...sessions.filter((s) => s.id !== session.id)];
    setSessions(updatedSessions);
    saveStoredSessions(updatedSessions);

    logActivity({
      type: 'focus_cancelled',
      title: 'Focus Task Cancelled',
      detail: `Session for "${cancelledSession.taskName}" cancelled. 0 stars awarded.`,
    });
    setLogs(getStoredLogs());
    setActiveFocusSession(null);

    showToast('Session Cancelled', 'Incomplete sessions earn zero stars.');
  };

  const handleRecordPracticeMission = (result: MissionResult) => {
    const updated = [result, ...missions];
    setMissions(updated);
    saveStoredMissions(updated);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleResetAllData = () => {
    clearAllApplicationData();
    setAlarms([]);
    setSessions([]);
    setStars([]);
    setMissions([]);
    setLogs([]);
    setActiveFocusSession(null);
    setRingingAlarm(null);
    showToast('Data Cleared', 'All application records have been safely reset.');
  };

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col relative selection:bg-purple-600 selection:text-white">
      {/* Dynamic Cosmic Star Canvas */}
      <CosmicBackground enableAnimations={settings.enableCosmicAnimations} />

      {/* Persistent App Header */}
      <Header
        starCount={stars.length}
        settings={settings}
        onNavigate={setCurrentView}
        currentView={currentView}
        onTestAlarm={() => handleTestDemoAlarm()}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          alarmsCount={alarms.length}
          activeAlarmsCount={alarms.filter((a) => a.isEnabled).length}
          isFocusRunning={Boolean(activeFocusSession)}
          onOpenCreateAlarm={() => {
            setAlarmToEdit(null);
            setAlarmModalOpen(true);
          }}
          onOpenQuickFocus={() => setQuickFocusOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* View Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              alarms={alarms}
              sessions={sessions}
              stars={stars}
              logs={logs}
              settings={settings}
              onToggleAlarm={handleToggleAlarm}
              onEditAlarm={handleOpenEditAlarm}
              onOpenCreateAlarm={() => {
                setAlarmToEdit(null);
                setAlarmModalOpen(true);
              }}
              onOpenQuickFocus={() => setQuickFocusOpen(true)}
              onNavigate={setCurrentView}
              onTestAlarm={() => handleTestDemoAlarm()}
            />
          )}

          {currentView === 'alarms' && (
            <MyAlarmsView
              alarms={alarms}
              onToggleAlarm={handleToggleAlarm}
              onEditAlarm={handleOpenEditAlarm}
              onDeleteAlarm={handleDeleteAlarm}
              onOpenCreateAlarm={() => {
                setAlarmToEdit(null);
                setAlarmModalOpen(true);
              }}
              onTestSpecificAlarm={(a) => handleTestDemoAlarm(a)}
            />
          )}

          {currentView === 'focus' && (
            <FocusSessionsView
              sessions={sessions}
              activeSession={activeFocusSession}
              onStartNewSession={() => setQuickFocusOpen(true)}
              onCompleteActiveSession={handleCompleteActiveSession}
              onCancelActiveSession={handleCancelActiveSession}
            />
          )}

          {currentView === 'missions' && (
            <MissionSettingsView
              missions={missions}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRecordPracticeMission={handleRecordPracticeMission}
            />
          )}

          {currentView === 'rewards' && (
            <StarRewardsView
              stars={stars}
              sessions={sessions}
              missions={missions}
              enableAnimations={settings.enableCosmicAnimations}
            />
          )}

          {currentView === 'stats' && (
            <HistoryStatisticsView
              alarms={alarms}
              sessions={sessions}
              missions={missions}
              stars={stars}
              logs={logs}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Ringing Screen Overlay */}
      {ringingAlarm && (
        <RingingScreen
          alarm={ringingAlarm}
          settings={settings}
          onDismiss={handleDismissRingingAlarm}
          onSnooze={handleSnoozeRingingAlarm}
        />
      )}

      {/* Create / Edit Alarm Modal */}
      {alarmModalOpen && (
        <AlarmModal
          alarmToEdit={alarmToEdit}
          settings={settings}
          onSave={handleSaveAlarm}
          onClose={() => {
            setAlarmModalOpen(false);
            setAlarmToEdit(null);
          }}
        />
      )}

      {/* Quick Focus Session Modal */}
      {quickFocusOpen && (
        <QuickFocusModal
          onStart={handleStartFocusSession}
          onClose={() => setQuickFocusOpen(false)}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel-glow border-purple-500/50 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <div className="p-2 rounded-xl bg-purple-500/20 text-yellow-300 border border-purple-500/30">
            <Sparkles className="w-5 h-5 fill-yellow-400" />
          </div>
          <div>
            <h5 className="font-orbitron font-bold text-sm text-white">{toastMessage.title}</h5>
            <p className="text-xs text-slate-300">{toastMessage.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
