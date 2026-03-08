import { NextRequest, NextResponse } from "next/server";
import { getFeedsForCountry } from "@/lib/rss-feeds";
import { fetchNewsForCountry } from "@/lib/fetch-news";
import { analyzeWithGemini } from "@/lib/gemini-analysis";

export async function POST(req: NextRequest) {
  try {
    const { country, apiKey } = await req.json();

    if (!country || typeof country !== "string") {
      return NextResponse.json({ error: "Zadej název destinace." }, { status: 400 });
    }
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "Zadej Gemini API klíč." }, { status: 400 });
    }

    const feeds = getFeedsForCountry(country);
    const news = await fetchNewsForCountry(country, feeds);
    const analysis = await analyzeWithGemini(country, news, apiKey);

    return NextResponse.json({
      analysis,
      news: news.slice(0, 10),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Neznámá chyba";
    // Gemini API errors
    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json({ error: "Neplatný Gemini API klíč." }, { status: 401 });
    }
    return NextResponse.json({ error: `Chyba analýzy: ${message}` }, { status: 500 });
  }
}
