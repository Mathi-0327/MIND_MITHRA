import { 
  PatientProfile, 
  SyncEvent, 
  GameSessionResult, 
  ReminderItem, 
  MemoryItem, 
  CaregiverInstruction, 
  AIObservation, 
  AIRecommendation,
  UserRole,
  AppSettings,
  PatientMoodLog,
  CaregiverAlert,
  FamilyMember,
  MedicalReportRecord
} from '../types';

const STORAGE_KEYS = {
  PATIENT_PROFILE: 'manas_patient_profile',
  PATIENT_REGISTRY: 'manas_patient_registry',
  ACTIVE_PATIENT_ID: 'manas_active_patient_id',
  SESSION_AUTH: 'manas_session_auth',
  SYNC_QUEUE: 'manas_sync_queue',
  GAME_SESSIONS: 'manas_game_sessions',
  LOCAL_REMINDERS: 'manas_local_reminders',
  LOCAL_MEMORIES: 'manas_local_memories',
  CAREGIVER_INSTRUCTIONS: 'manas_caregiver_instructions',
  AI_OBSERVATIONS: 'manas_ai_observations',
  AI_RECOMMENDATIONS: 'manas_ai_recommendations',
  NETWORK_SIMULATION: 'manas_network_simulation',
  APP_SETTINGS: 'manas_app_settings',
  MOOD_LOGS: 'manas_patient_mood_logs',
  CAREGIVER_ALERTS: 'manas_caregiver_alerts',
  FAMILY_MEMBERS: 'manas_family_members',
  MEDICAL_REPORTS: 'manas_medical_reports',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  fontSize: 'LARGE', // Default to Large for elderly accessibility
  highContrast: false,
  autoCameraMoodCheck: true, // Face and mood check automatically comes first on launch
  speechSpeed: 1.0,
  audioChimes: true,
  hapticFeedback: true,
  companionVoice: 'Kore',
  emergencyPhone: '+91 98640 12345',
  emergencyContactName: 'Priyanka Kumar (Daughter)',
  preferredDialectRegion: 'Assam / North East India',
};

// Initial fictional demo profile for North East Region
export const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    id: 'patient-ravi-001',
    name: 'Ravi Kumar',
    age: 72,
    gender: 'MALE',
    region: 'Assam (Guwahati & Tezpur)',
    preferredLanguage: 'en',
    culturalInterests: [
      'Traditional Bihu & Flute Music',
      'Assam Tea Gardening & Farming',
      'Assamese Traditional Dishes',
      'Family & Village Festivals',
      'Bamboo Craft & Nature',
    ],
    medicalDataProvided: false,
    caregiverName: 'Priyanka Kumar (Daughter)',
    caregiverContact: '+91 98640 12345',
    baseline: {
      memoryScore: 74,
      attentionScore: 68,
      recallScore: 70,
      patternScore: 82,
      responseSpeedMs: 3200,
      engagementLevel: 'HIGH',
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isInitialBaseline: true,
    },
    currentDifficultyLevel: 2,
    fatigueScore: 18,
    lastSyncTimestamp: new Date().toISOString(),
    syncStatus: 'SYNCED',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'patient-maya-002',
    name: 'Maya Devi',
    age: 68,
    gender: 'FEMALE',
    region: 'Meghalaya (Shillong)',
    preferredLanguage: 'en',
    culturalInterests: [
      'Pine Forest Walks & Gardening',
      'Traditional Weaving Patterns',
      'Folk Choirs & Singing',
      'Courtyard Tea Times',
    ],
    medicalDataProvided: false,
    caregiverName: 'Anil Devi (Son)',
    caregiverContact: '+91 98560 54321',
    baseline: {
      memoryScore: 82,
      attentionScore: 76,
      recallScore: 78,
      patternScore: 88,
      responseSpeedMs: 2900,
      engagementLevel: 'HIGH',
      completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      isInitialBaseline: true,
    },
    currentDifficultyLevel: 3,
    fatigueScore: 12,
    lastSyncTimestamp: new Date().toISOString(),
    syncStatus: 'SYNCED',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'patient-biren-003',
    name: 'Biren Barua',
    age: 76,
    gender: 'MALE',
    region: 'Assam (Jorhat Tea Estate)',
    preferredLanguage: 'as',
    culturalInterests: [
      'Tea Plucking & Estate Life',
      'Kaziranga Nature & Birds',
      'Dhol & Bihu Melodies',
      'Proverbs & Storytelling',
    ],
    medicalDataProvided: false,
    caregiverName: 'Mridul Barua (Son)',
    caregiverContact: '+91 94350 98765',
    baseline: {
      memoryScore: 65,
      attentionScore: 62,
      recallScore: 60,
      patternScore: 70,
      responseSpeedMs: 3800,
      engagementLevel: 'MODERATE',
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isInitialBaseline: true,
    },
    currentDifficultyLevel: 2,
    fatigueScore: 24,
    lastSyncTimestamp: new Date().toISOString(),
    syncStatus: 'SYNCED',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  }
];

export const DEFAULT_PATIENT = DEFAULT_PATIENTS[0];

