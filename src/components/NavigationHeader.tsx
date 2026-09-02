import React, { useState } from 'react';
import { 
  UserRole, 
  SupportedLanguage,
  PatientProfile
} from '../types';
import { SUPPORTED_LANGUAGES, t } from '../lib/translations';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User, 
  Languages, 
  Sparkles, 
  LogOut,
  Mic,
  ShieldAlert,
  Stethoscope,
  Lock,
  X,
  ArrowLeft,
  Smile,
  Settings as SettingsIcon,
  Camera
} from 'lucide-react';
import { ManasLogo } from './Brand/ManasLogo';
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
  onOpenDemoGuide,
  onResetData,
  onOpenVoice,
  onOpenSafeHaven,
  onOpenMoodCheck,
  onOpenSettings,
  onSwitchToCaregiver,
  onSwitchToPatient,
  onLogout,
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
      setPinError('Invalid passcode. Use demo passcode: 2703');
      audioService.playFeedbackSound('GENTLE_TAP');
    }
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
        {/* Left Side: Brand & Active Profile Info */}
        <div className="flex items-center gap-3">
          {currentRole === 'PATIENT' && patient ? (
            <div className="flex items-center gap-2.5">
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-teal-500 shadow-xs shrink-0"
              />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-slate-900 text-sm sm:text-base truncate max-w-[130px] sm:max-w-[200px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {patient.name}
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 hidden sm:inline">
                    Mind Mithra
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate max-w-[130px] sm:max-w-[180px]">
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
                  <h1 className="font-extrabold text-slate-900 text-sm sm:text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Caregiver & Clinical Hub
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                    Clinical
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Multi-Patient Cognitive Tracking & Routine Management
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Voice Assistant Trigger (Patient mode) */}
          {currentRole === 'PATIENT' && onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Open Voice Companion"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
          )}

          {/* Quick Camera Mood Check Trigger (Patient mode) */}
          {currentRole === 'PATIENT' && onOpenMoodCheck && (
            <button
              onClick={onOpenMoodCheck}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Camera Mood & Expression Check"
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Mood Check</span>
            </button>
          )}

          {/* Safe Haven SOS Trigger (Patient mode) */}
          {currentRole === 'PATIENT' && onOpenSafeHaven && (
            <button
              onClick={onOpenSafeHaven}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              title="Safe Haven SOS Reassurance"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden md:inline">Safe Haven</span>
            </button>
          )}

          {/* Settings Modal Trigger */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 p-2 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
              title="Settings & Accessibility"
            >
              <SettingsIcon className="w-3.5 h-3.5 text-stone-700" />
            </button>
          )}

          {/* Switch back to Patient mode (Caregiver mode only) */}
          {(currentRole === 'CAREGIVER' || currentRole === 'HEALTHCARE_WORKER') && onSwitchToPatient && (
            <button
              onClick={onSwitchToPatient}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer"
              title="Switch view back to Patient Companion"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Elder View</span>
            </button>
          )}

          {/* Discreet Caregiver Mode Switcher (Patient mode) */}
          {currentRole === 'PATIENT' && (
            <button
              onClick={() => setShowCaregiverPinModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-300 transition-colors cursor-pointer"
              title="Access Caregiver & Clinical Dashboard"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">Caregiver Hub</span>
            </button>
          )}

          {/* Network Simulator Switcher (Online / Offline) */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => onNetworkChange('ONLINE')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                networkState === 'ONLINE'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Online Mode (Cloud AI Voice & Remote Sync)"
            >
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Online</span>
            </button>
            <button
              onClick={() => onNetworkChange('OFFLINE')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                networkState === 'OFFLINE'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Offline Mode (Local Storage & Offline Rule Engine)"
            >
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </button>
          </div>

          {/* Sync Trigger & Pending Queue Badge */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing || networkState === 'OFFLINE'}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-xl border transition-all ${
              pendingSyncCount > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            } ${networkState === 'OFFLINE' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-100'}`}
            title={networkState === 'OFFLINE' ? 'Events queueing locally in SQLite' : 'Trigger Sync'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
            {pendingSyncCount > 0 ? (
              <span className="font-bold text-[11px]">{pendingSyncCount}</span>
            ) : null}
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-colors"
              title="Select Regional Language"
            >
              <Languages className="w-3.5 h-3.5 text-stone-600" />
              <span className="font-bold">{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.name.split(' ')[0]}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2.5 py-1">
                  NER Languages
                </div>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLangChange(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      currentLang === lang.code ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-[11px] text-stone-500">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout / Switch Profile Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200 transition-colors"
            title={currentRole === 'PATIENT' ? 'Log out / Switch patient profile' : 'Exit to Login Portal'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentRole === 'PATIENT' ? 'Switch' : 'Exit'}</span>
          </button>
        </div>
      </div>

      {/* DISCREET CAREGIVER PIN ACCESS MODAL */}
      {showCaregiverPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 border-2 border-teal-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-stone-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Caregiver & Clinician Mode
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Enter staff passcode to access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCaregiverPinModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinError && (
              <div className="p-3 mb-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
                {pinError}
              </div>
            )}

            <form onSubmit={handleUnlockCaregiver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  4-Digit Security Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-stone-950 border border-stone-700 focus:border-teal-400 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-mono text-white outline-none"
                    autoFocus
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all"
              >
                Open Caregiver Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
