import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { ManasLogo } from '../Brand/ManasLogo';
import { audioService } from '../../lib/audioService';

interface OpeningSplashScreenProps {
  onComplete: () => void;
}

const REGIONAL_GREETINGS = [
  { lang: 'অসমীয়া (Assamese)', text: 'নমস্কাৰ', sub: 'আপোনাৰ স্মৃতি আৰু শান্তিৰ সংগী' },
  { lang: 'বাংলা (Bengali)', text: 'নমস্কার', sub: 'আপনার স্মৃতি ও মনন সঙ্গী' },
  { lang: 'মৈতৈলোন্ (Manipuri)', text: 'খুরুমজরি', sub: 'অহলশিংগী নুংশি খোঙলোই' },
  { lang: 'Khasi', text: 'Khublei', sub: 'U nongïarap na ka bynta ka jingmut' },
  { lang: 'Mizo', text: 'Chibai', sub: 'I hriatna leh rilru hahdamna' },
  { lang: 'हिन्दी (Hindi)', text: 'नमस्ते', sub: 'आपकी याददाश्त और शांति का साथी' },
  { lang: 'English', text: 'Welcome', sub: 'Culturally Grounded Cognitive Care' },
];

export const OpeningSplashScreen: React.FC<OpeningSplashScreenProps> = ({ onComplete }) => {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play warm gentle entry chime
    audioService.playFeedbackSound('GENTLE_TAP');

    // Cycle through greetings every 600ms
    const greetingInterval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % REGIONAL_GREETINGS.length);
    }, 600);

    // Progress bar towards auto-completion (3.5s)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(greetingInterval);
          handleFinish();
          return 100;
        }
        return prev + 2.5;
      });
    }, 85);

    return () => {
      clearInterval(greetingInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  const currentGreeting = REGIONAL_GREETINGS[greetingIndex];

  return (
    <div
      id="manas-opening-splash"
      className={`fixed inset-0 z-50 bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950 text-white flex flex-col justify-between items-center p-6 select-none transition-opacity duration-400 ${
        isExiting ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="w-full max-w-lg flex items-center justify-between z-10 pt-4">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800/80 border border-stone-700 text-stone-300 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>North East India Dementia & Cognitive Companion</span>
        </div>

        <button
          onClick={handleFinish}
          className="text-xs font-bold text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full bg-stone-850 hover:bg-stone-800 border border-stone-700/60 cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centerpiece Logo & Cycling Greeting */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-6 max-w-md">
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl scale-125 animate-pulse" />
          <div className="relative p-5 rounded-3xl bg-stone-900/90 border border-amber-500/30 shadow-2xl">
            <ManasLogo size="lg" theme="dark" animated={true} showTagline={false} />
          </div>
        </div>

        {/* Dynamic Regional Greeting */}
        <div className="min-h-[100px] flex flex-col items-center justify-center space-y-2 animate-fade-in key={greetingIndex}">
          <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight transition-all duration-300">
            {currentGreeting.text}
          </span>
          <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">
            {currentGreeting.lang}
          </p>
          <p className="text-sm text-stone-300 font-medium">
            {currentGreeting.sub}
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar & Direct Action */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-4 z-10 pb-6">
        <button
          onClick={handleFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <span>Enter Mind Mithra Care</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Auto progress indicator */}
        <div className="w-full space-y-1.5">
          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-stone-500 font-semibold px-1">
            <span>Loading Culturally-Adapted Assets</span>
            <span>{Math.min(100, Math.round(progress))}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
