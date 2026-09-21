import { 
  CaregiverGameControl, 
  GameCategory, 
  GameLevelConfig, 
  GameLevelsMetadata 
} from '../types';
import { COGNITIVE_GAMES_CATALOG } from './cognitiveGamesCatalog';
import { localDB } from './storage';

// Domain-calibrated default level parameters
export const DOMAIN_LEVEL_CONFIGS: Record<GameCategory, [GameLevelConfig, GameLevelConfig, GameLevelConfig, GameLevelConfig, GameLevelConfig]> = {
  MEMORY: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 4,
      distractorCount: 0,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Take your time. Match the 4 simple cards without any hurry.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 6,
      distractorCount: 1,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Look carefully at 6 familiar cultural symbols and pair them.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 8,
      distractorCount: 2,
      timeLimitSeconds: 70,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'A balanced challenge with 8 cards. Follow your natural instincts.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 12,
      distractorCount: 4,
      timeLimitSeconds: 50,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Exercise deeper recall with 12 items. Notice small details.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 16,
      distractorCount: 6,
      timeLimitSeconds: 35,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Master level with 16 complex cultural motifs. Peak visual focus.',
    },
  ],
  ATTENTION: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 1,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Spot the clear target with minimal distractions around.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 5,
      distractorCount: 2,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Spot the target among gentle nature elements.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 8,
      distractorCount: 4,
      timeLimitSeconds: 65,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Multiple items moving or scattered. Focus your attention on the goal.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 12,
      distractorCount: 6,
      timeLimitSeconds: 45,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Faster pace with similar-looking distractors. Stay sharp.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 16,
      distractorCount: 8,
      timeLimitSeconds: 30,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Subtle differences and rapid recognition required. High vigilance.',
    },
  ],
  PATTERN: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 1,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      sequenceLength: 2,
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Identify simple alternating AB-AB loom patterns.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 4,
      distractorCount: 2,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      sequenceLength: 3,
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Observe ABC-ABC sequences in traditional borders.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 6,
      distractorCount: 3,
      timeLimitSeconds: 70,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      sequenceLength: 4,
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Two-variable sequences (color + shape).',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 8,
      distractorCount: 4,
      timeLimitSeconds: 50,
      memoryLoad: 4,
      visualComplexity: 'high',
      sequenceLength: 5,
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Complex symmetry and ascending rhythmic repetitions.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 10,
      distractorCount: 6,
      timeLimitSeconds: 35,
      memoryLoad: 5,
      visualComplexity: 'dense',
      sequenceLength: 6,
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Intricate matrix transformations and multi-layer weaves.',
    },
  ],
  ROUTINE: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 0,
      timeLimitSeconds: 150,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      sequenceLength: 3,
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Order 3 familiar everyday steps: Morning Tea, Bath, Prayer.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 4,
      distractorCount: 0,
      timeLimitSeconds: 120,
      memoryLoad: 2,
      visualComplexity: 'low',
      sequenceLength: 4,
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Organize 4 logical steps of a daily life sequence.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 5,
      distractorCount: 1,
      timeLimitSeconds: 90,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      sequenceLength: 5,
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Arrange 5 actions including one non-essential activity.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 6,
      distractorCount: 2,
      timeLimitSeconds: 70,
      memoryLoad: 4,
      visualComplexity: 'high',
      sequenceLength: 6,
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Detailed multi-step planning and sorting.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 8,
      distractorCount: 3,
      timeLimitSeconds: 50,
      memoryLoad: 5,
      visualComplexity: 'dense',
      sequenceLength: 7,
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Complex executive planning: traveling, festival preparation, cooking.',
    },
  ],
  RELAX: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 2,
      distractorCount: 0,
      timeLimitSeconds: 300,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 5,
      scoringThreshold: 50,
      guidanceText: 'Pure relaxation. Listen and tap gently whenever you wish.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 3,
      distractorCount: 0,
      timeLimitSeconds: 240,
      memoryLoad: 1,
      visualComplexity: 'low',
      hintsAllowed: 4,
      scoringThreshold: 55,
      guidanceText: 'Gentle mindful listening and calming breath pace.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 4,
      distractorCount: 1,
      timeLimitSeconds: 200,
      memoryLoad: 2,
      visualComplexity: 'moderate',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Mindful observation of melody and gentle rhythm.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 5,
      distractorCount: 1,
      timeLimitSeconds: 180,
      memoryLoad: 2,
      visualComplexity: 'high',
      hintsAllowed: 2,
      scoringThreshold: 65,
      guidanceText: 'Attuned musical reflection and peaceful instrument recognition.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 6,
      distractorCount: 2,
      timeLimitSeconds: 150,
      memoryLoad: 3,
      visualComplexity: 'dense',
      hintsAllowed: 1,
      scoringThreshold: 70,
      guidanceText: 'Rich sensory soundscape appreciation and deep relaxation.',
    },
  ],
  LANGUAGE: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 1,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Identify simple words and familiar cultural proverbs.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 4,
      distractorCount: 2,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Recall word pairs and cultural vocabulary in your native language.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 6,
      distractorCount: 3,
      timeLimitSeconds: 70,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Categorize language terms and regional expressions.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 8,
      distractorCount: 4,
      timeLimitSeconds: 50,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Verbal fluency and proverb completion with time targets.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 10,
      distractorCount: 5,
      timeLimitSeconds: 35,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Rapid linguistic association, dialect idioms, and subtle nuances.',
    },
  ],
  SPATIAL: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 4,
      distractorCount: 0,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Assemble 4 large familiar puzzle pieces of traditional motifs.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 6,
      distractorCount: 1,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Rotate and orient 6 spatial blocks gently.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 9,
      distractorCount: 2,
      timeLimitSeconds: 75,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Solve a 3x3 grid visuospatial layout.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 12,
      distractorCount: 4,
      timeLimitSeconds: 55,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Multi-angle spatial perspective and mental rotation.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 16,
      distractorCount: 6,
      timeLimitSeconds: 40,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Complex 4x4 spatial reconstruction and geometric weaving.',
    },
  ],
  STORY: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 2,
      distractorCount: 1,
      timeLimitSeconds: 150,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Listen to a short 2-sentence memory and answer one gentle question.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 3,
      distractorCount: 1,
      timeLimitSeconds: 120,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Recall who and where from a brief family story.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 4,
      distractorCount: 2,
      timeLimitSeconds: 90,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Narrative sequencing with 3 key timeline events.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 5,
      distractorCount: 3,
      timeLimitSeconds: 70,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Deeper details: specific dates, gifts, and spoken quotes.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 6,
      distractorCount: 4,
      timeLimitSeconds: 50,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Multi-character recall across multiple generations.',
    },
  ],
  PUZZLE: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 0,
      timeLimitSeconds: 120,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Simple matching puzzle with clear cues.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 5,
      distractorCount: 1,
      timeLimitSeconds: 90,
      memoryLoad: 2,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Logical sorting puzzle with 2 categories.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 7,
      distractorCount: 2,
      timeLimitSeconds: 70,
      memoryLoad: 3,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Multi-attribute puzzle (shape, color, and size).',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 10,
      distractorCount: 3,
      timeLimitSeconds: 50,
      memoryLoad: 4,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Deductive reasoning and elimination logic.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 12,
      distractorCount: 5,
      timeLimitSeconds: 35,
      memoryLoad: 5,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'High-level cognitive synthesis and pattern completion.',
    },
  ],
  MOTOR: [
    {
      level: 1,
      difficultyLabel: 'easy',
      itemCount: 3,
      distractorCount: 0,
      timeLimitSeconds: 150,
      memoryLoad: 1,
      visualComplexity: 'minimal',
      hintsAllowed: 3,
      scoringThreshold: 60,
      guidanceText: 'Gentle large tap targets with slow natural movements.',
    },
    {
      level: 2,
      difficultyLabel: 'easy-medium',
      itemCount: 5,
      distractorCount: 1,
      timeLimitSeconds: 110,
      memoryLoad: 1,
      visualComplexity: 'low',
      hintsAllowed: 2,
      scoringThreshold: 70,
      guidanceText: 'Smooth tracing of curved river and bamboo lines.',
    },
    {
      level: 3,
      difficultyLabel: 'medium',
      itemCount: 7,
      distractorCount: 2,
      timeLimitSeconds: 80,
      memoryLoad: 2,
      visualComplexity: 'moderate',
      hintsAllowed: 2,
      scoringThreshold: 75,
      guidanceText: 'Hand-eye coordination tapping targets in sequence.',
    },
    {
      level: 4,
      difficultyLabel: 'medium-hard',
      itemCount: 10,
      distractorCount: 3,
      timeLimitSeconds: 60,
      memoryLoad: 3,
      visualComplexity: 'high',
      hintsAllowed: 1,
      scoringThreshold: 80,
      guidanceText: 'Bimanual rhythm coordination and gentle timing taps.',
    },
    {
      level: 5,
      difficultyLabel: 'hard',
      itemCount: 12,
      distractorCount: 4,
      timeLimitSeconds: 40,
      memoryLoad: 4,
      visualComplexity: 'dense',
      hintsAllowed: 0,
      scoringThreshold: 85,
      guidanceText: 'Precision fine motor tracking and rapid reactive tapping.',
    },
  ],
};

