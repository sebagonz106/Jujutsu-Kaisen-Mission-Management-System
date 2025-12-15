/**
 * @fileoverview Accessible dropdown multi-select component with chips summary.
 *
 * Renders a button-like control that opens a popover with a checkbox list of options.
 * Selected items are displayed as compact chips inside the control with overflow counter.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface MultiSelectOption {
  value: number;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: number[];
  onChange: (next: number[]) => void;
  maxChips?: number; // how many chips to show before "+N"
  disabled?: boolean;
}

/**
 * MultiSelect component.
 *
 * - Click the control to toggle the dropdown list
 * - Check/uncheck items to update the selected value array
 * - Selected items are summarized as chips; overflow is collapsed as +N
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = 'Seleccionar...',
  options,
  value,
  onChange,
  maxChips = 3,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (e.target instanceof Node && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = useMemo(
    () => options.filter(o => value.includes(o.value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggleValue = (v: number) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v));
    else onChange([...value, v]);
  };

  const chips = selected.slice(0, maxChips);
  const overflow = selected.length - chips.length;

  return (
    <div ref={rootRef} className="relative">
      <label className="block space-y-1">
        {label ? <span className="text-sm text-slate-700">{label}</span> : null}
        <button
          type="button"
          className={`w-full border rounded px-3 py-2 text-left flex gap-2 flex-wrap items-center transition-colors
            bg-[#f5f5f5] text-black border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setOpen(!open)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected.length === 0 ? (
            <span className="text-slate-500">{placeholder}</span>
          ) : (
            <div className="flex gap-1 flex-wrap">
              {chips.map(c => (
                <span key={c.value} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs
                  bg-indigo-500 text-white border border-indigo-600">
                  {c.label}
                  <button
                    type="button"
                    aria-label={`Remove ${c.label}`}
                    className="text-white hover:text-slate-100"
                    onClick={(e) => { e.stopPropagation(); toggleValue(c.value); }}
                  >×</button>
                </span>
              ))}
              {overflow > 0 && (
                <span className="text-xs text-slate-400">+{overflow}</span>
              )}
            </div>
          )}
        </button>
      </label>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded border border-slate-300 bg-white text-black shadow-lg ring-1 ring-indigo-500/30 max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              className="w-full border border-slate-300 rounded px-2 py-1 bg-slate-50 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Buscar..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <ul role="listbox" className="py-1">
            {filtered.map(o => (
              <li key={o.value}>
                <label className="flex items-center gap-2 px-3 py-1 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-indigo-500"
                    checked={value.includes(o.value)}
                    onChange={() => toggleValue(o.value)}
                  />
                  <span className="text-sm">{o.label}</span>
                </label>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
