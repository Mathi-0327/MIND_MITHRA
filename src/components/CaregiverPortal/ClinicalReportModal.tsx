import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Calendar, 
  X 
} from 'lucide-react';
import { PatientProfile, AIObservation, GameSessionResult } from '../../types';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  observations: AIObservation[];
  sessions: GameSessionResult[];
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  observations,
  sessions,
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
CLINICAL COGNITIVE TELEMETRY & PROGRESS REPORT (MIND MITHRA)
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Patient Name: ${patient.name} (Age: ${patient.age}) | ID: ${patient.id}
Location: ${patient.location}
Primary Caregiver: ${patient.primaryCaregiverName} (${patient.caregiverRelationship})

1. COGNITIVE DOMAIN PERFORMANCE (7-DAY MEAN):
- Memory Domain Accuracy: 82%
- Visual Attention Accuracy: 88%
- Pattern Sequence Accuracy: 88%
- Mean Response Latency: 2.8s (Baseline: 3.2s)
- Current Adaptive Difficulty: Level ${patient.currentDifficultyLevel} / 5

2. ADHERENCE TELEMETRY:
- Overall Routine & Medication Adherence: 91%
- Morning Medication Acknowledgment: 96%
- Hydration & Evening Routine: 90%

3. AI BEHAVIORAL OBSERVATIONS (NON-DIAGNOSTIC):
${observations.slice(0, 3).map((o, idx) => `${idx + 1}. [${o.category}] ${o.title || o.observation} (Confidence: ${Math.round((o.confidenceScore || 0.85) * 100)}%)`).join('\n')}

4. CLINICAL SIGN-OFF:
Attending Physician: Dr. B. Barua, MD (Tezpur Civil Hospital)
Stage: Mild Cognitive Impairment (MCI)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border-2 border-stone-200 my-8 max-h-[90vh] flex flex-col justify-between">
        {/* Modal Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                1-Click Clinical Summary & Export
              </h3>
              <p className="text-xs text-stone-500">
                Formatted for primary health centers (PHC), neurologists & hospital visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href="/api/download-report"
              download="Mind_Mithra_Project_Report_and_Technical_Stack.docx"
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Download full project & technical stack report in DOCX format"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Project .DOCX</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto py-4 space-y-6 text-stone-900">
          {/* Official Document Banner */}
          <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-800 block">
                MIND MITHRA DIGITAL HEALTH & COGNITIVE TELEMETRY RECORD
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-0.5">
                Patient Cognitive Status & Adherence Report
              </h2>
              <p className="text-xs text-stone-500">
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-black">
              Verified Offline Sync Engine
            </div>
          </div>

          {/* Patient Details Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Patient Name</span>
              <span className="font-black text-sm text-stone-900">{patient.name}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Age & Gender</span>
              <span className="font-black text-sm text-stone-900">{patient.age} yrs • Male</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Location</span>
              <span className="font-black text-sm text-stone-900">{patient.location}</span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Clinical Stage</span>
              <span className="font-black text-sm text-teal-800">Mild Impairment (MCI)</span>
            </div>
          </div>

          {/* Section 1: Quantitative Telemetry Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              1. 7-Day Cognitive Domain Performance
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Memory Recall</span>
                <span className="text-xl font-black text-amber-950">82%</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">+4% vs baseline</span>
              </div>
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Visual Attention</span>
                <span className="text-xl font-black text-teal-950">88%</span>
                <span className="text-[10px] text-teal-700 font-bold block mt-0.5">Steady scanning</span>
              </div>
              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Pattern Weave</span>
                <span className="text-xl font-black text-indigo-950">88%</span>
                <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">Heritage motifs</span>
              </div>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Mean Latency</span>
                <span className="text-xl font-black text-rose-950">2.8s</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Normal baseline</span>
              </div>
            </div>
          </div>

          {/* Section 2: Routine & Medication Adherence */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              2. Medication & Daily Routine Adherence Telemetry
            </h4>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-stone-800">Overall Reminder Adherence: </span>
                <span className="font-black text-teal-800 text-sm">91%</span>
                <p className="text-stone-500 mt-0.5">Morning hypertension & memory supplements acknowledged consistently.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                High Adherence
              </span>
            </div>
          </div>

          {/* Section 3: AI Behavioral Telemetry Summary (Non-diagnostic) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              3. AI Behavioral Observations (Caregiver Telemetry)
            </h4>
            <div className="space-y-2">
              {observations.slice(0, 3).map((obs, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between gap-2 font-bold text-stone-900">
                    <span>{obs.title || obs.observation}</span>
                    <span className="text-[10px] text-stone-400 font-semibold">{obs.category}</span>
                  </div>
                  <p className="text-stone-600 mt-1 text-[11px]">{obs.explainabilityReason || obs.observation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off box */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-6 text-xs text-stone-600">
            <div>
              <p className="font-bold text-stone-900">Primary Caregiver Sign-off:</p>
              <p className="mt-1 font-semibold">{patient.primaryCaregiverName} (Daughter)</p>
              <p className="text-[10px] text-stone-400">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-bold text-stone-900">Attending Neurologist / PHC Physician:</p>
              <div className="border-b border-stone-300 w-48 mt-4 mb-1" />
              <p className="text-[10px] text-stone-400">Dr. B. Barua, MD • Tezpur Civil Hospital</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-400 shrink-0">
          <span>Non-Diagnostic Digital Health Telemetry • Confidential Medical Record</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
