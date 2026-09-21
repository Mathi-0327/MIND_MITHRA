export type UserRole = 'PATIENT' | 'CAREGIVER' | 'HEALTHCARE_WORKER' | 'ADMIN';

export type SupportedLanguage = 'en' | 'as' | 'bn' | 'mni' | 'kha' | 'lus' | 'hi' | 'ta' | 'grt' | 'trp';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export interface CognitiveBaseline {
  memoryScore: number; // 0 - 100
  attentionScore: number; // 0 - 100
  recallScore: number; // 0 - 100
  patternScore: number; // 0 - 100
  responseSpeedMs: number;
  engagementLevel: 'HIGH' | 'MODERATE' | 'LOW';
  completedAt: string;
  isInitialBaseline: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  region: string; // e.g. "Assam (Guwahati)", "Meghalaya (Shillong)", "Manipur (Imphal)"
  preferredLanguage: SupportedLanguage;
  culturalInterests: string[]; // ["Traditional Folk Music", "Bihu & Tea Gardening", "Weaving & Silk", "Cooking Assamese Dishes", "Nature & Wildlife"]
  medicalDataProvided: boolean;
  medicalConditions?: string[];
  allergies?: string[];
  medicationsSummary?: string[];
  caregiverName: string;
  caregiverContact: string;
  baseline: CognitiveBaseline | null;
  currentDifficultyLevel: number; // 1 to 5
  fatigueScore: number; // 0 - 100
  lastSyncTimestamp: string;
  syncStatus: 'SYNCED' | 'PENDING' | 'OFFLINE';
  avatarUrl: string;
  enrolledFace?: EnrolledFaceTemplate | null;
}

export type FaceSessionState =
  | 'INITIALIZING_CAMERA'
  | 'WAITING_FOR_FACE'
  | 'FACE_DETECTED'
  | 'CHECKING_QUALITY'
  | 'RECOGNIZING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'UNKNOWN_FACE'
  | 'MULTIPLE_FACES'
  | 'LOW_QUALITY'
  | 'CAMERA_ERROR'
  | 'NO_CAMERA_PERMISSION';

export interface FaceQualityAssessment {
  isQualitySufficient: boolean;
  score: number; // 0.0 - 1.0
  brightness: number; // 0 - 255
  isTooDark: boolean;
  isTooBright: boolean;
  isBlurred: boolean;
  isCentered: boolean;
  sizeRatio: number; // face area / frame area
  guidanceMessage: string;
}

export interface FaceBiometricData {
  faceDetected: boolean;
  faceCount: number;
  faceDetectionConfidence: number; // 0.0 - 1.0
  identitySimilarity: number | null; // 0.0 - 1.0 (null if no face)
  identityConfidence: number; // 0.0 - 1.0
  identityVerified: boolean;
  recognizedPerson: string | null;
  quality: FaceQualityAssessment;
  embedding: number[] | null;
  temporalStabilityCount: number;
  requiredStability: number;
  sessionState: FaceSessionState;
  timestamp: string;
}

export interface EnrolledFaceTemplate {
  patientId: string;
  patientName: string;
  modelVersion: string;
  enrolledAt: string;
  sampleCount: number;
  embeddings: number[][]; // Multiple samples
  meanEmbedding: number[]; // Normalized mean vector
  qualityScore: number;
}

export type GameCategory =
  | 'MEMORY'
  | 'ATTENTION'
  | 'PATTERN'
  | 'ROUTINE'
  | 'RELAX'
  | 'LANGUAGE'
  | 'SPATIAL'
  | 'STORY'
  | 'PUZZLE'
  | 'MOTOR';

export interface GameItem {
  id: string;
  name: string;
  category: GameCategory;
  description: string;
  iconName: string;
  culturalTheme: string;
  targetCognitiveDomain: string;
  baseDifficulty: number;
}

export type EnrollmentPose = 'FRONTAL' | 'SLIGHT_LEFT' | 'SLIGHT_RIGHT' | 'SLIGHT_UP' | 'SLIGHT_DOWN';

