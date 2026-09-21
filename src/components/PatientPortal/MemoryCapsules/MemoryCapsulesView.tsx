import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Lock, 
  Unlock, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Heart, 
  Calendar, 
  Music,
  Send,
  Plus
} from 'lucide-react';
import { MemoryCapsule, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface MemoryCapsulesViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

export const MemoryCapsulesView: React.FC<MemoryCapsulesViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [capsules, setCapsules] = useState<MemoryCapsule[]>([]);
  const [selectedCapsule, setSelectedCapsule] = useState<MemoryCapsule | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const list = localDB.getMemoryCapsules(patientId);
    setCapsules(list);
    if (list.length > 0) {
      setSelectedCapsule(list[0]);
    }
  }, [patientId]);

  const handleOpenCapsule = (cap: MemoryCapsule) => {
    setSelectedCapsule(cap);
    if (!cap.isUnlocked) {
      // Check if unlock date has passed or allow unboxing
      localDB.unlockMemoryCapsule(cap.id);
      cap.isUnlocked = true;
      audioService.playChime(780);
      audioService.speak(`Surprise unlocked! A special package from ${cap.senderName}: ${cap.title}.`);
    } else {
      audioService.speak(`Opening memory capsule: ${cap.title}.`);
    }
  };

  const handleSpeakNote = (cap: MemoryCapsule) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    const text = `From ${cap.senderName}, your loving ${cap.senderRelation}: ${cap.personalNote}`;
    audioService.speak(text, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] dark:bg-[#1A211D] text-[#26302A] dark:text-[#E2EBD9]">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/80 dark:bg-[#202924]/80 backdrop-blur-md border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-7 h-7 text-[#C66F4E]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Memory Capsules (স্মৃতি উপহাৰ)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Heartwarming surprise gift packages and audio letters from children and grandchildren
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Capsules List */}
        <div className="lg:col-span-5 p-4 sm:p-6 overflow-y-auto border-r border-[#E2EBD9] dark:border-stone-800 space-y-4 max-h-[calc(100vh-200px)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Your Family Gift Packages ({capsules.length})
          </h2>
          {capsules.map(cap => {
            const isSelected = selectedCapsule?.id === cap.id;
            return (
              <div
                key={cap.id}
                onClick={() => handleOpenCapsule(cap)}
                className={`cursor-pointer p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-[#C66F4E] bg-[#F8EBD8]/50 dark:bg-[#C66F4E]/20 shadow-md ring-2 ring-[#C66F4E]/20'
                    : cap.isUnlocked
                      ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                      : 'bg-stone-100 dark:bg-stone-900/50 border-dashed border-stone-300 dark:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      cap.isUnlocked ? 'bg-[#C66F4E] text-white shadow-xs' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}>
                      {cap.isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {cap.occasion}
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#26302A] dark:text-[#FFFDF7] mt-1">
                        {cap.title}
                      </h3>
                      <p className="text-xs font-medium text-[#58745A] dark:text-[#789477] mt-0.5">
                        From: {cap.senderName} ({cap.senderRelation})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unboxed Capsule Viewer */}
        <div className="lg:col-span-7 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-200px)] flex flex-col justify-center">
          {selectedCapsule ? (
            <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#202924] rounded-3xl p-6 sm:p-10 border border-[#E2EBD9] dark:border-stone-800 shadow-xl space-y-6 animate-fade-in">
              {/* Photo Attachment */}
              {selectedCapsule.photos.length > 0 && (
                <div className="rounded-3xl overflow-hidden h-60 sm:h-72 w-full border border-stone-200 dark:border-stone-700 shadow-md">
                  <img
                    src={selectedCapsule.photos[0]}
                    alt={selectedCapsule.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C66F4E]">
                    {selectedCapsule.occasion}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] mt-0.5">
                    {selectedCapsule.title}
                  </h2>
                  <p className="text-sm font-semibold text-stone-500 mt-1 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    Sent with love by {selectedCapsule.senderName} ({selectedCapsule.senderRelation})
                  </p>
                </div>

                <button
                  onClick={() => handleSpeakNote(selectedCapsule)}
                  className={`p-3.5 rounded-full transition shadow-md ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-[#58745A] text-white hover:bg-[#435945]'
                  }`}
                  aria-label="Listen to family audio letter"
                >
                  {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>

              {/* Personal Letter Text */}
              <div className="p-6 rounded-2xl bg-[#FFFDF7] dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <p className="font-serif text-lg sm:text-xl leading-relaxed text-stone-800 dark:text-stone-200 italic">
                  "{selectedCapsule.personalNote}"
                </p>
              </div>

              {selectedCapsule.musicTheme && (
                <div className="p-4 rounded-2xl bg-[#E2EBD9]/50 dark:bg-stone-800/80 border border-[#58745A]/20 flex items-center gap-3">
                  <Music className="w-5 h-5 text-[#58745A] dark:text-[#789477]" />
                  <span className="text-xs font-semibold text-[#26302A] dark:text-stone-200">
                    Background Theme: {selectedCapsule.musicTheme}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 text-stone-500">
              <Gift className="w-12 h-12 mx-auto text-stone-400 mb-2" />
              <p className="font-serif text-lg">Select a memory capsule to unbox its love</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
