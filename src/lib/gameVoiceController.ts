/**
 * MIND MITHRA — UNIVERSAL GAME VOICE INTERACTION ENGINE
 * 
 * Central controller enabling human-guided voice interactivity across all cognitive games.
 * Pipeline: GAME -> GAME VOICE CONTROLLER -> STT -> NLP (Context-Aware) -> GAME ACTION -> TTS
 * 
 * Complies with Master Prompt specifications:
 * - Context-aware interpretation (gameId, category, level, question, options)
 * - Dual voice + touch operation
 * - Natural universal commands (repeat, hint, skip, pause, stop, continue)
 * - Non-shaming, emotionally reassuring feedback
 * - Controlled response variation
 * - Elderly cadence and VAD debounce
 * - Caregiver telemetry logging
 */

import { GameCategory, SupportedLanguage, GameVoiceEvent } from '../types';
import { audioService } from './audioService';
import { localDB } from './storage';

export interface GameOption {
  id: string;
  label: string;
  sublabel?: string;
  synonyms?: string[];
  spokenKeywords?: string[];
  isCorrect?: boolean;
}

export interface GameVoiceContext {
  gameId: string;
  gameCategory: GameCategory;
  gameTitle: string;
  level?: number;
  question?: string;
  prompt?: string;
  options: GameOption[];
  expectedAnswer?: string;
  expectedInputType?: 'CHOICE' | 'TEXT' | 'CONFIRM' | 'CARD';
  hintText?: string;
  hint?: string;
  currentRound?: number;
  totalRounds?: number;
  isPaused?: boolean;
  patientName?: string;
  language: SupportedLanguage;
}

export type GameVoiceTurnState =
  | 'IDLE'
  | 'WELCOME'
  | 'QUESTION_SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'FEEDBACK_SPEAKING'
  | 'PAUSED'
  | 'COMPLETED';

export type UniversalGameCommand =
  | 'REPEAT'
  | 'HINT'
  | 'SKIP'
  | 'PAUSE'
  | 'CONTINUE'
  | 'STOP'
  | 'START'
  | 'EASIER'
  | 'HARDER';

export interface GameVoiceState {
  turnState: GameVoiceTurnState;
  transcript: string;
  interimTranscript: string;
  lastSpokenFeedback: string | null;
  isMicActive: boolean;
  recognitionAvailable: boolean;
  isMuted: boolean;
}

export type VoiceStateListener = (state: GameVoiceState) => void;
export type AnswerCallback = (optionId: string, label: string, isCorrect: boolean) => void;
export type CommandCallback = (command: UniversalGameCommand) => void;

class GameVoiceController {
  private static instance: GameVoiceController;

  private currentContext: GameVoiceContext | null = null;
  private state: GameVoiceState = {
    turnState: 'IDLE',
    transcript: '',
    interimTranscript: '',
    lastSpokenFeedback: null,
    isMicActive: false,
    recognitionAvailable: true,
    isMuted: false,
  };

  private recognition: any = null;
  private silenceTimer: any = null;
  private stateListeners: Set<VoiceStateListener> = new Set();
  private onAnswerCallback: AnswerCallback | null = null;
  private onCommandCallback: CommandCallback | null = null;
  private attemptCount: number = 0;
  private turnStartTime: number = Date.now();

  private constructor() {
    this.checkRecognitionAvailability();
  }

  public static getInstance(): GameVoiceController {
    if (!GameVoiceController.instance) {
      GameVoiceController.instance = new GameVoiceController();
    }
    return GameVoiceController.instance;
  }

  private checkRecognitionAvailability(): boolean {
    if (typeof window === 'undefined') {
      this.state.recognitionAvailable = false;
      return false;
    }
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.state.recognitionAvailable = !!SpeechRec;
    return this.state.recognitionAvailable;
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.stateListeners.forEach((listener) => listener({ ...this.state }));
  }

  private updateTurnState(newState: GameVoiceTurnState): void {
    this.state.turnState = newState;
    this.notifyListeners();
  }

