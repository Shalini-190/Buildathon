import { GoogleGenAI, Modality } from "@google/genai";
import { AppState, Source, ContentType, Language, Persona, Template } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to extract YouTube Video ID
const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to fetch YouTube Metadata
const fetchYoutubeMetadata = async (url: string): Promise<{ title: string; author: string } | null> => {
  const controller = new AbortController();
  // LATENCY OPTIMIZATION: Reduced timeout from 1500ms to 800ms. 
  // If noembed is slow, we skip it and let Gemini handle the title lookup via Google Search.
  const timeoutId = setTimeout(() => controller.abort(), 800); 

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.error) return null;
    return {
      title: data.title,
      author: data.author_name
    };
  } catch (error) {
    console.warn("Failed to fetch YouTube metadata (or timed out):", error);
    return null;
  }
};

export const generateContentFromVideo = async (
  state: AppState, 
  onStreamUpdate: (text: string) => void
): Promise<{ sources: Source[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // --- PROMPT CONSTRUCTION ---
  
  // 1. Role & Persona
  let basePrompt = `
  ROLE: You are ClipVerb, an elite Video Content Intelligence Engine.
  CURRENT PERSONA: ${state.persona}.
  
  TASK: Extract context from the provided video source and transform it into a professional ${state.contentType}.
  OUTPUT LANGUAGE: ${state.language}.
  
  FRAMEWORK:
  - Tone: ${state.persona}
  - Structure: Markdown (Headers, Bullet points, clear paragraphs)
  - Detail Level: High. Be comprehensive and specific.
  
  CRITICAL CONSTRAINTS:
  - Do NOT include generic placeholders like "[Date]", "[City]", "[Your Name]", "[State]". 
  - Do NOT use variables like "[Insert Text Here]".
  - If specific location or date information is not in the source video, OMIT the dateline entirely. Start directly with the content.
  - Do NOT add a fake signature at the end.
  `;

  // 2. Templates
  if (state.template !== Template.NONE) {
    basePrompt += `
    STRICT STRUCTURE TEMPLATE: ${state.template}
    Follow the conventions of this template exactly.
    `;
  }

  // 3. Content Type Specifics
  if (state.contentType === ContentType.CLIENT_REPORT) {
    basePrompt += `
    FORMAT: EXECUTIVE CLIENT REPORT
    Required Sections: 
    1. Executive Summary
    2. Detailed Key Insights (with timestamps if available)
    3. Strategic Implications
    4. Actionable Recommendations
    
    Start directly with the Executive Summary title. Do not add a letterhead or placeholders at the top.
    `;
  } else if (state.contentType === ContentType.NEWS_ARTICLE) {
    basePrompt += `
    FORMAT: NEWS ARTICLE
    - Headline: Catchy and relevant.
    - Lead Paragraph: Who, what, when, where, why.
    - Body: Quotes (paraphrased from video), context, and analysis.
    - Style: Journalistic standard (AP Style).
    - NO dateline placeholders (e.g. "[City]") unless the specific city is mentioned in the video.
    `;
  } else if (state.contentType === ContentType.TWEET_THREAD) {
    basePrompt += `
    FORMAT: TWITTER/X THREAD
    - Series of 5-10 tweets.
    - Numbered 1/x, 2/x.
    - Use engaging hooks and emojis.
    `;
  } else if (state.contentType === ContentType.LINKEDIN_POST) {
      basePrompt += `
      FORMAT: LINKEDIN VIRAL POST
      - Hook: Grab attention immediately.
      - Body: Value-packed, spaced out lines.
      - CTA: Engagement question at the end.
      `;
  }

  // 4. Timestamps
  if (state.timestamps.enabled && state.timestamps.start && state.timestamps.end) {
    basePrompt += `
    CRITICAL: Focus analysis ONLY on the segment from ${state.timestamps.start} to ${state.timestamps.end}.
    Ignore content outside this timeframe.
    `;
  }

  // 5. Agency & Client Branding
  if (state.agency.name) {
    basePrompt += `
    BRANDING CONTEXT:
    - Agency: ${state.agency.name}
    `;
  }
  
  if (state.agency.clientName) {
    basePrompt += `
    - Client: ${state.agency.clientName}
    - Tone Adjustment: Write specifically for ${state.agency.clientName}, addressing their industry context.
    `;
  }

  try {
    const generationConfig: any = {
      thinkingConfig: { thinkingBudget: 0 },
      temperature: 0.7, // Creativity balance
    };

    let streamResult;
    let finalSources: Source[] = [];

    if (state.file) {
      const videoPart = await fileToGenerativePart(state.file);
      const parts: any[] = [{ inlineData: videoPart }, { text: basePrompt }];

      if (state.researchMode === 'enhanced') {
          generationConfig.tools = [{ googleSearch: {} }];
          parts.push({ 
            text: "RESEARCH INSTRUCTION: Use Google Search to enrich the video content with verified facts and broader context." 
          });
      }
      
      streamResult = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: generationConfig
      });

    } else if (state.youtubeUrl) {
       const metadata = await fetchYoutubeMetadata(state.youtubeUrl);
       const videoTitle = metadata?.title || "Unknown Video";
       const videoAuthor = metadata?.author || "Unknown Channel";

       // We force 'enhanced' search behavior for YouTube to ensure we find the transcript/context
       // regardless of the user's research setting, but we instruct the model on how to USE that info.
       
       const searchPrompt = `
       ${basePrompt}

       TARGET VIDEO: "${videoTitle}" by "${videoAuthor}"
       URL: ${state.youtubeUrl}

       SYSTEM INSTRUCTION:
       1. You are simulating a "Video Downloader & Context Extractor".
       2. Use the 'googleSearch' tool to find the TRANSCRIPT, CAPTIONS, REVIEW SUMMARIES, and DESCRIPTION of this specific video.
       3. Reconstruct the full video narrative from these sources.
       4. EXTRACT the key points, arguments, and specific details.
       
       ${state.researchMode === 'strict' 
          ? "CONSTRAINT: Use the search results ONLY to reconstruct the video content. Do not add external opinions." 
          : "ENHANCEMENT: You may also search for related topics to add depth and context to the report."}

       MANDATORY RULES:
       - DO NOT say "I cannot watch the video".
       - DO NOT say "I cannot access the transcript".
       - If a direct transcript is missing, you MUST synthesize a detailed report based on the extensive search results about this video's topic and title.
       - Act as if you have processed the video file directly.
       `;

       streamResult = await ai.models.generateContentStream({
         model: 'gemini-2.5-flash',
         contents: { text: searchPrompt },
         config: {
           ...generationConfig,
           tools: [{ googleSearch: {} }] // Always enable search for YouTube to "download" context
         }
       });

       if (metadata) {
         finalSources.push({ title: `Video: ${metadata.title}`, url: state.youtubeUrl });
       }
    } else {
      throw new Error("No video source provided.");
    }

    // Process Stream
    let accumulatedText = '';
    const uniqueUrls = new Set<string>();
    finalSources.forEach(s => uniqueUrls.add(s.url));

    for await (const chunk of streamResult) {
        const text = chunk.text || '';
        if (text) {
            accumulatedText += text;
            onStreamUpdate(accumulatedText);
        }
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach(c => {
                const url = c.web?.uri;
                const title = c.web?.title;
                if (url && title && !uniqueUrls.has(url)) {
                    uniqueUrls.add(url);
                    finalSources.push({ title, url });
                }
            });
        }
    }

    return {
      sources: finalSources
    };

  } catch (error: any) {
    console.error("ClipVerb Generation Error:", error);
    throw new Error(error.message || "Failed to generate content.");
  }
};

// AUDIO GENERATION SERVICE
export const generateAudioPodcast = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    
    // LATENCY OPTIMIZATION: 
    // 1. Truncate text: Sending 10k chars takes time. We limit to ~2000 for a "Quick Summary" feel.
    // 2. We could ask the model to summarize it first, but that adds a round trip.
    // We will just slice it safely.
    const safeText = text.substring(0, 2000); 
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: safeText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Professional voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");
        
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        return createWavUrl(bytes);

    } catch (e) {
        console.error("Audio Gen Error", e);
        throw e;
    }
}

// Helper to add WAV header to raw PCM (1 channel, 24kHz usually for Gemini)
const createWavUrl = (pcmData: Uint8Array): string => {
    const numChannels = 1;
    const sampleRate = 24000; 
    const byteRate = sampleRate * numChannels * 2;
    const blockAlign = numChannels * 2;
    const dataSize = pcmData.length; 
    
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const bytes = new Uint8Array(buffer, 44);
    bytes.set(pcmData);

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
}

const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}