export const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    patientId: 'patient-ravi-001',
    title: 'Granddaughter Ananya at Kaziranga',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    caption: 'Ananya holding binoculars watching one-horned rhinos in Kaziranga National Park',
    fullStory: 'In November 2023, you traveled with your daughter Priyanka and granddaughter Ananya to Kaziranga. Ananya was thrilled to spot a mother rhino and her calf near the elephant grass. You enjoyed drinking warm spiced tea together at the forest lodge.',
    peopleTagged: ['Ananya (Granddaughter)', 'Priyanka (Daughter)'],
    relationship: 'Granddaughter',
    location: 'Kaziranga, Assam',
    eventDateOrYear: 'November 2023',
    culturalTags: ['Kaziranga', 'Wildlife', 'Family Holiday', 'Assam Tea'],
    verifiedByCaregiver: true,
    isFavorite: true,
    createdDate: '2023-11-15',
  },
  {
    id: 'mem-2',
    patientId: 'patient-ravi-001',
    title: 'Rongali Bihu Festival with Dhol & Pepa',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    caption: 'Celebrating Rongali Bihu with family, playing the traditional Dhol drum',
    fullStory: 'You have loved playing the Bihu Dhol since your youth in Tezpur. Every April during Bohag Bihu, the courtyard was filled with Pitha, Laru, and the rhythm of Pepa and Gogona. You taught Ananya her first Bihu beats.',
    peopleTagged: ['Ravi Kumar', 'Priyanka Kumar', 'Neighbor Bikash'],
    relationship: 'Cultural Celebration',
    location: 'Tezpur, Assam',
    eventDateOrYear: 'April 2021',
    culturalTags: ['Bihu', 'Folk Music', 'Dhol', 'Festival', 'Pitha'],
    verifiedByCaregiver: true,
    isFavorite: true,
    createdDate: '2021-04-14',
  },
  {
    id: 'mem-3',
    patientId: 'patient-ravi-001',
    title: 'Shillong Peak Family Excursion',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    caption: 'Panoramic misty view of Shillong hills during the Cherry Blossom season',
    fullStory: 'A serene autumn afternoon spent admiring the rolling green hills and pine trees of Meghalaya. You wore your favorite warm wool sweater and praised the crisp mountain air.',
    peopleTagged: ['Priyanka Kumar', 'Ravi Kumar'],
    relationship: 'Family Excursion',
    location: 'Shillong, Meghalaya',
    eventDateOrYear: 'October 2022',
    culturalTags: ['Shillong', 'Meghalaya', 'Pine Trees', 'Hills'],
    verifiedByCaregiver: true,
    isFavorite: false,
    createdDate: '2022-10-20',
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    patientId: 'patient-ravi-001',
    title: 'Morning Hydration & Sunlight',
    type: 'HYDRATION',
    scheduledTime: '07:30 AM',
    timeOfDay: 'MORNING',
    dosageOrInstruction: 'Drink 1 warm glass of water and enjoy 5 minutes of gentle morning balcony air',
    status: 'ACKNOWLEDGED',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    voicePromptText: 'Nomoskar Ravi! Please drink a refreshing cup of warm water and enjoy the morning sun.',
  },
  {
    id: 'rem-2',
    patientId: 'patient-ravi-001',
    title: 'Morning Memory & Blood Pressure Tablet',
    type: 'MEDICATION',
    scheduledTime: '08:15 AM',
    timeOfDay: 'MORNING',
    dosageOrInstruction: '1 tablet with a warm glass of water after breakfast',
    status: 'ACKNOWLEDGED',
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    voicePromptText: 'Ravi, it is time for your morning memory and blood pressure tablet with fresh water.',
  },
  {
    id: 'rem-3',
    patientId: 'patient-ravi-001',
    title: 'Morning Assam Tea & Memory Card Puzzle',
    type: 'ACTIVITY',
    scheduledTime: '10:00 AM',
    timeOfDay: 'MORNING',
    dosageOrInstruction: 'Cup of warm Assam light tea followed by 5 minutes of heritage memory matching',
    status: 'PENDING',
    voicePromptText: 'Time for your morning tea and a fun 5-minute memory game with Bihu cards!',
  },
  {
    id: 'rem-4',
    patientId: 'patient-ravi-001',
    title: 'Mid-Day Hydration & Hand Wash',
    type: 'HYDRATION',
    scheduledTime: '12:30 PM',
    timeOfDay: 'AFTERNOON',
    dosageOrInstruction: 'Drink a glass of water and wash hands with pleasant warm soap before lunch',
    status: 'PENDING',
    voicePromptText: 'Time to drink a fresh glass of water and wash your hands before lunch.',
  },
  {
    id: 'rem-5',
    patientId: 'patient-ravi-001',
    title: 'Nourishing Lunch & Quiet Rest',
    type: 'ROUTINE',
    scheduledTime: '01:15 PM',
    timeOfDay: 'AFTERNOON',
    dosageOrInstruction: 'Enjoy a warm balanced meal with family, followed by 20 minutes relaxing rest',
    status: 'PENDING',
    voicePromptText: 'Lunch is served, Ravi. Enjoy your meal with family and take a peaceful rest.',
  },
  {
    id: 'rem-6',
    patientId: 'patient-ravi-001',
    title: 'Afternoon Hydration & Courtyard Stretch',
    type: 'HYDRATION',
    scheduledTime: '03:30 PM',
    timeOfDay: 'AFTERNOON',
    dosageOrInstruction: 'Drink a glass of water or fresh lime water; gentle 5-minute garden walk',
    status: 'PENDING',
    voicePromptText: 'Afternoon refreshment time! Drink a cup of water and take a gentle stroll in the courtyard.',
  },
  {
    id: 'rem-7',
    patientId: 'patient-ravi-001',
    title: 'Family Reminiscence & Photo Album Time',
    type: 'ACTIVITY',
    scheduledTime: '05:00 PM',
    timeOfDay: 'EVENING',
    dosageOrInstruction: 'Browse Tezpur and Shillong family memories album with your daughter Priyanka',
    status: 'PENDING',
    voicePromptText: 'Let us look at your lovely family photo memories and cherish happy times together.',
  },
  {
    id: 'rem-8',
    patientId: 'patient-ravi-001',
    title: 'Sundowning Calming Flute & Warm Lights',
    type: 'ROUTINE',
    scheduledTime: '06:30 PM',
    timeOfDay: 'EVENING',
    dosageOrInstruction: 'Turn on warm ambient lighting and listen to 10 minutes of peaceful flute melody to soothe the mind',
    status: 'PENDING',
    voicePromptText: 'The evening sunset is here. Let us listen to soothing flute music and relax peacefully.',
  },
  {
    id: 'rem-9',
    patientId: 'patient-ravi-001',
    title: 'Evening Dinner Tablet with Warm Water',
    type: 'MEDICATION',
    scheduledTime: '08:15 PM',
    timeOfDay: 'EVENING',
    dosageOrInstruction: '1 evening tablet after dinner with warm water',
    status: 'PENDING',
    voicePromptText: 'Ravi, dinner time is complete. Please take your evening tablet with warm water.',
  },
  {
    id: 'rem-10',
    patientId: 'patient-ravi-001',
    title: 'Bedtime Routine & Night Safety Check',
    type: 'ROUTINE',
    scheduledTime: '09:30 PM',
    timeOfDay: 'NIGHT',
    dosageOrInstruction: 'Warm cup of turmeric milk, bathroom check, soft nightlight on for safe peaceful sleep',
    status: 'PENDING',
    voicePromptText: 'Time to prepare for a restful sleep. Drink warm milk, check the nightlight, and sleep peacefully.',
  },
];

export const INITIAL_INSTRUCTIONS: CaregiverInstruction[] = [
  {
    id: 'inst-1',
    patientId: 'patient-ravi-001',
    authorName: 'Priyanka Kumar (Daughter)',
    rawInstructionText: 'He loves traditional Bihu flute music. Prefer engaging memory activities in the morning when he is freshest, and keep evening activities gentle.',
    structuredRule: {
      preferredTheme: 'Traditional Folk Music & Farming',
      timeOfDayPreference: 'MORNING',
      maxDifficulty: 3,
      enableRelaxationAudio: true,
      toneStyle: 'WARM_ENCOURAGING',
    },
    appliedStatus: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aiInterpretationNotes: 'Adapted daily schedule to prioritize memory card matching at 10 AM and soothing folk audio in the late afternoon.',
  }
];

