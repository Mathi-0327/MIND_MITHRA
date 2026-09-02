import { GameCategory, GameSessionResult, PatientProfile, CaregiverInstruction, PatientMoodType, CognitiveGameDefinition } from '../types';
import { COGNITIVE_GAMES_CATALOG } from './cognitiveGamesCatalog';

export interface AdaptationOutput {
  calculatedDifficulty: number;
  difficultyChange: 'INCREASED' | 'DECREASED' | 'MAINTAINED';
  reason: string;
  suggestRest: boolean;
  recommendedCategory: GameCategory;
  themeContext: string;
}

export interface RecommendedGameResult {
  game: CognitiveGameDefinition;
  suitabilityScore: number;
  recommendationReason: string;
  recommendedDifficulty: number;
  highlightBadge: string;
}

/**
 * AI-Based Cognitive Recommendation Engine
 * Analyzes the patient's current mood, cognitive baseline, fatigue score,
 * active caregiver instructions, and recent play sessions across 30 total games,
 * and returns strictly the TOP 10 recommended games in priority order.
 */
export function getAIMoodRecommendedGames(
  patient: PatientProfile,
  mood: PatientMoodType = 'CALM',
  recentSessions: GameSessionResult[] = [],
  instructions: CaregiverInstruction[] = []
): RecommendedGameResult[] {
  const activeInstruction = instructions.find((i) => i.appliedStatus === 'ACTIVE');
  const maxCap = activeInstruction?.structuredRule?.maxDifficulty ?? 5;
  const preferredTheme = activeInstruction?.structuredRule?.preferredTheme;

  // Recent categories played
  const recentCategories = recentSessions.slice(0, 5).map((s) => s.category);
  const recentGameIds = recentSessions.slice(0, 4).map((s) => s.gameId);

  // Score each of the 30 catalog games
  const scoredGames: RecommendedGameResult[] = COGNITIVE_GAMES_CATALOG.map((game) => {
    let score = 50; // Base score
    let reason = 'Balanced cognitive stimulation suited to daily routine.';
    let badge = 'Recommended';

    // 1. Mood Matching Matrix
    if (game.recommendedForMoods.includes(mood)) {
      score += 35;
      if (mood === 'HAPPY') {
        reason = 'Great match for your cheerful, energized mood today!';
        badge = 'Joy & Energy Match';
      } else if (mood === 'CALM') {
        reason = 'Calm and engaging, perfect for peaceful steady focus.';
        badge = 'Peaceful Focus';
      } else if (mood === 'ANXIOUS') {
        reason = 'Gentle, soothing tempo designed to reduce stress and anxiety.';
        badge = 'Gentle Comfort';
      } else if (mood === 'TIRED') {
        reason = 'Low-effort, reassuring activity tailored for gentle unwinding.';
        badge = 'Restful Pace';
      } else if (mood === 'SAD') {
        reason = 'Uplifting cultural reminiscence to spark warm feelings and smiles.';
        badge = 'Uplifting Memory';
      }
    } else {
      score -= 15;
    }

    // Special mood category adjustments
    if ((mood === 'ANXIOUS' || mood === 'TIRED') && (game.category === 'RELAX' || game.category === 'STORY')) {
      score += 30;
      badge = 'Top Soothing Pick';
    }
    if (mood === 'HAPPY' && (game.category === 'MEMORY' || game.category === 'PATTERN' || game.category === 'MOTOR')) {
      score += 20;
    }

    // 2. Baseline Cognitive Domain Needs
    if (patient.baseline) {
      if (game.category === 'MEMORY' && patient.baseline.memoryScore < 75) {
        score += 20;
        reason += ' Targets memory reinforcement based on your baseline profile.';
      }
      if (game.category === 'ATTENTION' && patient.baseline.attentionScore < 75) {
        score += 18;
      }
      if (game.category === 'PATTERN' && patient.baseline.patternScore < 75) {
        score += 15;
      }
    }

    // 3. Cultural Theme Affinity
    if (preferredTheme && game.culturalTheme.toLowerCase().includes(preferredTheme.toLowerCase())) {
      score += 15;
      badge = 'Family Favorite Theme';
    }

    // 4. Variety & Recency Balancing
    const timesPlayedRecently = recentGameIds.filter((id) => id === game.id || id === game.gameKey).length;
    if (timesPlayedRecently > 0) {
      score -= timesPlayedRecently * 12; // Avoid exact repetition
    }

    // 5. Fatigue Score Adjustment
    if (patient.fatigueScore > 20 && (game.category === 'RELAX' || game.category === 'STORY')) {
      score += 25;
      badge = 'Relaxing Rest Choice';
    }

    // Calculate recommended difficulty
    let targetDiff = Math.min(maxCap, Math.max(1, patient.currentDifficultyLevel || game.baseDifficulty));
    if (mood === 'TIRED' || mood === 'ANXIOUS' || patient.fatigueScore > 25) {
      targetDiff = 1;
    }

    return {
      game,
      suitabilityScore: Math.max(10, Math.min(100, Math.round(score))),
      recommendationReason: reason,
      recommendedDifficulty: targetDiff,
      highlightBadge: badge,
    };
  });

  // Sort descending by suitability score
  scoredGames.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // STRICTLY RETURN THE TOP 10 RECOMMENDED GAMES (Others hidden)
  return scoredGames.slice(0, 10);
}

