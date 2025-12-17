import React from 'react';

export const ProcessingOverlay = ({ message = "Analyzing Video Content..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F19]/90 backdrop-blur-xl transition-all duration-500">
      <div className="text-center max-w-md px-8 relative">
        
        {/* Animated Glow Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] animate-pulse"></div>

        <div className="relative w-32 h-32 mx-auto mb-10">
          <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin reverse opacity-80"></div>
          <div className="absolute inset-4 border-b-4 border-pink-500 rounded-full animate-spin opacity-60"></div>
          
          {/* Central Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-ping shadow-[0_0_20px_white]"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 animate-pulse tracking-tight">{message}</h2>
        
        <div className="w-full bg-slate-800/50 rounded-full h-1.5 mb-3 overflow-hidden relative backdrop-blur-sm">
             <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full absolute top-0 left-0 w-full animate-progress shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        </div>
        <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">ClipVerb Intelligence Engine v2.0</p>
      </div>
    </div>
  );
};