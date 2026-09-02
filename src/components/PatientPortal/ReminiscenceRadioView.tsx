import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Radio, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Check, 
  HelpCircle,
  Disc
} from 'lucide-react';
import { audioService } from '../../lib/audioService';
import { localDB } from '../../lib/storage';

interface ReminiscenceRadioViewProps {
  onBack: () => void;
  patientName: string;
}

interface RegionalTrack {
  id: string;
  title: string;
  artistOrGenre: string;
  region: string;
  culturalDescription: string;
  memoryPrompt: string;
  suggestedAnswers: string[];
  baseFreq: number;
}

const REGIONAL_TRACKS: RegionalTrack[] = [
  {
    id: 'track-1',
    title: 'Srimanta Sankardev Borgeet',
    artistOrGenre: 'Traditional Sattriya Raga',
    region: 'Majuli & Nagaon, Assam',
    culturalDescription: 'Sacred classical devotional melodies composed by Mahapurush Srimanta Sankardev, soothing the heart with spiritual serenity.',
    memoryPrompt: 'Did your family gather in the prayer room or Namghar for evening prayers in Assam?',
    suggestedAnswers: [
      'Yes, in our ancestral Namghar with clay lamps',
      'Yes, my mother sang these melodies at sunset',
      'I remember the sweet smell of incense and dhoop',
    ],
    baseFreq: 261.63, // C4
  },
  {
    id: 'track-2',
    title: 'Goalpariya Lokageet (Hastir Kanya)',
    artistOrGenre: 'Pratima Barua Pandey Style',
    region: 'Goalpara / Brahmaputra Valley',
    culturalDescription: 'Soul-stirring river melodies that capture the gentle rhythm of boatmen and village life along the mighty Brahmaputra.',
    memoryPrompt: 'Do you remember the boat rides across the Brahmaputra River during harvest seasons?',
    suggestedAnswers: [
      'Yes, crossing the river by wooden ferry',
      'The cool river breeze on quiet afternoons',
      'Singing folk songs with childhood friends',
    ],
    baseFreq: 293.66, // D4
  },
  {
    id: 'track-3',
    title: 'Rongali Bihu Spring Dhol Rhythm',
    artistOrGenre: 'Folk Pepa & Dhol Celebration',
    region: 'Upper Assam & Tea Estates',
    culturalDescription: 'Joyous spring rhythms celebrating the New Year, blooming orchid Kopou flowers, and fresh tea garden flushes.',
    memoryPrompt: 'Did you participate in Rongali Bihu dancing under the shade of the grand banyan tree?',
    suggestedAnswers: [
      'Yes! Playing the dhol and buffalo horn pepa',
      'Weaving red-and-white Gamosa for elders',
      'Sharing homemade Pitha and Laru sweets',
    ],
    baseFreq: 329.63, // E4
  },
  {
    id: 'track-4',
    title: 'Shillong Pine Hills Acoustic Melody',
    artistOrGenre: 'Khasi Choral Folk',
    region: 'Meghalaya & Shillong Hills',
    culturalDescription: 'Gentle acoustic strings and pine hill harmonies evoking the misty morning clouds of the Scottish Highlands of the East.',
    memoryPrompt: 'Have you visited the cool pine forests and waterfalls of Shillong or Cherrapunji?',
    suggestedAnswers: [
      'Yes, drinking hot sweet tea in police bazar',
      'The green rolling hills and waterfalls',
      'A wonderful holiday trip with family',
    ],
    baseFreq: 392.00, // G4
  },
  {
    id: 'track-5',
    title: 'Mizo Cheraw Bamboo Harmony',
    artistOrGenre: 'Traditional Bamboo Dance Melody',
    region: 'Mizoram & Lushai Hills',
    culturalDescription: 'Rhythmic acoustic harmonies inspired by the graceful stepping between rhythmic bamboo staves in the hills.',
    memoryPrompt: 'Do you enjoy the gentle rhythmic tapping and traditional community dances of the hills?',
    suggestedAnswers: [
      'Yes, the rhythm is so energetic and happy',
      'I love the traditional folk costumes and colors',
    ],
    baseFreq: 440.00, // A4
  },
];

