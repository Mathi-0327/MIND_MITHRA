/**
 * MIND MITHRA — CRITICAL AI FIX VALIDATION TEST SUITE
 * 
 * Validates:
 * 1. Face Recognition Pipeline (10 stages, 9 conditions, zero fake 98%)
 * 2. Voice NLP & Dynamic Contextual Response Engine (Transcript fidelity, 14 test phrases, 0 canned repetition)
 * 3. Caregiver Observation Events & Analytics Data Models
 * 4. Live Backend API Response Schema
 */

import { faceRecognitionEngine } from '../src/lib/faceRecognitionEngine';
import { aiOrchestrator } from '../src/lib/aiOrchestrator';
import { classifyIntent } from '../src/lib/intentClassifier';
import { gameVoiceController } from '../src/lib/gameVoiceController';
import { localDB } from '../src/lib/storage';
import { EnrolledFaceTemplate, FaceBiometricData, EnrollmentPose } from '../src/types';

let totalTests = 0;
let passedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (details) console.error('     Details:', JSON.stringify(details, null, 2));
    failures.push(testName);
  }
}

async function runTestSuite() {
  console.log('\n============================================================');
  console.log('🔬 MIND MITHRA — CRITICAL AI RECOGNITION & VOICE NLP TEST SUITE');
  console.log('============================================================\n');

  // ============================================================
  // TEST SECTION 1: FACE DETECTION & RECOGNITION (PART B)
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 SECTION 1: FACE RECOGNITION ENGINE (10-STAGE PIPELINE)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1.1 Helper mock frame generator
  function createMockFrame(type: 'BLANK_WALL' | 'DARK_ROOM' | 'UNIFORM_GRAY' | 'VALID_PATIENT_FACE' | 'DIFFERENT_PERSON' | 'MULTIPLE_FACES'): ImageData {
    const width = 320;
    const height = 240;
    const data = new Uint8ClampedArray(width * height * 4);

    if (type === 'BLANK_WALL') {
      // Off-white / pale yellow wall (uniform texture, no facial landmarks)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 230;     // R
        data[i + 1] = 225; // G
        data[i + 2] = 210; // B
        data[i + 3] = 255; // A
      }
    } else if (type === 'DARK_ROOM') {
      // Dark room (average brightness < 15)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 8;
        data[i + 1] = 8;
        data[i + 2] = 8;
        data[i + 3] = 255;
      }
    } else if (type === 'UNIFORM_GRAY') {
      // Neutral gray table or chair
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 120;
        data[i + 1] = 120;
        data[i + 2] = 120;
        data[i + 3] = 255;
      }
    } else if (type === 'VALID_PATIENT_FACE') {
      // Background
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 160; data[i + 1] = 160; data[i + 2] = 160; data[i + 3] = 255;
      }
      // Paint oval face with skin chromaticity in center (x: 100-220, y: 50-190)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = (x - 160) / 45;
          const dy = (y - 120) / 60;
          if (dx * dx + dy * dy <= 1.0) {
            const idx = (y * width + x) * 4;
            // Warm skin tone: R > G > B
            data[idx] = 195;
            data[idx + 1] = 145;
            data[idx + 2] = 115;
            data[idx + 3] = 255;

            // Eye socket dark regions (anthropometric contrast)
            if (y >= 100 && y <= 115 && ((x >= 130 && x <= 145) || (x >= 175 && x <= 190))) {
              data[idx] = 90;
              data[idx + 1] = 65;
              data[idx + 2] = 50;
            }
          }
        }
      }
    } else if (type === 'DIFFERENT_PERSON') {
      // Paint background
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 130; data[i + 1] = 130; data[i + 2] = 130; data[i + 3] = 255;
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = (x - 160) / 50;
          const dy = (y - 120) / 40;
          if (dx * dx + dy * dy <= 1.0) {
            const idx = (y * width + x) * 4;
            data[idx] = 185;
            data[idx + 1] = 135;
            data[idx + 2] = 100;
            data[idx + 3] = 255;
            // Eyes placed much lower and wider (anthropometrically distinct person)
            if (y >= 125 && y <= 135 && ((x >= 125 && x <= 140) || (x >= 180 && x <= 195))) {
              data[idx] = 60; data[idx + 1] = 40; data[idx + 2] = 30;
            }
          }
        }
      }
    }

    return { width, height, data } as unknown as ImageData;
  }

  // Calibrated enrolled template for Ravi Kumar from enrollment frame
  const sampleEnrollFrame = createMockFrame('VALID_PATIENT_FACE');
  const detectedSample = faceRecognitionEngine.detectFaceWithAnthropometricCV(sampleEnrollFrame, 320, 240);
  let sampleEmbedding: number[] = [];
  if (detectedSample) {
    sampleEmbedding = faceRecognitionEngine.extractFaceEmbeddingDirect(sampleEnrollFrame.data, 320, 240, detectedSample);
  }
  const enrolledTemplate = faceRecognitionEngine.createEnrollmentTemplate(
    'patient-ravi-001',
    'Ravi Kumar',
    [sampleEmbedding]
  ) || faceRecognitionEngine.generatePrecalibratedTemplate('patient-ravi-001', 'Ravi Kumar');
  faceRecognitionEngine.setEnrolledFace(enrolledTemplate);

  // TEST 1.1: Blank Wall -> NO FACE DETECTED, NOT 98%
  faceRecognitionEngine.resetSession();
  const blankWallResult = faceRecognitionEngine.processImageData(createMockFrame('BLANK_WALL'));
  assert(
    blankWallResult.faceDetected === false,
    'Condition 1: Blank Wall -> faceDetected is FALSE',
    blankWallResult
  );
  assert(
    blankWallResult.identityVerified === false,
    'Condition 1: Blank Wall -> identityVerified is FALSE'
  );
  assert(
    blankWallResult.identitySimilarity === null,
    'Condition 1: Blank Wall -> identitySimilarity is NULL (Never ~98%)',
    { similarity: blankWallResult.identitySimilarity }
  );
  assert(
    blankWallResult.faceDetectionConfidence === 0,
    'Condition 1: Blank Wall -> faceDetectionConfidence is 0'
  );
  assert(
    blankWallResult.sessionState === 'WAITING_FOR_FACE',
    'Condition 1: Blank Wall -> sessionState is WAITING_FOR_FACE'
  );

  // TEST 1.2: Dark Room -> REJECTED / LOW_QUALITY
  faceRecognitionEngine.resetSession();
  const darkRoomResult = faceRecognitionEngine.processImageData(createMockFrame('DARK_ROOM'));
  assert(
    darkRoomResult.faceDetected === false || darkRoomResult.sessionState === 'LOW_QUALITY',
    'Condition 2: Dark Room -> Detected as FALSE or LOW_QUALITY'
  );
  assert(
    darkRoomResult.identityVerified === false,
    'Condition 2: Dark Room -> identityVerified is FALSE'
  );
  assert(
    darkRoomResult.identitySimilarity === null,
    'Condition 2: Dark Room -> identitySimilarity is NULL'
  );

  // TEST 1.3: Uniform Gray Furniture -> NO FACE
  faceRecognitionEngine.resetSession();
  const grayResult = faceRecognitionEngine.processImageData(createMockFrame('UNIFORM_GRAY'));
  assert(
    grayResult.faceDetected === false && grayResult.identitySimilarity === null,
    'Condition 3: Gray Furniture/Wall -> faceDetected is FALSE, similarity is NULL'
  );

  // TEST 1.4: Valid Enrolled Face -> Multi-Frame Temporal Stability (4 Frames to Verify)
  faceRecognitionEngine.resetSession();
  const validFaceFrame = createMockFrame('VALID_PATIENT_FACE');

  // Frame 1
  const f1 = faceRecognitionEngine.processImageData(validFaceFrame);
  assert(f1.faceDetected === true, 'Frame 1: Enrolled face detected (faceDetected = true)');
  assert(f1.faceDetectionConfidence >= 0.70, 'Frame 1: faceDetectionConfidence >= 0.70', { conf: f1.faceDetectionConfidence });
  assert(f1.temporalStabilityCount === 1, 'Frame 1: temporalStabilityCount is 1');
  assert(f1.identityVerified === false, 'Frame 1: identityVerified is FALSE (Requires 4 consecutive frames)');

  // Frame 2
  const f2 = faceRecognitionEngine.processImageData(validFaceFrame);
  assert(f2.temporalStabilityCount === 2, 'Frame 2: temporalStabilityCount is 2');
  assert(f2.identityVerified === false, 'Frame 2: identityVerified is FALSE');

  // Frame 3
  const f3 = faceRecognitionEngine.processImageData(validFaceFrame);
  assert(f3.temporalStabilityCount === 3, 'Frame 3: temporalStabilityCount is 3');
  assert(f3.identityVerified === false, 'Frame 3: identityVerified is FALSE');

  // Frame 4 -> VERIFIED!
  const f4 = faceRecognitionEngine.processImageData(validFaceFrame);
  assert(f4.temporalStabilityCount >= 4, 'Frame 4: temporalStabilityCount >= 4');
  assert(f4.identityVerified === true, 'Frame 4: identityVerified is TRUE after 4 consecutive matching frames!');
  assert(f4.sessionState === 'VERIFIED', 'Frame 4: sessionState transitions to VERIFIED');
  assert(f4.recognizedPerson === 'Ravi Kumar', 'Frame 4: recognizedPerson correctly set to Ravi Kumar');
  assert(
    f4.identitySimilarity !== null && f4.identitySimilarity >= faceRecognitionEngine.getThreshold(),
    `Frame 4: similarity (${f4.identitySimilarity}) >= threshold (${faceRecognitionEngine.getThreshold()})`
  );

  // TEST 1.5: Patient Leaves Camera -> Verification Instantly Revoked
  const fLeft = faceRecognitionEngine.processImageData(createMockFrame('BLANK_WALL'));
  assert(fLeft.faceDetected === false, 'Patient moves out of frame -> faceDetected drops to FALSE');
  assert(fLeft.identityVerified === false, 'Patient moves out of frame -> identityVerified instantly revoked');
  assert(fLeft.temporalStabilityCount === 0, 'Patient moves out of frame -> temporal stability reset to 0');
  assert(fLeft.identitySimilarity === null, 'Patient moves out of frame -> similarity reset to NULL');

  // TEST 1.6: Patient Returns -> Must Re-Accumulate 4 Frames
  const fReturn1 = faceRecognitionEngine.processImageData(validFaceFrame);
  assert(fReturn1.temporalStabilityCount === 1 && fReturn1.identityVerified === false, 'Patient returns -> Frame 1 stability is 1, not verified yet');
  faceRecognitionEngine.processImageData(validFaceFrame); // Frame 2
  faceRecognitionEngine.processImageData(validFaceFrame); // Frame 3
  const fReturn4 = faceRecognitionEngine.processImageData(validFaceFrame); // Frame 4
  assert(fReturn4.identityVerified === true, 'Patient returns -> Re-verified on Frame 4');

  // TEST 1.7: Different Person -> Detected but NOT Verified
  faceRecognitionEngine.resetSession();
  const differentPersonFrame = createMockFrame('DIFFERENT_PERSON');
  let diffVerified = false;
  for (let i = 0; i < 5; i++) {
    const res = faceRecognitionEngine.processImageData(differentPersonFrame);
    if (res.identityVerified) diffVerified = true;
  }
  assert(diffVerified === false, 'Different Person -> Not recognized as patient (identityVerified is FALSE across all frames)');

  // TEST 1.8: Embedding Validation Guard
  const invalidZeroEmbedding = {
    embedding: new Array(64).fill(0),
    dimension: 64,
    modelVersion: 'cv-anthropometric-v2',
    timestamp: new Date().toISOString(),
  };
  const zeroEmbedValid = faceRecognitionEngine.validateEmbedding(invalidZeroEmbedding.embedding);
  assert(zeroEmbedValid === false, 'Embedding Validation: All-zero embedding correctly rejected as invalid');

  const nanEmbedding = {
    embedding: [NaN, ...new Array(63).fill(0.1)],
    dimension: 64,
    modelVersion: 'cv-anthropometric-v2',
    timestamp: new Date().toISOString(),
  };
  const nanEmbedValid = faceRecognitionEngine.validateEmbedding(nanEmbedding.embedding);
  assert(nanEmbedValid === false, 'Embedding Validation: NaN containing embedding correctly rejected as invalid');

  const shortEmbedding = {
    embedding: [0.1, 0.2, 0.3],
    dimension: 3,
    modelVersion: 'cv-anthropometric-v2',
    timestamp: new Date().toISOString(),
  };
  const shortEmbedValid = faceRecognitionEngine.validateEmbedding(shortEmbedding.embedding);
  assert(shortEmbedValid === false, 'Embedding Validation: Wrong dimension (3 != 64) correctly rejected');


  // ============================================================
  // TEST SECTION 2: VOICE NLP & RESPONSE GENERATION (PART C)
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎙️ SECTION 2: VOICE NLP & DYNAMIC CONTEXTUAL RESPONSES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const mockContext = aiOrchestrator.buildControlledContext('HOME', null, null);

  // Test 2.1: The 10 Prompt-Mandated Dialogue Sentences
  const testPhrases = [
    { input: 'Hi, how are you?', expectedIntent: 'HOW_ARE_YOU', checkWord: 'warmth' },
    { input: 'I am lonely today.', expectedIntent: 'USER_STATE_EXPRESSION', expectedState: 'LONELY', checkWord: 'lonely' },
    { input: 'I am happy today.', expectedIntent: 'USER_FEELING_HAPPY', checkWord: 'cheerful' },
    { input: 'I am tired.', expectedIntent: 'USER_FEELING_TIRED', checkWord: 'tired' },
    { input: 'I am hungry.', expectedIntent: 'USER_STATE_EXPRESSION', expectedState: 'HUNGRY', checkWord: 'snack' },
    { input: 'I went to the market.', expectedIntent: 'DAILY_ACTIVITY', checkWord: 'market' },
    { input: 'My daughter called me.', expectedIntent: 'DAILY_ACTIVITY', checkWord: 'daughter' },
    { input: 'Show my memories.', expectedIntent: 'SHOW_MEMORIES', checkAction: 'NAVIGATE_MEMORIES' },
    { input: 'Start a memory game.', expectedIntent: 'START_GAME', checkAction: 'START_GAME' },
    { input: 'Make the game easier.', expectedIntent: 'SELECT_GAME_LEVEL', checkWord: 'adjusted' },
    { input: "Show me my daughter's photo.", expectedIntent: 'SHOW_MEMORIES' },
    { input: 'Good morning.', expectedIntent: 'GENERAL_GREETING', checkWord: 'wonderful' },
    { input: 'Tell me a story.', expectedIntent: 'TELL_STORY', checkWord: 'peaceful' },
    { input: 'Stop.', expectedIntent: 'STOP', checkWord: 'pause' },
  ];

  for (const item of testPhrases) {
    const classification = classifyIntent(item.input, 'en');
    assert(
      classification.intent === item.expectedIntent,
      `Phrase: "${item.input}" -> Classified as ${item.expectedIntent}`,
      { actual: classification.intent, expected: item.expectedIntent }
    );

    if (item.expectedState) {
      assert(
        classification.entities.state === item.expectedState,
        `Phrase: "${item.input}" -> Extracts state: ${item.expectedState}`,
        classification.entities
      );
    }

    if (item.checkAction) {
      assert(
        classification.action?.type === item.checkAction,
        `Phrase: "${item.input}" -> Generates action: ${item.checkAction}`,
        classification.action
      );
    }

    const reply = aiOrchestrator.generateOfflineWarmResponse(classification, mockContext);
    assert(
      typeof reply === 'string' && reply.length > 20,
      `Phrase: "${item.input}" -> Generates complete response (${reply.length} chars)`
    );

    if (item.checkWord) {
      assert(
        reply.toLowerCase().includes(item.checkWord.toLowerCase()),
        `Phrase: "${item.input}" -> Response contains contextual keyword "${item.checkWord}"`
      );
    }
  }

  // TEST 2.2: SAME-RESPONSE BUG TEST (Section 47 of Prompt)
  // "I am lonely today.", "I am happy today.", "I am tired.", "I went to the market."
  // All 4 responses MUST BE UNIQUE AND NON-IDENTICAL!
  console.log('\n--- Section 47: Same-Response Bug Verification ---');
  const phrase1 = 'I am lonely today.';
  const phrase2 = 'I am happy today.';
  const phrase3 = 'I am tired.';
  const phrase4 = 'I went to the market.';

  const rep1 = aiOrchestrator.generateOfflineWarmResponse(classifyIntent(phrase1), mockContext);
  const rep2 = aiOrchestrator.generateOfflineWarmResponse(classifyIntent(phrase2), mockContext);
  const rep3 = aiOrchestrator.generateOfflineWarmResponse(classifyIntent(phrase3), mockContext);
  const rep4 = aiOrchestrator.generateOfflineWarmResponse(classifyIntent(phrase4), mockContext);

  const uniqueResponses = new Set([rep1, rep2, rep3, rep4]);
  assert(
    uniqueResponses.size === 4,
    'Section 47: All 4 test sentences produce distinct, unique responses (No canned repetition)',
    {
      lonely: rep1,
      happy: rep2,
      tired: rep3,
      market: rep4,
    }
  );

  // TEST 2.3: Over-Medicalization Safety Invariant (Section 20 of Prompt)
  const forbiddenClinicalTerms = ['depression', 'depressive', 'clinical disorder', 'pathology', 'diagnose'];
  const hasForbiddenTerm = forbiddenClinicalTerms.some((t) => rep1.toLowerCase().includes(t));
  assert(
    hasForbiddenTerm === false,
    'Section 20: Loneliness response provides emotional support WITHOUT diagnosing depression'
  );

  // TEST 2.4: Caregiver Observation Logging
  const initialEventCount = localDB.getCareObservationEvents('patient-ravi-001').length;
  await aiOrchestrator.processUserInput('I am lonely today.');
  const postEvents = localDB.getCareObservationEvents('patient-ravi-001');
  assert(
    postEvents.length > initialEventCount,
    'Section 36/37: Voice observation logged to Caregiver Analytics (localDB.addCareObservationEvent)'
  );
  if (postEvents.length > 0) {
    const latestVoiceEvent = postEvents[0];
    assert(
      latestVoiceEvent.source === 'VOICE_EVENT' || latestVoiceEvent.source === 'MOOD_EVENT',
      `Section 39: Event has unified CareEventType (${latestVoiceEvent.source})`,
      latestVoiceEvent
    );
  }


  // ============================================================
  // TEST SECTION 3: BACKEND SERVER API VERIFICATION
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 SECTION 3: LIVE BACKEND COMPANION API ENDPOINT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const apiRes = await fetch('http://localhost:3000/api/ai/companion-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I am lonely today.',
        patientName: 'Ravi Kumar',
        language: 'en',
        voice: 'Kore',
        context: mockContext,
        intentClassification: classifyIntent('I am lonely today.'),
      }),
    });

    assert(apiRes.ok, `Backend API /api/ai/companion-chat returns HTTP status 200 (Status: ${apiRes.status})`);
    const apiData = await apiRes.json();
    assert(
      typeof apiData.reply === 'string' && apiData.reply.length > 15,
      'Backend API returns non-empty reply string'
    );
    assert(
      !apiData.reply.includes('Hello dear Ravi! It is wonderful to hear from you. How are you feeling today?'),
      'Backend API eliminates old hardcoded fallback greeting'
    );
    assert(
      apiData.reply.toLowerCase().includes('lonely') || apiData.reply.toLowerCase().includes('here with you'),
      'Backend API generates contextually empathetic response to loneliness'
    );
    assert(
      apiData.structured && apiData.structured.intent === 'USER_STATE_EXPRESSION',
      'Backend API returns validated StructuredAIResponse schema with intent USER_STATE_EXPRESSION',
      apiData.structured
    );
  } catch (apiErr: any) {
    console.error('API call failed:', apiErr.message);
    failures.push('Backend API connectivity');
  }

  // ============================================================
  // TEST SECTION 4: COGNITIVE GAME VOICE INTERACTION ENGINE
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎮 SECTION 4: COGNITIVE GAME VOICE INTERACTION & INTENT ENGINE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Register mock cognitive game round context
  gameVoiceController.registerContext({
    gameId: 'heritage_match',
    gameTitle: 'Heritage Memory Match',
    gameCategory: 'MEMORY',
    currentRound: 1,
    totalRounds: 5,
    prompt: 'Can you find the matching pair of Traditional Brass Diya lamps?',
    options: [
      { id: 'opt-0', label: '1. Silver Temple Bell', spokenKeywords: ['bell', 'ghanti', 'one', 'first', 'silver bell'] },
      { id: 'opt-1', label: '2. Brass Diya Lamp', spokenKeywords: ['diya', 'lamp', 'vilakku', 'two', 'second', 'brass diya'] },
      { id: 'opt-2', label: '3. Peacock Feather', spokenKeywords: ['peacock', 'feather', 'mor pankh', 'three', 'third'] },
      { id: 'opt-3', label: '4. Marigold Garland', spokenKeywords: ['marigold', 'garland', 'four', 'fourth', 'flowers'] },
    ],
    hint: 'Look closely near the top-right corner of the wooden table.',
    isPaused: false,
    language: 'en',
  });

  const registeredContext = gameVoiceController.getCurrentContext();
  assert(registeredContext !== null, 'GameVoiceController: Current context registered successfully');
  assert(registeredContext?.gameId === 'heritage_match', 'GameVoiceController: Context holds correct gameId');
  assert(registeredContext?.options.length === 4, 'GameVoiceController: Context contains 4 active round options');

  // Test 4.1: Direct Option Matching (Spoken text)
  const interpOptionDirect = gameVoiceController.interpretVoiceInput('I choose the Brass Diya Lamp');
  assert(
    interpOptionDirect.intent === 'SELECT_OPTION' && interpOptionDirect.matchedOptionId === 'opt-1',
    'GameVoiceController: Resolves direct spoken option label ("Brass Diya Lamp" -> opt-1)',
    interpOptionDirect
  );

  // Test 4.2: Ordinal Matching ("the second one")
  const interpOrdinal = gameVoiceController.interpretVoiceInput('Pick the second one please');
  assert(
    interpOrdinal.intent === 'SELECT_OPTION' && interpOrdinal.matchedOptionId === 'opt-1',
    'GameVoiceController: Resolves ordinal voice selection ("the second one" -> opt-1)',
    interpOrdinal
  );

  // Test 4.3: Numeric Matching ("number 3")
  const interpNumber = gameVoiceController.interpretVoiceInput('Number 3');
  assert(
    interpNumber.intent === 'SELECT_OPTION' && interpNumber.matchedOptionId === 'opt-2',
    'GameVoiceController: Resolves numeric voice selection ("Number 3" -> opt-2)',
    interpNumber
  );

  // Test 4.4: Hindi / Regional phonetic match ("do number" / "ghanti")
  const interpKeyword = gameVoiceController.interpretVoiceInput('the silver bell');
  assert(
    interpKeyword.intent === 'SELECT_OPTION' && interpKeyword.matchedOptionId === 'opt-0',
    'GameVoiceController: Resolves semantic keyword ("the silver bell" -> opt-0)',
    interpKeyword
  );

  // Test 4.5: Universal Command: HINT
  const interpHilt = gameVoiceController.interpretVoiceInput('Can you give me a small hint?');
  assert(
    interpHilt.intent === 'HINT',
    'GameVoiceController: Recognizes HINT command ("Can you give me a small hint?")'
  );

  // Test 4.6: Universal Command: REPEAT
  const interpRepeat = gameVoiceController.interpretVoiceInput('Repeat the question');
  assert(
    interpRepeat.intent === 'REPEAT',
    'GameVoiceController: Recognizes REPEAT command ("Repeat the question")'
  );

  // Test 4.7: Universal Command: SKIP
  const interpSkip = gameVoiceController.interpretVoiceInput('Let us skip this round');
  assert(
    interpSkip.intent === 'SKIP',
    'GameVoiceController: Recognizes SKIP command ("Let us skip this round")'
  );

  // Test 4.8: Universal Command: PAUSE & CONTINUE
  const interpPause = gameVoiceController.interpretVoiceInput('Please pause the game');
  assert(
    interpPause.intent === 'PAUSE',
    'GameVoiceController: Recognizes PAUSE command ("Please pause the game")'
  );
  const interpContinue = gameVoiceController.interpretVoiceInput('Okay continue the game');
  assert(
    interpContinue.intent === 'CONTINUE',
    'GameVoiceController: Recognizes CONTINUE command ("Okay continue the game")'
  );

  // Test 4.9: Universal Command: ADAPTIVE DIFFICULTY (EASIER / HARDER)
  const interpEasier = gameVoiceController.interpretVoiceInput('This is a bit hard, make it easier');
  assert(
    interpEasier.intent === 'EASIER',
    'GameVoiceController: Recognizes EASIER command ("make it easier")'
  );
  const interpHarder = gameVoiceController.interpretVoiceInput('I am ready for a harder level');
  assert(
    interpHarder.intent === 'HARDER',
    'GameVoiceController: Recognizes HARDER command ("harder level")'
  );

  // Test 4.10: Compassionate, Non-Shaming Feedback
  const correctFeedback = gameVoiceController.generateCompanionFeedback('CORRECT');
  assert(
    typeof correctFeedback === 'string' && correctFeedback.length > 5,
    'GameVoiceController: Generates uplifting feedback on correct response'
  );

  const incorrectFeedback = gameVoiceController.generateCompanionFeedback('INCORRECT');
  assert(
    typeof incorrectFeedback === 'string' &&
    !incorrectFeedback.toLowerCase().includes('wrong') &&
    !incorrectFeedback.toLowerCase().includes('failed') &&
    !incorrectFeedback.toLowerCase().includes('error'),
    'GameVoiceController: Non-shaming incorrect feedback (strictly avoids "wrong" / "failed" / "error")'
  );

  // ============================================================
  // TEST SECTION 5: BIOMETRIC MULTI-POSE FACE ENROLLMENT (5 POSES)
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 SECTION 5: BIOMETRIC 5-POSE FACE ENROLLMENT & RECOGNITION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const poses: EnrollmentPose[] = ['FRONTAL', 'SLIGHT_LEFT', 'SLIGHT_RIGHT', 'SLIGHT_UP', 'SLIGHT_DOWN'];
  const mockValidFace = createMockFrame('VALID_PATIENT_FACE');
  const mockWall = createMockFrame('BLANK_WALL');
  const mockDark = createMockFrame('DARK_ROOM');
  const mockGray = createMockFrame('UNIFORM_GRAY');

  // Test 5.1: Non-Face Rejection across all 5 poses (Zero False Positives)
  poses.forEach((pose) => {
    const wallDetection = faceRecognitionEngine.detectFaceWithAnthropometricCV(mockWall, 320, 240, pose);
    assert(
      wallDetection === null,
      `Multi-Pose: Wall frame rejected under pose ${pose} (No false positive)`
    );

    const darkDetection = faceRecognitionEngine.detectFaceWithAnthropometricCV(mockDark, 320, 240, pose);
    assert(
      darkDetection === null,
      `Multi-Pose: Dark room rejected under pose ${pose} (No false positive)`
    );

    const grayDetection = faceRecognitionEngine.detectFaceWithAnthropometricCV(mockGray, 320, 240, pose);
    assert(
      grayDetection === null,
      `Multi-Pose: Gray furniture rejected under pose ${pose} (No false positive)`
    );
  });

  // Test 5.2: Anthropometric CV detection on human face across all 5 poses
  poses.forEach((pose) => {
    const faceDetection = faceRecognitionEngine.detectFaceWithAnthropometricCV(mockValidFace, 320, 240, pose);
    assert(
      faceDetection !== null && faceDetection.confidence >= 0.70,
      `Multi-Pose: Human face recognized under pose ${pose} (Confidence: ${faceDetection?.confidence?.toFixed(2)})`
    );
  });

  // Test 5.3: validateEnrollmentSample returns valid embedding & quality
  const collectedEmbeddings: number[][] = [];
  poses.forEach((pose, idx) => {
    const sampleResult = faceRecognitionEngine.validateEnrollmentSample(mockValidFace, 320, 240, pose);
    assert(
      sampleResult.isValid === true,
      `validateEnrollmentSample: Pose ${idx + 1}/5 (${pose}) validated as genuine face`
    );
    assert(
      Array.isArray(sampleResult.embedding) && sampleResult.embedding.length === 64,
      `validateEnrollmentSample: Pose ${idx + 1}/5 extracted normalized 64-dim embedding`
    );
    if (sampleResult.embedding) {
      collectedEmbeddings.push(sampleResult.embedding);
    }
  });

  // Test 5.4: validateEnrollmentSample rejects blank wall with informative reason
  const wallSampleResult = faceRecognitionEngine.validateEnrollmentSample(mockWall, 320, 240, 'FRONTAL');
  assert(
    wallSampleResult.isValid === false,
    'validateEnrollmentSample: Rejects blank wall'
  );
  assert(
    typeof wallSampleResult.reason === 'string' && wallSampleResult.reason.length > 5,
    `validateEnrollmentSample: Provides clear user guidance on wall (${wallSampleResult.reason})`
  );

  // Test 5.5: Multi-sample template creation from 5 collected poses
  assert(collectedEmbeddings.length === 5, 'Biometric Enrollment: 5 multi-angle embeddings collected');
  const multiPoseTemplate = faceRecognitionEngine.createEnrollmentTemplate(
    'patient-ravi-1',
    'Ravi Kumar',
    collectedEmbeddings
  );
  assert(multiPoseTemplate !== null, 'createEnrollmentTemplate: Creates multi-angle face template');
  assert(
    multiPoseTemplate?.sampleCount === 5,
    `createEnrollmentTemplate: Records exactly 5 biometric samples (Recorded: ${multiPoseTemplate?.sampleCount})`
  );
  assert(
    multiPoseTemplate?.modelVersion === 'mind-mithra-face-v2.0',
    'createEnrollmentTemplate: Valid model version tag'
  );
  assert(
    multiPoseTemplate?.meanEmbedding.length === 64,
    'createEnrollmentTemplate: Computes 64-dimensional mean biometric vector'
  );

  // Test 5.6: Temporary state reset (Zero stuck states)
  faceRecognitionEngine.clearTemporaryState();
  assert(true, 'faceRecognitionEngine: clearTemporaryState() cleans up session without exception');

  // Summary
  console.log('\n============================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (failures.length === 0) {
    console.log('🎉 ALL CRITICAL AI RECOGNITION & VOICE NLP FIXES VALIDATED!');
  } else {
    console.error(`⚠️ ${failures.length} TEST FAILURES DETECTED:`);
    failures.forEach((f) => console.error(`  - ${f}`));
  }
  console.log('============================================================\n');

  if (failures.length > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
