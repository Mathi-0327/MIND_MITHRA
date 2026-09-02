import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  BookOpenCheck,
  Check,
  MapPin,
  Calendar
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

interface StoryRecallGameProps {
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories: () => void;
}

interface StoryRecallVignette {
  id: string;
  title: string;
  location: string;
  season: string;
  imageUrl: string;
  storyNarrative: string;
  questions: {
    id: string;
    questionText: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      hint: string;
    }[];
  }[];
}

const STORY_VIGNETTES: StoryRecallVignette[] = [
  {
    id: 'story-1',
    title: 'Tea Garden Harvest with Granddaughter Ananya',
    location: 'Jorhat Tea Estate, Assam',
    season: 'Autumn Morning',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    storyNarrative:
      'On a sunny autumn morning in Jorhat, Ravi and his granddaughter Ananya took a peaceful stroll through the tea garden. Ananya plucked two tender green leaves and placed them in her small wicker basket. Afterwards, they sat on the wooden veranda drinking sweet ginger tea and eating warm til pithas.',
    questions: [
      {
        id: 'q1-1',
        questionText: 'Who accompanied Ravi on the tea garden walk?',
        options: [
          { id: 'op1', text: 'His granddaughter Ananya', isCorrect: true, hint: 'Ananya walked hand-in-hand with Ravi' },
          { id: 'op2', text: 'A busy train conductor', isCorrect: false, hint: 'They were in the peaceful garden, not a train' },
          { id: 'op3', text: 'A deep-sea diver', isCorrect: false, hint: 'They were surrounded by green tea bushes' },
        ],
      },
      {
        id: 'q1-2',
        questionText: 'What warm drink did they enjoy on the veranda?',
        options: [
          { id: 'op4', text: 'Sweet ginger tea with til pithas', isCorrect: true, hint: 'A comforting cup of Assam tea' },
          { id: 'op5', text: 'Icy cold soda with crushed ice', isCorrect: false, hint: 'They had warm comforting tea' },
          { id: 'op6', text: 'Spicy chili soup', isCorrect: false, hint: 'They enjoyed sweet tea and pithas' },
        ],
      },
    ],
  },
  {
    id: 'story-2',
    title: 'Rongali Bihu Courtyard Music & Dhol Beats',
    location: 'Tezpur Courtyard, Assam',
    season: 'Spring Bohag Festival',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    storyNarrative:
      'During Bohag Bihu in Tezpur, the courtyard was filled with music. Ravi played the traditional Bihu Dhol drum with energetic joy. His daughter Priyanka brought out fresh coconut Laru sweets and tied a red-bordered Gamosa around Ravi’s shoulders with deep respect.',
    questions: [
      {
        id: 'q2-1',
        questionText: 'What instrument did Ravi play in the courtyard?',
        options: [
          { id: 'op7', text: 'The traditional Bihu Dhol drum', isCorrect: true, hint: 'He played the rhythmic folk drum' },
          { id: 'op8', text: 'An electric synthesizer', isCorrect: false, hint: 'It was a traditional folk drum' },
          { id: 'op9', text: 'A heavy ship horn', isCorrect: false, hint: 'The celebration had sweet folk rhythms' },
        ],
      },
      {
        id: 'q2-2',
        questionText: 'What respectful gift did Priyanka drape around Ravi?',
        options: [
          { id: 'op10', text: 'A red-bordered Assamese Gamosa', isCorrect: true, hint: 'The traditional woven shawl of honor' },
          { id: 'op11', text: 'A heavy leather jacket', isCorrect: false, hint: 'She gave the traditional Gamosa' },
          { id: 'op12', text: 'A plastic rain poncho', isCorrect: false, hint: 'The Gamosa is the cultural symbol of respect' },
        ],
      },
    ],
  },
];

