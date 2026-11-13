export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WHO_DON_API = "https://www.who.int/api/hubs/diseaseoutbreaknews";
const WHO_DON_HOME = "https://www.who.int/emergencies/disease-outbreak-news";
const DAY = 86400000;

function cleanText(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim();
}

function countryAliases(country) {
  const aliases = {
    "united states": ["united states", "usa", "united states of america"],
    "united kingdom": ["united kingdom", "uk", "britain"],
    "south korea": ["south korea", "republic of korea"],
    "north korea": ["north korea", "dpr korea"],
    "iran": ["iran", "islamic republic of iran"],
    "viet nam": ["viet nam", "vietnam"],
    "lao people's democratic republic": ["lao people's democratic republic", "laos"],
    "democratic republic of the congo": ["democratic republic of the congo", "dr congo", "drc"],
    "the gambia": ["the gambia", "gambia"],
    "côte d’ivoire": ["cote d'ivoire", "côte d'ivoire", "ivory coast"],
  };
  const normalized = cleanText(country).toLowerCase();
  return aliases[normalized] || [normalized];
}

function hasPhrase(text, phrase) {
  if (!phrase) return false;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(text);
}

function itemUrl(item) {
  const raw = item.ItemDefaultUrl || item.Url || item.UrlName || item.url || "";
  if (/^https:\/\//i.test(raw)) return raw;
  const cleaned = cleanText(raw);
  if (/^\/emergencies\//i.test(cleaned)) return `https://www.who.int${cleaned}`;
  const slug = cleaned.replace(/^\/+|^item\//i, "");
  return slug ? `https://www.who.int/emergencies/disease-outbreak-news/item/${encodeURIComponent(slug)}` : WHO_DON_HOME;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = cleanText(searchParams.get("country")).slice(0, 100);
  if (!country) return Response.json({ notices: [], checkedAt: new Date().toISOString(), status: "Choose a location to check for recent official dengue notices." });

  try {
    const response = await fetch(WHO_DON_API, {
      headers: { Accept: "application/json", "User-Agent": "DengueShield educational dashboard" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`WHO returned ${response.status}`);
    const payload = await response.json();
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload.value) ? payload.value : Array.isArray(payload.Items) ? payload.Items : [];
    const now = Date.now();
    const aliases = countryAliases(country);
    const notices = rows.map(item => {
      const title = cleanText(item.Title || item.title || item.Name);
      const summary = cleanText(item.Summary || item.Overview || item.Description || item.summary).slice(0, 480);
      const context = `${title} ${summary} ${cleanText(item.Assessment)}`;
      const rawDate = item.PublicationDateAndTime || item.PublicationDate || item.DatePublished || item.date;
      const published = rawDate ? new Date(rawDate) : null;
      const age = published && Number.isFinite(published.getTime()) ? now - published.getTime() : Infinity;
      const dateText = published && Number.isFinite(published.getTime()) ? published.toISOString().slice(0, 10) : "Date unavailable";
      const global = /\b(global|worldwide|multiple countries|international spread)\b/i.test(title);
      const relevantCountry = global || aliases.some(alias => hasPhrase(context.toLowerCase(), alias));
      return { title, summary, date: dateText, publishedAt: published?.toISOString(), age, global, relevantCountry, url: itemUrl(item) };
    }).filter(item => item.title && /\bdengue\b/i.test(`${item.title} ${item.summary}`) && item.relevantCountry && item.age >= -DAY && item.age <= 180 * DAY)
      .sort((a, b) => (a.age ?? Infinity) - (b.age ?? Infinity))
      .slice(0, 3)
      .map(({ age, relevantCountry, ...item }) => ({ ...item, country: item.global ? "" : country }));

    return Response.json({ notices, checkedAt: new Date().toISOString(), source: WHO_DON_HOME });
  } catch {
    return Response.json({ error: "Official WHO outbreak notices could not be checked." }, { status: 502 });
  }
}
