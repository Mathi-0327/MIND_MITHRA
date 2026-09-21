import React, { useState, useEffect } from 'react';
import { Brain, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verify token on mount
    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/reset-password/verify?token=${token}`);
        const data = await res.json();
        setTokenValid(data.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    }
    verifyToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password. The link may have expired.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900">
            Mind <span className="text-violet-600">Mithra</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
          {verifying ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">Verifying reset link…</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-black text-slate-900 text-xl mb-2">Link Expired</h2>
              <p className="text-slate-600 text-sm mb-6">
                This password reset link is invalid or has already expired. Reset links are valid for 1 hour.
              </p>
              <button
                onClick={onSuccess}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-black text-slate-900 text-xl mb-2">Password Updated!</h2>
              <p className="text-slate-600 text-sm mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <button
                onClick={onSuccess}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-colors"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-black text-slate-900 text-2xl mb-1">Set New Password</h2>
              <p className="text-slate-600 text-sm mb-6">Choose a strong password for your Mind Mithra account.</p>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 focus:border-violet-400 focus:outline-none rounded-xl text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-4 py-3 border-2 ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-violet-400'} focus:outline-none rounded-xl text-sm transition-colors`}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
