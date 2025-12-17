import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { UserSession } from './types';
import { getCurrentUser, logoutUser } from './services/authService';

const App = () => {
  const [currentPath, setPath] = useState<string>('home');
  const [userSession, setUserSession] = useState<UserSession>({ isAuthenticated: false, user: null });

  // Check auth on load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserSession({ isAuthenticated: true, user });
      setPath('dashboard');
    }
  }, []);

  const handleLoginSuccess = (user: any) => {
    setUserSession({ isAuthenticated: true, user });
    setPath('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setUserSession({ isAuthenticated: false, user: null });
    setPath('home');
  };

  // Auth Guard
  if (!userSession.isAuthenticated) {
    if (currentPath === 'signup') {
        return <Signup onSuccess={() => setPath('login')} onSwitchToLogin={() => setPath('login')} />;
    }
    if (currentPath === 'login') {
         return <Login onSuccess={handleLoginSuccess} onSwitchToSignup={() => setPath('signup')} />;
    }
    // If not logged in and trying to access dashboard
    if (currentPath === 'dashboard') {
         return <Login onSuccess={handleLoginSuccess} onSwitchToSignup={() => setPath('signup')} />;
    }
  }

  const renderContent = () => {
      if (!userSession.isAuthenticated) {
          if (currentPath === 'about') return <About />;
          return <Home onStart={() => setPath('login')} />;
      }

      switch(currentPath) {
          case 'home': return <Home onStart={() => setPath('dashboard')} />;
          case 'dashboard': return <Dashboard user={userSession} />;
          case 'about': return <About />;
          default: return <Dashboard user={userSession} />;
      }
  };

  return (
    <div className="min-h-screen font-sans bg-[#0B0F19] text-white selection:bg-pink-500/30 selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-pink-600/20 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>
      
      {/* Show Navbar only if logged in or on public pages */}
      <Navbar 
        currentView={currentPath} 
        setView={setPath} 
        user={userSession} 
        onLogout={handleLogout} 
      />
      
      <div className="relative z-10 pt-16">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;