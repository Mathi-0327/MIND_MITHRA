/**
 * ============================================================
 * MIND MITHRA: Automated End-to-End System Verification Suite
 * Cultural Cognitive Care & Reminiscence Platform
 * ============================================================
 */

import { localDB, INITIAL_MEMORY_GRAPH_NODES, INITIAL_ELDER_KNOWLEDGE, INITIAL_ROUTE_MEMORIES } from '../src/lib/storage';
import { SUPPORTED_LANGUAGES, t } from '../src/lib/translations';
import { audioService } from '../src/lib/audioService';
import { evaluateGameAdaptation } from '../src/lib/adaptiveEngine';
import { SupportedLanguage, GameSessionResult } from '../src/types';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, details: string) {
  results.push({
    name,
    passed: condition,
    details: condition ? details : `FAILED: ${details}`,
  });
}

console.log('\n============================================================');
console.log('MIND MITHRA: Automated System Verification Starting...');
console.log('============================================================\n');

// 1. BRANDING & PRODUCT IDENTITY TEST
console.log('--- TEST GROUP 1: Branding & Identity Integrity ---');
const patient = localDB.getPatientProfile();
assert(
  patient.name.length > 0,
  'Patient Profile Loaded',
  `Active patient: ${patient.name} (${patient.region})`
);

// 2. MULTILINGUAL DICTIONARY & REGIONAL COVERAGE
console.log('\n--- TEST GROUP 2: Multilingual Support ---');
const expectedLangs: SupportedLanguage[] = ['as', 'bn', 'hi', 'mni', 'kha', 'lus', 'ta', 'grt', 'trp', 'en'];
expectedLangs.forEach(lang => {
  const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  const greeting = t('greeting.morning', lang);
  assert(
    Boolean(meta && greeting && greeting.length > 0),
    `Language Translation: [${lang.toUpperCase()}] ${meta?.nativeName || lang}`,
    `Sample greeting: "${greeting}"`
  );
});

// 3. STORAGE & DOMAIN MODELS FOR 21 REFERENCE FEATURES
console.log('\n--- TEST GROUP 3: LocalDB 21 Reference Features Storage ---');
const graph = localDB.getMemoryGraph(patient.id);
assert(
  graph.nodes.length >= 5 && graph.edges.length >= 5,
  'Feature 2: Memory Web Graph',
  `Found ${graph.nodes.length} nodes and ${graph.edges.length} interconnected edges`
);

const elderKno = localDB.getElderKnowledge(patient.id);
assert(
  elderKno.length >= 3,
  'Features 3 & 21: Elder Knowledge & Teach My Family',
  `Found ${elderKno.length} preserved heritage recipes & techniques`
);

const routes = localDB.getRouteMemories(patient.id);
assert(
  routes.length >= 2 && routes[0].waypoints.length >= 3,
  'Feature 4: Familiar Route Recall',
  `Found ${routes.length} consented routes with ${routes[0].waypoints.length} landmarks in primary route`
);

const sounds = localDB.getPersonalSounds(patient.id);
assert(
  sounds.length >= 4,
  'Feature 6: Personal Soundscape & Family Voice Board',
  `Found ${sounds.length} sound items (family voices, monsoon rain, bamboo flutes)`
);

const journals = localDB.getDailyJournals(patient.id);
assert(
  journals.length >= 2,
  'Feature 7: Tell Me About Your Day Journal',
  `Found ${journals.length} transcribed daily voice reflections`
);

const capsules = localDB.getMemoryCapsules(patient.id);
assert(
  capsules.length >= 2,
  'Feature 15: Memory Capsules Unboxing',
  `Found ${capsules.length} family surprise packages`
);

const chains = localDB.getMemoryChains(patient.id);
assert(
  chains.length >= 1 && chains[0].questions.length === 5,
  'Feature 16: Memory Chains (5-Question Links)',
  `Found active chain "${chains[0].chainTitle}" with 5 WHO/WHERE/WHEN/WHAT/FEELING questions`
);