export type FaceEnrollmentState =
  | 'INITIALIZING'
  | 'CAMERA_REQUESTING'
  | 'CAMERA_READY'
  | 'LOADING_FACE_MODEL'
  | 'READY_FOR_SAMPLE'
  | 'CAPTURING_SAMPLE'
  | 'VALIDATING_SAMPLE'
  | 'SAMPLE_ACCEPTED'
  | 'SAMPLE_REJECTED'
  | 'NEXT_SAMPLE'
  | 'PROCESSING_ENROLLMENT'
  | 'ENROLLMENT_SUCCESS'
  | 'ENROLLMENT_FAILED'
  | 'RETRY_REQUIRED'
  | 'CAMERA_ERROR'
  | 'MODEL_ERROR'
  | 'TIMEOUT';

export interface EnrollmentSampleDetail {
  sampleIndex: number;
  pose: EnrollmentPose;
  poseLabel: string;
  instruction: string;
  embedding: number[];
  capturedAt: string;
  qualityScore: number;
  label?: string;
  spokenPrompt?: string;
  timestamp?: string;
  thumbnailBase64?: string;
}

export interface GameVoiceEvent {
  id: string;
  patientId: string;
  gameId: string;
  gameCategory: GameCategory;
  gameLevel: number;
  timestamp: string;
  transcript: string;
  language: string;
  intent: 'GAME_ANSWER' | 'REPEAT' | 'HINT' | 'SKIP' | 'PAUSE' | 'CONTINUE' | 'STOP' | 'START' | 'UNKNOWN';
  answer?: string;
  confidence: number;
  correct?: boolean;
  responseTimeSeconds?: number;
  actionTaken?: string;
}

export interface GameSessionResult {
  sessionId: string;
  patientId: string;
  gameId: string;
  category: GameCategory;
  difficulty: number;
  score: number; // 0 - 100
  accuracyPercent: number;
  avgResponseTimeMs: number;
  totalAttempts: number;
  completed: boolean;
  abandoned: boolean;
  timestamp: string;
  feedbackText: string;
  correctAnswers?: number;
  incorrectAnswers?: number;
  hintsUsed?: number;
  skipsCount?: number;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  fatigueSignalsDetected?: boolean;
  observedMood?: PatientMoodType;
  offlineRecorded?: boolean;
  voiceAnswersCount?: number;
  touchAnswersCount?: number;
  voiceInteractions?: number;
  hintsRequestedViaVoice?: number;
  adaptationApplied?: {
    previousDifficulty: number;
    newDifficulty: number;
    reason: string;
  };
}

export interface MemoryItem {
  id: string;
  patientId: string;
  title: string;
  imageUrl: string;
  caption: string;
  fullStory: string;
  peopleTagged: string[];
  relationship: string;
  location: string;
  eventDateOrYear: string;
  culturalTags: string[];
  verifiedByCaregiver: boolean;
  isFavorite: boolean;
  audioNarrationUrl?: string;
  createdDate: string;
}

export type ReminderType = 'MEDICATION' | 'HYDRATION' | 'ACTIVITY' | 'APPOINTMENT' | 'ROUTINE';
export type ReminderStatus = 'PENDING' | 'ACKNOWLEDGED' | 'SNOOZED' | 'SKIPPED';

export interface ReminderItem {
  id: string;
  patientId: string;
  title: string;
  type: ReminderType;
  scheduledTime: string; // e.g. "08:00 AM"
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  dosageOrInstruction?: string;
  status: ReminderStatus;
  acknowledgedAt?: string;
  voicePromptText: string;
}

export type ObservationPriority = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
export type ObservationCategory = 
  | 'ENGAGEMENT'
  | 'MEMORY_ACTIVITY'
  | 'ATTENTION_ACTIVITY'
  | 'PATTERN_ACTIVITY'
  | 'ROUTINE'
  | 'REMINDER_INTERACTION'
  | 'VOICE_INTERACTION'
  | 'SYSTEM_STATUS';

export interface AIObservation {
  id: string;
  patientId: string;
  category: ObservationCategory;
  title: string;
  observation: string;
  explainabilityReason: string;
  dataSources: string[];
  confidenceScore: number; // 0.0 - 1.0
  priority: ObservationPriority;
  isClinicalDiagnosis: false; // Safety invariant
  timestamp: string;
  metricsComparison?: {
    metricName: string;
    recentValue: string;
    baselineValue: string;
    deviation: string;
  };
}

