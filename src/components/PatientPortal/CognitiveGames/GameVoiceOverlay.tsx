import React, { useEffect, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Lightbulb, 
  SkipForward, 
  Pause, 
  Play,
  Sparkles 
} from 'lucide-react';
import { gameVoiceController, GameVoiceState } from '../../../lib/gameVoiceController';

interface GameVoiceOverlayProps {
  onManualRepeat?: () => void;
  onManualHint?: () => void;
  onManualSkip?: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
}

export const GameVoiceOverlay: React.FC<GameVoiceOverlayProps> = ({
  onManualRepeat,
  onManualHint,
  onManualSkip,
  onTogglePause,
  isPaused = false,
}) => {
  const [voiceState, setVoiceState] = useState<GameVoiceState>({
    turnState: 'IDLE',
    transcript: '',
    interimTranscript: '',
    lastSpokenFeedback: null,
    isMicActive: false,
    recognitionAvailable: true,
    isMuted: false,
  });

  useEffect(() => {
    const unsubscribe = gameVoiceController.subscribe((state) => {
      setVoiceState(state);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleMicClick = () => {
    if (voiceState.isMicActive) {
      gameVoiceController.stopListening();
    } else {
      gameVoiceController.startListening();
    }
  };

  const handleMuteClick = () => {
    gameVoiceController.toggleMute();
  };

  const isSpeaking = voiceState.turnState === 'QUESTION_SPEAKING' || voiceState.turnState === 'FEEDBACK_SPEAKING' || voiceState.turnState === 'WELCOME';
  const isListening = voiceState.turnState === 'LISTENING';

  return (
    <div className="w-full bg-gradient-to-r from-[#FFFDF7] via-[#FFF9EE] to-[#FFF3DC] border-2 border-[#E9C37A] rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-2.5 transition-all select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Companion Voice Status Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={!voiceState.recognitionAvailable || voiceState.isMuted}
            aria-label={isListening ? 'Microphone is listening' : 'Tap to speak'}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all cursor-pointer ${
              isListening
                ? 'bg-gradient-to-b from-[#FBBF24] to-[#D97706] text-stone-950 border-white ring-4 ring-[#FDE68A] animate-pulse scale-105'
                : isSpeaking
                ? 'bg-[#E2EBD9] text-[#26302A] border-[#789477]/40'
                : 'bg-white text-[#7C4A1E] border-[#ECD1A4] hover:bg-[#FFFDF7]'
            } disabled:opacity-40`}
          >
            {isListening ? (
              <Mic className="w-6 h-6 stroke-[2.4]" />
            ) : isSpeaking ? (
              <Volume2 className="w-6 h-6 text-[#16A34A] animate-bounce" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-xs sm:text-sm font-black text-[#2D2115] tracking-tight truncate">
                {isListening
                  ? "I'm listening to you..."
                  : isSpeaking
                  ? 'Mind Mithra is speaking...'
                  : voiceState.turnState === 'PROCESSING'
                  ? 'Understanding...'
                  : isPaused
                  ? 'Game Paused'
                  : 'Voice Companion Active'}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-[#6B543E] truncate">
              {isListening
                ? 'Speak your answer or say "Hint" or "Repeat"'
                : 'Speak naturally, or tap your answer anytime'}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleMuteClick}
            title={voiceState.isMuted ? 'Unmute voice' : 'Mute voice'}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#ECD1A4] text-[#6B543E] hover:text-[#2D2115] hover:bg-[#FFFDF7] transition cursor-pointer"
          >
            {voiceState.isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#D97706]" />
            )}
          </button>

          {onTogglePause && (
            <button
              type="button"
              onClick={onTogglePause}
              title={isPaused ? 'Resume game' : 'Pause game'}
              className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#ECD1A4] text-[#6B543E] hover:text-[#2D2115] hover:bg-[#FFFDF7] transition cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Spoken Transcript or Feedback Message Bubble */}
      {(voiceState.transcript || voiceState.lastSpokenFeedback) && (
        <div className="px-3.5 py-2 rounded-2xl bg-white/95 border border-[#ECD1A4] text-xs space-y-1">
          {voiceState.transcript && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#D97706] shrink-0">You:</span>
              <span className="font-bold text-[#2D2115] italic truncate">
                "{voiceState.transcript}"
              </span>
            </div>
          )}
          {voiceState.lastSpokenFeedback && !voiceState.transcript && (
            <div className="flex items-center gap-2 text-[#5A4533]">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="font-medium text-[11px] truncate">
                {voiceState.lastSpokenFeedback}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quick Action Pills: Repeat, Hint, Skip */}
      <div className="flex items-center gap-2 pt-0.5 overflow-x-auto no-scrollbar">
        {onManualRepeat && (
          <button
            type="button"
            onClick={onManualRepeat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FFFDF7] border border-[#ECD1A4] text-[#6B543E] text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Say "Repeat"</span>
          </button>
        )}

        {onManualHint && (
          <button
            type="button"
            onClick={onManualHint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FFFDF7] border border-[#ECD1A4] text-[#6B543E] text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Say "Hint"</span>
          </button>
        )}

        {onManualSkip && (
          <button
            type="button"
            onClick={onManualSkip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FFFDF7] border border-[#ECD1A4] text-[#6B543E] text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 text-stone-500" />
            <span>Say "Skip"</span>
          </button>
        )}
      </div>
    </div>
  );
};
