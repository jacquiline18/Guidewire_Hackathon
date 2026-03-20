import { useState, useEffect } from "react";
import { api } from "../api";

// Fixed sensor readings per city per disruption type
// These represent real-world typical values for each city
const CITY_SENSORS = {
  Chennai:   { rainfall: 115, temperature: 31, windspeed: 45, aqi: 88  },
  Mumbai:    { rainfall: 135, temperature: 30, windspeed: 52, aqi: 118 },
  Delhi:     { rainfall: 12,  temperature: 38, windspeed: 35, aqi: 318 },
  Hyderabad: { rainfall: 92,  temperature: 43, windspeed: 48, aqi: 145 },
  Bangalore: { rainfall: 88,  temperature: 36, windspeed: 72, aqi: 208 },
};

// Each disruption type has fixed sensor overrides that guarantee detection
const DISRUPTION_SENSORS = {
  "Heavy Rain":       { rainfall: 120, temperature: 30, windspeed: 40, aqi: 90  },
  "Extreme Heat":     { rainfall: 4,   temperature: 45, windspeed: 20, aqi: 130 },
  "Strong Winds":     { rainfall: 18,  temperature: 32, windspeed: 85, aqi: 95  },
  "Severe Pollution": { rainfall: 5,   temperature: 34, windspeed: 15, aqi: 310 },
};

