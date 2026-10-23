/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AlarmSoundId = 
  | 'cosmic-beacon'
  | 'nebula-pulse'
  | 'quantum-chime'
  | 'starlight-radar'
  | 'pulsar-alarm';

export type TaskCategory = 
  | 'Study' 
  | 'Coding' 
  | 'Reading' 
  | 'Work' 
  | 'Creative' 
  | 'Health';

export type MissionType = 'math' | 'memory' | 'sequence';
export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface MissionConfig {
  enabled: boolean;
  type: MissionType;
  difficulty: MissionDifficulty;
}

export interface LinkedFocusTask {
  name: string;
  description?: string;
  durationMinutes: number;
  category: TaskCategory;
}

export interface Alarm {
  id: string;
  label: string;
  time: string; // "HH:MM" in 24h format
  isEnabled: boolean;
  repeatDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Empty array means one-time.
  sound: AlarmSoundId;
  snoozeDurationMinutes: number;
  snoozeEnabled: boolean;
  missionConfig: MissionConfig;
  linkedTask?: LinkedFocusTask;
  createdAt: number;
  lastTriggeredDate?: string; // "YYYY-MM-DD"
  isSnoozedUntil?: number | null; // Timestamp ms
}

export interface MissionResult {
  id: string;
  alarmId?: string;
  alarmLabel?: string;
  missionType: MissionType;
  difficulty: MissionDifficulty;
  attempts: number;
  solved: boolean;
  completedAt: number;
  timeSpentSeconds: number;
}

export interface FocusSession {
  id: string;
  taskName: string;
  description?: string;
  category: TaskCategory;
  plannedDurationMinutes: number;
  actualDurationSeconds: number;
  startedAt: number;
  endedAt?: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  starAwarded: boolean;
  linkedAlarmId?: string;
}

export interface StarReward {
  id: string;
  sessionId: string;
  taskName: string;
  category: TaskCategory;
  awardedAt: number;
  starsCount: number; // Always 1 per valid session
}

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'cosmic';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
}

export interface UserSettings {
  defaultSnoozeMinutes: number;
  defaultMissionType: MissionType;
  defaultMissionDifficulty: MissionDifficulty;
  alarmVolume: number; // 0.1 to 1.0
  enableCosmicAnimations: boolean;
  notificationsEnabled: boolean;
  timeFormat24h: boolean;
}

export interface ActivityLogItem {
  id: string;
  type: 'alarm_created' | 'alarm_rang' | 'mission_cleared' | 'focus_completed' | 'focus_cancelled' | 'star_earned' | 'achievement_unlocked';
  title: string;
  detail: string;
  timestamp: number;
}
