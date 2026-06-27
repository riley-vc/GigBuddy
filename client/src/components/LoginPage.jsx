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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-violet-500/70 focus:bg-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/40 mt-2"
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

        {/* Seeded account hint */}
        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800/60 rounded-xl text-center space-y-1">
          <p className="text-[11px] font-mono text-zinc-500 font-semibold">SEEDED TEST ACCOUNTS</p>
          <p className="text-[11px] font-mono text-zinc-600">
            <span className="text-fuchsia-400">Organizer</span> maria@skydeck.com.ph
          </p>
          <p className="text-[11px] font-mono text-zinc-600">
            <span className="text-violet-400">Musician</span> carlo@gigbag.ph
          </p>
          <p className="text-[11px] font-mono text-zinc-700">password: password123</p>
        </div>
      </div>
    </div>
  );
}
