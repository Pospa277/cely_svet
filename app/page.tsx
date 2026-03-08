"use client";

import { useState } from "react";
import { TravelAnalysis } from "@/lib/gemini-analysis";
import { NewsItem } from "@/lib/fetch-news";

const SAFETY_CONFIG = {
  safe: {
    color: "bg-green-500",
    ring: "ring-green-400",
    text: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    label: "BEZPEČNÉ",
    emoji: "🟢",
  },
  caution: {
    color: "bg-yellow-400",
    ring: "ring-yellow-400",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    label: "OPATRNOST",
    emoji: "🟡",
  },
  danger: {
    color: "bg-red-500",
    ring: "ring-red-400",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "NEBEZPEČNÉ",
    emoji: "🔴",
  },
};

const EXAMPLE_DESTINATIONS = [
  "Thajsko", "Izrael", "Egypt", "Japonsko", "Mexiko", "Indie", "Turecko", "Dubaj"
];

export default function Home() {
  const [country, setCountry] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<TravelAnalysis | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!country.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setNews([]);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: country.trim(), apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Neočekávaná chyba.");
      } else {
        setAnalysis(data.analysis);
        setNews(data.news ?? []);
      }
    } catch {
      setError("Nelze se připojit k serveru.");
    } finally {
      setLoading(false);
    }
  }

  const cfg = analysis ? SAFETY_CONFIG[analysis.safetyLevel] : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-700/50 rounded-full px-4 py-1.5 text-sm text-slate-300 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
            Poháněno Gemini AI · RSS zpravodajství v reálném čase
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Cestovní<span className="text-blue-400"> Zpravodaj</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Okamžitá AI analýza bezpečnosti vaší destinace
          </p>
        </div>

        {/* Search form */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Destinace
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="např. Thajsko, Izrael, New York…"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_DESTINATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCountry(d)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full px-3 py-1 transition"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Gemini API klíč{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs ml-1"
                >
                  (získat zdarma →)
                </a>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza…"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
              />
              <p className="text-xs text-slate-500 mt-1">
                Klíč se neukládá — odesílá se přímo k Gemini API.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !country.trim() || !apiKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl px-6 py-3.5 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzuji zprávy…
                </>
              ) : (
                "Analyzovat destinaci"
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl px-5 py-4 text-red-300 mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {analysis && cfg && (
          <div className="space-y-5">

            {/* Safety score card */}
            <div className={`rounded-2xl p-6 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl ${cfg.color} flex items-center justify-center text-white font-bold text-2xl ring-4 ${cfg.ring} ring-offset-2 ring-offset-white shrink-0`}>
                  {analysis.safetyScore}/10
                </div>
                <div>
                  <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${cfg.text}`}>
                    {cfg.emoji} {cfg.label}
                  </div>
                  <h2 className={`text-xl font-bold ${cfg.text}`}>{analysis.headline}</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Analyzováno {analysis.sourcesUsed} zpráv · {new Date().toLocaleDateString("cs-CZ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <span>📋</span> Situace
              </h3>
              <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-950/40 rounded-2xl p-5 border border-red-900/40">
                <h3 className="font-semibold text-red-400 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>⚠️</span> Rizika
                </h3>
                <ul className="space-y-2">
                  {analysis.threats.map((t, i) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-2">
                      <span className="text-red-400 mt-0.5 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-950/40 rounded-2xl p-5 border border-blue-900/40">
                <h3 className="font-semibold text-blue-400 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>✅</span> Doporučení
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-2">
                      <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-950/40 rounded-2xl p-5 border border-green-900/40">
                <h3 className="font-semibold text-green-400 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>👍</span> Pozitiva
                </h3>
                <ul className="space-y-2">
                  {analysis.positives.map((p, i) => (
                    <li key={i} className="text-slate-300 text-sm flex gap-2">
                      <span className="text-green-400 mt-0.5 shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* News sources */}
            {news.length > 0 && (
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <span>📰</span> Použité zprávy ({news.length})
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {news.map((item, i) => (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-slate-900/60 rounded-xl p-3 hover:bg-slate-700/60 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 font-medium line-clamp-2">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {item.source}
                            {item.pubDate && (
                              <> · {new Date(item.pubDate).toLocaleDateString("cs-CZ")}</>
                            )}
                          </p>
                        </div>
                        <span className="text-slate-500 text-xs mt-0.5 shrink-0">↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-10">
          Data z RSS feedů · AI analýza přes Google Gemini · Slouží jako orientační informace
        </p>
      </div>
    </main>
  );
}
