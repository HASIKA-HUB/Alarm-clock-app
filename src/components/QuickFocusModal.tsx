/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FocusSession, TaskCategory } from '../types/alarm';
import { X, Sparkles, Clock, Tag, Play } from 'lucide-react';

interface QuickFocusModalProps {
  onStart: (session: FocusSession) => void;
  onClose: () => void;
}

const CATEGORIES: TaskCategory[] = [
  'Study',
  'Coding',
  'Reading',
  'Work',
  'Creative',
  'Health',
];

export const QuickFocusModal: React.FC<QuickFocusModalProps> = ({ onStart, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Coding');
  const [duration, setDuration] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const newSession: FocusSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      taskName: taskName.trim(),
      description: description.trim() || undefined,
      category,
      plannedDurationMinutes: duration,
      actualDurationSeconds: 0,
      startedAt: Date.now(),
      status: 'in_progress',
      starAwarded: false,
    };

    onStart(newSession);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050816]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel-glow rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl animate-fadeIn">
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-white">Start Focus Session</h3>
              <p className="text-xs text-purple-300/80">Complete session to earn 1 Cosmic Star</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Task Name *
            </label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Master React Concurrency & Hooks"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-purple-400 focus:outline-none text-white text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Write custom hooks and state management"
              className="w-full py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-purple-400 focus:outline-none text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-1.5 rounded-lg text-xs font-orbitron font-semibold transition border ${
                      duration === mins
                        ? 'bg-purple-600/40 border-purple-400 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full py-2 px-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Launch Timer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
