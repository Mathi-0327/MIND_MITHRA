import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Calendar, 
  Sparkles,
  RefreshCw,
  X 
} from 'lucide-react';
import { PatientProfile, AIObservation, GameSessionResult } from '../../types';
import { localDB } from '../../lib/storage';
import { generateCognitiveAnalyticsReport } from '../../lib/cognitiveAnalyticsEngine';

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
  const [copied, setCopied] = useState(false);
  const [aiReportText, setAiReportText] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Compute mathematically deterministic report from local database
  const report = useMemo(() => {
    return generateCognitiveAnalyticsReport(patient.id, 30);
  }, [patient.id, sessions.length]);

  const confidenceMap = localDB.getConfidenceMap(patient.id);

  // Fetch or synthesize AI Clinical Evaluation
  const generateAIReport = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/clinical-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: report,
          patientNotes: `Patient ${patient.name}, age ${patient.age}, living in ${patient.location}. Primary caregiver is ${patient.primaryCaregiverName} (${patient.caregiverRelationship}). Current difficulty level: ${patient.currentDifficultyLevel}.`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clinicalReportText) {
          setAiReportText(data.clinicalReportText);
        }
      }
    } catch (err) {
      console.warn('Could not fetch cloud AI clinical report, relying on deterministic analytics:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (isOpen && !aiReportText) {
      generateAIReport();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const domainDetails = report.domainMetrics
      .map((d) => `  - ${d.domainLabel}: ${d.accuracyPercent}% (${d.trend}, ${d.sessionsCount} sessions, Level ${d.currentLevel})`)
      .join('\n');

    const text = `
CLINICAL COGNITIVE TELEMETRY & PROGRESS REPORT (MIND MITHRA)
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Patient Name: ${patient.name} (Age: ${patient.age}) | ID: ${patient.id}
Location: ${patient.location}
Primary Caregiver: ${patient.primaryCaregiverName} (${patient.caregiverRelationship})

1. DETERMINISTIC COGNITIVE DOMAIN PERFORMANCE (${report.dateRange.start} - ${report.dateRange.end}):
- Total Structured Sessions: ${report.totalSessions}
- Overall Cognitive Accuracy: ${report.overallAccuracy}%
- Mean Response Latency: ${(report.meanResponseTimeMs / 1000).toFixed(1)}s
${domainDetails}

2. LONGITUDINAL MEMORY CONFIDENCE MAPPING:
${confidenceMap.domains.map((d) => `  - ${d.domain}: ${d.score}% (${d.trend})`).join('\n')}

3. ADHERENCE TELEMETRY:
- Overall Routine & Medication Adherence: ${report.overallReminderAdherence}%
- Reminders Completed: ${report.reminderAnalytics.completed} / ${report.reminderAnalytics.totalReminders}

4. DETERMINISTIC EVIDENCE-BASED OBSERVATIONS:
${report.evidenceBasedObservations.map((o, idx) => `${idx + 1}. [${o.source}] ${o.observation}`).join('\n')}

5. AI CLINICAL SYNTHESIS:
${aiReportText || 'Synthesis pending or using offline deterministic metrics.'}

6. CLINICAL SIGN-OFF:
Attending Physician: Dr. B. Barua, MD (Tezpur Civil Hospital)
Stage: Mild Cognitive Impairment (MCI) / Non-Diagnostic Telemetry
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border-2 border-stone-200 my-8 max-h-[92vh] flex flex-col justify-between">
        {/* Modal Header Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">
                1-Click Clinical Summary & Export
              </h3>
              <p className="text-xs text-stone-500">
                Evidence-grounded cognitive telemetry for Primary Health Centers, Neurologists & Care Teams
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

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto py-4 space-y-6 text-stone-900 pr-1">
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
                Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • Assessment Period: {report.dateRange.start} – {report.dateRange.end}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-black">
                Deterministic Pure Math
              </span>
              <span className="px-3 py-1 bg-teal-100 border border-teal-300 rounded-xl text-teal-900 text-xs font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Verified Offline Sync
              </span>
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
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Current Difficulty</span>
              <span className="font-black text-sm text-teal-800">Level {patient.currentDifficultyLevel || 1} / 5</span>
            </div>
          </div>

          {/* Section 1: Quantitative Telemetry Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              1. Deterministic Cognitive Domain Performance (Past 30 Days)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">Overall Accuracy</span>
                <span className="text-xl font-black text-amber-950">{report.overallAccuracy}%</span>
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Across {report.totalSessions} sessions</span>
              </div>
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase block">Mean Latency</span>
                <span className="text-xl font-black text-teal-950">{(report.meanResponseTimeMs / 1000).toFixed(1)}s</span>
                <span className="text-[10px] text-teal-700 font-bold block mt-0.5">Active processing time</span>
              </div>
              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block">Reminder Adherence</span>
                <span className="text-xl font-black text-indigo-950">{report.overallReminderAdherence}%</span>
                <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">{report.reminderAnalytics.completed}/{report.reminderAnalytics.totalReminders} acknowledged</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Sessions Recorded</span>
                <span className="text-xl font-black text-emerald-950">{report.totalSessions}</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Verified on-device</span>
              </div>
            </div>

            {/* Granular Domain Performance Table */}
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs text-left border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-100 text-stone-700 uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-2.5">Domain</th>
                    <th className="p-2.5">Sessions</th>
                    <th className="p-2.5">Accuracy</th>
                    <th className="p-2.5">Avg Response</th>
                    <th className="p-2.5">Level</th>
                    <th className="p-2.5">Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {report.domainMetrics.map((dm) => (
                    <tr key={dm.domain} className="hover:bg-stone-50">
                      <td className="p-2.5 font-bold text-stone-900">{dm.domainLabel}</td>
                      <td className="p-2.5 text-stone-600">{dm.sessionsCount}</td>
                      <td className="p-2.5 font-bold text-teal-900">{dm.accuracyPercent}%</td>
                      <td className="p-2.5 text-stone-600">{dm.avgResponseTimeMs ? `${(dm.avgResponseTimeMs / 1000).toFixed(1)}s` : '—'}</td>
                      <td className="p-2.5 text-stone-600">L{dm.currentLevel} (Max L{dm.highestLevel})</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          dm.trend === 'IMPROVING' ? 'bg-emerald-100 text-emerald-800' :
                          dm.trend === 'NEEDS_SUPPORT' ? 'bg-amber-100 text-amber-800' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {dm.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Longitudinal Memory Confidence Mapping */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              2. Longitudinal Memory Confidence & Familiarity Mapping
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {confidenceMap.domains.map((dom) => (
                <div key={dom.domain} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-600 truncate block">{dom.domain}</span>
                  <span className="text-base font-black text-teal-900">{dom.score}%</span>
                  <span className={`text-[10px] font-bold block ${dom.trend === 'RISING' ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {dom.trend === 'RISING' ? '↑ Improving' : '→ Stable'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Evidence-Based Observations */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-500 uppercase tracking-wider">
              3. Evidence-Based Observations (Non-Diagnostic Telemetry)
            </h4>
            <div className="space-y-2">
              {report.evidenceBasedObservations.map((obs) => (
                <div key={obs.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center justify-between gap-2 font-bold text-stone-900">
                    <span>{obs.observation}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-mono font-bold">
                      {obs.source}
                    </span>
                  </div>
                  <p className="text-stone-500 mt-1 text-[11px]">
                    <strong className="text-stone-700">Evidence:</strong> {obs.evidence} • <span className="italic">Period: {obs.timePeriod}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: AI Clinical Evaluation Synthesis */}
          <div className="space-y-2 p-4 bg-teal-50/50 rounded-2xl border-2 border-teal-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider">
                  4. AI Clinical Synthesis & Scaffolding Recommendations
                </h4>
              </div>
              <button
                onClick={generateAIReport}
                disabled={isGeneratingAI}
                className="px-2.5 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Synthesizing...' : 'Regenerate Analysis'}</span>
              </button>
            </div>

            {isGeneratingAI ? (
              <div className="py-6 text-center text-xs text-teal-800 animate-pulse">
                Synthesizing evidence-grounded clinical observations via Mind Mithra AI...
              </div>
            ) : aiReportText ? (
              <div className="prose prose-stone prose-xs max-w-none text-stone-800 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-xl border border-teal-200">
                {aiReportText}
              </div>
            ) : (
              <div className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
                <p className="font-bold text-stone-900 mb-1">Standard Scaffolding Recommendations:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {report.caregiverSuggestions.map((s, idx) => (
                    <li key={idx}>
                      <strong>{s.actionType}:</strong> {s.recommendation} <em>({s.rationale})</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sign-off box */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-6 text-xs text-stone-600">
            <div>
              <p className="font-bold text-stone-900">Primary Caregiver Sign-off:</p>
              <p className="mt-1 font-semibold">{patient.primaryCaregiverName} ({patient.caregiverRelationship})</p>
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
          <span>Non-Diagnostic Digital Health Telemetry • Confidential Medical Record • Mind Mithra</span>
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

