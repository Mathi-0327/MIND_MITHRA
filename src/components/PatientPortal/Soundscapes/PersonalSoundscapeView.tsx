import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Heart, 
  Sparkles, 
  ArrowLeft, 
  Music, 
  CloudRain, 
  Wind, 
  Users, 
  Clock, 
  Sliders
} from 'lucide-react';
import { PersonalSoundItem, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface PersonalSoundscapeViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

export const PersonalSoundscapeView: React.FC<PersonalSoundscapeViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [sounds, setSounds] = useState<PersonalSoundItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [timerMinutes, setTimerMinutes] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const data = localDB.getPersonalSounds(patientId);
    setSounds(data);
  }, [patientId]);

  const handleTogglePlay = (sound: PersonalSoundItem) => {
    if (playingId === sound.id) {
      audioService.stopSpeaking();
      audioService.stopSoundscape();
      setPlayingId(null);
      return;
    }

    audioService.stopSpeaking();
    audioService.stopSoundscape();
    setPlayingId(sound.id);

    if (sound.category === 'FAMILY_VOICE') {
      const familyNote = sound.sourcePerson?.includes('Ananya')
        ? "Deuta! I love you so much! Listen to this happy song I learned at school today!"
        : "Namaskar Deuta! You are safe and cherished in our warm home. Rest your mind peacefully.";
      audioService.speak(familyNote, () => setPlayingId(null), { fallbackOnly: false });
    } else if (sound.category === 'RAIN_WIND') {
      audioService.playSoundscape('RAIN');
    } else if (sound.category === 'TRADITIONAL_MUSIC') {
      audioService.playSoundscape('FLUTE');
    } else {
      audioService.playSoundscape('BIRDS');
    }
  };

  const handleStopAll = () => {
    audioService.stopSpeaking();
    audioService.stopSoundscape();
    setPlayingId(null);
  };

  const filteredSounds = selectedCategory === 'ALL'
    ? sounds
    : sounds.filter(s => s.category === selectedCategory);

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] dark:bg-[#1A211D] text-[#26302A] dark:text-[#E2EBD9]">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/80 dark:bg-[#202924]/80 backdrop-blur-md border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => {
                handleStopAll();
                onBack();
              }}
              className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-7 h-7 text-[#58745A] dark:text-[#789477]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Personal Soundscapes & My Sounds (মোৰ সংগীত)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Familiar comforting voices of loved ones, rain falling on courtyards, and soothing bamboo flutes
            </p>
          </div>
        </div>

        {playingId && (
          <button
            onClick={handleStopAll}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Pause className="w-4 h-4" /> Stop Audio
          </button>
        )}
      </div>

      {/* Filter Tabs & Sundowning Timer */}
      <div className="px-6 py-4 bg-[#F8EBD8]/40 dark:bg-[#202924]/50 border-b border-[#E2EBD9] dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'FAMILY_VOICE', 'TRADITIONAL_MUSIC', 'RAIN_WIND', 'NATURE'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#58745A] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              {cat === 'ALL' ? 'All Sounds' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400">
          <Clock className="w-4 h-4 text-[#58745A]" />
          <span>Timer:</span>
          {[10, 20, 30].map(mins => (
            <button
              key={mins}
              onClick={() => setTimerMinutes(mins)}
              className={`px-2.5 py-1 rounded-lg transition ${
                timerMinutes === mins
                  ? 'bg-[#58745A] text-white'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Sound Cards Grid */}
      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSounds.map(sound => {
            const isPlaying = playingId === sound.id;
            return (
              <div
                key={sound.id}
                onClick={() => handleTogglePlay(sound)}
                className={`cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden shadow-xs hover:shadow-md ${
                  isPlaying
                    ? 'border-[#58745A] bg-[#E2EBD9]/60 dark:bg-[#58745A]/20 ring-4 ring-[#58745A]/20 scale-[1.02]'
                    : 'bg-white dark:bg-[#202924] border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isPlaying ? 'bg-[#58745A] text-white animate-pulse' : 'bg-[#E2EBD9] dark:bg-stone-800 text-[#58745A] dark:text-[#789477]'
                  }`}>
                    {sound.category === 'FAMILY_VOICE' ? (
                      <Users className="w-7 h-7" />
                    ) : sound.category === 'RAIN_WIND' ? (
                      <CloudRain className="w-7 h-7" />
                    ) : sound.category === 'TRADITIONAL_MUSIC' ? (
                      <Music className="w-7 h-7" />
                    ) : (
                      <Wind className="w-7 h-7" />
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-sm ${
                    isPlaying ? 'bg-rose-500 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                  }`}>
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {sound.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#26302A] dark:text-[#FFFDF7] mt-2">
                    {sound.title}
                  </h3>
                  {sound.sourcePerson && (
                    <p className="text-xs font-semibold text-[#58745A] dark:text-[#789477] mt-1 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {sound.sourcePerson}
                    </p>
                  )}
                </div>

                {isPlaying && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-[#58745A] dark:text-[#789477] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#58745A] animate-ping" />
                    Playing soothing acoustic resonance...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
