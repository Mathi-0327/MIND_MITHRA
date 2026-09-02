// Web Audio API Procedural Soundscape Synthesizer for Mind Mithra Relaxation & Soundscapes

export type SoundscapeType = 'BAMBOO_FLUTE' | 'SHILLONG_FOREST' | 'BRAHMAPUTRA_RIVER';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: SoundscapeType | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.6;

  // Active nodes & timers
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private activeFilters: BiquadFilterNode[] = [];
  private activeTimers: number[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public play(type: SoundscapeType): void {
    this.stop();
    const ctx = this.initContext();
    if (!ctx) return;

    this.currentType = type;
    this.isRunning = true;

    // Master Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    if (type === 'BAMBOO_FLUTE') {
      this.startBambooFlute(ctx, this.masterGain);
    } else if (type === 'SHILLONG_FOREST') {
      this.startPineForest(ctx, this.masterGain);
    } else if (type === 'BRAHMAPUTRA_RIVER') {
      this.startRiverRipples(ctx, this.masterGain);
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.currentType = null;

    // Clear all interval timers
    this.activeTimers.forEach((t) => window.clearInterval(t));
    this.activeTimers = [];

    // Stop all oscillators
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    // Stop noise buffer
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {}
      this.noiseNode = null;
    }

    // Disconnect filters and gains
    this.activeFilters.forEach((f) => {
      try {
        f.disconnect();
      } catch {}
    });
    this.activeFilters = [];

    this.activeGains.forEach((g) => {
      try {
        g.disconnect();
      } catch {}
    });
    this.activeGains = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentType(): SoundscapeType | null {
    return this.currentType;
  }

  // --- 1. Peaceful Assam Bamboo Flute (Bansuri Scale & Tanpura Drone) ---
  private startBambooFlute(ctx: AudioContext, destination: GainNode): void {
    // A. Warm Drone (Tanpura foundation in C# / C)
    const droneFreqs = [130.81, 196.0, 261.63, 392.0]; // C3, G3, C4, G4
    droneFreqs.forEach((freq, idx) => {
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = idx === 0 ? 'triangle' : 'sine';
      droneOsc.frequency.setValueAtTime(freq, ctx.currentTime);

      const level = idx === 0 ? 0.08 : 0.04;
      droneGain.gain.setValueAtTime(level, ctx.currentTime);

      droneOsc.connect(droneGain);
      droneGain.connect(destination);
      droneOsc.start();

      this.activeOscillators.push(droneOsc);
      this.activeGains.push(droneGain);
    });

    // B. Bansuri Melodic Notes Generator (Raga Bhupali / Megh - pentatonic scale)
    const melodyScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C4, D4, E4, G4, A4, C5, D5, E5
    let currentNoteIdx = 2;

    const playFluteNote = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const freq = melodyScale[currentNoteIdx];
      const duration = 2.5 + Math.random() * 1.5;

      // Primary flute oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Breath Vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, now); // 5Hz natural flute vibrato
      lfoGain.gain.setValueAtTime(2.5, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      // Overtones for woodwind texture
      const harmonicOsc = this.ctx.createOscillator();
      harmonicOsc.type = 'sine';
      harmonicOsc.frequency.setValueAtTime(freq * 2, now); // 2nd harmonic

      const noteGain = this.ctx.createGain();
      // Soft woodwind envelope (slow attack, smooth decay)
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.6); // Breath in
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const harmGain = this.ctx.createGain();
      harmGain.gain.setValueAtTime(0.02, now);

      harmonicOsc.connect(harmGain);
      harmGain.connect(noteGain);

      osc.connect(noteGain);
      noteGain.connect(destination);

      osc.start(now);
      harmonicOsc.start(now);
      osc.stop(now + duration + 0.1);
      harmonicOsc.stop(now + duration + 0.1);
      lfo.stop(now + duration + 0.1);

      // Pick next meditative note in pentatonic sequence
      const step = Math.random() > 0.5 ? 1 : -1;
      currentNoteIdx = Math.max(0, Math.min(melodyScale.length - 1, currentNoteIdx + step));
    };

    // Trigger first note immediately, then on calm interval
    playFluteNote();
    const fluteTimer = window.setInterval(playFluteNote, 3200);
    this.activeTimers.push(fluteTimer);
  }

  // --- 2. Pine Forest Breeze of Shillong (Filtered Wind & Sweet Mountain Birds) ---
  private startPineForest(ctx: AudioContext, destination: GainNode): void {
    // A. Generate Pink/Brown Noise for Mountain Wind
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise approximation
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    this.noiseNode = noiseSource;

    // Resonant Lowpass Filter for Wind Swell
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);

    // LFO for slow mountain wind gusts
    const windLFO = ctx.createOscillator();
    const windLFOGain = ctx.createGain();
    windLFO.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow swell
    windLFOGain.gain.setValueAtTime(180, ctx.currentTime);
    windLFO.connect(filter.frequency);
    windLFO.start();

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.25, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(windGain);
    windGain.connect(destination);
    noiseSource.start();

    this.activeOscillators.push(windLFO);
    this.activeFilters.push(filter);
    this.activeGains.push(windGain);

    // B. Sweet Mountain Bird Chirp Generator
    const playBirdChirp = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const baseBirdFreq = 2200 + Math.random() * 800; // 2.2kHz - 3kHz

      const birdOsc = this.ctx.createOscillator();
      const birdGain = this.ctx.createGain();

      birdOsc.type = 'sine';
      birdOsc.frequency.setValueAtTime(baseBirdFreq, now);
      birdOsc.frequency.exponentialRampToValueAtTime(baseBirdFreq * 1.35, now + 0.08);
      birdOsc.frequency.exponentialRampToValueAtTime(baseBirdFreq * 0.9, now + 0.16);

      birdGain.gain.setValueAtTime(0.001, now);
      birdGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
      birdGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      birdOsc.connect(birdGain);
      birdGain.connect(destination);

      birdOsc.start(now);
      birdOsc.stop(now + 0.25);
    };

    const birdTimer = window.setInterval(() => {
      if (Math.random() > 0.3) {
        playBirdChirp();
        // Double chirp
        setTimeout(playBirdChirp, 140);
      }
    }, 2800);
    this.activeTimers.push(birdTimer);
  }

  // --- 3. Brahmaputra River Calm Ripples (Gentle Water Lapping & Sunset Temple Bell) ---
  private startRiverRipples(ctx: AudioContext, destination: GainNode): void {
    // A. River Water Flow Noise Buffer
    const bufferSize = ctx.sampleRate * 2.5;
    const waterBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = waterBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const waterSource = ctx.createBufferSource();
    waterSource.buffer = waterBuffer;
    waterSource.loop = true;
    this.noiseNode = waterSource;

    // Bandpass filter for water ripple resonance
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, ctx.currentTime);

    // Ripple modulation
    const rippleLFO = ctx.createOscillator();
    const rippleLFOGain = ctx.createGain();
    rippleLFO.frequency.setValueAtTime(0.28, ctx.currentTime);
    rippleLFOGain.gain.setValueAtTime(180, ctx.currentTime);
    rippleLFO.connect(bandpass.frequency);
    rippleLFO.start();

    const waterGain = ctx.createGain();
    waterGain.gain.setValueAtTime(0.2, ctx.currentTime);

    waterSource.connect(bandpass);
    bandpass.connect(waterGain);
    waterGain.connect(destination);
    waterSource.start();

    this.activeOscillators.push(rippleLFO);
    this.activeFilters.push(bandpass);
    this.activeGains.push(waterGain);

    // B. Sunset Temple Singing Bowl / Bell Harmonic
    const playTempleBell = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const fundamental = 392.0; // G4 bell tone

      const bellOsc1 = this.ctx.createOscillator();
      const bellOsc2 = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      bellOsc1.type = 'sine';
      bellOsc1.frequency.setValueAtTime(fundamental, now);

      bellOsc2.type = 'sine';
      bellOsc2.frequency.setValueAtTime(fundamental * 2.76, now); // Bell harmonic

      bellGain.gain.setValueAtTime(0.001, now);
      bellGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 4.5); // long reverberant chime

      bellOsc1.connect(bellGain);
      bellOsc2.connect(bellGain);
      bellGain.connect(destination);

      bellOsc1.start(now);
      bellOsc2.start(now);
      bellOsc1.stop(now + 4.6);
      bellOsc2.stop(now + 4.6);
    };

    playTempleBell();
    const bellTimer = window.setInterval(playTempleBell, 6500);
    this.activeTimers.push(bellTimer);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
