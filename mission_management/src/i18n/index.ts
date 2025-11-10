import { es } from './es';

type Dict = typeof es;

const dict: Dict = es; // default to Spanish for now

type Path<T> = T extends object
  ? { [K in keyof T & string]: `${K}` | `${K}.${Path<T[K]>}` }[keyof T & string]
  : never;

// Very small template replacement: {name} -> value
function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return Object.entries(params).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), s);
}

export function t(key: Path<Dict>, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  // Walk the dictionary in a type-safe-ish way without using 'any'
  let cur: unknown = dict;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) {
      cur = undefined;
      break;
    }
    const rec = cur as Record<string, unknown>;
    cur = rec[p];
  }
  if (typeof cur === 'string') return interpolate(cur, params);
  return key; // fallback to key if missing
}

export { es } from './es';
