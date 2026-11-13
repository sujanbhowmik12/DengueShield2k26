"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Stethoscope, RefreshCw, PhoneCall, ArrowRight, AlertCircle, XCircle, Building2, Droplets } from "lucide-react";

export default function SymptomChecker() {
  const [feverDays, setFeverDays] = useState(0);
  const [symptoms, setSymptoms] = useState({
    headache: false,
    eyePain: false,
    jointPain: false,
    rash: false,
    nausea: false,
  });

  const [redFlags, setRedFlags] = useState({
    severeAbdominalPain: false,
    persistentVomiting: false,
    mucosalBleeding: false,
    extremeDrowsiness: false,
    breathingDifficulty: false,
  });

  const [evaluated, setEvaluated] = useState(false);

  const toggleSymptom = (key) => setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleRedFlag = (key) => setRedFlags(prev => ({ ...prev, [key]: !prev[key] }));

  const hasAnyRedFlag = Object.values(redFlags).some(Boolean);
  const commonSymptomCount = Object.values(symptoms).filter(Boolean).length;

  const resetForm = () => {
    setFeverDays(0);
    setSymptoms({ headache: false, eyePain: false, jointPain: false, rash: false, nausea: false });
    setRedFlags({ severeAbdominalPain: false, persistentVomiting: false, mucosalBleeding: false, extremeDrowsiness: false, breathingDifficulty: false });
    setEvaluated(false);
  };

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">EDUCATIONAL CLINICAL TRIAGE</span>
          <h2>AI-Guided Dengue Symptom Checker</h2>
          <p className="section-subtitle">
            Non-diagnostic symptom assessment and emergency warning signs screening based on WHO dengue guidelines.
          </p>
        </div>
        <button type="button" className="action-btn secondary" onClick={resetForm}>
          <RefreshCw size={14} /> Reset Checker
        </button>
      </div>

      <div className="checker-layout">
        <div className="checker-form-box">
          <div className="checker-step">
            <span className="step-num">Step 1</span>
            <h3>Fever Duration</h3>
            <p className="step-desc">How many days has the fever been present?</p>
            <div className="fever-selector">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  type="button"
                  key={d}
                  className={`fever-btn ${feverDays === d ? "selected" : ""}`}
                  onClick={() => setFeverDays(d)}
                >
                  {d === 0 ? "No fever" : `${d} ${d === 1 ? "day" : "days"}`}
                </button>
              ))}
            </div>
            {feverDays >= 3 && feverDays <= 7 && (
              <div className="phase-callout">
                <AlertCircle size={15} style={{ verticalAlign: "middle", marginRight: "6px", color: "var(--warning)" }} />
                Days 3 to 7 correspond to the <b>Critical Phase</b> where fever subsides but plasma leakage risk is highest.
              </div>
            )}
          </div>

          <div className="checker-step">
            <span className="step-num">Step 2</span>
            <h3>Common Dengue Symptoms</h3>
            <p className="step-desc">Select all symptoms you or the patient are experiencing:</p>
            <div className="symptom-grid">
              {[
                ["headache", "Severe Frontal Headache"],
                ["eyePain", "Pain Behind the Eyes (Retro-orbital)"],
                ["jointPain", "Severe Muscle / Joint Aches (Break-bone)"],
                ["nausea", "Nausea or Mild Loss of Appetite"],
                ["rash", "Flushed Skin or Measles-like Rash"],
              ].map(([key, label]) => (
                <label key={key} className={`symptom-toggle ${symptoms[key] ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={symptoms[key]}
                    onChange={() => toggleSymptom(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checker-step warning-step">
            <span className="step-num urgent">Step 3 — Critical Check</span>
            <h3 className="urgent-title">Severe Warning Signs (Emergency Red Flags)</h3>
            <p className="step-desc">Do any of the following critical warning signs occur?</p>
            <div className="symptom-grid">
              {[
                ["severeAbdominalPain", "Severe Continuous Abdominal / Belly Pain"],
                ["persistentVomiting", "Persistent Vomiting (≥ 3 times in 24 hours)"],
                ["mucosalBleeding", "Bleeding from Gums, Nose, or Blood in Stool / Vomit"],
                ["extremeDrowsiness", "Extreme Lethargy, Restlessness, or Confusion"],
                ["breathingDifficulty", "Rapid or Labored Breathing (Plasma Leakage Sign)"],
              ].map(([key, label]) => (
                <label key={key} className={`symptom-toggle danger ${redFlags[key] ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={redFlags[key]}
                    onChange={() => toggleRedFlag(key)}
                  />
                  <span><ShieldAlert size={14} style={{ verticalAlign: "middle", marginRight: "6px", color: "var(--danger)" }} />{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="action-btn primary evaluate-btn"
            onClick={() => setEvaluated(true)}
          >
            Evaluate Symptoms <ArrowRight size={16} />
          </button>
        </div>

        <div className="checker-results-box">
          {!evaluated ? (
            <div className="result-placeholder">
              <Stethoscope size={36} />
              <h4>Awaiting Your Input</h4>
              <p>Complete the steps on the left and tap <b>Evaluate Symptoms</b> for a comprehensive, non-diagnostic triage summary.</p>
              <div className="medical-disclaimer-pill">
                Educational Assessment · Not a Diagnostic Test
              </div>
            </div>
          ) : (
            <div className="result-content">
              {hasAnyRedFlag ? (
                <div className="triage-card emergency">
                  <div className="triage-badge red">
                    <ShieldAlert size={18} /> EMERGENCY WARNING SIGNS DETECTED
                  </div>
                  <h3>Seek Immediate Hospital Emergency Care</h3>
                  <p>
                    You have selected one or more <b>Severe Dengue Warning Signs</b>. These indicate possible plasma leakage or hemorrhage requiring urgent IV fluid management and clinical monitoring.
                  </p>
                  <div className="emergency-actions">
                    <a href="tel:108" className="call-emergency-btn">
                      <PhoneCall size={16} /> Call Emergency Ambulance (108 / 102)
                    </a>
                  </div>
                  <ul className="critical-points">
                    <li><XCircle size={15} style={{ verticalAlign: "middle", marginRight: "6px", color: "var(--danger)" }} /> <b>DO NOT</b> take Aspirin, Ibuprofen, Diclofenac, or Combiflam.</li>
                    <li><Building2 size={15} style={{ verticalAlign: "middle", marginRight: "6px", color: "var(--accent)" }} /> Go directly to the nearest hospital emergency department or ICU.</li>
                    <li><Droplets size={15} style={{ verticalAlign: "middle", marginRight: "6px", color: "var(--primary)" }} /> Sip oral rehydration solution (ORS) or coconut water on the way if vomiting allows.</li>
                  </ul>
                </div>
              ) : commonSymptomCount >= 2 && feverDays > 0 ? (
                <div className="triage-card moderate">
                  <div className="triage-badge amber">
                    <AlertTriangle size={18} /> SYMPTOMS COMPATIBLE WITH FEBRILE PHASE
                  </div>
                  <h3>Clinical Consultation Recommended</h3>
                  <p>
                    The combination of fever with {commonSymptomCount} common symptoms is compatible with dengue. A definitive assessment requires laboratory testing.
                  </p>
                  <div className="recommendation-list">
                    <div className="rec-item">
                      <b>1. Diagnostic Blood Tests:</b>
                      <span>If fever is 1–5 days, request an <b>NS1 Antigen test</b> and Complete Blood Count (CBC). If &gt;5 days, an <b>IgM antibody test</b> is indicated.</span>
                    </div>
                    <div className="rec-item">
                      <b>2. Continuous Oral Hydration:</b>
                      <span>Drink at least 2.5 to 3 liters of fluids daily: ORS, tender coconut water, and fresh soups.</span>
                    </div>
                    <div className="rec-item">
                      <b>3. Painkiller Safety:</b>
                      <span>Only take Paracetamol under a doctor's guidance. Never take NSAIDs like ibuprofen.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="triage-card mild">
                  <div className="triage-badge green">
                    <CheckCircle size={18} /> NO CRITICAL WARNING SIGNS REPORTED
                  </div>
                  <h3>Low Clinical Suspicion / Mild Symptoms</h3>
                  <p>
                    No emergency warning signs or high-density dengue symptom clusters were identified. Continue monitoring your temperature.
                  </p>
                  <p className="mild-advice">
                    If fever develops, monitor for retro-orbital eye pain, stay well-hydrated, and visit a local clinic if symptoms worsen.
                  </p>
                </div>
              )}

              <div className="safety-disclaimer-box">
                <b>Medical Disclaimer:</b> This symptom checker provides general health education only. It does not calculate personal odds, provide a medical diagnosis, or replace a licensed physician's clinical assessment.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