export function evaluateGameAdaptation(
  lastResult: GameSessionResult,
  patient: PatientProfile,
  recentSessions: GameSessionResult[],
  instructions: CaregiverInstruction[]
): AdaptationOutput {
  let targetDifficulty = lastResult.difficulty;
  let change: 'INCREASED' | 'DECREASED' | 'MAINTAINED' = 'MAINTAINED';
  let reason = 'Difficulty level is well-matched to current comfort and accuracy.';
  let suggestRest = false;

  // Active caregiver instruction constraints
  const activeInstruction = instructions.find(i => i.appliedStatus === 'ACTIVE');
  const maxDifficultyCap = activeInstruction?.structuredRule?.maxDifficulty ?? 5;

  // 1. Fatigue Detection Heuristic
  const sessionCountLast2Hours = recentSessions.filter(s => {
    const diffMs = Date.now() - new Date(s.timestamp).getTime();
    return diffMs < 7200000;
  }).length;

  const hasHighLatency = lastResult.avgResponseTimeMs > 4500;
  const isStruggling = lastResult.accuracyPercent < 50 || lastResult.abandoned;

  if (sessionCountLast2Hours >= 3 && (hasHighLatency || isStruggling)) {
    targetDifficulty = Math.max(1, targetDifficulty - 1);
    change = 'DECREASED';
    suggestRest = true;
    reason = 'Gentle fatigue pattern detected (longer response time over multiple activities). We softened the difficulty and recommend a relaxing rest.';
  } else if (lastResult.accuracyPercent >= 85 && lastResult.avgResponseTimeMs < 2800 && !lastResult.abandoned) {
    // 2. High Accuracy & Swift Response -> Level Up (Respecting Cap)
    if (targetDifficulty < maxDifficultyCap) {
      targetDifficulty = Math.min(maxDifficultyCap, targetDifficulty + 1);
      change = 'INCREASED';
      reason = `Outstanding accuracy (${lastResult.accuracyPercent}%) and steady focus! Gently advanced difficulty to level ${targetDifficulty}.`;
    } else {
      reason = `Consistent mastery at level ${targetDifficulty}. Maintained at level ${targetDifficulty} per caregiver preference.`;
    }
  } else if (lastResult.accuracyPercent < 55 || lastResult.abandoned) {
    // 3. Struggle / Confusion -> Ease Level
    targetDifficulty = Math.max(1, targetDifficulty - 1);
    change = 'DECREASED';
    reason = 'Adjusted to an easier, more reassuring pace to preserve comfort and joy.';
  }

  // Determine Next Recommended Cognitive Category
  const categoryCounts: Record<GameCategory, number> = {
    MEMORY: 0,
    ATTENTION: 0,
    PATTERN: 0,
    ROUTINE: 0,
    RELAX: 0,
    LANGUAGE: 0,
    SPATIAL: 0,
    STORY: 0,
    PUZZLE: 0,
    MOTOR: 0,
  };

  recentSessions.slice(0, 5).forEach(s => {
    if (categoryCounts[s.category] !== undefined) {
      categoryCounts[s.category]++;
    }
  });

  // Cycle variety
  const categories: GameCategory[] = [
    'MEMORY',
    'ATTENTION',
    'PATTERN',
    'ROUTINE',
    'LANGUAGE',
    'SPATIAL',
    'STORY',
    'PUZZLE',
    'MOTOR',
  ];
  let recommendedCategory: GameCategory = 'MEMORY';
  let minPlayed = Infinity;
  for (const cat of categories) {
    if (categoryCounts[cat] < minPlayed) {
      minPlayed = categoryCounts[cat];
      recommendedCategory = cat;
    }
  }

  if (suggestRest) {
    recommendedCategory = 'RELAX';
  }

  // Theme Context from patient cultural interests & caregiver guidance
  const themeContext = activeInstruction?.structuredRule?.preferredTheme 
    || patient.culturalInterests[0] 
    || 'Assam Tea Gardens & Traditional Folk Music';

  return {
    calculatedDifficulty: targetDifficulty,
    difficultyChange: change,
    reason,
    suggestRest,
    recommendedCategory,
    themeContext,
  };
}

