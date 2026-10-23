/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MissionDifficulty } from '../../types/alarm';
import { generateSequenceProblem, SequenceProblem } from '../../utils/mission';
import { cosmicAudio } from '../../utils/audio';
import { Binary, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface SequenceMissionProps {
  difficulty: MissionDifficulty;
  onSuccess: (attempts: number, timeSpentSeconds: number) => void;
  isPractice?: boolean;
}

export const SequenceMission: React.FC<SequenceMissionProps> = ({
  difficulty,
  onSuccess,
  isPractice = false,
}) => {
  const [problem, setProblem] = useState<SequenceProblem>(() => generateSequenceProblem(difficulty));
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [problem]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed)) {
      setFeedback('wrong');
      setFeedbackMessage('Please enter a valid number');
      cosmicAudio.playFeedbackSound('wrong');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (parsed === problem.expectedAnswer) {
      setFeedback('correct');
      setFeedbackMessage(`Correct! Pattern: ${problem.patternRule}`);
      cosmicAudio.playFeedbackSound('correct');
      const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      setTimeout(() => {
        onSuccess(newAttempts, timeSpent);
      }, 800);
    } else {
      setFeedback('wrong');
      setFeedbackMessage(`Incorrect (${parsed}). Look at the progression between terms.`);
      cosmicAudio.playFeedbackSound('wrong');
      setUserAnswer('');
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setProblem(generateSequenceProblem(difficulty));
    setUserAnswer('');
    setFeedback('idle');
    setFeedbackMessage('');
    startTimeRef.current = Date.now();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl glass-panel-glow text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">Sequence Puzzle</h3>
            <span className="text-xs uppercase tracking-wider text-pink-300 font-semibold px-2 py-0.5 rounded-full bg-pink-950/60 border border-pink-700/50">
              Difficulty: {difficulty}
            </span>
          </div>
        </div>

        {isPractice && (
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Generate new puzzle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="my-6 p-5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center shadow-inner">
        <span className="text-xs text-slate-400 block mb-3 uppercase tracking-widest font-mono">
          Find the missing value (?)
        </span>

        {/* Number pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {problem.displaySequence.map((val, idx) => {
            const isMissing = val === '?';
            return (
              <div
                key={idx}
                className={`min-w-[48px] h-12 px-3 rounded-xl flex items-center justify-center font-orbitron font-bold text-xl transition-all ${
                  isMissing
                    ? 'border-2 border-pink-400 bg-pink-500/20 text-pink-300 shadow-md shadow-pink-500/30 animate-pulse'
                    : 'border border-slate-700 bg-slate-800/80 text-sky-200'
                }`}
              >
                {val}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="number"
            step="1"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter missing number..."
            className="w-full py-3.5 px-4 rounded-xl bg-slate-950/70 border-2 border-pink-500/40 focus:border-pink-400 focus:outline-none text-center font-orbitron text-2xl text-white placeholder-slate-600 transition"
            autoFocus
          />
        </div>

        {feedback !== 'idle' && (
          <div
            className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs md:text-sm font-medium animate-fadeIn ${
              feedback === 'correct'
                ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
            }`}
          >
            {feedback === 'correct' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
        >
          <span>Verify Sequence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Attempts: <strong className="text-slate-200">{attempts}</strong></span>
        <span>Keyboard: Enter to submit</span>
      </div>
    </div>
  );
};
