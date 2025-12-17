import React from 'react';
import { SparklesIcon, FileTextIcon, UserIcon, GlobeIcon, SpeakerIcon } from '../components/Icons';

interface HomeProps {
  onStart: () => void;
}

export const Home = ({ onStart }: HomeProps) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-10">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 animate-fadeIn">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           News • Blogs • Social • Audio • Reports
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
          Transform Video into <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Content Assets</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12">
          ClipVerb is the professional engine for creators and agencies. Turn any video into high-quality Blogs, News Articles, LinkedIn Posts, and AI Podcasts instantly.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5 text-indigo-600" />
            Start Creating
          </button>
          <button className="px-8 py-4 bg-slate-800/50 text-white border border-white/10 rounded-xl font-medium text-lg hover:bg-slate-800 transition-all">
            See Examples
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                 <FileTextIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Multi-Format Text</h3>
              <p className="text-slate-400 text-sm">Generate Blogs, News Articles, and Social Posts from any video source.</p>
           </div>
           
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                 <SpeakerIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2">AI Podcasting</h3>
              <p className="text-slate-400 text-sm">Convert your generated articles into lifelike audio podcasts for listening.</p>
           </div>

           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-pink-500/30 transition-colors">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                 <GlobeIcon className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Multilingual</h3>
              <p className="text-slate-400 text-sm">Output content in Hindi, Tamil, Kannada, Spanish, and more.</p>
           </div>
        </div>
      </div>
    </div>
  );
};