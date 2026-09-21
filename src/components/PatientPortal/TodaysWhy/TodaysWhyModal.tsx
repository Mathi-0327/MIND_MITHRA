import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Heart, 
  Sun, 
  Sunset, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SupportedLanguage } from '../../../types';
import { audioService } from '../../../lib/audioService';
import { localDB } from '../../../lib/storage';

interface TodaysWhyModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
}

export const TodaysWhyModal: React.FC<TodaysWhyModalProps> = ({
  patientId,
  isOpen,
  onClose,
  language = 'en',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const patient = localDB.getPatientProfile();

  const explanations = [
    {
      title: '1. Morning Assam Spiced Chai & Memory Cards',
      reason: 'Your morning tea ritual in the veranda brings familiar comfort. Pairing it with light Bihu card puzzles stimulates working memory while keeping your stress levels low.',
      icon: Sun,
      color: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40'
    },
    {
      title: '2. Familiar Route Recall to Mahabhairab Temple',
      reason: 'Practicing the 4 landmarks (Jasmine Gate, Banyan Tree, Lotus Pond, Temple Gate) strengthens spatial landmarks so you always feel confident and oriented.',
      icon: ShieldCheck,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40'
    },
    {
      title: '3. Evening Soothing Bamboo Flute Audio',
      reason: 'Around dusk (6:30 PM), ambient light dims. Gentle acoustic flute and daughter Priyanka\'s voice prevent evening disorientation and soothe the nervous system.',
      icon: Sunset,
      color: 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40'
    }
  ];

  const handleSpeakAll = () => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const fullText = `Here is Today's Why for ${patient.name}. ${explanations.map(e => `${e.title}: ${e.reason}`).join(' ')}`;
    setIsSpeaking(true);
    audioService.speak(fullText, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFDF7] dark:bg-[#202924] rounded-3xl max-w-xl w-full border border-[#E2EBD9] dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-white dark:bg-stone-900 border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C66F4E] text-white flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#26302A] dark:text-[#FFFDF7]">
                Today's Why (আজিৰ উদ্দেশ্য)
              </h2>
              <p className="text-xs text-stone-500">
                Why Mind Mithra recommended today's specific routine for you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-600 dark:text-stone-300 font-serif">
              Every activity in Mind Mithra is chosen with care to match your mood, circadian rhythm, and cultural memories:
            </p>
            <button
              onClick={handleSpeakAll}
              className={`p-2.5 rounded-full transition shadow-xs flex-shrink-0 ml-2 ${
                isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#58745A] text-white'
              }`}
              aria-label="Listen to explanation"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {explanations.map((exp, idx) => {
              const IconComp = exp.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#E2EBD9] dark:border-stone-800 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${exp.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7]">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                        {exp.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#E2EBD9]/60 dark:bg-stone-800 border border-[#58745A]/20 flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 flex-shrink-0" />
            <p className="text-xs font-serif text-[#26302A] dark:text-stone-200">
              Your comfort, safety, and dignity always guide every single recommendation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
