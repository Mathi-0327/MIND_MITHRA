import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Sliders, 
  ArrowRight, 
  Trash2, 
  Brain, 
  ShieldCheck 
} from 'lucide-react';
import { CaregiverInstruction } from '../../types';
import { localDB } from '../../lib/storage';

interface CaregiverInstructionFormProps {
  onInstructionSaved: () => void;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
}

export const CaregiverInstructionForm: React.FC<CaregiverInstructionFormProps> = ({
  onInstructionSaved,
  networkState,
}) => {
  const [instructions, setInstructions] = useState<CaregiverInstruction[]>(() =>
    localDB.getCaregiverInstructions()
  );
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetExamples = [
    'He is feeling a bit tired today, please reduce difficult games to an easy pace.',
    'He loves traditional Assam folk music and Bihu drums. Prefer these cultural themes.',
    'Schedule memory exercises in the morning and relaxing flute breathing in the evening.',
    'Keep instructions very brief, warm, and comforting.',
  ];

  const handleSubmitInstruction = async (textToSubmit: string) => {
    if (!textToSubmit.trim() || isProcessing) return;

    setIsProcessing(true);

    if (networkState === 'OFFLINE') {
      setTimeout(() => {
        setIsProcessing(false);
        const lower = textToSubmit.toLowerCase();
        const timeOfDayPref: 'MORNING' | 'AFTERNOON' | 'EVENING' = lower.includes('evening') ? 'EVENING' : lower.includes('afternoon') ? 'AFTERNOON' : 'MORNING';
        const structuredRule = {
          preferredTheme: lower.includes('music') || lower.includes('bihu') ? 'Bihu Folk & Music' : 'Assam Tea Gardens',
          timeOfDayPreference: timeOfDayPref,
          maxDifficulty: lower.includes('tired') || lower.includes('reduce') || lower.includes('easy') ? 2 : 3,
          enableRelaxationAudio: true,
          toneStyle: 'WARM_ENCOURAGING' as const,
        };

        const newInstruction: CaregiverInstruction = {
          id: `inst-${Date.now()}`,
          patientId: 'patient-ravi-001',
          caregiverId: 'cg-priyanka-01',
          rawInstructionText: textToSubmit,
          structuredRule,
          createdAt: new Date().toISOString(),
          appliedStatus: 'ACTIVE',
        };

        localDB.saveCaregiverInstruction(newInstruction);
        setInstructions(localDB.getCaregiverInstructions());
        setRawText('');
        onInstructionSaved();
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/ai/parse-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToSubmit }),
      });
      const data = await res.json();
      setIsProcessing(false);

      const structuredRule = data.structuredRule || {
        preferredTheme: 'Traditional Folk Music & Gardening',
        timeOfDayPreference: 'MORNING',
        maxDifficulty: 3,
        enableRelaxationAudio: true,
        toneStyle: 'WARM_ENCOURAGING',
      };

      const newInstruction: CaregiverInstruction = {
        id: `inst-${Date.now()}`,
        patientId: 'patient-ravi-001',
        caregiverId: 'cg-priyanka-01',
        rawInstructionText: textToSubmit,
        structuredRule,
        createdAt: new Date().toISOString(),
        appliedStatus: 'ACTIVE',
      };

      localDB.saveCaregiverInstruction(newInstruction);
      setInstructions(localDB.getCaregiverInstructions());
      setRawText('');
      onInstructionSaved();
    } catch {
      setIsProcessing(false);
      const fallbackInstruction: CaregiverInstruction = {
        id: `inst-${Date.now()}`,
        patientId: 'patient-ravi-001',
        caregiverId: 'cg-priyanka-01',
        rawInstructionText: textToSubmit,
        structuredRule: {
          preferredTheme: 'Traditional Assam Heritage',
          timeOfDayPreference: 'MORNING',
          maxDifficulty: 3,
          enableRelaxationAudio: true,
          toneStyle: 'WARM_ENCOURAGING',
        },
        createdAt: new Date().toISOString(),
        appliedStatus: 'ACTIVE',
      };
      localDB.saveCaregiverInstruction(fallbackInstruction);
      setInstructions(localDB.getCaregiverInstructions());
      setRawText('');
      onInstructionSaved();
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-stone-900">
              Caregiver Natural Language Instruction Overlay
            </h3>
            <p className="text-xs text-stone-500">
              Type what you observe or prefer for Ravi. AI converts your natural language into active difficulty caps, theme preferences, and pacing.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitInstruction(rawText);
          }}
          className="space-y-3 mt-4"
        >
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. 'He is feeling tired today, reduce difficult games to an easy pace and play flute music in the evening.'"
            className="w-full p-4 text-xs sm:text-sm border border-stone-300 rounded-2xl bg-stone-50 focus:bg-white focus:outline-teal-700 font-medium"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-teal-600" />
              <span>Parsed into structured cognitive parameters automatically</span>
            </div>

            <button
              type="submit"
              disabled={!rawText.trim() || isProcessing}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Interpreting...' : 'Apply Instruction to AI Engine'}</span>
            </button>
          </div>
        </form>

        {/* Quick Example Chips */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Example Instructions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetExamples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawText(ex)}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-teal-50 border border-stone-200 text-left text-xs font-medium text-stone-700 transition-colors"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Rules List */}
      <div>
        <h4 className="text-base font-extrabold text-stone-900 mb-3 px-1">
          Active AI Rules & Parameter Overrides
        </h4>

        <div className="space-y-3">
          {instructions.map((inst) => (
            <div
              key={inst.id}
              className="p-5 bg-white rounded-3xl border-2 border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    ACTIVE INSTRUCTION
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(inst.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm font-bold text-stone-900">
                  "{inst.rawInstructionText}"
                </p>

                {/* Structured Rule Breakdown */}
                {inst.structuredRule && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {inst.structuredRule.preferredTheme && (
                      <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-900">
                        Theme: {inst.structuredRule.preferredTheme}
                      </span>
                    )}
                    {inst.structuredRule.maxDifficulty !== undefined && (
                      <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-900">
                        Max Level Cap: {inst.structuredRule.maxDifficulty} / 5
                      </span>
                    )}
                    {inst.structuredRule.timeOfDayPreference && (
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900">
                        Pacing: {inst.structuredRule.timeOfDayPreference}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enforced at Runtime</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
