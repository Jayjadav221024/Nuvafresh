import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Purifying farm data with O₃ standards...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center gap-4 text-emerald-400">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
          <Sparkles className="h-5 w-5 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-sm font-medium tracking-wide text-slate-300 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 text-emerald-400 gap-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm text-slate-400">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