export const INITIAL_OBSERVATIONS: AIObservation[] = [
  {
    id: 'obs-1',
    patientId: 'patient-ravi-001',
    category: 'PATTERN_ACTIVITY',
    title: 'Strong Geometric & Weave Pattern Recognition',
    observation: 'Ravi demonstrated 88% accuracy on Gamosa weave and sequence completion tasks with quick response times (under 2.4s).',
    explainabilityReason: 'Calculated from the last 4 pattern gaming sessions. Performance is +14% above personal baseline.',
    dataSources: ['GameSession: pattern-gamosa-04', 'GameSession: sequence-bead-02'],
    confidenceScore: 0.92,
    priority: 'INFO',
    isClinicalDiagnosis: false,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    metricsComparison: {
      metricName: 'Pattern Accuracy',
      recentValue: '88%',
      baselineValue: '74%',
      deviation: '+14% improvement',
    }
  },
  {
    id: 'obs-2',
    patientId: 'patient-ravi-001',
    category: 'MEMORY_ACTIVITY',
    title: 'Slightly Extended Response Latency on Name Recall',
    observation: 'Response latency in delayed name matching was 4.1s (normal baseline ~3.0s). The patient maintained cheerful engagement and completed all rounds.',
    explainabilityReason: 'Calculated by comparing session response time metrics against the established 14-day rolling average.',
    dataSources: ['GameSession: memory-family-03'],
    confidenceScore: 0.85,
    priority: 'LOW',
    isClinicalDiagnosis: false,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    metricsComparison: {
      metricName: 'Name Recall Latency',
      recentValue: '4.1s',
      baselineValue: '3.0s',
      deviation: '+1.1s variance (Normal daily fluctuation)',
    }
  }
];

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  // RAVI KUMAR (GUWAHATI)
  {
    id: 'fam-1',
    patientId: 'patient-ravi-001',
    name: 'Priyanka Kumar',
    relation: 'Daughter',
    relationDetail: 'Elder Daughter & Primary Caregiver',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    location: 'Guwahati, Assam (Lives 15 mins away)',
    phoneNumber: '+91 98640 12345',
    voiceNoteText: 'Deuta, remember I am just a quick phone call away. You are doing wonderfully with your morning tea and cards!',
    sharedStory: 'Priyanka visits every Sunday morning with fresh garden mint and homemade Narikol Laru. She coordinates all healthcare appointments.',
    keyMemories: ['Kaziranga Trip 2023', 'Tezpur Bihu 2021', 'Shillong Cherry Blossom 2022'],
    isPrimaryCaregiver: true,
  },
  {
    id: 'fam-2',
    patientId: 'patient-ravi-001',
    name: 'Ananya Kumar',
    relation: 'Granddaughter',
    relationDetail: 'Loving Granddaughter (Age 8)',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    location: 'Guwahati, Assam',
    phoneNumber: '+91 98640 12345',
    voiceNoteText: 'Koka! I love playing the Bihu Dhol rhythm with you! See you this weekend for drawing rhinos together!',
    sharedStory: 'Ananya loves sitting on your lap while listening to bedtime folklore stories about Majuli island and clever village foxes.',
    keyMemories: ['Kaziranga Rhino Watching', 'Drawing Bihu Dhol', 'Sunday Garden Storytime'],
  },
  {
    id: 'fam-3',
    patientId: 'patient-ravi-001',
    name: 'Sunita Kumar (Late)',
    relation: 'Spouse',
    relationDetail: 'Beloved Wife of 46 Years',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    location: 'Tezpur Family Ancestral Home',
    phoneNumber: '',
    voiceNoteText: 'Cherished memories of 46 golden years filled with courtyard laughter, festival feasts, and quiet morning tea.',
    sharedStory: 'Sunita and you were married in Tezpur in 1976. She always prepared the sweetest Gur Pitha and nurtured your family garden with loving care.',
    keyMemories: ['Wedding in Tezpur 1976', 'Courtyard Garden Planting', 'Silchar Family Trip'],
  },
  {
    id: 'fam-4',
    patientId: 'patient-ravi-001',
    name: 'Deben Kumar',
    relation: 'Son',
    relationDetail: 'Younger Son (Civil Engineer)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    location: 'Bengaluru / Jorhat',
    phoneNumber: '+91 98450 67890',
    voiceNoteText: 'Deuta, wishing you a calm, joyful day! I will call you this evening after work.',
    sharedStory: 'Deben calls every Tuesday and Friday evening on video call. He loves discussing tea garden harvest stories with you.',
    keyMemories: ['College Graduation', 'Jorhat Tea Estate Walks', 'Family Festival 2019'],
  },
  {
    id: 'fam-5',
    patientId: 'patient-ravi-001',
    name: 'Anand Sharma',
    relation: 'Son-in-law',
    relationDetail: 'Son-in-law & Doctor (Family Physician)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    location: 'Guwahati, Assam',
    phoneNumber: '+91 98641 99887',
    voiceNoteText: 'Namaskar Deuta! Make sure you stay well hydrated today and enjoy your evening music.',
    sharedStory: 'Anand oversees routine health monitoring and ensures prescriptions and gentle physical routines are balanced.',
    keyMemories: ['Family Dinners in Guwahati', 'Diwali Celebrations', 'Health & Wellness Checks'],
  },
  {
    id: 'fam-6',
    patientId: 'patient-ravi-001',
    name: 'Nilakshi Kumar',
    relation: 'Daughter-in-law',
    relationDetail: 'Daughter-in-law (High School Teacher)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    location: 'Jorhat / Guwahati',
    phoneNumber: '+91 98540 33221',
    voiceNoteText: 'Deuta, Rahul made a beautiful sketch of the Brahmaputra river for you! We will bring it this weekend.',
    sharedStory: 'Nilakshi always brings warm homemade Pitha and fresh Assam black tea leaves during their holiday visits.',
    keyMemories: ['Bohag Bihu 2024', 'Family Tea Sessions', 'Brahmaputra Sunset Watch'],
  },
  {
    id: 'fam-7',
    patientId: 'patient-ravi-001',
    name: 'Rahul Kumar',
    relation: 'Grandson',
    relationDetail: 'Elder Grandson (Age 14, Football Enthusiast)',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    location: 'Guwahati, Assam',
    phoneNumber: '+91 98640 55443',
    voiceNoteText: 'Koka! We won our school football match yesterday! I dedicated the winning goal to you!',
    sharedStory: 'Rahul loves learning Assamese proverbs from Koka and plays friendly chess matches on the veranda.',
    keyMemories: ['Chess Matches in Veranda', 'School Football Victory', 'Majuli River Cruise'],
  },
  {
    id: 'fam-8',
    patientId: 'patient-ravi-001',
    name: 'Ishaan Sharma',
    relation: 'Grandson',
    relationDetail: 'Younger Grandson (Age 5)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    location: 'Guwahati, Assam',
    phoneNumber: '+91 98641 99887',
    voiceNoteText: 'Koka! Sing the peacock song with me! I have your favorite drawing ready!',
    sharedStory: 'Ishaan loves sitting by Koka with his toy cars and asking for bedtime tales of elephants and butterflies.',
    keyMemories: ['Peacock Song Singalong', 'Garden Flower Picking', 'Sunday Breakfast Smiles'],
  },
  {
    id: 'fam-9',
    patientId: 'patient-ravi-001',
    name: 'Kamala Devi',
    relation: 'Sister',
    relationDetail: 'Elder Sister (Age 76, Resides in Jorhat)',
    avatarUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80',
    location: 'Jorhat, Assam',
    phoneNumber: '+91 94350 11223',
    voiceNoteText: 'Ravi Bhai, sending you warmest blessings from Jorhat. Keep your heart calm and cheerful!',
    sharedStory: 'Kamala and Ravi grew up near the old tea gardens in Upper Assam, sharing childhood stories and ancestral recipes.',
    keyMemories: ['Childhood in Jorhat', 'Ancestral Tea Garden Walks', 'Festival Reunions'],
  },
  {
    id: 'fam-10',
    patientId: 'patient-ravi-001',
    name: 'Sheru',
    relation: 'Family Pet',
    relationDetail: 'Loyal Golden Retriever (Age 4)',
    avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
    location: 'At Home (Veranda)',
    phoneNumber: '',
    voiceNoteText: 'Sheru wags his tail and waits gently by your chair in the sun-drenched veranda every afternoon.',
    sharedStory: 'Sheru loves walking beside you during morning garden strolls and resting his head gently on your feet.',
    keyMemories: ['Veranda Afternoon Naps', 'Garden Morning Strolls', 'Courtyard Playtime'],
  },

  // MAYA DEVI (SHILLONG)
  {
    id: 'fam-maya-1',
    patientId: 'patient-maya-002',
    name: 'Anil Devi',
    relation: 'Son',
    relationDetail: 'Son & Primary Caregiver (Software Architect)',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    location: 'Shillong, Meghalaya',
    phoneNumber: '+91 98630 88990',
    voiceNoteText: 'Ma, remember I will be home by 5:30 PM with your favorite cherry blossom tea and warm pastries.',
    sharedStory: 'Anil takes Maya on peaceful weekend scenic drives through Shillong pine forests and coordinates her daily wellness routine.',
    keyMemories: ['Umiam Lake Picnic', 'Pine Wood Walks', 'Sunday Choir at Shillong'],
    isPrimaryCaregiver: true,
  },
  {
    id: 'fam-maya-2',
    patientId: 'patient-maya-002',
    name: 'Bipul Devi (Late)',
    relation: 'Spouse',
    relationDetail: 'Beloved Husband & Botanical Researcher',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    location: 'Shillong Hills Family Heritage',
    phoneNumber: '',
    voiceNoteText: 'Cherished memories of four decades exploring orchid hills, botanical wonders, and mountain sunrise walks together.',
    sharedStory: 'Bipul loved collecting mountain ferns and planting hydrangeas with Maya in their Shillong hillside garden.',
    keyMemories: ['Orchid Trail Exploration', 'Mountain Hillside Wedding', 'Hydrangea Garden Planting'],
  },
  {
    id: 'fam-maya-3',
    patientId: 'patient-maya-002',
    name: 'Sunita Lyngdoh',
    relation: 'Daughter-in-law',
    relationDetail: 'Daughter-in-law (Botanical Artist)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    location: 'Shillong, Meghalaya',
    phoneNumber: '+91 98630 44556',
    voiceNoteText: 'Ma, the morning orchids in the balcony are blooming in full magenta! You will love seeing them today.',
    sharedStory: 'Sunita and Maya spend quiet afternoons watercoloring highland flowers and arranging fresh pine cones.',
    keyMemories: ['Flower Painting Afternoons', 'Balcony Orchid Care', 'Christmas Carol Evenings'],
  },
  {
    id: 'fam-maya-4',
    patientId: 'patient-maya-002',
    name: 'Rupa Devi',
    relation: 'Daughter',
    relationDetail: 'Daughter & Classical Violinist (Kolkata)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    location: 'Kolkata, West Bengal',
    phoneNumber: '+91 98300 22119',
    voiceNoteText: 'Ma, I played your favorite Rabindra Sangeet melody on my violin today. Sending you huge hugs and music!',
    sharedStory: 'Rupa calls Maya every morning at 10 AM to play gentle acoustic melodies that bring profound calm.',
    keyMemories: ['Violin Concert in Kolkata', 'Morning Sangeet Duet', 'Mountain Retreat 2022'],
  },
  {
    id: 'fam-maya-5',
    patientId: 'patient-maya-002',
    name: 'Sarah Lyngdoh',
    relation: 'Granddaughter',
    relationDetail: 'Granddaughter (Age 10, School Choir Singer)',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    location: 'Shillong, Meghalaya',
    phoneNumber: '+91 98630 88990',
    voiceNoteText: 'Grandma! I learned a new choir hymn at school and I want to sing it for you this evening!',
    sharedStory: 'Sarah loves baking ginger cookies with Grandma and listening to folk tales of Shillong waterfalls.',
    keyMemories: ['Ginger Cookie Baking', 'Choir Performance 2024', 'Elephant Falls Visit'],
  },
  {
    id: 'fam-maya-6',
    patientId: 'patient-maya-002',
    name: 'Leo',
    relation: 'Family Pet',
    relationDetail: 'Gentle Himalayan Sheepdog (Age 3)',
    avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80',
    location: 'At Home (Living Room Fireplace)',
    phoneNumber: '',
    voiceNoteText: 'Leo curls warmly next to Grandma by the fireplace, keeping her company during serene afternoon reading.',
    sharedStory: 'Leo gently nudges Maya when it is time for her 4 PM herbal tea, bringing comfort and companionship.',
    keyMemories: ['Fireplace Naps', 'Pine Forest Strolls', 'Cozy Tea Companionship'],
  },

  // ANJALI BORA (TEZPUR / GOLAGHAT)
  {
    id: 'fam-anjali-1',
    patientId: 'patient-anjali-003',
    name: 'Mukul Bora',
    relation: 'Spouse',
    relationDetail: 'Loving Husband of 42 Years (Retired Forestry Officer)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    location: 'Tezpur, Assam',
    phoneNumber: '+91 94351 77665',
    voiceNoteText: 'Anjali, I am right here beside you in the courtyard. Let us listen to the birds and enjoy our morning garden walk.',
    sharedStory: 'Mukul and Anjali have shared 42 years of joyful companionship, tea estate walks, and preserving traditional folk handlooms.',
    keyMemories: ['Kaziranga Safari 1984', 'Tezpur Courtyard Planting', 'Silver Jubilee Celebration'],
  },
  {
    id: 'fam-anjali-2',
    patientId: 'patient-anjali-003',
    name: 'Rumi Bora',
    relation: 'Daughter',
    relationDetail: 'Daughter & Master Handloom Weaver (Primary Caregiver)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    location: 'Tezpur, Assam',
    phoneNumber: '+91 98642 11998',
    voiceNoteText: 'Aai, I set up the loom with the golden Muga silk patterns you love! We will weave together this afternoon.',
    sharedStory: 'Rumi learned the art of traditional Assamese silk weaving directly from her mother Anjali and stays by her side daily.',
    keyMemories: ['Muga Silk Weaving at Home', 'Handloom Exhibition 2023', 'Courtyard Tea Moments'],
    isPrimaryCaregiver: true,
  },
  {
    id: 'fam-anjali-3',
    patientId: 'patient-anjali-003',
    name: 'Dipankar Bora',
    relation: 'Son',
    relationDetail: 'Son (Tea Plantation Manager, Golaghat)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    location: 'Golaghat, Assam',
    phoneNumber: '+91 94350 44332',
    voiceNoteText: 'Aai, fresh organic green tea from the estate is coming to you today! Take good rest and stay cheerful.',
    sharedStory: 'Dipankar brings home fresh estate tea leaves and seasonal organic fruits every weekend for Aai.',
    keyMemories: ['Golaghat Tea Harvest', 'Family Rongali Bihu 2023', 'Agnigarh Hilltop Walk'],
  },
  {
    id: 'fam-anjali-4',
    patientId: 'patient-anjali-003',
    name: 'Meera Saikia',
    relation: 'Granddaughter',
    relationDetail: 'Granddaughter (Age 9, Classical Sattriya Dancer)',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    location: 'Tezpur, Assam',
    phoneNumber: '+91 98642 11998',
    voiceNoteText: 'Aita! I will perform my new dance rhythm for you today! You taught me the hand mudras so beautifully!',
    sharedStory: 'Meera learned her first classical Sattriya dance postures and graceful hand gestures from her grandmother Anjali.',
    keyMemories: ['Sattriya Dance Recital', 'Temple Festival Performance', 'Courtyard Story Nights'],
  },
  {
    id: 'fam-anjali-5',
    patientId: 'patient-anjali-003',
    name: 'Bruno',
    relation: 'Family Pet',
    relationDetail: 'Playful Indie Companion Dog',
    avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80',
    location: 'At Home (Courtyard)',
    phoneNumber: '',
    voiceNoteText: 'Bruno happily wags his tail whenever Aai steps into the sunny courtyard, bringing instant warmth and joy.',
    sharedStory: 'Bruno stays near Anjali while she rests in her armchair, offering calm and affectionate company.',
    keyMemories: ['Courtyard Sunbathing', 'Garden Guard Walks', 'Playful Evening Welcomes'],
  }
];

