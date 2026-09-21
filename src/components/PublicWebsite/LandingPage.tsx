import React, { useState, useEffect } from 'react';
import {
  Brain,
  Heart,
  Users,
  Shield,
  Mic,
  Gamepad2,
  Camera,
  Wifi,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Clock,
  BarChart3,
  Volume2,
  Eye,
  Star,
  Globe,
  Lock,
  Phone,
  MessageCircle,
  Stethoscope,
  Activity,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onCaregiverPortal?: () => void;
  onPatientPortal?: () => void;
  authError?: string | null;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Activities', href: '#activities' },
  { label: 'For Families', href: '#families' },
  { label: 'Technology', href: '#technology' },
];

const FEATURES = [
  {
    icon: <Brain className="w-7 h-7 text-violet-600" />,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    title: 'Adaptive Cognitive Games',
    description:
      'Memory, attention, pattern recognition, routine recall, language, spatial awareness — AI-tailored activities adapted to individual cognitive performance charts.',
  },
  {
    icon: <Mic className="w-7 h-7 text-teal-600" />,
    color: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    title: 'Voice AI Companion',
    description:
      'Natural voice interaction in 10 regional Indian languages. The elder speaks comfortably; Mind Mithra listens and responds with warmth.',
  },
  {
    icon: <Heart className="w-7 h-7 text-rose-600" />,
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    title: 'Memory & Reminiscence',
    description:
      'Cherished family photos, personalized voice messages, cultural stories, and familiar music — organized for easy single-tap access.',
  },
  {
    icon: <Camera className="w-7 h-7 text-blue-600" />,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'Biometric Face Check-in',
    description:
      'Gentle 5-pose face verification that welcomes the elder every morning by name without passwords or complicated logins.',
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-amber-600" />,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    title: 'Caregiver Telemetry',
    description:
      'Real-time activity tracking, longitudinal cognitive trends, reminder adherence, and structured AI behavioral summaries for family members.',
  },
  {
    icon: <Shield className="w-7 h-7 text-red-600" />,
    color: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    title: 'Emergency SOS & Safety',
    description:
      'One-tap emergency call with pre-configured family contacts, sundowning reassurance, and location alerts for complete peace of mind.',
  },
  {
    icon: <Wifi className="w-7 h-7 text-emerald-600" />,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: '100% Offline-First',
    description:
      'All core activities, voice interactions, memories, and routines work without internet. Data syncs automatically whenever connected.',
  },
  {
    icon: <Globe className="w-7 h-7 text-cyan-600" />,
    color: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    title: '10 Regional Dialects',
    description:
      'Assamese, Bengali, Meitei, Khasi, Mizo, Hindi, Tamil, Garo, Tripuri, and English — culturally grounded and locally relevant.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Set Up Account',
    description: 'Family member or caregiver creates the Mind Mithra account and selects preferred regional language and cultural background.',
    badgeBg: 'bg-violet-100 text-violet-700',
  },
  {
    step: '02',
    title: 'Personalize for the Elder',
    description: 'Add family photos, familiar voice notes, medication schedules, and favorite cultural memories. The elder is greeted by name.',
    badgeBg: 'bg-teal-100 text-teal-700',
  },
  {
    step: '03',
    title: 'Daily Engagement',
    description: 'The elder interacts by natural voice or touch — playing cognitive games, listening to reminiscence radio, and chatting with Mithra.',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
  {
    step: '04',
    title: 'Caregiver Insights',
    description: 'Caregivers review cognitive stability, game progressions, mood logs, and clinical summary reports anytime from their dashboard.',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
];

const DOMAIN_GAMES = [
  { domain: 'Memory', icon: '🧠', games: 3, example: 'Heritage Card Match', desc: 'Visual recognition & pair recall' },
  { domain: 'Attention', icon: '👁️', games: 3, example: 'Wildlife Spotlight', desc: 'Focus & distractor filtering' },
  { domain: 'Routine', icon: '📅', games: 5, example: 'Morning Tea Ritual', desc: 'Step-by-step daily autonomy' },
  { domain: 'Language', icon: '💬', games: 4, example: 'Proverb Recall', desc: 'Cultural proverb completion' },
  { domain: 'Patterns', icon: '✨', games: 2, example: 'Motif Weaver', desc: 'Textile motif sequencing' },
  { domain: 'Spatial', icon: '🧺', games: 4, example: 'Market Sorter', desc: 'Categorical spatial sorting' },
  { domain: 'Puzzles', icon: '🧩', games: 3, example: 'Majuli Mask Assembly', desc: 'Visual assembly & parts' },
  { domain: 'Motor', icon: '⚡', games: 2, example: 'Leaf Catcher', desc: 'Gentle timing & coordination' },
  { domain: 'Relaxation', icon: '🎵', games: 3, example: 'Flute Breathing', desc: 'Acoustic evening calmness' },
  { domain: 'Story', icon: '📖', games: 1, example: 'Photo Stories', desc: 'Family narrative recollection' },
];

const TESTIMONIAL_QUOTES = [
  {
    quote: '"My father recognized his granddaughter\'s photo and smiled for the first time in weeks. Mind Mithra brought that moment of joy to our family."',
    author: 'Priyanka K.',
    role: 'Daughter & Primary Caregiver, Guwahati',
  },
  {
    quote: '"The voice interaction in Assamese means my mother actually uses it every single morning. She converses with Mithra like a thoughtful companion."',
    author: 'Dr. Rajan M.',
    role: 'Geriatric Neurologist, Shillong',
  },
  {
    quote: '"Finally a platform designed for Indian cultural contexts — the tea rituals, folk proverbs, and familiar music make all the difference for our elders."',
    author: 'Anil Debbarma',
    role: 'Caregiver & Volunteer, Imphal',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onCaregiverPortal,
  onPatientPortal,
  authError,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedActivityDomain, setSelectedActivityDomain] = useState<string>('All');
  const [isPlayingAudioDemo, setIsPlayingAudioDemo] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleElderEntry = () => {
    if (onPatientPortal) onPatientPortal();
    else onGetStarted();
  };

  const handleCaregiverEntry = () => {
    if (onCaregiverPortal) onCaregiverPortal();
    else onGetStarted();
  };

  const toggleVoiceDemo = () => {
    setIsPlayingAudioDemo((prev) => !prev);
    if (!isPlayingAudioDemo) {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch {
        // Fallback for browsers with audio restrictions
      }
      setTimeout(() => setIsPlayingAudioDemo(false), 2500);
    }
  };

  const domainCategories = ['All', 'Memory', 'Attention', 'Routine', 'Language', 'Relaxation'];
  const filteredActivities =
    selectedActivityDomain === 'All'
      ? DOMAIN_GAMES
      : DOMAIN_GAMES.filter((g) => g.domain === selectedActivityDomain || (selectedActivityDomain === 'Memory' && ['Memory', 'Patterns', 'Puzzles'].includes(g.domain)));

  const ROTATING_PHRASES = [
    'Familiar Memories.',
    'Cultural Stories.',
    'Voice Companionship.',
    'Mental Vitality.',
    'Family Closeness.',
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [ROTATING_PHRASES.length]);

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] text-slate-900 selection:bg-violet-500 selection:text-white" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ─── AUTH ERROR BANNER ─────────────────────────────────────────────── */}
      {authError && (
        <div className="bg-red-600 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium animate-bounce-gentle">
          Authentication notice: Please sign in with your email and password.
        </div>
      )}

      {/* ─── NAVIGATION (LIGHT THEME) ───────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 py-3' : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
                <Brain className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="leading-tight">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Mind <span className="text-violet-600">Mithra</span>
                </span>
                <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                  Cultural Cognitive Care
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 hover:text-violet-600 relative py-1 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-hover:w-full rounded-full" />
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={handleCaregiverEntry}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-violet-700 bg-slate-100 hover:bg-violet-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-violet-600" />
                <span>Caregiver Portal</span>
              </button>

              <button
                type="button"
                onClick={handleElderEntry}
                className="relative overflow-hidden group px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <span>Get Started</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-5 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 text-slate-700 font-semibold text-sm hover:text-violet-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCaregiverEntry();
                }}
                className="py-2.5 px-3 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl"
              >
                Caregiver Portal
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleElderEntry();
                }}
                className="py-2.5 px-3 bg-violet-600 text-white text-xs font-bold rounded-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO SECTION (PROFESSIONAL LIGHT THEME WITH DYNAMIC ANIMATIONS) ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/50 to-blue-50/60 pt-32 sm:pt-36 pb-20 sm:pb-24 border-b border-slate-100">
        {/* Soft floating background ambient glow orbs & drifting particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/50 blur-3xl animate-pulse-glow" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-indigo-100/40 blur-3xl pointer-events-none animate-float-slow" />
          
          {/* Ambient Floating Sparkles around Title */}
          <div className="hidden sm:block absolute top-28 left-[18%] text-violet-400/80 text-xl animate-sparkle-1">
            ✨
          </div>
          <div className="hidden sm:block absolute top-36 right-[20%] text-amber-400/80 text-2xl animate-sparkle-2">
            🌸
          </div>
          <div className="hidden sm:block absolute top-64 left-[14%] text-teal-400/80 text-lg animate-sparkle-3">
            🌿
          </div>
          <div className="hidden sm:block absolute top-72 right-[15%] text-indigo-400/80 text-xl animate-sparkle-1" style={{ animationDelay: '1.8s' }}>
            💡
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Headline & Copy with Rich Animated Elements */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative">
            {/* Pulsing Glowing Badge */}
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-violet-700 text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-md border border-violet-200 animate-badge-glow transition-all hover:scale-105 duration-300 cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent font-black">
                Cultural Cognitive Care for Every Elder
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Dynamic Animated Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.12] tracking-tight mb-6">
              Cognitive Care.{' '}
              <span className="inline-block relative">
                <span 
                  key={phraseIndex} 
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 animate-gradient-flow transition-all duration-500"
                >
                  {ROTATING_PHRASES[phraseIndex]}
                </span>
              </span>
              <br />
              <span className="text-slate-900">Human Connection.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
              Mind Mithra is a culturally grounded cognitive assistance platform designed to help older adults
              stay mentally engaged, remember loved ones, and remain safely connected with family caregivers.
            </p>

            {/* Centered CTA Buttons with Shimmer, Pulse & Magnetic Animations */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleElderEntry}
                className="relative overflow-hidden group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-violet-300/80 hover:scale-105 active:scale-95 animate-cta-pulse transition-all duration-300 cursor-pointer"
              >
                {/* Button light shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>

              <button
                type="button"
                onClick={handleCaregiverEntry}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-200 hover:border-violet-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-violet-600 group-hover:rotate-12 transition-transform" />
                <span>Caregiver Portal</span>
              </button>

              <button
                type="button"
                onClick={toggleVoiceDemo}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm sm:text-base rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isPlayingAudioDemo ? 'bg-violet-100 text-violet-800 border-2 border-violet-400 shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                {isPlayingAudioDemo && (
                  <span className="absolute inset-0 bg-violet-200/40 animate-pulse pointer-events-none" />
                )}
                <Volume2 className={`w-4 h-4 text-violet-600 ${isPlayingAudioDemo ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudioDemo ? 'Playing Voice Demo...' : 'Listen Voice Preview'}</span>
              </button>
            </div>

            {/* Centered Trust Badges with Micro-Hover Animations */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 hover:text-slate-900 transition-all hover:scale-105 cursor-default group">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-slate-900 transition-all hover:scale-105 cursor-default group">
                <Lock className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Privacy-first design</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-slate-900 transition-all hover:scale-105 cursor-default group">
                <Globe className="w-4 h-4 text-violet-500 group-hover:scale-110 transition-transform" />
                <span>10 regional languages</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-slate-900 transition-all hover:scale-105 cursor-default group">
                <Wifi className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                <span>100% offline-ready</span>
              </div>
            </div>
          </div>

          {/* Device Showcase with Layered Floating Badges */}
          <div className="relative max-w-lg mx-auto">
            {/* Floating Badge 1: Top Left */}
            <div className="hidden sm:flex absolute -top-4 -left-16 z-20 items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-violet-100 animate-float">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                🧠
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">Reminiscence Trigger</p>
                <p className="text-[10px] text-violet-600 font-semibold">Majuli Folk Melody</p>
              </div>
            </div>

            {/* Floating Badge 2: Middle Right */}
            <div className="hidden sm:flex absolute top-1/3 -right-20 z-20 items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-teal-100 animate-float-reverse">
              <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                🎙️
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">10 Regional Dialects</p>
                <p className="text-[10px] text-teal-600 font-semibold">Tamil, Assamese &amp; Hindi</p>
              </div>
            </div>

            {/* Floating Badge 3: Bottom Left */}
            <div className="hidden sm:flex absolute -bottom-6 -left-12 z-20 items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-amber-100 animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                📊
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-900">MMSE Stability Trend</p>
                <p className="text-[10px] text-emerald-600 font-semibold">94.2% Positive Adherence</p>
              </div>
            </div>

            {/* Floating Device Showcase (With Soft Floating Animation & Equalizer) */}
            <div className="relative max-w-sm mx-auto animate-float-slow">
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-200 overflow-hidden p-1.5 group hover:shadow-violet-200/50 hover:shadow-2xl transition-all duration-500">
                <div className="bg-gradient-to-br from-amber-50/90 via-[#FFFDF7] to-orange-50/70 rounded-[2rem] p-6 min-h-[500px] flex flex-col justify-between">
                  <div>
                    {/* Status Bar with Pulsing Dot */}
                    <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-400">
                      <span>9:41 AM</span>
                      <div className="flex items-center gap-1.5 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-700 font-bold">Works Offline</span>
                      </div>
                    </div>

                    {/* Elder Greeting Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100/80 mb-4 hover:border-amber-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-base shadow-sm">
                          R
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Good morning,</p>
                          <p className="text-base font-black text-slate-900">Ravi Kumar 🌅</p>
                        </div>
                      </div>
                    </div>

                    {/* 4 Core Shortcuts Grid with Interactive Hover */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-amber-50/90 hover:bg-amber-100 rounded-2xl border border-amber-200/60 text-center transition-all hover:scale-105 cursor-pointer">
                        <Gamepad2 className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-800">Play a Game</span>
                      </div>
                      <div className="p-3 bg-violet-50/90 hover:bg-violet-100 rounded-2xl border border-violet-200/60 text-center transition-all hover:scale-105 cursor-pointer">
                        <Mic className="w-6 h-6 text-violet-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-800">Talk to Mithra</span>
                      </div>
                      <div className="p-3 bg-rose-50/90 hover:bg-rose-100 rounded-2xl border border-rose-200/60 text-center transition-all hover:scale-105 cursor-pointer">
                        <Heart className="w-6 h-6 text-rose-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-800">My Memories</span>
                      </div>
                      <div className="p-3 bg-teal-50/90 hover:bg-teal-100 rounded-2xl border border-teal-200/60 text-center transition-all hover:scale-105 cursor-pointer">
                        <Users className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-800">Family</span>
                      </div>
                    </div>

                    {/* Voice Assistant Pill with Animated Soundwave Equalizer */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-3.5 flex items-center justify-between shadow-md mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-white/20 rounded-xl relative">
                          <Mic className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">Mithra is listening...</p>
                          <p className="text-[10px] text-blue-100">Assamese, Bengali, Hindi, Tamil</p>
                        </div>
                      </div>

                      {/* Animated Equalizer Sound Bars */}
                      <div className="flex items-center gap-1 h-5 px-2 bg-white/10 rounded-lg shrink-0">
                        <div className="w-1 bg-white rounded-full wave-bar-1" />
                        <div className="w-1 bg-white rounded-full wave-bar-2" />
                        <div className="w-1 bg-white rounded-full wave-bar-3" />
                        <div className="w-1 bg-white rounded-full wave-bar-4" />
                        <div className="w-1 bg-white rounded-full wave-bar-5" />
                      </div>
                    </div>
                  </div>

                  {/* Emergency SOS */}
                  <div className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs py-3 rounded-xl text-center shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <Phone className="w-3.5 h-3.5 animate-bounce" />
                    <span>SOS Emergency Contact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ANIMATED MARQUEE TICKER ──────────────────────────────────────── */}
      <section className="bg-violet-900 text-white py-3.5 overflow-hidden border-y border-violet-800 shadow-inner">
        <div className="animate-marquee items-center gap-12 text-xs sm:text-sm font-semibold tracking-wide">
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-2">✨ AI-Adaptive Cultural Cognitive Games</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">🎙️ 10 Regional Indian Dialects</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">🔒 100% Offline-First Architecture</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">❤️ Clinical Reminiscence &amp; Daily Reassurance</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">📊 Real-Time Caregiver Telemetry</span>
            <span className="text-violet-400">•</span>
          </div>
          <div className="flex items-center gap-8 shrink-0">
            <span className="flex items-center gap-2">✨ AI-Adaptive Cultural Cognitive Games</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">🎙️ 10 Regional Indian Dialects</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">🔒 100% Offline-First Architecture</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">❤️ Clinical Reminiscence &amp; Daily Reassurance</span>
            <span className="text-violet-400">•</span>
            <span className="flex items-center gap-2">📊 Real-Time Caregiver Telemetry</span>
            <span className="text-violet-400">•</span>
          </div>
        </div>
      </section>

      {/* ─── 8 CORE FEATURES SECTION ──────────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full mb-3 border border-violet-200">
              <Zap className="w-3.5 h-3.5 text-violet-600" />
              <span>Engineered For Cognitive Well-Being</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Comprehensive Features Designed for Elders
            </h2>
            <p className="text-slate-600 text-base">
              Every element is tailored for accessibility, emotional reassurance, and cognitive vitality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group p-6 rounded-3xl bg-white border ${f.border} shadow-sm card-hover-lift space-y-3 cursor-default`}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-xs`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (4 STEPS) ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full mb-3 border border-teal-200">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Simple Onboarding</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              How Mind Mithra Works
            </h2>
            <p className="text-slate-600 text-base">
              A gentle 4-step onboarding journey for families and geriatric caregivers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="group bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover-lift space-y-3">
                <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${h.badgeBg} group-hover:scale-105 transition-transform`}>
                  Step {h.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{h.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COGNITIVE ACTIVITIES MATRIX WITH INTERACTIVE CATEGORY TABS ── */}
      <section id="activities" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-3 border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Performance Chart &amp; Cognitive Recommendations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Cognitive Games &amp; Activities
            </h2>
            <p className="text-slate-600 text-base">
              AI suggests games tailored to cognitive performance charts, memory trends, and emotional comfort.
            </p>

            {/* Interactive Domain Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {domainCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedActivityDomain(cat)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer ${
                    selectedActivityDomain === cat
                      ? 'bg-violet-600 text-white shadow-md scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {filteredActivities.map((g) => (
              <div
                key={g.domain}
                className="group p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-violet-400 hover:bg-violet-50/50 card-hover-lift text-center space-y-1.5 cursor-pointer"
              >
                <span className="text-3xl block mb-2 group-hover:scale-125 transition-transform duration-300">{g.icon}</span>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-violet-700 transition-colors">{g.domain}</h4>
                <p className="text-[11px] text-violet-700 font-semibold">{g.games} Activities</p>
                <p className="text-[11px] text-slate-500 truncate">{g.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section id="families" className="py-20 sm:py-24 bg-gradient-to-br from-violet-50/60 to-blue-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Stories from Families &amp; Doctors
            </h2>
            <p className="text-slate-600 text-base">
              How culturally grounded cognitive care is making a tangible difference every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIAL_QUOTES.map((t) => (
              <div key={t.author} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm card-hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">{t.quote}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                  <p className="text-xs text-violet-600 font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER (LIGHT THEME) ─────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-base text-slate-900">Mind Mithra</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering older adults through cultural reminiscence, voice cognitive activities, and caregiver intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <button onClick={handleCaregiverEntry} className="hover:text-violet-600 cursor-pointer">
                    Caregiver Portal
                  </button>
                </li>
                <li>
                  <button onClick={handleElderEntry} className="hover:text-violet-600 cursor-pointer">
                    Elder Companion
                  </button>
                </li>
                <li>
                  <a href="#activities" className="hover:text-violet-600">
                    30 Cognitive Games
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Demo Accounts</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5 font-mono text-slate-600">
                <div>
                  <p className="text-violet-700 font-bold font-sans">Caregiver Portal:</p>
                  <p className="truncate text-slate-800">caregiver@mindmithra.org</p>
                  <p className="text-slate-400">Pass: MithraCare2026!</p>
                </div>
                <div className="pt-1.5 border-t border-slate-200">
                  <p className="text-emerald-700 font-bold font-sans">3 Registered Patients:</p>
                  <p className="truncate text-slate-800">1. ravi.kumar@mindmithra.org</p>
                  <p className="text-slate-400">Pass: RaviCare2026!</p>
                  <p className="truncate text-slate-800 mt-1">2. maya.devi@mindmithra.org</p>
                  <p className="text-slate-400">Pass: MayaCare2026!</p>
                  <p className="truncate text-slate-800 mt-1">3. biren.barua@mindmithra.org</p>
                  <p className="text-slate-400">Pass: BirenCare2026!</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Emergency &amp; Care</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                Mind Mithra provides supportive non-diagnostic cognitive care. For medical emergencies, call local emergency services immediately.
              </p>
              <p className="text-xs font-bold text-rose-600">Emergency Helpline: 112 / 108</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>© 2026 Mind Mithra • Cultural Cognitive Care &amp; Reminiscence • Works 100% Offline</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
