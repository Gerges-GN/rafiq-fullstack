import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 bg-white" dir="rtl">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      </div>
      
      <p className="mt-4 text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}