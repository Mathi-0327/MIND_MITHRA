import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Brain 
} from 'lucide-react';
import { 
  GameSessionResult, 
  PatientProfile, 
  CaregiverInstruction, 
  SupportedLanguage 
} from '../../../types';
import { getCulturalGameDataSet, evaluateGameAdaptation, AdaptationOutput } from '../../../lib/adaptiveEngine';
import { audioService } from '../../../lib/audioService';
import { localDB } from '../../../lib/storage';
import { GameCompletionModal } from './GameCompletionModal';

interface MemoryMatchGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface CardItem {
  instanceId: string;
  itemId: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  culturalNote: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const totalPairsCount = currentDifficulty === 1 ? 2 : currentDifficulty === 2 ? 3 : currentDifficulty === 3 ? 4 : 6;

  // Initialize Game Board
  const initGame = () => {
    const dataSet = getCulturalGameDataSet('MEMORY', instructions[0]?.structuredRule?.preferredTheme);
    const selectedItems = dataSet.items.slice(0, totalPairsCount);

    const deck: CardItem[] = [];
    selectedItems.forEach((item) => {
      // Create Pair 1
      deck.push({
        instanceId: `${item.id}-a`,
        itemId: item.id,
        label: item.label,
        sublabel: item.sublabel,
        icon: item.icon,
        color: item.color,
        culturalNote: item.culturalNote,
        isFlipped: false,
        isMatched: false,
      });
      // Create Pair 2
      deck.push({
        instanceId: `${item.id}-b`,
        itemId: item.id,
        label: item.label,
        sublabel: item.sublabel,
        icon: item.icon,
        color: item.color,
        culturalNote: item.culturalNote,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setStartTime(Date.now());
    setIsCompleted(false);
    setLatestResult(null);
  };

  useEffect(() => {
    initGame();
  }, [currentDifficulty]);

  const handleCardClick = (card: CardItem) => {
    if (card.isFlipped || card.isMatched || selectedCards.length === 2 || isEvaluating) {
      return;
    }

    audioService.playFeedbackSound('GENTLE_TAP');

    // Flip the tapped card
    const updated = cards.map((c) => (c.instanceId === card.instanceId ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setIsEvaluating(true);

      const [first, second] = newSelected;
      if (first.itemId === second.itemId) {
        // MATCH!
        setTimeout(() => {
          audioService.playFeedbackSound('SUCCESS');
          setCards((prev) =>
            prev.map((c) =>
              c.itemId === first.itemId ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setSelectedCards([]);
          setIsEvaluating(false);

          const newMatched = matchedPairs + 1;
          setMatchedPairs(newMatched);

          if (newMatched === totalPairsCount) {
            handleVictory();
          }
        }, 500);
      } else {
        // NO MATCH -> Flip back gently
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.instanceId === first.instanceId || c.instanceId === second.instanceId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsEvaluating(false);
        }, 1100);
      }
    }
  };

  const handleVictory = () => {
    const elapsedMs = Date.now() - startTime;
    const minMovesNeeded = totalPairsCount;
    const accuracy = Math.min(100, Math.max(60, Math.round((minMovesNeeded / Math.max(minMovesNeeded, moves + 1)) * 100)));
    const avgResponseTimeMs = Math.round(elapsedMs / Math.max(1, moves + 1));

    const sessionResult: GameSessionResult = {
      sessionId: `sess-${Date.now()}`,
      patientId: patient.id,
      gameId: 'ner-memory-match',
      category: 'MEMORY',
      difficulty: currentDifficulty,
      score: accuracy,
      accuracyPercent: accuracy,
      avgResponseTimeMs,
      totalAttempts: moves + 1,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: 'Wonderful visual recall on North Eastern heritage cards!',
    };

    // Calculate closed-loop AI adaptation
    const allRecent = localDB.getGameSessions();
    const adaptation = evaluateGameAdaptation(sessionResult, patient, allRecent, instructions);

    sessionResult.adaptationApplied = {
      previousDifficulty: currentDifficulty,
      newDifficulty: adaptation.calculatedDifficulty,
      reason: adaptation.reason,
    };

    // Update patient profile difficulty level & persist
    const currentProfile = localDB.getPatientProfile();
    const updatedProfile = {
      ...currentProfile,
      currentDifficultyLevel: adaptation.calculatedDifficulty,
    };
    localDB.savePatientProfile(updatedProfile);
    localDB.saveGameSession(sessionResult);

    setLatestResult(sessionResult);
    setAdaptationOutput(adaptation);
    setIsCompleted(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
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
            <span>Heritage Memory Match</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              Level {currentDifficulty}
            </span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Find matching cultural pairs from Assam and North East
          </p>
        </div>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-bold border border-amber-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Progress & Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase">Pairs Found</span>
          <p className="text-lg sm:text-xl font-extrabold text-amber-700">
            {matchedPairs} / {totalPairsCount}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase">Turns</span>
          <p className="text-lg sm:text-xl font-extrabold text-stone-900">{moves}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase">Comfort Pace</span>
          <p className="text-lg sm:text-xl font-extrabold text-teal-700">
            {moves === 0 ? 'Ready' : moves < totalPairsCount * 2 ? 'Calm' : 'Patient'}
          </p>
        </div>
      </div>

      {/* Game Board Grid */}
      <div
        className={`grid gap-3 sm:gap-4 justify-center ${
          totalPairsCount <= 2
            ? 'grid-cols-2 max-w-md mx-auto'
            : totalPairsCount <= 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-3 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.instanceId}
              onClick={() => handleCardClick(card)}
              disabled={card.isMatched || card.isFlipped}
              className={`h-36 sm:h-44 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 transform active:scale-95 shadow-md ${
                card.isMatched
                  ? 'bg-emerald-50 border-4 border-emerald-400 opacity-90'
                  : isRevealed
                  ? `${card.color} border-4 border-amber-400 scale-102`
                  : 'bg-gradient-to-br from-amber-600 to-amber-700 border-4 border-amber-300 hover:brightness-105 text-white'
              }`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow-xs">
                    {card.label.includes('Tea') ? '🍃' : card.label.includes('Dhol') ? '🥁' : card.label.includes('Hornbill') ? '🦤' : card.label.includes('Gamosa') ? '🧣' : card.label.includes('Flute') ? '🪈' : '🏝️'}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                    {card.label}
                  </span>
                  {card.sublabel && (
                    <span className="text-[10px] text-stone-600 font-semibold mt-0.5">
                      {card.sublabel}
                    </span>
                  )}
                  {card.isMatched && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-1" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
                    Tap to Flip
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Encouragement Footer */}
      <div className="mt-8 pt-4 border-t border-stone-100 text-center">
        <p className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1.5">
          <Brain className="w-4 h-4 text-amber-600" />
          <span>Take all the time you need. There is no timer rush.</span>
        </p>
      </div>

      {/* Completion Modal */}
      {isCompleted && latestResult && adaptationOutput && (
        <GameCompletionModal
          result={latestResult}
          adaptation={adaptationOutput}
          onPlayAgain={initGame}
          onGoToMemories={onGoToMemories}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
