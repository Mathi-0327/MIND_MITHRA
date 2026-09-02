import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  FolderTree,
  Check,
  PackageCheck
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

interface ObjectCategorySortGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface SortableItem {
  id: string;
  name: string;
  icon: string;
  correctCategory: string;
  hint: string;
}

interface CategoryBucket {
  id: string;
  title: string;
  icon: string;
  colorTheme: string;
  description: string;
}

const CATEGORY_BUCKETS: CategoryBucket[] = [
  {
    id: 'nature',
    title: 'Tea Garden & Nature',
    icon: '🍃',
    colorTheme: 'bg-emerald-50 border-emerald-400 text-emerald-950 hover:bg-emerald-100/80',
    description: 'Plants, birds & greenery from the valley',
  },
  {
    id: 'kitchen',
    title: 'Kitchen & Traditional Food',
    icon: '☕',
    colorTheme: 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100/80',
    description: 'Tea, recipes & cooking utensils',
  },
  {
    id: 'music_festivals',
    title: 'Music & Cultural Festivals',
    icon: '🥁',
    colorTheme: 'bg-indigo-50 border-indigo-400 text-indigo-950 hover:bg-indigo-100/80',
    description: 'Dhol, Gamosa & festival celebrations',
  },
];

const SORT_ITEMS: SortableItem[] = [
  { id: 'i1', name: 'Fresh Green Tea Leaf', icon: '🌿', correctCategory: 'nature', hint: 'Grows on tea bushes in the estate' },
  { id: 'i2', name: 'Clay Tea Cup (Kulhad)', icon: '🍵', correctCategory: 'kitchen', hint: 'Used for serving hot morning tea' },
  { id: 'i3', name: 'Bihu Dhol Drum', icon: '🪘', correctCategory: 'music_festivals', hint: 'Played during Spring folk dances' },
  { id: 'i4', name: 'Singing Myna Bird', icon: '🐦', correctCategory: 'nature', hint: 'Sweet singing bird in the trees' },
  { id: 'i5', name: 'Hot Roasted Til Pitha', icon: '🥮', correctCategory: 'kitchen', hint: 'Delicious sweet rice roll snack' },
  { id: 'i6', name: 'Buffalo Horn Pepa Flute', icon: '🎺', correctCategory: 'music_festivals', hint: 'Traditional musical instrument' },
  { id: 'i7', name: 'Purple Wild Orchid', icon: '🌸', correctCategory: 'nature', hint: 'Blooms in Assam forests and trees' },
  { id: 'i8', name: 'Crushed Ginger & Cardamom', icon: '🫚', correctCategory: 'kitchen', hint: 'Spices for aromatic morning tea' },
];

export const ObjectCategorySortGame: React.FC<ObjectCategorySortGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [itemIndex, setItemIndex] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const totalQuestions = currentDifficulty === 1 ? 4 : currentDifficulty === 2 ? 6 : 8;
  const currentItem = SORT_ITEMS[itemIndex % SORT_ITEMS.length];

  const handleSelectBucket = (bucketId: string) => {
    setTotalAttempts((prev) => prev + 1);
    const isCorrect = currentItem.correctCategory === bucketId;

    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
      audioService.playFeedbackSound('SUCCESS');
      setLastFeedback({
        isCorrect: true,
        text: `Wonderful! "${currentItem.name}" belongs in "${CATEGORY_BUCKETS.find((b) => b.id === bucketId)?.title}".`,
      });
      audioService.speak(`Correct! ${currentItem.name} placed in the right category.`);
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      setLastFeedback({
        isCorrect: false,
        text: `Nice try! Hint: ${currentItem.hint}.`,
      });
      audioService.speak(`Hint: ${currentItem.hint}`);
    }

    setTimeout(() => {
      if (itemIndex + 1 >= totalQuestions) {
        finishGame(correctAnswersCount + (isCorrect ? 1 : 0), totalAttempts + 1);
      } else {
        setItemIndex((prev) => prev + 1);
        setLastFeedback(null);
      }
    }, 1200);
  };

  const finishGame = (solves: number, attempts: number) => {
    const elapsedSeconds = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(100, Math.round((solves / Math.max(1, attempts)) * 100));

    const result: GameSessionResult = {
      sessionId: `sess-sort-${Date.now()}`,
      patientId: patient.id,
      gameId: 'category-sort-01',
      category: 'SPATIAL',
      difficulty: currentDifficulty,
      score: accuracy,
      accuracyPercent: accuracy,
      avgResponseTimeMs: (elapsedSeconds / Math.max(1, attempts)) * 1000,
      totalAttempts: attempts,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText:
        accuracy >= 70
          ? 'Superb categorization! Sorting objects reinforces conceptual memory and mental clarity.'
          : 'Good effort grouping everyday treasures. Sorting activities stimulate brain organization.',
    };

    localDB.addGameSession(result);
    localDB.enqueueEvent('GAME_COMPLETED', { ...result }, patient.id);

    const recentSessions = localDB.getGameSessions(patient.id);
    const adaptation = evaluateGameAdaptation(result, patient, recentSessions, instructions);

    if (adaptation.difficultyChange !== 'MAINTAINED') {
      localDB.updatePatientDifficulty(patient.id, adaptation.calculatedDifficulty);
    }

    setLatestResult(result);
    setAdaptationOutput(adaptation);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setItemIndex(0);
    setCorrectAnswersCount(0);
    setTotalAttempts(0);
    setLastFeedback(null);
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Activity 7 of 8 • Nature & Kitchen Sorter</span>
          </div>
          <p className="text-xs text-stone-500 font-medium">Categorization & Mental Organization</p>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          title="Restart Sorter"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Item to Sort Spotlight Hero Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden">
        <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white inline-block">
          Item {itemIndex + 1} of {totalQuestions}
        </span>

        <div className="my-3">
          <span className="text-6xl sm:text-7xl block animate-bounce my-2">
            {currentItem.icon}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            {currentItem.name}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            Where does this familiar item belong? Tap the matching basket below:
          </p>
        </div>

        <button
          onClick={() =>
            audioService.speak(`Where does ${currentItem.name} belong?`)
          }
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          <span>Hear Question</span>
        </button>
      </div>

      {/* Target Category Baskets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {CATEGORY_BUCKETS.map((bucket) => (
          <button
            key={bucket.id}
            type="button"
            onClick={() => handleSelectBucket(bucket.id)}
            className={`p-5 rounded-3xl border-3 text-left transition-all transform hover:-translate-y-1 active:scale-98 shadow-sm flex flex-col justify-between ${bucket.colorTheme}`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{bucket.icon}</span>
                <PackageCheck className="w-5 h-5 opacity-60" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg leading-snug">
                {bucket.title}
              </h3>
            </div>
            <p className="text-xs opacity-75 font-semibold mt-2">
              {bucket.description}
            </p>
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {lastFeedback && (
        <div
          className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center gap-2 ${
            lastFeedback.isCorrect
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {lastFeedback.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span>{lastFeedback.text}</span>
        </div>
      )}

      {/* Completion Modal */}
      {isCompleted && latestResult && adaptationOutput && (
        <GameCompletionModal
          result={latestResult}
          adaptation={adaptationOutput}
          onPlayAgain={handleRestart}
          onGoToMemories={onGoToMemories}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