export const StoryRecallGame: React.FC<StoryRecallGameProps> = ({
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}) => {
  const currentDifficulty = patient.currentDifficultyLevel || 2;
  const [vignetteIndex, setVignetteIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [isReadingStory, setIsReadingStory] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [latestResult, setLatestResult] = useState<GameSessionResult | null>(null);
  const [adaptationOutput, setAdaptationOutput] = useState<AdaptationOutput | null>(null);

  const currentVignette = STORY_VIGNETTES[vignetteIndex % STORY_VIGNETTES.length];
  const currentQuestion = currentVignette.questions[questionIndex % currentVignette.questions.length];

  const handleReadStory = () => {
    if (isReadingStory) {
      audioService.stopSpeaking();
      setIsReadingStory(false);
      return;
    }
    setIsReadingStory(true);
    audioService.speak(
      `${currentVignette.title}. ${currentVignette.storyNarrative}`
    );
  };

  const handleSelectOption = (option: typeof currentQuestion.options[0]) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);
    setTotalAttempts((prev) => prev + 1);

    if (option.isCorrect) {
      setCorrectCount((prev) => prev + 1);
      audioService.playFeedbackSound('SUCCESS');
      audioService.speak(`Excellent! ${option.text}.`);
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      audioService.speak(`Good attempt. Hint: ${option.hint}`);
    }
  };

  const handleNextStep = () => {
    if (questionIndex + 1 < currentVignette.questions.length) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      finishGame(correctCount, totalAttempts);
    }
  };

  const finishGame = (solves: number, attempts: number) => {
    const elapsedSeconds = Math.max(2, Math.round((Date.now() - startTime) / 1000));
    const accuracy = Math.min(100, Math.round((solves / Math.max(1, attempts)) * 100));

    const result: GameSessionResult = {
      sessionId: `sess-story-${Date.now()}`,
      patientId: patient.id,
      gameId: 'story-recall-01',
      category: 'STORY',
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
          ? 'Heartwarming narrative recall! Remembering stories keeps episodic memory and family connections strong.'
          : 'Great listening and recall practice. Story reminiscence nurtures joy and comfort.',
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
    setVignetteIndex(0);
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setTotalAttempts(0);
    setStartTime(Date.now());
    setIsCompleted(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Activity</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-indigo-700 uppercase tracking-wider">
            <BookOpenCheck className="w-4 h-4 text-indigo-600" />
            <span>Activity 8 of 8 • Story & Reminiscence Recall</span>
          </div>
          <p className="text-xs text-stone-500 font-medium">Episodic Memory & Story Comprehension</p>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
          title="Restart Story"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Story Vignette Card with Photo & Read-Aloud */}
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={currentVignette.imageUrl}
            alt={currentVignette.title}
            referrerPolicy="no-referrer"
            className="w-full sm:w-44 h-36 object-cover rounded-2xl border border-stone-300 shrink-0 shadow-xs"
          />

          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] font-bold text-stone-500">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {currentVignette.location}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                {currentVignette.season}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-snug">
              {currentVignette.title}
            </h2>

            <button
              type="button"
              onClick={handleReadStory}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center sm:justify-start gap-2 transition-all shadow-xs ${
                isReadingStory
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isReadingStory ? 'Listening to Story...' : 'Listen to Story Read Aloud'}</span>
            </button>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
            "{currentVignette.storyNarrative}"
          </p>
        </div>
      </div>

      {/* Question Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
            Question {questionIndex + 1} of {currentVignette.questions.length}
          </span>
          <button
            onClick={() => audioService.speak(currentQuestion.questionText)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Question</span>
          </button>
        </div>

        <h3 className="text-base sm:text-lg font-black text-stone-900 bg-white p-4 rounded-2xl border-2 border-stone-200 shadow-xs">
          {currentQuestion.questionText}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let btnStyle = 'bg-white border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/40';

            if (isAnswered) {
              if (option.isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-950 shadow-md';
              } else if (isSelected && !option.isCorrect) {
                btnStyle = 'bg-rose-50 border-rose-400 opacity-75';
              } else {
                btnStyle = 'bg-stone-50 border-stone-200 opacity-50';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 shadow-xs ${btnStyle}`}
              >
                <span className="font-extrabold text-xs sm:text-sm text-stone-900">
                  {option.text}
                </span>
                {isAnswered && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        {isAnswered && (
          <button
            onClick={handleNextStep}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-extrabold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            <span>{questionIndex + 1 < currentVignette.questions.length ? 'Next Question' : 'Complete Story Activity'}</span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        )}
      </div>

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
