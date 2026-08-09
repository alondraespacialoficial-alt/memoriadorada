import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onCloseToast?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, onCloseToast }) => {
  const dismissHandler = onDismiss || onCloseToast || (() => {});
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissHandler} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onDismiss === 'function') {
        onDismiss(toast.id);
      }
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getBgAndBorder = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[#0E1B13] border-emerald-500/50 text-emerald-300';
      case 'error':
        return 'bg-[#1C0E0E] border-red-500/50 text-red-300';
      case 'warning':
        return 'bg-[#1C160B] border-amber-500/50 text-amber-300';
      default:
        return 'bg-[#121822] border-[#D4AF37]/50 text-[#F3E5C8]';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#E2B755] shrink-0" />;
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${getBgAndBorder()}`}
    >
      <div className="flex items-start gap-2.5 flex-1 pr-1">
        <div className="mt-0.5">{getIcon()}</div>
        <div>
          <h4 className="font-serif text-xs font-bold leading-tight">{toast.title}</h4>
          {toast.message && <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{toast.message}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (typeof onDismiss === 'function') {
            onDismiss(toast.id);
          }
        }}
        className="p-1.5 opacity-70 hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
        title="Cerrar aviso"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
