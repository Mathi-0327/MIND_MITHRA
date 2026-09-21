# MIND MITHRA — CRITICAL AI AUDIT REPORT
**Project Name:** MIND MITHRA  
**Audit Date:** September 21, 2026  
**Auditor:** DeepMind Antigravity AI Engineering  
**Focus Areas:** Face Recognition Pipeline & Voice NLP / Contextual Response Engine

---

## Executive Summary
An exhaustive audit of the Mind Mithra codebase was conducted to trace the root causes of the two critical issues:
1. **Face Recognition Inaccuracy:** The system displays approximately ~98% match whether a human face is present or the camera is pointed at an empty room, wall, or object.
2. **Voice NLP & Response Failure:** Speech-to-text accurately captures elderly patient speech (e.g., *"I am lonely today"*), but the conversational engine replies with identical canned responses (e.g., *"Hello dear Ravi! It is wonderful to hear from you. I am right here by your side. How are you feeling today?"*).

Below is the complete architectural audit, identified root causes, and technical corrections.

---

## 1. Current Face Pipeline Execution Path
- **Entry Point:** `src/components/PatientPortal/CameraMoodCheckModal.tsx`.
- **Trigger:** Initiated automatically on patient login (`settings.autoCameraMoodCheck: true` in `storage.ts`) or when manually invoked from the Patient Portal header / quick actions.
- **Hardware Capture:** Acquires webcam stream via `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })`.
- **Canvas Processing:** Every 250ms (`setInterval`), the active video frame is painted onto an offscreen canvas (`analysisCanvasRef`, 160x120 px).
- **Pixel Loop:** A sampling loop extracts pixels from the center bounding box (x: 20%-80%, y: 15%-85%). It accumulates:
  - Total luminance: `0.299 * r + 0.587 * g + 0.114 * b`
  - Skin chromaticity: `r > 45 && g > 25 && b > 15 && r >= g && (r - b) >= 8`
  - Standard deviation of luminance.
- **Decision Logic:**
  - If `avgBrightness < 8`: Displays `"Camera is too dark"`.
  - If `avgBrightness > 252`: Displays `"Camera is overexposed"`.
  - **Else (Any normal lighting condition, including walls, beds, and chairs):**
    - Sets `facePresenceStatus = 'CONFIRMED'`.
    - Computes confidence: `Math.min(98, Math.max(88, Math.round(84 + Math.min(skinRatio * 30, 10) + (stdDev / 3))))`.
    - Updates UI with `"Patient Face Detected (${computedConf}% Match)"`.
    - Triggers auto-countdown (2s) to capture and classify mood.

---

## 2. Current Face Recognition Algorithm
- **Actual Reality:** There is **NO face recognition or face detection algorithm** currently executed.
- No facial landmark detection, no Haar cascade, no DNN/SSD, no MediaPipe/TensorFlow model, and no native `window.FaceDetector` is invoked.
- The pipeline confuses simple room illumination and random color variation with facial presence and biometric identity verification.

---

## 3. Current Threshold
- **Current Hardcoded Bounds:** Clamped between `88%` and `98%` via `Math.min(98, Math.max(88, ...))`.
- There is no configurable `FACE_MATCH_THRESHOLD`. Because `Math.max(88, ...)` is enforced, any non-pitch-black frame scores at least 88%, and with standard indoor variance quickly hits 94%–98%.

---

## 4. Current Embedding Generation
- **Current Reality:** **None.** No 128-d / 512-d biometric descriptor or facial embedding vector is extracted or normalized.

---

## 5. Current Enrollment Mechanism
- **Current Reality:** **None.** Patient registration in `RegisterPatientModal.tsx` collects demographics, medical summary, and an avatar photo URL, but does not enroll or store reference facial feature vectors.

---

## 6. Current Voice Pipeline Execution Path
- **Audio Capture & STT:** `VoiceAssistantModal.tsx` starts `SpeechRecognition` / `webkitSpeechRecognition` with locale mapping (`as-IN`, `bn-IN`, `hi-IN`, `ta-IN`, `en-IN`).
- **Turn-Taking State Machine:** `IDLE -> LISTENING -> PROCESSING -> SPEAKING`.
- **Debouncing:** 2400ms of silence calls `handleCompleteSpeechAndProcess(text)`.
- **Orchestration:** `aiOrchestrator.processUserInput(inputText, options)`:
  1. Anaphora / Pronoun Resolution (`resolvePronouns`).
  2. Context Assembly (`buildControlledContext`).
  3. Intent Classification (`classifyIntent` in `intentClassifier.ts`).
  4. Explicit Mood check (`checkAndLogExplicitMood`).
  5. Emergency SOS check (`EMERGENCY` intent bypass).
  6. Clarification check (`requiresClarification`).
  7. Cloud Call: `fetch('/api/ai/companion-chat', { message, patientName, language, conversationHistory, context, intentClassification })`.
  8. If response ok, takes `data.reply`; if offline/failure, invokes `generateOfflineWarmResponse(intentResult, context)`.
  9. Audio Synthesis: Gemini TTS preview or Web Speech API `window.speechSynthesis`.

