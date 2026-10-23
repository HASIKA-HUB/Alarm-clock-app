/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Alarm } from '../types/alarm';
import {
  Clock,
  PlusCircle,
  BrainCircuit,
  Sparkles,
  Edit2,
  Trash2,
  Zap,
  Volume2,
  Calendar,
  Filter,
} from 'lucide-react';

interface MyAlarmsViewProps {
  alarms: Alarm[];
  onToggleAlarm: (id: string) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onDeleteAlarm: (id: string) => void;
  onOpenCreateAlarm: () => void;
  onTestSpecificAlarm: (alarm: Alarm) => void;
}

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MyAlarmsView: React.FC<MyAlarmsViewProps> = ({
  alarms,
  onToggleAlarm,
  onEditAlarm,
  onDeleteAlarm,
  onOpenCreateAlarm,
  onTestSpecificAlarm,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'missions' | 'linked'>('all');
  const [alarmToDelete, setAlarmToDelete] = useState<Alarm | null>(null);

  const filteredAlarms = alarms.filter((a) => {
    if (filter === 'active') return a.isEnabled;
    if (filter === 'missions') return a.missionConfig?.enabled;
    if (filter === 'linked') return Boolean(a.linkedTask);
    return true;
  });

  const formatRepeatDays = (days: number[]) => {
    if (days.length === 0) return 'One-time alarm';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays (Mon-Fri)';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends (Sat-Sun)';
    return days.map((d) => DAYS_MAP[d]).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-purple-400" />
            <span>My Cosmic Alarms</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your scheduled wake-up routines, mission challenges, and study tasks
          </p>
        </div>

        <button
          onClick={onOpenCreateAlarm}
          className="py-2.5 px-5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Alarm</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>

        {[
          { id: 'all', label: `All (${alarms.length})` },
          { id: 'active', label: `Active (${alarms.filter((a) => a.isEnabled).length})` },
          { id: 'missions', label: 'With Missions' },
          { id: 'linked', label: 'Focus-Linked' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`py-1 px-3 rounded-lg text-xs font-medium transition cursor-pointer border ${
              filter === tab.id
                ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alarms Cards Grid */}
      {filteredAlarms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`p-5 rounded-2xl transition border glass-card-interactive ${
                alarm.isEnabled
                  ? 'glass-panel border-purple-500/30 hover:border-purple-500/60'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-70'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-orbitron font-black text-3xl md:text-4xl text-white tracking-wider">
                      {alarm.time}
                    </span>
                    <span className="text-xs font-mono text-purple-300">
                      {alarm.repeatDays.length === 0 ? '1-time' : 'Repeat'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{alarm.label}</h3>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => onToggleAlarm(alarm.id)}
                  title={alarm.isEnabled ? 'Disable alarm' : 'Enable alarm'}
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${
                    alarm.isEnabled ? 'bg-purple-600 shadow-md shadow-purple-600/40' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition transform ${
                      alarm.isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Repeat Days & Sound */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{formatRepeatDays(alarm.repeatDays)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{alarm.sound}</span>
                </div>
              </div>

              {/* Feature Tags (Mission & Focus Link) */}
              <div className="space-y-2 mb-4">
                {alarm.missionConfig?.enabled ? (
                  <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-purple-200">
                        Mission: {alarm.missionConfig.type.toUpperCase()} ({alarm.missionConfig.difficulty})
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-mono">Solve to dismiss</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 font-mono">
                    Standard Dismissal (No challenge)
                  </div>
                )}

                {alarm.linkedTask ? (
                  <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                      <span className="font-semibold text-sky-200 truncate">
                        Linked: {alarm.linkedTask.name} ({alarm.linkedTask.durationMinutes}m)
                      </span>
                    </div>
                    <span className="text-[10px] text-yellow-300 font-mono shrink-0">+1 ⭐</span>
                  </div>
                ) : null}
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onTestSpecificAlarm(alarm)}
                  className="py-1.5 px-3 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-orbitron font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Test how this specific alarm rings with its sound and mission"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Test Ring</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditAlarm(alarm)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Edit alarm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAlarmToDelete(alarm)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Delete alarm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl glass-panel border-purple-500/20">
          <Clock className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
          <h3 className="font-orbitron font-bold text-lg text-white">No Alarms Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {filter !== 'all'
              ? 'No alarms match the selected filter. Try switching back to All.'
              : 'You have not set any cosmic alarms yet. Build your first wake-up mission!'}
          </p>
          <button
            onClick={onOpenCreateAlarm}
            className="py-2.5 px-5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 cursor-pointer transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Alarm</span>
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {alarmToDelete && (
        <div className="fixed inset-0 z-50 bg-[#050816]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel-glow p-6 rounded-2xl border-rose-500/40 text-center animate-fadeIn">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h4 className="font-orbitron font-bold text-lg text-white">Delete Alarm?</h4>
            <p className="text-xs text-slate-300 mt-2 mb-5">
              Are you sure you want to delete <strong>"{alarmToDelete.label}"</strong> ({alarmToDelete.time})?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onDeleteAlarm(alarmToDelete.id);
                  setAlarmToDelete(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-orbitron uppercase tracking-wider transition cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setAlarmToDelete(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
