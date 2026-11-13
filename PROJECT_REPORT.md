# DengueShield — Interdisciplinary Project Report

**Project type:** Semester interdisciplinary project (3 credits)  
**Disciplines:** Software engineering, biomedical/public-health context, climate science, data visualization, and human-computer interaction  
**Application:** Next.js App Router dashboard  
**Status:** Educational prototype. It is not a clinical decision tool or official surveillance system.

## 1. Project purpose

DengueShield is a location-based dengue surveillance explorer. Its primary panel presents the latest public country-level monthly dengue reports and estimates available for the selected place's country. Supporting panels show local weather and environmental context, a map, a climate-suitability heuristic, prevention/symptom guidance, and a live voice-only conversation.

The interdisciplinary engineering question is: **How can incomplete public-health reports and environmental context be presented together without suggesting that they diagnose dengue or predict a particular person's infection?** DengueShield does not diagnose dengue or estimate individual infection probability. It now checks for recent WHO outbreak notices and presents matching source documents; this is a notice lookup, not a comprehensive alerting service.

## 2. User workflow and interface

The responsive bento dashboard opens without a selected city. A user searches for a location, selects a geocoding result, or requests browser geolocation. The app then queries the public dengue feed and recent WHO Disease Outbreak News for the selected country, and loads location-specific weather, elevation, and map data. Case, notice, and climate data can complete independently. Loading states, reporting periods, geographic scope, source links, and data status are shown in the interface. Info buttons open short explanations for the dashboard cards and individual weather readings.

The reported dengue card leads the dashboard. Climate conditions and the educational index are labeled as supporting context. Light and dark themes are available. The prior intro video and frame asset were removed. The guidance panel links to WHO dengue resources. The voice assistant opens a full-screen, voice-only screen with a floating oval indicator; it contains no text input or transcript.

## 3. Interdisciplinary contribution

| Discipline | Contribution |
| --- | --- |
| Biomedical science and public health | Dengue transmission context, case surveillance interpretation, prevention information, symptom and warning-sign guidance |
| Climate and environmental science | Temperature, relative humidity, precipitation, and elevation as supporting context |
| Software engineering | Next.js App Router, React state, external data routes, live WebSocket audio, and secure short-lived token handling |
| Data science | Missing-data handling, explicit reported/estimated labels, source granularity, and a proposed validation plan |
| Human-computer interaction | First-use search, responsive bento layout, theme support, status feedback, accessible controls, and voice-only interaction |

## 4. Current dengue data

After a place is selected, `/api/cases` retrieves the Global Dengue Observatory's downloadable data feed and filters it to the selected country. The dashboard displays the latest available monthly value, reporting period, source, country-level scope, and a recent monthly trend. Rows labeled **Observed** are reported values; **Nowcast** and **Backfilled** values are modeled estimates. These labels are preserved in the UI and chart tooltips.

