import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  SupportedLanguage, 
  GameCategory, 
  PatientProfile, 
  CaregiverInstruction,
  AppSettings,
  PatientMoodLog,
  CognitiveGameDefinition
} from './types';
import { localDB, DEFAULT_PATIENTS } from './lib/storage';
import { audioService } from './lib/audioService';
import { OpeningSplashScreen } from './components/AuthPortal/OpeningSplashScreen';
import { NavigationHeader } from './components/NavigationHeader';
import { MobileBottomNav } from './components/PatientPortal/MobileBottomNav';
import { PatientHome } from './components/PatientPortal/PatientHome';
import { VoiceAssistantModal } from './components/PatientPortal/VoiceAssistantModal';
import { CameraMoodCheckModal } from './components/PatientPortal/CameraMoodCheckModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { BaselineAssessment } from './components/PatientPortal/BaselineAssessment';
import { CognitiveGameHub } from './components/PatientPortal/CognitiveGames/CognitiveGameHub';
import { MemoryMatchGame } from './components/PatientPortal/CognitiveGames/MemoryMatchGame';
import { AttentionFinderGame } from './components/PatientPortal/CognitiveGames/AttentionFinderGame';
import { PatternSequenceGame } from './components/PatientPortal/CognitiveGames/PatternSequenceGame';
import { RoutineSequencerGame } from './components/PatientPortal/CognitiveGames/RoutineSequencerGame';
import { WordRecallGame } from './components/PatientPortal/CognitiveGames/WordRecallGame';
import { ObjectCategorySortGame } from './components/PatientPortal/CognitiveGames/ObjectCategorySortGame';
import { StoryRecallGame } from './components/PatientPortal/CognitiveGames/StoryRecallGame';
import { RelaxationMusicGame } from './components/PatientPortal/CognitiveGames/RelaxationMusicGame';
import { VisuospatialPuzzleGame } from './components/PatientPortal/CognitiveGames/VisuospatialPuzzleGame';
import { MotorCoordinationGame } from './components/PatientPortal/CognitiveGames/MotorCoordinationGame';
import { MemoryVaultView } from './components/PatientPortal/MemoryVaultView';
import { RemindersView } from './components/PatientPortal/RemindersView';
import { FamilyAudioView } from './components/PatientPortal/FamilyAudioView';
import { FamilyTreeView } from './components/PatientPortal/FamilyTreeView';
import { ReminiscenceRadioView } from './components/PatientPortal/ReminiscenceRadioView';
import { SafeHavenReassuranceModal } from './components/PatientPortal/SafeHavenReassuranceModal';
import { SOSAlertModal } from './components/PatientPortal/SOSAlertModal';
import { CaregiverDashboard } from './components/CaregiverPortal/CaregiverDashboard';
import { DemoWalkthroughBar, DEMO_STEPS } from './components/DemoWalkthroughBar';
import { COGNITIVE_GAMES_CATALOG } from './lib/cognitiveGamesCatalog';

// Mind Mithra Reference Features Expansion Components
import { MemoryWebView } from './components/PatientPortal/MemoryWeb/MemoryWebView';
import { ElderKnowledgeView } from './components/PatientPortal/ElderKnowledge/ElderKnowledgeView';
import { FamiliarRouteView } from './components/PatientPortal/FamiliarRoutes/FamiliarRouteView';
import { LifeSkillSimulatorView } from './components/PatientPortal/LifeSkills/LifeSkillSimulatorView';
import { PersonalSoundscapeView } from './components/PatientPortal/Soundscapes/PersonalSoundscapeView';
import { DailyJournalView } from './components/PatientPortal/DailyJournal/DailyJournalView';
import { StoryBuilderView } from './components/PatientPortal/StoryBuilder/StoryBuilderView';
import { ReminiscenceTheaterView } from './components/PatientPortal/ReminiscenceTheater/ReminiscenceTheaterView';
import { MemoryGameGeneratorModal } from './components/PatientPortal/MemoryToGame/MemoryGameGeneratorModal';
import { MemoryCapsulesView } from './components/PatientPortal/MemoryCapsules/MemoryCapsulesView';
import { MemoryChainView } from './components/PatientPortal/MemoryChain/MemoryChainView';
import { ConfidenceMapModal } from './components/PatientPortal/ConfidenceMap/ConfidenceMapModal';
import { TodaysWhyModal } from './components/PatientPortal/TodaysWhy/TodaysWhyModal';
import { MainMenuDrawer } from './components/PatientPortal/MainMenuDrawer';
import { AccessibleCalculatorModal } from './components/PatientPortal/AccessibleCalculatorModal';
import { AllGamesCatalogModal } from './components/PatientPortal/CognitiveGames/AllGamesCatalogModal';

