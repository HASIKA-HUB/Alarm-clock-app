import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlarmClock, 
  ArrowRight, 
  Hourglass, 
  RefreshCw 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { 
  generateMathChallenge, 
  generateMemoryChallenge, 
  generateSequenceChallenge 
} from '../utils/missionGenerator';
import { 
  MathChallenge, 
  MemoryChallenge, 
  SequenceChallenge 
} from '../types/alarmclock';
import { playCelebrationChime } from '../utils/audioSynthesizer';

interface RingingScreenModalProps {
  onNavigateToFocus?: () => void;
}

export const RingingScreenModal: React.FC<RingingScreenModalProps> = ({ onNavigateToFocus }) => {
  const { 
    activeRingingAlarm, 
    dismissRingingAlarm, 
    snoozeRingingAlarm, 
    recordMissionSolved, 
    recordMissionFailed,
    startFocusSession,
    settings 
  } = useAlarmClock();

  // Mission States
  const [isMissionSolved, setIsMissionSolved] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [solvedFeedback, setSolvedFeedback] = useState<string | null>(null);

  // Math Mission state
  const [mathData, setMathData] = useState<MathChallenge | null>(null);
  const [userMathInput, setUserMathInput] = useState<string>('');

  // Memory Mission state
  const [memoryData, setMemoryData] = useState<MemoryChallenge | null>(null);
  const [memoryPhase, setMemoryPhase] = useState<'memorize' | 'recall'>('memorize');
  const [memoryRemainingMs, setMemoryRemainingMs] = useState<number>(3500);
  const [userMemoryInput, setUserMemoryInput] = useState<string[]>([]);

  // Sequence Mission state
  const [sequenceData, setSequenceData] = useState<SequenceChallenge | null>(null);
  const [selectedSequenceOption, setSelectedSequenceOption] = useState<number | null>(null);

  // Linked focus prompt state
  const [showFocusPrompt, setShowFocusPrompt] = useState<boolean>(false);

  // Initialize or reset challenges when ringing alarm starts
  useEffect(() => {
    if (!activeRingingAlarm) {
      setIsMissionSolved(false);
      setErrorFeedback(null);
      setSolvedFeedback(null);
      setUserMathInput('');
      setUserMemoryInput([]);
      setShowFocusPrompt(false);
      return;
    }

    // If mission is none, already considered solved
    if (activeRingingAlarm.missionType === 'none') {
      setIsMissionSolved(true);
      return;
    }

    setIsMissionSolved(false);
    setErrorFeedback(null);

    if (activeRingingAlarm.missionType === 'math') {
      const challenge = generateMathChallenge(activeRingingAlarm.missionDifficulty);
      setMathData(challenge);
      setUserMathInput('');
    } else if (activeRingingAlarm.missionType === 'memory') {
      const challenge = generateMemoryChallenge(activeRingingAlarm.missionDifficulty);
      setMemoryData(challenge);
      setMemoryPhase('memorize');
      setMemoryRemainingMs(challenge.displayDurationMs);
      setUserMemoryInput([]);
    } else if (activeRingingAlarm.missionType === 'sequence') {
      const challenge = generateSequenceChallenge(activeRingingAlarm.missionDifficulty);
      setSequenceData(challenge);
      setSelectedSequenceOption(null);
    }
  }, [activeRingingAlarm]);

  // Memory Countdown Phase timer
  useEffect(() => {
    if (activeRingingAlarm?.missionType !== 'memory' || memoryPhase !== 'memorize' || !memoryData) {
      return;
    }

    const interval = 100;
    const timer = setInterval(() => {
      setMemoryRemainingMs(prev => {
        if (prev <= 100) {
          clearInterval(timer);
          setMemoryPhase('recall');
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeRingingAlarm, memoryPhase, memoryData]);

  if (!activeRingingAlarm) return null;

  // --- Handlers ---

  // Handle Math Answer
  const handleCheckMath = () => {
    if (!mathData) return;
    const numericInput = parseInt(userMathInput, 10);
    if (numericInput === mathData.answer) {
      setIsMissionSolved(true);
      setErrorFeedback(null);
      setSolvedFeedback('Neural Sync Verified! Challenge Solved.');
      recordMissionSolved(`Math (${mathData.difficulty})`);
      playCelebrationChime();
    } else {
      setErrorFeedback('Incorrect sum. Neural alertness required. Try again!');
      setUserMathInput('');
      recordMissionFailed();
    }
  };

  // Handle Memory Input
  const handleAddMemorySymbol = (symbol: string) => {
    if (!memoryData || memoryPhase !== 'recall' || isMissionSolved) return;
    const nextInput = [...userMemoryInput, symbol];
    setUserMemoryInput(nextInput);

    // If reached length, evaluate
    if (nextInput.length === memoryData.sequence.length) {
      const isMatch = nextInput.every((val, idx) => val === memoryData.sequence[idx]);
      if (isMatch) {
        setIsMissionSolved(true);
        setErrorFeedback(null);
        setSolvedFeedback('Astral Memory Synced Perfectly!');
        recordMissionSolved(`Memory Recall (${memoryData.difficulty})`);
        playCelebrationChime();
      } else {
        setErrorFeedback('Sequence mismatch! Re-memorize the cosmic pattern.');
        recordMissionFailed();
        // Reset with fresh challenge
        const fresh = generateMemoryChallenge(activeRingingAlarm.missionDifficulty);
        setMemoryData(fresh);
        setMemoryPhase('memorize');
        setMemoryRemainingMs(fresh.displayDurationMs);
        setUserMemoryInput([]);
      }
    }
  };

  // Handle Sequence Answer
  const handleSelectSequenceOption = (option: number) => {
    if (!sequenceData || isMissionSolved) return;
    setSelectedSequenceOption(option);

    if (option === sequenceData.answer) {
      setIsMissionSolved(true);
      setErrorFeedback(null);
      setSolvedFeedback(`Correct! ${sequenceData.patternDescription}`);
      recordMissionSolved(`Sequence (${sequenceData.difficulty})`);
      playCelebrationChime();
    } else {
      setErrorFeedback('Incorrect cosmic number! Examine the progression carefully.');
      recordMissionFailed();
    }
  };

  // Final Dismiss Click
  const handleCompleteDismiss = () => {
    if (!isMissionSolved) return;

    if (activeRingingAlarm.linkedFocusTask && !showFocusPrompt) {
      // Show linked focus task prompt before closing
      setShowFocusPrompt(true);
      return;
    }

    dismissRingingAlarm();
  };

  // Launch Linked Focus Task
  const handleLaunchLinkedFocus = () => {
    if (activeRingingAlarm.linkedFocusTask) {
      startFocusSession(
        activeRingingAlarm.linkedFocusTask.title,
        activeRingingAlarm.linkedFocusTask.category,
        activeRingingAlarm.linkedFocusTask.durationMinutes
      );
      if (onNavigateToFocus) {
        onNavigateToFocus();
      }
    }
    dismissRingingAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      
      {/* Background pulsing cosmic rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full bg-[#7C3AED]/20 animate-ring-pulse blur-2xl" />
        <div className="w-[320px] h-[320px] rounded-full bg-[#38BDF8]/20 animate-cosmic-pulse blur-xl" />
      </div>

      <div 
        className="relative w-full max-w-lg cosmic-card-glow rounded-3xl p-6 sm:p-8 text-center border-2 border-[#A855F7]/60 shadow-2xl z-10"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Pulsing Bell Icon & Alarm Title */}
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#F472B6] shadow-lg shadow-[#7C3AED]/40 animate-bounce mb-3">
          <BellRing className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-wide">
          {activeRingingAlarm.label}
        </h1>

        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="font-mono-clock text-3xl sm:text-4xl font-extrabold text-[#38BDF8] tracking-widest">
            {activeRingingAlarm.time}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#7C3AED]/30 text-[#C4B5FD] text-xs font-semibold uppercase">
            Ringing Now
          </span>
        </div>

        {/* PROMPT FOR LINKED FOCUS TASK AFTER MISSION SOLVED */}
        {showFocusPrompt && activeRingingAlarm.linkedFocusTask ? (
          <div className="mt-6 p-5 rounded-2xl bg-[#0B1026] border border-[#38BDF8]/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-[#38BDF8]">
              <Hourglass className="w-5 h-5 animate-spin" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Linked Focus Session Ready
              </span>
            </div>

            <p className="text-xs text-[#CBD5E1]">
              You attached <strong className="text-white">"{activeRingingAlarm.linkedFocusTask.title}"</strong> to this alarm.
            </p>

            <div className="p-3 rounded-xl bg-[#18113A] border border-[#7C3AED]/30 text-xs text-[#E2E8F0]">
              <div className="font-semibold">{activeRingingAlarm.linkedFocusTask.title}</div>
              <div className="text-[11px] text-[#38BDF8] mt-0.5">
                {activeRingingAlarm.linkedFocusTask.durationMinutes} Minutes • {activeRingingAlarm.linkedFocusTask.category}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleLaunchLinkedFocus}
                className="w-full cosmic-button-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Focus Session (+1 ★ on finish)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => dismissRingingAlarm()}
                className="w-full cosmic-button-secondary py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Just Dismiss
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* NOVELTY FEATURE 1: MISSION SECTION */}
            {activeRingingAlarm.missionType !== 'none' && !isMissionSolved && (
              <div className="mt-6 p-5 rounded-2xl bg-[#0B1026]/90 border border-[#A855F7]/40 text-left space-y-4">
                
                <div className="flex items-center justify-between pb-2 border-b border-[#7C3AED]/20">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#A855F7]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Wake-Up Mission: {activeRingingAlarm.missionType.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A855F7]/20 text-[#F472B6] font-bold uppercase">
                    {activeRingingAlarm.missionDifficulty}
                  </span>
                </div>

                {/* Feedback */}
                {errorFeedback && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs animate-shake">
                    <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorFeedback}</span>
                  </div>
                )}

                {/* A. MATH CHALLENGE */}
                {activeRingingAlarm.missionType === 'math' && mathData && (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <div className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">
                        Solve to unlock dismissal:
                      </div>
                      <div className="font-mono-clock text-3xl font-extrabold text-white tracking-wider">
                        {mathData.question} = ?
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Your Answer"
                        value={userMathInput}
                        onChange={e => setUserMathInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCheckMath()}
                        className="w-full bg-[#050816] border border-[#7C3AED]/40 rounded-xl px-4 py-2.5 text-center font-mono-clock text-xl text-white focus:outline-none focus:border-[#38BDF8]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCheckMath}
                        className="cosmic-button-primary px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>

                    {/* Numeric Keypad for fast touch input */}
                    <div className="grid grid-cols-6 gap-1.5 pt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', 'C'].map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => {
                            if (val === 'C') setUserMathInput('');
                            else setUserMathInput(prev => prev + String(val));
                          }}
                          className="py-1.5 rounded-lg bg-[#18113A] border border-[#7C3AED]/20 text-white font-mono font-bold text-xs hover:bg-[#7C3AED]/30 transition-colors"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* B. MEMORY CHALLENGE */}
                {activeRingingAlarm.missionType === 'memory' && memoryData && (
                  <div className="space-y-3">
                    {memoryPhase === 'memorize' ? (
                      <div className="text-center py-4 space-y-3">
                        <div className="text-xs text-[#38BDF8] font-semibold animate-pulse">
                          Memorize this cosmic sequence! (Hiding in {(memoryRemainingMs / 1000).toFixed(1)}s)
                        </div>

                        <div className="flex items-center justify-center gap-2">
                          {memoryData.sequence.map((sym, idx) => (
                            <div 
                              key={idx}
                              className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center font-mono-clock text-xl font-black text-white shadow-md shadow-[#7C3AED]/40 animate-bounce"
                              style={{ animationDelay: `${idx * 100}ms` }}
                            >
                              {sym}
                            </div>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#050816] h-1.5 rounded-full overflow-hidden border border-[#7C3AED]/30">
                          <div 
                            className="bg-gradient-to-r from-[#F472B6] to-[#38BDF8] h-full transition-all"
                            style={{ width: `${(memoryRemainingMs / memoryData.displayDurationMs) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-xs text-[#94A3B8] text-center">
                          Reproduce the {memoryData.sequence.length} items in exact order:
                        </div>

                        {/* User Selected Sequence Slots */}
                        <div className="flex items-center justify-center gap-2 min-h-[44px]">
                          {Array.from({ length: memoryData.sequence.length }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono-clock text-base font-bold ${
                                userMemoryInput[idx]
                                  ? 'bg-[#7C3AED]/30 border-[#38BDF8] text-white shadow-sm'
                                  : 'bg-[#050816] border-[#7C3AED]/30 text-[#64748B]'
                              }`}
                            >
                              {userMemoryInput[idx] || '_'}
                            </div>
                          ))}
                        </div>

                        {/* Options to click */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          {memoryData.availableOptions.map((sym, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddMemorySymbol(sym)}
                              className="w-10 h-10 rounded-xl bg-[#18113A] border border-[#7C3AED]/40 hover:border-[#38BDF8] text-white font-mono-clock text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                              {sym}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setUserMemoryInput([])}
                            className="text-[11px] text-[#F472B6] hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Clear Input</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* C. SEQUENCE PUZZLE */}
                {activeRingingAlarm.missionType === 'sequence' && sequenceData && (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <div className="text-xs text-[#94A3B8] uppercase tracking-wider mb-2">
                        Find the missing cosmic value:
                      </div>

                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {sequenceData.displaySequence.map((val, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-xl font-mono-clock text-lg font-bold border ${
                              val === '?'
                                ? 'bg-gradient-to-tr from-[#EC4899] to-[#8B5CF6] text-white border-pink-400 animate-pulse'
                                : 'bg-[#18113A] border-[#7C3AED]/30 text-white'
                            }`}
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {sequenceData.options.map((opt, idx) => {
                        const isChosen = selectedSequenceOption === opt;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSequenceOption(opt)}
                            className={`py-2 px-3 rounded-xl border text-sm font-mono-clock font-bold transition-all ${
                              isChosen
                                ? 'bg-[#7C3AED] text-white border-white'
                                : 'bg-[#18113A] text-white border-[#7C3AED]/30 hover:border-[#38BDF8] hover:bg-[#7C3AED]/20'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* MISSION SOLVED SUCCESS STATE */}
            {isMissionSolved && activeRingingAlarm.missionType !== 'none' && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  {solvedFeedback || 'Mission Cleared! Dismissal Authorized.'}
                </span>
              </div>
            )}

            {/* Ringing Controls: Dismiss & Snooze */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              
              {/* Dismiss Button */}
              <button
                onClick={handleCompleteDismiss}
                disabled={!isMissionSolved}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  isMissionSolved
                    ? 'cosmic-button-primary cursor-pointer animate-cosmic-pulse'
                    : 'bg-[#18113A] text-[#64748B] border border-[#7C3AED]/20 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#FCD34D]" />
                <span>
                  {isMissionSolved ? 'Dismiss Alarm' : 'Solve Mission to Dismiss'}
                </span>
              </button>

              {/* Snooze Button (Allowed if configured on alarm) */}
              {activeRingingAlarm.allowSnooze && (
                <button
                  onClick={() => snoozeRingingAlarm()}
                  className="w-full sm:w-auto cosmic-button-secondary px-5 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Snooze ({activeRingingAlarm.snoozeDurationMin}m)
                </button>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
