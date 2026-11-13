"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, ShieldCheck, Clock, Download, CheckCircle, AlertTriangle, Activity, X, Building2, Home, Lock, Shield } from "lucide-react";

export default function CaseTracker({ onCaseReported }) {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [quickVerifyMsg, setQuickVerifyMsg] = useState("");
  const [quickVerifying, setQuickVerifying] = useState(false);

  const handleQuickVerify = async (verificationStatus, caseStatus) => {
    if (!selectedVerification) return;
    setQuickVerifyMsg("");
    setQuickVerifying(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVerification.id,
          verificationStatus,
          status: caseStatus,
          passcode: adminPasscode,
          actor: "Health Officer (Verified via Case Tracker)",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuickVerifyMsg(`Success! Case ${selectedVerification.id} updated to ${verificationStatus}.`);
        loadData();
        if (onCaseReported) onCaseReported();
        setTimeout(() => {
          setSelectedVerification(null);
          setQuickVerifyMsg("");
          setAdminPasscode("");
        }, 1200);
      } else {
        setQuickVerifyMsg(data.error || "Failed to update status. Check passcode.");
      }
    } catch (e) {
      setQuickVerifyMsg("Network error. Please try again.");
    } finally {
      setQuickVerifying(false);
    }
  };

  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    location: "",
    district: "",
    onsetDate: new Date().toISOString().slice(0, 10),
    status: "Suspected",
    testType: "NS1 Antigen",
    plateletCount: "",
    hospitalized: false,
    hospitalName: "",
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (statusFilter) q.set("status", statusFilter);

      const res = await fetch(`/api/tracker?${q.toString()}`);
      const data = await res.json();
      if (data.cases) setCases(data.cases);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error("Failed to load cases:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!formData.location.trim()) {
      setFormError("Please enter the patient's area or location.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess("Case report submitted successfully! Awaiting health authority verification.");
        setFormData({
          age: "",
          gender: "Male",
          location: "",
          district: "",
          onsetDate: new Date().toISOString().slice(0, 10),
          status: "Suspected",
          testType: "NS1 Antigen",
          plateletCount: "",
          hospitalized: false,
          hospitalName: "",
          notes: "",
        });
        loadData();
        if (onCaseReported) onCaseReported();
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess("");
        }, 1500);
      } else {
        setFormError(data.error || "Failed to submit case.");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">EPIDEMIOLOGICAL SURVEILLANCE</span>
          <h2>Dengue Case Tracking Registry</h2>
          <p className="section-subtitle">
            Anonymized patient surveillance, laboratory confirmation status, and municipal verification pipeline.
          </p>
        </div>
        <div className="header-actions">
          <a href="/api/export?type=cases" download className="action-btn secondary">
            <Download size={15} /> Export CSV
          </a>
          <button type="button" className="action-btn primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Report New Case
          </button>
        </div>
      </div>

      {stats && (
        <div className="metric-strip">
          <div className="metric-pill">
            <span className="pill-label">Total Registered</span>
            <span className="pill-val">{stats.totalCases}</span>
          </div>
          <div className="metric-pill active-pill">
            <span className="pill-label">Active / Suspected</span>
            <span className="pill-val">{stats.activeCases}</span>
          </div>
          <div className="metric-pill confirmed-pill">
            <span className="pill-label">Laboratory Confirmed</span>
            <span className="pill-val">{stats.confirmedCases}</span>
          </div>
          <div className="metric-pill recovered-pill">
            <span className="pill-label">Recovered</span>
            <span className="pill-val">{stats.recoveredCases}</span>
          </div>
          <div className="metric-pill verified-pill">
            <span className="pill-label">Verified Reports</span>
            <span className="pill-val">{stats.verifiedReports}</span>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-field">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by ID, location, or test type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-field">
          <Filter size={14} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Suspected">Suspected</option>
            <option value="Recovered">Recovered</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading case registry…</div>
      ) : cases.length === 0 ? (
        <div className="empty-box">No cases found matching your criteria.</div>
      ) : (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Patient ID</th>
                <th>Location</th>
                <th>Onset Date</th>
                <th>Test & Platelets</th>
                <th>Care Setting</th>
                <th>Status</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.id}</strong></td>
                  <td><span className="privacy-code">{c.patientCode} ({c.gender[0]}, {c.age}y)</span></td>
                  <td>{c.location}</td>
                  <td>{c.onsetDate}</td>
                  <td>
                    <span className="test-badge">{c.testType}</span>
                    {c.plateletCount && <span className="platelet-badge">{c.plateletCount.toLocaleString()} /µL</span>}
                  </td>
                  <td>
                    {c.hospitalized ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <Building2 size={13} style={{ color: "var(--accent)" }} />
                        {c.hospitalName || "Hospitalized"}
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--muted)" }}>
                        <Home size={13} />
                        Home Isolation
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-chip chip-${c.status.toLowerCase()}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`verify-chip ${c.verificationStatus === "Verified" ? "verified" : "pending"}`}
                      style={{ border: "none", cursor: "pointer", font: "inherit" }}
                      title="Click to view verification details or verify as health officer"
                      onClick={() => {
                        setSelectedVerification(c);
                        setQuickVerifyMsg("");
                        setAdminPasscode("");
                      }}
                    >
                      {c.verificationStatus === "Verified" ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {c.verificationStatus}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="info-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="info-dialog modal-card">
            <button type="button" className="info-close" onClick={() => setShowModal(false)}>
              <X size={17} />
            </button>
            <span className="card-kicker">CLINICAL & COMMUNITY REPORTING</span>
            <h2>Submit Dengue Case Report</h2>
            <p className="privacy-notice">
              <Lock size={13} style={{ verticalAlign: "middle", marginRight: "5px" }} />
              Personal data is strictly anonymized. Only non-identifiable demographic and clinical data is collected.
            </p>

            {formError && <div className="alert-banner error">{formError}</div>}
            {formSuccess && <div className="alert-banner success">{formSuccess}</div>}

            <form onSubmit={handleSubmit} className="custom-form">
              <div className="form-grid">
                <label>
                  <span>Patient Age *</span>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    required
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </label>
                <label>
                  <span>Gender</span>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <div className="form-grid">
                <label>
                  <span>Location / Neighborhood *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jagatballavpur, Howrah"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value, district: e.target.value.split(",")[0].trim() })}
                  />
                </label>
                <label>
                  <span>Symptom Onset Date</span>
                  <input
                    type="date"
                    required
                    value={formData.onsetDate}
                    onChange={(e) => setFormData({ ...formData, onsetDate: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  <span>Diagnostic Test</span>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                  >
                    <option value="NS1 Antigen">NS1 Antigen (Early Fever)</option>
                    <option value="IgM ELISA">IgM ELISA Antibody</option>
                    <option value="RT-PCR">RT-PCR</option>
                    <option value="Clinical Diagnosis">Clinical Triage / Suspected</option>
                  </select>
                </label>
                <label>
                  <span>Platelet Count (Optional)</span>
                  <input
                    type="number"
                    placeholder="e.g. 95000"
                    value={formData.plateletCount}
                    onChange={(e) => setFormData({ ...formData, plateletCount: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  <span>Current Clinical Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Suspected">Suspected</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Recovered">Recovered</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.hospitalized}
                    onChange={(e) => setFormData({ ...formData, hospitalized: e.target.checked })}
                  />
                  <span>Currently Hospitalized / Inpatient</span>
                </label>
              </div>

              {formData.hospitalized && (
                <label>
                  <span>Hospital Facility Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Howrah District Hospital"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  />
                </label>
              )}

              <label>
                <span>Clinical Notes or Symptoms</span>
                <textarea
                  rows="2"
                  placeholder="e.g. Retro-orbital headache, body aches, no severe warning signs."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </label>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="action-btn primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVerification && (
        <div className="info-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedVerification(null); }}>
          <div className="info-dialog modal-card" style={{ maxWidth: "520px" }}>
            <button type="button" className="info-close" onClick={() => setSelectedVerification(null)}>
              <X size={17} />
            </button>
            <span className="card-kicker">EPIDEMIOLOGICAL SURVEILLANCE</span>
            <h2>Case Verification Status</h2>
            <p className="privacy-notice">
              <Shield size={13} style={{ verticalAlign: "middle", marginRight: "5px", color: "var(--accent)" }} />
              To protect public health integrity and prevent fabricated records, reports require laboratory verification before being classified as officially confirmed cases.
            </p>

            <div style={{ background: "var(--card-soft)", border: "1px solid var(--line)", borderRadius: "10px", padding: "12px", margin: "10px 0 14px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div><b>Case Identifier:</b> {selectedVerification.id} ({selectedVerification.patientCode})</div>
              <div><b>Location:</b> {selectedVerification.location}</div>
              <div><b>Reporting Date:</b> {selectedVerification.reportDate} (Onset: {selectedVerification.onsetDate})</div>
              <div><b>Diagnostic Test:</b> <span className="test-badge">{selectedVerification.testType}</span></div>
              <div><b>Platelet Count:</b> {selectedVerification.plateletCount ? `${selectedVerification.plateletCount.toLocaleString()} /µL` : "Not provided"}</div>
              <div>
                <b>Care Setting:</b>{" "}
                {selectedVerification.hospitalized ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Building2 size={12} style={{ color: "var(--accent)" }} /> {selectedVerification.hospitalName}
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--muted)" }}>
                    <Home size={12} /> Home Isolation
                  </span>
                )}
              </div>
              <div><b>Current Status:</b> <span className={`status-chip chip-${selectedVerification.status.toLowerCase()}`}>{selectedVerification.status}</span></div>
              <div><b>Verification State:</b> <span className={`verify-chip ${selectedVerification.verificationStatus === "Verified" ? "verified" : "pending"}`}>{selectedVerification.verificationStatus}</span></div>
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "13px" }}>Authorized Health Officer Verification</h4>
              <p style={{ fontSize: "11.5px", color: "var(--muted)", margin: "0 0 10px" }}>
                Chief Medical Officers and authorized administrators can verify or reject this record here using their administrative passcode, or via the <strong>Admin Portal</strong> tab.
              </p>

              {quickVerifyMsg && (
                <div style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "10px", background: quickVerifyMsg.startsWith("Success") ? "#dcfce7" : "#fee2e2", color: quickVerifyMsg.startsWith("Success") ? "#15803d" : "#b91c1c" }}>
                  {quickVerifyMsg}
                </div>
              )}

              <input
                type="password"
                placeholder="Enter administrator passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--line-strong)", borderRadius: "8px", background: "var(--card)", color: "var(--ink)", fontSize: "12px", marginBottom: "10px", outline: "none" }}
              />

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => handleQuickVerify("Pending", "Suspected")}
                  disabled={quickVerifying}
                >
                  Mark as Pending
                </button>
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={() => handleQuickVerify("Verified", "Confirmed")}
                  disabled={quickVerifying}
                >
                  <CheckCircle size={14} /> Verify as Confirmed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
