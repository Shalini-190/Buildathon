import React, { useState } from 'react';
import { SparklesIcon, ClipVerbLogo } from '../components/Icons';
import { loginUser } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
}

export const Login = ({ onSuccess, onSwitchToSignup }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = loginUser(email, password);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0F19]">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
            <div className="inline-block mb-6">
               <ClipVerbLogo className="w-24 h-24 drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">ClipVerb</h1>
            <p className="text-slate-400">Enterprise Intelligence Login</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@agency.com"
                        className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button 
                    type="submit"
                    className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Log In</span>
                    <SparklesIcon className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                </button>
            </form>
            
             <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">New to ClipVerb? <button onClick={onSwitchToSignup} className="text-indigo-400 font-bold hover:underline">Create Account</button></p>
            </div>
        </div>
      </div>
    </div>
  );
};