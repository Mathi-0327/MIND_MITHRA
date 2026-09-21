# MIND MITHRA (மைண்ட் மித்ரா / মাইন মিত্ৰা)
## Complete Technical Architecture, AI Models, Mathematical Algorithms & System Specification

**Version:** 3.2.0 Production Ready  
**Date:** September 2026  
**Classification:** Medical & Geriatric AI Technical Blueprint  
**Target Environment:** Offline-First Progressive Web App (PWA) + Edge Node.js Server + SQLite WAL + Google Gemini GenAI Orchestration

---

## 1. Executive Summary & Platform Overview

**Mind Mithra** is a state-of-the-art, culturally grounded artificial intelligence platform engineered for **elderly cognitive rehabilitation, dementia & Mild Cognitive Impairment (MCI) support, cultural reminiscence therapy, and caregiver telemetry**. 

Designed specifically for multi-lingual and culturally diverse demographics (with deep North-East and pan-Indian regional grounding including Assamese, Bengali, Tamil, Meitei, Hindi, Khasi, Mizo, Garo, Tripuri, and English), Mind Mithra bridges non-pharmacological cognitive therapy with non-intrusive caregiver oversight.

### Core Architectural Pillars
1. **100% Offline-First Resilience**: All 30 cognitive games, acoustic soundscapes, face verification, and local heuristic engines operate flawlessly without active internet connectivity.
2. **Hybrid Neuro-Symbolic AI Pipeline**: Combines large generative models (Google Gemini 2.5 Flash) with deterministic clinical algorithms (Dynamic Difficulty Adjustment, Fatigue Detection, Reminiscence Graph Spreading Activation).
3. **Privacy-Preserving Edge Processing**: Biometric facial embeddings and audio telemetry are processed locally on the client device without sending raw video or audio streams to external clouds.
4. **Strict Role-Based Separation**: Dedicated high-contrast, large-typography Elder Interface completely isolated from the multi-patient Caregiver & Clinical Hub.

---

## 2. Multi-Tier System Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT LAYER (Browser / PWA)                           │
│                                                                                        │
│  ┌───────────────────────────────┐               ┌──────────────────────────────────┐  │
│  │     ELDER PATIENT PORTAL      │               │     CAREGIVER CLINICAL HUB       │  │
│  │  • Voice Companion           │               │  • Multi-Patient Registry (3+)   │  │
│  │  • Adaptive Cognitive Games   │               │  • Longitudinal MMSE/MoCA Trends │  │
│  │  • Reminiscence Media & Radio │               │  • DDA Level & Lock Controls     │  │
│  │  • 5-Pose Face Verification   │               │  • Sundowning Behavioral Radar   │  │
│  │  • SOS Emergency Contact      │               │  • Clinical PDF/CSV Export       │  │
│  └──────────────┬────────────────┘               └────────────────┬─────────────────┘  │
│                 │                                                 │                    │
│  ┌──────────────▼─────────────────────────────────────────────────▼─────────────────┐  │
│  │                             CLIENT-SIDE CORE ENGINES                             │  │
│  │  • FaceRecognitionEngine (Canvas/Embedding)   • GameLevelSystem (DDA Matrix)     │  │
│  │  • AudioService (SpeechSynthesis/Recognition) • SoundscapeEngine (Web Audio API) │  │
│  │  • AdaptiveEngine (Real-time Recommendation)  • MemoryWebEngine (Graph Recall)   │  │
│  │  • LocalStorageEngine (IndexedDB / LocalStore)• EventSyncEngine (Offline Queue)  │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │ HTTP / SSE / REST
┌─────────────────────────────────────────▼──────────────────────────────────────────────┐
│                                NODE.JS BACKEND SERVER                                  │
│                                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────┐  │
│  │    Authentication    │  │   AI Orchestrator Service    │  │   Telemetry Engine   │  │
│  │ • Session Cookies    │  │ • Context Assembler          │  │ • Event Queue Sync   │  │
│  │ • Bcrypt 12-Rounds   │  │ • Prompt Guardrails          │  │ • Longitudinal Agg   │  │
│  │ • RBAC Authorization │  │ • Fallback Cache             │  │ • Clinical Report Gen│  │
│  └──────────┬───────────┘  └──────────────┬───────────────┘  └──────────┬───────────┘  │
│             │                             │                             │              │
│  ┌──────────▼─────────────────────────────▼─────────────────────────────▼───────────┐  │
│  │                           SQLITE PRODUCTION DATABASE                              │  │
│  │  • WAL (Write-Ahead Logging) Mode • Relational Foreign Keys • Zero Data Leakage   │  │
│  │  • Users • Patient Profiles • Caregiver Relationships • Game Telemetry Logs       │  │
│  └────────────────────────────────────────┬──────────────────────────────────────────┘  │
└───────────────────────────────────────────┼─────────────────────────────────────────────┘
                                            │ Secure External APIs
