import React, { useState } from 'react';
import { 
  Settings, 
  Type, 
  Volume2, 
  Camera, 
  Sun, 
  ShieldAlert, 
  Phone, 
  User, 
  Check, 
  RotateCcw, 
  X, 
  Eye, 
  Sparkles,
  Sliders,
  Languages
} from 'lucide-react';
import { AppSettings, AppFontSize, SupportedLanguage } from '../../types';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';
import { SUPPORTED_LANGUAGES } from '../../lib/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
  currentLang: SupportedLanguage;
  onLangChange: (lang: SupportedLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetData,
  currentLang,
  onLangChange,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFontSizeChange = (size: AppFontSize) => {
    const updated = { ...localSettings, fontSize: size };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  const handleToggle = (key: keyof AppSettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = localDB.saveAppSettings(localSettings);
    onUpdateSettings(updated);
    setSavedSuccess(true);
    audioService.playFeedbackSound('SUCCESS');
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Mind Mithra Preferences &amp; Accessibility
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">
                Font size, voice speed, camera &amp; emergency settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Senior Visual Font Size Adjustment */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                  Text &amp; Font Size
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {localSettings.fontSize === 'NORMAL' ? 'Standard (100%)' : localSettings.fontSize === 'LARGE' ? 'Large (115%)' : 'Extra Large (130%)'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Adjust button and story text size for comfortable elderly reading.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFontSizeChange('NORMAL')}
                className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                  localSettings.fontSize === 'NORMAL'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                }`}
              >
                <span className="text-xs font-bold block">A</span>
                <span className="text-[10px] text-stone-500">Normal</span>
              </button>

              <button
                type="button"
                onClick={() => handleFontSizeChange('LARGE')}
                className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                  localSettings.fontSize === 'LARGE'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                }`}
              >
                <span className="text-sm font-bold block">A+</span>
                <span className="text-[10px] text-stone-500">Large</span>
              </button>

              <button
                type="button"
                onClick={() => handleFontSizeChange('EXTRA_LARGE')}
                className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                  localSettings.fontSize === 'EXTRA_LARGE'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-black shadow-xs'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'
                }`}
              >
                <span className="text-base font-extrabold block">A++</span>
                <span className="text-[10px] text-stone-500">Max Readability</span>
              </button>
            </div>
          </div>

          {/* 2. Camera Mood Check on Startup */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-600" />
                <h4 className="font-extrabold text-sm text-stone-900">
                  Auto Camera Mood Check
                </h4>
              </div>
              <p className="text-xs text-stone-500">
                Turns on front camera upon opening to identify mood and cheer up patient.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('autoCameraMoodCheck')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                localSettings.autoCameraMoodCheck ? 'bg-teal-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  localSettings.autoCameraMoodCheck ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. High Contrast Mode */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-sm text-stone-900">
                  High Contrast Text &amp; Borders
                </h4>
              </div>
              <p className="text-xs text-stone-500">
                Enhances edge sharpness for patients with cataract or reduced vision.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('highContrast')}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                localSettings.highContrast ? 'bg-indigo-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  localSettings.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Voice Companion Speed & Audio */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-600" />
                <h4 className="font-extrabold text-sm text-stone-900">
                  Voice Speech Speed
                </h4>
              </div>
              <span className="text-xs font-bold text-amber-800">
                {localSettings.speechSpeed === 0.8 ? 'Gentle & Slow (0.8x)' : localSettings.speechSpeed === 1.0 ? 'Normal (1.0x)' : 'Fast (1.2x)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { speed: 0.8, label: '0.8x (Elder Slow)' },
                { speed: 1.0, label: '1.0x (Normal)' },
                { speed: 1.2, label: '1.2x (Faster)' },
              ].map((item) => (
                <button
                  key={item.speed}
                  type="button"
                  onClick={() => {
                    const updated = { ...localSettings, speechSpeed: item.speed };
                    setLocalSettings(updated);
                    onUpdateSettings(updated);
                    audioService.playFeedbackSound('GENTLE_TAP');
                  }}
                  className={`py-2 px-2 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                    localSettings.speechSpeed === item.speed
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Emergency Caregiver Contact */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-600" />
              <h4 className="font-extrabold text-sm text-stone-900">
                Emergency Caregiver Contact
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase">Contact Name</label>
                <input
                  type="text"
                  value={localSettings.emergencyContactName}
                  onChange={(e) => setLocalSettings({ ...localSettings, emergencyContactName: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={localSettings.emergencyPhone}
                  onChange={(e) => setLocalSettings({ ...localSettings, emergencyPhone: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo patient activities, memories, and settings back to initial state?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
