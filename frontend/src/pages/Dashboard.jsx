import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ConnectGmail from '../components/ConnectGmail.jsx';
import StatCard from '../components/StatCard.jsx';
import DashboardCharts from '../components/DashboardCharts.jsx';
import BudgetProgress from '../components/BudgetProgress.jsx';
import RecurringPaymentsList from '../components/RecurringPaymentsList.jsx';
import { IndianRupee, CreditCard, Mail, Loader2, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Query stats
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/stats');
      return data;
    }
  });

  // Query recurring
  const { 
    data: recurring, 
    isLoading: isRecurringLoading,
    refetch: refetchRecurring
  } = useQuery({
    queryKey: ['recurringPayments'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/recurring');
      return data;
    }
  });

  const handleSyncSuccess = () => {
    refetchStats();
    refetchRecurring();
  };

  const isLoading = isStatsLoading || isRecurringLoading;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's a breakdown of your personal bank statement finances.
          </p>
        </div>
        <button
          onClick={handleSyncSuccess}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-border dark:bg-dark-card dark:text-slate-300 dark:hover:bg-dark-border shadow-sm disabled:opacity-50 transition-all duration-200"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Reload Dashboard
        </button>
      </div>

      {/* Gmail Connection State Card */}
      <ConnectGmail onSyncSuccess={handleSyncSuccess} />

      {isLoading ? (
        <div className="flex h-96 w-full items-center justify-center">
          <Loader2 size={36} className="animate-spin text-indigo-600" />
        </div>
      ) : statsError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          <h3 className="font-bold">Error loading dashboard</h3>
          <p className="mt-1 text-sm">{statsError.message || 'An error occurred while compiling transaction summaries.'}</p>
        </div>
      ) : (
        <>
          {/* Key Indicators Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="All-Time Spending"
              value={`Rs. ${(stats?.totalExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              icon={IndianRupee}
              colorClass="bg-indigo-600"
              description="Sum of all parsed debit transactions"
            />
            <StatCard
              title="Monthly Expenses"
              value={`Rs. ${(stats?.monthlyExpenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              icon={CreditCard}
              colorClass="bg-rose-500"
              description="Total debited this current month"
            />
            <StatCard
              title="Connected Inbox"
              value={user?.gmailEmail || 'Not Connected'}
              icon={Mail}
              colorClass="bg-red-500"
              description={user?.gmailEmail ? 'Active Gmail Offline sync connection' : 'Link account to fetch bank alerts'}
            />
          </div>

          {/* Visual trend charts */}
          <DashboardCharts stats={stats} />

          {/* Double Column for Budgets and Subscriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BudgetProgress progress={stats?.budgetProgress || []} />
            </div>
            <div>
              <RecurringPaymentsList recurring={recurring || []} />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
