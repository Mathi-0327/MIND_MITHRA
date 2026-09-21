# MIND MITHRA — Comprehensive Audit: Game Voice Interaction & Biometric Face Enrollment

**Project:** Mind Mithra  
**Date:** September 2026  
**Auditor:** Antigravity Autonomous Agent  
**Status:** Audit Complete — Pre-Implementation Document  

---

## 1. Current Game Architecture

The application has two distinct game presentation layers:
1. **`CognitiveGameHub.tsx`**:
   - Universal engine rendering games from `COGNITIVE_GAMES_CATALOG` (`game-01` through `game-30`).
   - Handles game keys: `MEMORY_HERITAGE`, `FACE_KINSHIP`, `ATTENTION_WILDLIFE`, `PATTERN_WEAVER`, `ROUTINE_SEQUENCER`, `LANGUAGE_PROVERB`, `SPATIAL_SORTER`, `STORY_RECALL`, `VISUOSPATIAL_PUZZLE`, `MOTOR_COORDINATION`, etc.
   - Manages round progression (1 to 4 rounds), score increment, response latency tracking, hint handling, skip handling, DDA (Dynamic Difficulty Adjustment), and saving sessions via `localDB.saveGameSession`.
   - **Current Voice Status:** Contains only an ad-hoc, isolated `speakPrompt(text)` using raw `window.speechSynthesis`. It has **no STT**, **no voice input listener**, **no voice answers**, **no voice commands** ("repeat", "hint", "skip", "stop"), and **no dialog flow**.
2. **Dedicated Individual Game Components** (`src/components/PatientPortal/CognitiveGames/`):
   - `MemoryMatchGame.tsx` (Card pair flipping)
   - `AttentionFinderGame.tsx` (Spot odd/target item)
   - `PatternSequenceGame.tsx` (Sequencing and pattern completion)
   - `RoutineSequencerGame.tsx` (ADL daily routine steps)
   - `WordRecallGame.tsx` (Proverbs, fill-in-the-blank vocabulary)
   - `ObjectCategorySortGame.tsx` (Sorting kitchen vs orchard vs sacred items)
   - `StoryRecallGame.tsx` (Cultural story comprehension)
   - `RelaxationMusicGame.tsx` (Interactive music instruments & calming tones)
   - `VisuospatialPuzzleGame.tsx` (Tile arrangement & spatial orientation)
   - `MotorCoordinationGame.tsx` (Finger tapping & rhythm tracking)
   - **Current Voice Status:** Each of these individual games currently relies almost 100% on pointer/touch taps. They do not share a common voice adapter or voice interaction lifecycle.

---

## 2. Existing Game Categories
Mind Mithra defines 6 core cognitive categories in `src/types.ts`:
1. `MEMORY`: Visual working memory, associative memory, paired associates, face kinship.
2. `ATTENTION`: Selective attention, focused spotlight, visual search.
3. `PATTERN`: Inductive logic, geometric and handloom silk sequence completion.
4. `ROUTINE`: Executive functioning, procedural ADL ordering (tea making, morning medicine).
5. `LANGUAGE`: Semantic word retrieval, proverb recall, cultural vocabulary.
6. `SPATIAL`: Categorization, mental flexibility, visuospatial puzzle assembly.

---

## 3. Existing Game Levels & Difficulty Engine
- Defined in `src/lib/gameLevelSystem.ts` and `src/lib/adaptiveEngine.ts`.
- 5 levels per category (`DOMAIN_LEVEL_CONFIGS`):
  - **Level 1 (Easy):** Minimal items (3–4), 0 distractors, generous 120s limit, 3 hints allowed, gentle guidance.
  - **Level 2 (Easy-Medium):** 5–6 items, 1 distractor, 90s limit, 2 hints allowed.
  - **Level 3 (Medium):** 7–8 items, 2 distractors, 70s limit, 2 hints allowed.
  - **Level 4 (Medium-Hard):** 10–12 items, 4 distractors, 50s limit, 1 hint allowed.
  - **Level 5 (Hard):** 14–16 items, 6 distractors, 35s limit, 0 hints allowed.
- Difficulty is evaluated using `evaluateDDAWithCaregiverBounds()` based on:
  - Accuracy percentage
  - Average response time (ms)
  - Hints used
  - Caregiver lock bounds (`CaregiverGameControl`)
- **Missing Integration:** Voice answers, voice latency, repeated hesitations, and voice hint requests are currently **not logged** in `GameSessionResult` or fed into the adaptive engine.

---

## 4. Existing Voice Architecture
- Located in `src/lib/audioService.ts`, `src/lib/aiOrchestrator.ts`, and `src/components/PatientPortal/VoiceAssistantModal.tsx`.
- Central singleton: `audioService` handles:
  - AudioContext web synthesizers (procedural chimes, tap sounds, flute soundscapes, rain, SOS emergency siren).
  - Browser SpeechSynthesis with natural human voice selection.
  - Server-side Gemini TTS endpoint `/api/ai/speak` streaming 24kHz PCM audio.
  - Offline intent parsing (`parseOfflineIntent`) for global app commands (SOS, family, memories, routine, relax).
