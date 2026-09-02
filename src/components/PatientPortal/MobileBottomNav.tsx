import React from 'react';
import { 
  Home, 
  Brain, 
  Heart, 
  Radio, 
  Clock, 
  Mic
} from 'lucide-react';
import { SupportedLanguage } from '../../types';
import { PatientRoute } from '../../App';
import { audioService } from '../../lib/audioService';

interface MobileBottomNavProps {
  currentRoute: PatientRoute;
  onRouteChange: (route: PatientRoute) => void;
  language: SupportedLanguage;
  onOpenVoice: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onRouteChange,
  language: _language,
  onOpenVoice,
}) => {
  const leftNavItems: { route: PatientRoute; label: string; icon: React.ReactNode }[] = [
    {
      route: 'HOME',
      label: 'Home',
      icon: <Home className="w-5 h-5 stroke-[2.2]" />,
    },
    {
      route: 'GAMES',
      label: 'Games',
      icon: <Brain className="w-5 h-5 stroke-[2]" />,
    },
  ];

  const rightNavItems: { route: PatientRoute; label: string; icon: React.ReactNode }[] = [
    {
      route: 'MEMORIES',
      label: 'Memories',
      icon: <Heart className="w-5 h-5 stroke-[2]" />,
    },
    {
      route: 'REMINDERS',
      label: 'Routine',
      icon: <Clock className="w-5 h-5 stroke-[2]" />,
    },
  ];

  const handleNavClick = (r: PatientRoute) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    onRouteChange(r);
  };

  const renderTabButton = (item: { route: PatientRoute; label: string; icon: React.ReactNode }) => {
    const isActive = currentRoute === item.route;

    return (
      <button
        key={item.route}
        onClick={() => handleNavClick(item.route)}
        className="flex-1 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer py-1 group"
        title={item.label}
      >
        {isActive ? (
          /* 3D Glass pill container with specular highlight */
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-b from-amber-200/90 via-amber-100/70 to-amber-200/50 border border-amber-300/80 shadow-[0_4px_12px_rgba(245,158,11,0.22),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(217,119,6,0.2)] flex items-center justify-center">
            {/* Top specular glint */}
            <div className="absolute top-1 left-2 right-2 h-1.5 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />
            <div className="text-amber-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {item.icon}
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-stone-500 group-hover:text-stone-800 group-hover:bg-white/40 transition-all">
            {item.icon}
          </div>
        )}
        <span
          className={`text-[10px] mt-1 tracking-tight transition-colors ${
            isActive
              ? 'font-black text-amber-950'
              : 'font-semibold text-stone-500'
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div
      id="ios-bottom-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none flex justify-center"
    >
      {/* 3D Glass Dock Container */}
      <div className="w-full max-w-md pointer-events-auto relative rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.7),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.03)] px-3 py-2">
        
        {/* Subtle glass reflection highlight along the top edge */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="flex items-center justify-between relative">
          {/* Left Tabs (Home, Games) */}
          <div className="flex items-center justify-around flex-1">
            {leftNavItems.map(renderTabButton)}
          </div>

          {/* Center 3D Glass Sphere VOICE Orb */}
          <div className="relative -mt-9 flex flex-col items-center justify-center px-2 z-10">
            <button
              onClick={() => {
                audioService.playFeedbackSound('GENTLE_TAP');
                onOpenVoice();
              }}
              className="flex flex-col items-center justify-center cursor-pointer group active:scale-90 transition-transform"
              title="Tap to talk with Voice Companion"
              aria-label="Open Voice Companion"
            >
              <div className="relative">
                {/* Ambient dynamic gold bloom glow */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 opacity-40 blur-lg group-hover:opacity-70 transition-opacity" />
                
                {/* 3D Glass Orb button */}
                <div className="relative w-15 h-15 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-[0_10px_25px_rgba(217,119,6,0.45),0_3px_6px_rgba(0,0,0,0.1),inset_0_2px_3px_rgba(255,255,255,0.9),inset_0_-4px_6px_rgba(180,83,9,0.35)] border-2 border-white/90 ring-4 ring-amber-100/70 group-hover:scale-105 transition-all">
                  
                  {/* Top curved 3D glass gloss specular lens reflection */}
                  <div className="absolute top-1 left-2.5 right-2.5 h-4.5 rounded-t-full bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />
                  
                  {/* Bottom rim reflection */}
                  <div className="absolute bottom-1.5 left-4 right-4 h-1.5 rounded-full bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

                  {/* Icon */}
                  <div className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                    <Mic className="w-6.5 h-6.5 stroke-[2.6] text-stone-950 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 3D Label */}
              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                VOICE
              </span>
            </button>
          </div>

          {/* Right Tabs (Memories, Routine) */}
          <div className="flex items-center justify-around flex-1">
            {rightNavItems.map(renderTabButton)}
          </div>
        </div>
      </div>
    </div>
  );
};