export interface CulturalGameData {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  items: Array<{
    id: string;
    label: string;
    sublabel?: string;
    icon: string;
    culturalNote: string;
    color: string;
  }>;
}

export function getCulturalGameDataSet(category: GameCategory, themePreference?: string): CulturalGameData {
  if (category === 'MEMORY') {
    return {
      id: 'ner-memory-pack',
      title: 'North Eastern Heritage Memory Matching',
      subtitle: 'Find matching pairs of familiar cultural treasures and landmarks',
      theme: themePreference || 'NER Traditions & Nature',
      items: [
        { id: 'item-1', label: 'Bihu Dhol', sublabel: 'Folk Drum', icon: 'Drum', culturalNote: 'The heartbeat rhythm of Assam Spring festivals', color: 'bg-amber-100 text-amber-900 border-amber-300' },
        { id: 'item-2', label: 'Assam Tea Leaf', sublabel: 'Camellia Garden', icon: 'Leaf', culturalNote: 'Lush green tea gardens stretching across the Brahmaputra valley', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        { id: 'item-3', label: 'Hornbill Bird', sublabel: 'Forest Emblem', icon: 'Feather', culturalNote: 'Sacred revered bird celebrated in Nagaland and Arunachal forests', color: 'bg-orange-100 text-orange-900 border-orange-300' },
        { id: 'item-4', label: 'Gamosa Shawl', sublabel: 'Handloom Cotton', icon: 'Sparkles', culturalNote: 'Traditional white and red woven towel expressing love and honor', color: 'bg-rose-100 text-rose-900 border-rose-300' },
        { id: 'item-5', label: 'Bamboo Flute', sublabel: 'Peaceful Sound', icon: 'Music', culturalNote: 'Sweet traditional bamboo woodwind played during pastoral evenings', color: 'bg-sky-100 text-sky-900 border-sky-300' },
        { id: 'item-6', label: 'Loktak Phumdi', sublabel: 'Floating Lake', icon: 'Compass', culturalNote: 'Famous circular floating islands of Manipur Loktak lake', color: 'bg-teal-100 text-teal-900 border-teal-300' },
      ]
    };
  }

  if (category === 'PATTERN') {
    return {
      id: 'ner-pattern-pack',
      title: 'Gamosa & Traditional Weave Sequences',
      subtitle: 'Complete the authentic handloom motif sequence',
      theme: 'Handloom & Traditional Geometrics',
      items: [
        { id: 'pat-1', label: 'Red Diamond Weave', icon: 'Gem', culturalNote: 'Classical border ornament of Assamese silk', color: 'bg-rose-100 text-rose-900 border-rose-400' },
        { id: 'pat-2', label: 'Golden Muga Thread', icon: 'Sun', culturalNote: 'Indigenous golden silk found only in the Brahmaputra valley', color: 'bg-amber-100 text-amber-900 border-amber-400' },
        { id: 'pat-3', label: 'Bamboo Chevron', icon: 'Layers', culturalNote: 'Interlocking cane basket pattern from Meghalaya hills', color: 'bg-emerald-100 text-emerald-900 border-emerald-400' },
        { id: 'pat-4', label: 'River Lotus Motif', icon: 'Flower2', culturalNote: 'Floral embroidery symbolizing peace and clarity', color: 'bg-indigo-100 text-indigo-900 border-indigo-400' },
      ]
    };
  }

  return {
    id: 'ner-attention-pack',
    title: 'Village Market & Wildlife Spotter',
    subtitle: 'Spot the target familiar item amidst peaceful scenery',
    theme: 'Village & Flora',
    items: [
      { id: 'att-1', label: 'Ripe Jackfruit', icon: 'Apple', culturalNote: 'Fresh sweet garden fruit from home orchard', color: 'bg-lime-100 text-lime-900 border-lime-400' },
      { id: 'att-2', label: 'Clay Tea Cup (Kulhad)', icon: 'Coffee', culturalNote: 'Steaming morning tea with cardamom', color: 'bg-amber-100 text-amber-900 border-amber-400' },
      { id: 'att-3', label: 'Singing Myna Bird', icon: 'Bird', culturalNote: 'Familiar garden visitor perched on bamboo poles', color: 'bg-yellow-100 text-yellow-900 border-yellow-400' },
      { id: 'att-4', label: 'Japi Hat', icon: 'Shield', culturalNote: 'Traditional conical sun hat made of tight bamboo cane', color: 'bg-stone-200 text-stone-900 border-stone-400' },
    ]
  };
}
