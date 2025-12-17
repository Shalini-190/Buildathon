import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';
import { AppState, ContentType, Language, Persona, Template, UserSession } from '../types';
import { generateContentFromVideo, generateAudioPodcast } from '../services/geminiService';
import { UploadIcon, YoutubeIcon, FileTextIcon, DownloadIcon, SparklesIcon, GlobeIcon, UserIcon, SpeakerIcon, CopyIcon } from '../components/Icons';
import { ProcessingOverlay } from '../components/ProcessingOverlay';

const MAX_FILE_SIZE_MB = 20;
const STORAGE_KEY = 'clipverb_config';

interface GeneratorProps {
    user?: UserSession;
}

export const Generator = ({ user }: GeneratorProps) => {
  const [state, setState] = useState<AppState>({
    file: null,
    youtubeUrl: '',
    contentType: ContentType.CLIENT_REPORT,
    language: Language.ENGLISH,
    persona: Persona.DEFAULT,
    template: Template.NONE,
    researchMode: 'enhanced',
    timestamps: { enabled: false, start: '00:00:00', end: '00:10:00' },
    agency: { name: user?.user?.agencyName || '', clientName: '', logo: null },
    generatedContent: '',
    audioUrl: null,
    sources: [],
    isProcessing: false,
    isGeneratingAudio: false,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [showOverlay, setShowOverlay] = useState(false);
  const [processingStage, setProcessingStage] = useState('Initializing...');
  const [showToast, setShowToast] = useState<{message: string, visible: boolean}>({ message: '', visible: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // DATA PERSISTENCE: LOAD
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            setState(s => ({
                ...s,
                language: parsed.language || s.language,
                persona: parsed.persona || s.persona,
                template: parsed.template || s.template,
                researchMode: parsed.researchMode || s.researchMode,
                agency: {
                    ...s.agency,
                    name: parsed.agencyName || user?.user?.agencyName || s.agency.name,
                    logo: parsed.agencyLogo || s.agency.logo
                }
            }));
        } catch (e) {
            console.error("Failed to load saved config", e);
        }
    }
  }, [user]);

  // DATA PERSISTENCE: SAVE
  useEffect(() => {
    const configToSave = {
        language: state.language,
        persona: state.persona,
        template: state.template,
        researchMode: state.researchMode,
        agencyName: state.agency.name,
        agencyLogo: state.agency.logo
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  }, [state.language, state.persona, state.template, state.researchMode, state.agency.name, state.agency.logo]);


  const triggerToast = (msg: string) => {
    setShowToast({ message: msg, visible: true });
    setTimeout(() => setShowToast(s => ({...s, visible: false})), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setState(s => ({ ...s, file: null, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit for this demo.` }));
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setState(s => ({ ...s, file, error: null }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(s => ({
          ...s,
          agency: { ...s.agency, logo: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!state.file && activeTab === 'upload') {
      setState(s => ({ ...s, error: "Please upload a video file." }));
      return;
    }
    if (!state.youtubeUrl && activeTab === 'youtube') {
      setState(s => ({ ...s, error: "Please enter a YouTube URL." }));
      return;
    }

    setState(s => ({ ...s, isProcessing: true, error: null, generatedContent: '', audioUrl: null, sources: [] }));
    setShowOverlay(true);

    const stages = activeTab === 'youtube' ? [
        "Resolving Video ID...",
        "Accessing YouTube Data API...",
        `Applying ${state.persona} Persona...`,
        `Translating to ${state.language}...`,
        "Synthesizing Narrative...",
        "Applying Agency Branding...",
        "Generating Final Output..."
    ] : [
        "Uploading Video File...",
        "Processing Audio Track...",
        `Translating to ${state.language}...`,
        "Generating Content..."
    ];

    let stageIndex = 0;
    setProcessingStage(stages[0]);
    
    const intervalId = setInterval(() => {
        stageIndex = (stageIndex + 1);
        if (stageIndex < stages.length) {
            setProcessingStage(stages[stageIndex]);
        }
    }, 1500); 

    try {
      const cleanState = {
          ...state,
          file: activeTab === 'upload' ? state.file : null,
          youtubeUrl: activeTab === 'youtube' ? state.youtubeUrl : ''
      };
      
      const result = await generateContentFromVideo(cleanState, (partialText) => {
         setShowOverlay(false);
         setState(s => ({ ...s, generatedContent: partialText }));
      });
      
      clearInterval(intervalId);
      setState(s => ({ 
        ...s, 
        sources: result.sources,
        isProcessing: false 
      }));
      setShowOverlay(false);

    } catch (err: any) {
      clearInterval(intervalId);
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
        triggerToast("Audio Generated Successfully");
    } catch (err) {
        console.error(err);
        setState(s => ({ ...s, isGeneratingAudio: false, error: "Failed to generate audio." }));
    }
  };

  const handleDownloadTxt = () => {
    let content = `GENERATED BY CLIPVERB\nType: ${state.contentType}\nMode: ${state.researchMode.toUpperCase()}\nLanguage: ${state.language}\nDate: ${new Date().toLocaleString()}\n`;
    
    if (state.agency.name) content += `Agency: ${state.agency.name}\n`;
    if (state.agency.clientName) content += `Prepared For: ${state.agency.clientName}\n`;
    
    content += `\n-------------------\n\n`;
    content += state.generatedContent;

    if (state.sources.length > 0) {
        content += `\n\n-------------------\nSOURCES ANALYZED:\n`;
        state.sources.forEach(s => {
            content += `- ${s.title}: ${s.url}\n`;
        });
    }
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ClipVerb_${state.contentType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("TXT File Downloaded");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let yPos = 20;

    // Header / Branding
    if (state.agency.logo) {
      try {
        const logoSize = 30;
        doc.addImage(state.agency.logo, 'JPEG', margin, yPos, logoSize, logoSize);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        if (state.agency.name) {
           doc.text(state.agency.name.toUpperCase(), margin + logoSize + 10, yPos + 12);
        }
        yPos += 45;
      } catch (e) { console.error(e); }
    } else if (state.agency.name) {
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(state.agency.name.toUpperCase(), margin, yPos);
        yPos += 20;
    } else {
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("ClipVerb Report", margin, yPos);
        yPos += 20;
    }

    if (state.agency.clientName) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`PREPARED FOR: ${state.agency.clientName.toUpperCase()}`, margin, yPos);
        yPos += 8;
    }

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`${state.contentType} | ${state.language} | ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "roman");

    const cleanContent = state.generatedContent
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const splitText = doc.splitTextToSize(cleanContent, contentWidth);
    const pageHeight = doc.internal.pageSize.getHeight();
    for (let i = 0; i < splitText.length; i++) {
        if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
        doc.text(splitText[i], margin, yPos);
        yPos += 6;
    }

    // Sources footer in PDF
    if (state.sources.length > 0) {
        if (yPos > pageHeight - 40) doc.addPage();
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("SOURCES ANALYZED:", margin, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        state.sources.forEach(s => {
             const sourceText = `- ${s.title} (${s.url})`;
             const splitSource = doc.splitTextToSize(sourceText, contentWidth);
             doc.text(splitSource, margin, yPos);
             yPos += (4 * splitSource.length);
        });
    }
    
    doc.save(`ClipVerb_${state.contentType}.pdf`);
    triggerToast("PDF Report Downloaded");
  };

  const copyToClipboard = (platform: string) => {
      navigator.clipboard.writeText(state.generatedContent);
      triggerToast(`Copied content for ${platform}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pt-24 pb-24 md:pb-8">
      {showOverlay && <ProcessingOverlay message={processingStage} />}
      
      {/* Toast Notification */}
      {showToast.visible && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 z-50 animate-fadeIn">
           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
             <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           </div>
           <span className="font-medium text-sm">{showToast.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl">
              <div className="bg-slate-900/60 rounded-[22px] p-6 relative">
                <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6 backdrop-blur-md">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 font-medium ${activeTab === 'upload' ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <UploadIcon className="w-4 h-4" /> <span>Upload</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 font-medium ${activeTab === 'youtube' ? 'bg-gradient-to-br from-red-600 to-orange-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <YoutubeIcon className="w-4 h-4" /> <span>YouTube</span>
                  </button>
                </div>

                <div className="min-h-[150px] flex flex-col justify-center">
                  {activeTab === 'upload' ? (
                    <div 
                      className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/mp4,video/quicktime,video/webm"/>
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                         <UploadIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      {state.file ? <p className="text-green-400 font-medium">{state.file.name}</p> : <p className="text-slate-400">Drop video here (max {MAX_FILE_SIZE_MB}MB)</p>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                       <input
                         type="text"
                         placeholder="Paste YouTube URL"
                         value={state.youtubeUrl}
                         onChange={(e) => setState(s => ({...s, youtubeUrl: e.target.value}))}
                         className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-4 py-3 focus:border-red-500/50 text-white placeholder-slate-600 outline-none"
                       />
                       <p className="text-[10px] text-slate-500 text-center">ClipVerb Deep Search Active</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                
                {/* Mode & Content Type */}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Research Mode</h3>
                        <div className="flex bg-slate-800 rounded-lg p-1">
                            <button 
                                onClick={() => setState(s => ({...s, researchMode: 'strict'}))}
                                className={`flex-1 text-[10px] font-bold py-2 rounded-md transition-all ${state.researchMode === 'strict' ? 'bg-slate-600 text-white shadow' : 'text-slate-400'}`}
                            >
                                STRICT
                            </button>
                            <button 
                                onClick={() => setState(s => ({...s, researchMode: 'enhanced'}))}
                                className={`flex-1 text-[10px] font-bold py-2 rounded-md transition-all ${state.researchMode === 'enhanced' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
                            >
                                ENHANCED
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Format</h3>
                        <select 
                            value={state.contentType}
                            onChange={(e) => setState(s => ({ ...s, contentType: e.target.value as ContentType }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        >
                            {Object.values(ContentType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="bg-slate-800/30 rounded-xl border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Segment</h3>
                         <div 
                            onClick={() => setState(s => ({...s, timestamps: {...s.timestamps, enabled: !s.timestamps.enabled}}))}
                            className={`w-8 h-4 rounded-full cursor-pointer relative transition-colors ${state.timestamps.enabled ? 'bg-indigo-500' : 'bg-slate-600'}`}
                         >
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${state.timestamps.enabled ? 'left-4.5' : 'left-0.5'}`} style={{left: state.timestamps.enabled ? 'calc(100% - 14px)' : '2px'}}></div>
                         </div>
                    </div>
                    {state.timestamps.enabled && (
                        <div className="flex gap-2">
                            <input 
                                type="text" placeholder="Start (00:00:00)" value={state.timestamps.start}
                                onChange={(e) => setState(s => ({...s, timestamps: {...s.timestamps, start: e.target.value}}))}
                                className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center font-mono"
                            />
                             <input 
                                type="text" placeholder="End (00:10:00)" value={state.timestamps.end}
                                onChange={(e) => setState(s => ({...s, timestamps: {...s.timestamps, end: e.target.value}}))}
                                className="w-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-center font-mono"
                            />
                        </div>
                    )}
                </div>

                {/* Advanced Intelligence */}
                <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <SparklesIcon className="w-3 h-3 text-pink-400" /> Advanced Intelligence
                    </h3>
                    
                    {/* Language & Persona */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1 block">Language</label>
                            <div className="relative">
                                <GlobeIcon className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                                <select 
                                    value={state.language}
                                    onChange={(e) => setState(s => ({ ...s, language: e.target.value as Language }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-[11px] text-white focus:outline-none"
                                >
                                    {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1 block">Persona</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 w-3 h-3 text-slate-500" />
                                <select 
                                    value={state.persona}
                                    onChange={(e) => setState(s => ({ ...s, persona: e.target.value as Persona }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-[11px] text-white focus:outline-none"
                                >
                                    {Object.values(Persona).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Template */}
                    <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Structure Template</label>
                        <select 
                            value={state.template}
                            onChange={(e) => setState(s => ({ ...s, template: e.target.value as Template }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-white focus:outline-none"
                        >
                            {Object.values(Template).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Agency Branding */}
                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Client Reporting</h3>
                   <div className="flex gap-2">
                       <input
                         type="text"
                         placeholder="Client Name (e.g. Acme Corp)"
                         value={state.agency.clientName}
                         onChange={(e) => setState(s => ({ ...s, agency: { ...s.agency, clientName: e.target.value } }))}
                         className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs focus:border-indigo-500 outline-none"
                       />
                       <div 
                         onClick={() => logoInputRef.current?.click()}
                         className="w-10 h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700"
                         title="Upload Agency Logo"
                       >
                           {state.agency.logo ? (
                               <img src={state.agency.logo} alt="Logo" className="w-8 h-8 object-contain" />
                           ) : (
                               <UploadIcon className="w-4 h-4 text-slate-400" />
                           )}
                           <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                       </div>
                   </div>
                   <input
                         type="text"
                         placeholder="Agency Name"
                         value={state.agency.name}
                         onChange={(e) => setState(s => ({ ...s, agency: { ...s.agency, name: e.target.value } }))}
                         className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-xs focus:border-indigo-500 outline-none"
                   />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={state.isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SparklesIcon className="w-5 h-5" /> Generate Content
                </button>
                {state.error && <p className="text-red-400 text-xs text-center">{state.error}</p>}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
            <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col">
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                    <FileTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">ClipVerb Output</h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                        {state.language} • {state.persona}
                    </p>
                  </div>
                </div>
                
                {state.generatedContent && (
                  <div className="flex gap-2">
                     <button onClick={handleDownloadTxt} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700" title="Download TXT"><FileTextIcon className="w-4 h-4"/></button>
                     <button onClick={handleDownloadPdf} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" title="Download PDF"><DownloadIcon className="w-4 h-4 text-white"/></button>
                  </div>
                )}
              </div>

              {state.generatedContent ? (
                  <>
                    {/* Smart Actions Toolbar */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button onClick={() => copyToClipboard('LinkedIn')} className="flex items-center gap-2 px-3 py-1.5 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] rounded-full text-xs hover:bg-[#0077b5]/20 transition-colors">
                            <CopyIcon className="w-3 h-3"/> Copy for LinkedIn
                        </button>
                        <button onClick={() => copyToClipboard('Notion')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 border border-slate-600 text-slate-300 rounded-full text-xs hover:bg-slate-700/50 transition-colors">
                            <CopyIcon className="w-3 h-3"/> Copy for Notion
                        </button>
                        <button onClick={() => copyToClipboard('Twitter')} className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded-full text-xs hover:bg-sky-500/20 transition-colors">
                            <CopyIcon className="w-3 h-3"/> Tweet Thread
                        </button>
                    </div>

                    {/* Audio Player */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                                 <SpeakerIcon className="w-4 h-4 text-pink-400" />
                             </div>
                             <div>
                                 <p className="text-sm font-semibold text-white">AI Podcast</p>
                                 <p className="text-[10px] text-slate-400">Listen to summary (Fast Generate)</p>
                             </div>
                         </div>
                         {state.audioUrl ? (
                             <audio controls src={state.audioUrl} className="h-8 w-48 opacity-80" />
                         ) : (
                             <button 
                                onClick={handleGenerateAudio} 
                                disabled={state.isGeneratingAudio}
                                className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50"
                             >
                                 {state.isGeneratingAudio ? "Generating..." : "Generate Audio"}
                             </button>
                         )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="prose prose-invert prose-lg max-w-none">
                            <div className="markdown-content text-slate-200">
                                <ReactMarkdown components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-6" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-indigo-200 mt-6 mb-3" {...props} />,
                                }}>
                                    {state.generatedContent}
                                </ReactMarkdown>
                            </div>
                            
                            {/* Sources Display */}
                            {state.sources.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-700/50">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sources Analyzed</h4>
                                    <ul className="space-y-2">
                                        {state.sources.map((source, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-indigo-300 hover:text-indigo-200">
                                                <span className="mt-0.5">•</span>
                                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-all hover:underline">
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                  </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                    <SparklesIcon className="w-12 h-12 text-slate-700 opacity-50" />
                    <p className="text-sm">Ready to generate content</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};