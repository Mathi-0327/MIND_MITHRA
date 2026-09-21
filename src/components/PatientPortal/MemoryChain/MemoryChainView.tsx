import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Mic, 
  MicOff, 
  HelpCircle,
  Award
} from 'lucide-react';
import { MemoryChain, MemoryChainQuestion, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface MemoryChainViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

export const MemoryChainView: React.FC<MemoryChainViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [chains, setChains] = useState<MemoryChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<MemoryChain | null>(null);
  const [activeQIndex, setActiveQIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const list = localDB.getMemoryChains(patientId);
    setChains(list);
    if (list.length > 0) {
      setSelectedChain(list[0]);
      setCurrentAnswer(list[0].questions[0]?.answerText || '');
    }
  }, [patientId]);

  const activeQuestion: MemoryChainQuestion | undefined = selectedChain?.questions[activeQIndex];

  const handleSelectQuestion = (idx: number) => {
    if (!selectedChain) return;
    setActiveQIndex(idx);
    setCurrentAnswer(selectedChain.questions[idx]?.answerText || '');
  };

  const handleSpeakQuestion = (q: MemoryChainQuestion) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioService.speak(`${q.promptTitle}. ${q.promptText}`, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const handleVoiceAnswer = () => {
    setIsRecording(true);
    audioService.speak("Please tell me your answer gently. I am listening.", () => {
      setTimeout(() => {
        setIsRecording(false);
        const sampleAns = activeQuestion?.promptKey === 'FEELING'
          ? "Deep warmth, gratitude for our ancestors, and peace in my heart."
          : activeQuestion?.answerText || "We rejoiced together with music and family smiles.";
        setCurrentAnswer(sampleAns);
      }, 3000);
    });
  };

  const handleSaveAnswer = () => {
    if (!selectedChain || !activeQuestion) return;
    localDB.updateMemoryChainAnswer(selectedChain.id, activeQuestion.id, currentAnswer);
    audioService.playChime(660);
    audioService.speak("Link connected! Beautiful memory recall.");

    // Update state
    activeQuestion.answerText = currentAnswer;
    if (activeQIndex + 1 < selectedChain.questions.length) {
      setActiveQIndex(i => i + 1);
      setCurrentAnswer(selectedChain.questions[activeQIndex + 1]?.answerText || '');
    }
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
              <Link2 className="w-7 h-7 text-[#58745A] dark:text-[#789477]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Memory Chains (স্মৃতি শৃংখল)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Connect the threads of Who, Where, When, What, and Feeling into an unbroken recollection
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        {selectedChain && (
          <div className="space-y-6">
            {/* Chain Title & Visual Links Stepper */}
            <div className="bg-white dark:bg-[#202924] p-6 rounded-3xl border border-[#E2EBD9] dark:border-stone-800 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#58745A] dark:text-[#789477]">
                Active Memory Chain
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] mt-0.5">
                {selectedChain.chainTitle}
              </h2>

              {/* 5 Chain Links Bar */}
              <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
                {selectedChain.questions.map((q, idx) => {
                  const isDone = Boolean(q.answerText);
                  const isCurrent = activeQIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition ${
                        isCurrent
                          ? 'border-[#58745A] bg-[#E2EBD9]/60 dark:bg-[#58745A]/20 shadow-md ring-2 ring-[#58745A]/20'
                          : isDone
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 ${
                        isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className="text-xs font-bold uppercase">{q.promptKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Panel */}
            {activeQuestion && (
              <div className="bg-white dark:bg-[#202924] p-6 sm:p-8 rounded-3xl border-2 border-[#E2EBD9] dark:border-stone-800 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E2EBD9] text-[#58745A] dark:bg-stone-800 dark:text-[#789477]">
                    Link #{activeQIndex + 1}: {activeQuestion.promptKey}
                  </span>
                  <button
                    onClick={() => handleSpeakQuestion(activeQuestion)}
                    className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-[#58745A]"
                    aria-label="Listen to question"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                    {activeQuestion.promptTitle}
                  </h3>
                  <p className="text-base text-stone-600 dark:text-stone-300 mt-1 font-serif">
                    {activeQuestion.promptText}
                  </p>
                </div>

                {/* Voice Record Input */}
                <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-[#58745A]/20 rounded-2xl bg-[#FFFDF7] dark:bg-stone-900">
                  <button
                    onClick={handleVoiceAnswer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-md ${
                      isRecording ? 'bg-rose-500 text-white animate-ping' : 'bg-[#58745A] text-white hover:bg-[#435945]'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <span className="text-xs font-semibold text-stone-500 mt-2">
                    {isRecording ? 'Listening...' : 'Tap to speak your answer'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Your Recollection
                  </label>
                  <textarea
                    rows={3}
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    placeholder="Speak or type your memories here..."
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] font-serif text-base focus:ring-2 focus:ring-[#58745A] outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAnswer}
                    className="flex-1 py-3.5 px-6 rounded-2xl bg-[#58745A] hover:bg-[#435945] text-white font-serif font-bold text-lg shadow-md transition"
                  >
                    Confirm Memory Link
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
