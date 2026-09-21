import React, { useState } from 'react';
import { 
  Coffee, 
  Sprout, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ChevronRight,
  Flame,
  Droplets,
  Flower2
} from 'lucide-react';
import { SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface LifeSkillSimulatorViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

interface StepItem {
  id: string;
  title: string;
  instruction: string;
  actionPrompt: string;
  icon: any;
  soundCue: string;
}

interface SimulatorScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  coverImage: string;
  steps: StepItem[];
}

const SCENARIOS: SimulatorScenario[] = [
  {
    id: 'assam-chai',
    title: 'Brewing Authentic Assam Ginger Chai',
    subtitle: 'Morning Veranda Ritual: Boil water, crush cardamom & ginger, steep CTC tea, add milk',
    category: 'Daily Living & Nourishment',
    coverImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1: Pour Fresh Spring Water into the Kettle',
        instruction: 'Measure one cup of fresh cold water and pour gently into the brass saucepan.',
        actionPrompt: 'Tap the kettle to add fresh water into the pot',
        icon: Droplets,
        soundCue: 'Gentle water pouring into pot'
      },
      {
        id: 'step-2',
        title: 'Step 2: Crush Fresh Ginger & Green Cardamom',
        instruction: 'Use the stone mortar and pestle to gently crush a small piece of ginger and two fragrant cardamom pods.',
        actionPrompt: 'Tap the mortar and pestle to crush the aromatic spices',
        icon: Sparkles,
        soundCue: 'Rhythmic pestle tap on stone'
      },
      {
        id: 'step-3',
        title: 'Step 3: Add Spices and Bring to a Gentle Simmer',
        instruction: 'Place the crushed spices into the warming water and let the aromas release as bubbles appear.',
        actionPrompt: 'Turn on low flame to simmer the warming spices',
        icon: Flame,
        soundCue: 'Soft water boiling simmer'
      },
      {
        id: 'step-4',
        title: 'Step 4: Spoon Rich Assam CTC Black Tea',
        instruction: 'Add one heaping teaspoon of golden-tip Assam tea leaves into the bubbling brew.',
        actionPrompt: 'Spoon the tea leaves into the boiling amber infusion',
        icon: Coffee,
        soundCue: 'Aromatic tea leaves entering pot'
      },
      {
        id: 'step-5',
        title: 'Step 5: Pour Warm Milk and Strain into Your Favorite Cup',
        instruction: 'Add fresh milk, bring to one rich rise, and pour through the mesh brass strainer into your cup.',
        actionPrompt: 'Strain the warm golden tea into your morning cup',
        icon: ThumbsUp,
        soundCue: 'Tea streaming smoothly into ceramic cup'
      }
    ]
  },
  {
    id: 'veranda-gardening',
    title: 'Caring for Courtyard Orchids & Ferns',
    subtitle: 'Afternoon Garden Harmony: Check moisture, mist leaves, prune yellowed fronds',
    category: 'Nature & Motor Coordination',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
    steps: [
      {
        id: 'step-g1',
        title: 'Step 1: Feel the Pot Soil with Your Fingertips',
        instruction: 'Gently touch the moss around the orchid roots to check if it feels dry or cool.',
        actionPrompt: 'Touch the roots to inspect soil hydration',
        icon: Sprout,
        soundCue: 'Soft rustle of potting moss'
      },
      {
        id: 'step-g2',
        title: 'Step 2: Fill the Gentle Watering Can',
        instruction: 'Fill the watering can with room-temperature rain water.',
        actionPrompt: 'Fill the watering can with fresh water',
        icon: Droplets,
        soundCue: 'Filling watering can with splash'
      },
      {
        id: 'step-g3',
        title: 'Step 3: Spray Gentle Mist Over Orchid Leaves',
        instruction: 'Give three gentle sprays of fine mist across the broad green leaves to keep them vibrant.',
        actionPrompt: 'Press spray nozzle for gentle mist',
        icon: Flower2,
        soundCue: 'Fine water mist spraying'
      },
      {
        id: 'step-g4',
        title: 'Step 4: Place Orchid in Filtered Balcony Sunlight',
        instruction: 'Move the pot under the bamboo lattice where warm morning sun filters softly through.',
        actionPrompt: 'Place pot into the morning sunlit corner',
        icon: Sparkles,
        soundCue: 'Satisfying placement of clay pot'
      }
    ]
  }
];