export interface AdaptationOutput {
  calculatedDifficulty: number;
  difficultyChange: 'INCREASED' | 'DECREASED' | 'MAINTAINED';
  reason: string;
  suggestRest: boolean;
  recommendedCategory: GameCategory;
  themeContext: string;
}

export interface StructuredPreference {
  preferredTheme?: string;
  timeOfDayPreference?: 'MORNING' | 'AFTERNOON' | 'EVENING';
  maxDifficulty?: number;
  minDifficulty?: number;
  hydrationPromptTime?: string;
  enableRelaxationAudio?: boolean;
  toneStyle?: 'WARM_ENCOURAGING' | 'GENTLE_MINIMAL' | 'STORYTELLER';
}

export interface CaregiverInstruction {
  id: string;
  patientId: string;
  caregiverId?: string;
  authorName?: string;
  rawInstructionText: string;
  structuredRule: StructuredPreference;
  appliedStatus: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  aiInterpretationNotes?: string;
}

export interface AIRecommendation {
  id: string;
  patientId: string;
  recommendedActivityTitle: string;
  category: GameCategory;
  difficulty: number;
  estimatedDurationMinutes: number;
  reasonExplanation: string;
  culturalContext: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  generatedAt: string;
}

export interface SyncEvent {
  eventId: string;
  patientId: string;
  eventType: 
    | 'GAME_COMPLETED'
    | 'MEMORY_VIEWED'
    | 'MEMORY_QUERY'
    | 'MEMORY_CREATED'
    | 'VOICE_INTERACTION'
    | 'REMINDER_ACKNOWLEDGED'
    | 'REMINDER_SKIPPED'
    | 'BASELINE_COMPLETED'
    | 'CAREGIVER_INSTRUCTION_ADDED'
    | 'PROFILE_UPDATED'
    | 'REASSURANCE_TRIGGERED'
    | 'SOS_TRIGGERED';
  timestamp: string;
  payload: Record<string, unknown>;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  version: number;
}

export interface PatientTimelineEvent {
  id: string;
  time: string;
  date: string;
  type: 'GAME' | 'REMINDER' | 'MEMORY' | 'VOICE' | 'OBSERVATION' | 'INSTRUCTION';
  title: string;
  detail: string;
  badgeText?: string;
  statusColor?: string;
}

export interface DailySummaryData {
  patientId: string;
  dateStr: string;
  activitiesCompletedCount: number;
  engagementRating: 'High' | 'Moderate' | 'Low';
  reminderAdherencePercent: number;
  strengths: string[];
  areasOfGentleFocus: string[];
  notableObservations: string;
  overallMoodIndicator: 'Cheerful & Engaged' | 'Calm & Restful' | 'Mildly Fatigued';
  safetyNote: string;
}

export interface WeeklyTrendData {
  patientId: string;
  weekRange: string;
  engagementTrend: 'UP' | 'STABLE' | 'DOWN';
  memoryTrend: 'UP' | 'STABLE' | 'DOWN';
  attentionTrend: 'UP' | 'STABLE' | 'DOWN';
  patternTrend: 'UP' | 'STABLE' | 'DOWN';
  reminderAdherenceAverage: number;
  dayByDayActivity: { day: string; games: number; reminders: number; voiceChats: number }[];
  summaryNarrative: string;
}

export type PatientMoodType = 'HAPPY' | 'CALM' | 'SAD' | 'ANXIOUS' | 'TIRED' | 'NEUTRAL' | 'ENGAGED' | 'CONFUSED' | 'FRUSTRATED' | 'AGITATED';

export type MoodSource = 'USER_EXPLICIT' | 'CAMERA_HEURISTIC' | 'VOICE_ANALYSIS' | 'INTERACTION_BEHAVIOR';

export interface MoodObservationRecord {
  id: string;
  patientId: string;
  timestamp: string;
  state: PatientMoodType;
  confidence: number;
  source: MoodSource;
  context: string;
  note?: string;
}

