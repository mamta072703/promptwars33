import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, ShieldAlert, Loader2, Compass } from "lucide-react";
import { ChatMessage, CarbonLog } from "../types";

interface CarbonCoachProps {
  logs: CarbonLog[];
}

export default function CarbonCoach({ logs }: CarbonCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Initial welcome message from AI Coach
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am your EcoPulse Carbon Coach. 🌿 Tell me about your lifestyle, diet, or home. Ask me things like: \n- *'How can I reduce transportation footprint?'*\n- *'What is a low-carbon substitute for cheddar cheese?'* \n- *'Why is the Paris Agreement target 1.5°C?'* \n\nI can analyze today's logs to give you personalized offsets!",
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [messages]);

  // Handler for text queries
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setSendError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          logs: logs,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Coaching engine is currently offline.");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setSendError(err.message || "Something went wrong. Please check your API secrets configuration.");
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const cache = userInput;
    setUserInput("");
    handleSendMessage(cache);
  };

  // Sample quick queries
  const samplePrompts = [
    "Beef vs Lentils comparison",
    "Tips to offset transit emissions",
    "Meaning of absolute zero emissions",
    "Suggest a simple meatless recipe"
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[520px]">
      
      {/* Header bar */}
      <div className="p-4 border-b border-gray-50 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xs">
            ✨
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">EcoPulse Coach</h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected with active carbon ledger logs
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-750 p-1 px-2.5 rounded-full font-bold">
          Gemini 3.5 Assistant
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((m) => {
          const isAi = m.role === "assistant";
          return (
            <div key={m.id} className={`flex gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}>
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs shrink-0 select-none">
                  🧭
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                isAi 
                  ? "bg-white text-gray-800 border border-gray-10 border-b-2 shadow-sm rounded-tl-none whitespace-pre-line" 
                  : "bg-indigo-600 text-white rounded-tr-none shadow-sm font-medium"
              }`}>
                {m.content}
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 select-none">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs shrink-0">
              🧭
            </div>
            <div className="bg-white border border-gray-10 p-3 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4.5 h-4.5 animate-spin text-indigo-505" />
              <span>EcoPulse Coach is consulting regional databases...</span>
            </div>
          </div>
        )}

        {sendError && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="font-bold">Coaching Failure</p>
              <p className="mt-0.5">{sendError}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Preset clickers */}
      <div className="p-2.5 border-t border-gray-50 flex flex-wrap gap-1.5 bg-white shrink-0">
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSendMessage(p)}
            disabled={isSending}
            className="text-[10px] text-gray-650 bg-gray-50 border border-gray-150 rounded-full px-2.5 py-1 hover:border-indigo-500 hover:text-indigo-600 active:bg-indigo-50 transition-all cursor-pointer whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={onSubmit} className="p-3 bg-slate-50 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={userInput}
          disabled={isSending}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={isSending ? "Coach is speaking..." : "Ask your Carbon coach a question..."}
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isSending}
          className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
