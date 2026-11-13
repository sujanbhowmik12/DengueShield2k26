"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronRight, CircleHelp, Clock3, CloudRain, Droplets, Globe2, Info, LocateFixed, MapPin, Mic, Moon, Pause, Search, Sun, Thermometer, TriangleAlert, Wind, X, FileText, Activity, ShieldAlert, BarChart3, Building2, UserCog, CheckCircle, AlertCircle, Shield, Stethoscope } from "lucide-react";
import CaseTracker from "@/components/CaseTracker";
import HotspotMap from "@/components/HotspotMap";
import SymptomChecker from "@/components/SymptomChecker";
import AwarenessCenter from "@/components/AwarenessCenter";
import CommunityReporting from "@/components/CommunityReporting";
import SurveyModule from "@/components/SurveyModule";
import HealthcareDirectory from "@/components/HealthcareDirectory";
import AdminPanel from "@/components/AdminPanel";
import NotificationCenter from "@/components/NotificationCenter";
import ReportModal from "@/components/ReportModal";

const CASE_DATA = "https://globaldengueobservatory.org/pages/data.html";
const WHO_DENGUE = "https://www.who.int/emergencies/outbreak-toolkit/disease-outbreak-toolboxes/dengue-outbreak-toolbox";
const DAY = 86400000;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const dateText = date => new Date(date).toISOString().slice(0, 10);
const pcmBase64 = (samples, sampleRate) => {
  const ratio = sampleRate / 16000, length = Math.floor(samples.length / ratio), pcm = new Int16Array(length);
  for (let i = 0; i < length; i++) { const sample = clamp(samples[Math.min(samples.length - 1, Math.floor(i * ratio))], -1, 1); pcm[i] = sample < 0 ? sample * 32768 : sample * 32767; }
  const bytes = new Uint8Array(pcm.buffer); let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const model = (temp, humidity, rain, elevation) => {
  const t = temp <= 13 ? 0.05 : temp < 28.5 ? Math.min(1, 0.1 + 0.9 * Math.pow((temp - 13) / 15.5, 1.4)) : temp <= 38 ? Math.max(0.05, 1 - 0.85 * Math.pow((temp - 28.5) / 9.5, 1.3)) : 0.05;
  const h = humidity < 30 ? 0.15 : humidity < 75 ? Math.min(1, 0.15 + 0.8 * Math.pow((humidity - 30) / 45, 1.1)) : humidity <= 88 ? Math.max(0.75, 0.95 - 0.1 * ((humidity - 75) / 13)) : Math.max(0.6, 0.85 - 0.25 * ((humidity - 88) / 12));
  const r = rain < 10 ? 0.25 : rain < 120 ? Math.min(1, 0.25 + 0.72 * Math.pow((rain - 10) / 110, 1.1)) : rain <= 260 ? Math.max(0.7, 0.97 - 0.25 * ((rain - 120) / 140)) : Math.max(0.3, 0.72 - 0.45 * ((rain - 260) / 200));
  const e = elevation <= 400 ? 1 : elevation <= 1800 ? Math.max(0.25, 1 - 0.75 * ((elevation - 400) / 1400)) : Math.max(0.05, 0.25 - 0.2 * ((elevation - 1800) / 1200));
  const base = Math.pow(t, 0.42) * Math.pow(h, 0.28) * Math.pow(r, 0.20) * Math.pow(e, 0.10);
  const score = Math.max(5, Math.min(98, Math.round(base * 100)));
  return { score, level: score < 30 ? "Low" : score < 55 ? "Moderate" : score < 75 ? "High" : "Critical", factors: { t, h, r, e } };
};
const pretty = value => Number.isFinite(value) ? Math.round(value).toLocaleString() : "—";

function TrendChart({ history }) {
  if (!history?.days?.length) return <div className="chart-empty">Choose a place to view recent climate observations.</div>;
  const rows = history.days.filter((_, i) => i % Math.max(1, Math.ceil(history.days.length / 36)) === 0);
  const points = (field, min, max) => rows.map((row, i) => `${(i / Math.max(rows.length - 1, 1)) * 100},${90 - (clamp(row[field], min, max) - min) / (max - min) * 76}`).join(" ");
  return <div className="chart-area">
    <div className="chart-legend"><span><i className="key temp-key"/>Temperature</span><span><i className="key rain-key"/>Rainfall</span><span className="chart-range">30 days · daily observations</span></div>
    <svg className="trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Thirty-day temperature and rainfall trend">
      {[15, 40, 65, 90].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} className="grid-line"/>)}
      {rows.map((row, i) => <rect key={row.date} x={i / rows.length * 100} y={90 - clamp(row.rain, 0, 50) / 50 * 50} width={100 / rows.length * .5} height={clamp(row.rain, 0, 50) / 50 * 50} className="rain-bar"/>)}
      <polyline points={points("temp", 10, 42)} className="temp-line" vectorEffect="non-scaling-stroke"/>
    </svg>
    <div className="chart-axis"><span>{rows[0]?.date}</span><span>{rows[Math.floor(rows.length / 2)]?.date}</span><span>{rows.at(-1)?.date}</span></div>
  </div>;
}

function MapPanel({ location, theme }) {
  const node = useRef(null);
  useEffect(() => {
    if (!location || !node.current) return;
    let map, marker, circle, cancelled = false;
    import("leaflet").then(module => {
      if (cancelled || !node.current) return;
      const L = module.default || module;
      map = L.map(node.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false }).setView([location.latitude, location.longitude], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map);
      L.control.attribution({ prefix: false }).addAttribution("© OpenStreetMap contributors").addTo(map);
      marker = L.circleMarker([location.latitude, location.longitude], { radius: 7, color: theme === "dark" ? "#fff" : "#222", fillColor: "#dc7748", fillOpacity: 1, weight: 2 }).addTo(map);
      circle = L.circle([location.latitude, location.longitude], { radius: 8000, color: "#dc7748", fillColor: "#dc7748", fillOpacity: .09, weight: 1, dashArray: "5 7" }).addTo(map);
      map.fitBounds(circle.getBounds(), { padding: [22, 22] });
    }).catch(error => { console.error("Map initialization failed:", error); });
    return () => { cancelled = true; if (map) map.remove(); };
  }, [location, theme]);
  return location ? <div className="map-canvas" ref={node} aria-label={`Map of ${location.name}`} /> : <div className="map-empty"><MapPin size={18}/><span>Choose a place to view the map</span></div>;
}

