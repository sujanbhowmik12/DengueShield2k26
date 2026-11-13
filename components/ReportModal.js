"use client";

import { Download, Printer, X, Shield, Calendar, Globe, Database } from "lucide-react";

export default function ReportModal({ stats, place, weather, onClose }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrintPDF = () => {
    const cleanPlace = (place?.name || "Regional").replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateStamp = new Date().toISOString().slice(0, 10);
    const pdfFileName = `DengueShield_Surveillance_Report_${cleanPlace}_${dateStamp}`;
    const originalTitle = typeof document !== "undefined" ? document.title : "";

    try {
      if (typeof document !== "undefined") {
        document.title = pdfFileName;
      }
      window.print();
    } finally {
      setTimeout(() => {
        if (typeof document !== "undefined") {
          document.title = originalTitle;
        }
      }, 1500);
    }
  };

  return (
    <div className="info-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="info-dialog report-modal-dialog">
        <button type="button" className="info-close" onClick={onClose} aria-label="Close report">
          <X size={17} />
        </button>

        <div className="printable-report" id="printable-report-area">
          <div className="report-header">
            <div className="report-brand">
              <img src="/dengue-logo.png" alt="DengueShield" className="report-logo" />
              <div>
                <h2>DengueShield Surveillance & Public Health Report</h2>
                <span>Epidemiological Status & Microclimate Vector Analysis</span>
              </div>
            </div>
            <div className="report-date-badge">
              <Calendar size={13} /> {currentDate}
            </div>
          </div>

          <div className="report-divider" />

          <div className="report-section">
            <h3>1. Target Location & Meteorological Context</h3>
            <div className="report-grid-3">
              <div className="report-box">
                <span className="lbl">Selected Location</span>
                <b>{place?.name || "Global / Regional"} {place?.country ? `(${place.country})` : ""}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Observed Temperature</span>
                <b>{weather?.temp != null ? `${weather.temp.toFixed(1)}°C` : "N/A"}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Relative Humidity</span>
                <b>{weather?.humidity != null ? `${weather.humidity}%` : "N/A"}</b>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>2. Verified Public Health Surveillance Metrics</h3>
            <div className="report-grid-4">
              <div className="report-box">
                <span className="lbl">Total Registered Cases</span>
                <b className="val-large">{stats ? stats.totalCases.toLocaleString() : "..."}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Active Infections</span>
                <b className="val-large amber">{stats ? stats.activeCases.toLocaleString() : "..."}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Confirmed Lab Cases</span>
                <b className="val-large red">{stats ? stats.confirmedCases.toLocaleString() : "..."}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Recovered Cases</span>
                <b className="val-large green">{stats ? stats.recoveredCases.toLocaleString() : "..."}</b>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>3. Community Vector Breeding Surveillance</h3>
            <div className="report-grid-3">
              <div className="report-box">
                <span className="lbl">Total Civic Reports</span>
                <b>{stats ? stats.totalCommunityReports ?? stats.verifiedReports + stats.pendingReports : "..."}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Verified & Dispatched</span>
                <b>{stats ? stats.verifiedReports.toLocaleString() : "..."}</b>
              </div>
              <div className="report-box">
                <span className="lbl">Pending Field Inspection</span>
                <b>{stats ? stats.pendingReports.toLocaleString() : "..."}</b>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>4. Verified Authoritative Data Sources</h3>
            <ul className="sources-list">
              <li><b>Global Dengue Observatory:</b> Harmonized WHO / PAHO monthly country-level case surveillance.</li>
              <li><b>National Vector Borne Disease Control Programme (NCVBDC):</b> Government of India state/UT reports.</li>
              <li><b>WHO Disease Outbreak News (DON):</b> Verified epidemiological alerts and outbreak notices.</li>
              <li><b>Open-Meteo Suite:</b> Real-time and 30-day historical ECMWF / ERA5 reanalysis microclimate data.</li>
            </ul>
          </div>

          <div className="report-footer">
            <span>Generated automatically by DengueShield Public Health Surveillance Platform.</span>
            <span>Non-diagnostic epidemiological context. Contact local health authorities for emergency guidance.</span>
          </div>
        </div>

        <div className="report-modal-actions">
          <button type="button" className="action-btn secondary" onClick={handlePrintPDF}>
            <Printer size={15} /> Download / Save PDF
          </button>
          <a href="/api/export?type=summary" download className="action-btn primary">
            <Download size={15} /> Download Executive CSV
          </a>
        </div>
      </div>
    </div>
  );
}