export const INITIAL_CAREGIVER_ALERTS: CaregiverAlert[] = [
  {
    id: 'alert-sos-001',
    patientId: 'patient-ravi-001',
    patientName: 'Ravi Kumar',
    patientRelation: 'Father (Elder)',
    type: 'SOS_EMERGENCY',
    severity: 'CRITICAL',
    message: '1-Tap Emergency SOS Alert Triggered: Patient initiated immediate assistance request.',
    location: 'Home Residence (Living Room / Veranda), Guwahati, Assam',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-sundown-002',
    patientId: 'patient-ravi-001',
    patientName: 'Ravi Kumar',
    patientRelation: 'Father (Elder)',
    type: 'SUNDOWNING_DISTRESS',
    severity: 'WARNING',
    message: 'Evening Disorientation Warning: Elevated restlessness detected during dusk hours. Soothing bamboo flute audio auto-engaged.',
    location: 'Home Residence, Guwahati',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    acknowledged: true,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    acknowledgedBy: 'Priyanka Kumar (Daughter)',
  },
  {
    id: 'alert-mood-003',
    patientId: 'patient-maya-002',
    patientName: 'Maya Devi',
    patientRelation: 'Mother',
    type: 'MOOD_ALERT',
    severity: 'INFO',
    message: 'Facial AI Mood Scan: Mild fatigue and brow tension observed during afternoon check. Relaxing choir audio recommended.',
    location: 'Shillong Residence',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    acknowledged: true,
    acknowledgedAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    acknowledgedBy: 'Anil Devi (Son)',
  }
];