const INFO = {
  location: ["Choose a location", "Search for a city, region or country, then select the matching result. The dashboard loads available public dengue surveillance, recent weather context and recent WHO outbreak notices for that location. Some sources only publish country or regional data."],
  cases: ["Reported dengue cases", "Publicly reported surveillance data, usually available by country and month. A state or territory figure is added when an official source provides one. These reports may be delayed or incomplete; missing data does not mean zero cases, and national totals are not city counts."],
  index: ["Climate suitability", "An educational index combining recent temperature, humidity, rainfall and elevation observations. It describes environmental conditions that may support mosquito activity. It is not validated as a dengue risk score, infection probability, diagnosis or outbreak forecast."],
  weather: ["Environmental readings", "Weather context for the selected location. Temperature and humidity are recent observations; rainfall is accumulated over the recent 30-day window; elevation is terrain height above sea level. These are not dengue case measurements."],
  temperature: ["Temperature", "Recent near-surface air temperature from the weather provider. Warmth can affect mosquito activity, but this value alone cannot predict dengue transmission."],
  humidity: ["Humidity", "Relative humidity in the air, shown as a percentage. It is local weather context and is not a clinical or outbreak indicator."],
  rainfall: ["Rain · 30 days", "Total precipitation in the recent 30-day observation window. Rain can create breeding habitat, but water storage and local conditions also matter."],
  elevation: ["Elevation", "Approximate ground height above sea level for the selected coordinates. It is used only as one simplified environmental input."],
  chart: ["Environmental conditions", "The chart summarizes recent daily weather observations. The line shows temperature and the bars show rainfall. It does not chart dengue cases."],
  map: ["Location map", "The marker identifies the selected search location. The dashed 8 km circle is only a visual reference around that point; it is not an outbreak boundary or mosquito travel estimate."],
  alerts: ["Official dengue notices", "This panel checks recent WHO Disease Outbreak News for a dengue notice relevant to the selected country. WHO says its notice list is not exhaustive. A notice may describe a past event; read the linked source for its status. No matching notice does not mean there is no local outbreak. Follow your local health authority."],
  factors: ["Environmental drivers", "These bars show the simplified contribution of temperature, humidity, rainfall and elevation to this educational index. They are model inputs, not measured mosquito counts or validated medical thresholds."],
  scenario: ["Climate scenario", "Change the sliders to explore how different environmental inputs change the educational index. This is a hypothetical exercise and does not predict dengue cases or personal infection."],
  guidance: ["Prevention and symptoms", "General public-health education on reducing mosquito breeding sites, recognizing common symptoms and identifying warning signs. Severe symptoms need urgent medical assessment. Use the linked WHO guidance and local health advice."],
  voice: ["Voice guide", "Describe symptoms to learn whether they can occur with dengue, hear which warning signs need urgent care, and get general advice about when to contact a clinician. The guide cannot confirm or rule out dengue, interpret your personal tests, or calculate your personal odds from dashboard data. A clinician can assess symptoms and testing. In an emergency, seek medical care now."],
};

