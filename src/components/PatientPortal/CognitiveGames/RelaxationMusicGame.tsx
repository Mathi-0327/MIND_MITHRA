import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Music, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Wind, 
  Play, 
  Pause,
  Waves,
  TreePine,
  Sliders
} from 'lucide-react';
import { audioService } from '../../../lib/audioService';
import { soundscapeEngine, SoundscapeType } from '../../../lib/soundscapeEngine';

interface RelaxationMusicGameProps {
  onBack: () => void;
  patientName: string;
}

interface SoundscapeItem {
  id: SoundscapeType;
  title: string;
  description: string;
  region: string;
  icon: string;
  ambience: string;
}

export const RelaxationMusicGame: React.FC<RelaxationMusicGameProps> = ({
  onBack,
  patientName,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [selectedMelody, setSelectedMelody] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const melodies: SoundscapeItem[] = [
    {
      id: 'BAMBOO_FLUTE',
      title: 'Peaceful Assam Bamboo Flute',
      description: 'Gentle traditional pastoral woodwind (Bansuri scale) with soothing tanpura drone',
      region: 'Assam Plains',
      icon: '🪈',
      ambience: 'Warm bamboo resonance & morning tea garden tranquility',
    },
    {
      id: 'SHILLONG_FOREST',
      title: 'Pine Forest Breeze of Shillong',
      description: 'Mountain wind swells and gentle singing mountain birds (Bulbul & Thrush)',
      region: 'Meghalaya Hills',
      icon: '🌲',
      ambience: 'Fresh highland pine breeze & soothing hill birds',
    },
    {
      id: 'BRAHMAPUTRA_RIVER',
      title: 'Brahmaputra River Calm Ripples',
      description: 'Harmonic river water currents echoing evening ghat meditation singing bowls',
      region: 'Tezpur Ghat',
      icon: '🌊',
      ambience: 'Sunset river ripples & resonant temple bells',
    },
  ];

  // Breathing pacer loop (4s inhale -> 4s hold -> 4s exhale)
  useEffect(() => {
    const phases: Array<'Inhale' | 'Hold' | 'Exhale'> = ['Inhale', 'Hold', 'Exhale'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setBreathPhase(phases[idx]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundscapeEngine.stop();
      audioService.stopSpeaking();
    };
  }, []);

  // Handle play / pause soundscape
  const handleSelectAndPlay = (idx: number) => {
    setSelectedMelody(idx);
    const targetSound = melodies[idx];

    if (isPlaying && selectedMelody === idx) {
      // Pause
      soundscapeEngine.stop();
      setIsPlaying(false);
      audioService.stopSpeaking();
    } else {
      // Start or switch track
      setIsPlaying(true);
      soundscapeEngine.play(targetSound.id);
      soundscapeEngine.setVolume(isMuted ? 0 : volume);
      audioService.speak(
        `Playing ${targetSound.title}. Take a slow, peaceful breath, ${patientName}. Let your mind rest.`
      );
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundscapeEngine.stop();
      setIsPlaying(false);
      audioService.stopSpeaking();
    } else {
      const targetSound = melodies[selectedMelody];
      setIsPlaying(true);
      soundscapeEngine.play(targetSound.id);
      soundscapeEngine.setVolume(isMuted ? 0 : volume);
      audioService.speak(
        `Playing ${targetSound.title}. Take a gentle breath, ${patientName}.`
      );
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (isMuted && newVal > 0) {
      setIsMuted(false);
    }
    soundscapeEngine.setVolume(newVal);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      soundscapeEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      soundscapeEngine.setVolume(0);
    }
  };

  const currentSound = melodies[selectedMelody];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
        <button
          onClick={() => {
            soundscapeEngine.stop();
            audioService.stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <span>Relaxation & Traditional Soundscapes</span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Calming breath exercises & authentic regional ambient synthesis
          </p>
        </div>

        <div className="w-20" />
      </div>

      {/* Breathing Bubble Pacer */}
      <div className="bg-gradient-to-b from-sky-50 via-teal-50 to-emerald-50 border-2 border-teal-200 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-inner my-4">
        <span className="text-xs font-black text-teal-800 uppercase tracking-widest block mb-4">
          Gentle Breathing Pacer
        </span>

        <div className="flex items-center justify-center py-4">
          <div
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-3000 ease-in-out transform ${
              breathPhase === 'Inhale'
                ? 'scale-120 bg-teal-600 ring-16 ring-teal-200/60'
                : breathPhase === 'Hold'
                ? 'scale-110 bg-sky-600 ring-12 ring-sky-200/60'
                : 'scale-90 bg-amber-500 ring-8 ring-amber-200/60'
            }`}
          >
            <Wind className="w-10 h-10 mb-1 animate-pulse" />
            <span className="text-xl sm:text-2xl font-black">{breathPhase}</span>
            <span className="text-[11px] font-bold opacity-90">4 Seconds</span>
          </div>
        </div>

        <p className="text-sm font-bold text-stone-700 mt-3">
          {breathPhase === 'Inhale'
            ? 'Gently breathe in the fresh morning air...'
            : breathPhase === 'Hold'
            ? 'Hold softly and feel the peaceful calm...'
            : 'Slowly let out your breath with ease...'}
        </p>
      </div>

      {/* Active Soundscape Player Bar */}
      <div className="bg-amber-50/80 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 my-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
              {currentSound.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                  {currentSound.region}
                </span>
                {isPlaying && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Playing Soundscape
                  </span>
                )}
              </div>
              <h3 className="font-black text-stone-900 text-base">{currentSound.title}</h3>
              <p className="text-xs text-stone-600">{currentSound.ambience}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Audio Wave Visualizer Bars */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-7 px-2">
                <span className="w-1 bg-amber-600 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                <span className="w-1 bg-amber-600 rounded-full animate-[bounce_0.8s_infinite_300ms] h-6" />
                <span className="w-1 bg-amber-600 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4" />
                <span className="w-1 bg-amber-600 rounded-full animate-[bounce_0.8s_infinite_400ms] h-7" />
                <span className="w-1 bg-amber-600 rounded-full animate-[bounce_0.8s_infinite_150ms] h-5" />
              </div>
            )}

            {/* Master Play/Pause Toggle */}
            <button
              onClick={handleTogglePlay}
              className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-100'
                  : 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-100'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause Sound</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Sound</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Volume & Audio Controls */}
        <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-stone-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-800" />
              )}
            </button>
            <div className="flex items-center gap-2 flex-1 sm:w-48">
              <span className="text-[11px] font-bold text-stone-600 shrink-0">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[11px] font-bold text-stone-700 w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>100% Offline Procedural Web Audio Synthesis</span>
          </div>
        </div>
      </div>

      {/* Traditional Soundscape Selection List */}
      <div className="space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black text-stone-500 uppercase tracking-wider">
            Choose Traditional Soundscape
          </p>
          <span className="text-xs text-stone-500">Tap any sound to listen</span>
        </div>

        {melodies.map((m, idx) => {
          const isCurrent = selectedMelody === idx;
          const isThisPlaying = isCurrent && isPlaying;

          return (
            <div
              key={m.id}
              onClick={() => handleSelectAndPlay(idx)}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                isCurrent
                  ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-200/50'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl p-2.5 bg-white rounded-2xl shadow-xs border border-stone-100 shrink-0">
                  {m.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                      {m.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                      {m.region}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">{m.description}</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAndPlay(idx);
                }}
                className={`p-3 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                  isThisPlaying
                    ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-200'
                    : isCurrent
                    ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-200'
                    : 'bg-stone-200 text-stone-700 hover:bg-amber-600 hover:text-white'
                }`}
              >
                {isThisPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span className="hidden sm:inline">Play Soundscape</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

