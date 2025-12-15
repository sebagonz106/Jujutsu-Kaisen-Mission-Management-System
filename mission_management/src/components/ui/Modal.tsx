import React from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-jjk-dark border border-jjk-ash rounded-xl shadow-mystical flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-jjk-ash flex-shrink-0">
          <h2 className="text-lg font-semibold page-title m-0">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">✕</Button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto flex-1">{children}</div>
        {footer ? <div className="px-5 py-3 border-t border-jjk-ash flex-shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
};
