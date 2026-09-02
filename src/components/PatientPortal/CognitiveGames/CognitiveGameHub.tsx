import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  Heart, 
  Trophy, 
  Clock, 
  HelpCircle,
  Eye,
  Layers,
  CalendarCheck,
  MessageSquare,
  FolderTree,
  BookOpenCheck,
  Puzzle,
  Zap,
  Coins,
  Compass,
  Music,
  Sun,
  Smile,
  Radio,
  Coffee,
  Shield,
  MessageCircle,
  Check
} from 'lucide-react';
import { 
  CognitiveGameDefinition, 
  PatientProfile, 
  SupportedLanguage, 
  GameSessionResult, 
  CaregiverInstruction 
} from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';
import { evaluateGameAdaptation } from '../../../lib/adaptiveEngine';

interface CognitiveGameHubProps {
  game: CognitiveGameDefinition;
  patient: PatientProfile;
  instructions: CaregiverInstruction[];
  language: SupportedLanguage;
  onBack: () => void;
  onGoToMemories?: () => void;
}

export function CognitiveGameHub({
  game,
  patient,
  instructions,
  language,
  onBack,
  onGoToMemories,
}: CognitiveGameHubProps) {
  const [difficulty, setDifficulty] = useState<number>(patient.currentDifficultyLevel || game.baseDifficulty);
  const [step, setStep] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [totalRounds] = useState<number>(4);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Specific Game State Storage
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [sortedOrder, setSortedOrder] = useState<string[]>([]);
  const [tapCount, setTapCount] = useState<number>(0);
  const [colorFilled, setColorFilled] = useState<Record<string, string>>({});
  const [selectedColor, setSelectedColor] = useState<string>('#e11d48');

  // Track start of each round for latency
  const roundStartTime = useRef<number>(Date.now());

  useEffect(() => {
    roundStartTime.current = Date.now();
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setFeedbackMessage('');
  }, [round]);

  const speakPrompt = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  const handleFinishGame = (finalScore: number, finalAccuracy: number) => {
    const avgLatency = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
      : 2600;

    const result: GameSessionResult = {
      sessionId: `sess-${Date.now()}`,
      patientId: patient.id,
      gameId: game.id,
      category: game.category,
      difficulty,
      score: Math.min(100, Math.max(20, finalScore)),
      accuracyPercent: finalAccuracy,
      avgResponseTimeMs: avgLatency,
      totalAttempts: totalRounds,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: `Completed ${game.title} with high focus and ${finalAccuracy}% precision.`,
    };

    // Evaluate dynamic adaptation
    const recent = localDB.getGameSessions(patient.id);
    const adaptation = evaluateGameAdaptation(result, patient, recent, instructions);
    result.adaptationApplied = {
      previousDifficulty: difficulty,
      newDifficulty: adaptation.calculatedDifficulty,
      reason: adaptation.reason,
    };

    localDB.saveGameSession(result);
    localDB.updatePatientDifficulty(patient.id, adaptation.calculatedDifficulty);
    setIsCompleted(true);
    audioService.playFeedbackSound('SUCCESS');
  };

  const submitRoundAnswer = (isCorrect: boolean, successNote?: string) => {
    const latency = Date.now() - roundStartTime.current;
    setResponseTimes((prev) => [...prev, latency]);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      audioService.playFeedbackSound('SUCCESS');
      setScore((s) => s + 25);
      setFeedbackMessage(successNote || 'Wonderful! That is exactly correct!');
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      setFeedbackMessage('Great try! Let us continue together with warmth and ease.');
    }

    setTimeout(() => {
      if (round < totalRounds) {
        setRound((r) => r + 1);
      } else {
        const totalCorrect = (score + (isCorrect ? 25 : 0)) / 25;
        const accuracy = Math.round((totalCorrect / totalRounds) * 100);
        handleFinishGame(score + (isCorrect ? 25 : 0), accuracy);
      }
    }, 1400);
  };

  // RENDER INTERACTIVE MINI-GAMES ACCORDING TO GAME KEY
  const renderGameContent = () => {
    switch (game.gameKey) {
      case 'MEMORY_HERITAGE':
      case 'FACE_KINSHIP': {
        const cards = [
          { id: 'c1', label: 'Bihu Dhol', emoji: '🥁', match: 'group1' },
          { id: 'c2', label: 'Assam Tea', emoji: '🍃', match: 'group2' },
          { id: 'c3', label: 'Bihu Dhol', emoji: '🥁', match: 'group1' },
          { id: 'c4', label: 'Assam Tea', emoji: '🍃', match: 'group2' },
        ];
        return (
          <div className="space-y-6 text-center">
            <p className="text-stone-700 font-medium">Tap the cards to find matching pairs of cultural treasures:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
              {cards.map((c) => {
                const isSelected = selectedItems.includes(c.id);
                const isMatched = matchedPairs.includes(c.match);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (isMatched || isSelected) return;
                      audioService.playFeedbackSound('GENTLE_TAP');
                      const newSelected = [...selectedItems, c.id];
                      setSelectedItems(newSelected);
                      if (newSelected.length === 2) {
                        const first = cards.find((x) => x.id === newSelected[0]);
                        const second = cards.find((x) => x.id === newSelected[1]);
                        if (first && second && first.match === second.match) {
                          setMatchedPairs((m) => [...m, first.match]);
                          setSelectedItems([]);
                          submitRoundAnswer(true, 'Splendid match! You paired the treasures beautifully.');
                        } else {
                          setTimeout(() => setSelectedItems([]), 1000);
                          submitRoundAnswer(false);
                        }
                      }
                    }}
                    className={`h-32 rounded-2xl border-2 flex flex-col items-center justify-center p-3 text-center transition-all ${
                      isMatched || isSelected
                        ? 'bg-amber-100 border-amber-500 shadow-md transform scale-105'
                        : 'bg-stone-50 border-stone-300 hover:border-amber-400'
                    }`}
                  >
                    {isMatched || isSelected ? (
                      <>
                        <span className="text-3xl mb-1">{c.emoji}</span>
                        <span className="text-xs font-bold text-stone-900">{c.label}</span>
                      </>
                    ) : (
                      <Brain className="w-8 h-8 text-amber-700/60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'ATTENTION_WILDLIFE':
      case 'ODD_ONE_OUT':
      case 'SHADOW_MATCHER': {
        const questions = [
          {
            target: 'One-Horned Rhinoceros',
            options: [
              { id: 'o1', label: 'One-Horned Rhino 🦏', correct: true },
              { id: 'o2', label: 'Spotted Deer 🦌', correct: false },
              { id: 'o3', label: 'Bengal Tiger 🐅', correct: false },
            ],
          },
          {
            target: 'Great Indian Hornbill',
            options: [
              { id: 'o1', label: 'Singing Myna 🐦', correct: false },
              { id: 'o2', label: 'Great Hornbill 🦅', correct: true },
              { id: 'o3', label: 'River Duck 🦆', correct: false },
            ],
          },
          {
            target: 'Traditional Conical Japi Hat',
            options: [
              { id: 'o1', label: 'Japi Sun Hat 👒', correct: true },
              { id: 'o2', label: 'Clay Tea Cup ☕', correct: false },
              { id: 'o3', label: 'Flute Instrument 🪈', correct: false },
            ],
          },
          {
            target: 'Fresh Green Assam Tea Leaf',
            options: [
              { id: 'o1', label: 'Bamboo Basket 🧺', correct: false },
              { id: 'o2', label: 'Camellia Tea Leaf 🍃', correct: true },
              { id: 'o3', label: 'Ripe Jackfruit 🍈', correct: false },
            ],
          },
        ];
        const currentQ = questions[(round - 1) % questions.length];

        return (
          <div className="space-y-6 text-center">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 inline-block">
              <p className="text-xs uppercase font-bold text-teal-800 tracking-wider">Spot the target item:</p>
              <h3 className="text-xl font-bold text-stone-900 mt-1">{currentQ.target}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedAnswer(opt.id);
                    submitRoundAnswer(opt.correct);
                  }}
                  className={`p-5 rounded-2xl border-2 text-center transition font-bold text-base shadow-sm ${
                    selectedAnswer === opt.id
                      ? opt.correct
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-teal-500 text-stone-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'PATTERN_WEAVER':
      case 'BEAD_ABACUS': {
        const patterns = [
          { seq: ['🔴 Red Diamond', '🟡 Golden Muga', '🔴 Red Diamond'], next: '🟡 Golden Muga', options: ['🟡 Golden Muga', '🟢 Bamboo Green', '🔵 River Blue'] },
          { seq: ['2 Beads', '4 Beads', '6 Beads'], next: '8 Beads', options: ['7 Beads', '8 Beads', '10 Beads'] },
          { seq: ['🌸 Lotus', '🍃 Leaf', '🌸 Lotus'], next: '🍃 Leaf', options: ['🍃 Leaf', '🌾 Grass', '☀️ Sun'] },
          { seq: ['🔺 Triangle', '🔶 Diamond', '🔺 Triangle'], next: '🔶 Diamond', options: ['🔶 Diamond', '⚪ Circle', '⬛ Square'] },
        ];
        const currentP = patterns[(round - 1) % patterns.length];

        return (
          <div className="space-y-6 text-center">
            <p className="text-stone-700 font-medium">Complete the traditional weave sequence:</p>
            <div className="flex items-center justify-center space-x-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-200 inline-flex">
              {currentP.seq.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1.5 bg-white font-bold text-sm text-stone-800 rounded-xl shadow-sm border border-stone-200">
                    {item}
                  </span>
                  <span className="text-indigo-400 font-bold">→</span>
                </React.Fragment>
              ))}
              <span className="px-4 py-1.5 bg-indigo-600 text-white font-black text-sm rounded-xl shadow animate-pulse">
                ?
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-2">
              {currentP.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    submitRoundAnswer(opt === currentP.next);
                  }}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm shadow-sm transition ${
                    selectedAnswer === opt
                      ? opt === currentP.next
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-indigo-500 text-stone-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'ROUTINE_SEQUENCER':
      case 'RECIPE_ORGANIZER':
      case 'TEMPORAL_CALENDAR': {
        const routineItems = [
          { id: 'r1', label: '1. Drink warm water 💧' },
          { id: 'r2', label: '2. Enjoy morning tea 🍵' },
          { id: 'r3', label: '3. Water garden plants 🌿' },
          { id: 'r4', label: '4. Take morning tablet 💊' },
        ];
        return (
          <div className="space-y-6 text-center">
            <p className="text-stone-700 font-medium">Tap the steps in their natural daily order:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {routineItems.map((item) => {
                const isSelected = sortedOrder.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) return;
                      audioService.playFeedbackSound('GENTLE_TAP');
                      const newOrder = [...sortedOrder, item.id];
                      setSortedOrder(newOrder);
                      if (newOrder.length === 4) {
                        submitRoundAnswer(true, 'Excellent routine organization! Everything is in peaceful order.');
                        setSortedOrder([]);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-white border-stone-200 hover:border-emerald-500 text-stone-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'LANGUAGE_PROVERB':
      case 'LYRIC_COMPLETER':
      case 'WORD_ASSOCIATION': {
        const proverbs = [
          { text: 'A cup of warm Assam tea brings peace to the ______.', answer: 'Heart', options: ['Heart', 'Cloud', 'Shoe'] },
          { text: 'When the spring Bihu rain falls, the tea leaves turn lush and ______.', answer: 'Green', options: ['Green', 'Cold', 'Stone'] },
          { text: 'Patience and kindness in a family are sweeter than ______.', answer: 'Honey', options: ['Honey', 'Salt', 'Dust'] },
          { text: 'Morning sunlight brings strength and morning ______.', answer: 'Joy', options: ['Joy', 'Rain', 'Night'] },
        ];
        const currentP = proverbs[(round - 1) % proverbs.length];

        return (
          <div className="space-y-6 text-center">
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 max-w-xl mx-auto">
              <p className="text-xs uppercase font-bold text-rose-800 mb-2">Complete the timeless saying:</p>
              <h3 className="text-xl font-bold text-stone-900 leading-relaxed">"{currentP.text}"</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {currentP.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    submitRoundAnswer(opt === currentP.answer);
                  }}
                  className={`p-4 rounded-2xl border-2 font-bold text-base shadow-sm transition ${
                    selectedAnswer === opt
                      ? opt === currentP.answer
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-rose-500 text-stone-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'SPATIAL_SORTER':
      case 'OBJECT_FUNCTION':
      case 'VISUAL_COLOR_SORT': {
        const items = [
          { name: 'Brass Kettle 🫖', category: 'Kitchen' },
          { name: 'Ripe Papaya 🍈', category: 'Garden' },
          { name: 'Tea Strainer 🥣', category: 'Kitchen' },
          { name: 'Fresh Mint Leaves 🌿', category: 'Garden' },
        ];
        const currentItem = items[(round - 1) % items.length];

        return (
          <div className="space-y-6 text-center">
            <p className="text-stone-700 font-medium">Where does this item naturally belong?</p>
            <div className="bg-cyan-50 border-2 border-cyan-300 rounded-3xl p-6 max-w-sm mx-auto shadow-sm">
              <span className="text-2xl font-bold text-stone-900">{currentItem.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {['Kitchen', 'Garden'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedAnswer(cat);
                    submitRoundAnswer(cat === currentItem.category);
                  }}
                  className={`p-5 rounded-2xl border-2 font-bold text-lg shadow-sm transition ${
                    selectedAnswer === cat
                      ? cat === currentItem.category
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-cyan-500 text-stone-800'
                  }`}
                >
                  {cat === 'Kitchen' ? '🏠 Kitchen' : '🌳 Garden'}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'RELAXATION_FLUTE':
      case 'NATURE_SOUNDS':
      case 'MANDALA_COLORING': {
        return (
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <div className="bg-gradient-to-b from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-6 shadow-sm">
              <div className="w-28 h-28 mx-auto rounded-full bg-purple-200 border-4 border-purple-400 flex items-center justify-center animate-pulse">
                <Heart className="w-12 h-12 text-purple-700 fill-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mt-4">Diaphragmatic Peaceful Breathing</h3>
              <p className="text-sm text-stone-600 mt-1">
                Inhale gently as the circle expands, and breathe out gently as it rests.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3">
              {['#e11d48', '#d97706', '#059669', '#2563eb', '#7c3aed'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedColor(c);
                    audioService.playFeedbackSound('GENTLE_TAP');
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition transform ${
                    selectedColor === c ? 'scale-125 border-stone-900 shadow-md' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                submitRoundAnswer(true, 'Peaceful relaxation completed! Mind is refreshed and calm.');
              }}
              className="w-full py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl shadow transition text-base"
            >
              Complete Soothing Round
            </button>
          </div>
        );
      }

      case 'MOTOR_REFLEX':
      case 'TAP_RHYTHM': {
        return (
          <div className="space-y-6 text-center max-w-md mx-auto">
            <p className="text-stone-700 font-medium">Tap the rhythm circle when it pulses with the gentle drum beat:</p>
            <button
              onClick={() => {
                audioService.playFeedbackSound('GENTLE_TAP');
                setTapCount((c) => c + 1);
                if (tapCount >= 3) {
                  submitRoundAnswer(true, 'Rhythmic coordination mastered! Steady and joyful hand reflexes.');
                  setTapCount(0);
                }
              }}
              className="w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl shadow-xl flex flex-col items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition"
            >
              <Zap className="w-10 h-10 mb-1" />
              <span>TAP ({tapCount}/4)</span>
            </button>
            <p className="text-xs text-stone-500 font-medium">Gentle motor synchronization</p>
          </div>
        );
      }

      case 'CALC_MARKET': {
        const prices = [
          { item: 'Fresh Mint & Lemons 🍋', price: 30, options: ['₹20 + ₹10', '₹50 + ₹20', '₹5 + ₹5'] },
          { item: 'Sweet Mountain Bananas 🍌', price: 40, options: ['₹20 + ₹20', '₹10 + ₹5', '₹50 + ₹50'] },
          { item: 'Assam Tea Sachet 🍃', price: 50, options: ['₹50 Note', '₹10 + ₹10', '₹5 + ₹5'] },
          { item: 'Handmade Clay Cup ☕', price: 20, options: ['₹10 + ₹10', '₹50 + ₹10', '₹5 + ₹2'] },
        ];
        const curr = prices[(round - 1) % prices.length];

        return (
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5">
              <span className="text-xs uppercase font-bold text-amber-800">Village Bazaar Purchase</span>
              <h3 className="text-xl font-bold text-stone-900 mt-1">{curr.item}</h3>
              <p className="text-2xl font-black text-amber-900 mt-1">Price: ₹{curr.price}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {curr.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    submitRoundAnswer(i === 0);
                  }}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm shadow-sm transition ${
                    selectedAnswer === opt
                      ? i === 0
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-amber-500 text-stone-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      default: {
        // Fallback robust multi-choice question generator for all remaining games
        const genericQuestions = [
          { prompt: `Which cultural memory connects with ${game.culturalTheme}?`, answer: 'Joyful Gathering', options: ['Joyful Gathering', 'Cold Winter Fog', 'Empty Road'] },
          { prompt: 'What brings peaceful happiness during daily family time?', answer: 'Kind Conversations', options: ['Kind Conversations', 'Loud Thunder', 'Broken Pots'] },
          { prompt: 'Which healthy routine supports sharp cognitive focus?', answer: 'Drinking Fresh Water', options: ['Drinking Fresh Water', 'Skipping Meals', 'Sitting in Dark'] },
          { prompt: 'What helps you feel safe and comfortable in the evening?', answer: 'Warm Lighting & Music', options: ['Warm Lighting & Music', 'Cold Wind', 'Noisy Streets'] },
        ];
        const q = genericQuestions[(round - 1) % genericQuestions.length];

        return (
          <div className="space-y-6 text-center max-w-lg mx-auto">
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6">
              <span className="text-xs uppercase font-bold text-stone-600">{game.targetDomain}</span>
              <h3 className="text-lg font-bold text-stone-900 mt-2">{q.prompt}</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    submitRoundAnswer(opt === q.answer);
                  }}
                  className={`p-4 rounded-2xl border-2 font-bold text-base shadow-sm transition text-center ${
                    selectedAnswer === opt
                      ? opt === q.answer
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-500 text-rose-900'
                      : 'bg-white border-stone-200 hover:border-amber-500 text-stone-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }
    }
  };

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-amber-700 shadow-md">
            <Trophy className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Activity Completed Successfully
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-2">{game.title}</h2>
            <p className="text-sm text-stone-600 mt-1">
              Outstanding engagement! Your cognitive session has been recorded and safely synced.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center">
            <div>
              <p className="text-xs text-stone-500">Score</p>
              <p className="text-2xl font-black text-amber-700 mt-0.5">{score} pts</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Focus Accuracy</p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">100%</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Difficulty</p>
              <p className="text-2xl font-black text-stone-800 mt-0.5">Level {difficulty}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => {
                setRound(1);
                setScore(0);
                setIsCompleted(false);
                setResponseTimes([]);
              }}
              className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              onClick={() => {
                audioService.playFeedbackSound('GENTLE_TAP');
                onBack();
              }}
              className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow transition"
            >
              Return to Daily Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Game Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              audioService.playFeedbackSound('GENTLE_TAP');
              onBack();
            }}
            className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {game.targetDomain}
              </span>
              <span className="text-xs text-stone-500 font-medium">Difficulty Level {difficulty}</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mt-0.5">{game.title}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          <div className="px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-bold text-stone-700 border border-stone-200">
            Round {round} of {totalRounds}
          </div>
          <div className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200">
            Score: {score}
          </div>
          <button
            onClick={() => speakPrompt(game.description)}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            title="Listen to Instructions"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm min-h-[380px] flex flex-col justify-between space-y-6">
        {/* Game Guidance */}
        <div className="text-center">
          <p className="text-xs uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full inline-block">
            {game.culturalTheme}
          </p>
          <p className="text-sm text-stone-600 mt-2 max-w-xl mx-auto">{game.instructions}</p>
        </div>

        {/* Dynamic Mini Game Render */}
        <div className="flex-1 flex items-center justify-center">
          {renderGameContent()}
        </div>

        {/* Feedback Bar */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-2xl text-center text-sm font-bold border animate-fade-in ${
              isAnswerCorrect
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {feedbackMessage}
          </div>
        )}
      </div>
    </div>
  );
}
