import { useState } from 'react';
import { Music2, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { login as loginApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic client-side validation
    if (!email.trim())    return setError('Email is required.');
    if (!password.trim()) return setError('Password is required.');

    setLoading(true);
    try {
      const user = await loginApi(email.trim(), password);
      login(user); // persist to context + localStorage
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
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <Music2 className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Welcome to GigBag</h1>
          <p className="text-sm text-zinc-400 mt-1">Log in to your account to continue</p>
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

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            Don't have an account?{' '}
            <button
              id="btn-switch-to-register"
              onClick={onSwitchToRegister}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors cursor-pointer"
            >
              Create one →
            </button>
          </p>
        </div>


        {/* Test Accounts Panel */}
        <div className="mt-5 rounded-xl border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Demo Accounts — Tap to Auto-Fill
            </span>
          </div>

          {/* Organizer row */}
          <button
            id="demo-fill-organizer"
            type="button"
            onClick={() => { setEmail('maria@skydeck.com.ph'); setPassword('password123'); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-zinc-950 hover:bg-zinc-900 transition-colors text-left border-b border-zinc-800/60 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
              <span className="text-fuchsia-400 text-xs font-bold">EP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                Maria Santos
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded uppercase tracking-wide">
                  Event Planner
                </span>
              </p>
              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">maria@skydeck.com.ph</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0">
              Use →
            </span>
          </button>

          {/* Musician row */}
          <button
            id="demo-fill-musician"
            type="button"
            onClick={() => { setEmail('carlo@gigbag.ph'); setPassword('password123'); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-zinc-950 hover:bg-zinc-900 transition-colors text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-violet-400 text-xs font-bold">M</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                Carlo Reyes
                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded uppercase tracking-wide">
                  Musician
                </span>
              </p>
              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">carlo@gigbag.ph</p>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0">
              Use →
            </span>
          </button>

          {/* Password note */}
          <div className="px-4 py-2 bg-zinc-900/40 flex items-center justify-between">
            <span className="text-[10px] text-zinc-600 font-mono">Password for both accounts:</span>
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
              password123
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
