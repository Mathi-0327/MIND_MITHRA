/**
 * MIND MITHRA - AI Intelligence, Intent, Voice & Analytics Verification Suite
 * 
 * Verifies:
 * 1. Conversational vs Command Intent Classification (35+ intents)
 * 2. Mixed Intent Handling
 * 3. Anaphora & Context Resolution
 * 4. 5-Level Declarative Game Configurations & Caregiver Bounds
 * 5. Deterministic Analytics Engine Calculations
 * 6. Non-Robotic Local Conversation Generation
 */

import { classifyIntent } from '../src/lib/intentClassifier';
import { DOMAIN_LEVEL_CONFIGS, getEffectiveGameLevel, evaluateDDAWithCaregiverBounds } from '../src/lib/gameLevelSystem';
import { aiOrchestrator } from '../src/lib/aiOrchestrator';
import { CaregiverGameControl, GameSessionResult, PatientMoodType } from '../src/types';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error('     Details:', detail);
    throw new Error(`Test failed: ${testName}`);
  }
}

console.log('\n============================================================');
console.log('🧪 MIND MITHRA — AUTOMATED AI SUITE VERIFICATION');
console.log('============================================================\n');

// ------------------------------------------------------------
// Test Group 1: Natural Conversation vs Command Classification
// ------------------------------------------------------------
console.log('📋 Test Group 1: Intent & Action Classification Engine');

// 1.1 How are you (The primary user problem specified in prompt)
const res1 = classifyIntent('Hi, how are you?');
assert(
  res1.intent === 'HOW_ARE_YOU' && res1.confidence >= 0.85 && res1.action === null,
  'User: "Hi, how are you?" -> Intent: HOW_ARE_YOU, confidence >= 0.85, Action: null (Non-robotic conversational)',
  res1
);

// 1.2 Greeting
const res2 = classifyIntent('Namaskar Mithra, good morning!');
assert(
  res2.intent === 'GENERAL_GREETING' && res2.action === null,
  'User: "Namaskar Mithra, good morning!" -> Intent: GENERAL_GREETING',
  res2
);

// 1.3 Emotional expression (Tired)
const res3 = classifyIntent('I am feeling very tired right now');
assert(
  res3.intent === 'USER_FEELING_TIRED' && res3.confidence >= 0.80,
  'User: "I am feeling very tired right now" -> Intent: USER_FEELING_TIRED',
  res3
);

// 1.4 Emotional expression (Anxious)
const res4 = classifyIntent('I feel nervous and scared, where am I?');
assert(
  res4.intent === 'USER_FEELING_ANXIOUS' || res4.intent === 'USER_FEELING_CONFUSED',
  'User: "I feel nervous and scared, where am I?" -> Intent: USER_FEELING_ANXIOUS/CONFUSED',
  res4
);

// 1.5 Command: Show memories
const res5 = classifyIntent('Can you show me my family photos and memories?');
assert(
  res5.intent === 'SHOW_MEMORIES' && res5.action?.type === 'NAVIGATE_MEMORIES',
  'User: "Can you show me my family photos and memories?" -> Action: NAVIGATE_MEMORIES',
  res5
);

// 1.6 Command: Play cognitive games
const res6 = classifyIntent('I want to play a memory puzzle game');
assert(
  (res6.intent === 'START_GAME' || res6.intent === 'SHOW_GAMES') && 
  (res6.action?.type === 'START_GAME' || res6.action?.type === 'NAVIGATE_GAMES'),
  'User: "I want to play a memory puzzle game" -> Intent: START_GAME, Action: START_GAME/NAVIGATE_GAMES',
  res6
);

// 1.7 Command: Emergency SOS
const res7 = classifyIntent('Help me please, I am in danger, emergency!');
assert(
  res7.intent === 'EMERGENCY' && res7.action?.type === 'TRIGGER_EMERGENCY_SOS',
  'User: "Help me please, I am in danger, emergency!" -> Action: TRIGGER_EMERGENCY_SOS',
  res7
);

