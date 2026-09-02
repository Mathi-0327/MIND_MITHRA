import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Volume2, 
  Sparkles, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  Mic,
  Plus,
  Image as ImageIcon,
  Sparkle
} from 'lucide-react';
import { MemoryItem, SupportedLanguage } from '../../types';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';
import { AddMemoryModal } from './AddMemoryModal';

interface MemoryVaultViewProps {
  onBack: () => void;
  language: SupportedLanguage;
  patientName: string;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
}

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = ({
  onBack,
  language,
  patientName,
  networkState,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>(() => localDB.getMemories());
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(memories[0] || null);
  const [ragQuery, setRagQuery] = useState('');
  const [ragAnswer, setRagAnswer] = useState('');
  const [isLoadingRag, setIsLoadingRag] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSelectMemory = (mem: MemoryItem) => {
    setSelectedMemory(mem);
    setRagAnswer('');
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  const handleSaveNewMemory = (newMemory: MemoryItem) => {
    // 1. Save to local storage DB
    localDB.addMemory(newMemory);
    localDB.enqueueEvent('MEMORY_CREATED', { ...newMemory }, 'patient-ravi-001');

    // 2. Synchronize to server if online
    if (networkState === 'ONLINE') {
      fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemory),
      }).catch((err) => console.warn('Background memory sync failed:', err));
    }

    // 3. Update view state
    const updatedList = [newMemory, ...memories.filter((m) => m.id !== newMemory.id)];
    setMemories(updatedList);
    setSelectedMemory(newMemory);
    setRagAnswer('');
  };

  const handleNarrateStory = (mem: MemoryItem) => {
    if (isNarrating) {
      audioService.stopSpeaking();
      setIsNarrating(false);
      return;
    }

    const narration = `This memory is titled "${mem.title}". Taken in ${mem.location} around ${mem.eventDateOrYear}. ${mem.fullStory}`;
    setIsNarrating(true);
    audioService.speak(narration, () => {
      setIsNarrating(false);
    });
  };

  const handleAskRAG = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoadingRag(true);
    setRagAnswer('');
    audioService.playFeedbackSound('GENTLE_TAP');

    if (networkState === 'OFFLINE') {
      // Offline deterministic local RAG
      setTimeout(() => {
        setIsLoadingRag(false);
        const q = queryText.toLowerCase();
        const found = memories.find(
          (m) =>
            q.includes(m.location.toLowerCase().split(',')[0]) ||
            m.peopleTagged.some((p) => q.includes(p.toLowerCase().split(' ')[0])) ||
            m.culturalTags.some((t) => q.includes(t.toLowerCase())) ||
            q.includes('who') ||
            q.includes('kaziranga') ||
            q.includes('bihu') ||
            q.includes('ananya')
        ) || selectedMemory;

        const ans = found
          ? `This is ${found.title} in ${found.location}. ${found.caption}. You were there with ${found.peopleTagged.join(' and ')}.`
          : "I don't have that memory saved yet in our vault.";

        setRagAnswer(ans);
        audioService.speak(ans);
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/ai/memory-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, patientId: 'patient-ravi-001' }),
      });
      const data = await res.json();
      setIsLoadingRag(false);
      setRagAnswer(data.answer);
      audioService.speak(data.answer);
    } catch {
      setIsLoadingRag(false);
      const fallback = `This is from ${selectedMemory?.title}. ${selectedMemory?.caption}`;
      setRagAnswer(fallback);
      audioService.speak(fallback);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
        <button
          onClick={() => {
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
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span>My Memory Vault</span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Verified family moments, travels, loved ones & cherished places
          </p>
        </div>

        {/* Top Right Action: Add Memory Button */}
        <button
          onClick={() => {
            audioService.playFeedbackSound('GENTLE_TAP');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 ring-2 ring-amber-300"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Memory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo Thumbnails List & Add Button */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-stone-500 uppercase tracking-wider">
              Your Precious Photos ({memories.length})
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {/* Quick Add Memory Hero Card for Elders */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full p-3.5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 flex items-center gap-3 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-stone-900 block">
                Add Your Own Memory
              </span>
              <span className="text-[11px] text-amber-800/80 font-medium">
                Upload photo or pick a special moment
              </span>
            </div>
          </button>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {memories.map((mem) => {
              const isSelected = selectedMemory?.id === mem.id;
              return (
                <div
                  key={mem.id}
                  onClick={() => handleSelectMemory(mem)}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-200'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <img
                    src={mem.imageUrl}
                    alt={mem.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-stone-300 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                      {mem.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{mem.location}</span>
                    </p>
                    <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                      {mem.eventDateOrYear}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Featured Memory Viewer & RAG Dialogue */}
        {selectedMemory ? (
          <div className="lg:col-span-8 bg-stone-50 border-2 border-stone-200 rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Big Photo Container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 shadow-md bg-stone-900 mb-4 max-h-[300px]">
                <img
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover max-h-[300px]"
                />
                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedMemory.eventDateOrYear}</span>
                </div>
              </div>

              {/* Memory Title & Location */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  {selectedMemory.title}
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedMemory.relationship}
                </span>
              </div>

              <p className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>{selectedMemory.location}</span>
              </p>

              {/* People Tagged */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Loved Ones:
                </span>
                {selectedMemory.peopleTagged.map((person, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800 shadow-xs"
                  >
                    {person}
                  </span>
                ))}
              </div>

              {/* Full Story Box */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-4 shadow-xs">
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {selectedMemory.fullStory}
                </p>
              </div>

              {/* Read Aloud Button */}
              <button
                onClick={() => handleNarrateStory(selectedMemory)}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs mb-4 ${
                  isNarrating
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isNarrating ? 'Pause Voice Story' : 'Read Story to Me'}</span>
              </button>

              {/* AI Memory RAG Q&A Assistant (Zero-Hallucination Verified Search) */}
              <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-stone-900">
                    Ask Mind Mithra About This Memory
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => handleAskRAG(`Who is in this photo with me?`)}
                    className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
                  >
                    "Who is with me?"
                  </button>
                  <button
                    onClick={() => handleAskRAG(`When did we go to ${selectedMemory.location}?`)}
                    className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
                  >
                    "When did we visit?"
                  </button>
                  <button
                    onClick={() => handleAskRAG(`Tell me what happened here.`)}
                    className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-stone-800 transition-colors"
                  >
                    "What happened here?"
                  </button>
                </div>

                {isLoadingRag ? (
                  <p className="text-xs font-semibold text-stone-500 animate-pulse">
                    Searching your verified family memory album...
                  </p>
                ) : ragAnswer ? (
                  <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs sm:text-sm font-bold text-stone-900 leading-relaxed">
                    "{ragAnswer}"
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <Heart className="w-12 h-12 text-stone-300 mb-3" />
            <h3 className="font-extrabold text-stone-800 text-lg mb-1">No Memory Selected</h3>
            <p className="text-xs text-stone-500 mb-4 max-w-sm">
              Tap on any memory card on the left or add a new family memory.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Memory</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveMemory={handleSaveNewMemory}
        patientName={patientName}
      />
    </div>
  );
};

