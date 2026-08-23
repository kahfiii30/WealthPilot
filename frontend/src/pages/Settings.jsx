import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAvatar, fetchTelegramLink, linkTelegramAccount } from '../services/financeService';
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
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [linkedTelegramId, setLinkedTelegramId] = useState(null);
  
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

  useEffect(() => {
    const loadTelegramLink = async () => {
      const link = await fetchTelegramLink();
      if (link) {
        setLinkedTelegramId(link);
        setTelegramId(link);
      }
    };
    loadTelegramLink();
  }, []);

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
    { id: 'integrations', label: 'Integrations', icon: 'hub' },
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
    <div className="p-4 md:p-8 pb-[100px]">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1 ml-1">Configuration</p>
        <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{t('settings')}</h2>
        <p className="text-sm font-medium text-neutral-500 tracking-tight mt-1">Manage your command center and personal preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
        {/* Settings Navigation */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible custom-scrollbar pb-2 md:pb-0"
        >
          {tabs.map(tab => (
            <motion.button 
              variants={item}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none md:w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 rounded-lg cursor-pointer whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-primary/10 text-primary font-semibold' 
                : 'text-neutral-500 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'text-primary' : 'text-neutral-500'}`}>{tab.icon}</span>
              <span className="text-sm font-semibold">{tab.label}</span>
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
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Personal Information</h3>
                  
                  <form onSubmit={handleProfileSave}>
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                        <div className="h-24 w-24 rounded-full overflow-hidden border border-white/10 bg-white/[0.02] shrink-0 relative group">
                          <img 
                            alt="User Avatar" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            src={userProfile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ"} 
                          />
                        </div>
                        <div className="flex flex-col items-center sm:items-start gap-2">
                          <button 
                            type="button"
                            disabled={isUploadingAvatar}
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-white/[0.05] border border-white/10 text-white rounded-lg hover:bg-white/[0.1] transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                          >
                            {isUploadingAvatar ? "Uploading..." : "Update Avatar"}
                          </button>
                          <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                          />
                          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">PNG, JPG or WEBP • Max 2MB</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('firstName')}</label>
                          <input 
                            name="firstName" 
                            required
                            type="text" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                            value={form.firstName} 
                            onChange={e => setForm({...form, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('lastName')}</label>
                          <input 
                            name="lastName" 
                            type="text" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                            value={form.lastName} 
                            onChange={e => setForm({...form, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('email')}</label>
                        <input 
                          name="email" 
                          required
                          type="email" 
                          className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                          value={form.email} 
                          onChange={e => setForm({...form, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4">
                      <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200 cursor-pointer text-sm disabled:opacity-50">
                        {isSaving ? "Saving..." : "Commit Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Localization & Visuals</h3>
                  <form onSubmit={handlePrefSave}>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('currency')}</label>
                          <select 
                            name="currency" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 appearance-none cursor-pointer text-sm" 
                            value={localPrefs.currency}
                            onChange={(e) => setLocalPrefs({...localPrefs, currency: e.target.value})}
                          >
                            <option value="IDR" className="bg-[#0a0a0a]">IDR - Indonesian Rupiah</option>
                            <option value="USD" className="bg-[#0a0a0a]">USD - US Dollar</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">{t('exchangeRate')} (1 USD = ? IDR)</label>
                          <input 
                            name="exchangeRate" 
                            type="number" 
                            step="0.01"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                            value={localPrefs.exchangeRate}
                            onChange={(e) => setLocalPrefs({...localPrefs, exchangeRate: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">Appearance Theme</label>
                          <select 
                            name="theme" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 appearance-none cursor-pointer text-sm" 
                            value={localPrefs.theme}
                            onChange={(e) => setLocalPrefs({...localPrefs, theme: e.target.value})}
                          >
                            <option value="Dark" className="bg-[#0a0a0a]">Minimalist Premium (Dark)</option>
                            <option value="Light" className="bg-[#0a0a0a]">Light Theme</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4">
                      <button className="w-full sm:w-auto px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200 cursor-pointer text-sm">
                        Update Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Intelligence Alerts</h3>
                  <form onSubmit={handleNotifSave}>
                    <div className="space-y-4">
                      {[
                        { id: 'budgetWarning', label: 'Budget Warning', desc: 'Notify me when I exceed 80% of my budget' },
                        { id: 'monthlyReport', label: 'Monthly Report', desc: 'Receive a summary of my financial health every month' },
                        { id: 'debtReminder', label: 'Debt Reminder', desc: 'Alert me 3 days before any debt due date' },
                        { id: 'goalProgress', label: 'Goal Progress', desc: 'Updates on my financial goals status' },
                        { id: 'largeExpenseAlert', label: 'Large Expense Alert', desc: 'Notify me of any expense over ' + fm(1000000, preferences) }
                      ].map(notif => (
                        <label key={notif.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-lg cursor-pointer hover:bg-white/[0.04] transition-colors duration-200 border border-white/5 group">
                          <input 
                            name={notif.id} 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-white/10 bg-white/[0.05] accent-primary" 
                            defaultChecked={notifications[notif.id]} 
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">{notif.label}</p>
                            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{notif.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-end">
                      <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200 cursor-pointer text-sm">
                        Commit Alerts
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-6">Access Control</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-lg border border-white/5">
                        <div>
                          <p className="font-semibold text-white text-sm tracking-tight">Active Command Session</p>
                          <p className="text-[11px] font-medium text-neutral-500 mt-1">Chrome Protocol • Windows OS</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">Authorized</span>
                      </div>
                      
                      <div className="flex gap-4 pt-2">
                        <button onClick={onLogout} className="flex-1 py-3 bg-white/[0.02] border border-red-500/20 text-red-400 rounded-lg font-semibold text-sm hover:bg-red-500/10 transition-colors duration-200 cursor-pointer">
                          Terminate Session
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-white tracking-tight mb-6">Update Password</h3>
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">New Password</label>
                          <input 
                            required
                            type="password" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                            value={passwordForm.newPassword} 
                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">Confirm New Password</label>
                          <input 
                            required
                            type="password" 
                            className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors duration-200 text-sm" 
                            value={passwordForm.confirmPassword} 
                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          />
                        </div>
                        <div className="pt-4 flex justify-end">
                          <button type="submit" disabled={isUpdatingPassword} className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors duration-200 cursor-pointer text-sm disabled:opacity-50">
                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-red-400 tracking-tight mb-3">Protocol Zero</h3>
                    <p className="text-sm font-medium text-neutral-400 mb-6 tracking-tight">{t('confirmReset')}</p>
                    <button 
                      onClick={onResetData}
                      className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 cursor-pointer text-sm"
                    >
                      Purge Financial Repository
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 lg:p-8">
                  <h3 className="text-xl font-bold text-white tracking-tight mb-8">Integrations</h3>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-white/[0.02] rounded-lg border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#2AABEE]/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#2AABEE] text-xl">send</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm tracking-tight">Telegram Bot</p>
                          <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Chat to log finances</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${linkedTelegramId ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/[0.05] text-neutral-400 border-white/10'} text-[10px] font-bold rounded uppercase tracking-wider border`}>
                        {linkedTelegramId ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>

                    <div className="p-5 bg-white/[0.01] rounded-lg border border-white/5">
                      <h4 className="text-sm font-semibold text-white mb-2">How to connect:</h4>
                      <ol className="list-decimal list-inside text-xs text-neutral-400 space-y-2 mb-6">
                        <li>Open Telegram and search for your bot.</li>
                        <li>Type <code className="bg-white/[0.05] px-1 py-0.5 rounded text-primary border border-white/10">/start</code></li>
                        <li>The bot will reply with your <strong>Telegram ID</strong>.</li>
                        <li>Paste that ID below and click Connect.</li>
                      </ol>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          setIsLinkingTelegram(true);
                          await linkTelegramAccount(telegramId);
                          setLinkedTelegramId(telegramId);
                          toast.success("Telegram account linked successfully!");
                        } catch (err) {
                          toast.error(err.message || "Failed to link Telegram account");
                        } finally {
                          setIsLinkingTelegram(false);
                        }
                      }}>
                        <div className="space-y-2">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 ml-1">Telegram ID</label>
                          <div className="flex gap-3">
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. 123456789"
                              className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary/50 transition-colors text-sm" 
                              value={telegramId} 
                              onChange={e => setTelegramId(e.target.value)}
                            />
                            <button type="submit" disabled={isLinkingTelegram || telegramId === linkedTelegramId} className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors text-sm disabled:opacity-50">
                              {isLinkingTelegram ? "..." : (linkedTelegramId ? "Update" : "Connect")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
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
