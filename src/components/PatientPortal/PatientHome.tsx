import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mic, 
  Heart, 
  Gamepad2, 
  Users, 
  BookOpen, 
  Clock, 
  Volume2, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  Menu, 
  Radio, 
  ArrowRight 
} from 'lucide-react';
import { 
  PatientProfile, 
  CaregiverInstruction, 
  SupportedLanguage, 
  GameCategory,
  CognitiveGameDefinition
} from '../../types';
import { audioService } from '../../lib/audioService';
import { 
  getCurrentTimeSlot, 
  getTimelineGreeting, 
  TimeOfDaySlot 
} from '../../lib/timelineGreeting';
import { getAIMoodRecommendedGames } from '../../lib/adaptiveEngine';
import { COGNITIVE_GAMES_CATALOG } from '../../lib/cognitiveGamesCatalog';

interface PatientHomeProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onOpenVoice: () => void;
  onStartGame: (category: GameCategory, gameDef?: CognitiveGameDefinition) => void;
  onOpenMemories: () => void;
  onOpenReminders: () => void;
  onOpenRelaxation: () => void;
  onOpenRadio: () => void;
  onOpenFamily: () => void;
  onOpenBaseline: () => void;
  onOpenSafeHaven: () => void;
  onOpenMoodCheck?: () => void;
  onOpenSOS?: () => void;
  onOpenMemoryWeb?: () => void;
  onOpenElderKnowledge?: () => void;
  onOpenRoutes?: () => void;
  onOpenLifeSkills?: () => void;
  onOpenSoundscapes?: () => void;
  onOpenDailyJournal?: () => void;
  onOpenStoryBuilder?: () => void;
  onOpenReminiscenceTheater?: () => void;
  onOpenMemoryQuiz?: () => void;
  onOpenMemoryCapsules?: () => void;
  onOpenMemoryChain?: () => void;
  onOpenConfidenceMap?: () => void;
  onOpenTodaysWhy?: () => void;
  onOpenMenu?: () => void;
  onOpenGamesCatalog?: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patient,
  instructions = [],
  language,
  onOpenVoice,
  onStartGame,
  onOpenMemories,
  onOpenReminders,
  onOpenRadio,
  onOpenFamily,
  onOpenDailyJournal,
  onOpenMenu,
  onOpenGamesCatalog,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Keep live time ticking every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const activeSlot: TimeOfDaySlot = getCurrentTimeSlot(currentDate);

  const timelineGreeting = useMemo(() => {
    return getTimelineGreeting(language, activeSlot, currentDate);
  }, [language, activeSlot, currentDate]);

  // Compute AI recommended game based on cognitive performance data, baseline chart & mood
  const aiRecommendedGame = useMemo(() => {
    try {
      const recommendations = getAIMoodRecommendedGames(patient, 'CALM', [], instructions);
      if (recommendations.length > 0 && recommendations[0]?.game) {
        return recommendations[0];
      }
    } catch {
      // Fallback
    }
    return {
      game: COGNITIVE_GAMES_CATALOG[0],
      suitabilityScore: 92,
      recommendationReason: 'Targeted memory reinforcement based on your cognitive profile.',
      recommendedDifficulty: 2,
      highlightBadge: 'AI Pick for You',
    };
  }, [patient, instructions]);

  const handleQuickTap = (cb: () => void) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    cb();
  };

  const handleStartRecommendedGame = () => {
    handleQuickTap(() => {
      if (aiRecommendedGame?.game) {
        onStartGame(aiRecommendedGame.game.category, aiRecommendedGame.game);
      } else {
        onStartGame('MEMORY');
      }
    });
  };

  const handleSpeakGreeting = () => {
    if (isPlayingAudio) {
      audioService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const firstName = patient.name.split(' ')[0];
    const spokenGreeting = `${timelineGreeting.greetingText}, ${firstName}! How are you feeling today? ${timelineGreeting.subtext}`;
    const langCode = language === 'en' ? 'en-IN' : `${language}-IN`;
    audioService.speak(
      spokenGreeting,
      () => {
        setIsPlayingAudio(false);
      },
      { langCode }
    );
  };

  const renderSlotIcon = (slot: TimeOfDaySlot, className: string = 'w-5 h-5') => {
    switch (slot) {
      case 'MORNING':
        return <Sun className={className} />;
      case 'AFTERNOON':
        return <SunMedium className={className} />;
      case 'EVENING':
        return <Sunset className={className} />;
      case 'NIGHT':
        return <Moon className={className} />;
    }
  };

  const firstName = patient.name.split(' ')[0];

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 select-none bg-[#FAF7F0] min-h-screen">
      
      {/* ============================================================ */}
      {/* 1. TOP: WARM BRIGHT PERSONAL GREETING (Visible & Calm)        */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-[#FFF9EE] via-[#FFF2D8] to-[#FDE8B5] rounded-3xl p-5 sm:p-6 border-2 border-[#E9C37A] shadow-sm relative overflow-hidden text-[#2D2115]">
        {/* Subtle decorative nature glint */}
        <div className="absolute top-2 right-3 text-[#E29B27]/25 pointer-events-none">
          {renderSlotIcon(activeSlot, 'w-24 h-24')}
        </div>

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 text-[#7C4A1E] text-xs font-black border border-[#ECD1A4] shadow-xs">
            {renderSlotIcon(activeSlot, 'w-4 h-4 text-[#D97706]')}
            <span>{timelineGreeting.periodName}</span>
          </div>

          <h1 
            className="text-2xl sm:text-3xl font-black text-[#2D2115] tracking-tight leading-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {timelineGreeting.greetingText}, {firstName} 🌿
          </h1>

          <p className="text-[#5A4533] text-sm sm:text-base font-bold leading-snug">
            How are you feeling today?
          </p>

          {/* Gentle Audio Listen Greeting Button */}
          <div className="pt-2">
            <button
              onClick={handleSpeakGreeting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FFFDF7] text-[#4A2E12] text-xs font-black border-2 border-[#E5BD78] shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Listen to this greeting out loud"
            >
              <Volume2 className={`w-4 h-4 text-[#D97706] ${isPlayingAudio ? 'animate-bounce text-[#B45309]' : ''}`} />
              <span>{isPlayingAudio ? 'Speaking...' : 'Listen in your language'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. MAIN AREA: ONE PRIMARY INTERACTION (VOICE COMPANION)       */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FFF7E8] rounded-3xl p-6 sm:p-8 border-3 border-[#E5BD78] shadow-md text-center space-y-4 relative overflow-hidden">
        {/* Soft background warmth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF7] via-transparent to-[#FDF4DF]/50 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          {/* Cultural Warmth Flower Motif */}
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF0F0] border-2 border-[#FECDD3] flex items-center justify-center text-2xl shadow-xs">
            🌸
          </div>

          <h2 
            className="text-2xl sm:text-3xl font-black text-[#2D2115] tracking-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Talk to Me
          </h2>

          <p className="text-[#5A4533] text-sm sm:text-base font-bold max-w-sm mx-auto">
            "I'm listening. Tell me about your day."
          </p>
        </div>

        {/* Large Central Microphone Touch Button (Sunny, Vibrant, Clear) */}
        <div className="relative z-10 pt-2 flex flex-col items-center justify-center">
          <button
            onClick={() => handleQuickTap(onOpenVoice)}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706] hover:from-[#F59E0B] hover:to-[#B45309] text-stone-950 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl border-4 border-white ring-8 ring-[#FDE68A]/70 active:scale-95 transition-all cursor-pointer group"
            aria-label="Tap to speak with Voice Companion"
          >
            <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-stone-950 group-hover:scale-110 transition-transform stroke-[2.6]" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-stone-950 mt-1">
              Speak
            </span>
          </button>
          <span className="text-xs font-bold text-[#6B543E] mt-3">
            Tap the microphone anytime to talk
          </span>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. BELOW: 4 SIMPLE PRIMARY ACTION CARDS (Play, Memories, Day, Family) */}
      {/* ============================================================ */}
      <section className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#6B543E] px-1">
          What would you like to do?
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Play a Game (Warm Sunny Amber with Dynamic AI Recommendation) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white to-[#FEF3C7]/40 hover:bg-[#FFF3DC] border-2 border-[#F6D28B] hover:border-[#D97706] shadow-xs flex flex-col items-start justify-between min-h-[140px] sm:min-h-[155px] text-left transition-all group">
            <div className="w-full flex items-start justify-between">
              <button
                onClick={handleStartRecommendedGame}
                className="w-13 h-13 rounded-2xl bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform cursor-pointer"
                title={`Play ${aiRecommendedGame?.game?.title || "Today's Game"}`}
              >
                <Gamepad2 className="w-7 h-7 stroke-[2.4]" />
              </button>
              <button
                onClick={() => handleQuickTap(() => onOpenGamesCatalog ? onOpenGamesCatalog() : handleStartRecommendedGame())}
                className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-900 border border-amber-300 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>AI Suggested</span>
              </button>
            </div>
            <div className="mt-3 w-full">
              <button
                onClick={handleStartRecommendedGame}
                className="text-left w-full cursor-pointer"
              >
                <h4 
                  className="text-base sm:text-lg font-black text-[#2D2115] leading-snug"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Play a Game
                </h4>
                <p className="text-xs text-[#6B543E] font-medium mt-0.5 truncate">
                  AI Pick: <span className="font-bold text-amber-950">{aiRecommendedGame?.game?.title || "Memory Match"}</span>
                </p>
                <p className="text-[10px] text-amber-800/80 font-medium">
                  {aiRecommendedGame?.game?.targetDomain ? `Target: ${aiRecommendedGame.game.targetDomain}` : "Tailored to your cognitive chart"}
                </p>
              </button>
              {onOpenGamesCatalog && (
                <button
                  onClick={() => handleQuickTap(onOpenGamesCatalog)}
                  className="mt-2 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse all games →</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Memories (Warm Rose Peach) */}
          <button
            onClick={() => handleQuickTap(onOpenMemories)}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white to-[#FEE2E2]/40 hover:bg-[#FFE4E6] border-2 border-[#FCA5A5] hover:border-[#EF4444] shadow-xs flex flex-col items-start justify-between min-h-[120px] sm:min-h-[140px] text-left transition-all active:scale-98 cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#FEE2E2] text-[#B91C1C] border border-[#FECDD3] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div className="mt-3">
              <h4 
                className="text-base sm:text-lg font-black text-[#2D2115] leading-snug"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Memories
              </h4>
              <p className="text-xs text-[#6B543E] font-medium mt-0.5">
                Photos &amp; loved ones
              </p>
            </div>
          </button>

          {/* Card 3: My Day (Calm Herbal Sage) */}
          <button
            onClick={() => handleQuickTap(onOpenDailyJournal || onOpenReminders)}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white to-[#DCFCE7]/40 hover:bg-[#DCFCE7] border-2 border-[#86EFAC] hover:border-[#22C55E] shadow-xs flex flex-col items-start justify-between min-h-[120px] sm:min-h-[140px] text-left transition-all active:scale-98 cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div className="mt-3">
              <h4 
                className="text-base sm:text-lg font-black text-[#2D2115] leading-snug"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                My Day
              </h4>
              <p className="text-xs text-[#6B543E] font-medium mt-0.5">
                Peaceful reflections
              </p>
            </div>
          </button>

          {/* Card 4: Family (Peaceful Teal) */}
          <button
            onClick={() => handleQuickTap(onOpenFamily)}
            className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white to-[#CCFBF1]/40 hover:bg-[#CCFBF1] border-2 border-[#5EEAD4] hover:border-[#0D9488] shadow-xs flex flex-col items-start justify-between min-h-[120px] sm:min-h-[140px] text-left transition-all active:scale-98 cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div className="mt-3">
              <h4 
                className="text-base sm:text-lg font-black text-[#2D2115] leading-snug"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Family
              </h4>
              <p className="text-xs text-[#6B543E] font-medium mt-0.5">
                Family tree &amp; voices
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. TODAY: GENTLE ROUTINE & FAVORITE SOUND                     */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl p-5 border-2 border-[#E7D6C0] shadow-xs space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#6B543E]">
          Today
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Routine Snippet */}
          <button
            onClick={() => handleQuickTap(onOpenReminders)}
            className="p-3.5 rounded-2xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border-2 border-[#BBF7D0] flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#BBF7D0] text-[#166534] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-[#166534] uppercase tracking-wide">
                Routine
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#2D2115] truncate">
                {timelineGreeting.routineHint}
              </p>
            </div>
          </button>

          {/* Favorite Regional Sound */}
          <button
            onClick={() => handleQuickTap(onOpenRadio)}
            className="p-3.5 rounded-2xl bg-[#EEF2FF] hover:bg-[#E0E7FF] border-2 border-[#C7D2FE] flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C7D2FE] text-[#3730A3] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-[#3730A3] uppercase tracking-wide">
                Folk Sound
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#2D2115] truncate">
                Familiar tea garden melody
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. GENTLE SHORTCUT TO MENU (For easy discovery)               */}
      {/* ============================================================ */}
      {onOpenMenu && (
        <div className="pt-1 pb-4">
          <button
            onClick={() => handleQuickTap(onOpenMenu)}
            className="w-full py-4 px-5 rounded-2xl bg-[#FFF6E5] hover:bg-[#FDE8B5] text-[#422B14] font-black text-xs sm:text-sm border-2 border-[#E5BD78] shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 cursor-pointer"
          >
            <Menu className="w-4 h-4 stroke-[2.5]" />
            <span>More Activities, Tools &amp; Settings in Menu</span>
            <ArrowRight className="w-4 h-4 text-[#7C4A1E]" />
          </button>
        </div>
      )}

    </div>
  );
};
