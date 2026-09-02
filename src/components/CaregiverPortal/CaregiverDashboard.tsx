import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  PatientProfile, 
  GameSessionResult, 
  AIObservation, 
  ReminderItem, 
  CaregiverInstruction,
  CaregiverAlert,
  MedicalReportRecord
} from '../../types';
import { localDB } from '../../lib/storage';
import { AICaregiverCopilot } from './AICaregiverCopilot';
import { CaregiverInstructionForm } from './CaregiverInstructionForm';
import { CaregiverMemoryManager } from './CaregiverMemoryManager';
import { ClinicalReportModal } from './ClinicalReportModal';
import { CaregiverMedicalReportUpload } from './CaregiverMedicalReportUpload';
import { RegisterPatientModal } from './RegisterPatientModal';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  Brain, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Heart, 
  MessageSquare, 
  Pill, 
  Sliders, 
  Sparkles, 
  ShieldAlert, 
  Stethoscope, 
  Users, 
  AlertTriangle, 
  Layers, 
  FileText, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Bell,
  Droplets,
  Plus,
  MapPin,
  Check,
  Volume2,
  VolumeX,
  UserPlus
} from 'lucide-react';
import { audioService } from '../../lib/audioService';

interface CaregiverDashboardProps {
  currentRole: UserRole;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
  onTriggerSync: () => void;
  pendingSyncCount: number;
}