---

## 7. Current NLP Mechanism
- `intentClassifier.ts` implements rule-based regex patterns and keyword matching across predefined intents (`EMERGENCY`, `HELP`, `USER_FEELING_TIRED`, `USER_FEELING_HAPPY`, `USER_FEELING_SAD`, `HOW_ARE_YOU`, `GENERAL_GREETING`, `SHOW_MEMORIES`, `START_GAME`, etc.).
- Default fallback for natural speech is `GENERAL_CONVERSATION` (confidence: 0.88).
- Semantic state (e.g. `LONELY`, `TIRED`, `HUNGRY`, `HAPPY`) is only partially mapped and does not support dynamic structured conversational responses when cloud AI is unreachable or in fallback.

---

## 8. Current AI Model & Configuration
- **Server:** Express backend (`server.ts`) initializes `@google/genai` with model cascade:
  1. `gemini-2.5-flash`
  2. `gemini-2.5-flash-lite`
  3. `gemini-2.0-flash`
  4. `gemini-3.7-flash`
- **Environment:** `.env` contains `GEMINI_API_KEY="MY_GEMINI_API_KEY"` (a mock placeholder string).
- **Behavior on API Failure:** In `server.ts` (lines 278–286), when `generateWithModelFallback` returns `null` (due to invalid API key or quota), it defaults to:
  ```typescript
  const reply = aiResult?.text || `Hello dear ${patientName}! It is wonderful to hear from you. I am right here by your side. How are you feeling today?`;
  ```

---

## 9. Current Response-Generation Mechanism
- When `server.ts` returns the default fallback string with `200 OK`, `aiOrchestrator.ts` uses `data.reply`.
- In addition, if `generateOfflineWarmResponse` is called, `GENERAL_CONVERSATION` falls through to line 615:
  ```typescript
  return `I am right here with you, dear ${name}. It is a pleasure to spend this peaceful moment together. What would you like to do or talk about?`;
  ```
- As a consequence, regardless of what the user says (*"I am lonely today"*, *"I had tea with my daughter"*, *"I went to the market"*), the user receives the exact same greeting or fallback!

---

## 10. Identified Bugs

| ID | Component | Description | Impact |
|---|---|---|---|
| **BUG-F1** | Face Detection | No face detection algorithm; pixel brightness variance is labeled "face detected". | Empty walls, chairs, beds trigger `facePresenceStatus: CONFIRMED`. |
| **BUG-F2** | Face Confidence | `Math.min(98, Math.max(88, ...))` hardcodes an 88%–98% range. | Camera displays "98% Match" even with zero human presence. |
| **BUG-F3** | Face Identity | Face detection is conflated with biometric identity verification. | Any object is verified as the enrolled patient. |
| **BUG-F4** | Face Embeddings | No feature embedding vector or Euclidean / Cosine similarity calculation. | Biometric matching is completely non-functional. |
| **BUG-F5** | Quality & Multi-Face | Lack of blur check, illumination bounds, head pose, or multi-face detection. | Poor frames and multiple persons in view are unchecked. |
| **BUG-F6** | Temporal Stability | Instant confirmation on single frame without multi-frame temporal consensus. | Flashes of light or shadows cause erratic confirmations. |
| **BUG-F7** | Diagnostics | No developer-only face diagnostics panel. | Developers cannot inspect detection vs similarity vs threshold. |
| **BUG-V1** | Voice NLP | Server returns static fallback string when Gemini API key is missing or fails. | Every voice transcript produces the same greeting. |
| **BUG-V2** | Semantic Parsing | Missing fine-grained semantic state extraction (`LONELY`, `MARKET`, `TIRED`, `HUNGRY`). | Nuanced emotional and conversational expressions are lost. |
| **BUG-V3** | Structured Output | LLM endpoint returns unstructured raw text rather than validated JSON schema. | Cannot reliably route mixed intent (state + action) or validate answers. |
| **BUG-V4** | Dynamic Fallback | `generateOfflineWarmResponse` relies on static string templates rather than transcript-aware conversational generation. | Offline/fallback responses are repetitive and ignore user entities. |
| **BUG-V5** | Caregiver Telemetry | Voice states are not systematically logged as structured observation events into the analytics engine. | Caregiver dashboard misses critical patient emotional state trends. |

---

## 11. Root Cause Summary
1. **Face Bug:** `CameraMoodCheckModal.tsx` substituted true computer vision with a heuristic based on RGB pixel variance and clamped the result to 88%–98%.
2. **Voice Bug:** When cloud API credentials are not set or calls fail, both `server.ts` and `aiOrchestrator.ts` returned static fallback greetings without analyzing the patient's actual transcript.

---

## 12. Proposed Correction Plan

