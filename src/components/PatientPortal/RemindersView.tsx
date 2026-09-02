import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Bell, 
  Droplets, 
  Pill, 
  Heart, 
  Sparkles, 
  Volume2, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Sun, 
  Sunset, 
  Moon, 
  Timer as TimerIcon,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';
import { ReminderItem, SupportedLanguage, ReminderType } from '../../types';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';
import { ReminderAlertModal } from './ReminderAlertModal';

interface RemindersViewProps {
  onBack: () => void;
  language: SupportedLanguage;
  patientName: string;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  onBack,
  language,
  patientName,
}) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => localDB.getReminders());
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'PENDING'>('ALL');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Custom Timer Countdown
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerLabel, setTimerLabel] = useState<string>('');
  
  // Alert Modal State
  const [alertReminder, setAlertReminder] = useState<ReminderItem | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  // Add Reminder Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReminderType>('MEDICATION');
  const [newScheduledTime, setNewScheduledTime] = useState('09:00 AM');
  const [newTimeOfDay, setNewTimeOfDay] = useState<'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'>('MORNING');
  const [newInstruction, setNewInstruction] = useState('');
  const [newVoicePrompt, setNewVoicePrompt] = useState('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer ticker
  useEffect(() => {
    if (activeTimerSeconds === null) return;

    if (activeTimerSeconds <= 0) {
      // Time is up!
      const triggered: ReminderItem = {
        id: `timer-alert-${Date.now()}`,
        patientId: 'patient-ravi-001',
        title: timerLabel || 'Scheduled Routine Care Alert',
        type: 'HYDRATION',
        scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeOfDay: 'MORNING',
        dosageOrInstruction: 'Time is up! Please take your scheduled care action.',
        status: 'PENDING',
        voicePromptText: `${patientName}, time is up for ${timerLabel || 'your scheduled reminder'}!`,
      };
      setAlertReminder(triggered);
      setIsAlertOpen(true);
      setActiveTimerSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimerSeconds, timerLabel, patientName]);

  const handleAcknowledge = (rem: ReminderItem) => {
    audioService.playFeedbackSound('SUCCESS');
    const updated: ReminderItem = {
      ...rem,
      status: 'ACKNOWLEDGED',
      acknowledgedAt: new Date().toISOString(),
    };

    localDB.updateReminder(updated);
    setReminders(localDB.getReminders());
    setIsAlertOpen(false);

    audioService.speak(`Thank you, ${patientName}. We marked ${rem.title} as completed.`);
  };

  const handleSnooze = (rem: ReminderItem, minutes = 15) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    const updated: ReminderItem = {
      ...rem,
      status: 'SNOOZED',
    };

    localDB.updateReminder(updated);
    setReminders(localDB.getReminders());
    setIsAlertOpen(false);

    // Set countdown for snooze alert
    setActiveTimerSeconds(minutes * 60);
    setTimerLabel(`Snoozed: ${rem.title}`);

    audioService.speak(`No problem, ${patientName}. We will remind you gently in ${minutes} minutes.`);
  };

  const handleSpeakPrompt = (rem: ReminderItem) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    const prompt = rem.voicePromptText || `${patientName}, this is your reminder for ${rem.title}.`;
    audioService.speak(prompt);
  };

  const handleTriggerTestAlert = (rem?: ReminderItem) => {
    const target = rem || reminders[0] || {
      id: 'test-rem',
      patientId: 'patient-ravi-001',
      title: 'Time for Morning Warm Water & Vitamin',
      type: 'MEDICATION',
      scheduledTime: '08:15 AM',
      timeOfDay: 'MORNING',
      dosageOrInstruction: 'Drink a glass of warm water and take 1 tablet after breakfast',
      status: 'PENDING',
      voicePromptText: `${patientName}, it is time for your warm water and morning tablet!`,
    };
    setAlertReminder(target);
    setIsAlertOpen(true);
  };

  const handleStartQuickTimer = (seconds: number, label: string) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    setActiveTimerSeconds(seconds);
    setTimerLabel(label);
    audioService.speak(`Started ${label} timer for ${Math.round(seconds / 60) || seconds} ${seconds >= 60 ? 'minutes' : 'seconds'}.`);
  };

  const handleResetToDementiaRoutine = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    const reset = localDB.resetRemindersToDefault();
    setReminders(reset);
    audioService.speak('Reset routine schedule to standard 10-step dementia daily care plan.');
  };

  const handleSaveNewReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: ReminderItem = {
      id: `rem-custom-${Date.now()}`,
      patientId: 'patient-ravi-001',
      title: newTitle.trim(),
      type: newType,
      scheduledTime: newScheduledTime,
      timeOfDay: newTimeOfDay,
      dosageOrInstruction: newInstruction.trim() || 'Daily dementia routine item',
      status: 'PENDING',
      voicePromptText: newVoicePrompt.trim() || `${patientName}, it is ${newScheduledTime}. Time for ${newTitle.trim()}.`,
    };

    localDB.addReminder(item);
    setReminders(localDB.getReminders());
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewInstruction('');
    setNewVoicePrompt('');
    audioService.playFeedbackSound('SUCCESS');
    audioService.speak(`Added ${item.title} to today's routine.`);
  };

  // Filter reminders
  const filteredReminders = reminders.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return r.status !== 'ACKNOWLEDGED';
    return r.timeOfDay === selectedFilter;
  });

  const completedCount = reminders.filter((r) => r.status === 'ACKNOWLEDGED').length;
  const progressPercent = Math.round((completedCount / (reminders.length || 1)) * 100);

  const getCategoryTheme = (type: ReminderType) => {
    switch (type) {
      case 'MEDICATION':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-400',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          iconBg: 'bg-amber-600 text-white',
          icon: <Pill className="w-6 h-6" />,
          label: 'Medication',
        };
      case 'HYDRATION':
        return {
          bg: 'bg-sky-50',
          border: 'border-sky-400',
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
          iconBg: 'bg-sky-600 text-white',
          icon: <Droplets className="w-6 h-6" />,
          label: 'Hydration',
        };
      case 'ACTIVITY':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-400',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          iconBg: 'bg-purple-600 text-white',
          icon: <Sparkles className="w-6 h-6" />,
          label: 'Brain & Memory Activity',
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          icon: <Heart className="w-6 h-6" />,
          label: 'Care Routine',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-extrabold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Bell className="w-6 h-6 text-amber-600 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-stone-900">
              Dementia Daily Care & Routine Schedule
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-semibold mt-0.5">
            Structured 24-hr multi-sensory cueing for {patientName} • Prevents confusion & sundowning
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Progress & Live Clock Hero Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-amber-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
              LIVE CLOCK: {currentTime || '08:00 AM'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-xs font-black">
              {completedCount} of {reminders.length} Care Steps Completed Today ({progressPercent}%)
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Daily Routine Orientation & Medication Timing
          </h3>
          <p className="text-xs text-stone-300 max-w-xl">
            When scheduled times or custom countdowns expire, the system triggers an audible chime, spoken voice prompt, and high-contrast confirmation modal.
          </p>
        </div>

        {/* Quick Alarm Test & Timers */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleTriggerTestAlert()}
            className="w-full sm:w-auto px-4 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span>🔔 Test Time's Up Sound</span>
          </button>

          <button
            onClick={() => handleStartQuickTimer(60, '1-Minute Hydration Check')}
            className="w-full sm:w-auto px-3.5 py-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-200 border border-amber-500/40 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <TimerIcon className="w-4 h-4 text-amber-400" />
            <span>Start 1-Min Timer</span>
          </button>
        </div>
      </div>

      {/* Active Countdown Timer Banner (if active) */}
      {activeTimerSeconds !== null && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-black text-amber-900 uppercase">Active Countdown Timer</p>
              <h4 className="text-sm sm:text-base font-extrabold text-stone-900">
                {timerLabel}: <span className="text-amber-700 font-mono font-black">{Math.floor(activeTimerSeconds / 60)}:{(activeTimerSeconds % 60).toString().padStart(2, '0')}</span> remaining
              </h4>
            </div>
          </div>
          <button
            onClick={() => setActiveTimerSeconds(null)}
            className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold"
          >
            Cancel Timer
          </button>
        </div>
      )}

      {/* Time-of-Day Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'ALL'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            All Routine ({reminders.length})
          </button>

          <button
            onClick={() => setSelectedFilter('MORNING')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'MORNING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning ({reminders.filter(r => r.timeOfDay === 'MORNING').length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('AFTERNOON')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'AFTERNOON'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Afternoon ({reminders.filter(r => r.timeOfDay === 'AFTERNOON').length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('EVENING')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'EVENING'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span>Evening ({reminders.filter(r => r.timeOfDay === 'EVENING').length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('NIGHT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'NIGHT'
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Night ({reminders.filter(r => r.timeOfDay === 'NIGHT').length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              selectedFilter === 'PENDING'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            Pending Only ({reminders.filter(r => r.status !== 'ACKNOWLEDGED').length})
          </button>
        </div>

        <button
          onClick={handleResetToDementiaRoutine}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-bold transition-colors py-1"
          title="Restore standard 10-step dementia routine"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore 10-Step Dementia Plan</span>
        </button>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-4 pt-2">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-extrabold text-stone-800">All filtered items completed!</h4>
            <p className="text-xs text-stone-500 mt-1">Select another time filter or view all daily routines.</p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const isDone = rem.status === 'ACKNOWLEDGED';
            const theme = getCategoryTheme(rem.type);

            return (
              <div
                key={rem.id}
                className={`p-5 sm:p-6 rounded-3xl border-3 transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-300 opacity-90'
                    : `${theme.bg} ${theme.border} shadow-md hover:shadow-lg`
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-13 h-13 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 ${
                        isDone ? 'bg-emerald-600 text-white' : theme.iconBg
                      }`}
                    >
                      {isDone ? <Check className="w-7 h-7 stroke-[3]" /> : theme.icon}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-stone-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>{rem.scheduledTime}</span>
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700">
                          {rem.timeOfDay}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                          {theme.label}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-1">
                        {rem.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakPrompt(rem)}
                      className="p-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-stone-200 shadow-xs transition-colors"
                      title="Listen to voice reminder prompt"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleTriggerTestAlert(rem)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-bold shadow-xs transition-colors"
                      title="Trigger alert chime for this item"
                    >
                      Ring Now 🔔
                    </button>

                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full ${
                        isDone
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-amber-200 text-amber-950 animate-pulse'
                      }`}
                    >
                      {isDone ? 'Completed' : 'Scheduled / Due'}
                    </span>
                  </div>
                </div>

                {/* Instruction / Dosage Note */}
                <p className="text-sm font-bold text-stone-800 mb-3 pl-1 leading-relaxed">
                  {rem.dosageOrInstruction || 'Take routine action as scheduled.'}
                </p>

                {/* Spoken Narration Hint */}
                {rem.voicePromptText && (
                  <div className="bg-white/80 rounded-2xl p-2.5 border border-stone-200/80 mb-4 flex items-center gap-2 text-xs font-semibold text-stone-600">
                    <span className="text-amber-600 font-bold">Voice Prompt:</span>
                    <span className="italic truncate">"{rem.voicePromptText}"</span>
                  </div>
                )}

                {/* Action Buttons */}
                {!isDone ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => handleAcknowledge(rem)}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>I Took / Completed This Now</span>
                    </button>

                    <button
                      onClick={() => handleSnooze(rem, 15)}
                      className="py-3.5 bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-200 rounded-2xl font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Clock className="w-4 h-4 text-stone-500" />
                      <span>Remind in 15 Minutes</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-emerald-800 border-t border-emerald-200">
                    <span>
                      ✓ Acknowledged at{' '}
                      {new Date(rem.acknowledgedAt || '').toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Logged to Caregiver Telemetry Queue</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add New Custom Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-stone-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                <span>Add Dementia Routine Reminder</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewReminder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Turmeric Milk & Walk"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-teal-500 font-bold text-sm text-stone-900 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                    Category Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ReminderType)}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-stone-200 font-bold text-xs text-stone-900 outline-hidden"
                  >
                    <option value="MEDICATION">Medication</option>
                    <option value="HYDRATION">Hydration</option>
                    <option value="ACTIVITY">Brain Activity</option>
                    <option value="ROUTINE">Daily Routine</option>
                    <option value="APPOINTMENT">Caregiver Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                    Time of Day
                  </label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e) => setNewTimeOfDay(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-stone-200 font-bold text-xs text-stone-900 outline-hidden"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="AFTERNOON">Afternoon</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  Scheduled Time (e.g. 04:30 PM)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 04:30 PM"
                  value={newScheduledTime}
                  onChange={(e) => setNewScheduledTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-200 font-bold text-sm text-stone-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  Instructions / Dosage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 glass of warm water, sit in courtyard"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-200 font-bold text-sm text-stone-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 uppercase mb-1">
                  Spoken Voice Prompt
                </label>
                <input
                  type="text"
                  placeholder={`e.g. ${patientName}, time for your afternoon tea and gentle stretch!`}
                  value={newVoicePrompt}
                  onChange={(e) => setNewVoicePrompt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-stone-200 font-bold text-sm text-stone-900 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md transition-all active:scale-95"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Time's Up Alert Modal Triggered by Alarms / Timers */}
      <ReminderAlertModal
        reminder={alertReminder}
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onAcknowledge={handleAcknowledge}
        onSnooze={handleSnooze}
        patientName={patientName}
        language={language}
      />
    </div>
  );
};