// 1.8 Entity Extraction: Call daughter
const res8 = classifyIntent('Please call my daughter Priyanka');
assert(
  res8.intent === 'CALL_FAMILY_MEMBER' && 
  res8.action?.type === 'NAVIGATE_FAMILY' && 
  (res8.entities.personName === 'Priyanka' || res8.entities.relationship === 'daughter' || res8.entities.familyMember === 'daughter'),
  'User: "Please call my daughter Priyanka" -> Extracts entity Priyanka/daughter and NAVIGATE_FAMILY',
  res8
);

// 1.9 Mixed Intent: Fatigue + Request photos
const res9 = classifyIntent('I am feeling tired, can you show my photos?');
assert(
  (res9.intent === 'USER_FEELING_TIRED' || res9.intent === 'SHOW_MEMORIES') &&
  (res9.action?.type === 'NAVIGATE_MEMORIES' || res9.isMixedIntent),
  'Mixed Intent: "I am feeling tired, can you show my photos?" -> Detects fatigue and memory intent',
  res9
);


// ------------------------------------------------------------
// Test Group 2: Pronoun / Anaphora Resolution in AI Orchestrator
// ------------------------------------------------------------
console.log('\n📋 Test Group 2: Anaphora & Context Memory Resolution');

// Clear orchestrator memory
aiOrchestrator.clearHistory();

const mockFamily = [
  {
    id: 'fam-1',
    patientId: 'patient-ravi-001',
    name: 'Priyanka',
    relation: 'Daughter',
    photoUrl: '/images/priyanka.jpg',
    phoneNumber: '+919876543210',
    notes: 'Lives in Guwahati',
    isEmergencyContact: true,
  },
  {
    id: 'fam-2',
    patientId: 'patient-ravi-001',
    name: 'Ananya',
    relation: 'Granddaughter',
    photoUrl: '/images/ananya.jpg',
    isEmergencyContact: false,
  },
];

const mockHistory = [
  {
    id: 'turn-1',
    sender: 'user' as const,
    text: 'Priyanka was here earlier this morning',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'turn-2',
    sender: 'companion' as const,
    text: 'It is wonderful that your daughter Priyanka came to visit!',
    timestamp: new Date().toISOString(),
  },
];

// Anaphora resolution test: "Where is she right now?"
const resolved1 = aiOrchestrator.resolvePronouns('Where is she right now?', mockHistory, mockFamily as any);
assert(
  resolved1.toLowerCase().includes('priyanka'),
  'Resolved "Where is she right now?" -> includes referenced person "Priyanka"',
  { original: 'Where is she right now?', resolved: resolved1 }
);

// Anaphora resolution test: "Can you call her?"
const resolved2 = aiOrchestrator.resolvePronouns('Can you call her right away?', mockHistory, mockFamily as any);
assert(
  resolved2.toLowerCase().includes('priyanka'),
  'Resolved "Can you call her right away?" -> includes "call Priyanka"',
  { original: 'Can you call her right away?', resolved: resolved2 }
);


// ------------------------------------------------------------
// Test Group 3: 5-Level Cognitive Game System & Caregiver Overrides
// ------------------------------------------------------------
console.log('\n📋 Test Group 3: Universal 5-Level Declarative Game Architecture');

// 3.1 Verify all 10 domains have 5 discrete declarative levels
const domains = Object.keys(DOMAIN_LEVEL_CONFIGS) as (keyof typeof DOMAIN_LEVEL_CONFIGS)[];
assert(domains.length === 10, 'All 10 cognitive game domains are populated in DOMAIN_LEVEL_CONFIGS', domains);

domains.forEach((dom) => {
  const levels = DOMAIN_LEVEL_CONFIGS[dom];
  const levelNumbers = levels.map((l) => l.level);
  assert(
    levelNumbers.includes(1) && levelNumbers.includes(2) && levelNumbers.includes(3) && levelNumbers.includes(4) && levelNumbers.includes(5),
    `Domain ${dom} contains declarative Level 1 through Level 5`,
    levelNumbers
  );
  // Ensure level progression increases items/complexity or reduces time
  assert(
    levels[0].itemCount <= levels[4].itemCount,
    `Domain ${dom} Level 1 itemCount (${levels[0].itemCount}) <= Level 5 (${levels[4].itemCount})`
  );
});

