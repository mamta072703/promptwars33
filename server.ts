import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable JSON body parsing with reasonable limits
app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Ensure API key is present
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets.",
    });
    return;
  }
  next();
};

// 1. API: Parse Activity Description / Scan Receipt text
app.post("/api/analyze-text", checkApiKey, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Missing or invalid 'text' payload." });
      return;
    }

    const prompt = `
      You are an expert Sustainability and Carbon Footprint calculator.
      Analyze the following user input describing their activities, shopping list, meal, energy usage, or transport.
      Calculate the approximate carbon footprint in standard kg CO2 equivalent (CO2e) based on standard emission factors 
      (e.g., beef is ~27-60 kg CO2/kg, flights are ~0.1-0.2 kg CO2 per passenger-km, local gasoline car driving is ~0.2 kg CO2 per km, etc.).
      
      Extract individual items and return the calculations. Be optimistic but scientifically accurate.
      
      User input: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly sustainability analyzer. You parse physical receipts, grocery lists, transport routes, and lifestyle habits into exact carbon footprints using strict scientific consensus databases.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: "Items or activities matching are categorized and given CO2 calculations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Human-friendly label of the item, e.g., '8 oz Beef Steak', '15km Sedan Commute', '3 hours AC usage'." },
                  category: { type: Type.STRING, description: "Must be exactly one of: 'diet', 'travel', 'energy', 'other'." },
                  carbonFootprintKg: { type: Type.NUMBER, description: "Rough footprint in kilograms of CO2e. Always greater than 0; use standard estimation." },
                  explanation: { type: Type.STRING, description: "Brief scientific/lifestyle reason for this value (1 short sentence)." },
                  comparison: { type: Type.STRING, description: "A relatable comparison, e.g., 'Same as charging a smartphone 150 times' or 'Equivalent to leaving a 10W LED on for 5 days'." }
                },
                required: ["name", "category", "carbonFootprintKg", "explanation", "comparison"]
              }
            },
            totalCarbonKg: { type: Type.NUMBER, description: "Subtotal sum of all individual item CO2 contributions." },
            summary: { type: Type.STRING, description: "An encouraging, insightful, non-judgmental one-sentence summary pointing out the greenest aspect or a quick alternative swap next time." }
          },
          required: ["items", "totalCarbonKg", "summary"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("Empty response from AI engine.");
    }

    const parsedData = JSON.parse(dataText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/analyze-text:", error);
    res.status(500).json({ error: error?.message || "An error occurred during parsing." });
  }
});

// 2. API: Get Daily Insight & Eco-Coaching Recommendations
app.post("/api/daily-report", checkApiKey, async (req, res) => {
  try {
    const { logs, activeQuests, streakDays } = req.body;
    // logs is an array of { name: string, category: string, carbonFootprintKg: number }
    const totalToday = logs ? logs.reduce((sum: number, l: any) => sum + (l.carbonFootprintKg || 0), 0) : 0;
    
    const formattedLogs = logs && logs.length > 0 
      ? logs.map((l: any) => `- [${l.category.toUpperCase()}] ${l.name}: ${l.carbonFootprintKg} kg CO2`).join("\n")
      : "No entries logged today yet.";

    const formattedQuests = activeQuests && activeQuests.length > 0
      ? activeQuests.map((q: any) => `- Quest: ${q.title} (${q.status})`).join("\n")
      : "No quests active.";

    const prompt = `
      Analyze the user's carbon footprint for today.
      Total emissions: ${totalToday.toFixed(2)} kg CO2.
      Daily goal (Paris Agreement individual limit): 5.00 kg CO2.
      User's continuous green streak: ${streakDays || 0} days.
      
      User's logs:
      ${formattedLogs}
      
      User's active/completed quests:
      ${formattedQuests}

      Generate a custom, friendly, conversational carbon audit.
      Provide:
      1. A warm greeting and evaluation of how they did relative to the 5.00 kg budget.
      2. 1-2 positive micro-insights based on their food, transit, or energy.
      3. A specific 'Carbon Offset Quest' or daily micro-nudges to reduce their footprint further tomorrow (e.g. 'Can you lower AC by 2 degrees for 2 hours tomorrow?').
      4. A brief, high-vibe sustainability quote.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are EcoPulse Guide, a compassionate carbon coach. You turn dry numbers into inspiring daily summaries that encourage behavioral changes with playful carbon-to-nature equivalents.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "Short motivational title, e.g., 'Splendid Choices today!' or 'Pivoting Towards Conservation'." },
            analysis: { type: Type.STRING, description: "Conversational evaluation of the logged items against the 5kg daily limit (2-3 sentences)." },
            practicalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 custom, hyper-actionable tips based literally on their specific logs."
            },
            creativeComparison: { type: Type.STRING, description: "Visual equivalent of their footprint, e.g., 'Your total footprint equals the oxygen generated by 3 oak trees in 1 week.'" },
            suggestedQuest: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Name of recommended quest." },
                description: { type: Type.STRING, description: "Brief instruction." },
                category: { type: Type.STRING, description: "'diet' | 'travel' | 'energy'" },
                points: { type: Type.NUMBER, description: "Point rewards (e.g. 50-100)" }
              },
              required: ["title", "description", "category", "points"]
            }
          },
          required: ["headline", "analysis", "practicalTips", "creativeComparison", "suggestedQuest"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("Empty response from AI daily report generator.");
    }

    res.json(JSON.parse(dataText.trim()));
  } catch (error: any) {
    console.error("Error in /api/daily-report:", error);
    res.status(500).json({ error: error?.message || "An error occurred during report generation." });
  }
});

// 3. API: Carbon Coach Chat API (Conversational)
app.post("/api/chat", checkApiKey, async (req, res) => {
  try {
    const { messages, logs } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array." });
      return;
    }

    // Prepare system instructions with current user logs to ground advice
    const logsString = logs && logs.length > 0
      ? logs.map((l: any) => `- ${l.name} (${l.category}): ${l.carbonFootprintKg} kg CO2`).join("\n")
      : "No entries logged yet today.";

    const systemInstruction = `
      You are "EcoPulse Coach", an friendly sustainability expert.
      Help the user with questions regarding how to live a low-carbon lifestyle, carbon footprint calculations, and eco-friendly shopping.
      Be extremely practical. Do not talk in vague terms. Suggest specific swaps (e.g., replace beef with roasted chickpeas, take public transport or telecommute, set water heater to 120°F).
      Use gentle, uplifting language. Avoid guilt-tripping. Translate kilograms of CO2 into interactive physical descriptions (e.g., number of trees, smart phone charges, light bulb hours).
      
      Here is the user's current physical journal state for today setup to ground your answers:
      ${logsString}
    `;

    // Map conversation array to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || "I'm drawing an empty carbon footprint right now. Can you ask me that again?";
    res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "An error occurred during chat conversation." });
  }
});

// Serve health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Setup Vite dev server or serve production dist static folder
const startAppServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoPulse Server started on http://localhost:${PORT}`);
  });
};

startAppServer().catch((error) => {
  console.error("Failed to start EcoPulse App Server:", error);
});
