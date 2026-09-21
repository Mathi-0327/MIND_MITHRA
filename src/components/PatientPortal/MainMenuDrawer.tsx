import React, { useEffect } from 'react';
import { 
  X, 
  Heart, 
  Users, 
  BookOpen, 
  Radio, 
  Film, 
  Network, 
  Gamepad2, 
  Gift, 
  Link2, 
  Coffee, 
  Compass, 
  Sprout, 
  Calculator, 
  Clock, 
  BarChart2, 
  HelpCircle, 
  Camera, 
  Settings, 
  ShieldAlert, 
  Shield, 
  Stethoscope,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PatientProfile, SupportedLanguage } from '../../types';
import { audioService } from '../../lib/audioService';

interface MainMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  currentLang: SupportedLanguage;
  onOpenMemories: () => void;
  onOpenFamily: () => void;
  onOpenDailyJournal: () => void;
  onOpenRadio: () => void;
  onOpenSoundscapes: () => void;
  onOpenStoryBuilder: () => void;
  onOpenReminiscenceTheater: () => void;
  onOpenMemoryWeb: () => void;
  onOpenGames: () => void;
  onOpenMemoryCapsules: () => void;
  onOpenMemoryChain: () => void;
  onOpenLifeSkills: () => void;
  onOpenRoutes: () => void;
  onOpenElderKnowledge: () => void;
  onOpenCalculator: () => void;
  onOpenReminders: () => void;
  onOpenConfidenceMap: () => void;
  onOpenTodaysWhy: () => void;
  onOpenMoodCheck: () => void;
  onOpenSettings: () => void;
  onOpenSafeHaven: () => void;
  onOpenSOS: () => void;
  onOpenCaregiverPin?: () => void;
  onOpenGamesCatalog?: () => void;
}

