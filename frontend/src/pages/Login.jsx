import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;

    if (!email.trim()) {
      setError("Email wajib diisi untuk mereset password.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (resetError) throw resetError;
      
      setMessage("Link reset password telah dikirim ke email Anda.");
      setCooldown(60);
    } catch (err) {
      setError(err?.message || "Gagal mengirim link reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || (isRegister && cooldown > 0)) return;

    setLoading(true);
    setError("");
    setMessage("");

    if (isRegister) {
      if (!fullName.trim() || !email.trim() || !password) {
        setError("Nama, email, dan password wajib diisi.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: fullName.trim(),
            }
          }
        });
        if (signUpError) throw signUpError;
        
        setMessage("Akun dibuat. Cek email untuk konfirmasi akun.");
        
        // If session exists because email confirmation is disabled, 
        // the Auth listener in App.jsx will handle the redirect.
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      const errorMsg = String(err?.message || "").toLowerCase();
      const status = err?.status;
      
      if (isRegister && (errorMsg.includes("rate limit") || status === 429)) {
        setError("Terlalu banyak percobaan daftar. Tunggu beberapa menit lalu coba lagi.");
        setCooldown(60);
        return;
      }

      if (isRegister && (errorMsg.includes("already registered") || errorMsg.includes("already exists"))) {
        setError("Email ini sudah terdaftar. Silakan login.");
        return;
      }

      setError(err?.message || "Gagal membuat akun.");
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
            className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl hidden md:block"
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
            className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl hidden md:block"
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
          className="w-full max-w-[460px] rounded-[2rem] border border-slate-700/30 bg-slate-900/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow: "0 24px 90px rgba(0,0,0,0.55), 0 0 80px rgba(16,185,129,0.08)"
          }}
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-6 sm:mb-8 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_50px_rgba(16,185,129,0.18)]"
            >
              <motion.div
                animate={!shouldReduceMotion ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="material-symbols-outlined text-emerald-400 text-3xl sm:text-4xl">rocket_launch</span>
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100"
            >
              WealthPilot
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-base sm:text-lg font-medium text-slate-400"
            >
              {isForgotPassword ? 'Reset your password' : isRegister ? 'Start managing your money smarter' : `Welcome back, ${fullName.split(' ')[0] || 'Commander'}`}
            </motion.p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-300 text-sm text-center flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-base">warning</span>
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm text-center flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              {message}
            </motion.div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="block h-12 sm:h-14 w-full rounded-2xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                  placeholder="commander@wealthpilot.ai"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="h-12 sm:h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 font-bold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.22)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 mt-2 sm:mt-4 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : cooldown > 0 ? (
                  `Tunggu ${cooldown}s`
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              <AnimatePresence mode="popLayout">
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2 mb-2">Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        setError("");
                      }}
                      className="block h-12 sm:h-14 w-full rounded-2xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
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
                  onChange={e => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="block h-12 sm:h-14 w-full rounded-2xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                  placeholder="commander@wealthpilot.ai"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2 mb-2">
                  <label className="block text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">PASSWORD</label>
                  {!isRegister && <span onClick={() => { setIsForgotPassword(true); setError(""); setMessage(""); }} className="text-emerald-400 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-emerald-300 transition-colors">Forgot Key?</span>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="block h-12 sm:h-14 w-full rounded-2xl border border-slate-700/50 bg-slate-950/70 px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-colors duration-200 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || (isRegister && cooldown > 0)}
                className="h-12 sm:h-14 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 font-bold text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.22)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 disabled:opacity-50 mt-2 sm:mt-4 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : isRegister && cooldown > 0 ? (
                  `Tunggu ${cooldown}s`
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>
          )}

          {(isRegister || isForgotPassword) && cooldown > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-[11px] font-black text-emerald-400/80 uppercase tracking-[0.2em] animate-pulse">
                Coba lagi dalam {cooldown}s
              </p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 sm:mt-10 sm:pt-8 border-t border-white/5 text-center">
            {isForgotPassword ? (
              <p className="text-slate-400 font-semibold text-sm">
                Remember your password?
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError("");
                    setMessage("");
                  }}
                  className="ml-3 text-emerald-400 font-black uppercase tracking-widest hover:text-emerald-300 transition-all border-b-2 border-emerald-500/20 hover:border-emerald-500"
                >
                  Back to Login
                </button>
              </p>
            ) : (
              <p className="text-slate-400 font-semibold text-sm">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setMessage("");
                  }}
                  className="ml-3 text-emerald-400 font-black uppercase tracking-widest hover:text-emerald-300 transition-all border-b-2 border-emerald-500/20 hover:border-emerald-500"
                >
                  {isRegister ? 'Login' : 'Join Fleet'}
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
