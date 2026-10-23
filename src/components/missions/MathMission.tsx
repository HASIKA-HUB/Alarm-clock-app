/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MissionDifficulty } from '../../types/alarm';
import { generateMathProblem, MathProblem } from '../../utils/mission';
import { cosmicAudio } from '../../utils/audio';
import { Calculator, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface MathMissionProps {
  difficulty: MissionDifficulty;
  onSuccess: (attempts: number, timeSpentSeconds: number) => void;
  isPractice?: boolean;
}

export const MathMission: React.FC<MathMissionProps> = ({
  difficulty,
  onSuccess,
  isPractice = false,
}) => {
  const [problem, setProblem] = useState<MathProblem>(() => generateMathProblem(difficulty));
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
      setFeedbackMessage('Please enter a valid numeric value');
      cosmicAudio.playFeedbackSound('wrong');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (parsed === problem.expectedAnswer) {
      setFeedback('correct');
      setFeedbackMessage('Correct computation! Cosmic gate unlocked.');
      cosmicAudio.playFeedbackSound('correct');
      const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      setTimeout(() => {
        onSuccess(newAttempts, timeSpent);
      }, 700);
    } else {
      setFeedback('wrong');
      setFeedbackMessage(`Incorrect (${parsed}). Re-calculate carefully!`);
      cosmicAudio.playFeedbackSound('wrong');
      setUserAnswer('');
      inputRef.current?.focus();
    }
  };

  const handleNewQuestion = () => {
    setProblem(generateMathProblem(difficulty));
    setUserAnswer('');
    setFeedback('idle');
    setFeedbackMessage('');
    startTimeRef.current = Date.now();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl glass-panel-glow text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white">Math Challenge</h3>
            <span className="text-xs uppercase tracking-wider text-purple-300 font-semibold px-2 py-0.5 rounded-full bg-purple-900/50 border border-purple-700/50">
              Difficulty: {difficulty}
            </span>
          </div>
        </div>

        {isPractice && (
          <button
            onClick={handleNewQuestion}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            title="Generate new question"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="my-6 p-6 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center shadow-inner">
        <span className="text-xs text-slate-400 block mb-1 uppercase tracking-widest font-mono">
          Solve to dismiss alarm
        </span>
        <div className="text-3xl md:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-300 to-pink-400 py-2">
          {problem.question} = ?
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
            placeholder="Type answer..."
            className="w-full py-3.5 px-4 rounded-xl bg-slate-950/70 border-2 border-purple-500/40 focus:border-purple-400 focus:outline-none text-center font-orbitron text-2xl text-white placeholder-slate-600 transition"
            autoFocus
          />
        </div>

        {feedback !== 'idle' && (
          <div
            className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium animate-fadeIn ${
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
          className="w-full py-3.5 px-4 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
        >
          <span>Submit Solution</span>
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
