import { useState } from 'react';
import { Music2, User, Mail, Lock, Loader2, AlertCircle, Briefcase, Guitar } from 'lucide-react';
import { register as registerApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage({ onSwitchToLogin }) {
  const { login } = useAuth();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [role, setRole]               = useState('musician');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!name.trim())         return setError('Name is required.');
    if (!email.trim())        return setError('Email is required.');
    if (!password.trim())     return setError('Password is required.');
    if (password.length < 6)  return setError('Password must be at least 6 characters.');
    if (password !== confirmPass) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const user = await registerApi(name.trim(), email.trim(), password, role);
      login(user); // auto-login after successful register
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <Music2 className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Join GigBag</h1>
          <p className="text-sm text-zinc-400 mt-1">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="register-role-musician"
                  onClick={() => setRole('musician')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'musician'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <Guitar className="w-4 h-4" />
                  Musician
                </button>
                <button
                  type="button"
                  id="register-role-organizer"
                  onClick={() => setRole('organizer')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === 'organizer'
                      ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                      : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Organizer
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan dela Cruz"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            Already have an account?{' '}
            <button
              id="btn-switch-to-login"
              onClick={onSwitchToLogin}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer"
            >
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
