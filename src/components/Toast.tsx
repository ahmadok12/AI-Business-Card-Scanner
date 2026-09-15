import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-full shadow-[0_8px_24px_rgba(69,66,62,0.12)] border text-xs font-grotesk font-semibold transition-all duration-300 transform translate-y-0 backdrop-blur-md ${
            toast.type === 'success'
              ? 'bg-[#E8F8F0]/95 border-emerald-200 text-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-200 text-rose-900'
              : 'bg-white/95 border-[#EDE8E1] text-[#181716]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pl-1">
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#FF5722] shrink-0" />}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors text-[#7C7875] hover:text-[#181716] ml-2 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
