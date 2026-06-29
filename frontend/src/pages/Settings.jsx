import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAvatar } from '../services/financeService';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

function Settings({ 
  userProfile, 
  setUserProfile, 
  preferences, 
  setPreferences, 
  notifications, 
  setNotifications, 
  onLogout, 
  onResetData,
  t,
  fm
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const [prevPrefs, setPrevPrefs] = useState(preferences);
  if (preferences !== prevPrefs) {
    setPrevPrefs(preferences);
    setLocalPrefs(preferences);
  }

  const [prevProfile, setPrevProfile] = useState(userProfile);
  if (userProfile !== prevProfile) {
    setPrevProfile(userProfile);
    if (userProfile) {
      setForm({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || ""
      });
    }
  }

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        avatarUrl: userProfile.avatarUrl
      };
      
      await setUserProfile(payload);
      toast.success(t('saveChanges') + ' success!');
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be under 2MB.");
      return;
    }

    try {
      setIsUploadingAvatar(true);

      const avatarUrl = await uploadAvatar(file);
      
      await setUserProfile({
        ...userProfile,
        avatarUrl: avatarUrl
      });

      toast.success('Photo updated successfully!');
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      toast.error(err.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePrefSave = (e) => {
    e.preventDefault();
    setPreferences(localPrefs);
    toast.success(t('saveChanges') + ' success!');
  };

  const handleNotifSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setNotifications({
      budgetWarning: formData.get('budgetWarning') === 'on',
      monthlyReport: formData.get('monthlyReport') === 'on',
      debtReminder: formData.get('debtReminder') === 'on',
      goalProgress: formData.get('goalProgress') === 'on',
      largeExpenseAlert: formData.get('largeExpenseAlert') === 'on',
    });
    toast.success('Notification settings saved!');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: 'person' },
    { id: 'preferences', label: t('preferences'), icon: 'tune' },
    { id: 'notifications', label: t('notifications'), icon: 'notifications' },
    { id: 'security', label: t('security'), icon: 'security' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-[1000px] 2xl:max-w-[1400px] mx-auto p-8 2xl:p-12 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-10 2xl:mb-14"
      >
        <p className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.3em] text-emerald-400 mb-2 2xl:mb-3 ml-1">Configuration</p>
        <h2 className="text-4xl 2xl:text-6xl font-black text-slate-100 tracking-tighter">{t('settings')}</h2>
        <p className="text-sm 2xl:text-lg font-bold text-slate-500 tracking-tight mt-1 2xl:mt-3">Manage your command center and personal preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 2xl:gap-12">
        {/* Settings Navigation */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="md:col-span-1 flex md:flex-col gap-2 2xl:gap-4 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0"
        >
          {tabs.map(tab => (
            <motion.button 
              variants={item}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none md:w-full flex items-center gap-4 px-5 2xl:px-6 py-4 2xl:py-5 transition-colors duration-200 rounded-2xl cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-black shadow-[0_0_20px_rgba(74,222,128,0.05)]' 
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/50'
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] 2xl:text-3xl font-bold ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500'}`}>{tab.icon}</span>
              <span className="text-[10px] 2xl:text-sm font-black uppercase tracking-widest">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Settings Content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'profile' && (
                <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                  <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight mb-8 2xl:mb-10">Personal Information</h3>
                  
                  <form onSubmit={handleProfileSave}>
                    <div className="space-y-8 2xl:space-y-12">
                      <div className="flex flex-col sm:flex-row items-center gap-8 2xl:gap-12 mb-10 2xl:mb-14">
                        <div className="h-24 w-24 2xl:h-32 2xl:w-32 rounded-3xl overflow-hidden border-2 border-emerald-400/20 bg-slate-950/50 shadow-inner shrink-0 relative group">
                          <img 
                            alt="User Avatar" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            src={userProfile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ"} 
                          />
                        </div>
                        <div className="flex flex-col items-center sm:items-start gap-3 2xl:gap-4">
                          <button 
                            type="button"
                            disabled={isUploadingAvatar}
                            onClick={() => fileInputRef.current.click()}
                            className="px-5 2xl:px-6 py-2.5 2xl:py-3.5 bg-slate-950/50 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-xs 2xl:text-sm font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {isUploadingAvatar ? "Uploading..." : "Update Command Avatar"}
                          </button>
                          <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                          />
                          <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-widest">PNG, JPG or WEBP • Max 2MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 2xl:gap-10">
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('firstName')}</label>
                          <input 
                            name="firstName" 
                            required
                            type="text" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-colors duration-200 font-bold 2xl:text-lg" 
                            value={form.firstName} 
                            onChange={e => setForm({...form, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('lastName')}</label>
                          <input 
                            name="lastName" 
                            type="text" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-colors duration-200 font-bold 2xl:text-lg" 
                            value={form.lastName} 
                            onChange={e => setForm({...form, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 2xl:space-y-3">
                        <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('email')}</label>
                        <input 
                          name="email" 
                          required
                          type="email" 
                          className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-colors duration-200 font-bold 2xl:text-lg" 
                          value={form.email} 
                          onChange={e => setForm({...form, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-12 2xl:mt-16 pt-8 2xl:pt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-6 2xl:gap-8">
                      <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-10 2xl:px-12 py-3.5 2xl:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_30px_rgba(74,222,128,0.2)] uppercase tracking-widest text-xs 2xl:text-sm disabled:opacity-50">
                        {isSaving ? "Saving..." : "Commit Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                  <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight mb-8 2xl:mb-10">Localization & Visuals</h3>
                  <form onSubmit={handlePrefSave}>
                    <div className="space-y-8 2xl:space-y-12">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 2xl:gap-10">
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('currency')}</label>
                          <select 
                            name="currency" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 transition-colors duration-200 appearance-none cursor-pointer font-bold 2xl:text-lg" 
                            value={localPrefs.currency}
                            onChange={(e) => setLocalPrefs({...localPrefs, currency: e.target.value})}
                          >
                            <option value="IDR" className="bg-slate-900">IDR - Indonesian Rupiah</option>
                            <option value="USD" className="bg-slate-900">USD - US Dollar</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 2xl:gap-10">
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t('exchangeRate')} (1 USD = ? IDR)</label>
                          <input 
                            name="exchangeRate" 
                            type="number" 
                            step="0.01"
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 transition-colors duration-200 font-black 2xl:text-lg" 
                            value={localPrefs.exchangeRate}
                            onChange={(e) => setLocalPrefs({...localPrefs, exchangeRate: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Appearance Theme</label>
                          <select 
                            name="theme" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 transition-colors duration-200 appearance-none cursor-pointer font-bold 2xl:text-lg" 
                            value={localPrefs.theme}
                            onChange={(e) => setLocalPrefs({...localPrefs, theme: e.target.value})}
                          >
                            <option value="Dark" className="bg-slate-900">Midnight Emerald (Premium)</option>
                            <option value="Light" className="bg-slate-900">Corporate Crystal</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 2xl:mt-16 pt-8 2xl:pt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-6 2xl:gap-8">
                      <button className="w-full sm:w-auto px-10 2xl:px-12 py-3.5 2xl:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_30px_rgba(74,222,128,0.2)] uppercase tracking-widest text-xs 2xl:text-sm">
                        Update Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                  <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight mb-8 2xl:mb-10">Intelligence Alerts</h3>
                  <form onSubmit={handleNotifSave}>
                    <div className="space-y-4 2xl:space-y-6">
                      {[
                        { id: 'budgetWarning', label: 'Budget Warning', desc: 'Notify me when I exceed 80% of my budget' },
                        { id: 'monthlyReport', label: 'Monthly Report', desc: 'Receive a summary of my financial health every month' },
                        { id: 'debtReminder', label: 'Debt Reminder', desc: 'Alert me 3 days before any debt due date' },
                        { id: 'goalProgress', label: 'Goal Progress', desc: 'Updates on my financial goals status' },
                        { id: 'largeExpenseAlert', label: 'Large Expense Alert', desc: 'Notify me of any expense over ' + fm(1000000, preferences) }
                      ].map(notif => (
                        <label key={notif.id} className="flex items-center gap-5 2xl:gap-6 p-5 2xl:p-6 bg-slate-950/40 rounded-2xl cursor-pointer hover:bg-slate-950/60 transition-colors duration-200 border border-slate-700/30 group">
                          <input 
                            name={notif.id} 
                            type="checkbox" 
                            className="w-6 h-6 2xl:w-8 2xl:h-8 rounded-lg accent-emerald-400 border-slate-700 bg-slate-900" 
                            defaultChecked={notifications[notif.id]} 
                          />
                          <div className="flex-1">
                            <p className="font-bold text-slate-100 text-sm 2xl:text-lg group-hover:text-emerald-400 transition-colors">{notif.label}</p>
                            <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-widest mt-1 2xl:mt-2">{notif.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-12 2xl:mt-16 pt-8 2xl:pt-10 border-t border-slate-800 flex items-center justify-end">
                      <button className="px-10 2xl:px-12 py-3.5 2xl:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_30px_rgba(74,222,128,0.2)] uppercase tracking-widest text-xs 2xl:text-sm">
                        Commit Alerts
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 2xl:space-y-12">
                  <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                    <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight mb-8 2xl:mb-10">Access Control</h3>
                    <div className="space-y-6 2xl:space-y-8">
                      <div className="flex justify-between items-center p-6 2xl:p-8 bg-slate-950/40 rounded-2xl border border-slate-700/30">
                        <div>
                          <p className="font-black text-slate-100 text-sm 2xl:text-lg tracking-tight">Active Command Session</p>
                          <p className="text-[10px] 2xl:text-xs font-black text-slate-500 uppercase tracking-widest mt-1 2xl:mt-2">Chrome Protocol • Windows OS</p>
                        </div>
                        <span className="px-3 2xl:px-4 py-1 2xl:py-1.5 bg-emerald-400/10 text-emerald-400 text-[9px] 2xl:text-[11px] font-black rounded-lg uppercase tracking-widest border border-emerald-400/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]">Authorized</span>
                      </div>
                      
                      <div className="flex gap-4 2xl:gap-6 pt-4 2xl:pt-6">
                        <button onClick={onLogout} className="flex-1 py-4 2xl:py-5 bg-slate-950/40 border border-red-500/20 text-red-300 rounded-xl font-black uppercase tracking-widest text-xs 2xl:text-sm hover:bg-red-500/10 transition-colors duration-200 cursor-pointer">
                          Terminate Session
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-700/30 bg-slate-900/55 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                    <h3 className="text-xl 2xl:text-3xl font-black text-slate-100 tracking-tight mb-8 2xl:mb-10">Update Password</h3>
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-6 2xl:space-y-8">
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">New Password</label>
                          <input 
                            required
                            type="password" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-colors duration-200 font-bold 2xl:text-lg" 
                            value={passwordForm.newPassword} 
                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 2xl:space-y-3">
                          <label className="text-[10px] 2xl:text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm New Password</label>
                          <input 
                            required
                            type="password" 
                            className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-5 2xl:px-6 py-3 2xl:py-4 text-slate-100 outline-none focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 transition-colors duration-200 font-bold 2xl:text-lg" 
                            value={passwordForm.confirmPassword} 
                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          />
                        </div>
                        <div className="pt-4 2xl:pt-6 flex justify-end">
                          <button type="submit" disabled={isUpdatingPassword} className="px-10 2xl:px-12 py-3.5 2xl:py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-950 font-black rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_30px_rgba(74,222,128,0.2)] uppercase tracking-widest text-xs 2xl:text-sm disabled:opacity-50">
                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 2xl:p-12 shadow-xl backdrop-blur-xl">
                    <h3 className="text-xl 2xl:text-3xl font-black text-red-300 tracking-tight mb-4 2xl:mb-6">Protocol Zero</h3>
                    <p className="text-sm 2xl:text-lg font-bold text-slate-400 mb-8 2xl:mb-10 tracking-tight">{t('confirmReset')}</p>
                    <button 
                      onClick={onResetData}
                      className="w-full py-4 2xl:py-5 bg-gradient-to-r from-red-400 to-red-500 text-slate-950 font-black rounded-xl hover:from-red-300 hover:to-red-400 transition-colors duration-200 cursor-pointer shadow-[0_0_30_rgba(248,113,113,0.2)] uppercase tracking-[0.2em] text-xs 2xl:text-sm"
                    >
                      Purge Financial Repository
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Settings;
