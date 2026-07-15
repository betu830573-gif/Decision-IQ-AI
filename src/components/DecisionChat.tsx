import React, { useState, useRef, useEffect } from "react";
import { Decision, ChatMessage } from "../types";
import { sendDecisionChatMessage } from "../lib/api";
import { Send, MessageSquare, Bot, User as UserIcon, Loader2, RefreshCw } from "lucide-react";
import VoiceController from "./VoiceController";

interface DecisionChatProps {
  decision: Decision;
  onChatUpdated: (updatedHistory: ChatMessage[]) => void;
}

export default function DecisionChat({ decision, onChatUpdated }: DecisionChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(decision.chatHistory || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Sync messages if decision prop updates
  useEffect(() => {
    setMessages(decision.chatHistory || []);
  }, [decision]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setError(null);
    setInput("");

    // optimistic update
    const optimisticMessage: ChatMessage = {
      id: "opt-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const data = await sendDecisionChatMessage(decision.id, textToSend);
      setMessages(data.chatHistory);
      onChatUpdated(data.chatHistory);
    } catch (err: any) {
      console.error(err);
      setError("AI Chat is currently disconnected. Please make sure GEMINI_API_KEY is active.");
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-[#161618] border border-white/10 overflow-hidden h-[500px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-display">Decision Advisor Chat</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Discuss risk matrices and simulation parameters with Gemini.</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#121214]/20"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <Bot className="w-10 h-10 text-slate-600 mb-2.5" />
            <p className="text-sm font-medium font-display">Consult your personal Decision Architect</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Ask questions about which laptop offers better ROI, how the startup equity vesting works, or how to mitigate risk levels.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                msg.sender === "user" ? "bg-indigo-500/10 text-indigo-400" : "bg-purple-500/10 text-purple-400"
              }`}>
                {msg.sender === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(79,70,229,0.15)]" 
                  : "bg-[#121214] border border-white/10 text-slate-100 rounded-tl-none"
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}

        {/* Loading Spinner bubble */}
        {loading && (
          <div className="flex items-start gap-3 mr-auto max-w-[80%]">
            <div className="p-2 rounded-lg shrink-0 bg-purple-500/10 text-purple-400 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#121214] border border-white/10 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span className="text-xs text-slate-400 font-mono">Gemini is formulating response...</span>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}
      </div>

      {/* Voice input dictionary proxy inside chat footer */}
      <div className="px-4 py-2 border-t border-white/10 bg-white/[0.01]">
        <VoiceController 
          decisionId={decision.id} 
          onTranscriptReady={(text) => setInput(text)} 
        />
      </div>

      {/* Input Tray */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        className="flex items-center gap-2 p-3.5 border-t border-white/10 bg-white/[0.02]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up or test a scenario..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
