import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Heart, 
  Share2, 
  Check, 
  ArrowLeft, 
  Utensils, 
  Sprout, 
  Scissors, 
  Music, 
  Award,
  Plus
} from 'lucide-react';
import { ElderKnowledgeItem, KnowledgeCategory, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface ElderKnowledgeViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

const CATEGORY_META: Record<KnowledgeCategory, { label: string; icon: any; color: string; bg: string }> = {
  RECIPE: { label: 'Heritage Cooking & Recipes', icon: Utensils, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  FARMING: { label: 'Farming & Nature Wisdom', icon: Sprout, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
  CRAFT: { label: 'Traditional Crafts & Weaving', icon: Scissors, color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200' },
  STORY: { label: 'Folk Tales & Lore', icon: BookOpen, color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200' },
  TRADITION: { label: 'Customs & Rituals', icon: Award, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200' },
  WISDOM: { label: 'Life Wisdom & Proverbs', icon: Sparkles, color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200' },
  MUSIC: { label: 'Folk Songs & Rhythms', icon: Music, color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200' },
};

export const ElderKnowledgeView: React.FC<ElderKnowledgeViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [items, setItems] = useState<ElderKnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ARCHIVE' | 'TEACH'>('ARCHIVE');
  const [selectedItem, setSelectedItem] = useState<ElderKnowledgeItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('RECIPE');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [taughtFamily, setTaughtFamily] = useState('Ananya (Granddaughter), Priyanka (Daughter)');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    const data = localDB.getElderKnowledge(patientId);
    setItems(data);
    if (data.length > 0) {
      setSelectedItem(data[0]);
    }
  }, [patientId]);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioService.speak(text, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const handleStartVoiceTeach = () => {
    setIsRecording(true);
    // Accommodating elderly voice prompt
    audioService.speak(
      "I am listening with an open heart. Please tell me your recipe, craft technique, or family wisdom.",
      () => {
        setTimeout(() => {
          setIsRecording(false);
          setNewTitle('Traditional Courtyard Spiced Tea Secret');
          setNewCategory('RECIPE');
          setNewContent('Always crush the fresh ginger with cardamom pods and boil with spring water before adding the black CTC tea leaves. Steep for 3 minutes gently on low fire.');
          setNewTags('Ginger Tea, Family Secret, Courtyard Recipe');
        }, 3200);
      }
    );
  };

  const handleSaveKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const patient = localDB.getPatientProfile();
    const newItem: ElderKnowledgeItem = {
      id: `kno-${Date.now()}`,
      patientId,
      title: newTitle.trim(),
      category: newCategory,
      region: patient.region,
      elderContributor: patient.name,
      content: newContent.trim(),
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isFamilyLegacy: true,
      taughtToFamilyMembers: taughtFamily.split(',').map(m => m.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    localDB.addElderKnowledge(newItem);
    setItems(localDB.getElderKnowledge(patientId));
    setSelectedItem(newItem);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      setActiveTab('ARCHIVE');
    }, 1500);
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
              <Sparkles className="w-7 h-7 text-[#C66F4E]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Elder Knowledge & Legacy (জ্ঞান সংৰক্ষণ)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Preserve your authentic regional recipes, crafts, farming secrets, and teach your family
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#E2EBD9]/60 dark:bg-stone-800 p-1 rounded-2xl border border-[#58745A]/20">
          <button
            onClick={() => setActiveTab('ARCHIVE')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'ARCHIVE'
                ? 'bg-white dark:bg-[#58745A] text-[#26302A] dark:text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            📚 Heritage Archive ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('TEACH')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'TEACH'
                ? 'bg-[#C66F4E] text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <Mic className="w-4 h-4" /> Teach Mind Mithra
          </button>
        </div>
      </div>

      {activeTab === 'ARCHIVE' ? (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* List of Knowledge items */}
          <div className="lg:col-span-6 xl:col-span-5 p-4 sm:p-6 overflow-y-auto border-r border-[#E2EBD9] dark:border-stone-800 space-y-4 max-h-[calc(100vh-200px)]">
            {items.map(item => {
              const meta = CATEGORY_META[item.category] || CATEGORY_META.WISDOM;
              const IconComp = meta.icon;
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#58745A] bg-[#E2EBD9]/50 dark:bg-[#58745A]/20 shadow-md ring-2 ring-[#58745A]/20'
                      : `${meta.bg} hover:border-stone-400 dark:hover:border-stone-600`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center flex-shrink-0 shadow-xs border border-stone-200 dark:border-stone-700">
                      <IconComp className={`w-6 h-6 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color} bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {item.region}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#26302A] dark:text-[#FFFDF7] mt-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-1">
                        {item.content}
                      </p>
                      {item.taughtToFamilyMembers && item.taughtToFamilyMembers.length > 0 && (
                        <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Taught to: {item.taughtToFamilyMembers.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Reader View */}
          <div className="lg:col-span-6 xl:col-span-7 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {selectedItem ? (
              <div className="max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#202924] p-6 sm:p-8 rounded-3xl border border-[#E2EBD9] dark:border-stone-800 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E2EBD9] text-[#58745A] dark:bg-stone-800 dark:text-[#789477]">
                      {CATEGORY_META[selectedItem.category]?.label || selectedItem.category}
                    </span>
                    <span className="text-xs text-stone-500">
                      Contributor: <strong>{selectedItem.elderContributor}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(`${selectedItem.title}. ${selectedItem.content}`)}
                    className={`p-3 rounded-full transition shadow-sm ${
                      isSpeaking
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-[#58745A] text-white hover:bg-[#435945]'
                    }`}
                    aria-label="Listen to elder wisdom"
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] leading-snug">
                  {selectedItem.title}
                </h2>

                <div className="p-5 rounded-2xl bg-[#FFFDF7] dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <p className="text-base sm:text-lg leading-relaxed text-stone-800 dark:text-stone-200 font-serif">
                    {selectedItem.content}
                  </p>
                </div>

                {/* Cultural Heritage Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-stone-500 mr-1">Cultural Tags:</span>
                  {selectedItem.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#F8EBD8] dark:bg-stone-800 text-[#B28A32] dark:text-[#F8EBD8] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Taught to Family Badge */}
                {selectedItem.taughtToFamilyMembers && (
                  <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                      <div>
                        <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">Family Legacy Passed Down To:</p>
                        <p className="text-sm font-bold text-rose-900 dark:text-rose-200">
                          {selectedItem.taughtToFamilyMembers.join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-semibold">
                      Preserved Forever
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-500">
                <p>Select any wisdom piece on the left to read</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Teach Mind Mithra Tab */
        <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full">
          <div className="bg-white dark:bg-[#202924] rounded-3xl p-6 sm:p-8 border border-[#E2EBD9] dark:border-stone-800 shadow-md">
            <div className="text-center max-w-lg mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Teach Mind Mithra & Your Family
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                Your life experiences, traditional cooking techniques, and folk knowledge are priceless treasures. Speak or type below to save them forever.
              </p>
            </div>

            {/* Voice Record Assist Button */}
            <div className="flex flex-col items-center justify-center py-6 mb-8 border-2 border-dashed border-[#58745A]/30 dark:border-stone-700 rounded-3xl bg-[#FFFDF7] dark:bg-stone-900">
              <button
                type="button"
                onClick={handleStartVoiceTeach}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-ping'
                    : 'bg-[#C66F4E] hover:bg-[#b05f40] text-white'
                }`}
                aria-label="Tap to speak knowledge"
              >
                {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
              <p className="text-sm font-semibold text-[#26302A] dark:text-[#FFFDF7] mt-3">
                {isRecording ? 'Listening... Speak at your comfortable pace' : 'Tap Microphone to Speak Wisdom'}
              </p>
              <span className="text-xs text-stone-500 mt-1">
                Mind Mithra will transcribe your words automatically
              </span>
            </div>

            {isSavedNotice && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-medium">
                <Check className="w-5 h-5 text-emerald-600" /> Wisdom successfully archived into your family legacy!
              </div>
            )}

            <form onSubmit={handleSaveKnowledge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Title of Wisdom or Recipe
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Authentic Assamese Khar Recipe or Weaving Pattern"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as KnowledgeCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none"
                  >
                    <option value="RECIPE">Heritage Cooking & Recipes</option>
                    <option value="FARMING">Farming & Nature Wisdom</option>
                    <option value="CRAFT">Traditional Crafts & Handlooms</option>
                    <option value="STORY">Folk Tales & Lore</option>
                    <option value="TRADITION">Customs & Festivals</option>
                    <option value="WISDOM">Life Wisdom & Proverbs</option>
                    <option value="MUSIC">Folk Songs & Rhythms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                    Who in the Family Should Learn This?
                  </label>
                  <input
                    type="text"
                    value={taughtFamily}
                    onChange={e => setTaughtFamily(e.target.value)}
                    placeholder="e.g., Ananya (Granddaughter), Priyanka"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Full Story, Secret Steps & Guidance
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Explain the ingredients, the secret tricks, or the moral of the story in your own comforting voice..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none font-serif text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Keywords & Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g., Tea, Courtyard, Winter, Family Tradition"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF7] dark:bg-stone-900 text-[#26302A] dark:text-[#FFFDF7] focus:ring-2 focus:ring-[#58745A] outline-none text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-[#58745A] hover:bg-[#435945] text-white font-serif font-bold text-lg shadow-md transition"
                >
                  ✨ Save to Family Legacy Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
