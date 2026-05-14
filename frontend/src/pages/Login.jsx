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
    <div className="min-h-screen w-screen bg-[#020617] flex items-center justify-center px-4 py-8 relative overflow-hidden font-['Inter']">
      {/* Dynamic Mesh Background - Ultra Premium */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '11s' }} />
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '13s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '9s' }} />
        
        {/* Grainy Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
        
        {/* Modern Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full rounded-[3rem] border border-white/10 bg-white/[0.01] backdrop-blur-[40px] p-8 sm:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]"
        style={{
          maxWidth: "500px",
          minWidth: "320px"
        }}
      >
        {/* High-End Border Light Effect */}
        <div className="absolute inset-px rounded-[2.9rem] border border-white/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="text-center mb-12">
          <motion.div 
            layout
            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 border border-emerald-500/20 mb-10 shadow-[0_0_50px_rgba(16,185,129,0.15)] group"
          >
            <span className="material-symbols-outlined text-emerald-400 text-5xl group-hover:rotate-12 transition-transform duration-500">rocket_launch</span>
          </motion.div>
          
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
            WealthPilot
          </h1>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={isRegister ? 'reg' : 'log'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-400 text-lg font-medium tracking-tight"
            >
              {isRegister ? 'Begin your legacy here' : 'Welcome back, Commander'}
            </motion.p>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-sm text-center flex items-center justify-center gap-3 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-lg">warning</span>
            {error}
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-400 text-sm text-center flex items-center justify-center gap-3 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <AnimatePresence mode="popLayout">
            {isRegister && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Legal Name</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300">person</span>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    className="w-full h-16 pl-14 pr-6 bg-slate-950/60 border border-white/5 rounded-3xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 focus:ring-8 focus:ring-emerald-500/5 transition-all duration-300"
                    placeholder="Full name"
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Credential</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300">alternate_email</span>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full h-16 pl-14 pr-6 bg-slate-950/60 border border-white/5 rounded-3xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 focus:ring-8 focus:ring-emerald-500/5 transition-all duration-300"
                placeholder="Email address"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-2 mb-2">
              <label className="block text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Access Key</label>
              {!isRegister && <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-emerald-400 transition-colors">Forgot?</span>}
            </div>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 transition-colors duration-300">lock_open</span>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full h-16 pl-14 pr-6 bg-slate-950/60 border border-white/5 rounded-3xl text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 focus:ring-8 focus:ring-emerald-500/5 transition-all duration-300"
                placeholder="Password"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full h-16 bg-emerald-500 rounded-3xl font-black text-slate-950 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_-12px_rgba(16,185,129,0.4)] disabled:opacity-50 mt-4"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
              {loading ? 'Decrypting...' : (
                <>
                  {isRegister ? 'Authorize Account' : 'Initiate Session'}
                  <span className="material-symbols-outlined font-black">login</span>
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-14 pt-10 border-t border-white/5 text-center">
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

      {/* Decorative Branding Footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-6 opacity-20 pointer-events-none">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
        <span className="text-[10px] font-black tracking-[1em] text-white uppercase whitespace-nowrap">Quantum Wealth OS v2.0</span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
      </div>
    </div>
  );
}

export default Login;
