import { useState } from "react";
import { api } from "../api";

export default function Payment({ rider, plan, onSuccess }) {
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pay = async () => {
    setLoading(true);
    const res = await api.buyPolicy({ riderId: rider.riderId, paymentMethod: method, planId: plan.id || "basic" });
    setLoading(false);
    if (!res.error) setResult(res);
  };

  if (result) return (
    <div className="app-page">
      <div className="app-page-inner" style={{ maxWidth: 560, alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", border: "3px solid #4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem", margin: "0 auto" }}>🎉</div>
        <h1 className="page-title" style={{ textAlign: "center" }}>Payment Successful!</h1>
        <p style={{ color: "#555", fontSize: "1rem" }}>Your {plan.name} coverage is now active.</p>

        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 20px", width: "100%", textAlign: "left" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 10 }}>Transaction Details</p>
          {[["Transaction ID", result.txnId], ["Amount Paid", `₹${plan.weeklyPremium}`], ["Payment Method", method], ["Coverage Period", "7 Days"], ["City", rider.city]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: "0.85rem", color: "#666" }}>{k}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", textAlign: "left" }}>
          {["Coverage active for 7 Days", `Weather monitoring started for ${rider.city}`, "Auto-claim enabled on disruption detected"].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ color: "#10b981", fontWeight: 800 }}>✓</span>
              <span style={{ color: "#166534", fontWeight: 500, fontSize: "0.88rem" }}>{t}</span>
            </div>
          ))}
        </div>

        <button className="app-btn-primary" style={{ width: "100%" }} onClick={() => onSuccess(result)}>
          Go To Dashboard →
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-page">
      <div className="app-page-inner" style={{ maxWidth: 680 }}>
        <p className="page-eyebrow">💳 Checkout</p>
        <h1 className="page-title">Complete Payment</h1>
        <p className="page-desc">Review your plan details and choose a payment method.</p>

        {/* Plan Summary */}
        <div style={{ background: plan.id === "premium" ? "linear-gradient(135deg, #4c1d95, #6d28d9)" : "linear-gradient(135deg, #065f46, #047857)", borderRadius: 20, padding: "24px 28px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Selected Plan</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 900 }}>{plan.emoji || "🌿"} {plan.name} Plan</p>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginTop: 4 }}>7-day coverage · {rider.city}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "2.2rem", fontWeight: 900 }}>₹{plan.weeklyPremium}</p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>per week</p>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "16px 0" }} />
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Max Payout", `₹${plan.maxCompensation}`], ["Coverage", "7 Days"], ["Rider", rider.name]].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase" }}>{k}</p>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "white", marginTop: 2 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="section-block">
          <p className="section-block-title">Payment Method</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { id: "UPI",         icon: "📱", desc: "Google Pay, PhonePe, Paytm" },
              { id: "Debit Card",  icon: "💳", desc: "Visa, Mastercard, RuPay" },
              { id: "Wallet",      icon: "👛", desc: "InsurIntel Wallet" },
            ].map((m) => (
              <div key={m.id} onClick={() => setMethod(m.id)}
                style={{ flex: 1, minWidth: 140, padding: "14px 16px", background: method === m.id ? "#f0fdf4" : "white", border: `2px solid ${method === m.id ? "#10b981" : "#e5e7eb"}`, borderRadius: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: method === m.id ? "0 0 0 3px rgba(16,185,129,0.15)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: "1.3rem" }}>{m.icon}</span>
                  <span style={{ fontWeight: 700, color: "#111", fontSize: "0.92rem" }}>{m.id}</span>
                  {method === m.id && <span style={{ marginLeft: "auto", color: "#10b981", fontWeight: 800, fontSize: "0.8rem" }}>✓</span>}
                </div>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 10 }}>Order Summary</p>
          {[["Weekly Premium", `₹${plan.weeklyPremium}`], ["GST (18%)", `₹${Math.round(plan.weeklyPremium * 0.18)}`], ["Total", `₹${Math.round(plan.weeklyPremium * 1.18)}`]].map(([k, v], i, arr) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <span style={{ fontSize: "0.88rem", color: i === arr.length - 1 ? "#111" : "#666", fontWeight: i === arr.length - 1 ? 700 : 400 }}>{k}</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: i === arr.length - 1 ? "#111" : "#555" }}>{v}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.78rem", color: "#aaa", textAlign: "center" }}>🔒 Demo payment — no real transaction will occur</p>

        <button className="app-btn-primary" onClick={pay} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${Math.round(plan.weeklyPremium * 1.18)} via ${method} →`}
        </button>
      </div>
    </div>
  );
}