  // ===========================================================================
  // GAME LIFECYCLE HOOKS
  // ===========================================================================

  /**
   * Initializes or updates context for the active game / question
   */
  public setContext(
    context: GameVoiceContext,
    callbacks?: {
      onAnswer?: AnswerCallback;
      onCommand?: CommandCallback;
    }
  ): void {
    this.currentContext = context;
    if (callbacks?.onAnswer) this.onAnswerCallback = callbacks.onAnswer;
    if (callbacks?.onCommand) this.onCommandCallback = callbacks.onCommand;
    this.attemptCount = 0;
    this.turnStartTime = Date.now();
  }

  public registerContext(
    context: GameVoiceContext,
    callbacks?: {
      onAnswer?: AnswerCallback;
      onCommand?: CommandCallback;
    }
  ): void {
    this.setContext(context, callbacks);
  }

  public getCurrentContext(): GameVoiceContext | null {
    return this.currentContext;
  }

  public getContext(): GameVoiceContext | null {
    return this.currentContext;
  }

  /**
   * Welcomes patient when game starts, speaks warm orientation, then transitions
   */
  public async speakWelcome(welcomeText: string, onDone?: () => void): Promise<void> {
    if (this.state.isMuted) {
      if (onDone) onDone();
      return;
    }
    this.stopListening();
    this.updateTurnState('WELCOME');
    this.state.lastSpokenFeedback = welcomeText;
    this.notifyListeners();

    audioService.speak(welcomeText, () => {
      this.updateTurnState('IDLE');
      if (onDone) onDone();
    });
  }

  /**
   * Speaks the current question/prompt, then automatically activates listening
   */
  public async speakQuestion(
    promptText: string,
    autoListen: boolean = true
  ): Promise<void> {
    if (this.state.isMuted) {
      if (autoListen) this.startListening();
      return;
    }

    this.stopListening();
    this.updateTurnState('QUESTION_SPEAKING');
    this.state.lastSpokenFeedback = promptText;
    this.turnStartTime = Date.now();
    this.notifyListeners();

    audioService.speak(promptText, () => {
      if (this.state.turnState === 'QUESTION_SPEAKING') {
        if (autoListen) {
          this.startListening();
        } else {
          this.updateTurnState('IDLE');
        }
      }
    });
  }

  // ===========================================================================
  // SPEECH RECOGNITION (STT) LIFECYCLE
  // ===========================================================================

  public startListening(): void {
    if (typeof window === 'undefined') return;
    this.stopListening();

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      this.state.recognitionAvailable = false;
      this.updateTurnState('IDLE');
      return;
    }

    try {
      const recognition = new SpeechRec();
      this.recognition = recognition;

      const langMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        mni: 'hi-IN',
        kha: 'en-IN',
        lus: 'en-IN',
        grt: 'en-IN',
        trp: 'bn-IN',
        en: 'en-IN',
      };

      const activeLang = this.currentContext?.language || 'en';
      recognition.lang = langMap[activeLang] || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        this.state.isMicActive = true;
        this.state.transcript = '';
        this.state.interimTranscript = '';
        this.updateTurnState('LISTENING');
        audioService.playFeedbackSound('GENTLE_TAP');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const combined = (finalTranscript + interim).trim();
        this.state.transcript = combined;
        this.state.interimTranscript = interim;
        this.notifyListeners();

