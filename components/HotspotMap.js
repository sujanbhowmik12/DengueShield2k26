"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Flame, Info, MapPin, ShieldAlert, Sparkles, Activity, Thermometer } from "lucide-react";

export default function HotspotMap({ theme = "light" }) {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [riskFilter, setRiskFilter] = useState("all");

  const HOTSPOTS = [
    {
      id: "HS-1",
      name: "Central Kolkata & Beliaghata Corridor",
      district: "Kolkata",
      lat: 22.5697,
      lng: 88.3972,
      activeCases: 14,
      riskLevel: "High",
      suitability: "84%",
      notes: "Dense urban housing; water accumulation in back alleys and terrace tanks.",
    },
    {
      id: "HS-2",
      name: "Howrah Municipal & Railway Belt",
      district: "Howrah",
      lat: 22.5958,
      lng: 88.2636,
      activeCases: 9,
      riskLevel: "High",
      suitability: "81%",
      notes: "High commuter traffic, roadside drains receiving municipal larvicide treatment.",
    },
    {
      id: "HS-3",
      name: "Jagatballavpur Rural-Periurban Area",
      district: "Howrah",
      lat: 22.6843,
      lng: 88.1065,
      activeCases: 3,
      riskLevel: "Moderate",
      suitability: "78%",
      notes: "Agricultural water storage and open drainage ponds under active monitoring.",
    },
    {
      id: "HS-4",
      name: "Salt Lake & New Town Sector V",
      district: "North 24 Parganas",
      lat: 22.5867,
      lng: 88.4178,
      activeCases: 2,
      riskLevel: "Low",
      suitability: "65%",
      notes: "Structured drainage with routine vector control; low active case density.",
    },
    {
      id: "HS-5",
      name: "Barasat Municipal & NH-12 Corridor",
      district: "North 24 Parganas",
      lat: 22.7196,
      lng: 88.4812,
      activeCases: 4,
      riskLevel: "Moderate",
      suitability: "76%",
      notes: "Semi-urban commercial hubs and canal junctions under regular municipal larvicide spraying.",
    },
    {
      id: "HS-6",
      name: "Serampore & Chinsurah Riverfront Belt",
      district: "Hooghly",
      lat: 22.7523,
      lng: 88.3431,
      activeCases: 3,
      riskLevel: "Low",
      suitability: "62%",
      notes: "Riverine proximity monitored by Hooghly district vector surveillance teams.",
    },
  ];

  const filteredHotspots = riskFilter === "all"
    ? HOTSPOTS
    : HOTSPOTS.filter(h => h.riskLevel.toLowerCase() === riskFilter.toLowerCase());

  useEffect(() => {
    let map, isCancelled = false;
    if (!mapContainerRef.current) return;

    import("leaflet").then((module) => {
      if (isCancelled || !mapContainerRef.current) return;
      const L = module.default || module;

      map = L.map(mapContainerRef.current, {
        center: [22.6, 88.3],
        zoom: 10,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Render hotspot circles
      filteredHotspots.forEach((h) => {
        const color = h.riskLevel === "High" ? "#dc2626" : h.riskLevel === "Moderate" ? "#ea580c" : "#16a34a";
        const radius = h.riskLevel === "High" ? 6500 : h.riskLevel === "Moderate" ? 4500 : 3000;

        const circle = L.circle([h.lat, h.lng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: "4 6",
        }).addTo(map);

        const marker = L.circleMarker([h.lat, h.lng], {
          radius: 8,
          color: "#fff",
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <b style="font-size: 13px; color: ${color};">${h.name}</b><br/>
            <span><b>Risk Level:</b> ${h.riskLevel}</span><br/>
            <span><b>Active Verified Cases:</b> ${h.activeCases}</span><br/>
            <span><b>Climate Suitability:</b> ${h.suitability}</span>
          </div>
        `);

        marker.on("click", () => {
          setSelectedHotspot(h);
        });
      });

      setMapInstance(map);
    }).catch(console.error);

    return () => {
      isCancelled = true;
      if (map) map.remove();
    };
  }, [riskFilter]);

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">GIS VECTOR VULNERABILITY</span>
          <h2>Interactive Dengue Hotspot Map</h2>
          <p className="section-subtitle">
            Geographic hotspot zones computed from verified case density combined with local meteorological suitability.
          </p>
        </div>
        <div className="risk-filter-pills">
          <button
            type="button"
            className={`pill-btn ${riskFilter === "all" ? "active" : ""}`}
            onClick={() => setRiskFilter("all")}
          >
            All Zones ({HOTSPOTS.length})
          </button>
          <button
            type="button"
            className={`pill-btn red ${riskFilter === "high" ? "active" : ""}`}
            onClick={() => setRiskFilter("high")}
          >
            High Risk (2)
          </button>
          <button
            type="button"
            className={`pill-btn amber ${riskFilter === "moderate" ? "active" : ""}`}
            onClick={() => setRiskFilter("moderate")}
          >
            Moderate (2)
          </button>
          <button
            type="button"
            className={`pill-btn green ${riskFilter === "low" ? "active" : ""}`}
            onClick={() => setRiskFilter("low")}
          >
            Low (1)
          </button>
        </div>
      </div>

      <div className="hotspot-layout">
        <div className="map-view-card">
          <div className="map-embed" ref={mapContainerRef} style={{ height: "480px", width: "100%", borderRadius: "14px" }} />
          <div className="map-legend">
            <span><i className="dot-red" /> High Risk (Active cases &gt; 8 + Suitability &gt; 75%)</span>
            <span><i className="dot-amber" /> Moderate Risk (Cases 3–7 + Suitability 50–74%)</span>
            <span><i className="dot-green" /> Low Risk (Sporadic cases + Low Suitability)</span>
          </div>
        </div>

        <div className="hotspot-sidebar">
          <div className="criteria-card">
            <div className="criteria-header">
              <Info size={15} />
              <b>Transparent Risk Criteria</b>
            </div>
            <p>
              Risk is calculated via: <code>(Verified Cases × 0.55) + (Climate Index × 0.45)</code>.
              No location is labeled high-risk without confirmed lab records.
            </p>
          </div>

          <h3 className="sidebar-title">Identified Hotspot Clusters</h3>
          <div className="hotspot-cards-list">
            {filteredHotspots.map((h) => (
              <div
                key={h.id}
                className={`hotspot-item ${selectedHotspot?.id === h.id ? "selected" : ""}`}
                onClick={() => setSelectedHotspot(h)}
              >
                <div className="hotspot-item-top">
                  <b>{h.name}</b>
                  <span className={`status-chip chip-${h.riskLevel.toLowerCase()}`}>{h.riskLevel}</span>
                </div>
                <div className="hotspot-meta">
                  <span><MapPin size={12} /> {h.district}</span>
                  <span><Activity size={12} /> {h.activeCases} Active Cases</span>
                  <span><Thermometer size={12} /> {h.suitability} Suitability</span>
                </div>
                <p className="hotspot-desc">{h.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
