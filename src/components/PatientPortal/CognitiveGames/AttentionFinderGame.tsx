import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Volume2, 
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

interface AttentionFinderGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface TargetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  culturalNote: string;
}

export const AttentionFinderGame: React.FC<AttentionFinderGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [target, setTarget] = useState<TargetItem | null>(null);
  const [gridItems, setGridItems] = useState<Array<TargetItem & { instanceId: string; isTarget: boolean }>>([]);
  const [foundCount, setFoundCount] = useState(0);
  const [requiredFinds, setRequiredFinds] = useState(3);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalRounds] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const totalGridSize = currentDifficulty === 1 ? 6 : currentDifficulty === 2 ? 8 : 12;

  const startRound = (roundIdx: number) => {
    const dataSet = getCulturalGameDataSet('ATTENTION');
    const targetItem = dataSet.items[roundIdx % dataSet.items.length];
    const otherItems = dataSet.items.filter((i) => i.id !== targetItem.id);

    setTarget({
      id: targetItem.id,
      name: targetItem.label,
      icon: targetItem.label.includes('Jackfruit') ? '🍈' : targetItem.label.includes('Tea') ? '☕' : targetItem.label.includes('Myna') ? '🐦' : '👒',
      color: targetItem.color,
      culturalNote: targetItem.culturalNote,
    });

    const targetOccurrences = currentDifficulty === 1 ? 2 : 3;
    setRequiredFinds(targetOccurrences);
    setFoundCount(0);

    const generated: Array<TargetItem & { instanceId: string; isTarget: boolean }> = [];

    // Add target items
    for (let i = 0; i < targetOccurrences; i++) {
      generated.push({
        id: targetItem.id,
        name: targetItem.label,
        icon: targetItem.label.includes('Jackfruit') ? '🍈' : targetItem.label.includes('Tea') ? '☕' : targetItem.label.includes('Myna') ? '🐦' : '👒',
        color: targetItem.color,
        culturalNote: targetItem.culturalNote,
        instanceId: `target-${i}-${Date.now()}`,
        isTarget: true,
      });
    }

    // Add distractor items
    for (let i = 0; i < totalGridSize - targetOccurrences; i++) {
      const dist = otherItems[i % otherItems.length];
      generated.push({
        id: dist.id,
        name: dist.label,
        icon: dist.label.includes('Jackfruit') ? '🍈' : dist.label.includes('Tea') ? '☕' : dist.label.includes('Myna') ? '🐦' : '👒',
        color: dist.color,
        culturalNote: dist.culturalNote,
        instanceId: `dist-${i}-${Date.now()}`,
        isTarget: false,
      });
    }

    // Shuffle items
    setGridItems(generated.sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startRound(0);
    setStartTime(Date.now());
  }, [currentDifficulty]);

  const handleItemTap = (item: TargetItem & { instanceId: string; isTarget: boolean }) => {
    if (item.isTarget) {
      audioService.playFeedbackSound('SUCCESS');
      const newFound = foundCount + 1;
      setFoundCount(newFound);

      // Remove target instance or mark checked
      setGridItems((prev) => prev.filter((i) => i.instanceId !== item.instanceId));

      if (newFound >= requiredFinds) {
        const nextRound = roundsCompleted + 1;
        setRoundsCompleted(nextRound);

        if (nextRound >= totalRounds) {
          handleVictory();
        } else {
          setTimeout(() => {
            startRound(nextRound);
          }, 600);
        }
      }
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
    }
  };

  const handleVictory = () => {
    const elapsedMs = Date.now() - startTime;
    const accuracy = 90;
    const avgResponseTimeMs = Math.round(elapsedMs / (totalRounds * 3));

    const sessionResult: GameSessionResult = {
      sessionId: `sess-att-${Date.now()}`,
      patientId: patient.id,
      gameId: 'ner-attention-spotter',
      category: 'ATTENTION',
      difficulty: currentDifficulty,
      score: accuracy,
      accuracyPercent: accuracy,
      avgResponseTimeMs,
      totalAttempts: totalRounds * 3,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: 'Great focus and visual attention across all rounds!',
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
            <span>Visual Attention Spotter</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300 font-bold">
              Round {roundsCompleted + 1} of {totalRounds}
            </span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Spot the target items in the peaceful village landscape
          </p>
        </div>

        <button
          onClick={() => startRound(0)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs sm:text-sm font-bold border border-teal-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Target Mission Card */}
      {target && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-3xl shadow-xs">
              {target.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Target to Spot:</span>
              <h3 className="text-xl font-extrabold text-stone-900 leading-tight">{target.name}</h3>
              <p className="text-xs text-stone-600">{target.culturalNote}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => audioService.speak(`Find all instances of ${target.name}`)}
              className="p-2.5 rounded-xl bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
              title="Listen Voice Prompt"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm">
              Found: {foundCount} / {requiredFinds}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
        {gridItems.map((item) => (
          <button
            key={item.instanceId}
            onClick={() => handleItemTap(item)}
            className={`h-28 sm:h-32 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all transform active:scale-95 shadow-xs border-2 ${item.color} hover:brightness-95`}
          >
            <span className="text-4xl mb-1">{item.icon}</span>
            <span className="text-xs font-bold text-stone-900 leading-tight">{item.name}</span>
          </button>
        ))}
      </div>

      {isCompleted && latestResult && adaptationOutput && (
        <GameCompletionModal
          result={latestResult}
          adaptation={adaptationOutput}
          onPlayAgain={() => {
            setRoundsCompleted(0);
            startRound(0);
          }}
          onGoToMemories={onGoToMemories}
          onGoHome={onBack}
        />
      )}
    </div>
  );
};
