import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  X, 
  BellRing,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { PatientProfile, SupportedLanguage } from '../../types';
import { audioService } from '../../lib/audioService';
import { localDB } from '../../lib/storage';

export interface SOSAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  language?: SupportedLanguage;
}

type SOSStage = 'CONFIRM' | 'DISPATCHED';

export const SOSAlertModal: React.FC<SOSAlertModalProps> = ({
  isOpen,
  onClose,
  patient,
  language: _language = 'en',
}) => {
  const [stage, setStage] = useState<SOSStage>('CONFIRM');
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(false);
  const [locationCoords] = useState<{ lat: number; lng: number; address: string }>({
    lat: 26.1445,
    lng: 91.7362,
    address: 'Uzan Bazar, Riverside Colony, Guwahati, Assam',
  });

  useEffect(() => {
    if (!isOpen) {
      setStage('CONFIRM');
      setSirenPlaying(false);
      audioService.stopCaregiverEmergencySiren();
      return;
    }
  }, [isOpen]);

  const handleConfirmEmergency = () => {
    setStage('DISPATCHED');
    setSirenPlaying(true);

    // Speak initial reassuring alert and play emergency siren
    audioService.speak(
      `Emergency help request triggered for ${patient.name}. Alerting caregiver ${patient.caregiverName} now.`
    );
    audioService.playCaregiverEmergencySiren(8);

    // Add high-priority caregiver alert
    localDB.addCaregiverAlert({
      patientId: patient.id,
      patientName: patient.name,
      patientRelation: 'Elder Family Member',
      type: 'SOS_EMERGENCY',
      severity: 'CRITICAL',
      message: `EMERGENCY SOS: ${patient.name} confirmed emergency help request. Immediate caregiver attention is requested.`,
      location: locationCoords.address,
    });

    // Log event in local database
    localDB.enqueueEvent('REASSURANCE_TRIGGERED', {
      patientId: patient.id,
      sosEmergency: true,
      caregiverName: patient.caregiverName,
      contact: patient.caregiverContact,
      location: locationCoords,
      timestamp: new Date().toISOString(),
    }, patient.id);
  };

  const handleCancel = () => {
    if (sirenPlaying) {
      setSirenPlaying(false);
      audioService.stopCaregiverEmergencySiren();
    }
    audioService.playFeedbackSound('GENTLE_TAP');
    audioService.speak('Emergency alert cancelled. You are safe.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#FFFDF7] w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Emergency Help (SOS)
              </h2>
              <p className="text-xs text-rose-100 font-bold uppercase tracking-wider">
                Family &amp; Caregiver Support
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* STAGE 1: ACCIDENTAL ACTIVATION PROTECTION CONFIRMATION */}
          {stage === 'CONFIRM' && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-[#FEE2E2] border-4 border-[#FCA5A5] mx-auto flex items-center justify-center text-[#B91C1C] shadow-md">
                <AlertTriangle className="w-10 h-10 animate-pulse stroke-[2.4]" />
              </div>

              <div className="space-y-1.5">
                <h3 
                  className="text-xl sm:text-2xl font-black text-[#2D2115]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Do you need emergency help?
                </h3>
                <p className="text-[#5A4533] text-sm font-bold leading-relaxed max-w-xs mx-auto">
                  Tapping below will immediately sound an alert and notify <strong>{patient.caregiverName}</strong>.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Yes, Call for Help button */}
                <button
                  type="button"
                  onClick={handleConfirmEmergency}
                  className="w-full py-4 sm:py-5 bg-rose-600 hover:bg-rose-700 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 border-2 border-rose-500"
                >
                  <BellRing className="w-6 h-6 animate-bounce" />
                  <span>Yes, Call for Help</span>
                </button>

                {/* Cancel / I am OK button */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full py-3.5 sm:py-4 bg-[#FFF8EE] hover:bg-[#FDE8B5] text-[#422B14] font-black text-sm sm:text-base rounded-2xl cursor-pointer transition-all active:scale-98 border-2 border-[#E5BD78]"
                >
                  No, I am OK (Cancel)
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: DISPATCHED & ACTIVE REASSURANCE */}
          {stage === 'DISPATCHED' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200 text-center">
              <div className="p-5 rounded-3xl bg-[#F0FDF4] border-2 border-[#86EFAC] text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#14532D]">
                    Caregiver Alert Dispatched!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#166534] font-medium mt-1">
                    Help alert sent to <strong>{patient.caregiverName}</strong> ({patient.caregiverContact}).
                  </p>
                </div>
              </div>

              {/* Geo Location Telemetry Card */}
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#EADFCB] space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-[#4A2E12] text-xs font-bold">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Your Current Location:</span>
                </div>
                <p className="text-xs font-medium text-[#2D2115] bg-[#FFF8EE] p-2.5 rounded-xl border border-[#E5BD78]">
                  📍 {locationCoords.address}
                </p>
              </div>

              {/* Direct Call Button */}
              <a
                href={`tel:${patient.caregiverContact}`}
                className="w-full py-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 no-underline"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {patient.caregiverName} Now</span>
              </a>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 text-[#6B543E] hover:text-[#2D2115] text-xs font-bold cursor-pointer transition-colors"
              >
                I am Safe / Close Screen
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
