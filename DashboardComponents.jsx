import React, { useState } from 'react';
import { 
  Scale, Database, TrendingUp, ShieldCheck, Clock, 
  Globe, ExternalLink, Sparkles, Volume2, RefreshCw, BrainCircuit 
} from 'lucide-react';

// --- Consolidated Gemini Logic (Fixes Resolve Error) ---
const apiKey = ""; 

const callGemini = async (prompt, systemInstruction = "") => {
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
  return "Error: Unable to connect to legal reasoning engine.";
};

const playLegalAudio = async (text) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
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
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

// --- UI Components ---

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50",
    magic: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-lg"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export const NJDGModule = () => {
  const stats = [
    { label: "Total Pending Cases", value: "4,45,21,098", icon: Database, color: "text-rose-600" },
    { label: "Cases Filed (30D)", value: "12,41,002", icon: TrendingUp, color: "text-indigo-600" },
    { label: "Cases Disposed (30D)", value: "11,85,431", icon: ShieldCheck, color: "text-emerald-600" },
    { label: "Avg. Interval", value: "24 Days", icon: Clock, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-blue-600" /> NJDG Data Grid</h2>
        <a href="https://njdg.ecourts.gov.in/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1">Official Portal <ExternalLink size={12} /></a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-4 border-l-4 border-l-indigo-500">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const AIJudgeModule = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!inputText) return;
    setAnalyzing(true);
    const response = await callGemini(inputText, "You are a Senior Judicial Consultant. Analyze the following legal fact pattern and provide strategic insights.");
    setResult({ verdict: "Analysis Complete", reasoning: response });
    setAnalyzing(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2"><Scale className="text-indigo-600" /> ✨ AI Case Strategist</h2>
      <textarea 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full h-32 p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Paste case facts here for Gemini to analyze..."
      />
      <Button onClick={handleAnalyze} variant="magic" className="w-full justify-center" disabled={analyzing}>
        {analyzing ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />} 
        {analyzing ? "Gemini is thinking..." : "Generate AI Analysis"}
      </Button>
      {result && (
        <Card className="p-4 bg-indigo-50 border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between mb-2">
            <span className="font-bold text-indigo-900 text-sm">Output Reasoning</span>
            <button 
              onClick={() => playLegalAudio(result.reasoning)}
              className="p-1 hover:bg-indigo-200 rounded text-indigo-600 transition-colors"
              title="Speak text"
            >
              <Volume2 size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{result.reasoning}</p>
        </Card>
      )}
    </div>
  );
};

// Main App fallback for preview if needed
export default function App() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <NJDGModule />
      <div className="mt-8 max-w-2xl mx-auto">
        <Card>
          <AIJudgeModule />
        </Card>
      </div>
    </div>
  );
}
