import React, { useState, useEffect } from 'react';
import { SocialPlatform } from '../types';
import { CheckCircleIcon, UserIcon } from './Icons';

interface SocialPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: SocialPlatform;
  content: string;
}

export const SocialPostModal = ({ isOpen, onClose, platform, content }: SocialPostModalProps) => {
  const [step, setStep] = useState<'login' | 'permission' | 'preview' | 'success'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [postContent, setPostContent] = useState(content);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('login');
      setPostContent(content);
      setIsLoading(false);
    }
  }, [isOpen, content]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setStep('permission');
    }, 1500);
  };

  const handleAllow = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('preview');
    }, 1000);
  };

  const handlePost = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 2000);
  };

  const getPlatformColors = () => {
    switch (platform) {
        case 'LinkedIn':
            return { bg: 'bg-[#0077b5]', text: 'text-[#0077b5]', border: 'border-[#0077b5]', hover: 'hover:bg-[#006097]' };
        case 'Twitter':
             return { bg: 'bg-[#1DA1F2]', text: 'text-[#1DA1F2]', border: 'border-[#1DA1F2]', hover: 'hover:bg-[#0c85d0]' };
        case 'Medium':
        default:
            return { bg: 'bg-white', text: 'text-black', border: 'border-white', hover: 'hover:bg-slate-200' };
    }
  };

  const colors = getPlatformColors();
  const platformInitial = platform === 'LinkedIn' ? 'in' : platform === 'Twitter' ? 'X' : 'M';
  const platformName = platform;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Step 1: Login */}
        {step === 'login' && (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center ${colors.bg} ${platform !== 'LinkedIn' && platform !== 'Twitter' ? 'text-black' : 'text-white'}`}>
               <span className="font-bold text-3xl">{platformInitial}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connect to {platformName}</h2>
            <p className="text-slate-400 text-sm mb-6">Enter your credentials to authorize ClipVerb.</p>
            
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                <input type="password" required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold ${platform !== 'LinkedIn' && platform !== 'Twitter' ? 'text-black' : 'text-white'} transition-all flex items-center justify-center gap-2 ${colors.bg} ${colors.hover}`}
              >
                {isLoading ? 'Connecting...' : `Log In to ${platformName}`}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Permission */}
        {step === 'permission' && (
          <div className="p-8">
            <div className="flex items-center justify-center gap-4 mb-8">
               <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">C</div>
               <div className="h-[2px] w-8 bg-slate-700"></div>
               <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${colors.bg} ${platform !== 'LinkedIn' && platform !== 'Twitter' ? 'text-black' : 'text-white'}`}>
                 {platformInitial}
               </div>
            </div>
            
            <h2 className="text-xl font-bold text-white text-center mb-6">Authorize ClipVerb?</h2>
            
            <ul className="space-y-3 mb-8 bg-slate-800/50 p-4 rounded-xl">
               <li className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> View your profile details
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" /> Create and manage posts
               </li>
            </ul>

            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Cancel</button>
              <button 
                onClick={handleAllow}
                disabled={isLoading} 
                className={`flex-1 py-3 rounded-xl font-bold ${platform !== 'LinkedIn' && platform !== 'Twitter' ? 'text-black' : 'text-white'} transition-all ${colors.bg} ${colors.hover}`}
              >
                {isLoading ? 'Authorizing...' : 'Allow Access'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <div className="p-6 h-[500px] flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                 <UserIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Your Account</p>
                <div className={`text-[10px] px-2 py-0.5 rounded inline-block ${colors.text.replace('text', 'bg')}/20 ${colors.text}`}>
                   Posting to {platformName}
                </div>
              </div>
            </div>

            <textarea 
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none resize-none mb-4 custom-scrollbar"
            />

            <button 
              onClick={handlePost}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold ${platform !== 'LinkedIn' && platform !== 'Twitter' ? 'text-black' : 'text-white'} transition-all flex items-center justify-center gap-2 ${colors.bg} ${colors.hover}`}
            >
               {isLoading ? 'Publishing...' : `Post Now`}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="p-8 text-center py-16">
             <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircleIcon className="w-10 h-10 text-green-500" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Published Successfully!</h2>
             <p className="text-slate-400 mb-8">Your content is live on {platformName}.</p>
             
             <button onClick={onClose} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all">
                Close
             </button>
          </div>
        )}

      </div>
    </div>
  );
};