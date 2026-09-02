import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Volume2, 
  Play,
  Heart,
  Trophy,
  Activity
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

interface MotorCoordinationGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface FallingLeaf {
  id: string;
  xPercent: number; // 10 to 80
  emoji: string;
  label: string;
  isSpecial: boolean;
  spawnTime: number;
}

const ITEMS_TO_CATCH = [
  { emoji: '🍃', label: 'Golden Tea Leaf', isSpecial: false },
  { emoji: '🪷', label: 'River Lotus', isSpecial: true },
  { emoji: '🌿', label: 'Fragrant Camellia', isSpecial: false },
  { emoji: '🌸', label: 'Spring Kopou Orchid', isSpecial: true },
];

export const MotorCoordinationGame: React.FC<MotorCoordinationGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const targetCatches = currentDifficulty === 1 ? 6 : currentDifficulty === 2 ? 8 : 10;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLeaves, setCurrentLeaves] = useState<FallingLeaf[]>([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  // Spawner loop
  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const intervalMs = currentDifficulty === 1 ? 1600 : currentDifficulty === 2 ? 1300 : 1000;
    const timer = setInterval(() => {
      if (currentLeaves.length < 3) {
        const template = ITEMS_TO_CATCH[Math.floor(Math.random() * ITEMS_TO_CATCH.length)];
        const newLeaf: FallingLeaf = {
          id: `leaf-${Date.now()}-${Math.random()}`,
          xPercent: Math.floor(Math.random() * 70) + 15,
          emoji: template.emoji,
          label: template.label,
          isSpecial: template.isSpecial,
          spawnTime: Date.now(),
        };
        setCurrentLeaves((prev) => [...prev.slice(-2), newLeaf]);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isCompleted, currentLeaves.length, currentDifficulty]);

  const handleStartGame = () => {
    setIsPlaying(true);
    setCaughtCount(0);
    setReactionTimes([]);
    setCurrentLeaves([]);
    setStartTime(Date.now());
    audioService.playFeedbackSound('SUCCESS');
    audioService.speak(`Gently tap the fresh falling tea leaves as they appear in the garden!`);
  };

  const handleCatchLeaf = (leaf: FallingLeaf) => {
    const reactionMs = Date.now() - leaf.spawnTime;
    setReactionTimes((prev) => [...prev, reactionMs]);
    audioService.playFeedbackSound('SUCCESS');

    // Remove tapped leaf
    setCurrentLeaves((prev) => prev.filter((l) => l.id !== leaf.id));
    const nextCount = caughtCount + 1;
    setCaughtCount(nextCount);

    if (nextCount >= targetCatches) {
      finishGame([...reactionTimes, reactionMs]);
    }
  };

  const finishGame = (allReactions: number[]) => {
    setIsPlaying(false);
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const avgReaction = allReactions.length > 0
      ? Math.round(allReactions.reduce((a, b) => a + b, 0) / allReactions.length)
      : 1800;

    const score = Math.min(100, Math.max(60, Math.round(100 - (avgReaction / 100))));

    const result: GameSessionResult = {
      sessionId: `motor-${Date.now()}`,
      patientId: patient.id,
      gameId: 'bihu-tea-leaf-reflex',
      category: 'MOTOR',
      difficulty: currentDifficulty,
      score,
      accuracyPercent: 95,
      avgResponseTimeMs: avgReaction,
      totalAttempts: targetCatches,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: `Gentle motor reflex exercise completed! Average reaction speed: ${avgReaction}ms with rhythmic focus.`,
    };

    localDB.saveGameSession(result);
    setLatestResult(result);

    const pastSessions = localDB.getGameSessions(patient.id);
    const adaptation = evaluateGameAdaptation(result, patient, pastSessions, instructions);
    setAdaptationOutput(adaptation);

    if (adaptation.calculatedDifficulty !== currentDifficulty) {
      localDB.updatePatientDifficulty(patient.id, adaptation.calculatedDifficulty);
    }

    setIsCompleted(true);
    audioService.playFeedbackSound('SUCCESS');
    audioService.speak(`Excellent motor coordination! You collected all ${targetCatches} tea leaves.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-extrabold text-sm hover:bg-stone-50 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black uppercase">
            Game 10 • Motor Coordination &amp; Reflex
          </span>
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold">
            Level {currentDifficulty}
          </span>
        </div>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-xs shrink-0">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Assam Tea Garden Leaf Reflex
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Gently tap the fresh tea leaves and orchids as they drift into the bamboo basket.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-black text-sm shrink-0">
          Collected: {caughtCount} / {targetCatches}
        </div>
      </div>

      {/* Interactive Garden Stage */}
      <div className="relative aspect-4/3 sm:aspect-16/9 w-full bg-gradient-to-b from-emerald-100 via-teal-50 to-amber-100 rounded-3xl border-2 border-emerald-300 shadow-inner overflow-hidden flex flex-col justify-between p-6">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Top Info HUD */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-emerald-300 text-xs font-bold text-emerald-900 shadow-xs">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Target: {targetCatches} Tea Leaves</span>
          </div>

          <button
            onClick={() => audioService.speak('Tap each falling green tea leaf as soon as it appears.')}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-xs border border-stone-200 text-stone-700 hover:bg-white shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Spawning Tea Leaves */}
        {isPlaying ? (
          <div className="relative flex-1 w-full my-4">
            {currentLeaves.map((leaf) => (
              <button
                key={leaf.id}
                type="button"
                onClick={() => handleCatchLeaf(leaf)}
                style={{
                  left: `${leaf.xPercent}%`,
                  top: '40%',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 p-4 sm:p-5 rounded-3xl bg-white/95 hover:bg-emerald-50 border-3 border-emerald-400 shadow-xl cursor-pointer transition-all transform hover:scale-115 active:scale-90 flex flex-col items-center gap-1 animate-bounce"
              >
                <span className="text-4xl sm:text-5xl">{leaf.emoji}</span>
                <span className="text-[11px] font-black text-emerald-900 whitespace-nowrap">
                  {leaf.label}
                </span>
                <span className="text-[9px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                  Tap Me!
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="my-auto flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-4xl shadow-lg ring-8 ring-emerald-200 animate-pulse">
              🍃
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-emerald-950" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Ready for Garden Tea Picking?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium max-w-sm mt-1">
                Exercise your reaction rhythm in a calm, non-stressful tea garden setting.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartGame}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Tea Leaf Exercise</span>
            </button>
          </div>
        )}

        {/* Bottom Basket Bar */}
        <div className="relative z-10 bg-amber-200/90 backdrop-blur-xs border-2 border-amber-400 rounded-2xl p-3 flex items-center justify-between text-amber-950 text-xs font-extrabold shadow-sm">
          <span>🧺 Handwoven Cane Tea Basket</span>
          <span>{caughtCount} / {targetCatches} Collected</span>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompleted && latestResult && adaptationOutput && (
        <GameCompletionModal
          isOpen={isCompleted}
          result={latestResult}
          adaptation={adaptationOutput}
          patientName={patient.name}
          onPlayAgain={() => {
            setIsCompleted(false);
            handleStartGame();
          }}
          onGoToMemories={onGoToMemories}
          onClose={onBack}
        />
      )}
    </div>
  );
};
