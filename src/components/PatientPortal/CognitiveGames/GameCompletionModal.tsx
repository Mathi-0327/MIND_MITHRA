import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Heart, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { GameSessionResult, AdaptationOutput } from '../../../types';
import { audioService } from '../../../lib/audioService';

interface GameCompletionModalProps {
  result: GameSessionResult;
  adaptation: AdaptationOutput;
  onPlayAgain: () => void;
  onGoToMemories: () => void;
  onGoHome: () => void;
}

export const GameCompletionModal: React.FC<GameCompletionModalProps> = ({
  result,
  adaptation,
  onPlayAgain,
  onGoToMemories,
  onGoHome,
}) => {
  useEffect(() => {
    // Launch gentle celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d97706', '#059669', '#2563eb', '#db2777'],
      });
    } catch {
      // Ignore if canvas is unsupported
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-200 text-center relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Sparkles className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Wonderful Effort! 🌟
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-1">
          {result.feedbackText || 'You completed the cognitive activity with calm focus.'}
        </p>

        {/* Quick Performance Summary */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Accuracy</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-0.5">{result.accuracyPercent}%</p>
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
            <span className="text-[11px] font-bold text-teal-800 uppercase">Response Time</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-0.5">
              {(result.avgResponseTimeMs / 1000).toFixed(1)}s
            </p>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
            <span className="text-[11px] font-bold text-indigo-800 uppercase">Level</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-0.5">{result.difficulty} / 5</p>
          </div>
        </div>

        {/* AI Adaptation Reasoning Box (Closed Loop AI Demonstration) */}
        <div className="p-4 bg-stone-50 border-2 border-stone-200 rounded-2xl text-left mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
            <Brain className="w-4 h-4 text-amber-600" />
            <span>AI Adaptive Engine Update:</span>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            {adaptation.reason}
          </p>

          <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              {adaptation.difficultyChange === 'INCREASED' ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Next Level: {adaptation.calculatedDifficulty}
                </span>
              ) : adaptation.difficultyChange === 'DECREASED' ? (
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Softened to Level {adaptation.calculatedDifficulty}
                </span>
              ) : (
                <span className="text-stone-600 font-medium">Maintained at Level {adaptation.calculatedDifficulty}</span>
              )}
            </span>

            {adaptation.suggestRest && (
              <span className="text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md">
                <Coffee className="w-3 h-3" /> Rest Suggested
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Activity</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onGoToMemories}
              className="py-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-teal-600" />
              <span>View Memories</span>
            </button>

            <button
              onClick={onGoHome}
              className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs sm:text-sm transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
