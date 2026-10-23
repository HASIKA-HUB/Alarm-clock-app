import { 
  Alarm, 
  FocusSession, 
  Achievement, 
  ActivityLog, 
  UserSettings, 
  RankLevel 
} from '../types/alarmclock';

const STORAGE_KEYS = {
  ALARMS: 'alarmclock_alarms_v1',
  SESSIONS: 'alarmclock_sessions_v1',
  STARS: 'alarmclock_stars_v1',
  ACHIEVEMENTS: 'alarmclock_achievements_v1',
  ACTIVITIES: 'alarmclock_activities_v1',
  SETTINGS: 'alarmclock_settings_v1',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_orbit',
    title: 'First Orbit',
    description: 'Complete your first focus session and claim your initial star.',
    icon: 'Rocket',
    isUnlocked: false,
    requirement: 'Complete 1 focus session',
    targetCount: 1,
    currentCount: 0,
  },
  {
    id: 'math_voyager',
    title: 'Math Voyager',
    description: 'Successfully solve 3 arithmetic missions to dismiss alarms.',
    icon: 'Brain',
    isUnlocked: false,
    requirement: 'Solve 3 math missions',
    targetCount: 3,
    currentCount: 0,
  },
  {
    id: 'super_memory',
    title: 'Supermemory',
    description: 'Successfully recall 3 cosmic sequences without mistakes.',
    icon: 'Sparkles',
    isUnlocked: false,
    requirement: 'Solve 3 memory missions',
    targetCount: 3,
    currentCount: 0,
  },
  {
    id: 'cosmic_consistency',
    title: 'Cosmic Consistency',
    description: 'Accumulate a stellar balance of at least 5 stars.',
    icon: 'Star',
    isUnlocked: false,
    requirement: 'Earn 5 stars',
    targetCount: 5,
    currentCount: 0,
  },
  {
    id: 'deep_space_explorer',
    title: 'Deep Space Explorer',
    description: 'Log 60+ minutes of total focused productive deep work.',
    icon: 'Clock',
    isUnlocked: false,
    requirement: 'Log 60 focus minutes',
    targetCount: 60,
    currentCount: 0,
  },
  {
    id: 'master_of_time',
    title: 'Master of Time',
    description: 'Configure and maintain at least 4 active cosmic alarms.',
    icon: 'ShieldCheck',
    isUnlocked: false,
    requirement: 'Create 4 alarms',
    targetCount: 4,
    currentCount: 0,
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  soundVolume: 0.75,
  defaultSound: 'cosmic_chime',
  defaultSnoozeMin: 5,
  defaultDifficulty: 'medium',
  defaultMissionType: 'math',
  reducedMotion: false,
  notificationsEnabled: false,
  militaryTime24h: false,
};

export function getRankLevel(stars: number): { rank: RankLevel; nextThreshold: number; progressPercent: number } {
  if (stars < 5) {
    return {
      rank: 'Cosmic Beginner',
      nextThreshold: 5,
      progressPercent: Math.min(100, Math.round((stars / 5) * 100)),
    };
  } else if (stars < 15) {
    return {
      rank: 'Rising Star',
      nextThreshold: 15,
      progressPercent: Math.min(100, Math.round(((stars - 5) / 10) * 100)),
    };
  } else if (stars < 30) {
    return {
      rank: 'Galaxy Achiever',
      nextThreshold: 30,
      progressPercent: Math.min(100, Math.round(((stars - 15) / 15) * 100)),
    };
  } else {
    return {
      rank: 'Cosmic Champion',
      nextThreshold: 50,
      progressPercent: 100,
    };
  }
}

