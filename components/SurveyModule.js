"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Download, HelpCircle, Send } from "lucide-react";

export default function SurveyModule() {
  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [answers, setAnswers] = useState({});
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const loadSurvey = async () => {
    try {
      const res = await fetch("/api/surveys");
      const data = await res.json();
      if (data.survey) {
        setSurvey(data.survey);
        setAnalytics(data.analytics);
        setTotalResponses(data.totalResponses);
      }
    } catch (e) {
      console.error("Survey load error:", e);
    }
  };

  useEffect(() => {
    loadSurvey();
  }, []);

  const handleSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!survey || Object.keys(answers).length < survey.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: survey.id,
          location: location || "West Bengal",
          answers,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        loadSurvey();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to submit survey.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!survey) {
    return <div className="loading-box">Loading community survey…</div>;
  }

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">COMMUNITY INSIGHTS & SURVEILLANCE</span>
          <h2>Dengue Public Health Survey 2026</h2>
          <p className="section-subtitle">
            Participate in anonymous civic surveys to evaluate municipal vector control, fogging frequency, and preventive habits.
          </p>
        </div>
        <div className="header-actions">
          <span className="responses-counter">
            <BarChart3 size={15} /> <b>{totalResponses}</b> Verified Submissions
          </span>
        </div>
      </div>

      <div className="survey-layout">
        <div className="survey-form-card">
          {submitted ? (
            <div className="survey-thankyou">
              <CheckCircle2 size={42} className="success-icon" />
              <h3>Thank You for Participating!</h3>
              <p>Your responses have been recorded and incorporated into the real-time public health analytics on the right.</p>
              <button
                type="button"
                className="action-btn secondary"
                onClick={() => { setSubmitted(false); setAnswers({}); }}
              >
                Submit Another Response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="survey-questions-form">
              <div className="survey-intro">
                <h4>{survey.title}</h4>
                <p>{survey.description}</p>
              </div>

              {error && <div className="alert-banner error">{error}</div>}

              {survey.questions.map((q, idx) => (
                <div key={q.id} className="question-block">
                  <span className="q-number">Question {idx + 1}</span>
                  <p className="q-text">{q.text}</p>
                  <div className="options-list">
                    {q.options.map((opt) => (
                      <label key={opt} className={`option-label ${answers[q.id] === opt ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt}
                          onChange={() => handleSelect(q.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="location-input-row">
                <label>
                  <span>Your Area / District</span>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata, Howrah, Jagatballavpur"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </label>
              </div>

              <button type="submit" className="action-btn primary submit-survey-btn" disabled={submitting}>
                <Send size={15} /> {submitting ? "Recording…" : "Submit Survey Answers"}
              </button>
            </form>
          )}
        </div>

        <div className="survey-analytics-card">
          <div className="analytics-header">
            <BarChart3 size={18} />
            <h3>Real-Time Community Results</h3>
          </div>
          <p className="analytics-sub">Live distribution of community survey answers across all participating districts.</p>

          <div className="analytics-charts-list">
            {survey.questions.map((q, i) => {
              const qStats = analytics?.[q.id] || {};
              const qTotal = Object.values(qStats).reduce((sum, n) => sum + n, 0) || 1;

              return (
                <div key={q.id} className="chart-group">
                  <b>{i + 1}. {q.text}</b>
                  <div className="bar-rows">
                    {q.options.map((opt) => {
                      const count = qStats[opt] || 0;
                      const pct = Math.round((count / qTotal) * 100);

                      return (
                        <div key={opt} className="bar-row">
                          <div className="bar-label-line">
                            <span>{opt}</span>
                            <strong>{pct}% ({count})</strong>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
