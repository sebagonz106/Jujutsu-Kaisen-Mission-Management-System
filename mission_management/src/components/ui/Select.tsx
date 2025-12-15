import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; helperText?: string };

export const Select: React.FC<SelectProps> = ({ label, helperText, className = '', children, ...props }) => {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm text-slate-200">{label}</span> : null}
      <select className={`w-full border rounded px-3 py-2 text-black bg-[#f5f5f5] border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${className}`} {...props}>
        {children}
      </select>
      {helperText ? <span className="text-xs text-slate-400">{helperText}</span> : null}
    </label>
  );
};