// Public Website & Auth
import { LandingPage } from './components/PublicWebsite/LandingPage';
import { AuthPage, type AuthUser } from './components/Auth/AuthPage';
import { RoleSelectPage } from './components/Auth/RoleSelectPage';
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage';


export type PatientRoute =
  | 'HOME'
  | 'GAMES'
  | 'MEMORIES'
  | 'REMINDERS'
  | 'RELAX'
  | 'RADIO'
  | 'FAMILY'
  | 'FAMILY_TREE'
  | 'BASELINE'
  | 'MEMORY_WEB'
  | 'ELDER_KNOWLEDGE'
  | 'ROUTES'
  | 'LIFE_SKILLS'
  | 'SOUNDSCAPES'
  | 'DAILY_JOURNAL'
  | 'STORY_BUILDER'
  | 'REMINISCENCE_THEATER'
  | 'MEMORY_CAPSULES'
  | 'MEMORY_CHAINS';

export default function App() {
  // ─── AUTH SCREEN STATE ─────────────────────────────────────────────────────
  // 'CHECKING'  — fetching /api/auth/me on mount
  // 'LANDING'   — public website (not authenticated)
  // 'AUTH'      — sign in / sign up / forgot password page
  // 'RESET_PWD' — password reset page (token in URL)
  // 'ROLE_SELECT' — choose patient or caregiver mode
  // 'APP'       — authenticated app (existing flow)
  type AppScreen = 'CHECKING' | 'LANDING' | 'AUTH' | 'RESET_PWD' | 'ROLE_SELECT' | 'APP';
  const [appScreen, setAppScreen] = useState<AppScreen>('CHECKING');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Opening Splash Screen State - disabled by default
  const [showSplash, setShowSplash] = useState<boolean>(false);

  // Check URL for auth callbacks and reset tokens
  useEffect(() => {
    const url = new URL(window.location.href);
    const authErrParam = url.searchParams.get('auth_error');
    const resetTokenParam = url.searchParams.get('token');
    const pathName = url.pathname;

    if (authErrParam) {
      setAuthError(authErrParam);
      window.history.replaceState({}, '', '/');
    }
    if (pathName === '/reset-password' && resetTokenParam) {
      setResetToken(resetTokenParam);
      setAppScreen('RESET_PWD');
      return;
    }
    if (pathName === '/select-mode') {
      window.history.replaceState({}, '', '/');
    }

    // Check for existing session
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
          // If already authenticated, go to role selection (unless path says /select-mode)
          if (pathName === '/select-mode') {
            setAppScreen('ROLE_SELECT');
          } else {
            setAppScreen('ROLE_SELECT');
          }
        } else {
          setAppScreen('LANDING');
        }
      })
      .catch(() => {
        // If server unreachable, go to landing
        setAppScreen('LANDING');
      });
  }, []);

  const [authDefaultRole, setAuthDefaultRole] = useState<'CAREGIVER' | 'PATIENT'>('CAREGIVER');

  // Handle auth success (after login/signup) — set user and route to appropriate view
  const handleAuthSuccess = (user: AuthUser) => {
    setAuthUser(user);
    if (user.role === 'CAREGIVER' || user.role === 'HEALTHCARE_WORKER') {
      setCurrentRole('CAREGIVER');
      setIsAuthenticated(true);
      setAppScreen('APP');
    } else if (user.role === 'PATIENT') {
      const allPatients = DEFAULT_PATIENTS;
      const matched = allPatients.find((p) => 
        p.id === user.id || 
        p.name.toLowerCase().includes(user.name.toLowerCase()) || 
        (user.email && user.email.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]))
      ) || DEFAULT_PATIENTS[0];

      const updatedProfile: PatientProfile = {
        ...matched,
        name: user.name || matched.name,
        preferredLanguage: (user.preferred_language as any) || matched.preferredLanguage,
      };
      localDB.savePatientProfile(updatedProfile);
      localDB.setLoggedInSession('PATIENT', updatedProfile.id);
      setPatient(updatedProfile);
      setCurrentLang(updatedProfile.preferredLanguage);
      setCurrentRole('PATIENT');
      setIsAuthenticated(true);
      setAppScreen('APP');
      if (settings.autoCameraMoodCheck) setIsMoodCheckOpen(true);
    } else {
      setAppScreen('ROLE_SELECT');
    }
    audioService.playFeedbackSound('SUCCESS');
  };

  // These handlers are defined after state declarations below:
  // handleEnterPatientMode, handleEnterCaregiverMode, handleAuthLogout
  // App Settings (Font size, auto-mood, contrast, audio)
  const [settings, setSettings] = useState<AppSettings>(() => localDB.getAppSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // Face & Mood Check modal (accessible via Menu or Login)
  const [isMoodCheckOpen, setIsMoodCheckOpen] = useState<boolean>(false);
  const [activeMoodLog, setActiveMoodLog] = useState<PatientMoodLog | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  // Session Authentication State - starts false, set by auth flow
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');

  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    const profile = localDB.getPatientProfile();
    return profile.preferredLanguage || 'en';
  });
  const [networkState, setNetworkState] = useState<'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY'>(() => {
    return typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE';
  });
  const [patientRoute, setPatientRoute] = useState<PatientRoute>('HOME');
  const [activeGameCategory, setActiveGameCategory] = useState<GameCategory>('MEMORY');
  const [selectedGameDef, setSelectedGameDef] = useState<CognitiveGameDefinition | null>(null);
  
  // Data State
  const [patient, setPatient] = useState<PatientProfile>(() => localDB.getPatientProfile());
  const [instructions, setInstructions] = useState<CaregiverInstruction[]>(() => localDB.getCaregiverInstructions());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals & Demo Guide
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isSafeHavenOpen, setIsSafeHavenOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isMemoryQuizOpen, setIsMemoryQuizOpen] = useState<boolean>(false);
  const [isConfidenceMapOpen, setIsConfidenceMapOpen] = useState<boolean>(false);
  const [isTodaysWhyOpen, setIsTodaysWhyOpen] = useState<boolean>(false);
  const [isGamesCatalogOpen, setIsGamesCatalogOpen] = useState<boolean>(false);

  const refreshState = useCallback(() => {
    const active = localDB.getPatientProfile();
    setPatient(active);
    if (active.preferredLanguage) {
      setCurrentLang(active.preferredLanguage);
    }
    setInstructions(localDB.getCaregiverInstructions());
    setPendingSyncCount(localDB.getPendingSyncCount());
    setSettings(localDB.getAppSettings());
  }, []);

  // Sync Engine: Flushes local offline queue to server API
  const handleTriggerSync = useCallback(async () => {
    if (networkState === 'OFFLINE' || isSyncing) return;

    setIsSyncing(true);
    const pendingEvents = localDB.getPendingEvents();

    if (pendingEvents.length === 0) {
      setTimeout(() => setIsSyncing(false), 400);
      return;
    }

    try {
      const res = await fetch('/api/sync/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: pendingEvents }),
      });

      if (res.ok) {
        localDB.markEventsSynced(pendingEvents.map((e) => e.eventId));
        setPendingSyncCount(0);
        audioService.playFeedbackSound('SUCCESS');
      }
    } catch {
      // If server unreachable, retain queue locally
    } finally {
      setIsSyncing(false);
      refreshState();
    }
  }, [networkState, isSyncing, refreshState]);

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => {
      setNetworkState('ONLINE');
      handleTriggerSync();
    };
    const handleOffline = () => {
      setNetworkState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleTriggerSync]);

  useEffect(() => {
    refreshState();
    // Poll pending sync events
    const interval = setInterval(() => {
      setPendingSyncCount(localDB.getPendingSyncCount());
    }, 2000);
    return () => clearInterval(interval);
  }, [refreshState]);

  // Handle Patient Login - automatically opens Face & Mood check first
  const handlePatientLogin = (profile: PatientProfile, initialRoute: PatientRoute = 'HOME') => {
    setPatient(profile);
    setCurrentLang(profile.preferredLanguage || 'en');
    setCurrentRole('PATIENT');
    setIsAuthenticated(true);
    setPatientRoute(initialRoute);
    if (settings.autoCameraMoodCheck) {
      setIsMoodCheckOpen(true);
    }
    refreshState();
  };

  // Handle role selection — enter patient mode (from authenticated session)
  const handleEnterPatientMode = () => {
    if (!authUser) return;
    const existingProfile = localDB.getPatientProfile();
    const updatedProfile: PatientProfile = {
      ...existingProfile,
      name: authUser.name,
      preferredLanguage: (authUser.preferred_language as any) || existingProfile.preferredLanguage,
    };
    localDB.savePatientProfile(updatedProfile);
    setPatient(updatedProfile);
    setCurrentLang(updatedProfile.preferredLanguage);
    setCurrentRole('PATIENT');
    setIsAuthenticated(true);
    setAppScreen('APP');
    if (settings.autoCameraMoodCheck) setIsMoodCheckOpen(true);
    audioService.playFeedbackSound('GENTLE_TAP');
    refreshState();
  };

  // Handle role selection — enter caregiver mode
  const handleEnterCaregiverMode = () => {
    setCurrentRole('CAREGIVER');
    setIsAuthenticated(true);
    setAppScreen('APP');
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  // Handle auth logout — destroy session and go to landing
  const handleAuthLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setAuthUser(null);
    setIsAuthenticated(false);
    localDB.clearSession();
    setAppScreen('LANDING');
  };

  // Handle Caregiver Login
  const handleCaregiverLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setIsMoodCheckOpen(false);
    refreshState();
  };

  // Switch role to Caregiver
  const handleSwitchToCaregiver = (role: UserRole = 'CAREGIVER') => {
    localDB.setLoggedInSession(role, null);
    setCurrentRole(role);
    setIsMoodCheckOpen(false);
    refreshState();
  };

  // Switch role to Patient
  const handleSwitchToPatient = () => {
    const active = localDB.getPatientProfile();
    localDB.setLoggedInSession('PATIENT', active.id);
    setCurrentRole('PATIENT');
    setPatientRoute('HOME');
    if (settings.autoCameraMoodCheck) {
      setIsMoodCheckOpen(true);
    }
    refreshState();
  };

  // Handle Logout / Switch Profile
  const handleLogout = () => {
    localDB.clearSession();
    setIsAuthenticated(false);
    setIsVoiceOpen(false);
    setIsSafeHavenOpen(false);
    setIsMoodCheckOpen(false);
    audioService.playFeedbackSound('GENTLE_TAP');
    // Also destroy server session
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).then(() => {
      setAuthUser(null);
      setAppScreen('LANDING');
    });
  };

  const handleResetData = () => {
    localDB.resetToDemo();
    refreshState();
    setPatientRoute('HOME');
    audioService.playFeedbackSound('SUCCESS');
  };

  // Demo step action executor
  const handleExecuteDemoStep = (stepNum: number) => {
    const target = DEMO_STEPS[stepNum - 1];
    if (!target) return;

    if (target.role) {
      setCurrentRole(target.role as UserRole);
      setIsAuthenticated(true);
    }
    if (target.network) {
      setNetworkState(target.network as any);
    }

    // Step-specific routes
    switch (stepNum) {
      case 1:
        setPatientRoute('HOME');
        break;
      case 2:
        setNetworkState('OFFLINE');
        break;
      case 3:
        setNetworkState('OFFLINE');
        setIsVoiceOpen(true);
        break;
      case 4:
        setIsVoiceOpen(false);
        setActiveGameCategory('MEMORY');
        setPatientRoute('GAMES');
        break;
      case 5:
        setIsVoiceOpen(false);
        setActiveGameCategory('MEMORY');
        setPatientRoute('GAMES');
        break;
      case 6:
        setPatientRoute('REMINDERS');
        break;
      case 7:
        setNetworkState('ONLINE');
        handleTriggerSync();
        break;
      case 8:
        setPatientRoute('MEMORIES');
        break;
      case 9:
        setCurrentRole('CAREGIVER');
        break;
      case 10:
        setCurrentRole('CAREGIVER');
        break;
      case 11:
        setCurrentRole('CAREGIVER');
        break;
      case 12:
        setCurrentRole('CAREGIVER');
        break;
      default:
        break;
    }
  };

  // ─── AUTH SCREENS ─────────────────────────────────────────────────────────
  // 1. Loading — checking session
  if (appScreen === 'CHECKING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.344.345a3.75 3.75 0 01-5.304 0l-.343-.345z" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm font-medium">Loading Mind Mithra…</p>
        </div>
      </div>
    );
  }

  // 2. Reset password page
  if (appScreen === 'RESET_PWD' && resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onSuccess={() => {
          setResetToken(null);
          window.history.replaceState({}, '', '/');
          setAppScreen('AUTH');
        }}
      />
    );
  }

  // 3. Public Landing Page
  if (appScreen === 'LANDING') {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthError(null);
          setAuthDefaultRole('CAREGIVER');
          setAppScreen('AUTH');
        }}
        onCaregiverPortal={() => {
          setAuthError(null);
          setAuthDefaultRole('CAREGIVER');
          setAppScreen('AUTH');
        }}
        onPatientPortal={() => {
          setAuthError(null);
          setAuthDefaultRole('PATIENT');
          setAppScreen('AUTH');
        }}
        authError={authError}
      />
    );
  }

  // 4. Auth Page (Sign In / Sign Up / Forgot Password)
  if (appScreen === 'AUTH') {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onBack={() => setAppScreen('LANDING')}
        defaultRole={authDefaultRole}
      />
    );
  }

  // 5. Role Selection Page
  if (appScreen === 'ROLE_SELECT' && authUser) {
    return (
      <RoleSelectPage
        user={authUser}
        onSelectPatient={handleEnterPatientMode}
        onSelectCaregiver={handleEnterCaregiverMode}
        onLogout={handleAuthLogout}
      />
    );
  }

  // 6. Render Opening Splash Animation on initial app load
  if (showSplash) {
    return <OpeningSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 7. If somehow not authenticated, fall back to landing
  if (!isAuthenticated) {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthError(null);
          setAuthDefaultRole('CAREGIVER');
          setAppScreen('AUTH');
        }}
        onCaregiverPortal={() => {
          setAuthError(null);
          setAuthDefaultRole('CAREGIVER');
          setAppScreen('AUTH');
        }}
        onPatientPortal={() => {
          setAuthError(null);
          setAuthDefaultRole('PATIENT');
          setAppScreen('AUTH');
        }}
        authError={null}
      />
    );
  }

  const fontSizeClass = 
    settings.fontSize === 'EXTRA_LARGE' 
      ? 'text-lg [&_p]:text-base [&_button]:text-base [&_h1]:text-2xl [&_h2]:text-xl' 
      : settings.fontSize === 'LARGE'
      ? 'text-base [&_p]:text-sm [&_button]:text-sm [&_h1]:text-xl [&_h2]:text-lg'
      : '';

  const contrastClass = settings.highContrast ? 'contrast-125 saturate-110 font-medium' : '';

  return (
    <div className={`min-h-screen bg-[#FAF7F0] text-[#26302A] flex flex-col font-sans selection:bg-amber-200 ${fontSizeClass} ${contrastClass}`}>
      {/* Top Header */}
      <NavigationHeader
        currentRole={currentRole}
        patient={patient}
        currentLang={currentLang}
        onLangChange={(l) => {
          setCurrentLang(l);
          audioService.playFeedbackSound('GENTLE_TAP');
        }}
        networkState={networkState}
        onNetworkChange={(s) => {
          setNetworkState(s);
          if (s === 'ONLINE') {
            handleTriggerSync();
          }
        }}
        pendingSyncCount={pendingSyncCount}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onResetData={handleResetData}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenSafeHaven={() => setIsSafeHavenOpen(true)}
        onOpenMoodCheck={() => setIsMoodCheckOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwitchToCaregiver={handleSwitchToCaregiver}
        onSwitchToPatient={handleSwitchToPatient}
        onLogout={handleLogout}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {/* PATIENT PORTAL VIEWS */}
        {currentRole === 'PATIENT' && (
          <>
            {patientRoute === 'HOME' && (
              <PatientHome
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onOpenVoice={() => setIsVoiceOpen(true)}
                onStartGame={(category, gameDef) => {
                  setActiveGameCategory(category);
                  setSelectedGameDef(gameDef || null);
                  setPatientRoute('GAMES');
                }}
                onOpenMemories={() => setPatientRoute('MEMORIES')}
                onOpenReminders={() => setPatientRoute('REMINDERS')}
                onOpenRelaxation={() => setPatientRoute('RELAX')}
                onOpenRadio={() => setPatientRoute('RADIO')}
                onOpenFamily={() => setPatientRoute('FAMILY_TREE')}
                onOpenBaseline={() => setPatientRoute('BASELINE')}
                onOpenSafeHaven={() => setIsSafeHavenOpen(true)}
                onOpenMoodCheck={() => setIsMoodCheckOpen(true)}
                onOpenSOS={() => setIsSOSOpen(true)}
                onOpenMemoryWeb={() => setPatientRoute('MEMORY_WEB')}
                onOpenElderKnowledge={() => setPatientRoute('ELDER_KNOWLEDGE')}
                onOpenRoutes={() => setPatientRoute('ROUTES')}
                onOpenLifeSkills={() => setPatientRoute('LIFE_SKILLS')}
                onOpenSoundscapes={() => setPatientRoute('SOUNDSCAPES')}
                onOpenDailyJournal={() => setPatientRoute('DAILY_JOURNAL')}
                onOpenStoryBuilder={() => setPatientRoute('STORY_BUILDER')}
                onOpenReminiscenceTheater={() => setPatientRoute('REMINISCENCE_THEATER')}
                onOpenMemoryQuiz={() => setIsMemoryQuizOpen(true)}
                onOpenMemoryCapsules={() => setPatientRoute('MEMORY_CAPSULES')}
                onOpenMemoryChain={() => setPatientRoute('MEMORY_CHAINS')}
                onOpenConfidenceMap={() => setIsConfidenceMapOpen(true)}
                onOpenTodaysWhy={() => setIsTodaysWhyOpen(true)}
                onOpenMenu={() => setIsMenuOpen(true)}
                onOpenGamesCatalog={() => setIsGamesCatalogOpen(true)}
              />
            )}

            {patientRoute === 'MEMORY_WEB' && (
              <MemoryWebView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onSelectNodeForStory={() => setPatientRoute('STORY_BUILDER')}
              />
            )}

            {patientRoute === 'ELDER_KNOWLEDGE' && (
              <ElderKnowledgeView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'ROUTES' && (
              <FamiliarRouteView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'LIFE_SKILLS' && (
              <LifeSkillSimulatorView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'SOUNDSCAPES' && (
              <PersonalSoundscapeView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'DAILY_JOURNAL' && (
              <DailyJournalView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'STORY_BUILDER' && (
              <StoryBuilderView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'REMINISCENCE_THEATER' && (
              <ReminiscenceTheaterView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'MEMORY_CAPSULES' && (
              <MemoryCapsulesView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'MEMORY_CHAINS' && (
              <MemoryChainView
                patientId={patient.id}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'RADIO' && (
              <ReminiscenceRadioView
                onBack={() => setPatientRoute('HOME')}
                patientName={patient.name.split(' ')[0]}
              />
            )}

            {patientRoute === 'FAMILY_TREE' && (
              <FamilyTreeView
                patient={patient}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
              />
            )}

            {patientRoute === 'FAMILY' && (
              <FamilyAudioView
                onBack={() => setPatientRoute('HOME')}
                patientName={patient.name.split(' ')[0]}
              />
            )}

            {/* 30 COGNITIVE RECOVERY GAMES ROUTER */}
            {patientRoute === 'GAMES' && selectedGameDef && (
              <CognitiveGameHub
                game={selectedGameDef}
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => {
                  setSelectedGameDef(null);
                  setPatientRoute('HOME');
                }}
                onGoToMemories={() => {
                  setSelectedGameDef(null);
                  setPatientRoute('MEMORIES');
                }}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'MEMORY' && (
              <MemoryMatchGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'ATTENTION' && (
              <AttentionFinderGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'PATTERN' && (
              <PatternSequenceGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'ROUTINE' && (
              <RoutineSequencerGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'LANGUAGE' && (
              <WordRecallGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'SPATIAL' && (
              <ObjectCategorySortGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'STORY' && (
              <StoryRecallGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'PUZZLE' && (
              <VisuospatialPuzzleGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'MOTOR' && (
              <MotorCoordinationGame
                patient={patient}
                instructions={instructions}
                language={currentLang}
                onBack={() => setPatientRoute('HOME')}
                onGoToMemories={() => setPatientRoute('MEMORIES')}
              />
            )}

            {(patientRoute === 'RELAX' || (patientRoute === 'GAMES' && !selectedGameDef && activeGameCategory === 'RELAX')) && (
              <RelaxationMusicGame
                onBack={() => setPatientRoute('HOME')}
                patientName={patient.name.split(' ')[0]}
              />
            )}

            {patientRoute === 'MEMORIES' && (
              <MemoryVaultView
                onBack={() => setPatientRoute('HOME')}
                language={currentLang}
                patientName={patient.name.split(' ')[0]}
                networkState={networkState}
              />
            )}

            {patientRoute === 'REMINDERS' && (
              <RemindersView
                onBack={() => setPatientRoute('HOME')}
                language={currentLang}
                patientName={patient.name.split(' ')[0]}
              />
            )}

            {patientRoute === 'BASELINE' && (
              <BaselineAssessment
                language={currentLang}
                patientName={patient.name.split(' ')[0]}
                onComplete={() => {
                  refreshState();
                  setPatientRoute('HOME');
                }}
                onCancel={() => setPatientRoute('HOME')}
              />
            )}
          </>
        )}

        {/* CAREGIVER & CLINICAL PORTAL */}
        {(currentRole === 'CAREGIVER' || currentRole === 'HEALTHCARE_WORKER') && (
          <CaregiverDashboard
            currentRole={currentRole}
            networkState={networkState}
            onTriggerSync={handleTriggerSync}
            pendingSyncCount={pendingSyncCount}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation for Patient Companion */}
      {currentRole === 'PATIENT' && (
        <MobileBottomNav
          currentRoute={patientRoute}
          onRouteChange={(route) => {
            setSelectedGameDef(null);
            setPatientRoute(route);
          }}
          language={currentLang}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      )}

      {/* Voice Assistant Modal with Turn-Taking & Multilingual Dialects */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        patientName={patient.name.split(' ')[0]}
        language={currentLang}
        networkState={networkState}
        onNavigate={(route) => {
          setSelectedGameDef(null);
          setPatientRoute(route);
          setIsVoiceOpen(false);
        }}
      />

      {/* Camera AI Mood & Expression Check Modal */}
      <CameraMoodCheckModal
        isOpen={isMoodCheckOpen}
        onClose={() => setIsMoodCheckOpen(false)}
        patientName={patient.name.split(' ')[0]}
        language={currentLang}
        onMoodDetected={(moodLog) => {
          setActiveMoodLog(moodLog);
          refreshState();
        }}
        onStartRelaxation={() => {
          setIsMoodCheckOpen(false);
          setSelectedGameDef(null);
          setPatientRoute('RELAX');
        }}
        onOpenRadio={() => {
          setIsMoodCheckOpen(false);
          setSelectedGameDef(null);
          setPatientRoute('RADIO');
        }}
      />

      {/* App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
        }}
        onResetData={handleResetData}
        currentLang={currentLang}
        onLangChange={(l) => {
          setCurrentLang(l);
          audioService.playFeedbackSound('GENTLE_TAP');
        }}
      />

      {/* Safe Haven SOS Reassurance Modal */}
      <SafeHavenReassuranceModal
        isOpen={isSafeHavenOpen}
        onClose={() => setIsSafeHavenOpen(false)}
        patient={patient}
        language={currentLang}
      />

      {/* 1-Tap Emergency SOS Alert Modal */}
      <SOSAlertModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        patient={patient}
        language={currentLang}
      />

      {/* Mind Mithra Reference Feature Modals */}
      <MemoryGameGeneratorModal
        patientId={patient.id}
        isOpen={isMemoryQuizOpen}
        onClose={() => setIsMemoryQuizOpen(false)}
        language={currentLang}
      />

      <ConfidenceMapModal
        patientId={patient.id}
        isOpen={isConfidenceMapOpen}
        onClose={() => setIsConfidenceMapOpen(false)}
        language={currentLang}
      />

      <TodaysWhyModal
        patientId={patient.id}
        isOpen={isTodaysWhyOpen}
        onClose={() => setIsTodaysWhyOpen(false)}
        language={currentLang}
      />

      {/* ☰ Categorized Main Menu Drawer */}
      <MainMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        patient={patient}
        currentLang={currentLang}
        onOpenMemories={() => {
          setSelectedGameDef(null);
          setPatientRoute('MEMORIES');
        }}
        onOpenFamily={() => {
          setSelectedGameDef(null);
          setPatientRoute('FAMILY_TREE');
        }}
        onOpenDailyJournal={() => {
          setSelectedGameDef(null);
          setPatientRoute('DAILY_JOURNAL');
        }}
        onOpenRadio={() => {
          setSelectedGameDef(null);
          setPatientRoute('RADIO');
        }}
        onOpenSoundscapes={() => {
          setSelectedGameDef(null);
          setPatientRoute('SOUNDSCAPES');
        }}
        onOpenStoryBuilder={() => {
          setSelectedGameDef(null);
          setPatientRoute('STORY_BUILDER');
        }}
        onOpenReminiscenceTheater={() => {
          setSelectedGameDef(null);
          setPatientRoute('REMINISCENCE_THEATER');
        }}
        onOpenMemoryWeb={() => {
          setSelectedGameDef(null);
          setPatientRoute('MEMORY_WEB');
        }}
        onOpenGames={() => {
          setSelectedGameDef(null);
          setActiveGameCategory('MEMORY');
          setPatientRoute('GAMES');
        }}
        onOpenMemoryCapsules={() => {
          setSelectedGameDef(null);
          setPatientRoute('MEMORY_CAPSULES');
        }}
        onOpenMemoryChain={() => {
          setSelectedGameDef(null);
          setPatientRoute('MEMORY_CHAINS');
        }}
        onOpenLifeSkills={() => {
          setSelectedGameDef(null);
          setPatientRoute('LIFE_SKILLS');
        }}
        onOpenRoutes={() => {
          setSelectedGameDef(null);
          setPatientRoute('ROUTES');
        }}
        onOpenElderKnowledge={() => {
          setSelectedGameDef(null);
          setPatientRoute('ELDER_KNOWLEDGE');
        }}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenReminders={() => {
          setSelectedGameDef(null);
          setPatientRoute('REMINDERS');
        }}
        onOpenConfidenceMap={() => setIsConfidenceMapOpen(true)}
        onOpenTodaysWhy={() => setIsTodaysWhyOpen(true)}
        onOpenMoodCheck={() => setIsMoodCheckOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSafeHaven={() => setIsSafeHavenOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenCaregiverPin={() => handleSwitchToCaregiver('CAREGIVER')}
        onOpenGamesCatalog={() => setIsGamesCatalogOpen(true)}
      />

      {/* Senior & Dementia-Friendly Accessible Calculator Modal */}
      <AccessibleCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* 30 Cognitive Activities & Games Catalog Modal */}
      <AllGamesCatalogModal
        isOpen={isGamesCatalogOpen}
        onClose={() => setIsGamesCatalogOpen(false)}
        currentDifficultyLevel={patient.currentDifficultyLevel || 2}
        onSelectGame={(gameDef) => {
          setIsGamesCatalogOpen(false);
          setSelectedGameDef(gameDef);
          setActiveGameCategory(gameDef.category);
          setPatientRoute('GAMES');
        }}
      />

      {/* 12-Step Demo Walkthrough Guide */}
      {isDemoGuideOpen && (
        <DemoWalkthroughBar
          currentStep={demoStep}
          onSetStep={(s) => setDemoStep(s)}
          onExecuteStepAction={handleExecuteDemoStep}
          onClose={() => setIsDemoGuideOpen(false)}
        />
      )}
    </div>
  );
}
