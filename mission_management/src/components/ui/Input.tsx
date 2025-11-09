import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; helperText?: string };

export const Input: React.FC<InputProps> = ({ label, helperText, className = '', ...props }) => {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm text-slate-200">{label}</span> : null}
      <input className={`w-full border rounded px-3 py-2 text-black ${className}`} {...props} />
      {helperText ? <span className="text-xs text-slate-400">{helperText}</span> : null}
    </label>
  );
};
