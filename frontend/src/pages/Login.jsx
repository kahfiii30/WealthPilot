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
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl border border-outline-variant/20 shadow-2xl bg-surface-dim"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">WealthPilot</h1>
          <p className="text-on-surface-variant text-sm">Sign in to your financial command center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl h-12 px-4 text-on-surface focus:border-primary/50 transition-all outline-none"
              required 
            />
          </div>
          <div>
            <label className="block text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl h-12 px-4 text-on-surface focus:border-primary/50 transition-all outline-none"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-background h-12 rounded-xl font-bold hover:scale-[0.98] active:scale-[0.95] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
