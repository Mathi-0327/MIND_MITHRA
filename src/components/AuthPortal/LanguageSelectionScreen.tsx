import React, { useState } from 'react';
import { 
  Languages, 
  Volume2, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  VolumeX
} from 'lucide-react';
import { SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../lib/translations';
import { audioService } from '../../lib/audioService';
import { ManasLogo } from '../Brand/ManasLogo';

interface LanguageSelectionScreenProps {
  patientName: string;
  initialLanguage: SupportedLanguage;
  onSelectLanguageAndContinue: (lang: SupportedLanguage) => void;
  onBackToLogin: () => void;
}

interface LanguageAudioSample {
  code: SupportedLanguage;
  nativeTitle: string;
  sampleSpokenText: string;
  description: string;
}

const REGIONAL_SAMPLES: Record<SupportedLanguage, LanguageAudioSample> = {
  as: {
    code: 'as',
    nativeTitle: 'অসমীয়া (Assamese)',
    sampleSpokenText: 'নমস্কাৰ! মই মাইণ্ড মিত্ৰ (Mind Mithra), আপোনাৰ মৰমৰ জ্ঞান সংগী। আজি আপুনি কেনে অনুভৱ কৰিছে?',
    description: 'Brahmaputra Valley & Assam',
  },
  bn: {
    code: 'bn',
    nativeTitle: 'বাংলা (Bengali)',
    sampleSpokenText: 'নমস্কার! আমি মাইন্ড মিত্র (Mind Mithra), আপনার আপনজন সঙ্গী। আসুন আজকের দিনটি সুন্দরভাবে শুরু করি।',
    description: 'Tripura & Barak Valley',
  },
  hi: {
    code: 'hi',
    nativeTitle: 'हिन्दी (Hindi)',
    sampleSpokenText: 'नमस्ते! मैं माइंड मित्र (Mind Mithra) हूँ, आपका आत्मीय साथी। आज हम मिलकर कुछ अच्छी यादें ताज़ा करेंगे।',
    description: 'National Hindi Voice',
  },
  mni: {
    code: 'mni',
    nativeTitle: 'মৈতৈলোন্ (Manipuri)',
    sampleSpokenText: 'খুরুমজরি! ঐ মাইণ্ড মিত্র (Mind Mithra)নি, অদোমগী নুংশিরবা খোঙলোই। ঙসিগী নুমিৎ অসি ফজনা হৌদোকসি।',
    description: 'Manipur & Imphal Valley',
  },
  kha: {
    code: 'kha',
    nativeTitle: 'Ka Ktien Khasi (Khasi)',
    sampleSpokenText: 'Khublei! Nga dei u Mind Mithra, u nongiarap jong phi. To ngin pynsuk ia ka jingmut mynta ka sngi.',
    description: 'Meghalaya & Shillong Hills',
  },
  lus: {
    code: 'lus',
    nativeTitle: 'Mizo ṭawng (Mizo)',
    sampleSpokenText: 'Chibai! Mind Mithra ka ni a, i tanpuitu duh tak. Vawiin chu hlim takin hun i hmang ang hmiang.',
    description: 'Mizoram & Lushai Hills',
  },
  en: {
    code: 'en',
    nativeTitle: 'English',
    sampleSpokenText: 'Hello dear friend! I am Mind Mithra, your loving cognitive companion. I am right here by your side.',
    description: 'Clear & Warm Voice',
  },
};

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  patientName,
  initialLanguage = 'en',
  onSelectLanguageAndContinue,
  onBackToLogin,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLanguage);
  const [playingSample, setPlayingSample] = useState<SupportedLanguage | null>(null);

  const handlePlayVoiceSample = (e: React.MouseEvent, lang: SupportedLanguage) => {
    e.stopPropagation();
    const sample = REGIONAL_SAMPLES[lang];
    if (!sample) return;

    audioService.stopSpeaking();
    setPlayingSample(lang);

    audioService.speak(
      sample.sampleSpokenText,
      () => {
        setPlayingSample(null);
      },
      { fallbackOnly: false }
    );
  };

  const handleSelectLang = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    audioService.playFeedbackSound('GENTLE_TAP');

    const sample = REGIONAL_SAMPLES[lang];
    if (sample) {
      setPlayingSample(lang);
      audioService.speak(
        sample.sampleSpokenText,
        () => setPlayingSample(null),
        { fallbackOnly: false }
      );
    }
  };

  const handleConfirmAndEnter = () => {
    audioService.stopSpeaking();
    audioService.playFeedbackSound('SUCCESS');
    onSelectLanguageAndContinue(selectedLang);
  };

  const currentSample = REGIONAL_SAMPLES[selectedLang];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Warm Ambient Glow */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-xl bg-white border border-stone-200/90 rounded-3xl shadow-[0_20px_50px_-15px_rgba(180,83,9,0.15)] overflow-hidden z-10 flex flex-col">
        
        {/* Top Glow Bar matching App Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

        {/* Top Navigation */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <ManasLogo size="sm" theme="amber" showTagline={false} />

          <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-xl">
            Voice Setup
          </span>
        </div>

        {/* Title */}
        <div className="px-6 pt-5 pb-2 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Choose Voice Language
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            {patientName ? `Personalized for ${patientName}` : 'Select your regional dialect'}
          </p>
        </div>

        {/* Active Selection Banner in Warm App Style */}
        <div className="mx-6 my-2 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Languages className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-stone-900 truncate">
                {currentSample?.nativeTitle}
              </p>
              <p className="text-[11px] text-amber-800 font-semibold truncate">
                {currentSample?.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handlePlayVoiceSample(e, selectedLang)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              playingSample === selectedLang
                ? 'bg-amber-600 text-white animate-pulse shadow-md'
                : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/70'
            }`}
          >
            {playingSample === selectedLang ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Playing...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Sample Voice</span>
              </>
            )}
          </button>
        </div>

        {/* 7 Regional Languages Grid */}
        <div className="p-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[330px] overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            const sample = REGIONAL_SAMPLES[lang.code];
            const isPlaying = playingSample === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => handleSelectLang(lang.code)}
                className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 text-stone-900 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : lang.code.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className={`font-extrabold text-xs sm:text-sm truncate ${isSelected ? 'text-stone-900' : 'text-stone-800'}`}>
                      {lang.nativeName}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate font-medium">
                      {lang.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handlePlayVoiceSample(e, lang.code)}
                  className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-600 text-white'
                      : 'bg-white border border-stone-200 text-stone-500 hover:text-amber-700'
                  }`}
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-stone-50 border-t border-stone-150 flex items-center justify-end">
          <button
            type="button"
            onClick={handleConfirmAndEnter}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white font-black text-base shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
          >
            <span>Open Companion</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
