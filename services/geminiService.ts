
import { GoogleGenAI, Modality } from "@google/genai";
import { AppState, Source, ContentType, Language, Persona, Template } from "../types";

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

const fetchYoutubeMetadata = async (url: string): Promise<{ title: string; author: string } | null> => {
  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
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
  
  const basePrompt = `Role: ClipVerb Intel. Task: Generate ${state.contentType} in ${state.language}. Tone: ${state.persona}.
Template: ${state.template}. Constraints: Markdown only, no meta-talk. Use strictly the provided video context.`;

  const config = {
    thinkingConfig: { thinkingBudget: 0 },
    temperature: 0,
    topP: 0.1,
  };

  try {
    let streamResult;
    let finalSources: Source[] = [];

    if (state.file) {
      const videoPart = await fileToGenerativePart(state.file);
      streamResult = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: { parts: [{ inlineData: videoPart }, { text: basePrompt }] },
        config
      });
    } else {
       const metadataPromise = fetchYoutubeMetadata(state.youtubeUrl);
       streamResult = await ai.models.generateContentStream({
         model: 'gemini-3-flash-preview',
         contents: `${basePrompt} Source: ${state.youtubeUrl}. Search and summarize content accurately.`,
         config: { ...config, tools: [{ googleSearch: {} }] }
       });
       const metadata = await metadataPromise;
       if (metadata) finalSources.push({ title: metadata.title, url: state.youtubeUrl });
    }

    let accumulatedText = '';
    const uniqueUrls = new Set<string>();
    finalSources.forEach(s => uniqueUrls.add(s.url));

    for await (const chunk of streamResult) {
        const text = chunk.text || '';
        if (text) { accumulatedText += text; onStreamUpdate(accumulatedText); }
        chunk.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(c => {
            if (c.web?.uri && c.web?.title && !uniqueUrls.has(c.web.uri)) {
                uniqueUrls.add(c.web.uri);
                finalSources.push({ title: c.web.title, url: c.web.uri });
            }
        });
    }
    return { sources: finalSources };
  } catch (err: any) { throw new Error(err.message); }
};

export const generateAudioPodcast = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text.substring(0, 3000) }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("Audio generation failed");
        
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        
        const sampleRate = 24000;
        const buffer = new ArrayBuffer(44 + bytes.length);
        const view = new DataView(buffer);
        const writeString = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + bytes.length, true);
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
        view.setUint32(40, bytes.length, true);
        new Uint8Array(buffer, 44).set(bytes);
        return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    } catch (e) { throw e; }
};
