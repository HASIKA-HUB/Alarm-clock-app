import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Bell, 
  Moon, 
  Trash2, 
  Clock, 
  Download, 
  Upload, 
  Check, 
  Play, 
  AlertTriangle,
  Brain,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { AlarmSoundType, MissionType, MissionDifficulty } from '../types/alarmclock';
import { previewSound } from '../utils/audioSynthesizer';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    requestNotificationPermission, 
    handleUnlockAudio, 
    isAudioReady, 
    resetAllAppData 
  } = useAlarmClock();

  const [notificationStatus, setNotificationStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleTestSound = (sound: AlarmSoundType) => {
    handleUnlockAudio();
    previewSound(sound, settings.soundVolume);
  };

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  const handleExportJSON = () => {
    const data = {
      alarms: localStorage.getItem('alarmclock_alarms_v1'),
      stars: localStorage.getItem('alarmclock_stars_v1'),
      sessions: localStorage.getItem('alarmclock_sessions_v1'),
      achievements: localStorage.getItem('alarmclock_achievements_v1'),
      settings: localStorage.getItem('alarmclock_settings_v1'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alarmclock_cosmic_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Cosmic backup JSON exported successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleConfirmReset = () => {
    resetAllAppData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-[#A855F7]" />
          <span>Cosmic Preferences & Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
          Customize audio playback, mission defaults, clock formats, and data persistence.
        </p>
      </div>

      {/* Audio Engine Configuration */}
      <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#7C3AED]/20">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-[#38BDF8]" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              Cosmic Web Audio Engine
            </h2>
          </div>

          <button
            onClick={() => handleUnlockAudio()}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
              isAudioReady
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-[#7C3AED]/30 text-white border-[#7C3AED]'
            }`}
          >
            {isAudioReady ? 'Audio Context Ready' : 'Warm Up Audio Engine'}
          </button>
        </div>

        {/* Volume Slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#CBD5E1] mb-2">
            <span>Synthesizer Master Volume</span>
            <span className="font-mono-clock font-bold text-white">{Math.round(settings.soundVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.soundVolume}
            onChange={e => updateSettings({ soundVolume: parseFloat(e.target.value) })}
            className="w-full accent-[#7C3AED] cursor-pointer"
          />
        </div>

        {/* Default Sound Profile */}
        <div>
          <label className="block text-xs font-semibold text-[#CBD5E1] mb-2">
            Default Synthesized Sound Profile
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'cosmic_chime', name: 'Cosmic Chime' },
              { id: 'pulsar_pulse', name: 'Pulsar Pulse' },
              { id: 'nebula_melody', name: 'Nebula Melody' },
              { id: 'supernova_alert', name: 'Supernova Alert' },
              { id: 'starlight_beacon', name: 'Starlight Beacon' },
            ].map(snd => (
              <div
                key={snd.id}
                onClick={() => updateSettings({ defaultSound: snd.id as AlarmSoundType })}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.defaultSound === snd.id
                    ? 'bg-[#18113A] border-[#38BDF8] text-white shadow-sm'
                    : 'bg-[#0B1026] border-[#7C3AED]/20 text-[#94A3B8] hover:text-white'
                }`}
              >
                <span className="text-xs font-semibold">{snd.name}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleTestSound(snd.id as AlarmSoundType);
                  }}
                  className="p-1 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/20"
                  title="Test Sound"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clock & Display Preferences */}
      <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#7C3AED]/20">
          <Clock className="w-5 h-5 text-[#A855F7]" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Display & Clock Format
          </h2>
        </div>

        <div className="space-y-3">
          {/* 12h vs 24h Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
            <div>
              <div className="text-xs font-semibold text-white">24-Hour Military Time</div>
              <div className="text-[10px] text-[#94A3B8]">Display time in 24h format (e.g., 14:30 instead of 2:30 PM)</div>
            </div>
            <input
              type="checkbox"
              checked={settings.militaryTime24h}
              onChange={e => updateSettings({ militaryTime24h: e.target.checked })}
              className="w-4 h-4 rounded accent-[#7C3AED]"
            />
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
            <div>
              <div className="text-xs font-semibold text-white">Reduced Motion Mode</div>
              <div className="text-[10px] text-[#94A3B8]">Disables starry twinkling canvas and pulsating background loops</div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={e => updateSettings({ reducedMotion: e.target.checked })}
              className="w-4 h-4 rounded accent-[#7C3AED]"
            />
          </div>

          {/* Default Snooze Duration */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
            <div>
              <div className="text-xs font-semibold text-white">Default Snooze Duration</div>
              <div className="text-[10px] text-[#94A3B8]">Standard delay when snooze is triggered</div>
            </div>
            <select
              value={settings.defaultSnoozeMin}
              onChange={e => updateSettings({ defaultSnoozeMin: Number(e.target.value) })}
              className="bg-[#18113A] border border-[#7C3AED]/30 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value={3}>3 Minutes</option>
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Browser Notifications */}
      <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#7C3AED]/20">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#F472B6]" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              System Notifications
            </h2>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            notificationStatus === 'granted'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#18113A] text-[#94A3B8]'
          }`}>
            Status: {notificationStatus}
          </span>
        </div>

        <p className="text-xs text-[#CBD5E1]">
          Allows AlarmClock to trigger system popups when alarms ring or focus sessions finish while you are in another tab.
        </p>

        <button
          onClick={handleToggleNotifications}
          className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[#F472B6]" />
          <span>Request / Test Browser Notification Permission</span>
        </button>
      </div>

      {/* Data Management & Backup */}
      <div className="cosmic-card rounded-3xl p-6 border border-[#7C3AED]/30 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#7C3AED]/20">
          <Download className="w-5 h-5 text-[#10B981]" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Data Management & Storage
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset All App Data</span>
          </button>
        </div>

        {exportNotice && (
          <div className="text-xs text-emerald-400 font-medium animate-fadeIn">
            ✓ {exportNotice}
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="cosmic-card-glow rounded-3xl p-6 max-w-sm w-full border border-red-500/50 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Reset All Cosmic Data?</h3>
            <p className="text-xs text-[#94A3B8]">
              This will erase all custom alarms, focus session history, star rewards, and achievements from LocalStorage.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* College Project Demonstration Info */}
      <div className="p-4 rounded-2xl bg-[#0B1026]/60 border border-[#7C3AED]/20 flex items-start gap-3 text-xs text-[#94A3B8]">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">AlarmClock Project Demonstration:</span> Built using React 19, TypeScript, Tailwind CSS, Web Audio API synthesis (100% offline without external audio files), and persistent Browser LocalStorage.
        </div>
      </div>

    </div>
  );
};
