import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const FEATURES = [
  { icon: "🌧️", title: "Auto-Claim on Disruption", desc: "Weather events trigger payouts instantly — no manual filing." },
  { icon: "🤖", title: "AI Risk Scoring",           desc: "Random Forest model profiles your risk in real time." },
  { icon: "💰", title: "Wallet Credits",             desc: "Compensation lands in your wallet within minutes." },
  { icon: "🛡️", title: "Fraud-Proof Pipeline",      desc: "5-layer validation ensures every claim is legitimate." },
];

const STATS = [
  { value: "10K+", label: "Riders Protected" },
  { value: "₹50L+", label: "Paid Out" },
  { value: "5",    label: "Cities" },
];

export default function Login({ onVerified, onRegister }) {
  const [phase, setPhase]           = useState("phone");
  const [phone, setPhone]           = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [otp, setOtp]               = useState(["","","","","",""]);
  const [generatedOtp, setGenOtp]   = useState("");
  const otpCode                     = useRef("");
  const otpRefs                     = useRef([]);
  const [otpError, setOtpError]     = useState("");
  const [verifying, setVerifying]   = useState(false);
  const [animKey, setAnimKey]       = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const goTo = (next) => {
    setAnimKey(k => k + 1);
    setPhase(next);
  };

  const sendOtp = async () => {
    if (phone.length < 10) { setPhoneError("Enter a valid 10-digit mobile number"); return; }
    setPhoneError(""); setSendingOtp(true);
    await new Promise(r => setTimeout(r, 700));
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpCode.current = code;
    setGenOtp(code);
    setSendingOtp(false);
    setCountdown(30);
    setOtp(["","","","","",""]);
    setOtpError("");
    goTo("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 80);
  };

  const handleOtpInput = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "Enter" && otp.join("").length === 6) verifyOtp();
  };

  const verifyOtp = async () => {
    const entered = otp.join("");
    if (entered.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }
    if (entered !== otpCode.current) {
      setOtpError("Incorrect OTP. Please try again.");
      setOtp(["","","","","",""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }
    setVerifying(true);
    try {
      const res = await api.getRiderByPhone(phone);
      setVerifying(false);
      goTo("done");
      setTimeout(() => onVerified(res.found ? res : null), 1000);
    } catch {
      setVerifying(false);
      setOtpError("Server unreachable. Make sure the server is running.");
    }
  };

  return (
    <div style={S.shell}>
      {/* ── Left Panel ── */}
      <div style={S.left}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>🛡️</div>
          <span style={S.logoText}>InsurIntel</span>
        </div>

        {/* Hero */}
        <div style={S.hero}>
          <div style={S.heroBadge}>🇮🇳 Made for Indian Gig Workers</div>
          <h1 style={S.heroTitle}>Protect your income.<br />Ride without fear.</h1>
          <p style={S.heroSub}>
            India's first AI-powered parametric insurance for delivery riders.
            Weather disrupts your work — we compensate automatically.
          </p>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {STATS.map((s, i) => (
            <div key={i} style={S.stat}>
              <span style={S.statVal}>{s.value}</span>
              <span style={S.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={S.features}>
          {FEATURES.map((f, i) => (
            <div key={i} style={S.feature}>
              <div style={S.featureIcon}>{f.icon}</div>
              <div>
                <p style={S.featureTitle}>{f.title}</p>
                <p style={S.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust line */}
        <p style={S.trust}>🔒 256-bit encrypted · RBI compliant · Zero hidden charges</p>
      </div>

      {/* ── Right Panel ── */}
      <div style={S.right}>
        <div key={animKey} style={S.card}>

          {phase === "phone" && (
            <>
              <div style={S.cardHeader}>
                <h2 style={S.cardTitle}>Welcome back 👋</h2>
                <p style={S.cardSub}>Enter your registered mobile number to continue.</p>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Mobile Number</label>
                <div style={{ ...S.phoneRow, borderColor: phoneError ? "#ef4444" : phone.length === 10 ? "#10b981" : "#e2e8f0" }}>
                  <div style={S.countryCode}>
                    <span style={{ fontSize: "1rem" }}>🇮🇳</span>
                    <span style={S.ccText}>+91</span>
                  </div>
                  <input
                    style={S.phoneInput}
                    placeholder="98765 43210"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setPhoneError(""); }}
                    onKeyDown={e => e.key === "Enter" && sendOtp()}
                    autoFocus
                  />
                  {phone.length === 10 && <span style={{ color: "#10b981", fontSize: "1.1rem", paddingRight: 14 }}>✓</span>}
                </div>
                {phoneError && <p style={S.errorText}>⚠ {phoneError}</p>}
              </div>

              <button style={{ ...S.btnPrimary, opacity: sendingOtp || phone.length < 10 ? 0.55 : 1 }}
                onClick={sendOtp} disabled={sendingOtp || phone.length < 10}>
                {sendingOtp
                  ? <><span style={S.btnSpinner} /> Sending OTP...</>
                  : "Get OTP →"}
              </button>

              <div style={S.dividerRow}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>New to InsurIntel?</span>
                <div style={S.dividerLine} />
              </div>

              <button style={S.btnOutline} onClick={onRegister}>
                Create Rider Account →
              </button>

              <p style={S.termsText}>
                By continuing, you agree to our{" "}
                <span style={S.termsLink}>Terms of Service</span> and{" "}
                <span style={S.termsLink}>Privacy Policy</span>.
              </p>
            </>
          )}

          {phase === "otp" && (
            <>
              <button style={S.backBtn} onClick={() => { goTo("phone"); setOtp(["","","","","",""]); setOtpError(""); }}>
                ← Back
              </button>

              <div style={S.cardHeader}>
                <div style={S.otpIconWrap}>📱</div>
                <h2 style={S.cardTitle}>Verify your number</h2>
                <p style={S.cardSub}>
                  We sent a 6-digit OTP to{" "}
                  <strong style={{ color: "#0f172a" }}>+91 {phone}</strong>
                </p>
              </div>

              {/* Demo OTP hint */}
              <div style={S.otpHint}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Demo OTP:</span>
                <span style={S.otpHintCode}>{generatedOtp}</span>
              </div>

              {/* OTP boxes */}
              <div style={S.otpRow}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    type="tel"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    style={{
                      ...S.otpBox,
                      borderColor: otpError ? "#ef4444" : d ? "#10b981" : "#e2e8f0",
                      background: d ? "#f0fdf4" : "#f8fafc",
                      color: d ? "#065f46" : "#0f172a",
                      boxShadow: d ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
                    }}
                  />
                ))}
              </div>

              {otpError && <p style={S.errorText}>⚠ {otpError}</p>}

              <button
                style={{ ...S.btnPrimary, opacity: verifying || otp.join("").length < 6 ? 0.55 : 1 }}
                onClick={verifyOtp}
                disabled={verifying || otp.join("").length < 6}>
                {verifying
                  ? <><span style={S.btnSpinner} /> Verifying...</>
                  : "Verify & Continue →"}
              </button>

              <div style={{ textAlign: "center" }}>
                {countdown > 0
                  ? <p style={S.resendText}>Resend OTP in <strong>{countdown}s</strong></p>
                  : <span style={S.resendLink} onClick={sendOtp}>Didn't receive it? Resend OTP</span>
                }
              </div>
            </>
          )}

          {phase === "done" && (
            <div style={S.doneWrap}>
              <div style={S.doneCircle}>✓</div>
              <h2 style={{ ...S.cardTitle, textAlign: "center", color: "#065f46" }}>Verified!</h2>
              <p style={{ ...S.cardSub, textAlign: "center" }}>Fetching your account details...</p>
              <div style={S.doneBar}>
                <div style={S.doneBarFill} />
              </div>
            </div>
          )}

        </div>

        {/* Bottom note */}
        <p style={S.rightFooter}>
          Trusted by 10,000+ delivery riders across India
        </p>
      </div>
    </div>
  );
}

/* ── Styles ── */
const S = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f8fafc",
  },

  /* Left */
  left: {
    flex: "0 0 52%",
    background: "linear-gradient(145deg, #0a2218 0%, #0d3320 40%, #0a1f35 100%)",
    display: "flex",
    flexDirection: "column",
    padding: "44px 52px",
    gap: 32,
    position: "relative",
    overflow: "hidden",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: "1.5rem", filter: "drop-shadow(0 0 6px rgba(126,255,192,0.4))" },
  logoText: { fontSize: "1.3rem", fontWeight: 800, color: "#7effc0", letterSpacing: -0.3 },
  hero: { display: "flex", flexDirection: "column", gap: 14, marginTop: 16 },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(126,255,192,0.12)", border: "1px solid rgba(126,255,192,0.25)",
    borderRadius: 20, padding: "5px 14px",
    fontSize: "0.75rem", fontWeight: 700, color: "#7effc0", letterSpacing: 0.3,
    width: "fit-content",
  },
  heroTitle: {
    fontSize: "clamp(1.9rem, 2.8vw, 2.8rem)", fontWeight: 900,
    color: "#ffffff", lineHeight: 1.18, letterSpacing: -0.8,
    textShadow: "0 2px 24px rgba(0,0,0,0.3)",
  },
  heroSub: {
    fontSize: "0.97rem", color: "rgba(255,255,255,0.62)",
    lineHeight: 1.7, maxWidth: 420,
  },
  statsRow: {
    display: "flex", gap: 0,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, overflow: "hidden",
    width: "fit-content",
  },
  stat: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "14px 28px", borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  statVal: { fontSize: "1.4rem", fontWeight: 900, color: "#7effc0" },
  statLabel: { fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 },
  features: { display: "flex", flexDirection: "column", gap: 16 },
  feature: { display: "flex", alignItems: "flex-start", gap: 14 },
  featureIcon: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: "rgba(126,255,192,0.1)", border: "1px solid rgba(126,255,192,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
  },
  featureTitle: { fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: 2 },
  featureDesc: { fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 },
  trust: {
    fontSize: "0.72rem", color: "rgba(255,255,255,0.3)",
    fontWeight: 500, marginTop: "auto", letterSpacing: 0.2,
  },

  /* Right */
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    gap: 20,
    background: "#f1f5f9",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 24,
    padding: "40px 36px",
    boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    animation: "loginFadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both",
  },
  cardHeader: { display: "flex", flexDirection: "column", gap: 6 },
  cardTitle: { fontSize: "1.55rem", fontWeight: 900, color: "#0f172a", letterSpacing: -0.4 },
  cardSub: { fontSize: "0.88rem", color: "#64748b", lineHeight: 1.6 },

  /* Phone input */
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: "0.78rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.6 },
  phoneRow: {
    display: "flex", alignItems: "center",
    border: "2px solid #e2e8f0", borderRadius: 14,
    overflow: "hidden", background: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  countryCode: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 14px", borderRight: "1.5px solid #e2e8f0",
    height: 52, background: "#f1f5f9", flexShrink: 0,
  },
  ccText: { fontSize: "0.9rem", fontWeight: 700, color: "#374151" },
  phoneInput: {
    flex: 1, border: "none", outline: "none",
    padding: "0 14px", height: 52,
    fontSize: "1.05rem", fontWeight: 600, color: "#0f172a",
    background: "transparent", fontFamily: "inherit",
    letterSpacing: 0.5,
  },
  errorText: { fontSize: "0.8rem", color: "#ef4444", fontWeight: 600 },

  /* Buttons */
  btnPrimary: {
    width: "100%", padding: "15px 20px",
    background: "linear-gradient(135deg, #10b981, #065f46)",
    color: "white", border: "none", borderRadius: 14,
    fontSize: "1rem", fontWeight: 700, fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.2s",
    boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    letterSpacing: 0.2,
  },
  btnOutline: {
    width: "100%", padding: "14px 20px",
    background: "transparent", color: "#0f172a",
    border: "2px solid #e2e8f0", borderRadius: 14,
    fontSize: "0.95rem", fontWeight: 700, fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.2s",
    boxShadow: "none",
  },
  btnSpinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },

  /* Divider */
  dividerRow: { display: "flex", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, background: "#e2e8f0" },
  dividerText: { fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" },

  termsText: { fontSize: "0.72rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.6 },
  termsLink: { color: "#10b981", cursor: "pointer", fontWeight: 600 },

  /* OTP phase */
  backBtn: {
    background: "none", border: "none", padding: 0, width: "auto",
    color: "#64748b", fontSize: "0.85rem", fontWeight: 600,
    cursor: "pointer", boxShadow: "none", textAlign: "left",
    display: "flex", alignItems: "center", gap: 4,
  },
  otpIconWrap: { fontSize: "2rem", marginBottom: 4 },
  otpHint: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#f0fdf4", border: "1.5px solid #bbf7d0",
    borderRadius: 12, padding: "10px 16px",
  },
  otpHintCode: {
    fontSize: "1.1rem", fontWeight: 900, color: "#065f46",
    letterSpacing: 6, fontFamily: "monospace",
  },
  otpRow: { display: "flex", gap: 10, justifyContent: "center" },
  otpBox: {
    width: 50, height: 58, textAlign: "center",
    fontSize: "1.5rem", fontWeight: 800,
    border: "2px solid #e2e8f0", borderRadius: 14,
    outline: "none", fontFamily: "inherit",
    transition: "all 0.15s", cursor: "text",
  },
  resendText: { fontSize: "0.82rem", color: "#94a3b8" },
  resendLink: { fontSize: "0.82rem", color: "#10b981", fontWeight: 700, cursor: "pointer" },

  /* Done phase */
  doneWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" },
  doneCircle: {
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981, #065f46)",
    color: "white", fontSize: "2rem", fontWeight: 900,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
    animation: "scalePop 0.4s cubic-bezier(0.22,1,0.36,1) both",
  },
  doneBar: {
    width: "100%", height: 4, background: "#e2e8f0",
    borderRadius: 10, overflow: "hidden", marginTop: 8,
  },
  doneBarFill: {
    height: "100%", width: "100%",
    background: "linear-gradient(90deg, #10b981, #7effc0)",
    borderRadius: 10,
    animation: "fillBar 0.9s ease forwards",
  },

  rightFooter: {
    fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500, textAlign: "center",
  },
};
