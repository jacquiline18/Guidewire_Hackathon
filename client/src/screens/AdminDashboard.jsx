import { useEffect, useState } from "react";
import { api } from "../api";

const riskClass = { High: "risk-high", Medium: "risk-medium", Low: "risk-low" };
const trustClass = { TRUSTED: "trust-trusted", MODERATE: "trust-moderate", FLAGGED: "trust-flagged" };

export default function AdminDashboard({ onBack }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.getAdminDashboard().then(setData); }, []);

  if (!data) return (
    <div className="free-screen">
      <div className="free-content" style={{ alignItems: "center" }}>
        <div className="ai-spinner" />
        <p style={{ color: "#111", fontWeight: 600 }}>Loading admin data...</p>
      </div>
    </div>
  );

  const glassBox = { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 16, padding: "16px 18px" };

  return (
    <div className="free-screen" style={{ overflowY: "auto" }}>
      <div className="free-content slide-enter-right" style={{ maxWidth: 980 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className="free-label">🖥️ Admin Panel</p>
            <h1 className="free-title">Operations Dashboard</h1>
          </div>
          <button className="reg-btn-ghost" style={{ width: "auto", padding: "10px 20px", fontSize: "0.9rem" }} onClick={onBack}>← Back</button>
        </div>

        <div className="free-divider" />

        {/* KPI Stats */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            ["Total Riders",       data.totalRiders,                                    "#111"],
            ["Active Policies",    data.activePolicies,                                 "#111"],
            ["Disruptions Today",  data.disruptionsToday,                               data.disruptionsToday > 0 ? "#d97706" : "#1a6b3c"],
            ["Claims Approved",    data.approvedClaims ?? data.totalClaims,             "#1a6b3c"],
            ["Claims Rejected",    data.rejectedClaims ?? 0,                            "#c0392b"],
            ["Total Paid Out",     `₹${data.totalCompensationPaid}`,                    "#1a6b3c"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ flex: 1, minWidth: 110, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 16, padding: "16px 12px", textAlign: "center" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#333", marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Risk Zones */}
        <div>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#333", marginBottom: 12 }}>🗺️ City Risk Zones</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {data.riskZones.map((z) => (
              <div key={z.city} style={{ flex: 1, minWidth: 130, ...glassBox }}>
                <p style={{ fontWeight: 700, color: "#111", marginBottom: 6 }}>{z.city}</p>
                <span className={`risk-pill ${riskClass[z.risk] || "risk-low"}`}>{z.risk} Risk</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rider Trust & Risk */}
        {data.riders?.length > 0 && (
          <div>
            <div className="free-divider" />
            <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#333", marginBottom: 12 }}>👥 Rider Trust & Risk Scores</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.riders.map((r) => (
                <div key={r.riderId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12 }}>
                  <span style={{ fontSize: "0.8rem", color: "#444", fontWeight: 600, minWidth: 70 }}>{r.riderId}</span>
                  <span style={{ flex: 1, color: "#111", fontWeight: 500 }}>{r.name} — {r.city}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {r.riskScore && (
                      <span className={`risk-pill ${r.riskScore.level === "HIGH" ? "risk-high" : r.riskScore.level === "MEDIUM" ? "risk-medium" : "risk-low"}`}>
                        Risk {r.riskScore.score}
                      </span>
                    )}
                    <span className={`trust-badge ${trustClass[r.trustScore?.level] || "trust-trusted"}`}>
                      {r.trustScore?.level || "TRUSTED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Claims */}
        {data.recentClaims.length > 0 && (
          <div>
            <div className="free-divider" />
            <p style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#333", marginBottom: 12 }}>Recent Claims</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recentClaims.map((c) => (
                <div key={c.claimId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12 }}>
                  <span style={{ fontSize: "0.8rem", color: "#444", fontWeight: 600 }}>{c.claimId}</span>
                  <span style={{ flex: 1, color: "#111", fontWeight: 500 }}>{c.riderName} — <strong>{c.eventType}</strong> in {c.city}</span>
                  <span style={{ fontWeight: 700, color: c.status === "APPROVED" ? "#1a6b3c" : "#c0392b" }}>
                    {c.status === "APPROVED" ? `+₹${c.compensation}` : "REJECTED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.recentClaims.length === 0 && (
          <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: "16px 20px" }}>
            <p style={{ color: "#333" }}>No claims yet. Simulate a weather event from the dashboard to trigger claims.</p>
          </div>
        )}
      </div>
    </div>
  );
}
