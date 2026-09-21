import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  Sparkles, 
  Users, 
  MapPin, 
  Music, 
  Clock, 
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { MemoryConfidenceMap, ConfidenceDomainScore, SupportedLanguage } from '../../../types';
import { localDB } from '../../../lib/storage';

interface ConfidenceMapModalProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
}

const DOMAIN_ICONS: Record<string, any> = {
  FAMILY: Users,
  OLD_PLACES: MapPin,
  MUSIC: Music,
  ROUTINES: Clock,
  EVENTS: Calendar,
};

export const ConfidenceMapModal: React.FC<ConfidenceMapModalProps> = ({
  patientId,
  isOpen,
  onClose,
  language = 'en',
}) => {
  const [mapData, setMapData] = useState<MemoryConfidenceMap | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMapData(localDB.getConfidenceMap(patientId));
    }
  }, [isOpen, patientId]);

  if (!isOpen || !mapData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFDF7] dark:bg-[#202924] rounded-3xl max-w-2xl w-full border border-[#E2EBD9] dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-white dark:bg-stone-900 border-b border-[#E2EBD9] dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#58745A] text-white flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#26302A] dark:text-[#FFFDF7]">
                Memory Confidence Map (স্মৃতি বিশ্বাস মানচিত্ৰ)
              </h2>
              <p className="text-xs text-stone-500">
                Longitudinal familiarity levels across your cherished life domains
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-5">
          {/* Observational Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              <strong>Observational Health Telemetry:</strong> These metrics reflect engagement, response speed, and familiarity trends during reminiscence and games. They do not constitute clinical diagnosis.
            </p>
          </div>

          {/* Domain Bars */}
          <div className="space-y-4">
            {mapData.domains.map((d, idx) => {
              const IconComp = DOMAIN_ICONS[d.categoryKey] || Sparkles;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#E2EBD9] dark:border-stone-800 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E2EBD9] dark:bg-stone-800 text-[#58745A] dark:text-[#789477] flex items-center justify-center">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#26302A] dark:text-[#FFFDF7]">
                          {d.domain}
                        </h3>
                        <span className="text-xs text-stone-500">
                          {d.interactionCount} Interactions Logged
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300">
                        {d.trend === 'RISING' ? (
                          <span className="flex items-center text-emerald-600 gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> Rising</span>
                        ) : d.trend === 'DECLINING' ? (
                          <span className="flex items-center text-rose-500 gap-0.5"><TrendingDown className="w-3.5 h-3.5" /> Needs Refresh</span>
                        ) : (
                          <span className="flex items-center text-stone-500 gap-0.5"><Minus className="w-3.5 h-3.5" /> Steady</span>
                        )}
                      </div>
                      <span className="font-serif font-bold text-lg text-[#58745A] dark:text-[#789477]">
                        {d.score}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#58745A] to-[#B28A32] rounded-full transition-all duration-500"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#E2EBD9]/60 dark:bg-stone-800 border border-[#58745A]/20 flex items-center gap-3">
            <Award className="w-6 h-6 text-[#58745A] dark:text-[#789477] flex-shrink-0" />
            <p className="text-xs sm:text-sm font-serif text-[#26302A] dark:text-stone-200">
              <strong>Clinical Insight:</strong> Familiarity with traditional music and close kinship remains remarkably resilient. Recommended to prioritize these themes during afternoon reminiscence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
