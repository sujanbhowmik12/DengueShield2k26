# DengueShield

DengueShield is an educational dengue surveillance dashboard. Choose a city or use your current location to review the latest available public dengue reports, recent WHO dengue outbreak notices, local environmental context, a map, and practical prevention and symptom guidance. Info buttons explain dashboard terms. It opens without a selected city.

The environmental suitability score is an illustrative heuristic. It is not a dengue test, a prediction of cases, an individual infection probability, or an official public-health alert. Public case coverage varies by place and time; unavailable reports do not mean zero cases.

## Start the app

Requirements: Node.js 20.9 or later.

```powershell
npm install
$env:GEMINI_API_KEY="your-server-side-key" # Optional; enables live spoken answers
npm run dev
```

Open `http://localhost:3000`. Location search, climate context, public dengue records, and the map do not need an AI key. Live voice conversation uses Gemini Live and requires `GEMINI_API_KEY`. The server returns a single-use, short-lived token to the browser for its WebSocket session; the long-lived key remains server-side. Gemini Live detects supported spoken languages automatically. Never place the key in client-side code.

## Main project files

- `app/page.js`: dashboard, location search, public case lookup, weather context, keyless map, simulator, and voice-only overlay.
- `app/globals.css`: responsive bento layout, light/dark themes, and motion styles.
- `app/api/cases/route.js`: selected-country case feed.
- `app/api/alerts/route.js`: recent country-matched dengue notices from the WHO Disease Outbreak News hub.
- `app/api/voice-token/route.js`: creates a short-lived Gemini Live token with dengue-only session instructions.
- `app/layout.js`: Next.js root layout and metadata.
- `package.json`: Next.js app scripts and dependencies.
- `PROJECT_REPORT.md`: interdisciplinary project report, data limitations, and validation plan.

## Data sources

- Near-real-time dengue case reports and nowcasts: [Global Dengue Observatory](https://globaldengueobservatory.org/pages/data.html), which combines updates from WHO global and regional dashboards and PAHO. Its feed is monthly and country-level. For India, the app also checks the official [NCVBDC state/UT table](https://ncvbdc.mohfw.gov.in/index4.php?Background=Dark&font=Normal&lang=1&level=0&lid=+3715&linkid=431&theme=Blue) and shows a regional current-year total when that region has a numeric entry. This is state/UT context, not a city count, and the source's own reporting cutoff is displayed. Missing subnational figures are not inferred. Reported, nowcast, and backfilled country records are distinguished.
- Historical reported dengue counts: [OpenDengue](https://opendengue.org/data), a harmonized historical compilation of public case-surveillance data.
- Weather, historical climate, location search, and elevation: [Open-Meteo](https://open-meteo.com/).
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/), rendered with Leaflet using the public standard tile service and no application API key.
- General prevention and symptom education: World Health Organization resources.

The Global Dengue Observatory pipeline checks its underlying sources daily, but official reporting is monthly and can lag. Nowcast and backfilled values are estimates and are labeled as such. Case counts do not represent all infections. Missing data are not replaced with synthetic values.

## Voice conversation

The dashboard provides a full-screen, voice-only conversation using Gemini Live. Microphone audio is sent to Gemini for real-time speech-to-speech interaction. The API token is restricted to the dengue assistant session and expires; its server key remains private. The assistant is instructed to answer only dengue, symptoms and warning signs, general dengue diagnostic/testing information, prevention, and the dashboard's location data. It can explain whether described symptoms can occur with dengue, flag urgent warning signs, and recommend clinical assessment; it must not diagnose individuals, assign personal odds, or interpret personal lab results. Gemini Live automatically detects supported languages. Microphone and network access are required; Gemini usage may incur charges.

The WHO notice panel is a country-matched lookup, not an exhaustive or real-time alert service. WHO says its Disease Outbreak News list is not exhaustive. Check local health authorities for current local alerts; no matching WHO notice does not prove no outbreak exists.

## Development

```powershell
npm run dev
npm run build
npm start
```

The environmental index weights and thresholds are illustrative and have not been calibrated against location-aligned case series. Any future predictive claim requires a defined target and time horizon, source-aligned training data, a seasonal baseline, chronological held-out validation, and documented error and calibration results.
