
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';
import { AppState, ContentType, Language, Persona, Template, UserSession } from '../types';
import { generateContentFromVideo, generateAudioPodcast } from '../services/geminiService';
import { UploadIcon, YoutubeIcon, FileTextIcon, DownloadIcon, SparklesIcon, GlobeIcon, UserIcon, SpeakerIcon, CopyIcon, CheckCircleIcon } from '../components/Icons';
import { ProcessingOverlay } from '../components/ProcessingOverlay';

const MAX_FILE_SIZE_MB = 20;
const STORAGE_KEY = 'clipverb_config';
const TOTAL_STEPS = 5;

interface DashboardProps {
    user: UserSession;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [state, setState] = useState<AppState>({
    file: null,
    youtubeUrl: '',
    contentType: ContentType.BLOG_POST,
    language: Language.ENGLISH,
    persona: Persona.DEFAULT,
    template: Template.NONE,
    researchMode: 'strict', // Default to strict for lowest latency
    timestamps: { enabled: false, start: '00:00:00', end: '00:10:00' },
    agency: { name: user?.user?.agencyName || '', clientName: '', logo: null },
    generatedContent: '',
    audioUrl: null,
    sources: [],
    isProcessing: false,
    isGeneratingAudio: false,
    error: null,
    currentStep: 1
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [showOverlay, setShowOverlay] = useState(false);
  const [processingStage, setProcessingStage] = useState('Initializing...');
  const [showToast, setShowToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setShowToast({ message: msg, visible: true });
    setTimeout(() => setShowToast(s => ({...s, visible: false})), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setState(s => ({ ...s, file: null, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB.` }));
        return;
      }
      setState(s => ({ ...s, file, error: null }));
    }
  };

  const handleSubmit = async () => {
    setState(s => ({ ...s, isProcessing: true, error: null, generatedContent: '', audioUrl: null, sources: [] }));
    setShowOverlay(true);
    setProcessingStage("Warming up engine...");

    try {
      let hasSwitchedToResult = false;
      const result = await generateContentFromVideo(state, (partialText) => {
         if (!hasSwitchedToResult) {
             setShowOverlay(false);
             setState(s => ({ ...s, currentStep: 5 })); 
             hasSwitchedToResult = true;
         }
         setState(s => ({ ...s, generatedContent: partialText }));
      });
      
      setState(s => ({ ...s, sources: result.sources, isProcessing: false, currentStep: 5 }));
      setShowOverlay(false);
    } catch (err: any) {
      setState(s => ({ ...s, isProcessing: false, error: err.message }));
      setShowOverlay(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!state.generatedContent) return;
    setState(s => ({ ...s, isGeneratingAudio: true }));
    try {
        const url = await generateAudioPodcast(state.generatedContent);
        setState(s => ({ ...s, audioUrl: url, isGeneratingAudio: false }));
        triggerToast("Fast Audio Generated");
    } catch (err) {
        setState(s => ({ ...s, isGeneratingAudio: false, error: "Audio failed." }));
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    element.href = URL.createObjectURL(new Blob([state.generatedContent], { type: 'text/plain' }));
    element.download = `ClipVerb_Output.txt`;
    element.click();
    triggerToast("Downloaded TXT");
  };

  const nextStep = () => {
      if (state.currentStep === 1) {
          if (activeTab === 'upload' && !state.file) { setState(s => ({...s, error: "Upload file first"})); return; }
          if (activeTab === 'youtube' && !state.youtubeUrl) { setState(s => ({...s, error: "Enter URL first"})); return; }
      }
      if (state.currentStep === 4) handleSubmit();
      else setState(s => ({ ...s, currentStep: s.currentStep + 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pt-24 pb-24 md:pb-8">
      {showOverlay && <ProcessingOverlay message={processingStage} />}
      
      {showToast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-8 py-4 rounded-full shadow-2xl border border-white/10 flex items-center gap-4 z-50 animate-fadeIn ring-1 ring-white/20">
           <CheckCircleIcon className="w-4 h-4 text-green-500"/>
           <span className="font-medium text-sm tracking-wide">{showToast.message}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-10 max-w-3xl mx-auto">
         <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
             <span className={state.currentStep >= 1 ? "text-indigo-400" : ""}>Source</span>
             <span className={state.currentStep >= 2 ? "text-indigo-400" : ""}>Scope</span>
             <span className={state.currentStep >= 3 ? "text-indigo-400" : ""}>Intelligence</span>
             <span className={state.currentStep >= 4 ? "text-indigo-400" : ""}>Branding</span>
             <span className={state.currentStep >= 5 ? "text-indigo-400" : ""}>Result</span>
         </div>
         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500" style={{width: `${(state.currentStep / TOTAL_STEPS) * 100}%`}}></div>
         </div>
      </div>

      <div className="gradient-border-wrapper">
          <div className="gradient-border-content p-8 md:p-12 min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="flex-1">
                {state.currentStep === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Video Source</h2>
                            <p className="text-slate-400 text-sm">Select your input method</p>
                        </div>
                        <div className="flex p-1 bg-black/40 rounded-xl mb-6">
                            <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-medium ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                                <UploadIcon className="w-4 h-4" /> <span>Upload</span>
                            </button>
                            <button onClick={() => setActiveTab('youtube')} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-medium ${activeTab === 'youtube' ? 'bg-pink-600 text-white' : 'text-slate-400'}`}>
                                <YoutubeIcon className="w-4 h-4" /> <span>YouTube</span>
                            </button>
                        </div>
                        {activeTab === 'upload' ? (
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 bg-slate-900/30 rounded-3xl p-10 text-center hover:border-indigo-500 transition-all cursor-pointer group">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*"/>
                                <UploadIcon className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                                <p className="text-white font-medium">{state.file ? state.file.name : "Select Video File"}</p>
                            </div>
                        ) : (
                            <input type="text" placeholder="Paste YouTube URL" value={state.youtubeUrl} onChange={(e) => setState(s => ({...s, youtubeUrl: e.target.value}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-6 py-5 text-white focus:border-red-500 outline-none" />
                        )}
                    </div>
                )}
                {state.currentStep === 2 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-white mb-2">Mode & Scope</h2>
                            <p className="text-slate-400 text-sm">Strict mode is optimized for speed.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setState(s => ({...s, researchMode: 'strict'}))} className={`p-6 rounded-2xl border transition-all text-left ${state.researchMode === 'strict' ? 'bg-indigo-900/30 border-indigo-500' : 'bg-slate-900/50 border-slate-800'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-bold text-white">Strict Mode</div>
                                    <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-black">FAST</span>
                                </div>
                                <div className="text-xs text-slate-400">Instant processing. Zero search latency.</div>
                            </button>
                            <button onClick={() => setState(s => ({...s, researchMode: 'enhanced'}))} className={`p-6 rounded-2xl border transition-all text-left ${state.researchMode === 'enhanced' ? 'bg-pink-900/30 border-pink-500' : 'bg-slate-900/50 border-slate-800'}`}>
                                <div className="font-bold text-white mb-2">Enhanced Mode</div>
                                <div className="text-xs text-slate-400">Deep search active. Higher latency.</div>
                            </button>
                        </div>
                    </div>
                )}
                {state.currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Intelligence</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Format</label>
                                <select value={state.contentType} onChange={(e) => setState(s => ({ ...s, contentType: e.target.value as ContentType }))} className="glass-input w-full rounded-xl px-4 py-3 text-sm">
                                    {Object.values(ContentType).map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Language</label>
                                <select value={state.language} onChange={(e) => setState(s => ({ ...s, language: e.target.value as Language }))} className="glass-input w-full rounded-xl px-4 py-3 text-sm">
                                    {Object.values(Language).map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {state.currentStep === 4 && (
                    <div className="space-y-8 animate-fadeIn text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Final Review</h2>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 inline-block text-left min-w-[300px]">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Config Summary</p>
                            <p className="text-lg font-bold text-indigo-300">{state.contentType}</p>
                            <p className="text-sm text-slate-300">{state.language} • {state.persona}</p>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 font-bold bg-green-500/10 px-3 py-1.5 rounded-full w-fit">
                                <SparklesIcon className="w-3 h-3"/> LOW LATENCY MODE ACTIVE
                            </div>
                        </div>
                    </div>
                )}
                {state.currentStep === 5 && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500"/> Generated Intelligence</h2>
                            <button onClick={handleDownloadTxt} className="p-2.5 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all"><DownloadIcon className="w-4 h-4 text-white"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/30 rounded-2xl p-6 border border-white/5 mb-6 min-h-[300px]">
                            <div className="prose prose-invert max-w-none markdown-content">
                                <ReactMarkdown>{state.generatedContent}</ReactMarkdown>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-indigo-900/40 to-pink-900/40 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <SpeakerIcon className="w-4 h-4 text-pink-400" />
                                <span className="text-xs font-bold text-white">AI Audio Preview</span>
                            </div>
                            {state.audioUrl ? (
                                <audio controls src={state.audioUrl} className="h-8 w-40 opacity-80" />
                            ) : (
                                <button onClick={handleGenerateAudio} disabled={state.isGeneratingAudio} className="px-4 py-1.5 bg-white text-black text-[10px] font-black rounded-full hover:bg-slate-200 disabled:opacity-50">
                                    {state.isGeneratingAudio ? "GEN..." : "QUICK AUDIO"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-between">
                  {state.currentStep > 1 && state.currentStep < 5 ? (
                      <button onClick={() => setState(s => ({ ...s, currentStep: s.currentStep - 1 }))} className="px-8 py-3 rounded-full font-bold text-slate-400">Back</button>
                  ) : <div></div>}
                  {state.currentStep < 4 ? (
                      <button onClick={nextStep} className="btn-secondary px-10 py-3 rounded-full font-bold">Next</button>
                  ) : state.currentStep === 4 ? (
                      <button onClick={nextStep} className="btn-gradient px-12 py-4 rounded-full font-bold flex items-center gap-3 shadow-2xl">
                        <SparklesIcon className="w-5 h-5"/> Generate Now
                      </button>
                  ) : (
                      <button onClick={() => setState(s => ({...s, currentStep: 1, generatedContent: '', audioUrl: null}))} className="px-8 py-3 rounded-full font-bold text-indigo-300">New Project</button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
