import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';
import { PiggyBank, Plus, Loader2, Calendar, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Personal Care', 'Rent'];

const Budgets = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch budgets for selected month
  const { data: budgets = [], isLoading, refetch } = useQuery({
    queryKey: ['budgets', selectedMonth],
    queryFn: async () => {
      const { data } = await api.get('/budgets', { params: { month: selectedMonth } });
      return data;
    }
  });

  // Set budget mutation
  const saveBudgetMutation = useMutation({
    mutationFn: async ({ category, limit, month }) => {
      const { data } = await api.post('/budgets', { category, limit: Number(limit), month });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets', selectedMonth]);
      queryClient.invalidateQueries(['dashboardStats']);
      setLimit('');
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to save budget.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!limit || isNaN(limit) || Number(limit) < 0) {
      setError('Please enter a valid positive number for the budget limit.');
      return;
    }
    saveBudgetMutation.mutate({ category, limit, month: selectedMonth });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Monthly Budgets
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set spending ceilings for expense categories to prevent overspending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create/Edit Budget */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm h-fit">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PiggyBank size={18} className="text-indigo-600" />
            Set Budget Limit
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Target Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Target Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
                required
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
                required
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Limit Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                Monthly Limit (INR)
              </label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saveBudgetMutation.isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              {saveBudgetMutation.isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Save Budget Limit
            </button>
          </form>
        </div>

        {/* Right Side: Budgets List Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Budgets for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : budgets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-dark-border dark:bg-dark-card">
              <PiggyBank className="mx-auto text-slate-300" size={32} />
              <h4 className="mt-4 font-bold text-slate-700 dark:text-slate-300">No limits set</h4>
              <p className="mt-2 text-sm text-slate-400">Configure budget limits on the left side to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b) => (
                <div 
                  key={b._id} 
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{b.category}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-dark-bg px-2.5 py-1 rounded-md">
                      {b.month}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                      Rs. {b.limit.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                      Target monthly spending limit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Budgets;
