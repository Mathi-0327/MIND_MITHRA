import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Volume2, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Radio, 
  Heart,
  Send,
  BellRing
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

export const SOSAlertModal: React.FC<SOSAlertModalProps> = ({
  isOpen,
  onClose,
  patient,
  language = 'en',
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(false);
  const [locationCoords] = useState<{ lat: number; lng: number; address: string }>({
    lat: 26.1445,
    lng: 91.7362,
    address: 'Uzan Bazar, Riverside Colony, Guwahati, Assam',
  });

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsDispatched(false);
      setSirenPlaying(false);
      audioService.stopCaregiverEmergencySiren();
      return;
    }

    // Speak initial reassuring alert and play loud emergency alert siren
    audioService.speak(
      `Emergency help request triggered for ${patient.name}. Alerting caregiver ${patient.caregiverName} now.`
    );
    setSirenPlaying(true);
    audioService.playCaregiverEmergencySiren(8);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerEmergencyDispatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      audioService.stopCaregiverEmergencySiren();
    };
  }, [isOpen]);

  const triggerEmergencyDispatch = () => {
    setIsDispatched(true);
    audioService.playCaregiverEmergencySiren(8);
    
    // Add high-priority caregiver alert
    localDB.addCaregiverAlert({
      patientId: patient.id,
      patientName: patient.name,
      patientRelation: 'Elder Family Member',
      type: 'SOS_EMERGENCY',
      severity: 'CRITICAL',
      message: `EMERGENCY SOS: ${patient.name} pressed the 1-Tap SOS button. Immediate caregiver attention is requested.`,
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
    setSirenPlaying(false);
    audioService.stopCaregiverEmergencySiren();
    audioService.playFeedbackSound('GENTLE_TAP');
    audioService.speak('Emergency alert cancelled. You are safe at home.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Emergency Caregiver SOS
              </h2>
              <p className="text-xs text-rose-100 font-bold uppercase tracking-wider">
                Instant Elder Assistance Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!isDispatched ? (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-rose-100 border-4 border-rose-400 mx-auto flex flex-col items-center justify-center text-rose-700 font-black text-3xl animate-pulse shadow-lg">
                <span>{countdown}s</span>
                <span className="text-[10px] uppercase font-bold text-rose-900">Auto-Alert</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Sending SOS Alert to {patient.caregiverName}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xs mx-auto">
                  Hold on, {patient.name}! Help is being notified with your current home address and GPS coordinates.
                </p>
              </div>

              {/* Instant Alert Button */}
              <button
                type="button"
                onClick={triggerEmergencyDispatch}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <BellRing className="w-5 h-5 animate-pulse" />
                <span>Send Emergency SOS Immediately</span>
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel (False Alarm / I am Safe)
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-3 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-3xl shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-950">
                    Caregiver Alert Dispatched!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 font-medium mt-1">
                    Notification &amp; SMS sent to <strong>{patient.caregiverName}</strong> ({patient.caregiverContact}).
                  </p>
                </div>
              </div>

              {/* Geo Location Telemetry Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-left">
                <div className="flex items-center gap-2 text-stone-700 text-xs font-bold">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Transmitted Geo-Location:</span>
                </div>
                <p className="text-xs font-mono bg-white p-2.5 rounded-xl border border-stone-200 text-stone-800">
                  📍 {locationCoords.address} ({locationCoords.lat}, {locationCoords.lng})
                </p>
              </div>

              {/* Direct Call Button */}
              <a
                href={`tel:${patient.caregiverContact}`}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 no-underline"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {patient.caregiverName} ({patient.caregiverContact})</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 text-stone-600 hover:text-stone-900 text-xs font-bold cursor-pointer transition-colors"
              >
                Close SOS Screen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