export const MainMenuDrawer: React.FC<MainMenuDrawerProps> = ({
  isOpen,
  onClose,
  patient,
  currentLang: _currentLang,
  onOpenMemories,
  onOpenFamily,
  onOpenDailyJournal,
  onOpenRadio,
  onOpenSoundscapes: _onOpenSoundscapes,
  onOpenStoryBuilder,
  onOpenReminiscenceTheater,
  onOpenMemoryWeb,
  onOpenGames,
  onOpenMemoryCapsules,
  onOpenMemoryChain,
  onOpenLifeSkills,
  onOpenRoutes,
  onOpenElderKnowledge,
  onOpenCalculator,
  onOpenReminders,
  onOpenConfidenceMap,
  onOpenTodaysWhy,
  onOpenMoodCheck,
  onOpenSettings,
  onOpenSafeHaven,
  onOpenSOS,
  onOpenCaregiverPin,
  onOpenGamesCatalog,
}) => {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (callback: () => void) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    onClose();
    callback();
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    onClick: () => void,
    accentBg: string = 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
  ) => {
    return (
      <button
        onClick={() => handleSelect(onClick)}
        className="w-full p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FFFDF7] border-2 border-[#EADFCB] hover:border-[#D97706] shadow-xs flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98] cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-12 h-12 rounded-2xl ${accentBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-sm sm:text-base text-[#2D2115] truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {title}
            </h4>
            <p className="text-xs text-[#6B543E] font-medium truncate mt-0.5">
              {description}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#8C6D4C] group-hover:text-[#2D2115] shrink-0 group-hover:translate-x-0.5 transition-transform stroke-[2.4]" />
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      {/* Main Drawer Container - Warm Ivory & Soft Gold */}
      <div className="w-full max-w-md sm:max-w-lg bg-[#FAF7F0] h-full flex flex-col shadow-2xl border-l-2 border-[#E5BD78] animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="bg-[#FFFDF7] px-5 py-4 border-b-2 border-[#EADFCB] flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-[#2D2115] text-base sm:text-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {patient.name}
                </h3>
              </div>
              <p className="text-xs text-[#6B543E] font-medium">
                Menu &amp; Features • {patient.region.split(' ')[0]}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-[#FFF8EE] hover:bg-[#FDE8B5] text-[#4A2E12] flex items-center justify-center border-2 border-[#E5BD78] shadow-xs transition-transform active:scale-90 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 stroke-[2.6]" />
          </button>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* 1. MY WORLD */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#8C4A32]">
                My World
              </h4>
            </div>
            <div className="space-y-2">
              {renderMenuItem(
                <Heart className="w-6 h-6 text-rose-700 stroke-[2.4]" />,
                'My Memories',
                'Cherished family photos and stories',
                onOpenMemories,
                'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECDD3]'
              )}

              {renderMenuItem(
                <Users className="w-6 h-6 text-amber-700 stroke-[2.4]" />,
                'Family Circle',
                'Your loved ones, children, and relations',
                onOpenFamily,
                'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              )}

              {renderMenuItem(
                <BookOpen className="w-6 h-6 text-emerald-700 stroke-[2.4]" />,
                'My Day (Daily Journal)',
                'Record peaceful thoughts and daily feelings',
                onOpenDailyJournal,
                'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
              )}

              {renderMenuItem(
                <Radio className="w-6 h-6 text-indigo-700 stroke-[2.4]" />,
                'Radio & Personal Sounds',
                'Familiar regional melodies and tea garden sounds',
                onOpenRadio,
                'bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]'
              )}

              {renderMenuItem(
                <Film className="w-6 h-6 text-yellow-700 stroke-[2.4]" />,
                'Story Builder',
                'Create lasting keepsake memories step-by-step',
                onOpenStoryBuilder,
                'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]'
              )}

              {renderMenuItem(
                <Sparkles className="w-6 h-6 text-purple-700 stroke-[2.4]" />,
                'Reminiscence Theater',
                'Gentle storytelling with soothing music',
                onOpenReminiscenceTheater,
                'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]'
              )}

              {renderMenuItem(
                <Network className="w-6 h-6 text-teal-700 stroke-[2.4]" />,
                'Memory Web',
                'See how your family and places connect',
                onOpenMemoryWeb,
                'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]'
              )}
            </div>
          </div>

          {/* 2. ACTIVITIES */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#8A5A1A]">
                Activities &amp; Games
              </h4>
            </div>
            <div className="space-y-2">
              {renderMenuItem(
                <Gamepad2 className="w-6 h-6 text-amber-800 stroke-[2.4]" />,
                'Cognitive Activities (All 30)',
                'Explore full catalog of memory, focus & daily games',
                onOpenGamesCatalog || onOpenGames,
                'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              )}

              {renderMenuItem(
                <Gift className="w-6 h-6 text-rose-700 stroke-[2.4]" />,
                'Memory Capsules',
                'Voice messages and special gifts from family',
                onOpenMemoryCapsules,
                'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECDD3]'
              )}

              {renderMenuItem(
                <Link2 className="w-6 h-6 text-teal-700 stroke-[2.4]" />,
                'Memory Chains',
                'Five comfortable questions about familiar moments',
                onOpenMemoryChain,
                'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]'
              )}

              {renderMenuItem(
                <Coffee className="w-6 h-6 text-orange-700 stroke-[2.4]" />,
                'Life Skills Simulator',
                'Tea garden routine and daily plant care',
                onOpenLifeSkills,
                'bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA]'
              )}

              {renderMenuItem(
                <Compass className="w-6 h-6 text-sky-700 stroke-[2.4]" />,
                'Familiar Routes',
                'Recognize your neighborhood streets and shops',
                onOpenRoutes,
                'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
              )}

              {renderMenuItem(
                <Sprout className="w-6 h-6 text-emerald-700 stroke-[2.4]" />,
                'Elder Knowledge',
                'Heritage proverbs, crafts, and regional wisdom',
                onOpenElderKnowledge,
                'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
              )}
            </div>
          </div>

          {/* 3. TOOLS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#136159]">
                Everyday Tools
              </h4>
            </div>
            <div className="space-y-2">
              {renderMenuItem(
                <Calculator className="w-6 h-6 text-teal-700 stroke-[2.4]" />,
                'Simple Calculator',
                'Large high-contrast buttons for daily counts',
                onOpenCalculator,
                'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]'
              )}

              {renderMenuItem(
                <Clock className="w-6 h-6 text-emerald-700 stroke-[2.4]" />,
                'Reminders & Routine',
                'Gentle medicine reminders and meal timings',
                onOpenReminders,
                'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
              )}

              {renderMenuItem(
                <BarChart2 className="w-6 h-6 text-indigo-700 stroke-[2.4]" />,
                'Confidence Map',
                'Your familiarity scores with family and places',
                onOpenConfidenceMap,
                'bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]'
              )}

              {renderMenuItem(
                <HelpCircle className="w-6 h-6 text-amber-700 stroke-[2.4]" />,
                "Today's Why",
                'Understand how each activity helps your mind stay strong',
                onOpenTodaysWhy,
                'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              )}
            </div>
          </div>

          {/* 4. PERSONAL & SETTINGS */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#544535]">
                Personal &amp; Safety
              </h4>
            </div>
            <div className="space-y-2">
              {renderMenuItem(
                <Camera className="w-6 h-6 text-amber-700 stroke-[2.4]" />,
                'Check-in (Face & Mood)',
                'Quick camera check-in to confirm how you feel',
                onOpenMoodCheck,
                'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
              )}

              {renderMenuItem(
                <Settings className="w-6 h-6 text-stone-700 stroke-[2.4]" />,
                'Settings & Accessibility',
                'Adjust text size, speaking speed, and contrast',
                onOpenSettings,
                'bg-[#E7E5E4] text-[#292524] border border-[#D6D3D1]'
              )}

              {renderMenuItem(
                <Shield className="w-6 h-6 text-emerald-700 stroke-[2.4]" />,
                'Safe Haven Reassurance',
                'Comforting message when feeling uneasy or confused',
                onOpenSafeHaven,
                'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
              )}

              {renderMenuItem(
                <ShieldAlert className="w-6 h-6 text-rose-700 stroke-[2.4]" />,
                'Emergency SOS',
                'Call family caregiver immediately for assistance',
                onOpenSOS,
                'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECDD3]'
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#FFFDF7] border-t-2 border-[#EADFCB] text-center">
          <p className="text-xs font-bold text-[#6B543E]">
            Mind Mithra • Elderly &amp; Dementia Friendly Companion
          </p>
        </div>
      </div>
    </div>
  );
};
