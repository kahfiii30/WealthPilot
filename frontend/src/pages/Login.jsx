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
    <div className="min-h-screen w-screen bg-[#050914] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-8 sm:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        style={{
          maxWidth: "440px",
          minWidth: "320px"
        }}
      >
        {/* Decorative Inner Glow */}
        <div className="absolute inset-px rounded-[2.4rem] border border-white/5 pointer-events-none" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="material-symbols-outlined text-emerald-400 text-3xl">account_balance_wallet</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3 whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            WealthPilot
          </h1>
          <p className="text-slate-400 text-base leading-relaxed whitespace-normal">
            Securely access your financial command center
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-[0.15em] ml-1">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors">mail</span>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full h-14 pl-12 pr-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="pilot@wealth.com"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-[0.15em] ml-1">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors">lock</span>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full h-14 pl-12 pr-4 bg-slate-950/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full h-14 bg-emerald-500 rounded-2xl font-bold text-slate-950 overflow-hidden hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? 'Authenticating...' : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">Get Access</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