The Global Dengue Observatory says its automated pipeline checks WHO global, WHO regional, and PAHO dashboards daily, then combines the inputs into a monthly country view ([methodology](https://globaldengueobservatory.org/pages/methods.html), [data download](https://globaldengueobservatory.org/pages/data.html)). Its update cycle is near-real-time at the data pipeline level, not real-time clinical surveillance. Government reporting has delays and differing intervals. The primary feed has country/month granularity, so a search for Kolkata displays India's country-level figure, not a Kolkata figure. The app states this on the case card.

For India, the route also checks the [National Center for Vector Borne Diseases Control (NCVBDC)](https://ncvbdc.mohfw.gov.in/index4.php?Background=Dark&font=Normal&lang=1&level=0&lid=+3715&linkid=431&theme=Blue) state/UT table. When the selected geocoding result includes an administrative region and NCVBDC publishes a numeric current-year entry for it, the card displays that official regional count alongside the newer country-month context. The regional value is labeled with the source's provisional reporting cutoff and page update date. If the table has a dash, a missing row, or cannot be reached, no number is invented and only the country-level feed is shown. The source table is state/UT granularity, not city/district granularity; it does not provide a numeric 2026 row for every state (West Bengal is currently one example). This makes it a geographically closer supplemental statistic where available, not a universal city-level live feed.

Unavailable data remain unavailable; the page does not convert a missing row into zero. Public case counts are not a complete estimate of all infections and should not be directly compared across countries without checking source definitions and reporting coverage. [OpenDengue](https://opendengue.org/data) is referenced as a historical public case compilation but is not the current feed in this implementation.

## 5. Environmental context and heuristic

Open-Meteo Geocoding resolves typed locations. Open-Meteo Forecast supplies current two-metre temperature and relative humidity. Historical Weather provides recent daily mean temperature, mean relative humidity, and precipitation. Open-Meteo Elevation supplies the elevation input. Incomplete responses do not receive sample-value substitutes. Coordinates are used in the browser for weather and map requests, not included in Gemini context.

The educational environmental-suitability score uses:

`Index (%) = S_T × (0.35 + 0.65 × S_H) × S_R × S_E × 100`

| Factor | Current rule |
| --- | --- |
| Temperature `S_T` | 0 below 13°C; ramps to 0.7 between 13–22°C; 1 from 22–32°C; declines toward a 0.05 floor from 32–40°C; 0.05 above 40°C |
| Relative humidity `S_H` | 0.15 below 35%; rises to 0.60 by 60%; rises to 1.0 by 85%; 1.0 above 85% |
| 30-day rainfall `S_R` | 0.20 below 15 mm; ramps to 1.0 from 15–80 mm; stays 1.0 through 250 mm; declines to 0.40 from 250–450 mm; 0.40 above 450 mm |
| Elevation `S_E` | 1.0 through 800 m; falls linearly to zero by 2200 m; zero above 2200 m |

The resulting Low, Moderate, High, and Critical bands are demonstration groupings only. The weights and thresholds are assumptions, not validated public-health thresholds. This score is not a dengue test, vector count, infection probability, or case forecast. The scenario sandbox applies the same calculation to hypothetical inputs and does not predict future case totals.

## 6. Map and health guidance

Leaflet renders public OpenStreetMap tiles without an application API key and includes attribution. Its 8 km circle is a visual aid, not a transmission boundary. The public tile service has usage policies and is not guaranteed high-volume production hosting.

Prevention and symptom panels provide general educational information and link to the [WHO Dengue Outbreak Toolbox](https://www.who.int/emergencies/outbreak-toolkit/disease-outbreak-toolboxes/dengue-outbreak-toolbox). Severe warning signs are directed to urgent medical care. The information does not replace a clinician or local public-health service.

## 7. Official outbreak notices

When a country is selected, `/api/alerts` checks the WHO Disease Outbreak News hub API and returns up to three dengue-related notices published in the last 180 days when the notice text identifies the selected country, or explicitly describes a global/multicountry event. The page links each result to its WHO source and displays an in-page status panel; it does not send push notifications or infer an outbreak from environmental values or case totals. India pages also link to the national NCVBDC source for local public-health information. WHO states that Disease Outbreak News is not an exhaustive list of all public-health events, so no matching notice is not evidence that a place has no outbreak. Users should check the relevant local authority. Notice text may describe a past event, so users must read the source for its current status.

## 8. Gemini Live voice session and privacy

The voice assistant uses Gemini Live's bidirectional audio API. On the user's request, the server creates a single-use, short-lived token and locks its session configuration to dengue, dengue-related health guidance, general explanations of clinician-led dengue diagnostic processes and tests, and the selected dashboard context. The browser streams microphone audio over a WebSocket and plays Gemini's spoken audio response. The long-lived `GEMINI_API_KEY` remains on the server. Precise coordinates are not sent.

The instruction restricts answers to dengue, its prevention, symptoms and warning signs, general diagnostic/testing information about dengue, and dengue/location data shown by the dashboard. For reported symptoms, the assistant can say they may be compatible with dengue, screen for urgent warning signs, and recommend clinical evaluation; it must not confirm or rule out dengue, assign personal infection odds, or interpret personal lab results. It directs Gemini to refuse unrelated topics, distinguish country data from city data, avoid fabricating missing values, and refer warning signs to immediate medical care. It cannot guarantee perfect enforcement against every possible spoken query; model instructions are a guardrail rather than a formal topic classifier.

Gemini Live documentation currently lists 99 supported languages and automatic speech language detection ([capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities), [WebSocket setup](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket)). This is broad multilingual support, not every language. Browser microphone permission, audio hardware, network access, API quotas, and a Gemini key are required. API usage may incur charges. The token route includes a basic in-memory per-IP issuance limit; production hosting should add durable rate limits and abuse controls.

## 9. Architecture and operation

- **Next.js App Router:** `app/page.js` implements the dashboard; `app/api/cases/route.js` retrieves current country feed data; `app/api/alerts/route.js` checks recent WHO dengue notices; `app/api/voice-token/route.js` provisions Gemini Live sessions; `app/layout.js` sets document metadata.
- **React and CSS:** selected place, public case data, weather, simulation, themes, and voice-session state; responsive bento cards and reduced-motion-aware animations.
- **Leaflet/OpenStreetMap:** keyless map tiles and selected-location visualization.
- **Gemini Live:** native bidirectional spoken conversation using an ephemeral token.

Requirements: Node.js 20.9 or later. Install with `npm install`; set `GEMINI_API_KEY` in the server environment to enable voice; then run `npm run dev`. For production, use `npm run build` and `npm start`. `GEMINI_LIVE_MODEL` optionally selects a compatible Live model. Never add the long-lived API key to browser code or a checked-in secret file.

## 10. Limitations and validation plan

1. The primary feed is country/month level. The India fallback adds state/UT totals only when currently published; it does not provide arbitrary city/district totals, and many other countries lack an integrated subnational source.
2. Official case reporting can be delayed, incomplete, and based on differing case definitions. Estimates are not confirmed reports.
3. Place-to-country mapping identifies the feed country but does not resolve city surveillance boundaries.
4. The environmental index is unvalidated and does not account for reporting or biological lags.
5. Population, immunity/serotype, vector surveillance, mobility, interventions, water storage, and healthcare access/reporting are omitted.
6. Public feeds and APIs can change or become unavailable; missing data are shown as missing.
7. WHO Disease Outbreak News is not a complete global alert feed, and text-based country matching can miss notices that describe a location indirectly.
8. Gemini Live is a preview API with finite documented language coverage, and voice use requires key/quota/network/browser audio access.

To develop a credible city-level early warning system, first obtain a regular, licensed city or district case series with metadata, define target geography and forecast horizon, align weather and cases with justified lag features, and establish a seasonal baseline. Evaluate chronologically held-out periods, report count error and calibration, and if feasible validate in another region. Until then, describe DengueShield as an educational dengue surveillance explorer with country-level reporting and environmental context.

## References

- Global Dengue Observatory, [Data](https://globaldengueobservatory.org/pages/data.html) and [Methods](https://globaldengueobservatory.org/pages/methods.html).
- OpenDengue, [Dataset](https://opendengue.org/data).
- Open-Meteo, [Forecast API](https://open-meteo.com/en/docs), [Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api), and [Geocoding API](https://open-meteo.com/en/docs/geocoding-api).
- OpenStreetMap, [Copyright and attribution](https://www.openstreetmap.org/copyright) and [Tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
- World Health Organization, [Dengue Outbreak Toolbox](https://www.who.int/emergencies/outbreak-toolkit/disease-outbreak-toolboxes/dengue-outbreak-toolbox).
- World Health Organization, [Disease Outbreak News](https://www.who.int/emergencies/disease-outbreak-news) and [hub API reference](https://cms.who.int/api/hubs/diseaseoutbreaknews/sfhelp).
- Google AI for Developers, [Gemini Live capabilities](https://ai.google.dev/gemini-api/docs/live-api/capabilities), [WebSocket setup](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket), and [ephemeral tokens](https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens).
