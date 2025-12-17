
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';
import { AppState, ContentType, Language, Persona, Template, UserSession } from '../types';
import { generateContentFromVideo, generateAudioPodcast } from '../services/geminiService';
import { UploadIcon, YoutubeIcon, FileTextIcon, DownloadIcon, SparklesIcon, GlobeIcon, UserIcon, SpeakerIcon, CopyIcon } from '../components/Icons';
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
    currentStep: 1
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
    setTimeout(() => setShowToast(s => ({...s, visible: false})), 4000);
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
         // Immediate switch to results for streaming effect
         setState(s => ({ ...s, currentStep: 5 })); 
      });
      
      clearInterval(intervalId);
      setState(s => ({ 
        ...s, 
        sources: result.sources,
        isProcessing: false,
        currentStep: 5 
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
    content += `\n-------------------\n\n` + state.generatedContent;
    if (state.sources.length > 0) {
        content += `\n\n-------------------\nSOURCES ANALYZED:\n` + state.sources.map(s => `- ${s.title}: ${s.url}`).join('\n');
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

    if (state.agency.logo) {
      try {
        const logoSize = 30;
        doc.addImage(state.agency.logo, 'JPEG', margin, yPos, logoSize, logoSize);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 50);
        if (state.agency.name) doc.text(state.agency.name.toUpperCase(), margin + logoSize + 10, yPos + 12);
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

  // Utility to clean markdown for social media
  const cleanTextForSocial = (text: string): string => {
      return text
          // Remove bold **text** -> text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          // Remove italic *text* -> text
          .replace(/\*(.*?)\*/g, '$1')
          // Remove headers # Title -> Title (handle up to 6 #)
          .replace(/#{1,6}\s?/g, '')
          // Remove links [text](url) -> text
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          // Remove code blocks
          .replace(/`/g, '')
          // Trim extra newlines
          .trim();
  };

  const handleRealShare = (platform: 'LinkedIn' | 'Medium' | 'Twitter') => {
      // 1. Clean and Copy Content
      const cleanContent = cleanTextForSocial(state.generatedContent);
      navigator.clipboard.writeText(cleanContent);

      // 2. Determine URL and Action
      let url = '';
      if (platform === 'LinkedIn') {
          url = 'https://www.linkedin.com/feed/';
          triggerToast("Formatted text copied! Press Ctrl+V to paste in LinkedIn.");
      } else if (platform === 'Medium') {
          url = 'https://medium.com/new-story';
          triggerToast("Formatted text copied! Press Ctrl+V to paste in Medium.");
      } else if (platform === 'Twitter') {
          // Twitter supports text pre-fill via URL, but has length limits. 
          // We truncate to 280-ish chars for the URL, but user has full text in clipboard.
          const tweetText = encodeURIComponent(cleanContent.substring(0, 250) + (cleanContent.length > 250 ? '...' : ''));
          url = `https://twitter.com/intent/tweet?text=${tweetText}`;
          triggerToast("Opening Twitter... Full text is in your clipboard.");
      }

      // 3. Open Real Platform
      setTimeout(() => {
          window.open(url, '_blank');
      }, 500);
  };

  const nextStep = () => {
      if (state.currentStep === 1) {
          if (activeTab === 'upload' && !state.file) { setState(s => ({...s, error: "Please upload a video file"})); return; }
          if (activeTab === 'youtube' && !state.youtubeUrl) { setState(s => ({...s, error: "Please enter a valid YouTube URL"})); return; }
          setState(s => ({...s, error: null}));
      }
      if (state.currentStep === 4) {
          handleSubmit();
      } else {
          setState(s => ({ ...s, currentStep: s.currentStep + 1 }));
      }
  };

  const prevStep = () => {
      if (state.currentStep > 1) {
          setState(s => ({ ...s, currentStep: s.currentStep - 1 }));
      }
  };

  // --- RENDER STEPS ---
  const renderStep1_Source = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Select Video Source</h2>
        <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6 backdrop-blur-md">
            <button onClick={() => setActiveTab('upload')} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-medium ${activeTab === 'upload' ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <UploadIcon className="w-4 h-4" /> <span>Upload</span>
            </button>
            <button onClick={() => setActiveTab('youtube')} className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all font-medium ${activeTab === 'youtube' ? 'bg-gradient-to-br from-red-600 to-orange-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <YoutubeIcon className="w-4 h-4" /> <span>YouTube</span>
            </button>
        </div>
        <div className="min-h-[200px] flex flex-col justify-center">
            {activeTab === 'upload' ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/mp4,video/quicktime,video/webm"/>
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    {state.file ? <p className="text-green-400 font-medium text-lg">{state.file.name}</p> : <p className="text-slate-400">Drop video here (max {MAX_FILE_SIZE_MB}MB)</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    <input type="text" placeholder="Paste YouTube URL" value={state.youtubeUrl} onChange={(e) => setState(s => ({...s, youtubeUrl: e.target.value}))} className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-6 py-4 text-lg focus:border-red-500/50 text-white placeholder-slate-600 outline-none transition-all" />
                    <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2"><SparklesIcon className="w-3 h-3"/> ClipVerb Deep Search Active</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderStep2_Scope = () => (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Research & Scope</h2>
        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Research Mode</h3>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setState(s => ({...s, researchMode: 'strict'}))} className={`p-4 rounded-xl border transition-all text-left ${state.researchMode === 'strict' ? 'bg-slate-700 border-slate-500 ring-1 ring-slate-500' : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100'}`}>
                    <div className="font-bold text-white mb-1">Strict Mode</div>
                    <div className="text-xs text-slate-400">Analyze only the video content. No external context.</div>
                </button>
                <button onClick={() => setState(s => ({...s, researchMode: 'enhanced'}))} className={`p-4 rounded-xl border transition-all text-left ${state.researchMode === 'enhanced' ? 'bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100'}`}>
                    <div className="font-bold text-white mb-1">Enhanced Mode</div>
                    <div className="text-xs text-slate-400">Deep web search for facts, articles, and context.</div>
                </button>
            </div>
        </div>

        <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Video Segment</h3>
                    <p className="text-xs text-slate-500">Only analyze a specific part of the video.</p>
                </div>
                <div onClick={() => setState(s => ({...s, timestamps: {...s.timestamps, enabled: !s.timestamps.enabled}}))} className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${state.timestamps.enabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${state.timestamps.enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
            </div>
            {state.timestamps.enabled && (
                <div className="flex gap-4 animate-fadeIn">
                    <div className="flex-1">
                        <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
                        <input type="text" placeholder="00:00:00" value={state.timestamps.start} onChange={(e) => setState(s => ({...s, timestamps: {...s.timestamps, start: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-center font-mono text-white"/>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-400 mb-1 block">End Time</label>
                        <input type="text" placeholder="00:10:00" value={state.timestamps.end} onChange={(e) => setState(s => ({...s, timestamps: {...s.timestamps, end: e.target.value}}))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-center font-mono text-white"/>
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderStep3_Intelligence = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Intelligence Settings</h2>
        
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Content Format</label>
            <select value={state.contentType} onChange={(e) => setState(s => ({ ...s, contentType: e.target.value as ContentType }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none">
                {Object.values(ContentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Persona</label>
                <div className="relative">
                     <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/>
                     <select value={state.persona} onChange={(e) => setState(s => ({ ...s, persona: e.target.value as Persona }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none">
                        {Object.values(Persona).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Language</label>
                <div className="relative">
                     <GlobeIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500"/>
                     <select value={state.language} onChange={(e) => setState(s => ({ ...s, language: e.target.value as Language }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none">
                        {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Structure Template</label>
            <select value={state.template} onChange={(e) => setState(s => ({ ...s, template: e.target.value as Template }))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none">
                {Object.values(Template).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
    </div>
  );

  const renderStep4_Branding = () => (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Agency Branding</h2>
        <p className="text-center text-slate-400 text-sm -mt-2 mb-6">Customize the final report (Optional)</p>
        
        <div className="bg-slate-800/30 p-8 rounded-3xl border border-white/5 space-y-6">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Client Name</label>
                <input type="text" placeholder="e.g. Acme Corp" value={state.agency.clientName} onChange={(e) => setState(s => ({ ...s, agency: { ...s.agency, clientName: e.target.value } }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
             </div>
             
             <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Agency Name</label>
                    <input type="text" placeholder="Your Agency" value={state.agency.name} onChange={(e) => setState(s => ({ ...s, agency: { ...s.agency, name: e.target.value } }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Logo</label>
                    <div onClick={() => logoInputRef.current?.click()} className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-indigo-500 overflow-hidden">
                        {state.agency.logo ? <img src={state.agency.logo} className="w-full h-full object-contain"/> : <UploadIcon className="w-5 h-5 text-slate-400"/>}
                        <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*"/>
                    </div>
                 </div>
             </div>
        </div>
    </div>
  );

  const renderStep5_Results = () => (
      <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                        <FileTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">ClipVerb Output</h2>
                        <p className="text-xs text-slate-400 flex items-center gap-2">{state.language} • {state.contentType}</p>
                    </div>
                </div>
                {state.generatedContent && (
                    <div className="flex gap-2">
                        <button onClick={handleDownloadTxt} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700" title="Download TXT"><FileTextIcon className="w-4 h-4"/></button>
                        <button onClick={handleDownloadPdf} className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" title="Download PDF"><DownloadIcon className="w-4 h-4 text-white"/></button>
                    </div>
                )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/40 rounded-2xl p-6 border border-white/5 mb-6 min-h-[400px]">
             {state.generatedContent ? (
                  <div className="prose prose-invert prose-lg max-w-none">
                      <ReactMarkdown components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-6" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-indigo-200 mt-6 mb-3" {...props} />,
                      }}>
                            {state.generatedContent}
                      </ReactMarkdown>
                  </div>
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                     <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                     <p>Generating content...</p>
                 </div>
             )}
          </div>

          <div className="space-y-4">
               {/* Audio Player */}
               <div className="p-4 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                            <SpeakerIcon className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">AI Podcast</p>
                            <p className="text-[10px] text-slate-400">Listen to summary</p>
                        </div>
                    </div>
                    {state.audioUrl ? (
                        <audio controls src={state.audioUrl} className="h-8 w-48 opacity-80" />
                    ) : (
                        <button onClick={handleGenerateAudio} disabled={state.isGeneratingAudio || !state.generatedContent} className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50">
                            {state.isGeneratingAudio ? "Generating..." : "Generate Audio"}
                        </button>
                    )}
               </div>
               
               {/* Real Social Share Buttons */}
               <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => handleRealShare('LinkedIn')} 
                        className="px-4 py-2 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] rounded-full text-sm font-bold hover:bg-[#0077b5]/20 transition-all flex items-center gap-2"
                        disabled={!state.generatedContent}
                    >
                        <span>Post on LinkedIn</span>
                    </button>
                    <button 
                        onClick={() => handleRealShare('Medium')} 
                        className="px-4 py-2 bg-white/10 border border-white/30 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                        disabled={!state.generatedContent}
                    >
                        <span>Post on Medium</span>
                    </button>
                    <button 
                        onClick={() => handleRealShare('Twitter')} 
                        className="px-4 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded-full text-sm font-bold hover:bg-sky-500/20 transition-all flex items-center gap-2"
                        disabled={!state.generatedContent}
                    >
                        <span>Tweet Thread</span>
                    </button>
               </div>
          </div>
      </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 pb-24 md:pb-8">
      {showOverlay && <ProcessingOverlay message={processingStage} />}
      
      {showToast.visible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 z-50 animate-fadeIn">
           <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
           <span className="font-medium text-sm">{showToast.message}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
         <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
             <span className={state.currentStep >= 1 ? "text-indigo-400" : ""}>Source</span>
             <span className={state.currentStep >= 2 ? "text-indigo-400" : ""}>Scope</span>
             <span className={state.currentStep >= 3 ? "text-indigo-400" : ""}>Intelligence</span>
             <span className={state.currentStep >= 4 ? "text-indigo-400" : ""}>Branding</span>
             <span className={state.currentStep >= 5 ? "text-indigo-400" : ""}>Results</span>
         </div>
         <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{width: `${(state.currentStep / TOTAL_STEPS) * 100}%`}}></div>
         </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl min-h-[500px] flex flex-col">
          <div className="flex-1">
            {state.currentStep === 1 && renderStep1_Source()}
            {state.currentStep === 2 && renderStep2_Scope()}
            {state.currentStep === 3 && renderStep3_Intelligence()}
            {state.currentStep === 4 && renderStep4_Branding()}
            {state.currentStep === 5 && renderStep5_Results()}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">
              {state.currentStep > 1 && state.currentStep < 5 ? (
                  <button onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">Back</button>
              ) : <div></div>}
              
              {state.currentStep < 4 ? (
                  <button onClick={nextStep} className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/10">Next</button>
              ) : state.currentStep === 4 ? (
                  <button onClick={nextStep} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                     <SparklesIcon className="w-5 h-5"/> Generate Content
                  </button>
              ) : state.currentStep === 5 ? (
                  <button onClick={() => setState(s => ({...s, currentStep: 1, generatedContent: '', audioUrl: null, sources: []}))} className="px-6 py-3 rounded-xl font-bold text-indigo-400 hover:bg-indigo-500/10 transition-all">Start New</button>
              ) : null}
          </div>
          {state.error && <p className="text-red-400 text-xs text-center mt-4">{state.error}</p>}
      </div>
    </div>
  );
};
