import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import { MemoryItem, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface StoryBuilderViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

interface StoryChapter {
  chapterTitle: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
}

interface GeneratedStory {
  title: string;
  synopsis: string;
  chapters: StoryChapter[];
  moralOrReflection: string;
}

export const StoryBuilderView: React.FC<StoryBuilderViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('Family Heritage & Love');
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const list = localDB.getMemories();
    setMemories(list);
    if (list.length > 0) {
      setSelectedMemoryIds([list[0].id]);
    }
  }, [patientId]);

  const handleToggleMemory = (id: string) => {
    if (selectedMemoryIds.includes(id)) {
      if (selectedMemoryIds.length > 1) {
        setSelectedMemoryIds(selectedMemoryIds.filter(item => item !== id));
      }
    } else {
      setSelectedMemoryIds([...selectedMemoryIds, id]);
    }
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    audioService.speak("Weaving your precious memories into a golden storybook page...");

    const chosenMemories = memories.filter(m => selectedMemoryIds.includes(m.id));

    try {
      const resp = await fetch('/api/ai/story-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: localDB.getPatientProfile().name,
          memories: chosenMemories,
          narrativeStyle: selectedTheme,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setStory(data.story);
        setActiveChapterIndex(0);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      // Deterministic offline fallback storybook
      const first = chosenMemories[0];
      setStory({
        title: `The Golden Courtyard of ${first ? first.title : 'Cherished Days'}`,
        synopsis: 'A heartfelt journey through golden spring festivals, the laughter of children, and the peaceful aroma of Assam tea.',
        chapters: [
          {
            chapterTitle: 'Chapter 1: The First Rays of Morning Sun',
            content: first?.fullStory || 'In the gentle morning light, the veranda was quiet save for the sweet whistling of songbirds. With a warm cup of spiced tea in hand, memories of family joy came rushing back like warm rain.',
            imageUrl: first?.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
          },
          {
            chapterTitle: 'Chapter 2: The Rhythm of Heritage',
            content: 'Every beat of the festive Bihu Dhol echoes across the Brahmaputra valley. Teaching Ananya how to clap in rhythm, your eyes filled with pride seeing the family legacy alive and thriving.',
            imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
          },
          {
            chapterTitle: 'Chapter 3: An Eternal Embrace of Love',
            content: 'No matter the passing of years, the love of children and grandchildren remains a solid banyan tree. You are surrounded by kindness, peace, and loving care today and always.',
            imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
          }
        ],
        moralOrReflection: 'Love is a thread woven through laughter, festivals, and warm cups of morning tea.',
      });
      setActiveChapterIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakChapter = (chap: StoryChapter) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    audioService.speak(`${chap.chapterTitle}. ${chap.content}`, () => setIsSpeaking(false), { fallbackOnly: false });
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
              <BookOpen className="w-7 h-7 text-[#C66F4E]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Memory Storybook Builder (স্মৃতি সাধুকথা)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Transform personal photos and memories into an illustrated, read-aloud storybook
            </p>
          </div>
        </div>

        {story && (
          <button
            onClick={() => setStory(null)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50"
          >
            Create Another Story
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        {!story ? (
          /* Selection & Generation Stage */
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#202924] p-6 sm:p-8 rounded-3xl border border-[#E2EBD9] dark:border-stone-800 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] mb-2">
                1. Select Memories to Weave Together
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-6">
                Choose the special moments you want to bring together into this chapters:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {memories.map(mem => {
                  const isSelected = selectedMemoryIds.includes(mem.id);
                  return (
                    <div
                      key={mem.id}
                      onClick={() => handleToggleMemory(mem.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${
                        isSelected
                          ? 'border-[#58745A] bg-[#E2EBD9]/60 dark:bg-[#58745A]/20 shadow-md ring-2 ring-[#58745A]/20'
                          : 'border-stone-200 dark:border-stone-800 bg-[#FFFDF7] dark:bg-stone-900 hover:border-stone-300'
                      }`}
                    >
                      {mem.imageUrl && (
                        <img
                          src={mem.imageUrl}
                          alt={mem.title}
                          className="w-full h-32 object-cover rounded-xl mb-3"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-500">{mem.eventDateOrYear}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#58745A] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7] mt-1">
                        {mem.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#202924] p-6 sm:p-8 rounded-3xl border border-[#E2EBD9] dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                  Story Narrative Style & Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Family Heritage & Love', 'Adventures in Kaziranga Nature', 'Festival Celebration & Music'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        selectedTheme === theme
                          ? 'bg-[#58745A] text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#C66F4E] hover:bg-[#b05f40] text-white font-serif font-bold text-lg shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? 'Weaving Storybook...' : 'Generate Illustrated Storybook'}
              </button>
            </div>
          </div>
        ) : (
          /* Book Reader UI */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#202924] rounded-3xl overflow-hidden border border-[#E2EBD9] dark:border-stone-800 shadow-xl">
              {/* Cover/Chapter Image */}
              {story.chapters[activeChapterIndex]?.imageUrl && (
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={story.chapters[activeChapterIndex].imageUrl}
                    alt={story.chapters[activeChapterIndex].chapterTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
                      Chapter {activeChapterIndex + 1} of {story.chapters.length}
                    </span>
                    <button
                      onClick={() => handleSpeakChapter(story.chapters[activeChapterIndex])}
                      className={`p-3 rounded-full transition ${
                        isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/20 backdrop-blur-md hover:bg-white/30 text-white'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                  {story.chapters[activeChapterIndex].chapterTitle}
                </h2>
                <p className="text-lg sm:text-xl font-serif leading-relaxed text-stone-800 dark:text-stone-200">
                  {story.chapters[activeChapterIndex].content}
                </p>

                {activeChapterIndex === story.chapters.length - 1 && (
                  <div className="mt-8 p-5 rounded-2xl bg-[#F8EBD8]/60 dark:bg-stone-900 border border-[#B28A32]/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#B28A32] mb-1">
                      Heartfelt Reflection
                    </p>
                    <p className="font-serif italic text-base text-stone-800 dark:text-stone-200">
                      "{story.moralOrReflection}"
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Stepper */}
              <div className="p-4 sm:p-6 bg-[#FFFDF7] dark:bg-[#1A211D] border-t border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    audioService.stopSpeaking();
                    setActiveChapterIndex(i => Math.max(0, i - 1));
                  }}
                  disabled={activeChapterIndex === 0}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-30 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Chapter
                </button>

                <div className="flex items-center gap-1.5">
                  {story.chapters.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`w-3 h-3 rounded-full transition ${
                        activeChapterIndex === idx ? 'bg-[#58745A] w-6' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    audioService.stopSpeaking();
                    setActiveChapterIndex(i => Math.min(story.chapters.length - 1, i + 1));
                  }}
                  disabled={activeChapterIndex === story.chapters.length - 1}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#58745A] hover:bg-[#435945] text-white disabled:opacity-30 flex items-center gap-1.5 transition"
                >
                  Next Chapter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
