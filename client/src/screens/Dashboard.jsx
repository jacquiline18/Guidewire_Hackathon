import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ rider, claimBlocked, onSimulate }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const d = await api.getDashboard(rider.riderId);
    setData(d); setRefreshing(false);
  };
  useEffect(() => { load(); }, []);

  if (!data) return (
    <div className="app-page" style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div className="ai-spinner" />
        <p style={{ color: "#555", fontWeight: 600 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const { policy, transactions, claims, trustScore } = data;
  const r = data.rider;
  const latestClaim = claims[claims.length - 1];
  const approvedClaims = claims.filter((c) => c.status === "APPROVED");
  const totalEarned = approvedClaims.reduce((s, c) => s + c.compensation, 0);

  // Policy expiry check
  const policyExpired = policy ? new Date() > new Date(policy.endDate) : true;
  const daysLeft = policy ? Math.max(0, Math.ceil((new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

  const trustColor = { TRUSTED: "#10b981", MODERATE: "#f59e0b", FLAGGED: "#ef4444" };
  const wfSteps = [
    { label: "Registered",        done: true,              icon: "👤" },
    { label: "Risk Scored",        done: !!r.riskScore,     icon: "🤖" },
    { label: "Policy Purchased",   done: !!policy,          icon: "🛡️" },
    { label: "Coverage Active",    done: !!policy,          icon: "✅" },
    { label: "Monitoring",         done: !!policy,          icon: "📡" },
    { label: "Claim Generated",    done: claims.length > 0, icon: "📋" },
    { label: "Wallet Credited",    done: totalEarned > 0,   icon: "💰" },
  ];

  return (
    <div className="app-page" style={{ overflowY: "auto" }}>
      <div className="app-page-inner" style={{ maxWidth: 960 }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <p className="page-eyebrow">{r.platform} · {r.city} · {r.deliveryType}</p>
            <h1 className="page-title">Welcome back, {r.name} 👋</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.82rem", background: policy ? "#dcfce7" : "#fee2e2", color: policy ? "#166534" : "#991b1b", border: `1.5px solid ${policy ? "#86efac" : "#fca5a5"}` }}>
              {policy ? "● ACTIVE" : "● INACTIVE"}
            </div>
            {trustScore && (
              <div style={{ padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: "0.82rem", background: `${trustColor[trustScore.level]}18`, color: trustColor[trustScore.level], border: `1.5px solid ${trustColor[trustScore.level]}44` }}>
                🛡️ {trustScore.level} · {trustScore.score}/100
              </div>
            )}
          </div>
        </div>

        {/* Policy Expiry Warning */}
        {policy && daysLeft <= 2 && (
          <div style={{ background: policyExpired ? "#fef2f2" : "#fffbeb", border: `1.5px solid ${policyExpired ? "#fca5a5" : "#fde68a"}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "1.8rem" }}>{policyExpired ? "🚫" : "⚠️"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: policyExpired ? "#991b1b" : "#92400e", fontSize: "0.95rem" }}>
                {policyExpired ? "Policy Expired — Claims Blocked" : `Policy expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
              </p>
              <p style={{ fontSize: "0.82rem", color: policyExpired ? "#b91c1c" : "#b45309", marginTop: 2 }}>
                {policyExpired ? "Renew your weekly insurance to re-enable claim eligibility." : "Renew soon to avoid claim disruption."}
              </p>
            </div>
          </div>
        )}

        {/* Claim Blocked Banner */}
        {claimBlocked && (
          <div style={{ background: "#fef2f2", border: "2px solid #fca5a5", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: "2rem", flexShrink: 0 }}>🚫</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, color: "#991b1b", fontSize: "1rem", marginBottom: 4 }}>Claims Unavailable — Policy Expired</p>
              <p style={{ fontSize: "0.85rem", color: "#b91c1c", lineHeight: 1.6 }}>
                Your weekly insurance has expired. Renew your plan to re-enable claim access.
              </p>
            </div>
            <button onClick={() => window.location.reload()}
              style={{ whiteSpace: "nowrap", width: "auto", padding: "10px 18px", background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "none" }}>
              💳 Renew Now
            </button>
          </div>
        )}

        {/* KPI Row */}
        <div className="kpi-row">
          {[
            { label: "Wallet Balance", value: `₹${r.wallet}`, sub: "Available", color: r.wallet > 0 ? "#10b981" : "#374151", icon: "💳" },
            { label: "Daily Income",   value: `₹${r.dailyIncome}`, sub: "Avg per day", color: "#374151", icon: "📈" },
            { label: "Total Earned",   value: `₹${totalEarned}`, sub: "From claims", color: "#10b981", icon: "🏆" },
            { label: "Claims",         value: `${approvedClaims.length}/${claims.length}`, sub: "Approved/Total", color: "#374151", icon: "📋" },
            ...(policy ? [{ label: "Expires", value: new Date(policy.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), sub: "Coverage end", color: "#374151", icon: "📅" }] : []),
          ].map((k) => (
            <div key={k.label} className="kpi-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#888", marginBottom: 8 }}>{k.label}</p>
                <span style={{ fontSize: "1.2rem" }}>{k.icon}</span>
              </div>
              <p style={{ fontSize: "1.6rem", fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4 }}>{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Workflow Tracker */}
            <div className="section-block">
              <p className="section-block-title">Application Workflow</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {wfSteps.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: s.done ? "#f0fdf4" : "#fafafa", border: `1px solid ${s.done ? "#bbf7d0" : "#f0f0f0"}`, transition: "all 0.2s" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", background: s.done ? "#dcfce7" : "#f3f4f6", border: `2px solid ${s.done ? "#4ade80" : "#e5e7eb"}`, flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: "0.88rem", color: s.done ? "#111" : "#aaa" }}>{s.label}</span>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.done ? "#10b981" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.done && <span style={{ color: "white", fontSize: "0.65rem", fontWeight: 900 }}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Card */}
            {policy && (
              <div className="policy-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Active Policy</p>
                    <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>{policy.planId === "premium" ? "⭐ Premium Plan" : "🌿 Basic Plan"}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, color: "white" }}>ACTIVE</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[["Premium", `₹${policy.weeklyPremium}/wk`], ["Max Payout", `₹${policy.maxCompensation}`], ["Payment", policy.paymentMethod], ["Policy ID", policy.policyId]].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</p>
                      <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "white", marginTop: 2 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Latest Claim */}
            {latestClaim && (
              <div className="section-block">
                <p className="section-block-title">Latest Claim</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: latestClaim.status === "APPROVED" ? "#f0fdf4" : "#fef2f2", borderRadius: 12, border: `1px solid ${latestClaim.status === "APPROVED" ? "#bbf7d0" : "#fecaca"}` }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>⚡ {latestClaim.eventType}</p>
                    <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 2 }}>{latestClaim.city} · {latestClaim.claimId}</p>
                    {latestClaim.decisionReason && <p style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>{latestClaim.decisionReason}</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "1.3rem", fontWeight: 900, color: latestClaim.status === "APPROVED" ? "#10b981" : "#ef4444" }}>
                      {latestClaim.status === "APPROVED" ? `+₹${latestClaim.compensation}` : "REJECTED"}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{latestClaim.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Feed */}
            <div className="section-block" style={{ flex: 1 }}>
              <p className="section-block-title">Transaction History</p>
              {transactions.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "0.9rem", textAlign: "center", padding: "20px 0" }}>No transactions yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {transactions.map((t) => (
                    <div key={t.txnId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.amount > 0 ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                        {t.amount > 0 ? "💰" : "💳"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "#111" }}>{t.description}</p>
                        <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 1 }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: "1rem", color: t.amount > 0 ? "#10b981" : "#ef4444" }}>
                        {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button className="app-btn-primary"
          onClick={() => { load(); onSimulate(); }}
          disabled={refreshing || claimBlocked}
          style={claimBlocked ? { background: "#d1d5db", cursor: "not-allowed", boxShadow: "none" } : {}}>
          {claimBlocked ? "🚫 Claims Unavailable — Renew Plan to Simulate" : refreshing ? "Refreshing..." : "🌧️ Simulate Weather Disruption"}
        </button>
      </div>
    </div>
  );
}