export interface PatientMoodLog {
  id: string;
  patientId: string;
  mood: PatientMoodType;
  confidence: number; // 0.0 - 1.0
  detectedAt: string;
  facialFeatures?: {
    smileScore?: number;
    eyeOpenness?: number;
    browTension?: number;
  };
  verbalSentiment?: string;
  recommendedAction: {
    suggestedActivity: 'GAMES' | 'RADIO' | 'FAMILY_VOICE' | 'SAFE_HAVEN' | 'MEMORIES' | 'REST';
    message: string;
    themeTone: string;
  };
  photoSnapshotUrl?: string;
  source: 'CAMERA_AI' | 'VOICE_SENTIMENT' | 'MANUAL_SELECTION';
}

export type AppFontSize = 'NORMAL' | 'LARGE' | 'EXTRA_LARGE';

export interface AppSettings {
  fontSize: AppFontSize; // NORMAL = 100%, LARGE = 115%, EXTRA_LARGE = 130%
  highContrast: boolean;
  autoCameraMoodCheck: boolean; // Camera turns on upon launch to identify mood
  speechSpeed: number; // 0.8, 1.0, 1.2
  audioChimes: boolean;
  hapticFeedback: boolean;
  companionVoice: string; // 'Kore' | 'Puck' | 'Fenrir' | 'Aoede'
  emergencyPhone: string;
  emergencyContactName: string;
  preferredDialectRegion: string;
}

export interface CaregiverAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientRelation: string; // e.g., "Father", "Mother", "Grandfather"
  type: 'SOS_EMERGENCY' | 'SUNDOWNING_DISTRESS' | 'FALL_OR_DISORIENTATION' | 'MISSED_MEDICATION' | 'MOOD_ALERT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  location?: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  name: string;
  relation: string; // e.g. "Daughter", "Granddaughter", "Son", "Spouse"
  relationDetail: string; // "Elder Daughter & Primary Caregiver"
  avatarUrl: string;
  location: string; // "Guwahati, Assam"
  phoneNumber: string;
  voiceNoteText: string;
  voiceNoteAudio?: string;
  sharedStory: string;
  keyMemories: string[];
  isPrimaryCaregiver?: boolean;
}

export interface CognitiveGameDefinition {
  id: string;
  gameKey: string;
  index: number;
  title: string;
  subtitle: string;
  category: GameCategory;
  targetDomain: string;
  culturalTheme: string;
  color: string;
  bgGradient: string;
  iconName: string;
  recommendedForMoods: PatientMoodType[];
  baseDifficulty: number;
  description: string;
  instructions: string;
}

export interface MedicalReportRecord {
  id: string;
  patientId: string;
  reportTitle: string;
  hospitalName: string;
  dateEvaluated: string;
  doctorName: string;
  mmseScore?: number; // Mini-Mental State Exam out of 30
  mocaScore?: number; // Montreal Cognitive Assessment out of 30
  extraction: MedicalReportExtraction;
  createdAt: string;
  isApplied: boolean;
}

export interface MedicalReportExtraction {
  patientName?: string;
  age?: number;
  diagnoses: string[];
  cognitiveStage: 'MILD_COGNITIVE_IMPAIRMENT' | 'EARLY_STAGE' | 'MODERATE_STAGE' | 'HEALTHY_SENIOR';
  medications: Array<{
    name: string;
    dosage: string;
    timing: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    instruction: string;
  }>;
  recommendedCognitiveDomains: string[];
  hydrationTargetGlasses: number;
  dailyRoutineSummary: string;
  precautions: string[];
  extractedAt: string;
  confidenceScore: number;
}

// -------------------------------------------------------------
// 21 REFERENCE FEATURES DOMAIN MODELS
// -------------------------------------------------------------

// Feature 1: Memory Web Graph Models
export type MemoryGraphNodeType = 'PEOPLE' | 'PLACES' | 'EVENTS' | 'PHOTOS' | 'MUSIC' | 'STORIES' | 'MEMORIES';

export interface MemoryGraphNode {
  id: string;
  type: MemoryGraphNodeType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  audioUrl?: string;
  categoryTag?: string;
  connectedCount?: number;
  patientId?: string;
}

export interface MemoryGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export interface MemoryGraphData {
  nodes: MemoryGraphNode[];
  edges: MemoryGraphEdge[];
}

// Feature 3 & 21: Elder Knowledge & Teach My Family Models
export type KnowledgeCategory = 'RECIPE' | 'FARMING' | 'CRAFT' | 'STORY' | 'TRADITION' | 'WISDOM' | 'MUSIC';