// Generate metadata registry for all catalog games
export const ALL_GAMES_LEVEL_METADATA: GameLevelsMetadata[] = COGNITIVE_GAMES_CATALOG.map((game) => ({
  gameId: game.id,
  title: game.title,
  domain: game.category,
  levels: DOMAIN_LEVEL_CONFIGS[game.category] || DOMAIN_LEVEL_CONFIGS.MEMORY,
}));

// --- Core Helper Functions ---

export function getGameLevelConfig(gameId: string, level: number): GameLevelConfig {
  const meta = ALL_GAMES_LEVEL_METADATA.find((m) => m.gameId === gameId);
  const safeLevel = Math.min(5, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5;
  if (meta) {
    return meta.levels[safeLevel - 1];
  }
  return DOMAIN_LEVEL_CONFIGS.MEMORY[safeLevel - 1];
}

/**
 * Calculates effective level applying Caregiver Hard Overrides:
 * 1. Is game paused by caregiver?
 * 2. Is level locked by caregiver?
 * 3. Does level exceed caregiver's configured maximum ceiling?
 */
export function getEffectiveGameLevel(
  gameId: string,
  ddaComputedLevel: number,
  controlOverride?: CaregiverGameControl
): {
  effectiveLevel: number;
  isLocked: boolean;
  isPaused: boolean;
  startingLevel: number;
  maxAllowedLevel: number;
  overrideReason?: string;
} {
  const controls = localDB.getCaregiverGameControls();
  const gameControl = controlOverride || controls.find((c) => c.gameId === gameId);

  if (!gameControl) {
    const defaultLevel = Math.min(5, Math.max(1, ddaComputedLevel || 1));
    return {
      effectiveLevel: defaultLevel,
      isLocked: false,
      isPaused: false,
      startingLevel: 1,
      maxAllowedLevel: 5,
    };
  }

  // 1. Check if game is paused
  if (gameControl.isPaused) {
    return {
      effectiveLevel: gameControl.startingLevel,
      isLocked: true,
      isPaused: true,
      startingLevel: gameControl.startingLevel,
      maxAllowedLevel: gameControl.maxAllowedLevel,
      overrideReason: 'Paused by Caregiver for patient well-being.',
    };
  }

  // 2. Check if level is locked
  if (gameControl.isLocked) {
    return {
      effectiveLevel: gameControl.startingLevel,
      isLocked: true,
      isPaused: false,
      startingLevel: gameControl.startingLevel,
      maxAllowedLevel: gameControl.maxAllowedLevel,
      overrideReason: `Caregiver locked difficulty at Level ${gameControl.startingLevel}.`,
    };
  }

  // 3. Apply maximum level cap
  let level = ddaComputedLevel || gameControl.startingLevel;
  if (level > gameControl.maxAllowedLevel) {
    return {
      effectiveLevel: gameControl.maxAllowedLevel,
      isLocked: false,
      isPaused: false,
      startingLevel: gameControl.startingLevel,
      maxAllowedLevel: gameControl.maxAllowedLevel,
      overrideReason: `Capped at Level ${gameControl.maxAllowedLevel} by caregiver setting.`,
    };
  }

  if (level < gameControl.startingLevel) {
    level = gameControl.startingLevel;
  }

  return {
    effectiveLevel: Math.min(5, Math.max(1, level)),
    isLocked: false,
    isPaused: false,
    startingLevel: gameControl.startingLevel,
    maxAllowedLevel: gameControl.maxAllowedLevel,
  };
}

/**
 * Deterministic DDA Algorithm:
 * Advance if Accuracy >= 80% and Response Time is prompt.
 * Step down if Accuracy < 60% or multiple hints used.
 * Stays stable if Accuracy 60-79%.
 * Always strictly bounded by caregiver settings!
 */
export function evaluateDDAWithCaregiverBounds(
  currentLevel: number,
  accuracyPercent: number,
  responseTimeMs: number,
  hintsUsed: number,
  gameId?: string,
  controlOverride?: CaregiverGameControl
): {
  nextLevel: number;
  recommendedLevel: number;
  recommendation: string;
  isCaregiverCapped: boolean;
  caregiverMaxCap?: number;
} {
  let recommendedLevel = currentLevel;
  let reason = 'Difficulty maintained at current level.';

  if (accuracyPercent >= 80 && hintsUsed <= 1 && responseTimeMs < 45000) {
    if (currentLevel < 5) {
      recommendedLevel = currentLevel + 1;
      reason = `Excellent performance (${accuracyPercent}% accuracy, ${Math.round(responseTimeMs / 1000)}s latency). Advancing to Level ${recommendedLevel}.`;
    } else {
      reason = `Mastery confirmed at maximum Level 5 with ${accuracyPercent}% accuracy.`;
    }
  } else if (accuracyPercent < 60 || hintsUsed >= 3 || responseTimeMs > 90000) {
    if (currentLevel > 1) {
      recommendedLevel = currentLevel - 1;
      reason = `High cognitive load observed (${accuracyPercent}% accuracy, ${hintsUsed} hints). Lowering to Level ${recommendedLevel} for positive engagement.`;
    } else {
      reason = `Maintaining gentle supportive Level 1 pace.`;
    }
  }

  if (!gameId && !controlOverride) {
    return {
      nextLevel: recommendedLevel,
      recommendedLevel,
      recommendation: reason,
      isCaregiverCapped: false,
    };
  }

  // Check caregiver controls
  const controls = localDB.getCaregiverGameControls();
  const gameControl = controlOverride || (gameId ? controls.find((c) => c.gameId === gameId) : undefined);

  if (gameControl?.isLocked) {
    return {
      nextLevel: gameControl.startingLevel,
      recommendedLevel,
      recommendation: `Caregiver has locked this game at Level ${gameControl.startingLevel}. DDA advancement held.`,
      isCaregiverCapped: true,
      caregiverMaxCap: gameControl.maxAllowedLevel,
    };
  }

  if (gameControl && recommendedLevel > gameControl.maxAllowedLevel) {
    return {
      nextLevel: gameControl.maxAllowedLevel,
      recommendedLevel,
      recommendation: `Performance qualifies for Level ${recommendedLevel}, but caregiver max cap is Level ${gameControl.maxAllowedLevel}. Respecting caregiver ceiling.`,
      isCaregiverCapped: true,
      caregiverMaxCap: gameControl.maxAllowedLevel,
    };
  }

  return {
    nextLevel: recommendedLevel,
    recommendedLevel,
    recommendation: reason,
    isCaregiverCapped: false,
    caregiverMaxCap: gameControl?.maxAllowedLevel,
  };
}

/**
 * Initialize default caregiver game controls for all 30 catalog games if none exist.
 */
export function initializeDefaultCaregiverControls(): CaregiverGameControl[] {
  const existing = localDB.getCaregiverGameControls();
  if (existing.length >= COGNITIVE_GAMES_CATALOG.length) {
    return existing;
  }

  const existingMap = new Map(existing.map((c) => [c.gameId, c]));
  const initialized: CaregiverGameControl[] = COGNITIVE_GAMES_CATALOG.map((game) => {
    if (existingMap.has(game.id)) {
      return existingMap.get(game.id)!;
    }
    return {
      gameId: game.id,
      domain: game.category,
      startingLevel: game.baseDifficulty || 1,
      maxAllowedLevel: 5,
      isLocked: false,
      isPaused: false,
      hintsEnabled: true,
      notes: `Standard ${game.category.toLowerCase()} exercise for ${game.culturalTheme}.`,
    };
  });

  localDB.saveCaregiverGameControls(initialized);
  return initialized;
}