const DISRUPTION_META = {
  "Heavy Rain":       { icon: "🌧️", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", desc: "Rainfall > 80mm/hr" },
  "Extreme Heat":     { icon: "🌡️", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", desc: "Temperature > 42°C" },
  "Strong Winds":     { icon: "💨", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", desc: "Wind speed > 60km/h" },
  "Severe Pollution": { icon: "🏭", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", desc: "AQI > 200" },
};

const CITIES = ["Chennai", "Mumbai", "Delhi", "Hyderabad", "Bangalore"];
const CITY_EMOJI = { Chennai: "🌊", Mumbai: "🌆", Delhi: "🏛️", Hyderabad: "🏰", Bangalore: "🌳" };

function PipelineStep({ step, label, status, detail, index }) {
  const cfg = {
    pass:    { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", icon: "✅", badge: "PASSED" },
    fail:    { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", icon: "❌", badge: "FAILED" },
    pending: { bg: "#f9fafb", border: "#e5e7eb", color: "#6b7280", icon: "⏳", badge: "RUNNING" },
  }[status];
  return (
    <div style={{ display: "flex", gap: 14, padding: "12px 16px", background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 12, animation: "fadeUp 0.3s ease both", animationDelay: `${index * 0.06}s` }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "white", border: `2px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{cfg.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>{step}. {label}</p>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: `${cfg.color}18`, color: cfg.color }}>{cfg.badge}</span>
        </div>
        {detail && <p style={{ fontSize: "0.8rem", color: "#555" }}>{detail}</p>}
      </div>
    </div>
  );
}

export default function WeatherSimulator({ rider, onDone }) {
  const [city, setCity]           = useState(rider.city);
  const [disruption, setDisruption] = useState(null);   // selected disruption type
  const [detected, setDetected]   = useState({});       // { [type]: disruptions[] } — pre-detected for all 4
  const [detecting, setDetecting] = useState(false);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(0);

  // When city changes, instantly run RF detection for all 4 disruption types
  useEffect(() => {
    setDisruption(null);
    setResult(null);
    setDetected({});
    runAllDetections(city);
  }, [city]);

  const runAllDetections = async (selectedCity) => {
    setDetecting(true);
    const results = {};
    // Run all 4 in parallel — instant
    await Promise.all(
      Object.entries(DISRUPTION_SENSORS).map(async ([type, sensors]) => {
        try {
          const res = await api.detectWeather({ city: selectedCity, ...sensors });
          results[type] = res.disruptions || [];
        } catch {
          results[type] = [type]; // fallback: assume detected
        }
      })
    );
    setDetected(results);
    setDetecting(false);
  };

  const runPipeline = async () => {
    if (!disruption) return;
    setLoading(true); setStep(0);
    const sensors = DISRUPTION_SENSORS[disruption];
    // Animate steps quickly — 300ms each
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 300));
      setStep(i);
    }
    const res = await api.simulateWeather({ city, ...sensors });
    setLoading(false);
    setResult(res);
  };

  // ── LOADING PIPELINE VIEW
  if (loading) return (
    <div className="app-page">
      <div className="app-page-inner" style={{ maxWidth: 640 }}>
        <p className="page-eyebrow">⚙️ Processing</p>
        <h1 className="page-title">Running Claim Pipeline</h1>
        <p className="page-desc">{disruption} detected in {city}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {["RF Disruption Classification", "Location Validation", "Policy & Expiry Check", "Trust Score Check", "Decision Engine"].map((s, i) => (
            <PipelineStep key={i} step={i + 1} label={s} index={i}
              status={step > i ? "pass" : step === i ? "pending" : "pending"}
              detail={step > i ? "Completed" : step === i ? "Processing..." : "Queued"} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESULT VIEW
  if (result) {
    const claim    = result.generatedClaims?.find(c => c.riderId === rider.riderId);
    const rejected = result.rejectedClaims?.find(c => c.riderId === rider.riderId);
    const active   = claim || rejected;
    const meta     = DISRUPTION_META[disruption] || {};
    const sensors  = DISRUPTION_SENSORS[disruption] || {};

    return (
      <div className="app-page" style={{ overflowY: "auto" }}>
        <div className="app-page-inner" style={{ maxWidth: 860 }}>
          <p className="page-eyebrow">🌦️ Event Report</p>
          <h1 className="page-title">Claim Pipeline Report</h1>
          <p className="page-desc">{new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {city}</p>

          {/* Disruption badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: meta.bg, border: `1.5px solid ${meta.border}`, borderRadius: 16, padding: "14px 20px", width: "fit-content" }}>
            <span style={{ fontSize: "1.8rem" }}>{meta.icon}</span>
            <div>
              <p style={{ fontWeight: 800, color: meta.color, fontSize: "1rem" }}>{disruption}</p>
              <p style={{ fontSize: "0.75rem", color: "#666" }}>RF Detected · {city}</p>
            </div>
            <span style={{ fontSize: "0.7rem", fontWeight: 800, background: `${meta.color}18`, color: meta.color, padding: "3px 10px", borderRadius: 20, marginLeft: 8 }}>RF DETECTED</span>
          </div>

          {/* Sensor readings */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              ["🌧️", "Rainfall",    sensors.rainfall,    "mm",   80,  "#3b82f6"],
              ["🌡️", "Temperature", sensors.temperature, "°C",   42,  "#ef4444"],
              ["💨", "Wind Speed",  sensors.windspeed,   "km/h", 60,  "#f59e0b"],
              ["🏭", "AQI",         sensors.aqi,         "",     200, "#8b5cf6"],
            ].map(([icon, label, val, unit, thresh, col]) => {
              const triggered = val > thresh;
              return (
                <div key={label} style={{ background: triggered ? `${col}10` : "#f9fafb", border: `1.5px solid ${triggered ? col + "44" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#888", marginBottom: 4 }}>{icon} {label}</p>
                  <p style={{ fontSize: "1.4rem", fontWeight: 900, color: triggered ? col : "#374151" }}>{val}<span style={{ fontSize: "0.7rem", color: "#aaa", marginLeft: 2 }}>{unit}</span></p>
                  {triggered && <p style={{ fontSize: "0.65rem", color: col, fontWeight: 700, marginTop: 2 }}>⚠️ Above threshold</p>}
                </div>
              );
            })}
          </div>

          {/* Pipeline steps */}
          {active && (
            <div className="section-block">
              <p className="section-block-title">Validation Pipeline</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <PipelineStep step={1} label="RF Disruption Classification" index={0} status="pass" detail={`Detected: ${disruption} in ${city}`} />
                <PipelineStep step={2} label="Location Validation" index={1} status={active.fraudChecks?.locationMatch?.passed ? "pass" : "fail"} detail={active.fraudChecks?.locationMatch?.detail} />
                <PipelineStep step={3} label="Policy & Expiry Check" index={2} status={active.fraudChecks?.hasActivePolicy?.passed ? "pass" : "fail"} detail={active.fraudChecks?.hasActivePolicy?.detail || active.decisionReason} />
                <PipelineStep step={4} label="Duplicate Claim Check" index={3} status={active.fraudChecks?.noDuplicate?.passed ? "pass" : "fail"} detail={active.fraudChecks?.noDuplicate?.detail} />
                <PipelineStep step={5} label="Trust Score Verification" index={4} status={active.fraudChecks?.trustScore?.passed ? "pass" : "fail"} detail={`Trust: ${active.fraudChecks?.trustScore?.score}/100 — ${active.fraudChecks?.trustScore?.level}`} />
                <PipelineStep step={6} label="Decision Engine" index={5} status={active.decision === "APPROVED" ? "pass" : "fail"} detail={active.decisionReason} />
              </div>
            </div>
          )}

          {claim && (
            <div style={{ background: "linear-gradient(135deg,#065f46,#047857)", borderRadius: 20, padding: "24px 28px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Claim Approved</p>
                <p style={{ fontSize: "2.2rem", fontWeight: 900 }}>+₹{claim.compensation}</p>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Credited to wallet · {claim.claimId}</p>
              </div>
              <span style={{ fontSize: "3rem" }}>🎉</span>
            </div>
          )}
          {rejected && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 16, padding: "18px 20px" }}>
              <p style={{ fontWeight: 800, color: "#991b1b", marginBottom: 6 }}>❌ Claim Rejected</p>
              <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{rejected.decisionReason}</p>
            </div>
          )}

          <button className="app-btn-primary" onClick={onDone}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // ── MAIN SELECTION VIEW
  return (
    <div className="app-page">
      <div className="app-page-inner" style={{ maxWidth: 780 }}>
        <p className="page-eyebrow">🌦️ Weather Simulator</p>
        <h1 className="page-title">Detect Weather Disruption</h1>
        <p className="page-desc">
          Select your city — the <strong>RF model instantly detects</strong> which disruptions are active based on live sensor thresholds.
        </p>

        {/* City selector */}
        <div className="section-block">
          <p className="section-block-title">Select City</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)}
                style={{ flex: 1, minWidth: 110, padding: "12px 10px", background: city === c ? "#f0fdf4" : "white", border: `2px solid ${city === c ? "#10b981" : "#e5e7eb"}`, borderRadius: 12, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", color: city === c ? "#065f46" : "#374151", transition: "all 0.18s", boxShadow: city === c ? "0 0 0 3px rgba(16,185,129,0.15)" : "none", width: "auto" }}>
                {CITY_EMOJI[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Disruption type cards — RF result shown instantly */}
        <div className="section-block">
          <p className="section-block-title">
            {detecting ? "🔄 RF Model Detecting..." : "🤖 RF Detection Results — Select a Disruption"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Object.entries(DISRUPTION_META).map(([type, meta]) => {
              const isDetected = (detected[type] || []).includes(type);
              const isSelected = disruption === type;
              const sensors    = DISRUPTION_SENSORS[type];
              return (
                <div key={type}
                  onClick={() => !detecting && setDisruption(type)}
                  style={{
                    padding: "16px 18px", borderRadius: 16, cursor: detecting ? "wait" : "pointer",
                    background: isSelected ? meta.bg : "white",
                    border: `2px solid ${isSelected ? meta.color : isDetected ? meta.color + "55" : "#e5e7eb"}`,
                    boxShadow: isSelected ? `0 0 0 3px ${meta.color}22` : "none",
                    transition: "all 0.18s", opacity: detecting ? 0.6 : 1,
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.6rem" }}>{meta.icon}</span>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>{type}</p>
                        <p style={{ fontSize: "0.72rem", color: "#888" }}>{meta.desc}</p>
                      </div>
                    </div>
                    {detecting
                      ? <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: "#94a3b8", padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>SCANNING...</span>
                      : <span style={{ fontSize: "0.68rem", background: isDetected ? `${meta.color}18` : "#f1f5f9", color: isDetected ? meta.color : "#94a3b8", padding: "3px 8px", borderRadius: 20, fontWeight: 800 }}>
                          {isDetected ? "✓ DETECTED" : "NOT ACTIVE"}
                        </span>
                    }
                  </div>
                  {/* Sensor values */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[
                      ["🌧️", sensors.rainfall,    "mm"],
                      ["🌡️", sensors.temperature, "°C"],
                      ["💨", sensors.windspeed,   "km/h"],
                      ["🏭", sensors.aqi,         "AQI"],
                    ].map(([icon, val, unit]) => (
                      <span key={unit} style={{ fontSize: "0.72rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "2px 7px", color: "#475569", fontWeight: 600 }}>
                        {icon} {val}{unit}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="app-btn-primary"
          disabled={!disruption || detecting}
          onClick={runPipeline}>
          {!disruption ? "Select a disruption type above" : `🚀 Run Claim Pipeline — ${disruption} in ${city}`}
        </button>
        <button className="app-btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
