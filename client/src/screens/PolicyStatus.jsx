import { useState, useEffect } from "react";
import { api } from "../api";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=80",
];

// Animated circular countdown ring
function RingTimer({ daysSince, daysLeft, expired }) {
  const [displayed, setDisplayed] = useState(0);
  const total = 7;
  const pct = expired ? 1 : Math.max(0, (total - daysSince) / total);
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  const color = expired ? "#ef4444" : daysLeft <= 2 ? "#f59e0b" : "#10b981";
  const glow  = expired ? "rgba(239,68,68,0.5)" : daysLeft <= 2 ? "rgba(245,158,11,0.5)" : "rgba(16,185,129,0.5)";

  // Animate the number
  useEffect(() => {
    const target = expired ? daysSince : daysLeft;
    let cur = 0;
    const step = Math.ceil(target / 20);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setDisplayed(cur);
      if (cur >= target) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [daysSince, daysLeft, expired]);

  return (
    <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#ringGlow)"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <span style={{ fontSize: "2.8rem", fontWeight: 900, color, lineHeight: 1, filter: `drop-shadow(0 0 10px ${glow})` }}>
          {displayed}
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
          {expired ? "days over" : "days left"}
        </span>
      </div>
    </div>
  );
}

export default function PolicyStatus({ rider, onEnterDashboard, onPayNow }) {
  const [bgIndex, setBgIndex]     = useState(0);
  const [animIn, setAnimIn]       = useState(false);
  const [simDate, setSimDate]     = useState(() => new Date().toISOString().slice(0, 16));
  const [status, setStatus]       = useState(null);   // { hasPolicy, lastPaidDate }
  const [result, setResult]       = useState(null);   // computed result
  const [loading, setLoading]     = useState(true);

  // Background cycling
  useEffect(() => {
    const t = setInterval(() => setBgIndex(i => (i + 1) % BG_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Slide in on mount
  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);
  }, []);

  // Auto-fetch policy status on mount
  useEffect(() => {
    api.getPolicyStatus(rider.riderId)
      .then(s => { setStatus(s); setLoading(false); compute(s, simDate); })
      .catch(() => { setStatus({ hasPolicy: false }); setLoading(false); });
  }, [rider.riderId]);

  const compute = (s, date) => {
    if (!s || !s.hasPolicy) { setResult({ noPolicy: true }); return; }
    const simNow    = new Date(date);
    const lastPaid  = new Date(s.lastPaidDate);
    const daysSince = Math.max(0, Math.floor((simNow - lastPaid) / MS_PER_DAY));
    const daysLeft  = Math.max(0, 7 - daysSince);
    const expired   = daysSince >= 7;
    setResult({ noPolicy: false, expired, daysSince, daysLeft, lastPaid });
  };

  const handleDateChange = (val) => {
    setSimDate(val);
    if (status) compute(status, val);
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Backgrounds */}
      {BG_IMAGES.map((src, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.35) saturate(1.1)",
          opacity: i === bgIndex ? 1 : 0,
          transition: "opacity 1.2s ease-in-out", zIndex: 0,
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,rgba(5,20,40,0.88) 0%,rgba(10,50,30,0.7) 50%,rgba(5,15,35,0.85) 100%)", zIndex: 1 }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 2,
        width: "90%", maxWidth: 520,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
        padding: "48px 20px 60px",
        opacity: animIn ? 1 : 0,
        transform: animIn ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#7effc0", marginBottom: 8 }}>
            🛡️ Insurance Status
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: -0.5, textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
            Welcome back,<br />{rider.name} 👋
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div className="ai-spinner" style={{ borderTopColor: "#7effc0", borderColor: "rgba(255,255,255,0.15)" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Checking your policy...</p>
          </div>
        ) : (
          <>
            {/* Ring + stats */}
            {result && !result.noPolicy && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}>
                <RingTimer daysSince={result.daysSince} daysLeft={result.daysLeft} expired={result.expired} />

                {/* Status badge */}
                <div style={{
                  padding: "8px 22px", borderRadius: 30,
                  background: result.expired ? "rgba(239,68,68,0.18)" : result.daysLeft <= 2 ? "rgba(245,158,11,0.18)" : "rgba(16,185,129,0.18)",
                  border: `1.5px solid ${result.expired ? "rgba(239,68,68,0.5)" : result.daysLeft <= 2 ? "rgba(245,158,11,0.5)" : "rgba(16,185,129,0.5)"}`,
                  fontWeight: 800, fontSize: "0.9rem",
                  color: result.expired ? "#ff6b6b" : result.daysLeft <= 2 ? "#fbbf24" : "#7effc0",
                }}>
                  {result.expired ? "⛔ Policy Expired" : result.daysLeft <= 2 ? "⚠️ Expiring Soon" : "✅ Coverage Active"}
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 18, overflow: "hidden", width: "100%" }}>
                  {[
                    ["Days Since Payment", `${result.daysSince}d`],
                    ["Days Remaining",     result.expired ? "0d" : `${result.daysLeft}d`],
                    ["Last Paid",          result.lastPaid?.toLocaleDateString("en-IN", { day: "numeric", month: "short" })],
                  ].map(([k, v], i, arr) => (
                    <div key={k} style={{ flex: 1, padding: "16px 10px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{k}</p>
                      <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>{v}</p>
                    </div>
                  ))}
                </div>

                {/* 7-day progress bar */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Payment date</span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Day 7 (renewal due)</span>
                  </div>
                  <div style={{ height: 10, background: "rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, (result.daysSince / 7) * 100)}%`,
                      background: result.expired
                        ? "linear-gradient(90deg,#ef444488,#ef4444)"
                        : result.daysLeft <= 2
                        ? "linear-gradient(90deg,#f59e0b88,#f59e0b)"
                        : "linear-gradient(90deg,#10b98188,#7effc0)",
                      borderRadius: 10,
                      transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                    }} />
                  </div>
                  {/* Day markers */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    {[0,1,2,3,4,5,6,7].map(d => (
                      <span key={d} style={{ fontSize: "0.6rem", color: d <= result.daysSince ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Expired message */}
                {result.expired && (
                  <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.35)", borderRadius: 14, padding: "14px 18px", textAlign: "center", width: "100%" }}>
                    <p style={{ color: "#ff6b6b", fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.6 }}>
                      Your plan expired <strong>{result.daysSince - 7} day{result.daysSince - 7 !== 1 ? "s" : ""} ago</strong>.<br />
                      <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Claims are unavailable until you renew.</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No policy */}
            {result?.noPolicy && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.35)", borderRadius: 18, padding: "28px 24px", textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "3rem" }}>🚫</span>
                <p style={{ fontWeight: 800, color: "#ff6b6b", fontSize: "1.1rem" }}>No Insurance Plan Found</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  You don't have a weekly plan.<br />Pay now to unlock claim access.
                </p>
              </div>
            )}

            {/* Date simulator */}
            <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.4)" }}>
                🕐 Simulate Date &amp; Time
              </p>
              <input
                type="datetime-local"
                value={simDate}
                onChange={e => handleDateChange(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)",
                  borderRadius: 12, fontSize: "0.95rem", fontFamily: "inherit",
                  color: "#fff", outline: "none", colorScheme: "dark",
                }}
              />
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
                Change the date to simulate how many days have passed since your last payment.
              </p>
            </div>

            {/* Action buttons */}
            {result?.noPolicy ? (
              <button className="reg-btn-primary"
                style={{ width: "100%", background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}
                onClick={() => onPayNow(rider, "basic")}>
                💳 Pay Now to Get Coverage →
              </button>
            ) : result?.expired ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="reg-btn-primary"
                  style={{ width: "100%", background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}
                  onClick={() => onPayNow(rider, status?.planId)}>
                  💳 Renew Weekly Plan →
                </button>
                <button className="reg-btn-ghost" style={{ width: "100%" }}
                  onClick={() => onEnterDashboard(rider, true)}>
                  View Dashboard (Claims Unavailable)
                </button>
              </div>
            ) : (
              <button className="reg-btn-primary" style={{ width: "100%" }}
                onClick={() => onEnterDashboard(rider, false)}>
                Enter Dashboard →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