export const LifeSkillSimulatorView: React.FC<LifeSkillSimulatorViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SimulatorScenario>(SCENARIOS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeStep = selectedScenario.steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + (isCompleted ? 1 : 0)) / selectedScenario.steps.length) * 100);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioService.speak(text, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const handlePerformAction = () => {
    audioService.playChime(660);
    audioService.speak(`Excellent! You completed ${activeStep.title}.`);

    if (currentStepIndex + 1 < selectedScenario.steps.length) {
      setCurrentStepIndex(i => i + 1);
    } else {
      setIsCompleted(true);
      audioService.speak("Congratulations! You have completed the routine with flying colors. A warm cup of joy!");
      localDB.addGameSession({
        sessionId: `sess-sim-${Date.now()}`,
        patientId,
        gameId: `simulator-${selectedScenario.id}`,
        category: 'ROUTINE',
        difficulty: 1,
        score: 100,
        accuracyPercent: 100,
        avgResponseTimeMs: 2500,
        totalAttempts: selectedScenario.steps.length,
        completed: true,
        abandoned: false,
        timestamp: new Date().toISOString(),
        feedbackText: `Completed all steps of ${selectedScenario.title}`,
      });
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    audioService.speak("Let us begin this lovely daily routine fresh from Step 1.");
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] dark:bg-[#1A211D] text-[#26302A] dark:text-[#E2EBD9]">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/80 dark:bg-[#202924]/80 backdrop-blur-md border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Coffee className="w-7 h-7 text-[#C66F4E]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Daily Life Skill Simulator (দৈনন্দিন কৌশল)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Practice comforting daily motor tasks and procedural steps in an anxiety-free environment
            </p>
          </div>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-2">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setCurrentStepIndex(0);
                setIsCompleted(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                selectedScenario.id === sc.id
                  ? 'bg-[#58745A] text-white shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
              }`}
            >
              {sc.title.split(' ')[0]} {sc.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="mb-6 bg-white dark:bg-[#202924] p-4 rounded-2xl border border-[#E2EBD9] dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            <span>{selectedScenario.title}</span>
            <span className="text-[#58745A] dark:text-[#789477] font-extrabold">{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#58745A] to-[#B28A32] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Card */}
        {!isCompleted ? (
          <div className="bg-white dark:bg-[#202924] rounded-3xl p-6 sm:p-10 border-2 border-[#E2EBD9] dark:border-stone-800 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleSpeak(`${activeStep.title}. ${activeStep.instruction}`)}
                className={`p-3 rounded-full transition shadow-sm ${
                  isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#58745A] text-white'
                }`}
                aria-label="Listen to step instruction"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <span className="inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#E2EBD9] text-[#58745A] dark:bg-stone-800 dark:text-[#789477] mb-3">
              Step {currentStepIndex + 1} of {selectedScenario.steps.length}
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] mb-2">
              {activeStep.title}
            </h2>
            <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl mx-auto mb-8 font-serif leading-relaxed">
              {activeStep.instruction}
            </p>

            {/* Visual Tactile Interactive Target */}
            <div className="py-6 flex flex-col items-center">
              <button
                onClick={handlePerformAction}
                className="group relative p-8 rounded-full bg-gradient-to-tr from-[#FFFDF7] to-[#F8EBD8] dark:from-stone-800 dark:to-stone-700 border-4 border-[#58745A] dark:border-[#789477] shadow-xl hover:shadow-2xl transition transform hover:scale-105 active:scale-95"
              >
                <activeStep.icon className="w-20 h-20 text-[#58745A] dark:text-[#789477] group-hover:rotate-12 transition-transform duration-300" />
              </button>

              <p className="font-serif font-bold text-lg text-[#58745A] dark:text-[#789477] mt-6 flex items-center gap-2">
                <span>👉 {activeStep.actionPrompt}</span>
              </p>
              <span className="text-xs text-stone-500 mt-1">
                Audio cue: {activeStep.soundCue}
              </span>
            </div>
          </div>
        ) : (
          /* Completion Celebration Card */
          <div className="bg-gradient-to-br from-emerald-50 to-[#FFFDF7] dark:from-stone-900 dark:to-[#1A211D] rounded-3xl p-8 sm:p-12 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
              Magnificent Work!
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-300 max-w-md mx-auto mt-2 font-serif">
              You have successfully completed every step of {selectedScenario.title}. Your motor confidence and memory sequence are radiant!
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-200 flex items-center justify-center gap-2 hover:bg-stone-50 transition"
              >
                <RotateCcw className="w-5 h-5" />
                Practice Routine Again
              </button>
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#58745A] text-white font-serif font-bold text-lg shadow-md hover:bg-[#435945] transition"
              >
                Return to Patient Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
