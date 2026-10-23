import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Calculator, 
  Eye, 
  Binary, 
  ChevronRight, 
  HelpCircle 
} from 'lucide-react';
import { 
  generateMathChallenge, 
  generateMemoryChallenge, 
  generateSequenceChallenge 
} from '../utils/missionGenerator';
import { 
  MissionType, 
  MissionDifficulty, 
  MathChallenge, 
  MemoryChallenge, 
  SequenceChallenge 
} from '../types/alarmclock';
import { playCelebrationChime } from '../utils/audioSynthesizer';
import { useAlarmClock } from '../context/AlarmClockContext';

export const MissionSettingsView: React.FC = () => {
  const { recordMissionSolved } = useAlarmClock();

  const [activeTab, setActiveTab] = useState<MissionType>('math');
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('medium');

  // Math State
  const [mathData, setMathData] = useState<MathChallenge | null>(null);
  const [mathInput, setMathInput] = useState<string>('');
  const [mathFeedback, setMathFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Memory State
  const [memoryData, setMemoryData] = useState<MemoryChallenge | null>(null);
  const [memoryPhase, setMemoryPhase] = useState<'memorize' | 'recall'>('memorize');
  const [memoryRemainingMs, setMemoryRemainingMs] = useState<number>(3500);
  const [memoryInput, setMemoryInput] = useState<string[]>([]);
  const [memoryFeedback, setMemoryFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Sequence State
  const [sequenceData, setSequenceData] = useState<SequenceChallenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sequenceFeedback, setSequenceFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Session stats for the practice playground
  const [solvedCount, setSolvedCount] = useState<number>(0);

  // Generate / Reset Math
  const resetMath = () => {
    setMathData(generateMathChallenge(difficulty));
    setMathInput('');
    setMathFeedback(null);
  };

  // Generate / Reset Memory
  const resetMemory = () => {
    const mem = generateMemoryChallenge(difficulty);
    setMemoryData(mem);
    setMemoryPhase('memorize');
    setMemoryRemainingMs(mem.displayDurationMs);
    setMemoryInput([]);
    setMemoryFeedback(null);
  };

  // Generate / Reset Sequence
  const resetSequence = () => {
    setSequenceData(generateSequenceChallenge(difficulty));
    setSelectedOption(null);
    setSequenceFeedback(null);
  };

  // Initial load or tab/difficulty change
  useEffect(() => {
    if (activeTab === 'math') resetMath();
    if (activeTab === 'memory') resetMemory();
    if (activeTab === 'sequence') resetSequence();
  }, [activeTab, difficulty]);

  // Memory countdown tick
  useEffect(() => {
    if (activeTab !== 'memory' || memoryPhase !== 'memorize' || !memoryData) return;
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
  }, [activeTab, memoryPhase, memoryData]);

  // Handlers
  const handleCheckMath = () => {
    if (!mathData) return;
    const val = parseInt(mathInput, 10);
    if (val === mathData.answer) {
      setMathFeedback({ type: 'success', msg: `Correct! ${mathData.question} = ${mathData.answer}` });
      setSolvedCount(prev => prev + 1);
      recordMissionSolved('Math Practice');
      playCelebrationChime();
    } else {
      setMathFeedback({ type: 'error', msg: 'Incorrect solution. Neural calculation mismatch. Try again!' });
    }
  };

  const handleAddMemorySymbol = (sym: string) => {
    if (!memoryData || memoryPhase !== 'recall' || memoryFeedback?.type === 'success') return;
    const nextInput = [...memoryInput, sym];
    setMemoryInput(nextInput);

    if (nextInput.length === memoryData.sequence.length) {
      const match = nextInput.every((v, i) => v === memoryData.sequence[i]);
      if (match) {
        setMemoryFeedback({ type: 'success', msg: 'Astral Memory Sequence Verified 100%!' });
        setSolvedCount(prev => prev + 1);
        recordMissionSolved('Memory Practice');
        playCelebrationChime();
      } else {
        setMemoryFeedback({ type: 'error', msg: 'Sequence failed. Try memorizing again!' });
        setTimeout(() => resetMemory(), 1500);
      }
    }
  };

  const handleSelectSequence = (option: number) => {
    if (!sequenceData || sequenceFeedback?.type === 'success') return;
    setSelectedOption(option);

    if (option === sequenceData.answer) {
      setSequenceFeedback({
        type: 'success',
        msg: `Pattern Mastered! ${sequenceData.patternDescription}`,
      });
      setSolvedCount(prev => prev + 1);
      recordMissionSolved('Sequence Practice');
      playCelebrationChime();
    } else {
      setSequenceFeedback({
        type: 'error',
        msg: 'Incorrect pattern choice. Examine the step differences.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-[#A855F7]" />
            <span>Mission Arena & Playground</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Test and practice the brain-awakening challenges used to dismiss alarms.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0B1026] border border-[#7C3AED]/30 text-xs">
          <Award className="w-4 h-4 text-[#FCD34D]" />
          <span className="text-[#94A3B8]">Arena Solved:</span>
          <span className="font-mono-clock font-bold text-white">{solvedCount}</span>
        </div>
      </div>

      {/* Mission Type Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0B1026] border border-[#7C3AED]/30">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'math', label: 'Math Challenge', icon: Calculator },
            { id: 'memory', label: 'Memory Recall', icon: Eye },
            { id: 'sequence', label: 'Pattern Sequence', icon: Binary },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MissionType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#94A3B8] mr-1 hidden sm:inline">Difficulty:</span>
          {(['easy', 'medium', 'hard'] as MissionDifficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                difficulty === diff
                  ? 'bg-[#A855F7] text-white border-white/40'
                  : 'bg-[#18113A] text-[#94A3B8] border-[#7C3AED]/20 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Arena Card */}
      <div className="cosmic-card-glow rounded-3xl p-6 sm:p-10 border border-[#7C3AED]/40 min-h-[380px] flex flex-col justify-between">
        
        {/* TAB 1: MATH CHALLENGE */}
        {activeTab === 'math' && mathData && (
          <div className="space-y-6 max-w-lg mx-auto w-full text-center">
            <div>
              <span className="text-xs font-bold text-[#A855F7] uppercase tracking-wider">
                Novelty Feature 1A: Neural Arithmetic
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mt-1">
                Calculate & Prove Wakefulness
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Solves sleep inertia by stimulating executive cognitive function.
              </p>
            </div>

            {/* Arithmetic Formula Display */}
            <div className="p-6 rounded-2xl bg-[#0B1026] border border-[#7C3AED]/40 shadow-inner">
              <span className="font-mono-clock text-4xl sm:text-5xl font-black text-white tracking-widest">
                {mathData.question} = ?
              </span>
            </div>

            {/* Input & Submit */}
            <div className="flex items-center gap-2 max-w-xs mx-auto">
              <input
                type="number"
                placeholder="Answer"
                value={mathInput}
                onChange={e => setMathInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheckMath()}
                className="w-full bg-[#050816] border border-[#7C3AED]/40 rounded-xl px-4 py-3 text-center font-mono-clock text-2xl text-white focus:outline-none focus:border-[#38BDF8]"
                autoFocus
              />
              <button
                onClick={handleCheckMath}
                className="cosmic-button-primary px-5 py-3 rounded-xl text-xs font-bold cursor-pointer"
              >
                Verify
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '-', 'C'].map(val => (
                <button
                  key={String(val)}
                  onClick={() => {
                    if (val === 'C') setMathInput('');
                    else setMathInput(prev => prev + String(val));
                  }}
                  className="py-2 rounded-xl bg-[#0B1026] border border-[#7C3AED]/30 text-white font-mono font-bold hover:bg-[#7C3AED]/30 transition-colors text-sm"
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {mathFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold ${
                  mathFeedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/60 text-red-300 border border-red-500/40'
                }`}
              >
                {mathFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{mathFeedback.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEMORY RECALL */}
        {activeTab === 'memory' && memoryData && (
          <div className="space-y-6 max-w-lg mx-auto w-full text-center">
            <div>
              <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">
                Novelty Feature 1B: Astral Memory Recall
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mt-1">
                Visual Pattern Synchronizer
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Memorize the symbols before they vanish, then recreate the order.
              </p>
            </div>

            {memoryPhase === 'memorize' ? (
              <div className="p-8 rounded-2xl bg-[#0B1026] border border-[#38BDF8]/40 space-y-5">
                <div className="text-xs text-[#38BDF8] font-bold uppercase animate-pulse">
                  Memorize sequence! Hiding in {(memoryRemainingMs / 1000).toFixed(1)}s
                </div>

                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {memoryData.sequence.map((sym, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] flex items-center justify-center font-mono-clock text-2xl font-black text-white shadow-lg shadow-[#7C3AED]/40"
                    >
                      {sym}
                    </div>
                  ))}
                </div>

                <div className="w-full bg-[#050816] h-2 rounded-full overflow-hidden border border-[#38BDF8]/30">
                  <div
                    className="bg-gradient-to-r from-[#F472B6] via-[#38BDF8] to-[#7C3AED] h-full transition-all"
                    style={{ width: `${(memoryRemainingMs / memoryData.displayDurationMs) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0B1026] border border-[#7C3AED]/40 space-y-4">
                <div className="text-xs text-[#C4B5FD] font-semibold">
                  Click the cosmic glyphs in their exact original sequence:
                </div>

                {/* Selected Slots */}
                <div className="flex items-center justify-center gap-2 min-h-[50px]">
                  {Array.from({ length: memoryData.sequence.length }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center font-mono-clock text-xl font-bold ${
                        memoryInput[idx]
                          ? 'bg-[#7C3AED]/40 border-[#38BDF8] text-white'
                          : 'bg-[#050816] border-[#7C3AED]/30 text-[#64748B]'
                      }`}
                    >
                      {memoryInput[idx] || '_'}
                    </div>
                  ))}
                </div>

                {/* Glyph Options */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {memoryData.availableOptions.map((sym, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddMemorySymbol(sym)}
                      className="w-12 h-12 rounded-xl bg-[#18113A] border border-[#7C3AED]/40 hover:border-[#38BDF8] text-white font-mono-clock text-xl font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {memoryFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold ${
                  memoryFeedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/60 text-red-300 border border-red-500/40'
                }`}
              >
                {memoryFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{memoryFeedback.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEQUENCE PUZZLE */}
        {activeTab === 'sequence' && sequenceData && (
          <div className="space-y-6 max-w-lg mx-auto w-full text-center">
            <div>
              <span className="text-xs font-bold text-[#F472B6] uppercase tracking-wider">
                Novelty Feature 1C: Cosmic Progression Puzzle
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-outfit mt-1">
                Detect the Missing Value
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Find the pattern in geometric, arithmetic, or Fibonacci series.
              </p>
            </div>

            {/* Sequence with Missing Card */}
            <div className="p-6 rounded-2xl bg-[#0B1026] border border-[#7C3AED]/40 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {sequenceData.displaySequence.map((val, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 rounded-2xl font-mono-clock text-xl sm:text-2xl font-black border ${
                    val === '?'
                      ? 'bg-gradient-to-tr from-[#F472B6] to-[#7C3AED] text-white border-white animate-pulse'
                      : 'bg-[#18113A] border-[#7C3AED]/30 text-white'
                  }`}
                >
                  {val}
                </div>
              ))}
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              {sequenceData.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectSequence(opt)}
                    className={`py-3 px-4 rounded-xl border font-mono-clock text-base font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white border-white shadow-md'
                        : 'bg-[#0B1026] text-white border-[#7C3AED]/30 hover:border-[#38BDF8] hover:bg-[#7C3AED]/20'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {sequenceFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-center gap-2 font-semibold ${
                  sequenceFeedback.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/60 text-red-300 border border-red-500/40'
                }`}
              >
                {sequenceFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>{sequenceFeedback.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer: Next / Reset Button */}
        <div className="flex items-center justify-between pt-6 border-t border-[#7C3AED]/20 mt-6">
          <span className="text-xs text-[#94A3B8]">
            Practice freely without ringing alarms
          </span>

          <button
            onClick={() => {
              if (activeTab === 'math') resetMath();
              if (activeTab === 'memory') resetMemory();
              if (activeTab === 'sequence') resetSequence();
            }}
            className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Generate Next Challenge</span>
          </button>
        </div>

      </div>

    </div>
  );
};