┌───────────────────────────────────────────▼─────────────────────────────────────────────┐
│                           EXTERNAL AI & LLM INFRASTRUCTURE                             │
│                                                                                        │
│  ┌─────────────────────────────────┐           ┌─────────────────────────────────────┐ │
│  │   Google Gemini 2.5 Flash API   │           │    Web Speech & Synthesizer APIs    │ │
│  │ • Reminiscence Narrative Gen    │           │ • Multi-Dialect Neural Voices       │ │
│  │ • Behavioral Sentiment Analysis │           │ • Non-Shaming Conversational Audio  │ │
│  └─────────────────────────────────┘           └─────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Artificial Intelligence Models & Orchestration

### 3.1 Primary Language & Vision Models
1. **Google Gemini 2.5 Flash (`gemini-2.5-flash`)**:
   - **Role**: Conversational empathy agent, reminiscence narrative generator, caregiver clinical insight summarization, non-shaming error explanations during cognitive gameplay.
   - **Configuration**: `temperature: 0.7`, `top_p: 0.9`, `max_output_tokens: 350` (optimized for concise, elderly-friendly conversational turns).
2. **Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite`)**:
   - **Role**: High-speed real-time fallback for offline-to-online transitions and fast sentiment scoring.
3. **Local Neuro-Symbolic Heuristic Model (Edge Fallback)**:
   - **Role**: Guarantees instant zero-latency responses even in 100% offline environments (e.g. remote tea garden estates in Assam or rural hill areas in Meghalaya).

### 3.2 AI Orchestrator Architecture (`aiOrchestrator.ts`)
The AI Orchestrator is designed with a **fail-safe tri-tier execution model**:
1. **Tier 1 (Cloud LLM)**: Attempts Google Gemini API with system instructions enforcing cultural context, dialect phrasing, and non-shaming tone.
2. **Tier 2 (Contextual Grammar Synthesizer)**: If API is unavailable or latency exceeds 3000ms, synthesizes localized responses using deterministic cultural templates and the elder’s Memory Graph.
3. **Tier 3 (Local Audio Script)**: Immediate acoustic chime with pre-rendered speech prompt.

```typescript
// System Guardrail Prompt Structure
export const ELDER_COMPANION_SYSTEM_PROMPT = `
You are Mind Mithra (மயிண்ட் மித்ரா / মাইন মিত্ৰা), a warm, loving, and culturally grounded companion for an Indian elder.
Guidelines:
1. Always speak with deep respect, patience, and warmth (using familial honorifics like Dada, Dadi, Uncle, Auntie, Paati, Thatha).
2. Never shame, criticize, or announce memory failure. Celebrate all effort.
3. Incorporate regional touches (tea gardens, Bihu, Majuli masks, courtyard conversations, filter coffee, Meghalaya pine hills).
4. Keep sentences under 15 words. Speak clearly and soothingly.
5. If sundowning agitation is detected, redirect gently to peaceful memories or acoustic flute music.
`;
```

---

## 4. Mathematical Algorithms & Engineering Specifications

### 4.1 Dynamic Difficulty Adjustment (DDA) Algorithm
The DDA engine dynamically calibrates game complexity across 5 discrete tiers ($L_1$ to $L_5$) without causing cognitive frustration or under-stimulation.

#### Mathematical Formulation:
Let a gameplay session $S$ have:
- Accuracy: $A \in [0, 100]$
- Response Time: $T_{resp}$ (in milliseconds)
- Baseline Response Time Benchmark: $T_{base}$
- Consecutive Success Streak: $K_{succ}$
- Consecutive Error Streak: $K_{err}$
- Caregiver Hard Lock Level: $L_{max}$

The **Cognitive Performance Index ($CPI$)** is defined as:
$$CPI = \left( 0.65 \cdot \frac{A}{100} \right) + \left( 0.35 \cdot \max\left(0, 1 - \frac{T_{resp} - T_{base}}{2 \cdot T_{base}}\right) \right)$$

The level transition function $\Delta L$ is computed:
$$\Delta L = \begin{cases} 
+1 & \text{if } CPI \ge 0.85 \text{ and } K_{succ} \ge 3 \text{ and } L_{current} < L_{max} \\
-1 & \text{if } CPI < 0.45 \text{ or } K_{err} \ge 2 \\
0 & \text{otherwise (maintained for stability)}
\end{cases}$$

#### Caregiver Safety Floor:
$$L_{next} = \min(L_{max}, \max(1, L_{current} + \Delta L))$$

---

### 4.2 Cognitive Fatigue & Sundowning Prediction Algorithm
To prevent sundowning confusion (which typically accelerates between 4:30 PM and 7:30 PM), the fatigue engine calculates an hourly risk score:

$$F_{score}(t) = W_{circadian}(t) \cdot \left[ 0.4 \cdot N_{sessions} + 0.35 \cdot \bar{T}_{resp\_drift} + 0.25 \cdot E_{rate} \right]$$

Where:
- $W_{circadian}(t) = 1.8$ if $t \in [16:30, 19:30]$, else $1.0$
- $\bar{T}_{resp\_drift} = \frac{T_{resp\_recent} - T_{resp\_morning}}{T_{resp\_morning}}$
- $E_{rate} =$ Error rate during last 3 sessions.

**Trigger Action**: If $F_{score} \ge 75$, Mind Mithra automatically suggests **"Gentle Flute Breathing"** or **"Courtyard Reminiscence Radio"** and notifies the Caregiver Hub.

---

### 4.3 5-Pose Biometric Face Verification & Anti-Spoofing
Mind Mithra implements a non-intrusive 5-pose face verification algorithm running directly on HTML5 Canvas:

```
    [ Pose 1: Center Front ] ──► [ Pose 2: Gentle Smile ]
                                         │
    [ Pose 5: Upward Nod ]   ◄── [ Pose 4: Turn Left ] ◄── [ Pose 3: Turn Right ]
