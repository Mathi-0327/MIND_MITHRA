import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Smile, 
  Heart, 
  Eye, 
  Brain, 
  Clock, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { CognitiveBaseline, SupportedLanguage } from '../../types';
import { audioService } from '../../lib/audioService';
import { localDB } from '../../lib/storage';

interface BaselineAssessmentProps {
  onComplete: (baseline: CognitiveBaseline) => void;
  onCancel: () => void;
  language: SupportedLanguage;
  patientName: string;
}

export const BaselineAssessment: React.FC<BaselineAssessmentProps> = ({
  onComplete,
  onCancel,
  language,
  patientName,
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [totalLatencies, setTotalLatencies] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [calculatedBaseline, setCalculatedBaseline] = useState<CognitiveBaseline | null>(null);

  // 5 Gentle Onboarding Activities
  const questions = [
    {
      id: 0,
      domain: 'Visual & Object Recall',
      instruction: `Look at these 3 familiar items from Assam for 5 seconds. Remember them!`,
      type: 'MEMORY_SHOW',
      items: [
        { name: 'Tea Garden Leaf', icon: '🍃', color: 'bg-emerald-100' },
        { name: 'Bihu Dhol', icon: '🥁', color: 'bg-amber-100' },
        { name: 'Clay Tea Cup', icon: '☕', color: 'bg-orange-100' },
      ],
      promptVoice: 'Take a calm look at these three items: Tea Garden Leaf, Bihu Dhol, and Clay Tea Cup. We will recall them in a moment.',
    },
    {
      id: 1,
      domain: 'Object Recall Quiz',
      instruction: `Which one of these items was shown on the previous screen?`,
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: 'Bihu Dhol (Drum)', isCorrect: true, icon: '🥁' },
        { text: 'Bicycle', isCorrect: false, icon: '🚲' },
        { text: 'Telephone', isCorrect: false, icon: '☎️' },
        { text: 'Umbrella', isCorrect: false, icon: '☂️' },
      ],
      promptVoice: 'Which item was on the screen earlier? Tap the right one.',
    },
    {
      id: 2,
      domain: 'Attention & Focus',
      instruction: `Spot and tap the Beautiful Hornbill Bird among the foliage:`,
      type: 'ATTENTION_SPOT',
      items: [
        { text: 'Green Leaf', isTarget: false, icon: '🌿' },
        { text: 'Hornbill Bird', isTarget: true, icon: '🦤' },
        { text: 'River Pebble', isTarget: false, icon: '🪨' },
        { text: 'Bamboo Shoot', isTarget: false, icon: '🎋' },
      ],
      promptVoice: 'Look carefully and tap the Hornbill Bird.',
    },
    {
      id: 3,
      domain: 'Pattern Recognition',
      instruction: `What comes next in this traditional Gamosa color weave pattern?`,
      type: 'PATTERN_CHOICE',
      sequence: ['🔴 Red Diamond', '⚪ White Cotton', '🔴 Red Diamond', '⚪ White Cotton'],
      options: [
        { text: '🔴 Red Diamond', isCorrect: true },
        { text: '🟡 Yellow Silk', isCorrect: false },
        { text: '🔵 Blue Thread', isCorrect: false },
      ],
      promptVoice: 'What is the next color in the sequence: Red, White, Red, White, then?',
    },
    {
      id: 4,
      domain: 'Daily Routine & Orientation',
      instruction: `In our daily routine, what is the best healthy habit after waking up in the morning?`,
      type: 'ORIENTATION',
      options: [
        { text: 'Drinking fresh water & taking prescribed morning tablets', isCorrect: true },
        { text: 'Skipping breakfast & staying in bed all day', isCorrect: false },
        { text: 'Going to sleep again', isCorrect: false },
      ],
      promptVoice: 'What is the best healthy habit in the morning?',
    },
  ];

  const currentQ = questions[step];

  const handleSelectOption = (option: any, isCorrect: boolean) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    const latency = Date.now() - startTime;
    setTotalLatencies(prev => [...prev, latency]);
    setAnswers(prev => ({ ...prev, [step]: { option, isCorrect, latency } }));

    if (step < questions.length - 1) {
      setStep(step + 1);
      setStartTime(Date.now());
    } else {
      finishBaseline();
    }
  };

  const finishBaseline = () => {
    audioService.playFeedbackSound('SUCCESS');

    // Calculate Scores
    const correctCount = Object.values(answers).filter((a: any) => a.isCorrect).length + 1;
    const avgLatency = totalLatencies.length > 0 
      ? Math.round(totalLatencies.reduce((a, b) => a + b, 0) / totalLatencies.length)
      : 2800;

    const memoryScore = Math.min(95, Math.max(60, 70 + (correctCount >= 3 ? 15 : -10)));
    const attentionScore = Math.min(95, Math.max(65, 75 + (answers[2]?.isCorrect ? 15 : -5)));
    const patternScore = Math.min(95, Math.max(65, 80 + (answers[3]?.isCorrect ? 15 : -5)));
    const recallScore = Math.min(95, Math.max(60, memoryScore - 5));

    const baselineResult: CognitiveBaseline = {
      memoryScore,
      attentionScore,
      recallScore,
      patternScore,
      responseSpeedMs: avgLatency,
      engagementLevel: 'HIGH',
      completedAt: new Date().toISOString(),
      isInitialBaseline: true,
    };

    setCalculatedBaseline(baselineResult);
    setIsFinished(true);

    // Save into patient profile & enqueue event
    const currentProfile = localDB.getPatientProfile();
    const updatedProfile = {
      ...currentProfile,
      baseline: baselineResult,
    };
    localDB.savePatientProfile(updatedProfile);
    localDB.enqueueEvent('BASELINE_COMPLETED', { ...baselineResult });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
      {!isFinished ? (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                Step {step + 1} of {questions.length}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {currentQ.domain}
              </span>
            </div>
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-1 rounded-lg hover:bg-stone-100"
            >
              Skip for now
            </button>
          </div>

          {/* Question Text */}
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-2 leading-snug">
              {currentQ.instruction}
            </h2>
            <button
              onClick={() => audioService.speak(currentQ.promptVoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold mt-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Voice Instruction</span>
            </button>
          </div>

          {/* Interactive Steps */}
          {currentQ.type === 'MEMORY_SHOW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {currentQ.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 sm:p-6 rounded-2xl ${item.color} border-2 border-amber-300 flex flex-col items-center justify-center text-center shadow-xs`}
                  >
                    <span className="text-4xl sm:text-5xl mb-3">{item.icon}</span>
                    <span className="text-sm sm:text-base font-bold text-stone-900">{item.name}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  audioService.playFeedbackSound('GENTLE_TAP');
                  setStep(1);
                  setStartTime(Date.now());
                }}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
              >
                <span>I Remember These Items</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {(currentQ.type === 'MULTIPLE_CHOICE' || currentQ.type === 'ATTENTION_SPOT') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(currentQ.options || currentQ.items)?.map((opt: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt, Boolean(opt.isCorrect || opt.isTarget))}
                  className="p-5 rounded-2xl bg-stone-50 hover:bg-amber-50 border-2 border-stone-200 hover:border-amber-400 text-left flex items-center gap-4 transition-all active:scale-98 shadow-xs"
                >
                  <span className="text-3xl sm:text-4xl">{opt.icon}</span>
                  <span className="text-base sm:text-lg font-bold text-stone-900">{opt.text}</span>
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'PATTERN_CHOICE' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                {currentQ.sequence?.map((item: string, idx: number) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-2 bg-white rounded-xl border border-stone-300 font-bold text-sm text-stone-800 shadow-xs">
                      {item}
                    </span>
                    {idx < (currentQ.sequence?.length || 0) - 1 && (
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    )}
                  </React.Fragment>
                ))}
                <span className="px-3 py-2 bg-amber-100 border-2 border-dashed border-amber-500 rounded-xl font-bold text-sm text-amber-900 animate-pulse">
                  ❓ Next?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentQ.options?.map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt, Boolean(opt.isCorrect))}
                    className="p-4 rounded-2xl bg-stone-50 hover:bg-amber-50 border-2 border-stone-200 hover:border-amber-400 font-bold text-sm text-stone-900 transition-all active:scale-98 text-center"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentQ.type === 'ORIENTATION' && (
            <div className="space-y-3">
              {currentQ.options?.map((opt: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt, Boolean(opt.isCorrect))}
                  className="w-full p-4 sm:p-5 rounded-2xl bg-stone-50 hover:bg-amber-50 border-2 border-stone-200 hover:border-amber-400 text-left font-bold text-base sm:text-lg text-stone-900 transition-all active:scale-98 shadow-xs flex items-center justify-between"
                >
                  <span>{opt.text}</span>
                  <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 opacity-40" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Baseline Completion Result */
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Wonderful Job, {patientName}! 🎉
            </h2>
            <p className="text-stone-600 text-sm mt-1 max-w-md mx-auto">
              We have created your personal cognitive baseline. This helps Mind Mithra tailor activities perfectly to your pace and comfort.
            </p>
          </div>

          {/* Baseline Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" /> Memory
              </span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{calculatedBaseline?.memoryScore}%</p>
              <span className="text-[10px] text-stone-500">Visual recall</span>
            </div>

            <div className="p-3.5 bg-teal-50 rounded-2xl border border-teal-200">
              <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Attention
              </span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{calculatedBaseline?.attentionScore}%</p>
              <span className="text-[10px] text-stone-500">Visual focus</span>
            </div>

            <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200">
              <span className="text-xs font-semibold text-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Pattern
              </span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{calculatedBaseline?.patternScore}%</p>
              <span className="text-[10px] text-stone-500">Sequence logic</span>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Speed
              </span>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">
                {((calculatedBaseline?.responseSpeedMs || 2800) / 1000).toFixed(1)}s
              </p>
              <span className="text-[10px] text-stone-500">Comfort pace</span>
            </div>
          </div>

          {/* Disclaimer (Mandated by PRD Section 4 & 7) */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-left">
            <p className="text-[11px] text-stone-500 leading-tight">
              <strong>Medical Disclaimer:</strong> This is a personal cognitive activity baseline for game personalization and engagement pacing. It is not a clinical medical diagnosis.
            </p>
          </div>

          <button
            onClick={() => calculatedBaseline && onComplete(calculatedBaseline)}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-lg shadow-md transition-all active:scale-98"
          >
            Start Personalized Activities
          </button>
        </div>
      )}
    </div>
  );
};
