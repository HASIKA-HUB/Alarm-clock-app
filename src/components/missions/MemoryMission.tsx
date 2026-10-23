/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MissionDifficulty } from '../../types/alarm';
import { generateMemoryProblem, MemoryProblem, COSMIC_SYMBOLS } from '../../utils/mission';
import { cosmicAudio } from '../../utils/audio';
import { Eye, CheckCircle2, XCircle, RotateCcw, Undo2 } from 'lucide-react';

interface MemoryMissionProps {
  difficulty: MissionDifficulty;
  onSuccess: (attempts: number, timeSpentSeconds: number) => void;
  isPractice?: boolean;
}

export const MemoryMission: React.FC<MemoryMissionProps> = ({
  difficulty,
  onSuccess,
  isPractice = false,
}) => {
  const [problem, setProblem] = useState<MemoryProblem>(() => generateMemoryProblem(difficulty));
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'success'>('memorize');
  const [timeLeft, setTimeLeft] = useState<number>(() => problem.displaySeconds);
  const [userSelection, setUserSelection] = useState<typeof COSMIC_SYMBOLS>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const startTimeRef = useRef<number>(Date.now());

  // Countdown timer for the memorize phase
  useEffect(() => {
    if (phase !== 'memorize') return;

    setTimeLeft(problem.displaySeconds);
    const interval = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.15) {
          clearInterval(timer);
          setPhase('recall');
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [phase, problem]);

  const handleSymbolClick = (sym: (typeof COSMIC_SYMBOLS)[0]) => {
    if (phase !== 'recall') return;
    cosmicAudio.playFeedbackSound('click');

    const nextSelection = [...userSelection, sym];
    setUserSelection(nextSelection);

    // If user has chosen the target length, validate
    if (nextSelection.length === problem.sequence.length) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const isMatch = nextSelection.every(
        (val, idx) => val.id === problem.sequence[idx].id
      );

      if (isMatch) {
        setPhase('success');
        cosmicAudio.playFeedbackSound('correct');
        const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setTimeout(() => {
          onSuccess(newAttempts, timeSpent);
        }, 750);
      } else {
        setFeedback('wrong');
        setFeedbackMessage('Sequence mismatch! Memorize the new sequence.');
        cosmicAudio.playFeedbackSound('wrong');

        setTimeout(() => {
          // Restart with a fresh sequence
          setProblem(generateMemoryProblem(difficulty));
          setUserSelection([]);
          setFeedback('idle');
          setFeedbackMessage('');
          setPhase('memorize');
        }, 1200);
      }
    }
  };

  const handleUndo = () => {
    if (userSelection.length > 0) {
      setUserSelection((prev) => prev.slice(0, -1));
      setFeedback('idle');
    }
  };

  const handleResetPractice = () => {
    setProblem(generateMemoryProblem(difficulty));
    setUserSelection([]);
    setFeedback('idle');
    setFeedbackMessage('');
    setPhase('memorize');
    startTimeRef.current = Date.now();
  };

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / problem.displaySeconds) * 100));

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl glass-panel-glow text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">Memory Challenge</h3>
            <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold px-2 py-0.5 rounded-full bg-sky-950/60 border border-sky-700/50">
              Length: {problem.sequence.length} ({difficulty})
            </span>
          </div>
        </div>

        {isPractice && (
          <button
            onClick={handleResetPractice}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Restart challenge"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {phase === 'memorize' && (
        <div className="my-5 p-5 rounded-xl bg-slate-900/90 border border-purple-500/40 text-center">
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-3">
            <span>MEMORIZE THE COSMIC SEQUENCE</span>
            <span className="font-orbitron font-bold">{timeLeft.toFixed(1)}s</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-sky-400 h-2 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sequence Display */}
          <div className="flex flex-wrap items-center justify-center gap-2 py-2">
            {problem.sequence.map((sym, i) => (
              <div
                key={i}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-purple-950/60 border-2 border-purple-400/60 flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-purple-500/20 animate-bounce"
                style={{ animationDelay: `${i * 100}ms`, animationDuration: '1.4s' }}
              >
                {sym.symbol}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'recall' && (
        <div className="my-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>REPRODUCE SEQUENCE ({userSelection.length}/{problem.sequence.length})</span>
            <button
              onClick={handleUndo}
              disabled={userSelection.length === 0}
              className="flex items-center gap-1 text-slate-400 hover:text-purple-300 disabled:opacity-30 text-xs transition"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
          </div>

          {/* User Slots */}
          <div className="flex flex-wrap items-center justify-center gap-2 min-h-[58px] p-2 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
            {Array.from({ length: problem.sequence.length }).map((_, i) => {
              const item = userSelection[i];
              return (
                <div
                  key={i}
                  className={`w-11 h-11 rounded-lg border flex items-center justify-center text-2xl transition-all ${
                    item
                      ? 'border-purple-400 bg-purple-900/50 shadow-sm shadow-purple-500/30'
                      : 'border-slate-800 bg-slate-900/40 text-slate-600'
                  }`}
                >
                  {item ? item.symbol : i + 1}
                </div>
              );
            })}
          </div>

          {feedback === 'wrong' && (
            <div className="flex items-center justify-center gap-2 p-2.5 mb-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Keypad / Symbol Grid */}
          <div className="grid grid-cols-3 gap-2">
            {COSMIC_SYMBOLS.map((sym) => (
              <button
                key={sym.id}
                onClick={() => handleSymbolClick(sym)}
                disabled={userSelection.length >= problem.sequence.length}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-purple-600/30 border border-slate-700 hover:border-purple-500 text-2xl flex flex-col items-center justify-center gap-1 transition transform active:scale-90 cursor-pointer disabled:opacity-40"
              >
                <span>{sym.symbol}</span>
                <span className="text-[10px] text-slate-400 tracking-tight">{sym.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'success' && (
        <div className="my-6 p-6 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
          <h4 className="font-orbitron font-bold text-lg">Cosmic Sequence Verified!</h4>
          <p className="text-xs text-emerald-200/80 mt-1">Alarm unlocking...</p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Attempts: <strong className="text-slate-200">{attempts}</strong></span>
        <span>Tap symbols in exact order</span>
      </div>
    </div>
  );
};