```

#### Feature Vector Distance Calculation:
Given enrolled biometric vector $\vec{V}_{enrolled}$ and live capture vector $\vec{V}_{live}$:

$$D_{euclidean} = \sqrt{\sum_{i=1}^{128} (V_{enrolled, i} - V_{live, i})^2}$$

$$\text{Confidence Score } C = \max\left(0, \left(1 - \frac{D_{euclidean}}{\theta_{threshold}}\right) \times 100\right)$$

- **Threshold $\theta_{threshold}$**: $0.42$ (calibrated for elderly facial texture changes while rejecting spoof photos).
- **Liveness Guarantee**: Multi-frame optical flow verifies micro-movement across the 5 continuous poses.

---

### 4.4 Reminiscence Semantic Graph & Spreading Activation
Family memories, photos, voice notes, and cultural artifacts are modeled as an undirected weighted semantic graph $G = (V, E, W)$.

#### Node Activation Spreading Formula:
When an elder interacts with a memory node $v_i$ (e.g. *"Granddaughter Ananya"*), activation energy spreads to adjacent nodes $v_j$ (e.g. *"Majuli Folk Song"*, *"Morning Tea Ritual"*):

$$A_j(t+1) = (1 - \delta) \cdot A_j(t) + \sum_{v_i \in N(v_j)} A_i(t) \cdot W_{ij} \cdot \gamma$$

Where:
- $\delta = 0.15$ (decay factor over time)
- $\gamma = 0.75$ (spreading coefficient)
- $W_{ij} \in [0, 1]$ (cultural & family relationship strength)

This allows Mithra to organically suggest connected family memories that trigger joy and neural association.

---

## 5. Comprehensive Cognitive Games & Activity Matrix

Mind Mithra features **30 adaptive activities spanning 10 clinical domains**:

| # | Clinical Domain | Activity Name | Cognitive Mechanism | Difficulty Range |
|---|---|---|---|---|
| 1 | **Memory** | Heritage Card Match | Visual working memory & spatial location | Levels 1–5 |
| 2 | **Memory** | Cherished Face Recall | Facial recognition & family connection | Levels 1–5 |
| 3 | **Memory** | Daily Item Recall | Short-term categorical object retention | Levels 1–5 |
| 4 | **Attention** | Wildlife Spotlight | Selective visual focus & distractor filtering | Levels 1–5 |
| 5 | **Attention** | Tea Garden Harvest | Rapid visual search & sustained target tracking | Levels 1–5 |
| 6 | **Attention** | Sound Frequency Match | Auditory discrimination & tone memory | Levels 1–5 |
| 7 | **Routine** | Morning Tea Ritual | Step-by-step procedural sequence autonomy | Levels 1–5 |
| 8 | **Routine** | Daily Medication Clock | Temporal awareness & pill sorting | Levels 1–5 |
| 9 | **Routine** | Garden Plant Watering | Daily living skill simulation & task completion | Levels 1–5 |
| 10 | **Routine** | Courtyard Door Latching | Home safety sequence reinforcement | Levels 1–5 |
| 11 | **Routine** | Evening Lamp Lighting | Cultural time-of-day sequence anchoring | Levels 1–5 |
| 12 | **Language** | Proverb Completion | Long-term semantic retrieval & phrase syntax | Levels 1–5 |
| 13 | **Language** | Rhyme & Folk Verse | Phonemic awareness & rhythmic verbal recall | Levels 1–5 |
| 14 | **Language** | Object Naming | Confrontation naming & vocabulary preservation | Levels 1–5 |
| 15 | **Language** | Story Fill-in | Narrative coherence & contextual comprehension | Levels 1–5 |
| 16 | **Pattern** | Motif Weaver | Geometric symmetry & textile sequence logic | Levels 1–5 |
| 17 | **Pattern** | Rangoli Tile Assembly | Spatial pattern rotation & visual symmetry | Levels 1–5 |
| 18 | **Spatial** | Market Vegetable Sorter | Multi-attribute categorical categorization | Levels 1–5 |
| 19 | **Spatial** | Kitchen Spice Organizer | Culinary spatial memory & jar recognition | Levels 1–5 |
| 20 | **Spatial** | Village Route Pathfinder | Topological wayfinding & landmark recognition | Levels 1–5 |
| 21 | **Spatial** | Wardrobe Color Sort | Color discrimination & categorical organization | Levels 1–5 |
| 22 | **Puzzles** | Majuli Mask Assembly | Jigsaw spatial integration & part-whole reasoning | Levels 1–5 |
| 23 | **Puzzles** | Clay Pottery Mender | Shape matching & boundary contour completion | Levels 1–5 |
| 24 | **Puzzles** | Bamboo Craft Slicer | Fractional spatial reasoning & piece alignment | Levels 1–5 |
| 25 | **Motor** | Falling Leaf Catcher | Hand-eye coordination & visual-motor timing | Levels 1–5 |
| 26 | **Motor** | Folk Drum Rhythm Tap | Auditory-motor synchronization & tempo keeping | Levels 1–5 |
| 27 | **Relaxation**| Flute Breath Pacer | Parasympathetic tone modulation & slow breathing | Levels 1–5 |
| 28 | **Relaxation**| Brahmaputra River Waves | Binaural acoustic calming & sundowning relief | Levels 1–5 |
| 29 | **Relaxation**| Forest Birds Chorus | Sensory tranquility & restorative attention | Levels 1–5 |
| 30 | **Story** | Family Photo Storyteller | Autobiographical memory & episodic narrative | Levels 1–5 |

---

## 6. Caregiver Clinical Hub & Telemetry

### 6.1 Clinical Metrics Tracked
- **MMSE (Mini-Mental State Exam) Estimation**: Longitudinal tracking on a standardized 30-point scale.
- **MoCA (Montreal Cognitive Assessment) Domain Breakdown**:
  - Memory & Delayed Recall ($/5$)
  - Visuospatial & Executive ($/5$)
  - Attention & Working Memory ($/6$)
  - Language & Fluency ($/3$)
  - Orientation & Temporal Routine ($/6$)
- **Reaction Time Drift**: Rolling mean and variance of response times (milliseconds).
- **Adherence & Autonomy Ratio**: Percentage of routine tasks completed independently.

### 6.2 Multi-Patient Telemetry Architecture
Caregivers oversee multiple registered patients (*Ravi Kumar, Maya Devi, Biren Barua*) with independent telemetry streams, difficulty caps, and automated clinical summaries.

---

## 7. Database Schema & Persistence Specification

### Database Engine: SQLite with WAL Mode (`better-sqlite3`)
- **Location**: `mind_mithra.db`
- **Concurrency**: Write-Ahead Logging allows non-blocking simultaneous reads and writes.

```sql
-- Core Users Table
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'PATIENT',
  auth_provider TEXT NOT NULL DEFAULT 'email',
  google_id   TEXT,
  password_hash TEXT,
  preferred_language TEXT DEFAULT 'en',
  region      TEXT,
  avatar_url  TEXT,
  is_active   INTEGER DEFAULT 1,
  email_verified INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  age           INTEGER,
  gender        TEXT DEFAULT 'MALE',
  region        TEXT,
  cultural_interests TEXT DEFAULT '[]',
  medical_data_provided INTEGER DEFAULT 0,
  caregiver_name TEXT DEFAULT '',
  caregiver_contact TEXT DEFAULT '',
  current_difficulty_level INTEGER DEFAULT 2,
  fatigue_score INTEGER DEFAULT 0,
  avatar_url    TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

