# MIND MITHRA — Comprehensive Feature Audit Document
> **Platform Name:** MIND MITHRA (Cultural Cognitive Care & Reminiscence Platform)  
> **Document Status:** Comprehensive Pre-Implementation Repository Audit  
> **Evaluation Date:** September 2026  
> **Reference Input:** 21 Feature Concepts + Core Patient, Caregiver, Clinical, AI, Offline-First Requirements  

---

## 1. Executive Audit Overview

The existing repository is a high-performance **React 19 + TypeScript 5.8 + Vite 6 + Node.js/Express + Google GenAI SDK** application with built-in offline persistence (`localDB`), procedural Web Audio soundscape synthesis, camera-based facial expression analysis, speech recognition, and 30 cognitive game workout definitions.

### Audit Summary Statistics
- **Total Features Audited:** 50 Core & Reference Features
- **Existing + Working:** 16 Features (Preserved & Protected)
- **Existing + Partially Working:** 14 Features (To Complete & Enrich)
- **Existing + Broken / Inconsistent:** 4 Features (To Fix & Standardize)
- **Missing Features:** 16 Features (To Implement from the 21 Features Specification)
- **Naming Inconsistencies:** Multiple remnants of "MANAS" in server headers, storage keys, and logo component to be aligned strictly to **MIND MITHRA**.

---

## 2. Master Feature Audit Table

