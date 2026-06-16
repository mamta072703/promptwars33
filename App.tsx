import React, { useState, useEffect } from "react";
import {
  Trees,
  Sprout,
  Heart,
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Award,
  BookOpen,
  Compass,
  MessageSquare,
  Activity,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Trash2
} from "lucide-react";
import { CarbonLog, Quest, ForestItem, DailyReport } from "./types";
import CarbonSink from "./components/CarbonSink";
import LogPanel from "./components/LogPanel";
import QuestList from "./components/QuestList";
import CarbonCoach from "./components/CarbonCoach";

// Seeding standard assets
const DEFAULT_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Eco Green Protein Swap",
    description: "Swap standard beef-pork entries for bean, organic lentil, or garden tofu portions today.",
    category: "diet",
    points: 40,
    status: "available",
    iconName: "Salad",
    actionRequired: "Prepare a fully plant-based premium meal.",
  },
  {
    id: "q2",
    title: "Low-Combustion Commuting",
    description: "Ride a bicycle, walk, telecommute, or choose electric bus/rail transits under 10km.",
    category: "travel",
    points: 80,
    status: "available",
    iconName: "Car",
    actionRequired: "Ditch fossil-fuel transport for one journey today.",
  },
  {
    id: "q3",
    title: "Atmospheric Cold Wash Cycle",
    description: "Lower hot water heating grids by washing laundry clothes on custom cold-water configurations.",
    category: "energy",
    points: 45,
    status: "available",
    iconName: "Home",
    actionRequired: "Run 1 laundry load entirely on cold stream.",
  },
  {
    id: "q4",
    title: "Zero-Vampire Appliance Hour",
    description: "Unplug high standby-draw gaming consoles, audio subwoofers, and redundant televisions for 2 hours.",
    category: "energy",
    points: 60,
    status: "available",
    iconName: "Home",
    actionRequired: "Douse vampire power standby loads completely.",
  },
  {
    id: "q5",
    title: "Support Urban Farmers",
    description: "Incorporate local, organic, seasonal farmer's market greens and fruits into your breakfast.",
    category: "diet",
    points: 50,
    status: "available",
    iconName: "Salad",
    actionRequired: "Log local farmer market ingredients.",
  },
];

const DEFAULT_FOREST: ForestItem[] = [
  { id: "s1", type: "tree", x: 22, y: 15, scale: 1.1 },
  { id: "s2", type: "shrub", x: 45, y: 12, scale: 0.95 },
  { id: "s3", type: "flower", x: 30, y: 8, scale: 1.2 },
  { id: "s4", type: "sprout", x: 74, y: 18, scale: 1.0 },
  { id: "s5", type: "wind", x: 88, y: 35, scale: 1.3 },
];

const DEFAULT_LOGS: CarbonLog[] = [
  {
    id: "l1",
    name: "Gasoline Compact Sedan Ride (12 miles)",
    category: "travel",
    carbonFootprintKg: 4.1,
    explanation: "Standard gasoline internal combustion engine emissions based on EPA distance variables.",
    comparison: "Equivalent to charging a smartphone 490 times.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "l2",
    name: "Standard Cheese & Rice meal (1 serving)",
    category: "diet",
    carbonFootprintKg: 1.8,
    explanation: "Carbon footprint derived from high dairy farming milk emissions and processing heat grids.",
    comparison: "Same as leaving a 10W LED bulb on for 180 hours.",
    timestamp: new Date().toISOString(),
  }
];

