import React from 'react';

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table className="w-full text-left border-collapse">{children}</table>
);
export const THead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-800/40">{children}</thead>
);
export const TBody: React.FC<{ children: React.ReactNode }> = ({ children }) => <tbody>{children}</tbody>;
export const TH: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th className={`border-b p-2 text-slate-300 ${className}`} {...props} />
);
export const TD: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td className={`border-b p-2 ${className}`} {...props} />
);

export const SortHeader: React.FC<{
  label: string;
  active: boolean;
  direction: 'asc' | 'desc';
  onClick: () => void;
}> = ({ label, active, direction, onClick }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:underline">
    {label}
    {active ? <span className="text-xs">{direction === 'asc' ? '▲' : '▼'}</span> : <span className="text-xs text-slate-500">↕</span>}
  </button>
);
