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
  onResetData 
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

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
    showFeedback('Profile changes saved successfully!');
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
    const formData = new FormData(e.target);
    setPreferences({
      currency: formData.get('currency'),
      theme: formData.get('theme'),
      dashboardPeriod: formData.get('dashboardPeriod'),
      numberFormat: formData.get('numberFormat'),
    });
    showFeedback('Preferences updated successfully!');
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
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'preferences', label: 'Preferences', icon: 'tune' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'security' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-lg">
      <div className="flex flex-col mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Settings</h2>
        <p className="text-on-surface-variant font-body-md">Manage your account preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all rounded-lg cursor-pointer ${
                activeTab === tab.id 
                ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

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
                <div className="glass-card p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">Personal Information</h3>
                  <form onSubmit={handleProfileSave}>
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 mb-lg">
                        <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container shadow-inner">
                          <img 
                            alt="User Avatar" 
                            className="w-full h-full object-cover" 
                            src={userProfile.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ_OXPH6lIRbjpy2ahFWztRDnU3cTGstfntAjv2D6IG_NKdZrO62xpA8NcAGNi0uNc9ZLNDHEiRnndTYwMkUq9OSq5o9VwFIpkelPTLkv5FJL3nM74iT8m2TZLfqHpDLKAVEfQta8DOCPbUphTDvrvBPQjAtK-3zRD7Gu7nIQ31brcMuTQUYCzfyzJSD3NpqsVKeAFbj34ER9D6vZxV0QrGTIDmHbpaE1E2eLcSQegXGD68q3xNxe41IYOnDGGGJZtG53q2gX8AQ"} 
                          />
                        </div>
                        <div className="flex flex-col gap-2">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">First Name</label>
                          <input 
                            name="firstName" 
                            required
                            type="text" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                            defaultValue={userProfile.firstName} 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Last Name</label>
                          <input 
                            name="lastName" 
                            type="text" 
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                            defaultValue={userProfile.lastName} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-on-surface-variant text-label-md font-medium">Email Address</label>
                        <input 
                          name="email" 
                          required
                          type="email" 
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-all" 
                          defaultValue={userProfile.email} 
                        />
                      </div>
                    </div>
                    <div className="mt-xl pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                      <span className="text-primary text-sm font-medium">{feedback}</span>
                      <button className="px-8 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg shadow-primary/20">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="glass-card p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">System Preferences</h3>
                  <form onSubmit={handlePrefSave}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Base Currency</label>
                          <select name="currency" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" defaultValue={preferences.currency}>
                            <option value="IDR">Indonesian Rupiah (IDR)</option>
                            <option value="USD">US Dollar (USD)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Appearance Theme</label>
                          <select name="theme" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" defaultValue={preferences.theme}>
                            <option value="Dark">Midnight Dark (Standard)</option>
                            <option value="Light">Corporate Light</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Default Period</label>
                          <select name="dashboardPeriod" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" defaultValue={preferences.dashboardPeriod}>
                            <option value="This Month">This Month</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                            <option value="This Year">This Year</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-on-surface-variant text-label-md font-medium">Number Format</label>
                          <select name="numberFormat" className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface outline-none" defaultValue={preferences.numberFormat}>
                            <option value="Indonesian">Indonesian (Rp 1.000,00)</option>
                            <option value="International">International ($1,000.00)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mt-xl pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                      <span className="text-primary text-sm font-medium">{feedback}</span>
                      <button className="px-8 py-3 bg-primary text-background font-bold rounded-xl hover:scale-[0.98] transition-transform cursor-pointer shadow-lg">
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="glass-card p-lg rounded-xl">
                  <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">Notifications & Alerts</h3>
                  <form onSubmit={handleNotifSave}>
                    <div className="space-y-4">
                      {[
                        { id: 'budgetWarning', label: 'Budget Warning', desc: 'Notify me when I exceed 80% of my budget' },
                        { id: 'monthlyReport', label: 'Monthly Report', desc: 'Receive a summary of my financial health every month' },
                        { id: 'debtReminder', label: 'Debt Reminder', desc: 'Alert me 3 days before any debt due date' },
                        { id: 'goalProgress', label: 'Goal Progress', desc: 'Updates on my financial goals status' },
                        { id: 'largeExpenseAlert', label: 'Large Expense Alert', desc: 'Notify me of any expense over Rp 1.000.000' }
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
                        Save Notifications
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-lg">
                  <div className="glass-card p-lg rounded-xl">
                    <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-md">Account Security</h3>
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
                          Logout Account
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-lg rounded-xl border-error/30">
                    <h3 className="font-headline-lg text-headline-lg-mobile text-error mb-md">Danger Zone</h3>
                    <p className="text-sm text-on-surface-variant mb-6">Resetting your finance data will permanently delete all transactions, assets, and debts records. This action cannot be undone.</p>
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
