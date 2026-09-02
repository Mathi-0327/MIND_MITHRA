import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  Phone, 
  Home, 
  MapPin, 
  Volume2, 
  ShieldCheck, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { PatientProfile, SupportedLanguage } from '../../types';
import { audioService } from '../../lib/audioService';

interface SafeHavenReassuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  language: SupportedLanguage;
}

export const SafeHavenReassuranceModal: React.FC<SafeHavenReassuranceModalProps> = ({
  isOpen,
  onClose,
  patient,
  language,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [callConnected, setCallConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      audioService.playFeedbackSound('GENTLE_TAP');
      speakReassurance();
    } else {
      setIsCalling(false);
      setCallConnected(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const speakReassurance = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const message = `Namaskar ${patient.name.split(' ')[0]}. Do not worry. You are safe at home in your Tezpur residence. Your daughter Priyanka is right nearby and taking care of you.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartCall = () => {
    setIsCalling(true);
    audioService.playFeedbackSound('GENTLE_TAP');
    setTimeout(() => {
      setCallConnected(true);
      audioService.playFeedbackSound('SUCCESS');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-400 relative overflow-hidden">
        {/* Soft reassuring banner */}
        <div className="text-center space-y-3 pb-5 border-b border-stone-200">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-md">
            <Heart className="w-10 h-10 fill-emerald-600 animate-pulse" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Safe Haven • You Are Safe</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              You are safe, {patient.name.split(' ')[0]}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-medium max-w-md mx-auto mt-1">
              Take a slow, deep breath. There is no rush, and everything is alright.
            </p>
          </div>

          <button
            onClick={speakReassurance}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>Hear Reassuring Voice Again</span>
          </button>
        </div>

        {/* Location & Home Info */}
        <div className="py-5 space-y-4">
          <div className="bg-stone-50 rounded-2xl p-4 border-2 border-stone-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase text-stone-400">Your Current Location</span>
              <p className="text-base font-extrabold text-stone-900">
                {patient.location}
              </p>
              <p className="text-xs text-stone-500">Your peaceful family home in Assam</p>
            </div>
          </div>

          {/* Primary Caregiver Card & Quick Call */}
          <div className="bg-amber-50/70 rounded-2xl p-5 border-2 border-amber-300 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                  PK
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase">Primary Caregiver</span>
                  <h4 className="text-base font-black text-stone-900">
                    {patient.primaryCaregiverName}
                  </h4>
                  <p className="text-xs text-stone-600">Your Loving {patient.caregiverRelationship}</p>
                </div>
              </div>
            </div>

            {/* Call State Display */}
            {!isCalling ? (
              <button
                onClick={handleStartCall}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 fill-white" />
                <span>Call {patient.primaryCaregiverName} Now</span>
              </button>
            ) : !callConnected ? (
              <div className="p-4 bg-white rounded-xl border border-emerald-300 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-sm">
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>Connecting to {patient.primaryCaregiverName}...</span>
                </div>
                <p className="text-xs text-stone-500 font-medium">+91 98765 43210 • Ringing</p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-700 text-white rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center gap-2 font-black text-sm">
                  <Check className="w-4 h-4" />
                  <span>Connected with {patient.primaryCaregiverName}</span>
                </div>
                <p className="text-xs text-emerald-100">"Namaskar Koka! I'm coming to sit with you right now."</p>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-sm font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I Feel Better & Calm Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