type CaregiverTab =
  | 'OVERVIEW'
  | 'ALERTS'
  | 'AI_OBSERVATIONS'
  | 'COPILOT'
  | 'INSTRUCTIONS'
  | 'MEMORIES'
  | 'REMINDERS'
  | 'TIMELINE'
  | 'MEDICAL_PROFILE'
  | 'HUMAN_REVIEW';

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  currentRole,
  networkState,
  onTriggerSync,
  pendingSyncCount,
}) => {
  const [activeTab, setActiveTab] = useState<CaregiverTab>('OVERVIEW');
  const [patientRegistry, setPatientRegistry] = useState<PatientProfile[]>(() => localDB.getPatientRegistry());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => localDB.getActivePatientId());
  const [patient, setPatient] = useState<PatientProfile>(() => localDB.getPatientProfile());
  const [sessions, setSessions] = useState<GameSessionResult[]>(() => localDB.getGameSessions(localDB.getActivePatientId()));
  const [observations, setObservations] = useState<AIObservation[]>(() => localDB.getObservations());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => localDB.getReminders());
  const [instructions, setInstructions] = useState<CaregiverInstruction[]>(() => localDB.getCaregiverInstructions());
  const [alerts, setAlerts] = useState<CaregiverAlert[]>(() => localDB.getCaregiverAlerts());
  const [medicalReports, setMedicalReports] = useState<MedicalReportRecord[]>(() => localDB.getMedicalReports());
  const [syncTimeline, setSyncTimeline] = useState<any[]>(() => localDB.getSyncQueue());
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isPrescriptionUploadOpen, setIsPrescriptionUploadOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReportRecord | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);

  // Refresh State
  const refreshAll = () => {
    const registry = localDB.getPatientRegistry();
    setPatientRegistry(registry);
    const active = localDB.getPatientById(selectedPatientId) || localDB.getPatientProfile();
    setPatient(active);
    setSessions(localDB.getGameSessions(active.id));
    setObservations(localDB.getObservations());
    setReminders(localDB.getReminders());
    setInstructions(localDB.getCaregiverInstructions());
    setAlerts(localDB.getCaregiverAlerts());
    setMedicalReports(localDB.getMedicalReports());
    setSyncTimeline(localDB.getSyncQueue());
  };

  const handleSelectPatient = (p: PatientProfile) => {
    setSelectedPatientId(p.id);
    setPatient(p);
    localDB.setActivePatientId(p.id);
    setSessions(localDB.getGameSessions(p.id));
    setAlerts(localDB.getCaregiverAlerts(p.id));
    setMedicalReports(localDB.getMedicalReports(p.id));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    localDB.acknowledgeCaregiverAlert(alertId, 'Primary Caregiver');
    setAlerts(localDB.getCaregiverAlerts());
    audioService.stopCaregiverEmergencySiren();
    setIsSirenActive(false);
    audioService.playFeedbackSound('SUCCESS');
  };

  const handleToggleSiren = () => {
    if (isSirenActive) {
      audioService.stopCaregiverEmergencySiren();
      setIsSirenActive(false);
    } else {
      audioService.playCaregiverEmergencySiren(10);
      setIsSirenActive(true);
    }
  };

  const handleApplyReport = (reportId: string) => {
    const res = localDB.applyMedicalReportToPatient(reportId);
    if (res.success) {
      audioService.playFeedbackSound('SUCCESS');
      refreshAll();
    }
  };

  // Distinct Patient Cognitive Trend Generation
  const getPatientTrendData = (p: PatientProfile, sess: GameSessionResult[]) => {
    // Distinct baseline based on patient properties
    const baseOffset = p.id === 'patient-maya-002' ? 6 : p.id === 'patient-anjali-003' ? -4 : 0;
    const baseLatency = p.id === 'patient-maya-002' ? 2.3 : p.id === 'patient-anjali-003' ? 3.4 : 2.8;

    return [
      { day: 'Mon', memory: 74 + baseOffset, attention: 78 + baseOffset, pattern: 80 + baseOffset, latency: baseLatency + 0.4 },
      { day: 'Tue', memory: 77 + baseOffset, attention: 81 + baseOffset, pattern: 83 + baseOffset, latency: baseLatency + 0.2 },
      { day: 'Wed', memory: 71 + baseOffset, attention: 76 + baseOffset, pattern: 79 + baseOffset, latency: baseLatency + 0.8 },
      { day: 'Thu', memory: 80 + baseOffset, attention: 84 + baseOffset, pattern: 86 + baseOffset, latency: baseLatency - 0.1 },
      { day: 'Fri', memory: 79 + baseOffset, attention: 82 + baseOffset, pattern: 85 + baseOffset, latency: baseLatency },
      { day: 'Sat', memory: 83 + baseOffset, attention: 86 + baseOffset, pattern: 88 + baseOffset, latency: baseLatency - 0.2 },
      { day: 'Sun (Today)', memory: 82 + baseOffset, attention: 88 + baseOffset, pattern: 87 + baseOffset, latency: baseLatency },
    ];
  };

  const trendData = getPatientTrendData(patient, sessions);

  const adherenceData = [
    { name: 'Morning Pills', adherence: patient.id === 'patient-maya-002' ? 98 : 94 },
    { name: 'Noon Hydration', adherence: patient.id === 'patient-maya-002' ? 90 : 86 },
    { name: 'Evening Routine', adherence: patient.id === 'patient-maya-002' ? 94 : 90 },
  ];

  // Human In The Loop Recommendation Item State
  const [hitlRecommendations, setHitlRecommendations] = useState([
    {
      id: 'rec-1',
      title: 'Shift Memory Challenges to Morning Hours',
      rationale: 'Patient response speed is 28% faster between 9:00 AM – 11:30 AM compared to afternoon sessions.',
      proposedAction: 'Schedule Level 3 Heritage Memory game before 11:00 AM.',
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED',
    },
    {
      id: 'rec-2',
      title: 'Introduce Calming Bamboo Flute at 6:00 PM',
      rationale: 'Late afternoon sessions showed mild restlessness; gentle acoustic stimulation promotes evening relaxation.',
      proposedAction: 'Auto-suggest Relaxation & Breathing module at sunset.',
      status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED',
    },
  ]);

  const handleHitlAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setHitlRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* 0. HIGH-PRIORITY CAREGIVER ALERTS BANNER (SOS & Sundowning) */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-5 shadow-lg space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl animate-pulse shadow-md">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-rose-600 text-white tracking-wider">
                    Immediate Attention Required
                  </span>
                  <span className="text-xs font-bold text-rose-800">
                    {unacknowledgedAlerts.length} Active Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-rose-950 mt-0.5">
                  Emergency & Behavioral Telemetry Notifications
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {unacknowledgedAlerts.map((alt) => (
              <div
                key={alt.id}
                className="bg-white rounded-2xl border border-rose-300 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-stone-900 text-sm">{alt.patientName}</span>
                    <span className="text-xs text-stone-500">({alt.patientRelation || 'Patient'})</span>
                    <span className="text-xs text-stone-400">• {new Date(alt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-semibold text-rose-900">{alt.message}</p>
                  {alt.location && (
                    <p className="text-xs text-stone-500 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {alt.location}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAcknowledgeAlert(alt.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acknowledge Alert</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Patient Selector & Overview Strip */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 border border-stone-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Registered Patients ({patientRegistry.length})
            </h2>
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              • Click any elder to view distinct cognitive telemetry & records
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSiren}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSirenActive
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
              title="Test or control loud caregiver alert sound"
            >
              {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSirenActive ? 'Silence Siren Sound' : 'Test Alert Sound'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterModalOpen(true);
                audioService.playFeedbackSound('GENTLE_TAP');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          </div>
        </div>

        {/* Horizontal Patient Chip Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {patientRegistry.map((p) => {
            const isSelected = p.id === patient.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPatient(p)}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-teal-700/40 border-teal-400 shadow-md ring-2 ring-teal-400/50'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-800 text-stone-300'
                }`}
              >
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-teal-300/30 shrink-0"
                />
                <div className="overflow-hidden min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-extrabold text-sm truncate text-white">{p.name}</p>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-400 truncate">
                    {p.age} yrs • {p.region.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-teal-300 font-semibold mt-0.5">
                    Level {p.currentDifficultyLevel} • Fatigue: {p.fatigueScore}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Patient Profile Summary Banner */}
      <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={patient.avatarUrl}
            alt={patient.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600 shadow-xs shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {patient.name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold border border-teal-200">
                Patient ID: {patient.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-200">
                Status: Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Age {patient.age} • {patient.region} • Caregiver: <strong>{patient.caregiverName}</strong> ({patient.caregiverContact})
            </p>
          </div>
        </div>

        {/* Quick Sync & Report Modals */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsPrescriptionUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Scan Medical Report (AI)</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-teal-200" />
            <span>1-Click Clinical PDF</span>
          </button>

          <a
            href="/api/download-report"
            download="Mind_Mithra_Project_Report_and_Technical_Stack.docx"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Download complete Project Documentation & Tech Stack Architecture in DOCX format"
          >
            <FileText className="w-4 h-4 text-amber-200" />
            <span>Tech Report (.DOCX)</span>
          </a>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-stone-400 uppercase block">Local Queue</span>
            <span className="text-xs font-extrabold text-stone-800">
              {pendingSyncCount === 0 ? 'All Events Synced' : `${pendingSyncCount} Pending Sync`}
            </span>
          </div>
          <button
            onClick={onTriggerSync}
            disabled={networkState === 'OFFLINE'}
            className="p-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
            title="Force Sync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Cognitive Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all relative ${
            activeTab === 'ALERTS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Caregiver Alerts ({alerts.length})</span>
          {unacknowledgedAlerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('MEDICAL_PROFILE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'MEDICAL_PROFILE'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Medical Reports ({medicalReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AI_OBSERVATIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'AI_OBSERVATIONS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>AI Observations</span>
        </button>

        <button
          onClick={() => setActiveTab('COPILOT')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'COPILOT'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('INSTRUCTIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'INSTRUCTIONS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Caregiver Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('MEMORIES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'MEMORIES'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Memory Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('REMINDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'REMINDERS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Routine & Alarms</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'TIMELINE'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Patient Activity Stream</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DISTINCT COGNITIVE TRENDS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Row for Selected Patient */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Cognitive Stability</span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">
                {patient.id === 'patient-maya-002' ? '88%' : patient.id === 'patient-anjali-003' ? '79%' : '84%'}
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                Calibrated for {patient.name.split(' ')[0]}
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Reminder Adherence</span>
              <p className="text-3xl font-extrabold text-teal-800 mt-1">
                {patient.id === 'patient-maya-002' ? '96%' : '91%'}
              </p>
              <span className="text-[11px] font-semibold text-stone-500 mt-1 block">
                Morning medications on track
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Average Latency</span>
              <p className="text-3xl font-extrabold text-stone-900 mt-1">
                {patient.id === 'patient-maya-002' ? '2.3s' : patient.id === 'patient-anjali-003' ? '3.4s' : '2.8s'}
              </p>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                Steady response cadence
              </span>
            </div>

            <div className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-400 uppercase">Active AI Difficulty</span>
              <p className="text-3xl font-extrabold text-amber-700 mt-1">Level {patient.currentDifficultyLevel} / 5</p>
              <span className="text-[11px] font-semibold text-stone-500 mt-1 block">
                Fatigue Index: {patient.fatigueScore}%
              </span>
            </div>
          </div>

          {/* Daily AI Telemetry Summary Card */}
          <div className="p-6 bg-teal-900 text-white rounded-3xl shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-extrabold text-lg">Daily Telemetry Summary for {patient.name}</h3>
            </div>
            <p className="text-sm sm:text-base text-teal-100 leading-relaxed max-w-4xl">
              "{patient.name} completed cognitive sessions today with active engagement. Visual recognition on cultural themes remained consistently strong. Morning medication reminders were promptly logged. Rest periods were auto-scheduled at dusk to prevent evening confusion."
            </p>
            <div className="mt-4 pt-3 border-t border-teal-700/60 flex flex-wrap items-center justify-between text-xs text-teal-200 gap-2">
              <span>Telemetry synced from offline database</span>
              <span className="bg-teal-800 px-3 py-1 rounded-full font-bold">
                Personalized Caregiver Feed
              </span>
            </div>
          </div>

          {/* 7-Day Performance Trends Chart */}
          <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  7-Day Cognitive Domain Accuracy for {patient.name} (%)
                </h3>
                <p className="text-xs text-stone-500">
                  Tracking Memory Recall, Visual Attention, and Pattern Sequencing accuracy over daily sessions
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    name="Memory Recall (%)"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attention"
                    name="Visual Attention (%)"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pattern"
                    name="Pattern Weave (%)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adherence & Response Speed Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <h3 className="text-base font-extrabold text-stone-900 mb-1">
                Routine & Medication Adherence (%)
              </h3>
              <p className="text-xs text-stone-500 mb-4">Timely acknowledgment of care reminders</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adherenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="adherence" fill="#0d9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
              <h3 className="text-base font-extrabold text-stone-900 mb-1">
                Response Latency Trend (Seconds)
              </h3>
              <p className="text-xs text-stone-500 mb-4">Average response speed per session</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[1, 5]} stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="latency"
                      name="Response Time (s)"
                      stroke="#e11d48"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CAREGIVER ALERTS */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-stone-900">
                Caregiver Emergency & Behavioral Alerts ({alerts.length})
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Real-time notifications for 1-Tap SOS requests, sundowning disorientation, and facial mood distress.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
              {unacknowledgedAlerts.length} Unacknowledged
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-6 rounded-3xl border-2 transition-all ${
                  !alt.acknowledged
                    ? 'bg-rose-50 border-rose-400 shadow-md'
                    : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          alt.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : alt.severity === 'WARNING'
                            ? 'bg-amber-500 text-white'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {alt.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-stone-700">
                        {alt.patientName} ({alt.patientRelation || 'Family'})
                      </span>
                      <span className="text-xs text-stone-400">
                        • {new Date(alt.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900">{alt.message}</h4>

                    {alt.location && (
                      <p className="text-xs text-stone-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-stone-400" />
                        {alt.location}
                      </p>
                    )}
                  </div>

                  {!alt.acknowledged ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alt.id)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow transition shrink-0 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge Alert</span>
                    </button>
                  ) : (
                    <div className="text-right text-xs text-emerald-800 font-semibold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                      <p className="flex items-center justify-end">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Acknowledged
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">by {alt.acknowledgedBy}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MEDICAL REPORTS (CLINICAL NEURO EVALUATION & ANALYSIS) */}
      {activeTab === 'MEDICAL_PROFILE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-teal-800" />
                <h3 className="text-xl font-extrabold text-stone-900">
                  Clinical Neuropsychological Reports & Prescriptions
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Detailed clinical evaluations, MMSE/MoCA scores, neurologist diagnoses, and structured medication regimens.
              </p>
            </div>

            <button
              onClick={() => setIsPrescriptionUploadOpen(true)}
              className="flex items-center space-x-2 px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Upload / Scan New Report</span>
            </button>
          </div>

          <div className="space-y-6">
            {medicalReports.map((rep) => {
              const ext = rep.extraction;
              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-3xl border-2 border-teal-200 p-6 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
                          {rep.hospitalName}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          Evaluated on: {rep.dateEvaluated}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-stone-900 mt-1">{rep.reportTitle}</h4>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        Consultant: <strong>{rep.doctorName}</strong> • Patient: <strong>{ext.patientName} (Age {ext.age})</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {rep.mmseScore && (
                        <div className="bg-amber-50 border border-amber-300 px-4 py-2 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-amber-800">MMSE Score</p>
                          <p className="text-xl font-black text-amber-900">{rep.mmseScore} / 30</p>
                        </div>
                      )}
                      {rep.mocaScore && (
                        <div className="bg-teal-50 border border-teal-300 px-4 py-2 rounded-2xl text-center">
                          <p className="text-[10px] uppercase font-bold text-teal-800">MoCA Score</p>
                          <p className="text-xl font-black text-teal-900">{rep.mocaScore} / 30</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnoses & Clinical Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                      <p className="text-xs uppercase font-bold text-stone-500 mb-2">Clinical Diagnoses</p>
                      <ul className="space-y-1 text-sm font-semibold text-stone-800">
                        {ext.diagnoses.map((diag, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-teal-700 font-bold">•</span>
                            <span>{diag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                      <p className="text-xs uppercase font-bold text-stone-500 mb-2">Recommended Cognitive Domains</p>
                      <div className="flex flex-wrap gap-2">
                        {ext.recommendedCognitiveDomains.map((dom, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white border border-stone-300 rounded-xl text-xs font-bold text-teal-900 shadow-xs"
                          >
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Medications & Instruction Schedule */}
                  <div>
                    <h5 className="text-sm font-extrabold text-stone-900 mb-3 flex items-center space-x-2">
                      <Pill className="w-4 h-4 text-rose-600" />
                      <span>Prescribed Medication Schedule ({ext.medications.length} Prescriptions)</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ext.medications.map((med, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-stone-900 text-sm">{med.name}</span>
                            <span className="px-2 py-0.5 rounded-md text-xs font-black bg-rose-100 text-rose-900">
                              {med.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 font-bold mt-1">Timing: {med.timing}</p>
                          <p className="text-xs text-stone-600 mt-1">{med.instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Care Routine & Precautions */}
                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950 space-y-2">
                    <p className="font-bold text-teal-900">Clinical Routine Summary:</p>
                    <p>{ext.dailyRoutineSummary}</p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-400">
                      AI Confidence: {Math.round(ext.confidenceScore * 100)}%
                    </span>

                    {!rep.isApplied ? (
                      <button
                        onClick={() => handleApplyReport(rep.id)}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Apply to Patient Care Routine
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Active in Patient Reminders</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: AI OBSERVATIONS & EXPLAINABILITY */}
      {activeTab === 'AI_OBSERVATIONS' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong>Mandated Clinical Safety Notice:</strong> AI observations represent behavioral engagement, response latencies, and interaction consistency. They are provided solely for caregiver situational awareness and must never be treated as clinical medical diagnoses.
            </div>
          </div>

          <div className="space-y-4">
            {observations.map((obs) => {
              const categoryLabel = (obs.category || (obs as any).observationType || 'TELEMETRY').replace(/_/g, ' ');
              const dateStr = obs.timestamp 
                ? new Date(obs.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : (obs as any).date || 'Today';
              const titleStr = obs.title || (obs as any).summary || 'Behavioral Observation';
              const detailsStr = obs.observation || (obs as any).details || '';
              const reasonStr = obs.explainabilityReason || (obs as any).rationale || '';
              const actionStr = (obs as any).recommendedCaregiverAction;

              return (
                <div
                  key={obs.id}
                  className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
                        {categoryLabel}
                      </span>
                      <span className="text-xs text-stone-400">{dateStr}</span>
                    </div>

                    <span className="text-xs font-bold text-stone-500">
                      Confidence: {Math.round((obs.confidenceScore ?? 0.85) * 100)}%
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-stone-900">
                    {titleStr}
                  </h4>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                    {detailsStr && (
                      <div>
                        <span className="font-bold text-stone-700">Detailed Telemetry: </span>
                        <span className="text-stone-600">{detailsStr}</span>
                      </div>
                    )}
                    {reasonStr && (
                      <div>
                        <span className="font-bold text-teal-800">Explainable Rationale: </span>
                        <span className="text-stone-700">{reasonStr}</span>
                      </div>
                    )}
                    {obs.metricsComparison && (
                      <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2 py-0.5 bg-white border border-stone-300 rounded font-semibold text-stone-700">
                          {obs.metricsComparison.metricName}: {obs.metricsComparison.recentValue} (vs {obs.metricsComparison.baselineValue})
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-bold">
                          {obs.metricsComparison.deviation}
                        </span>
                      </div>
                    )}
                  </div>

                  {actionStr && (
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-900 bg-teal-50 p-3 rounded-xl border border-teal-200">
                      <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Recommendation: {actionStr}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: AI COPILOT */}
      {activeTab === 'COPILOT' && (
        <AICaregiverCopilot patientId={patient.id} networkState={networkState} />
      )}

      {/* TAB: INSTRUCTIONS OVERLAY */}
      {activeTab === 'INSTRUCTIONS' && (
        <CaregiverInstructionForm
          networkState={networkState}
          onInstructionSaved={refreshAll}
        />
      )}

      {/* TAB: MEMORIES MANAGER */}
      {activeTab === 'MEMORIES' && (
        <CaregiverMemoryManager
          networkState={networkState}
          onMemoryUpdated={refreshAll}
        />
      )}

      {/* TAB: ROUTINE & ALARMS MANAGER */}
      {activeTab === 'REMINDERS' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Patient Daily Routine & Timed Care Schedule ({reminders.length} Steps)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                24-hour structured cueing schedule for {patient.name}. Tracks medication, hydration, sundowning music, and rest.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                {reminders.filter(r => r.status === 'ACKNOWLEDGED').length} / {reminders.length} Completed Today
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => {
              const isDone = rem.status === 'ACKNOWLEDGED';
              return (
                <div
                  key={rem.id}
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-white border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{rem.scheduledTime}</span>
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {rem.timeOfDay}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isDone ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-stone-900">{rem.title}</h4>
                  <p className="text-xs font-bold text-stone-600 mt-1">
                    {rem.dosageOrInstruction || 'Scheduled dementia care item'}
                  </p>

                  {rem.voicePromptText && (
                    <p className="text-[11px] text-stone-500 italic mt-2 bg-stone-50 p-2 rounded-xl border border-stone-100">
                      Spoken prompt: "{rem.voicePromptText}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs font-semibold">
                    <span className="text-stone-500">
                      Type: <strong className="text-stone-800">{rem.type}</strong>
                    </span>

                    {isDone ? (
                      <span className="text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified by Patient</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold">Awaiting Scheduled Time</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PATIENT ACTIVITY TIMELINE (REAL-TIME CAREGIVER MONITORING) */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-stone-900">
                Live Patient Activity & Telemetry Stream for {patient.name}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Real-time monitoring feed tracking cognitive game sessions, mood camera checks, voice interactions, and SOS events.
              </p>
            </div>
            <span className="px-3 py-1 bg-teal-100 text-teal-900 text-xs font-bold rounded-full">
              Live Monitoring Active
            </span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-xs">
            <div className="space-y-4">
              {sessions.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 pb-4 border-b border-stone-100 last:border-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                    🧠
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                        Completed {s.gameId} ({s.category})
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Score: <strong>{s.score}%</strong> • Accuracy: <strong>{s.accuracyPercent}%</strong> • Response Speed: <strong>{(s.avgResponseTimeMs / 1000).toFixed(1)}s</strong> • Level {s.difficulty}
                    </p>
                    {s.feedbackText && (
                      <p className="text-[11px] text-stone-500 italic mt-0.5">
                        "{s.feedbackText}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Clinical Summary & Export Modal */}
      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        patient={patient}
        observations={observations}
        sessions={sessions}
      />

      {/* AI Medical Report & Prescription Upload Modal */}
      <CaregiverMedicalReportUpload
        isOpen={isPrescriptionUploadOpen}
        onClose={() => setIsPrescriptionUploadOpen(false)}
        patientName={patient.name}
        onReportApplied={() => {
          refreshAll();
        }}
      />

      {/* New Patient Registration Modal (Exclusive to Caregiver Dashboard) */}
      <RegisterPatientModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onPatientRegistered={(newP) => {
          refreshAll();
          handleSelectPatient(newP);
        }}
      />
    </div>
  );
};
