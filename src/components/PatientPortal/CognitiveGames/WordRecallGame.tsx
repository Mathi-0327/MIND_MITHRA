import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  MessageSquare,
  Check,
  BookOpen
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

interface WordRecallGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface WordPuzzle {
  id: string;
  leadWord: string;
  leadIcon: string;
  promptSentence: string;
  options: {
    id: string;
    text: string;
    icon: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  culturalFact: string;
}

const WORD_PUZZLES: WordPuzzle[] = [
  {
    id: 'w1',
    leadWord: 'Assam Morning Chai (Tea)',
    leadIcon: '☕',
    promptSentence: 'What is traditionally served alongside fresh steaming Assam tea?',
    options: [
      { id: 'o1', text: 'Crispy Til Pitha & Laru', icon: '🥮', isCorrect: true, explanation: 'Traditional Assamese sesame sweets paired with morning tea.' },
      { id: 'o2', text: 'Heavy Iron Anchor', icon: '⚓', isCorrect: false, explanation: 'An anchor is used for boats, not tea.' },
      { id: 'o3', text: 'Winter Woolen Boots', icon: '👢', isCorrect: false, explanation: 'Boots are for walking, not breakfast.' },
    ],
    culturalFact: 'Tea garden mornings in Assam are customarily greeted with hot black tea and freshly roasted rice pithas.',
  },
  {
    id: 'w2',
    leadWord: 'Brahmaputra River Waters',
    leadIcon: '🌊',
    promptSentence: 'Which vessel glides peacefully across the sacred Brahmaputra river?',
    options: [
      { id: 'o4', text: 'Ferry Boat (Naao)', icon: '⛵', isCorrect: true, explanation: 'Wooden boats have ferried travelers between Majuli and Tezpur for centuries.' },
      { id: 'o5', text: 'Steam Railway Locomotive', icon: '🚂', isCorrect: false, explanation: 'Trains run on tracks on land.' },
      { id: 'o6', text: 'Clay Roof Tile', icon: '🧱', isCorrect: false, explanation: 'Tiles are used for cottage roofs.' },
    ],
    culturalFact: 'The Brahmaputra is one of the grandest rivers in the world, nurturing the fertile tea soils of North East India.',
  },
  {
    id: 'w3',
    leadWord: 'Bihu Spring Festival',
    leadIcon: '🪘',
    promptSentence: 'Which instrument produces the lively rhythm of the Bihu dance?',
    options: [
      { id: 'o7', text: 'Bihu Dhol (Drum) & Pepa', icon: '🥁', isCorrect: true, explanation: 'The buffalo-horn Pepa and two-sided Dhol are the heartbeat of Rongali Bihu.' },
      { id: 'o8', text: 'Metal Bicycle Bell', icon: '🔔', isCorrect: false, explanation: 'Bicycle bells are for bicycles on the road.' },
      { id: 'o9', text: 'Electric Blender', icon: '🔌', isCorrect: false, explanation: 'Kitchen appliances do not play folk tunes.' },
    ],
    culturalFact: 'Rongali Bihu marks the onset of the Assamese new year and the arrival of sowing season in April.',
  },
  {
    id: 'w4',
    leadWord: 'Muga Golden Silk Weaver',
    leadIcon: '🧵',
    promptSentence: 'Where does an artisan weave beautiful Gamosas and Mekhela Chador?',
    options: [
      { id: 'o10', text: 'Traditional Wooden Loom (Taat-Xal)', icon: '🪵', isCorrect: true, explanation: 'Handloom weaving is an honored tradition in Sualkuchi and villages.' },
      { id: 'o11', text: 'Stone Quarry Field', icon: '⛏️', isCorrect: false, explanation: 'Quarries are for heavy stones.' },
      { id: 'o12', text: 'Submarine Hatch', icon: '🤿', isCorrect: false, explanation: 'Submarines explore ocean depths.' },
    ],
    culturalFact: 'Assam is world-renowned for its shimmering natural golden Muga silk, which gets richer with every wash.',
  },
];

export const WordRecallGame: React.FC<WordRecallGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const currentPuzzle = WORD_PUZZLES[puzzleIndex % WORD_PUZZLES.length];

  const handleSelectOption = (option: typeof currentPuzzle.options[0]) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);
    setTotalAttempts((prev) => prev + 1);

    if (option.isCorrect) {
      setCorrectCount((prev) => prev + 1);
      audioService.playFeedbackSound('SUCCESS');
      audioService.speak(`Correct! ${option.text}. ${option.explanation}`);
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      audioService.speak(`Good try. ${option.explanation}`);
    }
  };

  const handleNextPuzzle = () => {
    if (puzzleIndex >= 2 || currentDifficulty === 1) {
      finishGame(correctCount, totalAttempts);
    } else {
      setPuzzleIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const finishGame = (solves: number, attempts: number) => {
    const elapsedSeconds = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(100, Math.round((solves / Math.max(1, attempts)) * 100));

    const result: GameSessionResult = {
      sessionId: `sess-word-${Date.now()}`,
      patientId: patient.id,
      gameId: 'word-recall-01',
      category: 'LANGUAGE',
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
          ? 'Wonderful verbal recall! You connected cultural concepts and everyday words seamlessly.'
          : 'Nice practice remembering familiar words and cultural connections. Everyday language practice keeps the mind agile.',
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
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setTotalAttempts(0);
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-rose-600" />
            <span>Activity 6 of 8 • Word & Proverb Recall</span>
          </div>
          <p className="text-xs text-stone-500 font-medium">Language Fluency & Semantic Association</p>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          title="Restart Activity"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Word Question Card */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white">
              Word Pair {puzzleIndex + 1} of 3
            </span>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl">{currentPuzzle.leadIcon}</span>
              <h2 className="text-2xl sm:text-3xl font-black">
                {currentPuzzle.leadWord}
              </h2>
            </div>
            <p className="text-sm sm:text-base text-rose-100 mt-2 font-medium">
              {currentPuzzle.promptSentence}
            </p>
          </div>

          <button
            onClick={() =>
              audioService.speak(
                `${currentPuzzle.leadWord}. ${currentPuzzle.promptSentence}`
              )
            }
            className="p-3.5 bg-white/20 hover:bg-white/30 rounded-2xl text-white transition-colors shrink-0"
            title="Read question aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Answer Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {currentPuzzle.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          let cardStyle = 'bg-white border-stone-200 hover:border-rose-400 hover:bg-rose-50/50';

          if (isAnswered) {
            if (option.isCorrect) {
              cardStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 shadow-md';
            } else if (isSelected && !option.isCorrect) {
              cardStyle = 'bg-rose-50 border-rose-400 opacity-75';
            } else {
              cardStyle = 'bg-stone-50 border-stone-200 opacity-50';
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between shadow-xs ${cardStyle}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{option.icon}</span>
                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                  {option.text}
                </h4>
                {isAnswered && isSelected && (
                  <p className="text-xs mt-1.5 font-medium text-stone-600">
                    {option.explanation}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cultural Nostalgia Note */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed font-medium">
          <strong>Cultural Memory:</strong> {currentPuzzle.culturalFact}
        </div>
      </div>

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNextPuzzle}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-base font-extrabold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <span>Continue to Next Word Pair</span>
          <Check className="w-5 h-5 stroke-[3]" />
        </button>
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
