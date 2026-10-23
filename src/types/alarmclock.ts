export type AlarmSoundType = 
  | 'cosmic_chime' 
  | 'pulsar_pulse' 
  | 'nebula_melody' 
  | 'supernova_alert' 
  | 'starlight_beacon';

export type MissionType = 'none' | 'math' | 'memory' | 'sequence';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export type FocusCategory = 'Study' | 'Coding' | 'Reading' | 'Work' | 'Creative' | 'Fitness';

export interface LinkedFocusTask {
  id: string;
  title: string;
  category: FocusCategory;
  durationMinutes: number;
}

export interface Alarm {
  id: string;
  label: string;
  time: string; // "HH:MM" in 24hr format, e.g. "07:30"
  days: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat; empty array = one-time alarm
  enabled: boolean;
  sound: AlarmSoundType;
  snoozeDurationMin: number;
  allowSnooze: boolean;
  missionType: MissionType;
  missionDifficulty: MissionDifficulty;
  linkedFocusTask?: LinkedFocusTask;
  lastTriggeredDate?: string; // e.g. "2025-05-18-07:30" to prevent duplicate triggers in the same minute
  createdAt: number;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  category: FocusCategory;
  durationMinutes: number;
  startedAt: number;
  completedAt?: number;
  status: 'completed' | 'cancelled';
  starsAwarded: number; // Exactly 1 if completed by user, 0 if cancelled
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  isUnlocked: boolean;
  requirement: string;
  targetCount: number;
  currentCount?: number;
}

export type ActivityType = 
  | 'alarm_created' 
  | 'alarm_rang' 
  | 'alarm_dismissed' 
  | 'alarm_snoozed' 
  | 'mission_solved' 
  | 'mission_failed' 
  | 'focus_started' 
  | 'focus_completed' 
  | 'star_earned' 
  | 'achievement_unlocked';

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: ActivityType;
  title: string;
  details?: string;
}

export interface UserSettings {
  soundVolume: number; // 0.0 to 1.0
  defaultSound: AlarmSoundType;
  defaultSnoozeMin: number;
  defaultDifficulty: MissionDifficulty;
  defaultMissionType: MissionType;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  militaryTime24h: boolean;
}

export type RankLevel = 'Cosmic Beginner' | 'Rising Star' | 'Galaxy Achiever' | 'Cosmic Champion';

export interface MathChallenge {
  question: string;
  answer: number;
  difficulty: MissionDifficulty;
}

export interface MemoryChallenge {
  sequence: string[];
  displayDurationMs: number;
  difficulty: MissionDifficulty;
  availableOptions: string[];
}

export interface SequenceChallenge {
  displaySequence: (number | string)[]; // e.g. [3, 6, 9, '?', 15]
  answer: number;
  options: number[];
  patternDescription: string;
  difficulty: MissionDifficulty;
}

export function formatAlarmSchedule(days?: number[]): string {
  const safeDays = Array.isArray(days) ? days : [];
  if (safeDays.length === 0) return 'Once (No repeat)';
  if (safeDays.length === 5 && !safeDays.includes(0) && !safeDays.includes(6)) return 'Weekdays (Mon - Fri)';
  if (safeDays.length === 2 && safeDays.includes(0) && safeDays.includes(6)) return 'Weekends (Sat & Sun)';
  if (safeDays.length === 7) return 'Every day';
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return safeDays.map(d => names[d]).join(', ');
}

