import React, { useState } from "react";
import { Sparkles, Plus, Trash2, ShieldAlert, CheckCircle, Flame, Car, Plane, Home, Salad, ArrowRight, Loader2 } from "lucide-react";
import { CarbonLog } from "../types";

interface LogPanelProps {
  logs: CarbonLog[];
  onAddManualLog: (log: Omit<CarbonLog, "id" | "timestamp">) => void;
  onAddAiLogs: (analyzedResult: { items: any[]; totalCarbonKg: number; summary: string }) => void;
  onDeleteLog: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export default function LogPanel({
  logs,
  onAddManualLog,
  onAddAiLogs,
  onDeleteLog,
  isLoading,
  setIsLoading,
}: LogPanelProps) {
  // Manual state
  const [manualName, setManualName] = useState("");
  const [manualCategory, setManualCategory] = useState<CarbonLog["category"]>("diet");
  const [manualValue, setManualValue] = useState("");
  
  // AI State
  const [aiText, setAiText] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");

  // Handler for Manual submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualValue) return;

    const numericValue = parseFloat(manualValue);
    if (isNaN(numericValue) || numericValue <= 0) return;

    // Direct simple coefficients (kg CO2) helper
    let co2 = 1.0;
    let explanation = "Calculated using general regional standards.";
    let comparison = "Charged an average smartphone several times.";

    if (manualCategory === "diet") {
      // 1 serving/portion
      co2 = Number((numericValue * 2.5).toFixed(2)); // beef/high diet coefficient
      explanation = "Diet footprint estimated for proteins, dairy, or general foods.";
      comparison = `Equivalent to leaving a standard 60W lightbulb on for ${(co2 * 10).toFixed(0)} hours.`;
    } else if (manualCategory === "travel") {
      // in km or miles
      co2 = Number((numericValue * 0.22).toFixed(2)); // standard compact car CO2
      explanation = "Vehicle exhaust fuel combustions based on distance.";
      comparison = `Matches the carbon weight of breathing for ${(co2 * 24).toFixed(0)} hours.`;
    } else if (manualCategory === "energy") {
      // in kWh or hours
      co2 = Number((numericValue * 0.45).toFixed(2)); // power grid average
      explanation = "Coal or gas electricity combustion on typical house circuits.";
      comparison = `Same as charging ${(co2 * 120).toFixed(0)} smartphones to full battery.`;
    } else {
      co2 = Number((numericValue * 0.7).toFixed(2));
      explanation = "Emissions derived for packaging, disposal or digital usage.";
      comparison = `Matches paper production weights or shipping packaging.`;
    }

    onAddManualLog({
      name: `${manualName} (${numericValue} unit${numericValue > 1 ? "s" : ""})`,
      category: manualCategory,
      carbonFootprintKg: co2,
      explanation,
      comparison,
    });

    setManualName("");
    setManualValue("");
  };

