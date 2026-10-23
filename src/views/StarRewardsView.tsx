import React from 'react';
import confetti from 'canvas-confetti';
import { 
  Star, 
  Sparkles, 
  Award, 
  Trophy, 
  ShieldCheck, 
  Rocket, 
  Brain, 
  Clock, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';
import { useAlarmClock } from '../context/AlarmClockContext';
import { playCelebrationChime } from '../utils/audioSynthesizer';

export const StarRewardsView: React.FC = () => {
  const { stars, rankInfo, achievements } = useAlarmClock();

  const handleTestCelebration = () => {
    playCelebrationChime();
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#38BDF8', '#F472B6', '#FCD34D', '#10B981']
    });
  };

  const RANKS = [
    { title: 'Cosmic Beginner', min: 0, max: 4, desc: 'Starting your orbit in cosmic time management.' },
    { title: 'Rising Star', min: 5, max: 14, desc: 'Proving neural consistency across focus cycles.' },
    { title: 'Galaxy Achiever', min: 15, max: 29, desc: 'Mastering deep space focus and complex missions.' },
    { title: 'Cosmic Champion', min: 30, max: '30+', desc: 'Supreme productivity sovereign of the cosmos.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-7 h-7 text-[#FCD34D] fill-current" />
            <span>Stellar Rewards & Cosmic Ranks</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Track your star balance, tier progressions, and unlocked cosmic achievements.
          </p>
        </div>

        <button
          onClick={handleTestCelebration}
          className="cosmic-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto text-[#FCD34D]"
        >
          <Sparkles className="w-4 h-4 text-[#FCD34D]" />
          <span>Test Celebration FX</span>
        </button>
      </div>

      {/* Main Progression Banner */}
      <div className="cosmic-card-glow rounded-3xl p-6 sm:p-8 border border-[#F59E0B]/40 relative overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F59E0B]/15 via-[#7C3AED]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Big Star Display */}
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs font-bold text-[#FCD34D] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FCD34D]" />
              Current Stellar Balance
            </span>
            <div className="font-mono-clock text-6xl sm:text-7xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
              <span>{stars}</span>
              <span className="text-[#FCD34D] text-4xl">★</span>
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#FCD34D] text-xs font-bold border border-[#F59E0B]/30">
              Tier: {rankInfo.rank}
            </div>
          </div>

          {/* Progress Bar to Next Rank (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Next Tier Milestone:</span>
              <span className="font-mono-clock text-[#38BDF8] font-bold">
                {stars} / {rankInfo.nextThreshold} Stars ({rankInfo.progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-[#050816] h-3.5 rounded-full overflow-hidden border border-[#7C3AED]/40 p-0.5">
              <div 
                className="bg-gradient-to-r from-[#7C3AED] via-[#38BDF8] to-[#FCD34D] h-full rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-[#CBD5E1]">
              Earn exactly <strong>1 star</strong> for each completed focus session. Cancelled sessions or alarms alone award no stars.
            </p>
          </div>

        </div>

      </div>

      {/* Cosmic Ranks Hierarchy */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white font-outfit mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#A855F7]" />
          <span>Cosmic Rank Hierarchy</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RANKS.map(rk => {
            const isCurrent = rankInfo.rank === rk.title;
            return (
              <div
                key={rk.title}
                className={`cosmic-card rounded-2xl p-5 border transition-all ${
                  isCurrent
                    ? 'border-[#F59E0B] bg-[#140F2D]/90 shadow-lg shadow-[#F59E0B]/10'
                    : 'border-[#7C3AED]/20 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-clock text-xs font-bold text-[#38BDF8]">
                    {rk.min} - {rk.max} ★
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FCD34D] text-[10px] font-bold uppercase">
                      Current Rank
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{rk.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1.5">{rk.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-white font-outfit flex items-center gap-2">
            <Award className="w-5 h-5 text-[#38BDF8]" />
            <span>Cosmic Badges & Achievements</span>
          </h2>
          <span className="text-xs text-[#94A3B8]">
            {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => {
            const isUnlocked = ach.isUnlocked;
            return (
              <div
                key={ach.id}
                className={`cosmic-card rounded-2xl p-5 border transition-all ${
                  isUnlocked
                    ? 'border-emerald-500/40 bg-[#0B1026] shadow-sm'
                    : 'border-slate-800 bg-[#0B1026]/40 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl border shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-[#7C3AED] to-[#38BDF8] text-white border-cyan-400'
                        : 'bg-[#050816] text-[#64748B] border-slate-700'
                    }`}
                  >
                    {isUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8]">{ach.description}</p>
                    
                    <div className="pt-2 text-[10px] text-[#C4B5FD] font-semibold">
                      Requirement: {ach.requirement}
                    </div>

                    {isUnlocked && ach.unlockedAt && (
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Unlocked on {new Date(ach.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
