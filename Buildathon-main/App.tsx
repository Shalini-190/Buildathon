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
    <div className="min-h-screen font-sans bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
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