  // Handler for Gemini AI Text Scan
  const handleAiScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim()) return;

    setIsLoading(true);
    setAiError("");
    setAiSuccessMessage("");

    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze description from server.");
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        onAddAiLogs(data);
        setAiSuccessMessage(`Parsed ${data.items.length} items successfully! Saved to journal.`);
        setAiText("");
      } else {
        setAiError("AI parsed your input but found no active carbon events. Try being more descriptive!");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Unable to reach EcoPulse AI analyzer. Please check your config.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper colors for logger tags
  const getCategoryDetails = (category: CarbonLog["category"]) => {
    switch (category) {
      case "diet":
        return { bg: "bg-orange-50 text-orange-700 hover:bg-orange-100", label: "Diet/Food", icon: <Salad className="w-4 h-4" /> };
      case "travel":
        return { bg: "bg-sky-50 text-sky-700 hover:bg-sky-100", label: "Travel/Transit", icon: <Car className="w-4 h-4" /> };
      case "energy":
        return { bg: "bg-purple-50 text-purple-700 hover:bg-purple-100", label: "Home Energy", icon: <Home className="w-4 h-4" /> };
      default:
        return { bg: "bg-zinc-50 text-zinc-700 hover:bg-zinc-100", label: "Consumption", icon: <Flame className="w-4 h-4" /> };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Inputs Column */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* AI Scan component */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
          {/* Subtle backdrop glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              EcoPulse AI Quick Scan
            </h3>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-semibold">
              Power of Gemini
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Type anything—grocery shopping items, meal logs, utility receipts, or commute habits. Let AI automatically compute CO2 values.
          </p>

          <form onSubmit={handleAiScan} className="space-y-3">
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              disabled={isLoading}
              rows={3}
              placeholder="E.g., 'I ate 6 oz salmon with brown rice, ran AC for 3 hours, and rode electric scooter for 4 miles'"
              className="w-full text-xs bg-slate-855 text-white border border-slate-700 rounded-xl p-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
            />

            {aiError && (
              <div className="text-[11px] bg-red-500/20 text-red-200 border border-red-500/30 p-2.5 rounded-xl flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-300" />
                <span>{aiError}</span>
              </div>
            )}

            {aiSuccessMessage && (
              <div className="text-[11px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 p-2.5 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !aiText.trim()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-amber-300 hover:bg-amber-200 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Eco-Coefficients Computing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  Analyze Carbon Footprint
                </>
              )}
            </button>
          </form>
        </div>

        {/* Manual Tracker component */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">
            Classic Manual Entry
          </h3>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Item / Activity Name
              </label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="E.g., Beef burger, Sedan ride, Commute"
                className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as CarbonLog["category"])}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                >
                  <option value="diet">Diet / Food</option>
                  <option value="travel">Travel / Transit</option>
                  <option value="energy">Home Energy</option>
                  <option value="other">Consumption</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="E.g. 15"
                    className="w-full text-xs border border-gray-200 rounded-xl p-2.5 pr-14 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50/50"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] uppercase font-bold text-gray-400 pointer-events-none">
                    {manualCategory === "diet" && "Serving"}
                    {manualCategory === "travel" && "Km"}
                    {manualCategory === "energy" && "Hrs/kWh"}
                    {manualCategory === "other" && "Units"}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!manualName.trim() || !manualValue}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Carbon Log
            </button>
          </form>
        </div>
      </div>

      {/* Carbon Ledger List Column */}
      <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Today's Active Carbon Ledger</h3>
            <p className="text-xs text-gray-500 mt-0.5">Calculated in real-time. Keep daily sum under the 5.0 kg Paris goal.</p>
          </div>
          <span className="text-xs bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-full">
            {logs.length} logged item{logs.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[440px] divide-y divide-gray-50 p-4">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <ArrowRight className="w-5 h-5 text-gray-300 animate-pulse" />
              </div>
              <p className="text-xs font-medium">Your Carbon Ledger is clear for today!</p>
              <p className="text-[11px] text-gray-400 max-w-xs mt-1">
                Enter your habits using the AI Quick Scan or manual forms to visualize your footprint logs.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const details = getCategoryDetails(log.category);
              return (
                <div key={log.id} className="py-4 flex items-start justify-between gap-3 group">
                  <div className="flex items-start gap-3">
                    <span className="p-2 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      {details.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{log.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${details.bg}`}>
                          {details.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-650 mt-1">{log.explanation}</p>
                      
                      {/* Comparison bubble */}
                      <p className="text-[10px] mt-1.5 text-indigo-700 bg-indigo-50/50 font-medium p-1.5 px-2.5 rounded-xl inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        {log.comparison}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0 justify-between min-h-[50px]">
                    <div className="text-xs font-black text-gray-900 bg-gray-150 p-1.5 py-0.5 rounded-md">
                      +{log.carbonFootprintKg.toFixed(2)} kg
                    </div>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-opacity"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
