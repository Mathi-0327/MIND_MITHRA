import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  Home,
  TreePine,
  Bell,
  Coffee,
  BookOpen,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { RouteMemory, RouteWaypoint, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';
import { audioService } from '../../../lib/audioService';

interface FamiliarRouteViewProps {
  patientId: string;
  language?: SupportedLanguage;
  onBack?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Home,
  TreePine,
  Compass,
  Bell,
  Coffee,
  BookOpen,
  ShoppingBag,
  MapPin,
};

export const FamiliarRouteView: React.FC<FamiliarRouteViewProps> = ({
  patientId,
  language = 'en',
  onBack,
}) => {
  const [routes, setRoutes] = useState<RouteMemory[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteMemory | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswerFeedback, setQuizAnswerFeedback] = useState<string | null>(null);

  useEffect(() => {
    const data = localDB.getRouteMemories(patientId);
    setRoutes(data);
    if (data.length > 0) {
      setSelectedRoute(data[0]);
    }
  }, [patientId]);

  const handleSpeakWaypoint = (wp: RouteWaypoint, total: number) => {
    if (isSpeaking) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const text = `Step ${wp.orderIndex + 1} of ${total}: ${wp.name}. ${wp.landmarkDescription}. ${wp.memoryNote || ''}`;
    setIsSpeaking(true);
    audioService.speak(text, () => setIsSpeaking(false), { fallbackOnly: false });
  };

  const handleCheckQuizAnswer = (selectedWpId: string, correctWpId: string) => {
    if (selectedWpId === correctWpId) {
      setQuizAnswerFeedback('CORRECT');
      audioService.speak('Wonderful memory! That is exactly the next landmark on your path.');
    } else {
      setQuizAnswerFeedback('INCORRECT');
      audioService.speak('Not quite, but take a deep breath. Look gently at the landmarks again.');
    }
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
              <Compass className="w-7 h-7 text-[#58745A] dark:text-[#789477]" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                Familiar Routes & Waypoints (চিনাকি পথ)
              </h1>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
              Reinforce landmark sequence recall for your daily neighborhood walks and safe navigation
            </p>
          </div>
        </div>

        {selectedRoute && (
          <button
            onClick={() => {
              setQuizMode(!quizMode);
              setQuizAnswerFeedback(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              quizMode
                ? 'bg-[#58745A] text-white shadow-sm'
                : 'bg-[#E2EBD9] text-[#58745A] hover:bg-[#d5e2cb]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {quizMode ? 'Exit Practice' : 'Practice Memory Walk'}
          </button>
        )}
      </div>

      {/* Ethical Consent & Privacy Notice Banner */}
      <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
        <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium leading-tight">
          <strong>Privacy & Dignity Protected:</strong> All route landmarks are stored locally with patient & family consent. Mind Mithra does not transmit live GPS tracking to third parties.
        </p>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Route Selector Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 p-4 sm:p-5 border-r border-[#E2EBD9] dark:border-stone-800 overflow-y-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Your Familiar Neighborhood Routes
          </h2>
          {routes.map(route => {
            const isSelected = selectedRoute?.id === route.id;
            return (
              <div
                key={route.id}
                onClick={() => {
                  setSelectedRoute(route);
                  setActiveStep(0);
                  setQuizMode(false);
                  setQuizAnswerFeedback(null);
                }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-[#58745A] bg-[#E2EBD9]/60 dark:bg-[#58745A]/20 shadow-md'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {route.waypoints.length} Landmarks
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7] mt-1">
                  {route.title}
                </h3>
                <div className="mt-2 text-xs text-stone-500 flex items-center gap-1">
                  <span>{route.origin}</span>
                  <span>→</span>
                  <span>{route.destination}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waypoints Sequence & Orientation Walk */}
        <div className="lg:col-span-8 xl:col-span-9 p-6 overflow-y-auto max-h-[calc(100vh-220px)]">
          {selectedRoute ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Route Summary Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#202924] border border-[#E2EBD9] dark:border-stone-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                      {selectedRoute.title}
                    </h2>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                      {selectedRoute.notes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakWaypoint(selectedRoute.waypoints[activeStep], selectedRoute.waypoints.length)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
                        isSpeaking
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-[#58745A] text-white hover:bg-[#435945]'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      Narrate Landmark
                    </button>
                  </div>
                </div>
              </div>

              {quizMode ? (
                /* Practice Sequence Challenge */
                <div className="p-6 sm:p-8 rounded-3xl bg-[#F8EBD8]/40 dark:bg-stone-900 border-2 border-[#C66F4E] shadow-md">
                  <div className="text-center max-w-md mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-[#C66F4E] mx-auto mb-2" />
                    <h3 className="text-xl font-serif font-bold text-[#26302A] dark:text-[#FFFDF7]">
                      Landmark Memory Challenge
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                      You are standing at: <strong>{selectedRoute.waypoints[0].name}</strong>. What comes next on your path?
                    </p>
                  </div>

                  {quizAnswerFeedback && (
                    <div className={`p-4 rounded-2xl mb-6 text-center font-bold ${
                      quizAnswerFeedback === 'CORRECT'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {quizAnswerFeedback === 'CORRECT' ? '🎉 Spot on! You remember your path perfectly.' : '🌿 Look at the options below and take your time.'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedRoute.waypoints.slice(1).map(wp => (
                      <button
                        key={wp.id}
                        onClick={() => handleCheckQuizAnswer(wp.id, selectedRoute.waypoints[1].id)}
                        className="p-5 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-[#58745A] text-left transition transform hover:scale-[1.02] shadow-xs"
                      >
                        <h4 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7]">
                          {wp.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1">
                          {wp.landmarkDescription}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Stepper Sequence View */
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-1 before:bg-[#58745A]/30">
                  {selectedRoute.waypoints.map((wp, idx) => {
                    const IconComp = ICON_MAP[wp.icon] || MapPin;
                    const isActive = activeStep === idx;
                    return (
                      <div
                        key={wp.id}
                        onClick={() => setActiveStep(idx)}
                        className={`cursor-pointer relative p-5 sm:p-6 rounded-3xl border-2 transition-all ${
                          isActive
                            ? 'bg-white dark:bg-[#202924] border-[#58745A] shadow-md ring-2 ring-[#58745A]/20'
                            : 'bg-white/60 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                        }`}
                      >
                        {/* Stepper Dot */}
                        <div className={`absolute -left-[31px] sm:-left-[35px] top-6 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition ${
                          isActive
                            ? 'bg-[#58745A] text-white ring-4 ring-[#FFFDF7] dark:ring-[#1A211D]'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#E2EBD9] dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                              <IconComp className="w-6 h-6 text-[#58745A] dark:text-[#789477]" />
                            </div>
                            <div>
                              <span className="text-xs font-bold uppercase tracking-wider text-[#58745A] dark:text-[#789477]">
                                Landmark #{idx + 1}
                              </span>
                              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#26302A] dark:text-[#FFFDF7] mt-0.5">
                                {wp.name}
                              </h3>
                              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                                {wp.landmarkDescription}
                              </p>
                              {wp.memoryNote && (
                                <div className="mt-3 p-3 rounded-xl bg-[#F8EBD8]/60 dark:bg-stone-800/80 border border-[#B28A32]/20 text-xs text-[#26302A] dark:text-stone-200 font-medium">
                                  💡 <strong>Safety note:</strong> {wp.memoryNote}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSpeakWaypoint(wp, selectedRoute.waypoints.length);
                            }}
                            className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-[#58745A] dark:text-[#789477]"
                            aria-label="Speak landmark"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-500">
              <p>Select a route from the sidebar to view familiar landmarks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
