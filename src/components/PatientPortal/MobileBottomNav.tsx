import React from 'react';
import { 
  Home, 
  Gamepad2, 
  Heart, 
  Menu, 
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
  onOpenMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onRouteChange,
  language: _language,
  onOpenVoice,
  onOpenMenu,
}) => {
  const handleNavClick = (r: PatientRoute) => {
    audioService.playFeedbackSound('GENTLE_TAP');
    onRouteChange(r);
  };

  const handleMenuClick = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    if (onOpenMenu) {
      onOpenMenu();
    }
  };

  const renderTab = (
    label: string, 
    icon: React.ReactNode, 
    isActive: boolean, 
    onClick: () => void
  ) => {
    return (
      <button
        onClick={onClick}
        className="flex-1 flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer py-1 group"
        title={label}
        aria-label={label}
      >
        {isActive ? (
          /* Active 3D glass pill */
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-b from-[#FDE68A] via-[#FCD34D] to-[#F59E0B] border-2 border-[#D97706] shadow-[0_4px_12px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-center">
            <div className="absolute top-1 left-2 right-2 h-1.5 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />
            <div className="text-stone-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
              {icon}
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#6B543E] hover:text-[#2D2115] hover:bg-[#FFF8EE] transition-all">
            {icon}
          </div>
        )}
        <span
          className={`text-[11px] mt-1 tracking-tight transition-colors ${
            isActive
              ? 'font-black text-[#2D2115]'
              : 'font-bold text-[#6B543E]'
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <nav
      id="patient-bottom-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none flex justify-center"
      aria-label="Bottom Navigation"
    >
      {/* 3D Luminous Warm Dock Container */}
      <div className="w-full max-w-md pointer-events-auto relative rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-[#E5D7BE] shadow-[0_10px_35px_-5px_rgba(180,83,9,0.15),0_0_0_1px_rgba(255,255,255,0.8)] px-3 py-2">
        
        {/* Subtle glass reflection highlight */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between relative">
          
          {/* 1. Home Tab */}
          {renderTab(
            'Home',
            <Home className="w-5 h-5 stroke-[2.4]" />,
            currentRoute === 'HOME',
            () => handleNavClick('HOME')
          )}

          {/* 2. Games Tab */}
          {renderTab(
            'Games',
            <Gamepad2 className="w-5 h-5 stroke-[2.4]" />,
            currentRoute === 'GAMES',
            () => handleNavClick('GAMES')
          )}

          {/* 3. Center 3D Glass Orb: VOICE COMPANION */}
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
                {/* Dynamic gold bloom glow */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 opacity-50 blur-lg group-hover:opacity-80 transition-opacity" />
                
                {/* 3D Glass Orb button */}
                <div className="relative w-15 h-15 rounded-full bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-[0_10px_25px_rgba(217,119,6,0.45),0_3px_6px_rgba(0,0,0,0.1),inset_0_2px_3px_rgba(255,255,255,0.9)] border-2 border-white ring-4 ring-amber-200/80 group-hover:scale-105 transition-all">
                  
                  {/* Top curved 3D glass gloss reflection */}
                  <div className="absolute top-1 left-2.5 right-2.5 h-4.5 rounded-t-full bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />
                  
                  {/* Bottom rim reflection */}
                  <div className="absolute bottom-1.5 left-4 right-4 h-1.5 rounded-full bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

                  {/* Icon */}
                  <div className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                    <Mic className="w-7 h-7 stroke-[2.6] text-stone-950 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* 3D Label */}
              <span className="text-[10px] font-black text-[#2D2115] uppercase tracking-wider mt-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                TALK
              </span>
            </button>
          </div>

          {/* 4. Memories Tab */}
          {renderTab(
            'Memories',
            <Heart className="w-5 h-5 stroke-[2.4]" />,
            currentRoute === 'MEMORIES',
            () => handleNavClick('MEMORIES')
          )}

          {/* 5. ☰ Menu Tab */}
          {renderTab(
            'Menu',
            <Menu className="w-5 h-5 stroke-[2.6]" />,
            false,
            handleMenuClick
          )}

        </div>
      </div>
    </nav>
  );
};