export interface ElderKnowledgeItem {
  id: string;
  patientId: string;
  title: string;
  category: KnowledgeCategory;
  region: string;
  elderContributor: string;
  content: string;
  audioVoiceUrl?: string;
  imageUrl?: string;
  tags: string[];
  isFamilyLegacy: boolean;
  taughtToFamilyMembers?: string[];
  createdAt: string;
}

// Feature 4: Familiar Route Memory Models
export interface RouteWaypoint {
  id: string;
  name: string;
  landmarkDescription: string;
  icon: string;
  orderIndex: number;
  imageUrl?: string;
  memoryNote?: string;
}

export interface RouteMemory {
  id: string;
  patientId: string;
  title: string;
  origin: string;
  destination: string;
  waypoints: RouteWaypoint[];
  consentGiven: boolean;
  notes?: string;
  createdAt: string;
}

// Feature 6: Personal Soundscape Models
export interface PersonalSoundItem {
  id: string;
  patientId: string;
  title: string;
  category: 'FAMILY_VOICE' | 'NATURE' | 'VILLAGE' | 'TRADITIONAL_MUSIC' | 'RAIN_WIND';
  audioUrl?: string;
  proceduralFreq?: number;
  isFavorite: boolean;
  sourcePerson?: string;
  durationSeconds?: number;
}

// Feature 7: Tell Me About Your Day (Daily Journal)
export interface DailyJournalEntry {
  id: string;
  patientId: string;
  dateStr: string;
  timestamp: string;
  transcriptionText: string;
  spokenAudioUrl?: string;
  taggedPeople: string[];
  taggedPlaces: string[];
  activitiesMentioned: string[];
  observedMood?: PatientMoodType;
  isVerifiedByPatient: boolean;
}

// Feature 15: Memory Capsules
export interface MemoryCapsule {
  id: string;
  patientId: string;
  senderName: string;
  senderRelation: string;
  title: string;
  occasion: string;
  unlockDate: string;
  isUnlocked: boolean;
  personalNote: string;
  photos: string[];
  voiceAudioUrl?: string;
  musicTheme?: string;
  unlockedAt?: string;
}

// Feature 16: Memory Chain
export interface MemoryChainQuestion {
  id: string;
  promptKey: 'WHO' | 'WHERE' | 'WHEN' | 'WHAT' | 'FEELING';
  promptTitle: string;
  promptText: string;
  answerText?: string;
  answerVoiceUrl?: string;
}

export interface MemoryChain {
  id: string;
  patientId: string;
  memoryId: string;
  chainTitle: string;
  questions: MemoryChainQuestion[];
  connectedMemoryIds: string[];
  completedAt?: string;
}

// Feature 12: Memory Confidence Map
export interface ConfidenceDomainScore {
  domain: string;
  categoryKey: 'FAMILY' | 'OLD_PLACES' | 'MUSIC' | 'DAILY_TASKS' | 'NEW_OBJECTS' | 'ROUTINES' | 'PEOPLE' | 'EVENTS';
  score: number; // 0 - 100
  familiarityRating: number; // 1 - 5
  interactionCount: number;
  trend: 'RISING' | 'STEADY' | 'DECLINING';
  lastInteractedAt: string;
}

export interface MemoryConfidenceMap {
  patientId: string;
  lastUpdated: string;
  domains: ConfidenceDomainScore[];
}

// Feature 19: Emotional Preference Memory
export interface UserPreferenceProfile {
  patientId: string;
  likedThemes: string[];
  dislikedStimuli: string[];
  favoritePeopleIds: string[];
  favoriteSoundscapes: string[];
  preferredActivityDurationMinutes: number;
  autoEveningMode: boolean;
  eveningDuskHour: number; // e.g. 18 = 6 PM
  lastUpdated: string;
}

// ============================================================
// AI CONVERSATION & INTENT CLASSIFICATION ARCHITECTURE
// ============================================================

