import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Alarm, 
  FocusSession, 
  FocusCategory, 
  Achievement, 
  ActivityLog, 
  UserSettings, 
  RankLevel 
} from '../types/alarmclock';
import { 
  StorageManager, 
  getRankLevel 
} from '../utils/storageManager';
import { 
  playAlarmLoop, 
  stopAlarmLoop, 
  playCelebrationChime, 
  unlockAudioContext, 
  isAudioUnlocked 
} from '../utils/audioSynthesizer';

interface FocusTimerState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  title: string;
  category: FocusCategory;
  totalDurationMinutes: number;
  remainingSeconds: number;
  startTimestamp?: number;
  pausedAt?: number;
  accumulatedPauseMs: number;
  isStarClaimed: boolean;
}

interface AlarmClockContextType {
  // Time & Clock
  currentTime: Date;
  isAudioReady: boolean;
  handleUnlockAudio: () => Promise<boolean>;

  // Alarms
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  triggerAlarmTest: (alarm: Alarm) => void;

  // Ringing Screen
  activeRingingAlarm: Alarm | null;
  dismissRingingAlarm: () => void;
  snoozeRingingAlarm: (customMinutes?: number) => void;
  recordMissionSolved: (missionName: string) => void;
  recordMissionFailed: () => void;

  // Focus Sessions & Timer
  focusTimer: FocusTimerState;
  startFocusSession: (title: string, category: FocusCategory, durationMinutes: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  cancelFocusSession: () => void;
  completeFocusSession: () => boolean; // returns true if star was newly awarded

  // Stars & Gamification
  stars: number;
  rankInfo: { rank: RankLevel; nextThreshold: number; progressPercent: number };
  achievements: Achievement[];
  recentActivities: ActivityLog[];
  focusSessions: FocusSession[];

  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  requestNotificationPermission: () => Promise<boolean>;
  resetAllAppData: () => void;

  // Helpers
  nextUpcomingAlarm: { alarm: Alarm; diffMs: number; countdownText: string } | null;
}

const AlarmClockContext = createContext<AlarmClockContextType | undefined>(undefined);

export const AlarmClockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAudioReady, setIsAudioReady] = useState<boolean>(isAudioUnlocked());
  
  // Stored states
  const [alarms, setAlarms] = useState<Alarm[]>(() => StorageManager.loadAlarms());
  const [stars, setStars] = useState<number>(() => StorageManager.loadStars());
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageManager.loadAchievements());
  const [activities, setActivities] = useState<ActivityLog[]>(() => StorageManager.loadActivities());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => StorageManager.loadFocusSessions());
  const [settings, setSettings] = useState<UserSettings>(() => StorageManager.loadSettings());

  // Ringing state
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<Alarm | null>(null);

  // Focus Timer state
  const [focusTimer, setFocusTimer] = useState<FocusTimerState>({
    status: 'idle',
    title: 'Cosmic Deep Work',
    category: 'Study',
    totalDurationMinutes: 25,
    remainingSeconds: 25 * 60,
    accumulatedPauseMs: 0,
    isStarClaimed: false,
  });

  const timerRef = useRef<number | null>(null);

  // Sync state changes to storage
  useEffect(() => {
    StorageManager.saveAlarms(alarms);
  }, [alarms]);

  useEffect(() => {
    StorageManager.saveStars(stars);
  }, [stars]);

  useEffect(() => {
    StorageManager.saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    StorageManager.saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    StorageManager.saveFocusSessions(focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    StorageManager.saveSettings(settings);
  }, [settings]);

  // Audio Unlock on user interaction
  const handleUnlockAudio = useCallback(async (): Promise<boolean> => {
    const success = await unlockAudioContext();
    setIsAudioReady(success);
    return success;
  }, []);

  // Log Activity Helper
  const logActivity = useCallback((type: ActivityLog['type'], title: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      title,
      details,
    };
    setActivities(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Check & Unlock Achievements
  const evaluateAchievements = useCallback((
    currentStars: number, 
    sessions: FocusSession[], 
    allAlarms: Alarm[]
  ) => {
    setAchievements(prev => {
      let updated = false;
      const nextList = prev.map(ach => {
        if (ach.isUnlocked) return ach;
        let shouldUnlock = false;
        let currentCount = ach.currentCount || 0;

        if (ach.id === 'first_orbit') {
          const completedCount = sessions.filter(s => s.status === 'completed').length;
          currentCount = completedCount;
          if (completedCount >= 1) shouldUnlock = true;
        } else if (ach.id === 'cosmic_consistency') {
          currentCount = currentStars;
          if (currentStars >= 5) shouldUnlock = true;
        } else if (ach.id === 'deep_space_explorer') {
          const totalMins = sessions
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + s.durationMinutes, 0);
          currentCount = totalMins;
          if (totalMins >= 60) shouldUnlock = true;
        } else if (ach.id === 'master_of_time') {
          currentCount = allAlarms.length;
          if (allAlarms.length >= 4) shouldUnlock = true;
        }

        if (shouldUnlock && !ach.isUnlocked) {
          updated = true;
          logActivity('achievement_unlocked', `Unlocked: ${ach.title}`, ach.description);
          try {
            confetti({
              particleCount: 75,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#A855F7', '#38BDF8', '#F472B6', '#FCD34D']
            });
          } catch {}
          return { ...ach, isUnlocked: true, unlockedAt: Date.now(), currentCount };
        }
        return { ...ach, currentCount };
      });
      return updated ? nextList : prev;
    });
  }, [logActivity]);

  // Request browser notification
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setSettings(prev => ({ ...prev, notificationsEnabled: granted }));
      return granted;
    } catch {
      return false;
    }
  }, []);

  // Trigger ringing an alarm
  const triggerAlarm = useCallback((alarm: Alarm) => {
    setActiveRingingAlarm(alarm);
    playAlarmLoop(alarm.sound, settings.soundVolume);

    // Browser Notification
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Alarm: ${alarm.label}`, {
          body: `It is now ${alarm.time}. Time to wake up and start your mission!`,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }

    logActivity('alarm_rang', `Alarm Ringing: ${alarm.label}`, `Triggered at ${alarm.time}`);
  }, [settings.notificationsEnabled, settings.soundVolume, logActivity]);

  // Test ringing an alarm directly
  const triggerAlarmTest = useCallback((alarm: Alarm) => {
    handleUnlockAudio();
    triggerAlarm(alarm);
  }, [handleUnlockAudio, triggerAlarm]);

  // Dismiss ringing alarm
  const dismissRingingAlarm = useCallback(() => {
    if (!activeRingingAlarm) return;
    stopAlarmLoop();
    logActivity('alarm_dismissed', `Alarm Dismissed: ${activeRingingAlarm.label}`, 'Mission cleared');
    setActiveRingingAlarm(null);
  }, [activeRingingAlarm, logActivity]);

  // Snooze ringing alarm
  const snoozeRingingAlarm = useCallback((customMinutes?: number) => {
    if (!activeRingingAlarm) return;
    stopAlarmLoop();

    const snoozeMins = customMinutes || activeRingingAlarm.snoozeDurationMin || settings.defaultSnoozeMin || 5;
    const snoozeDate = new Date(Date.now() + snoozeMins * 60 * 1000);
    const snoozeH = String(snoozeDate.getHours()).padStart(2, '0');
    const snoozeM = String(snoozeDate.getMinutes()).padStart(2, '0');
    const snoozeTime = `${snoozeH}:${snoozeM}`;

    // Add a temporary snoozed alarm or schedule
    const snoozedAlarm: Alarm = {
      ...activeRingingAlarm,
      id: `snooze_${Date.now()}`,
      label: `[Snoozed] ${activeRingingAlarm.label}`,
      time: snoozeTime,
      days: [], // one-time
      enabled: true,
      lastTriggeredDate: undefined,
    };

    setAlarms(prev => [...prev, snoozedAlarm]);
    logActivity('alarm_snoozed', `Snoozed: ${activeRingingAlarm.label}`, `Will ring again in ${snoozeMins}m at ${snoozeTime}`);
    setActiveRingingAlarm(null);
  }, [activeRingingAlarm, settings.defaultSnoozeMin, logActivity]);

  // Record mission solved
  const recordMissionSolved = useCallback((missionName: string) => {
    logActivity('mission_solved', `Mission Solved: ${missionName}`, 'Dismissal authorization verified');
    // Check math/memory voyager achievement
    setAchievements(prev => {
      let updated = false;
      const next = prev.map(ach => {
        if (ach.id === 'math_voyager' && missionName.toLowerCase().includes('math')) {
          const count = (ach.currentCount || 0) + 1;
          const isUnlocked = ach.isUnlocked || count >= ach.targetCount;
          if (isUnlocked && !ach.isUnlocked) updated = true;
          return { ...ach, currentCount: count, isUnlocked, unlockedAt: isUnlocked && !ach.isUnlocked ? Date.now() : ach.unlockedAt };
        }
        if (ach.id === 'super_memory' && missionName.toLowerCase().includes('memory')) {
          const count = (ach.currentCount || 0) + 1;
          const isUnlocked = ach.isUnlocked || count >= ach.targetCount;
          if (isUnlocked && !ach.isUnlocked) updated = true;
          return { ...ach, currentCount: count, isUnlocked, unlockedAt: isUnlocked && !ach.isUnlocked ? Date.now() : ach.unlockedAt };
        }
        return ach;
      });
      return updated ? next : prev;
    });
  }, [logActivity]);

  const recordMissionFailed = useCallback(() => {
    logActivity('mission_failed', 'Mission Retry', 'Incorrect answer entered. Try again.');
  }, [logActivity]);

  // Main 1-Second Background Scheduler Loop
  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarms if not already ringing
      if (!activeRingingAlarm) {
        const curH = String(now.getHours()).padStart(2, '0');
        const curM = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${curH}:${curM}`;
        const currentDayOfWeek = now.getDay(); // 0 = Sun .. 6 = Sat
        const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${currentTimeStr}`;

        alarms.forEach(alarm => {
          if (!alarm.enabled) return;
          if (alarm.time !== currentTimeStr) return;
          if (alarm.lastTriggeredDate === dateKey) return; // Prevent duplicate trigger in same minute

          // Check days safely
          const alarmDays = Array.isArray(alarm.days) ? alarm.days : [];
          const matchesDay = alarmDays.length === 0 || alarmDays.includes(currentDayOfWeek);
          if (matchesDay) {
            // Update lastTriggeredDate and if one-time, disable it
            setAlarms(prev => prev.map(a => {
              if (a.id === alarm.id) {
                const aDays = Array.isArray(a.days) ? a.days : [];
                return {
                  ...a,
                  lastTriggeredDate: dateKey,
                  enabled: aDays.length === 0 ? false : a.enabled,
                };
              }
              return a;
            }));

            triggerAlarm(alarm);
          }
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [alarms, activeRingingAlarm, triggerAlarm]);

  // Focus Timer timestamp-based tick
  useEffect(() => {
    if (focusTimer.status !== 'running') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setFocusTimer(prev => {
        if (prev.status !== 'running' || !prev.startTimestamp) return prev;
        const now = Date.now();
        const totalDurationSec = prev.totalDurationMinutes * 60;
        const elapsedSec = Math.floor((now - prev.startTimestamp - prev.accumulatedPauseMs) / 1000);
        const remaining = Math.max(0, totalDurationSec - elapsedSec);

        if (remaining <= 0) {
          // Timer naturally finished countdown, status changes to 'completed'
          // Note: per requirement, STAR IS ONLY AWARDED when the user explicitly clicks complete!
          return {
            ...prev,
            remainingSeconds: 0,
            status: 'completed',
          };
        }

        return {
          ...prev,
          remainingSeconds: remaining,
        };
      });
    }, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [focusTimer.status]);

  // Start Focus Session
  const startFocusSession = useCallback((title: string, category: FocusCategory, durationMinutes: number) => {
    handleUnlockAudio();
    setFocusTimer({
      status: 'running',
      title: title.trim() || 'Cosmic Deep Work',
      category,
      totalDurationMinutes: durationMinutes,
      remainingSeconds: durationMinutes * 60,
      startTimestamp: Date.now(),
      accumulatedPauseMs: 0,
      isStarClaimed: false,
    });
    logActivity('focus_started', `Started Focus: ${title || 'Cosmic Deep Work'}`, `${durationMinutes}m • ${category}`);
  }, [handleUnlockAudio, logActivity]);

  // Pause Focus Session
  const pauseFocusSession = useCallback(() => {
    setFocusTimer(prev => {
      if (prev.status !== 'running') return prev;
      return {
        ...prev,
        status: 'paused',
        pausedAt: Date.now(),
      };
    });
  }, []);

  // Resume Focus Session
  const resumeFocusSession = useCallback(() => {
    setFocusTimer(prev => {
      if (prev.status !== 'paused' || !prev.pausedAt) return prev;
      const pauseDuration = Date.now() - prev.pausedAt;
      return {
        ...prev,
        status: 'running',
        pausedAt: undefined,
        accumulatedPauseMs: prev.accumulatedPauseMs + pauseDuration,
      };
    });
  }, []);

  // Cancel Focus Session
  const cancelFocusSession = useCallback(() => {
    if (focusTimer.status === 'idle') return;
    const session: FocusSession = {
      id: `session_${Date.now()}`,
      taskTitle: focusTimer.title,
      category: focusTimer.category,
      durationMinutes: focusTimer.totalDurationMinutes,
      startedAt: focusTimer.startTimestamp || Date.now(),
      completedAt: Date.now(),
      status: 'cancelled',
      starsAwarded: 0, // No star on cancel
    };
    setFocusSessions(prev => [session, ...prev]);
    setFocusTimer({
      status: 'idle',
      title: 'Cosmic Deep Work',
      category: 'Study',
      totalDurationMinutes: 25,
      remainingSeconds: 25 * 60,
      accumulatedPauseMs: 0,
      isStarClaimed: false,
    });
    logActivity('focus_completed', `Cancelled Focus: ${focusTimer.title}`, 'No star awarded');
  }, [focusTimer, logActivity]);

  /**
   * Complete Focus Session:
   * CRITICAL REQUIREMENT: Exactly 1 star awarded when a user EXPLICITLY clicks Complete.
   * Never multiple times, never on cancel alone.
   */
  const completeFocusSession = useCallback((): boolean => {
    if (focusTimer.isStarClaimed) {
      return false; // Already claimed
    }

    const session: FocusSession = {
      id: `session_${Date.now()}`,
      taskTitle: focusTimer.title,
      category: focusTimer.category,
      durationMinutes: focusTimer.totalDurationMinutes,
      startedAt: focusTimer.startTimestamp || Date.now() - focusTimer.totalDurationMinutes * 60000,
      completedAt: Date.now(),
      status: 'completed',
      starsAwarded: 1, // Exactly 1 star
    };

    const newStars = stars + 1;
    setStars(newStars);
    setFocusSessions(prev => [session, ...prev]);

    // Sound and celebration
    playCelebrationChime();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7C3AED', '#A855F7', '#38BDF8', '#F472B6', '#FBBF24']
      });
    } catch {}

    logActivity('star_earned', `Stellar Reward: +1 Star!`, `Completed session: ${focusTimer.title} (${focusTimer.totalDurationMinutes}m)`);

    // Reset timer
    setFocusTimer({
      status: 'idle',
      title: 'Cosmic Deep Work',
      category: 'Study',
      totalDurationMinutes: 25,
      remainingSeconds: 25 * 60,
      accumulatedPauseMs: 0,
      isStarClaimed: true,
    });

    evaluateAchievements(newStars, [session, ...focusSessions], alarms);
    return true;
  }, [focusTimer, stars, logActivity, evaluateAchievements, focusSessions, alarms]);

  // Alarms CRUD
  const addAlarm = useCallback((newAlarmData: Omit<Alarm, 'id' | 'createdAt'>) => {
    const newAlarm: Alarm = {
      ...newAlarmData,
      id: `alarm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const nextAlarms = [...alarms, newAlarm];
    setAlarms(nextAlarms);
    logActivity('alarm_created', `Created Alarm: ${newAlarm.label}`, `Set for ${newAlarm.time}`);
    evaluateAchievements(stars, focusSessions, nextAlarms);
  }, [alarms, logActivity, evaluateAchievements, stars, focusSessions]);

  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Reset all data
  const resetAllAppData = useCallback(() => {
    stopAlarmLoop();
    StorageManager.resetAllData();
    setAlarms(StorageManager.loadAlarms());
    setStars(0);
    setAchievements(StorageManager.loadAchievements());
    setActivities([]);
    setFocusSessions([]);
    setSettings(StorageManager.loadSettings());
    setActiveRingingAlarm(null);
    setFocusTimer({
      status: 'idle',
      title: 'Cosmic Deep Work',
      category: 'Study',
      totalDurationMinutes: 25,
      remainingSeconds: 25 * 60,
      accumulatedPauseMs: 0,
      isStarClaimed: false,
    });
  }, []);

  // Next Upcoming Alarm computation
  const nextUpcomingAlarm = React.useMemo(() => {
    const activeList = alarms.filter(a => a.enabled);
    if (activeList.length === 0) return null;

    const now = currentTime;
    let closestAlarm: Alarm | null = null;
    let minDiffMs = Infinity;

    activeList.forEach(alarm => {
      const [h, m] = alarm.time.split(':').map(Number);
      
      const alarmDays = Array.isArray(alarm.days) ? alarm.days : [];
      
      if (alarmDays.length === 0) {
        // One-time alarm
        const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        if (candidate.getTime() <= now.getTime()) {
          candidate.setDate(candidate.getDate() + 1);
        }
        const diff = candidate.getTime() - now.getTime();
        if (diff < minDiffMs) {
          minDiffMs = diff;
          closestAlarm = alarm;
        }
      } else {
        // Repeating alarm
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const testDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, h, m, 0, 0);
          if (alarmDays.includes(testDate.getDay())) {
            if (testDate.getTime() > now.getTime()) {
              const diff = testDate.getTime() - now.getTime();
              if (diff < minDiffMs) {
                minDiffMs = diff;
                closestAlarm = alarm;
              }
              break;
            }
          }
        }
      }
    });

    if (!closestAlarm) return null;

    const diffHours = Math.floor(minDiffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((minDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    let countdownText = '';
    if (diffHours > 0) {
      countdownText = `in ${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      countdownText = `in ${diffMinutes}m`;
    } else {
      countdownText = `in less than 1m`;
    }

    return {
      alarm: closestAlarm,
      diffMs: minDiffMs,
      countdownText,
    };
  }, [alarms, currentTime]);

  const rankInfo = React.useMemo(() => getRankLevel(stars), [stars]);

  return (
    <AlarmClockContext.Provider
      value={{
        currentTime,
        isAudioReady,
        handleUnlockAudio,
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
        triggerAlarmTest,
        activeRingingAlarm,
        dismissRingingAlarm,
        snoozeRingingAlarm,
        recordMissionSolved,
        recordMissionFailed,
        focusTimer,
        startFocusSession,
        pauseFocusSession,
        resumeFocusSession,
        cancelFocusSession,
        completeFocusSession,
        stars,
        rankInfo,
        achievements,
        recentActivities: activities,
        focusSessions,
        settings,
        updateSettings,
        requestNotificationPermission,
        resetAllAppData,
        nextUpcomingAlarm,
      }}
    >
      {children}
    </AlarmClockContext.Provider>
  );
};

export const useAlarmClock = () => {
  const context = useContext(AlarmClockContext);
  if (!context) {
    throw new Error('useAlarmClock must be used within an AlarmClockProvider');
  }
  return context;
};
