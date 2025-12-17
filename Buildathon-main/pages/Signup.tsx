import React, { useState } from 'react';
import { SparklesIcon } from '../components/Icons';
import { registerUser } from '../services/authService';
import { User } from '../types';

interface SignupProps {
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const Signup = ({ onSuccess, onSwitchToLogin }: SignupProps) => {
  const [formData, setFormData] = useState({
    name: '',
    agencyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // agencyName is now optional in the service call
      const user = registerUser(formData.name, formData.email, formData.password, formData.agencyName);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0B0F19]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join ClipVerb Enterprise</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="John Doe"/>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Agency Name <span className="text-slate-600 font-normal lowercase">(optional)</span></label>
                        <input type="text" value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="Acme Inc"/>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="john@example.com"/>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="••••••••"/>
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Confirm Password</label>
                    <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="••••••••"/>
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 mt-4">
                    Sign Up <SparklesIcon className="w-5 h-5" />
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">Already have an account? <button onClick={onSwitchToLogin} className="text-indigo-400 font-bold hover:underline">Log In</button></p>
            </div>
        </div>
      </div>
    </div>
  );
};