export default function App() {
  // App-level state
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [forestItems, setForestItems] = useState<ForestItem[]>([]);
  const [ecoPoints, setEcoPoints] = useState(120);
  const [streakDays, setStreakDays] = useState(3);
  
  // Toast notifications for premium actions
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4500);
  };
  
  // Dashboard view components
  const [activeTab, setActiveTab] = useState<"forest" | "logger" | "quests" | "coach">("forest");
  const [isLoading, setIsLoading] = useState(false);
  
  // AI report states
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const [currentTime, setCurrentTime] = useState("");

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Initial State Loading & Storage Hydration
  useEffect(() => {
    const stored = localStorage.getItem("ecopulse_data_v1");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLogs(parsed.logs || []);
        setQuests(parsed.quests || DEFAULT_QUESTS);
        setForestItems(parsed.forestItems || DEFAULT_FOREST);
        setEcoPoints(parsed.ecoPoints !== undefined ? parsed.ecoPoints : 120);
        setStreakDays(parsed.streakDays !== undefined ? parsed.streakDays : 3);
        if (parsed.report) setReport(parsed.report);
      } catch (err) {
        console.error("Failed to parse stored local data:", err);
        // Fallback seeds
        setLogs(DEFAULT_LOGS);
        setQuests(DEFAULT_QUESTS);
        setForestItems(DEFAULT_FOREST);
      }
    } else {
      // Seed fresh default values
      setLogs(DEFAULT_LOGS);
      setQuests(DEFAULT_QUESTS);
      setForestItems(DEFAULT_FOREST);
      setEcoPoints(120);
      setStreakDays(3);
    }
  }, []);

  // 2. State Auto-Persistence sync
  const saveToStorage = (updatedLogs: CarbonLog[], updatedQuests: Quest[], updatedForest: ForestItem[], updatedPoints: number, updatedStreak: number, updatedReport: DailyReport | null) => {
    localStorage.setItem("ecopulse_data_v1", JSON.stringify({
      logs: updatedLogs,
      quests: updatedQuests,
      forestItems: updatedForest,
      ecoPoints: updatedPoints,
      streakDays: updatedStreak,
      report: updatedReport
    }));
  };

  // 3. Calculation helper: summarize logs for current daily impact
  const dailyFootprint = Number(logs.reduce((sum, log) => sum + log.carbonFootprintKg, 0).toFixed(2));

  // Determine standard alert text based on calculations
  const budgetRatio = dailyFootprint / 5.0; // Paris individual goal benchmark of 5kg
  const budgetPercentage = Math.min(100, Math.round(budgetRatio * 100));

  // 4. Action Handlers: Add Manual entry
  const handleAddManualLog = (newLog: Omit<CarbonLog, "id" | "timestamp">) => {
    const freshLog: CarbonLog = {
      ...newLog,
      id: "log_" + Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const nextLogs = [freshLog, ...logs];
    setLogs(nextLogs);
    saveToStorage(nextLogs, quests, forestItems, ecoPoints, streakDays, report);
  };

  // 5. Action Handlers: Add multiple analyzed items retrieved from Gemini client-side endpoint
  const handleAddAiLogs = (analyzedResult: { items: any[]; totalCarbonKg: number; summary: string }) => {
    const formattedLogs: CarbonLog[] = analyzedResult.items.map((item, index) => ({
      id: `ai_${Date.now()}_${index}`,
      name: item.name,
      category: item.category as CarbonLog["category"],
      carbonFootprintKg: Number(item.carbonFootprintKg) || 0.5,
      explanation: item.explanation || "Extracted via EcoPulse scan models.",
      comparison: item.comparison || "Relative equivalents estimated by AI.",
      timestamp: new Date().toISOString()
    }));

    const nextLogs = [...formattedLogs, ...logs];
    setLogs(nextLogs);
    // Auto-award bonus coin for utilizing high-tech AI calculations!
    const nextPoints = ecoPoints + 15;
    setEcoPoints(nextPoints);
    saveToStorage(nextLogs, quests, forestItems, nextPoints, streakDays, report);
  };

  // 6. Delete single Log Row
  const handleDeleteLog = (id: string) => {
    const nextLogs = logs.filter((log) => log.id !== id);
    setLogs(nextLogs);
    saveToStorage(nextLogs, quests, forestItems, ecoPoints, streakDays, report);
  };

  // 7. Quest status: Accepts specialized challenge
  const handleStartQuest = (id: string) => {
    const nextQuests = quests.map((q) => (q.id === id ? { ...q, status: "active" as const } : q));
    setQuests(nextQuests);
    saveToStorage(logs, nextQuests, forestItems, ecoPoints, streakDays, report);
  };

  // 8. Quest status: Marks complete, issues eco-coins, grows forest!
  const handleCompleteQuest = (id: string) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    // Grow corresponding nature item coordinates in forest Sink based on category
    let type: ForestItem["type"] = "sprout";
    if (quest.category === "diet") type = "flower";
    if (quest.category === "travel") type = "shrub";
    if (quest.category === "energy") type = "wind";

    const newForestNode: ForestItem = {
      id: "fNode_" + Date.now().toString(),
      type,
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 30) + 10,
      scale: Number((Math.random() * 0.4 + 0.85).toFixed(2)),
    };

    const nextQuests = quests.map((q) => (q.id === id ? { ...q, status: "completed" as const } : q));
    const nextForest = [newForestNode, ...forestItems];
    const nextPoints = ecoPoints + quest.points;

    setQuests(nextQuests);
    setForestItems(nextForest);
    setEcoPoints(nextPoints);
    
    // Evaluate if user is under daily emission to award streak booster!
    let nextStreak = streakDays;
    if (dailyFootprint < 5.0) {
      nextStreak = streakDays + 1;
      setStreakDays(nextStreak);
    }

    saveToStorage(logs, nextQuests, nextForest, nextPoints, nextStreak, report);
  };

  // 9. Plant purchase from Seed shop in CarbonSink
  const handlePlantItem = (type: ForestItem["type"]) => {
    const prices: Record<ForestItem["type"], number> = {
      sprout: 20,
      flower: 45,
      shrub: 60,
      tree: 100,
      solar: 150,
      wind: 200,
      cloud: 30,
    };

    const price = prices[type];
    if (ecoPoints < price) return;

    const newForestNode: ForestItem = {
      id: "fShopNode_" + Date.now().toString(),
      type,
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 32) + 8,
      scale: Number((Math.random() * 0.4 + 0.82).toFixed(2)),
    };

    const nextPoints = ecoPoints - price;
    const nextForest = [newForestNode, ...forestItems];

    setEcoPoints(nextPoints);
    setForestItems(nextForest);
    saveToStorage(logs, quests, nextForest, nextPoints, streakDays, report);
  };

  // 10. Fetch AI Insights on-demand Daily Report Analysis
  const handleGenerateDailyReport = async () => {
    setIsGeneratingReport(true);
    setReportError("");

    try {
      const response = await fetch("/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: logs,
          activeQuests: quests.filter((q) => q.status === "active"),
          streakDays: streakDays,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Insight engine failed to deliver.");
      }

      const reportData: DailyReport = await response.json();
      setReport(reportData);
      
      // Auto register/append suggestedQuest to our list of quests dynamically if not present!
      const questId = "suggested_" + Date.now();
      const freshSuggestedQuest: Quest = {
        id: questId,
        title: reportData.suggestedQuest.title,
        description: reportData.suggestedQuest.description,
        category: reportData.suggestedQuest.category,
        points: reportData.suggestedQuest.points,
        status: "available",
        iconName: reportData.suggestedQuest.category === "diet" ? "Salad" : reportData.suggestedQuest.category === "travel" ? "Car" : "Home",
        actionRequired: "Claim specialized recommendation prompt.",
      };

      const nextQuests = [freshSuggestedQuest, ...quests.filter((q) => !q.id.startsWith("suggested_"))];
      setQuests(nextQuests);
      saveToStorage(logs, nextQuests, forestItems, ecoPoints, streakDays, reportData);
    } catch (err: any) {
      console.error(err);
      setReportError(err.message || "An error occurred generating your daily report.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 11. Complete Dynamic suggested quest from Daily AI report panel
  const handleAcceptSuggestedQuest = () => {
    if (!report) return;
    const suggested = quests.find((q) => q.title === report.suggestedQuest.title);
    if (suggested) {
      handleStartQuest(suggested.id);
      setActiveTab("quests");
    }
  };

  // Clean wipe trigger for test simulation
  const handleResetWipeAll = () => {
    localStorage.removeItem("ecopulse_data_v1");
    setLogs([]);
    setQuests(DEFAULT_QUESTS);
    setForestItems(DEFAULT_FOREST);
    setEcoPoints(100);
    setStreakDays(0);
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Toast Notification Popover */}
      {showToast && (
        <div id="toast-notify" className="fixed bottom-6 right-6 z-55 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/60 flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            🌱
          </div>
          <div>
            <p className="text-xs font-bold">Sustainability Update</p>
            <p className="text-[11px] text-slate-350">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Sidebar Navigation - Sleek Interface Style */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
            <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">EcoPulse AI</h1>
            <p className="text-[9px] font-black text-slate-400 tracking-wider">CARBON JOURNAL</p>
          </div>
        </div>

        {/* Sidebar Nav links mapping to dashboard tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => setActiveTab("forest")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "forest"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Trees className="w-4 h-4 shrink-0" />
            Dashboard & Sink
          </button>

          <button
            onClick={() => setActiveTab("logger")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "logger"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            AI Scan & Ledger
          </button>

          <button
            onClick={() => setActiveTab("quests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "quests"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            Quests & Habits
          </button>

          <button
            onClick={() => setActiveTab("coach")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left cursor-pointer ${
              activeTab === "coach"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            EcoPulse AI Coach
          </button>
        </nav>

        {/* Sandbox management and Pro upgrade slot */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-405 uppercase tracking-widest mb-1 text-emerald-400">Pro Plan Active</p>
            <p className="text-[11px] text-slate-300 mb-4">Offset 100% of your footprint automatically via carbon retirement.</p>
            <button 
              onClick={() => triggerToast("Your virtual carbon retirement module has been updated correctly!")}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold transition-colors text-slate-950 cursor-pointer"
            >
              Manage Offsets
            </button>
          </div>

          <button
            onClick={handleResetWipeAll}
            className="w-full text-[10px] text-slate-400 hover:text-red-500 p-2 rounded-lg border border-slate-200 hover:border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Reset sandbox state"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Sandbox Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header - Sleek style */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Good morning, Mamta
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {dailyFootprint <= 5.0 
                ? `You've saved enough CO2 today to power ${Math.max(12, Math.round((5.0 - dailyFootprint) * 85))} LED bulbs.`
                : "Your daily actions are higher than the Paris threshold today. Try completing an Eco-Quest to reduce impact!"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* UTC Clock Badge */}
            <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-3 py-1.5 text-[11px] font-mono font-medium rounded-full text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {currentTime || "06:04 AM"}
            </span>

            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center font-bold text-xs">M</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black">🌱</div>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-905">{streakDays} Day Streak</p>
                <p className="text-[10px] text-emerald-600 font-bold">+{ecoPoints} XP earned</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Carbon Budget Section - Styled with Paris Accord 1.5C Limits */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Daily Carbon Budget</h3>
                  <p className="text-slate-500 text-sm">Aligned with the Paris Agreement 1.5°C Climate Protection Goal</p>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {dailyFootprint.toFixed(2)} <span className="text-sm text-slate-400 font-medium">/ 5.0 kg Limit</span>
                </span>
              </div>

              {/* Progress Slider */}
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-6 relative border border-slate-100 shadow-inner">
                {/* Paris 5.0 limit target marker bar */}
                <div className="absolute left-[50%] inset-y-0 w-0.5 bg-red-400/80 z-20" title="5kg threshold boundary" />
                
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    dailyFootprint <= 5.0
                      ? "bg-gradient-to-r from-emerald-400 to-blue-500"
                      : "bg-gradient-to-r from-amber-450 to-orange-500"
                  }`} 
                  style={{ width: `${Math.min(100, Math.max(8, budgetPercentage))}%` }}
                ></div>
              </div>

              {/* Breakdown category items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Travel Footprint</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {logs.filter(l=>l.category === 'travel').reduce((s,l)=>s+l.carbonFootprintKg, 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Food & Diet</p>
                  <p className="font-bold text-slate-950 text-lg">
                    {logs.filter(l=>l.category === 'diet').reduce((s,l)=>s+l.carbonFootprintKg, 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Home & Utilities</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {logs.filter(l=>l.category === 'energy').reduce((s,l)=>s+l.carbonFootprintKg, 0).toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden lg:block">
              <svg className="w-32 h-32 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
              </svg>
            </div>
          </section>

          {/* Dynamic Inner Panel View Router */}
          <section className="space-y-6">
            {activeTab === "forest" && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Forest Sink visualizer */}
                  <div className="lg:col-span-8">
                    <CarbonSink
                      forestItems={forestItems}
                      ecoPoints={ecoPoints}
                      onPlantItem={handlePlantItem}
                      dailyFootprint={dailyFootprint}
                    />
                  </div>

                  {/* Personalized daily insights report sidebar */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                          AI Behavior Audits
                        </h3>
                        <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 p-1 px-2.5 rounded-full animate-bounce">
                          LIVE MODEL
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        EcoPulse AI evaluates your logged food and utility events against 1.5°C Paris bounds and drafts optimized offsets.
                      </p>

                      {/* Report Box container */}
                      {report ? (
                        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{report.headline}</h4>
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {report.analysis}
                              </p>
                            </div>
                          </div>

                          {report.practicalTips && report.practicalTips.length > 0 && (
                            <div className="border-t border-slate-200 pt-3 space-y-1.5">
                              <span className="text-[10px] font-black text-indigo-700 flex items-center gap-1 uppercase">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Recommended Carbon Reduction Actions:
                              </span>
                              {report.practicalTips.map((tip, idx) => (
                                <p key={idx} className="text-[11px] text-slate-650 leading-relaxed pl-3 border-l-2 border-indigo-400 text-[10.5px]">
                                  {tip}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-[10.5px] text-slate-700 italic">
                            🌱 {report.creativeComparison}
                          </div>

                          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl mt-3">
                            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest block">
                              Target Quest Recommendation
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 mt-1">{report.suggestedQuest.title}</h5>
                            <p className="text-[10.5px] text-slate-600 mt-0.5 leading-relaxed">{report.suggestedQuest.description}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-indigo-100">
                              <span className="text-[10px] font-bold text-amber-700">+{report.suggestedQuest.points} Coins</span>
                              <button
                                onClick={handleAcceptSuggestedQuest}
                                className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white p-1 px-3 rounded-lg transition-colors cursor-pointer"
                              >
                                Accept Quest
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                          <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold text-slate-500">No report compiled today</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 p-2 leading-relaxed">
                            Log some active transit or dining experiences in your track ledger first, then consult Gemini models below.
                          </p>
                        </div>
                      )}

                      {reportError && (
                        <div className="bg-red-50 text-red-700 border border-red-205 p-3 rounded-xl text-xs flex gap-2 mt-4">
                          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{reportError}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleGenerateDailyReport}
                      disabled={isGeneratingReport || logs.length === 0}
                      className="w-full mt-6 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isGeneratingReport ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Analyzing logs with Gemini API...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4.5 h-4.5" />
                          Generate AI Behavior Report
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            )}

            {activeTab === "logger" && (
              <LogPanel
                logs={logs}
                onAddManualLog={handleAddManualLog}
                onAddAiLogs={handleAddAiLogs}
                onDeleteLog={handleDeleteLog}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}

            {activeTab === "quests" && (
              <QuestList
                quests={quests}
                onStartQuest={handleStartQuest}
                onCompleteQuest={handleCompleteQuest}
                streakDays={streakDays}
              />
            )}

            {activeTab === "coach" && (
              <div className="max-w-4xl mx-auto">
                <CarbonCoach logs={logs} />
              </div>
            )}
          </section>

          {/* Micro-Nudge Highlight - Pulled from reference Design HTML */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
            <span className="text-xl shrink-0 mt-0.5">✨</span>
            <div>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Personalized Sustainability Insight</p>
              <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                "Switching to almond or oat milk instead of standard bovine dairy is single-handedly one of the highest leverage daily food behaviors. It immediately reduces your milk/beverage carbon footprint intensity by over <span className="font-bold text-indigo-950">82%</span> this week."
              </p>
            </div>
          </div>

        </div>

        {/* Footer credits and information metrics */}
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 shrink-0">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-600">
              EcoPulse Carbon Awareness Tracker — Formulated with high precision emissions guidelines.
            </p>
            <p className="max-w-xl mx-auto text-[11px] text-slate-400 leading-normal">
              Utilizing direct greenhouse gas equivalents matching environmental datasets & server-side Gemini 3.5 Models.
            </p>
            <div className="flex justify-center gap-4 text-[11px] font-bold text-slate-500 pt-3">
              <span>Paris individual budget: 5.0kg CO2/day</span>
              <span>•</span>
              <span>Active Forest Plants: {forestItems.length}</span>
              <span>•</span>
              <span>Off-Grid energy devices: {forestItems.filter(i=>i.type === 'solar' || i.type === 'wind').length}</span>
            </div>
          </div>
        </footer>

      </main>

    </div>
  );
}
