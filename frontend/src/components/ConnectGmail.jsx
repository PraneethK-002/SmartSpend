import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import { Mail, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const ConnectGmail = ({ onSyncSuccess }) => {
  const { user, refreshProfile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const handleConnect = async () => {
    try {
      setError(null);
      const { data } = await api.get('/gmail/connect');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate Gmail connection.');
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSyncResult(null);
      const { data } = await api.post('/gmail/sync');
      setSyncResult(data);
      if (onSyncSuccess) {
        onSyncSuccess();
      }
      refreshProfile(); // refresh sync timestamp on user profile
    } catch (err) {
      setError(err.response?.data?.message || 'Synchronization failed.');
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = !!user?.gmailRefreshToken;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side info */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Gmail Sync Integration</h3>
            {isConnected ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Connected: <span className="font-semibold text-slate-600 dark:text-slate-300">{user.gmailEmail}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Connect your inbox to automatically parse transaction emails.
              </p>
            )}
            {user?.lastSyncedAt && isConnected && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Last synced: {new Date(user.lastSyncedAt).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div>
          {isConnected ? (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Transactions'}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="rounded-xl border-2 border-red-500 px-5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all duration-200"
            >
              Connect Gmail
            </button>
          )}
        </div>
      </div>

      {/* Sync Status / Messages */}
      {syncResult && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-sm">
          <p className="font-semibold">Synchronization Successful!</p>
          <p className="mt-1">
            Synced: <span className="font-bold">{syncResult.syncedCount}</span> new transactions. Skipped/Duplicates: <span className="font-bold">{syncResult.skippedCount}</span>.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectGmail;