export const ReminiscenceRadioView: React.FC<ReminiscenceRadioViewProps> = ({
  onBack,
  patientName,
}) => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [answeredPrompts, setAnsweredPrompts] = useState<Record<string, string>>({});
  const [customMemory, setCustomMemory] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const melodicTimerRef = useRef<number | null>(null);

  const track = REGIONAL_TRACKS[currentTrackIdx];

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // Stop music synthesizer
  const stopAudio = () => {
    if (melodicTimerRef.current) {
      window.clearInterval(melodicTimerRef.current);
      melodicTimerRef.current = null;
    }

    oscNodesRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    oscNodesRef.current = [];
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch {}
      gainNodeRef.current = null;
    }
  };

  // Start soothing regional sound synthesis
  const startAudio = (baseFreq: number) => {
    stopAudio();
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      const currentLevel = isMuted ? 0 : volume * 0.18;
      masterGain.gain.setValueAtTime(currentLevel, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Harmony chords based on pentatonic Indian/Folk scales
      const freqs = [
        baseFreq,
        baseFreq * 1.25, // Major 3rd
        baseFreq * 1.5,  // 5th (Pancham drone)
        baseFreq * 0.5,  // Sub-bass tanpura foundation
      ];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : idx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Gentle subtle vibrato/lfo
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        osc.connect(masterGain);
        osc.start();
        oscNodesRef.current.push(osc);
      });

      // Melodic notes sequence (pastoral bells/chimes in scale)
      const scaleSteps = [1, 1.125, 1.25, 1.5, 1.667, 2.0];
      const playMelodyNote = () => {
        if (!gainNodeRef.current || !audioCtxRef.current) return;
        const cNow = audioCtxRef.current.currentTime;
        const randomStep = scaleSteps[Math.floor(Math.random() * scaleSteps.length)];
        const noteOsc = audioCtxRef.current.createOscillator();
        const noteGain = audioCtxRef.current.createGain();

        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(baseFreq * randomStep, cNow);

        noteGain.gain.setValueAtTime(0.001, cNow);
        noteGain.gain.linearRampToValueAtTime(0.08, cNow + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, cNow + 1.6);

        noteOsc.connect(noteGain);
        noteGain.connect(gainNodeRef.current);

        noteOsc.start(cNow);
        noteOsc.stop(cNow + 1.8);
      };

      melodicTimerRef.current = window.setInterval(playMelodyNote, 2400);
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudio(track.baseFreq);
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isPlaying, currentTrackIdx]);

  const togglePlay = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    audioService.playFeedbackSound('GENTLE_TAP');
    setIsPlaying((prev) => !prev);
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (isMuted && newVal > 0) setIsMuted(false);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(newVal * 0.18, audioCtxRef.current.currentTime, 0.05);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(volume * 0.18, audioCtxRef.current.currentTime, 0.05);
      }
    } else {
      setIsMuted(true);
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.05);
      }
    }
  };

  const handleNext = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    setCurrentTrackIdx((prev) => (prev + 1) % REGIONAL_TRACKS.length);
  };

  const handlePrev = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    setCurrentTrackIdx((prev) => (prev - 1 + REGIONAL_TRACKS.length) % REGIONAL_TRACKS.length);
  };

  const handleSelectAnswer = (ans: string) => {
    audioService.playFeedbackSound('SUCCESS');
    setAnsweredPrompts((prev) => ({ ...prev, [track.id]: ans }));
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);

    // Save recall interaction to local DB
    localDB.saveGameSession({
      sessionId: `session-radio-${Date.now()}`,
      patientId: 'patient-rk-001',
      gameId: 'REMINISCENCE_RADIO',
      category: 'MEMORY',
      score: 100,
      accuracyPercent: 100,
      avgResponseTimeMs: 2500,
      difficulty: 1,
      totalAttempts: 1,
      completed: true,
      abandoned: false,
      timestamp: new Date().toISOString(),
      feedbackText: `Nostalgic Recall: ${track.title} - ${ans}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopAudio();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
          <Radio className="w-4 h-4 text-amber-700" />
          <span>Regional Nostalgia Radio</span>
        </div>
      </div>

      {/* Radio Tuner & Retro Visual Player */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-amber-600/60 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Spinning Disc Effect */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-950 border-4 border-amber-500/80 flex items-center justify-center shadow-xl shrink-0">
              <Disc className={`w-14 h-14 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
              <div className="absolute w-6 h-6 rounded-full bg-amber-600 border-2 border-stone-900" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                {track.region} • Station {currentTrackIdx + 1}/{REGIONAL_TRACKS.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {track.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-0.5 font-medium">
                {track.artistOrGenre}
              </p>
            </div>
          </div>

          {/* Big Player Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Audio Wave Visualizer */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-6 px-2">
                <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-6" />
                <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4" />
                <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_infinite_400ms] h-5" />
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="p-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white transition-all active:scale-95 border border-stone-700 shadow-md"
                title="Previous Station"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 ring-4 ring-amber-400/30'
                    : 'bg-white hover:bg-stone-100 text-stone-900 ring-4 ring-white/20'
                }`}
                title={isPlaying ? 'Pause Melody' : 'Play Melody'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-stone-950" />
                ) : (
                  <Play className="w-7 h-7 fill-stone-900 ml-1" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white transition-all active:scale-95 border border-stone-700 shadow-md"
                title="Next Station"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Volume & Melody Story */}
        <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-28 sm:w-36 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] font-bold text-amber-400 w-7 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-stone-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Harmonic Raga Sound Synthesis</span>
          </div>
        </div>

        {/* Melody Story / Description */}
        <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-700 text-xs sm:text-sm text-stone-300 leading-relaxed">
          <p>{track.culturalDescription}</p>
        </div>
      </div>

      {/* Reminiscence Recall Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-300 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Warm Memory Recall Conversation</span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
          "{track.memoryPrompt}"
        </h3>

        {/* Suggested Response Buttons */}
        <div className="space-y-2.5 pt-2">
          {track.suggestedAnswers.map((ans, idx) => {
            const isSelected = answeredPrompts[track.id] === ans;

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(ans)}
                className={`w-full p-4 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-3 border-2 ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 text-amber-950 shadow-sm'
                    : 'bg-stone-50 hover:bg-amber-50/70 border-stone-200 text-stone-800'
                }`}
              >
                <span>{ans}</span>
                {isSelected && <Check className="w-5 h-5 text-amber-700 shrink-0" />}
              </button>
            );
          })}
        </div>

        {isSavedFeedback && (
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Memory logged! Engaging nostalgic recall strengthens neural connections.</span>
          </div>
        )}
      </div>

      {/* Station List Selector */}
      <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-xs">
        <h4 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider mb-4">
          All North Eastern Heritage Stations
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REGIONAL_TRACKS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => {
                audioService.playFeedbackSound('GENTLE_TAP');
                setCurrentTrackIdx(idx);
                setIsPlaying(true);
              }}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all flex items-center justify-between gap-2 ${
                currentTrackIdx === idx
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
              }`}
            >
              <div>
                <p className="font-extrabold text-xs sm:text-sm text-stone-900">{t.title}</p>
                <p className="text-[11px] text-stone-500">{t.region}</p>
              </div>
              {currentTrackIdx === idx && isPlaying && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
