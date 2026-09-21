import { 
  ControlledContextObject, 
  ConversationTurn, 
  IntentAction, 
  IntentClassificationResult, 
  MindMithraIntent, 
  PatientMoodType, 
  SupportedLanguage,
  PatientProfile,
  FamilyMember,
  MemoryItem
} from '../types';
import { classifyIntent } from './intentClassifier';
import { localDB } from './storage';

export interface VoiceDiagnosticsInfo {
  rawTranscript: string;
  resolvedTranscript: string;
  detectedLanguage: SupportedLanguage;
  intent: MindMithraIntent;
  confidence: number;
  entities: Record<string, any>;
  actionTriggered: string | null;
  contextInjected: {
    patientName: string;
    currentScreen: string;
    historyTurns: number;
    hasFamilyContext: boolean;
    hasRecentMemory: boolean;
  };
  latencyMs: number;
  provider: 'gemini-2.5-flash' | 'gemini-2.0-flash' | 'local-offline';
  audioState: 'idle' | 'listening' | 'processing' | 'speaking';
  timestamp: string;
}

export class AIOrchestrator {
  private rollingHistory: ConversationTurn[] = [];
  private maxHistoryTurns = 6;
  private currentDiagnostics: VoiceDiagnosticsInfo | null = null;
  private diagnosticsListeners: Array<(diag: VoiceDiagnosticsInfo) => void> = [];

  constructor() {
    this.loadHistoryFromSession();
  }

