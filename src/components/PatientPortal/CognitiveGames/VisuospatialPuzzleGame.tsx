import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Puzzle, 
  CheckCircle2, 
  Volume2, 
  Brain,
  Layers,
  Smile,
  Compass
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

interface VisuospatialPuzzleGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface PuzzlePart {
  id: string;
  name: string;
  shape: string;
  correctSlot: number;
  emoji: string;
  color: string;
  culturalNote: string;
}

const PUZZLE_LEVELS = [
  {
    title: 'Majuli Traditional Mask Assembly',
    theme: 'Majuli River Island Handcrafted Mask',
    description: 'Place each traditional mask feature into its correct position.',
    parts: [
      { id: 'p1', name: 'Bamboo Frame & Crown', shape: 'Top Crown', correctSlot: 0, emoji: '👑', color: 'bg-amber-100 text-amber-900 border-amber-400', culturalNote: 'Woven bamboo skeleton crafted by Majuli master artisans' },
      { id: 'p2', name: 'Lotus Forehead Motif', shape: 'Center Forehead', correctSlot: 1, emoji: '🪷', color: 'bg-rose-100 text-rose-900 border-rose-400', culturalNote: 'Spiritual floral ornament painted with natural river clay pigments' },
      { id: 'p3', name: 'Expressive Expressive Eyes', shape: 'Middle Eyes', correctSlot: 2, emoji: '👁️', color: 'bg-teal-100 text-teal-900 border-teal-400', culturalNote: 'Wide theatrical eyes used in classical Bhaona dance drama' },
      { id: 'p4', name: 'Carved Wooden Chin', shape: 'Bottom Chin', correctSlot: 3, emoji: '🎭', color: 'bg-orange-100 text-orange-900 border-orange-400', culturalNote: 'Lightweight wood sculpted for festival storytelling' },
    ],
  },
  {
    title: 'Heritage Clay Tea Cup (Kulhad) Potter Wheel',
    theme: 'Traditional Potter Wheel Assembly',
    description: 'Assemble the pottery layers from base to rim in balanced symmetry.',
    parts: [
      { id: 'p5', name: 'Broad Clay Base', shape: 'Bottom Foundation', correctSlot: 0, emoji: '🏺', color: 'bg-stone-200 text-stone-900 border-stone-400', culturalNote: 'Sturdy river silt base shaped on the wooden potter wheel' },
      { id: 'p6', name: 'Curved Tea Cup Body', shape: 'Middle Belly', correctSlot: 1, emoji: '☕', color: 'bg-amber-100 text-amber-900 border-amber-400', culturalNote: 'Holds fragrant warm Assam CTC tea brewed with ginger' },
      { id: 'p7', name: 'Smooth Polished Rim', shape: 'Top Opening', correctSlot: 2, emoji: '✨', color: 'bg-emerald-100 text-emerald-900 border-emerald-400', culturalNote: 'Earthy natural finish dried under gentle winter sunshine' },
    ],
  },
];

