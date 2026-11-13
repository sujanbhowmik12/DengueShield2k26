export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_URL = "https://globaldengueobservatory.org/pages/www/global_dengue_data.csv";
const INDIA_STATE_URL = "https://ncvbdc.mohfw.gov.in/index4.php?Background=Dark&font=Normal&lang=1&level=0&lid=+3715&linkid=431&theme=Blue";
const normalize = value => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const stateAliases = new Map([
  ["andaman and nicobar islands", ["a and n island", "andaman and nicobar islands"]],
  ["andhra pradesh", ["andhra pradesh"]],
  ["chhattisgarh", ["chhattisgarh", "chatisgarh"]],
  ["dadra and nagar haveli and daman and diu", ["d and n haveli", "daman and diu"]],
  ["jammu and kashmir", ["j and k", "jammu and kashmir"]],
  ["uttarakhand", ["uttarakhand", "uttrakhand"]],
  ["west bengal", ["west bengal"]],
  ["puducherry", ["puducherry", "puduchery"]],
]);

function parseIndiaStateRecord(html, requestedState) {
  const wanted = normalize(requestedState);
  if (!wanted) return null;
  const aliases = stateAliases.get(wanted) || [wanted];
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(match =>
    [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell =>
      cell[1].replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim()
    )
  );
  const header = rows.find(cells => cells.some(value => normalize(value).includes("affected states")) && cells.some(value => /\b20\d{2}/.test(value)));
  const years = [...new Set((header || []).flatMap(value => [...value.matchAll(/\b(20\d{2})\s*\*?/g)].map(match => Number(match[1]))))].sort((a, b) => a - b);
  const reportingYear = years.at(-1);
  if (!reportingYear) return null;

  const matched = rows.map(cells => ({
    cells,
    stateIndex: aliases.includes(normalize(cells[1])) ? 1 : aliases.includes(normalize(cells[0])) ? 0 : -1,
  })).find(row => row.stateIndex >= 0);
  if (!matched) return null;
  const yearIndex = years.indexOf(reportingYear);
  const rawCases = matched.cells[matched.stateIndex + 1 + yearIndex * 2]?.replace(/,/g, "").trim();
  if (!rawCases || !/^\d+$/.test(rawCases)) return null;

  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ");
  const footnote = text.match(/Provisional\s+till\s+([\w.\s,]{3,50}?)(?=\s+C\s*=\s*Cases|\s+Updated\s+On\s*:|$)/i)?.[1]?.trim().replace(/[.\s]+$/, "") || "reporting period not stated";
  const pageUpdated = text.match(/Updated\s+On\s*:\s*([^\n]{3,50}?)(?:Hosted|$)/i)?.[1]?.trim() || null;
  return {
    cases: Number(rawCases),
    year: reportingYear,
    status: "Observed",
    scope: "state/UT",
    location: matched.cells[matched.stateIndex].replace(/\*$/, "").trim(),
    period: `provisional through ${footnote}`,
    source: "NCVBDC, Government of India",
    sourceUrl: INDIA_STATE_URL,
    sourceUpdated: pageUpdated,
  };
}

async function indiaStateFallback(state) {
  if (!state) return null;
  try {
    const response = await fetch(INDIA_STATE_URL, { next: { revalidate: 21600 }, headers: { Accept: "text/html" }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const html = await response.text();
    return parseIndiaStateRecord(html, state);
  } catch {
    return null;
  }
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const country = params.get("country")?.trim();
  const state = params.get("state")?.trim();
  if (!country || country.length > 100) return Response.json({ error: "Choose a location with a country." }, { status: 400 });

  try {
    const response = await fetch(DATA_URL, { next: { revalidate: 900 }, headers: { Accept: "text/csv" }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("The global dengue data feed is unavailable.");
    const csv = await response.text();
    const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("The global dengue data feed returned no records.");
    const headers = parseCsvLine(lines[0]).map(value => normalize(value));
    const col = name => headers.indexOf(normalize(name));
    const index = { country: col("Country"), year: col("Year"), month: col("Month"), cases: col("cases"), status: col("Data_status"), source: col("source"), ytd: col("cum_todate_cases_year") };
    if (Object.values(index).some(value => value < 0)) throw new Error("The global dengue data feed format has changed.");

    const wanted = normalize(country);
    const aliases = wanted === "united states" ? [wanted, "united states of america"] : wanted === "south korea" ? [wanted, "republic of korea"] : wanted === "north korea" ? [wanted, "democratic peoples republic of korea"] : [wanted];
    const byMonth = new Map();
    const statusRank = { observed: 3, nowcast: 2, backfilled: 1 };
    for (const line of lines.slice(1)) {
      const cells = parseCsvLine(line);
      if (!aliases.includes(normalize(cells[index.country]))) continue;
      const year = Number(cells[index.year]), month = Number(cells[index.month]), cases = Number(cells[index.cases]);
      const status = String(cells[index.status] || "").trim();
      if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isFinite(cases)) continue;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const ytdText = String(cells[index.ytd] || "").trim();
      const row = { year, month, cases, status, source: String(cells[index.source] || "Public health surveillance").trim(), ytd: ytdText && Number.isFinite(Number(ytdText)) ? Number(ytdText) : null };
      if (!byMonth.has(key) || (statusRank[normalize(status)] || 0) > (statusRank[normalize(byMonth.get(key).status)] || 0)) byMonth.set(key, row);
    }

    const current = new Date();
    let rows = [...byMonth.values()].filter(row => row.year < current.getFullYear() || (row.year === current.getFullYear() && row.month <= current.getMonth() + 1));
    const regional = normalize(country) === "india" ? await indiaStateFallback(state) : null;
    if (!rows.length) return Response.json({ country, rows: [], latest: null, regional, scope: regional?.scope || "country", sourceUrl: "https://globaldengueobservatory.org/pages/data.html" });
    rows.sort((a, b) => a.year - b.year || a.month - b.month);
    const latest = rows.at(-1);
    const recent = rows.slice(-12);
    const dateLabel = row => new Date(Date.UTC(row.year, row.month - 1, 1)).toLocaleString("en", { month: "long", year: "numeric", timeZone: "UTC" });
    return Response.json({
      country,
      scope: "country",
      regional,
      latest: { ...latest, period: dateLabel(latest) },
      rows: recent.map(row => ({ ...row, period: dateLabel(row) })),
      sourceUrl: "https://globaldengueobservatory.org/pages/data.html",
      checkedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = /fetch failed|timeout|network|socket/i.test(error.message || "")
      ? "The near-real-time dengue data feed could not be reached. Please try again later."
      : error.message || "Current dengue surveillance data could not be loaded.";
    return Response.json({ error: message }, { status: 502 });
  }
}
