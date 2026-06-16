import React from "react";
import { Award, CheckCircle2, ChevronRight, Flame, Map, Zap, Calendar, Sparkles } from "lucide-react";
import { Quest } from "../types";

interface QuestListProps {
  quests: Quest[];
  onStartQuest: (id: string) => void;
  onCompleteQuest: (id: string) => void;
  streakDays: number;
}

export default function QuestList({ quests, onStartQuest, onCompleteQuest, streakDays }: QuestListProps) {
  // Determine user title rank from Green Streak counts
  const getStreakTitle = (days: number) => {
    if (days >= 15) return { title: "Paris Steward", color: "text-indigo-600 bg-indigo-50", badge: "👑" };
    if (days >= 7) return { title: "Carbon Neutral Champion", color: "text-emerald-700 bg-emerald-50", badge: "🌿" };
    if (days >= 3) return { title: "Eco Warrior", color: "text-teal-700 bg-teal-50", badge: "🔥" };
    return { title: "Eco Initiate", color: "text-amber-700 bg-amber-50", badge: "🌱" };
  };

  const streakRank = getStreakTitle(streakDays);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* Streak Dashboard column */}
      <div className="md:col-span-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              Green Habit Streak
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${streakRank.color}`}>
              {streakRank.badge} {streakRank.title}
            </span>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100 animate-pulse">
              <Flame className="w-7 h-7 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-none">
                {streakDays} Day{streakDays !== 1 ? "s" : ""}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Under strict Paris 5kg/day carbon budget</p>
            </div>
          </div>

          <p className="text-xs text-gray-550 leading-relaxed border-t border-gray-50 pt-3">
            Every continuous day you log actions below 5.0 kg of CO2, your Green Streak ticks up. High streaks grant double Eco Coins for seed purchases!
          </p>
        </div>

        {/* Streak rewards meter */}
        <div className="mt-5 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
            <span>Next Reward: Sprout Booster</span>
            <span>{streakDays}/7 days</span>
          </div>
          <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (streakDays / 7) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-emerald-600 mt-1">Unlock rare solar panels and wind turbines on step 7.</p>
        </div>
      </div>

      {/* Available/Active Quests column */}
      <div className="md:col-span-8 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-100" />
            Sustainable Eco-Quests
          </h3>
          <span className="text-xs text-gray-500 font-medium">Earn Eco Coins & Grow Forest nodes</span>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {quests.map((quest) => {
            const isCompleted = quest.status === "completed";
            const isActive = quest.status === "active";

            return (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? "bg-gray-50/70 border-gray-150 opacity-80"
                    : isActive
                    ? "bg-emerald-50/30 border-emerald-200 shadow-sm"
                    : "bg-white border-gray-150 hover:border-gray-305"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category icon tag */}
                  <span className="p-2.5 rounded-lg bg-gray-105 text-gray-600 shrink-0 text-xs">
                    {quest.category === "diet" && "🍱"}
                    {quest.category === "travel" && "🚲"}
                    {quest.category === "energy" && "💡"}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-gray-900">{quest.title}</h4>
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 rounded px-1.5 py-0.2 shrink-0">
                        +{quest.points} Coins
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{quest.description}</p>
                    <p className="text-[10px] text-indigo-600 font-medium mt-1">Action: {quest.actionRequired}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isCompleted ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 p-1 bg-emerald-50 rounded-lg px-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Completed
                    </span>
                  ) : isActive ? (
                    <button
                      onClick={() => onCompleteQuest(quest.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Complete Quest
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartQuest(quest.id)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center"
                    >
                      Accept Quest
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
