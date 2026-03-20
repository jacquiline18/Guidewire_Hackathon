import { useEffect, useState } from "react";
import { api } from "../api";

const FACTOR_ICONS = {
  cityRisk: "🏙️", incomeRisk: "💰", claimsRisk: "📋",
  deliveryRisk: "🛵", weatherRisk: "🌦️",
};

const AI_STEPS = [
  { label: "Fetching city weather history", duration: 400 },
  { label: "Analysing income vulnerability", duration: 400 },
  { label: "Reviewing delivery exposure", duration: 400 },
  { label: "Running Random Forest model", duration: 500 },
  { label: "Computing final risk score", duration: 300 },
];

function ScoreMeter({ score, level }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let c = 0; const step = score / 50;
    const t = setInterval(() => {
      c += step;
      if (c >= score) { setDisplay(score); clearInterval(t); }
      else setDisplay(Math.round(c));
    }, 20);
    return () => clearInterval(t);
  }, [score]);

  const color = level === "HIGH" ? "#ef4444" : level === "MEDIUM" ? "#f59e0b" : "#10b981";
  const glow  = level === "HIGH" ? "rgba(239,68,68,0.4)" : level === "MEDIUM" ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)";
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (display / 100) * circ;

  return (
    <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 0.04s linear" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "2.6rem", fontWeight: 900, color, lineHeight: 1, filter: `drop-shadow(0 0 8px ${glow})` }}>{display}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", letterSpacing: 1 }}>/ 100</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 }}>{level}</span>
      </div>
    </div>
  );
}

function FactorBar({ label, score, icon, weight, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), delay); return () => clearTimeout(t); }, [score, delay]);
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#10b981";
  const bg    = score >= 70 ? "rgba(239,68,68,0.08)" : score >= 40 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)";
  return (
    <div style={{ background: bg, border: `1px solid ${color}22`, borderRadius: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a1a" }}>{icon} {label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500 }}>{weight}</span>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color }}>{score}<span style={{ fontSize: "0.7rem", color: "#aaa" }}>/100</span></span>
        </div>
      </div>
      <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 10, transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)", boxShadow: `0 0 8px ${color}66` }} />
      </div>
    </div>
  );
}

export default function RiskScore({ rider, onContinue }) {
  const [risk, setRisk] = useState(null);
  const [stepsDone, setStepsDone] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let total = 0;
    AI_STEPS.forEach((s, i) => {
      total += s.duration;
      setTimeout(() => setStepsDone(i + 1), total);
    });
    setTimeout(() => {
      api.getRiskScore(rider.riderId).then((r) => { setRisk(r); setLoading(false); });
    }, total + 200);
  }, [rider.riderId]);

  const levelColor = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
  const levelBg    = { HIGH: "#fef2f2", MEDIUM: "#fffbeb", LOW: "#f0fdf4" };

  return (
    <div className="app-page">
      <div className="app-page-inner">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">🤖 AI Risk Engine</p>
            <h1 className="page-title">Risk Profile Analysis</h1>
            <p className="page-desc">Random Forest model · 5 weighted factors · Real-time scoring</p>
          </div>
          <div className="rider-chip">
            <div className="rider-avatar">{rider.name[0]}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>{rider.name}</p>
              <p style={{ fontSize: "0.78rem", color: "#666" }}>{rider.platform} · {rider.city}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ai-terminal">
            <div className="terminal-header">
              <div className="terminal-dots"><span /><span /><span /></div>
              <span style={{ fontSize: "0.78rem", color: "#888", fontFamily: "monospace" }}>insurintel-risk-engine v2.1</span>
            </div>
            <div className="terminal-body">
              {AI_STEPS.map((s, i) => (
                <div key={i} className={`terminal-line ${stepsDone > i ? "t-done" : stepsDone === i ? "t-active" : "t-pending"}`}>
                  <span className="t-prefix">{stepsDone > i ? "✓" : stepsDone === i ? "▶" : "○"}</span>
                  <span>{s.label}</span>
                  {stepsDone === i && <span className="t-cursor" />}
                </div>
              ))}
            </div>
          </div>
        ) : risk && (
          <>
            {/* Score + Summary */}
            <div className="risk-main-grid">
              <div className="risk-score-panel" style={{ background: levelBg[risk.level] }}>
                <ScoreMeter score={risk.score} level={risk.level} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 30, background: `${levelColor[risk.level]}18`, border: `1.5px solid ${levelColor[risk.level]}44`, color: levelColor[risk.level], fontWeight: 800, fontSize: "0.85rem", marginBottom: 10 }}>
                    {risk.level === "HIGH" ? "⚠️ HIGH RISK" : risk.level === "MEDIUM" ? "🔶 MEDIUM RISK" : "✅ LOW RISK"}
                  </div>
                  <p style={{ color: "#222", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: 12 }}>{risk.recommendation}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["Premium ×", risk.premiumMultiplier], ["Rider ID", rider.riderId], ["Income", `₹${rider.dailyIncome}/day`]].map(([k, v]) => (
                      <div key={k} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem" }}>
                        <span style={{ color: "#888" }}>{k} </span><strong style={{ color: "#111" }}>{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Adjustment */}
              <div className="risk-premium-panel">
                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 12 }}>Premium Adjustment</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Base Premium", "₹30/week", "#111"],
                    ["Risk Multiplier", `×${risk.premiumMultiplier}`, levelColor[risk.level]],
                    ["Adjusted Premium", `₹${Math.round(30 * risk.premiumMultiplier)}/week`, levelColor[risk.level]],
                    ["Max Compensation", `₹${risk.level === "HIGH" ? 1000 : risk.level === "MEDIUM" ? 700 : 500}`, "#10b981"],
                  ].map(([k, v, c]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ fontSize: "0.88rem", color: "#555" }}>{k}</span>
                      <span style={{ fontWeight: 700, color: c, fontSize: "0.95rem" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="section-block">
              <p className="section-block-title">Factor Breakdown — Random Forest Model</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(risk.breakdown).map(([key, f], i) => (
                  <FactorBar key={key} label={f.label} score={f.score} icon={FACTOR_ICONS[key]} weight={f.weight} delay={i * 150} />
                ))}
              </div>
            </div>

            <button className="app-btn-primary" onClick={onContinue}>Continue to Payment →</button>
          </>
        )}
      </div>
    </div>
  );
}
