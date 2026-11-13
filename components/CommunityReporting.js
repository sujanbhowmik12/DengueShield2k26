"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, Filter, MapPin, Plus, Search, UploadCloud, X, ShieldAlert } from "lucide-react";

export default function CommunityReporting() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    title: "",
    category: "Stagnant Water",
    location: "",
    description: "",
    priority: "Medium",
    reporterName: "",
    imageUrl: "/icon.png",
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (categoryFilter) q.set("category", categoryFilter);
      const res = await fetch(`/api/community-reports?${q.toString()}`);
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    if (!formData.title || !formData.location) {
      setMsg({ text: "Please provide a title and location for the report.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/community-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "Breeding site reported successfully! Municipal inspectors have been notified.", type: "success" });
        setFormData({
          title: "",
          category: "Stagnant Water",
          location: "",
          description: "",
          priority: "Medium",
          reporterName: "",
          imageUrl: "/icon.png",
        });
        loadReports();
        setTimeout(() => {
          setShowModal(false);
          setMsg({ text: "", type: "" });
        }, 1600);
      } else {
        setMsg({ text: data.error || "Failed to submit report.", type: "error" });
      }
    } catch {
      setMsg({ text: "Submission failed. Check network.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">CITIZEN SURVEILLANCE & ACTION</span>
          <h2>Community Vector Breeding Reporting</h2>
          <p className="section-subtitle">
            Report stagnant water, blocked drains, and mosquito breeding clusters for rapid municipal action.
          </p>
        </div>
        <button type="button" className="action-btn primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Report Breeding Site
        </button>
      </div>

      <div className="filter-bar">
        <div className="select-field">
          <Filter size={14} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Stagnant Water">Stagnant Water</option>
            <option value="Uncleaned Drain">Uncleaned Drain</option>
            <option value="Discarded Tires">Discarded Tires</option>
            <option value="Construction Water">Construction Water</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-box">Loading community reports…</div>
      ) : reports.length === 0 ? (
        <div className="empty-box">No community reports submitted in this category yet.</div>
      ) : (
        <div className="reports-grid">
          {reports.map((r) => (
            <div key={r.id} className="report-card">
              <div className="report-card-top">
                <span className="category-tag">{r.category}</span>
                <span className={`status-chip chip-${r.status.toLowerCase()}`}>{r.status}</span>
              </div>
              <h4>{r.title}</h4>
              <p className="report-desc">{r.description}</p>
              <div className="report-location">
                <MapPin size={13} />
                <span>{r.location}</span>
              </div>
              {r.actionTaken && (
                <div className="action-box">
                  <b>Action Taken:</b> {r.actionTaken}
                </div>
              )}
              <div className="report-footer">
                <span className="reporter-masked">Reported by {r.reporterName}</span>
                <span className="report-date">{new Date(r.reportedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="info-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="info-dialog modal-card">
            <button type="button" className="info-close" onClick={() => setShowModal(false)}>
              <X size={17} />
            </button>
            <span className="card-kicker">CITIZEN ACTION</span>
            <h2>Report Mosquito Breeding Site</h2>
            <p className="privacy-notice">Help keep your neighborhood safe by reporting water pooling and unmaintained sites.</p>

            {msg.text && <div className={`alert-banner ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleSubmit} className="custom-form">
              <label>
                <span>Report Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken overhead tank leaking onto rooftop"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </label>

              <div className="form-grid">
                <label>
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Stagnant Water">Stagnant Water Reservoir</option>
                    <option value="Uncleaned Drain">Blocked Drainage Drain</option>
                    <option value="Discarded Tires">Discarded Tires / Scrap</option>
                    <option value="Construction Water">Construction Site Ponding</option>
                  </select>
                </label>
                <label>
                  <span>Priority Level</span>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="High">High (Visible larvae present)</option>
                    <option value="Medium">Medium (Standing water &gt; 3 days)</option>
                    <option value="Low">Low (Potential future accumulation)</option>
                  </select>
                </label>
              </div>

              <label>
                <span>Location / Landmark *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Behind Jagatballavpur High School, Ward 4"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  rows="3"
                  placeholder="Describe the stagnant water condition, duration, and approximate size…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </label>

              <div className="form-grid">
                <label>
                  <span>Your Name (Will be masked in public view)</span>
                  <input
                    type="text"
                    placeholder="e.g. S. Sen"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                  />
                </label>
                <label>
                  <span>Photo Attachment</span>
                  <div className="file-mock-btn">
                    <UploadCloud size={16} /> Photo Attached (Simulated)
                  </div>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="action-btn primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