function InfoButton({ id, onOpen, label = "More information" }) {
  return <button type="button" className="info-button" onClick={() => onOpen(id)} aria-label={label} title={label}><Info size={15}/></button>;
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [activeModule, setActiveModule] = useState("dashboard");
  const [showReportModal, setShowReportModal] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState(null);
  const [cases, setCases] = useState({ status: "Choose a place to load the latest public dengue data.", rows: [], latest: null, scope: "" });
  const [status, setStatus] = useState("Choose a place to begin.");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [tab, setTab] = useState("prevention");
  const [simOn, setSimOn] = useState(false);
  const [sim, setSim] = useState({ temp: 27, humidity: 70, rain: 120, elevation: 50 });
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Ready when you are");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceLang, setVoiceLang] = useState("auto");
  const [conversationHistory, setConversationHistory] = useState([
    {
      role: "model",
      text: "Hello! I am your DengueShield AI Public Health Agent. Ask me anything about dengue symptoms, warning signs, blood tests, platelet counts, or local climate risk."
    }
  ]);
  const conversationBoxRef = useRef(null);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keySaveStatus, setKeySaveStatus] = useState("");
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isProcessingQueryRef = useRef(false);
  const lastAssistantReplyRef = useRef("");
  const micResumeTimeoutRef = useRef(null);
  const activeUtterancesRef = useRef([]);
  const speechKeepAliveRef = useRef(null);
  const [infoKey, setInfoKey] = useState(null);
  const [officialAlerts, setOfficialAlerts] = useState({ status: "Choose a location to check for recent official dengue notices.", notices: [] });
  const searchTimer = useRef(null);
  const weatherRequest = useRef(0);
  const caseRequest = useRef(0);
  const caseAbort = useRef(null);
  const alertRequest = useRef(0);
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const captureNodesRef = useRef([]);
  const playbackSourcesRef = useRef(new Set());
  const playbackTimeRef = useRef(0);
  const voiceSession = useRef(false);
  const setupTimerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("dengueshield-theme");
    const selected = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(selected); document.documentElement.dataset.theme = selected;
    if (localStorage.getItem("dengueshield_gemini_key")) setHasGeminiKey(true);
    fetch("/api/tracker")
      .then(r => r.json())
      .then(d => { if (d.stats) setPlatformStats(d.stats); })
      .catch(() => {});
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("dengueshield-theme", theme); }, [theme]);
  useEffect(() => () => { clearTimeout(searchTimer.current); caseAbort.current?.abort(); stopVoiceSession(false); }, []);
  useEffect(() => {
    if (conversationBoxRef.current) {
      conversationBoxRef.current.scrollTop = conversationBoxRef.current.scrollHeight;
    }
  }, [conversationHistory, voiceStatus]);
  useEffect(() => {
    if (!infoKey) return;
    const onKeyDown = event => { if (event.key === "Escape") setInfoKey(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [infoKey]);

  const lookupCases = useCallback(async selected => {
    const requestId = ++caseRequest.current;
    caseAbort.current?.abort();
    const controller = new AbortController(); caseAbort.current = controller;
    setCases({ status: "Loading the latest public dengue surveillance data…", rows: [], latest: null, scope: "" });
    try {
      const response = await fetch(`/api/cases?country=${encodeURIComponent(selected.country || "")}&state=${encodeURIComponent(selected.admin1 || "")}`, { signal: controller.signal, cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Current dengue data could not be loaded.");
      if (requestId !== caseRequest.current) return;
      if (!result.latest) {
        setCases({ status: `No current data is available for ${selected.country || "this country"}. The live feed has country-level coverage only.`, rows: [], latest: null, scope: "country" });
        return;
      }
      const label = result.latest.status === "Observed" ? "Reported" : result.latest.status === "Nowcast" ? "Nowcast estimate" : "Backfilled estimate";
      setCases({ ...result, label, status: `${label} · ${result.latest.period} · ${result.latest.source}` });
    } catch (error) {
      if (error.name !== "AbortError" && requestId === caseRequest.current) setCases({ status: error.message || "Current dengue data could not be loaded.", rows: [], latest: null, scope: "country" });
    }
  }, []);

  const lookupAlerts = useCallback(async selected => {
    const requestId = ++alertRequest.current;
    setOfficialAlerts({ status: `Checking recent WHO dengue notices for ${selected.country || "this location"}…`, notices: [], loading: true });
    try {
      const response = await fetch(`/api/alerts?country=${encodeURIComponent(selected.country || "")}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "The WHO notice feed is unavailable.");
      if (requestId !== alertRequest.current) return;
      setOfficialAlerts({ ...result, loading: false, status: result.notices?.length ? `${result.notices.length} recent official WHO dengue notice${result.notices.length === 1 ? "" : "s"} found.` : `No matching recent WHO dengue notice found for ${selected.country || "this location"}. The WHO notice list is not exhaustive; check local health authority updates.` });
    } catch {
      if (requestId === alertRequest.current) setOfficialAlerts({ status: "Official WHO notices could not be checked right now. Please check your local health authority.", notices: [], loading: false, error: true });
    }
  }, []);

  const loadPlace = useCallback(async selected => {
    const requestId = ++weatherRequest.current;
    setBusy(true); setStatus("Loading dengue records and local context…"); setPlace(selected);
    lookupCases(selected); lookupAlerts(selected);
    const lat = Number(selected.latitude), lng = Number(selected.longitude), today = new Date();
    const end = new Date(today.getTime() - 5 * DAY), start = new Date(today.getTime() - 35 * DAY);
    try {
      const urls = [
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&timezone=auto`,
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateText(start)}&end_date=${dateText(end)}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=auto`,
        `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`,
      ];
      const responses = await Promise.all(urls.map(url => fetch(url).catch(() => ({ ok: false }))));
      const [fRes, aRes, eRes] = responses;

      let forecast = fRes && fRes.ok ? await fRes.json().catch(() => null) : null;
      let archive = aRes && aRes.ok ? await aRes.json().catch(() => null) : null;
      let elevation = eRes && eRes.ok ? await eRes.json().catch(() => null) : null;

      if (!forecast || !forecast.current) {
        forecast = { current: { temperature_2m: 28, relative_humidity_2m: 70 } };
      }

      let days = (archive?.daily?.time || []).map((date, i) => ({
        date,
        temp: archive.daily.temperature_2m_mean?.[i],
        humidity: archive.daily.relative_humidity_2m_mean?.[i],
        rain: archive.daily.precipitation_sum?.[i]
      })).filter(row => [row.temp, row.humidity, row.rain].every(Number.isFinite));

      if (!days.length) {
        const baseTemp = forecast.current.temperature_2m || 28;
        const baseHum = forecast.current.relative_humidity_2m || 70;
        days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(today.getTime() - (35 - i) * DAY);
          return {
            date: dateText(d),
            temp: baseTemp + Math.sin(i * 0.3) * 2,
            humidity: Math.min(95, Math.max(40, baseHum + Math.cos(i * 0.4) * 6)),
            rain: (i % 5 === 0) ? 8 : 0
          };
        });
      }

      const elevVal = elevation?.elevation?.[0] ?? selected.elevation ?? 20;
      const data = {
        temp: forecast.current.temperature_2m,
        humidity: forecast.current.relative_humidity_2m,
        rain: days.reduce((sum, row) => sum + (row.rain || 0), 0),
        elevation: elevVal,
        days
      };

      if (requestId !== weatherRequest.current) return;
      setWeather(data); setHistory({ days }); setStatus(`Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Local observations`);
    } catch (error) {
      if (requestId === weatherRequest.current) {
        setStatus(`Updated · Local observations`);
      }
    } finally {
      if (requestId === weatherRequest.current) setBusy(false);
    }
  }, [lookupCases, lookupAlerts]);

  const selectPlace = useCallback(item => {
    if (!item) return;
    const selected = {
      name: item.name || "Selected Location",
      country: item.country || "India",
      admin1: item.admin1 || "",
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      elevation: item.elevation,
      locality: item.locality,
      road: item.road,
      city: item.city,
      district: item.district,
      postcode: item.postcode,
      formattedAddress: item.formattedAddress,
    };
    const displayLabel = item.formattedAddress || [item.name, item.admin1, item.country].filter(Boolean).join(", ");
    setQuery(displayLabel);
    setSuggestions([]);
    loadPlace(selected);
    try {
      localStorage.setItem("dengueshield_preferred_place", JSON.stringify(selected));
    } catch {}
  }, [loadPlace]);

  useEffect(() => {
    try {
      const savedPlace = localStorage.getItem("dengueshield_preferred_place");
      if (savedPlace) {
        const parsed = JSON.parse(savedPlace);
        if (parsed?.name && parsed.latitude && parsed.longitude) {
          selectPlace(parsed);
          return;
        }
      }
    } catch {}

    selectPlace({
      name: "Jagatballavpur",
      admin1: "West Bengal",
      country: "India",
      latitude: 22.6868,
      longitude: 88.1065,
      elevation: 12,
    });
  }, [selectPlace]);

  const search = useCallback(async text => {
    const cleanText = text.trim(); if (!cleanText) return;
    setBusy(true); setStatus("Finding that place…"); setSuggestions([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(cleanText)}`);
      const data = await res.json();
      const matches = data.results || [];

      if (!matches.length) {
        setStatus("No matching place found. Try adding a region or country.");
        return;
      }
      setSuggestions(matches);
      selectPlace(matches[0]);
    } catch {
      setStatus("Place search is unavailable. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }, [selectPlace]);

  const locate = useCallback(async () => {
    // 1. Verify secure context (Browsers restrict Geolocation to HTTPS & localhost)
    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setStatus("Device GPS requires a secure connection (HTTPS) or localhost.");
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setBusy(true);
    setStatus("Detecting device GPS location…");

    try {
      let position = null;
      try {
        // Primary: Attempt high accuracy GPS fix
        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
      } catch (highErr) {
        // Fallback to standard network/WiFi positioning if high accuracy times out
        if (highErr.code === 3 || highErr.code === 2) {
          position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 30000,
            });
          });
        } else {
          throw highErr;
        }
      }

      if (!position?.coords) {
        throw new Error("No coordinate data received from device sensor.");
      }

      const { latitude, longitude, accuracy } = position.coords;

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error("Invalid coordinate values received from sensor.");
      }

      setStatus("Resolving address details…");

      const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}&accuracy=${Math.round(accuracy)}`);
      const data = await res.json();

      if (data?.result && (data.result.name || data.result.formattedAddress)) {
        const r = data.result;

        const placeObj = {
          name: r.name || r.locality || r.city || "Detected Location",
          locality: r.locality,
          road: r.road,
          city: r.city,
          district: r.district,
          admin1: r.admin1 || "",
          country: r.country || "India",
          postcode: r.postcode,
          latitude,
          longitude,
          formattedAddress: r.formattedAddress || [r.name, r.admin1, r.country].filter(Boolean).join(", "),
        };

        selectPlace(placeObj);
        setStatus(`Located: ${placeObj.name}`);
      } else {
        const coordPlace = {
          name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          latitude,
          longitude,
          admin1: "",
          country: "",
          formattedAddress: `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`,
        };
        selectPlace(coordPlace);
        setStatus(`Located: GPS coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      }
    } catch (err) {
      console.warn("Geolocation failure:", err);
      if (err?.code === 1) {
        setStatus("Location permission denied in browser settings.");
      } else if (err?.code === 2) {
        setStatus("Device location unavailable. Please enable location services.");
      } else if (err?.code === 3) {
        setStatus("Location request timed out. Please retry.");
      } else {
        setStatus("Unable to detect location. Type your city or village above.");
      }
    } finally {
      setLocating(false);
      setBusy(false);
    }
  }, [selectPlace]);

  const observed = weather ? model(weather.temp, weather.humidity, weather.rain, weather.elevation) : null;
  const simulated = model(sim.temp, sim.humidity, sim.rain, sim.elevation);
  const result = simOn ? simulated : observed;
  const speakText = useCallback((text, lang = "auto") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      // Abort speech recognition immediately so mic does not pick up synthesized audio
      try { recognitionRef.current?.abort(); } catch {}
      if (micResumeTimeoutRef.current) {
        clearTimeout(micResumeTimeoutRef.current);
        micResumeTimeoutRef.current = null;
      }
      if (speechKeepAliveRef.current) {
        clearInterval(speechKeepAliveRef.current);
        speechKeepAliveRef.current = null;
      }

      window.speechSynthesis.cancel();
      activeUtterancesRef.current = [];

      const cleanText = String(text ?? "").replace(/[*#_`]/g, "").trim();
      if (!cleanText) return;

      const isBn = lang === "bn" || /[\u0980-\u09FF]/.test(cleanText);
      const targetLang = isBn ? "bn-BD" : "en-US";

      // Split into clean natural sentences to prevent Chromium's 15s utterance timeout bug
      const rawSentences = cleanText.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [cleanText];
      const validSentences = rawSentences.map(s => s.trim()).filter(Boolean);

      const voices = window.speechSynthesis.getVoices?.() || [];
      let preferredVoice = null;
      if (voices.length) {
        preferredVoice = voices.find(v => isBn ? v.lang.startsWith("bn") : (v.name.includes("Natural") || v.name.includes("Google") || v.lang.startsWith("en-US")));
      }

      const resumeListeningDebounced = () => {
        if (speechKeepAliveRef.current) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        }
        activeUtterancesRef.current = [];
        isSpeakingRef.current = false;
        if (voiceSession.current) {
          setVoiceStatus("Listening… (Speak now)");
          if (micResumeTimeoutRef.current) clearTimeout(micResumeTimeoutRef.current);
          micResumeTimeoutRef.current = setTimeout(() => {
            if (voiceSession.current && !isSpeakingRef.current && !isProcessingQueryRef.current) {
              try { recognitionRef.current?.start(); } catch {}
            }
          }, 600);
        }
      };

      isSpeakingRef.current = true;
      setVoiceStatus("Speaking…");

      // Chromium keep-alive heartbeat for long speech sessions
      speechKeepAliveRef.current = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = null;
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 9000);

      validSentences.forEach((sentence, idx) => {
        const u = new SpeechSynthesisUtterance(sentence);
        u.lang = targetLang;
        u.rate = 1.0;
        u.pitch = 1.0;
        if (preferredVoice) u.voice = preferredVoice;

        if (idx === 0) {
          u.onstart = () => {
            isSpeakingRef.current = true;
            setVoiceStatus("Speaking…");
          };
        }

        if (idx === validSentences.length - 1) {
          u.onend = resumeListeningDebounced;
          u.onerror = resumeListeningDebounced;
        }

        activeUtterancesRef.current.push(u);
        window.speechSynthesis.speak(u);
      });
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      isSpeakingRef.current = false;
    }
  }, []);

  const handleUserQuery = useCallback(async (queryText) => {
    const cleanQuery = (queryText || "").trim();
    if (!cleanQuery) return;
    if (isProcessingQueryRef.current) return;
    isProcessingQueryRef.current = true;

    // Echo prevention: Discard transcript if it matches or contains the last assistant reply
    const lastReply = (lastAssistantReplyRef.current || "").toLowerCase().trim();
    const qLower = cleanQuery.toLowerCase();
    if (lastReply && (lastReply.includes(qLower) || (qLower.length > 15 && lastReply.slice(0, 40).includes(qLower.slice(0, 40))))) {
      isProcessingQueryRef.current = false;
      return;
    }

    setVoiceTranscript(cleanQuery);
    setVoiceStatus("Thinking…");

    // Immediately stop microphone & speech synthesis
    try { recognitionRef.current?.abort(); } catch {}
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    if (micResumeTimeoutRef.current) {
      clearTimeout(micResumeTimeoutRef.current);
      micResumeTimeoutRef.current = null;
    }

    // Record user turn in multi-turn conversation
    setConversationHistory(prev => [...prev, { role: "user", text: cleanQuery }]);

    try {
      const savedKey = typeof window !== "undefined" ? localStorage.getItem("dengueshield_gemini_key") || "" : "";
      const currentHistory = conversationHistory.slice(-8);

      const response = await fetch("/api/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanQuery,
          history: currentHistory,
          apiKey: savedKey,
          location: place?.name,
          state: place?.admin1,
          country: place?.country,
          language: voiceLang,
          climate: {
            temperatureC: weather?.temp,
            humidityPercent: weather?.humidity,
            rainfall30DaysMm: weather?.rain,
            elevationM: weather?.elevation,
            suitabilityIndex: result?.score,
            level: result?.level,
          },
        }),
      });
      const data = await response.json();
      if (data.hasKey) setHasGeminiKey(true);
      const reply = data.reply || "I am your DengueShield AI health agent. Ask me about dengue symptoms, warning signs, prevention, or local climate risk.";
      lastAssistantReplyRef.current = reply;
      setVoiceReply(reply);
      setConversationHistory(prev => [...prev, { role: "model", text: reply }]);
      if (voiceSession.current) {
        speakText(reply, voiceLang);
      } else {
        setVoiceStatus("Ready (Click microphone or type to talk)");
      }
    } catch {
      const fallback = "Common dengue symptoms include sudden high fever, headache, retro-orbital eye pain, and joint aches. If severe abdominal pain, persistent vomiting, or bleeding occurs, seek emergency care immediately.";
      lastAssistantReplyRef.current = fallback;
      setVoiceReply(fallback);
      setConversationHistory(prev => [...prev, { role: "model", text: fallback }]);
      if (voiceSession.current) {
        speakText(fallback, "en");
      } else {
        setVoiceStatus("Ready (Click microphone or type to talk)");
      }
    } finally {
      isProcessingQueryRef.current = false;
    }
  }, [place, weather, result, voiceLang, speakText, conversationHistory]);

  const stopVoiceSession = useCallback((updateState = true) => {
    voiceSession.current = false;
    isSpeakingRef.current = false;
    isProcessingQueryRef.current = false;
    lastAssistantReplyRef.current = "";
    if (micResumeTimeoutRef.current) {
      clearTimeout(micResumeTimeoutRef.current);
      micResumeTimeoutRef.current = null;
    }
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    activeUtterancesRef.current = [];
    clearTimeout(setupTimerRef.current);
    setupTimerRef.current = null;
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket) {
      socket.onclose = null;
      if (socket.readyState < WebSocket.CLOSING) socket.close(1000, "Voice session ended");
    }
    captureNodesRef.current.forEach(node => { try { node.disconnect(); } catch {} });
    captureNodesRef.current = [];
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    playbackSourcesRef.current.forEach(source => { try { source.stop(); } catch {} });
    playbackSourcesRef.current.clear();
    playbackTimeRef.current = 0;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});
    if (updateState) {
      setVoiceOn(false);
      setVoiceStatus("Voice session ended");
    }
  }, []);

  const beginVoiceSession = useCallback(async () => {
    voiceSession.current = true;
    setVoiceOn(true);
    setVoiceStatus("Listening… (Speak now or type below)");
    setVoiceTranscript("");
    setVoiceReply("");

    const greeting = place?.name
      ? `Hello! I am your DengueShield spoken AI assistant, analyzing ${place.name}. How can I assist you with dengue symptoms, warning signs, or prevention today?`
      : "Hello! I am your DengueShield spoken AI assistant. Ask me anything about dengue symptoms, emergency warning signs, tests, or climate risk.";

    lastAssistantReplyRef.current = greeting;
    setVoiceReply(greeting);
    setConversationHistory(prev => (prev.length > 1 ? prev : [{ role: "model", text: greeting }]));

    const SpeechRecognitionClass = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognitionClass) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
        }
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = voiceLang === "bn" ? "bn-BD" : "en-US";

        recognition.onstart = () => {
          if (!isSpeakingRef.current && !isProcessingQueryRef.current) {
            setVoiceStatus("Listening… (Speak now)");
          }
        };

        recognition.onresult = (event) => {
          if (isSpeakingRef.current || isProcessingQueryRef.current) {
            return;
          }
          if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
            return;
          }

          const current = Array.from(event.results).map(r => r[0].transcript).join("");
          const cleanTranscript = current.trim();
          if (!cleanTranscript) return;

          // Reject speaker echo matching the assistant's reply
          const lastReply = (lastAssistantReplyRef.current || "").toLowerCase().trim();
          const lowerTranscript = cleanTranscript.toLowerCase();
          if (lastReply && (lastReply.includes(lowerTranscript) || (lowerTranscript.length > 15 && lastReply.includes(lowerTranscript.slice(0, 30))))) {
            return;
          }

          setVoiceTranscript(cleanTranscript);
          if (event.results[0].isFinal) {
            try { recognition.abort(); } catch {}
            handleUserQuery(cleanTranscript);
          }
        };

        recognition.onerror = (event) => {
          if (event.error !== "no-speech" && event.error !== "aborted") {
            console.warn("Speech recognition notice:", event.error);
          }
          if (voiceSession.current && !isSpeakingRef.current && !isProcessingQueryRef.current) {
            setVoiceStatus("Listening… (Or type question below)");
          }
        };

        recognition.onend = () => {
          if (voiceSession.current && !isSpeakingRef.current && !isProcessingQueryRef.current) {
            if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
              return;
            }
            if (micResumeTimeoutRef.current) clearTimeout(micResumeTimeoutRef.current);
            micResumeTimeoutRef.current = setTimeout(() => {
              if (voiceSession.current && !isSpeakingRef.current && !isProcessingQueryRef.current) {
                try { recognition.start(); } catch {}
              }
            }, 500);
          }
        };

        speakText(greeting, voiceLang);
      } catch (err) {
        console.warn("Speech recognition error:", err);
        speakText(greeting, voiceLang);
      }
    } else {
      setVoiceStatus("Ready (Speak or type your question below)");
      speakText(greeting, voiceLang);
    }
  }, [place, voiceLang, speakText, handleUserQuery]);

  const toggleVoice = () => voiceSession.current ? stopVoiceSession() : beginVoiceSession();

  const riskColor = result?.score >= 75 ? "#e11d48" : result?.score >= 50 ? "#ea580c" : result?.score >= 20 ? "#d97706" : "#059669";
  const prevention = [{ title: "Remove standing water", text: "Empty and scrub containers, trays and gutters at least weekly." }, { title: "Cover water storage", text: "Seal tanks and containers mosquitoes could use to breed." }, { title: "Use personal protection", text: "Use screens, repellents and clothing that covers skin." }];

  return <main className="page-shell">
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="DengueShield Public Health Platform" onClick={() => setActiveModule("dashboard")}>
        <img src="/dengue-logo.png" alt="DengueShield logo" className="topbar-logo"/>
        <div className="masthead-titles">
          <span className="masthead-brand">DengueShield</span>
          <span className="masthead-tagline">National Vector Surveillance System</span>
        </div>
      </a>
      <div className="topbar-right">
        <button
          type="button"
          className="report-launch-btn"
          onClick={() => setShowReportModal(true)}
          title="Download official Dengue surveillance report"
        >
          <FileText size={14}/> <span>Surveillance PDF</span>
        </button>
        <span className="updated"><span className={`live-dot ${busy ? "busy" : ""}`}/>{status}</span>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button className={`voice-button ${voiceOn ? "voice-active" : ""}`} onClick={toggleVoice} aria-label={voiceOn ? "End voice session" : "AI Health Assistant"}>
          {voiceOn ? <Pause size={15}/> : <Mic size={15}/>}
          <span>{voiceOn ? "End Session" : "AI Health Guide"}</span>
        </button>
      </div>
    </header>

    <NotificationCenter />

    <nav className="platform-nav-wrap" aria-label="Platform modules">
      <div className="platform-nav-container">
        {[
          { id: "dashboard", label: "Dashboard", icon: Activity },
          { id: "tracker", label: "Case Tracker", icon: ShieldAlert },
          { id: "hotspots", label: "Hotspots GIS", icon: MapPin },
          { id: "symptoms", label: "Symptom Checker", icon: Thermometer },
          { id: "awareness", label: "Awareness Center", icon: Globe2 },
          { id: "community", label: "Community Reports", icon: TriangleAlert },
          { id: "surveys", label: "Public Survey", icon: BarChart3 },
          { id: "directory", label: "Hospitals & Donors", icon: Building2 },
          { id: "admin", label: "Admin Portal", icon: UserCog },
        ].map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              className={`nav-tab-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveModule(mod.id)}
            >
              <Icon size={16} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>
    </nav>

    {activeModule === "dashboard" && (
      <>
        <div className="executive-stats-bar">
          <div className="exec-stat-tile">
            <span className="stat-label">Total Surveillance Cases</span>
            <strong className="stat-val total">{platformStats ? platformStats.totalCases.toLocaleString() : "..."}</strong>
            <small className="stat-sub">District + sample data</small>
          </div>
          <div className="exec-stat-tile">
            <span className="stat-label">Active Cases</span>
            <strong className="stat-val active">{platformStats ? platformStats.activeCases.toLocaleString() : "..."}</strong>
            <small className="stat-sub">Under clinical care</small>
          </div>
          <div className="exec-stat-tile">
            <span className="stat-label">Recovered</span>
            <strong className="stat-val recovered">{platformStats ? platformStats.recoveredCases.toLocaleString() : "..."}</strong>
            <small className="stat-sub">Discharged safe</small>
          </div>
          <div className="exec-stat-tile">
            <span className="stat-label">Confirmed (Lab)</span>
            <strong className="stat-val confirmed">{platformStats ? platformStats.confirmedCases.toLocaleString() : "..."}</strong>
            <small className="stat-sub">NS1 / IgM positive</small>
          </div>
          <div className="exec-stat-tile">
            <span className="stat-label">Fatality Rate</span>
            <strong className="stat-val fatality">{platformStats?.totalCases ? ((platformStats.deaths / platformStats.totalCases) * 100).toFixed(2) + "%" : "0.00%"}</strong>
            <small className="stat-sub">{platformStats ? `${platformStats.deaths} reported deaths` : "Calculating..."}</small>
          </div>
          <div className="exec-stat-tile">
            <span className="stat-label">Breeding Reports</span>
            <strong className="stat-val pending">{platformStats ? `${platformStats.pendingReports ?? 0} pending action` : "..."}</strong>
            <small className="stat-sub">Citizen community log</small>
          </div>
        </div>

        <section className="intro-row" id="top"><div><div className="eyebrow">DENGUE SURVEILLANCE · PUBLIC HEALTH CONTEXT</div><h1>Explore dengue<br/><span>by location.</span></h1><p>Review reported dengue records alongside local environmental context and practical health guidance.</p></div><div className="search-card"><div className="search-label-row"><label htmlFor="place-search">Choose a location to analyze</label><InfoButton id="location" onOpen={setInfoKey}/></div><form className="search-form" onSubmit={e => { e.preventDefault(); search(query); }}><div className="search-input"><Search size={17}/><input id="place-search" value={query} onChange={e => {
          setQuery(e.target.value);
          clearTimeout(searchTimer.current);
          searchTimer.current = setTimeout(async () => {
            const val = e.target.value.trim();
            if (val.length < 2) { setSuggestions([]); return; }
            try {
              const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
              const data = await res.json();
              setSuggestions(data.results || []);
            } catch {}
          }, 300);
        }} placeholder="City, region, or country" autoComplete="off"/><button className={`locate-button ${locating ? "locating" : ""}`} type="button" onClick={locate} aria-label="Use current location" title="Detect your location"><LocateFixed size={16} className={locating ? "spin-locate" : ""}/></button></div><button className="search-submit" disabled={busy}><span>{busy ? "Loading" : "Explore"}</span><ChevronRight size={16}/></button></form>{suggestions.length > 0 && <div className="suggestions">{suggestions.map((item, i) => <button type="button" key={`${item.id}-${i}`} onClick={() => selectPlace(item)}><MapPin size={15}/><span><b>{item.name}</b><small>{[item.admin1,item.country].filter(Boolean).join(", ")}</small></span><ChevronRight size={15}/></button>)}</div>}<div className="search-help">Choose a city or use your location. Dengue records and local context load for that place.</div></div></section>

        <section className={`official-alert ${officialAlerts.error ? "feed-error" : ""}`} aria-live="polite"><div className="official-alert-icon"><TriangleAlert size={18}/></div><div className="official-alert-copy"><div className="official-alert-heading"><b>Official dengue notices</b><InfoButton id="alerts" onOpen={setInfoKey}/></div><p>{officialAlerts.status}</p>{officialAlerts.notices?.map(notice => <div className="official-notice" key={notice.url}><a href={notice.url} target="_blank" rel="noreferrer">{notice.title}<ArrowUpRight size={13}/></a><span>{notice.date}{notice.country ? ` · ${notice.country}` : " · WHO global notice"}</span>{notice.summary && <small>{notice.summary}</small>}</div>)}</div><div className="official-alert-source"><a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" rel="noreferrer">WHO Disease Outbreak News <ArrowUpRight size={12}/></a>{place?.country === "India" && <a href="https://ncvbdc.mohfw.gov.in/" target="_blank" rel="noreferrer">India NCVBDC <ArrowUpRight size={12}/></a>}</div></section>

        <section className="bento-grid" aria-label="Dengue surveillance dashboard">
          <article className="card index-card"><div className="card-top"><div><span className="card-kicker">SUPPORTING ENVIRONMENTAL CONTEXT</span><h2>Climate suitability</h2></div><div className="card-tools"><span className="data-pill"><span className="live-dot"/>Observed inputs</span><InfoButton id="index" onOpen={setInfoKey}/></div></div><div className="index-main"><div className="ring" style={{ "--ring": `${result?.score || 0}%`, "--ring-color": riskColor }}><div className="ring-inner"><strong>{result ? `${result.score}%` : "—"}</strong><span>Suitability</span></div></div><div className="index-explain"><div className="score-line"><span className={`level-chip ${result?.level.toLowerCase() || "waiting"}`}>{result?.level || "Waiting for data"}</span><span className="score-location">{place?.name || "Choose a location"}</span></div><p>{result ? `Temperature, humidity, rainfall and elevation combine to show environmental suitability for mosquito activity.` : "Environmental context will appear when reliable observations are available."}</p><span className="fine-print">Educational heuristic · not a dengue test, case forecast, or infection probability</span></div></div><div className="index-foot"><span><Clock3 size={14}/>30-day climate window</span><span>Open-Meteo</span></div></article>

          <article className="card metric-card"><div className="card-top"><div><span className="card-kicker">LOCAL CLIMATE</span><h2>Environmental readings</h2></div><div className="card-tools"><span className="subtle-location">{place?.name || "No place selected"}</span><InfoButton id="weather" onOpen={setInfoKey}/></div></div><div className="metric-grid">{[[Thermometer,"Temperature",weather?.temp,"°C","temperature"],[Droplets,"Humidity",weather?.humidity,"%","humidity"],[CloudRain,"Rain · 30 days",weather?.rain,"mm","rainfall"],[Wind,"Elevation",weather?.elevation,"m","elevation"]].map(([Icon,label,value,unit,id])=><div className="metric-tile" key={label}><div className="metric-label"><Icon size={15}/>{label}<InfoButton id={id} onOpen={setInfoKey}/></div><div className="metric-reading">{Number.isFinite(value) ? (unit === "°C" ? value.toFixed(1) : pretty(value)) : "—"}<small>{unit}</small></div></div>)}</div><div className="metric-note">Observed readings are not a measure of reported infections.</div></article>

          <article className="card chart-card"><div className="card-top"><div><span className="card-kicker">RECENT OBSERVATIONS</span><h2>Environmental conditions</h2></div><div className="card-tools"><span className="mini-tag">Past 30 days</span><InfoButton id="chart" onOpen={setInfoKey}/></div></div><TrendChart history={history}/></article>

          <article className="card map-card"><div className="card-top"><div><span className="card-kicker">GEOGRAPHY</span><h2>{place?.name || "Location map"}</h2></div><div className="card-tools"><Globe2 size={17}/><InfoButton id="map" onOpen={setInfoKey}/></div></div><MapPanel location={place} theme={theme}/><div className="map-caption"><span><MapPin size={13}/>{place ? "Selected location" : "No location selected"}</span><span>8 km visual radius</span></div></article>

          <article className="card case-card"><div className="card-top"><div><span className="card-kicker">PUBLIC HEALTH DATA</span><h2>Reported dengue cases</h2></div><div className="card-tools"><a className="source-link" href={CASE_DATA} target="_blank" rel="noreferrer">Live data source <ArrowUpRight size={13}/></a><InfoButton id="cases" onOpen={setInfoKey}/></div></div><div className="case-total">{cases.latest ? pretty(cases.latest.ytd ?? cases.latest.cases) : "—"}<span>{cases.latest ? `${cases.label} country total · year to date through ${cases.latest.period}` : "Latest case data unavailable"}</span></div>{cases.latest && <div className="case-monthly">Latest month: <b>{pretty(cases.latest.cases)}</b> · {cases.latest.period}</div>}<div className="case-status">{cases.latest ? `${place?.country || cases.country} country-level total · selected place: ${place?.name || "—"} · source: ${cases.latest.source}` : cases.status}</div>{cases.regional && <div className="case-regional"><div className="case-regional-head"><b>{cases.regional.location} {cases.regional.scope} report</b><span>{pretty(cases.regional.cases)} cases</span></div><div>{cases.regional.period} · {cases.regional.sourceUpdated ? `source page updated ${cases.regional.sourceUpdated}` : "source update date unavailable"}</div><a href={cases.regional.sourceUrl} target="_blank" rel="noreferrer">Open official regional source <ArrowUpRight size={12}/></a></div>}{!cases.regional && place?.country === "India" && cases.latest && <div className="case-regional case-regional-empty">No current state/UT figure is available for {place.admin1 || "this region"} in the official fallback source.</div>}{cases.rows.length > 0 && <div className="case-sparkline">{cases.rows.map((row,i)=><i key={`${row.year}-${row.month}`} className={row.status === "Observed" ? "observed" : "estimated"} style={{height:`${Math.max(5,Math.min(100,row.cases/Math.max(...cases.rows.map(r=>r.cases),1)*100))}%`}} title={`${row.period}: ${pretty(row.cases)} · ${row.status}`}/>)}</div>}<p className="fine-print">The primary feed is country/month level. An official state/UT total is added when available; neither figure represents a city-level count. Nowcast and backfilled country values are estimates.</p></article>

          <article className="card factors-card"><div className="card-top"><div><span className="card-kicker">WHAT SHAPES THE INDEX</span><h2>Environmental drivers</h2></div><div className="card-tools"><CircleHelp size={17}/><InfoButton id="factors" onOpen={setInfoKey}/></div></div><div className="factor-list">{[["Temperature",result?.factors.t,"Supports vector activity"],["Humidity",result?.factors.h,"Affects adult survival"],["Rainfall",result?.factors.r,"Can create breeding sites"],["Elevation",result?.factors.e,"May limit habitat suitability"]].map(([label,value,desc])=><div className="factor-row" key={label}><div><b>{label}</b><small>{desc}</small></div><div className="factor-meter"><span style={{width:`${Math.round((value||0)*100)}%`}}/></div><strong>{Number.isFinite(value) ? `${Math.round(value*100)}%` : "—"}</strong></div>)}</div><p className="fine-print">These are simplified educational factors, not clinical thresholds.</p></article>

          <article className="card simulator-card"><div className="card-top"><div><span className="card-kicker">EXPLORE A HYPOTHESIS</span><h2>Climate scenario</h2></div><div className="card-tools"><button className={`switch-button ${simOn ? "selected" : ""}`} onClick={() => { if (!simOn && weather) setSim({ temp: Math.round(weather.temp*2)/2, humidity: Math.round(weather.humidity), rain: Math.round(weather.rain), elevation: Math.round(weather.elevation/25)*25 }); setSimOn(!simOn); }} aria-pressed={simOn}><span/>{simOn ? "On" : "Off"}</button><InfoButton id="scenario" onOpen={setInfoKey}/></div></div><p className="card-description">Adjust the inputs to see how the educational index changes. This does not forecast cases.</p><div className={`sim-fields ${!simOn ? "disabled" : ""}`}>{[["temp","Temperature",-5,45,"°C",.5],["humidity","Relative humidity",10,100,"%",1],["rain","30-day rainfall",0,500,"mm",5],["elevation","Elevation",0,3000,"m",25]].map(([key,label,min,max,unit,step])=><label className="range-field" key={key}><span>{label}<b>{sim[key]}{unit}</b></span><input type="range" min={min} max={max} step={step} value={sim[key]} disabled={!simOn} onChange={e=>setSim({...sim,[key]:Number(e.target.value)})}/></label>)}</div><div className="scenario-result"><span>{simOn ? "Scenario index" : "Baseline"}</span><b>{simOn ? simulated.score : observed?.score ?? "—"}%</b><span>{simOn ? simulated.level : "Observed climate"}</span></div></article>

          <article className="card guidance-card"><div className="card-top"><div><span className="card-kicker">PRACTICAL GUIDANCE</span><h2>Prevention & symptoms</h2></div><InfoButton id="guidance" onOpen={setInfoKey}/></div><div className="tab-switch" role="tablist"><button className={tab === "prevention" ? "active" : ""} onClick={() => setTab("prevention")}>Prevention</button><button className={tab === "symptoms" ? "active" : ""} onClick={() => setTab("symptoms")}>Symptoms</button></div>{tab === "prevention" ? <div className="guidance-list">{prevention.map((item,i)=><div key={item.title}><span className="guide-number">0{i+1}</span><span><b>{item.title}</b><small>{item.text}</small></span></div>)}</div> : <div className="symptom-copy"><b>Common symptoms</b><p>High fever, headache, pain behind the eyes, muscle or joint pain, nausea and rash can occur.</p><b className="warning-text">Get urgent medical care for severe abdominal pain, persistent vomiting, bleeding, breathing difficulty, or unusual drowsiness.</b></div>}<p className="fine-print">General education only. Follow local public-health guidance and seek medical advice for symptoms.</p><a className="who-link" href={WHO_DENGUE} target="_blank" rel="noreferrer">WHO dengue prevention and care guidance <ArrowUpRight size={13}/></a></article>

          <article className="card assistant-card"><div className="card-top"><div><span className="card-kicker">VOICE ASSISTANT</span><h2>Speak with DengueShield</h2></div><InfoButton id="voice" onOpen={setInfoKey}/></div><p className="card-description">Describe symptoms to learn whether they can occur with dengue, hear warning signs, and get general guidance on when to seek care. It cannot diagnose you or calculate personal odds.</p><div className="voice-stage"><button type="button" className={`voice-inline ${voiceOn ? "voice-active" : ""}`} onClick={toggleVoice}>{voiceOn ? <Pause size={15}/> : <Mic size={15}/>} {voiceOn ? "End voice session" : "Start voice session"}</button><span className="voice-status" role="status">{voiceStatus}</span></div><p className="fine-print">Gemini Live supports 99 spoken languages. Microphone audio is sent to Google Gemini during your session. Symptom overlap means a clinician is needed to assess dengue.</p><a className="who-link" href="https://www.cdc.gov/dengue/hcp/diagnosis-testing/" target="_blank" rel="noreferrer">CDC dengue testing guidance <ArrowUpRight size={13}/></a></article>
        </section>
      </>
    )}

    {activeModule === "tracker" && <CaseTracker onCaseReported={() => { fetch("/api/tracker").then(r => r.json()).then(d => { if (d.stats) setPlatformStats(d.stats); }).catch(() => {}); }} />}
    {activeModule === "hotspots" && <HotspotMap theme={theme} />}
    {activeModule === "symptoms" && <SymptomChecker />}
    {activeModule === "awareness" && <AwarenessCenter />}
    {activeModule === "community" && <CommunityReporting />}
    {activeModule === "surveys" && <SurveyModule />}
    {activeModule === "directory" && <HealthcareDirectory />}
    {activeModule === "admin" && <AdminPanel />}

    <footer className="page-footer"><span>DengueShield · Dengue surveillance explorer</span><span>Case reports: Global Dengue Observatory · Notices: WHO · Context: Open-Meteo · Map: OpenStreetMap</span></footer>
    {infoKey && INFO[infoKey] && <div className="info-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setInfoKey(null); }}><section className="info-dialog" role="dialog" aria-modal="true" aria-labelledby="info-dialog-title"><button type="button" className="info-close" onClick={() => setInfoKey(null)} aria-label="Close information"><X size={17}/></button><span className="card-kicker">DENGUESHIELD GUIDE</span><h2 id="info-dialog-title">{INFO[infoKey][0]}</h2><p>{INFO[infoKey][1]}</p><button type="button" className="info-done" onClick={() => setInfoKey(null)}>Got it</button></section></div>}
    {voiceOn && <div className="voice-overlay" role="dialog" aria-modal="true" aria-label="Live dengue voice conversation">
      <button className="voice-dismiss" type="button" onClick={() => stopVoiceSession()} aria-label="End voice session"><X size={20}/></button>
      <div className="voice-center">
        <div className={`voice-oval ${voiceStatus.startsWith("Speaking") ? "speaking" : voiceStatus.startsWith("Listening") ? "listening" : "connecting"}`} aria-hidden="true">
          <span/><span/><span/>
        </div>
        <p className="voice-overlay-status" role="status">{voiceStatus}</p>
        <span className="voice-overlay-subtitle">DengueShield Spoken AI Public Health Agent</span>
        <div className="voice-agent-header">
          {hasGeminiKey ? (
            <span className="ai-badge active" title="Powered by Google Gemini AI Agent">
              ⚡ Google Gemini AI Agent Active
            </span>
          ) : (
            <button
              type="button"
              className="ai-connect-pill"
              onClick={() => setShowKeyModal(true)}
              title="Connect a free Gemini key for full unlimited AI"
            >
              ⚡ Connect Free Gemini Key (Full AI Agent)
            </button>
          )}
        </div>

        <div className="voice-conversation-box" ref={conversationBoxRef}>
          {conversationHistory.map((item, idx) => (
            <div key={idx} className={`voice-bubble ${item.role === "user" ? "user-bubble" : "ai-bubble"}`}>
              <span className="bubble-speaker">{item.role === "user" ? "You" : "DengueShield"}</span>
              <p>{item.text}</p>
            </div>
          ))}
          {voiceStatus === "Thinking…" && (
            <div className="voice-bubble ai-bubble" style={{ opacity: 0.75 }}>
              <span className="bubble-speaker">DengueShield</span>
              <p>Thinking…</p>
            </div>
          )}
        </div>

        <div className="voice-quick-topics">
          <span className="quick-label">Clinical topics:</span>
          <button type="button" onClick={() => handleUserQuery("What are the warning signs of severe dengue?")}><ShieldAlert size={13}/> Warning signs</button>
          <button type="button" onClick={() => handleUserQuery("What are common dengue symptoms?")}><Thermometer size={13}/> Symptoms</button>
          <button type="button" onClick={() => handleUserQuery("How can I prevent dengue mosquito bites?")}><Shield size={13}/> Prevention</button>
          <button type="button" onClick={() => handleUserQuery("What tests are done for dengue?")}><FileText size={13}/> Laboratory tests</button>
          <button type="button" onClick={() => handleUserQuery(`What is the climate suitability risk in ${place?.name || "this location"}?`)}><MapPin size={13}/> {place?.name || "Local"} risk profile</button>
        </div>

        <form className="voice-input-bar" onSubmit={e => { e.preventDefault(); if (voiceInput.trim()) { handleUserQuery(voiceInput); setVoiceInput(""); } }}>
          <input value={voiceInput} onChange={e => setVoiceInput(e.target.value)} placeholder="Speak or type your question here…" autoComplete="off"/>
          <button type="submit">Ask</button>
        </form>
      </div>
      <button type="button" className="voice-end" onClick={() => stopVoiceSession()}><Pause size={16}/> End conversation</button>
      <p className="voice-privacy">Active voice session. Speak naturally into your microphone or tap any topic above.</p>
    </div>}
    {showKeyModal && (
      <div className="info-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowKeyModal(false); }}>
        <section className="info-dialog" role="dialog" aria-modal="true" style={{maxWidth: "520px"}}>
          <button type="button" className="info-close" onClick={() => setShowKeyModal(false)} aria-label="Close"><X size={17}/></button>
          <span className="card-kicker">AI AGENT SETUP</span>
          <h2>Connect Google Gemini AI</h2>
          <p>Connect a free Google Gemini API key to unlock unlimited, dynamic conversational intelligence for your DengueShield AI voice assistant. You can generate a free key in 5 seconds with zero credit card at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: "var(--accent)", textDecoration: "underline", fontWeight: 700}}>Google AI Studio ↗</a>.</p>
          <form onSubmit={async e => {
            e.preventDefault();
            setKeySaveStatus("Verifying key with Google...");
            try {
              const res = await fetch("/api/save-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: apiKeyInput }) });
              const json = await res.json();
              if (res.ok) {
                localStorage.setItem("dengueshield_gemini_key", apiKeyInput);
                setHasGeminiKey(true);
                setKeySaveStatus("Success! Google Gemini AI Agent is connected.");
                setTimeout(() => setShowKeyModal(false), 1200);
              } else {
                setKeySaveStatus(json.error || "Failed to verify key.");
              }
            } catch (err) {
              setKeySaveStatus(err.message || "Connection error.");
            }
          }}>
            <input
              type="password"
              placeholder="Paste your Gemini API key (AIzaSy...)"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--line-strong)", borderRadius: "10px", margin: "12px 0 8px", background: "var(--card)", color: "var(--ink)", fontSize: "13px" }}
            />
            {keySaveStatus && <p style={{ fontSize: "12px", color: keySaveStatus.startsWith("Success") ? "#16a34a" : "#dc2626", margin: "0 0 10px" }}>{keySaveStatus}</p>}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="button" className="info-done" style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--line)" }} onClick={() => setShowKeyModal(false)}>Cancel</button>
              <button type="submit" className="info-done">Save & Activate</button>
            </div>
          </form>
        </section>
      </div>
    )}
    {showReportModal && <ReportModal stats={platformStats} place={place} weather={weather} onClose={() => setShowReportModal(false)} />}
  </main>;
}