export const INITIAL_MEDICAL_REPORTS: MedicalReportRecord[] = [
  {
    id: 'rep-ravi-001',
    patientId: 'patient-ravi-001',
    reportTitle: 'Comprehensive Neuropsychological & MRI Cognitive Evaluation',
    hospitalName: 'Guwahati Neurological Institute & Research Centre',
    dateEvaluated: '2026-06-18',
    doctorName: 'Dr. Bhaskar Sarma, MD, DM (Neurology)',
    mmseScore: 24, // 24/30 - Mild Cognitive Impairment
    mocaScore: 22, // 22/30
    isApplied: true,
    createdAt: '2026-06-18T10:30:00.000Z',
    extraction: {
      patientName: 'Ravi Kumar',
      age: 72,
      diagnoses: [
        'Amnestic Mild Cognitive Impairment (aMCI) - Early Transition Phase',
        'Age-related Essential Hypertension (Grade 1 - Controlled)',
        'Mild Sundowning Dysphoria with Evening Anxiety Fluctuation'
      ],
      cognitiveStage: 'MILD_COGNITIVE_IMPAIRMENT',
      medications: [
        {
          name: 'Donepezil Hydrochloride',
          dosage: '5 mg',
          timing: 'NIGHT',
          instruction: 'Take 1 tablet after evening meal before bedtime to support cholinergic transmission.'
        },
        {
          name: 'Telmisartan',
          dosage: '40 mg',
          timing: 'MORNING',
          instruction: 'Take 1 tablet in morning with fresh water for blood pressure stabilization.'
        },
        {
          name: 'Citicoline Sodium',
          dosage: '500 mg',
          timing: 'MORNING',
          instruction: 'Take 1 tablet after breakfast to support neuronal membrane phospholipids.'
        },
        {
          name: 'Cholecalciferol (Vitamin D3)',
          dosage: '60,000 IU',
          timing: 'MORNING',
          instruction: 'Once weekly on Sundays with milk.'
        }
      ],
      recommendedCognitiveDomains: [
        'Visual Working Memory & Dual-Tasking',
        'Familiar Facial & Kinship Recall',
        'Daily Living Procedural ADL Sequencer',
        'Acoustic Relaxation & Diaphragmatic Flute Breathing'
      ],
      hydrationTargetGlasses: 8,
      dailyRoutineSummary: 'Structured morning cognitive stimulation (10:00 AM) paired with natural sunlight, mid-day hydration reminders, afternoon resting period, and prompt evening soothing audio at sunset (6:30 PM) to prevent sundowning confusion.',
      precautions: [
        'Avoid abrupt changes in household spatial arrangement.',
        'Keep warm amber nightlights active in hallways and bathrooms.',
        'Ensure daily hydration schedule is strictly maintained.',
        'Encourage gentle, reassuring voice tone with short, positive prompts.'
      ],
      extractedAt: '2026-06-18T11:15:00.000Z',
      confidenceScore: 0.96
    }
  },
  {
    id: 'rep-maya-002',
    patientId: 'patient-maya-002',
    reportTitle: 'Clinical Memory & Geriatric Assessment',
    hospitalName: 'Shillong Civil Hospital - Geriatric Neuro Clinic',
    dateEvaluated: '2026-07-10',
    doctorName: 'Dr. Evelyn Lyngdoh, MD (Geriatric Medicine)',
    mmseScore: 26,
    mocaScore: 25,
    isApplied: true,
    createdAt: '2026-07-10T14:00:00.000Z',
    extraction: {
      patientName: 'Maya Devi',
      age: 68,
      diagnoses: [
        'Early Mild Cognitive Fluctuations with High Functional Independence',
        'Osteoarthritis of Bilateral Knees (Mild)'
      ],
      cognitiveStage: 'EARLY_STAGE',
      medications: [
        {
          name: 'Memantine HCl',
          dosage: '5 mg',
          timing: 'MORNING',
          instruction: 'Take 1 tablet in morning with breakfast.'
        },
        {
          name: 'Calcium + Vitamin D3',
          dosage: '500 mg',
          timing: 'AFTERNOON',
          instruction: 'Take 1 tablet after lunch.'
        }
      ],
      recommendedCognitiveDomains: [
        'Weaving Motif Sequence & Pattern Completion',
        'Attention & Fine Chromatic Color Discrimination',
        'Reminiscence Choirs & Folk Audio'
      ],
      hydrationTargetGlasses: 7,
      dailyRoutineSummary: 'Active morning courtyard walks, weaving pattern challenges, choir reminiscence in the afternoon, and family video check-ins.',
      precautions: [
        'Level flooring without rugs to prevent tripping.',
        'Gentle knee exercises before bedtime.'
      ],
      extractedAt: '2026-07-10T14:30:00.000Z',
      confidenceScore: 0.94
    }
  }
];

class LocalStorageEngine {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Network State Simulation for Offline-First Demonstrations
  public getNetworkState(): 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY' {
    if (!this.isBrowser()) return 'ONLINE';
    const state = localStorage.getItem(STORAGE_KEYS.NETWORK_SIMULATION);
    return (state as 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY') || 'ONLINE';
  }

  public setNetworkState(state: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY'): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.NETWORK_SIMULATION, state);
  }

  // Session Auth Management
  public getLoggedInSession(): { role: UserRole | null; patientId: string | null } {
    if (!this.isBrowser()) return { role: null, patientId: null };
    const data = localStorage.getItem(STORAGE_KEYS.SESSION_AUTH);
    if (!data) return { role: null, patientId: null };
    try {
      return JSON.parse(data);
    } catch {
      return { role: null, patientId: null };
    }
  }

