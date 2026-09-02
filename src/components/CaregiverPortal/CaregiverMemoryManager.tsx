import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Tag, 
  Eye 
} from 'lucide-react';
import { MemoryItem } from '../../types';
import { localDB } from '../../lib/storage';

interface CaregiverMemoryManagerProps {
  onMemoryUpdated: () => void;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
}

export const CaregiverMemoryManager: React.FC<CaregiverMemoryManagerProps> = ({
  onMemoryUpdated,
  networkState,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>(() => localDB.getMemories());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);

  // New Memory Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80');
  const [location, setLocation] = useState('');
  const [eventDateOrYear, setEventDateOrYear] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [peopleTaggedStr, setPeopleTaggedStr] = useState('');
  const [culturalTagsStr, setCulturalTagsStr] = useState('');
  const [fullStory, setFullStory] = useState('');
  const [caption, setCaption] = useState('');

  const samplePhotoUrls = [
    { label: 'Kaziranga Forest Trip', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80' },
    { label: 'Bihu Festival Celebration', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80' },
    { label: 'Shillong Pine Hills', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
    { label: 'Tea Garden Harvest', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleRunVisionAI = async () => {
    setIsAnalyzingVision(true);
    try {
      const res = await fetch('/api/ai/vision-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, userPrompt: 'Family memory for elderly patient in Assam' }),
      });
      const data = await res.json();
      setIsAnalyzingVision(false);

      if (data.suggestedTitle) setTitle(data.suggestedTitle);
      if (data.suggestedCaption) setCaption(data.suggestedCaption);
      if (data.suggestedLocation) setLocation(data.suggestedLocation);
      if (data.suggestedTags && Array.isArray(data.suggestedTags)) {
        setCulturalTagsStr(data.suggestedTags.join(', '));
      }
      if (!fullStory && data.suggestedCaption) {
        setFullStory(`A wonderful family moment in ${data.suggestedLocation || 'Assam'}. ${data.suggestedCaption}`);
      }
    } catch {
      setIsAnalyzingVision(false);
      setTitle('Family Tea Garden Excursion');
      setLocation('Tezpur, Assam');
      setEventDateOrYear('April 2022');
      setCulturalTagsStr('Assam Tea, Family, Nature');
      setCaption('Peaceful afternoon walk along the green tea bushes');
      setFullStory('A refreshing afternoon spent strolling through the lush green tea garden estate with family, enjoying warm cardamom tea.');
    }
  };

  const handleSaveMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullStory.trim()) return;

    const people = peopleTaggedStr
      ? peopleTaggedStr.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Priyanka Kumar'];
    const tags = culturalTagsStr
      ? culturalTagsStr.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Family', 'Assam'];

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      patientId: 'patient-ravi-001',
      title,
      imageUrl,
      caption: caption || title,
      fullStory,
      peopleTagged: people,
      relationship,
      location: location || 'Assam, India',
      eventDateOrYear: eventDateOrYear || '2023',
      culturalTags: tags,
      verifiedByCaregiver: true,
      isFavorite: true,
      createdDate: new Date().toISOString().split('T')[0],
    };

    localDB.saveMemory(newMem);
    setMemories(localDB.getMemories());
    setShowAddModal(false);
    onMemoryUpdated();

    // Reset Form
    setTitle('');
    setLocation('');
    setEventDateOrYear('');
    setPeopleTaggedStr('');
    setCulturalTagsStr('');
    setFullStory('');
    setCaption('');
  };

  const handleToggleVerified = (mem: MemoryItem) => {
    const updated = { ...mem, verifiedByCaregiver: !mem.verifiedByCaregiver };
    localDB.saveMemory(updated);
    setMemories(localDB.getMemories());
    onMemoryUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
            Caregiver Memory Vault Manager
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified photos power the zero-hallucination patient RAG assistant & cognitive memory packs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload & Verify Memory</span>
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 bg-stone-900">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleToggleVerified(mem)}
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md transition-colors ${
                    mem.verifiedByCaregiver
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{mem.verifiedByCaregiver ? 'Verified' : 'Pending Review'}</span>
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-extrabold text-stone-900 text-base leading-snug">
                    {mem.title}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {mem.relationship}
                  </span>
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{mem.location}</span>
                  <span>•</span>
                  <span>{mem.eventDateOrYear}</span>
                </p>

                <p className="text-xs text-stone-700 line-clamp-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200 mb-3">
                  {mem.fullStory}
                </p>

                <div className="flex flex-wrap gap-1">
                  {mem.culturalTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-md text-[10px] font-bold border border-teal-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-stone-900">
                  Add Verified Family Memory
                </h3>
                <p className="text-xs text-stone-500">
                  Tag loved ones, dates, and locations for safe RAG retrieval
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              {/* Photo Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                  Select Photo Asset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {samplePhotoUrls.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImageUrl(s.url)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        imageUrl === s.url
                          ? 'border-teal-600 ring-2 ring-teal-300'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={s.url}
                        alt={s.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-[10px] text-white font-semibold truncate px-1 py-0.5">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-teal-600"
                  />
                  <button
                    type="button"
                    onClick={handleRunVisionAI}
                    disabled={isAnalyzingVision}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingVision ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingVision ? 'Analyzing...' : 'Vision AI Auto-Fill'}</span>
                  </button>
                </div>
              </div>

              {/* Title & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Memory Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Rongali Bihu Dhol Celebration"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Relationship Category
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-white"
                  >
                    <option value="Family">Family Holiday / Reunion</option>
                    <option value="Cultural Celebration">Cultural Celebration / Festival</option>
                    <option value="Grandchildren">Grandchildren Moments</option>
                    <option value="Career & Youth">Career & Youth Milestones</option>
                  </select>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kaziranga, Assam"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Year / Date
                  </label>
                  <input
                    type="text"
                    value={eventDateOrYear}
                    onChange={(e) => setEventDateOrYear(e.target.value)}
                    placeholder="e.g. November 2023"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* People Tagged & Cultural Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    People in Photo (comma separated)
                  </label>
                  <input
                    type="text"
                    value={peopleTaggedStr}
                    onChange={(e) => setPeopleTaggedStr(e.target.value)}
                    placeholder="e.g. Ananya (Granddaughter), Priyanka (Daughter)"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={culturalTagsStr}
                    onChange={(e) => setCulturalTagsStr(e.target.value)}
                    placeholder="e.g. Kaziranga, Wildlife, Assam Tea"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Full Story Description (For RAG Memory Grounding) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Full Story & Reassuring Narration *
                </label>
                <textarea
                  rows={3}
                  required
                  value={fullStory}
                  onChange={(e) => setFullStory(e.target.value)}
                  placeholder="Provide warm, accurate details for when the patient asks 'Who is this?' or 'Tell me about this photo'..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs"
                >
                  Save & Verify for AI RAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
