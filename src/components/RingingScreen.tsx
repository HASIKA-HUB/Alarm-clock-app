/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Alarm, LinkedFocusTask, MissionResult, UserSettings } from '../types/alarm';
import { cosmicAudio } from '../utils/audio';
import { MissionSolver } from './missions/MissionSolver';
import { Bell, BellOff, Clock, ShieldAlert, Sparkles, Volume2, ArrowRight } from 'lucide-react';

interface RingingScreenProps {
  alarm: Alarm;
  settings: UserSettings;
  onDismiss: (alarm: Alarm, missionResult?: MissionResult, startLinkedFocus?: LinkedFocusTask) => void;
  onSnooze: (alarm: Alarm) => void;
}

export const RingingScreen: React.FC<RingingScreenProps> = ({
  alarm,
  settings,
  onDismiss,
  onSnooze,
}) => {
  const [missionSolved, setMissionSolved] = useState(!alarm.missionConfig?.enabled);
  const [completedMissionResult, setCompletedMissionResult] = useState<MissionResult | null>(null);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);

  // Start sound on mount, stop when unmounted or dismissed
  useEffect(() => {
    const stopAudio = cosmicAudio.playAlarmSound(alarm.sound, settings.alarmVolume);
    return () => {
      stopAudio();
    };
  }, [alarm.sound, settings.alarmVolume]);

  const handleMissionSuccess = (attempts: number, timeSpentSeconds: number) => {
    cosmicAudio.stopAlarm();
    setMissionSolved(true);

    const result: MissionResult = {
      id: `mres-${Date.now()}`,
      alarmId: alarm.id,
      alarmLabel: alarm.label,
      missionType: alarm.missionConfig.type,
      difficulty: alarm.missionConfig.difficulty,
      attempts,
      solved: true,
      completedAt: Date.now(),
      timeSpentSeconds,
    };
    setCompletedMissionResult(result);

    // If there is a linked task, show the task prompt immediately
    if (alarm.linkedTask) {
      setShowTaskPrompt(true);
    } else {
      setTimeout(() => {
        onDismiss(alarm, result);
      }, 500);
    }
  };

  const handleDirectStop = () => {
    cosmicAudio.stopAlarm();
    if (alarm.linkedTask) {
      setShowTaskPrompt(true);
    } else {
      onDismiss(alarm);
    }
  };

  const handleStartLinkedFocus = () => {
    if (alarm.linkedTask) {
      onDismiss(alarm, completedMissionResult || undefined, alarm.linkedTask);
    }
  };

  const handleSkipLinkedFocus = () => {
    onDismiss(alarm, completedMissionResult || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050816]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto">
        {/* Pulsing Alarm Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-sky-400 p-1 animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                <Bell className="w-10 h-10 text-pink-400 animate-bounce" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
            </span>
          </div>

          <div className="font-orbitron font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400">
            {alarm.time}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            {alarm.label || 'Cosmic Wake-Up Call'}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-purple-300 font-mono">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sound: {alarm.sound}</span>
          </div>
        </div>

        {/* Linked Task Prompt Screen if Alarm Solved */}
        {showTaskPrompt && alarm.linkedTask ? (
          <div className="glass-panel-glow p-6 md:p-8 rounded-2xl text-center border-purple-500/50 animate-fadeIn">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
              Alarm Dismissed!
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              You linked this alarm to a focus task. Ready to enter hyperspace and earn your star?
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-left mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  {alarm.linkedTask.category}
                </span>
                <span className="text-xs text-sky-300 font-orbitron flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alarm.linkedTask.durationMinutes} min session
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-2">{alarm.linkedTask.name}</h4>
              {alarm.linkedTask.description && (
                <p className="text-xs text-slate-400 mt-1">{alarm.linkedTask.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleStartLinkedFocus}
                className="py-3 px-4 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <span>Launch Focus Timer</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSkipLinkedFocus}
                className="py-3 px-4 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition cursor-pointer"
              >
                Dismiss for Now
              </button>
            </div>
          </div>
        ) : alarm.missionConfig?.enabled && !missionSolved ? (
          /* Mission Solver Required */
          <div>
            <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold tracking-wider uppercase mb-3 bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-full w-max mx-auto">
              <ShieldAlert className="w-4 h-4" />
              <span>Cosmic Security Challenge Active</span>
            </div>

            <MissionSolver
              missionConfig={alarm.missionConfig}
              onSuccess={handleMissionSuccess}
            />

            {alarm.snoozeEnabled && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => onSnooze(alarm)}
                  className="px-5 py-2.5 rounded-xl text-xs font-orbitron tracking-wider text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700 transition"
                >
                  Snooze for {alarm.snoozeDurationMinutes} Minutes
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Standard Dismiss / Snooze Controls */
          <div className="glass-panel p-6 rounded-2xl max-w-md mx-auto text-center border-purple-500/30">
            <p className="text-slate-300 text-sm mb-6">
              Wake up! The cosmos awaits your energy today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDirectStop}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <BellOff className="w-4 h-4" />
                <span>Stop Alarm</span>
              </button>

              {alarm.snoozeEnabled && (
                <button
                  onClick={() => onSnooze(alarm)}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-orbitron font-medium text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition cursor-pointer"
                >
                  Snooze ({alarm.snoozeDurationMinutes}m)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