// Initial default alarms so new users have realistic, functional items to interact with immediately
const DEFAULT_INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alarm_init_1',
    label: 'Deep Space Orbit Wakeup',
    time: '07:00',
    days: [1, 2, 3, 4, 5], // Mon to Fri
    enabled: true,
    sound: 'cosmic_chime',
    snoozeDurationMin: 5,
    allowSnooze: true,
    missionType: 'math',
    missionDifficulty: 'medium',
    linkedFocusTask: {
      id: 'task_init_1',
      title: 'Morning Cosmic Code Review',
      category: 'Coding',
      durationMinutes: 25,
    },
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'alarm_init_2',
    label: 'Afternoon Focus Checkpoint',
    time: '14:30',
    days: [1, 2, 3, 4, 5],
    enabled: true,
    sound: 'pulsar_pulse',
    snoozeDurationMin: 10,
    allowSnooze: true,
    missionType: 'memory',
    missionDifficulty: 'easy',
    linkedFocusTask: {
      id: 'task_init_2',
      title: 'Deep Physics & Research Sprint',
      category: 'Study',
      durationMinutes: 45,
    },
    createdAt: Date.now() - 43200000,
  },
];

const DEFAULT_INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act_init_1',
    timestamp: Date.now() - 3600000 * 3,
    type: 'alarm_created',
    title: 'Created "Deep Space Orbit Wakeup"',
    details: 'Set for 07:00 on weekdays with Math Mission',
  },
  {
    id: 'act_init_2',
    timestamp: Date.now() - 3600000 * 2,
    type: 'star_earned',
    title: 'Earned +1 Star',
    details: 'Completed 25m Focus Session: Morning Cosmic Code Review',
  },
];

export const StorageManager = {
  loadAlarms(): Alarm[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALARMS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((a: any) => ({
            ...a,
            days: Array.isArray(a.days) ? a.days : [],
            missionType: a.missionType || 'none',
            missionDifficulty: a.missionDifficulty || 'medium',
            sound: a.sound || 'cosmic_chime',
            enabled: typeof a.enabled === 'boolean' ? a.enabled : true,
            allowSnooze: typeof a.allowSnooze === 'boolean' ? a.allowSnooze : true,
            snoozeDurationMin: typeof a.snoozeDurationMin === 'number' ? a.snoozeDurationMin : 5,
          }));
        }
      }
    } catch (e) {
      console.warn('Could not load alarms from storage:', e);
    }
    return DEFAULT_INITIAL_ALARMS;
  },

  saveAlarms(alarms: Alarm[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch (e) {
      console.warn('Could not save alarms to storage:', e);
    }
  },

  loadFocusSessions(): FocusSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not load sessions:', e);
    }
    return [
      {
        id: 'session_init_1',
        taskTitle: 'Morning Cosmic Code Review',
        category: 'Coding',
        durationMinutes: 25,
        startedAt: Date.now() - 3600000 * 2.5,
        completedAt: Date.now() - 3600000 * 2,
        status: 'completed',
        starsAwarded: 1,
      },
    ];
  },

  saveFocusSessions(sessions: FocusSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Could not save sessions:', e);
    }
  },

  loadStars(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STARS);
      if (data !== null) {
        return Math.max(0, parseInt(data, 10) || 0);
      }
    } catch (e) {
      console.warn('Could not load stars:', e);
    }
    return 3; // Seed with 3 stars so user is already on their journey to Rising Star
  },

  saveStars(stars: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STARS, Math.max(0, stars).toString());
    } catch (e) {
      console.warn('Could not save stars:', e);
    }
  },

  loadAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        const stored: Achievement[] = JSON.parse(data);
        // Merge with any new ones
        return INITIAL_ACHIEVEMENTS.map(initial => {
          const found = stored.find(s => s.id === initial.id);
          return found ? { ...initial, ...found } : initial;
        });
      }
    } catch (e) {
      console.warn('Could not load achievements:', e);
    }
    return INITIAL_ACHIEVEMENTS;
  },

  saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.warn('Could not save achievements:', e);
    }
  },

  loadActivities(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not load activities:', e);
    }
    return DEFAULT_INITIAL_ACTIVITIES;
  },

  saveActivities(activities: ActivityLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save activities:', e);
    }
  },

  loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ALARMS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.STARS);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {
      console.warn('Error clearing storage:', e);
    }
  },
};
