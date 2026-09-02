import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Stethoscope, 
  MapPin, 
  X,
  Sparkles,
  Shield,
  Gamepad2,
  Image as ImageIcon,
  HeartHandshake,
  Check,
  ChevronDown,
  Volume2,
  Users
} from 'lucide-react';
import { PatientProfile, SupportedLanguage, UserRole } from '../../types';
import { PatientRoute } from '../../App';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';
import { ManasLogo } from '../Brand/ManasLogo';
import { LanguageSelectionScreen } from './LanguageSelectionScreen';

interface LoginPortalProps {
  onPatientLogin: (patient: PatientProfile, initialRoute?: PatientRoute) => void;
  onCaregiverLogin: (role: UserRole) => void;
}

const REGIONS = [
  'Assam (Guwahati & Tezpur)',
  'Meghalaya (Shillong & Jowai)',
  'Manipur (Imphal & Bishnupur)',
  'Tripura (Agartala)',
  'Mizoram (Aizawl)',
  'Nagaland (Kohima & Dimapur)',
  'Arunachal Pradesh (Itanagar)',
  'Sikkim (Gangtok)',
];

const AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    label: 'Grandpa Joy',
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    label: 'Grandma Maya',
  },
  {
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    label: 'Senior Farmer',
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    label: 'Senior Teacher',
  },
];

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onPatientLogin,
  onCaregiverLogin,
}) => {
  const [currentStep, setCurrentStep] = useState<'LOGIN' | 'LANGUAGE_SELECTION'>('LOGIN');
  const [pendingRoute, setPendingRoute] = useState<PatientRoute>('GAMES');
  
  // Registered Patients List for 1-Tap Elder Selection
  const [patientRegistry, setPatientRegistry] = useState<PatientProfile[]>(() => localDB.getPatientRegistry());
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile>(() => localDB.getPatientProfile());
  const [draftPatient, setDraftPatient] = useState<PatientProfile | null>(null);

  // Discreet Caregiver Access Modal State
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('priyanka.care@mindmithra.health');
  const [caregiverPassword, setCaregiverPassword] = useState('1234');
  const [caregiverRole, setCaregiverRole] = useState<UserRole>('CAREGIVER');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const registry = localDB.getPatientRegistry();
    setPatientRegistry(registry);
    const active = localDB.getPatientProfile();
    if (active) {
      setSelectedPatient(active);
    }
  }, []);

  const handleSelectElder = (p: PatientProfile) => {
    setSelectedPatient(p);
    localDB.setActivePatientId(p.id);
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  const handleLaunchMode = (route: PatientRoute) => {
    setPendingRoute(route);
    setAuthError(null);
    audioService.playFeedbackSound('GENTLE_TAP');

    setDraftPatient(selectedPatient);
    setCurrentStep('LANGUAGE_SELECTION');
  };

  const handleFinalizeWithLanguage = (chosenLang: SupportedLanguage) => {
    if (!draftPatient) return;

    const saved = localDB.registerOrUpdatePatient({
      ...draftPatient,
      preferredLanguage: chosenLang,
    });

    localDB.setLoggedInSession('PATIENT', saved.id);

    audioService.speak(
      `Welcome back ${saved.name}! Opening your ${pendingRoute === 'GAMES' ? 'cognitive games' : 'cherished memories'}.`,
      undefined,
      { fallbackOnly: false }
    );

    onPatientLogin(saved, pendingRoute);
  };

  const handleCaregiverSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caregiverEmail.trim() || !caregiverPassword.trim()) {
      setAuthError('Please enter caregiver email and PIN');
      return;
    }

    if (caregiverPassword !== '1234') {
      setAuthError('Invalid passcode. Use demo passcode: 1234');
      return;
    }

    setAuthError(null);
    audioService.playFeedbackSound('SUCCESS');
    localDB.setLoggedInSession(caregiverRole, null);
    setShowCaregiverModal(false);
    onCaregiverLogin(caregiverRole);
  };

  const handleQuickDemoCaregiver = (role: UserRole, email: string) => {
    setCaregiverRole(role);
    setCaregiverEmail(email);
    setCaregiverPassword('1234');
    audioService.playFeedbackSound('SUCCESS');
    localDB.setLoggedInSession(role, null);
    setShowCaregiverModal(false);
    onCaregiverLogin(role);
  };

  if (currentStep === 'LANGUAGE_SELECTION' && draftPatient) {
    return (
      <LanguageSelectionScreen
        patientName={draftPatient.name.split(' ')[0]}
        initialLanguage={draftPatient.preferredLanguage || 'en'}
        onSelectLanguageAndContinue={handleFinalizeWithLanguage}
        onBackToLogin={() => setCurrentStep('LOGIN')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Warm Ambient Glows matching App Theme */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-400/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-orange-400/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Pattern Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#78350f 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Floating Badge */}
      <div className="relative z-10 mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-md backdrop-blur-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>North East Cognitive Companion</span>
      </div>

      {/* Main Card: Focused 2-Button Clean Action Container */}
      <div className="w-full max-w-lg bg-white border border-stone-200/90 rounded-3xl shadow-[0_20px_50px_-15px_rgba(180,83,9,0.15)] overflow-hidden z-10 relative">
        
        {/* Top Gradient Banner matching App Hero */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

        {/* Header with Logo */}
        <div className="pt-6 pb-2 px-6 sm:px-8 text-center flex flex-col items-center">
          <ManasLogo size="lg" theme="amber" showTagline={false} animated={true} />
          
          <h1 
            className="text-2xl sm:text-3xl font-black text-stone-900 mt-3 tracking-tight"
          >
            Namaskar, {selectedPatient.name.split(' ')[0] || 'Elder'}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
            Your gentle voice companion for memory, mental agility & peace
          </p>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="mx-6 sm:mx-8 my-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold text-center">
            {authError}
          </div>
        )}

        {/* Main 2-Action Section: Start Game & Memories */}
        <div className="p-6 sm:p-8 pt-3 space-y-4">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Choose What You'd Like to Do</span>
            </span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100/70 px-2 py-0.5 rounded-full">
              Voice-Ready
            </span>
          </div>

          {/* 1. START GAME Big Action Card */}
          <button
            type="button"
            onClick={() => handleLaunchMode('GAMES')}
            className="w-full p-4 sm:p-5 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800 text-white text-left shadow-lg shadow-amber-600/25 transition-all transform active:scale-98 cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <Gamepad2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-amber-100 text-[10px] font-extrabold tracking-wider uppercase mb-1">
                  Cognitive Workout
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  Start Game
                </h3>
                <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                  Play memory puzzles, riddles & regional brain games
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* 2. MEMORIES Big Action Card */}
          <button
            type="button"
            onClick={() => handleLaunchMode('MEMORIES')}
            className="w-full p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 text-white text-left shadow-lg shadow-emerald-700/20 transition-all transform active:scale-98 cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <ImageIcon className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-emerald-100 text-[10px] font-extrabold tracking-wider uppercase mb-1">
                  Life & Culture
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                  Memories
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  Browse family photo albums, tea garden songs & stories
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Registered Elder Profile Selector (1-Tap Selection) */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>Select Elder Profile</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium">
                {patientRegistry.length} Registered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patientRegistry.map((p) => {
                const isSelected = p.id === selectedPatient.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectElder(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-xs font-extrabold text-stone-900 truncate flex items-center gap-1">
                        <span>{p.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        Age {p.age} • {p.region.split(' ')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-200/70 text-[10px] text-stone-500 flex items-center justify-between">
              <span className="truncate">Active: <strong>{selectedPatient.name}</strong></span>
              <span className="text-stone-400">Registration in Caregiver Portal</span>
            </div>
          </div>
        </div>

        {/* Discreet Caregiver Access Footer */}
        <div className="py-3 px-6 bg-stone-50 border-t border-stone-150 flex items-center justify-between text-xs text-stone-500">
          <span className="text-[11px] flex items-center gap-1.5 text-stone-500 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            100% Offline & Private
          </span>
          <button
            type="button"
            onClick={() => {
              setShowCaregiverModal(true);
              setAuthError(null);
              audioService.playFeedbackSound('GENTLE_TAP');
            }}
            className="text-stone-400 hover:text-stone-700 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Family & Caregiver Access"
          >
            <Stethoscope className="w-3 h-3 text-stone-400" />
            <span>Family & Clinical Portal</span>
          </button>
        </div>
      </div>

      {/* Floating Feature Highlights in Warm Tones */}
      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-stone-600">
        <span className="px-3 py-1 rounded-full bg-white/80 border border-stone-200 text-stone-800 shadow-xs flex items-center gap-1.5">
          🎙️ 7 Regional Dialects
        </span>
        <span className="px-3 py-1 rounded-full bg-white/80 border border-stone-200 text-stone-800 shadow-xs flex items-center gap-1.5">
          🌿 Tea Gardens & Hill Memories
        </span>
        <span className="px-3 py-1 rounded-full bg-white/80 border border-stone-200 text-stone-800 shadow-xs flex items-center gap-1.5">
          ❤️ Gentle Voice Turn-Taking
        </span>
      </div>

      {/* Discreet Caregiver Login Modal */}
      {showCaregiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-stone-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Caregiver Portal
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Clinical & Family Dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCaregiverModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Profile Selection */}
            <div className="mb-4">
              <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-2">
                Select Caregiver Account
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoCaregiver('CAREGIVER', 'priyanka.care@manas.health')}
                  className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 rounded-xl text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">Priyanka K.</p>
                  <p className="text-[10px] text-amber-700 font-semibold">Primary Caregiver</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoCaregiver('HEALTHCARE_WORKER', 'dr.sharma@ner-health.org')}
                  className="p-2.5 bg-stone-50 hover:bg-teal-50 border border-stone-200 hover:border-teal-400 rounded-xl text-left transition-all cursor-pointer"
                >
                  <p className="font-bold text-xs text-stone-900">Dr. Sharma</p>
                  <p className="text-[10px] text-teal-700 font-semibold">Neurologist</p>
                </button>
              </div>
            </div>

            {/* PIN Passcode Form */}
            <form onSubmit={handleCaregiverSignIn} className="space-y-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Passcode PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={caregiverPassword}
                    onChange={(e) => setCaregiverPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-stone-50 border border-stone-300 focus:border-amber-500 rounded-xl px-3 py-2.5 text-center font-mono text-base font-bold text-stone-900 outline-none tracking-widest"
                    required
                  />
                  <Shield className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                {authError && (
                  <p className="text-[11px] text-rose-600 mt-1 text-center font-medium">
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all mt-2 cursor-pointer"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
