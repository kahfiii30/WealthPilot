import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: fullName,
            }
          }
        });
        if (signUpError) throw signUpError;
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center px-4 py-8 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(74,222,128,0.10),transparent_28%),linear-gradient(135deg,#020617_0%,#07111f_45%,#0b1628_100%)] relative font-['Inter']">
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] min-w-[320px] rounded-3xl border border-slate-700/30 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl"
        style={{
          boxShadow: "0 24px 80px rgba(0,0,0,0.45), 0 0 60px rgba(34,197,94,0.08)"
        }}
      >
        <div className="text-center mb-10">
          <motion.div 
            layout
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 shadow-[0_0_30px_rgba(74,222,128,0.08)] mb-8"
          >
            <span className="material-symbols-outlined text-emerald-400 text-4xl">rocket_launch</span>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-100 tracking-tighter mb-4">
            WealthPilot
          </h1>
          <AnimatePresence mode="wait">
            <motion.p 
              key={isRegister ? 'reg' : 'log'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-400 text-base font-medium"
            >
              {isRegister ? 'Begin your legacy here' : 'Welcome back, Commander'}
            </motion.p>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm text-center flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-base">warning</span>
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm text-center flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Legal Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  className="rounded-xl border border-slate-700/40 bg-slate-950/55 px-4 py-3 w-full text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
                  placeholder="Full name"
                  required={isRegister}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Credential</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="rounded-xl border border-slate-700/40 bg-slate-950/55 px-4 py-3 w-full text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
              placeholder="Email address"
              required 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2 mb-2">
              <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Access Key</label>
              {!isRegister && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest cursor-pointer">Forgot?</span>}
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="rounded-xl border border-slate-700/40 bg-slate-950/55 px-4 py-3 w-full text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition-all duration-200 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/10"
              placeholder="Password"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-4 w-full font-semibold text-slate-950 shadow-[0_0_30px_rgba(74,222,128,0.20)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_40px_rgba(74,222,128,0.28)] active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isRegister ? 'Authorize Account' : 'Initiate Session')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-400 font-semibold text-sm">
            {isRegister ? 'Already part of the fleet?' : "Need a new command center?"}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="ml-3 text-emerald-400 font-black uppercase tracking-widest hover:text-emerald-300 transition-all border-b-2 border-emerald-500/20 hover:border-emerald-500"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
