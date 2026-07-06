import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';

const BudgetProgress = ({ progress = [] }) => {
  if (progress.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm text-center">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Category Budgets</h3>
        <p className="text-sm text-slate-400 py-4">No budgets set for this month. Set up target limits in the Budgets tab.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-border dark:bg-dark-card shadow-sm">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-indigo-600" />
        Budget Progress
      </h3>
      <div className="space-y-5">
        {progress.map((item) => {
          const percent = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
          const isOver = item.spent > item.limit;
          
          let progressColor = 'bg-emerald-500';
          if (percent >= 90) {
            progressColor = 'bg-rose-500';
          } else if (percent >= 60) {
            progressColor = 'bg-amber-500';
          }

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.category}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Rs. {item.spent.toLocaleString('en-IN')} of Rs. {item.limit.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {percent.toFixed(0)}% used
                </span>
                {isOver && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                    <AlertCircle size={10} />
                    Over Budget by Rs. {(item.spent - item.limit).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
