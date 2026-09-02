import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Brain,
  Volume2,
  CalendarCheck,
  Check
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

interface RoutineSequencerGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface RoutineStep {
  id: string;
  correctIndex: number;
  text: string;
  icon: string;
  hint: string;
}

interface RoutinePuzzle {
  id: string;
  title: string;
  culturalContext: string;
  steps: RoutineStep[];
}

const ROUTINE_PUZZLES: RoutinePuzzle[] = [
  {
    id: 'chai-routine',
    title: 'Making Warm Assam Morning Chai',
    culturalContext: 'Daily comforting morning tea routine in Assam households',
    steps: [
      { id: 'c1', correctIndex: 0, text: 'Boil fresh water with crushed ginger & cardamom', icon: '🫖', hint: 'Step 1: Start with heating the water' },
      { id: 'c2', correctIndex: 1, text: 'Add aromatic Assam CTC tea leaves to brew rich color', icon: '🍃', hint: 'Step 2: Add the tea leaves' },
      { id: 'c3', correctIndex: 2, text: 'Pour in fresh milk and let it simmer together', icon: '🥛', hint: 'Step 3: Add warm milk' },
      { id: 'c4', correctIndex: 3, text: 'Strain tea into your favorite clay cup (Kulhad) & enjoy with pitha', icon: '☕', hint: 'Step 4: Serve and savor' },
    ],
  },
  {
    id: 'garden-walk',
    title: 'Morning Garden & Nature Walk',
    culturalContext: 'Peaceful morning routine amidst fresh greenery',
    steps: [
      { id: 'g1', correctIndex: 0, text: 'Wear comfortable walking slippers & warm cotton shawl', icon: '🧣', hint: 'Step 1: Put on warm clothing' },
      { id: 'g2', correctIndex: 1, text: 'Step out into the courtyard to feel the fresh morning breeze', icon: '🏡', hint: 'Step 2: Step outside' },
      { id: 'g3', correctIndex: 2, text: 'Water the basil (Tulsi) plant and look at the blooming orchids', icon: '🌺', hint: 'Step 3: Greet the plants' },
      { id: 'g4', correctIndex: 3, text: 'Sit peacefully on the veranda with a warm glass of water', icon: '🪑', hint: 'Step 4: Rest and breathe' },
    ],
  },
  {
    id: 'bihu-prep',
    title: 'Getting Ready for Rongali Bihu Morning',
    culturalContext: 'Traditional festive celebration preparation',
    steps: [
      { id: 'b1', correctIndex: 0, text: 'Take a refreshing morning bath with aromatic turmeric paste (Mah-Halodhi)', icon: '✨', hint: 'Step 1: Morning cleansing' },
      { id: 'b2', correctIndex: 1, text: 'Wear clean festive silk clothes and drape the red-bordered Gamosa', icon: '👘', hint: 'Step 2: Dress in festival attire' },
      { id: 'b3', correctIndex: 3, text: 'Receive blessings from elders and share Til Pitha & Ghila Pitha', icon: '🥮', hint: 'Step 4: Festive sweets & blessings' },
      { id: 'b2_5', correctIndex: 2, text: 'Light the earthen oil lamp at the home prayer altar (Namghar)', icon: '🪔', hint: 'Step 3: Light the holy lamp' },
    ],
  },
  {
    id: 'evening-winddown',
    title: 'Evening Calm Wind-Down & Rest',
    culturalContext: 'Nourishing procedural routine for peaceful sleep',
    steps: [
      { id: 'e1', correctIndex: 0, text: 'Eat a warm, light dinner with family', icon: '🍲', hint: 'Step 1: Nourishing dinner' },
      { id: 'e2', correctIndex: 1, text: 'Take evening medications with a glass of water', icon: '💊', hint: 'Step 2: Prescribed health care' },
      { id: 'e3', correctIndex: 2, text: 'Listen to a soothing flute melody or quiet reminiscence radio', icon: '🎶', hint: 'Step 3: Calming the mind' },
      { id: 'e4', correctIndex: 3, text: 'Lie down in cozy warm bed for a deep, peaceful sleep', icon: '🛏️', hint: 'Step 4: Restful sleep' },
    ],
  },
];