| Feature ID | Feature Name | Exists | Working | Partial | UI Only | Backend | DB | Offline | AI | Action & Implementation Target |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **F01** | **Memory Web** (Connected Personal Memory Graph: People ↔ Places ↔ Events ↔ Photos ↔ Music ↔ Stories ↔ Memories) | Yes | No | Yes | No | Partial | Yes | Yes | Partial | **COMPLETE IT**: Add explicit Graph Node-Link data structures, relational queries, and an interactive visual memory web linking people, places, events, and audio. |
| **F02** | **Language Bridge** (Multilingual: EN, HI, BN, TA, AS, MNI, KHA, LUS, GRT, TRP) | Yes | No | Yes | No | Partial | Yes | Yes | Yes | **COMPLETE IT**: Add Tamil (`ta`), Garo (`grt`), and Kokborok (`trp`) dictionaries, speech synthesis mappings, and dialect recognition. |
| **F03** | **Elder Knowledge** ("Teach Mind Mithra" - Traditional recipes, farming, folklore, crafts, cultural practices) | No | No | No | No | No | No | Yes | Yes | **IMPLEMENT IT**: Create "Teach Mind Mithra" capture module with voice/text/photo, auto-tagger, and cultural knowledge archive. |
| **F04** | **Familiar Route Memory** (Spatial routes: Home → Temple → Market → School with sequence recall, landmark recognition, consent-gated) | No | No | No | No | No | No | Yes | No | **IMPLEMENT IT**: Build Familiar Route Memory creator, landmark sequence recall exercise, and offline map storage with explicit consent. |
| **F05** | **Life-Skill Simulator** (Real-life interactive simulation: Assam chai making, cooking, gardening, shopping routines) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Elevate card-based sequencer into an interactive step-by-step simulator with ingredient manipulation and audio guidance. |
| **F06** | **Personal Soundscape** ("My Sounds": Family voice notes, rain, birds, market, temple bells, custom playlists) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Expand procedural flute/forest audio with personalized "My Sounds" soundboard, family recordings, and offline playlists. |
| **F07** | **Tell Me About Your Day** (Daily conversational voice journal, speech-to-text, date, non-diagnostic observations, editable/deletable) | No | No | No | No | Yes | No | Yes | Yes | **IMPLEMENT IT**: Build Daily Voice Journal conversation module with transcript review, correction, and journal history. |
| **F08** | **Story Builder** (Convert photo + voice + people + places + date into structured editable personal storybook) | Yes | No | Yes | Partial | Yes | Yes | Yes | Yes | **COMPLETE IT**: Create dedicated Story Builder wizard connecting memory elements into structured multimedia narrative books. |
| **F09** | **Reminiscence Theater** (Interactive memory scenes: "What happened next?", photo sequences, voice narration, personal questions) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Build Reminiscence Theater using verified family photos with branching sequence questions and gentle narration. |
| **F10** | **Memory-to-Game Generator** (AI generates cognitive activities from verified user memories: Who is this?, Where was the event?) | No | No | No | No | No | No | Yes | Yes | **IMPLEMENT IT**: Add `/api/ai/game-generator` endpoint with structured schema, verification validator, and client game renderer. |
| **F11** | **Dynamic Difficulty + Dynamic Theme** (DDA tracking latency, accuracy, fatigue + Theme adapting to family/music/places) | Yes | Yes | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Keep existing DDA algorithm; expand with hint/skip tracking and dynamic theme styling across game components. |
| **F12** | **Memory Confidence Map** (Personalized confidence map: Family, Old Places, Music, Tasks, Routines, People, Events) | No | No | No | No | No | No | Yes | No | **IMPLEMENT IT**: Implement Confidence Map engine in storage, tracking domain scores and rendering interactive radar/confidence map. |
| **F13** | **Gentle Evening Mode** (Calming evening mode: softer warm palette, reduced motion, shorter sessions, relaxing audio, sundowning care) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Build global Evening Mode toggle & auto-sunset activator with muted palette (#FFFDF7, sage/peach/gold), reduced motion, and calming cues. |
| **F14** | **Family Contribution Mode** (Family members upload photos, voice notes, songs, stories with role authentication & permissions) | Yes | No | Yes | No | Yes | Yes | Yes | No | **COMPLETE IT**: Add family contributor workflow with caregiver verification toggle, permissions, and contributor badges. |
| **F15** | **Memory Capsules** (Surprise memory gift packages scheduled by family: morning surprise, birthday, festival memory) | No | No | No | No | No | No | Yes | No | **IMPLEMENT IT**: Create Memory Capsule schema in storage, family scheduling interface, and patient surprise unboxing modal. |
| **F16** | **Memory Chain** (Guided memory questions: WHO? WHERE? WHEN? WHAT HAPPENED? HOW DID YOU FEEL? connecting memories) | No | No | No | No | No | No | Yes | Yes | **IMPLEMENT IT**: Create 5-question Memory Chain wizard that links memories into thematic chains. |
| **F17** | **Today's Why** (Simple explanation of WHY an activity is shown for both patient and caregiver) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Add dedicated "Today's Why" modal and contextual reasoning chips to patient activities and caregiver copilot. |
| **F18** | **Voice-to-Action** (Natural voice commands: "Show my memories", "Play daughter's voice", "Start game", "Call son", "Help me") | Yes | No | Yes | No | Yes | Yes | Yes | Yes | **COMPLETE IT**: Expand intent parser with all core navigation/action intents, family voice trigger, and SOS dispatch. |
| **F19** | **Emotional Preference Memory** (Learn user preferences: liked photos, music, dislikes for difficulty/noise; user/caregiver control) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Implement Preference Learning engine tracking activity engagement and updating patient profile. |
| **F20** | **Family Memory Collaboration** (Multi-member family contribution: Daughter, Son, Grandchild with attribution and permissions) | Yes | No | Yes | No | No | Yes | Yes | No | **COMPLETE IT**: Enable multi-contributor attribution, contributor badges, and permission-based memory editing. |
| **F21** | **Teach My Family** (Patient records traditional recipes, family history, cultural practices for future generations) | No | No | No | No | No | No | Yes | No | **IMPLEMENT IT**: Create "Teach My Family" recorder (voice/text/photo) and generational cultural memory archive. |
| **F22** | **Patient Portal Experience** (Home, Games, Memories, Family, Voice, Reminders, Help with elderly design) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Clean, intuitive elderly interface; enrich with unified warm palette (#FFFDF7, deep sage, memory peach, muted gold). |
| **F23** | **10 Cognitive Domains Engine** (Memory, Attention, Concentration, Pattern, Object, Recall, Routine, Sequencing, Orientation, Problem Solving) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: 30 catalog workouts cover all domains; ensure each workout links cleanly to DDA and memory graph. |
| **F24** | **Caregiver Telemetry Dashboard** (7-day accuracy, adherence bar chart, latency trend, fatigue index, session logs) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Recharts visualizations, patient selector, alert management, and caregiver preferences are solid. |
| **F25** | **Clinical Copilot & MMSE Staging** (Longitudinal trends, MMSE/MoCA scores, 1-click clinical report export) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Clinical report modal and MMSE/MoCA extraction work; verify non-diagnostic clinical labeling everywhere. |
| **F26** | **Medical Report & Prescription NER** (Upload prescription/report, extract meds, dosage, precautions, auto-create reminders) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Gemini multimodal extraction + offline fallback parser with one-click schedule application. |
| **F27** | **Camera Mood & Face AI Check** (Face presence check, smile/eye/brow detection, mood classification, soothing audio response) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: On-device HTML5 canvas analysis + Gemini Vision cascade + offline heuristic classifier. |
| **F28** | **Voice Assistant & Dialect Companion** (Turn-taking conversational companion, TTS, regional greetings) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT & ENHANCE**: Extend silence timeout from 1.4s to 2.2s+ for elderly speech support; integrate Gemini TTS. |
| **F29** | **Elderly Speech Accommodations** (Slow speech, trailing silence 2s+, repetition tolerance, dysarthria handling) | Yes | No | Yes | No | No | No | Yes | No | **FIX IT**: Increase silence debounce in `VoiceAssistantModal.tsx` from 1400ms to 2400ms; add continuous listening buffer. |
| **F30** | **Kinship Family Tree & Prosopagnosia Audio** (Generational badges, audio voice note playback on tap) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Excellent family tree view with audio playback of loved ones' voices. |
| **F31** | **Memory Vault & RAG Search** (Photo memories, captions, RAG semantic search over verified memories) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Working Gemini RAG and local keyword matching fallback. |
| **F32** | **Reminders & Medication Cueing** (Timed alarms, voice prompts, pill/hydration/routine tracking, status acknowledgment) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Comprehensive reminder view, countdown timers, and audible alerts. |
| **F33** | **Emergency SOS Alert & Siren** (1-Tap SOS button, 5-second cancel countdown, loud audible siren, caregiver dispatch) | Yes | Yes | No | No | Yes | Yes | Yes | No | **KEEP IT**: Emergency modal, siren sound generator, and alert enqueueing are functional. |
| **F34** | **Safe Haven Reassurance Modal** (4-7-8 breathing pacer, reassuring voice, home location grounding) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Reassurance pacer mitigating sundowning confusion and anxiety. |
| **F35** | **Reminiscence Radio & Regional Soundscapes** (Procedural bamboo flute, pine forest, river ripples + 5 folk tracks) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Web Audio procedural synthesis and regional folk songs. |
| **F36** | **Offline-First Storage Engine** (LocalStorage + localDB engine, event FIFO queue, state persistence) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Reliable client-side storage engine covering all entities. |
| **F37** | **Optimistic Synchronization Reconciler** (`/api/sync/events`, online listener, retry, zero data loss) | Yes | Yes | No | No | Yes | Yes | Yes | No | **KEEP IT**: Online heartbeat triggers sync; mark events as synced. |
| **F38** | **Backend Express API Gateway** (`server.ts`: Health, Memories, Chat, Speak, RAG, Vision, Copilot, Mood, Medical NER, Sync) | Yes | Yes | No | No | Yes | Yes | N/A | Yes | **KEEP IT & EXTEND**: Add `/api/ai/game-generator`, `/api/ai/story-builder`, `/api/ai/clinical-report`, and update branding from MANAS to MIND MITHRA. |
| **F39** | **Gemini Model Cascade** (Gemini 2.5 Flash → 2.5 Flash-Lite → 2.0 Flash → Heuristic offline fallbacks) | Yes | Yes | No | No | Yes | N/A | Yes | Yes | **KEEP IT**: Resilient multi-model cascade with 429/503 automatic fallback. |
| **F40** | **Branding Consistency** (Product Name: MIND MITHRA everywhere; remove MANAS/Smriti traces) | Yes | No | Broken | Yes | Broken | Broken | Broken | Broken | **FIX IT**: Align server logs, storage keys, component names, logo identifiers, and API health responses strictly to **MIND MITHRA**. |
| **F41** | **Design System & Color Tokens** (Background: #FFFDF7, Sage: #58745A/#789477, Peach: #C66F4E, Gold: #B28A32, Card: #F8EBD8) | Yes | No | Partial | No | No | No | Yes | No | **COMPLETE IT**: Incorporate the explicit design palette tokens into Tailwind CSS and app surfaces. |
| **F42** | **Accessibility (a11y)** (Font scaling: Normal/Large/Extra Large, High Contrast toggle, screen reader aria-labels, touch targets) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT & ENHANCE**: Settings modal handles font sizing and contrast; verify all buttons meet 48px+ touch targets. |
| **F43** | **Daily Memory Journey Flow** (Morning reminder → Memory prompt → Cognitive activity → Family memory → Voice chat → Journal) | No | No | No | No | No | No | Yes | Yes | **IMPLEMENT IT**: Create optional sequential Daily Memory Journey guided walkthrough stepper on patient home. |
| **F44** | **Demo Mode & Walkthrough Guide** (12-step guided demo mode bar, sample patients: Ravi, Maya, Biren) | Yes | Yes | No | No | No | Yes | Yes | No | **KEEP IT**: Interactive walkthrough bar switches roles and network states for hackathon demo. |
| **F45** | **PWA Configuration & Service Worker** (`manifest.json`, standalone display, mobile meta tags) | Yes | No | Partial | No | No | No | Partial | No | **COMPLETE IT**: Register Service Worker caching static assets for 100% offline shell loading. |
| **F46** | **Security & Privacy Governance** (No raw camera/audio streaming, local canvas processing, consent toggles, no secrets committed) | Yes | Yes | No | No | Yes | Yes | Yes | No | **KEEP IT**: Local snapshotting, strict client-side data sovereignty, zero external trackers. |
| **F47** | **Clinical Safety Disclaimers** (Explicit non-diagnostic disclaimer on all AI observations and caregiver screens) | Yes | Yes | No | No | Yes | Yes | Yes | Yes | **KEEP IT**: Safety invariants enforced in code (`isClinicalDiagnosis: false`). |
| **F48** | **DOCX Clinical Summary Generator** (`scripts/generate_docx_report.ts`) | Yes | Yes | No | No | No | No | Yes | No | **KEEP IT**: Standalone script generating professional docx clinical telemetry reports. |
| **F49** | **Environment Configuration** (`.env.example`, `dotenv`) | Yes | Yes | No | No | Yes | N/A | N/A | N/A | **KEEP IT**: `.env.example` documents `GEMINI_API_KEY` and `APP_URL`. |
| **F50** | **Comprehensive Testing Suite** (Unit/Integration verification scripts for offline, DDA, sync, voice, and RAG) | No | No | No | No | No | No | N/A | N/A | **IMPLEMENT IT**: Add automated verification test script validating DDA progression, offline storage, sync, and intent parsing. |

---

## 3. Preservation & Action Guidelines

1. **Working Features Preserved:**  
   - 30 Cognitive Games Catalog & DDA Engine (`cognitiveGamesCatalog.ts`, `adaptiveEngine.ts`).
   - Facial Mood Detection Modal (`CameraMoodCheckModal.tsx`) with HTML5 Canvas landmarks.
   - Kinship Family Tree (`FamilyTreeView.tsx`) with loved ones' audio notes.
   - Caregiver Telemetry Dashboard (`CaregiverDashboard.tsx`) with Recharts graphs.
   - Emergency SOS Alert & Siren (`SOSAlertModal.tsx`).
   - Safe Haven Reassurance (`SafeHavenReassuranceModal.tsx`).
   - Procedural Web Audio Soundscapes (`soundscapeEngine.ts`).
   - Offline LocalDB Storage & Optimistic Sync Queue (`storage.ts`).
   - Medical Report & Prescription Extraction (`CaregiverMedicalReportUpload.tsx`, `/api/ai/extract-medical-report`).

2. **Actions to Execute:**
   - **Fix Naming & Branding:** Standardize all references to **MIND MITHRA**.
   - **Enrich Multilingual Bridge:** Add Tamil, Garo, and Kokborok dictionaries.
   - **Extend Voice Intent & Silence:** Increase trailing silence to 2.4s for elderly speech; expand voice commands.
   - **Implement the 21 Ideas from Reference:** Build Memory Web, Route Memory, Life-Skill Simulator, Daily Journal, Story Builder, Reminiscence Theater, Memory-to-Game Generator, Memory Capsules, Memory Chain, Today's Why, Confidence Map, Evening Mode, and Elder Knowledge Archive.
   - **Implement Service Worker:** Enable full PWA offline shell caching.
   - **Implement Testing Suite:** Automated test scripts verifying end-to-end functionality.