- Voice Assistant Modal (`VoiceAssistantModal.tsx`):
  - Full modal companion with chat turns, mic visualization, and 10-language support (`as`, `bn`, `hi`, `ta`, `mni`, `kha`, `lus`, `grt`, `trp`, `en`).
- **Gap:** There is **no GameVoiceController**. Games cannot plug into speech recognition or receive structured voice callbacks without writing duplicate code.

---

## 5. Existing TTS (Text-to-Speech)
- **Primary:** `/api/ai/speak` with Gemini voice profiles (`Kore`, `Puck`, `Zephyr`).
- **Fallback:** High-fidelity browser `SpeechSynthesisUtterance` configured with calm elderly cadence (`rate: 0.92`, `pitch: 1.0`, natural voice priority selection).
- **Control:** `audioService.stopSpeaking()`, `audioService.getIsSpeaking()`.
- **Works reliably offline:** Automatically falls back to client speech synthesis when offline.

---

## 6. Existing STT (Speech-to-Text)
- **Implementation:** Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) inside `VoiceAssistantModal.tsx`.
- **Features:**
  - Continuous listening with `interimResults`.
  - Regional language locale mapping (`as-IN`, `bn-IN`, `hi-IN`, `ta-IN`, `en-IN`).
  - VAD (Voice Activity Detection) with a 2.4s debounce timer for elderly hesitation.
- **Gap:** This STT logic is trapped inside `VoiceAssistantModal.tsx` and is not exposed as a reusable service for games.

---

## 7. Existing NLP (Natural Language Processing)
- **Hybrid System:**
  - `aiOrchestrator.ts`: Calls `/api/ai/companion-chat` with system prompts and patient state.
  - `intentClassifier.ts`: High-accuracy offline intent classification covering 22 intent classes with keyword maps and entity extractors.
  - Local companion fallback generation with zero canned responses.
- **Gap for Games:**
  - No game-contextual intent classification. A phrase like "the mango" or "second one" or "tea cup" is classified as `UNKNOWN` or `DAILY_ACTIVITY` instead of being evaluated against the active game question options.

---

## 8. Existing Face Enrollment Architecture
- Defined across:
  - `src/lib/faceRecognitionEngine.ts` (`createEnrollmentTemplate`, `generatePrecalibratedTemplate`)
  - `src/lib/storage.ts` (`saveEnrolledFace`, `getEnrolledFace`)
  - `src/components/PatientPortal/CameraMoodCheckModal.tsx` (`handleEnrollFaceSample`)
  - `src/types.ts` (`EnrolledFaceTemplate`)
- Expected flow: Capture 5 verified face frames, compute the 64-dimensional mean embedding vector, L2 normalize, and persist to `localDB`.

---

## 9. Existing Face Recognition Architecture
- **Pipeline:**
  1. Video frame $\to$ Offscreen Canvas (320x240)
  2. Stage 1: Computer Vision Anthropometric Face Detector (`detectFaceWithAnthropometricCV`)
  3. Stage 2: Empty room / wall / furniture rejection
  4. Stage 3: Multiple face detector
  5. Stage 4: Quality Assessment (brightness, blur/Laplacian, distance, centering)
  6. Stage 5 & 6: 64-dimensional feature embedding extraction & normalization
  7. Stage 7 & 8: Cosine similarity vs enrolled mean embedding (threshold = 0.80)
  8. Stage 9: Temporal stability filter (requires 4 consecutive matching frames)
  9. Stage 10: Final Biometric Result (`VERIFIED`, `UNKNOWN_FACE`, `LOW_QUALITY`, `MULTIPLE_FACES`, `WAITING_FOR_FACE`)

---

## 10. Current 5-Sample Enrollment Flow in UI
- Currently nestled inside `CameraMoodCheckModal.tsx` (lines 956–1001) behind a toggle button: "Face Biometrics Enrolled • Tap to Re-Enroll".
- Displays: "Biometric Multi-Sample Enrollment (5 Frames)", showing a counter `enrollmentSamples.length / 5`.
- Requires the user to manually click "Capture Enrollment Sample" 5 times while holding their face steady.

---

## 11. Root Causes of Face Enrollment Failure
Through deep code inspection, we identified the **5 technical root causes**:

1. **Button Disabled Deadlock Without Explanation:**
   - The capture button has `disabled={!biometricData?.faceDetected || !biometricData?.quality?.isQualitySufficient}`.
   - When a patient tilts their head (left, right, up, down), the strict anthropometric CV checks (specifically `eyeContrast < -15` and `aspectRatio` between 1.1 and 1.8) fail because one eye is partially obscured or angled.
   - As a result, `faceDetected` or `isQualitySufficient` becomes `false`, disabling the button. The patient taps the screen, nothing happens, and no explanation is given. It appears completely stuck.
2. **Lack of Guided State Machine & Angle Guidance:**
   - There is no guided step-by-step state machine (`INITIALIZING` $\to$ `READY_FOR_SAMPLE` $\to$ `CAPTURING_SAMPLE` $\to$ `VALIDATING_SAMPLE` $\to$ `SAMPLE_ACCEPTED` $\to$ `NEXT_SAMPLE` $\to$ `SUCCESS`).
   - The UI does not instruct the patient on which angle to present (Straight $\to$ Slight Left $\to$ Slight Right $\to$ Slight Up $\to$ Slight Down).
   - There is no auto-capture countdown when a valid face angle is detected.
