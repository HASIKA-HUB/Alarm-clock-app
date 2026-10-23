import React, { useState } from 'react';
import { 
  AlarmClock, 
  Plus, 
  Play, 
  Pencil, 
  Trash2, 
  Brain, 
  Hourglass, 
  Volume2, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { Alarm, formatAlarmSchedule } from '../types/alarmclock';
import { previewSound } from '../utils/audioSynthesizer';

interface MyAlarmsViewProps {
  onOpenCreateAlarm: () => void;
  onOpenEditAlarm: (alarm: Alarm) => void;
}

export const MyAlarmsView: React.FC<MyAlarmsViewProps> = ({ 
  onOpenCreateAlarm, 
  onOpenEditAlarm 
}) => {
  const { 
    alarms, 
    toggleAlarm, 
    deleteAlarm, 
    triggerAlarmTest, 
    handleUnlockAudio, 
    settings 
  } = useAlarmClock();

  const [filter, setFilter] = useState<'all' | 'active' | 'missions'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAlarms = alarms.filter(a => {
    if (filter === 'active') return a.enabled;
    if (filter === 'missions') return a.missionType !== 'none';
    return true;
  });

  const handleTestSound = (alarm: Alarm) => {
    handleUnlockAudio();
    previewSound(alarm.sound, settings.soundVolume);
  };

  const handleDelete = (id: string) => {
    deleteAlarm(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
            <AlarmClock className="w-7 h-7 text-[#A855F7]" />
            <span>My Cosmic Alarms</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Configure alarms with brain-awakening missions and automatic focus links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#0B1026] border border-[#7C3AED]/30">
            {(['all', 'active', 'missions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab === 'missions' ? 'Mission Alarms' : tab}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateAlarm}
            className="cosmic-button-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Alarm</span>
          </button>
        </div>
      </div>

      {/* Alarms Grid / List */}
      {filteredAlarms.length === 0 ? (
        <div className="cosmic-card-glow rounded-3xl p-12 text-center text-[#94A3B8] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#38BDF8]">
            <AlarmClock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Alarms Found</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              {filter === 'all'
                ? "You haven't configured any alarms yet. Add one to test cosmic wakeups!"
                : `No alarms match the "${filter}" filter.`}
            </p>
          </div>
          <button
            onClick={onOpenCreateAlarm}
            className="cosmic-button-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Create Alarm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlarms.map(alarm => {
            const hasMission = alarm.missionType !== 'none';
            const hasFocus = !!alarm.linkedFocusTask;

            return (
              <div
                key={alarm.id}
                className={`cosmic-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all relative ${
                  alarm.enabled
                    ? 'border-[#7C3AED]/40 hover:border-[#A855F7]/70'
                    : 'opacity-60 border-slate-800'
                }`}
              >
                <div>
                  
                  {/* Top Bar: Label & Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-bold text-base text-white tracking-wide">
                        {alarm.label}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#94A3B8]">
                        <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>
                          {formatAlarmSchedule(alarm.days)}
                        </span>
                      </div>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleAlarm(alarm.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        alarm.enabled ? 'bg-[#7C3AED]' : 'bg-[#1E293B]'
                      }`}
                      title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Big Alarm Time */}
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="font-mono-clock text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {alarm.time}
                    </span>
                    <button
                      onClick={() => handleTestSound(alarm)}
                      className="p-1.5 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10 text-xs flex items-center gap-1"
                      title="Preview sound profile"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="text-[11px] font-medium">{alarm.sound.replace('_', ' ')}</span>
                    </button>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-2 my-3">
                    {/* Mission Badge */}
                    {hasMission ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#C4B5FD] text-xs font-semibold">
                        <Brain className="w-3.5 h-3.5 text-[#F472B6]" />
                        <span>Mission: {alarm.missionType} ({alarm.missionDifficulty})</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#64748B]">Standard dismiss</span>
                    )}

                    {/* Snooze Badge */}
                    {alarm.allowSnooze && (
                      <span className="px-2 py-0.5 rounded-lg bg-[#0B1026] text-[#94A3B8] border border-[#7C3AED]/20 text-[11px]">
                        Snooze: {alarm.snoozeDurationMin}m
                      </span>
                    )}

                    {/* Linked Focus Badge */}
                    {hasFocus && alarm.linkedFocusTask && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-semibold">
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>Focus: {alarm.linkedFocusTask.title} ({alarm.linkedFocusTask.durationMinutes}m)</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#7C3AED]/20">
                  {/* Test Ringing Screen Button */}
                  <button
                    onClick={() => triggerAlarmTest(alarm)}
                    className="cosmic-button-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-[#38BDF8] hover:text-white"
                    title="Simulate alarm trigger right now to solve missions"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Ringing Screen</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit */}
                    <button
                      onClick={() => onOpenEditAlarm(alarm)}
                      className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit Alarm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete with Confirmation */}
                    {deleteConfirmId === alarm.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(alarm.id)}
                          className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded-lg bg-[#1E293B] text-[#94A3B8] text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(alarm.id)}
                        className="p-2 rounded-xl text-[#94A3B8] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                        title="Delete Alarm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
