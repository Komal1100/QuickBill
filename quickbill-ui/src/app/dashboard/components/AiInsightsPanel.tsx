"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, RefreshCw } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from "@/lib/api";


// Standard markdown rendering wrapper

export default function AiInsightsPanel() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "Summarize sales trends from last week",
    "Show me orders over $500",
    "Any suggestions on restocking items?"
  ];

  const handleAskAI = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    setLoading(true);
    setResponse("");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/insights/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });
      
      if (!res.ok) throw new Error("AI engine failed to parse criteria.");
      
      const data = await res.json();
      setResponse(data.insights);
    } catch (err) {
        console.error("CRITICAL CONNECTION ERROR:", err);
      setResponse("⚠️ Sorry Meera, I ran into an error processing that request. Please double-check transaction parameters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-1 lg:col-span-3 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[400px]">
      <div>
        {/* Header Branding */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">QuickBill Core AI</h3>
            <p className="text-xs text-zinc-400">Ask simple, everyday questions about your store data</p>
          </div>
        </div>

        {/* Suggestion Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setQuery(prompt); handleAskAI(prompt); }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-all cursor-pointer disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Response Display Workspace */}
        <div className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 min-h-[180px] max-h-[300px] overflow-y-auto mb-4 text-sm text-zinc-300 leading-relaxed custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs italic tracking-wide">Scanning database structures & projecting insights...</p>
            </div>
          ) : response ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-zinc-500 italic text-center pt-12">
              Try asking: "Which items brought in the most revenue this month?"
            </p>
          )}
        </div>
      </div>

      {/* Form Input Dock */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleAskAI(query); }}
        className="relative flex items-center mt-auto"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about sales, items, or inventory configurations..."
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all focus:ring-1 focus:ring-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-lg transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}