import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Brain 
} from 'lucide-react';
import { 
  GameSessionResult, 
  PatientProfile, 
  CaregiverInstruction, 
  SupportedLanguage 
} from '../../../types';
import { evaluateGameAdaptation, AdaptationOutput } from '../../../lib/adaptiveEngine';
import { audioService } from '../../../lib/audioService';
import { localDB } from '../../../lib/storage';
import { GameCompletionModal } from './GameCompletionModal';

interface PatternSequenceGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

export const PatternSequenceGame: React.FC<PatternSequenceGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [currentRound, setCurrentRound] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const puzzles = [
    {
      title: 'Traditional Gamosa Border Motif',
      sequence: ['🔴 Red Diamond', '⚪ White Cotton', '🔴 Red Diamond', '⚪ White Cotton'],
      options: [
        { text: '🔴 Red Diamond', icon: '💎', isCorrect: true },
        { text: '🟡 Golden Thread', icon: '✨', isCorrect: false },
        { text: '🔵 Blue Wave', icon: '🌊', isCorrect: false },
      ],
      culturalNote: 'Classical red and white handloom border weave from Assam.',
    },
    {
      title: 'Meghalaya Bamboo Cane Weave',
      sequence: ['🎋 Vertical Cane', '🪵 Horizontal Knot', '🎋 Vertical Cane', '🪵 Horizontal Knot'],
      options: [
        { text: '🎋 Vertical Cane', icon: '🎋', isCorrect: true },
        { text: '🪨 River Stone', icon: '🪨', isCorrect: false },
        { text: '🍂 Dry Leaf', icon: '🍂', isCorrect: false },
      ],
      culturalNote: 'Traditional interlocking cane pattern used in Khasi artisan baskets.',
    },
    {
      title: 'Bihu Rhythm Beat Pattern',
      sequence: ['🥁 Dhol Beat (Dum)', '🪈 Flute Trill (Tiri)', '🥁 Dhol Beat (Dum)', '🪈 Flute Trill (Tiri)'],
      options: [
        { text: '🥁 Dhol Beat (Dum)', icon: '🥁', isCorrect: true },
        { text: '🔔 Brass Bell', icon: '🔔', isCorrect: false },
        { text: '👏 Clap', icon: '👏', isCorrect: false },
      ],
      culturalNote: 'Alternating drum and flute cadence in Bohag spring music.',
    },
  ];

  const currentPuzzle = puzzles[currentRound];

  const handleSelectOption = (option: any) => {
    audioService.playFeedbackSound(option.isCorrect ? 'SUCCESS' : 'GENTLE_TAP');

    if (option.isCorrect) {
      setCorrectAnswersCount((c) => c + 1);
    }

    if (currentRound < puzzles.length - 1) {
      setCurrentRound(currentRound + 1);
    } else {
      finishGame(option.isCorrect ? correctAnswersCount + 1 : correctAnswersCount);
    }
  };

  const finishGame = (finalCorrect: number) => {
    const elapsedMs = Date.now() - startTime;
    const accuracy = Math.round((finalCorrect / puzzles.length) * 100);
    const avgResponseTimeMs = Math.round(elapsedMs / puzzles.length);

    const sessionResult: GameSessionResult = {
      sessionId: `sess-pat-${Date.now()}`,
      patientId: patient.id,
      gameId: 'ner-pattern-sequence',
      category: 'PATTERN',
      difficulty: currentDifficulty,
      score: accuracy,
      accuracyPercent: accuracy,
      avgResponseTimeMs,
      totalAttempts: puzzles.length,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: 'Excellent recognition of traditional North Eastern weave motifs!',
    };

    const allRecent = localDB.getGameSessions();
    const adaptation = evaluateGameAdaptation(sessionResult, patient, allRecent, instructions);

    sessionResult.adaptationApplied = {
      previousDifficulty: currentDifficulty,
      newDifficulty: adaptation.calculatedDifficulty,
      reason: adaptation.reason,
    };

    const currentProfile = localDB.getPatientProfile();
    localDB.savePatientProfile({
      ...currentProfile,
      currentDifficultyLevel: adaptation.calculatedDifficulty,
    });
    localDB.saveGameSession(sessionResult);

    setLatestResult(sessionResult);
    setAdaptationOutput(adaptation);
    setIsCompleted(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-2xl font-extrabold text-stone-900 flex items-center justify-center gap-2">
            <span>Pattern Sequence</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold">
              Puzzle {currentRound + 1} of {puzzles.length}
            </span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Complete the authentic traditional motif sequence
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentRound(0);
            setCorrectAnswersCount(0);
            setStartTime(Date.now());
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs sm:text-sm font-bold border border-indigo-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Question Box */}
      <div className="text-center mb-8">
        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mb-2">
          {currentPuzzle.title}
        </h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">{currentPuzzle.culturalNote}</p>
      </div>

      {/* Sequence Display */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 p-5 bg-stone-50 rounded-2xl border-2 border-stone-200 mb-8 shadow-inner">
        {currentPuzzle.sequence.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="px-4 py-3 bg-white rounded-xl border border-stone-300 font-bold text-sm sm:text-base text-stone-800 shadow-xs">
              {item}
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </React.Fragment>
        ))}
        <span className="px-4 py-3 bg-indigo-100 border-2 border-dashed border-indigo-500 rounded-xl font-bold text-sm sm:text-base text-indigo-900 animate-pulse flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>What comes next?</span>
        </span>
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {currentPuzzle.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(option)}
            className="p-5 rounded-2xl bg-stone-50 hover:bg-indigo-50 border-2 border-stone-200 hover:border-indigo-400 font-bold text-base text-stone-900 transition-all transform active:scale-98 shadow-xs text-center flex flex-col items-center justify-center gap-2"
          >
            <span className="text-3xl">{option.icon}</span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {isCompleted && latestResult && adaptationOutput && (
        <GameCompletionModal
          result={latestResult}
          adaptation={adaptationOutput}
          onPlayAgain={() => {
            setCurrentRound(0);
            setCorrectAnswersCount(0);
            setIsCompleted(false);
          }}
          onGoToMemories={onGoToMemories}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
