import React from 'react';
import { CalendarRange, CreditCard, Clock } from 'lucide-react';

const RecurringPaymentsList = ({ recurring = [] }) => {
  if (recurring.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm text-center">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Recurring Bills</h3>
        <p className="text-sm text-slate-400 py-4">No subscription patterns detected yet. Process more transactions to automatically analyze.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <CalendarRange size={18} className="text-indigo-600" />
        Recurring Payments Detected
      </h3>
      <div className="space-y-4">
        {recurring.map((item) => {
          const isOverdue = item.status === 'Overdue';
          return (
            <div 
              key={item.merchant} 
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-dark-border hover:bg-slate-50/50 dark:hover:bg-dark-bg/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.merchant}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-500 dark:text-slate-400">
                      {item.frequency}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      Next: {new Date(item.nextExpected).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Rs. {item.averageAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1.5 ${
                  isOverdue 
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecurringPaymentsList;
