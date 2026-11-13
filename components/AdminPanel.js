"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle, Download, FileText, Lock, LogOut, Shield, Trash2, X, AlertTriangle } from "lucide-react";

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("cases");
  const [cases, setCases] = useState([]);
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setAuthenticated(true);
        setStats(data.stats);
        setLogs(data.logs || []);
        loadData();
      } else {
        setLoginError(data.error || "Authentication failed.");
      }
    } catch {
      setLoginError("Connection error.");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, reportsRes, adminRes] = await Promise.all([
        fetch("/api/tracker"),
        fetch("/api/community-reports"),
        fetch("/api/admin", {
          headers: { "x-admin-passcode": passcode },
        }),
      ]);
      const casesData = await casesRes.json();
      const reportsData = await reportsRes.json();
      const adminData = await adminRes.json();

      if (casesData.cases) setCases(casesData.cases);
      if (casesData.stats) setStats(casesData.stats);
      if (reportsData.reports) setReports(reportsData.reports);
      if (adminData.logs) setLogs(adminData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const verifyCase = async (id, verificationStatus) => {
    try {
      const res = await fetch("/api/tracker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          verificationStatus,
          status: verificationStatus === "Verified" ? "Confirmed" : "Suspected",
          passcode,
          actor: "Chief Medical Officer (Admin)",
        }),
      });
      if (res.ok) {
        setActionSuccess(`Case ${id} updated to ${verificationStatus}`);
        loadData();
        setTimeout(() => setActionSuccess(""), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const moderateReport = async (id, status, actionTaken) => {
    try {
      const res = await fetch("/api/community-reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          actionTaken,
          passcode,
          verifiedBy: "Municipal Health Officer (Admin)",
          actor: "Public Health Administrator",
        }),
      });
      if (res.ok) {
        setActionSuccess(`Report ${id} marked as ${status}`);
        loadData();
        setTimeout(() => setActionSuccess(""), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!authenticated) {
    return (
      <div className="section-container admin-login-wrap">
        <div className="login-card">
          <div className="login-icon">
            <Lock size={26} />
          </div>
          <span className="card-kicker">RESTRICTED ACCESS</span>
          <h2>DengueShield Administrative Portal</h2>
          <p className="login-sub">Authorized public health officers and municipal vector managers only.</p>

          {loginError && <div className="alert-banner error">{loginError}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="Enter administrator passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="submit" className="action-btn primary full-width">
              Authenticate & Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">PUBLIC HEALTH ADMINISTRATION</span>
          <h2>Health Authority Management Console</h2>
          <p className="section-subtitle">
            Validate pending epidemiological reports, manage civic breeding complaints, audit logs, and trigger official CSV data exports.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="action-btn secondary" onClick={() => setAuthenticated(false)}>
            <LogOut size={15} /> Exit Console
          </button>
        </div>
      </div>

      {actionSuccess && <div className="alert-banner success">{actionSuccess}</div>}

      {stats && (
        <div className="metric-strip">
          <div className="metric-pill">
            <span className="pill-label">Total Cases</span>
            <span className="pill-val">{stats.totalCases}</span>
          </div>
          <div className="metric-pill active-pill">
            <span className="pill-label">Pending Verification</span>
            <span className="pill-val">{cases.filter(c => c.verificationStatus === "Pending").length}</span>
          </div>
          <div className="metric-pill verified-pill">
            <span className="pill-label">Pending Breeding Reports</span>
            <span className="pill-val">{stats.pendingReports}</span>
          </div>
          <div className="metric-pill">
            <span className="pill-label">Registered Hospitals</span>
            <span className="pill-val">{stats.hospitalsCount}</span>
          </div>
        </div>
      )}

      <div className="admin-nav-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "cases" ? "active" : ""}`}
          onClick={() => setActiveTab("cases")}
        >
          Case Verification Queue ({cases.filter(c => c.verificationStatus === "Pending").length} Pending)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Breeding Reports Moderation ({reports.filter(r => r.status === "Pending").length} Pending)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Audit Logs
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "exports" ? "active" : ""}`}
          onClick={() => setActiveTab("exports")}
        >
          Data Exports & CSV
        </button>
      </div>

      {activeTab === "cases" && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Patient Details</th>
                <th>Location</th>
                <th>Test Type</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, index) => (
                <tr key={c.id ? `${c.id}-${index}` : index}>
                  <td><strong>{c.id}</strong></td>
                  <td>{c.patientCode} ({c.gender[0]}, {c.age}y)</td>
                  <td>{c.location}</td>
                  <td><span className="test-badge">{c.testType}</span></td>
                  <td><span className={`status-chip chip-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td>
                    <span className={`verify-chip ${c.verificationStatus === "Verified" ? "verified" : "pending"}`}>
                      {c.verificationStatus}
                    </span>
                  </td>
                  <td>
                    {c.verificationStatus === "Pending" ? (
                      <div className="action-button-group">
                        <button
                          type="button"
                          className="action-icon-btn approve"
                          title="Verify Case"
                          onClick={() => verifyCase(c.id, "Verified")}
                        >
                          <Check size={14} /> Verify
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn reject"
                          title="Reject Case"
                          onClick={() => verifyCase(c.id, "Rejected")}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="completed-tag">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Title & Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action Taken</th>
                <th>Moderate</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, index) => (
                <tr key={r.id ? `${r.id}-${index}` : index}>
                  <td><strong>{r.id}</strong></td>
                  <td>
                    <b>{r.title}</b><br/>
                    <small className="category-tag">{r.category}</small>
                  </td>
                  <td>{r.location}</td>
                  <td><span className={`status-chip chip-${r.status.toLowerCase()}`}>{r.status}</span></td>
                  <td><small>{r.actionTaken || "None logged"}</small></td>
                  <td>
                    {r.status === "Pending" ? (
                      <div className="action-button-group">
                        <button
                          type="button"
                          className="action-icon-btn approve"
                          onClick={() => moderateReport(r.id, "Verified", "Larvicide team dispatched.")}
                        >
                          Verify & Dispatch
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn resolve"
                          onClick={() => moderateReport(r.id, "Resolved", "Site cleaned and water drained.")}
                        >
                          Mark Resolved
                        </button>
                      </div>
                    ) : (
                      <span className="completed-tag">Logged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Action</th>
                <th>Details</th>
                <th>Actor</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, index) => (
                <tr key={l.id ? `${l.id}-${index}` : index}>
                  <td><code>{l.id}</code></td>
                  <td><b>{l.action}</b></td>
                  <td>{l.details}</td>
                  <td><span className="actor-badge">{l.actor}</span></td>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "exports" && (
        <div className="export-cards-grid">
          <div className="export-card">
            <h4>Dengue Cases CSV Export</h4>
            <p>Export all registered patient surveillance records, laboratory test confirmations, and clinical statuses.</p>
            <a href="/api/export?type=cases" download className="action-btn primary">
              <Download size={15} /> Download Cases CSV
            </a>
          </div>

          <div className="export-card">
            <h4>Community Reports CSV Export</h4>
            <p>Export citizen vector breeding site reports, categories, geographic locations, and municipal action statuses.</p>
            <a href="/api/export?type=reports" download className="action-btn primary">
              <Download size={15} /> Download Breeding Reports CSV
            </a>
          </div>

          <div className="export-card">
            <h4>Executive Summary Report</h4>
            <p>Export overall epidemiological surveillance summary metrics with generation timestamps and data sources.</p>
            <a href="/api/export?type=summary" download className="action-btn primary">
              <Download size={15} /> Download Summary CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
