import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { MemoryItem, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface ReminiscenceTheaterViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

interface ScenePrompt {
  question: string;
  options: { text: string; isCorrect: boolean }[];
}

export const ReminiscenceTheaterView: React.FC<ReminiscenceTheaterViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const list = localDB.getMemories();
    setMemories(list);
  }, [patientId]);

  const currentMem = memories[currentIndex];

  useEffect(() => {
    if (currentMem && isPlaying) {
      audioService.playSoundscape('FLUTE');
      const textToRead = `${currentMem.title}. In ${currentMem.location}, ${currentMem.eventDateOrYear}. ${currentMem.fullStory || currentMem.caption}`;
      setIsSpeaking(true);
      audioService.speak(textToRead, () => {
        setIsSpeaking(false);
        setShowPrompt(true);
      }, { fallbackOnly: false });
    }

    return () => {
      audioService.stopSpeaking();
      audioService.stopSoundscape();
    };
  }, [currentIndex, isPlaying]);

  const samplePrompts: Record<string, ScenePrompt> = {
    'mem-1': {
      question: 'What wonderful thing did you and Ananya do next at the forest lodge?',
      options: [
        { text: 'Enjoyed drinking warm spiced Assam tea together at the forest lodge veranda', isCorrect: true },
        { text: 'Rode a speedboat across the Brahmaputra waves', isCorrect: false },
        { text: 'Climbed the tall pine trees of Shillong peak', isCorrect: false }
      ]
    },
    'mem-2': {
      question: 'What festive sweets were shared after playing the Bihu Dhol drum?',
      options: [
        { text: 'Fresh sesame Pitha and sweet coconut Laru made with native jaggery', isCorrect: true },
        { text: 'Ice cream cones at the city supermarket', isCorrect: false },
        { text: 'Spicy chili noodles with tomatoes', isCorrect: false }
      ]
    }
  };

  const currentPrompt = (currentMem && samplePrompts[currentMem.id]) || {
    question: 'What cherished feeling stays in your heart from this sunny day?',
    options: [
      { text: 'Deep peace, family laughter, and togetherness', isCorrect: true },
      { text: 'Hurrying to catch a train', isCorrect: false },
      { text: 'Cold winter frost', isCorrect: false }
    ]
  };

  const handleSelectOption = (idx: number, isCorrect: boolean) => {
    setSelectedOption(idx);
    if (isCorrect) {
      audioService.playChime(660);
      audioService.speak('Spot on! Your memory is full of light and beauty.');
    } else {
      audioService.speak('That is close, but listen gently to the next story chapter.');
    }
  };

  const handleNextScene = () => {
    setSelectedOption(null);
    setShowPrompt(false);
    audioService.stopSpeaking();
    if (currentIndex + 1 < memories.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevScene = () => {
    setSelectedOption(null);
    setShowPrompt(false);
    audioService.stopSpeaking();
    setCurrentIndex(i => Math.max(0, i - 1));
  };

  if (!currentMem) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-stone-500">
        <p>No reminiscence photos available in your memory archive.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1A211D] text-[#FFFDF7] relative overflow-hidden">
      {/* Immersive Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
        <button
          onClick={() => {
            audioService.stopSpeaking();
            audioService.stopSoundscape();
            if (onBack) onBack();
          }}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition"
          aria-label="Exit Theater"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Tv className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Reminiscence Theater
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white transition"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Main Screen Visual Projection */}
      <div className="flex-1 relative flex items-center justify-center">
        {currentMem.imageUrl && (
          <img
            src={currentMem.imageUrl}
            alt={currentMem.title}
            className="w-full h-full object-cover filter brightness-90 transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

        {/* Story Text Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-20 max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#58745A] text-white">
                {currentMem.location} • {currentMem.eventDateOrYear}
              </span>
              <span className="text-xs text-stone-300">
                Scene {currentIndex + 1} of {memories.length}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
              {currentMem.title}
            </h2>
            <p className="text-base sm:text-xl font-serif leading-relaxed text-stone-200">
              {currentMem.fullStory || currentMem.caption}
            </p>

            {/* Interactive "What Happened Next?" Drawer */}
            {showPrompt && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg mb-3">
                  <Sparkles className="w-5 h-5" /> {currentPrompt.question}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentPrompt.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx, opt.isCorrect)}
                        className={`p-4 rounded-2xl text-left font-serif text-sm transition transform hover:scale-102 border-2 ${
                          isPicked
                            ? opt.isCorrect
                              ? 'bg-emerald-800/80 border-emerald-400 text-white ring-2 ring-emerald-400'
                              : 'bg-rose-900/80 border-rose-400 text-white'
                            : 'bg-white/10 hover:bg-white/20 border-white/20 text-stone-100'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nav Arrows */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrevScene}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold flex items-center gap-1 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleNextScene}
                className="px-6 py-2.5 rounded-xl bg-[#58745A] hover:bg-[#435945] text-white text-sm font-bold flex items-center gap-1.5 shadow-md"
              >
                Next Scene <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
