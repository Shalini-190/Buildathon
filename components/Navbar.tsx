import React, { useState, useEffect } from 'react';
import { SparklesIcon, FileTextIcon, UserIcon, ClipVerbLogo } from './Icons';
import { UserSession } from '../types';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  user?: UserSession;
  onLogout: () => void;
}

export const Navbar = ({ currentView, setView, user, onLogout }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B0F19]/80 backdrop-blur-lg border-b border-white/5 py-2 shadow-lg' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setView(user?.isAuthenticated ? 'dashboard' : 'home')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <ClipVerbLogo className="w-10 h-10 relative z-10 drop-shadow-md" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-100 transition-colors">Clip<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Verb</span></span>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1.5 border border-white/5 backdrop-blur-md shadow-inner">
          <button
            onClick={() => setView('home')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${currentView === 'home' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Home
          </button>
           <button
            onClick={() => setView('about')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${currentView === 'about' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Features
          </button>
          {user?.isAuthenticated && (
              <button
                onClick={() => setView('dashboard')}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <SparklesIcon className="w-3 h-3" />
                Workspace
              </button>
          )}
        </div>

        <div className="flex items-center gap-4">
           {user?.isAuthenticated ? (
             <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Agency</p>
                  <p className="text-xs font-bold text-white max-w-[100px] truncate">{user.user?.agencyName || 'Personal'}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all group shadow-lg"
                  title="Logout"
                >
                   <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                </button>
             </div>
           ) : (
             <button 
                onClick={() => setView('login')} 
                className="text-xs font-bold text-white bg-white/10 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all hover:scale-105"
             >
                 Log In
             </button>
           )}
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-[#0B0F19]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex justify-around z-50 shadow-2xl">
          <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 rounded-xl w-full ${currentView === 'home' ? 'bg-white/10 text-indigo-400' : 'text-slate-500'}`}>
             <UserIcon className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold">Home</span>
          </button>
          {user?.isAuthenticated && (
             <button onClick={() => setView('dashboard')} className={`flex flex-col items-center p-2 rounded-xl w-full ${currentView === 'dashboard' ? 'bg-white/10 text-indigo-400' : 'text-slate-500'}`}>
                <SparklesIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold">Work</span>
             </button>
          )}
          <button onClick={() => setView('about')} className={`flex flex-col items-center p-2 rounded-xl w-full ${currentView === 'about' ? 'bg-white/10 text-indigo-400' : 'text-slate-500'}`}>
             <FileTextIcon className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold">About</span>
          </button>
      </div>
    </nav>
  );
};