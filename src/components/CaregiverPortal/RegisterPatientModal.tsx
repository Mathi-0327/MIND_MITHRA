import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Heart, 
  Shield, 
  MapPin, 
  Languages, 
  User, 
  Phone, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { PatientProfile, SupportedLanguage } from '../../types';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientRegistered: (newPatient: PatientProfile) => void;
}

const REGION_OPTIONS = [
  'Assam (Guwahati & Brahmaputra Valley)',
  'Assam (Tezpur & Upper Assam)',
  'Meghalaya (Shillong & Khasi Hills)',
  'Manipur (Imphal & Loktak)',
  'Mizoram (Aizawl & Lunglei)',
  'Nagaland (Kohima & Dimapur)',
  'Tripura (Agartala)',
  'Arunachal Pradesh (Itanagar & Tawang)',
  'Sikkim (Gangtok)',
  'Bengal (Kolkata & Siliguri)',
  'Delhi NCR & North India'
];

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mni', label: 'Manipuri / Meitei', native: 'মৈতৈলোন্' },
  { code: 'kha', label: 'Khasi', native: 'Ka Ktien Khasi' },
  { code: 'lus', label: 'Mizo (Lushai)', native: 'Mizo ṭawng' },
];

const AVATAR_OPTIONS = [
  {
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    label: 'Elder Gentleman with Glasses',
  },
  {
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80',
    label: 'Elder Woman with Warm Smile',
  },
  {
    url: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&auto=format&fit=crop&q=80',
    label: 'Senior Gentleman in Traditional Attire',
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    label: 'Senior Grandmother',
  },
  {
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    label: 'Elder Grandfather',
  },
];

const CULTURAL_INTERESTS_LIST = [
  'Bihu & Tea Gardening',
  'Traditional Folk Music & Tales',
  'Weaving & Silk Crafts',
  'Morning Tea & Garden Walks',
  'Nature & Kaziranga Wildlife',
  'Assamese & Northeast Cooking',
  'Classical & Devotional Songs',
  'River & Hill Memories',
];

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientRegistered,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(70);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [region, setRegion] = useState(REGION_OPTIONS[0]);
  const [language, setLanguage] = useState<SupportedLanguage>('as');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_OPTIONS[0].url);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Bihu & Tea Gardening',
    'Traditional Folk Music & Tales',
    'Morning Tea & Garden Walks',
  ]);
  const [caregiverName, setCaregiverName] = useState('Priyanka Sharma');
  const [caregiverContact, setCaregiverContact] = useState('+91 98640 12345');
  const [medicalConditions, setMedicalConditions] = useState('Mild Cognitive Impairment, Hypertension');
  const [initialDifficulty, setInitialDifficulty] = useState<number>(2);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatientId = `patient-${Date.now()}`;
    const newPatient: PatientProfile = {
      id: newPatientId,
      name: name.trim(),
      age: Number(age) || 70,
      gender,
      region,
      preferredLanguage: language,
      culturalInterests: selectedInterests.length > 0 ? selectedInterests : ['Traditional Folk Music & Tales'],
      medicalDataProvided: medicalConditions.trim().length > 0,
      medicalConditions: medicalConditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      caregiverName: caregiverName.trim() || 'Primary Caregiver',
      caregiverContact: caregiverContact.trim() || '+91 98640 12345',
      baseline: {
        memoryScore: 78,
        attentionScore: 75,
        recallScore: 72,
        patternScore: 80,
        responseSpeedMs: 1450,
        engagementLevel: 'HIGH',
        completedAt: new Date().toISOString(),
        isInitialBaseline: true,
      },
      currentDifficultyLevel: initialDifficulty,
      fatigueScore: 0,
      lastSyncTimestamp: new Date().toISOString(),
      syncStatus: 'SYNCED',
      avatarUrl,
    };

    const saved = localDB.registerOrUpdatePatient(newPatient);
    localDB.setActivePatientId(saved.id);
    audioService.playFeedbackSound('SUCCESS');
    audioService.speak(`Patient ${saved.name} has been successfully registered in Mind Mithra Care.`);
    
    onPatientRegistered(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-900 px-6 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600/30 border border-teal-500/40 text-teal-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Register New Patient</h2>
              <p className="text-xs text-stone-400">Clinical & Family Caregiver Registration Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Basic Elder Details */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Elder Identification & Demographics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Biren Phukan / Maya Devi"
                  required
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  min="40"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm font-bold text-stone-900 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 focus:bg-white rounded-xl px-3 py-2.5 text-sm font-bold text-stone-800 outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Region / Homeland
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 focus:bg-white rounded-xl px-3 py-2.5 text-sm font-bold text-stone-800 outline-none"
                >
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Preferred Dialect & Photo Avatar */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-3 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-teal-600" />
              <span>Language & Photo Avatar</span>
            </h3>

            <div className="mb-3">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Primary Spoken Language / Dialect
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      language === l.code
                        ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-stone-900">{l.label}</p>
                    <p className="text-[11px] text-teal-700 font-medium">{l.native}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Select Elder Avatar
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.label}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`p-1 rounded-2xl border-2 transition-all cursor-pointer ${
                      avatarUrl === av.url
                        ? 'border-teal-600 ring-2 ring-teal-500/40 scale-105 shadow-md'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Cultural & Personal Interests */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Cultural Personalization & Memories</span>
            </h3>
            <p className="text-xs text-stone-500 mb-2.5">
              Select memory triggers and themes that Mind Mithra will incorporate into games and reminiscing:
            </p>
            <div className="flex flex-wrap gap-2">
              {CULTURAL_INTERESTS_LIST.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Caregiver & Medical Profile */}
          <div className="pt-2 border-t border-stone-200">
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Caregiver Contact & Clinical Notes</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Primary Caregiver Name
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="e.g. Dr. Baruah / Sunita"
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-stone-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Emergency Phone Contact
                </label>
                <input
                  type="text"
                  value={caregiverContact}
                  onChange={(e) => setCaregiverContact(e.target.value)}
                  placeholder="+91 98640 12345"
                  className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-stone-900 outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Medical & Cognitive Notes (Optional)
              </label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Early-stage Alzheimer's, Mild memory fatigue, Diabetic"
                className="w-full bg-stone-50 border border-stone-300 focus:border-teal-600 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-stone-900 outline-none"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Complete Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
