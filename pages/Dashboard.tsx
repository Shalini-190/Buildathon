
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';
import { AppState, ContentType, Language, Persona, Template, UserSession, SocialPlatform } from '../types';
import { generateContentFromVideo, generateAudioPodcast } from '../services/geminiService';
import { UploadIcon, YoutubeIcon, FileTextIcon, DownloadIcon, SparklesIcon, GlobeIcon, UserIcon, SpeakerIcon, CopyIcon, CheckCircleIcon } from '../components/Icons';
import { ProcessingOverlay } from '../components/ProcessingOverlay';
import { SocialPostModal } from '../components/SocialPostModal';

const MAX_FILE_SIZE_MB = 20;

export const Dashboard = ({ user }: { user: UserSession }) => {
  const [state, setState] = useState<AppState>({
    file: null, youtubeUrl: '', contentType: ContentType.BLOG_POST,
    language: Language.ENGLISH, persona: Persona.DEFAULT, template: Template.NONE,
    researchMode: 'strict', timestamps: { enabled: false, start: '00:00:00', end: '00:10:00' },
    agency: { name: user?.user?.agencyName || '', clientName: '', logo: null },
    generatedContent: '', audioUrl: null, sources: [], isProcessing: false,
    isGeneratingAudio: false, error: null, currentStep: 1
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [showOverlay, setShowOverlay] = useState(false);
  const [socialModal, setSocialModal] = useState<{isOpen: boolean, platform: SocialPlatform}>({ isOpen: false, platform: 'LinkedIn' });
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
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { triggerToast("File too large"); return; }
      setState(s => ({ ...s, file, error: null }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setState(s => ({ ...s, agency: { ...s.agency, logo: reader.result as string } }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setState(s => ({ ...s, isProcessing: true, error: null, generatedContent: '', audioUrl: null }));
    setShowOverlay(true);
    try {
      let hasStarted = false;
      const result = await generateContentFromVideo(state, (text) => {
         if (!hasStarted) { setShowOverlay(false); setState(s => ({ ...s, currentStep: 5 })); hasStarted = true; }
         setState(s => ({ ...s, generatedContent: text }));
      });
      setState(s => ({ ...s, sources: result.sources, isProcessing: false }));
    } catch (err: any) {
      setState(s => ({ ...s, isProcessing: false, error: err.message }));
      setShowOverlay(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    if (state.agency.name) doc.text(state.agency.name, 20, 20);
    else doc.text("ClipVerb Report", 20, 20);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(state.generatedContent.replace(/[#*]/g, ''), 170);
    doc.text(splitText, 20, 40);
    doc.save("Report.pdf");
    triggerToast("PDF Saved");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pt-24 pb-24 md:pb-8">
      {showOverlay && <ProcessingOverlay message="Neural Processing Active..." />}
      <SocialPostModal isOpen={socialModal.isOpen} onClose={() => setSocialModal(s => ({...s, isOpen: false}))} platform={socialModal.platform} content={state.generatedContent} />
      
      {showToast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fadeIn flex items-center gap-3">
           <CheckCircleIcon className="w-4 h-4 text-green-500"/> {showToast.message}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-6 rounded-3xl space-y-6">
                  <div className="flex p-1 bg-white/5 rounded-xl">
                      <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Upload</button>
                      <button onClick={() => setActiveTab('youtube')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'youtube' ? 'bg-red-600 text-white' : 'text-slate-400'}`}>YouTube</button>
                  </div>
                  
                  {activeTab === 'upload' ? (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 cursor-pointer group">
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*" />
                          <UploadIcon className="w-10 h-10 text-slate-500 mx-auto mb-2 group-hover:text-indigo-400" />
                          <p className="text-xs text-slate-400 font-medium">{state.file ? state.file.name : "Choose Video"}</p>
                      </div>
                  ) : (
                      <input type="text" placeholder="YouTube URL" value={state.youtubeUrl} onChange={e => setState(s => ({...s, youtubeUrl: e.target.value}))} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm" />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                      <select value={state.contentType} onChange={e => setState(s => ({...s, contentType: e.target.value as ContentType}))} className="bg-slate-800 rounded-xl px-3 py-2 text-xs">
                          {Object.values(ContentType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select value={state.language} onChange={e => setState(s => ({...s, language: e.target.value as Language}))} className="bg-slate-800 rounded-xl px-3 py-2 text-xs">
                          {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agency Branding</h3>
                      <input type="text" placeholder="Client Name" value={state.agency.clientName} onChange={e => setState(s => ({...s, agency: {...s.agency, clientName: e.target.value}}))} className="w-full bg-slate-800/50 rounded-xl px-4 py-2 text-xs" />
                      <div className="flex items-center gap-3">
                          <button onClick={() => logoInputRef.current?.click()} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center border border-white/5">
                              {state.agency.logo ? <img src={state.agency.logo} className="w-6 h-6 object-contain" /> : <UploadIcon className="w-4 h-4 text-slate-500" />}
                          </button>
                          <span className="text-[10px] text-slate-400">Upload Report Logo</span>
                          <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                      </div>
                  </div>

                  <button onClick={handleSubmit} disabled={state.isProcessing} className="w-full btn-gradient py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <SparklesIcon className="w-5 h-5"/> {state.isProcessing ? "Processing..." : "Generate Intel"}
                  </button>
              </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7">
              <div className="glass-panel h-full min-h-[600px] rounded-3xl p-8 flex flex-col">
                  {state.generatedContent ? (
                      <>
                          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                              <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileTextIcon className="w-5 h-5 text-indigo-400"/> Output</h2>
                              <div className="flex gap-2">
                                  <button onClick={() => setSocialModal({isOpen: true, platform: 'LinkedIn'})} className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/20"><CopyIcon className="w-4 h-4"/></button>
                                  <button onClick={handleDownloadPdf} className="p-2 bg-pink-600 rounded-lg text-white shadow-lg"><DownloadIcon className="w-4 h-4"/></button>
                              </div>
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                              <div className="prose prose-invert max-w-none markdown-content">
                                  <ReactMarkdown>{state.generatedContent}</ReactMarkdown>
                              </div>
                          </div>
                          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <SpeakerIcon className="w-4 h-4 text-pink-400" />
                                  <span className="text-xs font-bold">Neural Podcast Preview</span>
                              </div>
                              {state.audioUrl ? <audio controls src={state.audioUrl} className="h-8 w-48" /> : 
                              <button onClick={async () => { 
                                  setState(s => ({...s, isGeneratingAudio: true})); 
                                  const url = await generateAudioPodcast(state.generatedContent); 
                                  setState(s => ({...s, audioUrl: url, isGeneratingAudio: false})); 
                              }} className="px-4 py-1.5 bg-white text-black text-[10px] font-black rounded-full">GENERATE AUDIO</button>}
                          </div>
                      </>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                          <SparklesIcon className="w-16 h-16"/>
                          <p className="font-medium tracking-wide">Enter video details to begin</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
