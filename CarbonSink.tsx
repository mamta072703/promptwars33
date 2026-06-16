import React from "react";
import { Sprout, Sun, Wind, Cloud, Sparkles, HelpCircle } from "lucide-react";
import { ForestItem } from "../types";

interface CarbonSinkProps {
  forestItems: ForestItem[];
  ecoPoints: number;
  onPlantItem?: (type: ForestItem["type"]) => void;
  dailyFootprint: number;
}

export default function CarbonSink({ forestItems, ecoPoints, onPlantItem, dailyFootprint }: CarbonSinkProps) {
  // Cost matrix for purchasing items with ecoPoints
  const costs: Record<ForestItem["type"], number> = {
    sprout: 20,
    flower: 45,
    shrub: 60,
    tree: 100,
    solar: 150,
    wind: 200,
    cloud: 30,
  };

  const budgetProgress = dailyFootprint / 5.0; // Paris limit is 5.0kg
  const environmentalHealth = Math.max(0, 100 - Math.round(budgetProgress * 100));

  // Determine the sky/landscape grade based on carbon impact
  const landscapeColor =
    dailyFootprint <= 5.0
      ? "from-emerald-50 via-teal-50 to-sky-100" // healthy - clean
      : dailyFootprint <= 12.0
      ? "from-amber-50 to-orange-100" // medium - haze
      : "from-zinc-100 to-slate-200"; // high carbon - smoggy grey

  return (
    <div id="carbon-sink-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header bar with Green Coins & Environmental Health index */}
      <div className="p-5 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="p-1 px-2 rounded-lg bg-emerald-50 text-emerald-600 text-sm">Understand & Visualize</span>
            Carbon Sink Forest
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Unlock trees, flora, and clean energy generators to build a carbon-capturing refuge.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100/60 px-3 py-1.5 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white font-black text-xs shadow-sm animate-pulse">
              e
            </div>
            <div className="text-right">
              <div className="text-[10px] text-amber-700 font-medium leading-none">ECO COINS</div>
              <div className="text-sm font-bold text-amber-900">{ecoPoints}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/60 px-3 py-1.5 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] text-emerald-700 font-medium leading-none">BIOME HEALTH</div>
              <div className="text-sm font-bold text-emerald-900">{environmentalHealth}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className={`relative flex-1 min-h-[340px] bg-gradient-to-b ${landscapeColor} transition-colors duration-700 overflow-hidden relative`}>
        {/* Sky Elements - Clouds */}
        <div className="absolute top-6 left-6 opacity-30 animate-pulse duration-[8000ms]">
          <Cloud className="w-12 h-12 text-white fill-white" />
        </div>
        <div className="absolute top-12 right-12 opacity-20 animate-pulse duration-[12000ms]">
          <Cloud className="w-16 h-16 text-white fill-white" />
        </div>

        {/* Smog visualizer for high carbon */}
        {dailyFootprint > 12 && (
          <div className="absolute inset-0 bg-slate-800/10 backdrop-blur-[0.5px] pointer-events-none transition-all duration-500 flex items-center justify-center">
            <div className="bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Smog Alert: Reduce Travel or AC Today
            </div>
          </div>
        )}

        {/* Land layer */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-[100px] transform translate-y-10 scale-x-110 shadow-inner" />
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-teal-600/80 to-emerald-500/80 rounded-t-[80px] transform translate-y-6 scale-x-125" />

        {/* Interactive instructions when empty */}
        {forestItems.length === 0 ? (
          <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
            <div className="p-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-sm max-w-xs pointer-events-auto">
              <Sprout className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
              <h4 className="text-xs font-semibold text-gray-800">Your Biome is Sparse!</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Complete quests or log carbon-saving events to earn Eco Coins, then plant your first sprout below!
              </p>
            </div>
          </div>
        ) : (
          /* Render forest items */
          forestItems.map((item) => {
            return (
              <div
                key={item.id}
                style={{
                  left: `${item.x}%`,
                  bottom: `${item.y}%`,
                  transform: `translate(-50%, 50%) scale(${item.scale})`,
                }}
                className="absolute z-10 transition-transform duration-300 hover:scale-125 group cursor-pointer"
              >
                {/* SVG/Icon representations of ecosystem elements */}
                <div className="relative">
                  {item.type === "sprout" && (
                    <div className="text-emerald-300 drop-shadow-md">
                      <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0L7 10m5-5l5 5" />
                      </svg>
                      <Sprout className="w-5 h-5 text-emerald-600 absolute bottom-0 left-1.5 animate-bounce" />
                    </div>
                  )}

                  {item.type === "flower" && (
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-pink-400 border-2 border-white animate-spin duration-[10000ms] shadow-sm" />
                      <div className="w-1.5 h-4 bg-emerald-500 rounded" />
                    </div>
                  )}

                  {item.type === "shrub" && (
                    <div className="w-7 h-5 bg-teal-500 rounded-full border-2 border-emerald-400 drop-shadow flex items-center justify-center text-[8px] text-teal-100 font-bold">
                      ♣
                    </div>
                  )}

                  {item.type === "cloud" && (
                    <Cloud className="w-9 h-6 text-white drop-shadow-sm fill-sky-50" />
                  )}

                  {item.type === "tree" && (
                    <div className="flex flex-col items-center drop-shadow-lg">
                      <div className="relative">
                        <div className="w-10 h-10 bg-emerald-700 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-200 text-xs font-semibold select-none">
                          🌳
                        </div>
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white" />
                      </div>
                      <div className="w-2.5 h-6 bg-amber-800 rounded-b shadow-sm" />
                    </div>
                  )}

                  {item.type === "solar" && (
                    <div className="flex flex-col items-center drop-shadow-md">
                      <div className="w-8 h-6 bg-slate-800 rounded border-2 border-slate-500 grid grid-cols-3 grid-rows-2 gap-[1px] p-[1px] rotate-[10deg]">
                        <div className="bg-sky-400" />
                        <div className="bg-sky-400" />
                        <div className="bg-sky-400" />
                        <div className="bg-sky-400" />
                        <div className="bg-sky-400" />
                        <div className="bg-sky-400" />
                      </div>
                      <div className="w-1 h-5 bg-slate-400" />
                    </div>
                  )}

                  {item.type === "wind" && (
                    <div className="flex flex-col items-center drop-shadow-md">
                      <div className="relative w-8 h-8 animate-spin duration-[2000ms]">
                        <Wind className="w-8 h-8 text-sky-100" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        </div>
                      </div>
                      <div className="w-1 h-8 bg-zinc-300" />
                    </div>
                  )}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                    <span className="capitalize">{item.type}</span> Biome Node
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Shopper/Ecosystem builder controls */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold text-gray-700 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Ecosystem Seed Shop
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
            Under 5kg = Earn 1.5x Coins
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(costs).map(([type, price]) => {
            const isAffordable = ecoPoints >= price;
            return (
              <button
                key={type}
                onClick={() => isAffordable && onPlantItem && onPlantItem(type as ForestItem["type"])}
                disabled={!isAffordable}
                className={`p-2 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                  isAffordable
                    ? "bg-white border-gray-200 hover:border-emerald-500 hover:shadow-sm active:scale-95 cursor-pointer text-gray-800"
                    : "bg-gray-100/50 border-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="text-xs capitalize font-medium">{type}</div>
                <div className="my-1.5">
                  {type === "sprout" && <Sprout className="w-4 h-4 text-emerald-500" />}
                  {type === "flower" && <Sparkles className="w-4 h-4 text-pink-500" />}
                  {type === "shrub" && <span className="text-xs text-teal-600">♣</span>}
                  {type === "tree" && <span className="text-xs">🌳</span>}
                  {type === "solar" && <Sun className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '40s' }} />}
                  {type === "wind" && <Wind className="w-4 h-4 text-sky-400" />}
                  {type === "cloud" && <Cloud className="w-4 h-4 text-slate-400" />}
                </div>
                <div className={`text-[10px] font-bold ${isAffordable ? "text-amber-600" : "text-gray-400"}`}>
                  {price} EC
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
