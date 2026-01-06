/**
 * Service to handle all interactions with Gemini AI models
 */

const apiKey = ""; // Set your API key here or via environment variables

export const callGemini = async (prompt, systemInstruction = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };

  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      const delay = Math.pow(2, i) * 1000;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  return "Error: Unable to connect to legal reasoning engine. Please try again.";
};

export const playLegalAudio = async (text) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: `Say clearly and professionally: ${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: "Kore" } 
          } 
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    const pcmData = result.candidates[0].content.parts[0].inlineData.data;

    const binaryString = atob(pcmData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};
