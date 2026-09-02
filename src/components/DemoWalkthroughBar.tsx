import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  WifiOff, 
  Wifi, 
  Mic, 
  Brain, 
  Heart, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  RotateCcw,
  X
} from 'lucide-react';

interface DemoWalkthroughBarProps {
  currentStep: number;
  onSetStep: (step: number) => void;
  onExecuteStepAction: (step: number) => void;
  onClose: () => void;
}

export const DEMO_STEPS = [
  {
    step: 1,
    title: '1. Elderly-Friendly Home Interface',
    description: 'Clean, high-contrast, large-button layout designed for elderly users in Assam/NER.',
    actionLabel: 'Open Patient Home',
    role: 'PATIENT',
    network: 'ONLINE',
  },
  {
    step: 2,
    title: '2. Offline-First Verification (P0)',
    description: 'Disconnect network simulator to demonstrate 100% offline functionality in low-connectivity areas.',
    actionLabel: 'Simulate Offline Disconnection',
    role: 'PATIENT',
    network: 'OFFLINE',
  },
  {
    step: 3,
    title: '3. Voice Companion & Offline Intent',
    description: 'Open voice assistant; local intent engine parses commands even with zero internet connectivity.',
    actionLabel: 'Open Voice Assistant',
    role: 'PATIENT',
    network: 'OFFLINE',
  },
  {
    step: 4,
    title: '4. Heritage Cognitive Game',
    description: 'Play North Eastern Heritage Memory Match with regional items (Assam Tea, Bihu Dhol, Hornbill bird).',
    actionLabel: 'Launch Memory Game',
    role: 'PATIENT',
    network: 'OFFLINE',
  },
  {
    step: 5,
    title: '5. Closed-Loop AI Difficulty Adaptation',
    description: 'Engine computes accuracy and response latency, explaining why difficulty was adjusted or maintained.',
    actionLabel: 'View Adaptation Engine',
    role: 'PATIENT',
    network: 'OFFLINE',
  },
  {
    step: 6,
    title: '6. Routine & Medicine Queueing',
    description: 'Acknowledge morning medicine while offline. Logged in local SQLite/localStorage queue.',
    actionLabel: 'Open Medicine Reminders',
    role: 'PATIENT',
    network: 'OFFLINE',
  },
  {
    step: 7,
    title: '7. Network Reconnection & Sync Engine',
    description: 'Reconnect network simulator; batch events upload seamlessly to FastAPI backend.',
    actionLabel: 'Reconnect & Trigger Sync',
    role: 'PATIENT',
    network: 'ONLINE',
  },
  {
    step: 8,
    title: '8. Memory Vault & Zero-Hallucination RAG',
    description: 'Query family memories with granddaughter Ananya at Kaziranga; verified metadata prevents hallucinations.',
    actionLabel: 'Open Memory Vault RAG',
    role: 'PATIENT',
    network: 'ONLINE',
  },
  {
    step: 9,
    title: '9. Caregiver Telemetry Dashboard',
    description: 'Caregiver portal displays 7-day cognitive accuracy curves, latency trends, and daily AI summary.',
    actionLabel: 'Switch to Caregiver Dashboard',
    role: 'CAREGIVER',
    network: 'ONLINE',
  },
  {
    step: 10,
    title: '10. Caregiver AI Copilot Q&A',
    description: 'Ask AI Copilot "How was Ravi today?" and "Which activities does he enjoy most?".',
    actionLabel: 'Open AI Copilot Q&A',
    role: 'CAREGIVER',
    network: 'ONLINE',
  },
  {
    step: 11,
    title: '11. Caregiver Natural Language Rules',
    description: 'Type "He is feeling tired today, reduce difficult games" -> AI parses into active runtime rule.',
    actionLabel: 'Apply Caregiver Instruction',
    role: 'CAREGIVER',
    network: 'ONLINE',
  },
  {
    step: 12,
    title: '12. Clinical Data Separation & Audit',
    description: 'Review verified physician records strictly isolated from non-clinical AI observations.',
    actionLabel: 'Inspect Clinical Records',
    role: 'CAREGIVER',
    network: 'ONLINE',
  },
];

export const DemoWalkthroughBar: React.FC<DemoWalkthroughBarProps> = ({
  currentStep,
  onSetStep,
  onExecuteStepAction,
  onClose,
}) => {
  const current = DEMO_STEPS[currentStep - 1] || DEMO_STEPS[0];

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-xl z-50 bg-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-indigo-500 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Hackathon MVP Demo Guide • Step {current.step} of {DEMO_STEPS.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <h4 className="text-base sm:text-lg font-black text-white">{current.title}</h4>
        <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{current.description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentStep <= 1}
            onClick={() => onSetStep(currentStep - 1)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentStep >= DEMO_STEPS.length}
            onClick={() => onSetStep(currentStep + 1)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onExecuteStepAction(current.step)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{current.actionLabel}</span>
        </button>
      </div>
    </div>
  );
};