const confMap = localDB.getConfidenceMap(patient.id);
assert(
  confMap.domains.length >= 5,
  'Feature 12: Memory Confidence Map',
  `Found ${confMap.domains.length} longitudinal domains evaluated (Family: ${confMap.domains[0].score}%)`
);

const userPref = localDB.getUserPreferences(patient.id);
assert(
  userPref.likedThemes.length > 0,
  'Feature 19: Emotional Preference Profile',
  `Preferences set: ${userPref.likedThemes.join(', ')}`
);

// 4. OFFLINE INTENT PARSER VERIFICATION
console.log('\n--- TEST GROUP 4: Offline Multilingual Voice Intent Engine ---');
const testIntents = [
  { text: 'I want to talk to my daughter Priyanka', expected: 'CALL_FAMILY' },
  { text: 'Help me emergency I feel dizzy', expected: 'TRIGGER_SOS' },
  { text: 'Show me my family tree', expected: 'OPEN_FAMILY_TREE' },
  { text: 'Play some peaceful flute music', expected: 'PLAY_MUSIC' },
  { text: 'What is my medicine reminder today', expected: 'CHECK_REMINDERS' },
  { text: 'Tell me about my day journal', expected: 'OPEN_JOURNAL' },
  { text: 'Play the sound of monsoon rain', expected: 'OPEN_SOUNDSCAPES' },
];

testIntents.forEach(tst => {
  const parsed = audioService.parseIntentOffline(tst.text);
  assert(
    parsed.intent === tst.expected,
    `Voice Intent: "${tst.text}"`,
    `Expected ${tst.expected} -> Got ${parsed.intent} (Confidence: ${parsed.confidence})`
  );
});

// 5. DYNAMIC DIFFICULTY ADJUSTMENT (DDA) VERIFICATION
console.log('\n--- TEST GROUP 5: Adaptive Difficulty Adjustment Engine ---');
const sampleSessionHigh: GameSessionResult = {
  sessionId: 'test-1',
  patientId: patient.id,
  gameId: 'memory-bihu-cards',
  category: 'MEMORY',
  difficulty: 2,
  score: 95,
  accuracyPercent: 95,
  avgResponseTimeMs: 2200,
  totalAttempts: 10,
  completed: true,
  abandoned: false,
  timestamp: new Date().toISOString(),
  feedbackText: 'Great focus'
};

const highPerfDda = evaluateGameAdaptation(sampleSessionHigh, patient, [sampleSessionHigh], []);
assert(
  highPerfDda.calculatedDifficulty >= 2,
  'DDA Adaptation: High Score & Swift Response -> Level Up / Maintain',
  `Diff 2 -> Recommended Level ${highPerfDda.calculatedDifficulty} (${highPerfDda.difficultyChange}): ${highPerfDda.reason}`
);

const sampleSessionStruggle: GameSessionResult = {
  sessionId: 'test-2',
  patientId: patient.id,
  gameId: 'attention-birds',
  category: 'ATTENTION',
  difficulty: 3,
  score: 40,
  accuracyPercent: 40,
  avgResponseTimeMs: 5800,
  totalAttempts: 10,
  completed: false,
  abandoned: true,
  timestamp: new Date().toISOString(),
  feedbackText: 'Struggled'
};

const fatigueDda = evaluateGameAdaptation(sampleSessionStruggle, patient, [sampleSessionStruggle], []);
assert(
  fatigueDda.calculatedDifficulty <= 3,
  'DDA Adaptation: Struggle & Elevated Latency -> Soften Difficulty',
  `Diff 3 -> Adjusted Level ${fatigueDda.calculatedDifficulty} (${fatigueDda.difficultyChange}): ${fatigueDda.reason}`
);

// SUMMARY REPORT
console.log('\n============================================================');
console.log('MIND MITHRA SYSTEM VERIFICATION SUMMARY');
console.log('============================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;

results.forEach((r, idx) => {
  const mark = r.passed ? '✓' : '✗';
  console.log(`${mark} [${idx + 1}/${totalCount}] ${r.name}: ${r.details}`);
});

console.log('\n------------------------------------------------------------');
console.log(`TOTAL PASSED: ${passedCount} / ${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)`);
console.log('============================================================\n');

if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
