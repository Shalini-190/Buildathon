import React from 'react';
import { UserIcon, GlobeIcon, SpeakerIcon, FileTextIcon, SparklesIcon, CopyIcon } from '../components/Icons';

export const About = () => {
  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Video to <span className="text-indigo-400">Anything</span></h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          ClipVerb is a comprehensive <strong>Video-to-Content Engine</strong>. We transform your video uploads and links into News Articles, Blogs, Audio Podcasts, and Social Media assets in seconds.
        </p>
      </div>

      <div className="space-y-16">
        
        {/* Section 1: Personas & Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                <div className="grid grid-cols-2 gap-3">
                    {['News Article', 'Blog Post', 'LinkedIn', 'Twitter Thread'].map(p => (
                        <div key={p} className="bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center">
                            <FileTextIcon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                            <span className="text-sm font-medium text-slate-300">{p}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-indigo-400"/> Dynamic Content Formats
                </h3>
                <p className="text-slate-400 leading-relaxed">
                   Stop treating every video the same. ClipVerb analyzes your video and completely rewrites it into the format you need. Turn a webinar into a <strong>News Article</strong>. Turn a tutorial into a <strong>Step-by-Step Blog</strong>. Rewrite it with the tone of a <strong>Journalist</strong> or <strong>Tech Influencer</strong>.
                </p>
            </div>
        </div>

        {/* Section 2: Audio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <SpeakerIcon className="w-6 h-6 text-pink-400"/> Multimodal Audio Engine
                </h3>
                <p className="text-slate-400 leading-relaxed">
                    Expand your reach beyond text. ClipVerb includes a powerful TTS engine that converts your generated News or Blogs into <strong>Lifelike Audio Podcasts</strong>. Perfect for creating audio versions of your content for on-the-go consumption.
                </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-8 rounded-2xl border border-white/10 flex items-center justify-center">
                 <div className="w-full max-w-xs bg-slate-900 rounded-xl p-4 shadow-2xl">
                     <div className="h-1.5 bg-slate-700 rounded-full mb-4 overflow-hidden">
                         <div className="h-full w-2/3 bg-pink-500"></div>
                     </div>
                     <div className="flex justify-between items-center">
                         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                             <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div>
                         </div>
                         <span className="text-xs font-mono text-slate-400">AI Generated Audio</span>
                     </div>
                 </div>
            </div>
        </div>

        {/* Section 3: Multilingual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-slate-900/40 p-6 rounded-xl border border-white/5 relative">
                 <div className="grid grid-cols-2 gap-4 text-center">
                     <div className="p-3 bg-slate-800 rounded-lg text-slate-300 text-sm">Hindi</div>
                     <div className="p-3 bg-slate-800 rounded-lg text-slate-300 text-sm">Tamil</div>
                     <div className="p-3 bg-slate-800 rounded-lg text-slate-300 text-sm">Kannada</div>
                     <div className="p-3 bg-slate-800 rounded-lg text-slate-300 text-sm">Spanish</div>
                 </div>
            </div>
            <div className="order-1 md:order-2">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <GlobeIcon className="w-6 h-6 text-emerald-400"/> Global Reach
                </h3>
                <p className="text-slate-400 leading-relaxed">
                    Break language barriers. ClipVerb isn't just English-first. Instantly generate content in <strong>Hindi, Tamil, Kannada, Telugu, Spanish, and French</strong>. Transform a local video into global news, or localize international content for your region.
                </p>
            </div>
        </div>

      </div>
      
      <div className="mt-24 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">One Engine. Infinite Content.</h2>
          <p className="text-slate-400 mb-0">Start repurposing your video library today.</p>
      </div>
    </div>
  );
};