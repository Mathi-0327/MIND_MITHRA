import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Brain, 
  Heart, 
  Music,
  Check,
  RefreshCw,
  MessageCircleHeart,
  Smile,
  User,
  Bot,
  Languages,
  CheckCircle2,
  Send
} from 'lucide-react';
import { audioService, COMPANION_VOICE_PROFILES, VoiceProfile } from '../../lib/audioService';
import { SupportedLanguage } from '../../types';
import { SUPPORTED_LANGUAGES, t } from '../../lib/translations';
import { getTimelineGreeting } from '../../lib/timelineGreeting';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  language: SupportedLanguage;
  networkState: 'ONLINE' | 'OFFLINE' | 'LOW_CONNECTIVITY';
  onNavigate: (route: 'HOME' | 'GAMES' | 'MEMORIES' | 'REMINDERS' | 'RELAX' | 'BASELINE') => void;
}

type TurnState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface ChatMessage {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  language?: SupportedLanguage;
  audioBase64?: string | null;
  timestamp: string;
}

const REGIONAL_PROMPTS: Record<SupportedLanguage, Array<{ text: string; label: string; icon: string }>> = {
  as: [
    { text: 'আপুনি আজি কেনে আছে, মোৰ মৰমৰ সংগী?', label: 'মোক সুধক (How are you)', icon: 'smile' },
    { text: 'মোৰ নাতিনী অনন্যাৰ কাজিৰঙাৰ স্মৃতি কওক', label: 'অনন্যাৰ স্মৃতি (Kaziranga)', icon: 'heart' },
    { text: 'আজিৰ স্মৃতি খেল আৰম্ভ কৰক', label: 'স্মৃতি খেল (Memory Game)', icon: 'brain' },
    { text: 'মন শান্ত কৰা বাঁহীৰ সুৰ বজাওক', label: 'বাঁহীৰ সুৰ (Flute Music)', icon: 'music' },
  ],
  bn: [
    { text: 'আপনি কেমন আছেন আমার প্রিয় বন্ধু?', label: 'কেমন আছেন (How are you)', icon: 'smile' },
    { text: 'আমার নাতনি অনন্যার কাজিরাঙ্গার কথা বলুন', label: 'অনন্যার স্মৃতি (Ananya Memory)', icon: 'heart' },
    { text: 'আজকের স্মৃতি খেলা শুরু করুন', label: 'স্মৃতি খেলা (Memory Game)', icon: 'brain' },
    { text: 'মন শান্ত করার মিষ্টি সুর বাজান', label: 'মিষ্টি সুর (Calm Music)', icon: 'music' },
  ],
  hi: [
    { text: 'नमस्ते! आप आज कैसे हैं मेरे प्यारे दोस्त?', label: 'आप कैसे हैं (How are you)', icon: 'smile' },
    { text: 'मेरी पोती अनन्या की काजीरंगा की याद बताइए', label: 'अनन्या की यादें (Memories)', icon: 'heart' },
    { text: 'आज की दिमागी कसरत शुरू करें', label: 'स्मृति खेल (Memory Game)', icon: 'brain' },
    { text: 'मन को शांत करने वाला मधुर बाँसुरी संगीत बजाएं', label: 'बाँसुरी संगीत (Flute Music)', icon: 'music' },
  ],
  mni: [
    { text: 'ঙসি অদোম কমদৌরি, ঐগী নুংশিরবা খোঙলোই?', label: 'কমদৌরি (How are you)', icon: 'smile' },
    { text: 'অনন্যাগী কাজিরঙ্গাগী নীংশিংবা হায়বিয়ু', label: 'অনন্যাগী নীংশিংবা (Ananya)', icon: 'heart' },
    { text: 'ঙসিগী শানবা হৌরো', label: 'শানবা হৌরো (Start Activity)', icon: 'brain' },
    { text: 'ৱাখল ইংথহন্নবা ঈশৈ তানসি', label: 'ঈশৈ তানসি (Peaceful Music)', icon: 'music' },
  ],
  kha: [
    { text: 'Kumno phi long mynta, u paralok jong nga?', label: 'Kumno phi long (How are you)', icon: 'smile' },
    { text: 'Iathuh shaphang ka khunruit Ananya ha Kaziranga', label: 'Jingkynmaw Ananya (Memories)', icon: 'heart' },
    { text: 'Sdang ka jingialehkái mynta', label: 'Sdang ka Kam (Start Game)', icon: 'brain' },
    { text: 'Pynriew jingsur ba pynsuk jingmut', label: 'Jingsur ba suk (Flute Music)', icon: 'music' },
  ],
  lus: [
    { text: 'Vawiin i tha maw, ka thian duh tak?', label: 'I tha em (How are you)', icon: 'smile' },
    { text: 'Ka tuchhuah Ananya chanchin min hrilh rawh', label: 'Ananya chanchin (Memories)', icon: 'heart' },
    { text: 'Vawiin infiamna tan rawh le', label: 'Infiamna tan (Start Activity)', icon: 'brain' },
    { text: 'Hla thlamuanthlak min play sak rawh', label: 'Hla thlamuanthlak (Music)', icon: 'music' },
  ],
  en: [
    { text: 'How are you today, my friend?', label: 'How are you feeling?', icon: 'smile' },
    { text: 'Tell me about my granddaughter Ananya', label: 'Tell me about Ananya', icon: 'heart' },
    { text: 'Start today’s memory activity', label: 'Start memory game', icon: 'brain' },
    { text: 'Play peaceful flute music', label: 'Play flute music', icon: 'music' },
  ],
};