        // 2.2s debounce of silence to accommodate elderly deliberate speech & pauses
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
        }

        if (combined.length > 0) {
          this.silenceTimer = setTimeout(() => {
            if (this.state.turnState === 'LISTENING') {
              this.processSpokenTranscript(combined);
            }
          }, 2200);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('GameVoiceRecognition notice:', err.error);
        if (err.error === 'no-speech') {
          // Timeout without speech: handled gracefully, no failure
          this.handleSilenceTimeout();
        } else {
          this.stopListening();
        }
      };

      recognition.onend = () => {
        this.state.isMicActive = false;
        if (this.state.turnState === 'LISTENING' && this.state.transcript) {
          this.processSpokenTranscript(this.state.transcript);
        } else if (this.state.turnState === 'LISTENING') {
          this.updateTurnState('IDLE');
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('GameVoiceController could not start recognition:', err);
      this.state.isMicActive = false;
      this.updateTurnState('IDLE');
    }
  }

  public stopListening(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.state.isMicActive = false;
    this.notifyListeners();
  }

  public toggleMute(): void {
    this.state.isMuted = !this.state.isMuted;
    if (this.state.isMuted) {
      audioService.stopSpeaking();
      this.stopListening();
      this.updateTurnState('IDLE');
    }
    this.notifyListeners();
  }

  // ===========================================================================
  // CONTEXT-AWARE INTENT & ANSWER MATCHING
  // ===========================================================================

  public processSpokenTranscript(transcript: string): void {
    this.stopListening();
    this.updateTurnState('PROCESSING');

    const clean = transcript.toLowerCase().trim();
    const context = this.currentContext;

    if (!context) {
      this.updateTurnState('IDLE');
      return;
    }

    const responseDuration = (Date.now() - this.turnStartTime) / 1000;

    // 1. Check Universal Game Commands First
    const detectedCommand = this.classifyUniversalCommand(clean);
    if (detectedCommand) {
      this.handleCommandExecution(detectedCommand, clean, responseDuration);
      return;
    }

    // 2. Context-Aware Game Option Matcher
    const matchedOption = this.matchOptionInContext(clean, context);

    if (matchedOption) {
      const isCorrect = matchedOption.isCorrect ?? false;

      // Telemetry
      this.recordVoiceEvent({
        id: `gve-${Date.now()}`,
        patientId: localDB.getPatientProfile().id,
        gameId: context.gameId,
        gameCategory: context.gameCategory,
        gameLevel: context.level,
        timestamp: new Date().toISOString(),
        transcript: clean,
        language: context.language,
        intent: 'GAME_ANSWER',
        answer: matchedOption.label,
        confidence: 0.94,
        correct: isCorrect,
        responseTimeSeconds: responseDuration,
        actionTaken: `SELECTED_${matchedOption.id}`,
      });

      this.speakAnswerFeedback(isCorrect, matchedOption.label, () => {
        if (this.onAnswerCallback) {
          this.onAnswerCallback(matchedOption.id, matchedOption.label, isCorrect);
        }
      });
      return;
    }

    // 3. Fallback / Unclear Speech (Supportive & Never Shaming)
    this.attemptCount++;
    this.recordVoiceEvent({
      id: `gve-${Date.now()}`,
      patientId: localDB.getPatientProfile().id,
      gameId: context.gameId,
      gameCategory: context.gameCategory,
      gameLevel: context.level,
      timestamp: new Date().toISOString(),
      transcript: clean,
      language: context.language,
      intent: 'UNKNOWN',
      confidence: 0.4,
      responseTimeSeconds: responseDuration,
      actionTaken: 'UNCLEAR_PROMPT',
    });

    const patientName = context.patientName || 'my friend';
    const unclearMessages = [
      `I didn't quite catch that, dear ${patientName}. You can say the answer again, or tap any card below.`,
      `Let's take our time. Would you like to say your answer again, or tap it?`,
      `I'm right here with you. Take a gentle look at the choices.`,
    ];
    const spoken = unclearMessages[this.attemptCount % unclearMessages.length];

    this.speakEncouragement(spoken, () => {
      this.startListening();
    });
  }

  /**
   * Matches spoken words to options via exact label, synonym, or ordinal index
   */
  private matchOptionInContext(
    clean: string,
    context: GameVoiceContext
  ): GameOption | null {
    const options = context.options;
    if (!options || options.length === 0) return null;

    // A. Check Ordinal / Number Mapping (Option 1, First, Second, 3, etc.)
    const ordinalMap: Array<{ words: string[]; index: number }> = [
      { words: ['first one', 'option one', 'option 1', 'card one', 'card 1', 'number one', 'number 1', 'first', '1st', 'pehla', 'onnu', 'ek', 'one', '1'], index: 0 },
      { words: ['second one', 'option two', 'option 2', 'card two', 'card 2', 'number two', 'number 2', 'second', '2nd', 'dusra', 'rendu', 'do', 'two', '2'], index: 1 },
      { words: ['third one', 'option three', 'option 3', 'card three', 'card 3', 'number three', 'number 3', 'third', '3rd', 'teesra', 'moonu', 'teen', 'three', '3'], index: 2 },
      { words: ['fourth one', 'option four', 'option 4', 'card four', 'card 4', 'number four', 'number 4', 'fourth', '4th', 'chautha', 'naalu', 'char', 'four', '4'], index: 3 },
      { words: ['fifth one', 'option five', 'option 5', 'card five', 'card 5', 'number five', 'number 5', 'fifth', '5th', 'paanchwa', 'aindhu', 'paanch', 'five', '5'], index: 4 },
      { words: ['sixth one', 'option six', 'option 6', 'card six', 'card 6', 'number six', 'number 6', 'sixth', '6th', 'chhattha', 'aaru', 'chhe', 'six', '6'], index: 5 },
    ];

    // Match longer multi-word phrases first, then specific words
    for (let phraseLen = 3; phraseLen >= 1; phraseLen--) {
      for (const mapping of ordinalMap) {
        if (mapping.index < options.length) {
          const matchingWords = mapping.words.filter((w) => w.split(' ').length === phraseLen);
          for (const w of matchingWords) {
            const regex = new RegExp(`(^|\\b|\\s)${w}(\\b|\\s|$)`, 'i');
            if (regex.test(clean)) {
              if (
                (w === 'one' || w === '1') &&
                (clean.includes('second') || clean.includes('third') || clean.includes('fourth') || clean.includes('fifth') || clean.includes('sixth'))
              ) {
                continue;
              }
              return options[mapping.index];
            }
          }
        }
      }
    }

    // B. Check Exact & Substring Label Matching (strip leading "1. ", "2. ", etc.)
    for (const opt of options) {
      const optClean = opt.label.toLowerCase().trim();
      const strippedLabel = optClean.replace(/^[0-9]+[\.\-\)\s]+/, '').trim();

      if (
        clean === optClean ||
        clean === strippedLabel ||
        (strippedLabel.length >= 3 && clean.includes(strippedLabel)) ||
        (clean.length >= 3 && strippedLabel.includes(clean))
      ) {
        return opt;
      }

      // Check sublabel
      if (opt.sublabel) {
        const subClean = opt.sublabel.toLowerCase().trim();
        if (clean === subClean || (subClean.length >= 3 && clean.includes(subClean))) {
          return opt;
        }
      }

      // Check synonyms and spokenKeywords
      const allSynonyms = [...(opt.synonyms || []), ...(opt.spokenKeywords || [])];
      for (const syn of allSynonyms) {
        const synClean = syn.toLowerCase().trim();
        if (synClean.length >= 2 && (clean === synClean || clean.includes(synClean) || synClean.includes(clean))) {
          return opt;
        }
      }
    }

    return null;
  }

  /**
   * Classify universal voice commands
   */
  private classifyUniversalCommand(clean: string): UniversalGameCommand | null {
    if (
      clean.includes('repeat') ||
      clean.includes('say that again') ||
      clean.includes('say again') ||
      clean.includes('what was that') ||
      clean.includes('what did you say') ||
      clean.includes('one more time')
    ) {
      return 'REPEAT';
    }

    if (
      clean.includes('hint') ||
      clean.includes('give me a hint') ||
      clean.includes('help me') ||
      clean.includes('help') ||
      clean.includes('clue') ||
      clean.includes("i don't know") ||
      clean.includes('dont know')
    ) {
      return 'HINT';
    }

    if (
      clean.includes('skip') ||
      clean.includes('next') ||
      clean.includes('pass') ||
      clean.includes('skip this')
    ) {
      return 'SKIP';
    }

    if (
      clean.includes('pause') ||
      clean.includes('stop') ||
      clean.includes('wait') ||
      clean.includes('hold on') ||
      clean.includes('take a break')
    ) {
      return 'PAUSE';
    }

    if (
      clean.includes('continue') ||
      clean.includes('resume') ||
      clean.includes("let's go") ||
      clean.includes('keep going')
    ) {
      return 'CONTINUE';
    }

    if (
      clean === 'yes' ||
      clean === 'okay' ||
      clean === 'ok' ||
      clean === 'ready' ||
      clean === 'start' ||
      clean.includes("let's play")
    ) {
      return 'START';
    }

    if (clean.includes('easier') || clean.includes('too hard') || clean.includes('make it simple')) {
      return 'EASIER';
    }

    if (clean.includes('harder') || clean.includes('more challenging')) {
      return 'HARDER';
    }

    return null;
  }

  private handleCommandExecution(
    command: UniversalGameCommand,
    rawTranscript: string,
    duration: number
  ): void {
    const context = this.currentContext;
    if (!context) return;

    this.recordVoiceEvent({
      id: `gve-cmd-${Date.now()}`,
      patientId: localDB.getPatientProfile().id,
      gameId: context.gameId,
      gameCategory: context.gameCategory,
      gameLevel: context.level,
      timestamp: new Date().toISOString(),
      transcript: rawTranscript,
      language: context.language,
      intent: command as any,
      confidence: 0.98,
      responseTimeSeconds: duration,
      actionTaken: `CMD_${command}`,
    });

    switch (command) {
      case 'REPEAT': {
        const spoken = `Sure. Let me repeat: ${context.question}`;
        this.speakEncouragement(spoken, () => {
          this.startListening();
        });
        if (this.onCommandCallback) this.onCommandCallback('REPEAT');
        break;
      }
      case 'HINT': {
        const hint = context.hintText || 'Think about which of these brings fond, calm memories.';
        const spoken = `Here is a gentle hint: ${hint}`;
        this.speakEncouragement(spoken, () => {
          this.startListening();
        });
        if (this.onCommandCallback) this.onCommandCallback('HINT');
        break;
      }
      case 'SKIP': {
        const spoken = `That's perfectly fine. Let us move to the next one together.`;
        this.speakEncouragement(spoken, () => {
          if (this.onCommandCallback) this.onCommandCallback('SKIP');
        });
        break;
      }
      case 'PAUSE':
      case 'STOP': {
        this.updateTurnState('PAUSED');
        const spoken = `We have paused the game. Take all the time you need to rest. Say continue whenever you are ready.`;
        this.speakEncouragement(spoken);
        if (this.onCommandCallback) this.onCommandCallback('PAUSE');
        break;
      }
      case 'CONTINUE': {
        const spoken = `Welcome back! Let us pick right up where we left off.`;
        this.speakEncouragement(spoken, () => {
          this.startListening();
        });
        if (this.onCommandCallback) this.onCommandCallback('CONTINUE');
        break;
      }
      case 'START': {
        if (this.onCommandCallback) this.onCommandCallback('START');
        break;
      }
      case 'EASIER':
      case 'HARDER': {
        if (this.onCommandCallback) this.onCommandCallback(command);
        break;
      }
    }
  }

  // ===========================================================================
  // HUMAN-LIKE NON-SHAMING COMPANION FEEDBACK & INPUT INTERPRETATION
  // ===========================================================================

  public interpretVoiceInput(transcript: string): {
    intent: UniversalGameCommand | 'SELECT_OPTION' | 'UNKNOWN';
    matchedOptionId?: string;
    matchedOptionLabel?: string;
  } {
    const clean = transcript.toLowerCase().trim();
    const command = this.classifyUniversalCommand(clean);
    if (command) {
      return { intent: command };
    }
    if (this.currentContext) {
      const option = this.matchOptionInContext(clean, this.currentContext);
      if (option) {
        return {
          intent: 'SELECT_OPTION',
          matchedOptionId: option.id,
          matchedOptionLabel: option.label,
        };
      }
    }
    return { intent: 'UNKNOWN' };
  }

  public generateCompanionFeedback(type: 'CORRECT' | 'INCORRECT' | 'HINT' | 'SKIP' | 'ENCOURAGE'): string {
    const patientName = this.currentContext?.patientName || 'my friend';
    if (type === 'CORRECT') {
      const msgs = [
        `Wonderful choice, ${patientName}! You found it!`,
        `Splendid work, ${patientName}! That is exactly right.`,
        `Very well remembered! That feels so good.`,
        `Brilliant! You are doing beautifully today.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (type === 'INCORRECT') {
      const msgs = [
        `That was a lovely try, dear ${patientName}. Take all the time you need, let's explore gently.`,
        `No worries at all, ${patientName}. Every step together is precious. Let us look again.`,
        `That is okay! Let's pause and see which one feels familiar to you.`,
        `No hurry at all, take a peaceful breath. You are doing great.`,
      ];
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
    if (type === 'HINT') {
      return `Here is a gentle clue: ${this.currentContext?.hintText || 'look closely at the colors and shapes.'}`;
    }
    if (type === 'SKIP') {
      return `That is completely fine, ${patientName}. Let us move ahead together smoothly.`;
    }
    return `Take your time, dear ${patientName}. I am right beside you.`;
  }

  private speakAnswerFeedback(
    isCorrect: boolean,
    optionLabel: string,
    onDone?: () => void
  ): void {
    if (this.state.isMuted) {
      if (onDone) onDone();
      return;
    }

    this.updateTurnState('FEEDBACK_SPEAKING');
    let feedback = '';

    if (isCorrect) {
      audioService.playFeedbackSound('SUCCESS');
      const correctPhrases = [
        `That's right! Well done!`,
        `Wonderful! You spotted it perfectly!`,
        `Yes! ${optionLabel} is exactly correct!`,
        `Splendid recall! You're doing so well!`,
      ];
      feedback = correctPhrases[Math.floor(Math.random() * correctPhrases.length)];
    } else {
      audioService.playFeedbackSound('GENTLE_TAP');
      const gentlePhrases = [
        `That's okay. Let us look at it together.`,
        `Good effort! Take another gentle look.`,
        `You're very close! There is never any rush.`,
        `That's alright. Let us continue with warmth.`,
      ];
      feedback = gentlePhrases[Math.floor(Math.random() * gentlePhrases.length)];
    }

    this.state.lastSpokenFeedback = feedback;
    this.notifyListeners();

    audioService.speak(feedback, () => {
      this.updateTurnState('IDLE');
      if (onDone) onDone();
    });
  }

  private speakEncouragement(text: string, onDone?: () => void): void {
    if (this.state.isMuted) {
      if (onDone) onDone();
      return;
    }
    this.updateTurnState('FEEDBACK_SPEAKING');
    this.state.lastSpokenFeedback = text;
    this.notifyListeners();

    audioService.speak(text, () => {
      this.updateTurnState('IDLE');
      if (onDone) onDone();
    });
  }

  private handleSilenceTimeout(): void {
    if (this.state.turnState !== 'LISTENING') return;
    const context = this.currentContext;
    if (!context) return;

    this.attemptCount++;
    if (this.attemptCount === 1) {
      this.speakEncouragement(
        `I'm listening, dear friend. Take your time, there is no hurry.`,
        () => {
          this.startListening();
        }
      );
    } else if (this.attemptCount === 2) {
      this.speakEncouragement(
        `Would you like me to repeat the question, or would you like a gentle hint?`,
        () => {
          this.startListening();
        }
      );
    } else {
      this.updateTurnState('IDLE');
    }
  }

  private recordVoiceEvent(evt: GameVoiceEvent): void {
    try {
      localDB.saveGameVoiceEvent(evt);
    } catch (e) {
      console.warn('Could not persist GameVoiceEvent:', e);
    }
  }
}

export const gameVoiceController = GameVoiceController.getInstance();
