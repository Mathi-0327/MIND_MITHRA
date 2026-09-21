import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowLeft, 
  Volume2, 
  Phone, 
  Sparkles, 
  Heart, 
  Plus, 
  MapPin, 
  CheckCircle2,
  X,
  Play,
  Square,
  Search,
  Layers,
  Grid,
  Trash2,
  Edit3,
  UserPlus,
  RefreshCw,
  Award
} from 'lucide-react';
import { FamilyMember, PatientProfile, SupportedLanguage } from '../../types';
import { localDB } from '../../lib/storage';
import { audioService } from '../../lib/audioService';

interface FamilyTreeViewProps {
  onBack: () => void;
  patient: PatientProfile;
  language: SupportedLanguage;
}

type ViewMode = 'CARDS' | 'TREE';
type KinshipFilter = 'ALL' | 'SPOUSE_ELDERS' | 'CHILDREN' | 'GRANDCHILDREN' | 'PETS_FRIENDS';

// Curated avatar presets for Indian / cultural family members
const PRESET_AVATARS = [
  { label: 'Daughter / Adult Woman', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  { label: 'Son / Adult Man', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Granddaughter / Young Girl', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80' },
  { label: 'Grandson / Young Boy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { label: 'Elder Sister / Aunt', url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80' },
  { label: 'Elder Brother / Uncle', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Doctor / In-Law', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { label: 'Beloved Spouse (Late)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Toddler Grandchild', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
  { label: 'Golden Retriever Pet', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Friendly Companion Dog', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80' },
];

export function FamilyTreeView({ onBack, patient, language }: FamilyTreeViewProps) {
  const [members, setMembers] = useState<FamilyMember[]>(() => localDB.getFamilyMembers(patient.id));
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [filter, setFilter] = useState<KinshipFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [callingMember, setCallingMember] = useState<FamilyMember | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Daughter');
  const [formDetail, setFormDetail] = useState('');
  const [formLocation, setFormLocation] = useState(`${patient.region}`);
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formStory, setFormStory] = useState('');
  const [formVoiceNote, setFormVoiceNote] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [formIsCaregiver, setFormIsCaregiver] = useState(false);

  const refreshMembers = () => {
    setMembers(localDB.getFamilyMembers(patient.id));
  };

  useEffect(() => {
    refreshMembers();
  }, [patient.id]);

  // Voice playback with SpeechSynthesis
  const speakText = (text: string, memberId: string) => {
    if (playingVoiceId === memberId) {
      audioService.stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }
    setPlayingVoiceId(memberId);
    audioService.speak(text, () => setPlayingVoiceId(null));
  };


  // Open Quick Preset template
  const handleApplyPreset = (presetType: string) => {
    const firstName = patient.name.split(' ')[0];
    let name = '';
    let rel = 'Daughter';
    let detail = '';
    let avatar = PRESET_AVATARS[0].url;
    let story = '';
    let voice = '';

    switch (presetType) {
      case 'Sister':
        name = 'Kamala Devi';
        rel = 'Sister';
        detail = `Elder Sister (Age 76, Resides in Jorhat)`;
        avatar = PRESET_AVATARS[4].url;
        story = `Grew up together enjoying courtyard tea, childhood songs, and garden walks.`;
        voice = `${firstName} Bhai, sending you warmest blessings and love. Stay cheerful today!`;
        break;
      case 'Brother':
        name = 'Dhiren Kumar';
        rel = 'Brother';
        detail = `Younger Brother (Retired Agricultural Officer, Tezpur)`;
        avatar = PRESET_AVATARS[5].url;
        story = `Visits for festive Rongali Bihu and brings fresh garden harvest and sweet coconut laddu.`;
        voice = `Deuta/Bhai, wishing you good health! I will come visit this coming month!`;
        break;
      case 'Grandson':
        name = 'Rahul Kumar';
        rel = 'Grandson';
        detail = `Elder Grandson (Age 14, Football & Chess Enthusiast)`;
        avatar = PRESET_AVATARS[3].url;
        story = `Loves playing Saturday afternoon chess on the veranda with Koka while drinking sweet milk tea.`;
        voice = `Koka! We won our school match yesterday! I dedicated the winning goal to you!`;
        break;
      case 'Granddaughter':
        name = 'Ananya Kumar';
        rel = 'Granddaughter';
        detail = `Loving Granddaughter (Age 8)`;
        avatar = PRESET_AVATARS[2].url;
        story = `Loves sitting on your lap listening to traditional bedtime folklore tales of Majuli island.`;
        voice = `Koka! I drew a colorful picture of our courtyard birds for you! See you this weekend!`;
        break;
      case 'Son-in-law':
        name = 'Dr. Anand Sharma';
        rel = 'Son-in-law';
        detail = `Son-in-law & Doctor (Family Physician)`;
        avatar = PRESET_AVATARS[6].url;
        story = `Coordinates morning health routines, hydration, and gentle physical wellness checkups.`;
        voice = `Namaskar! Make sure to take your morning warm water and enjoy the soft morning sunlight.`;
        break;
      case 'Daughter-in-law':
        name = 'Nilakshi Kumar';
        rel = 'Daughter-in-law';
        detail = `Daughter-in-law (High School Teacher)`;
        avatar = PRESET_AVATARS[0].url;
        story = `Brings homemade sweet Pitha and seasonal organic Assam tea leaves every holiday.`;
        voice = `Wishing you a blessed and serene day! We are bringing fresh snacks for you!`;
        break;
      case 'Lifelong Friend':
        name = 'Prof. Amal Dutta';
        rel = 'Lifelong Friend';
        detail = `College Batchmate & Chess Partner of 50 Years`;
        avatar = PRESET_AVATARS[5].url;
        story = `Met at university in 1972 and met every month for tea, literature, and friendly chess.`;
        voice = `My dear friend! Thinking of our golden university years and our next cup of hot tea!`;
        break;
      case 'Family Pet':
        name = 'Sheru';
        rel = 'Family Pet';
        detail = `Loyal Golden Retriever (Age 4)`;
        avatar = PRESET_AVATARS[9].url;
        story = `Sheru loves walking beside you during morning garden strolls and resting his head gently on your feet.`;
        voice = `Sheru wags his tail and waits gently by your chair in the sun-drenched veranda every afternoon.`;
        break;
      default:
        name = 'Rumi Bora';
        rel = 'Daughter';
        detail = `Loving Daughter & Primary Caregiver`;
        avatar = PRESET_AVATARS[0].url;
        story = `Always by your side ensuring comfort, warm tea, and daily peace.`;
        voice = `Remember I am right here with you! You are doing wonderfully today!`;
        break;
    }

    setFormName(name);
    setFormRelation(rel);
    setFormDetail(detail);
    setFormAvatarUrl(avatar);
    setFormLocation(`${patient.region}`);
    setFormStory(story);
    setFormVoiceNote(voice);
    setFormIsCaregiver(rel === 'Primary Caregiver' || rel.includes('Caregiver'));
    setEditingMemberId(null);
    setIsAddingMember(true);
  };

  // Submit Add or Edit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newMem: FamilyMember = {
      id: editingMemberId || `fam-${Date.now()}`,
      patientId: patient.id,
      name: formName.trim(),
      relation: formRelation,
      relationDetail: formDetail.trim() || `${formRelation} of ${patient.name.split(' ')[0]}`,
      avatarUrl: formAvatarUrl,
      location: formLocation.trim() || `${patient.region}`,
      phoneNumber: formPhone.trim(),
      voiceNoteText: formVoiceNote.trim() || `Warmest blessings and loving thoughts from ${formName.trim()}!`,
      sharedStory: formStory.trim() || `Cherished moments and family memories together with ${formName.trim()}.`,
      keyMemories: ['Family Gatherings', 'Holiday Celebrations'],
      isPrimaryCaregiver: formIsCaregiver || formRelation === 'Primary Caregiver',
    };

    if (editingMemberId) {
      localDB.updateFamilyMember(newMem);
    } else {
      localDB.addFamilyMember(newMem);
    }

    refreshMembers();
    setIsAddingMember(false);
    setEditingMemberId(null);
    audioService.playFeedbackSound('SUCCESS');
  };

  // Edit existing member
  const handleStartEdit = (m: FamilyMember) => {
    setEditingMemberId(m.id);
    setFormName(m.name);
    setFormRelation(m.relation);
    setFormDetail(m.relationDetail);
    setFormAvatarUrl(m.avatarUrl);
    setFormLocation(m.location);
    setFormPhone(m.phoneNumber || '+91 ');
    setFormStory(m.sharedStory);
    setFormVoiceNote(m.voiceNoteText);
    setFormIsCaregiver(!!m.isPrimaryCaregiver);
    setIsAddingMember(true);
  };

  // Delete member
  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from family tree?`)) {
      localDB.deleteFamilyMember(id);
      refreshMembers();
      audioService.playFeedbackSound('GENTLE_TAP');
    }
  };

  // Simulate call
  const handleSimulateCall = (member: FamilyMember) => {
    setCallingMember(member);
    audioService.playFeedbackSound('GENTLE_TAP');
    setTimeout(() => {
      speakText(`Hello ${patient.name.split(' ')[0]}! This is ${member.name}. It is so wonderful to hear from you. Everything is peaceful here at home!`, member.id);
    }, 1200);
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = m.name.toLowerCase().includes(q) || 
                    m.relation.toLowerCase().includes(q) || 
                    m.relationDetail.toLowerCase().includes(q) ||
                    m.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Kinship category filter
    if (filter === 'SPOUSE_ELDERS') {
      return ['Spouse', 'Sister', 'Brother', 'Aunt', 'Uncle', 'Late Spouse'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()));
    }
    if (filter === 'CHILDREN') {
      return ['Daughter', 'Son', 'Son-in-law', 'Daughter-in-law', 'Primary Caregiver'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()));
    }
    if (filter === 'GRANDCHILDREN') {
      return ['Granddaughter', 'Grandson', 'Niece', 'Nephew'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()));
    }
    if (filter === 'PETS_FRIENDS') {
      return ['Pet', 'Dog', 'Friend', 'Neighbor'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()));
    }
    return true;
  });

  // Generational Categorization for Tree View
  const eldersAndSpouse = members.filter(m => 
    ['Spouse', 'Sister', 'Brother', 'Aunt', 'Uncle'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()))
  );
  const childrenAndInLaws = members.filter(m => 
    ['Daughter', 'Son', 'Son-in-law', 'Daughter-in-law', 'Primary Caregiver'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()))
  );
  const grandchildrenAndYouth = members.filter(m => 
    ['Granddaughter', 'Grandson', 'Niece', 'Nephew'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()))
  );
  const companionsAndPets = members.filter(m => 
    ['Pet', 'Dog', 'Friend', 'Neighbor'].some(r => m.relation.toLowerCase().includes(r.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              audioService.playFeedbackSound('GENTLE_TAP');
              onBack();
            }}
            className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Back to Home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Loving Kinship Tree
              </span>
              <span className="text-xs text-stone-500 font-medium">{members.length} Kinship Connections</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">Family Tree & Loving Bonds</h1>
            <p className="text-sm text-stone-600">
              Cherish your beloved relatives across generations, listen to their voice messages, and connect instantly.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setEditingMemberId(null);
              setFormName('');
              setFormRelation('Daughter');
              setFormDetail('');
              setFormLocation(patient.region);
              setFormPhone('+91 ');
              setFormStory('');
              setFormVoiceNote('');
              setFormAvatarUrl(PRESET_AVATARS[0].url);
              setFormIsCaregiver(false);
              setIsAddingMember(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl shadow-sm transition text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Patient Root Anchor Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 z-10">
          <div className="relative">
            <img
              src={patient.avatarUrl}
              alt={patient.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-md"
            />
            <span className="absolute bottom-0 right-0 bg-amber-700 text-white p-1.5 rounded-full shadow">
              <Heart className="w-4 h-4 fill-current text-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-900 bg-amber-200 px-3 py-0.5 rounded-full">
                Head of the Family Circle
              </span>
              <span className="text-xs text-stone-600 font-semibold">{patient.region}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mt-1">{patient.name}</h2>
            <p className="text-sm text-stone-700 flex items-center justify-center md:justify-start mt-0.5">
              <MapPin className="w-4 h-4 mr-1 text-amber-700" />
              {patient.region} • Age {patient.age} • Native Language: {patient.preferredLanguage?.toUpperCase() || 'EN'}
            </p>
            <p className="text-xs text-stone-600 mt-2 italic max-w-xl">
              "Surrounded by loving children, grandchildren, faithful companions, and cherished lifelong memories."
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-2xl border border-amber-200 shadow-sm text-center shrink-0 z-10">
          <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Kinship Circle</p>
          <p className="text-3xl font-black text-amber-950 mt-0.5">{members.length}</p>
          <p className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Active & Connected
          </p>
        </div>
      </div>

      {/* Quick 1-Click "Add Relative Preset" Strip */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
            <UserPlus className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
            Quick-Add Relatives:
          </span>
          <span className="text-xs text-stone-500">Tap any role to pre-fill instantly</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { label: '+ Sister', role: 'Sister' },
            { label: '+ Brother', role: 'Brother' },
            { label: '+ Grandson', role: 'Grandson' },
            { label: '+ Granddaughter', role: 'Granddaughter' },
            { label: '+ Son-in-law', role: 'Son-in-law' },
            { label: '+ Daughter-in-law', role: 'Daughter-in-law' },
            { label: '+ Lifelong Friend', role: 'Lifelong Friend' },
            { label: '+ Family Pet', role: 'Family Pet' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => handleApplyPreset(item.role)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold whitespace-nowrap transition shadow-xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: View Switcher, Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-stone-200/70 p-1 rounded-2xl text-xs font-bold text-stone-700">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              filter === 'ALL' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            All Kinship ({members.length})
          </button>
          <button
            onClick={() => setFilter('SPOUSE_ELDERS')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              filter === 'SPOUSE_ELDERS' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Spouse & Elders ({eldersAndSpouse.length})
          </button>
          <button
            onClick={() => setFilter('CHILDREN')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              filter === 'CHILDREN' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Children & In-Laws ({childrenAndInLaws.length})
          </button>
          <button
            onClick={() => setFilter('GRANDCHILDREN')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              filter === 'GRANDCHILDREN' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Grandchildren ({grandchildrenAndYouth.length})
          </button>
          <button
            onClick={() => setFilter('PETS_FRIENDS')}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
              filter === 'PETS_FRIENDS' ? 'bg-white text-stone-900 shadow-sm' : 'hover:text-stone-900'
            }`}
          >
            Pets & Friends ({companionsAndPets.length})
          </button>
        </div>

        {/* View Mode & Search */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search relative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* View Switcher: Cards vs Tree */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-xl text-xs font-bold text-stone-700">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'CARDS' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TREE')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'TREE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
              title="Generational Tree Hierarchy"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: KINSHIP CARDS GRID */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isPlaying = playingVoiceId === member.id;
            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative group"
              >
                {/* Primary Caregiver Badge */}
                {member.isPrimaryCaregiver && (
                  <div className="absolute -top-3 right-4 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center space-x-1 z-10">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Primary Caregiver</span>
                  </div>
                )}

                {/* Card Top: Photo & Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-200 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                        {member.relation}
                      </span>
                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleStartEdit(member)}
                          className="p-1 hover:bg-stone-100 text-stone-500 rounded-lg transition"
                          title="Edit Relative"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                          title="Delete Relative"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 truncate mt-1">{member.name}</h3>
                    <p className="text-xs text-stone-500 truncate">{member.relationDetail}</p>
                    <p className="text-xs text-stone-600 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-stone-500 shrink-0" />
                      <span className="truncate">{member.location}</span>
                    </p>
                  </div>
                </div>

                {/* Cherished Memory Box */}
                <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-100 text-xs text-stone-700">
                  <p className="font-bold text-stone-900 mb-1 flex items-center">
                    <Heart className="w-3.5 h-3.5 text-rose-500 mr-1.5 fill-rose-500" />
                    Cherished Memory:
                  </p>
                  <p className="line-clamp-2 italic text-stone-600 leading-relaxed">"{member.sharedStory}"</p>
                </div>

                {/* Actions: Listen to Voice & Call Family */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => speakText(member.voiceNoteText, member.id)}
                    className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-bold text-xs transition ${
                      isPlaying 
                        ? 'bg-rose-600 text-white shadow' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Listen Voice'}</span>
                  </button>

                  <button
                    onClick={() => handleSimulateCall(member)}
                    className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Family</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: GENERATIONAL TREE HIERARCHY */}
      {viewMode === 'TREE' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-8">
          <div className="text-center max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              Generational Lineage Tree
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-2">Family Kinship Flow</h3>
            <p className="text-xs text-stone-600 mt-1">
              Visual generation hierarchy connecting patriarch/matriarch, siblings, children, grandchildren, and home companions.
            </p>
          </div>

          {/* GENERATION 1: Patient + Spouse & Elder Siblings */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-12 bg-amber-300"></span>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
                Generation 1: Patriarch & Elders
              </span>
              <span className="h-px w-12 bg-amber-300"></span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {/* Patient */}
              <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4 text-center w-56 shadow-sm">
                <img
                  src={patient.avatarUrl}
                  alt={patient.name}
                  className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-amber-600 shadow-xs"
                />
                <h4 className="font-bold text-sm text-stone-900 mt-2">{patient.name}</h4>
                <p className="text-xs text-amber-900 font-semibold">Head of Family</p>
              </div>

              {/* Elders / Spouse */}
              {eldersAndSpouse.map((m) => (
                <div key={m.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center w-56 shadow-xs hover:border-amber-300 transition">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-stone-300 shadow-xs"
                  />
                  <h4 className="font-bold text-sm text-stone-900 mt-2">{m.name}</h4>
                  <p className="text-xs text-stone-500">{m.relation}</p>
                  <button
                    onClick={() => speakText(m.voiceNoteText, m.id)}
                    className="mt-2 text-xs text-amber-800 font-bold hover:underline flex items-center justify-center mx-auto"
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-1" />
                    Listen
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GENERATION 2: Children & In-Laws */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-12 bg-emerald-300"></span>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider bg-emerald-100 px-3 py-1 rounded-full">
                Generation 2: Children & In-Laws
              </span>
              <span className="h-px w-12 bg-emerald-300"></span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {childrenAndInLaws.map((m) => (
                <div key={m.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center w-56 shadow-xs hover:border-emerald-300 transition relative">
                  {m.isPrimaryCaregiver && (
                    <span className="absolute -top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Caregiver
                    </span>
                  )}
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-stone-300 shadow-xs"
                  />
                  <h4 className="font-bold text-sm text-stone-900 mt-2">{m.name}</h4>
                  <p className="text-xs text-stone-500">{m.relation}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <button
                      onClick={() => speakText(m.voiceNoteText, m.id)}
                      className="text-xs text-amber-800 font-bold hover:underline flex items-center"
                    >
                      <Volume2 className="w-3.5 h-3.5 mr-1" />
                      Voice
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      onClick={() => handleSimulateCall(m)}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GENERATION 3: Grandchildren & Youth */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-12 bg-purple-300"></span>
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider bg-purple-100 px-3 py-1 rounded-full">
                Generation 3: Grandchildren & Youth
              </span>
              <span className="h-px w-12 bg-purple-300"></span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {grandchildrenAndYouth.map((m) => (
                <div key={m.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center w-56 shadow-xs hover:border-purple-300 transition">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-stone-300 shadow-xs"
                  />
                  <h4 className="font-bold text-sm text-stone-900 mt-2">{m.name}</h4>
                  <p className="text-xs text-stone-500">{m.relation}</p>
                  <button
                    onClick={() => speakText(m.voiceNoteText, m.id)}
                    className="mt-2 text-xs text-purple-800 font-bold hover:underline flex items-center justify-center mx-auto"
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-1" />
                    Listen
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COMPANIONS & PETS */}
          {companionsAndPets.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider bg-stone-100 px-3 py-1 rounded-full">
                  Home Companions & Lifelong Friends
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {companionsAndPets.map((m) => (
                  <div key={m.id} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-center w-56 shadow-xs">
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-amber-300 shadow-xs"
                    />
                    <h4 className="font-bold text-sm text-stone-900 mt-2">{m.name}</h4>
                    <p className="text-xs text-stone-600">{m.relation}</p>
                    <button
                      onClick={() => speakText(m.voiceNoteText, m.id)}
                      className="mt-2 text-xs text-amber-900 font-bold hover:underline flex items-center justify-center mx-auto"
                    >
                      <Volume2 className="w-3.5 h-3.5 mr-1" />
                      Listen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulated High Clarity Phone Call Modal */}
      {callingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="relative mx-auto w-28 h-28">
              <img
                src={callingMember.avatarUrl}
                alt={callingMember.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2 rounded-full animate-pulse">
                <Phone className="w-5 h-5" />
              </span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Connected Call • Audio Clear
              </span>
              <h3 className="text-2xl font-bold text-stone-900 mt-2">{callingMember.name}</h3>
              <p className="text-sm text-stone-500">{callingMember.relationDetail}</p>
              <p className="text-xs text-stone-600 mt-0.5">{callingMember.location}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-sm text-stone-800 leading-relaxed italic">
              "{callingMember.voiceNoteText}"
            </div>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setCallingMember(null);
                setPlayingVoiceId(null);
                audioService.playFeedbackSound('GENTLE_TAP');
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow transition text-sm"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Family Member Modal */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-amber-700" />
                <h3 className="text-xl font-bold text-stone-900">
                  {editingMemberId ? 'Edit Relative Details' : 'Add Relative to Family Tree'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddingMember(false)}
                className="p-2 text-stone-400 hover:text-stone-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-left">
              {/* Photo Avatar Preset Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-2">Choose Avatar Photo</label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormAvatarUrl(av.url)}
                      className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        formAvatarUrl === av.url ? 'border-amber-600 scale-105 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                      title={av.label}
                    >
                      <img src={av.url} alt={av.label} className="w-12 h-12 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deben Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase">Relationship</label>
                  <select
                    value={formRelation}
                    onChange={(e) => {
                      setFormRelation(e.target.value);
                      if (e.target.value === 'Primary Caregiver') setFormIsCaregiver(true);
                    }}
                    className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Granddaughter">Granddaughter</option>
                    <option value="Grandson">Grandson</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Son-in-law">Son-in-law</option>
                    <option value="Daughter-in-law">Daughter-in-law</option>
                    <option value="Primary Caregiver">Primary Caregiver</option>
                    <option value="Lifelong Friend">Lifelong Friend</option>
                    <option value="Family Pet">Family Pet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98XXX XXXXX"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase">Relationship Detail / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Elder Daughter & Primary Caregiver"
                  value={formDetail}
                  onChange={(e) => setFormDetail(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase">Location / Hometown</label>
                <input
                  type="text"
                  placeholder="e.g. Guwahati, Assam"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase">Spoken Voice Greeting Note</label>
                <textarea
                  rows={2}
                  placeholder="Warm message the app will speak aloud when elder taps Listen to Voice..."
                  value={formVoiceNote}
                  onChange={(e) => setFormVoiceNote(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase">Cherished Memory Hook</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Loved plucking tea leaves in Tezpur and playing veranda chess together."
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="caregiverCheck"
                  checked={formIsCaregiver}
                  onChange={(e) => setFormIsCaregiver(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="caregiverCheck" className="text-xs font-semibold text-stone-700">
                  Mark as Primary Caregiver Contact
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow text-sm"
                >
                  {editingMemberId ? 'Update Relative' : 'Save to Family Tree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