3. **Per-Sample Failure Handling:**
   - If sample 3 fails or quality drops, the user is not told why (e.g., "Too dark", "Too far away", "Please face camera").
   - If an error occurs, the component resets the entire array to `[]` instead of retrying the specific sample.
4. **Anthropometric CV Rigidity for Angled Faces:**
   - In `faceRecognitionEngine.ts`, `detectFaceWithAnthropometricCV` uses strict frontal face assumptions (both eyes visible and darker than forehead).
   - A relaxed, robust facial pose tolerance is required during multi-sample enrollment to accept slightly turned faces ($\pm 15^\circ$) while maintaining 100% false-positive rejection on walls/furniture.
5. **No Visual Progress or Audio Encouragement:**
   - The user gets no visual indicator (`● ○ ○ ○ ○`), no spoken instructions ("Great! Sample 1 saved. Now turn slightly to the left"), and no reassurance.

---

## 12. Files Requiring Changes

### A. Game Voice System
1. **[NEW] `src/lib/gameVoiceController.ts`**:
   - Central Game Voice Interaction Engine.
   - Manages STT lifecycle, listening states (`IDLE`, `PROMPTING`, `LISTENING`, `PROCESSING`, `RESPONDING`).
   - Handles game context (`gameId`, `category`, `level`, `question`, `options`, `expectedAnswer`, `expectedType`).
   - Context-aware semantic matching: numeric choices ("one", "two"), semantic terms ("the mango", "tea cup"), universal commands ("repeat", "hint", "skip", "pause", "stop", "easier", "harder").
   - Human-like companion voice feedback (warm praise, gentle encouragement, never shaming).
   - Records `GAME_VOICE_EVENT` telemetry for caregiver analytics.
2. **[NEW] `src/components/PatientPortal/CognitiveGames/GameVoiceOverlay.tsx`**:
   - Shared, reusable visual voice companion widget for cognitive games.
   - Displays gentle microphone state (`🎙 I'm listening...`, `🎙 Tap to answer`, audio pulsing ring, transcript pill).
   - Zero intrusive debug data.
3. **[MODIFY] `src/components/PatientPortal/CognitiveGames/CognitiveGameHub.tsx`**:
   - Wire `GameVoiceController` across all 30 games in the hub.
   - Dual voice + touch support: questions are read aloud, patient answers can be spoken or tapped.
   - Universal commands ("repeat", "hint", "skip", "stop") integrated.
4. **[MODIFY] Individual Game Components** (`MemoryMatchGame.tsx`, `AttentionFinderGame.tsx`, `PatternSequenceGame.tsx`, `RoutineSequencerGame.tsx`, `WordRecallGame.tsx`, `ObjectCategorySortGame.tsx`, `StoryRecallGame.tsx`, `RelaxationMusicGame.tsx`, `VisuospatialPuzzleGame.tsx`, `MotorCoordinationGame.tsx`):
   - Connect to `GameVoiceController` via a unified adapter so voice and touch work seamlessly in every game.
5. **[MODIFY] `src/lib/storage.ts` & `src/types.ts`**:
   - Add `GameVoiceEvent` model and extend `GameSessionResult` to track `voiceAnswersCount`, `touchAnswersCount`, `voiceInteractions`, `hintsRequestedViaVoice`.
6. **[MODIFY] Caregiver Analytics** (`CaregiverDashboard.tsx` / `CognitiveAnalyticsEngine.ts`):
   - Expose voice participation metrics and response channels (Voice vs Touch) to caregivers.

### B. Face Recognition & Enrollment System
1. **[MODIFY] `src/lib/faceRecognitionEngine.ts`**:
   - Implement multi-pose validation for the 5 enrollment directions (Straight, Slight Left, Slight Right, Slight Up, Slight Down).
   - Add explicit pose quality criteria and clear diagnostic validation messages.
   - Ensure clean state reset on camera stop / modal close.
2. **[MODIFY] `src/components/PatientPortal/CameraMoodCheckModal.tsx`**:
   - Implement explicit Enrollment State Machine (`INITIALIZING`, `CAMERA_READY`, `READY_FOR_SAMPLE`, `CAPTURING_SAMPLE`, `VALIDATING_SAMPLE`, `SAMPLE_ACCEPTED`, `SAMPLE_REJECTED`, `RETRY_REQUIRED`, `PROCESSING_ENROLLMENT`, `ENROLLMENT_SUCCESS`, `ENROLLMENT_FAILED`).
   - Guided 5-sample flow with step instructions, step counter, progress dots (`● ○ ○ ○ ○`), clear spoken and written guidance.
   - Sample retry without clearing previous successful samples.
   - Automatic steady-state capture with manual override.
   - Dedicated Developer Diagnostic Panel toggle (showing camera status, video dimensions, face detected, quality scores, embedding validity, sample status) strictly hidden from patients.
