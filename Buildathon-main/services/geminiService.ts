export async function generateContentFromVideo(videoData: any) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "video", data: videoData })
  });
  if (!res.ok) throw new Error("Gemini backend failed");
  return res.json();
}

export async function generateAudioPodcast(audioData: any) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "audio", data: audioData })
  });
  if (!res.ok) throw new Error("Gemini backend failed");
  return res.json();
}