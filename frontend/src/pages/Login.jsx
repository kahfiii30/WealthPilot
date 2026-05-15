import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
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
    <div className="relative min-h-screen w-screen overflow-hidden bg-[#020617] px-4 py-8 flex items-center justify-center font-['Inter']">
      {/* Background Animated Blobs */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* Dark Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-blue-950/50" />

      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] rounded-[2rem] border border-slate-700/30 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: "0 24px 90px rgba(0,0,0,0.55), 0 0 80px rgba(16,185,129,0.08)"
          }}
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_50px_rgba(16,185,129,0.18)]"
            >
              <motion.div
                animate={!shouldReduceMotion ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="material-symbols-outlined text-emerald-400 text-4xl">rocket_launch</span>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold tracking-tight text-slate-100"
            >
              WealthPilot
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-base font-medium text-slate-400"
            >
              {isRegister ? 'Begin your legacy here' : 'Welcome back, Commander'}
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm text-center flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-base">warning</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="block h-13 w-full rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                    placeholder="Hitoshi"
                    required={isRegister}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block h-13 w-full rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                placeholder="commander@wealthpilot.ai"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2 mb-2">
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">PASSWORD</label>
                {!isRegister && <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-emerald-300 transition-colors">Forgot Key?</span>}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="block h-13 w-full rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 font-bold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.22)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 mt-4 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isRegister ? 'Authorize Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-400 font-semibold text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="ml-3 text-emerald-400 font-black uppercase tracking-widest hover:text-emerald-300 transition-all border-b-2 border-emerald-500/20 hover:border-emerald-500"
              >
                {isRegister ? 'Login' : 'Join Fleet'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