export const VisuospatialPuzzleGame: React.FC<VisuospatialPuzzleGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [levelIndex, setLevelIndex] = useState(0);
  const currentPuzzle = PUZZLE_LEVELS[levelIndex % PUZZLE_LEVELS.length];

  const [placedSlots, setPlacedSlots] = useState<Array<PuzzlePart | null>>(() => 
    new Array(currentPuzzle.parts.length).fill(null)
  );
  const [availableParts, setAvailableParts] = useState<PuzzlePart[]>([]);
  const [selectedPart, setSelectedPart] = useState<PuzzlePart | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  // Initialize and shuffle parts
  useEffect(() => {
    const puzzle = PUZZLE_LEVELS[levelIndex % PUZZLE_LEVELS.length];
    setPlacedSlots(new Array(puzzle.parts.length).fill(null));
    // Shuffle parts
    const shuffled = [...puzzle.parts].sort(() => Math.random() - 0.5);
    setAvailableParts(shuffled);
    setSelectedPart(null);
    setStartTime(Date.now());
    audioService.speak(`Assemble the ${puzzle.title}. Select a piece and place it in the correct slot.`);
  }, [levelIndex]);

  // Handle slot click
  const handleSlotClick = (slotIdx: number) => {
    if (!selectedPart) {
      // If clicking already placed piece, remove it
      if (placedSlots[slotIdx]) {
        const removed = placedSlots[slotIdx]!;
        const updated = [...placedSlots];
        updated[slotIdx] = null;
        setPlacedSlots(updated);
        setAvailableParts((prev) => [...prev, removed]);
        audioService.playFeedbackSound('GENTLE_TAP');
      }
      return;
    }

    // Place selected part in slot
    if (selectedPart.correctSlot === slotIdx) {
      audioService.playFeedbackSound('SUCCESS');
      const updated = [...placedSlots];
      updated[slotIdx] = selectedPart;
      setPlacedSlots(updated);
      setAvailableParts((prev) => prev.filter((p) => p.id !== selectedPart.id));
      setSelectedPart(null);

      // Check if all slots filled
      const allFilled = updated.every((p, idx) => p !== null && p.correctSlot === idx);
      if (allFilled) {
        handlePuzzleComplete();
      }
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      setMistakes((prev) => prev + 1);
      audioService.speak(`That piece belongs in a different section. Try another slot!`);
    }
  };

  const handlePuzzleComplete = () => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const accuracy = Math.max(40, Math.round(100 - mistakes * 12));
    const finalScore = Math.min(100, Math.round((accuracy * 0.7) + Math.max(10, 30 - elapsedSeconds)));

    const result: GameSessionResult = {
      sessionId: `puzzle-${Date.now()}`,
      patientId: patient.id,
      gameId: 'visuospatial-majuli-puzzle',
      category: 'PUZZLE',
      difficulty: currentDifficulty,
      score: finalScore,
      accuracyPercent: accuracy,
      avgResponseTimeMs: Math.round(elapsedSeconds * 1000 / currentPuzzle.parts.length),
      totalAttempts: currentPuzzle.parts.length + mistakes,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: `Fantastic visuospatial mastery! You constructed the ${currentPuzzle.title} with high precision.`,
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
    audioService.speak(`Well done! You assembled the entire ${currentPuzzle.title}!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-700 font-extrabold text-sm hover:bg-stone-50 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 text-xs font-black uppercase">
            Game 9 • Visuospatial Assembly
          </span>
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold">
            Level {currentDifficulty}
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border-2 border-cyan-300 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-3xl shadow-xs shrink-0">
            <Puzzle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {currentPuzzle.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              {currentPuzzle.description}
            </p>
          </div>
        </div>

        <button
          onClick={() => audioService.speak(currentPuzzle.description)}
          className="p-3 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 transition-colors cursor-pointer shrink-0"
          title="Read instructions aloud"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Assembly Stage & Pieces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Target Frame Assembly Slots */}
        <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Assembly Frame (Tap slot to place)</span>
          </h3>

          <div className="space-y-3">
            {currentPuzzle.parts.map((expectedPart, idx) => {
              const placed = placedSlots[idx];
              return (
                <div
                  key={expectedPart.id}
                  onClick={() => handleSlotClick(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    placed
                      ? `${placed.color} shadow-sm ring-2 ring-emerald-400/40`
                      : 'border-dashed border-stone-300 bg-stone-50 hover:bg-cyan-50/50 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/80 border border-stone-200 text-xs font-black text-stone-700 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-stone-500 uppercase">
                        Slot {idx + 1}: {expectedPart.shape}
                      </p>
                      <h4 className="text-sm font-black text-stone-900 mt-0.5">
                        {placed ? `${placed.emoji} ${placed.name}` : 'Empty Slot'}
                      </h4>
                    </div>
                  </div>

                  {placed ? (
                    <span className="text-xs font-black text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Placed
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-stone-400">
                      {selectedPart ? 'Tap to place' : 'Select piece'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Available Pieces Bin */}
        <div className="bg-stone-50 rounded-3xl p-6 border-2 border-stone-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Available Craft Pieces</span>
          </h3>

          {availableParts.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {availableParts.map((part) => {
                const isSelected = selectedPart?.id === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => {
                      setSelectedPart(isSelected ? null : part);
                      audioService.playFeedbackSound('GENTLE_TAP');
                      audioService.speak(`Selected ${part.name}. Now tap the matching slot on the left.`);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-100 shadow-md scale-102 ring-4 ring-cyan-400/30'
                        : `${part.color} hover:shadow-xs active:scale-98`
                    }`}
                  >
                    <span className="text-3xl">{part.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-extrabold text-stone-900">
                        {part.name}
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        {part.culturalNote}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 flex flex-col items-center gap-2 text-stone-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              <p className="text-sm font-bold text-stone-800">
                All parts successfully placed in the frame!
              </p>
            </div>
          )}
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
            setLevelIndex((prev) => prev + 1);
          }}
          onGoToMemories={onGoToMemories}
          onClose={onBack}
        />
      )}
    </div>
  );
};
