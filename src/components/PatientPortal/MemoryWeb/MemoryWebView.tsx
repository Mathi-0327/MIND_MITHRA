import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Users, 
  MapPin, 
  Calendar, 
  Music, 
  BookOpen, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Plus, 
  Heart,
  Share2,
  Info
} from 'lucide-react';
import { MemoryGraphNode, MemoryGraphEdge, MemoryGraphNodeType, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface MemoryWebViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
  onSelectNodeForStory?: (node: MemoryGraphNode) => void;
}

const CATEGORY_COLORS: Record<MemoryGraphNodeType, { bg: string; border: string; text: string; icon: any }> = {
  PEOPLE: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-300', icon: Users },
  PLACES: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-300', icon: MapPin },
  EVENTS: { bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-300', icon: Calendar },
  PHOTOS: { bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-800 dark:text-rose-300', icon: Heart },
  MUSIC: { bg: 'bg-teal-50 dark:bg-teal-950/40', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-800 dark:text-teal-300', icon: Music },
  STORIES: { bg: 'bg-amber-100/50 dark:bg-amber-900/40', border: 'border-amber-400 dark:border-amber-600', text: 'text-amber-900 dark:text-amber-200', icon: BookOpen },
  MEMORIES: { bg: 'bg-stone-50 dark:bg-stone-900/60', border: 'border-stone-300 dark:border-stone-700', text: 'text-stone-800 dark:text-stone-300', icon: Sparkles },
};

export const MemoryWebView: React.FC<MemoryWebViewProps> = ({
  patientId,
  language = 'en',
  onBack,
  onSelectNodeForStory,
}) => {
  const [nodes, setNodes] = useState<MemoryGraphNode[]>([]);
  const [edges, setEdges] = useState<MemoryGraphEdge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<MemoryGraphNode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'WEB'>('GRID');

  useEffect(() => {
    const graphData = localDB.getMemoryGraph(patientId);
    setNodes(graphData.nodes);
    setEdges(graphData.edges);
    if (graphData.nodes.length > 0) {
      setSelectedNode(graphData.nodes[0]);
    }
  }, [patientId]);

  const filteredNodes = selectedCategory === 'ALL'
    ? nodes
    : nodes.filter(n => n.type === selectedCategory);

  const getConnectedNodes = (nodeId: string): { edge: MemoryGraphEdge; node: MemoryGraphNode }[] => {
    const connected: { edge: MemoryGraphEdge; node: MemoryGraphNode }[] = [];
    edges.forEach(e => {
      if (e.source === nodeId) {
        const target = nodes.find(n => n.id === e.target);
        if (target) connected.push({ edge: e, node: target });
      } else if (e.target === nodeId) {
        const source = nodes.find(n => n.id === e.source);
        if (source) connected.push({ edge: e, node: source });
      }
    });
    return connected;
  };

  const handleSpeakNode = (node: MemoryGraphNode) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const connections = getConnectedNodes(node.id).map(c => `${c.edge.relationship}: ${c.node.title}`).join('. ');
    const textToSpeak = `${node.title}. ${node.subtitle || ''}. Connected memories: ${connections || 'None yet'}.`;
    setIsSpeaking(true);
    audioService.speak(textToSpeak, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const connectedItems = selectedNode ? getConnectedNodes(selectedNode.id) : [];

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7] dark:bg-[#1A211D] text-[#26302A] dark:text-[#E2EBD9] transition-colors">
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
              <Network className="w-7 h-7 text-[#58745A] dark:text-[#789477]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Memory Web (স্মৃতি জাল)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Explore how your cherished people, places, music, and stories are lovingly connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(v => v === 'GRID' ? 'WEB' : 'GRID')}
            className="px-3.5 py-2 rounded-xl text-sm font-medium border border-[#58745A]/30 dark:border-stone-700 bg-[#E2EBD9]/40 dark:bg-stone-800 text-[#58745A] dark:text-[#789477] hover:bg-[#E2EBD9] transition"
          >
            {viewMode === 'GRID' ? '🕸️ View as Web' : '🗂️ View as Cards'}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-3 bg-[#F8EBD8]/30 dark:bg-[#202924]/50 border-b border-[#E2EBD9] dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-[#58745A] text-white shadow-sm'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
          }`}
        >
          ✨ All Connections ({nodes.length})
        </button>
        {(['PEOPLE', 'PLACES', 'EVENTS', 'MUSIC', 'MEMORIES'] as MemoryGraphNodeType[]).map(cat => {
          const cfg = CATEGORY_COLORS[cat];
          const count = nodes.filter(n => n.type === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat
                  ? 'bg-[#58745A] text-white shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              <cfg.icon className="w-4 h-4" />
              {cat.charAt(0) + cat.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Graph Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Nodes Canvas / Grid */}
        <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredNodes.map(node => {
                const cfg = CATEGORY_COLORS[node.type] || CATEGORY_COLORS.MEMORIES;
                const isSelected = selectedNode?.id === node.id;
                const IconComponent = cfg.icon;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                      isSelected
                        ? 'border-[#58745A] dark:border-[#789477] bg-[#E2EBD9]/60 dark:bg-[#58745A]/20 shadow-md ring-2 ring-[#58745A]/20'
                        : `${cfg.bg} ${cfg.border} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {node.imageUrl ? (
                        <img
                          src={node.imageUrl}
                          alt={node.title}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 dark:border-stone-700 flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border} border`}>
                          <IconComponent className={`w-7 h-7 ${cfg.text}`} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                            {node.categoryTag || node.type}
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Network className="w-3 h-3" /> {node.connectedCount || 1}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7] truncate mt-1">
                          {node.title}
                        </h3>
                        {node.subtitle && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5">
                            {node.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Interactive Web Diagram Visualizer */
            <div className="relative w-full h-[520px] bg-gradient-to-br from-[#FFFDF7] to-[#F8EBD8]/30 dark:from-[#1A211D] dark:to-[#26302A] rounded-3xl border-2 border-[#E2EBD9] dark:border-stone-800 p-6 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-stone-500">
                <Info className="w-4 h-4 text-[#58745A]" /> Tap any memory node to see the threads of connection
              </div>

              {/* Central Hub Node (Selected or Ravi) */}
              <div className="relative z-10 flex flex-col items-center">
                {selectedNode && (
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#58745A] to-[#C66F4E] shadow-xl animate-pulse">
                    <img
                      src={selectedNode.imageUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'}
                      alt={selectedNode.title}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                )}
                <span className="mt-2 font-serif font-bold text-lg text-[#26302A] dark:text-[#FFFDF7]">
                  {selectedNode?.title}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {selectedNode?.subtitle}
                </span>
              </div>

              {/* Orbiting Connected Nodes */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 max-w-xl">
                {connectedItems.map(({ edge, node }) => {
                  const cfg = CATEGORY_COLORS[node.type] || CATEGORY_COLORS.MEMORIES;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 shadow-sm transition transform hover:scale-105 ${cfg.bg} ${cfg.border}`}
                    >
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/80 dark:bg-stone-900/60 text-stone-700 dark:text-stone-300">
                        {edge.relationship}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#26302A] dark:text-[#FFFDF7]">
                        {node.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Node Detail & Relationship Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-6 bg-white/60 dark:bg-[#202924]/60 border-t lg:border-t-0 lg:border-l border-[#E2EBD9] dark:border-stone-800 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Photo & Header */}
              <div className="rounded-3xl overflow-hidden border border-[#E2EBD9] dark:border-stone-700 shadow-sm bg-white dark:bg-stone-900">
                {selectedNode.imageUrl && (
                  <img
                    src={selectedNode.imageUrl}
                    alt={selectedNode.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E2EBD9] dark:bg-stone-800 text-[#58745A] dark:text-[#789477]">
                      {selectedNode.type}
                    </span>
                    <button
                      onClick={() => handleSpeakNode(selectedNode)}
                      className={`p-2.5 rounded-full transition ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-[#58745A] text-white hover:bg-[#435945]'
                      }`}
                      aria-label="Listen to memory"
                    >
                      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7] mt-3">
                    {selectedNode.title}
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                    {selectedNode.subtitle}
                  </p>
                </div>
              </div>

              {/* Connected Memory Threads */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-[#58745A]" /> Connected Threads ({connectedItems.length})
                </h3>
                {connectedItems.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No connected memories tagged yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {connectedItems.map(({ edge, node }) => {
                      const cfg = CATEGORY_COLORS[node.type] || CATEGORY_COLORS.MEMORIES;
                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNode(node)}
                          className="cursor-pointer p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-[#58745A] transition flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            {node.imageUrl ? (
                              <img
                                src={node.imageUrl}
                                alt={node.title}
                                className="w-10 h-10 rounded-xl object-cover"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                                <node.type className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-[#58745A] dark:text-[#789477]">
                                {edge.relationship}
                              </p>
                              <p className="font-serif font-bold text-sm text-[#26302A] dark:text-[#FFFDF7]">
                                {node.title}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-stone-400">→</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2.5">
                {onSelectNodeForStory && (
                  <button
                    onClick={() => onSelectNodeForStory(selectedNode)}
                    className="w-full py-3 px-4 rounded-2xl font-serif font-bold text-white bg-[#58745A] hover:bg-[#435945] shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <BookOpen className="w-5 h-5" />
                    Turn Into Storybook Page
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <Network className="w-12 h-12 text-stone-400 mb-2" />
              <p className="font-serif text-lg font-medium">Select any memory node to view relationships</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