  public setLoggedInSession(role: UserRole | null, patientId?: string | null): void {
    if (!this.isBrowser()) return;
    if (!role) {
      localStorage.removeItem(STORAGE_KEYS.SESSION_AUTH);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION_AUTH, JSON.stringify({ role, patientId: patientId || null }));
      if (patientId) {
        this.setActivePatientId(patientId);
      }
    }
  }

  public clearSession(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.SESSION_AUTH);
  }

  // Multi-Patient Registry Management
  public getPatientRegistry(): PatientProfile[] {
    if (!this.isBrowser()) return DEFAULT_PATIENTS;
    const data = localStorage.getItem(STORAGE_KEYS.PATIENT_REGISTRY);
    if (!data) {
      this.savePatientRegistry(DEFAULT_PATIENTS);
      return DEFAULT_PATIENTS;
    }
    try {
      const list: PatientProfile[] = JSON.parse(data);
      if (!Array.isArray(list) || list.length === 0) {
        this.savePatientRegistry(DEFAULT_PATIENTS);
        return DEFAULT_PATIENTS;
      }
      return list;
    } catch {
      return DEFAULT_PATIENTS;
    }
  }

  public savePatientRegistry(patients: PatientProfile[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PATIENT_REGISTRY, JSON.stringify(patients));
  }

  public getActivePatientId(): string {
    if (!this.isBrowser()) return DEFAULT_PATIENT.id;
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID);
    if (id) return id;
    return DEFAULT_PATIENT.id;
  }

  public setActivePatientId(id: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT_ID, id);
    const match = this.getPatientRegistry().find((p) => p.id === id);
    if (match) {
      this.savePatientProfile(match);
    }
  }

  public getPatientById(id: string): PatientProfile | null {
    const list = this.getPatientRegistry();
    return list.find((p) => p.id === id) || null;
  }

  public registerOrUpdatePatient(profileData: Partial<PatientProfile> & { name: string; preferredLanguage?: any }): PatientProfile {
    const registry = this.getPatientRegistry();
    let patientId = profileData.id;

    if (!patientId) {
      // Check if existing by name
      const existing = registry.find((p) => p.name.trim().toLowerCase() === profileData.name.trim().toLowerCase());
      if (existing) {
        patientId = existing.id;
      } else {
        patientId = `patient-${profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
      }
    }

    const existingIndex = registry.findIndex((p) => p.id === patientId);
    let fullProfile: PatientProfile;

    if (existingIndex >= 0) {
      fullProfile = {
        ...registry[existingIndex],
        ...profileData,
        id: patientId,
        lastSyncTimestamp: new Date().toISOString(),
      };
      registry[existingIndex] = fullProfile;
    } else {
      fullProfile = {
        id: patientId,
        name: profileData.name.trim(),
        age: profileData.age || 70,
        gender: profileData.gender || 'OTHER',
        region: profileData.region || 'Assam (Guwahati)',
        preferredLanguage: profileData.preferredLanguage || 'en',
        culturalInterests: profileData.culturalInterests || [
          'Traditional Bihu & Flute Music',
          'Assam Tea Gardening & Farming',
          'Family & Village Festivals',
        ],
        medicalDataProvided: false,
        caregiverName: profileData.caregiverName || 'Family Caregiver',
        caregiverContact: profileData.caregiverContact || '+91 98000 00000',
        baseline: null,
        currentDifficultyLevel: 2,
        fatigueScore: 15,
        lastSyncTimestamp: new Date().toISOString(),
        syncStatus: 'SYNCED',
        avatarUrl:
          profileData.avatarUrl ||
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      };
      registry.push(fullProfile);
    }

    this.savePatientRegistry(registry);
    this.setActivePatientId(fullProfile.id);
    this.savePatientProfile(fullProfile);
    this.enqueueEvent('PROFILE_UPDATED', { profile: fullProfile }, fullProfile.id);
    return fullProfile;
  }

  // Patient Profile (Backward compatibility)
  public getPatientProfile(): PatientProfile {
    if (!this.isBrowser()) return DEFAULT_PATIENT;
    const activeId = this.getActivePatientId();
    const match = this.getPatientRegistry().find((p) => p.id === activeId);
    if (match) return match;

    const data = localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(DEFAULT_PATIENT));
      return DEFAULT_PATIENT;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_PATIENT;
    }
  }

  public savePatientProfile(profile: PatientProfile): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));
    // Also sync back to registry
    const registry = this.getPatientRegistry();
    const idx = registry.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      registry[idx] = profile;
    } else {
      registry.push(profile);
    }
    this.savePatientRegistry(registry);
  }

  public updatePatientDifficulty(patientId: string, newLevel: number): void {
    const profile = this.getPatientProfile();
    if (profile.id === patientId || !patientId) {
      profile.currentDifficultyLevel = newLevel;
      this.savePatientProfile(profile);
    }
  }

  // Sync Queue
  public getSyncQueue(): SyncEvent[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public enqueueEvent(eventType: SyncEvent['eventType'], payload: Record<string, unknown>, patientId: string = 'patient-ravi-001'): SyncEvent {
    const queue = this.getSyncQueue();
    const newEvent: SyncEvent = {
      eventId: 'evt-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now(),
      patientId,
      eventType,
      timestamp: new Date().toISOString(),
      payload,
      syncStatus: this.getNetworkState() === 'ONLINE' ? 'SYNCED' : 'PENDING',
      retryCount: 0,
      version: 1,
    };

    queue.push(newEvent);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }
    return newEvent;
  }

  public markEventsSynced(eventIds: string[]): void {
    if (!this.isBrowser()) return;
    const queue = this.getSyncQueue();
    const updated = queue.map(e => eventIds.includes(e.eventId) ? { ...e, syncStatus: 'SYNCED' as const } : e);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updated));
  }

  public clearSyncedQueue(): void {
    if (!this.isBrowser()) return;
    const queue = this.getSyncQueue();
    const pendingOnly = queue.filter(e => e.syncStatus !== 'SYNCED');
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(pendingOnly));
  }

  // Game Sessions
  public getGameSessions(patientId?: string): GameSessionResult[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS);
    if (!data) return [];
    try {
      const all: GameSessionResult[] = JSON.parse(data);
      return patientId ? all.filter(s => s.patientId === patientId) : all;
    } catch {
      return [];
    }
  }

  public saveGameSession(session: GameSessionResult): void {
    const sessions = this.getGameSessions();
    sessions.unshift(session);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(sessions));
    }
    // Enqueue event
    this.enqueueEvent('GAME_COMPLETED', { ...session }, session.patientId);
  }

  public addGameSession(session: GameSessionResult): void {
    this.saveGameSession(session);
  }

  // Memories
  public getMemories(): MemoryItem[] {
    if (!this.isBrowser()) return INITIAL_MEMORIES;
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_MEMORIES);
    if (!data) {
      this.saveMemories(INITIAL_MEMORIES);
      return INITIAL_MEMORIES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_MEMORIES;
    }
  }

  public saveMemories(memories: MemoryItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LOCAL_MEMORIES, JSON.stringify(memories));
  }

  public addMemory(memory: MemoryItem): void {
    const list = this.getMemories();
    list.unshift(memory);
    this.saveMemories(list);
  }

  // Reminders
  public getReminders(): ReminderItem[] {
    if (!this.isBrowser()) return INITIAL_REMINDERS;
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_REMINDERS);
    if (!data) {
      this.saveReminders(INITIAL_REMINDERS);
      return INITIAL_REMINDERS;
    }
    try {
      const parsed: ReminderItem[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed;
      }
      // Upgrade older sparse list to full dementia routine
      this.saveReminders(INITIAL_REMINDERS);
      return INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  }

  public saveReminders(reminders: ReminderItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LOCAL_REMINDERS, JSON.stringify(reminders));
  }

  public addReminder(item: ReminderItem): void {
    const list = this.getReminders();
    list.push(item);
    this.saveReminders(list);
  }

  public updateReminder(updated: ReminderItem): void {
    const list = this.getReminders();
    const index = list.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    this.saveReminders(list);
    if (updated.status === 'ACKNOWLEDGED') {
      this.enqueueEvent('REMINDER_ACKNOWLEDGED', { reminderId: updated.id, title: updated.title });
    }
  }

  public deleteReminder(id: string): void {
    const list = this.getReminders().filter(r => r.id !== id);
    this.saveReminders(list);
  }

  public resetRemindersToDefault(): ReminderItem[] {
    this.saveReminders(INITIAL_REMINDERS);
    return INITIAL_REMINDERS;
  }

  public updateReminderStatus(id: string, status: ReminderItem['status']): void {
    const list = this.getReminders();
    const updated = list.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          acknowledgedAt: status === 'ACKNOWLEDGED' ? new Date().toISOString() : r.acknowledgedAt,
        };
      }
      return r;
    });
    this.saveReminders(updated);

    if (status === 'ACKNOWLEDGED') {
      this.enqueueEvent('REMINDER_ACKNOWLEDGED', { reminderId: id });
    } else if (status === 'SKIPPED') {
      this.enqueueEvent('REMINDER_SKIPPED', { reminderId: id });
    }
  }

  // Caregiver Instructions
  public getCaregiverInstructions(): CaregiverInstruction[] {
    if (!this.isBrowser()) return INITIAL_INSTRUCTIONS;
    const data = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INSTRUCTIONS);
    if (!data) {
      this.saveCaregiverInstructions(INITIAL_INSTRUCTIONS);
      return INITIAL_INSTRUCTIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_INSTRUCTIONS;
    }
  }

  public saveCaregiverInstructions(instructions: CaregiverInstruction[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_INSTRUCTIONS, JSON.stringify(instructions));
  }

  public addCaregiverInstruction(inst: CaregiverInstruction): void {
    const list = this.getCaregiverInstructions();
    list.unshift(inst);
    this.saveCaregiverInstructions(list);
    this.enqueueEvent('CAREGIVER_INSTRUCTION_ADDED', { ...inst });
  }

  // AI Observations
  public getAIObservations(): AIObservation[] {
    if (!this.isBrowser()) return INITIAL_OBSERVATIONS;
    const data = localStorage.getItem(STORAGE_KEYS.AI_OBSERVATIONS);
    if (!data) {
      this.saveAIObservations(INITIAL_OBSERVATIONS);
      return INITIAL_OBSERVATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_OBSERVATIONS;
    }
  }

  public getObservations(): AIObservation[] {
    return this.getAIObservations();
  }

  public saveAIObservations(observations: AIObservation[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.AI_OBSERVATIONS, JSON.stringify(observations));
  }

  public getPendingSyncCount(): number {
    return this.getSyncQueue().filter(e => e.syncStatus === 'PENDING').length;
  }

  public getPendingEvents(): SyncEvent[] {
    return this.getSyncQueue().filter(e => e.syncStatus === 'PENDING');
  }

  public saveCaregiverInstruction(inst: CaregiverInstruction): void {
    this.addCaregiverInstruction(inst);
  }

  public saveMemory(memory: MemoryItem): void {
    const list = this.getMemories();
    const existingIdx = list.findIndex(m => m.id === memory.id);
    if (existingIdx >= 0) {
      list[existingIdx] = memory;
      this.saveMemories(list);
    } else {
      this.addMemory(memory);
    }
  }

  // App Settings (Font size, high contrast, auto camera, etc.)
  public getAppSettings(): AppSettings {
    if (!this.isBrowser()) return DEFAULT_APP_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
      return DEFAULT_APP_SETTINGS;
    }
    try {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  public saveAppSettings(settings: Partial<AppSettings>): AppSettings {
    if (!this.isBrowser()) return { ...DEFAULT_APP_SETTINGS, ...settings };
    let current = DEFAULT_APP_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (data) {
      try {
        current = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) };
      } catch {}
    }
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Patient Mood Logs
  public getMoodLogs(): PatientMoodLog[] {
    if (!this.isBrowser()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public getLatestMood(): PatientMoodLog | null {
    const logs = this.getMoodLogs();
    return logs.length > 0 ? logs[0] : null;
  }

  public addMoodLog(log: PatientMoodLog): void {
    if (!this.isBrowser()) return;
    const logs = this.getMoodLogs();
    logs.unshift(log);
    // Keep max 50 logs
    const trimmed = logs.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(trimmed));
    this.enqueueEvent('PROFILE_UPDATED', { moodLogged: log.mood, confidence: log.confidence, timestamp: log.detectedAt });
  }

  // Caregiver Alert Management
  public getCaregiverAlerts(patientId?: string): CaregiverAlert[] {
    if (!this.isBrowser()) return INITIAL_CAREGIVER_ALERTS;
    const data = localStorage.getItem(STORAGE_KEYS.CAREGIVER_ALERTS);
    if (!data) {
      this.saveCaregiverAlerts(INITIAL_CAREGIVER_ALERTS);
      return patientId ? INITIAL_CAREGIVER_ALERTS.filter(a => a.patientId === patientId) : INITIAL_CAREGIVER_ALERTS;
    }
    try {
      const all: CaregiverAlert[] = JSON.parse(data);
      return patientId ? all.filter(a => a.patientId === patientId) : all;
    } catch {
      return INITIAL_CAREGIVER_ALERTS;
    }
  }

  public saveCaregiverAlerts(alerts: CaregiverAlert[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_ALERTS, JSON.stringify(alerts));
  }

  public addCaregiverAlert(alert: Omit<CaregiverAlert, 'id' | 'timestamp' | 'acknowledged'> & Partial<Pick<CaregiverAlert, 'id' | 'timestamp' | 'acknowledged'>>): void {
    const list = this.getCaregiverAlerts();
    const fullAlert: CaregiverAlert = {
      id: alert.id || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: alert.timestamp || new Date().toISOString(),
      acknowledged: alert.acknowledged || false,
      ...alert,
    };
    list.unshift(fullAlert);
    this.saveCaregiverAlerts(list);
    this.enqueueEvent('SOS_TRIGGERED', { ...fullAlert }, fullAlert.patientId);
  }

  public acknowledgeCaregiverAlert(id: string, byName: string = 'Caregiver'): void {
    const list = this.getCaregiverAlerts();
    const updated = list.map(a => {
      if (a.id === id) {
        return {
          ...a,
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: byName,
        };
      }
      return a;
    });
    this.saveCaregiverAlerts(updated);
  }

  public getUnacknowledgedAlertsCount(): number {
    return this.getCaregiverAlerts().filter(a => !a.acknowledged).length;
  }

  // Family Members Management
  public getFamilyMembers(patientId?: string): FamilyMember[] {
    if (!this.isBrowser()) return INITIAL_FAMILY_MEMBERS;
    const data = localStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
    if (!data) {
      this.saveFamilyMembers(INITIAL_FAMILY_MEMBERS);
      return patientId ? INITIAL_FAMILY_MEMBERS.filter(m => m.patientId === patientId) : INITIAL_FAMILY_MEMBERS;
    }
    try {
      const all: FamilyMember[] = JSON.parse(data);
      return patientId ? all.filter(m => m.patientId === patientId) : all;
    } catch {
      return INITIAL_FAMILY_MEMBERS;
    }
  }

  public saveFamilyMembers(members: FamilyMember[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
  }

  public addFamilyMember(member: FamilyMember): void {
    const list = this.getFamilyMembers();
    list.unshift(member);
    this.saveFamilyMembers(list);
    this.enqueueEvent('PROFILE_UPDATED', { newFamilyMember: member.name }, member.patientId);
  }

  public updateFamilyMember(updated: FamilyMember): void {
    const list = this.getFamilyMembers();
    const idx = list.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    this.saveFamilyMembers(list);
    this.enqueueEvent('PROFILE_UPDATED', { updatedFamilyMember: updated.name }, updated.patientId);
  }

  public deleteFamilyMember(id: string): void {
    const list = this.getFamilyMembers().filter(m => m.id !== id);
    this.saveFamilyMembers(list);
  }

  public autoPopulateFamilyForPatient(patientId: string): FamilyMember[] {
    const activeMembers = this.getFamilyMembers(patientId);
    const existingNames = new Set(activeMembers.map(m => m.name.toLowerCase()));
    
    // Rich template relatives generator
    const patient = this.getPatientRegistry().find(p => p.id === patientId) || this.getPatientProfile();
    const firstName = patient.name.split(' ')[0];

    const potentialRelatives: Array<Omit<FamilyMember, 'id' | 'patientId'>> = [
      {
        name: 'Sunita Kumar (Late)',
        relation: 'Spouse',
        relationDetail: `Beloved Life Partner of 46 Years`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region} Ancestral Home`,
        phoneNumber: '',
        voiceNoteText: `Cherished memories of 46 golden years filled with courtyard laughter, festival feasts, and quiet morning tea.`,
        sharedStory: `Shared decades of warmth, courtyard gardening, and traditional festival cooking together.`,
        keyMemories: ['Wedding Anniversary', 'Courtyard Garden', 'Family Festivals'],
      },
      {
        name: 'Priyanka Kumar',
        relation: 'Daughter',
        relationDetail: `Elder Daughter & Primary Caregiver`,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region} (15 mins away)`,
        phoneNumber: '+91 98640 12345',
        voiceNoteText: `Deuta, remember I am just a quick phone call away. You are doing wonderfully with your morning tea and cards!`,
        sharedStory: `Visits every Sunday morning with fresh herbs and coordinates all daily wellness routines.`,
        keyMemories: ['Sunday Visits', 'Festival Cooking', 'Evening Walks'],
        isPrimaryCaregiver: true,
      },
      {
        name: 'Deben Kumar',
        relation: 'Son',
        relationDetail: `Son & Civil Engineer`,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        location: 'Bengaluru / Guwahati',
        phoneNumber: '+91 98450 67890',
        voiceNoteText: `Deuta, wishing you a calm, joyful day! I will call you this evening after work.`,
        sharedStory: `Calls every Tuesday and Friday evening on video call, sharing stories and laughs.`,
        keyMemories: ['College Graduation', 'Tea Garden Walks', 'Festival Reunions'],
      },
      {
        name: 'Ananya Kumar',
        relation: 'Granddaughter',
        relationDetail: `Loving Granddaughter (Age 8)`,
        avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 98640 12345',
        voiceNoteText: `Koka! I love playing music and drawing colorful birds with you! See you this weekend!`,
        sharedStory: `Loves sitting on your lap listening to traditional bedtime folklore tales.`,
        keyMemories: ['Drawing Birds', 'Bedtime Folklore', 'Garden Strolls'],
      },
      {
        name: 'Rahul Kumar',
        relation: 'Grandson',
        relationDetail: `Grandson (Age 14, Football & Chess Enthusiast)`,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 98640 55443',
        voiceNoteText: `Koka! We won our football match yesterday! I played with all the encouragement you gave me!`,
        sharedStory: `Plays friendly weekend chess matches in the veranda while enjoying ginger biscuits.`,
        keyMemories: ['Veranda Chess', 'Football Match Cheer', 'River Walk'],
      },
      {
        name: 'Ishaan Sharma',
        relation: 'Grandson',
        relationDetail: `Youngest Grandson (Age 5)`,
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 98641 99887',
        voiceNoteText: `Koka! Sing the peacock song with me! I made a paper boat for you!`,
        sharedStory: `Loves showing off his colorful kindergarten drawings and asking for rhymes.`,
        keyMemories: ['Peacock Song', 'Paper Boats', 'Sunday Smiles'],
      },
      {
        name: 'Dr. Anand Sharma',
        relation: 'Son-in-law',
        relationDetail: `Son-in-law & Doctor (Family Physician)`,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 98641 99887',
        voiceNoteText: `Namaskar Deuta! Stay well hydrated today and enjoy your relaxing morning music.`,
        sharedStory: `Ensures all nutrition, hydration, and gentle physical exercises are smoothly balanced.`,
        keyMemories: ['Diwali Dinners', 'Health Routine', 'Holiday Lunches'],
      },
      {
        name: 'Nilakshi Kumar',
        relation: 'Daughter-in-law',
        relationDetail: `Daughter-in-law (High School Teacher)`,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 98540 33221',
        voiceNoteText: `Deuta, we are bringing fresh garden tea and sweet snacks for you this Sunday!`,
        sharedStory: `Brings homemade sweet delicacies and fresh organic tea leaves every holiday.`,
        keyMemories: ['Holiday Snacks', 'Family Gatherings', 'Sunset Tea'],
      },
      {
        name: 'Kamala Devi',
        relation: 'Sister',
        relationDetail: `Elder Sister (Age 76, Resides in Jorhat)`,
        avatarUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80',
        location: 'Jorhat, Assam',
        phoneNumber: '+91 94350 11223',
        voiceNoteText: `${firstName} Bhai, sending you warmest blessings. Keep your heart calm and cheerful!`,
        sharedStory: `Shared joyful childhood years near the lush hills and ancestral gardens.`,
        keyMemories: ['Childhood Days', 'Ancestral Home', 'Festival Reunions'],
      },
      {
        name: 'Prof. Amal Dutta',
        relation: 'Lifelong Friend',
        relationDetail: `College Batchmate & Chess Partner (Friend of 50 Years)`,
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
        location: `${patient.region}`,
        phoneNumber: '+91 94350 88776',
        voiceNoteText: `My dear friend ${firstName}! Looking forward to our next cup of hot tea and recalling university days!`,
        sharedStory: `Met at Cotton University in 1972 and met every month for tea, literature, and chess.`,
        keyMemories: ['University Days 1972', 'Chess Tournaments', 'Evening Tea Debates'],
      },
      {
        name: 'Sheru',
        relation: 'Family Pet',
        relationDetail: `Loyal Golden Retriever (Age 4)`,
        avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80',
        location: 'At Home (Veranda)',
        phoneNumber: '',
        voiceNoteText: `Sheru wags his tail and waits gently by your chair in the sun-drenched veranda every afternoon.`,
        sharedStory: `Sheru loves walking beside you during morning garden strolls and resting his head gently on your feet.`,
        keyMemories: ['Veranda Naps', 'Garden Morning Strolls', 'Courtyard Playtime'],
      }
    ];

    const toAdd = potentialRelatives.filter(r => !existingNames.has(r.name.toLowerCase()));
    
    // Add missing relatives
    toAdd.forEach((rel, index) => {
      const newMember: FamilyMember = {
        ...rel,
        id: `fam-auto-${Date.now()}-${index}`,
        patientId,
      };
      this.addFamilyMember(newMember);
    });

    return this.getFamilyMembers(patientId);
  }

  // Medical Reports Management
  public getMedicalReports(patientId?: string): MedicalReportRecord[] {
    if (!this.isBrowser()) return INITIAL_MEDICAL_REPORTS;
    const data = localStorage.getItem(STORAGE_KEYS.MEDICAL_REPORTS);
    if (!data) {
      this.saveMedicalReports(INITIAL_MEDICAL_REPORTS);
      return patientId ? INITIAL_MEDICAL_REPORTS.filter(r => r.patientId === patientId) : INITIAL_MEDICAL_REPORTS;
    }
    try {
      const all: MedicalReportRecord[] = JSON.parse(data);
      return patientId ? all.filter(r => r.patientId === patientId) : all;
    } catch {
      return INITIAL_MEDICAL_REPORTS;
    }
  }

  public saveMedicalReports(reports: MedicalReportRecord[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.MEDICAL_REPORTS, JSON.stringify(reports));
  }

  public addMedicalReport(report: MedicalReportRecord): void {
    const list = this.getMedicalReports();
    list.unshift(report);
    this.saveMedicalReports(list);
    this.enqueueEvent('PROFILE_UPDATED', { medicalReportAdded: report.reportTitle }, report.patientId);
  }

  public applyMedicalReportToPatient(reportId: string): { success: boolean; message: string } {
    const reports = this.getMedicalReports();
    const target = reports.find(r => r.id === reportId);
    if (!target) return { success: false, message: 'Report not found' };

    // Update patient profile with new conditions and medications
    const profile = this.getPatientRegistry().find(p => p.id === target.patientId) || this.getPatientProfile();
    profile.medicalDataProvided = true;
    profile.medicalConditions = target.extraction.diagnoses;
    profile.medicationsSummary = target.extraction.medications.map(m => `${m.name} (${m.dosage}) - ${m.timing}`);

    // Update medications as reminders
    const reminders = this.getReminders();
    target.extraction.medications.forEach((med, idx) => {
      const exists = reminders.some(r => r.title.toLowerCase().includes(med.name.toLowerCase()));
      if (!exists) {
        const timeMap = {
          MORNING: '08:00 AM',
          AFTERNOON: '01:00 PM',
          EVENING: '06:30 PM',
          NIGHT: '09:00 PM',
        };
        reminders.push({
          id: `rem-med-${Date.now()}-${idx}`,
          patientId: target.patientId,
          title: `${med.name} (${med.dosage})`,
          type: 'MEDICATION',
          scheduledTime: timeMap[med.timing] || '08:00 AM',
          timeOfDay: med.timing,
          dosageOrInstruction: med.instruction,
          status: 'PENDING',
          voicePromptText: `Time for your ${med.timing.toLowerCase()} medication: ${med.name} with warm water.`,
        });
      }
    });

    this.saveReminders(reminders);
    this.savePatientProfile(profile);

    // Mark report applied
    target.isApplied = true;
    this.saveMedicalReports(reports);

    return { 
      success: true, 
      message: `Successfully integrated report for ${profile.name}! Medication schedule & clinical guidelines updated.` 
    };
  }

  public resetToDemo(): void {
    this.resetToDemoData();
  }

  // Reset to initial demo state
  public resetToDemoData(): void {
    if (!this.isBrowser()) return;
    this.savePatientRegistry(DEFAULT_PATIENTS);
    this.setActivePatientId(DEFAULT_PATIENTS[0].id);
    this.savePatientProfile(DEFAULT_PATIENTS[0]);
    this.saveMemories(INITIAL_MEMORIES);
    this.saveReminders(INITIAL_REMINDERS);
    this.saveCaregiverInstructions(INITIAL_INSTRUCTIONS);
    this.saveAIObservations(INITIAL_OBSERVATIONS);
    this.saveAppSettings(DEFAULT_APP_SETTINGS);
    this.saveCaregiverAlerts(INITIAL_CAREGIVER_ALERTS);
    this.saveFamilyMembers(INITIAL_FAMILY_MEMBERS);
    this.saveMedicalReports(INITIAL_MEDICAL_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.MOOD_LOGS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.GAME_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SESSION_AUTH);
    this.setNetworkState('ONLINE');
  }
}

export const localDB = new LocalStorageEngine();