-- Caregiver-Patient Authorizations
CREATE TABLE IF NOT EXISTS caregiver_patient_relationships (
  id            TEXT PRIMARY KEY,
  caregiver_id  TEXT NOT NULL REFERENCES users(id),
  patient_id    TEXT NOT NULL REFERENCES users(id),
  relationship  TEXT DEFAULT 'CAREGIVER',
  authorized_at TEXT NOT NULL,
  is_active     INTEGER DEFAULT 1
);
```

---

## 8. Verified Demo Authentication Matrix

| Role | Name | Email | Password | Primary Focus |
|---|---|---|---|---|
| **Caregiver** | Dr. Priyanka Kumar | `caregiver@mindmithra.org` | `MithraCare2026!` | Clinical hub, telemetry, multi-patient monitoring |
| **Elder Patient 1** | Ravi Kumar (Age 72) | `ravi.kumar@mindmithra.org` | `RaviCare2026!` | Tea traditions, Bihu folk music, memory match |
| **Elder Patient 2** | Maya Devi (Age 68) | `maya.devi@mindmithra.org` | `MayaCare2026!` | Shillong pine hills, textile weaving, attention |
| **Elder Patient 3** | Biren Barua (Age 76) | `biren.barua@mindmithra.org` | `BirenCare2026!` | Jorhat tea estate, Kaziranga nature, daily routine |

---

## 9. Security, Privacy & Compliance

1. **Zero Cloud Video Ingestion**: Camera streams for face check-in and mood evaluation never leave the browser's GPU buffer; only 128-dimensional mathematical descriptor hashes are stored.
2. **Password Cryptography**: 12-round salted Bcrypt hashing on all stored passwords.
3. **Emergency Escalation Protocol**: One-touch SOS triggers automated dialer links (`tel:`) and pre-cached SMS alerts without requiring active web service availability.
4. **Accessible WCAG 2.1 AAA Compliance**: High-contrast ratios ($>7:1$), touch target minimums of $56\text{px} \times 56\text{px}$, and non-shaming elderly accessibility typography.

---

## 10. Summary & Repository Blueprint

- `src/components/PublicWebsite/LandingPage.tsx`: Public landing page with light aesthetic, animated rotating headline, device mockup, soundwave equalizer, and interactive domain filters.
- `src/components/Auth/AuthPage.tsx`: Secure auth interface with zero autofill and complete Caregiver & Elder separation.
- `src/components/PatientPortal/PatientHome.tsx`: Elder dashboard featuring dynamic AI Game Recommendation based on cognitive performance charts.
- `src/components/CaregiverPortal/CaregiverDashboard.tsx`: Comprehensive multi-patient clinical analytics, longitudinal MMSE tracking, and DDA locks.
- `src/lib/adaptiveEngine.ts`: Neuro-symbolic cognitive recommendation engine.
- `src/lib/gameLevelSystem.ts`: 5-level DDA calibration system.
- `src/lib/faceRecognitionEngine.ts`: Edge 5-pose biometric verification engine.
- `src/lib/soundscapeEngine.ts`: Web Audio API synthetic ambient acoustic generator.
- `server.ts`: Production Node/Express API with SQLite WAL persistence and Google Gemini GenAI integration.

*Document finalized and certified for Mind Mithra Production Architecture.*
