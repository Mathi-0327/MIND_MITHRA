import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  X, 
  Pill, 
  Droplets, 
  Sparkles, 
  Heart, 
  Music, 
  Sun, 
  Moon 
} from 'lucide-react';
import { ReminderItem, SupportedLanguage } from '../../types';
import { audioService } from '../../lib/audioService';

interface ReminderAlertModalProps {
  reminder: ReminderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (reminder: ReminderItem) => void;
  onSnooze: (reminder: ReminderItem, minutes?: number) => void;
  patientName: string;
  language: SupportedLanguage;
}

export const ReminderAlertModal: React.FC<ReminderAlertModalProps> = ({
  reminder,
  isOpen,
  onClose,
  onAcknowledge,
  onSnooze,
  patientName,
  language,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (isOpen && reminder) {
      // 1. Play pleasant melodic notification chime sequence
      audioService.playReminderAlarmSequence(2);

      // 2. Speak reassuring reminder prompt after chime
      const timer = setTimeout(() => {
        const prompt = reminder.voicePromptText || `${patientName}, time for your ${reminder.title}.`;
        setIsPlayingAudio(true);
        audioService.speak(prompt, () => {
          setIsPlayingAudio(false);
        });
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, reminder, patientName]);

  if (!isOpen || !reminder) return null;

  const handleSpeakAgain = () => {
    setIsPlayingAudio(true);
    const prompt = reminder.voicePromptText || `${patientName}, time for your ${reminder.title}.`;
    audioService.speak(prompt, () => {
      setIsPlayingAudio(false);
    });
  };

  const getCategoryIcon = () => {
    switch (reminder.type) {
      case 'MEDICATION':
        return <Pill className="w-9 h-9 text-amber-600" />;
      case 'HYDRATION':
        return <Droplets className="w-9 h-9 text-sky-600" />;
      case 'ACTIVITY':
        return <Sparkles className="w-9 h-9 text-purple-600" />;
      case 'ROUTINE':
        return reminder.timeOfDay === 'NIGHT' ? (
          <Moon className="w-9 h-9 text-indigo-600" />
        ) : (
          <Sun className="w-9 h-9 text-amber-500" />
        );
      default:
        return <Heart className="w-9 h-9 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden p-6 sm:p-8 transform transition-all animate-scale-up">
        {/* Decorative Glowing Accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Pulsing Bell */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce">
              <Bell className="w-7 h-7 fill-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                🔔 Time's Up Reminder
              </span>
              <p className="text-xs text-stone-500 font-bold mt-1">
                Scheduled for {reminder.scheduledTime} ({reminder.timeOfDay})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Reminder Content Box */}
        <div className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="w-18 h-18 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
            {getCategoryIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
              {reminder.title}
            </h3>
            <p className="text-sm font-bold text-amber-950 mt-1">
              {reminder.dosageOrInstruction || 'Daily routine care item'}
            </p>
          </div>
        </div>

        {/* Spoken Narration Reassurance Box */}
        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Volume2 className={`w-5 h-5 shrink-0 ${isPlayingAudio ? 'text-amber-600 animate-pulse' : 'text-stone-500'}`} />
            <p className="text-xs sm:text-sm font-semibold text-stone-700 truncate italic">
              "{reminder.voicePromptText}"
            </p>
          </div>
          <button
            onClick={handleSpeakAgain}
            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold shrink-0 transition-colors"
          >
            Hear Again
          </button>
        </div>

        {/* Action Buttons: Clear & Big for Dementia Elders */}
        <div className="space-y-3">
          <button
            onClick={() => onAcknowledge(reminder)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>I Have Done This Now</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSnooze(reminder, 10)}
              className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Remind in 10 Mins</span>
            </button>

            <button
              onClick={() => onSnooze(reminder, 30)}
              className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Remind in 30 Mins</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
