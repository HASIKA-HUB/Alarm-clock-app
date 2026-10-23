/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FocusSession } from '../types/alarm';
import { cosmicAudio } from '../utils/audio';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface FocusTimerProps {
  session: FocusSession;
  onComplete: (session: FocusSession, actualDurationSeconds: number) => void;
  onCancel: (session: FocusSession, actualDurationSeconds: number) => void;
  onClose?: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  session,
  onComplete,
  onCancel,
  onClose,
}) => {
  const plannedSeconds = session.plannedDurationMinutes * 60;
  
  // Accumulated active focus seconds (persists across pause/resume)
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(session.actualDurationSeconds || 0);
  const [isRunning, setIsRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hasPromptedZero, setHasPromptedZero] = useState(false);

  // Accurate timestamp tracking
  const lastTickTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    lastTickTimeRef.current = Date.now();
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      setAccumulatedSeconds((prev) => {
        const nextVal = prev + deltaSeconds;
        // Check zero threshold chime
        if (nextVal >= plannedSeconds && !hasPromptedZero) {
          setHasPromptedZero(true);
          cosmicAudio.playFeedbackSound('timer-complete');
        }
        return nextVal;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, plannedSeconds, hasPromptedZero]);

  const togglePlayPause = () => {
    cosmicAudio.playFeedbackSound('click');
    setIsRunning((prev) => !prev);
  };

  const handleMarkComplete = () => {
    setIsRunning(false);
    const finalSeconds = Math.round(accumulatedSeconds);
    onComplete(session, finalSeconds);
  };

  const handleConfirmCancel = () => {
    setIsRunning(false);
    const finalSeconds = Math.round(accumulatedSeconds);
    onCancel(session, finalSeconds);
  };

  // Time calculations
  const remainingSeconds = Math.max(0, plannedSeconds - accumulatedSeconds);
  const displayRemainMin = Math.floor(remainingSeconds / 60);
  const displayRemainSec = Math.floor(remainingSeconds % 60);

  const displayElapsedMin = Math.floor(accumulatedSeconds / 60);
  const displayElapsedSec = Math.floor(accumulatedSeconds % 60);

  const progressFraction = Math.min(1, accumulatedSeconds / plannedSeconds);
  const progressPercent = Math.round(progressFraction * 100);

  // SVG Circular Ring parameters
  const size = isFullscreen ? 320 : 260;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#050816]/98 flex flex-col items-center justify-center p-6'
          : 'w-full max-w-xl mx-auto glass-panel-glow p-6 md:p-8 rounded-3xl text-white relative'
      }`}
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-600/40 flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            {session.category}
          </span>
          {accumulatedSeconds >= plannedSeconds && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              Goal Reached!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && !isFullscreen && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              title="Close View"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold font-space text-white tracking-tight">
          {session.taskName}
        </h2>
        {session.description && (
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 line-clamp-2">
            {session.description}
          </p>
        )}
      </div>

      {/* Circular Cosmic Timer Ring */}
      <div className="relative flex items-center justify-center my-4">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#F472B6" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Glowing Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#cosmicGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-1">
            {remainingSeconds > 0 ? 'Remaining Time' : 'Overtime Elapsed'}
          </span>
          <div className="font-orbitron font-black text-4xl md:text-5xl text-white tracking-wider">
            {String(displayRemainMin).padStart(2, '0')}:{String(displayRemainSec).padStart(2, '0')}
          </div>
          <div className="mt-2 text-xs font-mono text-purple-300/90 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Elapsed: {String(displayElapsedMin).padStart(2, '0')}:
              {String(displayElapsedSec).padStart(2, '0')} / {session.plannedDurationMinutes}m
            </span>
          </div>
          <div className="text-[11px] text-sky-400 font-semibold mt-1">
            {progressPercent}% Complete
          </div>
        </div>
      </div>

      {/* Target Elapsed Notice */}
      {remainingSeconds === 0 && (
        <div className="p-3 mb-6 rounded-xl bg-purple-950/70 border border-purple-500/50 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-2 text-purple-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Planned duration reached! Ready to lock in your cosmic star?</span>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm ? (
        <div className="p-5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-center animate-fadeIn mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h4 className="font-bold text-white text-base">Cancel this focus session?</h4>
          <p className="text-xs text-rose-200 mt-1 mb-4">
            Cancelled sessions are recorded as incomplete and earn <strong>zero stars</strong>.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleConfirmCancel}
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Yes, Cancel Session
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            >
              Keep Focusing
            </button>
          </div>
        </div>
      ) : (
        /* Action Controls */
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Play / Pause Toggle */}
            <button
              onClick={togglePlayPause}
              className={`py-3.5 px-4 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border ${
                isRunning
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Resume Timer</span>
                </>
              )}
            </button>

            {/* Mark Complete Button (Earn 1 Star!) */}
            <button
              onClick={handleMarkComplete}
              className="py-3.5 px-4 rounded-2xl font-orbitron font-black text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Mark Complete (+1⭐)</span>
            </button>
          </div>

          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Abandon / Cancel Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
