import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Brain, 
  Eye, 
  Layers, 
  CalendarCheck, 
  MessageSquare, 
  FolderTree, 
  BookOpenCheck, 
  Heart, 
  Puzzle, 
  Zap, 
  Coins, 
  Compass, 
  Music, 
  Sun, 
  Smile, 
  Clock, 
  Coffee, 
  Volume2, 
  MessageCircle, 
  Shield, 
  Sparkles, 
  Play, 
  CheckCircle2,
  Gamepad2
} from 'lucide-react';
import { CognitiveGameDefinition, GameCategory } from '../../../types';
import { COGNITIVE_GAMES_CATALOG } from '../../../lib/cognitiveGamesCatalog';
import { audioService } from '../../../lib/audioService';

interface AllGamesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: CognitiveGameDefinition) => void;
  currentDifficultyLevel?: number;
}

const CATEGORY_TABS: { key: 'ALL' | GameCategory; label: string; icon: string; count: number }[] = [
  { key: 'ALL', label: 'All Activities', icon: '🌟', count: 30 },
  { key: 'MEMORY', label: 'Memory', icon: '🧠', count: 3 },
  { key: 'ATTENTION', label: 'Attention & Focus', icon: '👁️', count: 3 },
  { key: 'ROUTINE', label: 'Daily Routine', icon: '📅', count: 5 },
  { key: 'LANGUAGE', label: 'Words & Proverbs', icon: '💬', count: 4 },
  { key: 'PATTERN', label: 'Motifs & Weaves', icon: '✨', count: 2 },
  { key: 'SPATIAL', label: 'Sorting & Market', icon: '🧺', count: 4 },
  { key: 'PUZZLE', label: 'Puzzles & Crafts', icon: '🧩', count: 3 },
  { key: 'MOTOR', label: 'Reflex & Rhythm', icon: '⚡', count: 2 },
  { key: 'RELAX', label: 'Calm & Music', icon: '🎵', count: 3 },
  { key: 'STORY', label: 'Photo Stories', icon: '📖', count: 1 },
];

export const AllGamesCatalogModal: React.FC<AllGamesCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  currentDifficultyLevel = 2,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | GameCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredGames = COGNITIVE_GAMES_CATALOG.filter((game) => {
    const matchesCategory = selectedCategory === 'ALL' || game.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.targetDomain.toLowerCase().includes(query) ||
      game.culturalTheme.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye':
        return <Eye className="w-6 h-6 text-teal-700" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-indigo-700" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-6 h-6 text-emerald-700" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6 text-rose-700" />;
      case 'FolderTree':
        return <FolderTree className="w-6 h-6 text-cyan-700" />;
      case 'BookOpenCheck':
        return <BookOpenCheck className="w-6 h-6 text-violet-700" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-pink-700" />;
      case 'Puzzle':
        return <Puzzle className="w-6 h-6 text-sky-700" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-700" />;
      case 'Coins':
        return <Coins className="w-6 h-6 text-amber-700" />;
      case 'Compass':
        return <Compass className="w-6 h-6 text-teal-700" />;
      case 'Music':
        return <Music className="w-6 h-6 text-indigo-700" />;
      case 'Sun':
        return <Sun className="w-6 h-6 text-emerald-700" />;
      case 'Smile':
        return <Smile className="w-6 h-6 text-pink-700" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-sky-700" />;
      case 'Coffee':
        return <Coffee className="w-6 h-6 text-amber-700" />;
      case 'Volume2':
        return <Volume2 className="w-6 h-6 text-teal-700" />;
      case 'MessageCircle':
        return <MessageCircle className="w-6 h-6 text-purple-700" />;
      case 'Shield':
        return <Shield className="w-6 h-6 text-stone-700" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-amber-700" />;
      default:
        return <Brain className="w-6 h-6 text-amber-700" />;
    }
  };

  const handleGameClick = (game: CognitiveGameDefinition) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    onClose();
    onSelectGame(game);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="bg-[#FFFDF7] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border-4 border-[#E5BD78] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-label="All 30 Cognitive Games Catalog"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FFF8EE] to-[#FEF3C7]/60 border-b-2 border-[#EADFCB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border-2 border-[#FDE68A] text-[#92400E] flex items-center justify-center shadow-xs">
              <Gamepad2 className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 
                  className="font-black text-xl sm:text-2xl text-[#2D2115]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  All 30 Cognitive Activities
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-950 border border-amber-300">
                  Full Catalog
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B543E] font-medium mt-0.5">
                Gentle memory, focus, routine, and relaxation games tailored for your comfort
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playFeedbackSound('GENTLE_TAP');
              onClose();
            }}
            className="w-11 h-11 rounded-2xl bg-white hover:bg-stone-100 text-[#4A2E12] border-2 border-[#E5BD78] flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6 stroke-[2.6]" />
          </button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="p-4 bg-[#FAF7F0] border-b border-[#EADFCB] space-y-3 shrink-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by game name, theme, or category (e.g. Tea, Wildlife, Silk, Rhythm)..."
              className="w-full pl-12 pr-4 py-2.5 rounded-2xl bg-white border-2 border-[#E7D6C0] text-stone-900 font-semibold text-sm placeholder:text-stone-400 focus:outline-none focus:border-amber-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700 bg-stone-100 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {CATEGORY_TABS.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    audioService.playFeedbackSound('GENTLE_TAP');
                    setSelectedCategory(cat.key);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs scale-102 font-black'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Games Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF7F0] space-y-3">
          {/* AI Recommendation Banner */}
          {selectedCategory === 'ALL' && !searchQuery && (
            <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-50 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-amber-950">
                      AI Performance Recommendations
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-600 text-white uppercase tracking-wider">
                      Live Chart
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-amber-900/80 font-medium mt-0.5">
                    Activities are ordered and adapted based on your cognitive trends, memory scores, and comfort level.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-wider text-[#6B543E]">
              Showing {filteredGames.length} Activities
            </p>
            <p className="text-xs text-stone-500 font-medium">
              Every activity includes interactive voice guidance &amp; touch
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#EADFCB] hover:border-amber-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                      {getGameIcon(game.iconName)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Level {currentDifficultyLevel}
                      </span>
                    </div>
                  </div>

                  <h4 
                    className="font-black text-base sm:text-lg text-[#2D2115] group-hover:text-amber-900 leading-snug"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {game.title}
                  </h4>
                  <p className="text-xs text-[#8C6D4C] font-semibold mt-0.5">
                    {game.culturalTheme} • {game.targetDomain}
                  </p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {game.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400 font-medium italic">
                    {game.instructions.length > 40 ? game.instructions.substring(0, 40) + '...' : game.instructions}
                  </span>
                  <button
                    onClick={() => handleGameClick(game)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredGames.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-dashed border-stone-200 p-6">
                <Brain className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="font-bold text-stone-700">No activities found matching "{searchQuery}"</p>
                <p className="text-xs text-stone-500 mt-1">Try clearing your search or picking another category</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Show All Activities
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-[#FFFDF7] border-t-2 border-[#EADFCB] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-center sm:text-left">
          <p className="text-xs text-stone-500 font-medium">
            💡 Activities automatically adapt to your cognitive performance chart and comfort level.
          </p>
          <button
            onClick={() => {
              audioService.playFeedbackSound('GENTLE_TAP');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
