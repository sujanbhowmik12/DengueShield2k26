"use client";

import { useEffect, useState } from "react";
import { Building2, HeartHandshake, PhoneCall, MapPin, Search, Plus, ShieldCheck, Filter, X, Lock, Droplet, CheckCircle } from "lucide-react";

export default function HealthcareDirectory() {
  const [tab, setTab] = useState("hospitals"); // "hospitals" or "donors"
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [districtFilter, setDistrictFilter] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const [donorForm, setDonorForm] = useState({
    name: "",
    bloodGroup: "O+",
    donationType: "Platelets (Apheresis) & Whole Blood",
    district: "Kolkata",
    lastDonationDate: new Date().toISOString().slice(0, 10),
  });

  const loadData = async () => {
    try {
      const q = new URLSearchParams();
      if (districtFilter) q.set("district", districtFilter);
      if (bloodGroupFilter) q.set("bloodGroup", bloodGroupFilter);

      const res = await fetch(`/api/directory?${q.toString()}`);
      const data = await res.json();
      if (data.hospitals) setHospitals(data.hospitals);
      if (data.donors) setDonors(data.donors);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [districtFilter, bloodGroupFilter]);

  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    if (!donorForm.name || !donorForm.district) {
      setMsg({ text: "Please fill in all required fields.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register-donor", ...donorForm }),
      });
      if (res.ok) {
        setMsg({ text: "Registered successfully! Thank you for volunteering as a life-saving donor.", type: "success" });
        setDonorForm({ name: "", bloodGroup: "O+", donationType: "Platelets (Apheresis) & Whole Blood", district: "Kolkata", lastDonationDate: new Date().toISOString().slice(0, 10) });
        loadData();
        setTimeout(() => { setShowDonorModal(false); setMsg({ text: "", type: "" }); }, 1600);
      } else {
        setMsg({ text: "Registration failed.", type: "error" });
      }
    } catch {
      setMsg({ text: "Network error.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">HEALTHCARE LOGISTICS & ASSISTANCE</span>
          <h2>Hospital & Blood Donor Directory</h2>
          <p className="section-subtitle">
            Verified emergency hospital facilities, 24/7 dedicated dengue wards, and voluntary platelet donor network.
          </p>
        </div>
        <div className="header-actions">
          <div className="tab-switch" role="tablist">
            <button
              type="button"
              className={tab === "hospitals" ? "active" : ""}
              onClick={() => setTab("hospitals")}
            >
              <Building2 size={15} /> Hospitals ({hospitals.length})
            </button>
            <button
              type="button"
              className={tab === "donors" ? "active" : ""}
              onClick={() => setTab("donors")}
            >
              <HeartHandshake size={15} /> Platelet & Blood Donors ({donors.length})
            </button>
          </div>
          {tab === "donors" && (
            <button type="button" className="action-btn primary" onClick={() => setShowDonorModal(true)}>
              <Plus size={15} /> Register as Donor
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="select-field">
          <Filter size={14} />
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">All Districts</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Howrah">Howrah</option>
            <option value="North 24 Parganas">North 24 Parganas</option>
            <option value="South 24 Parganas">South 24 Parganas</option>
            <option value="Hooghly">Hooghly</option>
          </select>
        </div>
        {tab === "donors" && (
          <div className="select-field">
            <select value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)}>
              <option value="">All Blood Groups</option>
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
            </select>
          </div>
        )}
      </div>

      {tab === "hospitals" ? (
        <div className="directory-grid">
          {hospitals.map((h) => (
            <div key={h.id} className="directory-card">
              <div className="dir-card-top">
                <span className="facility-type">{h.type}</span>
                <span className={`bed-status-chip ${h.bedAvailability.toLowerCase()}`}>
                  <span className={`status-dot ${h.bedAvailability === "Available" ? "available" : "limited"}`} />
                  {h.bedAvailability === "Available" ? "Beds Available" : "Limited Capacity"}
                </span>
              </div>
              <h4>{h.name}</h4>
              <p className="dir-address"><MapPin size={14} /> {h.address}</p>
              <div className="services-list">
                {h.services?.map((s) => (
                  <span key={s} className="service-tag">{s}</span>
                ))}
              </div>
              <div className="dir-contacts">
                <a href={`tel:${h.emergencyPhone || h.contact}`} className="call-link">
                  <PhoneCall size={14} /> Emergency: {h.emergencyPhone || h.contact}
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="directory-grid">
          {donors.map((d) => (
            <div key={d.id} className="donor-card">
              <div className="donor-card-top">
                <span className="blood-group-badge">{d.bloodGroup}</span>
                <span className={`donor-status ${d.available ? "avail" : "busy"}`}>
                  {d.available ? "Ready for Donation" : "Rest Period"}
                </span>
              </div>
              <h4>{d.name} <small>({d.donorCode})</small></h4>
              <p className="donor-meta"><MapPin size={13} /> {d.district}, {d.state}</p>
              <p className="donor-type"><Droplet size={13} style={{ color: "var(--danger)" }} /> {d.donationType}</p>
              <div className="donor-channel">
                <ShieldCheck size={14} />
                <span>Contact via <b>{d.contactChannel}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDonorModal && (
        <div className="info-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowDonorModal(false); }}>
          <div className="info-dialog modal-card">
            <button type="button" className="info-close" onClick={() => setShowDonorModal(false)}><X size={17} /></button>
            <span className="card-kicker">VOLUNTARY DONATION</span>
            <h2>Register as Platelet / Blood Donor</h2>
            <p className="privacy-notice">
              <Lock size={13} style={{ verticalAlign: "middle", marginRight: "5px" }} />
              Your phone number is never published publicly. Requests are strictly routed via certified hospital blood coordinator desks.
            </p>

            {msg.text && <div className={`alert-banner ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleRegisterDonor} className="custom-form">
              <label>
                <span>Full Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Banerjee"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                />
              </label>

              <div className="form-grid">
                <label>
                  <span>Blood Group *</span>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </label>
                <label>
                  <span>Donation Capability</span>
                  <select
                    value={donorForm.donationType}
                    onChange={(e) => setDonorForm({ ...donorForm, donationType: e.target.value })}
                  >
                    <option value="Platelets (Apheresis) & Whole Blood">Platelets (Apheresis) & Whole Blood</option>
                    <option value="Platelets Only">Platelets Only (Single Donor Apheresis)</option>
                    <option value="Whole Blood Only">Whole Blood Only</option>
                  </select>
                </label>
              </div>

              <div className="form-grid">
                <label>
                  <span>District / City *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata or Howrah"
                    value={donorForm.district}
                    onChange={(e) => setDonorForm({ ...donorForm, district: e.target.value })}
                  />
                </label>
                <label>
                  <span>Last Donation Date</span>
                  <input
                    type="date"
                    value={donorForm.lastDonationDate}
                    onChange={(e) => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDonorModal(false)}>Cancel</button>
                <button type="submit" className="action-btn primary" disabled={submitting}>
                  {submitting ? "Registering…" : "Register Donor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
