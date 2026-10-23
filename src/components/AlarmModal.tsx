import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Clock, 
  Brain, 
  Sparkles, 
  Hourglass, 
  Check, 
  Play, 
  HelpCircle 
} from 'lucide-react';
import { 
  Alarm, 
  AlarmSoundType, 
  MissionType, 
  MissionDifficulty, 
  FocusCategory 
} from '../types/alarmclock';
import { previewSound } from '../utils/audioSynthesizer';
import { useAlarmClock } from '../context/AlarmClockContext';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarmToEdit?: Alarm | null;
}

const SOUND_OPTIONS: { id: AlarmSoundType; name: string; desc: string }[] = [
  { id: 'cosmic_chime', name: 'Cosmic Chime', desc: 'Celestial pentatonic shimmering bells' },
  { id: 'pulsar_pulse', name: 'Pulsar Pulse', desc: 'Rhythmic cosmic filter sweeps' },
  { id: 'nebula_melody', name: 'Nebula Melody', desc: 'Ascending astral arpeggio with vibrato' },
  { id: 'supernova_alert', name: 'Supernova Alert', desc: 'Energetic space fanfare alert' },
  { id: 'starlight_beacon', name: 'Starlight Beacon', desc: 'Deep cosmic radar harmonic bell' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const QUICK_LABELS = [
  'Deep Space Wakeup',
  'Morning Focus Sprint',
  'Astral Study Session',
  'Code Deployment Orbit',
  'Power Recharge',
];

export const AlarmModal: React.FC<AlarmModalProps> = ({ isOpen, onClose, alarmToEdit }) => {
  const { addAlarm, updateAlarm, settings, handleUnlockAudio } = useAlarmClock();

  // Initial values
  const defaultHour = new Date().getHours();
  const defaultMin = (Math.floor(new Date().getMinutes() / 5) * 5 + 5) % 60;
  const initialTimeStr = `${String(defaultHour).padStart(2, '0')}:${String(defaultMin).padStart(2, '0')}`;

  const [time, setTime] = useState<string>(alarmToEdit ? alarmToEdit.time : initialTimeStr);
  const [label, setLabel] = useState<string>(alarmToEdit ? alarmToEdit.label : 'Cosmic Wakeup');
  const [selectedDays, setSelectedDays] = useState<number[]>(
    alarmToEdit ? (Array.isArray(alarmToEdit.days) ? alarmToEdit.days : []) : [1, 2, 3, 4, 5]
  );
  const [sound, setSound] = useState<AlarmSoundType>(alarmToEdit ? alarmToEdit.sound : settings.defaultSound);
  const [allowSnooze, setAllowSnooze] = useState<boolean>(alarmToEdit ? alarmToEdit.allowSnooze : true);
  const [snoozeDurationMin, setSnoozeDurationMin] = useState<number>(alarmToEdit ? alarmToEdit.snoozeDurationMin : 5);
  const [missionType, setMissionType] = useState<MissionType>(alarmToEdit ? alarmToEdit.missionType : 'math');
  const [missionDifficulty, setMissionDifficulty] = useState<MissionDifficulty>(alarmToEdit ? alarmToEdit.missionDifficulty : 'medium');

  // Focus link
  const [enableFocusLink, setEnableFocusLink] = useState<boolean>(!!alarmToEdit?.linkedFocusTask);
  const [focusTitle, setFocusTitle] = useState<string>(alarmToEdit?.linkedFocusTask?.title || 'Morning Coding Sprint');
  const [focusCategory, setFocusCategory] = useState<FocusCategory>(alarmToEdit?.linkedFocusTask?.category || 'Coding');
  const [focusDuration, setFocusDuration] = useState<number>(alarmToEdit?.linkedFocusTask?.durationMinutes || 25);

  if (!isOpen) return null;

  const toggleDay = (dayVal: number) => {
    setSelectedDays(prev => 
      prev.includes(dayVal) ? prev.filter(d => d !== dayVal) : [...prev, dayVal]
    );
  };

  const handleTestSound = (snd: AlarmSoundType) => {
    handleUnlockAudio();
    previewSound(snd, settings.soundVolume);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const alarmPayload = {
      label: label.trim() || 'Cosmic Alarm',
      time,
      days: selectedDays,
      enabled: true,
      sound,
      snoozeDurationMin,
      allowSnooze,
      missionType,
      missionDifficulty,
      linkedFocusTask: enableFocusLink
        ? {
            id: `task_${Date.now()}`,
            title: focusTitle.trim() || 'Cosmic Focus Session',
            category: focusCategory,
            durationMinutes: focusDuration,
          }
        : undefined,
    };

    if (alarmToEdit) {
      updateAlarm(alarmToEdit.id, alarmPayload);
    } else {
      addAlarm(alarmPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl cosmic-card-glow rounded-2xl p-6 shadow-2xl border border-[#7C3AED]/40 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#7C3AED]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C3AED]/20 text-[#A855F7] border border-[#7C3AED]/30">
              <Clock className="w-5 h-5 text-[#38BDF8]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">
                {alarmToEdit ? 'Edit Cosmic Alarm' : 'Set New Cosmic Alarm'}
              </h2>
              <p className="text-xs text-[#94A3B8]">Configure timing, missions, and linked focus tasks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Time Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4B5FD] mb-1.5">
              Alarm Time (24h or Local)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full text-center font-mono-clock text-3xl font-extrabold tracking-wider bg-[#0B1026] text-white border border-[#7C3AED]/40 rounded-xl py-3 px-4 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
              />
            </div>
          </div>

          {/* Alarm Label */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4B5FD] mb-1.5">
              Alarm Label
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Deep Space Wakeup"
              maxLength={40}
              className="w-full bg-[#0B1026] border border-[#7C3AED]/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A855F7]"
            />
            
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_LABELS.map(lbl => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setLabel(lbl)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-[#18113A] hover:bg-[#7C3AED]/30 text-[#C4B5FD] border border-[#7C3AED]/20 transition-colors cursor-pointer"
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#C4B5FD]">
                Repeat Schedule
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDays([1, 2, 3, 4, 5])}
                  className="text-[11px] text-[#38BDF8] hover:underline"
                >
                  Weekdays
                </button>
                <span className="text-[#64748B] text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays([0, 6])}
                  className="text-[11px] text-[#38BDF8] hover:underline"
                >
                  Weekends
                </button>
                <span className="text-[#64748B] text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays([])}
                  className="text-[11px] text-[#F472B6] hover:underline"
                >
                  Once
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map(d => {
                const isSelected = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white border-[#C4B5FD]/40 shadow-sm shadow-[#7C3AED]/30'
                        : 'bg-[#0B1026] text-[#94A3B8] border-[#7C3AED]/20 hover:border-[#7C3AED]/40 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-[11px] text-[#94A3B8] mt-1.5 italic">
                * One-time alarm: will automatically disable after ringing once.
              </p>
            )}
          </div>

          {/* Sound Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#C4B5FD]">
                Cosmic Sound Profile
              </label>
              <button
                type="button"
                onClick={() => handleTestSound(sound)}
                className="flex items-center gap-1 text-xs text-[#38BDF8] hover:text-[#7DD3FC]"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Selected Sound</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {SOUND_OPTIONS.map(snd => {
                const isSelected = sound === snd.id;
                return (
                  <div
                    key={snd.id}
                    onClick={() => setSound(snd.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18113A] border-[#A855F7] text-white'
                        : 'bg-[#0B1026]/70 border-[#7C3AED]/20 text-[#94A3B8] hover:border-[#7C3AED]/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#38BDF8] bg-[#38BDF8]' : 'border-[#64748B]'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{snd.name}</div>
                        <div className="text-[10px] text-[#94A3B8]">{snd.desc}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleTestSound(snd.id);
                      }}
                      className="p-1 rounded-md text-[#38BDF8] hover:bg-[#38BDF8]/10"
                      title="Preview sound"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mission-Based Alarm Selector (Novelty Feature 1) */}
          <div className="p-3.5 rounded-xl bg-[#140F2D]/90 border border-[#A855F7]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#A855F7]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Novelty Feature: Wake-up Mission
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/20 text-[#F472B6] border border-[#A855F7]/40 font-semibold">
                Guaranteed Awake
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1]">
              Solve a mental challenge to dismiss the ringing alarm. Ensures you don't fall back asleep accidentally!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'math', label: 'Math Puzzle', icon: '123' },
                { id: 'memory', label: 'Memory Recall', icon: '★7◆' },
                { id: 'sequence', label: 'Pattern Puzzle', icon: '2,4,?' },
                { id: 'none', label: 'Standard (None)', icon: '—' },
              ].map(m => {
                const isSelected = missionType === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMissionType(m.id as MissionType)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED]/30 border-[#38BDF8] text-white shadow-sm'
                        : 'bg-[#0B1026] border-[#7C3AED]/20 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-[#38BDF8]">{m.icon}</div>
                    <div className="text-[11px] font-semibold mt-0.5">{m.label}</div>
                  </button>
                );
              })}
            </div>

            {missionType !== 'none' && (
              <div className="flex items-center justify-between pt-2 border-t border-[#7C3AED]/20">
                <span className="text-xs text-[#C4B5FD] font-medium">Difficulty Level:</span>
                <div className="flex items-center gap-1.5">
                  {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setMissionDifficulty(diff)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize font-semibold transition-all border ${
                        missionDifficulty === diff
                          ? 'bg-[#A855F7] text-white border-white/30'
                          : 'bg-[#0B1026] text-[#94A3B8] border-[#7C3AED]/20 hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Snooze Options */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1026] border border-[#7C3AED]/20">
            <div>
              <div className="text-xs font-semibold text-white">Enable Snooze</div>
              <div className="text-[10px] text-[#94A3B8]">Allows temporary delay before next ring</div>
            </div>

            <div className="flex items-center gap-3">
              {allowSnooze && (
                <select
                  value={snoozeDurationMin}
                  onChange={e => setSnoozeDurationMin(Number(e.target.value))}
                  className="bg-[#18113A] border border-[#7C3AED]/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value={3}>3 Minutes</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={allowSnooze}
                onChange={e => setAllowSnooze(e.target.checked)}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] accent-[#7C3AED]"
              />
            </div>
          </div>

          {/* Novelty Feature 2: Link to Focus Session */}
          <div className="p-3.5 rounded-xl bg-[#0E1726]/80 border border-[#38BDF8]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Novelty Feature: Link to Focus Task
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableFocusLink}
                onChange={e => setEnableFocusLink(e.target.checked)}
                className="w-4 h-4 rounded accent-[#38BDF8]"
              />
            </div>

            <p className="text-xs text-[#94A3B8]">
              Automatically prompt to launch a focused deep-work timer upon dismissing this alarm.
            </p>

            {enableFocusLink && (
              <div className="space-y-2 pt-2 border-t border-[#38BDF8]/20">
                <input
                  type="text"
                  value={focusTitle}
                  onChange={e => setFocusTitle(e.target.value)}
                  placeholder="Task Title (e.g. Morning Coding Sprint)"
                  className="w-full bg-[#050816] border border-[#38BDF8]/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Category</label>
                    <select
                      value={focusCategory}
                      onChange={e => setFocusCategory(e.target.value as FocusCategory)}
                      className="w-full bg-[#050816] border border-[#38BDF8]/30 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Study">Study</option>
                      <option value="Coding">Coding</option>
                      <option value="Reading">Reading</option>
                      <option value="Work">Work</option>
                      <option value="Creative">Creative</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#94A3B8] block mb-1">Duration</label>
                    <select
                      value={focusDuration}
                      onChange={e => setFocusDuration(Number(e.target.value))}
                      className="w-full bg-[#050816] border border-[#38BDF8]/30 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={25}>25 Minutes (Pomodoro)</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#7C3AED]/20">
            <button
              type="button"
              onClick={onClose}
              className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cosmic-button-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{alarmToEdit ? 'Save Changes' : 'Create Alarm'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
