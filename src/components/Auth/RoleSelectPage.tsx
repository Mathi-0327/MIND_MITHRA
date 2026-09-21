import React, { useState } from 'react';
import { Brain, Heart, Users, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import type { AuthUser } from './AuthPage';

interface RoleSelectPageProps {
  user: AuthUser;
  onSelectPatient: () => void;
  onSelectCaregiver: () => void;
  onLogout: () => void;
}

export const RoleSelectPage: React.FC<RoleSelectPageProps> = ({
  user,
  onSelectPatient,
  onSelectCaregiver,
  onLogout,
}) => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<'PATIENT' | 'CAREGIVER' | null>(null);

  const handleSelect = async (role: 'PATIENT' | 'CAREGIVER') => {
    setSelected(role);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (role === 'PATIENT') {
      onSelectPatient();
    } else {
      onSelectCaregiver();
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    onLogout();
  };

  const isCaregiver = user.role === 'CAREGIVER' || user.role === 'ADMIN';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-200/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/25 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-slate-900">
            Mind <span className="text-violet-600">Mithra</span>
          </span>
        </div>

        {/* Welcome */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Welcome, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-600 text-sm">How would you like to continue?</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Patient Mode */}
          <button
            onClick={() => handleSelect('PATIENT')}
            disabled={loading}
            className={`w-full flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left group ${
              selected === 'PATIENT'
                ? 'border-amber-400 bg-amber-50 shadow-xl shadow-amber-100'
                : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-lg hover:shadow-amber-50/50'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg transition-transform ${selected === 'PATIENT' ? 'scale-110' : 'group-hover:scale-105'}`}>
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-black text-slate-900 text-lg mb-1">Patient Mode</div>
              <div className="text-sm text-slate-600">
                Cognitive games, voice companion, memories, reminders, and SOS emergency support.
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['Cognitive Games', 'Voice Companion', 'Memories', 'SOS'].map((tag) => (
                  <span key={tag} className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className={`shrink-0 ${loading && selected === 'PATIENT' ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
              {loading && selected === 'PATIENT' ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : (
                <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>

          {/* Caregiver Mode — only visible if user role is CAREGIVER or ADMIN */}
          {isCaregiver ? (
            <button
              onClick={() => handleSelect('CAREGIVER')}
              disabled={loading}
              className={`w-full flex items-center gap-5 p-6 rounded-3xl border-2 transition-all text-left group ${
                selected === 'CAREGIVER'
                  ? 'border-blue-400 bg-blue-50 shadow-xl shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg transition-transform ${selected === 'CAREGIVER' ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-black text-slate-900 text-lg mb-1">Caregiver Dashboard</div>
                <div className="text-sm text-slate-600">
                  Monitor cognitive trends, manage reminders, view analytics, and generate clinical reports.
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['Analytics', 'Clinical Reports', 'Manage Patients', 'AI Copilot'].map((tag) => (
                    <span key={tag} className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`shrink-0 ${loading && selected === 'CAREGIVER' ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                {loading && selected === 'CAREGIVER' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>
          ) : (
            /* For patients who don't have caregiver role */
            <div className="w-full flex items-center gap-5 p-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 opacity-60">
              <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <div className="font-bold text-slate-500 text-base mb-1">Caregiver Dashboard</div>
                <div className="text-xs text-slate-400">
                  Caregiver accounts are set up by the Mind Mithra team. Contact support to upgrade.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors mx-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign out ({user.email})
          </button>
        </div>
      </div>
    </div>
  );
};
