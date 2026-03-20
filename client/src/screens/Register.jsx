import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const RIDER_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80",
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=80",
];

const PLATFORMS = ["Swiggy", "Zomato", "Blinkit", "Zepto", "Dunzo"];
const CITIES = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi"];
const DELIVERY_TYPES = ["Food Delivery", "Grocery", "Package", "Medicine"];

const PLANS = [
  {
    id: "basic", name: "Basic", emoji: "🛡️",
    weeklyPremium: 30, maxCompensation: 500,
    coverage: ["Heavy Rain", "Extreme Heat"],
    color: "#2d9e5f", bg: "#eafaf1", border: "#c8ead8", tag: "Most Popular",
  },
  {
    id: "premium", name: "Premium", emoji: "⭐",
    weeklyPremium: 60, maxCompensation: 1000,
    coverage: ["Heavy Rain", "Extreme Heat", "High Pollution", "Cyclone Alert"],
    color: "#6c3fc5", bg: "#f3eeff", border: "#d8c8f5", tag: "Best Coverage",
  },
];

export default function Register({ onRegistered }) {
  const [step, setStep] = useState(0);
  const [animClass, setAnimClass] = useState("slide-enter-right");
  const [bgIndex, setBgIndex] = useState(0);
  const [form, setForm] = useState({
    name: "", phone: "", platform: "Swiggy", city: "Chennai",
    dailyIncome: "", deliveryType: "Food Delivery", plan: null,
  });
  const [loading, setLoading] = useState(false);
  const [riskPreview, setRiskPreview] = useState(null);  // RF result + dynamic plans
  const [loadingRisk, setLoadingRisk] = useState(false);
  const navigating = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setBgIndex((i) => (i + 1) % RIDER_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  // handle only updates form — never triggers re-animation
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const goTo = (next) => {
    if (navigating.current) return;
    navigating.current = true;
    const dir = next > step ? "forward" : "back";
    const exitClass = dir === "forward" ? "slide-exit-left" : "slide-exit-right";
    const enterClass = dir === "forward" ? "slide-enter-right" : "slide-enter-left";
    setAnimClass(exitClass);
    setTimeout(() => {
      setStep(next);
      setAnimClass(enterClass);
      navigating.current = false;
    }, 320);
  };

  // Fetch RF risk preview when moving to step 4
  const goToPlanStep = async () => {
    if (navigating.current) return;
    setLoadingRisk(true);
    try {
      const preview = await api.getRiskPreview({
        city: form.city, platform: form.platform,
        dailyIncome: form.dailyIncome, deliveryType: form.deliveryType,
      });
      setRiskPreview(preview);
    } catch { setRiskPreview(null); }
    setLoadingRisk(false);
    goTo(4);
  };

  const selectPlan = async (plan) => {
    setForm((f) => ({ ...f, plan }));
    setLoading(true);
    const res = await api.registerRider({
      name: form.name, phone: form.phone, city: form.city,
      platform: form.platform, dailyIncome: form.dailyIncome,
      deliveryType: form.deliveryType,
    });
    setLoading(false);
    if (res.riderId) onRegistered({ ...res, selectedPlan: plan });
  };

  const BG = () => (
    <>
      {RIDER_IMAGES.map((src, i) => (
        <div key={i} className="welcome-bg" style={{
          backgroundImage: `url(${src})`,
          opacity: i === bgIndex ? 1 : 0,
          transition: "opacity 1.2s ease-in-out",
        }} />
      ))}
      <div className="welcome-overlay" />
    </>
  );

  // ── Step 0: Welcome ──────────────────────────────────────────
  if (step === 0) return (
    <div className="reg-shell">
      <BG />
      <div className={`reg-content ${animClass}`}>
        <div className="welcome-logo">🛡️ InsurIntel</div>
        <h1 className="welcome-title">Protect Your Income.<br />Ride Without Fear.</h1>
        <p className="welcome-sub">
          Weather disrupting your deliveries? InsurIntel automatically detects disruptions
          and credits compensation straight to your wallet — no claims needed.
        </p>
        <div className="welcome-stats">
          <div className="w-stat"><strong>10,000+</strong><span>Riders Protected</span></div>
          <div className="w-divider" />
          <div className="w-stat"><strong>₹50L+</strong><span>Paid Out</span></div>
          <div className="w-divider" />
          <div className="w-stat"><strong>5 Cities</strong><span>Active Coverage</span></div>
        </div>
        <button className="welcome-btn" onClick={() => goTo(1)}>
          Get Started — Register Free →
        </button>
        <p className="welcome-hint">Takes less than 2 minutes</p>
      </div>
    </div>
  );

  // ── Step 1: Name + Platform ──────────────────────────────────
  if (step === 1) return (
    <div className="reg-shell">
      <BG />
      <div className={`reg-content ${animClass}`}>
        <StepBar current={1} total={4} />
        <p className="reg-step-label">Step 1 of 4</p>
        <h1 className="reg-title">Hey there! 👋<br />What's your name?</h1>
        <p className="reg-sub">Tell us who you are and where you deliver.</p>
        <div className="reg-fields">
          <input className="reg-input" name="name" placeholder="Your full name"
            value={form.name} onChange={handle} autoFocus />
          <input className="reg-input" name="phone" placeholder="Phone number"
            value={form.phone} onChange={handle} />
        </div>
        <p className="reg-field-label">Which platform do you deliver for?</p>
        <div className="platform-grid">
          {PLATFORMS.map((p) => (
            <button key={p} type="button"
              className={`platform-btn ${form.platform === p ? "platform-selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, platform: p }))}>
              {platformEmoji(p)} {p}
            </button>
          ))}
        </div>
        <p className="reg-field-label">Delivery Type</p>
        <div className="platform-grid">
          {DELIVERY_TYPES.map((t) => (
            <button key={t} type="button"
              className={`platform-btn ${form.deliveryType === t ? "platform-selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, deliveryType: t }))}>
              {t}
            </button>
          ))}
        </div>
        <div className="reg-actions">
          <button className="reg-btn-ghost" onClick={() => goTo(0)}>← Back</button>
          <button className="reg-btn-primary" disabled={!form.name || !form.phone}
            onClick={() => goTo(2)}>Continue →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 2: City ─────────────────────────────────────────────
  if (step === 2) return (
    <div className="reg-shell">
      <BG />
      <div className={`reg-content ${animClass}`}>
        <StepBar current={2} total={4} />
        <p className="reg-step-label">Step 2 of 4</p>
        <h1 className="reg-title">Where do you work,<br />{form.name.split(" ")[0]}? 📍</h1>
        <p className="reg-sub">We monitor live weather in your city to protect you.</p>
        <div className="city-grid">
          {CITIES.map((c) => (
            <button key={c} type="button"
              className={`city-btn ${form.city === c ? "city-selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, city: c }))}>
              <span className="city-icon">{cityEmoji(c)}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>
        <div className="reg-info-chip">
          📡 Live weather data for <strong>{form.city}</strong> will auto-trigger your claims.
        </div>
        <div className="reg-actions">
          <button className="reg-btn-ghost" onClick={() => goTo(1)}>← Back</button>
          <button className="reg-btn-primary" onClick={() => goTo(3)}>Continue →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Income ───────────────────────────────────────────
  if (step === 3) return (
    <div className="reg-shell">
      <BG />
      <div className={`reg-content ${animClass}`}>
        <StepBar current={3} total={4} />
        <p className="reg-step-label">Step 3 of 4</p>
        <h1 className="reg-title">What's your average<br />daily income? 💰</h1>
        <p className="reg-sub">This sets your compensation when disruptions occur.</p>
        <input className="reg-input reg-input-large" name="dailyIncome" type="number"
          placeholder="e.g. 500" value={form.dailyIncome} onChange={handle} autoFocus />
        <div className="quick-amounts">
          {[300, 500, 700, 1000].map((amt) => (
            <button key={amt} type="button"
              className={`quick-btn ${form.dailyIncome === String(amt) ? "quick-selected" : ""}`}
              onClick={() => setForm((f) => ({ ...f, dailyIncome: String(amt) }))}>
              ₹{amt}
            </button>
          ))}
        </div>
        {form.dailyIncome && (
          <div className="reg-info-chip">
            📊 Weekly income: <strong>₹{form.dailyIncome * 7}</strong> &nbsp;·&nbsp;
            🛡️ Compensated up to <strong>₹{form.dailyIncome}/day</strong>
          </div>
        )}
        <div className="reg-actions">
          <button className="reg-btn-ghost" onClick={() => goTo(2)}>← Back</button>
          <button className="reg-btn-primary" disabled={!form.dailyIncome || loadingRisk}
            onClick={() => form.dailyIncome && goToPlanStep()}>
            {loadingRisk ? "Analysing Risk..." : "Choose a Plan →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step 4: Risk Preview + Plan Selection ───────────────────
  if (step === 4) {
    const plans = riskPreview?.plans || PLANS;
    const risk  = riskPreview;
    const levelColor  = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#10b981" };
    const levelBg     = { HIGH: "rgba(239,68,68,0.15)",    MEDIUM: "rgba(245,158,11,0.15)",  LOW: "rgba(16,185,129,0.15)" };
    const levelBorder = { HIGH: "rgba(239,68,68,0.4)",     MEDIUM: "rgba(245,158,11,0.4)",   LOW: "rgba(16,185,129,0.4)" };
    return (
      <div className="reg-shell">
        <BG />
        <div className={`reg-content ${animClass}`} style={{ maxWidth: 820 }}>
          <StepBar current={4} total={4} />
          <p className="reg-step-label">Step 4 of 4</p>
          <h1 className="reg-title">Your Risk Profile &amp; Plans 🛡️</h1>
          <p className="reg-sub">RF model analysed your profile. Premiums are adjusted based on your risk score.</p>

          {/* ── RF Risk Score Summary ── */}
          {risk && (
            <div style={{ background: levelBg[risk.level], border: `1.5px solid ${levelBorder[risk.level]}`, borderRadius: 18, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${levelColor[risk.level]}22`, border: `3px solid ${levelColor[risk.level]}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: 900, color: levelColor[risk.level], lineHeight: 1 }}>{risk.score}</span>
                    <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>/100</span>
                  </div>
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${levelColor[risk.level]}22`, border: `1px solid ${levelColor[risk.level]}55`, borderRadius: 20, padding: "3px 12px", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: levelColor[risk.level] }}>
                        {risk.level === "HIGH" ? "⚠️ HIGH RISK" : risk.level === "MEDIUM" ? "🔶 MEDIUM RISK" : "✅ LOW RISK"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                      Premium multiplier: <strong style={{ color: levelColor[risk.level] }}>×{risk.multiplier}</strong>
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>RF Model · 5 Factors</span>
              </div>
              {/* Factor bars */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries(risk.breakdown).map(([key, f]) => (
                  <div key={key} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{f.label}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: f.score >= 70 ? "#ef4444" : f.score >= 40 ? "#f59e0b" : "#10b981" }}>
                        {f.score}<span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>/100</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${f.score}%`, background: f.score >= 70 ? "#ef4444" : f.score >= 40 ? "#f59e0b" : "#10b981", borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Plan cards with dynamic premiums ── */}
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id}
                className={`plan-card ${form.plan?.id === plan.id ? "plan-selected" : ""}`}
                style={{ "--plan-color": plan.color, "--plan-bg": plan.bg, "--plan-border": plan.border }}
                onClick={() => setForm((f) => ({ ...f, plan }))}>
                <div className="plan-tag">{plan.tag}</div>
                <div className="plan-emoji">{plan.emoji}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="plan-amount">₹{plan.weeklyPremium}</span>
                  <span className="plan-period">/week</span>
                </div>
                {risk && (
                  <div style={{ fontSize: "0.72rem", color: plan.color, fontWeight: 600, marginTop: -4 }}>
                    Base ×{risk.multiplier} risk multiplier
                  </div>
                )}
                <div className="plan-divider" />
                <ul className="plan-features">
                  {plan.coverage.map((c) => <li key={c}><span>✓</span> {c}</li>)}
                </ul>
                <div className="plan-payout">Max payout: <strong>₹{plan.maxCompensation}/event</strong></div>
              </div>
            ))}
          </div>

          <div className="reg-actions">
            <button className="reg-btn-ghost" onClick={() => goTo(3)}>← Back</button>
            <button className="reg-btn-primary" disabled={!form.plan || loading}
              onClick={() => form.plan && selectPlan(form.plan)}>
              {loading ? "Setting up..." : `Activate ${form.plan?.name || ""} Plan →`}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function StepBar({ current, total }) {
  return (
    <div className="reg-step-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`reg-step-dot ${i < current ? "reg-dot-done" : i === current - 1 ? "reg-dot-active" : ""}`} />
      ))}
    </div>
  );
}
function platformEmoji(p) {
  return { Swiggy: "🧡", Zomato: "❤️", Blinkit: "💛", Zepto: "💜", Dunzo: "💙" }[p] || "🛵";
}
function cityEmoji(c) {
  return { Chennai: "🌊", Bangalore: "🌳", Hyderabad: "🏰", Mumbai: "🌆", Delhi: "🏛️" }[c] || "📍";
}