export const RoutineSequencerGame: React.FC<RoutineSequencerGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [userSteps, setUserSteps] = useState<RoutineStep[]>(() => {
    // Initial shuffle
    const current = ROUTINE_PUZZLES[0];
    return [...current.steps].sort(() => Math.random() - 0.5);
  });
  const [checkedStatus, setCheckedStatus] = useState<boolean | null>(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [successfulSolves, setSuccessfulSolves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const currentPuzzle = ROUTINE_PUZZLES[puzzleIndex % ROUTINE_PUZZLES.length];

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    audioService.playFeedbackSound('GENTLE_TAP');
    const newSteps = [...userSteps];
    const temp = newSteps[index - 1];
    newSteps[index - 1] = newSteps[index];
    newSteps[index] = temp;
    setUserSteps(newSteps);
    setCheckedStatus(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === userSteps.length - 1) return;
    audioService.playFeedbackSound('GENTLE_TAP');
    const newSteps = [...userSteps];
    const temp = newSteps[index + 1];
    newSteps[index + 1] = newSteps[index];
    newSteps[index] = temp;
    setUserSteps(newSteps);
    setCheckedStatus(null);
  };

  const handleReadAloud = (text: string) => {
    audioService.speak(text);
  };

  const handleCheckSequence = () => {
    setTotalAttempts((prev) => prev + 1);
    
    // Check if every step matches its expected relative chronological order
    const isCorrect = userSteps.every((step, idx) => step.correctIndex === idx);

    if (isCorrect) {
      setCheckedStatus(true);
      setSuccessfulSolves((prev) => prev + 1);
      audioService.playFeedbackSound('SUCCESS');
      audioService.speak('Excellent order! You put every step in the perfect sequence.');

      // Check if finished 2 rounds or completed
      if (puzzleIndex >= 1 || currentDifficulty === 1) {
        finishGame(successfulSolves + 1, totalAttempts + 1);
      } else {
        setTimeout(() => {
          const nextIdx = puzzleIndex + 1;
          setPuzzleIndex(nextIdx);
          const nextPuzzle = ROUTINE_PUZZLES[nextIdx % ROUTINE_PUZZLES.length];
          setUserSteps([...nextPuzzle.steps].sort(() => Math.random() - 0.5));
          setCheckedStatus(null);
        }, 1600);
      }
    } else {
      setCheckedStatus(false);
      audioService.playFeedbackSound('GENTLE_TAP');
      audioService.speak('Almost there! Take a look at the hints and adjust the order gently.');
    }
  };

  const finishGame = (solves: number, attempts: number) => {
    const elapsedSeconds = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(100, Math.round((solves / Math.max(1, attempts)) * 100));

    const result: GameSessionResult = {
      sessionId: `sess-routine-${Date.now()}`,
      patientId: patient.id,
      gameId: 'routine-sequencer-01',
      category: 'ROUTINE',
      difficulty: currentDifficulty,
      score: accuracy,
      accuracyPercent: accuracy,
      avgResponseTimeMs: (elapsedSeconds / Math.max(1, attempts)) * 1000,
      totalAttempts: attempts,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText:
        accuracy >= 75
          ? 'Outstanding procedural recall! You organized daily routines with great clarity.'
          : 'Good effort arranging daily steps. Practicing daily routines nurtures independence.',
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
    setPuzzleIndex(0);
    const first = ROUTINE_PUZZLES[0];
    setUserSteps([...first.steps].sort(() => Math.random() - 0.5));
    setCheckedStatus(null);
    setTotalAttempts(0);
    setSuccessfulSolves(0);
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4 text-amber-600" />
            <span>Activity 5 of 8 • Daily Routine Sequencer</span>
          </div>
          <p className="text-xs text-stone-500 font-medium">Procedural Memory & Daily Independence</p>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          title="Restart Puzzle"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Routine Mission Card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              Routine Puzzle {puzzleIndex + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              {currentPuzzle.title}
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 font-medium">
              {currentPuzzle.culturalContext}
            </p>
          </div>
          <button
            onClick={() => handleReadAloud(`Arrange the steps for: ${currentPuzzle.title}. Use the up and down arrows to place them in order from first to last.`)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-colors shrink-0"
            title="Read instructions aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/20 text-xs text-amber-100 font-semibold flex items-center gap-2">
          <span>💡 Tap the <strong>Up (▲)</strong> and <strong>Down (▼)</strong> arrows to put the steps in order from First to Last.</span>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-3">
        {userSteps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
              checkedStatus === true
                ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                : 'bg-white border-stone-200 hover:border-amber-400 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Step Number Badge */}
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-base shrink-0">
                {idx + 1}
              </div>

              {/* Step Icon */}
              <span className="text-2xl shrink-0">{step.icon}</span>

              {/* Step Description */}
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-xs sm:text-sm leading-snug">
                  {step.text}
                </p>
                <span className="text-[11px] text-stone-400 font-medium">
                  {step.hint}
                </span>
              </div>
            </div>

            {/* Reordering Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-stone-100 text-stone-800 transition-colors"
                aria-label="Move step up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === userSteps.length - 1}
                className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 disabled:opacity-30 disabled:hover:bg-stone-100 text-stone-800 transition-colors"
                aria-label="Move step down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleReadAloud(`Step ${idx + 1}: ${step.text}`)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                title="Read step aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Message & Action Button */}
      {checkedStatus === false && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-bold flex items-center justify-between">
          <span>Not quite in the right order yet. Think about what we do first! Check step 1 and 2.</span>
          <button
            onClick={() => handleReadAloud('Take a close look at what happens first in the morning or recipe, then move it to number 1.')}
            className="text-amber-800 underline ml-2 shrink-0"
          >
            Hear Hint
          </button>
        </div>
      )}

      {checkedStatus === true && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-400 rounded-2xl text-xs text-emerald-900 font-black flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Perfect sequence! Steps organized seamlessly.</span>
        </div>
      )}

      <button
        onClick={handleCheckSequence}
        className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white text-base font-extrabold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>Check My Routine Order</span>
      </button>

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
