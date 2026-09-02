import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Heart,
  Mic,
  MicOff,
  Check,
  Tag,
  BookOpen
} from 'lucide-react';
import { MemoryItem } from '../../types';
import { audioService } from '../../lib/audioService';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMemory: (newMemory: MemoryItem) => void;
  patientName: string;
}

interface PhotoPreset {
  id: string;
  name: string;
  region: string;
  url: string;
  defaultLocation: string;
  defaultRelationship: string;
  defaultTags: string[];
}

const REGIONAL_PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'tea-garden',
    name: 'Assam Tea Estate Morning Walk',
    region: 'Jorhat & Dibrugarh',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Jorhat Tea Estate, Assam',
    defaultRelationship: 'Peaceful Routine',
    defaultTags: ['Tea Garden', 'Morning Walk', 'Assam Greenery'],
  },
  {
    id: 'kaziranga',
    name: 'Kaziranga Safari with Granddaughter',
    region: 'Golaghat',
    url: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Kaziranga National Park, Assam',
    defaultRelationship: 'Granddaughter & Family',
    defaultTags: ['Kaziranga', 'Wildlife', 'Family Holiday'],
  },
  {
    id: 'bihu-dhol',
    name: 'Rongali Bihu Spring Celebration',
    region: 'Tezpur',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Tezpur Courtyard, Assam',
    defaultRelationship: 'Cultural Celebration',
    defaultTags: ['Bihu', 'Folk Music', 'Pitha', 'Dhol'],
  },
  {
    id: 'shillong-pine',
    name: 'Shillong Pine Hills & Cherry Blossoms',
    region: 'Meghalaya',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Ward Lake, Shillong, Meghalaya',
    defaultRelationship: 'Family Excursion',
    defaultTags: ['Shillong', 'Pine Trees', 'Cool Breeze'],
  },
  {
    id: 'brahmaputra-river',
    name: 'Brahmaputra River Sunset Ferry',
    region: 'Guwahati & Tezpur',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Brahmaputra River Ghat, Tezpur',
    defaultRelationship: 'Childhood & Youth',
    defaultTags: ['Brahmaputra', 'River', 'Sunset Peace'],
  },
  {
    id: 'majuli-sattra',
    name: 'Majuli Sattra Devotional Prayers',
    region: 'Majuli Island',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    defaultLocation: 'Kamalabari Sattra, Majuli, Assam',
    defaultRelationship: 'Spiritual Peace',
    defaultTags: ['Majuli', 'Namghar', 'Sankardev', 'Prayers'],
  },
];

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onSaveMemory,
  patientName,
}) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(REGIONAL_PHOTO_PRESETS[0].url);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(REGIONAL_PHOTO_PRESETS[0].id);
  const [location, setLocation] = useState(REGIONAL_PHOTO_PRESETS[0].defaultLocation);
  const [eventDateOrYear, setEventDateOrYear] = useState('Spring 2023');
  const [peopleTagged, setPeopleTagged] = useState('Priyanka, Ananya');
  const [relationship, setRelationship] = useState('Family');
  const [story, setStory] = useState('');
  const [culturalTags, setCulturalTags] = useState('Assam, Family, Joy');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  if (!isOpen) return null;

  // Handle Preset selection
  const handleSelectPreset = (preset: PhotoPreset) => {
    setSelectedPresetId(preset.id);
    setImageUrl(preset.url);
    if (!location || location === REGIONAL_PHOTO_PRESETS.find((p) => p.id === selectedPresetId)?.defaultLocation) {
      setLocation(preset.defaultLocation);
    }
    if (!relationship || relationship === 'Family') {
      setRelationship(preset.defaultRelationship);
    }
    if (!culturalTags) {
      setCulturalTags(preset.defaultTags.join(', '));
    }
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  // Handle local image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
        setSelectedPresetId('custom-upload');
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      }
    };
    reader.readAsDataURL(file);
    audioService.playFeedbackSound('GENTLE_TAP');
  };

  // Voice Dictation for Story
  const toggleVoiceDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your memory in the text box below.');
      return;
    }

    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        audioService.playFeedbackSound('CHIME');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStory((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecordingVoice(false);
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecordingVoice(false);
    }
  };

  // AI Smart Story & Caption Generator
  const handleGenerateAIStory = async () => {
    setIsGeneratingAi(true);
    audioService.playFeedbackSound('GENTLE_TAP');

    try {
      const res = await fetch('/api/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          userPrompt: `Memory Title: ${title || 'Family Moment'}. Location: ${location}. People: ${peopleTagged}. Date: ${eventDateOrYear}.`,
        }),
      });

      const data = await res.json();
      setIsGeneratingAi(false);

      if (data.title && !title) setTitle(data.title);
      if (data.caption && !story) setStory(data.caption);
      if (data.locationGuess && !location) setLocation(data.locationGuess);
      if (Array.isArray(data.suggestedTags)) {
        setCulturalTags(data.suggestedTags.join(', '));
      }
      audioService.playFeedbackSound('CHIME');
    } catch {
      setIsGeneratingAi(false);
      // Local fallback enhancement
      if (!story) {
        setStory(
          `A wonderful day in ${location || 'Assam'} with loved ones (${peopleTagged || 'Family'}). We shared warm tea, peaceful smiles, and cherished every quiet moment together.`
        );
      }
    }
  };

  // Submit and Save Memory
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a short title for your memory.');
      return;
    }

    const peopleList = peopleTagged
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const tagsList = culturalTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newMemoryItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      patientId: 'patient-ravi-001',
      title: title.trim(),
      imageUrl: imageUrl || REGIONAL_PHOTO_PRESETS[0].url,
      caption: story.slice(0, 120) || title.trim(),
      fullStory:
        story.trim() ||
        `This memory was captured in ${location || 'Assam'} around ${eventDateOrYear || 'recent times'}. Cherished time spent with ${peopleTagged || 'family'}.`,
      peopleTagged: peopleList.length > 0 ? peopleList : [patientName, 'Family'],
      relationship: relationship.trim() || 'Family',
      location: location.trim() || 'Assam, North East India',
      eventDateOrYear: eventDateOrYear.trim() || 'Recent',
      culturalTags: tagsList.length > 0 ? tagsList : ['Family', 'North East India'],
      verifiedByCaregiver: true,
      isFavorite: true,
      createdDate: new Date().toISOString().split('T')[0],
    };

    onSaveMemory(newMemoryItem);
    audioService.playFeedbackSound('CHIME');
    audioService.speak(
      `Your memory "${newMemoryItem.title}" has been saved safely into your vault, ${patientName.split(' ')[0]}!`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border-2 border-stone-300 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
                Add a Precious Memory
              </h3>
              <p className="text-xs text-stone-500">
                Preserve moments, loved ones & cherished places in your vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* 1. Photo Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              1. Choose or Upload a Photo
            </label>

            {/* Current Image Preview */}
            <div className="relative h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-stone-300 bg-stone-900 shadow-inner group">
              <img
                src={imageUrl}
                alt="Selected memory"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs">
                  <span className="font-bold block text-sm">
                    {title || 'Photo Preview'}
                  </span>
                  <span className="text-stone-300">{location || 'Assam, North East India'}</span>
                </div>
              </div>
            </div>

            {/* Upload Button & Presets Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Upload From Your Device</span>
              </button>
              <span className="text-[11px] font-semibold text-stone-500">
                or pick a regional memory scene:
              </span>
            </div>

            {/* Presets Horizontal Carousel */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              {REGIONAL_PHOTO_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 text-left ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-12 object-cover rounded-lg mb-1"
                    />
                    <span className="text-[10px] font-bold text-stone-800 block truncate leading-tight">
                      {preset.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-stone-500 block truncate">
                      {preset.region}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Memory Details Fields */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider block">
              2. Memory Details
            </label>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Memory Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Granddaughter Ananya's Birthday at Kaziranga"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-sm text-stone-900"
              />
            </div>

            {/* Location & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Where was this? (Location)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Tezpur, Assam"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>When did this happen? (Year/Season)</span>
                </label>
                <input
                  type="text"
                  value={eventDateOrYear}
                  onChange={(e) => setEventDateOrYear(e.target.value)}
                  placeholder="e.g., November 2023 or Spring 1995"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold text-stone-900"
                />
              </div>
            </div>

            {/* People & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Who was with you? (Loved Ones)</span>
                </label>
                <input
                  type="text"
                  value={peopleTagged}
                  onChange={(e) => setPeopleTagged(e.target.value)}
                  placeholder="e.g., Priyanka (Daughter), Ananya"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Category / Relationship</span>
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-semibold text-stone-900 bg-white"
                >
                  <option value="Family">Family Holiday & Outing</option>
                  <option value="Granddaughter">Grandchildren Moments</option>
                  <option value="Cultural Celebration">Festival & Folk Celebration</option>
                  <option value="Youth & Work">Youth & Work Memories</option>
                  <option value="Spiritual Peace">Namghar & Prayers</option>
                  <option value="Daily Joy">Daily Garden & Tea Joy</option>
                </select>
              </div>
            </div>

            {/* Story Box with Voice Dictation & AI Assistant */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tell the Story & Special Details</span>
                </label>

                <div className="flex items-center gap-2">
                  {/* Voice Dictation */}
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isRecordingVoice
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="Speak your story"
                  >
                    {isRecordingVoice ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-rose-600" />
                        <span>Speak Story</span>
                      </>
                    )}
                  </button>

                  {/* AI Smart Assist */}
                  <button
                    type="button"
                    onClick={handleGenerateAIStory}
                    disabled={isGeneratingAi}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isGeneratingAi ? 'Enhancing...' : 'AI Story Assist'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Describe what happened on this day, what you talked about, what you ate, or the songs you sang..."
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium text-stone-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save to Memory Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
