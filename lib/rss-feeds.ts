export interface FeedSource {
  name: string;
  url: string;
  language: string;
  type: "official" | "media";
}

export function getFeedsForCountry(country: string): FeedSource[] {
  const countryLower = country.toLowerCase().trim();

  const globalFeeds: FeedSource[] = [
    {
      name: "MZV ČR – cestovní doporučení",
      url: "https://www.mzv.cz/rss/cestovani.xml",
      language: "cs",
      type: "official",
    },
    {
      name: "US State Department Travel Advisories",
      url: "https://travel.state.gov/_res/rss/TAsTWs.xml",
      language: "en",
      type: "official",
    },
    {
      name: "UK FCDO Travel Advice",
      url: "https://www.gov.uk/foreign-travel-advice.atom",
      language: "en",
      type: "official",
    },
    {
      name: "BBC World News",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      language: "en",
      type: "media",
    },
    {
      name: "Reuters World News",
      url: "https://feeds.reuters.com/reuters/worldNews",
      language: "en",
      type: "media",
    },
    {
      name: "Al Jazeera English",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      language: "en",
      type: "media",
    },
  ];

  // Region-specific feeds
  const regionFeeds: Record<string, FeedSource[]> = {
    ukraine: [
      {
        name: "Kyiv Independent",
        url: "https://kyivindependent.com/feed/",
        language: "en",
        type: "media",
      },
    ],
    russia: [
      {
        name: "Moscow Times",
        url: "https://www.themoscowtimes.com/rss/news",
        language: "en",
        type: "media",
      },
    ],
    china: [
      {
        name: "South China Morning Post",
        url: "https://www.scmp.com/rss/91/feed",
        language: "en",
        type: "media",
      },
    ],
    israel: [
      {
        name: "Haaretz",
        url: "https://www.haaretz.com/srv/haaretz-articles.atom",
        language: "en",
        type: "media",
      },
      {
        name: "Times of Israel",
        url: "https://www.timesofisrael.com/feed/",
        language: "en",
        type: "media",
      },
    ],
    "middle east": [
      {
        name: "Al Arabiya",
        url: "https://english.alarabiya.net/tools/rss.xml",
        language: "en",
        type: "media",
      },
    ],
    usa: [
      {
        name: "AP News",
        url: "https://rsshub.app/apnews/topics/ap-top-news",
        language: "en",
        type: "media",
      },
    ],
    "united states": [
      {
        name: "AP News",
        url: "https://rsshub.app/apnews/topics/ap-top-news",
        language: "en",
        type: "media",
      },
    ],
    germany: [
      {
        name: "Deutsche Welle",
        url: "https://rss.dw.com/rdf/rss-en-all",
        language: "en",
        type: "media",
      },
    ],
    france: [
      {
        name: "France 24",
        url: "https://www.france24.com/en/rss",
        language: "en",
        type: "media",
      },
    ],
    thailand: [
      {
        name: "Bangkok Post",
        url: "https://www.bangkokpost.com/rss/data/topstories.xml",
        language: "en",
        type: "media",
      },
    ],
    india: [
      {
        name: "Times of India",
        url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        language: "en",
        type: "media",
      },
    ],
    japan: [
      {
        name: "Japan Times",
        url: "https://www.japantimes.co.jp/feed/",
        language: "en",
        type: "media",
      },
    ],
    turkey: [
      {
        name: "Daily Sabah",
        url: "https://www.dailysabah.com/rssFeed/push_notifications",
        language: "en",
        type: "media",
      },
    ],
    egypt: [
      {
        name: "Egypt Independent",
        url: "https://egyptindependent.com/feed/",
        language: "en",
        type: "media",
      },
    ],
    mexico: [
      {
        name: "Mexico News Daily",
        url: "https://mexiconewsdaily.com/feed/",
        language: "en",
        type: "media",
      },
    ],
  };

  const extraFeeds: FeedSource[] = [];
  for (const [key, feeds] of Object.entries(regionFeeds)) {
    if (countryLower.includes(key) || key.includes(countryLower)) {
      extraFeeds.push(...feeds);
    }
  }

  return [...globalFeeds, ...extraFeeds];
}