export type MindMithraIntent =
  | 'GENERAL_GREETING'
  | 'GENERAL_CONVERSATION'
  | 'HOW_ARE_YOU'
  | 'THANK_YOU'
  | 'GOODBYE'
  | 'CASUAL_QUESTION'
  | 'INFORMATION_QUESTION'
  | 'USER_STATE_EXPRESSION'
  | 'USER_FEELING_TIRED'
  | 'USER_FEELING_CONFUSED'
  | 'USER_FEELING_HAPPY'
  | 'USER_FEELING_SAD'
  | 'USER_FEELING_ANXIOUS'
  | 'START_GAME'
  | 'SELECT_GAME'
  | 'SELECT_GAME_LEVEL'
  | 'SHOW_GAMES'
  | 'SHOW_MEMORIES'
  | 'SEARCH_MEMORY'
  | 'PLAY_MEMORY'
  | 'CREATE_MEMORY'
  | 'SHOW_FAMILY'
  | 'CALL_FAMILY_MEMBER'
  | 'PLAY_FAMILY_VOICE'
  | 'ADD_FAMILY_MEMBER'
  | 'START_DAILY_JOURNAL'
  | 'TELL_ABOUT_DAY'
  | 'CREATE_STORY'
  | 'SHOW_STORY'
  | 'START_REMINISCENCE'
  | 'PLAY_SOUNDSCAPE'
  | 'SHOW_REMINDERS'
  | 'CREATE_REMINDER'
  | 'UPDATE_REMINDER'
  | 'MEDICATION_REMINDER'
  | 'ASK_TIME'
  | 'ASK_DATE'
  | 'ASK_PERSON'
  | 'ASK_PLACE'
  | 'ASK_ABOUT_MEMORY'
  | 'TEACH_MIND_MITHRA'
  | 'DAILY_ACTIVITY'
  | 'TELL_STORY'
  | 'SHOW_PROGRESS'
  | 'SHOW_MY_RESULTS'
  | 'HELP'
  | 'EMERGENCY'
  | 'STOP'
  | 'CANCEL'
  | 'GO_HOME'
  | 'UNKNOWN';

export type IntentActionType =
  | 'NAVIGATE_HOME'
  | 'NAVIGATE_GAMES'
  | 'NAVIGATE_MEMORIES'
  | 'NAVIGATE_FAMILY'
  | 'NAVIGATE_REMINDERS'
  | 'NAVIGATE_RELAX'
  | 'NAVIGATE_JOURNAL'
  | 'NAVIGATE_STORY'
  | 'NAVIGATE_TEACH'
  | 'START_GAME'
  | 'PLAY_FAMILY_VOICE'
  | 'PLAY_SOUNDSCAPE'
  | 'TRIGGER_EMERGENCY_SOS'
  | 'RECORD_MOOD_STATE'
  | 'CREATE_MEMORY'
  | 'NONE';

export interface IntentAction {
  type: IntentActionType;
  targetRoute?: 'HOME' | 'GAMES' | 'MEMORIES' | 'REMINDERS' | 'RELAX' | 'BASELINE' | 'FAMILY_TREE' | 'RADIO' | 'JOURNAL' | 'STORY_BUILDER' | 'ELDER_KNOWLEDGE';
  payload?: Record<string, any>;
}

export interface IntentClassificationResult {
  intent: MindMithraIntent;
  confidence: number; // 0.0 - 1.0
  language: SupportedLanguage;
  state?: string | null;
  entities: {
    personName?: string;
    relationship?: string;
    familyMember?: string;
    activity?: string;
    time?: string;
    state?: string;
    gameId?: string;
    gameCategory?: GameCategory;
    level?: number;
    timeOfDay?: string;
    sentiment?: 'TIRED' | 'HAPPY' | 'CONFUSED' | 'SAD' | 'CALM' | 'ANXIOUS' | 'LONELY' | 'HUNGRY';
    queryTopic?: string;
    soundscapeType?: 'RAIN' | 'FLUTE' | 'BIRDS';
    [key: string]: any;
  };
  action: IntentAction | null;
  requiresClarification: boolean;
  clarificationPrompt?: string;
  isMixedIntent: boolean;
  rawTranscript: string;
}

export interface StructuredAIResponse {
  intent: MindMithraIntent;
  confidence: number;
  state: string | null;
  entities: Record<string, any>;
  action: {
    type: IntentActionType;
    targetRoute?: string;
  } | null;
  response: string;
}

