import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center px-4 py-8 overflow-x-hidden relative">
      {/* Auth Debug Helper */}
      <div className="auth-debug-banner">AUTH DEBUG ACTIVE</div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-emerald-400 tracking-tight mb-3">WealthPilot</h1>
          <p className="text-slate-400 text-base">Sign in to your financial command center</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="w-full">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@example.com"
              className="block w-full min-w-0 rounded-2xl bg-slate-950 border border-slate-700 px-5 py-4 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all"
              required 
            />
          </div>
          <div className="w-full">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="block w-full min-w-0 rounded-2xl bg-slate-950 border border-slate-700 px-5 py-4 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="block w-full rounded-2xl bg-emerald-500 py-4 font-bold text-slate-950 hover:bg-emerald-400 hover:scale-[0.99] active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Authenticating...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">Request access</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
