// Audio Service for Speech-to-Text, Human-Like Text-to-Speech, PCM Web Audio Playback, and Feedback

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export type VoiceIntent =
  | 'START_ACTIVITY'
  | 'OPEN_MEMORIES'
  | 'QUERY_MEMORY'
  | 'CHECK_REMINDERS'
  | 'ACKNOWLEDGE_MEDICINE'
  | 'PLAY_MUSIC'
  | 'PLAY_FAMILY_VOICE'
  | 'OPEN_FAMILY_TREE'
  | 'CALL_FAMILY'
  | 'TRIGGER_SOS'
  | 'OPEN_JOURNAL'
  | 'OPEN_SOUNDSCAPES'
  | 'GO_HOME'
  | 'ASK_STATUS'
  | 'UNKNOWN';

export interface ParsedVoiceCommand {
  intent: VoiceIntent;
  confidence: number;
  extractedQuery?: string;
  responseVoiceText: string;
  actionRoute?: 'HOME' | 'GAMES' | 'MEMORIES' | 'REMINDERS' | 'RELAX' | 'BASELINE' | 'FAMILY_TREE' | 'RADIO' | 'JOURNAL';
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  gender: 'female' | 'male';
  geminiVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
}

export const COMPANION_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'kore_warm',
    name: 'Kore (Warm & Loving)',
    description: 'Gentle, comforting, and deeply caring companion voice',
    gender: 'female',
    geminiVoice: 'Kore',
  },
  {
    id: 'puck_friendly',
    name: 'Puck (Cheerful & Friendly)',
    description: 'Bright, uplifting, and encouraging friendly voice',
    gender: 'male',
    geminiVoice: 'Puck',
  },
  {
    id: 'zephyr_calm',
    name: 'Zephyr (Peaceful & Soft)',
    description: 'Serene, soothing, and relaxing voice',
    gender: 'female',
    geminiVoice: 'Zephyr',
  },
];

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private currentPcmSource: AudioBufferSourceNode | null = null;
  private currentVoiceProfile: VoiceProfile = COMPANION_VOICE_PROFILES[0];
  private availableVoices: SpeechSynthesisVoice[] = [];
  private isSpeakingNow: boolean = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private serverTtsAvailable: boolean | null = null;
  private speechWatchdogTimer: any = null;
  private activeSirenOscillators: OscillatorNode[] = [];
  private activeSirenGain: GainNode | null = null;
  private sirenTimer: number | null = null;
  private soundscapeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadBrowserVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadBrowserVoices();
        }
      }
      this.warmupAudioOnUserGesture();
    }
  }

  // Modern browsers require a user gesture to resume AudioContext and ensure SpeechSynthesis is active
  private warmupAudioOnUserGesture(): void {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      try {
        if (this.synth && this.synth.paused) {
          this.synth.resume();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      } catch {}
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
    window.addEventListener('click', unlock, true);
    window.addEventListener('touchstart', unlock, true);
    window.addEventListener('keydown', unlock, true);
  }

  private loadBrowserVoices(): void {
    if (!this.synth) return;
    try {
      this.availableVoices = this.synth.getVoices() || [];
    } catch {
      this.availableVoices = [];
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && this.synth) {
      this.loadBrowserVoices();
    }
    return this.availableVoices;
  }

  public setVoiceProfile(profileId: string): void {
    const match = COMPANION_VOICE_PROFILES.find((p) => p.id === profileId);
    if (match) {
      this.currentVoiceProfile = match;
    }
  }

  public getActiveVoiceProfile(): VoiceProfile {
    return this.currentVoiceProfile;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play natural PCM 24kHz audio returned by Gemini TTS
  public playPcmAudio(base64Data: string, sampleRate = 24000, onEnd?: () => void): boolean {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return false;

      this.stopSpeaking();

      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Gentle gain node to smooth start & finish without clicks
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(1.0, now + 0.04);

      source.connect(gain);
      gain.connect(ctx.destination);

      this.currentPcmSource = source;
      this.isSpeakingNow = true;

      source.onended = () => {
        this.isSpeakingNow = false;
        this.currentPcmSource = null;
        if (onEnd) onEnd();
      };

      source.start();
      return true;
    } catch (err) {
      console.warn('PCM audio playback error:', err);
      return false;
    }
  }

  // Play gentle harmonic chimes and dementia-friendly reminder alerts
  public playFeedbackSound(type: 'SUCCESS' | 'GENTLE_TAP' | 'CHIME' | 'REST' | 'ALARM_CHIME' | 'DEMENTIA_ALERT'): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'ALARM_CHIME' || type === 'DEMENTIA_ALERT') {
        // Multi-tone harmonic chime designed specifically for elder dementia care (pleasant, clear, non-startling)
        const notes = [
          { freq: 523.25, time: 0.0, dur: 0.8 }, // C5
          { freq: 659.25, time: 0.22, dur: 0.8 }, // E5
          { freq: 783.99, time: 0.44, dur: 0.9 }, // G5
          { freq: 1046.50, time: 0.66, dur: 1.4 }, // C6
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);
          
          gain.gain.setValueAtTime(0.0001, now + time);
          gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'SUCCESS') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'GENTLE_TAP') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392.0, now); // G4
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {
      // Ignore
    }
  }

  // Play gentle affirmative chime for elderly cognitive reinforcement
  public playChime(freq = 660): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // Ignore
    }
  }

  // Procedural soothing soundscapes for dusk sundowning relief and relaxation
  public playSoundscape(type: 'RAIN' | 'FLUTE' | 'BIRDS'): void {
    try {
      this.stopSoundscape();
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'FLUTE') {
        // Indian bamboo flute gentle harmonic chord (A4 440Hz + E5 660Hz)
        [440, 660].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.06, now + 1.0);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          this.soundscapeNodes.push({ osc, gain });
        });
      } else if (type === 'RAIN') {
        // Procedural soothing rain / pink-noise simulation using detuned oscillators
        [120, 180, 240].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          this.soundscapeNodes.push({ osc, gain });
        });
      } else {
        // Nature birds soft high frequencies
        [880, 1320].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.03, now + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          this.soundscapeNodes.push({ osc, gain });
        });
      }
    } catch {
      // Ignore
    }
  }

  public stopSoundscape(): void {
    try {
      this.soundscapeNodes.forEach(({ osc, gain }) => {
        try {
          if (this.audioCtx) {
            gain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.3);
            setTimeout(() => {
              try { osc.stop(); osc.disconnect(); } catch {}
            }, 350);
          } else {
            osc.stop();
          }
        } catch {}
      });
      this.soundscapeNodes = [];
    } catch {}
  }

  // Play repeating reminder alert chimes
  public playReminderAlarmSequence(cycles = 2): void {
    for (let i = 0; i < cycles; i++) {
      setTimeout(() => {
        this.playFeedbackSound('ALARM_CHIME');
      }, i * 1600);
    }
  }

  // Play high-priority loud siren alert for caregiver critical alerts / SOS
  public playCaregiverEmergencySiren(durationSeconds = 6): void {
    try {
      this.stopCaregiverEmergencySiren();
      const ctx = this.getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      masterGain.connect(ctx.destination);
      this.activeSirenGain = masterGain;

      // Dual-tone European style emergency warble siren (780Hz <-> 960Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Modulate frequency rhythmically
      for (let t = 0; t < durationSeconds; t += 0.5) {
        const freqHigh = 960;
        const freqLow = 760;
        const targetFreq = (Math.floor(t / 0.5) % 2 === 0) ? freqHigh : freqLow;
        osc1.frequency.setValueAtTime(targetFreq, now + t);
        osc2.frequency.setValueAtTime(targetFreq * 0.5, now + t);
      }

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + durationSeconds);
      osc2.stop(now + durationSeconds);

      this.activeSirenOscillators = [osc1, osc2];

      if (this.sirenTimer) {
        window.clearTimeout(this.sirenTimer);
      }

      this.sirenTimer = window.setTimeout(() => {
        this.stopCaregiverEmergencySiren();
      }, durationSeconds * 1000);
    } catch (e) {
      console.warn('Could not play emergency siren:', e);
    }
  }

  // Stop active caregiver emergency siren
  public stopCaregiverEmergencySiren(): void {
    if (this.sirenTimer) {
      window.clearTimeout(this.sirenTimer);
      this.sirenTimer = null;
    }
    this.activeSirenOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeSirenOscillators = [];
    if (this.activeSirenGain) {
      try {
        this.activeSirenGain.disconnect();
      } catch {}
      this.activeSirenGain = null;
    }
  }

  // Detect Indian regional language or English from text content
  public detectLanguage(text: string): string {
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Hindi
    if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN'; // Bengali / Assamese
    return 'en-IN';
  }

  // Find highest-quality human-sounding voice in the browser, matching preferred language
  private selectBestHumanVoice(preferredLang?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const targetPrefix = preferredLang ? preferredLang.split('-')[0].toLowerCase() : 'en';
    const isFemalePreferred = this.currentVoiceProfile.gender === 'female';

    // 1. Language-matched voices
    const langMatches = voices.filter((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (langMatches.length > 0) {
      // Look for natural/neural voices in this language
      const naturalLang = langMatches.find((v) => {
        const n = v.name.toLowerCase();
        return (
          n.includes('natural') ||
          n.includes('neural') ||
          n.includes('google') ||
          n.includes('online') ||
          n.includes('premium') ||
          n.includes('multilingual')
        );
      });
      if (naturalLang) return naturalLang;

      // Gender preference for language matches
      if (isFemalePreferred) {
        const female = langMatches.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('female') ||
            n.includes('woman') ||
            n.includes('girl') ||
            n.includes('samantha') ||
            n.includes('swara') ||
            n.includes('kalpana') ||
            n.includes('valluvar')
          );
        });
        if (female) return female;
      }
      return langMatches[0];
    }

    // 2. High-grade natural/neural voices (Google, Edge Natural, Siri, etc.)
    const naturalMatches = voices.filter((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isEnOrIn = lang.startsWith('en') || lang.startsWith('hi') || lang.startsWith('ta') || lang.startsWith('bn');
      if (!isEnOrIn) return false;

      return (
        name.includes('natural') ||
        name.includes('neural') ||
        name.includes('google') ||
        name.includes('online') ||
        name.includes('premium') ||
        name.includes('enhanced') ||
        name.includes('siri') ||
        name.includes('samantha') ||
        name.includes('ava') ||
        name.includes('serena') ||
        name.includes('rishi') ||
        name.includes('neerja') ||
        name.includes('swara')
      );
    });

    if (naturalMatches.length > 0) {
      if (isFemalePreferred) {
        const femaleVoice = naturalMatches.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('female') ||
            n.includes('samantha') ||
            n.includes('ava') ||
            n.includes('serena') ||
            n.includes('neerja') ||
            n.includes('jenny') ||
            n.includes('sonia')
          );
        });
        if (femaleVoice) return femaleVoice;
      } else {
        const maleVoice = naturalMatches.find((v) => {
          const n = v.name.toLowerCase();
          return n.includes('male') || n.includes('rishi') || n.includes('guy') || n.includes('george') || n.includes('daniel');
        });
        if (maleVoice) return maleVoice;
      }
      return naturalMatches[0];
    }

    // 3. English/India/UK/US voices
    const enVoices = voices.filter((v) => v.lang.startsWith('en'));
    if (enVoices.length > 0) {
      return enVoices[0];
    }

    return voices[0] || null;
  }

  // Speak with human voice (Attempts Gemini TTS first, seamlessly falls back to high-grade natural synthesis)
  public async speak(
    text: string,
    onEnd?: () => void,
    options?: {
      voice?: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
      fallbackOnly?: boolean;
      base64Audio?: string | null;
      langCode?: string;
    }
  ): Promise<void> {
    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // 1. If base64 PCM audio was provided directly, play it immediately
    if (options?.base64Audio) {
      const success = this.playPcmAudio(options.base64Audio, 24000, onEnd);
      if (success) return;
    }

    // 2. Unless offline/fallback-only, attempt server-side realistic human voice (Gemini TTS) with fast 1000ms timeout
    if (
      !options?.fallbackOnly &&
      this.serverTtsAvailable !== false &&
      typeof window !== 'undefined' &&
      navigator.onLine
    ) {
      try {
        const voiceChoice = options?.voice || this.currentVoiceProfile.geminiVoice;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const res = await fetch('/api/ai/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text,
            voice: voiceChoice,
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            this.serverTtsAvailable = true;
            const played = this.playPcmAudio(data.audioBase64, data.sampleRate || 24000, onEnd);
            if (played) return;
          } else {
            // Server reported offline_fallback (API key not configured)
            this.serverTtsAvailable = false;
          }
        } else {
          this.serverTtsAvailable = false;
        }
      } catch {
        this.serverTtsAvailable = false;
      }
    }

    // 3. High-Fidelity Tuned Browser Speech Synthesis Fallback (Natural, non-robotic prosody)
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      // Chromium recovery: If synth was paused by browser, resume immediately
      if (this.synth.paused) {
        this.synth.resume();
      }
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      const langCode = options?.langCode || this.detectLanguage(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      // Gentle, calm human cadence (0.92 = comforting, natural conversational speed)
      utterance.rate = 0.92;
      // Natural human pitch (1.0 = smooth, non-robotic)
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const chosenVoice = this.selectBestHumanVoice(langCode);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      this.isSpeakingNow = true;
      this.activeUtterance = utterance;
      // Also pin to window object to prevent aggressive Chromium V8 garbage collection
      if (typeof window !== 'undefined') {
        (window as any).__mindMithraActiveUtterance = utterance;
      }

      let hasFinished = false;
      const finish = () => {
        if (hasFinished) return;
        hasFinished = true;
        if (this.speechWatchdogTimer) {
          clearTimeout(this.speechWatchdogTimer);
          this.speechWatchdogTimer = null;
        }
        this.isSpeakingNow = false;
        this.activeUtterance = null;
        if (typeof window !== 'undefined') {
          (window as any).__mindMithraActiveUtterance = null;
        }
        if (onEnd) onEnd();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Chrome SpeechSynthesis failsafe: Chrome can occasionally drop utterance.onend on longer sentences
      const maxExpectedDurationMs = Math.max(3500, Math.ceil(text.length * 110) + 2000);
      this.speechWatchdogTimer = setTimeout(() => {
        if (this.activeUtterance === utterance && this.isSpeakingNow) {
          finish();
        }
      }, maxExpectedDurationMs);

      // Brief tick (25ms) allows any prior cancel() to drain before queuing new speech
      setTimeout(() => {
        if (this.synth) {
          if (this.synth.paused) this.synth.resume();
          this.synth.speak(utterance);
        }
      }, 25);
    } catch {
      this.isSpeakingNow = false;
      this.activeUtterance = null;
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking(): void {
    if (this.speechWatchdogTimer) {
      clearTimeout(this.speechWatchdogTimer);
      this.speechWatchdogTimer = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
    if (this.currentPcmSource) {
      try {
        this.currentPcmSource.stop();
      } catch {
        // Ignore
      }
      this.currentPcmSource = null;
    }
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any).__mindMithraActiveUtterance = null;
    }
    this.isSpeakingNow = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  // Offline Voice Intent Matcher (Works 100% locally when network is disconnected)
  public parseOfflineIntent(transcript: string): ParsedVoiceCommand {
    const raw = transcript.toLowerCase().trim();

    if (raw.includes('help') || raw.includes('emergency') || raw.includes('sos') || raw.includes('danger') || raw.includes('save me')) {
      return {
        intent: 'TRIGGER_SOS',
        confidence: 0.98,
        responseVoiceText: 'Alerting your caregiver immediately. Take a deep breath, you are safe and loved.',
      };
    }

    if (raw.includes('call') || raw.includes('phone') || raw.includes('contact') || raw.includes('talk to')) {
      return {
        intent: 'CALL_FAMILY',
        confidence: 0.95,
        responseVoiceText: 'Opening your family contacts to call your loved ones.',
        actionRoute: 'FAMILY_TREE',
      };
    }

    if (raw.includes('daughter') || raw.includes('priyanka') || raw.includes('voice note') || raw.includes('family voice')) {
      return {
        intent: 'PLAY_FAMILY_VOICE',
        confidence: 0.95,
        responseVoiceText: "Playing your daughter Priyanka's comforting voice note for you now.",
        actionRoute: 'FAMILY_TREE',
      };
    }

    if (raw.includes('family') || raw.includes('tree') || raw.includes('children') || raw.includes('granddaughter') || raw.includes('ananya')) {
      return {
        intent: 'OPEN_FAMILY_TREE',
        confidence: 0.95,
        responseVoiceText: 'Opening your family circle and loved ones tree.',
        actionRoute: 'FAMILY_TREE',
      };
    }

    if (raw.includes('medicine') || raw.includes('pill') || raw.includes('water') || raw.includes('reminder') || raw.includes('routine')) {
      return {
        intent: 'CHECK_REMINDERS',
        confidence: 0.94,
        responseVoiceText: 'Here is your daily routine and health reminders. You are doing so well today.',
        actionRoute: 'REMINDERS',
      };
    }

    if (raw.includes('music') || raw.includes('song') || raw.includes('flute') || raw.includes('peaceful melody')) {
      return {
        intent: 'PLAY_MUSIC',
        confidence: 0.92,
        responseVoiceText: 'Playing gentle traditional flute and nature sounds to help you rest and feel at peace.',
        actionRoute: 'RELAX',
      };
    }

    if (raw.includes('soundscape') || raw.includes('sounds') || raw.includes('rain') || raw.includes('birds') || raw.includes('sound of')) {
      return {
        intent: 'OPEN_SOUNDSCAPES',
        confidence: 0.92,
        responseVoiceText: 'Playing relaxing nature and courtyard sounds for you.',
        actionRoute: 'RADIO',
      };
    }

    if (raw.includes('day') || raw.includes('journal') || raw.includes('diary') || raw.includes('today i') || raw.includes('went to')) {
      return {
        intent: 'OPEN_JOURNAL',
        confidence: 0.93,
        responseVoiceText: 'Opening your daily journal. I would love to hear all about your day!',
        actionRoute: 'JOURNAL',
      };
    }

    if (raw.includes('memory') || raw.includes('photo') || raw.includes('album') || raw.includes('who is')) {
      return {
        intent: 'OPEN_MEMORIES',
        confidence: 0.92,
        extractedQuery: transcript,
        responseVoiceText: 'Opening your precious family photos and memories. It is always heartwarming to revisit them with you.',
        actionRoute: 'MEMORIES',
      };
    }

    if (raw.includes('game') || raw.includes('activity') || raw.includes('exercise') || raw.includes('play') || raw.includes('start') || raw.includes('puzzle')) {
      return {
        intent: 'START_ACTIVITY',
        confidence: 0.95,
        responseVoiceText: 'Opening your personalized activity. Let us have a wonderful time together, my dear friend!',
        actionRoute: 'GAMES',
      };
    }

    if (raw.includes('home') || raw.includes('main') || raw.includes('back') || raw.includes('stop')) {
      return {
        intent: 'GO_HOME',
        confidence: 0.96,
        responseVoiceText: 'Taking you back home. I am always right here whenever you need me.',
        actionRoute: 'HOME',
      };
    }

    if (raw.includes('baseline') || raw.includes('know you') || raw.includes('assessment')) {
      return {
        intent: 'START_ACTIVITY',
        confidence: 0.90,
        responseVoiceText: 'Starting our friendly conversation activity. Take your time, there is no hurry at all.',
        actionRoute: 'BASELINE',
      };
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.5,
      extractedQuery: transcript,
      responseVoiceText: 'I am right here with you, your Mind Mithra companion. We can chat, look at family photos, or start today\'s gentle game.',
    };
  }

  public parseIntentOffline(transcript: string): ParsedVoiceCommand {
    return this.parseOfflineIntent(transcript);
  }
}

export const audioService = new AudioService();