// Unified Observation Events (Section 39 Data Model)
export type CareEventType = 
  | 'FACE_EVENT'
  | 'VOICE_EVENT'
  | 'GAME_EVENT'
  | 'REMINDER_EVENT'
  | 'MEMORY_EVENT'
  | 'MOOD_EVENT';

export interface CareObservationEvent {
  id: string;
  patientId: string;
  timestamp: string;
  source: CareEventType;
  data: Record<string, any>;
  confidence?: number;
}

export interface ConversationTurn {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
  intent?: MindMithraIntent;
  actionTaken?: IntentActionType;
}

export interface ControlledContextObject {
  patient: {
    id: string;
    name: string;
    preferredLanguage: SupportedLanguage;
    region: string;
    fatigueScore: number;
    currentDifficultyLevel: number;
  };
  currentScreen: string;
  currentGame?: string | null;
  currentLevel?: number | null;
  recentConversation: ConversationTurn[];
  recentMemory?: MemoryItem | null;
  recentFamilyMember?: FamilyMember | null;
  preferences: {
    likedThemes: string[];
    favoriteSoundscapes: string[];
  };
  recentPerformance?: {
    lastAccuracy?: number;
    lastScore?: number;
    lastGameCategory?: GameCategory;
  };
}

// ============================================================
// UNIVERSAL 5-LEVEL COGNITIVE GAME SYSTEM
// ============================================================

export interface GameLevelConfig {
  level: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: 'easy' | 'easy-medium' | 'medium' | 'medium-hard' | 'hard';
  itemCount: number; // e.g. cards (4, 6, 8, 12, 16) or items to categorize
  distractorCount: number;
  timeLimitSeconds: number;
  memoryLoad: number; // 1 to 5 scale
  visualComplexity: 'minimal' | 'low' | 'moderate' | 'high' | 'dense';
  sequenceLength?: number;
  hintsAllowed: number;
  scoringThreshold: number; // Minimum accuracy to pass (e.g. 70%)
  guidanceText: string;
}

export interface GameLevelsMetadata {
  gameId: string;
  title: string;
  domain: GameCategory;
  levels: [GameLevelConfig, GameLevelConfig, GameLevelConfig, GameLevelConfig, GameLevelConfig];
}

export interface CaregiverGameControl {
  gameId: string;
  domain: GameCategory;
  startingLevel: number; // 1 - 5 (Caregiver configured)
  maxAllowedLevel: number; // 1 - 5 (Caregiver configured ceiling)
  isLocked: boolean; // Prevent DDA auto-advance
  isPaused: boolean; // Temporarily hide/disable game
  hintsEnabled: boolean;
  notes?: string;
}

// ============================================================
// CENTRAL DETERMINISTIC COGNITIVE ANALYTICS
// ============================================================

export interface CognitiveDomainMetric {
  domain: GameCategory;
  domainLabel: string;
  sessionsCount: number;
  averageScore: number;
  accuracyPercent: number;
  avgResponseTimeMs: number;
  currentLevel: number;
  highestLevel: number;
  trend: 'IMPROVING' | 'STABLE' | 'NEEDS_SUPPORT';
  completionRatePercent: number;
}

export interface CognitiveAnalyticsReport {
  patientId: string;
  patientName: string;
  generatedAt: string;
  periodDays: 7 | 30 | number;
  dateRange: { start: string; end: string };
  totalSessions: number;
  overallAccuracy: number;
  meanResponseTimeMs: number;
  overallReminderAdherence: number;
  domainMetrics: CognitiveDomainMetric[];
  levelProgression: { gameId: string; gameTitle: string; fromLevel: number; toLevel: number; status: string }[];
  reminderAnalytics: {
    totalReminders: number;
    completed: number;
    skipped: number;
    snoozed: number;
    adherencePercent: number;
    avgResponseMinutes: number;
  };
  moodDistribution: { state: PatientMoodType; count: number; explicitCount: number }[];
  evidenceBasedObservations: {
    id: string;
    observation: string;
    evidence: string;
    timePeriod: string;
    confidence: number;
    source: string;
    domain?: GameCategory;
  }[];
  caregiverSuggestions: {
    recommendation: string;
    rationale: string;
    actionType: 'ADJUST_LEVEL' | 'SCHEDULE_REST' | 'INTRODUCE_THEME' | 'REVIEW_MEDICATION';
  }[];
}

