import React from 'react';
import { SparklesIcon, FileTextIcon, UserIcon, GlobeIcon, SpeakerIcon } from '../components/Icons';

interface HomeProps {
  onStart: () => void;
}

export const Home = ({ onStart }: HomeProps) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative pt-20 pb-20 overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300 text-xs font-bold mb-10 animate-fadeIn shadow-2xl">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           <span className="tracking-widest uppercase">Next-Gen Video Intelligence</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-white">
          Video to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 filter drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">Everything</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-12">
          The ultimate engine for creators. Transform raw video into <span className="text-white font-semibold underline decoration-indigo-500/50 underline-offset-4">Viral Blogs</span>, <span className="text-white font-semibold underline decoration-purple-500/50 underline-offset-4">News Reports</span>, and <span className="text-white font-semibold underline decoration-pink-500/50 underline-offset-4">AI Podcasts</span> instantly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24">
          <button 
            onClick={onStart}
            className="group relative px-10 py-5 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="flex items-center gap-3 relative z-10">
              <SparklesIcon className="w-6 h-6 text-indigo-600 group-hover:text-indigo-800 transition-colors" />
              <span>Start Creating Now</span>
            </span>
          </button>
          <button className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-xl">
            See it in Action
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
           <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-t border-white/20 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                 <FileTextIcon className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl text-white font-bold mb-3">Multi-Format Text</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Extract massive value from every frame. Generate Blogs, News Articles, and Social Posts tailored to your brand persona.
              </p>
           </div>
           
           <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-t border-white/20 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                 <SpeakerIcon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl text-white font-bold mb-3">AI Podcasting</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Turn reading into listening. Convert your generated reports into lifelike, professional audio podcasts automatically using neural TTS.
              </p>
           </div>

           <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group border-t border-white/20 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                 <GlobeIcon className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-2xl text-white font-bold mb-3">Global Translation</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Break language barriers instantly. Output content in Hindi, Tamil, Kannada, Spanish, French, and 50+ other languages.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};