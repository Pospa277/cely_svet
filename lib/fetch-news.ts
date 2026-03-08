import Parser from "rss-parser";
import { FeedSource } from "./rss-feeds";

export interface NewsItem {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
}

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "CestovniZpravodaj/1.0 (+https://cesty.vercel.app)",
  },
});

function isRelevant(text: string, country: string): boolean {
  const countryLower = country.toLowerCase();
  const textLower = text.toLowerCase();

  // Country name variations
  const variants: string[] = [countryLower];

  const map: Record<string, string[]> = {
    ukraine: ["ukraine", "ukrainian", "kyiv", "kiev", "ukraina"],
    russia: ["russia", "russian", "moscow", "moskva"],
    israel: ["israel", "israeli", "gaza", "tel aviv", "jerusalem"],
    usa: ["united states", "america", "american", "washington", "new york", "u.s."],
    "united states": ["united states", "america", "american", "washington", "u.s."],
    china: ["china", "chinese", "beijing", "shanghai"],
    germany: ["germany", "german", "berlin"],
    france: ["france", "french", "paris"],
    thailand: ["thailand", "thai", "bangkok"],
    india: ["india", "indian", "delhi", "mumbai"],
    japan: ["japan", "japanese", "tokyo"],
    turkey: ["turkey", "turkish", "ankara", "istanbul", "türkiye"],
    egypt: ["egypt", "egyptian", "cairo"],
    mexico: ["mexico", "mexican"],
    "middle east": ["middle east", "arab", "saudi", "dubai", "uae"],
    dubaj: ["dubai", "uae", "united arab emirates", "emirates"],
    "emiráty": ["dubai", "uae", "united arab emirates", "emirates"],
  };

  for (const [key, vals] of Object.entries(map)) {
    if (countryLower.includes(key) || key.includes(countryLower)) {
      variants.push(...vals);
    }
  }

  return variants.some((v) => textLower.includes(v));
}

export async function fetchNewsForCountry(country: string, feeds: FeedSource[]): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items.slice(0, 20)) {
          const title = item.title ?? "";
          const summary = item.contentSnippet ?? item.summary ?? item.content ?? "";
          const combined = `${title} ${summary}`;

          if (isRelevant(combined, country)) {
            results.push({
              title,
              summary: summary.slice(0, 500),
              link: item.link ?? "",
              pubDate: item.pubDate ?? item.isoDate ?? "",
              source: feed.name,
            });
          }
        }
      } catch {
        // silently skip unavailable feeds
      }
    })
  );

  // Sort by date descending
  return results.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });
}
