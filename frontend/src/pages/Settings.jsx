import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Sync local state when props change
  React.useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...userProfile,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    };
    setUserProfile(updated);
    showFeedback(t('saveChanges') + ' success!');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserProfile(prev => ({ ...prev, avatarUrl: reader.result }));
      showFeedback('Photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handlePrefSave = (e) => {
    e.preventDefault();
    setPreferences(localPrefs);
    showFeedback(t('saveChanges') + ' success!');
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
    showFeedback('Notification settings saved!');
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
    <div className="max-w-[1000px] mx-auto p-lg">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-lg"
      >
        <h2 className="font-headline-lg text-headline-lg text-on-surface">{t('settings')}</h2>
        <p className="text-on-surface-variant font-body-md">Manage your account preferences and configurations.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {/* Settings Navigation */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0"
        >
          {tabs.map(tab => (
            <motion.button 
              variants={item}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none md:w-full flex items-center gap-3 px-4 py-3 transition-all rounded-lg cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === tab.id 
                ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary font-bold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">{tab.icon}</span>
              <span className="text-sm md:text-base">{tab.label}</span>
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
                <div className="glass-card p-md md:p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">{t('profile')}</h3>
                  <form onSubmit={handleProfileSave}>
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 mb-lg">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container shadow-inner shrink-0">
                          <img 
                            alt="User Avatar" 
                            className="w-full h-full object-cover" 
                            src={userProfile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ"} 
                          />
                        </div>
                        <div className="flex flex-col items-center sm:items-start gap-2">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-lg hover:bg-surface-variant transition-colors cursor-pointer text-sm font-bold"
                          >
                            Change Photo
                          </button>
                          <input 
                            type="file" 
                            hidden 
                            ref={fileInputRef} 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                          />
                          <p className="text-[10px] text-on-surface-variant uppercase">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">{t('firstName')}</label>
                          <input 
                            name="firstName" 
                            required
                            type="text" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                            defaultValue={userProfile.firstName} 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">{t('lastName')}</label>
                          <input 
                            name="lastName" 
                            type="text" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                            defaultValue={userProfile.lastName} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-on-surface-variant text-label-md font-medium">{t('email')}</label>
                        <input 
                          name="email" 
                          required
                          type="email" 
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                          defaultValue={userProfile.email} 
                        />
                      </div>
                    </div>
                    <div className="mt-xl pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-primary text-sm font-medium">{feedback}</span>
                      <button className="w-full sm:w-auto px-8 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-primary/20">
                        {t('saveChanges')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="glass-card p-md md:p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">{t('preferences')}</h3>
                  <form onSubmit={handlePrefSave}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">{t('currency')}</label>
                          <select 
                            name="currency" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" 
                            value={localPrefs.currency}
                            onChange={(e) => setLocalPrefs({...localPrefs, currency: e.target.value})}
                          >
                            <option value="IDR">IDR - Indonesian Rupiah</option>
                            <option value="USD">USD - US Dollar</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">{t('exchangeRate')} (1 USD = ? IDR)</label>
                          <input 
                            name="exchangeRate" 
                            type="number" 
                            step="0.01"
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                            value={localPrefs.exchangeRate}
                            onChange={(e) => setLocalPrefs({...localPrefs, exchangeRate: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Appearance Theme</label>
                          <select 
                            name="theme" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" 
                            value={localPrefs.theme}
                            onChange={(e) => setLocalPrefs({...localPrefs, theme: e.target.value})}
                          >
                            <option value="Dark">Midnight Dark (Standard)</option>
                            <option value="Light">Corporate Light</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-xl pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-primary text-sm font-medium">{feedback}</span>
                      <button className="w-full sm:w-auto px-8 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg">
                        {t('saveChanges')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="glass-card p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">{t('notifications')}</h3>
                  <form onSubmit={handleNotifSave}>
                    <div className="space-y-4">
                      {[
                        { id: 'budgetWarning', label: 'Budget Warning', desc: 'Notify me when I exceed 80% of my budget' },
                        { id: 'monthlyReport', label: 'Monthly Report', desc: 'Receive a summary of my financial health every month' },
                        { id: 'debtReminder', label: 'Debt Reminder', desc: 'Alert me 3 days before any debt due date' },
                        { id: 'goalProgress', label: 'Goal Progress', desc: 'Updates on my financial goals status' },
                        { id: 'largeExpenseAlert', label: 'Large Expense Alert', desc: 'Notify me of any expense over ' + fm(1000000, preferences) }
                      ].map(notif => (
                        <label key={notif.id} className="flex items-center gap-4 p-4 bg-surface-container/50 rounded-xl cursor-pointer hover:bg-surface-container transition-colors border border-outline-variant/10">
                          <input 
                            name={notif.id} 
                            type="checkbox" 
                            className="w-5 h-5 rounded accent-primary border-outline-variant" 
                            defaultChecked={notifications[notif.id]} 
                          />
                          <div className="flex-1">
                            <p className="font-bold text-on-surface text-sm">{notif.label}</p>
                            <p className="text-xs text-on-surface-variant">{notif.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-xl pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                      <span className="text-primary text-sm font-medium">{feedback}</span>
                      <button className="px-8 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg">
                        {t('saveChanges')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-lg">
                  <div className="glass-card p-lg rounded-xl">
                    <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">{t('security')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-surface-container/50 rounded-xl border border-outline-variant/10">
                        <div>
                          <p className="font-bold text-sm">Active Session</p>
                          <p className="text-xs text-on-surface-variant">Browser: Chrome on Windows</p>
                        </div>
                        <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase">Current</span>
                      </div>
                      
                      <div className="flex gap-4 pt-4">
                        <button onClick={onLogout} className="flex-1 py-3 bg-surface-container border border-error/30 text-error rounded-xl font-bold hover:bg-error/10 transition-colors cursor-pointer">
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-lg rounded-xl border-error/30">
                    <h3 className="font-headline-lg text-headline-lg-mobile text-error mb-md">Danger Zone</h3>
                    <p className="text-sm text-on-surface-variant mb-6">{t('confirmReset')}</p>
                    <button 
                      onClick={onResetData}
                      className="w-full py-4 bg-error text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-error/20"
                    >
                      Reset All Finance Data
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
