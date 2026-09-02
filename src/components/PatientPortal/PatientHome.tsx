import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mic, 
  Sparkles, 
  Brain, 
  Camera, 
  Heart, 
  Play, 
  ShieldAlert, 
  Users, 
  Radio, 
  Clock, 
  Volume2, 
  Sun, 
  SunMedium, 
  Sunset, 
  Moon, 
  CheckCircle2,
  Calendar,
  Sparkle
} from 'lucide-react';
import { 
  PatientProfile, 
  CaregiverInstruction, 
  SupportedLanguage, 
  GameCategory,
  CognitiveGameDefinition
} from '../../types';
import { t } from '../../lib/translations';
import { audioService } from '../../lib/audioService';
import { localDB } from '../../lib/storage';
import { getAIMoodRecommendedGames } from '../../lib/adaptiveEngine';
import { 
  getCurrentTimeSlot, 
  getTimelineGreeting, 
  TimeOfDaySlot 
} from '../../lib/timelineGreeting';

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
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patient,
  instructions,
  language,
  onOpenVoice,
  onStartGame,
  onOpenMemories,
  onOpenReminders,
  onOpenRelaxation,
  onOpenRadio,
  onOpenFamily,
  onOpenBaseline,
  onOpenSafeHaven,
  onOpenMoodCheck,
  onOpenSOS,
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

  const activeInstruction = instructions.find((i) => i.appliedStatus === 'ACTIVE');
  const preferredTheme = activeInstruction?.structuredRule?.preferredTheme || 'Assam Tea Gardens & Folk Music';

  const latestMoodLog = localDB.getLatestMood();
  const currentMood = latestMoodLog?.mood || 'CALM';
  const recentSessions = localDB.getGameSessions(patient.id);

  // AI-DRIVEN RECOMMENDATION: strictly selects Top 10 from 30 games based on mood
  const recommendedGames = useMemo(() => {
    return getAIMoodRecommendedGames(patient, currentMood, recentSessions, instructions);
  }, [patient, currentMood, recentSessions, instructions]);

  const handleQuickTap = (cb: () => void) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    cb();
  };

  const handleSpeakGreeting = () => {
    if (isPlayingAudio) {
      audioService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const spokenGreeting = `${timelineGreeting.greetingText}, ${patient.name}! ${timelineGreeting.subtext}`;
    audioService.speak(
      spokenGreeting,
      () => {
        setIsPlayingAudio(false);
      }
    );
  };

  const getMoodBadgeLabel = () => {
    switch (currentMood) {
      case 'HAPPY':
        return { label: 'Cheerful & Energized', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'CALM':
        return { label: 'Calm & Peaceful', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'ANXIOUS':
        return { label: 'Gentle Comfort Mode', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'TIRED':
        return { label: 'Restful Slow Pace', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'SAD':
        return { label: 'Warm Reminiscence Mode', color: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'Daily Balanced Mode', color: 'bg-stone-100 text-stone-900 border-stone-300' };
    }
  };

  const moodBadge = getMoodBadgeLabel();

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Dynamic Warm Time-of-Day Greeting & Voice Banner */}
      <div className={`bg-gradient-to-br ${timelineGreeting.gradientBg} rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500`}>
        <div className="absolute -right-8 -bottom-8 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-8 text-white/10 pointer-events-none">
          {renderSlotIcon(activeSlot, 'w-48 h-48 opacity-15')}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
                {renderSlotIcon(activeSlot, 'w-3.5 h-3.5 text-amber-200')}
                <span>{timelineGreeting.periodName} • {timelineGreeting.timeRange}</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${moodBadge.color}`}>
                Mood: {moodBadge.label}
              </span>
            </div>

            {/* Dynamic Greeting Text based on timeline */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {timelineGreeting.greetingText}, {patient.name.split(' ')[0]}!
            </h1>
            
            {/* Dynamic Time-of-Day Encouragement Subtext */}
            <p className="text-white/90 text-sm sm:text-base font-medium mt-2 leading-relaxed">
              {timelineGreeting.subtext}
            </p>

            {/* Routine & Audio Listen Button */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                onClick={handleSpeakGreeting}
                className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-extrabold flex items-center gap-1.5 border border-white/30 transition active:scale-95 shadow-xs"
                title="Listen to this greeting in your regional language"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-amber-300' : ''}`} />
                <span>{isPlayingAudio ? 'Speaking Greeting...' : 'Listen Greeting'}</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 text-white/90 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Routine: {timelineGreeting.routineHint}</span>
              </div>
            </div>
          </div>

          {/* Action triggers: SOS, Face Check, Talk to Me */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {onOpenSOS && (
              <button
                onClick={() => handleQuickTap(onOpenSOS)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-300 flex flex-col items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ring-4 ring-rose-300/40"
                aria-label="Emergency SOS Caregiver Alert"
                title="Emergency SOS Alert"
              >
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-100 mt-0.5">
                  SOS Alert
                </span>
              </button>
            )}

            {onOpenMoodCheck && (
              <button
                onClick={() => handleQuickTap(onOpenMoodCheck)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-2 border-white/40 flex flex-col items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
                aria-label="Check Facial Mood"
                title="Camera Facial Mood AI"
              >
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-amber-100" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white mt-0.5">
                  Face Check
                </span>
              </button>
            )}

            <button
              onClick={() => handleQuickTap(onOpenVoice)}
              className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-white text-amber-800 hover:bg-amber-50 flex flex-col items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ring-8 ring-white/30 shrink-0"
              aria-label="Talk to Mind Mithra AI Voice Assistant"
            >
              <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-amber-700 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900 mt-1">
                Talk to Me
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Bar: Family Tree, Reminders, Memory Vault, Reminiscence Radio */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => handleQuickTap(onOpenFamily)}
          className="p-4 bg-white hover:bg-amber-50 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-3 transition group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">Family Circle</p>
            <p className="text-sm font-extrabold text-stone-900 truncate">Family Tree</p>
          </div>
        </button>

        <button
          onClick={() => handleQuickTap(onOpenMemories)}
          className="p-4 bg-white hover:bg-amber-50 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-3 transition group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Heart className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">Photo Vault</p>
            <p className="text-sm font-extrabold text-stone-900 truncate">Memories</p>
          </div>
        </button>

        <button
          onClick={() => handleQuickTap(onOpenReminders)}
          className="p-4 bg-white hover:bg-amber-50 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-3 transition group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">Daily Health</p>
            <p className="text-sm font-extrabold text-stone-900 truncate">Reminders</p>
          </div>
        </button>

        <button
          onClick={() => handleQuickTap(onOpenRadio)}
          className="p-4 bg-white hover:bg-amber-50 rounded-2xl border border-stone-200 shadow-xs flex items-center space-x-3 transition group text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Radio className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-500">Folk Melodies</p>
            <p className="text-sm font-extrabold text-stone-900 truncate">Radio</p>
          </div>
        </button>
      </div>

      {/* Top 1 Hero Recommended Game */}
      {recommendedGames.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-400 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shrink-0 shadow-xs">
              🧠
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  #1 AI Mood Recommendation
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {recommendedGames[0].game.targetDomain} • Level {recommendedGames[0].recommendedDifficulty}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                {recommendedGames[0].game.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                {recommendedGames[0].recommendationReason}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleQuickTap(() => onStartGame(recommendedGames[0].game.category, recommendedGames[0].game))}
            className="w-full sm:w-auto px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play Now</span>
          </button>
        </div>
      )}

      {/* 3. AI-FILTERED 10 RECOMMENDED COGNITIVE ACTIVITIES (From 30 Games Library) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900 uppercase tracking-wider">
                AI Mood-Curated Activities (Top 10 of 30 Games)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                AI Filtered
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Strictly recommending the 10 most beneficial activities in sequence based on your mood ({currentMood}) and cognitive baseline.
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1 bg-stone-100 text-stone-700 rounded-full border border-stone-300 self-start sm:self-center">
            Showing 10 / 30 Catalog
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {recommendedGames.map((item, idx) => {
            const g = item.game;
            return (
              <button
                key={g.id}
                onClick={() => handleQuickTap(() => onStartGame(g.category, g))}
                className="p-4 sm:p-5 rounded-3xl bg-white hover:bg-amber-50/70 border-2 border-stone-200 hover:border-amber-400 text-left transition-all transform hover:-translate-y-0.5 active:scale-98 shadow-xs flex items-center gap-4 group"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-700 text-white flex items-center justify-center text-2xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Brain className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Rank #{idx + 1} • {g.targetDomain}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {item.highlightBadge}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-base sm:text-lg mt-0.5 truncate">
                    {g.title}
                  </h4>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    {g.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
