import React, { useState } from 'react';
import { 
  UserRole, 
  SupportedLanguage,
  PatientProfile
} from '../types';
import { SUPPORTED_LANGUAGES } from '../lib/translations';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Languages, 
  LogOut,
  ShieldAlert,
  Stethoscope,
  Lock,
  X,
  Smile,
  Menu
} from 'lucide-react';
import { audioService } from '../lib/audioService';

interface NavigationHeaderProps {
  currentRole: UserRole;
  patient?: PatientProfile;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
  onNetworkChange: (state: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY') => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
  isSyncing: boolean;
  onOpenDemoGuide?: () => void;
  onResetData: () => void;
  onOpenVoice?: () => void;
  onOpenSafeHaven?: () => void;
  onOpenMoodCheck?: () => void;
  onOpenSettings?: () => void;
  onSwitchToCaregiver?: (role: UserRole) => void;
  onSwitchToPatient?: () => void;
  onLogout: () => void;
  onOpenMenu?: () => void;
  onOpenSOS?: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentRole,
  patient,
  currentLang,
  onLangChange,
  networkState,
  onNetworkChange,
  pendingSyncCount,
  onTriggerSync,
  isSyncing,
  onOpenDemoGuide: _onOpenDemoGuide,
  onResetData: _onResetData,
  onOpenVoice: _onOpenVoice,
  onOpenSafeHaven: _onOpenSafeHaven,
  onOpenMoodCheck: _onOpenMoodCheck,
  onOpenSettings: _onOpenSettings,
  onSwitchToCaregiver,
  onSwitchToPatient,
  onLogout,
  onOpenMenu,
  onOpenSOS,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCaregiverPinModal, setShowCaregiverPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('2703');
  const [pinError, setPinError] = useState<string | null>(null);

  const handleUnlockCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2703') {
      audioService.playFeedbackSound('SUCCESS');
      setShowCaregiverPinModal(false);
      setPinError(null);
      if (onSwitchToCaregiver) {
        onSwitchToCaregiver('CAREGIVER');
      }
    } else {
      setPinError('Invalid passcode. Demo passcode: 2703');
      audioService.playFeedbackSound('GENTLE_TAP');
    }
  };

  const handleSOSTap = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    if (onOpenSOS) {
      onOpenSOS();
    }
  };

  const handleMenuTap = () => {
    audioService.playFeedbackSound('GENTLE_TAP');
    if (onOpenMenu) {
      onOpenMenu();
    }
  };

  return (
    <header className="bg-[#FFFDF7] border-b-2 border-[#EADFCB] sticky top-0 z-40 shadow-xs select-none">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
        
        {/* Left Side: Brand & Patient Profile Info */}
        <div className="flex items-center gap-3">
          {currentRole === 'PATIENT' && patient ? (
            <div className="flex items-center gap-2.5">
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500 shadow-xs shrink-0"
              />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 
                    className="font-extrabold text-[#2D2115] text-sm sm:text-base truncate max-w-[130px] sm:max-w-[180px]" 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {patient.name}
                  </h1>
                </div>
                <p className="text-[11px] text-[#6B543E] font-medium truncate max-w-[130px] sm:max-w-[180px]">
                  {patient.region.split(' ')[0]} • {patient.age} yrs
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-stone-900 text-sm sm:text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Caregiver Hub
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                    Staff
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  Cognitive Tracking &amp; Analytics
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Clean Controls */}
        <div className="flex items-center gap-2">

          {/* PATIENT ROLE CONTROLS: Clean & Focused (SOS, Language, Menu) */}
          {currentRole === 'PATIENT' && (
            <>
              {/* Separate, High-Visibility SOS Emergency Action */}
              <button
                onClick={handleSOSTap}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md border-2 border-rose-500 active:scale-95 transition-all cursor-pointer"
                title="Emergency Help / SOS"
                aria-label="Emergency SOS Help"
              >
                <ShieldAlert className="w-4 h-4 text-white stroke-[2.5]" />
                <span className="tracking-wide">SOS</span>
              </button>

              {/* Multilingual Selector Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-2xl bg-[#FFF8EE] hover:bg-[#FDE8B5] text-[#4A2E12] border-2 border-[#E5BD78] transition-colors cursor-pointer shadow-xs"
                  title="Change Language"
                >
                  <Languages className="w-3.5 h-3.5 text-[#D97706]" />
                  <span className="hidden xs:inline">{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name.split(' ')[0]}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border-2 border-[#EADFCB] p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="text-[10px] font-black text-[#8C6D4C] uppercase tracking-wider px-2.5 py-1">
                      Languages
                    </div>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLangChange(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          currentLang === lang.code 
                            ? 'bg-[#FEF3C7] text-[#92400E] font-black border border-[#FDE68A]' 
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[11px] opacity-70 font-semibold">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard ☰ Menu Button */}
              <button
                onClick={handleMenuTap}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-xs border-2 border-amber-500 active:scale-95 transition-all cursor-pointer"
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-4 h-4 stroke-[2.6]" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </>
          )}

          {/* CAREGIVER ROLE CONTROLS: Full Clinical Suite */}
          {(currentRole === 'CAREGIVER' || currentRole === 'HEALTHCARE_WORKER') && (
            <>
              {/* Return to Patient Companion */}
              {onSwitchToPatient && (
                <button
                  onClick={onSwitchToPatient}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer"
                  title="Switch to Patient Companion View"
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Elder View</span>
                </button>
              )}

              {/* Online / Offline Simulator */}
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                <button
                  onClick={() => onNetworkChange('ONLINE')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                    networkState === 'ONLINE'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="Online Mode"
                >
                  <Wifi className="w-3 h-3" />
                  <span className="hidden md:inline">Online</span>
                </button>
                <button
                  onClick={() => onNetworkChange('OFFLINE')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                    networkState === 'OFFLINE'
                      ? 'bg-rose-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                  title="Offline Mode"
                >
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden md:inline">Offline</span>
                </button>
              </div>

              {/* Sync Trigger */}
              <button
                onClick={onTriggerSync}
                disabled={isSyncing || networkState === 'OFFLINE'}
                className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                  pendingSyncCount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 animate-pulse'
                    : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                } ${networkState === 'OFFLINE' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-100'}`}
                title="Sync Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
                {pendingSyncCount > 0 ? (
                  <span className="font-bold text-[11px]">{pendingSyncCount}</span>
                ) : null}
              </button>

              {/* Logout / Exit Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
                title="Exit to Login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};
