# MIND MITHRA: AI Intelligence, Voice Architecture, Cognitive Adaptation & Analytics Implementation Plan

> **Document:** MIND_MITHRA_AI_IMPLEMENTATION_PLAN.md  
> **Platform Name:** MIND MITHRA (Cultural Cognitive Care & Reminiscence Platform)  
> **Implementation Date:** September 20, 2026  
> **Status:** Implementation Blueprint  

---

## 1. Architectural Architecture & Execution Strategy

### 1.1 The Two-Layer Conversational Intelligence Model

```
                          [USER SPEECH]
                               │
                               ▼
                        [STT & Language]
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               LAYER 1: INTENT & ACTION ENGINE                   │
│                                                                 │
│  Classifies into 35+ Intent Types:                              │
│  - Conversational: GENERAL_GREETING, HOW_ARE_YOU, THANK_YOU,    │
│    GOODBYE, CASUAL_QUESTION, USER_STATE_EXPRESSION              │
│  - Cognitive: START_GAME, SELECT_GAME, SELECT_GAME_LEVEL        │
│  - Memory: SHOW_MEMORIES, SEARCH_MEMORY, CREATE_MEMORY          │
│  - Family: SHOW_FAMILY, PLAY_FAMILY_VOICE, CALL_FAMILY_MEMBER   │
│  - Routines: SHOW_REMINDERS, MEDICATION_REMINDER                │
│  - Emergency: EMERGENCY, HELP, STOP, CANCEL, GO_HOME            │
│                                                                 │
│  Produces: { intent, confidence, language, entities, action }   │
│  - Confidence >= 0.70 -> Route to appropriate engine            │
│  - Confidence < 0.70  -> Generate clarifying question           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              ▼                                     ▼
     [APPLICATION COMMAND]               [CONVERSATIONAL DIALOGUE]
   Action: UI Route Navigation            Layer 2: AI Companion
   e.g. OPEN_MEMORIES, START_GAME                   │
              │                                     ▼
              │                  ┌─────────────────────────────────────┐
              │                  │ LAYER 2: CONTEXT-AWARE COMPANION    │
              │                  │                                     │
              │                  │ Controlled Context Injection:       │
              │                  │ - Rolling 5-turn Dialogue History   │
              │                  │ - Patient Profile (Name, Culture)   │
              │                  │ - Authorized Family Members         │
              │                  │ - Verified Recent Memories          │
              │                  │ - Current Screen / Active Game      │
              │                  │ - User Preferences (Tea, Flute)     │
              │                  │ - Emotional State Tracking          │
              │                  │                                     │
              │                  │ Empathetic Conversational Response  │
              │                  │ (No Canned/Static Fallbacks)        │
              │                  └──────────────────┬──────────────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
                     [Response Safety & Tone Check]
                                 │
                                 ▼
                    [Natural Speech Playback (TTS)]
```

---

## 2. Detailed Implementation Phases

### Phase 1: Core Type Definitions & Domain Extensions (`src/types.ts`)
- Add `MindMithraIntent` union covering all 35+ intent types.
- Define `IntentClassificationResult`:
  ```ts
  export interface IntentClassificationResult {
    intent: MindMithraIntent;
    confidence: number; // 0.0 - 1.0
    language: SupportedLanguage;
    entities: {
      personName?: string;
      relationship?: string;
      gameId?: string;
      gameCategory?: GameCategory;
      level?: number;
      timeOfDay?: string;
      sentiment?: 'TIRED' | 'HAPPY' | 'CONFUSED' | 'SAD' | 'CALM' | 'ANXIOUS';
      queryTopic?: string;
    };
    action: IntentAction | null;
    requiresClarification: boolean;
    clarificationPrompt?: string;
    isMixedIntent: boolean;
  }
  ```
- Define `GameLevelSystem`:
  - `GameLevelConfig` (Level 1 to 5 parameters per game: questions, distractors, time limit, memory load, sequence length, hints, scoring threshold).
  - `CaregiverGameControl` (starting level, max level, locked status, paused status per game/domain).
- Define `MoodObservationRecord`:
  - State, confidence, source (`USER_EXPLICIT` | `CAMERA_HEURISTIC` | `VOICE_ANALYSIS`), context, and timestamp.
- Define `CognitiveAnalyticsReport`:
  - Structured evidence-based metrics for 7-day, 30-day, or custom periods.

### Phase 2: High-Precision Intent Classifier (`src/lib/intentClassifier.ts`)
- Build an advanced two-tier classifier:
  1. Pattern & entity regex rules with scoring weights.
  2. Fallback to lightweight local semantic heuristics.
  3. Cloud classification support for ambiguous natural phrasing.
