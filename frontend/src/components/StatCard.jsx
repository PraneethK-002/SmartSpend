import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'bg-indigo-600', description }) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-border dark:bg-dark-card transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-all duration-200">
            {value}
          </h4>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${colorClass} shadow-md group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={20} />
        </div>
      </div>
      {description && (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{description}</p>
      )}
    </div>
  );
};

export default StatCard;
