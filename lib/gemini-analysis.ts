import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewsItem } from "./fetch-news";

export interface TravelAnalysis {
  safetyScore: number; // 1-10, 10 = nejbezpečnější
  safetyLevel: "safe" | "caution" | "danger";
  headline: string;
  summary: string;
  threats: string[];
  recommendations: string[];
  positives: string[];
  sourcesUsed: number;
}

export async function analyzeWithGemini(
  country: string,
  news: NewsItem[],
  apiKey: string
): Promise<TravelAnalysis> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const newsText = news
    .slice(0, 15)
    .map((n, i) => `[${i + 1}] ${n.source}: ${n.title}\n${n.summary}`)
    .join("\n\n");

  const prompt = `Jsi expertní cestovní zpravodaj. Analyzuj níže uvedené zprávy o destinaci "${country}" a vytvoř strukturovanou bezpečnostní zprávu pro českého turistu.

ZPRÁVY:
${newsText || "Žádné specifické zprávy nebyly nalezeny. Použij obecné znalosti o dané destinaci."}

Odpověz POUZE validním JSON objektem v tomto přesném formátu (bez markdown backticks):
{
  "safetyScore": <číslo 1-10, kde 10 je nejbezpečnější>,
  "headline": "<krátký výstižný nadpis situace v češtině, max 80 znaků>",
  "summary": "<shrnutí bezpečnostní situace pro turisty v češtině, 3-5 vět>",
  "threats": ["<konkrétní riziko 1>", "<konkrétní riziko 2>"],
  "recommendations": ["<doporučení 1>", "<doporučení 2>", "<doporučení 3>"],
  "positives": ["<pozitivní aspekt 1>", "<pozitivní aspekt 2>"]
}

Pravidla:
- Piš výhradně česky
- Buď konkrétní a praktický
- threats: pokud nejsou žádná rizika, vlož ["Žádná závažná rizika identifikována"]
- positives: pokud nejsou pozitiva, vlož ["Standardní turistická destinace"]
- safetyScore: 1-3 = nebezpečné, 4-6 = opatrnost, 7-10 = bezpečné`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip potential markdown code blocks
  const jsonText = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const parsed = JSON.parse(jsonText);

  const score = Math.max(1, Math.min(10, Number(parsed.safetyScore)));
  const safetyLevel: "safe" | "caution" | "danger" =
    score >= 7 ? "safe" : score >= 4 ? "caution" : "danger";

  return {
    safetyScore: score,
    safetyLevel,
    headline: parsed.headline ?? "",
    summary: parsed.summary ?? "",
    threats: Array.isArray(parsed.threats) ? parsed.threats : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    positives: Array.isArray(parsed.positives) ? parsed.positives : [],
    sourcesUsed: news.length,
  };
}
