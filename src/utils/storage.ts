/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Alarm,
  FocusSession,
  StarReward,
  MissionResult,
  UserSettings,
  ActivityLogItem,
} from '../types/alarm';

const STORAGE_KEYS = {
  ALARMS: 'alarmclock_alarms_v1',
  SESSIONS: 'alarmclock_sessions_v1',
  STARS: 'alarmclock_stars_v1',
  MISSIONS: 'alarmclock_missions_v1',
  SETTINGS: 'alarmclock_settings_v1',
  LOGS: 'alarmclock_logs_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  defaultSnoozeMinutes: 5,
  defaultMissionType: 'math',
  defaultMissionDifficulty: 'easy',
  alarmVolume: 0.8,
  enableCosmicAnimations: true,
  notificationsEnabled: false,
  timeFormat24h: false,
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Initial starter alarms for demonstration if empty
export const SEED_ALARMS: Alarm[] = [
  {
    id: 'seed-alarm-1',
    label: 'Morning Cosmic Launch',
    time: '07:00',
    isEnabled: true,
    repeatDays: [1, 2, 3, 4, 5], // Mon-Fri
    sound: 'cosmic-beacon',
    snoozeDurationMinutes: 5,
    snoozeEnabled: true,
    missionConfig: {
      enabled: true,
      type: 'math',
      difficulty: 'easy',
    },
    linkedTask: {
      name: 'Algorithm Practice & Review',
      description: 'Solve 2 daily LeetCode/Data Structure problems',
      durationMinutes: 25,
      category: 'Coding',
    },
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'seed-alarm-2',
    label: 'Deep Focus Session',
    time: '14:30',
    isEnabled: false,
    repeatDays: [], // One-time
    sound: 'nebula-pulse',
    snoozeDurationMinutes: 10,
    snoozeEnabled: true,
    missionConfig: {
      enabled: true,
      type: 'sequence',
      difficulty: 'medium',
    },
    linkedTask: {
      name: 'College Project Dissertation',
      description: 'Draft methodology and architecture analysis',
      durationMinutes: 45,
      category: 'Study',
    },
    createdAt: Date.now() - 86400000,
  },
];

// --- Storage API ---

export function getStoredAlarms(): Alarm[] {
  const existing = safeGet<Alarm[] | null>(STORAGE_KEYS.ALARMS, null);
  if (existing === null) {
    // First time visit: prefill with two thoughtful alarms
    safeSet(STORAGE_KEYS.ALARMS, SEED_ALARMS);
    return SEED_ALARMS;
  }
  return existing;
}

export function saveStoredAlarms(alarms: Alarm[]): void {
  safeSet(STORAGE_KEYS.ALARMS, alarms);
}

export function getStoredSessions(): FocusSession[] {
  return safeGet<FocusSession[]>(STORAGE_KEYS.SESSIONS, []);
}

export function saveStoredSessions(sessions: FocusSession[]): void {
  safeSet(STORAGE_KEYS.SESSIONS, sessions);
}

export function getStoredStarRewards(): StarReward[] {
  return safeGet<StarReward[]>(STORAGE_KEYS.STARS, []);
}

export function saveStoredStarRewards(stars: StarReward[]): void {
  safeSet(STORAGE_KEYS.STARS, stars);
}

export function getStoredMissions(): MissionResult[] {
  return safeGet<MissionResult[]>(STORAGE_KEYS.MISSIONS, []);
}

export function saveStoredMissions(missions: MissionResult[]): void {
  safeSet(STORAGE_KEYS.MISSIONS, missions);
}

export function getStoredSettings(): UserSettings {
  const raw = safeGet<Partial<UserSettings>>(STORAGE_KEYS.SETTINGS, {});
  return { ...DEFAULT_SETTINGS, ...raw };
}

export function saveStoredSettings(settings: UserSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function getStoredLogs(): ActivityLogItem[] {
  return safeGet<ActivityLogItem[]>(STORAGE_KEYS.LOGS, []);
}

export function logActivity(item: Omit<ActivityLogItem, 'id' | 'timestamp'>): void {
  const logs = getStoredLogs();
  const newItem: ActivityLogItem = {
    ...item,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [newItem, ...logs].slice(0, 50); // Keep latest 50
  safeSet(STORAGE_KEYS.LOGS, updated);
}

export function clearAllApplicationData(): void {
  localStorage.removeItem(STORAGE_KEYS.ALARMS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.STARS);
  localStorage.removeItem(STORAGE_KEYS.MISSIONS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
}
