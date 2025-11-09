import React from 'react';

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded">
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    {description ? <p className="text-slate-400 mb-4">{description}</p> : null}
    {action}
  </div>
);
