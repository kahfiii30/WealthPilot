import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen w-screen bg-[#050914] flex items-center justify-center px-4 py-8 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl"
        style={{
          width: "100%",
          maxWidth: "420px",
          minWidth: "320px"
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white whitespace-nowrap">
            WealthPilot
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-400 whitespace-normal">
            Sign in to your financial command center
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 w-full space-y-5">
          <div className="w-full">
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-300">
              EMAIL ADDRESS
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="block h-12 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              required 
            />
          </div>
          <div className="w-full">
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-300">
              PASSWORD
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="block h-12 w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="block h-12 w-full rounded-xl bg-emerald-500 font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
