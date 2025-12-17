import React from 'react';
import { SparklesIcon, FileTextIcon, UserIcon, GlobeIcon, SpeakerIcon } from '../components/Icons';

interface HomeProps {
  onStart: () => void;
}

export const Home = ({ onStart }: HomeProps) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative pt-20 pb-20">
      
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300 text-xs font-bold mb-10 animate-fadeIn hover:bg-white/10 transition-colors cursor-default shadow-xl">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
           <span className="tracking-wide uppercase">AI Video Intelligence v2.0</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.9]">
          Video to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">Everything</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed mb-12">
          The ultimate engine for creators. Transform raw video into <span className="text-indigo-300 font-medium border-b border-indigo-500/30">Viral Blogs</span>, <span className="text-purple-300 font-medium border-b border-purple-500/30">News Reports</span>, and <span className="text-pink-300 font-medium border-b border-pink-500/30">AI Podcasts</span> instantly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24">
          <button 
            onClick={onStart}
            className="group relative px-9 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="flex items-center gap-2 relative z-10">
              <SparklesIcon className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
              <span className="group-hover:text-white transition-colors">Start Creating Now</span>
            </span>
          </button>
          <button className="px-9 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm">
            Watch Demo
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
           {/* Card 1 */}
           <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group border-t border-white/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors"></div>
              <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                 <FileTextIcon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl text-white font-bold mb-3">Multi-Format Text</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extract value from every frame. Generate Blogs, News Articles, and Social Posts tailored to your specific persona.
              </p>
           </div>
           
           {/* Card 2 */}
           <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group border-t border-white/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-colors"></div>
              <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                 <SpeakerIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl text-white font-bold mb-3">AI Podcasting</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Turn reading into listening. Convert your generated reports into lifelike, professional audio podcasts automatically.
              </p>
           </div>

           {/* Card 3 */}
           <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group border-t border-white/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-pink-500/30 transition-colors"></div>
              <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                 <GlobeIcon className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl text-white font-bold mb-3">Global Reach</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Break language barriers instantly. Output content in Hindi, Tamil, Kannada, Spanish, French, and more.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};