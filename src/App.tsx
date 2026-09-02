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
import { localDB } from './lib/storage';
import { audioService } from './lib/audioService';
import { OpeningSplashScreen } from './components/AuthPortal/OpeningSplashScreen';
import { LoginPortal } from './components/AuthPortal/LoginPortal';
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

export type PatientRoute =
  | 'HOME'
  | 'GAMES'
  | 'MEMORIES'
  | 'REMINDERS'
  | 'RELAX'
  | 'RADIO'
  | 'FAMILY'
  | 'FAMILY_TREE'
  | 'BASELINE';

export default function App() {
  // Opening Splash Screen State - disabled so patient opens immediately
  const [showSplash, setShowSplash] = useState<boolean>(false);

  // App Settings (Font size, auto-mood, contrast, audio)
  const [settings, setSettings] = useState<AppSettings>(() => localDB.getAppSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  // Face & Mood Check modal opens immediately on app launch
  const [isMoodCheckOpen, setIsMoodCheckOpen] = useState<boolean>(true);
  const [activeMoodLog, setActiveMoodLog] = useState<PatientMoodLog | null>(null);

  // Session Authentication State - Default to authenticated Patient directly on open
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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

  // 1. Render Opening Splash Animation on initial app load
  if (showSplash) {
    return <OpeningSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. If not authenticated, render Login Portal with Language Selection Flow
  if (!isAuthenticated) {
    return (
      <LoginPortal
        onPatientLogin={handlePatientLogin}
        onCaregiverLogin={handleCaregiverLogin}
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
    <div className={`min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200 ${fontSizeClass} ${contrastClass}`}>
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
