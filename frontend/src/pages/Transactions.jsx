import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Check, 
  CreditCard 
} from 'lucide-react';

const CATEGORIES = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Personal Care', 'Rent', 'Uncategorized'];
const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'];

const Transactions = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Fetch transactions list
  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', { search, category, bank, type, sortBy, sortOrder, page }],
    queryFn: async () => {
      const { data } = await api.get('/transactions', {
        params: {
          search,
          category,
          bank,
          type,
          sortBy,
          sortOrder,
          page,
          limit: 10
        }
      });
      return data;
    }
  });

  // Category modification mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, newCategory }) => {
      const { data } = await api.put(`/transactions/${id}/category`, { category: newCategory });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['dashboardStats']);
    }
  });

  const handleCategoryChange = (id, newCategory) => {
    updateCategoryMutation.mutate({ id, newCategory });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true);
      const response = await api.get(`/transactions/pdf`, {
        params: { month: selectedMonth },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `SmartSpend-Report-${selectedMonth}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to generate PDF report: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Transaction Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, edit categories, and download monthly statements.
          </p>
        </div>
        
        {/* PDF Download Area */}
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-dark-border dark:bg-dark-card dark:text-slate-300"
          />
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200"
          >
            {downloadingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloadingPDF ? 'Exporting...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-border dark:bg-dark-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search merchant or ref..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card transition-all duration-200"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <select
              value={bank}
              onChange={(e) => { setBank(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
            >
              <option value="">All Banks</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300 dark:focus:bg-dark-card"
            >
              <option value="">All Types</option>
              <option value="debit">Debit (Expenses)</option>
              <option value="credit">Credit (Earnings)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={36} className="animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 dark:bg-red-950/20 dark:text-red-400">
          <p className="font-semibold">Error retrieving transactions</p>
          <p className="text-sm mt-1">{error.message || 'An error occurred.'}</p>
        </div>
      ) : data?.transactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-dark-border dark:bg-dark-card">
          <CreditCard className="mx-auto text-slate-400" size={32} />
          <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-300">No transactions found</h3>
          <p className="mt-2 text-sm text-slate-400">Try adjusting your filters or sync your Gmail inbox.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-dark-border dark:bg-dark-card shadow-sm transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                <tr>
                  <th 
                    onClick={() => toggleSort('date')}
                    className="cursor-pointer px-6 py-4 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">Bank</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Category (Manual Edit)</th>
                  <th className="px-6 py-4">Reference No</th>
                  <th 
                    onClick={() => toggleSort('amount')}
                    className="cursor-pointer px-6 py-4 text-right hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      Amount <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-dark-border dark:border-dark-border">
                {data.transactions.map((tx) => {
                  const isDebit = tx.type === 'debit';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/20 transition-colors duration-150">
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {tx.bankName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                        {tx.merchant}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={tx.category || 'Uncategorized'}
                          onChange={(e) => handleCategoryChange(tx._id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-slate-300"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {tx.referenceNumber}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isDebit ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isDebit ? '-' : '+'} Rs. {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-100 dark:border-dark-border text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Page <span className="font-semibold text-slate-700 dark:text-slate-300">{data.page}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{data.pages}</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-card disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, data.pages))}
                  disabled={page === data.pages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-card disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Transactions;
