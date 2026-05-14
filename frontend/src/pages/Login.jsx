import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize master users list if empty
  useEffect(() => {
    const users = localStorage.getItem('wealthpilot_users');
    if (!users) {
      localStorage.setItem('wealthpilot_users', JSON.stringify([{
        id: '1',
        firstName: 'Alexander',
        lastName: 'Pilot',
        email: 'alexander@wealthpilot.local',
        password: 'password123', // NOTE: Plain text for local demo only
        avatarUrl: '',
        createdAt: new Date().toISOString()
      }]));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const users = JSON.parse(localStorage.getItem('wealthpilot_users') || '[]');

    if (mode === 'login') {
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
    } 
    else if (mode === 'register') {
      if (!formData.firstName || !formData.email || !formData.password) {
        return setError('Please fill all required fields');
      }
      if (!validateEmail(formData.email)) return setError('Invalid email format');
      if (formData.password.length < 6) return setError('Password must be at least 6 characters');
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
      if (users.some(u => u.email === formData.email)) return setError('Email already registered');

      const newUser = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        avatarUrl: '',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('wealthpilot_users', JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } 
    else if (mode === 'forgot') {
      const userIndex = users.findIndex(u => u.email === formData.email);
      if (userIndex === -1) return setError('Email not found');
      if (formData.newPassword.length < 6) return setError('Password must be at least 6 characters');
      if (formData.newPassword !== formData.confirmNewPassword) return setError('Passwords do not match');

      users[userIndex].password = formData.newPassword;
      localStorage.setItem('wealthpilot_users', JSON.stringify(users));
      setSuccess('Password updated successfully! You can now log in.');
      setMode('login');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  return (
    <motion.main 
      className="relative flex items-center justify-center min-h-screen w-full px-4 overflow-hidden bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div className="absolute inset-0 z-0 opacity-40">
        <img alt="High-end Architecture" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHAOl27dXqfghISikOvlYqQagVCDkmaLvY6k6qX7-DUtqgbSxhd16XUJVV9UiUR_E0e2ilkN6weVy6rckL2qrYiHz_rlALnc7190OCQTVhmdvdvW5x-vlTfbaQH4RLsbhGNozqK_hQqOfc49ke8ldffujDvbzc5k0R-8En10y5jF2kDdm89xkOaNC8SlXYNKzsfaFcehqjgXIFFhSKDKb1SWqGznkgkmCxhwumjRZD7dkjmwJWWbl8jvCiXCBZYRI2txhR-NO_BA"/>
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-transparent"></div>
      </motion.div>

      <div className="glass-card inner-glow relative z-10 w-full max-w-[480px] p-lg md:p-xl rounded-xl shadow-2xl border border-outline-variant/20">
        <div className="text-center mb-lg">
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">WealthPilot</span>
            <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Track. Control. Grow.</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mt-sm">
            {mode === 'login' ? 'Welcome back, Pilot.' : mode === 'register' ? 'Join the Fleet.' : 'Reset Access.'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            {mode === 'login' ? 'Your financial command center awaits.' : mode === 'register' ? 'Start your journey to financial excellence.' : 'Enter your email to secure your account.'}
          </p>
        </div>

        <form className="space-y-md" onSubmit={handleSubmit}>
          {error && <div className="bg-error/10 border border-error/30 text-error p-3 rounded-lg text-sm text-center font-bold">{error}</div>}
          {success && <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-lg text-sm text-center font-bold">{success}</div>}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">First Name</label>
                    <input name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="Alexander" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Last Name</label>
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="Pilot" />
                  </div>
                </div>
              )}

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Email Address</label>
                <input name="email" required type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="name@corporate.com" />
              </div>

              {mode === 'login' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-label-md text-label-md text-on-surface-variant">Password</label>
                    <button type="button" onClick={() => setMode('forgot')} className="font-label-md text-label-md text-primary hover:underline cursor-pointer">Forgot Password?</button>
                  </div>
                  <input name="password" required type="password" value={formData.password} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="••••••••" />
                </div>
              )}

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Password</label>
                    <input name="password" required type="password" value={formData.password} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Confirm</label>
                    <input name="confirmPassword" required type="password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {mode === 'forgot' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">New Password</label>
                    <input name="newPassword" required type="password" value={formData.newPassword} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2">Confirm New</label>
                    <input name="confirmNewPassword" required type="password" value={formData.confirmNewPassword} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="••••••••" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <button className="w-full bg-primary text-background font-bold py-4 rounded-lg shadow-lg shadow-primary/10 hover:scale-[0.98] transition-all mt-4 cursor-pointer">
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Update Password'}
          </button>
        </form>

        <div className="relative flex items-center gap-4 my-lg">
          <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
          <span className="font-label-md text-label-md text-on-surface-variant/40 uppercase text-[10px] font-bold">Local Auth Only</span>
          <div className="flex-grow h-[1px] bg-outline-variant/30"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 opacity-40 grayscale pointer-events-none">
          <button className="flex items-center justify-center gap-3 bg-surface-container border border-outline-variant/30 py-3 rounded-lg" type="button">
            <span className="font-label-md text-label-md text-on-surface">Google</span>
          </button>
          <button className="flex items-center justify-center gap-3 bg-surface-container border border-outline-variant/30 py-3 rounded-lg" type="button">
            <span className="font-label-md text-label-md text-on-surface">Apple</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-on-surface-variant mt-2">Google/Apple login requires OAuth setup.</p>

        <div className="mt-lg text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            {mode === 'login' ? (
              <>New to the fleet? <button onClick={() => setMode('register')} className="text-primary font-bold hover:underline ml-1">Create Account</button></>
            ) : (
              <>Already a pilot? <button onClick={() => setMode('login')} className="text-primary font-bold hover:underline ml-1">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </motion.main>
  );
}

export default Login;
