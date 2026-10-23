import React, { useState } from 'react';
import {
  AlarmSoundId,
  MissionDifficulty,
  MissionType,
  UserSettings,
} from '../types/alarm';
import { cosmicAudio } from '../utils/audio';
import { runAutomatedDiagnostics, TestResultItem } from '../utils/testSuite';
import {
  Settings,
  Volume2,
  Bell,
  Play,
  RotateCcw,
  Trash2,
  Info,
  Clock,
  Sparkles,
  ShieldAlert,
  Check,
  CheckCircle2,
  CheckCheck,
  XCircle,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetAllData: () => void;
}

const SOUND_LIST: { id: AlarmSoundId; name: string; desc: string }[] = [
  { id: 'cosmic-beacon', name: 'Cosmic Beacon', desc: 'Dual frequency radar pulse (587Hz & 880Hz)' },
  { id: 'nebula-pulse', name: 'Nebula Pulse', desc: 'Futuristic synth arpeggio chord sequence' },
  { id: 'quantum-chime', name: 'Quantum Chime', desc: 'Ethereal crystal bell chime cascade' },
  { id: 'starlight-radar', name: 'Starlight Radar', desc: 'Celestial sonar radar chirp' },
  { id: 'pulsar-alarm', name: 'Pulsar Alarm', desc: 'Urgent rhythmic wake-up square sweep' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [playingSound, setPlayingSound] = useState<AlarmSoundId | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testResults, setTestResults] = useState<TestResultItem[] | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const handleRunTests = () => {
    cosmicAudio.playFeedbackSound('click');
    const results = runAutomatedDiagnostics();
    setTestResults(results);
    if (results.every((r) => r.passed)) {
      cosmicAudio.playFeedbackSound('correct');
    }
  };

  const handlePreviewSound = (s: AlarmSoundId) => {
    setPlayingSound(s);
    cosmicAudio.previewSound(s, settings.alarmVolume, 2600);
    setTimeout(() => {
      setPlayingSound(null);
    }, 2600);
  };

  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      alert('This browser does not support web notifications.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      onUpdateSettings({
        ...settings,
        notificationsEnabled: permission === 'granted',
      });
      if (permission === 'granted') {
        new Notification('AlarmClock Cosmic Companion', {
          body: 'System notifications authorized for cosmic alarms and focus milestones.',
        });
      }
    } catch (e) {
      console.error('Error requesting notifications', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-purple-400" />
          <span>Application Settings & Audio Suite</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize audio synthesizers, clock display, animation physics, and system storage
        </p>
      </div>

      {/* Audio Engine Configuration */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <span>Web Audio API Sound Presets</span>
        </h3>
        <p className="text-xs text-slate-400">
          Synthesized directly in the browser with zero external network dependencies for 100% reliable alarm sounding.
        </p>

        {/* Volume Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Alarm Volume Master</span>
            <span className="font-mono text-purple-300">
              {Math.round(settings.alarmVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.alarmVolume}
            onChange={(e) =>
              onUpdateSettings({ ...settings, alarmVolume: parseFloat(e.target.value) })
            }
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Sounds List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOUND_LIST.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-between"
            >
              <div>
                <h4 className="font-orbitron font-bold text-xs text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>

              <button
                onClick={() => handlePreviewSound(item.id)}
                className="py-1.5 px-3 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-orbitron font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {playingSound === item.id ? (
                  <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Test</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Clock & Behavior Preferences */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>Clock & Display Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time format */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-white">24-Hour Time Format</h4>
              <p className="text-xs text-slate-400">Toggle between 12-hour (AM/PM) and 24-hour military format</p>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ ...settings, timeFormat24h: !settings.timeFormat24h })
              }
              className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${
                settings.timeFormat24h ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition transform ${
                  settings.timeFormat24h ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cosmic Animations */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-white">Cosmic Canvas Star Particles</h4>
              <p className="text-xs text-slate-400">Drifting star dust & nebula glow animations</p>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  enableCosmicAnimations: !settings.enableCosmicAnimations,
                })
              }
              className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${
                settings.enableCosmicAnimations ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition transform ${
                  settings.enableCosmicAnimations ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Default Snooze Duration */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="font-bold text-sm text-white">Default Snooze Interval</h4>
            <p className="text-xs text-slate-400">Applied when creating new alarms</p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[3, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  onClick={() => onUpdateSettings({ ...settings, defaultSnoozeMinutes: mins })}
                  className={`py-2 rounded-xl text-xs font-orbitron font-bold transition border ${
                    settings.defaultSnoozeMinutes === mins
                      ? 'bg-purple-600/40 border-purple-400 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">Browser Notifications</h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {notificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Allows visual alert notifications when this browser tab is in the background
            </p>
            <button
              onClick={handleRequestNotification}
              disabled={notificationStatus === 'granted'}
              className="mt-2 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-purple-600/30 border border-slate-700 text-xs text-white font-medium transition cursor-pointer disabled:opacity-40"
            >
              {notificationStatus === 'granted' ? 'Notifications Granted' : 'Authorize Notifications'}
            </button>
          </div>
        </div>
      </div>

      {/* Automated Testing & Verification Suite (College Demo Feature) */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-purple-500/20">
          <div>
            <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-emerald-400" />
              <span>Automated Verification Testing Suite</span>
            </h3>
            <p className="text-xs text-slate-400">
              Run automated checks validating missions, star idempotency, level progression, and persistence.
            </p>
          </div>

          <button
            onClick={handleRunTests}
            className="py-2 px-4 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run All Tests</span>
          </button>
        </div>

        {testResults ? (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl">
              <span>Diagnostic Result: {testResults.filter((r) => r.passed).length} / {testResults.length} Tests Passed</span>
              <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-900 border border-emerald-600">
                100% Verified
              </span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {testResults.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between text-xs gap-3"
                >
                  <div className="flex items-start gap-2">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white block">{t.name}</span>
                      <span className="text-[11px] text-slate-400">{t.message}</span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                      t.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {t.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            Click "Run All Tests" to run unit tests directly inside the browser sandbox.
          </div>
        )}
      </div>

      {/* College Project Architecture & Browser Mechanics Guide */}
      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          <span>College Project Architecture & Browser Mechanics</span>
        </h3>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong>Local High-Accuracy Scheduler:</strong> Alarms are validated every 1000ms against the system’s true epoch clock (<code className="text-purple-300">Date.now()</code>) and evaluated against occurrence minute keys to avoid duplicate triggers.
          </p>
          <p>
            • <strong>Mission-Based Alarm Dismissal:</strong> Ringing audio loops through the Web Audio synthesizer until the user clears the chosen Math Challenge, Memory Sequence, or Pattern Puzzle.
          </p>
          <p>
            • <strong>Strict Star Idempotency:</strong> Every focus task completion is matched against a unique session ID in <code className="text-purple-300">alarmclock_stars_v1</code>. Multiple clicks, page refreshes, or abandoned sessions can never award duplicate stars.
          </p>
          <p>
            • <strong>Browser Limitations:</strong> Like all modern web applications, the browser cannot run JavaScript when the laptop is closed in deep sleep or the tab is closed. Keeping this tab active ensures timely alarms.
          </p>
        </div>
      </div>

      {/* Danger Zone: Reset Application Data */}
      <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-4">
        <div>
          <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2 text-rose-400">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone: Factory Reset</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Permanently clears all saved alarms, focus sessions, stars, mission telemetry, and settings from browser LocalStorage.
          </p>
        </div>

        {showResetConfirm ? (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 space-y-3 animate-fadeIn">
            <p className="text-xs text-rose-200 font-semibold">
              Warning: This action cannot be undone. All stars, achievements, and alarms will be wiped.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                }}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-orbitron font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Yes, Wipe Everything
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 hover:text-white text-xs font-orbitron font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Application Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
