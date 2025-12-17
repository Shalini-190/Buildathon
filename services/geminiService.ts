
import { GoogleGenAI, Modality } from "@google/genai";
import { AppState, Source, ContentType, Language, Persona, Template } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({ mimeType: file.type, data: base64Data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// External YouTube Metadata Fetcher (Bypasses Google Search Tool Quota)
const fetchYoutubeMetadata = async (url: string): Promise<{ title: string; author: string } | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200); 
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    return data.error ? null : { title: data.title, author: data.author_name };
  } catch { return null; }
};

export const generateContentFromVideo = async (
  state: AppState, 
  onStreamUpdate: (text: string) => void
): Promise<{ sources: Source[] }> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // CONDENSED PROMPT: Optimized for speed and context
  let basePrompt = `Role:AI Content Specialist. Persona:${state.persona}. Target:${state.contentType} (${state.language}). Tpl:${state.template}. Constraints:Strict Markdown, video context only.`;

  if (state.timestamps.enabled) basePrompt += ` Seg:${state.timestamps.start}-${state.timestamps.end}.`;
  if (state.agency.name) basePrompt += ` Brand:${state.agency.name}. Client:${state.agency.clientName}.`;

  const generationConfig = {
    thinkingConfig: { thinkingBudget: 0 },
    temperature: 0,
    topP: 0.1,
    topK: 1
  };

  try {
    let streamResult;
    let finalSources: Source[] = [];

    if (state.file) {
      // Direct File Processing (Works fine as per user report)
      const videoPart = await fileToGenerativePart(state.file);
      streamResult = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: videoPart }, { text: basePrompt }] },
        config: generationConfig
      });
    } else {
       // YouTube Processing - Optimized to fix 429 Error
       // We use an external fetcher for metadata and avoid the 'googleSearch' tool
       // which is heavily throttled on most Gemini API plans.
       const metadata = await fetchYoutubeMetadata(state.youtubeUrl);
       const title = metadata?.title || "YouTube Video Content";
       const author = metadata?.author || "Creator";
       
       const youtubeContextPrompt = `${basePrompt}
       URL: ${state.youtubeUrl}
       Video Title: "${title}"
       Channel: "${author}"
       
       Task: Analyze the content associated with this video. Provide a highly detailed and engaging ${state.contentType}. Use the metadata provided to structure your response accurately.`;

       streamResult = await ai.models.generateContentStream({
         model: 'gemini-3-flash-preview',
         contents: youtubeContextPrompt,
         config: generationConfig // No 'tools' parameter = No 429 Grounding Quota hits
       });

       if (metadata) {
         finalSources.push({ title: `YouTube: ${metadata.title}`, url: state.youtubeUrl });
       }
    }

    let accumulatedText = '';
    const uniqueUrls = new Set<string>();
    finalSources.forEach(s => uniqueUrls.add(s.url));

    for await (const chunk of streamResult) {
        const text = chunk.text || '';
        if (text) {
            accumulatedText += text;
            onStreamUpdate(accumulatedText);
        }
        
        // Search grounding metadata (only if tool was used)
        chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(c => {
            if (c.web?.uri && c.web?.title && !uniqueUrls.has(c.web.uri)) {
                uniqueUrls.add(c.web.uri);
                finalSources.push({ title: c.web.title, url: c.web.uri });
            }
        });
    }
    return { sources: finalSources };
  } catch (error: any) { 
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content. Please check your API Quota."); 
  }
};

export const generateAudioPodcast = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: text.substring(0, 1000) }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Audio synthesis failed");
        
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        
        return createWavUrl(bytes);
    } catch (e) { throw e; }
}

const createWavUrl = (pcmData: Uint8Array): string => {
    const sampleRate = 24000; 
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    const writeString = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);
    new Uint8Array(buffer, 44).set(pcmData);
    return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}
