export interface CarbonLog {
  id: string;
  name: string;
  category: "diet" | "travel" | "energy" | "other";
  carbonFootprintKg: number;
  explanation: string;
  comparison: string;
  timestamp: string; // ISO String
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: "diet" | "travel" | "energy";
  points: number;
  status: "available" | "active" | "completed";
  iconName: string;
  actionRequired: string;
}

export interface ForestItem {
  id: string;
  type: "sprout" | "tree" | "flower" | "shrub" | "solar" | "wind" | "cloud";
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  scale: number; // visual scale multiplier
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DailyReport {
  headline: string;
  analysis: string;
  practicalTips: string[];
  creativeComparison: string;
  suggestedQuest: {
    title: string;
    description: string;
    category: "diet" | "travel" | "energy";
    points: number;
  };
}
