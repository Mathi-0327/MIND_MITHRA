import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  MessageCircle, 
  Calendar 
} from 'lucide-react';
import { audioService } from '../../lib/audioService';

interface FamilyAudioViewProps {
  onBack: () => void;
  patientName: string;
}

export const FamilyAudioView: React.FC<FamilyAudioViewProps> = ({
  onBack,
  patientName,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const messages = [
    {
      id: 'msg-1',
      sender: 'Priyanka (Daughter)',
      time: 'Today, 8:30 AM',
      text: 'Good morning Baba! Hope you enjoyed your warm morning tea. Ananya and I are visiting this Saturday with hot homemade Pitha. Have a peaceful day!',
      avatar: '👩',
      relation: 'Daughter in Guwahati',
    },
    {
      id: 'msg-2',
      sender: 'Ananya (Granddaughter)',
      time: 'Yesterday, 5:15 PM',
      text: 'Dadu! Look at the rhino drawing I made for school today. I remembered the Kaziranga trip we took together. Love you so much!',
      avatar: '👧',
      relation: 'Granddaughter',
    },
  ];

  const handlePlayVoice = (id: string, text: string) => {
    if (playingId === id) {
      audioService.stopSpeaking();
      setPlayingId(null);
    } else {
      setPlayingId(id);
      audioService.speak(text, () => {
        setPlayingId(null);
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border-2 border-stone-200 shadow-xl my-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
        <button
          onClick={() => {
            audioService.stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span>Family Voice Notes</span>
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block">
            Loving messages from Priyanka and Ananya
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isPlaying = playingId === msg.id;

          return (
            <div
              key={msg.id}
              className="p-5 sm:p-6 bg-rose-50/50 border-2 border-rose-200 rounded-3xl shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-white rounded-2xl shadow-xs border border-rose-200">
                    {msg.avatar}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                      {msg.sender}
                    </h3>
                    <span className="text-xs font-semibold text-rose-700">{msg.relation}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-stone-500">{msg.time}</span>
              </div>

              <div className="bg-white border border-rose-200 rounded-2xl p-4 mb-4 shadow-xs">
                <p className="text-sm sm:text-base text-stone-800 font-medium leading-relaxed">
                  "{msg.text}"
                </p>
              </div>

              <button
                onClick={() => handlePlayVoice(msg.id, msg.text)}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 ${
                  isPlaying
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Voice Message</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Play Voice Note</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
