import React from 'react';
import { SparklesIcon, FileTextIcon, UserIcon } from './Icons';
import { UserSession } from '../types';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  user?: UserSession;
  onLogout: () => void;
}

export const Navbar = ({ currentView, setView, user, onLogout }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setView(user?.isAuthenticated ? 'dashboard' : 'home')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
             <span className="font-bold text-white text-lg">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Clip<span className="text-indigo-400">Verb</span></span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          <button
            onClick={() => setView('home')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === 'home' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Home
          </button>
           <button
            onClick={() => setView('about')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${currentView === 'about' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Features
          </button>
          {user?.isAuthenticated && (
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
              >
                <SparklesIcon className="w-3 h-3" />
                Dashboard
              </button>
          )}
        </div>

        <div className="flex items-center gap-4">
           {user?.isAuthenticated ? (
             <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">Agency</p>
                  <p className="text-xs font-bold text-white max-w-[100px] truncate">{user.user?.agencyName || 'Personal'}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all group"
                  title="Logout"
                >
                   <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                </button>
             </div>
           ) : (
             <button onClick={() => setView('login')} className="text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all">
                 Log In
             </button>
           )}
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/10 p-2 flex justify-around z-50">
          <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 ${currentView === 'home' ? 'text-indigo-400' : 'text-slate-500'}`}>
             <UserIcon className="w-5 h-5 mb-1" />
             <span className="text-[10px]">Home</span>
          </button>
          {user?.isAuthenticated && (
             <button onClick={() => setView('dashboard')} className={`flex flex-col items-center p-2 ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
                <SparklesIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Dash</span>
             </button>
          )}
          <button onClick={() => setView('about')} className={`flex flex-col items-center p-2 ${currentView === 'about' ? 'text-indigo-400' : 'text-slate-500'}`}>
             <FileTextIcon className="w-5 h-5 mb-1" />
             <span className="text-[10px]">About</span>
          </button>
      </div>
    </nav>
  );
};