const REGIONAL_GREETINGS: Record<SupportedLanguage, string> = {
  as: 'নমস্কাৰ! মই আপোনাৰ মাইণ্ড মিত্ৰ (Mind Mithra) সংগী। আজি মই আপোনাৰ বাবে কি কৰিব পাৰোঁ?',
  bn: 'নমস্কার! আমি আপনার মাইন্ড মিত্র (Mind Mithra) সঙ্গী। বলুন, আজকে আমরা কী করবো?',
  hi: 'नमस्ते! मैं आपका माइंड मित्र (Mind Mithra) साथी हूँ। आज मैं आपकी क्या सहायता करूँ?',
  mni: 'খুরুমজরি! ঐ অদোমগী মাইণ্ড মিত্র (Mind Mithra) খোঙলোইনি। ঙসি ঐ অদোমবু করম্না মতেং পাংগদগে?',
  kha: 'Khublei! Nga dei u Mind Mithra jong phi. Kumno nga lah ban iarap ia phi mynta?',
  lus: 'Chibai! Mind Mithra i thian ka ni e. Vawiin chu engtin nge ka puih theih ang che?',
  en: 'Hello dear friend! I am Mind Mithra, right here by your side. What would you like to do today?',
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  patientName,
  language: initialLanguage,
  networkState,
  onNavigate,
}) => {
  // Turn-taking state machine: IDLE -> LISTENING -> PROCESSING -> SPEAKING
  const [turnState, setTurnState] = useState<TurnState>('IDLE');
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(initialLanguage);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [lastAudioBase64, setLastAudioBase64] = useState<string | null>(null);
  const [recognitionAvailable, setRecognitionAvailable] = useState(true);
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<VoiceProfile>(COMPANION_VOICE_PROFILES[0]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Mutable references to avoid closure bugs
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const turnStateRef = useRef<TurnState>('IDLE');
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    turnStateRef.current = turnState;
  }, [turnState]);

  // Sync initial language if changed from parent
  useEffect(() => {
    setActiveLang(initialLanguage);
  }, [initialLanguage]);

  // Clean up mic and audio on unmount or close
  const cleanupAudioStream = () => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  useEffect(() => {
    if (!isOpen) {
      audioService.stopSpeaking();
      cleanupAudioStream();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setTurnState('IDLE');
      return;
    }

    // Set dynamic time-of-day greeting (Morning, Afternoon, Evening, Night) in active language
    const timelineData = getTimelineGreeting(activeLang);
    const personalized = `${timelineData.greetingText}, ${patientName}! ${timelineData.voiceOpener}`;
    
    setAssistantReply(personalized);
    setChatHistory([
      {
        id: `msg-init-${Date.now()}`,
        sender: 'companion',
        text: personalized,
        language: activeLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setTurnState('SPEAKING');
    audioService.speak(
      personalized,
      () => {
        setTurnState('IDLE');
      },
      { voice: selectedVoiceProfile.geminiVoice }
    );

    return () => {
      audioService.stopSpeaking();
      cleanupAudioStream();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen, activeLang, patientName, selectedVoiceProfile.geminiVoice]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, assistantReply, turnState, transcript]);

  // Start visual mic audio meter
  const startAudioMeter = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }
      }
    } catch (err) {
      console.warn('Microphone stream permission error:', err);
    }
  };

  // Language switch inside Voice Assistant
  const handleSwitchLanguage = (lang: SupportedLanguage) => {
    audioService.stopSpeaking();
    cleanupAudioStream();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    setActiveLang(lang);
    audioService.playFeedbackSound('GENTLE_TAP');

    const greeting = REGIONAL_GREETINGS[lang] || REGIONAL_GREETINGS.en;
    const personalized = `${greeting.split('!')[0]} ${patientName}! ${greeting.substring(greeting.indexOf('!') + 1)}`;
    
    setAssistantReply(personalized);
    setChatHistory((prev) => [
      ...prev,
      {
        id: `msg-lang-${Date.now()}`,
        sender: 'companion',
        text: personalized,
        language: lang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setTurnState('SPEAKING');
    audioService.speak(
      personalized,
      () => setTurnState('IDLE'),
      { voice: selectedVoiceProfile.geminiVoice }
    );
  };

  // Turn 1: START LISTENING
  const handleStartListening = async () => {
    audioService.stopSpeaking();
    setTranscript('');
    transcriptRef.current = '';

    // Start mic audio level visualizer
    await startAudioMeter();

    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition 
      || (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionAvailable(false);
      setTurnState('LISTENING');
      // Set timer to provide friendly assistance
      setTimeout(() => {
        if (turnStateRef.current === 'LISTENING' && !transcriptRef.current) {
          setTranscript('Listening... (You can also select any topic below or type)');
        }
      }, 1500);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Locale mapping
      const localeMap: Record<SupportedLanguage, string> = {
        as: 'as-IN',
        bn: 'bn-IN',
        hi: 'hi-IN',
        mni: 'hi-IN',
        kha: 'en-IN',
        lus: 'en-IN',
        en: 'en-IN',
      };

      recognition.lang = localeMap[activeLang] || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setTurnState('LISTENING');
        audioService.playFeedbackSound('GENTLE_TAP');
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        transcriptRef.current = text;
        setTranscript(text);

        // Auto-detect end of phrase/speech with 1.4s debounce of silence
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
        }
        if (text.trim().length > 0) {
          silenceTimerRef.current = window.setTimeout(() => {
            if (turnStateRef.current === 'LISTENING') {
              handleCompleteSpeechAndProcess(text);
            }
          }, 1400);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition warning/error:', err?.error || err);
        // If aborted or no-speech, don't crash, keep listening or transition gracefully
        if (err?.error === 'not-allowed') {
          setAssistantReply('Please allow microphone access to talk directly, or tap any prompt below.');
          setTurnState('IDLE');
          cleanupAudioStream();
        }
      };

      recognition.onend = () => {
        const textToProcess = transcriptRef.current.trim();
        if (textToProcess && turnStateRef.current === 'LISTENING') {
          handleCompleteSpeechAndProcess(textToProcess);
        } else if (turnStateRef.current === 'LISTENING') {
          // If stopped without text, revert to idle
          setTurnState('IDLE');
          cleanupAudioStream();
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed, using audio meter mode:', err);
      setTurnState('LISTENING');
    }
  };

  // Turn 2 & 3: STOP LISTENING -> PROCESS VOICE INPUT -> SPEAK ANSWER
  const handleCompleteSpeechAndProcess = (spokenText?: string) => {
    const text = (spokenText || transcriptRef.current || transcript || typedInput).trim();
    cleanupAudioStream();
    
    // Stop recognition engine
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (!text) {
      setTurnState('IDLE');
      return;
    }

    setTypedInput('');
    processVoiceInput(text);
  };

  const processVoiceInput = async (inputText: string) => {
    if (!inputText.trim()) {
      setTurnState('IDLE');
      return;
    }

    // Add user message to conversation history
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText,
      language: activeLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, userMsg]);

    setTurnState('PROCESSING');
    audioService.playFeedbackSound('GENTLE_TAP');

    // Check offline intent first
    const offlineParsed = audioService.parseOfflineIntent(inputText);

    if (networkState === 'OFFLINE' || !navigator.onLine) {
      const reply = offlineParsed.responseVoiceText;
      setAssistantReply(reply);
      setLastAudioBase64(null);

      const companionMsg: ChatMessage = {
        id: `comp-${Date.now()}`,
        sender: 'companion',
        text: reply,
        language: activeLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, companionMsg]);

      setTurnState('SPEAKING');
      audioService.speak(
        reply,
        () => {
          setTurnState('IDLE');
          if (offlineParsed.actionRoute && offlineParsed.actionRoute !== 'HOME') {
            setTimeout(() => {
              onNavigate(offlineParsed.actionRoute as any);
              onClose();
            }, 800);
          }
        },
        { fallbackOnly: true }
      );
      return;
    }

    // Call Cloud AI Server with strict turn context & chosen language
    try {
      const res = await fetch('/api/ai/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          patientName,
          language: activeLang,
          voice: selectedVoiceProfile.geminiVoice,
        }),
      });

      const data = await res.json();
      const reply = data.reply || offlineParsed.responseVoiceText;
      const audioBase64 = data.audioBase64 || null;

      setAssistantReply(reply);
      setLastAudioBase64(audioBase64);

      const companionMsg: ChatMessage = {
        id: `comp-${Date.now()}`,
        sender: 'companion',
        text: reply,
        language: activeLang,
        audioBase64,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, companionMsg]);

      // Speak answer after listening phase finishes
      setTurnState('SPEAKING');
      audioService.speak(
        reply,
        () => {
          setTurnState('IDLE');
          if (offlineParsed.actionRoute && offlineParsed.actionRoute !== 'HOME') {
            setTimeout(() => {
              onNavigate(offlineParsed.actionRoute as any);
              onClose();
            }, 800);
          }
        },
        {
          voice: selectedVoiceProfile.geminiVoice,
          base64Audio: audioBase64,
        }
      );
    } catch (err) {
      console.error('Error fetching companion chat:', err);
      const fallbackReply = offlineParsed.responseVoiceText;
      setAssistantReply(fallbackReply);
      setLastAudioBase64(null);

      const companionMsg: ChatMessage = {
        id: `comp-${Date.now()}`,
        sender: 'companion',
        text: fallbackReply,
        language: activeLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, companionMsg]);

      setTurnState('SPEAKING');
      audioService.speak(
        fallbackReply,
        () => setTurnState('IDLE'),
        { voice: selectedVoiceProfile.geminiVoice }
      );
    }
  };

  const handleReplayCurrentReply = (text?: string, audioBase64?: string | null) => {
    const textToSpeak = text || assistantReply;
    if (!textToSpeak) return;

    audioService.stopSpeaking();
    setTurnState('SPEAKING');
    audioService.speak(
      textToSpeak,
      () => setTurnState('IDLE'),
      {
        voice: selectedVoiceProfile.geminiVoice,
        base64Audio: audioBase64 || lastAudioBase64,
      }
    );
  };

  const handlePromptClick = (text: string) => {
    setTranscript(text);
    transcriptRef.current = text;
    processVoiceInput(text);
  };

  if (!isOpen) return null;

  const currentPrompts = REGIONAL_PROMPTS[activeLang] || REGIONAL_PROMPTS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-4 border-amber-300 relative overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <MessageCircleHeart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-stone-900 font-serif">
                  Mind Mithra Voice Companion
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  AI Voice
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Speaking with {patientName} • Multilingual Voice Assistant
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            aria-label="Close voice companion"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multilingual Dialect Switcher Strip */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-2 mb-3 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-900 shrink-0 pl-1">
            <Languages className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Language:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = activeLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSwitchLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs scale-102 font-extrabold'
                      : 'bg-white text-stone-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <span>{l.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Dialog Area */}
        <div className="flex-1 overflow-y-auto min-h-[140px] max-h-[220px] p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-3 space-y-3">
          {chatHistory.map((msg) => {
            const isCompanion = msg.sender === 'companion';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isCompanion ? 'justify-start' : 'justify-end'}`}
              >
                {isCompanion && (
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                    isCompanion
                      ? 'bg-white border border-amber-200 text-stone-900 rounded-tl-xs'
                      : 'bg-amber-600 text-white rounded-tr-xs'
                  }`}
                >
                  <p className="font-semibold">{msg.text}</p>
                  <div className="flex items-center justify-between gap-3 mt-1 text-[11px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {isCompanion && (
                      <button
                        onClick={() => handleReplayCurrentReply(msg.text, msg.audioBase64)}
                        className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                        title="Listen to this message again"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
                {!isCompanion && (
                  <div className="w-7 h-7 rounded-full bg-stone-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Real-time Status Banners during strict turn taking */}
          {turnState === 'PROCESSING' && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Thinking warmly for you...</span>
            </div>
          )}

          {turnState === 'LISTENING' && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 font-bold text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mic className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
                  <span className="truncate">
                    {transcript || 'Listening carefully... speak now.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCompleteSpeechAndProcess()}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 flex items-center gap-1 shrink-0 ml-2 shadow-xs cursor-pointer"
                >
                  <span>Done</span>
                  <Check className="w-3 h-3" />
                </button>
              </div>

              {/* Real-time Audio Level Meter Bars */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-rose-700 uppercase tracking-wider font-extrabold">Mic Signal:</span>
                <div className="flex-1 h-2 bg-rose-200/80 rounded-full overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-rose-600 transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(10, audioLevel)}%` }}
                  />
                </div>
                <span className="text-[10px] text-rose-700 font-mono">{audioLevel}%</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Central Turn-Taking & Voice Action Bar */}
        <div className="flex flex-col items-center justify-center my-1">
          <div className="relative">
            {/* Animated Ripples */}
            {turnState === 'LISTENING' && (
              <div className="absolute -inset-4 rounded-full bg-rose-400/35 animate-ping pointer-events-none" />
            )}
            {turnState === 'SPEAKING' && (
              <div className="absolute -inset-4 rounded-full bg-amber-400/35 animate-pulse pointer-events-none" />
            )}

            <button
              onClick={
                turnState === 'LISTENING'
                  ? () => handleCompleteSpeechAndProcess()
                  : handleStartListening
              }
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                turnState === 'LISTENING'
                  ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                  : turnState === 'SPEAKING'
                  ? 'bg-amber-600 text-white ring-8 ring-amber-200'
                  : turnState === 'PROCESSING'
                  ? 'bg-amber-400 text-stone-900 ring-8 ring-amber-100 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-white ring-8 ring-amber-100'
              }`}
            >
              {turnState === 'LISTENING' ? (
                <>
                  <Mic className="w-7 h-7" />
                  <span className="text-[10px] font-bold mt-0.5">Listening</span>
                </>
              ) : turnState === 'SPEAKING' ? (
                <>
                  <Volume2 className="w-7 h-7 animate-bounce" />
                  <span className="text-[10px] font-bold mt-0.5">Speaking</span>
                </>
              ) : turnState === 'PROCESSING' ? (
                <>
                  <Sparkles className="w-7 h-7 animate-spin" />
                  <span className="text-[10px] font-bold mt-0.5">Thinking</span>
                </>
              ) : (
                <>
                  <Mic className="w-7 h-7" />
                  <span className="text-[10px] font-bold mt-0.5">Tap to Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Spoken State Controls */}
          <div className="flex items-center gap-2 mt-2">
            {turnState === 'SPEAKING' && (
              <button
                onClick={() => {
                  audioService.stopSpeaking();
                  setTurnState('IDLE');
                }}
                className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded-full text-xs font-bold text-stone-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Pause Voice</span>
              </button>
            )}

            {turnState === 'IDLE' && assistantReply && (
              <button
                onClick={() => handleReplayCurrentReply()}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-full text-xs font-bold text-amber-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Repeat Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Voice Typing Bar (Fallback & Assisted input) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typedInput.trim()) {
              handleCompleteSpeechAndProcess(typedInput);
            }
          }}
          className="flex items-center gap-2 my-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 focus-within:border-amber-400 focus-within:bg-white transition-all"
        >
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Or type a question or phrase here..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-stone-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="p-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Conversational Prompt Chips (In active language) */}
        <div className="mt-1">
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 text-center">
            Or Tap Any Comforting Topic in {SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.name}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {currentPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p.text)}
                className="flex items-center gap-2 p-2 bg-amber-50/70 hover:bg-amber-100 border border-amber-200 rounded-xl text-left text-xs font-bold text-stone-900 transition-colors cursor-pointer"
              >
                {p.icon === 'heart' ? (
                  <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : p.icon === 'brain' ? (
                  <Brain className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                ) : p.icon === 'music' ? (
                  <Music className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                ) : (
                  <Smile className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