- Explicitly separate `GENERAL_GREETING` ("Hello", "Good morning"), `HOW_ARE_YOU` ("How are you?", "How are you doing today?"), and `USER_STATE_EXPRESSION` ("I'm tired", "I feel confused").
- Prevent normal conversation from ever accidentally triggering application commands.
- If confidence is below `0.70`, return a warm clarifying question instead of blindly navigating.

### Phase 3: Multi-Turn Conversational Memory & AI Orchestrator (`src/lib/aiOrchestrator.ts`)
- Central service responsible for:
  - Session conversation history buffer (rolling 5 turns).
  - Pronoun & anaphora resolution ("My daughter visited" -> "We had tea" -> resolves "we" to patient + daughter).
  - Controlled context assembler (patient name, cultural background, family members, recent memories, current screen, current game level, liked themes).
  - Guardrail validator: ensures responses are natural, empathetic, never hallucinate facts, and never generate medical diagnoses.
  - Recording user explicit mood statements to `LocalDB` automatically when detected.

### Phase 4: Backend Express Conversational Gateway Upgrade (`server.ts`)
- Upgrade `/api/ai/companion-chat` to accept:
  - `conversationHistory`: Array of `{ sender: 'user' | 'companion', text: string }`.
  - `context`: `{ currentScreen, currentGame, currentLevel, familyRoster, recentMemories, preferredThemes, patientState }`.
  - `intent`: Classified intent and extracted entities.
- Construct rich, empathetic multi-turn Gemini prompts tailored to the elder's regional Indian culture.
- Provide a robust local conversational generator fallback when offline that generates natural, contextual multi-turn replies rather than fixed strings.

### Phase 5: VoiceAssistantModal Refactor & Two-Layer Integration
- Connect `VoiceAssistantModal.tsx` directly to `AIOrchestrator`.
- Handle conversation, commands, and mixed requests gracefully.
- Support real-time developer diagnostics HUD (toggleable with `Ctrl+Shift+D` or an discreet diagnostics icon).

### Phase 6: Universal 5-Level Game System (`src/lib/gameLevelSystem.ts`)
- Create `COGNITIVE_GAME_LEVELS_DB` specifying exact parameters for all 30 cognitive games from Level 1 to Level 5.
- Update `CognitiveGameHub.tsx` to read dynamic level parameters (number of cards/questions, distractors, timer, hints) from this configuration rather than hard-coding.

### Phase 7: Caregiver Game Level Control & Override Interface
- Add a dedicated **Game Difficulty & Level Control Table** in `CaregiverDashboard.tsx`:
  - View all 30 games and their cognitive domains.
  - Configure starting level (1-5) and maximum allowed level (1-5).
  - Lock level toggle to prevent auto-advancement if the elder needs a stable comfort zone.
  - Pause game toggle.
  - Accept / Reject DDA recommendation cards.

### Phase 8: Central Deterministic Cognitive Analytics Engine (`src/lib/cognitiveAnalyticsEngine.ts`)
- Implements 100% deterministic mathematical calculations:
  - Domain accuracy, average response latency, completion rate, skip rate.
  - Longitudinal comparisons (Today vs 7-day vs 30-day).
  - Reminder adherence percentages and response times.
  - Mood observation distribution with source tracking (`USER_EXPLICIT` vs `CAMERA_HEURISTIC`).
  - Evidence-based statements linking directly to underlying session IDs.

### Phase 9: Evidence-Based AI Caregiver Reporting
- Update `/api/ai/clinical-report` to ingest the structured output of `CognitiveAnalyticsEngine`.
- Enforce strict non-diagnostic, observational clinical reporting format.
- Output validated structured JSON containing activity summaries, domain performances, level progressions, adherence, mood observations, and caregiver suggestions.

### Phase 10: Automated Test Suite & Multi-Scenario End-to-End Verification
- Create `scripts/verify_ai_system.ts` running all required test scenarios:
  1. Conversational Understanding ("Hi, how are you?", "Good morning", "I went to the market", "I'm feeling tired", "My daughter called me").
  2. Application Commands ("Show my memories", "Play my daughter's voice", "Let's play a game").
  3. Mixed Intent Handling ("I'm feeling tired. Can we look at old family photos?").
  4. Conversational Context & Anaphora Resolution ("My daughter visited me" -> "We had tea").
  5. Low-Confidence Clarification Prompts.
  6. Game Level System (Levels 1 to 5 configuration across all games).
  7. Caregiver Level Override & Lock Enforcement.
  8. Deterministic Analytics Engine Calculations vs Database Records.
  9. Evidence-Based Structured AI Reporting.
  10. Offline Fallback & Reconnection Synchronization.
