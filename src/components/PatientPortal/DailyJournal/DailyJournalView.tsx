import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  MapPin, 
  Heart,
  Smile,
  Trash2
} from 'lucide-react';
import { DailyJournalEntry, PatientMoodType, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface DailyJournalViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

export const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [entries, setEntries] = useState<DailyJournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [taggedPeople, setTaggedPeople] = useState('Ananya (Granddaughter)');
  const [taggedPlaces, setTaggedPlaces] = useState('Veranda, Courtyard');
  const [selectedMood, setSelectedMood] = useState<PatientMoodType>('CALM');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setEntries(localDB.getDailyJournals(patientId));
  }, [patientId]);

  const handleStartVoiceJournal = () => {
    setIsRecording(true);
    setShowForm(true);
    audioService.speak(
      "Nomoskar! I would love to hear about your day. Tell me about the tea you drank, who you smiled with, or the birds outside your window.",
      () => {
        setTimeout(() => {
          setIsRecording(false);
          setSpokenText("Had a warm cup of ginger tea in the morning sunshine. Ananya laughed and showed me her drawing of a rhino. We watched the gentle rain falling on the courtyard stones in the afternoon.");
        }, 3600);
      }
    );
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spokenText.trim()) return;

    const newEntry: DailyJournalEntry = {
      id: `jour-${Date.now()}`,
      patientId,
      dateStr: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      transcriptionText: spokenText.trim(),
      taggedPeople: taggedPeople.split(',').map(p => p.trim()).filter(Boolean),
      taggedPlaces: taggedPlaces.split(',').map(p => p.trim()).filter(Boolean),
      activitiesMentioned: ['Veranda tea', 'Family laughter', 'Rain watching'],
      observedMood: selectedMood,
      isVerifiedByPatient: true,
    };

    localDB.addDailyJournal(newEntry);
    setEntries(localDB.getDailyJournals(patientId));
    setSpokenText('');
    setShowForm(false);
    audioService.speak("Thank you for sharing your day with me! Your precious memories are preserved.");
  };

  const handleSpeakEntry = (entry: DailyJournalEntry) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioService.speak(entry.transcriptionText, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const handleDelete = (id: string) => {
    localDB.deleteDailyJournal(id);
    setEntries(localDB.getDailyJournals(patientId));
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] dark:bg-[#1A211D] text-[#26302A] dark:text-[#E2EBD9]">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/80 dark:bg-[#202924]/80 backdrop-blur-md border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-7 h-7 text-[#58745A] dark:text-[#789477]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Tell Me About Your Day (আজিৰ দিনটো)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Reflect upon today's little joys, people you saw, and peaceful moments in your daily journal
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-[#58745A] hover:bg-[#435945] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Mic className="w-4 h-4" />
          {showForm ? 'View Journal Entries' : 'Record Today\'s Day'}
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        {showForm ? (
          /* Voice Recording Entry Card */
          <div className="bg-white dark:bg-[#202924] rounded-3xl p-6 sm:p-8 border border-[#E2EBD9] dark:border-stone-800 shadow-md">
            <div className="text-center max-w-md mx-auto mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                How Was Your Day Today?
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                Tap the microphone and tell Mind Mithra anything that made you happy today.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-6 mb-6 border-2 border-dashed border-[#58745A]/30 dark:border-stone-700 rounded-3xl bg-[#FFFDF7] dark:bg-stone-900">
              <button
                type="button"
                onClick={handleStartVoiceJournal}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg ${
                  isRecording ? 'bg-rose-500 text-white animate-ping' : 'bg-[#58745A] text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              <p className="text-sm font-semibold text-[#26302A] dark:text-[#FFFDF7] mt-3">
                {isRecording ? 'Listening with warmth... Speak gently' : 'Tap to Speak Your Day'}
              </p>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Today's Story & Thoughts
                </label>
                <textarea
                  rows={4}
                  value={spokenText}
                  onChange={e => setSpokenText(e.target.value)}
                  placeholder="Your words will transcribe here automatically or you can type them..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none font-serif text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    People Seen Today
                  </label>
                  <input
                    type="text"
                    value={taggedPeople}
                    onChange={e => setTaggedPeople(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    Places Visited
                  </label>
                  <input
                    type="text"
                    value={taggedPlaces}
                    onChange={e => setTaggedPlaces(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    Observed Mood
                  </label>
                  <select
                    value={selectedMood}
                    onChange={e => setSelectedMood(e.target.value as PatientMoodType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-sm"
                  >
                    <option value="CALM">Calm & Peaceful</option>
                    <option value="HAPPY">Happy & Joyful</option>
                    <option value="NEUTRAL">Content</option>
                    <option value="TIRED">Relaxed & Sleepy</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#58745A] hover:bg-[#435945] text-white font-serif font-bold text-lg shadow-md transition"
                >
                  Save Today's Journal Entry
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Past Journal Entries Timeline */
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[#202924] rounded-3xl border border-dashed border-stone-300 dark:border-stone-700">
                <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                <p className="font-serif text-lg font-bold">No journal entries yet</p>
                <p className="text-sm text-stone-500 mt-1">Tap 'Record Today's Day' above to share your first story!</p>
              </div>
            ) : (
              entries.map(entry => (
                <div
                  key={entry.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#202924] border border-[#E2EBD9] dark:border-stone-800 shadow-xs hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E2EBD9] text-[#58745A] dark:bg-stone-800 dark:text-[#789477]">
                        📅 {entry.dateStr}
                      </span>
                      {entry.observedMood && (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Smile className="w-3.5 h-3.5" /> Mood: {entry.observedMood}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeakEntry(entry)}
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-[#58745A]"
                        aria-label="Listen to entry"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 rounded-full hover:bg-rose-50 text-rose-500"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg font-serif leading-relaxed text-stone-800 dark:text-stone-200">
                    "{entry.transcriptionText}"
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    {entry.taggedPeople.length > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#58745A]" /> {entry.taggedPeople.join(', ')}
                      </span>
                    )}
                    {entry.taggedPlaces.length > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#C66F4E]" /> {entry.taggedPlaces.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
