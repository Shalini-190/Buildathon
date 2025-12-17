import React from 'react';

export const ProcessingOverlay = ({ message = "Analyzing Video Content..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500">
      <div className="text-center max-w-md px-6">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin reverse"></div>
          <div className="absolute inset-4 border-b-4 border-pink-500 rounded-full animate-spin"></div>
          
          {/* Central Pulsing Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse tracking-tight">{message}</h2>
        
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden relative">
             <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full absolute top-0 left-0 w-full animate-progress"></div>
        </div>
        <p className="text-slate-500 text-sm font-mono mt-4">ClipVerb Intelligence Engine Active</p>
      </div>
    </div>
  );
};