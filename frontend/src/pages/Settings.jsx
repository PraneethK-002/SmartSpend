import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Settings as SettingsIcon, ShieldCheck, Mail, Moon, Sun, Info } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review credentials, configure inbox linkages, and toggle UI preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Account Profile details */}
        <div className="space-y-6">
          
          {/* User Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              SmartSpend Profile
            </h3>
            
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://via.placeholder.com/150'}
                alt={user?.name}
                className="h-16 w-16 rounded-full border-2 border-indigo-600"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{user?.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">
                  Google OAuth Active
                </span>
              </div>
            </div>
          </div>

          {/* Theme card switcher */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {isDark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
              Appearance Theme
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dark Mode</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Adjust contrast levels for dim-lit screens.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:hover:bg-dark-border transition-all duration-200"
              >
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Gmail and Integration Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Mail size={18} className="text-indigo-600" />
            Integration Setup Guide
          </h3>
          
          <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              SmartSpend scans bank transactions by reading subjects and content matching patterns for <span className="font-semibold text-slate-700 dark:text-slate-200">SBI, HDFC, ICICI, Axis, and Kotak</span> alerts.
            </p>
            
            <div className="rounded-xl bg-slate-50 dark:bg-dark-bg p-4 border border-slate-100 dark:border-dark-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                <Info size={14} className="text-indigo-600" />
                Google API Consent Requirements
              </div>
              <ol className="list-decimal pl-4 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li>Create credentials in Google Cloud Console.</li>
                <li>Enable the **Gmail API** inside the project.</li>
                <li>Add authorization redirect URIs for login and Gmail callbacks.</li>
                <li>Put the Client ID and Secret in your backend environment variables.</li>
                <li>In "Testing" state, add your Google account to "Test users".</li>
              </ol>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Note: Revoking Google integration access can be performed anytime from your Google Account's app access dashboard.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Settings;