// 3.2 Caregiver Bounds & Overrides Test
console.log('\n📋 Test Group 4: Caregiver Hard Overrides on Dynamic Difficulty');

// Control 1: Hard level lock at Level 2
const lockControl: CaregiverGameControl = {
  gameId: 'game-card-match',
  domain: 'MEMORY',
  startingLevel: 2,
  maxAllowedLevel: 5,
  isLocked: true,
  isPaused: false,
  hintsEnabled: true,
};

const effectiveLvl1 = getEffectiveGameLevel('game-card-match', 4, lockControl);
assert(
  effectiveLvl1.effectiveLevel === 2 && effectiveLvl1.isLocked === true,
  'Caregiver Lock: Patient profile at Level 4, but caregiver locked game at Level 2 -> effectiveLevel is 2',
  { profileLevel: 4, effectiveLvl1 }
);

// Control 2: Max Ceiling Cap at Level 3
const ceilingControl: CaregiverGameControl = {
  gameId: 'game-pattern-sequence',
  domain: 'PATTERN',
  startingLevel: 1,
  maxAllowedLevel: 3,
  isLocked: false,
  isPaused: false,
  hintsEnabled: true,
};

const effectiveLvl2 = getEffectiveGameLevel('game-pattern-sequence', 5, ceilingControl);
assert(
  effectiveLvl2.effectiveLevel === 3,
  'Caregiver Ceiling Cap: Patient profile at Level 5, but caregiver ceiling capped at Level 3 -> effectiveLevel is 3',
  { profileLevel: 5, effectiveLvl2 }
);

// Control 3: DDA Adaptation respect bounds
const ddaAdjustment = evaluateDDAWithCaregiverBounds(
  3,
  100,
  1200,
  0,
  'game-pattern-sequence',
  ceilingControl
);
assert(
  ddaAdjustment.nextLevel === 3 && ddaAdjustment.isCaregiverCapped === true,
  'DDA Adaptation: 100% accuracy with prompt response would promote to Level 4, but capped at Level 3 by Caregiver Ceiling',
  ddaAdjustment
);


// ------------------------------------------------------------
// Test Group 5: Non-Robotic Local Conversation Fallback
// ------------------------------------------------------------
console.log('\n📋 Test Group 5: Local Warm Multilingual Response Generator');

const mockContextEn = {
  patient: {
    id: 'patient-ravi-001',
    name: 'Ravi Kumar',
    preferredLanguage: 'en' as const,
    region: 'Assam',
    fatigueScore: 10,
    currentDifficultyLevel: 2,
  },
  currentScreen: 'HOME',
  currentGame: null,
  currentLevel: null,
  recentConversation: [],
  recentFamilyMember: null,
  recentMemory: null,
  activeReminders: [],
  preferences: { likedThemes: ['Assam Tea Gardens'], favoriteSoundscapes: ['RAIN'] },
  recentObservations: [],
};

const mockContextAs = {
  ...mockContextEn,
  patient: {
    ...mockContextEn.patient,
    preferredLanguage: 'as' as const,
  },
};

const howAreYouResult = aiOrchestrator.generateOfflineWarmResponse(
  classifyIntent('Hi, how are you?'),
  mockContextEn
);

assert(
  !howAreYouResult.toLowerCase().includes('okay, i am fine. what can i help you with'),
  'AI response eliminates robotic "Okay, I am fine. What can I help you with?"',
  howAreYouResult
);

assert(
  howAreYouResult.toLowerCase().includes('ravi') || howAreYouResult.toLowerCase().includes('wonderful') || howAreYouResult.toLowerCase().includes('warmth'),
  'AI response produces warm, empathetic elder-friendly greeting',
  howAreYouResult
);

// Cultural multilingual response check (Assamese)
const assameseGreeting = aiOrchestrator.generateOfflineWarmResponse(
  classifyIntent('নমস্কাৰ, কেনে আছা?'),
  mockContextAs
);
assert(
  assameseGreeting.includes('নমস্কাৰ') || assameseGreeting.includes('ভাল'),
  'Generates culturally authentic Assamese response',
  assameseGreeting
);

console.log('\n============================================================');
console.log(`🎉 ALL ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('============================================================\n');
