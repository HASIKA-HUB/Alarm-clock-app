/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Alarm,
  AlarmSoundId,
  MissionDifficulty,
  MissionType,
  TaskCategory,
  UserSettings,
} from '../types/alarm';
import { cosmicAudio } from '../utils/audio';
import {
  X,
  Clock,
  Volume2,
  Play,
  RotateCcw,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Tag,
  Check,
} from 'lucide-react';

interface AlarmModalProps {
  alarmToEdit?: Alarm | null;
  settings: UserSettings;
  onSave: (alarm: Alarm) => void;
  onClose: () => void;
}

const SOUND_OPTIONS: { id: AlarmSoundId; label: string; desc: string }[] = [
  { id: 'cosmic-beacon', label: 'Cosmic Beacon', desc: 'Dual frequency radar pulse' },
  { id: 'nebula-pulse', label: 'Nebula Pulse', desc: 'Futuristic synth arpeggio' },
  { id: 'quantum-chime', label: 'Quantum Chime', desc: 'Ethereal crystal bells' },
  { id: 'starlight-radar', label: 'Starlight Radar', desc: 'Pulsing celestial sonar' },
  { id: 'pulsar-alarm', label: 'Pulsar Alarm', desc: 'Urgent rhythmic wake-up' },
];

const DAYS_OF_WEEK = [
  { day: 0, label: 'Sun', short: 'S' },
  { day: 1, label: 'Mon', short: 'M' },
  { day: 2, label: 'Tue', short: 'T' },
  { day: 3, label: 'Wed', short: 'W' },
  { day: 4, label: 'Thu', short: 'T' },
  { day: 5, label: 'Fri', short: 'F' },
  { day: 6, label: 'Sat', short: 'S' },
];

const TASK_CATEGORIES: TaskCategory[] = [
  'Study',
  'Coding',
  'Reading',
  'Work',
  'Creative',
  'Health',
];