### Phase 1: Robust Client-Side Face Pipeline (`src/lib/faceRecognitionEngine.ts`)
- Implement a true multi-stage Computer Vision & Biometric Pipeline:
  1. **Face Detection:** Detect real human faces using native `window.FaceDetector` API with fallback to multi-feature contour/landmark computer vision analysis (detecting eye-pair luminance contrast, nose bridge, mouth horizontal gradient, and facial oval aspect ratio).
  2. **No-Face Condition:** Explicitly enforce: if no face is detected, `faceDetected = false`, `identityVerified = false`, `confidence = 0`, `similarity = null`. The UI displays `"No face detected"`.
  3. **Face Quality Check:** Validate minimum face size (>15% frame area), blur score (Laplacian variance), illumination (neither <30 nor >225), and central alignment. If invalid, prompt: *"Please move closer"* or *"Please face the camera"*.
  4. **Multi-Face Handling:** Detect if face count > 1; if so, set state `MULTIPLE_FACES` and prompt *"Multiple faces detected. Please ensure only the patient is in view."*
  5. **Biometric Feature Extraction:** Extract normalized 64-d facial structural feature embedding vectors from aligned facial landmarks.
  6. **Face Enrollment:** Create multi-sample enrollment (capturing 5 distinct valid frames), storing averaged reference embeddings in `storage.ts`.
  7. **Identity Verification:** Compute Cosine Similarity between current frame embedding and enrolled patient embedding.
  8. **Threshold Validation:** Calibrate against `FACE_MATCH_THRESHOLD = 0.80`.
  9. **Temporal Stability Filter:** Require `TEMPORAL_WINDOW = 4` consecutive valid MATCH frames before transitioning to `VERIFIED`. If the patient turns away or leaves the frame, immediately revoke verification.
  10. **Developer Diagnostic HUD:** Create a dedicated diagnostic panel showing camera status, face detected (YES/NO), detection confidence, face count, quality metrics, embedding dimension, similarity score, threshold, temporal stability count (e.g., 4/4), and final verification status.

### Phase 2: Dynamic Voice NLP & Contextual Response Engine
- **Transcript as Source of Truth:** Pass the verified raw and resolved transcript to both the NLP analyzer and AI request.
- **Enhanced Intent & Semantic State Engine:**
  - Map explicit states: `LONELY`, `TIRED`, `HAPPY`, `CONFUSED`, `ANXIOUS`, `HUNGRY`, `PAIN`, `FAMILY_UPDATE`, `DAILY_ACTIVITY`.
  - Distinguish conversation vs command vs mixed intent (e.g., *"I'm lonely. Can you show me some family photos?"* -> state: `LONELY`, action: `NAVIGATE_MEMORIES`).
- **Structured LLM Output with Schema Validation:**
  - Update `server.ts` `/api/ai/companion-chat` to enforce a JSON schema:
    ```json
    {
      "intent": "USER_STATE_EXPRESSION",
      "confidence": 0.96,
      "state": "LONELY",
      "entities": {},
      "action": null,
      "response": "I am so sorry you are feeling lonely today..."
    }
    ```
- **Transcript-Aware Contextual Local Fallback Engine:**
  - Build a semantic response generator in `aiOrchestrator.ts` that dynamically responds to what the user said (never returning identical canned text):
    - *"I am lonely today"* -> Empathetic validation + gentle company + option for memory/radio.
    - *"I am happy today"* -> Celebrates their joy + suggests uplifting activity.
    - *"I am tired"* -> Encouraging rest + soothing flute soundscape.
    - *"I went to the market"* -> Conversational interest in their walk/fresh air.
    - *"My daughter called me"* -> Joyful reinforcement of family connection.
    - *"Make the game easier"* -> Acknowledges difficulty, sets Level 1.
- **Caregiver Analytics Connection:**
  - Emit `VOICE_EVENT` and `MOOD_EVENT` for every explicit state expression into `localDB.addMoodObservation` and `cognitiveAnalyticsEngine`.
- **Developer Voice Diagnostics Console:**
  - Expose live console showing transcript, resolved language, intent, state, confidence, action, latency, and provider.

---

## 13. Files To Be Modified / Created
1. `MIND_MITHRA_AI_AUDIT.md` (Created)
2. `src/lib/faceRecognitionEngine.ts` (New module implementing biometric pipeline)
3. `src/components/PatientPortal/CameraMoodCheckModal.tsx` (Integrating faceRecognitionEngine, removing fake 98% calculation, adding Developer Diagnostics HUD)
4. `src/types.ts` (Biometric types, FaceSessionState, Structured NLP output types)
5. `src/lib/storage.ts` (Biometric template storage, observation recording)
6. `src/lib/intentClassifier.ts` (Rich semantic state classification)
7. `src/lib/aiOrchestrator.ts` (Dynamic contextual generation, structured schema validation, telemetry)
8. `server.ts` (Structured JSON prompt & dynamic fallback)
9. `src/components/PatientPortal/VoiceAssistantModal.tsx` (Transcript logging, audio verification)
10. `src/lib/cognitiveAnalyticsEngine.ts` (Observation analysis)

---
*End of Audit Report.*