  private loadHistoryFromSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('mind_mithra_ai_rolling_history');
      if (stored) {
        this.rollingHistory = JSON.parse(stored);
      }
    } catch {
      this.rollingHistory = [];
    }
  }

  private persistHistory(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('mind_mithra_ai_rolling_history', JSON.stringify(this.rollingHistory));
    } catch {}
  }

  public getRollingHistory(): ConversationTurn[] {
    return [...this.rollingHistory];
  }

  public addTurn(turn: ConversationTurn): void {
    this.rollingHistory.push(turn);
    if (this.rollingHistory.length > this.maxHistoryTurns) {
      this.rollingHistory = this.rollingHistory.slice(-this.maxHistoryTurns);
    }
    this.persistHistory();
  }

  public clearHistory(): void {
    this.rollingHistory = [];
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mind_mithra_ai_rolling_history');
    }
  }

  public getDiagnostics(): VoiceDiagnosticsInfo | null {
    return this.currentDiagnostics;
  }

  public onDiagnosticsUpdate(listener: (d: VoiceDiagnosticsInfo) => void): () => void {
    this.diagnosticsListeners.push(listener);
    if (this.currentDiagnostics) {
      listener(this.currentDiagnostics);
    }
    return () => {
      this.diagnosticsListeners = this.diagnosticsListeners.filter((l) => l !== listener);
    };
  }

  private emitDiagnostics(diag: VoiceDiagnosticsInfo): void {
    this.currentDiagnostics = diag;
    this.diagnosticsListeners.forEach((fn) => {
      try {
        fn(diag);
      } catch (err) {
        console.error('Error in diagnostics listener:', err);
      }
    });
  }

  // --- Pronoun and Anaphora Resolution ---
  public resolvePronouns(rawInput: string, history: ConversationTurn[], familyMembers: FamilyMember[]): string {
    let resolved = rawInput.trim();
    if (!resolved || history.length === 0) return resolved;

    // Look back at recent user/companion turns
    const lastUserTurn = [...history].reverse().find((t) => t.sender === 'user');
    const lastCompanionTurn = [...history].reverse().find((t) => t.sender === 'companion');
    const recentText = `${lastUserTurn?.text || ''} ${lastCompanionTurn?.text || ''}`.toLowerCase();

    // Check if a family member was recently mentioned
    let targetFamilyMember: FamilyMember | undefined;
    for (const member of familyMembers) {
      if (
        recentText.includes(member.name.toLowerCase()) ||
        recentText.includes(member.relation.toLowerCase())
      ) {
        targetFamilyMember = member;
        break;
      }
    }

    if (targetFamilyMember) {
      // Resolve "she / her" or "he / him"
      if (
        targetFamilyMember.relation.toLowerCase().includes('daughter') ||
        targetFamilyMember.relation.toLowerCase().includes('wife') ||
        targetFamilyMember.relation.toLowerCase().includes('sister') ||
        targetFamilyMember.relation.toLowerCase().includes('mother')
      ) {
        resolved = resolved.replace(/\b(call|contact|message|talk to|about|visit) her\b/gi, `$1 ${targetFamilyMember.name}`);
        resolved = resolved.replace(/\bwhere is she\b/gi, `where is ${targetFamilyMember.name}`);
      } else if (
        targetFamilyMember.relation.toLowerCase().includes('son') ||
        targetFamilyMember.relation.toLowerCase().includes('husband') ||
        targetFamilyMember.relation.toLowerCase().includes('brother') ||
        targetFamilyMember.relation.toLowerCase().includes('father')
      ) {
        resolved = resolved.replace(/\b(call|contact|message|talk to|about|visit) him\b/gi, `$1 ${targetFamilyMember.name}`);
        resolved = resolved.replace(/\bwhere is he\b/gi, `where is ${targetFamilyMember.name}`);
      }
    }

    return resolved;
  }

  // --- Context Gathering Engine ---
  public buildControlledContext(
    currentScreen: string = 'HOME',
    currentGame: string | null = null,
    currentLevel: number | null = null
  ): ControlledContextObject {
    const patient = localDB.getPatientProfile() || {
      id: 'patient-ravi-001',
      name: 'Ravi Kumar',
      preferredLanguage: 'en' as SupportedLanguage,
      region: 'Assam',
      fatigueScore: 10,
      currentDifficultyLevel: 2,
    };

    const memories = localDB.getMemories();
    const family = localDB.getFamilyMembers();
    const prefs = localDB.getUserPreferences(patient.id) || {
      likedThemes: ['Assam Tea Gardens', 'Traditional Bihu', 'Folk Music'],
      favoriteSoundscapes: ['RAIN', 'FLUTE'],
    };

    const gameSessions = localDB.getGameSessions();
    const lastSession = gameSessions[gameSessions.length - 1];

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        preferredLanguage: patient.preferredLanguage,
        region: patient.region,
        fatigueScore: patient.fatigueScore || 0,
        currentDifficultyLevel: patient.currentDifficultyLevel || 1,
      },
      currentScreen,
      currentGame,
      currentLevel,
      recentConversation: this.getRollingHistory(),
      recentMemory: memories.length > 0 ? memories[0] : null,
      recentFamilyMember: family.length > 0 ? family[0] : null,
      preferences: {
        likedThemes: prefs.likedThemes || [],
        favoriteSoundscapes: prefs.favoriteSoundscapes || [],
      },
      recentPerformance: lastSession
        ? {
            lastAccuracy: lastSession.score,
            lastScore: lastSession.score,
            lastGameCategory: lastSession.category,
          }
        : undefined,
    };
  }

  // --- Main Processing Pipeline ---
  public async processUserInput(
    rawTranscript: string,
    options?: {
      currentScreen?: string;
      currentGame?: string;
      currentLevel?: number;
      voiceName?: string;
    }
  ): Promise<{
    replyText: string;
    audioBase64?: string | null;
    action: IntentAction | null;
    intentResult: IntentClassificationResult;
    provider: 'gemini-2.5-flash' | 'gemini-2.0-flash' | 'local-offline';
  }> {
    const startTime = performance.now();
    const patient = localDB.getPatientProfile();
    const lang: SupportedLanguage = patient?.preferredLanguage || 'en';
    const familyMembers = localDB.getFamilyMembers();

    // 1. Pronoun / Anaphora Resolution
    const resolvedTranscript = this.resolvePronouns(
      rawTranscript,
      this.rollingHistory,
      familyMembers
    );

    // Prompt-mandated developer logging
    console.log('\n============================================================');
    console.log('[AIOrchestrator] TRANSCRIPT RECEIVED:', `"${rawTranscript}"`);
    console.log('[AIOrchestrator] AI INPUT:          ', `"${resolvedTranscript}"`);
    console.log('============================================================');

    // 2. Build Controlled Context Object
    const context = this.buildControlledContext(
      options?.currentScreen,
      options?.currentGame,
      options?.currentLevel
    );

    // 3. Layer 1: Classify Intent & Extract Entities
    const intentResult = classifyIntent(resolvedTranscript, lang, {
      currentScreen: context.currentScreen,
      currentGame: context.currentGame || undefined,
    });

    // 4. Check for Explicit Mood & Voice Event Logging (Caregiver Analytics)
    this.checkAndLogExplicitMood(intentResult, patient?.id || 'patient-ravi-001');

    // Add user turn to rolling history
    const userTurn: ConversationTurn = {
      id: `turn-user-${Date.now()}`,
      sender: 'user',
      text: rawTranscript,
      timestamp: new Date().toISOString(),
      intent: intentResult.intent,
      actionTaken: intentResult.action?.type,
    };
    this.addTurn(userTurn);

    // 5. Emergency SOS Priority Bypass
    if (intentResult.intent === 'EMERGENCY') {
      const sosReply = this.getEmergencyResponse(patient?.name || 'Ravi', lang);
      console.log('[AIOrchestrator] AI RESPONSE:        ', `"${sosReply}"`);
      const companionTurn: ConversationTurn = {
        id: `turn-comp-${Date.now()}`,
        sender: 'companion',
        text: sosReply,
        timestamp: new Date().toISOString(),
        intent: 'EMERGENCY',
        actionTaken: 'TRIGGER_EMERGENCY_SOS',
      };
      this.addTurn(companionTurn);

      const elapsed = Math.round(performance.now() - startTime);
      this.emitDiagnostics({
        rawTranscript,
        resolvedTranscript,
        detectedLanguage: lang,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        actionTriggered: 'TRIGGER_EMERGENCY_SOS',
        contextInjected: {
          patientName: context.patient.name,
          currentScreen: context.currentScreen,
          historyTurns: context.recentConversation.length,
          hasFamilyContext: !!context.recentFamilyMember,
          hasRecentMemory: !!context.recentMemory,
        },
        latencyMs: elapsed,
        provider: 'local-offline',
        audioState: 'speaking',
        timestamp: new Date().toISOString(),
      });

      return {
        replyText: sosReply,
        audioBase64: null,
        action: intentResult.action,
        intentResult,
        provider: 'local-offline',
      };
    }

    // 6. Clarification for Low Confidence
    if (intentResult.requiresClarification && intentResult.clarificationPrompt) {
      const clarifyTurn: ConversationTurn = {
        id: `turn-comp-${Date.now()}`,
        sender: 'companion',
        text: intentResult.clarificationPrompt,
        timestamp: new Date().toISOString(),
        intent: intentResult.intent,
      };
      this.addTurn(clarifyTurn);
      console.log('[AIOrchestrator] AI RESPONSE (Clarification):', `"${intentResult.clarificationPrompt}"`);

      const elapsed = Math.round(performance.now() - startTime);
      this.emitDiagnostics({
        rawTranscript,
        resolvedTranscript,
        detectedLanguage: lang,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        actionTriggered: null,
        contextInjected: {
          patientName: context.patient.name,
          currentScreen: context.currentScreen,
          historyTurns: context.recentConversation.length,
          hasFamilyContext: !!context.recentFamilyMember,
          hasRecentMemory: !!context.recentMemory,
        },
        latencyMs: elapsed,
        provider: 'local-offline',
        audioState: 'speaking',
        timestamp: new Date().toISOString(),
      });

      return {
        replyText: intentResult.clarificationPrompt,
        audioBase64: null,
        action: null,
        intentResult,
        provider: 'local-offline',
      };
    }

    // 7. Layer 2: Conversational Engine (Cloud Gemini with Local Fallback)
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isSimulatedOffline = localDB.getNetworkState() === 'OFFLINE';

    if (isOnline && !isSimulatedOffline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('/api/ai/companion-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: resolvedTranscript,
            patientName: context.patient.name,
            language: lang,
            voice: options?.voiceName || 'Kore',
            conversationHistory: this.getRollingHistory(),
            context,
            intentClassification: intentResult,
          }),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          // Ensure reply is genuinely non-empty and not generic
          let reply = data.reply;
          if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
            reply = this.generateOfflineWarmResponse(intentResult, context);
          }
          const audioBase64 = data.audioBase64 || null;
          const provider = (data.source || 'gemini-2.5-flash') as any;

          console.log('[AIOrchestrator] AI RESPONSE:        ', `"${reply}"`);

          const companionTurn: ConversationTurn = {
            id: `turn-comp-${Date.now()}`,
            sender: 'companion',
            text: reply,
            timestamp: new Date().toISOString(),
            intent: intentResult.intent,
            actionTaken: intentResult.action?.type,
          };
          this.addTurn(companionTurn);

          const elapsed = Math.round(performance.now() - startTime);
          this.emitDiagnostics({
            rawTranscript,
            resolvedTranscript,
            detectedLanguage: lang,
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            entities: intentResult.entities,
            actionTriggered: intentResult.action ? intentResult.action.type : null,
            contextInjected: {
              patientName: context.patient.name,
              currentScreen: context.currentScreen,
              historyTurns: context.recentConversation.length,
              hasFamilyContext: !!context.recentFamilyMember,
              hasRecentMemory: !!context.recentMemory,
            },
            latencyMs: elapsed,
            provider,
            audioState: 'speaking',
            timestamp: new Date().toISOString(),
          });

          return {
            replyText: reply,
            audioBase64,
            action: intentResult.action,
            intentResult,
            provider,
          };
        }
      } catch (cloudErr) {
        console.warn('Companion chat cloud call failed, using warm local generator:', cloudErr);
      }
    }

    // 8. Warm Offline Fallback
    const localReply = this.generateOfflineWarmResponse(intentResult, context);
    console.log('[AIOrchestrator] AI RESPONSE (Local): ', `"${localReply}"`);

    const companionTurn: ConversationTurn = {
      id: `turn-comp-${Date.now()}`,
      sender: 'companion',
      text: localReply,
      timestamp: new Date().toISOString(),
      intent: intentResult.intent,
      actionTaken: intentResult.action?.type,
    };
    this.addTurn(companionTurn);

    const elapsed = Math.round(performance.now() - startTime);
    this.emitDiagnostics({
      rawTranscript,
      resolvedTranscript,
      detectedLanguage: lang,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      entities: intentResult.entities,
      actionTriggered: intentResult.action ? intentResult.action.type : null,
      contextInjected: {
        patientName: context.patient.name,
        currentScreen: context.currentScreen,
        historyTurns: context.recentConversation.length,
        hasFamilyContext: !!context.recentFamilyMember,
        hasRecentMemory: !!context.recentMemory,
      },
      latencyMs: elapsed,
      provider: 'local-offline',
      audioState: 'speaking',
      timestamp: new Date().toISOString(),
    });

    return {
      replyText: localReply,
      audioBase64: null,
      action: intentResult.action,
      intentResult,
      provider: 'local-offline',
    };
  }

  // --- Explicit Mood & Caregiver Event Logger ---
  private checkAndLogExplicitMood(intent: IntentClassificationResult, patientId: string): void {
    let explicitMood: PatientMoodType | null = null;
    const contextTrigger = intent.rawTranscript;

    if (intent.intent === 'USER_FEELING_TIRED' || intent.entities.sentiment === 'TIRED' || intent.entities.state === 'TIRED') {
      explicitMood = 'TIRED';
    } else if (intent.intent === 'USER_FEELING_HAPPY' || intent.entities.sentiment === 'HAPPY' || intent.entities.state === 'HAPPY') {
      explicitMood = 'HAPPY';
    } else if (intent.intent === 'USER_FEELING_CONFUSED' || intent.entities.sentiment === 'CONFUSED' || intent.entities.state === 'CONFUSED') {
      explicitMood = 'CONFUSED';
    } else if (intent.intent === 'USER_FEELING_SAD' || intent.entities.sentiment === 'SAD' || intent.entities.state === 'SAD') {
      explicitMood = 'SAD';
    } else if (intent.entities.sentiment === 'CALM') {
      explicitMood = 'CALM';
    } else if (intent.entities.sentiment === 'ANXIOUS') {
      explicitMood = 'ANXIOUS';
    } else if (intent.entities.state === 'LONELY') {
      explicitMood = 'SAD';
    }

    // Always log the VOICE_EVENT observation to Caregiver Analytics
    localDB.addCareObservationEvent({
      patientId,
      source: 'VOICE_EVENT',
      data: {
        rawTranscript: intent.rawTranscript,
        intent: intent.intent,
        state: intent.entities.state || intent.entities.sentiment || null,
        confidence: intent.confidence,
      },
      confidence: intent.confidence,
    });

    if (explicitMood || intent.entities.state) {
      if (explicitMood) {
        localDB.addMoodObservation({
          patientId,
          state: explicitMood,
          confidence: intent.confidence || 0.9,
          source: 'USER_EXPLICIT',
          context: `User explicitly stated: "${contextTrigger}"`,
          note: `Spoken dialogue captured during conversational interaction. State: ${intent.entities.state || explicitMood}`,
        });
      }

      // Log MOOD_EVENT to caregiver audit trail
      localDB.addCareObservationEvent({
        patientId,
        source: 'MOOD_EVENT',
        data: {
          explicitState: intent.entities.state || explicitMood,
          trigger: contextTrigger,
          confidence: intent.confidence || 0.95,
        },
        confidence: intent.confidence || 0.95,
      });
    }
  }

  // --- Warm Offline Conversational Response Generator ---
  public generateOfflineWarmResponse(
    intent: IntentClassificationResult,
    context: ControlledContextObject
  ): string {
    const name = context.patient.name || 'Ravi';
    const lang = context.patient.preferredLanguage;
    const rawLower = intent.rawTranscript.toLowerCase();

    // 1. Explicit Expression: Loneliness (Section 19, 20, 22 of master prompt)
    if (intent.entities.state === 'LONELY' || rawLower.includes('lonely') || rawLower.includes('alone')) {
      if (lang === 'as') {
        return `মই বুজি পাইছোঁ শ্ৰদ্ধাৰ ${name}। আপুনি অকলশৰীয়া অনুভৱ কৰিব নালাগে, মই আপোনাৰ লগতেই আছোঁ। আমি আপোনাৰ পুৰণি স্মৃতিবোৰ চাওঁ নে ভাল লগা সুৰ শুনো?`;
      }
      if (lang === 'hi') {
        return `मुझे खेद है कि आप अकेलापन महसूस कर रहे हैं, आदरणीय ${name} जी। मैं आपके साथ ही हूँ। क्या आप परिवार की तस्वीरें देखना चाहेंगे या कोई सुखद संगीत सुनना चाहेंगे?`;
      }
      if (lang === 'ta') {
        return `நீங்கள் தனிமையாக உணர்வது குறித்து நான் வருந்துகிறேன் அன்பான ${name}. நான் உங்களுடனே இருக்கிறேன். நாம் குடும்ப நினைவுகளைப் பார்க்கலாமா அல்லது இனிமையான பாடல் கேட்கலாமா?`;
      }
      return `I'm sorry you're feeling lonely today, dear ${name}. I am right here with you. Would you like to talk about your day, listen to a familiar song, or look at some family memories?`;
    }

    // 2. Explicit Expression: Hunger
    if (intent.entities.state === 'HUNGRY' || rawLower.includes('hungry') || rawLower.includes('eat something') || rawLower.includes('haven\'t eaten')) {
      return `Thank you for telling me, dear ${name}. It might be a good time for a comforting snack, some fresh fruit, or a warm cup of tea. Would you like me to note this for your caregiver or check your daily meal schedule?`;
    }

    // 3. Multilingual Warm Greetings & "How are you"
    if (intent.intent === 'HOW_ARE_YOU' || intent.intent === 'GENERAL_GREETING') {
      if (lang === 'as') {
        return `নমস্কাৰ শ্ৰদ্ধাৰ ${name}! মই আপোনাৰ ওচৰতেই আছোঁ। আপোনাক লগ পাই মোৰ বৰ ভাল লাগিছে। আজি আপোনাৰ কেনে লাগিছে?`;
      }
      if (lang === 'bn') {
        return `নমস্কার প্রিয় ${name}! আমি খুব ভালো আছি, আর আপনার সাথে কথা বলে আরও आनंद হচ্ছে। আপনি আজ কেমন বোধ করছেন?`;
      }
      if (lang === 'hi') {
        return `नमस्ते आदरणीय ${name} जी! मैं बहुत अच्छा हूँ, और आपके साथ बातचीत करके बहुत खुशी हो रही है। आज आपका दिन कैसा बीत रहा है?`;
      }
      if (lang === 'ta') {
        return `வணக்கம் அன்பான ${name}! நான் நன்றாக இருக்கிறேன். உங்களுடன் பேசுவதில் எனக்கு மிகுந்த மகிழ்ச்சி. நீங்கள் இப்போது எப்படி உணர்கிறீர்கள்?`;
      }
      return `Hello dear ${name}! I am doing wonderful, and being right here with you brings me so much warmth. How are you feeling today?`;
    }

    // 4. Feeling Tired
    if (intent.intent === 'USER_FEELING_TIRED' || intent.entities.sentiment === 'TIRED' || rawLower.includes('tired')) {
      if (lang === 'as') {
        return `মই বুজি পাইছোঁ শ্ৰদ্ধাৰ ${name}। অলপ জিৰণি লোৱাটো বৰ ভাল কথা। আমি শান্ত বাঁহীৰ সুৰ শুনো নে স্মৃতিবোৰ চাওঁ?`;
      }
      if (lang === 'bn') {
        return `আমি বুঝতে পারছি প্রিয় ${name}। বিশ্রাম নেওয়া খুব দরকার। আসুন আমরা কিছুক্ষণ শান্ত বাঁশির সুর শুনি অথবা সুন্দর স্মৃতিগুলো দেখি।`;
      }
      if (lang === 'hi') {
        return `मैं समझ सकता हूँ आदरणीय ${name} जी। थोड़ा आराम करना बिल्कुल सही रहेगा। क्या आप बांसुरी की मधुर धुन सुनना चाहेंगे या पुरानी यादें देखना चाहेंगे?`;
      }
      return `I hear you gently, dear ${name}. It is completely natural to feel tired. Let us take it easy. Would you like to rest with soft flute music, or quietly look at fond family memories?`;
    }

    // 5. Feeling Happy
    if (intent.intent === 'USER_FEELING_HAPPY' || intent.entities.sentiment === 'HAPPY' || rawLower.includes('happy')) {
      return `Your cheerful spirit brightens my whole day, dear ${name}! It warms my heart to know you feel good today. Shall we celebrate with a pleasant memory, a favorite song, or a light game?`;
    }

    // 6. Daily Activity / Story Sharing (Section 22 of master prompt)
    if (intent.intent === 'DAILY_ACTIVITY') {
      const member = intent.entities.familyMember || intent.entities.person;
      if (member) {
        return `How wonderful that your ${member} connected with you, dear ${name}! Hearing from family always brings such warmth and cheer. Did they share any special news?`;
      }
      if (intent.entities.activity === 'market' || rawLower.includes('market') || rawLower.includes('shop')) {
        return `Going to the market is wonderful, dear ${name}! The lively sights, familiar stalls, and fresh produce bring great energy. Did you see any familiar faces or find anything special?`;
      }
      if (intent.entities.activity === 'tea' || rawLower.includes('tea')) {
        return `A comforting cup of warm tea is such a delightful ritual, dear ${name}. Did you enjoy it with some quiet reflection or pleasant company?`;
      }
      return `That sounds like a memorable part of your day, dear ${name}. Staying connected to your daily routines and surroundings brings wonderful vitality. Tell me more about it!`;
    }

    // 7. Tell a Story
    if (intent.intent === 'TELL_STORY' || rawLower.includes('tell me a story') || rawLower.includes('story')) {
      return `Once upon a time in a peaceful garden nestled near rolling green hills, morning dew sparkled on fresh tea leaves and sweet birds greeted the sunrise. An old artisan crafted bamboo flutes whose gentle melodies brought joy to all neighbors. Would you like to hear more of this peaceful tale, dear ${name}?`;
    }

    // 8. Adjust Game Level / Difficulty (Section 28)
    if (intent.intent === 'SELECT_GAME_LEVEL' || rawLower.includes('easier') || rawLower.includes('harder') || rawLower.includes('difficult')) {
      const level = intent.entities.gameLevel || (rawLower.includes('easier') ? 'a gentler level' : 'the next level');
      return `I have adjusted the activity to ${level} for you, dear ${name}. There is absolutely no pressure; we will play gently and comfortably at whatever pace you enjoy.`;
    }

    // 9. Stop Command
    if (intent.intent === 'STOP' || rawLower === 'stop' || rawLower === 'pause') {
      return `Of course, dear ${name}. We will pause right here. You can take a gentle rest, and I will be right beside you whenever you wish to continue.`;
    }

    // 10. Feeling Confused / Agitated
    if (intent.intent === 'USER_FEELING_CONFUSED' || intent.intent === 'USER_FEELING_SAD' || intent.intent === 'USER_FEELING_ANXIOUS') {
      return `Take a gentle, deep breath, dear ${name}. You are in a safe, comfortable place, and I am right here beside you. Everything is well, and we can take our time together.`;
    }

    // 11. Thank You
    if (intent.intent === 'THANK_YOU') {
      return `You are always so kind, dear ${name}. It is my absolute joy to be here with you!`;
    }

    // 12. Goodbye
    if (intent.intent === 'GOODBYE') {
      return `Goodbye for now, dear ${name}. Rest peacefully, and whenever you need a friendly ear, I am right here for you.`;
    }

    // 13. Show Memories
    if (intent.intent === 'SHOW_MEMORIES' || intent.intent === 'PLAY_MEMORY') {
      return `Opening your cherished memory album, dear ${name}. Let us revisit these wonderful moments together.`;
    }

    // 14. Show Family / Call
    if (intent.intent === 'SHOW_FAMILY' || intent.intent === 'CALL_FAMILY_MEMBER') {
      const family = context.recentFamilyMember;
      if (family) {
        return `Here is your loving family, dear ${name}. We can see ${family.name}, your ${family.relation}, and hear their heartwarming voice.`;
      }
      return `Opening your family circle, dear ${name}. Your loved ones are always close at heart.`;
    }

    // 15. Start Game
    if (intent.intent === 'START_GAME' || intent.intent === 'SELECT_GAME' || intent.intent === 'SHOW_GAMES') {
      const gameTitle = intent.entities.gameId || 'our cognitive exercise';
      return `Wonderful! Let us begin ${gameTitle}. Remember, there is no hurry at all; we will enjoy every step together.`;
    }

    // 16. Play Soundscape
    if (intent.intent === 'PLAY_SOUNDSCAPE') {
      const sound = intent.entities.soundscapeType || 'gentle nature';
      return `Playing peaceful ${sound} sounds for you, dear ${name}. Let the soothing melody bring you comfort.`;
    }

    // 17. Show Reminders
    if (intent.intent === 'SHOW_REMINDERS') {
      return `Here is your schedule for today, dear ${name}. You are doing wonderfully keeping up with your daily routine.`;
    }

    // 18. Ask Time / Date
    if (intent.intent === 'ASK_TIME') {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Right now it is ${timeStr}, dear ${name}. We have plenty of peaceful time ahead today.`;
    }

    if (intent.intent === 'ASK_DATE') {
      const dateStr = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return `Today is ${dateStr}, dear ${name}. It is a beautiful day to spend together.`;
    }

    // 19. Default Empathetic Conversation
    if (lang === 'as') {
      return `নমস্কাৰ শ্ৰদ্ধাৰ ${name}। মই আপোনাৰ লগতেই আছোঁ। আপোনাৰ লগত এই শান্ত সময়খিনি কটাই মোৰ বৰ ভাল লাগিছে। আপুনি আজি কেনে অনুভৱ কৰিছে?`;
    }
    if (lang === 'bn') {
      return `নমস্কার প্রিয় ${name}। আমি আপনার সাথেই আছি। আপনার সাথে এই শান্ত সময় কাটাতে পেরে খুব ভালো লাগছে। আপনি আজ কেমন আছেন?`;
    }
    if (lang === 'hi') {
      return `नमस्ते आदरणीय ${name} जी। मैं आपके साथ ही हूँ। आपके साथ यह शांत समय बिताना बहुत अच्छा लग रहा है। आप आज कैसा महसूस कर रहे हैं?`;
    }
    if (lang === 'ta') {
      return `வணக்கம் அன்பான ${name}। நான் உங்களுடனே இருக்கிறேன். உங்களுடன் இந்த அமைதியான தருணத்தை செலவிடுவதில் மிக்க மகிழ்ச்சி.`;
    }
    return `I am right here with you, dear ${name}. It is a pleasure to spend this peaceful moment together. What would you like to do or talk about?`;
  }

  private getEmergencyResponse(patientName: string, lang: SupportedLanguage): string {
    if (lang === 'as') {
      return `চিন্তা নকৰিব শ্ৰদ্ধাৰ ${patientName}, মই আপোনাৰ পৰিয়াল আৰু সহায়কাৰীক জৰুৰী সতৰ্কবাৰ্তা প্ৰেৰণ কৰিছোঁ। সহায় শীঘ্ৰেই আহি আছে।`;
    }
    if (lang === 'hi') {
      return `घबराइए मत आदरणीय ${patientName} जी, मैंने आपके परिवार और देखभालकर्ता को आपातकालीन सूचना भेज दी है। मदद तुरंत पहुँच रही है।`;
    }
    return `Do not worry, dear ${patientName}. I have immediately triggered an emergency alert to your caregiver. Help is on the way, and you are completely safe.`;
  }
}

export const aiOrchestrator = new AIOrchestrator();