export const AlarmModal: React.FC<AlarmModalProps> = ({
  alarmToEdit,
  settings,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(alarmToEdit);

  // Form State
  const [time, setTime] = useState<string>(alarmToEdit?.time || '07:30');
  const [label, setLabel] = useState<string>(alarmToEdit?.label || '');
  const [repeatDays, setRepeatDays] = useState<number[]>(alarmToEdit?.repeatDays || [1, 2, 3, 4, 5]);
  const [sound, setSound] = useState<AlarmSoundId>(alarmToEdit?.sound || 'cosmic-beacon');
  const [snoozeEnabled, setSnoozeEnabled] = useState<boolean>(alarmToEdit?.snoozeEnabled ?? true);
  const [snoozeDurationMinutes, setSnoozeDurationMinutes] = useState<number>(
    alarmToEdit?.snoozeDurationMinutes ?? settings.defaultSnoozeMinutes
  );

  // Mission State
  const [missionEnabled, setMissionEnabled] = useState<boolean>(
    alarmToEdit?.missionConfig?.enabled ?? true
  );
  const [missionType, setMissionType] = useState<MissionType>(
    alarmToEdit?.missionConfig?.type ?? settings.defaultMissionType
  );
  const [missionDifficulty, setMissionDifficulty] = useState<MissionDifficulty>(
    alarmToEdit?.missionConfig?.difficulty ?? settings.defaultMissionDifficulty
  );

  // Linked Task State
  const [linkTaskEnabled, setLinkTaskEnabled] = useState<boolean>(
    Boolean(alarmToEdit?.linkedTask)
  );
  const [taskName, setTaskName] = useState<string>(alarmToEdit?.linkedTask?.name || '');
  const [taskDesc, setTaskDesc] = useState<string>(alarmToEdit?.linkedTask?.description || '');
  const [taskDuration, setTaskDuration] = useState<number>(
    alarmToEdit?.linkedTask?.durationMinutes || 25
  );
  const [taskCategory, setTaskCategory] = useState<TaskCategory>(
    alarmToEdit?.linkedTask?.category || 'Study'
  );

  const [previewingSound, setPreviewingSound] = useState<AlarmSoundId | null>(null);

  const handleToggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSetEveryday = () => {
    setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const handleSetWeekdays = () => {
    setRepeatDays([1, 2, 3, 4, 5]);
  };

  const handleSetOnce = () => {
    setRepeatDays([]);
  };

  const handlePreviewSound = (s: AlarmSoundId) => {
    setPreviewingSound(s);
    cosmicAudio.previewSound(s, settings.alarmVolume, 2500);
    setTimeout(() => {
      setPreviewingSound(null);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlarm: Alarm = {
      id: alarmToEdit?.id || `alarm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: label.trim() || 'Cosmic Alarm',
      time,
      isEnabled: true,
      repeatDays,
      sound,
      snoozeEnabled,
      snoozeDurationMinutes,
      missionConfig: {
        enabled: missionEnabled,
        type: missionType,
        difficulty: missionDifficulty,
      },
      linkedTask: linkTaskEnabled && taskName.trim()
        ? {
            name: taskName.trim(),
            description: taskDesc.trim() || undefined,
            durationMinutes: Number(taskDuration) || 25,
            category: taskCategory,
          }
        : undefined,
      createdAt: alarmToEdit?.createdAt || Date.now(),
      lastTriggeredDate: alarmToEdit?.lastTriggeredDate,
    };

    onSave(newAlarm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050816]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-6 glass-panel-glow rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-orbitron font-bold text-white">
                {isEditing ? 'Edit Cosmic Alarm' : 'Create Cosmic Alarm'}
              </h2>
              <p className="text-xs text-purple-300/80">Configure schedule, mission, & focus task</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Time Picker */}
          <div className="text-center py-4 px-6 rounded-2xl bg-slate-950/70 border border-purple-500/30">
            <label className="block text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
              Alarm Time (24h)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="font-orbitron font-black text-4xl md:text-5xl bg-transparent text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Alarm Label */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">
              Alarm Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Deep Study Horizon, Morning Ignition"
              className="w-full py-3 px-4 rounded-xl bg-slate-900/70 border border-slate-700/80 focus:border-purple-400 focus:outline-none text-white text-sm"
            />
          </div>

          {/* Repeat Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Repeat Schedule
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleSetWeekdays}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:text-purple-300 transition"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={handleSetEveryday}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:text-purple-300 transition"
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={handleSetOnce}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:text-purple-300 transition"
                >
                  One-time
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((item) => {
                const isSelected = repeatDays.includes(item.day);
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => handleToggleDay(item.day)}
                    className={`h-11 rounded-xl font-orbitron text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600/40 text-white border-purple-400 shadow-sm shadow-purple-500/30'
                        : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{item.short}</span>
                    <span className="text-[9px] font-normal opacity-70">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {repeatDays.length === 0
                ? 'One-time alarm (rings once, then auto-disables)'
                : repeatDays.length === 7
                ? 'Repeats everyday'
                : `Repeats on ${repeatDays.map((d) => DAYS_OF_WEEK.find((x) => x.day === d)?.label).join(', ')}`}
            </p>
          </div>

          {/* Sound & Snooze Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sound Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">
                Cosmic Alarm Sound
              </label>
              <div className="space-y-1.5">
                {SOUND_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSound(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      sound === item.id
                        ? 'bg-purple-950/60 border-purple-400 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-orbitron">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewSound(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition"
                      title="Preview sound"
                    >
                      {previewingSound === item.id ? (
                        <Volume2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Snooze Config */}
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold">
                Snooze Controls
              </label>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-medium">Allow Snooze</span>
                  <input
                    type="checkbox"
                    checked={snoozeEnabled}
                    onChange={(e) => setSnoozeEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {snoozeEnabled && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Snooze Duration (minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[3, 5, 10, 15].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setSnoozeDurationMinutes(mins)}
                          className={`py-1.5 rounded-lg text-xs font-orbitron font-semibold transition border ${
                            snoozeDurationMinutes === mins
                              ? 'bg-purple-600/40 border-purple-400 text-white'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NOVELTY FEATURE 1: Mission-Based Dismissal */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-orbitron font-bold text-white">
                    Mission-Based Alarm Dismissal
                  </h4>
                  <p className="text-[11px] text-purple-300/80">
                    Solve a challenge to wake up and dismiss the alarm
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={missionEnabled}
                onChange={(e) => setMissionEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            {missionEnabled && (
              <div className="space-y-3 pt-2 border-t border-purple-500/20">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Mission Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'math', label: 'Math Puzzle', desc: 'Arithmetic challenge' },
                      { id: 'memory', label: 'Memory Grid', desc: 'Cosmic recall' },
                      { id: 'sequence', label: 'Sequence', desc: 'Pattern solver' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMissionType(m.id as MissionType)}
                        className={`p-2 rounded-xl text-left border transition ${
                          missionType === m.id
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm shadow-purple-500/20'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold font-orbitron">{m.label}</div>
                        <div className="text-[10px] text-slate-400">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setMissionDifficulty(d)}
                        className={`py-1.5 rounded-lg text-xs font-orbitron font-semibold uppercase tracking-wider transition border ${
                          missionDifficulty === d
                            ? 'bg-purple-600/40 border-purple-400 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NOVELTY FEATURE 2: Focus-Linked Alarm */}
          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div>
                  <h4 className="text-sm font-orbitron font-bold text-white">
                    Link to Focus Task (+1 ⭐ Reward)
                  </h4>
                  <p className="text-[11px] text-sky-300/80">
                    Immediately launch a planned study or work session upon wake up
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={linkTaskEnabled}
                onChange={(e) => setLinkTaskEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
            </div>

            {linkTaskEnabled && (
              <div className="space-y-3 pt-2 border-t border-sky-500/20">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    required={linkTaskEnabled}
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="e.g. Distributed Systems Revision"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-sky-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="e.g. Complete chapter 4 problems and practice quiz"
                    className="w-full py-2 px-3.5 rounded-xl bg-slate-900/80 border border-slate-700 focus:border-sky-400 focus:outline-none text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                      Duration
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[15, 25, 45, 60].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setTaskDuration(dur)}
                          className={`py-1.5 rounded-lg text-xs font-orbitron font-semibold transition border ${
                            taskDuration === dur
                              ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dur}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-400"
                    >
                      {TASK_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Alarm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
