
import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onNavigate: (path: string) => void;
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      let data: { success?: boolean; error?: string; message?: { error?: string } } = {};
      try {
        data = await res.json();
      } catch {
        // Response wasn't JSON (e.g. HTML error page or function crash)
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          setError('Auth server not reachable. Locally: run npm run server. On Vercel: check deployment and env vars.');
        } else {
          setError(`Login failed (${res.status}). On Vercel: set ADMIN_PASSWORD in Project → Settings → Environment Variables and redeploy.`);
        }
        setLoading(false);
        return;
      }
      const msg = data.error ?? (typeof data.message === 'object' && data.message?.error) ?? '';
      if (!res.ok) {
        setError(msg || `Login failed (${res.status}).`);
        setLoading(false);
        return;
      }
      if (data.success) {
        // Server set httpOnly cookie; no session in JS
        onLoginSuccess();
        onNavigate('/');
      } else {
        setError(msg || 'Invalid password.');
      }
    } catch {
      setError('Network error. Start the auth server in another terminal: npm run server');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 mb-8 font-bold uppercase tracking-widest text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Back to site
        </button>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
              <Lock className="text-amber-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Owner login</h1>
              <p className="text-zinc-500 text-sm">Only you can add or edit content.</p>
            <p className="text-zinc-600 text-xs mt-1">Requires auth server: run <code className="bg-zinc-800 px-1 rounded">npm run server</code> in project root.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-rose-500 text-sm font-medium">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-zinc-950 font-black uppercase tracking-widest py-4 rounded-xl transition-colors"
            >
              {loading ? 'Checking…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
