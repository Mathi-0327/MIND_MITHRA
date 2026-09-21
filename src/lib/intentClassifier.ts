import { 
  MindMithraIntent, 
  IntentClassificationResult, 
  IntentAction, 
  SupportedLanguage,
  GameCategory 
} from '../types';

interface IntentRule {
  intent: MindMithraIntent;
  keywords: string[];
  patterns?: RegExp[];
  actionType?: IntentAction['type'];
  targetRoute?: IntentAction['targetRoute'];
  sentiment?: 'TIRED' | 'HAPPY' | 'CONFUSED' | 'SAD' | 'CALM' | 'ANXIOUS' | 'LONELY' | 'HUNGRY';
  baseConfidence: number;
}

export class IntentClassifier {
  private rules: IntentRule[] = [
    // 1. Critical Emergency / SOS (Highest Priority)
    {
      intent: 'EMERGENCY',
      keywords: ['emergency', 'sos', 'save me', 'danger', 'fell down', 'chest pain', 'cannot breathe', 'alert doctor', 'alert ambulance', 'help emergency'],
      patterns: [/\b(emergency|sos|fell\s+down|heart\s+attack|can'?t\s+breathe)\b/i],
      actionType: 'TRIGGER_EMERGENCY_SOS',
      baseConfidence: 0.99,
    },
    {
      intent: 'HELP',
      keywords: ['help me', 'i need help', 'assist me', 'can you help'],
      patterns: [/\b(help\s+me|need\s+help|assist\s+me)\b/i],
      baseConfidence: 0.92,
    },
    {
      intent: 'STOP',
      keywords: ['stop', 'quiet', 'be quiet', 'shut up', 'silence', 'pause'],
      patterns: [/\b(stop|quiet|silence)\b/i],
      baseConfidence: 0.95,
    },
    {
      intent: 'CANCEL',
      keywords: ['cancel', 'never mind', 'forget it', 'go back'],
      patterns: [/\b(cancel|never\s+mind|go\s+back)\b/i],
      actionType: 'NAVIGATE_HOME',
      targetRoute: 'HOME',
      baseConfidence: 0.93,
    },
    {
      intent: 'GO_HOME',
      keywords: ['go home', 'home screen', 'take me home', 'main screen', 'back home'],
      patterns: [/\b(go\s+home|main\s+screen|take\s+me\s+home)\b/i],
      actionType: 'NAVIGATE_HOME',
      targetRoute: 'HOME',
      baseConfidence: 0.96,
    },

    // 2. Specific Emotional / User States
    {
      intent: 'USER_FEELING_TIRED',
      keywords: ['tired', 'exhausted', 'sleepy', 'need rest', 'no energy', 'feeling low'],
      patterns: [
        /\b(?:i\s+am|i'?m|feel(?:ing)?)\s+(?:very\s+|so\s+|really\s+|quite\s+|a\s+bit\s+)?tired\b/i,
        /\b(exhausted|sleepy|need\s+rest|too\s+tired)\b/i,
      ],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'TIRED',
      baseConfidence: 0.96,
    },
    {
      intent: 'USER_FEELING_CONFUSED',
      keywords: ['i am confused', "i'm confused", 'where am i', 'what day is it', 'disoriented', 'lost my train of thought', 'foggy'],
      patterns: [/\b(confused|where\s+am\s+i|disoriented|foggy|don'?t\s+remember)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'CONFUSED',
      baseConfidence: 0.94,
    },
    {
      intent: 'USER_FEELING_ANXIOUS',
      keywords: ['anxious', 'nervous', 'scared', 'frightened', 'worried', 'feeling panic'],
      patterns: [/\b(?:i\s+am|i'?m|feel(?:ing)?)\s+(?:very\s+|so\s+|really\s+)?(nervous|scared|anxious|worried|frightened)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'ANXIOUS',
      baseConfidence: 0.95,
    },
    {
      intent: 'USER_FEELING_HAPPY',
      keywords: ['i am happy', "i'm feeling great", 'wonderful day', 'cheerful', 'so joyful', 'feeling good'],
      patterns: [/\b(feel(?:ing)?\s+happy|feeling\s+great|wonderful\s+day|so\s+happy|cheerful)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'HAPPY',
      baseConfidence: 0.95,
    },
    {
      intent: 'USER_STATE_EXPRESSION',
      keywords: ['i am lonely', 'feeling lonely', 'lonely today', 'so lonely', 'i feel lonely', 'i am alone'],
      patterns: [/\b(lonely|alone|feeling\s+lonely|feel\s+lonely)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'LONELY',
      baseConfidence: 0.96,
    },
    {
      intent: 'USER_STATE_EXPRESSION',
      keywords: ['i am hungry', 'hungry', 'need food', 'want tea', 'had tea', 'want to eat'],
      patterns: [/\b(hungry|need\s+food|want\s+to\s+eat|want\s+food)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'HUNGRY',
      baseConfidence: 0.95,
    },
    {
      intent: 'USER_FEELING_SAD',
      keywords: ['i am sad', 'missing my family', 'unhappy', 'feeling down'],
      patterns: [/\b(feel(?:ing)?\s+sad|missing\s+my|feeling\s+down|unhappy)\b/i],
      actionType: 'RECORD_MOOD_STATE',
      sentiment: 'SAD',
      baseConfidence: 0.94,
    },
    {
      intent: 'DAILY_ACTIVITY',
      keywords: ['went to the market', 'went to market', 'had tea', 'walk in the garden', 'visited temple', 'went for a walk', 'daughter called', 'son called', 'called me', 'visited me', 'came to visit'],
      patterns: [
        /\b(went\s+to\s+(the\s+)?(market|bazaar|temple|garden|shop)|had\s+tea|went\s+for\s+a\s+walk|walk\s+outside)\b/i,
        /\b(daughter|son|brother|sister|wife|husband|granddaughter|grandson|friend)\s+(called|visited|came|phoned|spoke)\b/i,
      ],
      baseConfidence: 0.95,
    },
    {
      intent: 'TELL_STORY',
      keywords: ['tell me a story', 'tell a story', 'share a story', 'cultural story', 'traditional tale', 'folk tale'],
      patterns: [/\b(tell\s+(me\s+)?a\s+story|share\s+a\s+story|tell\s+a\s+tale)\b/i],
      actionType: 'NAVIGATE_STORY',
      targetRoute: 'STORY_BUILDER',
      baseConfidence: 0.95,
    },

    // 3. Conversational Politeness & Openers (NO ACTION ROUTING)
    {
      intent: 'HOW_ARE_YOU',
      keywords: ['how are you', 'how are you doing', 'how do you feel', 'are you doing well', 'kene asa', 'kemon acho', 'aap kaise ho', 'eppadi irukkinga', 'কেনে আছা', 'কেমন আছো', 'কেমন আছেন', 'कैसे हो', 'कैसे हैं', 'எப்படி இருக்கீங்க'],
      patterns: [
        /\b(how\s+are\s+you|how\s+do\s+you\s+feel|how\s+are\s+you\s+doing|kene\s+asa|kemon\s+acho|kaise\s+ho|eppadi\s+iruk)\b/i,
        /(কেনে\s*আছা|কেমন\s*আছো|কেমন\s*আছেন|कैसे\s*हो|कैसे\s*हैं|எப்படி\s*இருக்கீங்க)/,
      ],
      baseConfidence: 0.97,
    },
    {
      intent: 'GENERAL_GREETING',
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'nomoshkar', 'vanakkam', 'chibai', 'khublei', 'নমস্কাৰ', 'নমস্কার', 'नमस्ते', 'வணக்கம்'],
      patterns: [
        /\b(hello|hi|hey|good\s+(morning|afternoon|evening)|namaste|nomoshkar|vanakkam|chibai|khublei)\b/i,
        /(নমস্কাৰ|নমস্কার|नमस्ते|வணக்கம்)/,
      ],
      baseConfidence: 0.96,
    },
    {
      intent: 'THANK_YOU',
      keywords: ['thank you', 'thanks', 'dhanyabad', 'nandri', 'shukriya', 'thank you so much'],
      patterns: [/\b(thank\s+you|thanks|dhanyabad|nandri|shukriya)\b/i],
      baseConfidence: 0.96,
    },
    {
      intent: 'GOODBYE',
      keywords: ['goodbye', 'bye bye', 'see you later', 'good night', 'going to sleep'],
      patterns: [/\b(goodbye|bye|see\s+you|good\s+night)\b/i],
      baseConfidence: 0.95,
    },
    {
      intent: 'CASUAL_QUESTION',
      keywords: ['what is your name', 'who are you', 'what can you do', 'who made you'],
      patterns: [/\b(who\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do)\b/i],
      baseConfidence: 0.93,
    },

    // 4. Family & Kinship Actions
    {
      intent: 'CALL_FAMILY_MEMBER',
      keywords: ['call my daughter', 'call priyanka', 'call my son', 'call my husband', 'phone priyanka', 'call ananya', 'contact family', 'call family'],
      patterns: [/\b(call|phone|ring)\s+(my\s+)?(daughter|son|granddaughter|priyanka|ananya|family)\b/i],
      actionType: 'NAVIGATE_FAMILY',
      targetRoute: 'FAMILY_TREE',
      baseConfidence: 0.95,
    },
    {
      intent: 'PLAY_FAMILY_VOICE',
      keywords: ["daughter's voice", 'voice of priyanka', "priyanka's voice", 'play voice note', 'family voice note', 'hear my daughter', "granddaughter's voice"],
      patterns: [/\b(hear|listen\s+to|play)\s+.*(voice\s+note|daughter'?s?\s+voice|priyanka'?s?\s+voice)\b/i],
      actionType: 'PLAY_FAMILY_VOICE',
      targetRoute: 'FAMILY_TREE',
      baseConfidence: 0.95,
    },
    // 5. Memory & Story Actions
    {
      intent: 'SHOW_MEMORIES',
      keywords: ['show my memories', 'open memory vault', 'look at photos', 'photo album', 'show old photos', 'family album', 'revisit memories', 'show photos', 'family photos'],
      patterns: [/\b(?:show|open|look\s+at|view|see)\s+.*(?:memor(?:y|ies)|photo|album|picture)/i],
      actionType: 'NAVIGATE_MEMORIES',
      targetRoute: 'MEMORIES',
      baseConfidence: 0.96,
    },
    {
      intent: 'SHOW_FAMILY',
      keywords: ['family tree', 'show my family', 'who are my children', 'family circle', 'my loved ones'],
      patterns: [/\b(?:show\s+.*(?:family\s+tree|family\s+circle|family\s+members?)|family\s+tree|family\s+circle|who\s+are\s+my\s+children|show\s+(?:my\s+)?family)\b/i],
      actionType: 'NAVIGATE_FAMILY',
      targetRoute: 'FAMILY_TREE',
      baseConfidence: 0.95,
    },
    {
      intent: 'SEARCH_MEMORY',
      keywords: ['find photos of', 'search memory for', 'do you have photos of', 'search for kaziranga', 'show photos of wedding'],
      patterns: [/\b(find|search)\s+.*(photo|memory|picture)\b/i],
      actionType: 'NAVIGATE_MEMORIES',
      targetRoute: 'MEMORIES',
      baseConfidence: 0.92,
    },
    {
      intent: 'CREATE_MEMORY',
      keywords: ['save this as a memory', 'save memory', 'remember this', 'add to my memories', 'record this memory'],
      patterns: [/\b(save|remember|record)\s+.*(memory|this\s+moment)\b/i],
      actionType: 'CREATE_MEMORY',
      targetRoute: 'MEMORIES',
      baseConfidence: 0.93,
    },
    {
      intent: 'START_REMINISCENCE',
      keywords: ['reminiscence theater', 'photo cinema', 'watch photo slideshow', 'start theater'],
      patterns: [/\b(reminiscence|theater|cinema|slideshow)\b/i],
      actionType: 'NAVIGATE_STORY',
      targetRoute: 'STORY_BUILDER',
      baseConfidence: 0.94,
    },
    {
      intent: 'TEACH_MIND_MITHRA',
      keywords: ['teach mind mithra', 'teach you a recipe', 'teach my family', 'share traditional recipe', 'record my wisdom'],
      patterns: [/\b(teach\s+(mind\s+mithra|my\s+family|you)|share\s+recipe)\b/i],
      actionType: 'NAVIGATE_TEACH',
      targetRoute: 'ELDER_KNOWLEDGE',
      baseConfidence: 0.95,
    },

    // 6. Cognitive Workouts & Game Levels
    {
      intent: 'SELECT_GAME_LEVEL',
      keywords: ['level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'harder game', 'easier game', 'change difficulty'],
      patterns: [/\b(level\s+[1-5]|harder|easier|increase\s+difficulty|decrease\s+difficulty)\b/i],
      actionType: 'START_GAME',
      targetRoute: 'GAMES',
      baseConfidence: 0.94,
    },
    {
      intent: 'START_GAME',
      keywords: ['play a game', 'start a game', 'cognitive exercise', 'memory match', 'wildlife spotlight', 'motif weaver', 'start today activity', 'mental workout', 'play puzzle', 'memory game', 'puzzle game'],
      patterns: [/\b(?:play|start)\s+.*(?:game|puzzle|exercise|activity|workout)\b/i, /\b(cognitive\s+exercise|mind\s+game)\b/i],
      actionType: 'START_GAME',
      targetRoute: 'GAMES',
      baseConfidence: 0.95,
    },
    {
      intent: 'SHOW_GAMES',
      keywords: ['show games', 'all games', 'what games are there', 'list activities', 'show exercises'],
      patterns: [/\b(show|list)\s+.*(game|activit|exercise)\b/i],
      actionType: 'NAVIGATE_GAMES',
      targetRoute: 'GAMES',
      baseConfidence: 0.93,
    },
    {
      intent: 'SHOW_PROGRESS',
      keywords: ['show my progress', 'my score', 'how did i do', 'show my results', 'confidence map'],
      patterns: [/\b(my\s+progress|my\s+score|how\s+did\s+i\s+do|my\s+results)\b/i],
      baseConfidence: 0.92,
    },

    // 7. Daily Routine, Journal & Reminders
    {
      intent: 'MEDICATION_REMINDER',
      keywords: ['did i take my medicine', 'did i take my pill', 'when is my medicine', 'blood pressure pill', 'time for pills'],
      patterns: [/\b(medicine|pill|medication|tablet|dosage)\b/i],
      actionType: 'NAVIGATE_REMINDERS',
      targetRoute: 'REMINDERS',
      baseConfidence: 0.95,
    },
    {
      intent: 'SHOW_REMINDERS',
      keywords: ['show my reminders', 'my schedule', 'daily routine', 'what do i have today', 'calendar', 'alarm'],
      patterns: [/\b(show|check)\s+.*(reminder|schedule|routine)\b/i],
      actionType: 'NAVIGATE_REMINDERS',
      targetRoute: 'REMINDERS',
      baseConfidence: 0.94,
    },
    {
      intent: 'START_DAILY_JOURNAL',
      keywords: ['tell me about your day', 'daily journal', 'evening reflection', 'write in my journal', 'today journal'],
      patterns: [/\b(tell\s+me\s+about\s+your\s+day|daily\s+journal|evening\s+reflection)\b/i],
      actionType: 'NAVIGATE_JOURNAL',
      targetRoute: 'JOURNAL',
      baseConfidence: 0.95,
    },

    // 8. Sensory Relaxation & Soundscapes
    {
      intent: 'PLAY_SOUNDSCAPE',
      keywords: ['sound of monsoon rain', 'peaceful flute music', 'bamboo flute', 'bird sounds', 'relaxing music', 'play nature sounds', 'play flute'],
      patterns: [/\b(sound\s+of|monsoon\s+rain|flute\s+music|nature\s+sound|soundscape)\b/i],
      actionType: 'PLAY_SOUNDSCAPE',
      targetRoute: 'RELAX',
      baseConfidence: 0.95,
    },

    // 9. Time & Information Questions
    {
      intent: 'ASK_TIME',
      keywords: ['what time is it', 'what is the time', 'tell me the time', 'current time'],
      patterns: [/\b(what\s+time\s+is\s+it|tell\s+me\s+the\s+time|current\s+time)\b/i],
      baseConfidence: 0.96,
    },
    {
      intent: 'ASK_DATE',
      keywords: ['what day is it', 'what is the date', "what's today's date", 'which day is today'],
      patterns: [/\b(what\s+day\s+is\s+it|what\s+is\s+the\s+date|today'?s?\s+date)\b/i],
      baseConfidence: 0.96,
    },
  ];

  public classify(
    transcript: string, 
    currentLanguage: SupportedLanguage = 'en',
    currentContext?: { currentScreen?: string; currentGame?: string }
  ): IntentClassificationResult {
    const raw = transcript.toLowerCase().trim();
    if (!raw) {
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        language: currentLanguage,
        entities: {},
        action: null,
        requiresClarification: false,
        isMixedIntent: false,
        rawTranscript: transcript,
      };
    }

    // 1. Check for Mixed Intent: e.g. "I'm feeling tired. Can we look at old photos?"
    const hasTired = /\b(tired|sleepy|exhausted|need\s+rest)\b/i.test(raw);
    const hasMemory = /\b(photos?|memor(?:y|ies)|albums?|pictures?)\b/i.test(raw);
    const hasGame = /\b(games?|play(?:ing)?|activit(?:y|ies))\b/i.test(raw);
    const hasMusic = /\b(music|flute|sounds?|songs?|relax(?:ing)?)\b/i.test(raw);

    if (hasTired && hasMemory) {
      return {
        intent: 'USER_FEELING_TIRED',
        confidence: 0.95,
        language: currentLanguage,
        entities: { sentiment: 'TIRED', queryTopic: 'memories' },
        action: { type: 'NAVIGATE_MEMORIES', targetRoute: 'MEMORIES' },
        requiresClarification: false,
        isMixedIntent: true,
        rawTranscript: transcript,
      };
    }

    if (hasTired && hasMusic) {
      return {
        intent: 'USER_FEELING_TIRED',
        confidence: 0.95,
        language: currentLanguage,
        entities: { sentiment: 'TIRED', soundscapeType: 'FLUTE' },
        action: { type: 'PLAY_SOUNDSCAPE', targetRoute: 'RELAX' },
        requiresClarification: false,
        isMixedIntent: true,
        rawTranscript: transcript,
      };
    }

    // 2. Exact / Pattern Matching Across Rules
    for (const rule of this.rules) {
      // Pattern match
      if (rule.patterns && rule.patterns.some(p => p.test(raw))) {
        return this.buildResult(rule, transcript, currentLanguage);
      }
      // Keyword match
      if (rule.keywords.some(k => raw.includes(k))) {
        return this.buildResult(rule, transcript, currentLanguage);
      }
    }

    // 3. Extract Specific Entities Even for General Inputs
    const entities = this.extractEntities(raw);

    // 4. Low Confidence / Ambiguity Detection
    const isVagueCommand = /\b(let'?s\s+do\s+that|open\s+that|do\s+it|that\s+thing|start\s+it)\b/i.test(raw);
    if (isVagueCommand) {
      return {
        intent: 'UNKNOWN',
        confidence: 0.45,
        language: currentLanguage,
        entities,
        action: null,
        requiresClarification: true,
        clarificationPrompt: 'Of course, my dear friend. Would you like to play today\'s gentle game, or would you like to look at your family memories?',
        isMixedIntent: false,
        rawTranscript: transcript,
      };
    }

    // 5. Default to GENERAL_CONVERSATION if it's natural speech
    return {
      intent: 'GENERAL_CONVERSATION',
      confidence: 0.88,
      language: currentLanguage,
      entities,
      action: null,
      requiresClarification: false,
      isMixedIntent: false,
      rawTranscript: transcript,
    };
  }

  private buildResult(rule: IntentRule, rawTranscript: string, language: SupportedLanguage): IntentClassificationResult {
    const raw = rawTranscript.toLowerCase();
    const entities = this.extractEntities(raw);

    if (rule.sentiment) {
      entities.sentiment = rule.sentiment;
      entities.state = rule.sentiment;
    }

    const action: IntentAction | null = rule.actionType
      ? { type: rule.actionType, targetRoute: rule.targetRoute }
      : null;

    return {
      intent: rule.intent,
      confidence: rule.baseConfidence,
      language,
      state: entities.state || rule.sentiment || null,
      entities,
      action,
      requiresClarification: false,
      isMixedIntent: false,
      rawTranscript,
    };
  }

  private extractEntities(raw: string): IntentClassificationResult['entities'] {
    const entities: IntentClassificationResult['entities'] = {};

    // Emotional / User State Extraction
    if (raw.includes('lonely') || raw.includes('alone')) {
      entities.state = 'LONELY';
      entities.sentiment = 'LONELY';
    } else if (raw.includes('hungry') || raw.includes('need food')) {
      entities.state = 'HUNGRY';
      entities.sentiment = 'HUNGRY';
    } else if (raw.includes('tired') || raw.includes('sleepy') || raw.includes('exhausted')) {
      entities.state = 'TIRED';
      entities.sentiment = 'TIRED';
    } else if (raw.includes('happy') || raw.includes('cheerful') || raw.includes('great')) {
      entities.state = 'HAPPY';
      entities.sentiment = 'HAPPY';
    } else if (raw.includes('sad') || raw.includes('down')) {
      entities.state = 'SAD';
      entities.sentiment = 'SAD';
    } else if (raw.includes('confused') || raw.includes('disoriented')) {
      entities.state = 'CONFUSED';
      entities.sentiment = 'CONFUSED';
    }

    // Person & Family Extraction
    if (raw.includes('priyanka')) {
      entities.personName = 'Priyanka';
      entities.relationship = 'Daughter';
      entities.familyMember = 'daughter';
    } else if (raw.includes('ananya')) {
      entities.personName = 'Ananya';
      entities.relationship = 'Granddaughter';
      entities.familyMember = 'granddaughter';
    } else if (raw.includes('daughter')) {
      entities.relationship = 'Daughter';
      entities.personName = 'Priyanka';
      entities.familyMember = 'daughter';
    } else if (raw.includes('granddaughter')) {
      entities.relationship = 'Granddaughter';
      entities.personName = 'Ananya';
      entities.familyMember = 'granddaughter';
    } else if (raw.includes('son')) {
      entities.relationship = 'Son';
      entities.familyMember = 'son';
    } else if (raw.includes('wife')) {
      entities.relationship = 'Wife';
      entities.familyMember = 'wife';
    } else if (raw.includes('husband')) {
      entities.relationship = 'Husband';
      entities.familyMember = 'husband';
    }

    // Activity & Location Extraction
    if (raw.includes('market') || raw.includes('bazaar')) {
      entities.activity = 'market';
    } else if (raw.includes('tea')) {
      entities.activity = 'tea';
    } else if (raw.includes('walk')) {
      entities.activity = 'walk';
    } else if (raw.includes('temple')) {
      entities.activity = 'temple';
    } else if (raw.includes('garden')) {
      entities.activity = 'garden';
    }

    // Time Context
    if (raw.includes('today')) {
      entities.time = 'today';
    } else if (raw.includes('morning')) {
      entities.time = 'morning';
    } else if (raw.includes('evening') || raw.includes('afternoon')) {
      entities.time = 'evening';
    }

    // Game Category Extraction
    if (raw.includes('memory') || raw.includes('match')) {
      entities.gameCategory = 'MEMORY';
    } else if (raw.includes('wildlife') || raw.includes('attention')) {
      entities.gameCategory = 'ATTENTION';
    } else if (raw.includes('pattern') || raw.includes('weaver') || raw.includes('motif')) {
      entities.gameCategory = 'PATTERN';
    } else if (raw.includes('routine') || raw.includes('sequenc')) {
      entities.gameCategory = 'ROUTINE';
    }

    // Level Extraction (1 - 5)
    const levelMatch = raw.match(/\blevel\s+([1-5])\b/i);
    if (levelMatch) {
      entities.level = parseInt(levelMatch[1], 10);
    } else if (raw.includes('harder') || raw.includes('more challenging') || raw.includes('difficult')) {
      entities.level = 4;
    } else if (raw.includes('easier') || raw.includes('simple') || raw.includes('make it easier') || raw.includes('make the game easier')) {
      entities.level = 1;
    }

    // Soundscape Type
    if (raw.includes('rain') || raw.includes('monsoon')) {
      entities.soundscapeType = 'RAIN';
    } else if (raw.includes('flute')) {
      entities.soundscapeType = 'FLUTE';
    } else if (raw.includes('bird')) {
      entities.soundscapeType = 'BIRDS';
    }

    return entities;
  }
}

export const intentClassifier = new IntentClassifier();

export const classifyIntent = (
  text: string,
  language: SupportedLanguage = 'en',
  currentContext?: { currentScreen?: string; currentGame?: string }
): IntentClassificationResult => {
  return intentClassifier.classify(text, language, currentContext);
};
